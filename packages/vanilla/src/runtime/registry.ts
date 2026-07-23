import { mountAccordion } from "../components/accordion.js";
import { mountButton } from "../components/button.js";
import { mountExpandableTile } from "../components/expandable-tile.js";
import { mountSelect } from "../components/select.js";
import { mountSegmented } from "../components/segmented.js";
import { mountSidebar } from "../components/sidebar.js";
import { mountSlider } from "../components/slider.js";
import { mountTabs } from "../components/tabs.js";
import { mountTileCheckbox } from "../components/tile-checkbox.js";
import { mountTileRadioGroup } from "../components/tile-radio-group.js";
import { mountToast } from "../components/toast.js";
import { mountVaul } from "../components/vaul.js";

/*
 * One auto-loader, the same small `mount(root?) → count` interface for every enhancer.
 *
 * Each mount also has its own entry point. This registry deliberately knows only their public mount
 * functions: adding a component here makes it eligible for `initComponents()`, never a prerequisite
 * for importing that one component by itself.
 */
type Mount = (root?: Document | Element) => number;

const mounts: readonly Mount[] = [
  mountButton,
  mountSelect,
  mountSegmented,
  mountSidebar,
  mountSlider,
  mountToast,
  mountVaul,
  mountTabs,
  mountAccordion,
  mountExpandableTile,
  mountTileCheckbox,
  mountTileRadioGroup,
];

/** Mount every supported enhancer below `root`; each mount remains idempotent. */
export function initComponents(root: Document | Element = document): number {
  let count = 0;
  for (const mount of mounts) count += mount(root);
  return count;
}
