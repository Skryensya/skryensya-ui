/*
 * The renderer moved into the binding it renders with (`@skryensya/react/render-tree`): the docs
 * site needs the same one, and two copies of the module map is the duplication this system argues
 * against. Re-exported here so the harness keeps reading as one place.
 */
export { renderTree, setPortalContainer } from "@skryensya/react/render-tree";
