import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Locale, Translate } from "../i18n";
import { countries, slug } from "./countries";

/*
 * One combobox over the whole country list, from the contract published for it.
 *
 * The list is filtered client-side by both bindings, so "every country" costs no more markup logic
 * than the four rows this demo used to ship — only more entries. That is the point of the demo: a
 * combobox earns its place exactly when the list is too long to scan.
 *
 * The names come from `./countries` rather than from `demo.*` keys: 194 keys pairing two proper
 * nouns would be a dictionary pretending to be a translation table.
 */
export const comboboxTree = (t: Translate, locale: Locale): UsageTree => ({
  contract: "combobox",
  signature: "Combobox",
  options: { name: "country", placeholder: t("demo.combobox.placeholder") },
  slots: {
    label: t("demo.combobox.label"),
    hint: t("demo.combobox.hint"),
    items: countries[locale].map((name) => ({
      options: { value: slug(name) },
      slots: { label: name },
    })),
  },
});
