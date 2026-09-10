#!/usr/bin/env node
/*
 * THE SETTLED HEIGHT OF EVERY COMPONENT PREVIEW, MEASURED ONCE SO THE PAGE CAN RESERVE IT.
 *
 * A preview's stage is an iframe, and an iframe has no content height: `fitFrame`
 * (`apps/docs/src/scripts/component-preview-frame.ts`) measures the document inside and writes the
 * number back. That happens after first paint, so until it lands the stage stands at a single
 * global floor (`--sk-component-preview-stage-min-block-size`, 12rem) and then snaps to whatever
 * the demo actually is. Measured on `/components/avatar`, that snap is -104px for the stacked-avatar
 * group and -40px for the colour row: layout shift the reader sees on every preview of every page.
 *
 * The number cannot be computed, only observed, so this writes it down. `artifacts/preview-heights.json`
 * is read by `apps/docs/src/lib/preview-heights.ts` and reserved as the stage's floor BEFORE the
 * frame reports, so the loading box and the settled box are the same box.
 *
 * IN `ai-gates` AND NOT IN ROOT `scripts/` next to `build-test-report.ts`, which is the sibling it
 * otherwise resembles: this needs a real browser, and `@playwright/test` is a dependency of exactly
 * one package in this repo. A root script would have to reach into `packages/ai-gates/node_modules`
 * by hand to find it, which is a worse lie about where the dependency lives than living beside it.
 *
 * NOT WIRED INTO `turbo check`, for `build-test-report.ts`'s own reason: a stale entry degrades one
 * preview back to today's jump, it does not break a page, and a six-minute build inside `check`
 * would be the wrong trade. Run it by hand after adding or reshaping a demo:
 *
 *   pnpm --filter @skryensya/ai-gates heights
 *   pnpm --filter @skryensya/ai-gates heights -- --reuse-build    # skip the rebuild while iterating
 *
 * A MEASUREMENT IS ONLY TRUE AT THE WIDTH IT WAS TAKEN. Heights are read at the viewport below, on
 * a production build, because that is what ships; the docs column is capped
 * (`--docs-document-max`), so any desktop width past the cap measures the same. A narrower reader
 * gets a reservation that is merely approximate, which is still strictly better than 12rem for
 * every demo that is not 12rem tall.
 */
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContext, type Page } from "@playwright/test";

interface StageRow {
  id: string;
  label: string;
  ready: boolean;
  height: number;
}

type PageHeights = Record<string, number>;
type HeightsByPage = Record<string, PageHeights>;

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const docs = join(root, "apps", "docs");
const dist = join(here, ".preview-heights-dist");

const reuseBuild = process.argv.includes("--reuse-build");
/*
 * `--only <substring>[,<substring>…]` narrows the crawl to the pages worth re-measuring: one demo
 * you just changed, or the handful a previous run could not load. A comma list and not a single
 * value because the second case is the common one, and 65 separate invocations would each pay for
 * their own browser and server.
 */
const onlyIndex = process.argv.indexOf("--only");
const only =
  onlyIndex === -1
    ? null
    : (process.argv[onlyIndex + 1] ?? "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

/*
 * MEASURED ON THE PLATEAU, not at some middling desktop width.
 *
 * The docs column caps at `--docs-document-max` (64rem), so past roughly 1600px of viewport the
 * stage stops growing and sits at a constant 1022px. A height taken there is therefore correct for
 * EVERY viewport from 1600 up, which is an unbounded range; one taken at 1400 is correct near 1400
 * and wrong everywhere else. Measured the difference: with a 1400px reference, 50 of 626 previews
 * still shifted when read at 1920 (avatar's colour row wraps to two lines at 1400 and one at 1920,
 * -40px; comment-thread's deep threads, -96px; image-frame's aspect demos, +91px).
 *
 * Below the plateau the column is fluid and no stored number can be exact, which is the standing
 * limitation `--widths` exists to soften.
 */
const VIEWPORT = { width: 1920, height: 1000 };

/*
 * `--widths 1400,1024,390` MEASURES AT EACH AND STORES THE SMALLEST HEIGHT SEEN.
 *
 * For most demos this changes nothing, because most demos do not care how wide they are: a row of
 * buttons is the same height at 1400px and at 390px, so every sample agrees and the minimum IS the
 * height. It exists for the ones that do care. A responsive grid of cards reflows AND rewraps its
 * text, so its height is effectively a continuous function of width: `/components/card` measured 6
 * to 11 distinct heights each across the range, wiggling rather than stepping, and no single stored
 * number can be right at every width.
 *
 * The minimum is chosen over the reference-width value because of WHICH WAY the error points. A
 * reservation that is too small makes the stage GROW when the frame reports; one that is too large
 * makes it SHRINK, and a preview that loads visibly taller than it ends up is the thing a reader
 * actually complains about. The minimum can never be too large, so the stage never shrinks. It does
 * mean a demo whose height varies a lot pays a bigger grow at the wide end, and that is the trade
 * being made on purpose: one direction of error, not the smaller one.
 */
const widthsIndex = process.argv.indexOf("--widths");
const WIDTHS =
  widthsIndex === -1
    ? [VIEWPORT.width]
    : (process.argv[widthsIndex + 1] ?? "")
        .split(",")
        .map((part) => Number(part.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);

/* How long ONE stage gets to boot and report, once it has been scrolled into view. Per stage and
 * not per page: a single wedged frame should cost its own slot, not the whole page's budget. */
const STAGE_BUDGET_MS = 15_000;

/** Navigation only. A built page is static HTML; this is slack, not a measurement window. */
const NAV_BUDGET_MS = 60_000;

/** One retry per page. A navigation that times out on a machine this script is also building on is
 *  almost always contention, not a broken page, and it costs one reload to find out. */
const PAGE_ATTEMPTS = 2;

/*
 * One stage per preview: the Vanilla one when the preview has both, the React one when Vanilla is
 * all it lacks. A demo authored with only a `react` slot (the chart card on `/components/card`) has
 * no Vanilla stage at all, and keying off Vanilla alone skipped it silently  -  it stayed on the
 * 12rem floor with nothing recorded and nothing reported as missing either.
 */
const SELECTOR = "iframe.sk-component-preview__stage";
const VANILLA = '[data-sk-component-preview-binding="vanilla"]';

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

function build() {
  if (reuseBuild && existsSync(dist)) {
    console.log("  reusing the existing build (--reuse-build)");
    return;
  }
  console.log("  building the docs (this is the slow part, ~6 min)…");
  rmSync(dist, { recursive: true, force: true });
  execFileSync("npx", ["astro", "build", "--outDir", dist], {
    cwd: docs,
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, NODE_ENV: "production" },
  });
}

/** Serve the built site, so what gets measured is what ships. Never touches a dev server. */
function serve() {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let file = join(dist, decodeURIComponent(url.pathname));
    if (!extname(file)) file = join(file, "index.html");
    if (!file.startsWith(dist) || !existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
  });
  return new Promise<{ server: Server; port: number }>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") throw new Error("expected a TCP address");
      resolve({ server, port: (addr as AddressInfo).port });
    });
  });
}

/** Every built page that actually holds a stage. Reading the OUTPUT and not the sources is what
 *  makes this exact: a `*Page.astro` can render a preview conditionally, and a label is a `t()`
 *  call no source scan can resolve into the string the page really printed. */
function previewPages() {
  const out = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path);
        continue;
      }
      if (entry.name !== "index.html") continue;
      if (!readFileSync(path, "utf8").includes("sk-component-preview__stage")) continue;
      const url = `/${relative(dist, dirname(path))}`.replace(/\\/g, "/");
      out.push(url === "/." ? "/" : url);
    }
  })(dist);
  return out.sort();
}

/*
 * Read one page's stages, ONE AT A TIME, each while it is on screen.
 *
 * Not "scroll the whole page, then read them all": the shared IntersectionObserver
 * (`packages/vanilla/src/components/component-preview.ts`) runs at `rootMargin: "100% 0px"` and
 * RELEASES a stage's `srcdoc` once it is more than a viewport away, so a sweep that ends back at
 * the top reads the bottom stages after they have been torn down again. The first version of this
 * script did exactly that and reported the last preview on every long page as never settling.
 *
 * The VANILLA stage is the one measured: both bindings share the same grid cell, only one is
 * visible at a time, and vanilla is what a first-time reader lands on. A React stage that settles
 * taller keeps the jump it has today rather than being reserved for wrongly.
 */
async function measurePage(page: Page, url: string, origin: string) {
  await page.goto(origin + url, { waitUntil: "domcontentloaded", timeout: NAV_BUDGET_MS });

  /* Indices into the page's full stage list, one per preview: Vanilla where there is one. */
  const indices = await page.evaluate(
    ([sel, vanilla]: [string, string]) => {
      const all = [...document.querySelectorAll(sel)];
      const picked: number[] = [];
      for (const root of document.querySelectorAll(".sk-component-preview")) {
        const stage = root.querySelector(`${sel}${vanilla}`) ?? root.querySelector(sel);
        if (stage) picked.push(all.indexOf(stage));
      }
      return picked;
    },
    [SELECTOR, VANILLA] as [string, string],
  );

  const stages = page.locator(SELECTOR);
  const rows: StageRow[] = [];

  for (const index of indices) {
    const stage = stages.nth(index);
    await stage.scrollIntoViewIfNeeded();
    try {
      await page.waitForFunction(
        ([sel, i]: [string, number]) =>
          document.querySelectorAll(sel)[i]?.hasAttribute("data-sk-component-preview-frame-ready"),
        [SELECTOR, index] as [string, number],
        { timeout: STAGE_BUDGET_MS },
      );
      /*
       * `frame-ready` IS NOT THE FINAL HEIGHT, and reading it there is what made this artifact wrong.
       *
       * `fitFrame` reports as soon as it has a number, then runs again as the frame's own webfonts
       * land and its images decode: measured on `/components/card`, a stage reports 337px at
       * `frame-ready` and settles at 342px about 300ms later. Sampling at the flag recorded that
       * pre-final value, so the reservation was a few pixels short and every preview shifted anyway
       * -  most visibly on the pages whose demos carry images. It also made the number
       * irreproducible: the same demo measured 315, 333 and 342 across three runs, purely on timing.
       *
       * Waiting for two consecutive polls to agree is what makes the value the SETTLED one. The
       * verification has to sample the same way, or it compares two pre-final numbers and reports a
       * perfect match while the reader still sees the jump.
       */
      await page.waitForFunction(
        ([sel, i]: [string, number]) => {
          const el = document.querySelectorAll(sel)[i];
          if (!(el instanceof HTMLElement)) return false;
          const height = Math.round(el.getBoundingClientRect().height);
          const settled = el.dataset.skHeightProbe === String(height);
          el.dataset.skHeightProbe = String(height);
          return settled;
        },
        [SELECTOR, index] as [string, number],
        { timeout: STAGE_BUDGET_MS, polling: 250 },
      );
    } catch {
      /* Recorded as unsettled below. Whatever else on the page DID report is still worth keeping. */
    }
    rows.push(
      await stage.evaluate((el) => ({
        /*
         * The ROOT's id, not the stage's own title. `ComponentPreview.astro` derives that id by
         * slugging the label and then deduping it against the other previews already rendered on
         * the same page (`Astro.locals`, which resets per page render), so it is unique BY
         * CONSTRUCTION in exactly the case a label is not: the ComponentPreview page documents
         * itself with a preview inside a preview and labels both "ComponentPreview". Keying on the
         * label meant those two collided and neither could be reserved; keying on the id they are
         * `componentpreview` and `componentpreview-2` and both just work.
         */
        id: el.closest(".sk-component-preview")?.id ?? "",
        label: (el.getAttribute("title") ?? "").replace(/^[^:]*: /, ""),
        ready: el.hasAttribute("data-sk-component-preview-frame-ready"),
        height: Math.round(el.getBoundingClientRect().height),
      })),
    );
  }

  return rows;
}

/*
 * Rows to the shape the artifact stores: `{ [previewId]: height }`, sorted so a re-run produces a
 * diff a person can read.
 *
 * No dedupe pass here any more, and that absence is the point: an earlier version keyed on the
 * preview's LABEL, which two previews on a page can share, so it had to detect the clash and drop
 * both rather than reserve a confidently wrong height for one of them. Ids are unique per page
 * already, so the whole problem is gone rather than handled.
 */
function collapse(rows: StageRow[], url: string, unsettled: string[]): PageHeights {
  const page: PageHeights = {};
  for (const row of rows) {
    if (!row.ready) {
      unsettled.push(`${url} · ${row.label || row.id}`);
      continue;
    }
    if (!row.id) continue;
    page[row.id] = row.height;
  }
  return Object.fromEntries(Object.entries(page).sort(([a], [b]) => a.localeCompare(b)));
}

build();

const { server, port } = await serve();
const origin = `http://127.0.0.1:${port}`;
const urls = previewPages().filter((url) => (only ? only.some((part) => url.includes(part)) : true));
console.log(`  ${urls.length} built pages hold a preview. Measuring at ${WIDTHS.join("px, ")}px…\n`);

const browser = await chromium.launch();
/*
 * ONE TAB PER PAGE (PER WIDTH), CLOSED AFTER IT IS READ.
 *
 * Every docs page boots up to a dozen iframes, each its own realm with its own module graph, and
 * reusing one tab across 186 of them leaves that to the collector to clean up between navigations.
 * It does not keep up: the first version of this loop reused a single page and failed in CONTIGUOUS
 * BLOCKS (13 pages in a row, then a recovery, then 5 more), which is memory pressure, not 26
 * separately broken pages. A fresh tab costs milliseconds and hands the whole realm back at close.
 */
const contexts = new Map<number, BrowserContext>();
for (const width of WIDTHS) {
  contexts.set(width, await browser.newContext({ viewport: { width, height: VIEWPORT.height } }));
}

/*
 * A page that failed to LOAD keeps the measurements it already had, and a page that loaded is
 * rewritten wholesale from what this run saw.
 *
 * The asymmetry is the point. "Could not open the page" says nothing about whether last run's
 * numbers are still true, so throwing them away would trade a good reservation for the 12rem
 * fallback over a network blip. "Opened it and one preview is gone" DOES say something: the demo
 * was renamed or removed, and keeping its old entry would leave a key nothing can ever match.
 */
const previous: HeightsByPage = (() => {
  const file = join(root, "artifacts", "preview-heights.json");
  if (!existsSync(file)) return {};
  try {
    return (JSON.parse(readFileSync(file, "utf8")) as { pages?: HeightsByPage }).pages ?? {};
  } catch {
    return {};
  }
})();

/*
 * A FULL PASS REPLACES THE ARTIFACT; A FILTERED ONE PATCHES IT.
 *
 * `--only` exists so a demo can be re-measured in seconds instead of re-crawling 186 pages, and
 * that is only true if the other 185 pages survive the write. So a filtered run starts from what is
 * already on disk and overwrites just what it visited. An unfiltered run starts empty on purpose:
 * it visited every page that has a preview, so anything it did not produce is a page that no longer
 * has one, and carrying that forward would keep a key nothing can ever match.
 */
const pages: HeightsByPage = only ? { ...previous } : {};
const unsettled: string[] = [];
const failed: string[] = [];
let measured = 0;

/*
 * ONE PAGE'S FAILURE COSTS THAT PAGE AND NOTHING ELSE.
 *
 * The loop below used to let a navigation timeout throw, which ended the run before the single
 * write at the bottom: 186 pages measured, nothing on disk, and a stale artifact left in place with
 * no sign anything had gone wrong. That is the same shape as `scripts/build-test-report.ts`, where
 * one flaky target still means the whole report silently never regenerates. A partial pass is worth
 * keeping, because a preview that measured is a preview that no longer shifts, whatever happened
 * three pages later.
 */
for (const [index, url] of urls.entries()) {
  /* One pass per width; the smallest height a preview reported anywhere is the one stored. */
  const perWidth: PageHeights[] = [];
  let anyFailed = false;
  for (const width of WIDTHS) {
    let rows: StageRow[] | null = null;
    for (let attempt = 1; attempt <= PAGE_ATTEMPTS && rows === null; attempt += 1) {
      const context = contexts.get(width);
      if (!context) throw new Error(`no browser context for ${width}px`);
      const page = await context.newPage();
      try {
        rows = await measurePage(page, url, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (attempt === PAGE_ATTEMPTS) failed.push(`${url} @${width}px  (${message.split("\n")[0]})`);
      } finally {
        await page.close();
      }
    }
    if (rows === null) anyFailed = true;
    else perWidth.push(collapse(rows, `${url} @${width}px`, unsettled));
  }
  if (perWidth.length === 0) {
    if (previous[url]) pages[url] = previous[url];
    console.log(`  [${String(index + 1).padStart(3)}/${urls.length}] FAILED   ${url}`);
    continue;
  }
  const collapsed: PageHeights = {};
  for (const sample of perWidth) {
    for (const [id, height] of Object.entries(sample)) {
      collapsed[id] = collapsed[id] === undefined ? height : Math.min(collapsed[id], height);
    }
  }
  if (anyFailed) console.log(`         (some widths failed on ${url}; stored the minimum of what did report)`);
  const count = Object.keys(collapsed).length;
  /* `delete` and not "skip": on a filtered run this page came from `previous`, and a page that
     opened fine and produced nothing has genuinely lost its previews. */
  if (count > 0) pages[url] = collapsed;
  else delete pages[url];
  measured += count;
  console.log(
    `  [${String(index + 1).padStart(3)}/${urls.length}] ${count} previews × ${perWidth.length} width${perWidth.length === 1 ? "" : "s"}  ${url}`,
  );
}

for (const context of contexts.values()) await context.close();
await browser.close();
server.close();

mkdirSync(join(root, "artifacts"), { recursive: true });
writeFileSync(
  join(root, "artifacts", "preview-heights.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), viewport: VIEWPORT, widths: WIDTHS, pages }, null, 2)}\n`,
);

/* Two numbers, because on a filtered run they are genuinely different facts and reporting the
   run's count against the merged page total reads as a much worse pass than it was. */
const stored = Object.values(pages).reduce((sum, page) => sum + Object.keys(page).length, 0);
console.log(
  `\n  artifacts/preview-heights.json written: ${stored} previews across ${Object.keys(pages).length} pages` +
    (only ? `, ${measured} of them measured by this run.` : "."),
);
if (failed.length > 0) {
  console.log(`\n  ${failed.length} pages could not be loaded at all, and keep whatever they had:`);
  for (const item of failed) console.log(`    ${item}`);
}
if (unsettled.length > 0) {
  console.log(`\n  ${unsettled.length} never reported a height inside ${STAGE_BUDGET_MS}ms:`);
  for (const item of unsettled) console.log(`    ${item}`);
}
