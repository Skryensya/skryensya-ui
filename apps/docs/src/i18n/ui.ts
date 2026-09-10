/*
 * EVERY TRANSLATABLE STRING IN THE SITE CHROME, in one place.
 *
 * Two dictionaries, because they are keyed by different things and drift for different reasons:
 *
 *   - `ui`      keyed by a dotted STRING KEY. The chrome's own copy: buttons, aria-labels, the
 *               command palette, the footer.
 *   - `navLabel` keyed by the item's SPANISH HREF, which is the stable identity of a page in
 *               `lib/navigation.ts`. Only pages whose label is actually a Spanish word appear here:
 *               a component's name ("Avatar", "Button", "SegmentedControl") is a proper noun and is
 *               the same string in both languages, so it falls through untranslated by DEFAULT
 *               rather than by 60 hand-copied identity entries that could rot.
 *
 * The Spanish dictionary is the source: `es` is the default locale, and every key here already
 * existed as a literal in a component. Adding a locale means adding a column, never touching the
 * markup again.
 */

import type { Locale } from "./locales";
import { actionMessages } from "./messages/_chrome/action";
import { codeMessages } from "./messages/_chrome/code";
import { componentMessages } from "./messages/_chrome/component";
import { contractMessages } from "./messages/_chrome/contract";
import { copyMessages } from "./messages/_chrome/copy";
import { groupMessages } from "./messages/_chrome/group";
import { hookPlaygroundMessages } from "./messages/_chrome/hook-playground";
import { hooksMessages } from "./messages/_chrome/hooks";
import { navMessages } from "./messages/_chrome/nav";
import { prefsMessages } from "./messages/_chrome/prefs";
import { previewMessages } from "./messages/_chrome/preview";
import { searchMessages } from "./messages/_chrome/search";
import { sectionMessages } from "./messages/_chrome/section";
import { siteFooterMessages } from "./messages/_chrome/site-footer";
import { sourceViewerMessages } from "./messages/_chrome/source-viewer";
import { statusMessages } from "./messages/_chrome/status";
import { testsMessages } from "./messages/_chrome/tests";
import { vanillaMessages } from "./messages/_chrome/vanilla";
import { architectureMessages } from "./messages/architecture";
import { accordionMessages } from "./messages/components/accordion";
import { avatarMessages } from "./messages/components/avatar";
import { backToTopMessages } from "./messages/components/back-to-top";
import { badgeMessages } from "./messages/components/badge";
import { boxMessages } from "./messages/components/box";
import { breadcrumbMessages } from "./messages/components/breadcrumb";
import { buttonMessages } from "./messages/components/button";
import { calendarMessages } from "./messages/components/calendar";
import { calloutMessages } from "./messages/components/callout";
import { cardMessages } from "./messages/components/card";
import { carouselMessages } from "./messages/components/carousel";
import { changelogMessages } from "./messages/components/changelog";
import { chartsMessages } from "./messages/components/charts";
import { checkboxMessages } from "./messages/components/checkbox";
import { codePreviewMessages } from "./messages/components/code-preview";
import { colorPickerMessages } from "./messages/components/color-picker";
import { comboboxMessages } from "./messages/components/combobox";
import { commandPaletteMessages } from "./messages/components/command-palette";
import { commentThreadMessages } from "./messages/components/comment-thread";
import { componentPreviewMessages } from "./messages/components/component-preview";
import { copyButtonMessages } from "./messages/components/copy-button";
import { dataGridMessages } from "./messages/components/data-grid";
import { datePickerMessages } from "./messages/components/date-picker";
import { dialogMessages } from "./messages/components/dialog";
import { drawerMessages } from "./messages/components/drawer";
import { editorMessages } from "./messages/components/editor";
import { emptyStateMessages } from "./messages/components/empty-state";
import { fadeEdgeMessages } from "./messages/components/fade-edge";
import { qrCodeMessages } from "./messages/components/qr-code";
import { feedMessages } from "./messages/components/feed";
import { fileUploadMessages } from "./messages/components/file-upload";
import { folderMessages } from "./messages/components/folder";
import { footerMessages } from "./messages/components/footer";
import { formFieldMessages } from "./messages/components/form-field";
import { gridMessages } from "./messages/components/grid";
import { headingMessages } from "./messages/components/heading";
import { heroMessages } from "./messages/components/hero";
import { iconMessages } from "./messages/components/icon";
import { imageFrameMessages } from "./messages/components/image-frame";
import { inlineMessages } from "./messages/components/inline";
import { inputMessages } from "./messages/components/input";
import { kbdMessages } from "./messages/components/kbd";
import { layoutGridMessages } from "./messages/components/layout-grid";
import { linkMessages } from "./messages/components/link";
import { listMessages } from "./messages/components/list";
import { loaderMessages } from "./messages/components/loader";
import { marqueeMessages } from "./messages/components/marquee";
import { megamenuMessages } from "./messages/components/megamenu";
import { menuMessages } from "./messages/components/menu";
import { menubarMessages } from "./messages/components/menubar";
import { meterMessages } from "./messages/components/meter";
import { navbarMessages } from "./messages/components/navbar";
import { numberFieldMessages } from "./messages/components/number-field";
import { paginationMessages } from "./messages/components/pagination";
import { placeholderMessages } from "./messages/components/placeholder";
import { popoverMessages } from "./messages/components/popover";
import { popupMessages } from "./messages/components/popup";
import { primitivesMessages } from "./messages/components/primitives";
import { processListMessages } from "./messages/components/process-list";
import { progressMessages } from "./messages/components/progress";
import { radioGroupMessages } from "./messages/components/radio-group";
import { segmentedMessages } from "./messages/components/segmented";
import { selectMessages } from "./messages/components/select";
import { sidebarMessages } from "./messages/components/sidebar";
import { skipLinkMessages } from "./messages/components/skip-link";
import { sliderMessages } from "./messages/components/slider";
import { splitButtonMessages } from "./messages/components/split-button";
import { stackMessages } from "./messages/components/stack";
import { statMessages } from "./messages/components/stat";
import { stepsMessages } from "./messages/components/steps";
import { switchMessages } from "./messages/components/switch";
import { tableMessages } from "./messages/components/table";
import { tabsMessages } from "./messages/components/tabs";
import { tagMessages } from "./messages/components/tag";
import { textMessages } from "./messages/components/text";
import { themeToggleMessages } from "./messages/components/theme-toggle";
import { tileMessages } from "./messages/components/tile";
import { timeFieldMessages } from "./messages/components/time-field";
import { toastMessages } from "./messages/components/toast";
import { tocMessages } from "./messages/components/toc";
import { toolbarMessages } from "./messages/components/toolbar";
import { tooltipMessages } from "./messages/components/tooltip";
import { treeViewMessages } from "./messages/components/tree-view";
import { treegridMessages } from "./messages/components/treegrid";
import { wrapperMessages } from "./messages/components/wrapper";
import { foundationsMessages } from "./messages/foundations";
import { gradientsMessages } from "./messages/gradients";
import { indexMessages } from "./messages/index";
import { navListMessages } from "./messages/nav-list";
import { referenceMessages } from "./messages/reference";
import { templatesMessages } from "./messages/templates";
import { vaulMessages } from "./messages/vaul";

export { defaultLocale, localeNames, locales, type Locale } from "./locales";

export const ui = {
  es: {
    ...actionMessages.es,
    ...codeMessages.es,
    ...componentMessages.es,
    ...contractMessages.es,
    ...copyMessages.es,
    ...groupMessages.es,
    ...hookPlaygroundMessages.es,
    ...hooksMessages.es,
    ...navMessages.es,
    ...prefsMessages.es,
    ...previewMessages.es,
    ...searchMessages.es,
    ...sectionMessages.es,
    ...siteFooterMessages.es,
    ...sourceViewerMessages.es,
    ...statusMessages.es,
    ...testsMessages.es,
    ...vanillaMessages.es,
    ...architectureMessages.es,
    ...accordionMessages.es,
    ...avatarMessages.es,
    ...backToTopMessages.es,
    ...badgeMessages.es,
    ...boxMessages.es,
    ...breadcrumbMessages.es,
    ...buttonMessages.es,
    ...calendarMessages.es,
    ...calloutMessages.es,
    ...cardMessages.es,
    ...carouselMessages.es,
    ...changelogMessages.es,
    ...chartsMessages.es,
    ...checkboxMessages.es,
    ...codePreviewMessages.es,
    ...colorPickerMessages.es,
    ...comboboxMessages.es,
    ...commandPaletteMessages.es,
    ...commentThreadMessages.es,
    ...componentPreviewMessages.es,
    ...copyButtonMessages.es,
    ...dataGridMessages.es,
    ...datePickerMessages.es,
    ...dialogMessages.es,
    ...drawerMessages.es,
    ...editorMessages.es,
    ...emptyStateMessages.es,
    ...fadeEdgeMessages.es,
    ...qrCodeMessages.es,
    ...feedMessages.es,
    ...fileUploadMessages.es,
    ...folderMessages.es,
    ...footerMessages.es,
    ...formFieldMessages.es,
    ...gridMessages.es,
    ...headingMessages.es,
    ...heroMessages.es,
    ...iconMessages.es,
    ...imageFrameMessages.es,
    ...inlineMessages.es,
    ...inputMessages.es,
    ...kbdMessages.es,
    ...layoutGridMessages.es,
    ...linkMessages.es,
    ...listMessages.es,
    ...loaderMessages.es,
    ...marqueeMessages.es,
    ...megamenuMessages.es,
    ...menuMessages.es,
    ...menubarMessages.es,
    ...meterMessages.es,
    ...navbarMessages.es,
    ...numberFieldMessages.es,
    ...paginationMessages.es,
    ...placeholderMessages.es,
    ...popoverMessages.es,
    ...popupMessages.es,
    ...primitivesMessages.es,
    ...processListMessages.es,
    ...progressMessages.es,
    ...radioGroupMessages.es,
    ...segmentedMessages.es,
    ...selectMessages.es,
    ...sidebarMessages.es,
    ...skipLinkMessages.es,
    ...sliderMessages.es,
    ...splitButtonMessages.es,
    ...stackMessages.es,
    ...statMessages.es,
    ...stepsMessages.es,
    ...switchMessages.es,
    ...tableMessages.es,
    ...tabsMessages.es,
    ...tagMessages.es,
    ...textMessages.es,
    ...themeToggleMessages.es,
    ...tileMessages.es,
    ...timeFieldMessages.es,
    ...toastMessages.es,
    ...tocMessages.es,
    ...toolbarMessages.es,
    ...tooltipMessages.es,
    ...treeViewMessages.es,
    ...treegridMessages.es,
    ...wrapperMessages.es,
    ...foundationsMessages.es,
    ...gradientsMessages.es,
    ...indexMessages.es,
    ...navListMessages.es,
    ...referenceMessages.es,
    ...templatesMessages.es,
    ...vaulMessages.es,
  },
  en: {
    ...actionMessages.en,
    ...codeMessages.en,
    ...componentMessages.en,
    ...contractMessages.en,
    ...copyMessages.en,
    ...groupMessages.en,
    ...hookPlaygroundMessages.en,
    ...hooksMessages.en,
    ...navMessages.en,
    ...prefsMessages.en,
    ...previewMessages.en,
    ...searchMessages.en,
    ...sectionMessages.en,
    ...siteFooterMessages.en,
    ...sourceViewerMessages.en,
    ...statusMessages.en,
    ...testsMessages.en,
    ...vanillaMessages.en,
    ...architectureMessages.en,
    ...accordionMessages.en,
    ...avatarMessages.en,
    ...backToTopMessages.en,
    ...badgeMessages.en,
    ...boxMessages.en,
    ...breadcrumbMessages.en,
    ...buttonMessages.en,
    ...calendarMessages.en,
    ...calloutMessages.en,
    ...cardMessages.en,
    ...carouselMessages.en,
    ...changelogMessages.en,
    ...chartsMessages.en,
    ...checkboxMessages.en,
    ...codePreviewMessages.en,
    ...colorPickerMessages.en,
    ...comboboxMessages.en,
    ...commandPaletteMessages.en,
    ...commentThreadMessages.en,
    ...componentPreviewMessages.en,
    ...copyButtonMessages.en,
    ...dataGridMessages.en,
    ...datePickerMessages.en,
    ...dialogMessages.en,
    ...drawerMessages.en,
    ...editorMessages.en,
    ...emptyStateMessages.en,
    ...fadeEdgeMessages.en,
    ...qrCodeMessages.en,
    ...feedMessages.en,
    ...fileUploadMessages.en,
    ...folderMessages.en,
    ...footerMessages.en,
    ...formFieldMessages.en,
    ...gridMessages.en,
    ...headingMessages.en,
    ...heroMessages.en,
    ...iconMessages.en,
    ...imageFrameMessages.en,
    ...inlineMessages.en,
    ...inputMessages.en,
    ...kbdMessages.en,
    ...layoutGridMessages.en,
    ...linkMessages.en,
    ...listMessages.en,
    ...loaderMessages.en,
    ...marqueeMessages.en,
    ...megamenuMessages.en,
    ...menuMessages.en,
    ...menubarMessages.en,
    ...meterMessages.en,
    ...navbarMessages.en,
    ...numberFieldMessages.en,
    ...paginationMessages.en,
    ...placeholderMessages.en,
    ...popoverMessages.en,
    ...popupMessages.en,
    ...primitivesMessages.en,
    ...processListMessages.en,
    ...progressMessages.en,
    ...radioGroupMessages.en,
    ...segmentedMessages.en,
    ...selectMessages.en,
    ...sidebarMessages.en,
    ...skipLinkMessages.en,
    ...sliderMessages.en,
    ...splitButtonMessages.en,
    ...stackMessages.en,
    ...statMessages.en,
    ...stepsMessages.en,
    ...switchMessages.en,
    ...tableMessages.en,
    ...tabsMessages.en,
    ...tagMessages.en,
    ...textMessages.en,
    ...themeToggleMessages.en,
    ...tileMessages.en,
    ...timeFieldMessages.en,
    ...toastMessages.en,
    ...tocMessages.en,
    ...toolbarMessages.en,
    ...tooltipMessages.en,
    ...treeViewMessages.en,
    ...treegridMessages.en,
    ...wrapperMessages.en,
    ...foundationsMessages.en,
    ...gradientsMessages.en,
    ...indexMessages.en,
    ...navListMessages.en,
    ...referenceMessages.en,
    ...templatesMessages.en,
    ...vaulMessages.en,
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)["es"];

/*
 * Nav labels that are Spanish PROSE, keyed by the item's Spanish href.
 *
 * Anything absent keeps the label authored in `lib/navigation.ts`, which is the right answer for the
 * ~60 component entries: "Avatar", "Combobox" and "SegmentedControl" are names, not words, and a
 * translation table full of `"Avatar": "Avatar"` is a table that will eventually disagree with itself.
 */
export const navLabel: Record<Locale, Partial<Record<string, string>>> = {
  es: {},
  en: {
    "/": "Installation",
    "/installation": "Installation",
    "/prerequisites": "Prerequisites",
    "/first-component": "Your first component",
    "/automatic-mounting": "Automatic mounting",
    "/architecture": "Architecture",
    "/reference": "Tokens",
    "/dimensions": "Dimensions",
    "/elevation": "Elevation",
    "/zoom": "Zoom and reflow",
    "/keyboard": "Keyboard navigation",
    "/density": "Component density",
    "/gradients": "Gradients",
    "/transparency": "Transparency",
    "/icons": "Iconography",
    "/storage": "Storage",
    "/anchoring": "Anchoring",
    "/effects": "Effects",
    "/components/date-picker": "DatePicker",
    "/components/calendar": "Calendar",
  },
};
