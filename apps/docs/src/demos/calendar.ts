import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The three calendar demos, from the contract published for it.
 *
 * The authored HTML on both pages drew `<div class="sk-calendar" data-sk-calendar>` with NO label
 * while the React half passed `label="Disponibilidad"`, one demo documenting two components, which
 * is the whole reason these moved here.
 *
 * `demo.calendar.locale` is a BCP-47 tag rather than a word, and it is still a translated key: it is
 * the one option on this component that genuinely differs per language, and a Spanish page showing
 * an English month header would be the demo contradicting the page around it.
 */

/** Anchored to TODAY rather than a fixed date, so the range demo never reads as expired. */
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export const calendarTree = (t: Translate): UsageTree => ({
  contract: "calendar",
  signature: "Calendar",
  options: { locale: t("demo.calendar.locale") },
  slots: { label: t("demo.calendar.availability") },
});

export const calendarRangeTree = (t: Translate): UsageTree => ({
  contract: "calendar",
  signature: "Calendar",
  options: { locale: t("demo.calendar.locale"), selectionMode: "range" },
  slots: { label: t("demo.calendar.stay") },
});

export const calendarMinMaxTree = (t: Translate): UsageTree => {
  const today = new Date();
  const max = new Date(today);
  max.setDate(max.getDate() + 14);

  return {
    contract: "calendar",
    signature: "Calendar",
    options: {
      locale: t("demo.calendar.locale"),
      min: isoDate(today),
      max: isoDate(max),
    },
    slots: { label: t("demo.calendar.availability") },
  };
};
