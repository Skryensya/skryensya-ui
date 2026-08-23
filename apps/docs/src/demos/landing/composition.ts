import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Locale, Translate } from "../../i18n";
import { comboboxTree } from "../combobox";
import { planItems } from "../data/select";

/*
 * Composition journey on the landing page: start with a field, add an action, introduce a listbox,
 * collapse into Combobox, then wrap structure (form + dialog). Each stage is a real usage tree so
 * ComponentPreview mounts live behaviour — not a static illustration.
 */

export const compositionInputTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("landing.composition.inputLabel") },
  children: {
    contract: "input",
    signature: "Input",
    options: {
      type: "search",
      name: "q",
      placeholder: t("landing.composition.searchPlaceholder"),
    },
  },
});

export const compositionInputButtonTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", align: "end" },
  children: [
    {
      contract: "form-field",
      signature: "FormField",
      slots: { label: t("landing.composition.inputLabel") },
      children: {
        contract: "input",
        signature: "Input",
        options: {
          type: "search",
          name: "q",
          placeholder: t("landing.composition.searchPlaceholder"),
        },
      },
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "accent" },
      children: t("landing.composition.searchAction"),
    },
  ],
});

export const compositionInputButtonListboxTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm", align: "end" },
      children: [
        {
          contract: "form-field",
          signature: "FormField",
          slots: { label: t("landing.composition.inputLabel") },
          children: {
            contract: "input",
            signature: "Input",
            options: {
              type: "search",
              name: "q",
              placeholder: t("landing.composition.searchPlaceholder"),
            },
          },
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "accent" },
          children: t("landing.composition.searchAction"),
        },
      ],
    },
    {
      contract: "select",
      signature: "Select",
      options: { name: "plan", value: "starter" },
      slots: {
        label: t("landing.composition.listboxLabel"),
        items: planItems,
      },
    },
  ],
});

export const compositionComboboxTree = (t: Translate, locale: Locale): UsageTree =>
  comboboxTree(t, locale);

export const compositionFormDialogTree = (t: Translate, locale: Locale): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    comboboxTree(t, locale),
    {
      contract: "form-field",
      signature: "FormField",
      slots: { label: t("landing.composition.notesLabel") },
      children: {
        contract: "input",
        signature: "Textarea",
        options: {
          name: "notes",
          placeholder: t("landing.composition.notesPlaceholder"),
        },
      },
    },
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm" },
      children: [
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "accent" },
          attrs: { "data-landing-dialog-open": "" },
          children: t("landing.composition.openDialog"),
        },
        {
          contract: "dialog",
          signature: "Dialog",
          attrs: { id: "landing-compose-dialog" },
          slots: {
            title: t("landing.composition.dialogTitle"),
            children: t("landing.composition.dialogBody"),
            footer: [
              {
                contract: "button",
                signature: "Button.action",
                options: { variant: "ghost" },
                attrs: { type: "submit", value: "cancel", autofocus: "" },
                children: t("landing.composition.dialogCancel"),
              },
              {
                contract: "button",
                signature: "Button.action",
                options: { variant: "accent" },
                attrs: { type: "submit", value: "confirm" },
                children: t("landing.composition.dialogConfirm"),
              },
            ],
          },
        },
      ],
    },
  ],
});

export type CompositionStageId =
  | "input"
  | "input-button"
  | "input-button-listbox"
  | "combobox"
  | "form-dialog"
  | "full";

export const compositionStages: readonly {
  id: CompositionStageId;
  captionKey: `landing.composition.caption.${CompositionStageId}`;
  labelKey: `landing.composition.stage.${CompositionStageId}`;
}[] = [
  {
    id: "input",
    captionKey: "landing.composition.caption.input",
    labelKey: "landing.composition.stage.input",
  },
  {
    id: "input-button",
    captionKey: "landing.composition.caption.input-button",
    labelKey: "landing.composition.stage.input-button",
  },
  {
    id: "input-button-listbox",
    captionKey: "landing.composition.caption.input-button-listbox",
    labelKey: "landing.composition.stage.input-button-listbox",
  },
  {
    id: "combobox",
    captionKey: "landing.composition.caption.combobox",
    labelKey: "landing.composition.stage.combobox",
  },
  {
    id: "form-dialog",
    captionKey: "landing.composition.caption.form-dialog",
    labelKey: "landing.composition.stage.form-dialog",
  },
  {
    id: "full",
    captionKey: "landing.composition.caption.full",
    labelKey: "landing.composition.stage.full",
  },
];

export { default as landingDialogScript } from "../scripts/landing-dialog.ts?raw";
