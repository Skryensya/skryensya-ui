import frameRuntimeUrl from "../scripts/component-preview-frame.ts?worker&url";

/*
 * The srcdoc document every preview stage renders.
 *
 * Shared because the stage nests: the ComponentPreview page documents itself with a preview inside
 * a preview, and the inner frame has to be the same document as the outer one — same runtime, same
 * theme sync, same fit. The runtime clones styles from `window.parent`, so each level inherits the
 * level above it.
 */
export interface PreviewFrameOptions {
  /** Authored markup for the frame body. */
  body: string;
  /** No stage padding: some components ARE a layout and must reach the edges. */
  flush?: boolean;
  /** Let the frame scroll instead of growing to its content. */
  scroll?: boolean;
  /** App-only JavaScript, already `encodeURIComponent`-encoded. */
  encodedScript?: string;
  /**
   * A React demo for the frame to import and mount ITSELF, named by module + export rather than
   * handed over as a function.
   *
   * The frame owning the mount is what makes the React binding isolated rather than
   * isolated-looking: the component's code then runs in the frame's realm, where `document` is the
   * frame's document. Mounted from the parent it would render into the frame but still execute
   * against the DOCS document — a `ThemeToggle` demo re-themed the whole site that way.
   */
  reactDemo?: {
    /** Demo file basename, e.g. `button` — the key of the frame runtime's glob map. */
    module: string;
    /** Named export within that module, e.g. `ButtonBasicDemo`. */
    export: string;
    /** Plain, JSON-serialisable props. These demos take no others, by the same rule Astro imposes. */
    props?: unknown;
  };
}

const escapeAttribute = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

export function buildPreviewFrameDocument({
  body,
  flush = false,
  scroll = false,
  encodedScript = "",
  reactDemo,
}: PreviewFrameOptions): string {
  const demoAttrs = reactDemo
    ? [
        `data-sk-react-demo-module="${escapeAttribute(reactDemo.module)}"`,
        `data-sk-react-demo-export="${escapeAttribute(reactDemo.export)}"`,
        reactDemo.props && Object.keys(reactDemo.props).length
          ? `data-sk-react-demo-props="${escapeAttribute(JSON.stringify(reactDemo.props))}"`
          : "",
      ].join("\n    ")
    : "";

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <base target="_top">
    <script type="module" src="${escapeAttribute(frameRuntimeUrl)}" fetchpriority="high"><\/script>
  </head>
  <body
    class="sk-component-preview__frame-body"
    ${flush ? "data-sk-component-preview-flush" : ""}
    ${scroll ? "data-sk-component-preview-scroll" : ""}
    ${encodedScript ? `data-sk-component-preview-script="${encodedScript}"` : ""}
    ${demoAttrs}
  >
    ${body}
  </body>
</html>`;
}
