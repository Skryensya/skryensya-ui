import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type UIKey = Parameters<Translate>[0];

const text = (t: Translate, key: UIKey): UsageTree => ({
  contract: "typography",
  signature: "Text",
  slots: { children: t(key) },
});

/** The labelled one, which is the variant with anatomy to name: two rules and the word between. */
export const separatorAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("separatorPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "separator",
      signature: "LabelledSeparator",
      slots: { children: t("demo.separator.or") },
    },
    items: [
      namePart(".sk-separator", "block-start", { mark: "bracket" }),
      namePart(".sk-separator__rule", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-separator__label", "block-end", { ringPlacement: "offset", ringDistance: 4 }),
    ],
  },
});

/** THE CASE THE COMPONENT WAS BUILT FOR: a rule between two blocks about different things. */
export const separatorTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    text(t, "demo.separator.before"),
    { contract: "separator", signature: "Separator" },
    text(t, "demo.separator.after"),
  ],
});

/** The three tones, from chrome to section break. */
export const separatorTonesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    text(t, "demo.separator.tone.subtle"),
    { contract: "separator", signature: "Separator", options: { tone: "subtle" } },
    text(t, "demo.separator.tone.default"),
    { contract: "separator", signature: "Separator" },
    text(t, "demo.separator.tone.strong"),
    { contract: "separator", signature: "Separator", options: { tone: "strong" } },
    text(t, "demo.separator.tone.end"),
  ],
});

/*
 * VERTICAL, in the one place it makes sense: between things on a line. It takes its height from the
 * row, which is why the row is an Inline and not three loose elements.
 */
export const separatorVerticalTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "none", inlineAlign: "center" },
  children: [
    text(t, "demo.separator.meta.author"),
    { contract: "separator", signature: "Separator", options: { orientation: "vertical", spacing: "sm" } },
    text(t, "demo.separator.meta.date"),
    { contract: "separator", signature: "Separator", options: { orientation: "vertical", spacing: "sm" } },
    text(t, "demo.separator.meta.reading"),
  ],
});

/** The one with a word in it: the sign-in form's "or", between two ways of doing the same thing. */
export const separatorLabelledTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "solid", tone: "accent" },
      slots: { children: t("demo.separator.signInWithKey") },
    },
    { contract: "separator", signature: "LabelledSeparator", slots: { children: t("demo.separator.or") } },
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "soft" },
      slots: { children: t("demo.separator.signInWithEmail") },
    },
  ],
});
