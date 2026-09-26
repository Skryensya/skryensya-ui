/*
 * Generates the component catalogue's icons: one Lucide glyph per component page.
 *
 * WHY THESE ARE NOT STABLE ROLES. `stableIconNames` (core/icon.ts) holds interface roles every set has
 * to draw; "carousel" or "qr-code" name a page of this site, not a role an app reaches for, and adding
 * ~80 of them would be ~240 drawings owed by three sets. So the catalogue keeps its own table. Where a
 * stable role already says the same thing (`calendar`, `code`, `folder`…) the entry names the ROLE, and
 * the icon follows the site's set like every other role on the page.
 *
 * WHY GENERATED DATA, same reasoning as `@skryensya/icons-lucide`'s own generator: the page receives
 * IconData and zero Lucide runtime. `lucide` is resolved THROUGH `@skryensya/icons-lucide`, the set this
 * site already binds, so the geometry here is always the same Lucide release as the rest of the chrome.
 *
 *   node scripts/generate-component-icons.ts          writes src/lib/generated/component-icons.ts
 *   node scripts/generate-component-icons.ts --check  fails when that file is stale
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { stableIconNames } from "@skryensya/core/icon";

const require = createRequire(import.meta.url);
/* The package's own entry (its exports map does not publish package.json); any file inside it
 * resolves its devDependencies the same way. */
const setEntry = require.resolve("@skryensya/icons-lucide");
const lucideEntry = createRequire(setEntry).resolve("lucide");
const { icons } = (await import(pathToFileURL(lucideEntry).href)) as {
  icons: Record<string, [string, Record<string, string | number>][]>;
};

/* Page → Lucide's name, or `role:<stable role>`. The only part a human maintains. */
const MAP: Record<string, string> = {
  "/components/accordion": "ListCollapse",
  "/components/annotation": "ScanSearch",
  "/components/diagram": "Workflow",
  "/components/avatar": "CircleUserRound",
  "/components/back-to-top": "ArrowUpToLine",
  "/components/badge": "Badge",
  "/components/box": "Square",
  "/components/breadcrumb": "ChevronsRight",
  "/components/button": "MousePointerClick",
  "/components/calendar": "role:calendar",
  "/components/callout": "Megaphone",
  "/components/card": "RectangleHorizontal",
  "/components/canvas": "ZoomIn",
  "/components/carousel": "GalleryHorizontal",
  "/components/changelog": "History",
  "/components/charts": "ChartColumn",
  "/components/checkbox": "SquareCheck",
  "/components/clipboard": "ClipboardCopy",
  "/components/listbox": "ListChecks",
  "/components/code-preview": "role:code",
  "/components/color-picker": "Pipette",
  "/components/combobox": "TextSearch",
  "/components/command-palette": "role:search",
  "/components/comment-thread": "MessagesSquare",
  "/components/component-preview": "ScanEye",
  "/components/data-grid": "Grid3x3",
  "/components/date-picker": "CalendarDays",
  "/components/description-list": "ListTree",
  "/components/dialog": "AppWindow",
  "/components/drawer": "PanelRight",
  "/components/editor": "NotebookPen",
  "/components/empty-state": "Inbox",
  "/components/fade-edge": "Blend",
  "/components/feed": "Rss",
  "/components/file-upload": "role:upload",
  "/components/folder": "role:folder",
  "/components/footer": "PanelBottomDashed",
  "/components/form-field": "RectangleEllipsis",
  "/components/grid": "LayoutGrid",
  "/components/heading": "Heading",
  "/components/hero": "Presentation",
  "/components/icon": "Shapes",
  "/components/image-frame": "Image",
  "/components/sticker": "Sticker",
  "/components/lightbox": "Images",
  "/components/inline": "Columns3",
  "/components/input": "TextCursorInput",
  "/components/kbd": "Keyboard",
  "/components/layout-grid": "LayoutTemplate",
  "/components/link": "Link",
  "/components/list": "List",
  "/components/loader": "LoaderCircle",
  "/components/marquee": "MoveHorizontal",
  "/components/megamenu": "LayoutPanelTop",
  "/components/menu": "Menu",
  "/components/menubar": "SquareMenu",
  "/components/meter": "Gauge",
  "/components/navbar": "PanelTop",
  "/components/number-field": "Hash",
  "/components/pagination": "FileStack",
  "/components/placeholder": "SquareDashed",
  "/components/password-input": "KeyRound",
  "/components/popover": "MessageSquareText",
  "/components/presence": "Eye",
  "/components/process-list": "ListOrdered",
  "/components/timeline": "GitCommitVertical",
  "/components/progress": "CircleDashed",
  "/components/qr-code": "QrCode",
  "/components/quote": "Quote",
  "/components/questionnaire": "ClipboardList",
  "/components/radio-group": "CircleDot",
  /* `StarHalf` and not `Star`: the half-filled glyph is the one that says "a scale with a fraction
     on it" rather than "favourite", which is what a whole star reads as everywhere else. */
  "/components/rating": "StarHalf",
  "/components/segmented": "SquareSplitHorizontal",
  "/components/select": "ChevronsUpDown",
  "/components/separator": "Minus",
  "/components/sidebar": "PanelLeft",
  "/components/skip-link": "SkipForward",
  "/components/slider": "SlidersHorizontal",
  "/components/split-button": "SquareChevronDown",
  "/components/stack": "Rows3",
  "/components/stat": "TrendingUp",
  "/components/state-button": "ToggleLeft",
  "/components/steps": "Footprints",
  "/components/switch": "ToggleRight",
  "/components/table": "Table",
  "/components/tags-input": "Tags",
  "/components/tabs": "PanelsTopLeft",
  "/components/tag": "Tag",
  "/components/text": "Type",
  "/components/tile": "SquareMousePointer",
  "/components/time-field": "role:clock",
  "/components/toast": "BellRing",
  "/components/toc": "TableOfContents",
  "/components/toolbar": "Dock",
  "/components/tooltip": "BadgeInfo",
  "/components/tour": "Signpost",
  "/components/tree-view": "ListTree",
  "/components/treegrid": "FolderTree",
  "/components/window": "AppWindowMac",
  "/components/wrapper": "Frame",
  "/hotkey": "Command",
  "/nav-list": "role:menu",
  "/scrollbar": "ArrowDownUp",
  "/vaul": "PanelBottom",
};

const toBody = (nodes: [string, Record<string, string | number>][]) =>
  nodes
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")} />`)
    .join("");

const entries = Object.entries(MAP).map(([href, source]) => {
  if (source.startsWith("role:")) {
    const role = source.slice(5);
    /* Checked for the same reason the Lucide branch is: an invented role emits a string the icon
       union does not contain, and the only place that failed was `astro check`, one build later. */
    if (!(stableIconNames as readonly string[]).includes(role)) {
      throw new Error(`"${role}" is not a stable icon role (for ${href}); name a Lucide glyph instead.`);
    }
    return `  ${JSON.stringify(href)}: ${JSON.stringify(role)},`;
  }
  const nodes = icons[source];
  if (!nodes) throw new Error(`Lucide has no "${source}" (for ${href}); was it renamed in an upgrade?`);
  const body = JSON.stringify(toBody(nodes));
  return `  ${JSON.stringify(href)}: { viewBox: "0 0 24 24", attrs: ATTRS, body: ${body} },`;
});

const output = `/*
 * GENERATED by scripts/generate-component-icons.ts, do not edit by hand.
 *
 * Lucide geometry (ISC), redistributed under its license. A string entry is a stable icon role.
 */
import type { IconData, StableIconName } from "@skryensya/core/icon";

const ATTRS = {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"} as const;

export const componentIcons: Readonly<Record<string, IconData | StableIconName>> = {
${entries.join("\n")}
};
`;

const target = resolve(import.meta.dirname, "../src/lib/generated/component-icons.ts");

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(target, "utf8");
  } catch {}
  if (current !== output) {
    console.error("component-icons.ts is stale: run node scripts/generate-component-icons.ts");
    process.exit(1);
  }
} else {
  writeFileSync(target, output);
  console.log(`component-icons.ts: ${entries.length} entries`);
}
