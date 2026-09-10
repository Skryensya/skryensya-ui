/*
 * PREVIEW METRICS. What size is each ComponentPreview, at every moment of its load?
 *
 * A preview's stage is an iframe, so its height is not laid out with the page: the frame boots,
 * measures its own document, writes a height back, and then writes ANOTHER one moments later as its
 * webfonts land and its images decode. Every question worth asking about a preview's layout is
 * about that sequence, and none of it survives a devtools inspection, because by the time anyone
 * has the element selected the sequence is over. This writes the sequence down as it happens.
 *
 * A READOUT PER CARD, in the light DOM, for `fps.ts`'s reason: this is something to watch while the
 * panel is shut, and a number inside the panel's shadow root would be neither visible next to the
 * box it describes nor reachable by a plain `querySelector` from a screenshot or a test.
 *
 * Below the stage, never over it. An overlay drawn on top of a box would be the one instrument in
 * this package that changes what it is measuring: the stage auto-fits to its content, so anything
 * painted inside it can end up in the height being reported.
 */

const STYLE_ID = "sk-devtools-preview-metrics-style";
const READOUT_CLASS = "sk-devtools-preview-metrics";
const READY = "data-sk-component-preview-frame-ready";
const ERROR = "data-sk-component-preview-frame-error";
const STAGE = "iframe.sk-component-preview__stage";
const VANILLA = '[data-sk-component-preview-binding="vanilla"]';

type Sample = { readonly at: number; readonly height: number; readonly ready: boolean };

function ensureStyleTag(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  /* Tokens where they exist, literals as the fallback: this package is imported by consumers whose
     pages may not load the docs site's own stylesheets, and a readout that renders invisible is
     worse than one that renders unbranded. Same reasoning as the FPS badge's own styles. */
  style.textContent = `
    .${READOUT_CLASS} {
      /* The card's own grid puts the stage in column 1; without this the readout would start a
         second column on a card whose grid has one. */
      grid-column: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px;
      padding: 4px 8px;
      border-block-start: 1px solid var(--color-border-subtle, rgba(0, 0, 0, 0.12));
      background: var(--color-bg-surface-sunken, rgba(0, 0, 0, 0.04));
      color: var(--color-text-secondary, #666);
      font: 11px/1.5 ui-monospace, "SF Mono", monospace;
    }
    .${READOUT_CLASS} b {
      color: var(--color-text-primary, #111);
      font-weight: 600;
    }
    .${READOUT_CLASS} i {
      padding-inline: 4px;
      border-radius: 4px;
      background: var(--color-bg-surface, rgba(0, 0, 0, 0.06));
      font-style: normal;
      text-transform: uppercase;
    }
    /* A stage that shifted is the finding. Everything else is just a number. */
    .${READOUT_CLASS}[data-shift="yes"] {
      color: var(--color-text-danger, #b91c1c);
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);
}

/**
 * The stage the reader is actually looking at, RIGHT NOW.
 *
 * A two-binding preview holds two stages in the same grid cell and hides the one that is not
 * selected, so "the Vanilla one" is the wrong answer the moment anyone switches to React: a hidden
 * stage is `display: none`, its box is 0×0, and an earlier version of this file reported exactly
 * that, a confident `0×0` for a card the reader could plainly see. The binding is also a
 * PAGE-WIDE preference, so one click re-points every readout on the page at once.
 *
 * `closest("[hidden]")` and not the stage's own attribute: the switch hides the WRAPPER
 * (`.sk-component-preview__react-stage`), never the iframe inside it.
 */
function visibleStage(root: Element): HTMLIFrameElement | null {
  const stages = [...root.querySelectorAll<HTMLIFrameElement>(STAGE)];
  return stages.find((stage) => !stage.closest("[hidden]")) ?? stages[0] ?? null;
}

/** Which binding that stage belongs to, for the readout to name when a preview has both. */
function bindingOf(stage: Element): string {
  return stage.closest(`[${"data-sk-component-preview-binding"}]`)?.getAttribute("data-sk-component-preview-binding") ?? (stage.matches(VANILLA) ? "vanilla" : "react");
}

function watch(root: HTMLElement): (() => void) | null {
  const stages = [...root.querySelectorAll<HTMLIFrameElement>(STAGE)];
  if (stages.length === 0) return null;

  const readout = document.createElement("div");
  readout.className = READOUT_CLASS;
  /* An instrument, not content: a screen reader announcing a live pixel counter on every card is
     noise, and the numbers mean nothing without the box they describe. */
  readout.setAttribute("aria-hidden", "true");
  /*
   * Straight after the loader, which is the last element sharing the stage's own grid cell. The
   * card is a grid that auto-places in DOM order, so appending instead put this below the source
   * disclosure at the very bottom, visually detached from the box it is describing.
   */
  const loader = root.querySelector(".sk-component-preview__loading");
  if (loader) loader.after(readout);
  else stages[0]?.parentElement?.append(readout);

  const id = root.id || "(no id)";
  /* Authored by the docs app (`ComponentPreview.astro`), because it cannot be read off the DOM:
     tree-emitted and hand-written markup are indistinguishable once rendered. */
  const source = root.getAttribute("data-sk-preview-source") ?? "?";
  const started = performance.now();

  /*
   * A HISTORY PER STAGE, not one per card. The two bindings load independently and settle at their
   * own sizes, so folding them into one list would report the React stage as having "shifted" from
   * whatever the Vanilla one happened to be doing when the reader switched.
   */
  const history = new Map<Element, Sample[]>();
  let last = "";

  const paint = () => {
    const stage = visibleStage(root);
    if (!stage) return;
    const box = stage.getBoundingClientRect();
    const width = Math.round(box.width);
    const height = Math.round(box.height);
    const ready = stage.hasAttribute(READY) || stage.hasAttribute(ERROR);
    const binding = bindingOf(stage);

    /*
     * A ZERO BOX IS NEVER A REPORT, it is a stage that is not being shown: `display: none` on the
     * losing binding, or the one frame between the switch removing `hidden` and the browser laying
     * the new stage out. Recording it would put a `0×0` in the history of a stage that never had
     * that size, and it is what this readout used to print outright for anyone reading on the React
     * binding. Keeping the previous line is the honest answer while nothing is measurable.
     */
    if (width === 0 && height === 0) return;

    const key = `${binding}:${width}x${height}:${ready}`;
    if (key === last) return;
    last = key;

    const samples = history.get(stage) ?? [];
    history.set(stage, samples);
    samples.push({ at: Math.round(performance.now() - started), height, ready });

    /*
     * The first sample taken BEFORE the frame reported is the loading box; the current one is what
     * the reader ends up with. The difference between them is the layout shift, which is the whole
     * reason to watch this, so it is computed here rather than left as mental arithmetic.
     */
    const loading = samples.find((sample) => !sample.ready);
    const delta = loading ? height - loading.height : 0;
    const shifted = Boolean(loading) && ready && delta !== 0;
    const reserved = getComputedStyle(root)
      .getPropertyValue("--sk-component-preview-stage-reserved-block-size")
      .trim();

    readout.dataset.shift = shifted ? "yes" : "no";
    readout.innerHTML = "";
    const idEl = document.createElement("b");
    idEl.textContent = id;
    const sourceEl = document.createElement("i");
    /* The binding is named only when there are two to tell apart, so the common card stays short. */
    sourceEl.textContent = stages.length > 1 ? `${source} · ${binding}` : source;
    const live = document.createElement("span");
    live.textContent =
      `${width}×${height} · ${ready ? "settled" : "loading"}` +
      (shifted ? ` (from ${loading?.height}) · shift ${delta > 0 ? "+" : ""}${delta}` : "") +
      ` · reserved ${reserved || "none"}` +
      ` · ${samples.length} change${samples.length === 1 ? "" : "s"}`;
    readout.append(idEl, sourceEl, live);

    /* The full timeline goes to the console, where a list can be as long as it needs to be. */
    console.debug(
      `[preview-metrics] ${id} · ${source}/${binding} · +${samples.at(-1)?.at}ms · ${width}×${height} · ${ready ? "settled" : "loading"}`,
    );
  };

  paint();

  /* BOTH stages, because either can become the visible one: sizes, and the ready flag that can flip
     without the box changing in the same frame. */
  const resize = new ResizeObserver(paint);
  const attributes = new MutationObserver(paint);
  for (const stage of stages) {
    resize.observe(stage);
    attributes.observe(stage, { attributes: true, attributeFilter: [READY, ERROR, "style"] });
  }
  /* The binding switch toggles `hidden` on the WRAPPERS, which changes which stage this is about
     without touching either stage's own attributes. */
  const bindings = new MutationObserver(paint);
  bindings.observe(root, { attributes: true, attributeFilter: ["hidden"], subtree: true });

  return () => {
    resize.disconnect();
    attributes.disconnect();
    bindings.disconnect();
    readout.remove();
  };
}

export function createPreviewMetrics() {
  ensureStyleTag();
  let stops: (() => void)[] = [];
  /* Previews mount lazily as they scroll into view, so a card that did not exist when this was
     switched on still has to be picked up. Cheap: one callback per DOM mutation batch, and only
     while the check is on. */
  let added: MutationObserver | null = null;

  const attach = () => {
    for (const root of document.querySelectorAll<HTMLElement>("[data-sk-component-preview]")) {
      if (root.querySelector(`.${READOUT_CLASS}`)) continue;
      const stop = watch(root);
      if (stop) stops.push(stop);
    }
  };

  return {
    start(): void {
      attach();
      added = new MutationObserver(attach);
      added.observe(document.body, { childList: true, subtree: true });
    },
    stop(): void {
      added?.disconnect();
      added = null;
      for (const stop of stops) stop();
      stops = [];
    },
  };
}
