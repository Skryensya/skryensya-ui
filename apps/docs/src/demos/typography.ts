import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Heading and Text demos shared by both locales. */

type HeadingSize =
  | "display-lg"
  | "display-md"
  | "display-sm"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

function sizeRow(label: string, size: HeadingSize, sample: string): UsageTree {
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "none" },
    children: [
      {
        contract: "typography",
        signature: "Text",
        options: { size: "caption", tone: "tertiary" },
        children: label,
      },
      {
        contract: "typography",
        signature: "Heading",
        options: { headingSize: size },
        children: sample,
      },
    ],
  };
}

/** Display-lg / md / sm with size captions. Token labels stay written. */
export const headingDisplayTree = (t: Translate): UsageTree => {
  const sample = t("demo.heading.sample");
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "xs" },
    children: [
      sizeRow("display-lg · 60", "display-lg", sample),
      sizeRow("display-md · 48", "display-md", sample),
      sizeRow("display-sm · 36", "display-sm", sample),
    ],
  };
};

/** Document scale h1–h6. Floor notes are the only translated captions. */
export const headingDocumentTree = (t: Translate): UsageTree => {
  const sample = t("demo.heading.sample");
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "xs" },
    children: [
      sizeRow("h1 · 30", "h1", sample),
      sizeRow("h2 · 24", "h2", sample),
      sizeRow("h3 · 20", "h3", sample),
      sizeRow(t("demo.heading.label.h4Floor"), "h4", sample),
      sizeRow(t("demo.heading.label.h5Same"), "h5", sample),
      sizeRow(t("demo.heading.label.h6Same"), "h6", sample),
    ],
  };
};

/** Eyebrow + display title + lede: the page-open pattern. */
export const headingPageTitleTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      options: { size: "caption", tone: "tertiary", weight: "label" },
      children: t("demo.heading.page.eyebrow"),
    },
    {
      contract: "typography",
      signature: "Heading",
      options: { headingSize: "display-md" },
      children: t("demo.heading.page.title"),
    },
    {
      contract: "typography",
      signature: "Text",
      options: { size: "lg", tone: "secondary" },
      children: t("demo.heading.page.lede"),
    },
  ],
});

/** h2 with two h3 sections underneath. */
export const headingOutlineTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "lg" },
  children: [
    {
      contract: "typography",
      signature: "Heading",
      options: { headingSize: "h2" },
      children: t("demo.heading.outline.title"),
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      children: [
        {
          contract: "typography",
          signature: "Heading",
          options: { headingSize: "h3" },
          children: t("demo.heading.outline.ready"),
        },
        {
          contract: "typography",
          signature: "Text",
          options: { size: "sm", tone: "secondary" },
          children: t("demo.heading.outline.readyBody"),
        },
      ],
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      children: [
        {
          contract: "typography",
          signature: "Heading",
          options: { headingSize: "h3" },
          children: t("demo.heading.outline.next"),
        },
        {
          contract: "typography",
          signature: "Text",
          options: { size: "sm", tone: "secondary" },
          children: t("demo.heading.outline.nextBody"),
        },
      ],
    },
  ],
});

/** Semantic h2 at the visual floor (h4). */
export const headingCompactTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "xs" },
  children: [
    {
      contract: "typography",
      signature: "Heading",
      options: { headingSize: "h4" },
      children: t("demo.heading.compact.title"),
    },
    {
      contract: "typography",
      signature: "Text",
      options: { size: "sm", tone: "secondary" },
      children: t("demo.heading.compact.body"),
    },
  ],
});

/** Eyebrow + heading + subtitle as one unit (`data-role` via attrs). */
export const textTitleTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      attrs: { "data-role": "eyebrow" },
      children: t("demo.text.title.eyebrow"),
    },
    {
      contract: "typography",
      signature: "Heading",
      options: { headingSize: "h3" },
      children: t("demo.text.title.heading"),
    },
    {
      contract: "typography",
      signature: "Text",
      attrs: { "data-role": "subtitle" },
      children: t("demo.text.title.subtitle"),
    },
  ],
});

/** Metadata eyebrow over body + secondary note. */
export const textReadingTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      attrs: { "data-role": "eyebrow" },
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
      options: { size: "sm", tone: "secondary" },
      children: t("demo.text.reading.note"),
    },
  ],
});

/** Validation message: tone paints, `role="alert"` is the live region. */
export const textFeedbackTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { size: "sm", tone: "danger" },
  attrs: { role: "alert" },
  children: t("demo.text.feedback"),
});

export const headingFlushTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "md" },
  children: {
    contract: "typography",
    signature: "Heading",
    options: { headingSize: "h3", flush: true },
    children: t("demo.heading.flush"),
  },
});

export const textInlineTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  children: [
    t("demo.text.before"),
    {
      contract: "typography",
      signature: "Strong",
      children: " Pro ",
    },
    t("demo.text.after"),
  ],
});
