import type { IconData } from "./icon.js";

/*
 * Real vector geometry for the Editor toolbar, the same shape `apps/docs/src/icons.ts`'s own
 * `sparkle`/`screenFullscreen`/`play`/`pause` constants already use for a role too narrow to
 * belong in `stableIconNames`: "IconSet is complete" (icon.ts's own comment) means adding a role
 * there is an obligation for every set author, and a rich-text toolbar's bold/italic/heading/list/
 * undo glyphs are PRODUCT concepts of this one component, not roles every consumer of the design
 * system needs - the same test `icon.ts` itself draws the line with ("un concepto de PRODUCTO...
 * se pasa como `data` y es del consumidor").
 *
 * Traced from Lucide (ISC, already a real dependency of `@skryensya/icons-lucide`) at the exact
 * same 24×24/stroke-2 geometry its own generator emits, so a reader sees one consistent line-icon
 * language across the whole site rather than this component's own visual dialect. `bold`/`italic`/
 * `link` specifically are copied byte-for-byte from `packages/icons-lucide/src/generated/set.ts`,
 * which already carries this exact geometry under those names - orphaned there (present only in
 * Lucide, absent from Phosphor/Material, never added to `stableIconNames`), reused here rather
 * than re-traced. Lives in `core` (not the docs app) because both `@skryensya/react/editor` and
 * `@skryensya/vanilla/editor` need the same geometry.
 */
const ATTRS = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

export type EditorIconName =
  | "bold"
  | "italic"
  | "underline"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "list-bulleted"
  | "list-ordered"
  | "quote"
  | "code"
  | "code-block"
  | "undo"
  | "redo"
  | "link";

export const editorIcons: Readonly<Record<EditorIconName, IconData>> = {
  bold: {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />',
  },
  italic: {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" />',
  },
  underline: {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" x2="20" y1="20" y2="20" />',
  },
  "heading-1": {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="m17 12 3-2v8" />',
  },
  "heading-2": {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />',
  },
  "heading-3": {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2" /><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2" />',
  },
  "list-bulleted": {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" />',
  },
  "list-ordered": {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M11 5h10" /><path d="M11 12h10" /><path d="M11 19h10" /><path d="M4 4h1v5" /><path d="M4 9h2" /><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02" />',
  },
  quote: {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" /><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />',
  },
  code: {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" />',
  },
  "code-block": {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" /><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />',
  },
  undo: {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />',
  },
  redo: {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="m15 14 5-5-5-5" /><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />',
  },
  link: {
    viewBox: "0 0 24 24",
    attrs: ATTRS,
    body: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />',
  },
};
