import type { Translate } from "../../i18n";

/*
 * THE STRESS FIXTURE — four columns instead of the minimal demo's two, long content that forces
 * ellipsis in more than one column, seven levels of nesting (five with their own CSS rule in
 * `treegrid.css`, the sixth and seventh falling back to the shared "deeper than 5" ceiling), and
 * collapsed branches at more than one level at once, including one at the root. A file explorer is
 * the natural shape for this: real trees this deep exist (a component's own `types/` folder), and a
 * file's Name/Type/Size/Modified is a genuinely 4-column record, not a stretched 2-column one.
 */

export const treegridStressColumns = (t: Translate) => [
  t("demo.treegridStress.colName"),
  t("demo.treegridStress.colType"),
  t("demo.treegridStress.colSize"),
  t("demo.treegridStress.colModified"),
] as const;

export const treegridStressRows = (t: Translate) => [
  {
    value: "project-alpha",
    level: 1,
    setSize: 3,
    posInset: 1,
    expanded: true,
    cells: [t("demo.treegridStress.projectAlpha"), t("demo.treegridStress.typeFolder"), "—", t("demo.treegridStress.modified2d")],
  },
  {
    value: "src",
    level: 2,
    setSize: 3,
    posInset: 1,
    expanded: true,
    cells: [t("demo.treegridStress.src"), t("demo.treegridStress.typeFolder"), "—", t("demo.treegridStress.modified2d")],
  },
  {
    value: "components",
    level: 3,
    setSize: 2,
    posInset: 1,
    expanded: true,
    cells: [t("demo.treegridStress.components"), t("demo.treegridStress.typeFolder"), "—", t("demo.treegridStress.modified3d")],
  },
  {
    value: "button-folder",
    level: 4,
    setSize: 2,
    posInset: 1,
    expanded: true,
    cells: [t("demo.treegridStress.buttonFolder"), t("demo.treegridStress.typeFolder"), "—", t("demo.treegridStress.modified3d")],
  },
  {
    value: "button-tsx",
    level: 5,
    setSize: 2,
    posInset: 1,
    expanded: true,
    cells: [t("demo.treegridStress.buttonTsx"), t("demo.treegridStress.typeTs"), "4.2 KB", t("demo.treegridStress.modified1h")],
  },
  {
    value: "internal-types-folder",
    level: 6,
    setSize: 2,
    posInset: 1,
    expanded: true,
    cells: [
      t("demo.treegridStress.internalTypesFolder"),
      t("demo.treegridStress.typeFolder"),
      "—",
      t("demo.treegridStress.modified1h"),
    ],
  },
  {
    value: "button-props-ts",
    level: 7,
    setSize: 1,
    posInset: 1,
    cells: [t("demo.treegridStress.buttonPropsTs"), t("demo.treegridStress.typeTs"), "1.1 KB", t("demo.treegridStress.modified1h")],
  },
  {
    value: "button-test-tsx",
    level: 6,
    setSize: 2,
    posInset: 2,
    cells: [t("demo.treegridStress.buttonTestTsx"), t("demo.treegridStress.typeTest"), "2.8 KB", t("demo.treegridStress.modified5h")],
  },
  {
    value: "button-module-css",
    level: 5,
    setSize: 2,
    posInset: 2,
    cells: [t("demo.treegridStress.buttonModuleCss"), t("demo.treegridStress.typeStyle"), "900 B", t("demo.treegridStress.modified1day")],
  },
  {
    value: "modal-tsx",
    level: 4,
    setSize: 2,
    posInset: 2,
    cells: [t("demo.treegridStress.modalTsx"), t("demo.treegridStress.typeTs"), "3.5 KB", t("demo.treegridStress.modified4d")],
  },
  {
    value: "utils",
    level: 3,
    setSize: 2,
    posInset: 2,
    expanded: false,
    cells: [t("demo.treegridStress.utilsFolder"), t("demo.treegridStress.typeFolder"), "—", t("demo.treegridStress.modified1week")],
  },
  {
    value: "format-util",
    level: 4,
    setSize: 1,
    posInset: 1,
    cells: [t("demo.treegridStress.formatUtil"), t("demo.treegridStress.typeTs"), "2.1 KB", t("demo.treegridStress.modified1week")],
  },
  {
    value: "package-json",
    level: 2,
    setSize: 3,
    posInset: 2,
    cells: [t("demo.treegridStress.packageJson"), t("demo.treegridStress.typeConfig"), "1.8 KB", t("demo.treegridStress.modified2d")],
  },
  {
    value: "readme",
    level: 2,
    setSize: 3,
    posInset: 3,
    cells: [t("demo.treegridStress.readme"), t("demo.treegridStress.typeMarkdown"), "6.4 KB", t("demo.treegridStress.readmeModified")],
  },
  {
    value: "project-beta",
    level: 1,
    setSize: 3,
    posInset: 2,
    expanded: false,
    cells: [t("demo.treegridStress.projectBeta"), t("demo.treegridStress.typeFolder"), "—", t("demo.treegridStress.modified1month")],
  },
  {
    value: "index-ts",
    level: 2,
    setSize: 1,
    posInset: 1,
    cells: [t("demo.treegridStress.indexTs"), t("demo.treegridStress.typeTs"), "800 B", t("demo.treegridStress.modified1month")],
  },
  {
    value: "license",
    level: 1,
    setSize: 3,
    posInset: 3,
    cells: [t("demo.treegridStress.license"), t("demo.treegridStress.typeText"), "1.2 KB", t("demo.treegridStress.modified6months")],
  },
] as const;
