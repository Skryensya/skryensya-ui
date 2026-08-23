/*
 * PUBLIC ENTRY. Nothing in `packages/core`, `packages/react` or `packages/vanilla` imports this
 * package — it exists to be imported the other way, by hand, from wherever a consumer is debugging.
 * See `panel.ts` for the isolation story (Shadow DOM, `all: initial`) and `overlay.ts` for why the
 * hit-area check is a plain stylesheet rule rather than a JS-measured, JS-positioned one.
 */
export { mountDebugPanel } from "./panel";
export type { DebugPanelHandle, DebugPanelOptions } from "./panel";
