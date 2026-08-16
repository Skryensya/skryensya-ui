import { emitMarkup, emitReactSource } from "@skryensya/ai-compiler/emit";
import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * A usage tree, turned into something a sandbox can RUN.
 *
 * `emitReactSource` and `emitMarkup` produce a snippet, not a program: a component and the module
 * its data lives in, or a fragment of markup. That is exactly right for a docs page, which shows the
 * part worth reading and provides the rest. A sandbox has no rest, so this file is the difference:
 * the component, plus the smallest honest program around it.
 *
 * It runs at BUILD time. The emitters are the compiler's, the trees are the docs', and the browser
 * receives four strings per example rather than a tree, an emitter and a catalogue to run them
 * against. What ships to the reader is the result, not the machinery.
 */

/*
 * NOTHING IS REWRITTEN HERE, and that is the point.
 *
 * The emitted snippet imports `@skryensya/react/button`, which is what the docs show and what
 * belongs in an app. An earlier version of this file rewrote that to a relative path, because the
 * package is not on npm and a sandbox resolving it got a 404 — and then the playground had to carry
 * a banner apologising for showing code that was not quite the code.
 *
 * Sandpack takes an unpublished package as FILES under `/node_modules/<name>/` (its own
 * "Providing local dependencies" guide). The kit is mounted there instead, so the specifier
 * resolves and the snippet needs no apology. See `Playground.tsx` for the mount.
 */

/** Indents a body so it reads correctly inside the block it is being placed in. */
const indent = (body: string, by = "    ") =>
  body
    .split("\n")
    .map((line) => (line.trim() === "" ? line : by + line))
    .join("\n");

/** The React half of one example: the entry, and the data module it imports when it has one. */
export type ReactSandbox = {
  readonly code: string;
  /** Sandpack addresses files by absolute path, so this is `/menu-items.ts`, not `menu-items.ts`. */
  readonly data?: { readonly path: string; readonly code: string };
};

/**
 * The React entry: a component, because that is what the React template mounts.
 *
 * `export default function App()` and not a bare expression: the emitted snippet is JSX in the
 * middle of a sentence the docs page finishes. Here the reader can edit anything, including turning
 * this into two components, so it starts as the thing they would edit.
 *
 * The emitter builds that wrapper itself rather than this file pasting one around it, and it hands
 * back the DATA MODULE beside it. Both go into the sandbox under the names the emitter chose: the
 * page shows `import { items } from "./menu-items"` and the sandbox has to be able to run exactly
 * that, or the playground is back to showing code that is nearly the code.
 */
export function reactSandboxSource(tree: UsageTree): ReactSandbox {
  const { component, data } = emitReactSource(tree, {
    component: "App",
    export: "default",
  });

  return {
    code: `${component}\n`,
    ...(data ? { data: { path: `/${data.file}`, code: data.source } } : {}),
  };
}

/**
 * The Vanilla entry: a whole document, because that is what the Vanilla binding is.
 *
 * There is no component to mount and no framework to hand it to. The markup IS the component, the
 * stylesheet paints it, and one call hydrates whatever in the page asked to be hydrated. A reader
 * who deletes the script tag sees exactly what this binding promises: everything that does not need
 * JavaScript still works.
 */
export function vanillaSandboxSource(tree: UsageTree, title: string): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="./skryensya.css" />
  </head>
  <body>
${indent(emitMarkup(tree, { fillDefaults: false }), "    ")}

    <script type="module">
      // The two calls a no-build consumer makes: mount every authored [data-sk-*] root, then bind
      // an icon set. Which set is the consumer\'s choice, which is why it is passed and not assumed.
      import { initComponents, mountIcons, phosphorIcons } from "./skryensya-vanilla.js";
      await initComponents();
      mountIcons(document, phosphorIcons);
    </script>
  </body>
</html>
`;
}

/** One example, in both bindings, ready to be handed to Sandpack. */
export type PlaygroundSources = {
  readonly id: string;
  readonly label: string;
  readonly react: ReactSandbox;
  readonly vanilla: string;
};
