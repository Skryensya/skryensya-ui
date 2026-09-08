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
import { arquitecturaMessages } from "./messages/arquitectura";
import { accordionMessages } from "./messages/componentes/accordion";
import { avatarMessages } from "./messages/componentes/avatar";
import { backToTopMessages } from "./messages/componentes/back-to-top";
import { badgeMessages } from "./messages/componentes/badge";
import { boxMessages } from "./messages/componentes/box";
import { breadcrumbMessages } from "./messages/componentes/breadcrumb";
import { buttonMessages } from "./messages/componentes/button";
import { calendarMessages } from "./messages/componentes/calendar";
import { calloutMessages } from "./messages/componentes/callout";
import { cardMessages } from "./messages/componentes/card";
import { carouselMessages } from "./messages/componentes/carousel";
import { changelogMessages } from "./messages/componentes/changelog";
import { chartsMessages } from "./messages/componentes/charts";
import { checkboxMessages } from "./messages/componentes/checkbox";
import { codePreviewMessages } from "./messages/componentes/code-preview";
import { colorPickerMessages } from "./messages/componentes/color-picker";
import { comboboxMessages } from "./messages/componentes/combobox";
import { commandPaletteMessages } from "./messages/componentes/command-palette";
import { commentThreadMessages } from "./messages/componentes/comment-thread";
import { componentPreviewMessages } from "./messages/componentes/component-preview";
import { copyButtonMessages } from "./messages/componentes/copy-button";
import { dataGridMessages } from "./messages/componentes/data-grid";
import { datePickerMessages } from "./messages/componentes/date-picker";
import { dialogMessages } from "./messages/componentes/dialog";
import { drawerMessages } from "./messages/componentes/drawer";
import { editorMessages } from "./messages/componentes/editor";
import { emptyStateMessages } from "./messages/componentes/empty-state";
import { fadeEdgeMessages } from "./messages/componentes/fade-edge";
import { feedMessages } from "./messages/componentes/feed";
import { fileUploadMessages } from "./messages/componentes/file-upload";
import { folderMessages } from "./messages/componentes/folder";
import { footerMessages } from "./messages/componentes/footer";
import { formFieldMessages } from "./messages/componentes/form-field";
import { gridMessages } from "./messages/componentes/grid";
import { headingMessages } from "./messages/componentes/heading";
import { heroMessages } from "./messages/componentes/hero";
import { iconMessages } from "./messages/componentes/icon";
import { imageFrameMessages } from "./messages/componentes/image-frame";
import { inlineMessages } from "./messages/componentes/inline";
import { inputMessages } from "./messages/componentes/input";
import { kbdMessages } from "./messages/componentes/kbd";
import { layoutGridMessages } from "./messages/componentes/layout-grid";
import { linkMessages } from "./messages/componentes/link";
import { listMessages } from "./messages/componentes/list";
import { loaderMessages } from "./messages/componentes/loader";
import { marqueeMessages } from "./messages/componentes/marquee";
import { megamenuMessages } from "./messages/componentes/megamenu";
import { menuMessages } from "./messages/componentes/menu";
import { menubarMessages } from "./messages/componentes/menubar";
import { meterMessages } from "./messages/componentes/meter";
import { navbarMessages } from "./messages/componentes/navbar";
import { numberFieldMessages } from "./messages/componentes/number-field";
import { paginationMessages } from "./messages/componentes/pagination";
import { placeholderMessages } from "./messages/componentes/placeholder";
import { popoverMessages } from "./messages/componentes/popover";
import { popupMessages } from "./messages/componentes/popup";
import { primitivasMessages } from "./messages/componentes/primitivas";
import { processListMessages } from "./messages/componentes/process-list";
import { progressMessages } from "./messages/componentes/progress";
import { radioGroupMessages } from "./messages/componentes/radio-group";
import { segmentedMessages } from "./messages/componentes/segmented";
import { selectMessages } from "./messages/componentes/select";
import { sidebarMessages } from "./messages/componentes/sidebar";
import { skipLinkMessages } from "./messages/componentes/skip-link";
import { sliderMessages } from "./messages/componentes/slider";
import { splitButtonMessages } from "./messages/componentes/split-button";
import { stackMessages } from "./messages/componentes/stack";
import { statMessages } from "./messages/componentes/stat";
import { stepsMessages } from "./messages/componentes/steps";
import { switchMessages } from "./messages/componentes/switch";
import { tableMessages } from "./messages/componentes/table";
import { tabsMessages } from "./messages/componentes/tabs";
import { tagMessages } from "./messages/componentes/tag";
import { textMessages } from "./messages/componentes/text";
import { themeToggleMessages } from "./messages/componentes/theme-toggle";
import { tileMessages } from "./messages/componentes/tile";
import { timeFieldMessages } from "./messages/componentes/time-field";
import { toastMessages } from "./messages/componentes/toast";
import { tocMessages } from "./messages/componentes/toc";
import { toolbarMessages } from "./messages/componentes/toolbar";
import { tooltipMessages } from "./messages/componentes/tooltip";
import { treeViewMessages } from "./messages/componentes/tree-view";
import { treegridMessages } from "./messages/componentes/treegrid";
import { wrapperMessages } from "./messages/componentes/wrapper";
import { fundamentosMessages } from "./messages/fundamentos";
import { gradientesMessages } from "./messages/gradientes";
import { indexMessages } from "./messages/index";
import { navListMessages } from "./messages/nav-list";
import { referenciaMessages } from "./messages/referencia";
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
    ...arquitecturaMessages.es,
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
    ...primitivasMessages.es,
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
    ...fundamentosMessages.es,
    ...gradientesMessages.es,
    ...indexMessages.es,
    ...navListMessages.es,
    ...referenciaMessages.es,
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
    ...arquitecturaMessages.en,
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
    ...primitivasMessages.en,
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
    ...fundamentosMessages.en,
    ...gradientesMessages.en,
    ...indexMessages.en,
    ...navListMessages.en,
    ...referenciaMessages.en,
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
    "/instalacion": "Installation",
    "/prerrequisitos": "Prerequisites",
    "/primer-componente": "Your first component",
    "/montaje-automatico": "Automatic mounting",
    "/arquitectura": "Architecture",
    "/referencia": "Tokens",
    "/dimensiones": "Dimensions",
    "/elevacion": "Elevation",
    "/zoom": "Zoom and reflow",
    "/teclado": "Keyboard navigation",
    "/densidad": "Component density",
    "/gradientes": "Gradients",
    "/transparencias": "Transparency",
    "/iconos": "Iconography",
    "/almacenamiento": "Storage",
    "/anclaje": "Anchoring",
    "/efectos": "Effects",
    "/componentes/date-picker": "DatePicker",
    "/componentes/calendar": "Calendar",
  },
};
