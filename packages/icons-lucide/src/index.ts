/*
 * Lucide bound to the stable vocabulary; an icon set is a brand (decision 15).
 *
 * The system names the role (`chevron-down`); this package says which drawing occupies it, just like
 * the root configuration says which hue occupies `--palette-blue-600`. Changing sets does not move a
 * single call site: that is portability, working.
 *
 * It lives outside @skryensya/core for two reasons that were already decided: core names no tenants
 * (decision 2), and its dependencies are empty. Here Lucide is a devDependency, the geometry was
 * generated at build time, so your bundle receives 32 icons of data and zero library runtime.
 */
import type { IconSet } from "@skryensya/core/icon";
import { generated } from "./generated/set.js";

/** The complete set. `satisfies IconSet` proves it covers the whole vocabulary. */
export const lucideIcons: IconSet = generated satisfies IconSet;
