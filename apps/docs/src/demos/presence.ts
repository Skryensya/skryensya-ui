import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE PRESENCE EXAMPLES, AS USAGE TREES.
 *
 * Each one is a control and the content it shows and hides. The toggling is page-level script (see
 * `PresencePage.astro`): it flips `hidden` and `data-state` through the DOM, which is the whole of
 * the authored-markup API, so the same script drives both stages.
 *
 * Every stage reserves the block size of its open state. Presence leaves the layout at the END of
 * its exit, and a preview that shrank with it would pull the page up under the reader's pointer.
 */

/** 1. A confirmation that arrives on a click and leaves on its own: the enter and the exit, unprompted. */
export const presenceNoticeTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 24rem; max-inline-size: 100%; min-block-size: 10rem;" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      attrs: { id: "presence-notice-save" },
      children: t("presence.noticeSave"),
    },
    {
      contract: "presence",
      signature: "Presence",
      options: { present: false },
      attrs: { id: "presence-notice" },
      children: {
        contract: "callout",
        signature: "Callout",
        options: { tone: "success" },
        slots: { title: t("presence.noticeTitle") },
        children: t("presence.noticeBody"),
      },
    },
  ],
});

/** 2. The case forms are full of: a setting that reveals the fields it needs. */
export const presenceFieldsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 24rem; max-inline-size: 100%; min-block-size: 15rem;" },
  children: [
    {
      contract: "switch",
      signature: "Switch",
      options: { name: "presence-other-address" },
      attrs: { id: "presence-fields-switch", "aria-controls": "presence-fields" },
      children: t("presence.fieldsSwitch"),
    },
    {
      contract: "presence",
      signature: "Presence",
      options: { present: false },
      attrs: { id: "presence-fields" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm" },
        children: [
          {
            contract: "form-field",
            signature: "FormField",
            slots: { label: t("presence.fieldsStreet") },
            children: { contract: "input", signature: "Input", options: { name: "street" } },
          },
          {
            contract: "form-field",
            signature: "FormField",
            slots: { label: t("presence.fieldsCity") },
            children: { contract: "input", signature: "Input", options: { name: "city" } },
          },
        ],
      },
    },
  ],
});

/*
 * 3. The same toggle, three motions, set through the styling hooks on each instance. The hooks are
 * `attrs.style` on purpose: they are the consumer's override, not an option the contract offers.
 */
const tuned = (label: string, style?: string): UsageTree => ({
  contract: "presence",
  signature: "Presence",
  attrs: { "data-presence-tuning": "", ...(style ? { style } : {}) },
  children: {
    contract: "box",
    signature: "Box",
    options: { surface: "raised", border: "subtle", padding: "md" },
    children: [{ contract: "typography", signature: "Text", options: { size: "sm", weight: "label" }, children: label }],
  },
});

export const presenceTuningTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 32rem; max-inline-size: 100%; min-block-size: 8rem;" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      attrs: { id: "presence-tuning-toggle" },
      children: t("presence.tuningToggle"),
    },
    {
      contract: "layout",
      signature: "Grid",
      options: { columns: "3", gap: "sm" },
      children: [
        tuned(t("presence.tuningDefault")),
        tuned(t("presence.tuningFade"), "--sk-presence-enter-distance: 0px; --sk-presence-exit-distance: 0px;"),
        tuned(
          t("presence.tuningSlow"),
          "--sk-presence-enter-duration: 600ms; --sk-presence-exit-duration: 400ms; --sk-presence-enter-distance: 1.5rem; --sk-presence-exit-distance: 1.5rem;",
        ),
      ],
    },
  ],
});
