import type { UsageTree } from "@skryensya/core/usage-tree";
import { kitCss } from "./kit-css";
// `?worker&url`: a self-contained ESM bundle with a stable URL, loadable from an iframe `srcdoc` —
// see the vite.config.ts doc on `worker.plugins` for why this needs its own plugin pipeline.
import frameEntryUrl from "./entry.tsx?worker&url";

export interface FrameOptions {
  binding: "vanilla" | "react";
  vanillaHtml?: string;
  tree?: UsageTree;
}

/** Escapes `</script>` so an embedded JSON payload can't terminate the tag early. */
function escapeForInlineScript(json: string): string {
  return json.replaceAll("</", "<\\/");
}

/*
 * DEV ONLY: the two lines `@vitejs/plugin-react`'s `transformIndexHtml` hook injects into every
 * OTHER page it serves, supplied by hand here because this `srcDoc` never goes through that hook.
 * Fast Refresh's own injected runtime (in every `.tsx` module `entry.tsx` transitively imports —
 * `@skryensya/react/render-tree` and every component it renders) checks for exactly this bootstrap
 * before running, and throws "can't detect preamble" without it — confirmed live: `worker.plugins`
 * (production-only) and `react({ exclude })` (didn't hold across the plugin's two JSX code paths)
 * both looked like fixes and weren't; this is what Vite's own docs give for any non-standard HTML
 * entry, not a workaround specific to this app. Absent from a production build: no dev server, no
 * `@react-refresh` module to import, and the built bundle never references these globals to begin
 * with (`babel-plugin-react-refresh` only runs in dev).
 */
function reactRefreshPreamble(): string {
  if (!import.meta.env.DEV) return "";
  return `<script type="module">
      import RefreshRuntime from "${window.location.origin}/@react-refresh";
      RefreshRuntime.injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {};
      window.$RefreshSig$ = () => (type) => type;
      window.__vite_plugin_react_preamble_installed__ = true;
    </script>`;
}

/**
 * The preview iframe's ENTIRE document: the kit's CSS (see `kit-css.ts` for why it lives only here)
 * and the entry script that mounts whichever binding this call is for. `color-scheme` and the
 * devtools attributes are NOT baked in here any more — `entry.tsx`'s own `syncRootState()` mirrors
 * them live off the PARENT document's `<html>` the instant this frame boots, and keeps mirroring on
 * every change (a `MutationObserver`, not a fresh `srcDoc`), so toggling the app's theme no longer
 * has to re-navigate every open preview to take effect. Reversed from an earlier decision to
 * compute `color-scheme` once here (as a `colorMode` option to this function) and rebuild the whole
 * `srcDoc` string on every toggle: that worked, but duplicated exactly the mirroring mechanism
 * `apps/docs`'s own `component-preview-frame.ts` already solved once for this exact "an iframe needs
 * to track its parent's live state" problem — see `entry.tsx` for the shared version.
 *
 * `body { font-family: var(--font-family-body); background: var(--color-bg-canvas); }` is set HERE,
 * explicitly, not left implicit: the kit ships those tokens (`tokens.scss`) but never applies them to
 * `body` itself — that's a real consumer's own base stylesheet's job. Confirmed live: without the
 * font, the iframe's bare `body` fell back to the BROWSER's default serif; without the background, it
 * painted plain white regardless of `color-scheme`, so a dark-mode preview showed the kit's own
 * DARK-toned components sitting on a stark white page — `--color-bg-canvas` is `light-dark(stone-100,
 * stone-950)` (`semantic/_color.scss`), so once `color-scheme` is actually synced (see above) this
 * follows it instead of staying pinned to whichever mode happened to be current at first paint.
 *
 * NO BODY PADDING, reversed from an earlier `1rem` compromise that read as fixing "a full-bleed
 * Grid touches the frame's own border" (`article-card-in-grid`) — it did, but at the cost of doing
 * the same thing to EVERY composition indiscriminately, including one that starts with a `Navbar`.
 * A navbar is landmark chrome: it is SUPPOSED to reach the true edge, and 1rem of body padding
 * quietly made that impossible — confirmed live, `personal-landing-page`'s navbar sat inset with a
 * band of bare canvas around it on all sides, reading as "the navbar has its own container" when
 * nothing about `.sk-navbar` itself does (`border-radius: 0`, confirmed via computed style). A real
 * page never pads `<body>` directly either: `Wrapper`'s own `padding-inline` and now `Hero`'s own
 * `padding` are what actually give a composition its breathing room, each exactly where it belongs.
 * A bare, wrapper-less full-bleed Grid touching this frame's edge is back as a known, accepted edge
 * case for a narrow eval case's own preview — not the general shape a real page composes in.
 */
export function buildFrameDocument(options: FrameOptions): string {
  const payload = escapeForInlineScript(
    JSON.stringify({
      binding: options.binding,
      vanillaHtml: options.vanillaHtml,
      tree: options.tree,
    }),
  );

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${kitCss}
      body { margin: 0; font-family: var(--font-family-body); background: var(--color-bg-canvas); }
    </style>
    ${reactRefreshPreamble()}
  </head>
  <body>
    <div id="stage"></div>
    <script type="application/json" id="frame-data">${payload}</script>
    <script type="module" src="${frameEntryUrl}"></script>
  </body>
</html>`;
}
