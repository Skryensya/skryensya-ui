/*
 * Put a React demo in the same isolated realm the Vanilla one already gets.
 *
 * A `client:load` island renders into the DOCS document: it inherits the page's cascade, its top
 * layer, its viewport and its `<html>`. That makes the React binding a weaker demo than the Vanilla
 * one beside it — it reflows with the docs column instead of the stage, cannot honour a screen
 * preset, and its dialogs open against the reader's viewport. Worse, it is a different answer to
 * the same question: the two bindings are supposed to be the SAME component seen twice.
 *
 * ISOLATION IS A JS-REALM PROPERTY, NOT A DOM ONE — this is the whole design, and two cheaper
 * versions of it were built first and both failed:
 *
 *  1. `createPortal` into the frame's body. React attaches listeners once to its ROOT's container,
 *     not per element, and a portal moves the painted nodes but NOT that container. A native click
 *     inside the frame bubbles to the FRAME's document and stops; it never reaches the only
 *     listener, which sits in the docs document. The demo renders perfectly and is completely dead.
 *  2. `createRoot` on the frame's body, called from the parent. Events work — the container is now
 *     inside the frame — but the component's CODE still executes in the parent's realm, where the
 *     `document` global is the DOCS document. `ThemeToggle` does `applyColorMode(document
 *     .documentElement, …)`, so clicking the toggle inside a preview re-themed the whole docs site.
 *     Every component that touches `document` (menu's `dir`, flyout's viewport) leaks the same way.
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
import { useMemo, type ComponentType } from "react";
import { buildPreviewFrameDocument } from "../../lib/preview-frame";

export interface FramedOptions {
  /** No stage padding: some components ARE a layout and must reach the edges. */
  flush?: boolean;
  /** Let the frame scroll instead of growing to its content. */
  scroll?: boolean;
  /** Reserve stage height for demos that paint out of flow — same values as `ComponentPreview`'s prop. */
  viewport?: "auto" | "menu" | "overlay";
  /** Frame title, for the accessibility tree. Defaults to the wrapped component's name. */
  label?: string;
}

/** Per-call overrides for shared demo wrappers such as the usage-tree renderer. */
export type FramedOverrides = Pick<
  FramedOptions,
  "flush" | "scroll" | "viewport"
> & {
  /** App-only script shared by both tree-rendered bindings. */
  script?: string;
};

/**
 * The demo file's name, as the frame's glob map keys it.
 *
 * Dev serves the real path (`…/react-demos/button.tsx?t=123` → `button`), but a BUILD serves a
 * hashed chunk (`button_vlYZB2ck.mjs`), which is why the frame matches on a prefix rather than
 * demanding an exact hit — stripping a hash whose format is Vite's to change would be guessing.
 * This only has to get the stem right; `resolveDemoLoader` in the frame owns the matching.
 */
function moduleKey(moduleUrl: string): string {
  const path = moduleUrl.split("?")[0] ?? moduleUrl;
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.[^.]+$/, "");
}

/**
 * Bind `framed` to the file calling it: `const framed = framedIn(import.meta.url)`.
 *
 * One line per demo file rather than an argument on each of the 131 demos, and — the reason it is
 * shaped this way at all — the PAGES never change. A page still writes `<ButtonBasicDemo
 * client:load />`, so isolation is a property of the demo itself, not something 262 call sites have
 * to remember to ask for.
 *
 * `import.meta.url` is the module's real served URL in dev and its hashed chunk URL in a build; the
 * frame resolves it through a Vite glob rather than fetching it, so both work without a hand-kept
 * registry that would drift the first time a demo file was added.
 */
export function framedIn(moduleUrl: string) {
  const module = moduleKey(moduleUrl);

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
       * `client:load`. A function prop could not have been authored here in the first place.
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
      const encodedScript = frameOptions?.script
        ? encodeURIComponent(frameOptions.script)
        : undefined;

      const srcDoc = useMemo(
        () =>
          buildPreviewFrameDocument({
            body: "",
            flush,
            scroll,
            measure,
            encodedScript,
            reactDemo: { module, export: name, props: demoProps },
          }),
        [props],
      );

      return (
        <iframe
          className={componentPreviewParts.stage}
          data-sk-component-preview-binding="react"
          data-sk-component-preview-flush={flush ? "" : undefined}
          data-sk-component-preview-viewport={
            viewport && viewport !== "auto" ? viewport : undefined
          }
          data-sk-component-preview-scroll={scroll ? "" : undefined}
          aria-busy="true"
          srcDoc={srcDoc}
          title={`Preview renderizado (React): ${title}`}
          allow="clipboard-write"
        />
      );
    }

    /*
     * The unwrapped component, hung off the wrapper.
     *
     * The frame imports the demo module by its EXPORT name, and that export is this wrapper — so
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
