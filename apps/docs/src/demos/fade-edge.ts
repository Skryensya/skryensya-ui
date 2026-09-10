import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * THE FADE-EDGE EXAMPLES, AS USAGE TREES.
 *
 * These were six hand-written HTML strings on the page, which made FadeEdge the last family whose
 * docs had a Vanilla stage and no React one at all: `ComponentPreview` derives BOTH bindings from a
 * tree, and there was nothing to derive from. Nothing about the pattern was blocking that; it is
 * paint-only, every piece it composes is published, and the one option the activity feed needed
 * (`List`'s `dividers`) was declared in the contract and simply not exposed by its signature.
 *
 * The copy stays literal Spanish rather than going through `t()`, because this page exists only at
 * `/es/componentes/fade-edge`: routing six demos' worth of strings through the message tree would
 * add a locale this page does not have.
 */

/** Scroll geometry the two vertical demos share. `attrs.style`, because these are the CONSUMER's
 *  dimensions: how tall a clipped region is belongs to the layout around it, not to the pattern. */
const VERTICAL_SCROLL = "max-block-size: 11rem; overflow-y: auto;";
const HORIZONTAL_SCROLL = "overflow-x: auto;";

/** The card every vertical demo sits in: a raised, bordered Box at a realistic column width. */
const card = (children: UsageTree): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "md" },
  attrs: { style: "inline-size: 22rem;" },
  children: [children],
});

type Activity = {
  readonly initials: string;
  readonly palette: string;
  readonly name: string;
  readonly action: string;
  readonly time: string;
};

/*
 * Seven rows deep, on purpose: the box is capped at 11rem (about three rows), so the feed has real
 * content to scroll THROUGH rather than a static clip. That is what makes the effect legible  -
 * `mask-image` paints against the element's own box, not its content, so the faded band stays
 * pinned to the edge while the rows travel underneath it.
 */
const ACTIVITY: readonly Activity[] = [
  { initials: "AL", palette: "blue-600", name: "Ada Lovelace", action: 'Comentó en "Rediseño del dashboard"', time: "2m" },
  { initials: "GH", palette: "emerald-600", name: "Grace Hopper", action: "Aprobó el pull request #482", time: "15m" },
  { initials: "AT", palette: "sky-600", name: "Alan Turing", action: 'Creó el ticket "Migrar auth a OAuth2"', time: "1h" },
  { initials: "MH", palette: "red-600", name: "Margaret Hamilton", action: "Cerró 3 issues en el sprint actual", time: "2h" },
  { initials: "DK", palette: "amber-600", name: "Donald Knuth", action: "Subió una nueva build a staging", time: "5h" },
  { initials: "KP", palette: "emerald-600", name: "Katherine Johnson", action: 'Editó la página "Roadmap Q3"', time: "8h" },
  { initials: "BL", palette: "blue-600", name: "Barbara Liskov", action: "Invitó a 2 personas al equipo", time: "1d" },
];

const activityList = (label: string): UsageTree => ({
  contract: "list",
  signature: "List",
  options: { dividers: false },
  attrs: { "aria-label": label },
  children: ACTIVITY.map((row) => ({
    contract: "list",
    signature: "ListItem",
    slots: {
      leading: {
        contract: "avatar",
        signature: "Avatar.initials",
        options: { size: "sm", name: row.name },
        attrs: {
          style: `--sk-avatar-bg: var(--palette-${row.palette}); --sk-avatar-fg: var(--palette-white);`,
        },
        children: row.initials,
      },
      title: row.name,
      description: row.action,
      trailing: {
        contract: "typography",
        signature: "Text",
        options: { tone: "tertiary", size: "sm" },
        children: row.time,
      },
    },
  })),
});

const TAGS = [
  ["Diseño", undefined],
  ["Frontend", "accent"],
  ["Aprobado", "success"],
  ["En revisión", "warning"],
  ["Bloqueado", "danger"],
  ["Backend", undefined],
  ["Accesibilidad", undefined],
  ["Performance", undefined],
  ["Documentación", undefined],
  ["QA", "accent"],
] as const;

/** A row of chips that deliberately overflows its container, for the two horizontal demos. */
const tagRow: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", wrap: false },
  children: TAGS.map(([label, tone]) => ({
    contract: "tag",
    signature: "Tag",
    ...(tone ? { options: { tone } } : {}),
    children: label,
  })),
};

const tagCard = (fade: UsageTree): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "md" },
  attrs: { style: "inline-size: 20rem;" },
  children: [fade],
});

/** 1. The default direction: a clipped list whose bottom edge says there are more rows below. */
export const fadeBottomTree: UsageTree = card({
  contract: "fade-edge",
  signature: "FadeEdge",
  attrs: { class: "sk-scrollbar", style: VERTICAL_SCROLL },
  children: [activityList("Actividad reciente")],
});

/** 2. The same feed, started at the end, so what is missing is above and the fade says so. */
export const fadeTopTree: UsageTree = card({
  contract: "fade-edge",
  signature: "FadeEdge",
  options: { direction: "to-top" },
  attrs: { id: "fade-top-scroll", class: "sk-scrollbar", style: VERTICAL_SCROLL },
  children: [activityList("Actividad reciente, scrolleada hacia abajo")],
});

/** 3. A chip row that does not fit, with the fade standing in for a scroll affordance. */
export const fadeRightTree: UsageTree = tagCard({
  contract: "fade-edge",
  signature: "FadeEdge",
  options: { direction: "to-right" },
  attrs: { class: "sk-scrollbar", style: HORIZONTAL_SCROLL },
  children: [tagRow],
});

/** 4. The same row, started at its end. */
export const fadeLeftTree: UsageTree = tagCard({
  contract: "fade-edge",
  signature: "FadeEdge",
  options: { direction: "to-left" },
  attrs: { id: "fade-left-scroll", class: "sk-scrollbar", style: HORIZONTAL_SCROLL },
  children: [tagRow],
});

/*
 * 5. The scrim: a photo whose caption has to stay legible over whatever the image happens to show.
 * `mode: "color"` paints an opaque gradient instead of revealing the surface behind, which is the
 * whole point here  -  there is no flat backdrop under a photograph to fade into.
 *
 * The "photo" is a CSS gradient rather than an ImageFrame: the subject is the WASH, and a real
 * image would put the reader's attention on whether the picture is nice. Same reason the media
 * placeholders elsewhere in these docs spell out their own dimensions.
 */
export const fadeColorTree: UsageTree = {
  contract: "box",
  signature: "Box",
  options: { border: "subtle" },
  attrs: { style: "inline-size: 20rem;" },
  children: [
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      attrs: { style: "position: relative;" },
      children: [
        {
          contract: "fade-edge",
          signature: "FadeEdge",
          options: { mode: "color", color: "rgb(15 23 42 / 85%)", size: "7rem" },
          attrs: {
            style:
              "block-size: 12rem; background: linear-gradient(135deg, var(--palette-blue-600), var(--palette-sky-400));",
          },
          children: [""],
        },
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "none" },
          attrs: { style: "position: absolute; inset: auto 0 0 0; padding: var(--space-inset-md);" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { size: "lg", weight: "label" },
              attrs: { style: "color: var(--palette-white);" },
              children: "Vista desde el mirador",
            },
            {
              contract: "typography",
              signature: "Text",
              options: { size: "sm" },
              attrs: { style: "color: rgb(255 255 255 / 85%);" },
              children: "Patagonia, Argentina",
            },
          ],
        },
      ],
    },
  ],
};

/*
 * 6. The size hook, driven live by a real range input over the SAME feed as the first demo.
 *
 * Pixels on the input and rem in the readout: `<input type="range">` has no unit, and converting on
 * read keeps the label honest about the unit `--sk-fade-edge-size` is actually documented in.
 */
export const fadeIntensityTree: UsageTree = {
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 22rem;" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "raised", border: "subtle", padding: "md" },
      children: [
        {
          contract: "fade-edge",
          signature: "FadeEdge",
          options: { size: "64px" },
          attrs: { id: "fade-intensity-region", class: "sk-scrollbar", style: VERTICAL_SCROLL },
          children: [activityList("Actividad reciente")],
        },
      ],
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "xs" },
      children: [
        {
          contract: "typography",
          signature: "Text",
          options: { size: "sm", tone: "secondary" },
          children: [
            "Intensidad del desvanecido: ",
            { contract: "typography", signature: "Strong", attrs: { id: "fade-intensity-value" }, children: "4.0rem" },
          ],
        },
        /*
         * `NativeInput`, and NOT the system's own `Slider`, which is the control this demo would
         * otherwise reach for.
         *
         * The stage runs ONE script for both bindings, and it drives the control through the DOM.
         * Vanilla's Slider dispatches `sk-value-change`; React's takes an `onValueChange` callback
         * and dispatches nothing, so a Slider here would be live in one binding and inert in the
         * other  -  the exact asymmetry this page's own card is supposed to disprove. A native range
         * input fires `input` in both, because in both it is the same element.
         */
        {
          contract: "input",
          signature: "NativeInput",
          options: { type: "range" },
          attrs: {
            id: "fade-intensity-range",
            min: "8",
            max: "88",
            step: "4",
            value: "64",
            "aria-label": "Ajustar el tamaño del desvanecido",
            style: "inline-size: 100%;",
          },
        },
      ],
    },
  ],
};
