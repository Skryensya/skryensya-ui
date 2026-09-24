import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type UIKey = Parameters<Translate>[0];

const tag = (t: Translate, key: UIKey) => ({ slots: { label: t(key) } });

/** The field, the list inside it, one chip, and the entry that shares the row with them. */
export const tagsInputAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("tagsInputPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "tags-input",
      signature: "TagsInput",
      options: {
        label: t("demo.tagsInput.label"),
        placeholder: t("demo.tagsInput.placeholder"),
        removeLabel: t("demo.tagsInput.removeLabel"),
        name: "topics",
      },
      slots: { items: [tag(t, "demo.tagsInput.tag.react"), tag(t, "demo.tagsInput.tag.svelte")] },
    },
    items: [
      namePart(".sk-tags-input", "block-start", { mark: "bracket" }),
      namePart(".sk-tags-input__control", "inline-start"),
      namePart(".sk-tags-input__item-preview", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-tags-input__input", "inline-end", { ringPlacement: "offset", ringDistance: 4 }),
    ],
  },
});

/*
 * THE CASE THE COMPONENT WAS BUILT FOR: a few topics somebody types for themselves. The tags are
 * written as markup, which is why they are already there with the JavaScript turned off.
 */
export const tagsInputTree = (t: Translate): UsageTree => ({
  contract: "tags-input",
  signature: "TagsInput",
  options: {
    label: t("demo.tagsInput.label"),
    placeholder: t("demo.tagsInput.placeholder"),
    removeLabel: t("demo.tagsInput.removeLabel"),
    name: "topics",
  },
  slots: { items: [tag(t, "demo.tagsInput.tag.react"), tag(t, "demo.tagsInput.tag.svelte")] },
});

/** Empty, with nothing but the placeholder: the shape a form starts in. */
export const tagsInputEmptyTree = (t: Translate): UsageTree => ({
  contract: "tags-input",
  signature: "TagsInput",
  options: {
    label: t("demo.tagsInput.emailsLabel"),
    placeholder: t("demo.tagsInput.emailsPlaceholder"),
    removeLabel: t("demo.tagsInput.removeLabel"),
    delimiter: ",",
    name: "recipients",
  },
  slots: { items: [] },
});

/** Three at most. Past it a new tag is refused in silence and the text stays in the entry. */
export const tagsInputMaxTree = (t: Translate): UsageTree => ({
  contract: "tags-input",
  signature: "TagsInput",
  options: {
    label: t("demo.tagsInput.maxLabel"),
    placeholder: t("demo.tagsInput.maxPlaceholder"),
    removeLabel: t("demo.tagsInput.removeLabel"),
    max: 3,
    name: "skills",
  },
  slots: {
    items: [tag(t, "demo.tagsInput.tag.css"), tag(t, "demo.tagsInput.tag.a11y")],
  },
});

/** Read-only: the tags are still read, and the delete controls go with the interaction. */
export const tagsInputReadOnlyTree = (t: Translate): UsageTree => ({
  contract: "tags-input",
  signature: "TagsInput",
  options: {
    label: t("demo.tagsInput.readOnlyLabel"),
    removeLabel: t("demo.tagsInput.removeLabel"),
    readOnly: true,
    name: "locked",
  },
  slots: { items: [tag(t, "demo.tagsInput.tag.react"), tag(t, "demo.tagsInput.tag.css")] },
});

/** In a FormField, which is where a field belongs: label, hint and error are its job, not this one's. */
export const tagsInputFieldTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: {
    label: t("demo.tagsInput.fieldLabel"),
    hint: t("demo.tagsInput.fieldHint"),
    children: {
      contract: "tags-input",
      signature: "TagsInput",
      options: {
        label: t("demo.tagsInput.fieldLabel"),
        placeholder: t("demo.tagsInput.placeholder"),
        removeLabel: t("demo.tagsInput.removeLabel"),
        name: "interests",
      },
      slots: { items: [tag(t, "demo.tagsInput.tag.a11y")] },
    },
  },
});
