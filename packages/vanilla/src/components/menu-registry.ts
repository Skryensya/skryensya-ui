import type { MenuApi, MenuService } from "@skryensya/core/menu";

/*
 * Parent/child linking between nested menus: a submenu finds its parent by walking up the DOM via
 * `closest()` (vanilla never portals), and this is what pairs each root with its machine. A real,
 * plain TS module — not `Menu.svelte`'s own `<script module>` block, where this used to live — for
 * two reasons:
 *
 *  1. Same as before: ONE registry per module, shared by every `Menu.svelte` instance this file
 *     mounts. Module scope on the `.svelte` side would have given each component its own private
 *     WeakMap, and a submenu would never find its parent.
 *  2. `*.svelte`'s AMBIENT module type — the one the `svelte` package itself ships, for any consumer
 *     that has not wired up `svelte-check`/the language server, which is most `tsc --noEmit` runs
 *     outside this package's own — only ever types a `.svelte` file's DEFAULT export. A `<script
 *     module>` block's named export is real at runtime (Svelte 5 compiles it into one) and invisible
 *     to that ambient type, so `import { getMenuApi } from "./Menu.svelte"` type-checked cleanly
 *     under this package's own `svelte-check`, but failed under every OTHER package's plain `tsc`
 *     that happened to resolve into `menubar.ts` — confirmed live, `apps/eval-viewer`'s own
 *     `tsc --noEmit`. A real `.ts` module has no such gap in any consumer, by construction.
 */
export type MenuInstance = { service: MenuService; getApi: () => MenuApi };

const instances = new WeakMap<HTMLElement, MenuInstance>();

export function getMenuInstance(root: HTMLElement): MenuInstance | undefined {
  return instances.get(root);
}

export function setMenuInstance(root: HTMLElement, instance: MenuInstance): void {
  instances.set(root, instance);
}

export function deleteMenuInstance(root: HTMLElement): void {
  instances.delete(root);
}

/**
 * The mounted `MenuApi` for a `[data-sk-menu]` root, for a consumer OUTSIDE this component that
 * needs to drive it imperatively. Menubar's own resolver calling `setOpen()` on the dropdown beside
 * the trigger it just moved focus to/from, the same registry this module already keeps for submenu
 * parent/child linking, just made reachable from outside `Menu.svelte`.
 */
export function getMenuApi(root: HTMLElement): MenuApi | undefined {
  return instances.get(root)?.getApi();
}
