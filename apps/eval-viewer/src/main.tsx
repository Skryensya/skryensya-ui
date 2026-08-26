import { createRoot } from "react-dom/client";
import { App } from "./App";
import { installLinkInterceptor } from "./router";

/*
 * KIT CSS IS BACK, deliberately reversing the earlier "NO KIT CSS HERE" decision: this app's own
 * chrome now composes real kit components (List, Table, Breadcrumb, Tabs, SegmentedControl, Badge,
 * CodePreview, Navbar, IconStateButton, Link/Text, Box, Stack/Inline, Details/DetailsGroup — see
 * pages/, AppNavbar.tsx and Preview.tsx) instead of plain hand-rolled HTML, so it needs their CSS.
 * Only `tokens.scss` plus the exact per-component sheets each `get_contract` call named as that
 * signature's `css` field are imported — not the broad "every stylesheet" list some other apps in
 * this repo use, since this app's own chrome (unlike an eval CASE, whose composition is arbitrary)
 * uses a fixed, known set of components.
 *
 * The bug this used to cause — the kit's `color-scheme: light dark` (`_base.scss`) bleeding into this
 * app's own chrome and reading as dark-mode-on-a-light-background — is now guarded the way a real
 * product page guards it: a real, user-facing light/dark/system toggle (`AppNavbar.tsx`,
 * `useColorMode.ts`), backed by `index.html`'s own PREPAINT script for the pre-JS frame, the same
 * mechanism `apps/docs`'s Base.astro uses. `app.css` no longer pins a hardcoded `color-scheme: light`
 * — the toggle owns that now. Verified live under a forced-dark browser profile with no stored
 * preference: PREPAINT applies `light dark` (system, following the OS) exactly as intended, and
 * clicking the toggle pins it.
 */
import "@skryensya/core/tokens.scss";
import "@skryensya/core/components/list.css";
import "@skryensya/core/components/table.css";
import "@skryensya/core/components/breadcrumb.css";
import "@skryensya/core/components/tabs.css";
import "@skryensya/core/components/segmented.css";
import "@skryensya/core/components/badge.css";
import "@skryensya/core/components/typography.css";
import "@skryensya/core/patterns/wrapper.css";
import "@skryensya/core/patterns/layout.css";
import "@skryensya/core/patterns/box.css";
import "@skryensya/core/components/details.css";
import "@skryensya/core/components/code-preview.css";
import "@skryensya/core/components/navbar.css";
import "@skryensya/core/components/icon-state-button.css";
/*
 * `button.css`, NOT named by `get_contract("icon-state-button")`'s own `css` field or by
 * `validate_ui`'s aggregated `css` array for a tree using it — confirmed live: without this import,
 * the toggle rendered as a real `<button>` (correct element, correct classes) but with the browser's
 * bare UA button chrome (`2px outset` border, `cursor: default`), because `.sk-button` is the class
 * `IconStateButton`'s own template borrows via `also: ["sk-button", ...]`, and a class borrowed from
 * ANOTHER contract's `also` isn't reflected in either tool's own "here's what you need" answer. Filed
 * as a real gap in `validate_ui`'s css-aggregation, not routed around silently — this import is the
 * actual fix, but the tool that was supposed to name it for me didn't.
 */
import "@skryensya/core/components/button.css";
import "./app.css";

/*
 * No `<StrictMode>`: unrelated to the CSS change above, but still true — its dev-mode double-invoke of
 * effects doesn't play well with imperative DOM/root mounts, confirmed live earlier in this app's own
 * history. Nothing here needs the extra checks enough to be worth the friction.
 */
installLinkInterceptor();
createRoot(document.getElementById("root")!).render(<App />);

/*
 * DEV ONLY, same gate and same dynamic-import shape as `apps/docs`'s `Base.astro` (its own
 * `mountDebugPanel()` call): a static import would still have to resolve for a production graph to
 * type-check, where a dynamic one inside a branch that provably never runs is dead-code-eliminated
 * entirely. This app has no production build of its own — it is Vite's `dev` command only — so the
 * branch always runs in practice, but the same guard is kept anyway rather than assuming that stays
 * true. `mountDebugPanel` is self-contained (own shadow root, own injected CSS text) — nothing here
 * needs to import its stylesheets separately, unlike every other component this app renders.
 */
if (import.meta.env.DEV) {
  const { mountDebugPanel } = await import("@skryensya/devtools");
  mountDebugPanel();
}
