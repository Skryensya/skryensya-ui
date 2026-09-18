import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Each preview isolates one decision. The page is a teaching sequence, not
 * a component inventory: start with one Button, then change one axis at a time.
 */
export const buttonDefaultTree = (t: Translate): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  children: t("demo.button.action"),
});

/**
 * `variant` and `tone` are independent axes, so the reference shows every pairing, LABELLED: rows are
 * the emphasis, columns the tone, and an empty corner cell sits the tone labels over their columns.
 * Every cell carries the same neutral word so the only thing varying is the pairing; the destructive
 * example below is where a real destructive label belongs.
 */
const EMPHASES = ["solid", "soft", "ghost", "translucent"] as const;
const TONES = ["neutral", "accent", "danger"] as const;

/** A row or column header: caption-sized and secondary, scaffolding rather than content. */
const axisLabel = (text: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { size: "caption", tone: "secondary", weight: "label" },
  children: text,
});

export const buttonVariantTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "4", gap: "md" },
  attrs: { style: "align-items: center; justify-items: start;" },
  children: [
    { contract: "typography", signature: "Text", options: { size: "caption" }, children: "" },
    ...TONES.map((tone) => axisLabel(tone)),
    ...EMPHASES.flatMap((variant) => [
      axisLabel(variant),
      ...TONES.map(
        (tone): UsageTree => ({
          contract: "button",
          signature: "Button.action",
          /* Defaults omitted, so the solid/neutral cell's snippet is a bare Button: it IS the default. */
          options: {
            ...(variant === "solid" ? {} : { variant }),
            ...(tone === "neutral" ? {} : { tone }),
          },
          children: t("demo.button.action"),
        }),
      ),
    ]),
  ],
});

/**
 * This is one concept despite two controls: the quiet destructive trigger and
 * the destructive confirmation deliberately need to be compared together.
 */
export const buttonDestructivePairTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "lg", inlineAlign: "center" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "ghost", tone: "danger", size: "sm" },
      children: t("demo.button.delete"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "danger" },
      children: t("demo.button.confirmDelete"),
    },
  ],
});

/**
 * Sizes are the single deliberate comparison: all four use the same action,
 * emphasis, and tone, so only their size changes.
 */
export const buttonSizesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "xs", tone: "accent" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "sm", tone: "accent" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "lg", tone: "accent" },
      children: t("demo.button.save"),
    },
  ],
});

/** A leading icon occupies Button's dedicated `pre` slot. */
export const buttonIconTree = (t: Translate): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { tone: "accent" },
  slots: { pre: { contract: "icon", signature: "Icon", options: { name: "download" } } },
  children: t("demo.button.download"),
});

/** An icon-only Button must name itself on its host. */
export const buttonIconOnlyTree = (t: Translate): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { iconOnly: true, variant: "ghost" },
  attrs: { "aria-label": t("demo.button.settings") },
  children: { contract: "icon", signature: "Icon", options: { name: "settings" } },
});

/**
 * Navigation changes the host to an anchor; it is not an action option. The destination leaves the
 * site, so it opens in a new tab and the launch icon trails the label: the label names where it goes,
 * the icon is the "and it leaves this tab" footnote, the same order the docs' own external links use.
 */
export const buttonAsLinkTree = (t: Translate, href: string): UsageTree => ({
  contract: "button",
  signature: "Button.navigation",
  options: { tone: "accent", href },
  attrs: { target: "_blank", rel: "noopener noreferrer" },
  slots: { post: { contract: "icon", signature: "Icon", options: { name: "external-link" } } },
  children: t("demo.button.readNews"),
});

/**
 * The four buttons on the "first component" walkthrough: default, primary, danger, and sm.
 * Same signatures as the Button page; shared so the teaching page cannot drift from the reference.
 */
export const firstComponentButtonsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    { contract: "button", signature: "Button.action", children: t("demo.button.save") },
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "danger" },
      children: t("demo.button.delete"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "sm" },
      children: t("demo.button.small"),
    },
  ],
});

/*
 * A tile fills its container by design (it is a cell in a set of choices), so it sits in a responsive
 * two-column Grid, the context it is actually used in: one column wide, full width only once the
 * grid collapses on a narrow screen.
 */
export const tileButtonTree = (_t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "2", responsive: true },
  children: {
    contract: "tile",
    signature: "TileButton",
    children: {
      contract: "tile",
      signature: "TileContent",
      slots: {
        title: "Run deployment",
        description: "Start the production deployment now.",
      },
    },
  },
});

/*
 * THE ANATOMY: ONE button, named part by part, the same `Annotated` specimen the Accordion page
 * opens with.
 *
 * One, and that is the whole lesson rather than a smaller version of the matrix below. An accordion
 * is a composition (a root, a trigger, a chevron, a panel), so its diagram walks a tree; a button is
 * a single native `<button>`, and what a reader needs to see is exactly what rides on that one box:
 * the root class, the shared state layer beside it, and the reserved places for children.
 *
 * TWO RINGS ON THE SAME BOX, concentric, on purpose. `sk-button` and `sk-interactive` are both
 * on the host (the contract's `also`), so the inner ring is the class that paints the control and
 * the outer one is the layer that answers to hover, press and focus. Same element, two jobs, and the
 * diagram says so instead of the page having to.
 *
 * PRE AND POST are the reserved icon places: one before the label, one after. The specimen fills
 * both so both boxes exist to be named. `sk-icon` is ONE label with `match: "all"`: the part is the
 * same class in both slots, not two different parts. Host rings take the block gutters so each
 * inline gutter holds one slot label and the button stays centred.
 *
 * `inert` is what makes it a specimen: it mounts and paints, Tab walks past it, and clicking does
 * nothing. The live buttons are the twelve in the matrix right below it.
 */
export const buttonAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("button.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "button",
      signature: "Button.action",
      /* `lg` because the specimen is being pointed at rather than clicked: the bigger face keeps the
         icons' own rings clear of the button's, which at `md` sit about four pixels apart. */
      options: { tone: "accent", size: "lg" },
      slots: {
        pre: { contract: "icon", signature: "Icon", options: { name: "download" } },
        post: { contract: "icon", signature: "Icon", options: { name: "arrow-right" } },
      },
      children: t("demo.button.download"),
    },
    items: [
      /*
       * BOTH RINGS GO OUTSIDE, and the inset default is what forced it: this button is a filled
       * accent, so a ring drawn just inside it is a pale line on a dark ground and the eye reads it
       * as part of the paint rather than as a mark. Concentric instead, 2 then 8: the inner ring is
       * the class that paints the control, the outer one the layer wrapped around it.
       */
      {
        options: {
          for: ".sk-button",
          side: "block-end",
          ringPlacement: "offset",
          ringDistance: 2,
        },
        slots: { children: "sk-button" },
      },
      {
        /* The same host as the ring above, reached through the class this label names: `for` is the
           entry's key, so two labels cannot share a selector even when they mean one element. */
        options: {
          for: ".sk-interactive",
          side: "block-start",
          ringPlacement: "offset",
          ringDistance: 8,
        },
        slots: { children: "sk-interactive" },
      },
      {
        options: {
          for: ".sk-button__pre",
          side: "inline-start",
          ringPlacement: "offset",
          ringDistance: 6,
        },
        slots: { children: "sk-button__pre" },
      },
      {
        options: {
          for: ".sk-button__post",
          side: "inline-end",
          ringPlacement: "offset",
          ringDistance: 6,
        },
        slots: { children: "sk-button__post" },
      },
      /*
       * ONE label for every icon in the specimen. A glyph's box IS the glyph, so the ring goes
       * outside; `match: "all"` is what keeps it a single name pointing at both slots.
       */
      {
        options: {
          for: ".sk-icon",
          side: "block-end",
          match: "all",
          ringPlacement: "offset",
          ringDistance: 4,
        },
        slots: { children: "sk-icon" },
      },
    ],
  },
});
