import type { UsageTree } from "@skryensya/core/usage-tree";
import type { IconSize } from "@skryensya/core/icon";

/*
 * THE ICON AN ANATOMY SUBJECT WEARS WHEN IT IS NOT WEARING A ROLE.
 *
 * `placeholder` is a real entry in the stable vocabulary (core/icon.ts) and every set draws it as an
 * empty dashed box: Lucide `SquareDashed`, Phosphor `rectangle-dashed`, Material `select`. That
 * emptiness is the whole point here. A gear in a `BadgeHolder`, a download arrow on a Button, a
 * pencil/copy/trash row in a Toolbar all invite the reader to work out what the SPECIMEN does, which
 * is the one question an anatomy diagram is not answering. A dashed box says "an icon goes here" and
 * gets out of the way, the same way `anatomy.*`'s Latin does for the text.
 *
 * WHAT STAYS, and it is not an oversight in any of these:
 *
 *   Callout / Toast   the glyph follows `tone`; an info panel drawing a dashed box would be showing
 *                     a state the contract does not have.
 *   Stat              the arrow follows `trend="up"`, and `sk-stat__change` is one of the labelled
 *                     parts.
 *   Timeline          same, the marker's glyph is the item's tone.
 *   Sidebar           the trigger's icon is what the trigger IS.
 *   TreeView          `branchIndicator`, `branchIcon` and `leafIcon` are the slots the diagram is
 *                     naming: replacing the chevron, the folder and the file with three identical
 *                     boxes would erase the distinction the drawing exists to teach.
 *
 * The rule in one line: an icon that the reader has to READ is generic; an icon that the reader has
 * to SEE is the role, and stays.
 */
export const genericIcon = (size?: IconSize): UsageTree => ({
  contract: "icon",
  signature: "Icon",
  /*
   * `typeof size === "string"`, and not `size ? `, because of who else calls this.
   * `demos/trees.test.ts` validates every export in this directory by calling it as a `(t, href)`
   * tree factory, so this one gets handed the translate FUNCTION as its first argument. A
   * truthiness check would put that function in `size` and manufacture an invalid-option failure
   * the corpus does not have; only a real role ever reaches the option.
   */
  options: typeof size === "string" ? { name: "placeholder", size } : { name: "placeholder" },
});
