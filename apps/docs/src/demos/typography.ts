import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
