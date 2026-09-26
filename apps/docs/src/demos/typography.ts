import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/* Real `Code` nodes between runs of text: a `<code>` written into a translated string is escaped
   by React and is never the contract's own element in either binding. */
export const codeTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  children: [
    t("demo.typography.code.before"),
    { contract: "typography", signature: "Code", children: "data-role" },
    t("demo.typography.code.between"),
    { contract: "typography", signature: "Code", children: "--color-surface" },
    t("demo.typography.code.after"),
  ],
});

export const outputTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Output",
  slots: { children: t("demo.typography.output.value") },
});

export const headingDisplayTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: ["display-lg", "display-md", "display-sm"].map((headingSize) => ({
    contract: "typography",
    signature: "Heading",
    options: { headingSize },
    children: t("demo.heading.sample"),
  })),
});

export const headingDocumentTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: ["h1", "h2", "h3", "h4", "h5", "h6"].map((headingSize) => ({
    contract: "typography",
    signature: "Heading",
    options: { headingElement: headingSize, headingSize },
    children: t("demo.heading.sample"),
  })),
});

export const headingPageTitleTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      options: { textRole: "eyebrow" },
      children: t("demo.heading.page.eyebrow"),
    },
    {
      contract: "typography",
      signature: "Heading",
      options: { headingElement: "h1", headingSize: "display-sm", flush: true },
      children: t("demo.heading.page.title"),
    },
    {
      contract: "typography",
      signature: "Text",
      options: { textRole: "subtitle" },
      children: t("demo.heading.page.lede"),
    },
  ],
});

export const headingOutlineTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "typography",
      signature: "Heading",
      options: { headingElement: "h2", headingSize: "h2" },
      children: t("demo.heading.outline.title"),
    },
    {
      contract: "typography",
      signature: "Heading",
      options: { headingElement: "h3", headingSize: "h3" },
      children: t("demo.heading.outline.ready"),
    },
    {
      contract: "typography",
      signature: "Text",
      children: t("demo.heading.outline.readyBody"),
    },
    {
      contract: "typography",
      signature: "Heading",
      options: { headingElement: "h3", headingSize: "h3" },
      children: t("demo.heading.outline.next"),
    },
    {
      contract: "typography",
      signature: "Text",
      children: t("demo.heading.outline.nextBody"),
    },
  ],
});

export const headingCompactTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "typography",
      signature: "Heading",
      options: { headingElement: "h2", headingSize: "h4", flush: true },
      children: t("demo.heading.compact.title"),
    },
    {
      contract: "typography",
      signature: "Text",
      children: t("demo.heading.compact.body"),
    },
  ],
});

export const headingFlushTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingSize: "h2", flush: true },
  children: t("demo.heading.flush"),
});

export const textScaleTree = (): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: ["caption", "sm", "body", "lg"].map((size) => ({
    contract: "typography",
    signature: "Text",
    options: { size },
    children: size,
  })),
});

export const textTitleTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      options: { textRole: "eyebrow" },
      children: t("demo.heading.page.eyebrow"),
    },
    {
      contract: "typography",
      signature: "Heading",
      options: { headingElement: "h2", headingSize: "h2", flush: true },
      children: t("demo.typography.heading.text"),
    },
    {
      contract: "typography",
      signature: "Text",
      options: { textRole: "subtitle" },
      children: t("demo.heading.page.lede"),
    },
  ],
});

export const textReadingTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      options: { textRole: "eyebrow" },
      children: t("demo.text.reading.eyebrow"),
    },
    {
      contract: "typography",
      signature: "Text",
      children: t("demo.text.reading.body"),
    },
    {
      contract: "typography",
      signature: "Text",
      options: { tone: "secondary", size: "sm" },
      children: t("demo.text.reading.note"),
    },
  ],
});

export const textInlineTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  children: [
    t("demo.text.before"),
    " ",
    {
      contract: "typography",
      signature: "Strong",
      children: t("demo.text.after"),
    },
  ],
});

export const textFeedbackTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { tone: "danger" },
  children: t("demo.text.feedback"),
});

/* HEADING: one element, `h1` to `h6`, and the class is the whole contract. */
export const headingAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("heading.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "typography",
      signature: "Heading",
      options: { headingSize: "h2", flush: true },
      children: t("heading.anatomyHeading"),
    },
    items: [
      namePart(".sk-heading", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * TEXT: the paragraph, and the one inline part that travels inside it most. `sk-code` is Code's own
 * class, not a part of Text, and ringing it inside the paragraph is how a reader learns the two nest.
 */
export const textAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("textPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "typography",
      signature: "Text",
      attrs: { style: "max-inline-size: 26rem;" },
      children: [
        t("textPage.anatomyBefore"),
        { contract: "typography", signature: "Code", children: "data-size" },
        t("textPage.anatomyAfter"),
      ],
    },
    items: [
      namePart(".sk-text", "inline-start", { mark: "bracket" }),
      namePart(".sk-code", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});
