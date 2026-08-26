/*
 * The kit's CSS, compiled to plain text, for injection into the PREVIEW IFRAME's own document — and
 * ONLY there. It must never land in this app's own `main.tsx`/`app.css`: `_base.scss`'s
 * `color-scheme: light dark` arms `light-dark()` to follow the OS, and confirmed live, this app's
 * OWN chrome (plain buttons, tables — nothing that sets its own explicit color/background) picked up
 * the browser's native dark-mode widget styling the moment the kit's CSS was loaded into the same
 * document, while `app.css`'s hardcoded light backgrounds stayed put. "Everything reads as dark mode
 * on a light background" was that collision, not a kit bug. Isolating the kit's CSS to the iframe
 * (which pins `color-scheme: light` itself, see `document.ts`) removes the collision at its source
 * instead of patching around it with more specificity in `app.css`.
 *
 * `?inline` (not `?url`): the frame is an iframe `srcDoc` string, not a page Vite serves — nothing
 * fetches a stylesheet URL from there in dev the way a normal document would, so the compiled CSS
 * TEXT is embedded directly as one `<style>` block. `tokens.scss` is one file (its own `@use`
 * pulls in primitives + semantic, compiled to one output); `components/*.css` and `patterns/*.css`
 * are globbed broad and unconditional, the same call this repo already made for `packages/ai-gates`'s
 * stage and this app's own now-removed `main.tsx` import list: an eval's composed tree can reach any
 * published contract, and hand-picking which stylesheets to ship is exactly how `dialog.css` went
 * missing here once already.
 */
import tokensCss from "../../../../packages/core/css/tokens.scss?inline";

const componentCss = import.meta.glob<string>("../../../../packages/core/css/components/*.css", {
  eager: true,
  query: "?inline",
  import: "default",
});

const patternCss = import.meta.glob<string>("../../../../packages/core/css/patterns/*.css", {
  eager: true,
  query: "?inline",
  import: "default",
});

export const kitCss = [tokensCss, ...Object.values(componentCss), ...Object.values(patternCss)].join(
  "\n",
);
