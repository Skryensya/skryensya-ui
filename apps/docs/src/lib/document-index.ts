/*
 * THE DOCUMENT'S OWN INDEX, read once while the page is being built.
 *
 * This used to be a browser's job. `Base.astro` shipped an `is:inline` script that walked
 * `main > :scope > h2, h3` on every load, slugged whatever heading had no `id`, and built the
 * `<li>`s by hand before first paint. It worked, and it was the same answer every time: the
 * headings of a static page do not change between one reader and the next, so computing them per
 * reader is paying, on every load, for a fact that was already true at build.
 *
 * The move is possible because Astro renders the page's own body to HTML before the layout finishes
 * rendering, and `Astro.slots.render("default")` hands that string over. So the layout reads the
 * document the same way the script did, only earlier, and the `<ul>` arrives in the HTML already
 * filled: no list building, no id assignment and no reflow after paint. What stays in the browser is
 * the part that genuinely cannot be known before there is a reader: the scroll-spy that moves
 * `aria-current` as the page scrolls.
 *
 * WHY A SCANNER AND NOT A PARSER. There is no DOM here and no HTML parser in this app's dependency
 * tree, and the whole question this file has to answer is one bit per heading: is this `h2` a
 * section of the DOCUMENT, or a heading inside something the document is showing you (a demo, a
 * preview, a callout)? That is what `:scope >` answered in the browser, and it is a nesting depth,
 * so the scanner tracks depth and nothing else. Everything it has to get right to keep that count
 * honest, comments, raw-text elements, void elements, `>` inside an attribute value, is handled
 * below and named where it is handled.
 */

/** Elements with no closing tag: they never open a level. */
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/*
 * Elements whose content is TEXT, not markup. A `<script>` holding `if (a < b)` or a serialized
 * `</div>` inside a string would otherwise move the depth counter, and every heading after it would
 * be filed at the wrong level. The docs pages are full of both: every code sample and every island's
 * props travel through here.
 */
const RAW_TEXT_ELEMENTS = new Set(["script", "style", "textarea", "title"]);

export type DocHeadingLevel = "h2" | "h3";

export interface DocHeading {
  id: string;
  label: string;
  level: DocHeadingLevel;
}

export interface DocumentIndex {
  /** The document's HTML, with an `id` written onto any indexed heading that lacked one. */
  html: string;
  /** Its sections, in reading order. */
  headings: DocHeading[];
  /**
   * How many elements sit at the fragment's own top level. Exactly the row count `<main>`'s content
   * contributes once it is a `display: contents` pass-through into `.docs-document-pair`'s grid
   * (site.css). A rail sharing that grid needs to span every one of those rows to sit beside all of
   * them; unlike the heading count, this includes every top-level element, not only `h2`/`h3`.
   */
  topLevelCount: number;
}

/**
 * The end of a tag, as an index one past its `>`.
 *
 * Quote-aware, which is the point: `<a href="/a?x=1>2">` and, far more common here, an island's
 * `props='{"...">..."}'` both carry a `>` that does not end anything.
 */
function tagEnd(html: string, from: number): number {
  let quote = "";
  for (let i = from; i < html.length; i++) {
    const char = html[i];
    if (quote) {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === ">") {
      return i + 1;
    }
  }
  return html.length;
}

/** The five entities Astro's own escaping emits, plus numeric ones. `&amp;` last, or `&amp;lt;` decodes twice. */
function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&");
}

/**
 * A heading can carry a child that says something ABOUT it rather than being part of its own name
 *. A count badge inside a catalog group's `<h2>`, say. `data-toc-ignore` on that child drops its
 * text from the label this produces (and so from the TOC link, the page `<title>`-adjacent id
 * slug, everywhere a heading's name gets read) without changing what's visually inside the heading.
 */
const TOC_IGNORE_ATTR = /\sdata-toc-ignore\b/;

/** What `textContent` would have returned: markup dropped, whitespace collapsed. */
function textOf(html: string): string {
  let text = "";
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt < 0) {
      text += html.slice(i);
      break;
    }
    text += html.slice(i, lt);
    if (html.startsWith("<!--", lt)) {
      const close = html.indexOf("-->", lt);
      i = close < 0 ? html.length : close + 3;
      continue;
    }

    if (!html.startsWith("</", lt)) {
      const name = /^[a-zA-Z][^\s/>]*/.exec(html.slice(lt + 1, lt + 64))?.[0];
      if (name) {
        const end = tagEnd(html, lt + 1);
        const tag = html.slice(lt, end);
        if (!/\/\s*>$/.test(tag) && TOC_IGNORE_ATTR.test(tag)) {
          // The WHOLE element is skipped, its own closing tag included, so nothing inside it
          //. However deeply nested. Leaks into the label either.
          const element = name.toLowerCase();
          const close = html.indexOf(`</${element}`, end);
          i = close < 0 ? html.length : tagEnd(html, close + 2 + element.length);
          continue;
        }
      }
    }

    i = tagEnd(html, lt + 1);
  }
  return decodeEntities(text).replace(/\s+/g, " ").trim();
}

const ID_ATTR = /\sid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

/**
 * The browser's slugger, moved here unchanged, accent-stripping included: the headings are Spanish,
 * so "Navegación" must not slug to "navegaci-n". `hero-tabs-toc.ts` still runs its own copy, because
 * the page it serves builds a different index per tab and can only do that with a reader present.
 */
export function slugify(label: string): string {
  return (
    label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "seccion"
  );
}

/** Every id already written into the page, so an assigned one cannot collide with an authored one. */
function authoredIds(html: string): Set<string> {
  const ids = new Set<string>();
  for (const match of html.matchAll(/\sid\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const id = match[1] ?? match[2];
    if (id) ids.add(id);
  }
  return ids;
}

/**
 * Read a rendered document's own sections.
 *
 * Only headings at the top level of the fragment count, which is `main > :scope > h2, h3` written
 * as a depth: a demo's heading lives inside a preview and is content being demonstrated, not a
 * section of the page, and excluding it by depth needs no blocklist of the things it could be
 * nested in.
 */
export function indexDocument(source: string): DocumentIndex {
  const headings: DocHeading[] = [];
  /** `{ at, text }`: an `id` attribute to splice in, at the index just past a heading's tag name. */
  const inserts: { at: number; text: string }[] = [];
  const taken = authoredIds(source);

  let depth = 0;
  let topLevelCount = 0;
  let i = 0;

  while (i < source.length) {
    const lt = source.indexOf("<", i);
    if (lt < 0) break;

    if (source.startsWith("<!--", lt)) {
      const close = source.indexOf("-->", lt);
      i = close < 0 ? source.length : close + 3;
      continue;
    }

    if (source.startsWith("<!", lt)) {
      i = tagEnd(source, lt + 2);
      continue;
    }

    if (source.startsWith("</", lt)) {
      /* Clamped: a stray closing tag in authored HTML should cost this page its own indentation,
       * not send the count negative and file every heading after it as a section. */
      depth = Math.max(0, depth - 1);
      i = tagEnd(source, lt + 2);
      continue;
    }

    const name = /^[a-zA-Z][^\s/>]*/.exec(source.slice(lt + 1, lt + 64))?.[0];
    if (!name) {
      // A bare `<` in prose ("a < b"), which Astro would normally have escaped. Not a tag.
      i = lt + 1;
      continue;
    }

    const element = name.toLowerCase();
    const nameEnd = lt + 1 + name.length;
    const end = tagEnd(source, nameEnd);
    const tag = source.slice(lt, end);
    const closes = VOID_ELEMENTS.has(element) || /\/\s*>$/.test(tag);

    if (depth === 0 && (element === "h2" || element === "h3")) {
      const close = source.indexOf(`</${element}`, end);
      const label = textOf(source.slice(end, close < 0 ? source.length : close));
      const authored = ID_ATTR.exec(tag);
      let id = authored?.[1] ?? authored?.[2] ?? authored?.[3];

      if (!id) {
        const base = slugify(label);
        id = base;
        for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
        inserts.push({ at: nameEnd, text: ` id="${id}"` });
      }

      taken.add(id);
      headings.push({ id, label, level: element });
    }

    /*
     * Consumed WHOLE, closing tag included, so the count is untouched by an element that opened and
     * closed. Stopping at `</script` instead let the loop meet a closing tag whose opening tag it
     * had skipped, and every script on the page took the depth down a level it never went up: on
     * /recetas, twenty-seven headings nested inside previews came out reading as sections of the
     * page. Any page with an inline script before its own nested headings had the same bug waiting.
     */
    if (RAW_TEXT_ELEMENTS.has(element) && !closes) {
      const close = source.indexOf(`</${element}`, end);
      i = close < 0 ? source.length : tagEnd(source, close + 2 + element.length);
      continue;
    }

    if (depth === 0) topLevelCount++;
    if (!closes) depth++;
    i = end;
  }

  let html = source;
  // Back to front, so an earlier splice cannot move a later one's index.
  for (const insert of inserts.reverse()) {
    html = html.slice(0, insert.at) + insert.text + html.slice(insert.at);
  }

  return { html, headings, topLevelCount };
}

const VALUE_ATTR = /data-value\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

function isHeroTabPanel(tag: string, value: string): boolean {
  if (!/\bdata-sk-tabs-content\b/i.test(tag)) return false;
  const match = VALUE_ATTR.exec(tag);
  return (match?.[1] ?? match?.[2] ?? match?.[3]) === value;
}

/**
 * The inner HTML of one hero-tab panel (`data-sk-tabs-content` + `data-value`), or `null` when
 * that panel is not in the fragment. Same depth walk as {@link indexDocument}: a `>` inside an
 * attribute must not end the tag, and a raw-text child must not move the count.
 */
function heroTabPanelInner(source: string, value: string): { start: number; end: number } | null {
  let depth = 0;
  let i = 0;
  let panelDepth: number | null = null;
  let start = -1;

  while (i < source.length) {
    const lt = source.indexOf("<", i);
    if (lt < 0) break;

    if (source.startsWith("<!--", lt)) {
      const close = source.indexOf("-->", lt);
      i = close < 0 ? source.length : close + 3;
      continue;
    }

    if (source.startsWith("<!", lt)) {
      i = tagEnd(source, lt + 2);
      continue;
    }

    if (source.startsWith("</", lt)) {
      if (panelDepth !== null && depth === panelDepth) return { start, end: lt };
      depth = Math.max(0, depth - 1);
      i = tagEnd(source, lt + 2);
      continue;
    }

    const name = /^[a-zA-Z][^\s/>]*/.exec(source.slice(lt + 1, lt + 64))?.[0];
    if (!name) {
      i = lt + 1;
      continue;
    }

    const element = name.toLowerCase();
    const end = tagEnd(source, lt + 1 + name.length);
    const tag = source.slice(lt, end);
    const closes = VOID_ELEMENTS.has(element) || /\/\s*>$/.test(tag);

    if (RAW_TEXT_ELEMENTS.has(element) && !closes) {
      const close = source.indexOf(`</${element}`, end);
      i = close < 0 ? source.length : tagEnd(source, close + 2 + element.length);
      continue;
    }

    if (!closes) {
      depth++;
      if (panelDepth === null && isHeroTabPanel(tag, value)) {
        start = end;
        panelDepth = depth;
      }
    } else if (panelDepth === null && isHeroTabPanel(tag, value)) {
      return { start: end, end };
    }

    i = end;
  }

  return panelDepth !== null ? { start, end: source.length } : null;
}

/**
 * The sections of one hero-tab panel, the same set the browser fill used to walk
 * (`:scope > h3, h4` of `[data-sk-tabs-content][data-value]`).
 *
 * Component pages hide their document outline one tab-panel deep, so {@link indexDocument}'s
 * top-level `h2`/`h3` scan sees nothing and the rail used to ship empty, then wait on a script
 * after `<main>`. The default tab (`usage`) is known while the page is built; only a `?tab=`
 * deep link still has to rebuild in the browser.
 */
export function indexHeroTabPanel(source: string, value: string): { html: string; headings: DocHeading[] } {
  const range = heroTabPanelInner(source, value);
  if (!range) return { html: source, headings: [] };

  const inner = source.slice(range.start, range.end);
  const headings: DocHeading[] = [];
  const inserts: { at: number; text: string }[] = [];
  const taken = authoredIds(source);

  let depth = 0;
  let i = 0;

  while (i < inner.length) {
    const lt = inner.indexOf("<", i);
    if (lt < 0) break;

    if (inner.startsWith("<!--", lt)) {
      const close = inner.indexOf("-->", lt);
      i = close < 0 ? inner.length : close + 3;
      continue;
    }

    if (inner.startsWith("<!", lt)) {
      i = tagEnd(inner, lt + 2);
      continue;
    }

    if (inner.startsWith("</", lt)) {
      depth = Math.max(0, depth - 1);
      i = tagEnd(inner, lt + 2);
      continue;
    }

    const name = /^[a-zA-Z][^\s/>]*/.exec(inner.slice(lt + 1, lt + 64))?.[0];
    if (!name) {
      i = lt + 1;
      continue;
    }

    const element = name.toLowerCase();
    const nameEnd = lt + 1 + name.length;
    const end = tagEnd(inner, nameEnd);
    const tag = inner.slice(lt, end);
    const closes = VOID_ELEMENTS.has(element) || /\/\s*>$/.test(tag);

    if (depth === 0 && (element === "h3" || element === "h4")) {
      const close = inner.indexOf(`</${element}`, end);
      const label = textOf(inner.slice(end, close < 0 ? inner.length : close));
      const authored = ID_ATTR.exec(tag);
      let id = authored?.[1] ?? authored?.[2] ?? authored?.[3];

      if (!id) {
        const base = slugify(label);
        id = base;
        for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
        inserts.push({ at: nameEnd, text: ` id="${id}"` });
      }

      taken.add(id);
      headings.push({ id, label, level: element === "h3" ? "h2" : "h3" });
    }

    if (RAW_TEXT_ELEMENTS.has(element) && !closes) {
      const close = inner.indexOf(`</${element}`, end);
      i = close < 0 ? inner.length : tagEnd(inner, close + 2 + element.length);
      continue;
    }

    if (!closes) depth++;
    i = end;
  }

  let next = inner;
  for (const insert of inserts.reverse()) {
    next = next.slice(0, insert.at) + insert.text + next.slice(insert.at);
  }

  return { html: source.slice(0, range.start) + next + source.slice(range.end), headings };
}
