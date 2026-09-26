import { contracts } from "@skryensya/core/registry";

/*
 * What the gates treat as FLOATING: painted outside the tree it was written in, so neither DOM order
 * nor "the first box under the binding" says anything about it.
 *
 * `.sk-anchored` names every anchored box. A Window portals a box placed on the page rather than
 * against an anchor, so it wears no `.sk-anchored`; its positioner is found instead by being the
 * `positioner` part of a signature that declares `portals`. Derived from the contracts, so the next
 * portalling component needs no edit here.
 */
export const anchoredClass = "sk-anchored";

export const portalledPositioners: readonly string[] = Object.values(contracts).flatMap((contract) => {
  const parts = contract.parts as Record<string, string>;
  const portals = Object.values(contract.signatures).some((signature) => signature.portals);
  return portals && parts.positioner ? [parts.positioner] : [];
});

/** Every class that marks a floating box, for passing into a page `evaluate`. */
export const floatingClasses: readonly string[] = [anchoredClass, ...portalledPositioners];
