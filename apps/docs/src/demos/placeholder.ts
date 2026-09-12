import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * A paragraph skeleton: the root and the lines it expands into. Other signatures are a single
 * `sk-placeholder` with no child part; only `.paragraph` makes `sk-placeholder__line` worth naming.
 */
export const placeholderAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("placeholderPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "placeholder",
      signature: "Placeholder.paragraph",
      options: { text: "body", lines: 3 },
      attrs: { style: "inline-size: min(100%, 18rem);" },
    },
    items: [
      namePart(".sk-placeholder", "block-start"),
      namePart(".sk-placeholder__line", "inline-end", {
        match: "all",
        ringPlacement: "offset",
        ringDistance: 2,
      }),
    ],
  },
});


const mediaSrc = "/demos/media-gradient.svg";

/*
 * The skeleton for the card below, composed entirely from named roles. Not one length is written
 * here: `text: "h3"` is the same token pair the real Heading reads, `size: "md"` the same scale the
 * real Avatar reads, and `fill` is what lets the media take the ImageFrame's own box and corner.
 *
 * This demo used to need nine bespoke classes in `examples/placeholder.css` to say the same thing,
 * every one of them a guess at a measurement the system already knew: `1.5rem` for a line of h3,
 * whose real line box is 27px. Those guesses were the bug the skeleton existed to prevent.
 */
const publicationPlaceholder = (): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "lg", surface: "surface" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "image-frame",
        signature: "ImageFrame",
        options: { aspect: "16/9", border: "subtle", radius: "control" },
        children: {
          contract: "placeholder",
          signature: "Placeholder.block",
          options: { fill: true },
        },
      },
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm" },
        children: [
          /* The eyebrow is a Badge, which is control-sized rather than text-sized. */
          {
            contract: "placeholder",
            signature: "Placeholder.block",
            options: { width: "40%", height: "var(--size-control-sm)" },
          },
          {
            contract: "placeholder",
            signature: "Placeholder.paragraph",
            options: { text: "h3", lines: 2, lastLine: "72%" },
          },
          {
            contract: "placeholder",
            signature: "Placeholder.paragraph",
            options: { text: "body", lines: 2, lastLine: "88%" },
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "center" },
            children: [
              { contract: "placeholder", signature: "Placeholder.circle", options: { size: "md" } },
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "xs" },
                attrs: { style: "flex: 1 1 auto; max-inline-size: 12rem;" },
                children: [
                  { contract: "placeholder", signature: "Placeholder", options: { text: "sm" } },
                  {
                    contract: "placeholder",
                    signature: "Placeholder",
                    options: { text: "caption", width: "70%" },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});

const publicationContent = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "lg", surface: "surface" },
  attrs: { "aria-labelledby": "publication-title", role: "article" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "image-frame",
        signature: "ImageFrame",
        options: {
          alt: "",
          aspect: "16/9",
          border: "subtle",
          fit: "cover",
          radius: "control",
          src: mediaSrc,
        },
      },
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm" },
        children: [
          {
            contract: "badge",
            signature: "Badge",
            options: { tone: "accent" },
            children: t("demo.placeholder.research"),
          },
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h3" },
                attrs: { id: "publication-title" },
                children: t("demo.placeholder.title"),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary" },
                children: t("demo.placeholder.body"),
              },
            ],
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "center" },
            children: [
              {
                contract: "avatar",
                signature: "Avatar.initials",
                options: { name: "Rocio Mora" },
                children: "RM",
              },
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "none" },
                children: [
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { size: "sm", weight: "label" },
                    children: "Rocio Mora",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { size: "caption", tone: "tertiary" },
                    children: t("demo.placeholder.readTime"),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});

/** Always-pending geometry: the status remains outside the decorative placeholder subtree. */
export const publicationPlaceholderTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  attrs: { "aria-busy": "true", class: "placeholder-example" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      options: { size: "sm", tone: "secondary" },
      attrs: { role: "status" },
      children: t("demo.placeholder.loading"),
    },
    publicationPlaceholder(),
  ],
});

/** Both states occupy one grid area; the frame script changes only state and accessibility attrs. */
export const publicationSwapTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  attrs: { "aria-busy": "true", class: "placeholder-example" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      options: { size: "sm", tone: "secondary" },
      /*
       * BOTH words, on the node that shows them: the script swaps the text after five seconds and
       * reads the second one from `data-loaded` rather than carrying it. A script that carried it
       * would have to be built once per language, which is what it used to be.
       */
      attrs: {
        "aria-live": "polite",
        "data-placeholder-status": "",
        "data-loaded": t("demo.placeholder.loaded"),
        role: "status",
      },
      children: t("demo.placeholder.loading"),
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { class: "placeholder-example__swap", "data-state": "loading" },
      children: [
        {
          contract: "box",
          signature: "Box",
          attrs: { "aria-hidden": "false", "data-placeholder-loading": "" },
          children: publicationPlaceholder(),
        },
        {
          contract: "box",
          signature: "Box",
          attrs: { "aria-hidden": "true", "data-placeholder-content": "" },
          children: publicationContent(t),
        },
      ],
    },
  ],
});

export { default as publicationSwapScript } from "./scripts/placeholder-swap.ts?raw";

/*
 * THE POINT OF NAMING THE ROLE, shown rather than asserted: each row is a skeleton beside the real
 * text it stands in for, at the same role. They line up because both read the same token pair, not
 * because anyone measured. Change the type scale and both move together.
 */
const MATCHED_ROLES = ["h1", "h3", "body", "caption"] as const;

export const placeholderMatchTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: MATCHED_ROLES.map((role) => ({
    contract: "layout",
    signature: "Grid",
    options: { columns: "2", gap: "md" },
    children: [
      { contract: "placeholder", signature: "Placeholder", options: { text: role, width: "80%" } },
      role === "h1" || role === "h3"
        ? {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: role, flush: true },
            children: t("demo.placeholder.roleSample"),
          }
        : {
            contract: "typography",
            signature: "Text",
            options: { size: role },
            children: t("demo.placeholder.roleSample"),
          },
    ],
  })),
});

/** The four signatures, each doing the one job it exists for. */
export const placeholderVocabularyTree = (): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "lg" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "md", inlineAlign: "center", wrap: false },
      children: [
        { contract: "placeholder", signature: "Placeholder.circle", options: { size: "lg" } },
        { contract: "placeholder", signature: "Placeholder.circle", options: { size: "md" } },
        { contract: "placeholder", signature: "Placeholder.circle", options: { size: "sm" } },
        {
          contract: "placeholder",
          signature: "Placeholder.block",
          options: { width: "8rem", height: "3rem" },
        },
      ],
    },
    { contract: "placeholder", signature: "Placeholder.paragraph", options: { lines: 4 } },
  ],
});
