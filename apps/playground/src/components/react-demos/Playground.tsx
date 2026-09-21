import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useLoadingOverlayState,
  useSandpack,
  useSandpackNavigation,
} from "@codesandbox/sandpack-react";
import type { SandpackTheme } from "@codesandbox/sandpack-react";
import { Button } from "@skryensya/react/button";
import { CommandPalette } from "@skryensya/react/command-palette";
import { Dialog } from "@skryensya/react/dialog";
import { useHotkey } from "@skryensya/react/hotkey";
import { Icon, IconSetProvider } from "@skryensya/react/icon";
import { StateButton } from "@skryensya/react/state-button";
import { Kbd } from "@skryensya/react/kbd";
import { Tooltip } from "@skryensya/react/tooltip";
import { Loader } from "@skryensya/react/loader";
import { Menu } from "@skryensya/react/menu";
import { SegmentedControl } from "@skryensya/react/segmented";
import { Tabs } from "@skryensya/react/tabs";
import { Sidebar, SidebarContent, SidebarHeader, SidebarResizeHandle } from "@skryensya/react/sidebar";
import { useStoredPreference } from "@skryensya/react/storage";
import { TreeView } from "@skryensya/react/tree-view";
import type { CommandPaletteEntry } from "@skryensya/core/command-palette";
import { writeClipboard } from "@skryensya/core/copy-button";
import { detectMac, formatHotkey } from "@skryensya/core/hotkey";
import { definePreference, oneOf } from "@skryensya/core/storage";
/*
 * The kit's scrollbar pattern, as TEXT, to go into the sandbox's own stylesheet.
 *
 * The preview runs as a document on another origin, so it cannot share this page's sheets: what it
 * paints with is `previewCss` and nothing else, and `foundation.css` (which the sandbox bundle ships)
 * does not carry this pattern. `?raw` hands over the published file verbatim rather than a
 * hand-copied set of declarations, so the demo's scrollbar is the kit's, kept in one place.
 */
import scrollbarCss from "@skryensya/core/patterns/scrollbar.css?raw";
import { PaneSplitter } from "./PaneSplitter";
import { reloadIcon, splitHorizontalIcon, splitVerticalIcon, toolIcons } from "../../icons";
import { vanillaScriptPath, vanillaScriptSource } from "../../lib/vanilla-script";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from "react";

/*
 * THE TWO WIDTHS THIS TOOL BREAKS AT, and both come from the content rather than from a device.
 *
 * `60rem` is where the rail stops being affordable IN FLOW: it is a fixed 208px, so at 390px it left
 * the stage 182px - narrower than a line of the JSX it is meant to be showing. Below it the rail
 * overlays the stage instead (`pages/index.astro`) and closes on a pick, the way a drawer does.
 *
 * `48rem` is Sandpack's own number (its stylesheet stops putting the panes side by side there) and
 * also where stacking them stops working: at 390x844 the two panes measured 359px and 349px, and
 * 41px of the second is the bar above the preview. Below it the tool shows ONE pane, and each pane's
 * own header carries the control that opens the other.
 */
const RAIL_OVERLAY_QUERY = "(width < 60rem)";
const SINGLE_PANE_QUERY = "(width <= 48rem)";

/*
 * A media query as state. `useSyncExternalStore` rather than an effect, because the answer is needed
 * during the FIRST render (which pane to show) and an effect only ever corrects it a paint later.
 * The server snapshot is `false`: this island is `client:only`, so it never runs, and false is the
 * layout with the most room rather than the one that hides a pane.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/*
 * THE PLAYGROUND, and the one thing it exists to prove: this code runs.
 *
 * A docs preview shows a component already mounted, which answers "what does it look like" and
 * nothing else. The question a reader has next is "what happens if I change this", and the only
 * honest way to answer it is to give them the code and let them change it. Sandpack is the editor
 * and the bundler; everything below is about handing it a kit it cannot install.
 *
 * BOTH BINDINGS, because the kit has two and they are not the same experience. React is a component
 * you import. Vanilla is a DOCUMENT: markup that already works, plus one call that hydrates the
 * parts that need it. Showing only the first would sell the system as a React library, which is the
 * one thing it is not.
 */

/**
 * The rail's own view of a component: labels only, no source. What `nodes` (below) needs to draw
 * the tree, and nothing more - fetching this for every component up front costs a few KB total.
 */
export type PlaygroundIndexExample = {
  readonly id: string;
  readonly label: string;
  /** Absolute docs address for this exact example; empty when no docs page renders it. */
  readonly docs: string;
};
export type PlaygroundIndexComponent = {
  readonly id: string;
  readonly label: string;
  readonly docs: string;
  readonly examples: readonly PlaygroundIndexExample[];
};

/**
 * One component's real source, in both bindings. Fetched only once a reader selects that component
 * (`useComponentDetail`, below) - this is the ~500KB-for-59-components part the index used to carry
 * unconditionally.
 */
export type PlaygroundDetailExample = PlaygroundIndexExample & {
  readonly react: string;
  /**
   * The module `/App.tsx` imports its collections from, for the examples that have one. A second
   * file rather than a `const` in the entry, because that is what the component page shows and the
   * two have to be the same code.
   */
  readonly reactData?: { readonly path: string; readonly code: string };
  readonly vanilla: string;
};
export type PlaygroundDetailComponent = Omit<PlaygroundIndexComponent, "examples"> & {
  readonly examples: readonly PlaygroundDetailExample[];
};

export type PlaygroundStrings = {
  readonly title: string;
  readonly componentsLabel: string;
  readonly bindingLabel: string;
  readonly react: string;
  readonly vanilla: string;
  readonly loading: string;
  readonly failed: string;
  readonly offline: string;
  readonly docsLink: string;
  readonly filesLabel: string;
  readonly hideRail: string;
  readonly showRail: string;
  readonly resizeRail: string;
  readonly discardTitle: string;
  readonly discardBody: string;
  readonly discardCancel: string;
  readonly discardConfirm: string;
  readonly resizePanes: string;
  readonly resizePanesBlock: string;
  readonly search: string;
  readonly searchPlaceholder: string;
  readonly searchEmpty: string;
  readonly searchClose: string;
  readonly searchHintNavigate: string;
  readonly searchHintOpen: string;
  readonly searchHintClose: string;
  readonly reload: string;
  readonly copy: string;
  readonly copied: string;
  readonly layoutSideBySide: string;
  readonly layoutStacked: string;
  readonly showCode: string;
  readonly showPreview: string;
  readonly language: string;
};

/** One translation of this page: a row in the language menu, and a real address. */
export type PlaygroundLanguage = {
  readonly value: string;
  readonly label: string;
  readonly href: string;
  readonly current: boolean;
};

type Props = {
  /** URL of the built catalogue INDEX for this locale. Fetched, not inlined: see the endpoint for why. */
  readonly catalogue: string;
  /** Every translation of this page, newest-to-oldest irrelevant: one row per locale (`index.astro`). */
  readonly languages: readonly PlaygroundLanguage[];
  readonly strings: PlaygroundStrings;
};

/**
 * A one-navigation handoff from a docs preview. The document source stays in session storage rather
 * than the URL: examples routinely exceed a safe, readable query string and the next tab should
 * open the code itself, not an encoded transport.
 */
type PlaygroundHandoff = {
  readonly label: string;
  readonly vanilla: string;
  /** The docs page and preview the demo was opened from, so "See the docs" can go back to it. */
  readonly docs: string;
};

/** Only a plain web address is followed: the payload comes from another window and ends up in an href. */
function safeDocsUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

/*
 * WHAT THE TWO APPS AGREE ON. Neither imports the other, so these strings ARE the interface; the
 * docs side declares the same pair in `@skryensya/vanilla/component-preview`.
 */
const readyMessage = "sk-playground-ready";
const handoffMessage = "sk-playground-handoff";
const handoffComponentId = "preview";

/** Static, not `useId()`: one `Playground` mounts per page (`client:only`), so nothing here ever
 *  collides, and a plain string is what `document.getElementById` (the platform's own way to reach
 *  a `<dialog>`, the same one every other demo in this kit uses) needs to find it. */
const discardDialogId = "playground-discard-dialog";
/** The search palette, reached the same way and for the same reason. */
const searchDialogId = "playground-search-dialog";

/*
 * HOW THE TWO PANES SIT, remembered.
 *
 * A preference and not state, because it is a preference: which way a reader wants the code and
 * what it runs arranged depends on their screen and on what they are reading, and answering that
 * again on every visit is the kind of question a tool should only ask once. Same slot machinery,
 * the same store and the same tab-to-tab sync as the rail width and the editor size beside it.
 */
const paneLayoutPreference = definePreference<"side-by-side" | "stacked">({
  slot: "playground-pane-layout",
  fallback: "side-by-side",
  parse: oneOf(["side-by-side", "stacked"]),
});

function parseHandoff(encoded: unknown): PlaygroundHandoff | null {
  if (typeof encoded !== "string") return null;
  try {
    const value = JSON.parse(decodeURIComponent(encoded)) as Partial<PlaygroundHandoff>;
    return typeof value.label === "string" && typeof value.vanilla === "string"
      ? { label: value.label, vanilla: value.vanilla, docs: safeDocsUrl(value.docs) }
      : null;
  } catch {
    return null;
  }
}

/**
 * Takes delivery of a demo handed over from a docs preview.
 *
 * A HANDSHAKE, not a read, and the reason is that the two apps are not necessarily the same origin.
 * This used to pull the source out of `sessionStorage`, which is partitioned per origin: it worked
 * when both sat behind one host and did nothing at all under `pnpm dev`, where they are two ports.
 * `postMessage` crosses that line, has no size limit (the largest demo in the corpus is 18 KB, well
 * past what a shareable URL should carry) and leaves the address bar clean.
 *
 * WHO WE TRUST: the opener, and only the opener. `event.source === window.opener` is what makes this
 * safe without hard-coding a docs origin - anything else posting the same string is ignored, and the
 * payload is parsed rather than evaluated, so the worst a hostile opener achieves is putting its own
 * text in an editor the reader already asked to open.
 *
 * Announcing readiness is our half: the other side cannot know when a document in another origin has
 * booted, so it waits to be told.
 */
function usePlaygroundHandoff(): [PlaygroundHandoff | null, (next: PlaygroundHandoff | null) => void] {
  const [handoff, setHandoff] = useState<PlaygroundHandoff | null>(null);

  useEffect(() => {
    if (!window.opener) return;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.opener) return;
      const data = event.data as { type?: unknown; payload?: unknown } | null;
      if (data?.type !== handoffMessage) return;

      const parsed = parseHandoff(data.payload);
      if (parsed) setHandoff(parsed);
    };

    window.addEventListener("message", onMessage);
    /* `"*"`: this says only "I am listening", carries nothing, and we do not know the opener's origin
     * to narrow it to. The payload travels the other way, where the origin IS pinned. */
    window.opener.postMessage({ type: readyMessage }, "*");

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return [handoff, setHandoff];
}

/*
 * WHICH EXAMPLE IS OPEN, LIVES IN THE URL, the same trade `hero-tabs-url.ts` already makes for a
 * component page's own tabs: a reader who wants to point someone at "the Ghost variant of Button in
 * the Playground" should be able to send a link, not a link plus "then click Button, then Ghost".
 *
 * Two params rather than one `leafId(...)` string: readable in an address bar (`?component=button
 * &example=ghost`) instead of `?leaf=button%2Fghost`, and each survives a reload independently of
 * the other ever validating.
 *
 * NOT the handoff's business. The handoff is a one-navigation transfer through session storage (see
 * above) precisely because its source routinely exceeds a safe query string; it is read once, at
 * mount, and wins over the URL when both are present - the reader who just clicked "Ver en
 * Playground" gets the demo they clicked, not whatever this tab's address bar happened to hold from
 * a previous visit.
 */
const COMPONENT_PARAM = "component";
const EXAMPLE_PARAM = "example";
const BINDING_PARAM = "binding";

type PlaygroundUrlSelection = {
  readonly componentId: string;
  readonly exampleId: string;
  readonly binding: "react" | "vanilla" | null;
};

function readPlaygroundUrlSelection(): PlaygroundUrlSelection | null {
  if (typeof window === "undefined") return null;
  const params = new URL(window.location.href).searchParams;
  const componentId = params.get(COMPONENT_PARAM);
  const exampleId = params.get(EXAMPLE_PARAM);
  if (!componentId || !exampleId) return null;
  const bindingParam = params.get(BINDING_PARAM);
  const binding = bindingParam === "react" || bindingParam === "vanilla" ? bindingParam : null;
  return { componentId, exampleId, binding };
}

/**
 * Mirrors the current selection into the address bar. `replaceState`, not `push`: picking through
 * examples is browsing one tool, not travelling to a new place, so Back should leave the Playground
 * rather than walk backwards through every example the reader opened (the same call `hero-tabs-url.ts`
 * makes for a component page's tabs).
 *
 * Skipped entirely for the handoff's synthetic id: `preview` names no real catalogue entry, so a URL
 * built from it would 404 the moment anyone reloaded or shared it. The address bar is left holding
 * whatever it already had - nothing to reload back into is exactly correct for a one-shot handoff.
 */
function writePlaygroundUrlSelection(componentId: string, exampleId: string, binding: "react" | "vanilla"): void {
  if (componentId === handoffComponentId) return;
  const url = new URL(window.location.href);
  url.searchParams.set(COMPONENT_PARAM, componentId);
  url.searchParams.set(EXAMPLE_PARAM, exampleId);
  url.searchParams.set(BINDING_PARAM, binding);
  window.history.replaceState(window.history.state, "", url);
}

/** The handoff, reshaped as the one-component detail it stands in for - no fetch needed, it already
 * carries its own source. The only entry whose Vanilla binding has no React counterpart (see the
 * binding switch below, which keys off this same id rather than an empty string). */
function handoffDetail(handoff: PlaygroundHandoff): PlaygroundDetailComponent {
  return {
    id: handoffComponentId,
    label: handoff.label,
    docs: handoff.docs,
    examples: [{ id: handoffComponentId, label: handoff.label, docs: handoff.docs, react: "", vanilla: handoff.vanilla }],
  };
}

/** What the sandbox is handed. All of it built by `scripts/build-sandbox-bundles.mjs`. */
const BUNDLES = {
  /** Tokens, semantic layer, high-contrast mode, the two dimensions - everything a component's own
   * CSS assumes is already there. No patterns, no components: those are fetched per part, below. */
  foundation: "/sandbox/foundation.css",
  /** The React package as a module GRAPH, keyed by the file name each module is mounted at: one
   * entry per published subpath plus the chunks they share. One asset rather than 200 requests, and
   * Sandpack transpiles only what the example's own imports reach. See the build script for the
   * measurement that made this a graph instead of a single file. */
  react: "/sandbox/react-modules.json",
  /** Same shape for Vanilla: `@skryensya/vanilla` and `@skryensya/icons-lucide`, keyed by their path
   * under `/node_modules/@skryensya/`. */
  vanilla: "/sandbox/vanilla-modules.json",
  /** `{ base, parts }`: the sheets every example needs, and part class name → the files that part
   * needs (the sheet its contract declares, plus that sheet's own `@import` closure), both resolved
   * at build time so the client never has to parse CSS to find out. See `useComponentCss`. */
  cssManifest: "/sandbox/css-manifest.json",
} as const;

/** Where a name from `cssManifest` resolves to an actual file. */
const CSS_BASE = "/sandbox/css/";

/** The package name the sandbox resolves, and the folder it is mounted at. */
const REACT_PACKAGE = "@skryensya/react";

/*
 * The kit ships no page background, inset or baseline typography of its own - those are the app's
 * to set, not a component's. Every docs preview sits against `--color-bg-canvas` with
 * `--space-inset-lg` of breathing room and the site's own body type (`body` in `site.css`:
 * `--font-family-body`, `--font-size-body`, `--font-line-height-body`, antialiased smoothing),
 * copied into each `ComponentPreview` iframe along with the rest of the page's stylesheets; the
 * sandbox is the same kind of stage showing the same kit, so it gets the same rules instead of
 * Sandpack's own edge-to-edge default with no body font at all.
 *
 * THE FONT MISMATCH THIS FIXES: a component's own CSS sets `font-family` on ITS OWN class
 * (`.sk-text`, `.sk-heading`, …), never on bare `body` - that line is `site.css`'s alone, and the
 * sandbox never carried it. Any text not wrapped in one of the kit's typography parts fell back to
 * the browser's own default serif, and `-webkit-font-smoothing` being unset meant even text that
 * WAS wearing `--font-family-body` rendered heavier/rougher than the same font on the docs page,
 * which sets `antialiased` at `body` and lets it inherit. Same font, different smoothing, reads as
 * a different font.
 *
 * `color-scheme` is the reason this is a function of the reader's mode rather than a constant. The
 * preview runs as a document on a DIFFERENT origin (Sandpack's own bundler, not this page), so it
 * never sees this page's `data-scheme` attribute or its `<html>` `style.colorScheme` - it only gets
 * whatever `bundles.css` itself declares, `color-scheme: light dark` at `:root` (`_base.scss`),
 * which always follows the OS and nothing else. `applyColorMode` (`core/theme-toggle.ts`) is what
 * lets a reader OVERRIDE the OS on this page; the sandbox needs the same override written into its
 * own stylesheet, or picking "dark" here while the OS stays light leaves the preview light regardless.
 */
function previewBodyCss(colorScheme: string): string {
  return `
:root {
  color-scheme: ${colorScheme};
}

body {
  margin: 0;
  padding: var(--space-inset-lg);
  background: var(--color-bg-canvas);
  color: var(--color-text-primary);
  font-family: var(--font-family-body);
  font-size: var(--font-size-body);
  line-height: var(--font-line-height-body);
  -webkit-font-smoothing: antialiased;
}
`;
}

/*
 * THE EDITOR'S OWN PALETTE, not one of Sandpack's two baked-in pairs.
 *
 * Every color below names a token this document already resolves (the site's own tokens.scss,
 * loaded on every docs page), so the editor chrome follows the reader's theme toggle exactly like
 * every other surface here. `readSandpackTheme` (below) is what actually resolves a name to a
 * paintable value; this map only says which token plays which Sandpack role.
 *
 * Font and syntax hues borrow the same roles `CodeBlock.astro`'s prose code panels already use
 * (`--font-family-code`, `--font-size-body-sm`) so a snippet reads the same size and face whether it
 * sits still on a component page or is being edited here. Sandpack's own CodeMirror highlighter is a
 * different engine than Shiki (which paints those static panels), so this is a matched PALETTE, not
 * pixel-identical tokenization - there is no way to make two different highlighters agree token for
 * token, only to make them agree on what accent, string and comment mean.
 */
const THEME_COLOR_TOKENS = {
  surface1: "--color-bg-canvas",
  surface2: "--color-bg-surface",
  surface3: "--color-bg-surface-sunken",
  clickable: "--color-text-secondary",
  base: "--color-text-primary",
  disabled: "--color-text-disabled",
  hover: "--color-text-primary",
  accent: "--color-action-primary",
  error: "--color-text-danger",
  errorSurface: "--color-bg-danger-subtle",
  warning: "--color-text-warning",
  warningSurface: "--color-bg-warning-subtle",
} as const;

const SYNTAX_COLOR_TOKENS = {
  plain: "--color-text-primary",
  comment: "--color-text-tertiary",
  keyword: "--color-text-accent",
  tag: "--color-text-danger",
  punctuation: "--color-text-secondary",
  definition: "--color-text-accent",
  property: "--color-text-info",
  static: "--color-text-warning",
  string: "--color-text-success",
} as const;

/*
 * Sandpack decides light vs dark for its OWN chrome from `isDarkColor(theme.colors.surface1)`
 * (`@codesandbox/sandpack-react`'s own source), which parses only literal `#hex` and `rgb()`
 * strings - handed a `var(--color-bg-canvas)` reference, it cannot parse it, falls through its own
 * "too short to be a color" branch, and answers "dark" no matter which mode the reader is in. So
 * the theme this component hands Sandpack has to carry REAL resolved colors, not references, and has
 * to be rebuilt whenever the reader's scheme changes - the CSS cascade can no longer do that part for
 * free once the reference is gone.
 *
 * Resolved the same way `AvatarPage.astro`'s icon retint script already resolves a token to a
 * paintable value: give a hidden probe element the token as its `color` and read back what
 * `light-dark()`/`color-mix()` actually computed, rather than `getPropertyValue` on the custom
 * property itself, which would hand back the unresolved `light-dark(...)` source text.
 */
/*
 * A resolved color, as BYTES, because `isDarkColor` cannot read anything else.
 *
 * Reading the probe's `color` back gives whatever color space the author wrote, and this kit is
 * written in `oklch()` - which Sandpack's parser (above) drops through to its `split(",")` branch,
 * counts fewer than three components, and calls dark. So every theme this site handed it was "dark"
 * no matter the mode, and since Sandpack writes `color-scheme` onto its own wrapper from that
 * verdict, every `light-dark()` token inside the sandbox subtree - ours included, in the loading
 * overlay and the preview's own ground - resolved to its DARK value on a light page.
 *
 * A 1x1 canvas is the conversion: the engine parses the color, paints it, and `getImageData` hands
 * back sRGB bytes. It converts anything the CSS parser understands, so it keeps working when the
 * palette moves to a color space that does not exist yet. Alpha is kept (their parser reads the
 * first three components of an `rgba()` just as happily), because a token that is translucent
 * should stay translucent in the editor's chrome.
 */
function readSandpackTheme(): SandpackTheme {
  const probe = document.createElement("span");
  probe.style.cssText = "position:fixed;inset:0;visibility:hidden;pointer-events:none;";
  document.body.append(probe);

  const paint = document.createElement("canvas").getContext("2d", { willReadFrequently: true });

  const resolve = (token: string): string => {
    probe.style.color = `var(${token})`;
    const computed = getComputedStyle(probe).color;
    if (!paint) return computed;

    paint.clearRect(0, 0, 1, 1);
    paint.fillStyle = computed;
    paint.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = paint.getImageData(0, 0, 1, 1).data;
    return alpha === 255
      ? `rgb(${red}, ${green}, ${blue})`
      : `rgba(${red}, ${green}, ${blue}, ${(alpha / 255).toFixed(3)})`;
  };

  const theme: SandpackTheme = {
    colors: Object.fromEntries(
      Object.entries(THEME_COLOR_TOKENS).map(([role, token]) => [role, resolve(token)]),
    ) as SandpackTheme["colors"],
    syntax: {
      ...(Object.fromEntries(
        Object.entries(SYNTAX_COLOR_TOKENS).map(([role, token]) => [role, resolve(token)]),
      ) as SandpackTheme["syntax"]),
      comment: { color: resolve(SYNTAX_COLOR_TOKENS.comment), fontStyle: "italic" },
    },
    font: {
      body: "var(--font-family-body)",
      mono: "var(--font-family-code)",
      size: "var(--font-size-body-sm)",
      lineHeight: "var(--font-line-height-body-relaxed)",
    },
  };

  probe.remove();
  return theme;
}

/**
 * The `color-scheme` value the sandboxed preview's own stylesheet needs, mirroring exactly what
 * `applyColorMode` writes to this page's `<html>`: the mode itself when the reader picked one,
 * `light dark` (follow the OS) for `system` or for no preference at all.
 */
function readColorScheme(): string {
  const mode = document.documentElement.getAttribute("data-scheme");
  return mode === "light" || mode === "dark" ? mode : "light dark";
}

type ThemeState = { readonly sandpack: SandpackTheme; readonly colorScheme: string };

function readThemeState(): ThemeState {
  return { sandpack: readSandpackTheme(), colorScheme: readColorScheme() };
}

/**
 * Both the editor's resolved palette and the preview's `color-scheme`, kept in sync with the
 * reader's mode from one pair of listeners: a `data-scheme` mutation covers the toggle in the
 * header, and a `prefers-color-scheme` listener covers `system` responding to the OS, which changes
 * no attribute on this page for the MutationObserver to see. Either one means both halves are stale
 * - the editor's `isDarkColor` check has to re-run against fresh colors, and the preview's `files`
 * need a new `color-scheme` line (see `previewBodyCss` and where `key` reads `colorScheme` below:
 * that line is only ever picked up on a REMOUNT).
 */
function useThemeState(): ThemeState {
  const [state, setState] = useState<ThemeState>(() => readThemeState());

  useEffect(() => {
    const refresh = () => setState(readThemeState());

    const attrObserver = new MutationObserver(refresh);
    attrObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-scheme"] });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", refresh);

    return () => {
      attrObserver.disconnect();
      media.removeEventListener("change", refresh);
    };
  }, []);

  return state;
}

/*
 * THE KIT AS A PACKAGE, not as a file the example has to reach for.
 *
 * Sandpack's own answer for an unpublished dependency: put it in the `files` map under
 * `/node_modules/<name>/`, with a `package.json` naming its entry. The bundler then resolves
 * `@skryensya/react` like any other install, so the example imports what a real app imports and
 * the playground has nothing to apologise for. (It used to: the import was rewritten to a relative
 * path and a banner explained why. The banner was the tell that the code was not the code.)
 *
 * The subpaths need one more step, which the guide does not cover: `main` gives the bare specifier
 * only, and every emitted snippet imports `@skryensya/react/button`. So the package is mounted as the
 * module graph the build emits - `button.js` beside `index.js` beside the chunks they share - and
 * `/button` resolves to `/button.js` by ordinary node resolution, with no re-export shim in between.
 *
 * EVERY module, not only the ones this example imports, and that is affordable now: Sandpack walks
 * the graph from the entry, so a file nothing requires is never transpiled. The reader can edit the
 * code, and an import that works in their app should work here - which is exactly what the previous
 * shape could not afford, because there every subpath dragged the whole 1.16MB kit through Babel.
 */
function reactPackageFiles(modules: Readonly<Record<string, string>>) {
  const root = `/node_modules/${REACT_PACKAGE}`;

  return {
    [`${root}/package.json`]: {
      code: JSON.stringify({ name: REACT_PACKAGE, main: "./index.js" }, null, 2),
      hidden: true,
    },
    ...Object.fromEntries(
      Object.entries(modules).map(([file, code]) => [`${root}/${file}`, { code, hidden: true }]),
    ),
  };
}

/*
 * THE SAME MOUNT FOR VANILLA: `@skryensya/vanilla` and `@skryensya/icons-lucide` as the graph the
 * build emits (keys already carry the package folder), plus `@skryensya/core/skryensya.css`, the file
 * `main.js` imports. That stylesheet holds only what this example's parts need (see
 * `useComponentCss`) rather than the whole published bundle, which paints the same example.
 */
function vanillaPackageFiles(modules: Readonly<Record<string, string>>, css: string) {
  const scope = "/node_modules/@skryensya";
  const manifest = (name: string, main?: string) => ({
    code: JSON.stringify({ name: `@skryensya/${name}`, ...(main ? { main } : {}) }, null, 2),
    hidden: true,
  });

  return {
    [`${scope}/vanilla/package.json`]: manifest("vanilla", "./index.js"),
    [`${scope}/icons-lucide/package.json`]: manifest("icons-lucide", "./index.js"),
    [`${scope}/core/package.json`]: manifest("core"),
    [`${scope}/core/skryensya.css`]: { code: css, hidden: true },
    ...Object.fromEntries(
      Object.entries(modules).map(([file, code]) => [`${scope}/${file}`, { code, hidden: true }]),
    ),
  };
}

/*
 * WHERE THE SANDBOX ACTUALLY RUNS, and the one dependency this page has that the rest of the site
 * does not: Sandpack compiles and executes inside an iframe served by CodeSandbox. Everything else
 * here is static and local; this is not.
 *
 * It is probed rather than assumed because of how it fails when it is unreachable - a VPN, a
 * corporate proxy, a content blocker, a plane. Sandpack mounts, the editor renders with the code in
 * it, and the preview pane stays blank forever with nothing said. The page looks like it is working
 * and the COMPONENT looks broken, which is the worst version of this: it sends the reader to debug
 * a kit that is fine.
 *
 * The version is Sandpack's own bundler URL for the client version in package.json. Wrong or stale
 * only means this probe fails while the real thing works, and the message below still tells the
 * reader what to check.
 */
const BUNDLER_ORIGIN = "https://2-19-8-sandpack.codesandbox.io/";

/** The shape `css-manifest.json` is written in; see `BUNDLES.cssManifest`. */
type CssManifest = {
  readonly base: readonly string[];
  readonly parts: Readonly<Record<string, readonly string[]>>;
};

type Bundles = {
  readonly foundation: string;
  readonly react: Readonly<Record<string, string>>;
  readonly vanilla: Readonly<Record<string, string>>;
  readonly cssManifest: CssManifest;
  readonly components: readonly PlaygroundIndexComponent[];
};

type Blocked = "assets" | "bundler";

/*
 * FETCHED, NOT INLINED, and the difference is the whole page's weight. Even trimmed to the index
 * plus the two compiled kit bundles, this is still real weight; it is an ordinary static asset
 * either way, so the browser caches it and a second visit pays nothing.
 */
function useBundles(catalogue: string): { bundles: Bundles | null; blocked: Blocked | null } {
  const [bundles, setBundles] = useState<Bundles | null>(null);
  const [blocked, setBlocked] = useState<Blocked | null>(null);

  useEffect(() => {
    let cancelled = false;

    const assets = Promise.all(
      [BUNDLES.foundation, BUNDLES.react, BUNDLES.vanilla, BUNDLES.cssManifest, catalogue].map(
        async (url) => {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`${url}: ${response.status}`);
          return response.text();
        },
      ),
    );

    /*
     * `no-cors`, because the answer is not wanted: the bundler sends no CORS headers and this asks
     * one question only, "did the network reach it". A reachable server resolves opaquely; a blocked
     * or absent one rejects, which is exactly the distinction the reader needs made for them.
     */
    const bundler = fetch(BUNDLER_ORIGIN, { mode: "no-cors" });

    assets
      .then(async ([foundation, react, vanilla, cssManifest, components]) => {
        try {
          await bundler;
        } catch {
          if (!cancelled) setBlocked("bundler");
          return;
        }
        if (!cancelled) {
          setBundles({
            foundation,
            react: JSON.parse(react) as Record<string, string>,
            vanilla: JSON.parse(vanilla) as Record<string, string>,
            cssManifest: JSON.parse(cssManifest) as CssManifest,
            components: JSON.parse(components) as PlaygroundIndexComponent[],
          });
        }
      })
      .catch(() => {
        if (!cancelled) setBlocked("assets");
      });

    return () => {
      cancelled = true;
    };
  }, [catalogue]);

  return { bundles, blocked };
}

/**
 * "Is this island still mounted", for the fetches below: the one thing a late response must not do is
 * `setState` into a component that is gone. Everything else about a late response is fine - see
 * `useComponentCss`.
 */
function useMounted() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return alive;
}

/** Every file at once, as text, with a non-ok response treated as the failure it is rather than
 *  cached as a body of HTML that says "404". */
async function fetchAll(files: readonly string[]): Promise<readonly (readonly [string, string])[]> {
  return Promise.all(
    files.map(async (file) => {
      const response = await fetch(`${CSS_BASE}${file}`);
      if (!response.ok) throw new Error(`${file}: ${response.status}`);
      return [file, await response.text()] as const;
    }),
  );
}

/**
 * One component's real source, fetched only once it is selected. `catalogue` is the INDEX url
 * (`/playground-catalogue-es.json`); the detail route sits one hop away
 * (`playground-catalogue-[locale]-[component].json.ts`), named by inserting the id before `.json`.
 *
 * A ref, not the returned cache itself, tracks which ids have been requested: the effect must not
 * re-fire just because a sibling fetch resolved and replaced the cache with a new `Map`, only when
 * `componentId` genuinely changes to one that has never been asked for.
 */
function useComponentDetail(
  catalogue: string,
  componentId: string,
): Map<string, PlaygroundDetailComponent> {
  const [cache, setCache] = useState<Map<string, PlaygroundDetailComponent>>(new Map());
  const requested = useRef(new Set<string>());
  const alive = useMounted();

  useEffect(() => {
    if (!componentId || componentId === handoffComponentId) return;
    if (requested.current.has(componentId)) return;
    requested.current.add(componentId);

    const url = catalogue.replace(/\.json$/, `-${componentId}.json`);

    fetch(url)
      .then((response) => (response.ok ? (response.json() as Promise<PlaygroundDetailComponent>) : null))
      .then((detail) => {
        if (!alive.current || !detail) return;
        setCache((previous) => new Map(previous).set(componentId, detail));
      })
      /* Same two rules as `useComponentCss` below, for the same reasons: a response that arrives
       * after the reader moved on is still this component's source and belongs in the cache (the
       * alternative strands it - `requested` would hold an id nothing ever fetched again, so coming
       * BACK to that component would load forever), and a failure un-marks so a later render retries. */
      .catch(() => {
        requested.current.delete(componentId);
      });
  }, [catalogue, componentId]);

  return cache;
}

/**
 * Which parts an example uses, read from its EMITTED MARKUP - for both bindings, from the same
 * string.
 *
 * The markup is the whole DOM of the tree: every `data-sk-*` root and every `.sk-*` class the
 * example realizes, including the ones a component composes internally and nobody authored. React's
 * source cannot say the same thing, because a React component's internals are inside the component:
 * this used to read the emitter's `from "@skryensya/react/accordion"` import lines instead, which
 * name only what the AUTHOR reached for. Details renders its own chevron with `<Icon>`, Summary
 * carries `sk-interactive`, and neither has an import line - so the React preview came out with no
 * icon sizing and no state layer while the Vanilla one, reading the markup, had both.
 *
 * The two bindings render the same usage tree and therefore the same parts (that is the contract, not
 * an assumption this file makes), so ONE detection for both is not a shortcut - it is the only way
 * the two previews cannot disagree about what to paint. Same reason the emitted sources are built
 * from one tree rather than authored twice.
 */
/* Stops at a BEM `__element` or `--modifier` rather than at `\b`: `_` is a word character, so `\b`
   never fell between `switch` and `__control` and every element class matched nothing. TileSwitch
   reaches Switch's sheet ONLY through `sk-switch__control`, and its track painted at 0x0. */
const SK_NAME_RE = /\bsk-([a-z0-9]+(?:-[a-z0-9]+)*)(?=__|--|[^a-z0-9_-]|$)/g;

function detectPartNames(markup: string): readonly string[] {
  if (!markup) return [];
  return [...new Set([...markup.matchAll(SK_NAME_RE)].map((match) => match[1]))];
}

/**
 * The CSS `names` (above) resolve to, fetched and cached per file so switching between components
 * already visited costs nothing. `manifest.parts[name]` is the transitive closure of the sheet whose
 * CONTRACT declares that part (`build-sandbox-bundles.mjs`), so a name with cross-file dependencies
 * (Calendar needing Button's CSS) still resolves to every file it needs, not just its own.
 *
 * `manifest.base` goes in unconditionally: `tokens.scss` ships three patterns in base (state layer,
 * visually-hidden, icon) that core's `foundation.css` strips when it compiles, so they are part of
 * "everything before a component" and no example has to name them.
 *
 * Same "cache is state, requests are a ref" split as `useComponentDetail`, for the same reason: a
 * completed fetch must not make the effect below re-evaluate `files` and re-request them.
 */
function useComponentCss(
  cssManifest: CssManifest | null,
  names: readonly string[],
): { css: string; ready: boolean } {
  const [cache, setCache] = useState<Map<string, string>>(new Map());
  const requested = useRef(new Set<string>());
  const alive = useMounted();

  const files = useMemo(() => {
    if (!cssManifest) return [];
    return [
      ...new Set([...cssManifest.base, ...names.flatMap((name) => cssManifest.parts[name] ?? [])]),
    ].sort();
  }, [cssManifest, names]);

  useEffect(() => {
    const missing = files.filter((file) => !requested.current.has(file));
    if (missing.length === 0) return;
    for (const file of missing) requested.current.add(file);

    /*
     * NO PER-BATCH CANCELLATION, and that is the whole bug this hook used to have.
     *
     * `files` changes as soon as the example's own parts arrive, so the effect re-ran and its cleanup
     * cancelled the batch already in flight - which was the batch fetching the BASE sheets, still
     * needed by every example there is. Its response landed, was discarded as "stale", and
     * `requested` kept the three files marked, so nothing ever asked for them again: `ready` stayed
     * false and the preview sat on "Loading the kit…" forever. It only ever appeared when the two
     * batches overlapped, which is why it read as one component being broken rather than a race.
     *
     * A stylesheet's content does not go stale inside a session, and the cache is keyed by file, so a
     * response that arrives late is simply a response: caching it is always right. The only thing
     * worth guarding is a `setState` after the island is gone.
     */
    fetchAll(missing)
      .then((entries) => {
        if (!alive.current) return;
        setCache((previous) => {
          const next = new Map(previous);
          for (const [file, text] of entries) next.set(file, text);
          return next;
        });
      })
      /* A failed batch un-marks itself, or one dropped request would strand the preview on "loading"
       * for the rest of the session: `requested` is a promise to fetch, not a record of having. */
      .catch(() => {
        for (const file of missing) requested.current.delete(file);
      });
  }, [files]);

  const ready = files.every((file) => cache.has(file));
  const css = ready ? files.map((file) => cache.get(file)).join("\n\n") : "";
  return { css, ready };
}

/**
 * A leaf's id, and the only place the two halves are joined.
 *
 * The tree is flat about identity - one string per node - while a selection here is a PAIR. Both
 * ids are already URL-safe (the catalogue says so), so a separator that cannot appear in either is
 * all it takes to go back and forth.
 */
const leafId = (componentId: string, exampleId: string) => `${componentId}/${exampleId}`;

/*
 * THE EXAMPLE, PUSHED INTO A SANDBOX THAT IS ALREADY RUNNING.
 *
 * Everything else in the sandbox - the kit's bundle, the stylesheet, the entry - is identical from
 * one example to the next; only this one file differs. `updateFile` replaces it in place, so the
 * bundler keeps every module it has already compiled and recompiles the one that changed, instead
 * of starting a new sandbox and installing React again.
 *
 * It also discards whatever the reader had typed in that file, which is the behaviour that was
 * already there when each example remounted: asking for another example means asking for that
 * example, not for the last one patched.
 */
function FileSync({
  code,
  path,
  data,
}: {
  readonly code: string;
  readonly path: string;
  /**
   * The entry's data module, when this example has one. Pushed BEFORE the entry (which imports it)
   * and never made the active file, and the PREVIOUS example's module is deleted rather than left
   * behind: the file names come from the emitter, so they differ per example and a stale one would
   * sit in the editor's tab strip as a file nothing imports.
   */
  readonly data?: { readonly path: string; readonly code: string };
}) {
  const { sandpack } = useSandpack();
  /*
   * WHAT WE LAST PUSHED, not what the file currently holds. `sandpack` (from `useSandpack()`)
   * hands back a new object on every keystroke - the reader's own edits count as a sandpack state
   * change - so this effect re-runs on every character typed. Comparing against
   * `sandpack.files[path].code` (the ORIGINAL guard) compares against the reader's live edits, which
   * differ from `code` the instant they type anything, and "differs" read as "needs pushing": every
   * keystroke was immediately overwritten back to the original source. Tracking what WE last wrote
   * here instead answers the right question - has the PROP changed, i.e. did the reader pick a
   * different example - and ignores edits made through the editor itself.
   */
  const pushedRef = useRef<{
    path: string;
    code: string;
    data?: { path: string; code: string };
  } | null>(null);

  const dataPath = data?.path;
  const dataCode = data?.code;

  useEffect(() => {
    if (!code) return;
    const pushed = pushedRef.current;
    if (
      pushed?.path === path &&
      pushed.code === code &&
      pushed.data?.path === dataPath &&
      pushed.data?.code === dataCode
    )
      return;

    if (pushed?.data && pushed.data.path !== dataPath) sandpack.deleteFile(pushed.data.path);
    if (dataPath && dataCode !== undefined) sandpack.updateFile(dataPath, dataCode);
    sandpack.updateFile(path, code);
    sandpack.setActiveFile(path);
    pushedRef.current = {
      path,
      code,
      ...(dataPath && dataCode !== undefined ? { data: { path: dataPath, code: dataCode } } : {}),
    };
  }, [code, path, dataPath, dataCode, sandpack]);

  return null;
}

/*
 * THE CHROME IS ONE ROW, AND THE ISLAND FILLS IT.
 *
 * This tool used to wear two bars: the layout's (`layouts/Tool.astro`: the way back, search, the two
 * preferences) and its own, right under it (the rail's switch, the heading, the docs link, the
 * binding switch, the reload and the pane layout). Two strips of chrome, two hairlines, ~99px of
 * height before a line of code - and the split ran along a line the reader has no reason to know
 * about, which is WHICH OF THE TWO PROGRAMS RENDERS A CONTROL.
 *
 * So there is one row now, and the ownership problem is solved the way the search already solved it:
 * the layout leaves named slots, the island renders its controls where its state lives, and a portal
 * moves the boxes. The alternative - lifting the catalogue, the binding and the Sandpack client up
 * into an Astro layout - is not a layout change, it is a rewrite.
 *
 * `null` until mounted: the island is `client:only`, so there is no server pass to mismatch, and the
 * slot is in the document by the time this runs either way.
 */
function ChromeSlot({ name, children }: { readonly name: string; readonly children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.querySelector<HTMLElement>(`[data-playground-chrome-${name}]`));
  }, [name]);

  return slot ? createPortal(children, slot) : null;
}

/*
 * THE EXAMPLE'S FILES, AS THE KIT'S OWN TABS.
 *
 * Sandpack draws a tab strip of its own, and it was the one piece of chrome on this screen in
 * someone else's language. This is `Tabs` from `@skryensya/react`: the same roving focus, indicator
 * and sizes a docs page's source tabs use, controlled by Sandpack's `activeFile` so the two can never
 * disagree about which file is open (`FileSync` still moves it to the entry on every new example).
 *
 * ONE EDITOR, rendered only inside the open panel. The panels are what make these real tabs rather
 * than buttons that look like them (`aria-controls` has somewhere to point), and the editor is cheap
 * to mount: the files live in the provider, not in CodeMirror, so switching loses only the cursor.
 *
 * The code's own scroller wears the kit's scrollbar. CodeMirror creates `.cm-scroller` itself and
 * re-creates it whenever the editor remounts, so the class is applied on every mutation under the
 * pane rather than once.
 */
function EditorFiles({
  files,
  label,
  onShowPreview,
  strings,
}: {
  readonly files: readonly string[];
  readonly label: string;
  /** Present only while the tool shows one pane at a time; see the strip's own comment below. */
  readonly onShowPreview?: () => void;
  readonly strings: PlaygroundStrings;
}) {
  const { sandpack } = useSandpack();
  const active = files.includes(sandpack.activeFile) ? sandpack.activeFile : files[0]!;
  const paneRef = useRef<HTMLDivElement>(null);
  /*
   * COPIED, for as long as a reader needs to see that it worked. The same shape the documentation's
   * own copy button has (a face swap plus a timed reset); what is shared with it is the part worth
   * sharing - `writeClipboard`, the kit's one clipboard call with its pre-`navigator.clipboard`
   * fallback - rather than the markup, which decision 33 deliberately left to each consumer.
   */
  const [copied, setCopied] = useState<"idle" | "copied" | "error">("idle");
  const copiedTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    },
    [],
  );

  const codeOf = (path: string) => sandpack.files[path]?.code ?? "";

  const copyActive = () => {
    void writeClipboard(codeOf(active)).then((ok) => {
      setCopied(ok ? "copied" : "error");
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied("idle"), 1800);
    });
  };

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const dress = () => {
      /*
       * The tab strip is the second scroller in this pane, and it used to hide its scrollbar
       * outright: an example with more files than fit said nothing about the ones past the edge, and
       * on a phone that is one tab of two or three. Dressed with the same pattern as the code
       * scroller below it, which is this app's established answer for "this scrolls" - and one that
       * mirrors in RTL on its own, unlike a fade painted on a named side.
       */
      for (const scroller of pane.querySelectorAll(
        ".cm-scroller:not(.sk-scrollbar), .sk-tabs__list:not(.sk-scrollbar)",
      )) {
        scroller.classList.add("sk-scrollbar", "sk-scrollbar--reveal");
      }
    };
    dress();
    const observer = new MutationObserver(dress);
    observer.observe(pane, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="playground__files" ref={paneRef}>
      <Tabs
        aria-label={label}
        items={files.map((path) => ({
          value: path,
          label: path.replace(/^\//, ""),
          children:
            path === active ? <SandpackCodeEditor showLineNumbers showTabs={false} style={{ height: "100%" }} /> : null,
        }))}
        onValueChange={({ value }) => sandpack.setActiveFile(value)}
        value={active}
      />
      {/*
        IN THE TAB STRIP'S OWN ROW, at its end, with a column of its own: the strip scrolls when an
        example has more files than fit, and this must never be what it scrolls under. It sits in the
        header beside the tabs rather than floating over the code, so a long file list is clipped by
        its own scroller and stops at its edge (see the grid in `pages/index.astro`).

        It copies the file the tabs have OPEN, which is the one the reader is looking at: the strip
        is the only thing that picks another, and there is no second way to say which file.
      */}
      <div className="playground__file-actions">
        {/*
          THE WAY BACK TO THE PREVIEW, and only where the preview is not on screen at all: at
          `SINGLE_PANE_QUERY` the tool draws one pane, so this strip is the code pane's own header and
          the mirror of the `code` button in the preview's bar. `visibility` is the vocabulary's "see
          this" role, which is what the control does; it says nothing about what the demo looks like.
        */}
        {onShowPreview ? (
          <Tooltip content={strings.showPreview} placement="block-end">
            <Button
              aria-label={strings.showPreview}
              iconOnly
              onClick={onShowPreview}
              size="sm"
              variant="ghost"
            >
              <Icon name="visibility" size="sm" />
            </Button>
          </Tooltip>
        ) : null}
        {/*
          A KIT BUTTON, in the same three attributes every other icon control on this screen wears:
          ghost, `sm`, icon-only. `StateButton` is the composition the kit prescribes for a
          control whose icon reports state (decision 33: no `CopyButton` contract owns this markup
          any more), and it renders a real `.sk-button`, so the button's own shape rules apply to it
          the moment it is told which shape it is.
        */}
        <StateButton
          aria-label={copied === "copied" ? strings.copied : strings.copy}
          current={copied}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          faces={[
            { name: "idle", icon: "copy" },
            { name: "copied", icon: "check" },
            { name: "error", icon: "warning" },
          ]}
          onClick={copyActive}
        />
      </div>
    </div>
  );
}

/*
 * THE WAIT, IN THE KIT'S OWN LANGUAGE.
 *
 * Sandpack ships a loading overlay of its own and it is not wrong, it is just someone else's: a
 * spinner this site never uses, over a white pane, with a progress line in the corner. This one is
 * `Loader` - the same component every other wait in this kit is drawn with - on the canvas the
 * preview itself will paint once it is running, so the first frame of a sandbox looks like the
 * hundredth rather than like a blank browser window.
 *
 * TWO SIGNALS, because neither covers the whole wait. `useLoadingOverlayState` is Sandpack's own
 * (it listens for the bundler's `start` and `done` and fades afterwards), but it answers "HIDDEN"
 * while the client is still being CREATED - which is the first second or two, and exactly the part
 * that used to be a white rectangle. `sandpack.status` covers that opening; the overlay state covers
 * the compile and the fade.
 *
 * `TIMEOUT` is deliberately NOT covered: Sandpack renders its own "try again" panel for that, which
 * is an action the reader needs, and sitting a spinner on top of it would hide the way out.
 */
function PreviewLoading({ label }: { readonly label: string }) {
  const { sandpack } = useSandpack();
  const state = useLoadingOverlayState();

  if (state === "TIMEOUT") return null;
  if (state === "HIDDEN" && sandpack.status === "running") return null;

  return (
    /* `role="status"` on the box, and the Loader left decorative inside it: the component's own
     * contract says a labelled Loader IS the status, so labelling both would announce the wait
     * twice. */
    <div className="playground__preview-loading" data-fading={state === "FADING" ? "" : undefined} role="status">
      <Loader size="lg" />
      <p className="playground__preview-loading-label">{label}</p>
    </div>
  );
}

/*
 * THE PREVIEW'S OWN RELOAD, reachable from a bar that is not inside the sandbox.
 *
 * `useSandpackNavigation` is a hook, so it only exists under the provider, while the control that
 * uses it belongs in the tool's chrome above (the `ChromeSlot` portals), which renders during the wait
 * and the failure states too, where there is no provider at all. So the hook is consumed HERE, by a
 * component that renders nothing, and hands the one function out through a ref the bar can call.
 *
 * A ref and not state on purpose: the bar's button does not need to re-render when the client
 * reconnects, it only needs to reach whatever `refresh` is current the moment it is pressed, and
 * lifting a new function into state on every Sandpack reconnection would re-render the whole tool
 * for nothing.
 *
 * WHY A RELOAD AT ALL, when the bundler recompiles on every keystroke: recompiling is not
 * restarting. A demo that has been clicked into some state (a dialog left open, a form half filled,
 * a carousel three slides in) keeps that state across a recompile, and the reader who wants to see
 * the FIRST frame again has, until now, had to switch examples and come back.
 */
function PreviewControls({
  actionsRef,
}: {
  readonly actionsRef: RefObject<{ refresh: () => void } | null>;
}) {
  const { refresh } = useSandpackNavigation();

  useEffect(() => {
    actionsRef.current = { refresh };
    return () => {
      actionsRef.current = null;
    };
  }, [actionsRef, refresh]);

  return null;
}

/*
 * THE APP'S ICON SET, BOUND AROUND THE ISLAND, and it is the whole reason this export is a wrapper.
 *
 * An icon set is a consumer decision (`src/icons.ts`), and until this existed the decision could not
 * reach in here: everything the island draws goes through `@skryensya/react`'s `Icon`, which resolves
 * a stable name against whatever set is in context and falls back to the PACKAGE's default when
 * nothing bound one. So the tool's chrome was picked to match that default rather than the other way
 * round, and the day the package changed its mind the rail and the header would have come out in two
 * different drawings, silently, with nothing in this app edited.
 *
 * One provider at the top settles it: the same set `mountIcons` binds for the chrome outside the
 * island and the same one the sandbox's own documents load. The documentation's preview frame wraps
 * every React demo for exactly this reason (`component-preview-frame.ts`), which is the second time
 * the same gap was patched at the call site - the fix here is that the app now says it ONCE.
 */
export default function Playground(props: Props) {
  return (
    <IconSetProvider set={toolIcons}>
      <PlaygroundTool {...props} />
    </IconSetProvider>
  );
}

function PlaygroundTool({ catalogue, languages, strings }: Props) {
  /*
   * Empty until the catalogue lands, and the ids are held rather than the objects: the selection is
   * the reader's and must survive the fetch resolving, which replaces every object it points at.
   */
  const [handoff, setHandoff] = usePlaygroundHandoff();
  const [urlSelection] = useState<PlaygroundUrlSelection | null>(readPlaygroundUrlSelection);
  const [componentId, setComponentId] = useState(() => urlSelection?.componentId ?? "");
  const [exampleId, setExampleId] = useState(() => urlSelection?.exampleId ?? "");
  const [binding, setBinding] = useState<"react" | "vanilla">(() => urlSelection?.binding ?? "react");

  /*
   * SELECTING THE HANDOFF IS AN EFFECT, because the handoff now ARRIVES rather than being there.
   *
   * These four used to read it in their own initialisers: it came out of `sessionStorage`, which is
   * synchronous, so it was simply present on the first render or not at all. It crosses a
   * `postMessage` handshake now (the two apps are not necessarily the same origin), which means the
   * first render always shows whatever the address bar held and the handoff replaces it a tick later.
   *
   * It still WINS, which is the part that has not changed: it is the demo the reader just clicked,
   * and that outranks a URL this tab was carrying from a previous visit.
   */
  useEffect(() => {
    if (!handoff) return;
    setComponentId(handoffComponentId);
    setExampleId(handoffComponentId);
    setBinding("vanilla");
  }, [handoff]);
  /*
   * CLOSED WHERE IT WOULD EAT THE TOOL. The rail is a fixed 208px, and at phone width that left the
   * stage 222px of a 430px window: a code pane narrower than a line of JSX, with the rail showing a
   * catalogue the reader did not come here to read. Read once, on mount, and never again: from then
   * on it is the reader's toggle, and a window resize is not a request to reopen a rail they closed.
   */
  const [railHidden, setRailHidden] = useState(
    () => typeof window !== "undefined" && window.matchMedia(RAIL_OVERLAY_QUERY).matches,
  );
  /*
   * THE RAIL OVER THE STAGE, NOT BESIDE IT, below `60rem`. Live (not read-once like the initial
   * collapsed state above): this decides how an OPEN rail is drawn, so a window that narrows while it
   * is open has to move it out of flow rather than let it eat the editor it is sitting next to.
   */
  const railOverlays = useMediaQuery(RAIL_OVERLAY_QUERY);
  const singlePane = useMediaQuery(SINGLE_PANE_QUERY);
  /*
   * WHICH PANE, and it opens on the PREVIEW. A reader arriving from a docs preview on a phone came to
   * see the component run; editing is the deliberate second step, and the code is one tap away in the
   * preview's own bar. Not a stored preference: it only exists at widths where both panes cannot be
   * shown at once, and `paneLayout` beside it already remembers the arrangement for the widths where
   * they can.
   */
  const [mobilePane, setMobilePane] = useState<"code" | "preview">("preview");
  const [paneLayout, setPaneLayout] = useStoredPreference(paneLayoutPreference);
  const stacked = paneLayout === "stacked";
  const { bundles, blocked } = useBundles(catalogue);
  const components = useMemo(() => {
    const catalogueComponents = bundles?.components ?? [];
    if (!handoff) return catalogueComponents;

    return [
      {
        id: handoffComponentId,
        label: handoff.label,
        docs: handoff.docs,
        examples: [{ id: handoffComponentId, label: handoff.label, docs: handoff.docs }],
      },
      ...catalogueComponents,
    ];
  }, [bundles, handoff]);
  const { sandpack: sandpackTheme, colorScheme } = useThemeState();

  const component = components.find((entry) => entry.id === componentId) ?? components[0];
  const example = component?.examples.find((entry) => entry.id === exampleId) ?? component?.examples[0];

  /*
   * THE REAL SOURCE, one hop behind the selection. `component`/`example` above are the INDEX's -
   * enough to draw the rail and the header - and arrive with the catalogue on mount. This is the
   * detail fetch (`useComponentDetail`) resolved for whichever component is currently selected; it
   * lags behind a fresh selection by exactly one request, which is what the `!files` loading branch
   * near the bottom of this component is for.
   *
   * Keyed by `component.id` (the FALLBACK-resolved id `components[0]` defaults to before the reader
   * has clicked anything), not the raw `componentId` state - that state starts empty and stays empty
   * until a selection happens, while the rail and header already show `components[0]`. Keying the
   * fetch off the raw state would leave the very first component's detail - and its CSS - never
   * requested.
   */
  const selectedId = component?.id ?? "";
  const detailCache = useComponentDetail(catalogue, selectedId);
  const detail =
    selectedId === handoffComponentId && handoff ? handoffDetail(handoff) : detailCache.get(selectedId);
  const sourceExample = detail?.examples.find((entry) => entry.id === example?.id);

  /* The catalogue, as the tree sees it: a component is a branch, its examples are the leaves. */
  const nodes = useMemo(
    () =>
      components.map((entry) => ({
        id: entry.id,
        label: entry.label,
        children: entry.examples.map((item) => ({
          id: leafId(entry.id, item.id),
          label: item.label,
        })),
      })),
    [components],
  );

  /*
   * WHICH BRANCHES ARE OPEN IS THE TOOL'S NOW, not the tree's own uncontrolled state, and the search
   * palette is why. A reader who picks "Ghost" out of ⌘K lands on that example in the stage while
   * the rail, if Button happened to be closed, would still be showing them no sign of where they
   * are. Controlled, `selectFromSearch` can open the branch it just selected into.
   *
   * Seeded rather than initialised: the first component only exists once the catalogue lands, and
   * the seeding effect below leaves alone anything the reader has already opened or closed.
   */
  const [expandedValue, setExpandedValue] = useState<string[]>(() =>
    urlSelection?.componentId ? [urlSelection.componentId] : [],
  );

  /*
   * ONLY THE FIRST ONE OPEN, once there is a first one. Expanding every branch was right when the
   * catalogue was one component; at fifty-nine it puts a hundred and forty rows on screen at once
   * and the rail becomes a wall to scroll rather than an index to scan. The rest is the reader's to
   * open, which is the whole reason this is a tree.
   */
  const firstComponentId = components[0]?.id;
  useEffect(() => {
    if (!firstComponentId) return;
    setExpandedValue((current) => (current.length ? current : [firstComponentId]));
  }, [firstComponentId]);

  /*
   * Only a LEAF is a selection. Clicking a component's own row expands it, which is what a branch
   * control is for, and the machine reports that as a selection all the same - acting on it would
   * swap the sandbox for whatever example happened to be first, which nobody asked for.
   *
   * A DIRTY EDITOR GETS A KIT DIALOG FIRST, not the switch itself. `hasEditsRef` (below) already knew
   * whether the reader had typed anything; until now it only fed the tab-close warning, so picking a
   * different example silently threw away those edits with no chance to say no. The confirmation is
   * `Dialog` (the same contract `/componentes/dialog`'s own "delete this project?" demo uses), never
   * `window.confirm`: this fires from inside the tool itself, nothing here forces the platform's own
   * unstyled prompt the way an actual page unload does (see the `beforeunload` guard's own comment).
   * The pending pair sits in a ref rather than being applied straight away - `select()` may run again
   * before the reader answers, and the LATEST click is the one the dialog should resolve.
   */
  const select = (details: { selectedValue: string[] }) => {
    const [componentPart, examplePart] = (details.selectedValue[0] ?? "").split("/");
    if (!componentPart || !examplePart) return;
    if (componentPart === componentId && examplePart === exampleId) return;

    if (hasEditsRef.current) {
      pendingSelectionRef.current = { componentId: componentPart, exampleId: examplePart };
      const dialog = document.getElementById(discardDialogId);
      if (dialog instanceof HTMLDialogElement) dialog.showModal();
      return;
    }

    if (componentPart !== handoffComponentId) setHandoff(null);
    setComponentId(componentPart);
    setExampleId(examplePart);
    /* A rail drawn OVER the stage is covering the thing it just changed, so picking closes it. Beside
       the stage it covers nothing, and closing it there would undo a choice the reader never made. */
    if (railOverlays) setRailHidden(true);
  };

  /**
   * Runs once the discard dialog closes, however it closed: the confirm button, cancel, Escape or a
   * light-dismiss click on the backdrop all end up here, and `returnValue` is the platform's own way
   * to tell them apart (set by whichever `<button type="submit" value="…">` inside the `method="dialog"`
   * form actually submitted it; Escape and light-dismiss leave it empty, which reads as "cancel").
   */
  const handleDiscardDialogClose = (event: SyntheticEvent<HTMLDialogElement>) => {
    const pending = pendingSelectionRef.current;
    pendingSelectionRef.current = null;
    if (!pending || event.currentTarget.returnValue !== "confirm") return;

    hasEditsRef.current = false;
    if (pending.componentId !== handoffComponentId) setHandoff(null);
    setComponentId(pending.componentId);
    setExampleId(pending.exampleId);
  };

  /*
   * THE CATALOGUE AS AN INDEX TO SEARCH, which is the second shape the same data has to take.
   *
   * The rail is a tree because that is what the catalogue IS: a component has examples, and an
   * example belongs to one component. But a tree answers "show me what Button has" and not "where
   * was the example with the ghost buttons in it", and past fifty-nine components the second
   * question is the common one. Both shapes, one source: these entries are the same nodes, flattened,
   * with the component's own name carried along as each row's context so a query can reach an example
   * through either half of its name.
   *
   * The handoff is deliberately absent. `preview` names no catalogue entry (see
   * `writePlaygroundUrlSelection`), so a row for it would be a search result pointing at a demo that
   * exists only in this tab, in this session.
   *
   * The href is a REAL playground address rather than a synthetic key: it is what a row would carry
   * if this palette navigated the way the docs' own does, it is unique per example (which is all
   * React's `key` needs), and it is what `selectFromSearch` reads the pair back out of.
   */
  const searchEntries = useMemo<readonly CommandPaletteEntry[]>(
    () =>
      components
        .filter((entry) => entry.id !== handoffComponentId)
        .flatMap((entry) =>
          entry.examples.map((item) => ({
            label: item.label,
            context: entry.label,
            /* The component's name matches as a NAME and not only as context: "button" should rank
             * every Button example above a page that merely mentions one. */
            aliases: [entry.label],
            href: `?${COMPONENT_PARAM}=${encodeURIComponent(entry.id)}&${EXAMPLE_PARAM}=${encodeURIComponent(item.id)}`,
          })),
        ),
    [components],
  );

  /*
   * ESCAPE CLOSES THE OVERLAID RAIL, which is what anything drawn over the page owes a keyboard. Only
   * while it IS overlaid: beside the stage the rail is ordinary layout, and Escape there would close a
   * panel the reader parked open on purpose. The palette and the discard prompt are real `<dialog>`s
   * and take Escape themselves before it reaches the document, so this cannot steal theirs.
   */
  useEffect(() => {
    if (!railOverlays || railHidden) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRailHidden(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [railOverlays, railHidden]);

  /*
   * THE RAIL'S SWITCH, in the one place that is still there when the rail is not. Authored here
   * rather than inline so the waiting shell above can portal the SAME control: the bar is the tool's
   * furniture, and furniture that arrives one control at a time reads as a page still loading long
   * after the tool is usable.
   */
  const railToggle = (
    <button
      aria-expanded={!railHidden}
      aria-label={railHidden ? strings.showRail : strings.hideRail}
      className="sk-button sk-interactive"
      data-icon-only=""
      /* `md`, like every other control in this row. At `sm` it was a 32px button sitting beside three
         44px ones - the first thing in the bar, and the one that looked left out of it. */
      data-size="md"
      data-variant="ghost"
      onClick={() => setRailHidden((hidden) => !hidden)}
      type="button"
    >
      {/* The kit's own answer for this control: `SidebarTrigger`'s demo and the site's drawer trigger
          both draw it with `menu`. A shape drawn by hand here would be a second icon vocabulary. */}
      <Icon name="menu" />
    </button>
  );

  /*
   * WHICH BINDING, authored once and rendered in one of two places: the chrome's centre column where
   * the row has the width for it, the rail's own header where it does not (below `60rem`). Same
   * element, same state, one home per width - never two copies to keep in step.
   */
  const bindingSwitch = (
    <SegmentedControl
      label={strings.bindingLabel}
      onValueChange={(next) => setBinding(next as "react" | "vanilla")}
      options={
        component && component.id !== handoffComponentId
          ? [
              { label: strings.react, value: "react" },
              { label: strings.vanilla, value: "vanilla" },
            ]
          : [{ label: strings.vanilla, value: "vanilla" }]
      }
      value={binding}
    />
  );

  /** The palette is a `<dialog>` like the discard confirmation beside it, and it is opened the way
   *  the platform opens one: `showModal()` on the node, the only call that lights the backdrop and
   *  traps focus. */
  const openSearch = useCallback(() => {
    const dialog = document.getElementById(searchDialogId);
    if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
  }, []);

  /*
   * ⌘K, from the kit's own primitive rather than a `keydown` listener written here: `useHotkey`
   * carries the platform detection, the parsing and the "not while typing" rule that the badge in
   * the bar (`formatHotkey`, below) is rendered from, so the shortcut and the hint it advertises can
   * only ever come from the same string.
   */
  useHotkey("mod+k", openSearch);

  /** A palette row, applied: the same path as clicking the rail (edits are still confirmed first),
   *  plus opening the branch it lives in so the rail agrees with the stage about where we are. */
  const selectFromSearch = (entry: CommandPaletteEntry) => {
    const params = new URLSearchParams(entry.href.startsWith("?") ? entry.href.slice(1) : entry.href);
    const componentPart = params.get(COMPONENT_PARAM);
    const examplePart = params.get(EXAMPLE_PARAM);
    if (!componentPart || !examplePart) return;

    setExpandedValue((current) => (current.includes(componentPart) ? current : [...current, componentPart]));
    select({ selectedValue: [leafId(componentPart, examplePart)] });
  };

  /** The badge in the bar, in the reader's own platform: ⌘K on a Mac, Ctrl+K everywhere else. Read
   *  once, on the client, because this island never renders on the server (`client:only`). */
  const hotkeyLabel = useMemo(() => formatHotkey("mod+k", detectMac()), []);

  /** What the bar's reload button calls, once there is a running client to call it on. */
  const previewActionsRef = useRef<{ refresh: () => void } | null>(null);

  /*
   * THE ADDRESS BAR, KEPT IN SYNC - keyed off `component`/`example` (the FALLBACK-resolved values),
   * not the raw `componentId`/`exampleId` state, for the same reason `useComponentDetail` above is:
   * the reader sees `components[0]` before ever clicking anything, and a link copied at that moment
   * should reproduce what is actually on screen rather than a blank selection that resolves
   * differently once the catalogue reloads in whatever order it happens to arrive in.
   */
  useEffect(() => {
    if (!component || !example) return;
    writePlaygroundUrlSelection(component.id, example.id, binding);
  }, [component?.id, example?.id, binding]);

  /*
   * Keyed by everything that changes what the sandbox IS. Sandpack keeps its own copy of the files
   * once mounted and treats later prop changes as the user's edits to undo, so switching example
   * without remounting leaves the previous code in the editor. A key is the React-shaped way to say
   * "this is a different sandbox", and it also throws away edits on purpose: a reader who moves to
   * another example is asking for that example, not for their last one patched.
   *
   * `colorScheme` earns its place here for the same reason: the `color-scheme` line `previewBodyCss`
   * writes only reaches the sandboxed preview inside a FILE, and a file-only change is exactly the
   * kind of prop update Sandpack ignores once mounted (the paragraph above). Flipping the reader's
   * mode has to remount the sandbox to actually repaint the preview, the same trade the example
   * switch already makes.
   */
  /*
   * WHAT MAKES IT A DIFFERENT SANDBOX, and nothing else.
   *
   * This used to include the component and the example, so picking a sibling example tore the whole
   * thing down and built it again: new iframe, npm install of react, every module transpiled from
   * scratch. Measured at ~5.2s per click, on a rail whose entire purpose is clicking through
   * examples. The binding really is a different sandbox (a different template, a different set of
   * files) and the theme is rebuilt from resolved colours, so those two stay; the example is just
   * different CONTENT for the same sandbox, and `FileSync` below pushes it in.
   */
  const key = `${binding}:${colorScheme}`;

  /** The one file that changes when the reader picks another example. */
  const entryPath = binding === "react" ? "/App.tsx" : "/index.html";
  const entryCode = binding === "react" ? sourceExample?.react : sourceExample?.vanilla;

  /** The example's own files, in the order the file tabs show them: the entry first, then what it loads. */
  const editorFiles =
    binding === "react"
      ? [entryPath, ...(sourceExample?.reactData ? [sourceExample.reactData.path] : [])]
      : [entryPath, vanillaScriptPath];

  /* The VANILLA source for both bindings, deliberately: see `detectPartNames`. It is the same tree
     either way, and reading one of them is what keeps the two previews painted by the same sheets. */
  const names = useMemo(() => detectPartNames(sourceExample?.vanilla ?? ""), [sourceExample]);
  const { css: componentCss, ready: cssReady } = useComponentCss(bundles?.cssManifest ?? null, names);

  const files = useMemo(() => {
    if (!bundles || !sourceExample || !cssReady) return null;
    const previewCss =
      `${bundles.foundation}\n\n${componentCss}\n\n${scrollbarCss}` + previewBodyCss(colorScheme);

    return binding === "react"
      ? {
          "/App.tsx": { code: sourceExample.react },
          // Visible, not hidden: the entry imports it by name and the reader should be able to edit
          // the data as readily as the composition - it is half of what the example is.
          ...(sourceExample.reactData
            ? { [sourceExample.reactData.path]: { code: sourceExample.reactData.code } }
            : {}),
          ...reactPackageFiles(bundles.react),
          "/styles.css": { code: previewCss, hidden: true },
          // The template's entry, rewritten only to pull the kit's stylesheet in beside React's own.
          "/index.tsx": {
            code: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

// Same line the Vanilla entry writes (\`lib/vanilla-script.ts\`): the kit's scrollbar is opt-in by
// class on the scrolling element, and this document has no shell to write it for it.
document.documentElement.classList.add("sk-scrollbar");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
            hidden: true,
          },
        }
      : {
          "/index.html": { code: sourceExample.vanilla },
          // Its own file, so the markup and the script sit in two tabs. It is also the bundler's
          // entry (`customSetup` below), so a handoff from a docs preview gets it too.
          [vanillaScriptPath]: { code: vanillaScriptSource },
          ...vanillaPackageFiles(bundles.vanilla, previewCss),
        };
  }, [bundles, binding, sourceExample, colorScheme, componentCss, cssReady]);

  /*
   * "Has the reader typed anything since this sandbox mounted", tracked coarsely rather than by
   * diffing content against the original files. Sandpack's own accurate signal - `editorState`
   * (`"pristine" | "dirty"` from `useSandpack()`) - only exists inside a `<SandpackProvider>` tree,
   * and the shorthand `<Sandpack>` below renders its own and gives this component no way to reach
   * in. A bubbling `input` event from CodeMirror's own editable region is a coarser but honest
   * enough proxy: it fires exactly when the reader has touched the keyboard inside the editor,
   * which is the moment losing the tab without asking would lose something they typed.
   *
   * Reset when the sandbox is replaced AND when the example inside it changes: the second is now a
   * separate event, because switching example no longer remounts anything (see `key`). Either way a
   * stale `true` must not warn about edits that are already gone.
   */
  const hasEditsRef = useRef(false);
  const editorListenerCleanupRef = useRef<(() => void) | null>(null);
  /** The selection `select()` stashed while the discard dialog decides its fate. See `select()` and
   *  `handleDiscardDialogClose`, above. */
  const pendingSelectionRef = useRef<{ componentId: string; exampleId: string } | null>(null);

  useEffect(() => {
    hasEditsRef.current = false;
  }, [key, entryPath, entryCode]);

  /*
   * A CALLBACK ref, not `useRef` + a `[]`-deps effect: the container only exists once `bundles`
   * and `files` are ready (the early "loading"/"blocked" returns below render no `.playground__editor`
   * at all), so a plain effect with empty deps would run on THAT first commit, find nothing to
   * attach to, and never fire again for the rest of the component's life once the real container
   * finally mounts. A callback ref runs exactly when React attaches (and detaches) the node itself,
   * whichever render that turns out to be.
   */
  const attachEditorListener = useCallback((node: HTMLDivElement | null) => {
    editorListenerCleanupRef.current?.();
    editorListenerCleanupRef.current = null;
    if (!node) return;
    const onInput = () => {
      hasEditsRef.current = true;
    };
    // Capture phase: CodeMirror's editable region is several nodes deep, and capture means this
    // one listener sees it regardless of exactly which descendant Sandpack remounts underneath.
    node.addEventListener("input", onInput, true);
    editorListenerCleanupRef.current = () => node.removeEventListener("input", onInput, true);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasEditsRef.current) return;
      event.preventDefault();
      // Chrome still requires assigning returnValue to trigger its own generic "leave site?"
      // prompt; no browser has shown a custom message here in years, so the string is unused.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  /*
   * Before the catalogue lands there is no rail to draw and no example to open, but there IS
   * something to say - the fetch is the slowest thing on this page, and a blank screen while it runs
   * is indistinguishable from the page being broken (which is exactly how the blocked-bundler case
   * used to look).
   */
  if (!component || !example) {
    return (
      /*
       * THE SAME SHELL, WAITING. This branch used to render the stage alone, so the rail did not
       * exist for the ~600ms between the island mounting and the catalogue landing (measured on a
       * cold load: the stage was up at 1323ms, the rail arrived at 1926ms) and then appeared, moving
       * everything beside it. A panel that is loading should be a panel that is loading - same box,
       * same width, same full height - not a hole that fills in.
       *
       * Its content is what is genuinely unknown: no tree yet, and no binding switch either when
       * that switch lives in here, because both are read off a catalogue that has not arrived.
       */
      <div className="playground">
        <Sidebar
          className="playground__rail"
          collapsed={railHidden}
          maxInlineSize="24rem"
          minInlineSize="8rem"
          onCollapsedChange={(details) => setRailHidden(details.collapsed)}
          storageKey="playground-rail"
        >
          <SidebarContent className="sk-scrollbar sk-scrollbar--reveal">
            <span className="playground__rail-waiting" />
          </SidebarContent>
          <SidebarResizeHandle label={strings.resizeRail} />
        </Sidebar>

        <ChromeSlot name="rail">{railToggle}</ChromeSlot>

        <div className="playground__stage">
          <p className="playground__state" role="status">
            {blocked === "bundler" ? strings.offline : blocked ? strings.failed : strings.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="playground">
      {/*
        THE RAIL IS THE COMPONENT, with the two things a tool's rail needs and the docs' own does
        not: a drag edge and a way out.

        `SidebarResizeHandle` is the switch as well as the affordance - the stylesheet reads
        `:has()` on it, so the sidebar is resizable BECAUSE it is here. The bounds are per-instance
        on purpose (they are this screen's, not the system's): an editor beside it wants to give the
        code more room than a docs page ever does, so the floor is tighter and the ceiling higher
        than the kit's 11–20rem default. The width itself is a custom property clamped in CSS, which
        is why a drag moves at pointer speed rather than at render speed.

        CONTROLLED, and the toggle lives up in the bar rather than in a `SidebarHeader` here. The
        kit's own trigger sits inside the panel, which is right when collapsing NARROWS it to a rail
        of icons; this rail collapses to nothing (see the stylesheet for why), and a control inside a
        panel that is gone cannot bring it back.
      */}
      <Sidebar
        className="playground__rail"
        collapsed={railHidden}
        maxInlineSize="24rem"
        minInlineSize="8rem"
        onCollapsedChange={(details) => setRailHidden(details.collapsed)}
        storageKey="playground-rail"
      >
        {/*
          THE RAIL IS AT THE SYSTEM'S OWN DENSITY, and it used to be at 0.72 - the same scope
          `ComponentPreview` puts on its source tabs, which drove a row to exactly 24px, the floor
          `--size-control-sm` refuses to go below (WCAG 2.2 SC 2.5.8). It was chosen when the tool
          wore two bars and every pixel was being fought over; sixty rows at the accessible MINIMUM,
          six pixels apart, read as a wall rather than as a list, and a catalogue you scan is the one
          thing this rail is for. At 1 a row is 32px with 8px between rows, which is the same rhythm
          as every other rail in the kit.
        */}
        {/*
          THE BINDING SWITCH, IN THE RAIL, at the widths where the rail is a drawer. It belongs to the
          same question the tree answers - which example, in which language - and putting it in this
          panel's own header is what let the chrome go back to a single row on a phone. Above `60rem`
          it is in the bar instead and this header does not exist: the rail is a column beside the
          editor there, and a control parked in it would be one the reader can collapse away.
        */}
        {railOverlays ? (
          <SidebarHeader className="playground__rail-binding">{bindingSwitch}</SidebarHeader>
        ) : null}
        <SidebarContent className="sk-scrollbar sk-scrollbar--reveal">
          {/*
            A TREE, not a list of links, because the shape of this catalogue IS a tree: a component
            has examples, and an example belongs to exactly one component. NavList could only render
            that as flat groups, which says the same thing with less: no collapsing a family you are
            not working in, no arrow-key walk from one component to the next, and every example of
            every component on screen at once as the catalogue grows past Button.

            It is also the right ARIA. A `role="tree"` announces the level and the expanded state of
            each row; a list of links announces neither, and a reader arriving on "Solo icono" would
            have no way to hear which component it belongs to.
          */}
          {/*
            DRESSED LIKE THE REFERENCE TAB'S TREE, deliberately: folder on a branch, file on a leaf,
            and the default `›` indicator that the stylesheet rotates on open. Same three choices
            `lib/source-tree.ts` makes for the source browser under Referencia.

            One tree in a rail should look like every other tree in a rail. A reader who has used the
            source browser already knows what a row with a chevron does here, and a second visual
            convention for the same component would make them learn it twice.
          */}
          <TreeView
            branchIcon={<Icon name="folder" size="sm" />}
            /* Controlled, so a pick out of the search palette can open the branch it landed in. The
             * seeding (only the first component open) is up where that state lives. */
            expandedValue={expandedValue}
            label={strings.componentsLabel}
            leafIcon={<Icon name="file" size="sm" />}
            nodes={nodes}
            onExpandedChange={(details) => setExpandedValue(details.expandedValue)}
            onSelectionChange={select}
            selectedValue={[leafId(component.id, example.id)]}
          />
        </SidebarContent>
        <SidebarResizeHandle label={strings.resizeRail} />
      </Sidebar>

      {/*
        THE SCRIM UNDER AN OVERLAID RAIL: the tap target that closes it, and the dimming that says the
        stage behind is out of reach for the moment. A real `<button>` rather than a div with a
        handler, so it is one Tab stop with a name and closes on Enter like any other control.
      */}
      {railOverlays && !railHidden ? (
        <button
          aria-label={strings.hideRail}
          className="playground__rail-scrim"
          onClick={() => setRailHidden(true)}
          type="button"
        />
      ) : null}

      <div
        className="playground__stage"
        data-mobile-pane={singlePane ? mobilePane : undefined}
        data-pane-layout={paneLayout}
      >
        <ChromeSlot name="rail">{railToggle}</ChromeSlot>

        <ChromeSlot name="context">
          <div className="playground__heading">
            {/* `data-flush` is the docs site's opt-out from its global `h1:not([data-flush])` rule,
                which outranks a class and would typeset this at display size. This app no longer
                loads that stylesheet (`layouts/Tool.astro` replaced the docs shell), so the
                attribute is inert here; it stays because the markup is still the docs' to read when
                a page of theirs embeds this island, and an inert attribute costs nothing where a
                missing one costs a display-sized heading. */}
            <h1 className="playground__title" data-flush>
              {component.label}
            </h1>
            <p className="playground__example">{example.label}</p>
          </div>
        </ChromeSlot>

        {/*
          WHICH BINDING, ON THE ROW'S CENTRE LINE. It asks the same question the heading does ("what
          am I looking at") rather than doing something to the preview, and it is the only control in
          the bar that changes the example itself - so it gets the one position a row has that is not
          an end: the middle (`playground-chrome__binding`, sized by the grid in `tool.css`).

          EXCEPT BELOW `60rem`, where it is rendered in the rail instead (see the Sidebar above) and
          this slot draws nothing. It is 124px wide, which a phone's row cannot spare: with it in the
          bar the row wrapped, and the rail is where the OTHER "which example am I looking at" control
          already lives. One control either way, moved rather than duplicated.
        */}
        <ChromeSlot name="binding">{railOverlays ? null : bindingSwitch}</ChromeSlot>

        {/*
          THE LANGUAGE SWITCH, AS A MENU, and first in the row's trailing group.

          It used to be a link straight to the other translation, which works exactly while there are
          two and says nothing about which one you are reading. A Menu names them, marks the current
          one (`kind: "radio"` + `checked`, so a screen reader hears the state rather than seeing a
          tick), and a third locale becomes one more row instead of a rewrite. Every row is a real
          `<a href>`; Zag activates it as a link. The same shape as the documentation's own
          `LanguageMenu`, rendered here from the island because that is where this bar's controls live.
        */}
        <ChromeSlot name="language">
          <Menu
            label={strings.language}
            items={languages.map((entry) => ({
              value: entry.value,
              label: entry.label,
              href: entry.href,
              kind: "radio" as const,
              checked: entry.current,
            }))}
            /* The trigger is the glyph and nothing else. `indicator={null}` is the contract's own
               opt-out (menu.tsx: the chevron is the default, not an opt-in), and it is right here: a
               chevron earns its place on a trigger whose LABEL needs the hint that more is behind it,
               while this one is a 44px square in a row of 44px squares - a second glyph inside it
               reads as two icons, not as one control. */
            indicator={null}
            trigger={<Icon name="language" />}
            triggerIconOnly
            triggerLabel={`${strings.language}: ${
              languages.find((entry) => entry.current)?.label ?? ""
            }`}
            triggerVariant="ghost"
          />
        </ChromeSlot>

        <ChromeSlot name="search">
          {singlePane ? (
            /*
              SEARCH, AS A BUTTON, below `48rem`, and this is the same swap the documentation makes in
              its own header at its own narrow width. A field earns an input's mobile quirks (a
              keyboard that may open, a caret, autofill's attention) only while it is SHOWING the two
              things that make it a field: a placeholder and the ⌘K hint. Collapsed to its icon it is
              showing neither, so what is left is a button that opens a dialog - and a button is what
              it should be built as, with the kit's own control rather than an input dressed down.

              No ⌘K badge here either: a phone has no ⌘, and the shortcut stays advertised through
              `aria-keyshortcuts` for the keyboards that do.
            */
            <Button
              aria-controls={searchDialogId}
              aria-keyshortcuts="Meta+K Control+K"
              aria-label={strings.search}
              iconOnly
              onClick={openSearch}
              variant="ghost"
            >
              <Icon name="search" />
            </Button>
          ) : (
            <>
            {/*
              SEARCH, AS A FIELD, which is the same control the documentation's own header carries
              (`Base.astro` + `.dimensions__search-trigger`) and for the same reasons written out in
              `search-trigger.ts`: a real `<input>` rather than a button, because a button brings its
              `:active` squeeze and its raised shadow along, and neither belongs on something that
              reads as a box you type into. `readonly` + `inputmode="none"` keep it from ever taking a
              query, because the real query box is the palette's own, opened on top of this one.

              The ⌘K badge is not decoration: it is the only place the shortcut is advertised, and it
              is rendered from the same string `useHotkey` binds (`hotkeyLabel`, above), so the two
              cannot drift apart.

              OPENED ON CLICK AND ON ENTER/SPACE, never on FOCUS, which is the one trap this shape
              has: closing the palette returns focus to whatever opened it (the platform's own
              `<dialog>` behaviour), so a focus handler would reopen it in the same tick and Escape
              would look like it did nothing. A keydown has no such loop, since closing a dialog
              synthesizes a focus event and never a keypress.
            */}
            <div className="playground-chrome__search-field">
              {/* The default size, which is the same call the documentation's own header makes
                  (`iconMarkup("search")`, no size): one component, one size, and the same
                  `--space-inline-sm` between it and the placeholder. An `sm` icon here made the
                  field read as a smaller control than the one it is a copy of. */}
              <Icon name="search" />
              <input
                aria-controls={searchDialogId}
                aria-keyshortcuts="Meta+K Control+K"
                aria-label={strings.search}
                autoComplete="off"
                className="playground-chrome__search-input"
                inputMode="none"
                onClick={openSearch}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  openSearch();
                }}
                placeholder={strings.search}
                readOnly
                type="text"
              />
              {/* Hidden from the accessibility tree: the shortcut is already announced by
                  `aria-keyshortcuts` on the field, and a keycap read aloud after the label would say
                  it a second time in a vocabulary screen readers pronounce badly. */}
              <Kbd aria-hidden="true">{hotkeyLabel}</Kbd>
            </div>
            </>
          )}
        </ChromeSlot>

        {blocked ? (
          <p className="playground__state" role="status">
            {blocked === "bundler" ? strings.offline : strings.failed}
          </p>
        ) : !files ? (
          <p className="playground__state" role="status">
            {strings.loading}
          </p>
        ) : (
          // `display: contents` (playground.astro): invisible to the flex layout that already
          // sizes `.sp-wrapper` to fill this space, so it exists only as a stable node the
          // `input` listener above can bind to across Sandpack's own remounts.
          <div className="playground__editor" ref={attachEditorListener}>
            {/*
              The composed API rather than the `<Sandpack>` shorthand, and the reason is the speed:
              the shorthand owns its provider, so the only way to change what it runs is to hand it
              new files, which it treats as a new sandbox. With the provider here, `FileSync` can
              reach the running one and replace a single file.
            */}
            <SandpackProvider
              files={files}
              key={key}
              options={{ recompileMode: "immediate" }}
              /*
               * `react-ts`, not `react`, because the emitter writes TYPESCRIPT: a demo that needs a
               * custom property on `style` emits `as CSSProperties`, and Babel parsing that inside a
               * `.js` file dies with "Unexpected token" before anything renders. The snippet a
               * component page shows is TSX; the sandbox that runs it has to be too.
               */
              template={binding === "react" ? "react-ts" : "vanilla"}
              /* `vanilla` is the bundled template (Sandpack's own bundler, like `react-ts`), so
                 `main.js` resolves the kit through `node_modules` as a consumer's Vite would. Its
                 default entry is `/index.js`; the example names its script `main.js`. */
              customSetup={binding === "react" ? undefined : { entry: vanillaScriptPath }}
              theme={sandpackTheme}
            >
              <FileSync
                code={entryCode ?? ""}
                path={entryPath}
                data={binding === "react" ? sourceExample?.reactData : undefined}
              />
              {/* Renders nothing; it is how the bar's reload button reaches the running client. */}
              <PreviewControls actionsRef={previewActionsRef} />
              <SandpackLayout>
                <EditorFiles
                  files={editorFiles}
                  label={strings.filesLabel}
                  onShowPreview={singlePane ? () => setMobilePane("preview") : undefined}
                  strings={strings}
                />
                {/*
                  Between the two panes, and it resizes the one before it. See `PaneSplitter`.

                  KEYED BY THE LAYOUT, so flipping the arrangement gives the splitter for that axis a
                  fresh mount: it restores its own remembered size (the two axes are two preferences,
                  for the reason that file gives) and takes its first measurement on the pane as it
                  now stands, both of which happen at mount and neither of which a prop change can
                  stand in for.
                */}
                <PaneSplitter
                  key={paneLayout}
                  label={stacked ? strings.resizePanesBlock : strings.resizePanes}
                  orientation={stacked ? "horizontal" : "vertical"}
                />
                {/*
                  `showOpenInCodeSandbox={false}`: the button opens a COPY of this sandbox on
                  codesandbox.io, which is a different product with a different kit in it, and it sat
                  in the corner of every example plus in the middle of every wait. The way out of
                  this tool is the documentation link in the bar above.
                */}
                {/*
                  `height: 100%` is what makes the preview fill the row when the panes sit side by
                  side, and is exactly wrong when they are stacked: in a column, height IS the main
                  size, so a pane asking for the container's full height would push the editor off
                  the bottom instead of sharing the space the splitter divided. Stacked, it takes
                  what the editor left (`flex: 1`) with a floor of nothing, which is the same thing
                  said on the other axis.
                */}
                {/*
                  THE PREVIEW PANE, WITH A BAR OF ITS OWN.

                  These three controls do something to the RUNNING DEMO and nothing to anything else:
                  reload it, flip which side it sits on, and leave for the page that documents it. In
                  the tool's top row they read as global chrome and sat a full window away from the
                  thing they act on; here they are the pane's own header, the way the file tabs are
                  the editor's. The pane is what Sandpack's row sizes, so the wrapper takes the sizing
                  the preview used to carry and the preview fills what the bar leaves.
                */}
                <div className="playground__preview" data-pane-layout={paneLayout}>
                  <div className="playground__preview-bar">
                    <div className="playground__preview-tools">
                      <Tooltip content={strings.reload} placement="block-end">
                        <Button
                          aria-label={strings.reload}
                          disabled={!files || Boolean(blocked)}
                          iconOnly
                          onClick={() => previewActionsRef.current?.refresh()}
                          size="sm"
                          /*
                           * `soft`, not `ghost`: this pane's bar has no other chrome in it, and a
                           * borderless icon on a plain strip does not read as a control until you
                           * hover it. `soft` is the kit's own quiet-but-bordered emphasis (a subtle
                           * ring over a surface fill), which is the same answer CopyButton reaches
                           * for over a code panel.
                           */
                          variant="soft"
                        >
                          {/* One circular arrow, not the vocabulary's two-arrow cycle: see `reloadIcon`. */}
                          <Icon data={reloadIcon} size="sm" />
                        </Button>
                      </Tooltip>
                      {/*
                        ONE SLOT, TWO QUESTIONS, decided by whether both panes fit at once. Wide, the
                        question is WHERE the preview sits and this flips the arrangement. Narrow,
                        only one pane is drawn at a time (`SINGLE_PANE_QUERY`), so "beside or below"
                        has no answer and the useful control in its place is the way to the other
                        pane. Same position either way: the pane's own bar, acting on the pane.
                      */}
                      <Tooltip
                        content={
                          singlePane
                            ? strings.showCode
                            : stacked
                              ? strings.layoutSideBySide
                              : strings.layoutStacked
                        }
                        placement="block-end"
                      >
                        <Button
                          aria-label={
                            singlePane
                              ? strings.showCode
                              : stacked
                                ? strings.layoutSideBySide
                                : strings.layoutStacked
                          }
                          iconOnly
                          onClick={() =>
                            singlePane
                              ? setMobilePane("code")
                              : setPaneLayout(stacked ? "side-by-side" : "stacked")
                          }
                          size="sm"
                          variant="soft"
                        >
                          {singlePane ? (
                            <Icon name="code" size="sm" />
                          ) : (
                            <Icon data={stacked ? splitVerticalIcon : splitHorizontalIcon} size="sm" />
                          )}
                        </Button>
                      </Tooltip>
                    </div>
                    {(example.docs || component.docs) && (
                      <Button
                        className="playground__docs-link"
                        href={example.docs || component.docs}
                        post={<Icon name="external-link" size="sm" />}
                        rel="noopener noreferrer"
                        size="sm"
                        target="_blank"
                        variant="ghost"
                      >
                        {strings.docsLink}
                      </Button>
                    )}
                  </div>
                  <SandpackPreview showOpenInCodeSandbox={false} style={{ flex: "1 1 0", minBlockSize: 0 }}>
                    <PreviewLoading label={strings.loading} />
                  </SandpackPreview>
                </div>
              </SandpackLayout>
            </SandpackProvider>
          </div>
        )}
      </div>

      {/*
        THE DISCARD CONFIRMATION, opened by `select()` above and never rendered inline in the rail:
        a reader picking a sibling example is the one in-tool action that can throw away typed edits
        with no browser navigation involved at all, so it is the one place this screen owns a
        confirmation of its own rather than leaning on the platform's `beforeunload` prompt (which
        cannot be skinned - see that guard's own comment). `Dialog` is the same contract
        `/componentes/dialog`'s own confirmation demo composes; this is not a second implementation
        of "are you sure", it is that one, reused.
      */}
      <Dialog
        closeLabel={strings.discardCancel}
        footer={
          <>
            <Button autoFocus type="submit" value="cancel" variant="ghost">
              {strings.discardCancel}
            </Button>
            <Button type="submit" value="confirm" tone="danger">
              {strings.discardConfirm}
            </Button>
          </>
        }
        id={discardDialogId}
        onClose={handleDiscardDialogClose}
        title={strings.discardTitle}
      >
        {strings.discardBody}
      </Dialog>

      {/*
        THE SEARCH PALETTE, and it is the kit's own: the same contract the documentation's ⌘K
        composes, over this tool's index instead of that site's. Nothing about "a searchable listbox
        in a modal dialog" is different here, so nothing about it is written again here; what this
        app supplies is the index (`searchEntries`) and what activating a row MEANS (`onSelect`),
        which for a tool that is already running is a selection and not a navigation.

        The footer is the same three hints the docs palette shows, drawn with `Kbd`, the component
        that exists for exactly this.
      */}
      <CommandPalette
        closeLabel={strings.searchClose}
        emptyLabel={strings.searchEmpty}
        footer={
          <>
            <span>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> {strings.searchHintNavigate}
            </span>
            <span>
              <Kbd>↵</Kbd> {strings.searchHintOpen}
            </span>
            <span>
              <Kbd>Esc</Kbd> {strings.searchHintClose}
            </span>
          </>
        }
        id={searchDialogId}
        items={searchEntries}
        label={strings.search}
        onSelect={selectFromSearch}
        placeholder={strings.searchPlaceholder}
      />
    </div>
  );
}
