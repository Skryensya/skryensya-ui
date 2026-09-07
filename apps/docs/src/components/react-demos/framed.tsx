/*
 * Put a React demo in the same isolated realm the Vanilla one already gets.
 *
 * A `client:visible` island renders into the DOCS document: it inherits the page's cascade, its top
 * layer, its viewport and its `<html>`. That makes the React binding a weaker demo than the Vanilla
 * one beside it: it reflows with the docs column instead of the stage, cannot honour a screen
 * preset, and its dialogs open against the reader's viewport. Worse, it is a different answer to
 * the same question: the two bindings are supposed to be the SAME component seen twice.
 *
 * ISOLATION IS A JS-REALM PROPERTY, NOT A DOM ONE: this is the whole design, and two cheaper
 * versions of it were built first and both failed:
 *
 *  1. `createPortal` into the frame's body. React attaches listeners once to its ROOT's container,
 *     not per element, and a portal moves the painted nodes but NOT that container. A native click
 *     inside the frame bubbles to the FRAME's document and stops; it never reaches the only
 *     listener, which sits in the docs document. The demo renders perfectly and is completely dead.
 *  2. `createRoot` on the frame's body, called from the parent. Events work (the container is now
 *     inside the frame), but the component's CODE still executes in the parent's realm, where the
 *     `document` global is the DOCS document. `ThemeToggle` does `applyColorMode(document
 *     .documentElement, …)`, so clicking the toggle inside a preview re-themed the whole docs site.
 *     Every component that touches `document` (menu's `dir`, for one) leaks the same way.
 *
 * So the demo is imported and mounted BY THE FRAME, from inside it: the frame's own module graph,
 * its own React instance, its own `document`. That is what Vanilla has always done, and it is why
 * only this version is actually isolated rather than isolated-looking.
 *
 * The island's only remaining job is to render the iframe and tell it which demo to load. It names
 * that demo by MODULE + EXPORT rather than by passing the function across: a function passed into
 * another realm still closes over the parent's React and would put us back at (2).
 */
import { componentPreviewParts } from "@skryensya/core/component-preview";
import type { ComponentType } from "react";
import { buildPreviewFrameDocument } from "../../lib/preview-frame";

export interface FramedOptions {
  /** No stage padding: some components ARE a layout and must reach the edges. */
  flush?: boolean;
  /** Let the frame scroll instead of growing to its content. */
  scroll?: boolean;
  /** Reserve stage height for demos that paint out of flow, same values as `ComponentPreview`'s prop. */
  viewport?: "auto" | "menu" | "overlay" | "menu-deep";
  /** Floors the stage's own box from the parent document, same as `ComponentPreview`'s prop. */
  minHeight?: string;
  /** Frame title, for the accessibility tree. Defaults to the wrapped component's name. */
  label?: string;
  /**
   * App CSS the demo needs beyond the system's own stylesheet, same job as `ComponentPreview`'s
   * `css` prop and injected the same way (a `<style>` in the frame's own `<head>`, see
   * `buildPreviewFrameDocument`). A demo whose Vanilla binding gets custom CSS and whose React one
   * does not is two different demos wearing the same label; passing the SAME string both places
   * (see `demos/menu.ts`'s `menuContextCss`) is what keeps them one demo painted twice.
   */
  css?: string;
}

/** Per-call overrides for shared demo wrappers such as the usage-tree renderer. */
export type FramedOverrides = Pick<
  FramedOptions,
  "flush" | "scroll" | "viewport" | "minHeight" | "css"
> & {
  /**
   * App-only script shared by both tree-rendered bindings, already COMPILED to JavaScript.
   *
   * Not the authored source: this runs in the island, and the frame runs it through `Function`, so
   * there is no compiler anywhere on this path. A caller passing raw `demos/scripts/*.ts` gets a
   * `SyntaxError` at frame init that takes the whole stage down with it. `ComponentPreview.astro`
   * compiles it (`compileDemoScript`) before handing it over, which is also where the Vanilla
   * stage's copy comes from, so both bindings run the same text.
   */
  script?: string;
};

/**
 * The demo file's basename, as the frame's glob map keys it.
 *
 * This used to derive the name from `import.meta.url`. That works in dev, where the URL is the
 * source file, but production can inline a demo into the importing Astro page chunk. The frame then
 * receives `CardPage_HASH` instead of `card`, misses the glob key, and the iframe finishes booting
 * with an empty body. Passing the source basename explicitly keeps the frame resolver stable.
 */
function moduleKey(moduleUrl: string): string {
  const path = moduleUrl.split("?")[0] ?? moduleUrl;
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.[^.]+$/, "");
}

/**
 * Bind `framed` to the file calling it: `const framed = framedIn("button")`.
 *
 * One line per demo file rather than an argument on each of the page call sites, and (the reason it
 * is shaped this way at all) the PAGES never change. A page still writes `<ButtonBasicDemo
 * client:visible />`, so isolation is a property of the demo itself, not something every call site
 * has to remember to ask for.
 *
 * The argument is the source file basename used by `component-preview-frame.ts`'s Vite glob map.
 * It is intentionally not derived from the built chunk URL; chunks are an optimizer detail.
 */
export function framedIn(moduleName: string) {
  const module = moduleKey(moduleName);

  return function framed<P extends object>(
    Component: ComponentType<P>,
    options: FramedOptions = {},
  ): ComponentType<P> {
    const name = Component.displayName ?? Component.name;
    const title = options.label ?? name ?? "React";

    function Framed(props: P) {
      /*
       * Props are serialised into the frame as JSON. These demos take only plain data (`lang`), by
       * the same rule that already governs them: nothing that cannot cross the Astro boundary for
       * `client:visible`. A function prop could not have been authored here in the first place.
       *
       * `measure` and `frameOptions` are RESERVED props: they belong to the frame, not to the demo.
       * Most wrappers bake their frame settings in at definition time. Shared wrappers such as
       * `TreeDemo` serve many call sites, so their page supplies per-call overrides instead.
       */
      const { frameOptions, measure, ...demoProps } = props as P & {
        frameOptions?: FramedOverrides;
        measure?: string;
      };
      const flush = frameOptions?.flush ?? options.flush;
      const scroll = frameOptions?.scroll ?? options.scroll;
      const viewport = frameOptions?.viewport ?? options.viewport;
      const minHeight = frameOptions?.minHeight ?? options.minHeight;
      const css = frameOptions?.css ?? options.css;
      const encodedScript = frameOptions?.script
        ? encodeURIComponent(frameOptions.script)
        : undefined;

      const srcDoc = buildPreviewFrameDocument({
        body: "",
        css,
        flush,
        scroll,
        measure,
        encodedScript,
        reactDemo: { module, export: name, props: demoProps },
      });

      /*
       * Still an eager `srcDoc` prop, unlike the Vanilla stage's own — a deferred version (author
       * into {@link componentPreviewAttrs.doc}, promote on `client:visible`'s own hydration) was
       * tried and reverted: `/f/{page}/{n}` (the fullscreen route) reconstructs a preview from this
       * page's own STATIC html, and it only ever copies `<script src="…">` tags into that
       * reconstruction (`jsSrcs`, built from `script[type="module"]` elements with a `src`) — never
       * inline ones. Astro's `client:visible` hydration bootstrap for an island IS an inline
       * `<script>` (the `astro-island` custom element definition, no `src` to match), so it never
       * makes it into that reconstruction and this component never hydrates there. Before, that did
       * not matter: the fully-populated `srcDoc` was already in the static markup the fullscreen
       * shell fetches, so the demo showed up with zero hydration needed. Deferring it made every
       * React-bound "Pantalla completa" spin forever instead — confirmed live, not theoretical.
       */

      /*
       * No `data-sk-component-preview-binding` here: the wrapping `.sk-component-preview__react-stage`
       * div already carries it for `ComponentPreview.astro`'s toggle script, which does
       * `querySelectorAll("[data-sk-component-preview-binding]")` and sets `.hidden` on every match
       * before React hydrates. Putting the same attribute on THIS element (the React island's own
       * root) made that script match it too, so the live DOM gained a `hidden` this component never
       * renders, and React's hydration diffed against it and warned. No CSS rule needs it here either:
       * every selector for this attribute is `.sk-component-preview > […]`, which the nested iframe
       * fails by structure.
       */
      /*
       * `suppressHydrationWarning`, because this element has TWO writers and React is not the one
       * that owns its runtime state. It is a `.sk-component-preview__stage`, so the site-wide
       * enhancer (`connectStageLifecycle`, `@skryensya/vanilla/component-preview`) claims it like
       * any other stage and writes on it as the frame boots: `data-sk-component-preview-frame-ready`,
       * `aria-busy` flipped to `false`, the measured `style="height:…"` from `fitFrame`, and the
       * reader's `data-sk-component-preview-screen` preset. All of that lands BEFORE `client:visible`
       * hydrates the island, so React arrives at a DOM that legitimately no longer matches what it
       * rendered, diffs it, and warns (measured on this page: `aria-busy` true vs false, plus three
       * attributes React never rendered at all).
       *
       * Suppressing is the correct answer rather than a silenced smell, and it is the opposite of
       * the fix the note above describes: there, the island had ACQUIRED an attribute it should
       * never have carried, and removing it made React and the DOM agree again. Here the attributes
       * belong to the enhancer by design - a stage that reports its own readiness and height is the
       * whole contract between the two layers - so the honest move is to tell React it does not own
       * them. It only ever covers this element's own attributes, so a real mismatch in the demo
       * inside the frame is still reported.
       *
       * The alternative (teach the enhancer to skip stages inside islands) would leave the React
       * binding without the auto-fit, the readiness flag and the screen presets the Vanilla one
       * gets, which is precisely the symmetry ComponentPreview exists to keep.
       */
      return (
        <iframe
          className={componentPreviewParts.stage}
          data-sk-component-preview-flush={flush ? "" : undefined}
          data-sk-component-preview-viewport={
            viewport && viewport !== "auto" ? viewport : undefined
          }
          data-sk-component-preview-scroll={scroll ? "" : undefined}
          data-sk-component-preview-min-height={minHeight ? "" : undefined}
          aria-busy="true"
          srcDoc={srcDoc}
          title={`Preview renderizado (React): ${title}`}
          loading="lazy"
          allow="clipboard-write"
          suppressHydrationWarning
        />
      );
    }

    /*
     * The unwrapped component, hung off the wrapper.
     *
     * The frame imports the demo module by its EXPORT name, and that export is this wrapper, so
     * without a way back to the original, the frame rendered another `framed()` and nested a
     * preview inside the preview, forever. The frame reads this property instead.
     *
     * It resolves in the frame's own realm: the frame loads its own copy of the demo module, so
     * the `Component` it finds here is the frame's instance, closing over the frame's React.
     */
    Framed.displayName = `framed(${title})`;
    Framed.demoComponent = Component;
    return Framed;
  };
}

/** The wrapper shape the frame runtime unwraps. */
export interface FramedComponent {
  demoComponent?: unknown;
}
