import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

export const textTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  slots: { children: t("demo.typography.text.body") },
});

export const textSecondaryTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { tone: "secondary" },
  slots: { children: t("demo.typography.textSecondary.body") },
});

export const headingTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingElement: "h2", headingSize: "lg" },
  slots: { children: t("demo.typography.heading.text") },
});

export const linkTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  slots: {
    children: t("demo.typography.linkContext"),
  },
});

export const strongTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  slots: { children: t("demo.typography.strong.body") },
});

export const codeTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  slots: { children: t("demo.typography.code.body") },
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
