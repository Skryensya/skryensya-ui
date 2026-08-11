import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import type { SandpackTheme } from "@codesandbox/sandpack-react";
import { Icon } from "@skryensya/react/icon";
import { SegmentedControl } from "@skryensya/react/segmented";
import { Sidebar, SidebarContent, SidebarResizeHandle } from "@skryensya/react/sidebar";
import { TreeView } from "@skryensya/react/tree-view";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

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

export type PlaygroundExample = {
  readonly id: string;
  readonly label: string;
  readonly react: string;
  readonly vanilla: string;
};

export type PlaygroundComponent = {
  readonly id: string;
  readonly label: string;
  readonly docs: string;
  readonly examples: readonly PlaygroundExample[];
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
  readonly hideRail: string;
  readonly showRail: string;
  readonly resizeRail: string;
};

type Props = {
  /** URL of the built catalogue for this locale. Fetched, not inlined: see the endpoint for why. */
  readonly catalogue: string;
  readonly strings: PlaygroundStrings;
};

/** What the sandbox is handed. All of it built by `scripts/build-sandbox-bundles.mjs`. */
const BUNDLES = {
  css: "/sandbox/skryensya.css",
  react: "/sandbox/skryensya-react.js",
  vanilla: "/sandbox/skryensya-vanilla.js",
  subpaths: "/sandbox/react-subpaths.json",
} as const;

/** The package name the sandbox resolves, and the folder it is mounted at. */
const REACT_PACKAGE = "@skryensya/react";

/*
 * The kit ships no page background or inset of its own — those are the app's to set, not a
 * component's. Every docs preview sits against `--color-bg-canvas` with `--space-inset-lg` of
 * breathing room around the specimen (`.sk-component-preview__frame-body` in
 * `component-preview.css`, copied into each `ComponentPreview` iframe along with the rest of the
 * page's stylesheets); the sandbox is the same kind of stage showing the same kit, so it gets the
 * same two rules instead of Sandpack's own white, edge-to-edge default.
 *
 * `color-scheme` is the reason this is a function of the reader's mode rather than a constant. The
 * preview runs as a document on a DIFFERENT origin (Sandpack's own bundler, not this page), so it
 * never sees this page's `data-scheme` attribute or its `<html>` `style.colorScheme` — it only gets
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
 * pixel-identical tokenization — there is no way to make two different highlighters agree token for
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
 * strings — handed a `var(--color-bg-canvas)` reference, it cannot parse it, falls through its own
 * "too short to be a color" branch, and answers "dark" no matter which mode the reader is in. So
 * the theme this component hands Sandpack has to carry REAL resolved colors, not references, and has
 * to be rebuilt whenever the reader's scheme changes — the CSS cascade can no longer do that part for
 * free once the reference is gone.
 *
 * Resolved the same way `AvatarPage.astro`'s icon retint script already resolves a token to a
 * paintable value: give a hidden probe element the token as its `color` and read back what
 * `light-dark()`/`color-mix()` actually computed, rather than `getPropertyValue` on the custom
 * property itself, which would hand back the unresolved `light-dark(...)` source text.
 */
function readSandpackTheme(): SandpackTheme {
  const probe = document.createElement("span");
  probe.style.cssText = "position:fixed;inset:0;visibility:hidden;pointer-events:none;";
  document.body.append(probe);

  const resolve = (token: string): string => {
    probe.style.color = `var(${token})`;
    return getComputedStyle(probe).color;
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
 * — the editor's `isDarkColor` check has to re-run against fresh colors, and the preview's `files`
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
 * only, and every emitted snippet imports `@skryensya/react/button`. Each published subpath gets a
 * file that re-exports the bundle, so `/button` resolves to `/button.js` by ordinary node
 * resolution. Every subpath, not only the ones this example uses — the reader can edit the code, and
 * an import that works in their app should work here.
 */
function reactPackageFiles(bundle: string, subpaths: readonly string[]) {
  const root = `/node_modules/${REACT_PACKAGE}`;

  return {
    [`${root}/package.json`]: {
      code: JSON.stringify({ name: REACT_PACKAGE, main: "./index.js" }, null, 2),
      hidden: true,
    },
    [`${root}/index.js`]: { code: bundle, hidden: true },
    ...Object.fromEntries(
      subpaths.map((subpath) => [
        `${root}/${subpath}.js`,
        { code: `export * from "./index.js";\n`, hidden: true },
      ]),
    ),
  };
}

/*
 * WHERE THE SANDBOX ACTUALLY RUNS, and the one dependency this page has that the rest of the site
 * does not: Sandpack compiles and executes inside an iframe served by CodeSandbox. Everything else
 * here is static and local; this is not.
 *
 * It is probed rather than assumed because of how it fails when it is unreachable — a VPN, a
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

type Bundles = {
  css: string;
  react: string;
  vanilla: string;
  subpaths: readonly string[];
  components: readonly PlaygroundComponent[];
};

type Blocked = "assets" | "bundler";

/*
 * FETCHED, NOT INLINED, and the difference is the whole page's weight. These three files are about
 * 1.8MB of kit; inlined into the island's props they would be 1.8MB of HTML on a route most readers
 * open once. Fetched, they are ordinary static assets: the browser caches them, a second visit pays
 * nothing, and the page itself stays small.
 */
function useBundles(catalogue: string): { bundles: Bundles | null; blocked: Blocked | null } {
  const [bundles, setBundles] = useState<Bundles | null>(null);
  const [blocked, setBlocked] = useState<Blocked | null>(null);

  useEffect(() => {
    let cancelled = false;

    const assets = Promise.all(
      [BUNDLES.css, BUNDLES.react, BUNDLES.vanilla, BUNDLES.subpaths, catalogue].map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${url}: ${response.status}`);
        return response.text();
      }),
    );

    /*
     * `no-cors`, because the answer is not wanted: the bundler sends no CORS headers and this asks
     * one question only, "did the network reach it". A reachable server resolves opaquely; a blocked
     * or absent one rejects, which is exactly the distinction the reader needs made for them.
     */
    const bundler = fetch(BUNDLER_ORIGIN, { mode: "no-cors" });

    assets
      .then(async ([css, react, vanilla, subpaths, components]) => {
        try {
          await bundler;
        } catch {
          if (!cancelled) setBlocked("bundler");
          return;
        }
        if (!cancelled) {
          setBundles({
            css,
            react,
            vanilla,
            subpaths: JSON.parse(subpaths) as string[],
            components: JSON.parse(components) as PlaygroundComponent[],
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
 * A leaf's id, and the only place the two halves are joined.
 *
 * The tree is flat about identity — one string per node — while a selection here is a PAIR. Both
 * ids are already URL-safe (the catalogue says so), so a separator that cannot appear in either is
 * all it takes to go back and forth.
 */
const leafId = (componentId: string, exampleId: string) => `${componentId}/${exampleId}`;

/*
 * THE EXAMPLE, PUSHED INTO A SANDBOX THAT IS ALREADY RUNNING.
 *
 * Everything else in the sandbox — the kit's bundle, the stylesheet, the entry — is identical from
 * one example to the next; only this one file differs. `updateFile` replaces it in place, so the
 * bundler keeps every module it has already compiled and recompiles the one that changed, instead
 * of starting a new sandbox and installing React again.
 *
 * It also discards whatever the reader had typed in that file, which is the behaviour that was
 * already there when each example remounted: asking for another example means asking for that
 * example, not for the last one patched.
 */
function FileSync({ code, path }: { readonly code: string; readonly path: string }) {
  const { sandpack } = useSandpack();

  useEffect(() => {
    if (!code) return;
    if (sandpack.files[path]?.code === code) return;
    sandpack.updateFile(path, code);
    sandpack.setActiveFile(path);
  }, [code, path, sandpack]);

  return null;
}

export default function Playground({ catalogue, strings }: Props) {
  /*
   * Empty until the catalogue lands, and the ids are held rather than the objects: the selection is
   * the reader's and must survive the fetch resolving, which replaces every object it points at.
   */
  const [componentId, setComponentId] = useState("");
  const [exampleId, setExampleId] = useState("");
  const [binding, setBinding] = useState<"react" | "vanilla">("react");
  const [railHidden, setRailHidden] = useState(false);
  const { bundles, blocked } = useBundles(catalogue);
  const components = bundles?.components ?? [];
  const { sandpack: sandpackTheme, colorScheme } = useThemeState();

  const component = components.find((entry) => entry.id === componentId) ?? components[0];
  const example = component?.examples.find((entry) => entry.id === exampleId) ?? component?.examples[0];

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
   * Only a LEAF is a selection. Clicking a component's own row expands it, which is what a branch
   * control is for, and the machine reports that as a selection all the same — acting on it would
   * swap the sandbox for whatever example happened to be first, which nobody asked for.
   */
  const select = (details: { selectedValue: string[] }) => {
    const [componentPart, examplePart] = (details.selectedValue[0] ?? "").split("/");
    if (!componentPart || !examplePart) return;
    setComponentId(componentPart);
    setExampleId(examplePart);
  };

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
  const entryCode = binding === "react" ? example?.react : example?.vanilla;

  const files = useMemo(() => {
    if (!bundles || !example) return null;
    const previewCss = bundles.css + previewBodyCss(colorScheme);

    return binding === "react"
      ? {
          "/App.tsx": { code: example.react },
          ...reactPackageFiles(bundles.react, bundles.subpaths),
          "/styles.css": { code: previewCss, hidden: true },
          // The template's entry, rewritten only to pull the kit's stylesheet in beside React's own.
          "/index.tsx": {
            code: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

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
          "/index.html": { code: example.vanilla },
          "/skryensya-vanilla.js": { code: bundles.vanilla, hidden: true },
          "/skryensya.css": { code: previewCss, hidden: true },
        };
  }, [bundles, binding, example, colorScheme]);

  /*
   * "Has the reader typed anything since this sandbox mounted", tracked coarsely rather than by
   * diffing content against the original files. Sandpack's own accurate signal — `editorState`
   * (`"pristine" | "dirty"` from `useSandpack()`) — only exists inside a `<SandpackProvider>` tree,
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
   * something to say — the fetch is the slowest thing on this page, and a blank screen while it runs
   * is indistinguishable from the page being broken (which is exactly how the blocked-bundler case
   * used to look).
   */
  if (!component || !example) {
    return (
      <div className="playground">
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

        `SidebarResizeHandle` is the switch as well as the affordance — the stylesheet reads
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
          A DENSITY SCOPE, which is the system's own answer to "this chrome should be tighter" and
          the same one `ComponentPreview` uses for its source tabs, at the same 0.72.
          `data-sk-density-scope` re-projects the density-sensitive tokens for this subtree only, so
          the tree's rows and the gaps inside them close up without a single tree-view rule being
          overridden from out here.
          Nothing can go too far, either: `--size-control-sm` floors at `--scale-fixed-target-min`
          (24px, WCAG 2.2 SC 2.5.8) INSIDE the token, so a row lands on the accessible minimum and
          stops. 0.72 is what puts it exactly there — 32px × 0.72 rounds to 24.
        */}
        <SidebarContent
          className="sk-scrollbar sk-scrollbar--reveal"
          data-sk-density-scope
          style={{ "--sk-density-factor": "0.72" } as CSSProperties}
        >
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
            /*
             * ONLY THE FIRST ONE OPEN. Expanding every branch was right when the catalogue was one
             * component; at fifty-nine it puts a hundred and forty rows on screen at once and the
             * rail becomes a wall to scroll rather than an index to scan. The rest is the reader's
             * to open, which is the whole reason this is a tree.
             */
            defaultExpandedValue={components[0] ? [components[0].id] : []}
            label={strings.componentsLabel}
            leafIcon={<Icon name="file" size="sm" />}
            nodes={nodes}
            onSelectionChange={select}
            selectedValue={[leafId(component.id, example.id)]}
          />
        </SidebarContent>
        <SidebarResizeHandle label={strings.resizeRail} />
      </Sidebar>

      <div className="playground__stage">
        <header className="playground__bar">
          <div className="playground__heading">
            {/* The rail's switch, in the one place that is still there when the rail is not. */}
            <button
              aria-expanded={!railHidden}
              aria-label={railHidden ? strings.showRail : strings.hideRail}
              className="sk-button sk-interactive"
              data-icon-only=""
              data-size="sm"
              data-variant="ghost"
              onClick={() => setRailHidden((hidden) => !hidden)}
              type="button"
            >
              {/* The kit's own answer for this control: `SidebarTrigger`'s demo and the site's
                  drawer trigger both draw it with `menu`. A shape drawn by hand here would be a
                  second icon vocabulary for one button. */}
              <Icon name="menu" />
            </button>
            {/* `data-flush` is the site's own opt-out from its global heading rule
                (`h1:not([data-flush])`), which outranks a class and would typeset this at display
                size. Same escape hatch `Toc.astro` uses for the rail's own heading. */}
            <h1 className="playground__title" data-flush>
              {component.label}
            </h1>
            <p className="playground__example">{example.label}</p>
          </div>
          <div className="playground__actions">
            {/*
              THE EXACT EXAMPLE, best-effort. `example.id` is `slugify(label)` (see
              `playground-catalogue.ts`), the SAME algorithm `hero-tabs-toc.ts`'s `ensureId` runs
              over each demo heading's own text to give it an id — so when a heading on the docs
              page happens to read the same as this example's auto-derived label ("Variantes",
              "TileButton"...), the fragment lands exactly on it. The two labels come from
              independent places (one hand-written prose, one derived from an export name), so a
              handful of examples land on the page without a matching heading and the browser just
              scrolls to the top — never a broken link, just a less precise one.

              `target="_blank"`: this leaves the Playground tab open and untouched behind it,
              which is also why it needs no confirmation of its own (see the `beforeunload` guard
              below) — the reader's edits are still sitting right there when they come back.
            */}
            <a
              className="sk-link sk-interactive"
              href={`${component.docs}#${example.id}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {strings.docsLink}
            </a>
            <SegmentedControl
              aria-label={strings.bindingLabel}
              onValueChange={(next) => setBinding(next as "react" | "vanilla")}
              options={[
                { label: strings.react, value: "react" },
                { label: strings.vanilla, value: "vanilla" },
              ]}
              value={binding}
            />
          </div>
        </header>

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
              template={binding === "react" ? "react-ts" : "static"}
              theme={sandpackTheme}
            >
              <FileSync code={entryCode ?? ""} path={entryPath} />
              <SandpackLayout>
                <SandpackCodeEditor
                  showLineNumbers
                  showTabs={binding === "react"}
                  style={{ height: "100%" }}
                />
                <SandpackPreview style={{ height: "100%" }} />
              </SandpackLayout>
            </SandpackProvider>
          </div>
        )}
      </div>
    </div>
  );
}
