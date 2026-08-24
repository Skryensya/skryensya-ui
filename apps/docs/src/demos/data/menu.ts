import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * THE ROWS OF EVERY MENU DEMO, kept out of the compositions that use them.
 *
 * A menu's entries are data. The same data the emitted React snippet now writes to `menu-items.ts`
 * rather than into the tag, and a tree with fifteen of them inline says almost nothing about the
 * composition it is supposed to be showing. Split, `menu.ts` reads as "a Menu with a trigger and
 * these items", which is the whole subject of the page, and the entries stay legible here as a list.
 *
 * A function of `t` and not a constant: every label is a translation, so the list only exists once a
 * locale has been chosen.
 */

/**
 * File actions: a plain command, a checkbox that shows its state, and a submenu.
 *
 * The submenu is the point: it is a whole Menu standing where an item would, and in the data that is
 * just an entry whose `children` are entries. Format names stay written: PDF and CSV read the same
 * in every language.
 */
export const menuItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "rename" }, slots: { label: t("demo.menu.rename") } },
  {
    options: { value: "favorite", kind: "checkbox" },
    slots: { label: t("demo.menu.favorite") },
  },
  {
    options: { value: "export" },
    slots: {
      label: t("demo.menu.export"),
      children: [
        { options: { value: "pdf" }, slots: { label: "PDF" } },
        { options: { value: "csv" }, slots: { label: "CSV" } },
      ],
    },
  },
];

/**
 * Three levels deep on purpose, not two: the contract's own claim is "submenus that nest without
 * limit" (menu.ts), and the list above stops at two, which reads exactly like a special case rather
 * than a recursion. Insertar > Medios > Imagen is the same `children` slot pointing at itself a
 * second time, nothing new to author.
 */
export const menuMultilevelItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "heading" }, slots: { label: t("demo.menu.multilevel.heading") } },
  {
    options: { value: "media" },
    slots: {
      label: t("demo.menu.multilevel.media"),
      children: [
        {
          options: { value: "image" },
          slots: {
            label: t("demo.menu.multilevel.image"),
            children: [
              { options: { value: "upload" }, slots: { label: t("demo.menu.multilevel.upload") } },
              { options: { value: "from-url" }, slots: { label: t("demo.menu.multilevel.fromUrl") } },
            ],
          },
        },
        { options: { value: "video" }, slots: { label: t("demo.menu.multilevel.video") } },
      ],
    },
  },
  { options: { value: "table" }, slots: { label: t("demo.menu.multilevel.table") } },
];

/**
 * A text editor's Format menu: enough rows that a comfortable 44px each would push the panel well
 * past a single glance, which is what the compact density in the composition is answering.
 */
export const menuCompactItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "bold" }, slots: { label: t("demo.menu.compact.bold") } },
  { options: { value: "italic" }, slots: { label: t("demo.menu.compact.italic") } },
  { options: { value: "underline" }, slots: { label: t("demo.menu.compact.underline") } },
  { options: { value: "strikethrough" }, slots: { label: t("demo.menu.compact.strikethrough") } },
  {
    options: { value: "align-left", kind: "radio", group: "align" },
    slots: { label: t("demo.menu.compact.alignLeft") },
  },
  {
    options: { value: "align-center", kind: "radio", group: "align" },
    slots: { label: t("demo.menu.compact.alignCenter") },
  },
  {
    options: { value: "align-right", kind: "radio", group: "align" },
    slots: { label: t("demo.menu.compact.alignRight") },
  },
];

/**
 * A sibling directly ABOVE and another directly BELOW "Compartir", so a natural diagonal move from
 * either one toward the submenu that opens beside it actually crosses the other one's row. The
 * arrangement IS the demo: with the submenu last, nothing would ever be crossed on the way to it and
 * the safety triangle would have nothing to protect.
 *
 * The same rule applies to EACH of "Compartir"'s own two triggers, not only to "Compartir" itself:
 * "Por correo" sits second and "Exportar como PDF" sits fourth, never first, so opening either one
 * still means crossing at least one sibling row on the way in. The case the safety area exists for.
 * Two independent triggers at this level, not one nested three deep, is deliberate: the corridor the
 * safety area protects is between whichever ROW is open and the panel beside it, and that shape does
 * not change by chaining more levels under a single item, only by giving the level another one to
 * hold open at the same time.
 */
export const menuSafetyItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "new" }, slots: { label: t("demo.menu.safety.new") } },
  {
    options: { value: "share" },
    slots: {
      label: t("demo.menu.safety.share"),
      children: [
        { options: { value: "link" }, slots: { label: t("demo.menu.safety.link") } },
        {
          options: { value: "email" },
          slots: {
            label: t("demo.menu.safety.email"),
            children: [
              { options: { value: "outlook" }, slots: { label: t("demo.menu.safety.emailOutlook") } },
              { options: { value: "gmail" }, slots: { label: t("demo.menu.safety.emailGmail") } },
              { options: { value: "apple" }, slots: { label: t("demo.menu.safety.emailApple") } },
              { options: { value: "yahoo" }, slots: { label: t("demo.menu.safety.emailYahoo") } },
            ],
          },
        },
        { options: { value: "print" }, slots: { label: t("demo.menu.safety.print") } },
        {
          options: { value: "pdf" },
          slots: {
            label: t("demo.menu.safety.pdf"),
            children: [
              { options: { value: "pdf-highres" }, slots: { label: t("demo.menu.safety.pdfHighRes") } },
              { options: { value: "pdf-compressed" }, slots: { label: t("demo.menu.safety.pdfCompressed") } },
            ],
          },
        },
      ],
    },
  },
  { options: { value: "delete" }, slots: { label: t("demo.menu.safety.delete") } },
];
