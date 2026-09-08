export const codePreviewMessages = {
  es: {

    "codePreview.description": "Preview de código Shiki con resaltado en build/SSR y comportamiento Vanilla opt-in.",
    "codePreview.lede":
      "Superficie para HTML resaltado por Shiki, con copiar, vista condensada/completa y preview de bloques largos. Shiki termina su trabajo en build o SSR; el navegador recibe HTML y sólo monta los controles que el documento autoró.",
    "codePreview.exampleNote": 'Para presentar este bloque debajo del render real de un componente, usa <a href="/componentes/component-preview">ComponentPreview</a>.',
    "codePreview.contractTitle": "Contrato de carga",
    "codePreview.contractItem1":
      "<code>@skryensya/core/components/code-preview.css</code> contiene la anatomía y consume las variables duales <code>--shiki-light</code> y <code>--shiki-dark</code>.",
    "codePreview.contractItem2":
      "<code>initComponents()</code> no conoce <code>[data-sk-code-preview]</code>. Importar el auto-loader nunca descarga este enhancer.",
    "codePreview.contractItem3":
      "<code>mountCodePreview()</code> es el único seam de comportamiento y es idempotente. El resaltado no forma parte de ese runtime.",
    "codePreview.highlightTitle": "Resaltar en build o SSR",
    "codePreview.mountTitle": "Montar explícitamente",
    "codePreview.mountBody":
      "Los componentes normales se descubren por selector. CodePreview se monta en una segunda llamada deliberada, para que ninguna aplicación cargue un preview de documentación por accidente.",
    "codePreview.highlightComment": "Se ejecuta en build/SSR, nunca en el navegador.",
    "codePreview.mountComment1": "CopyButton y los componentes normales: imports dinámicos por selector.",
    "codePreview.mountComment2": "CodePreview es opt-in y queda fuera del auto-loader.",
    "codePreview.test1": "Cambia densidad, expande, colapsa y monta de forma idempotente.",
    "codePreview.test2": "El botón para revelar más sigue disponible aunque el modo Condensado ya sea largo.",
    "codePreview.test3": "Dice el conteo en el idioma del autor, y solo el número cuando no hay uno.",
  },
  en: {

    "codePreview.description": "Shiki code preview with build/SSR highlighting and opt-in Vanilla behavior.",
    "codePreview.lede":
      "A surface for HTML highlighted by Shiki, with copy, condensed/full views and a preview for long blocks. Shiki finishes its work at build or SSR time; the browser receives HTML and only mounts the controls the document authored.",
    "codePreview.exampleNote": 'To present this block underneath a component\'s real render, use <a href="/en/components/component-preview">ComponentPreview</a>.',
    "codePreview.contractTitle": "Loading contract",
    "codePreview.contractItem1":
      "<code>@skryensya/core/components/code-preview.css</code> holds the anatomy and consumes the dual <code>--shiki-light</code> and <code>--shiki-dark</code> variables.",
    "codePreview.contractItem2":
      "<code>initComponents()</code> does not know about <code>[data-sk-code-preview]</code>. Importing the auto-loader never downloads this enhancer.",
    "codePreview.contractItem3":
      "<code>mountCodePreview()</code> is the only behavior seam, and it is idempotent. Highlighting is not part of that runtime.",
    "codePreview.highlightTitle": "Highlighting at build or SSR time",
    "codePreview.mountTitle": "Mounting explicitly",
    "codePreview.mountBody":
      "Regular components are discovered by selector. CodePreview mounts on a second, deliberate call, so that no application loads a documentation preview by accident.",
    "codePreview.highlightComment": "Runs at build/SSR time, never in the browser.",
    "codePreview.mountComment1": "CopyButton and regular components: dynamic imports by selector.",
    "codePreview.mountComment2": "CodePreview is opt-in and stays outside the auto-loader.",
    "codePreview.test1": "Switches density, expands, collapses and mounts idempotently.",
    "codePreview.test2": "Keeps the disclosure control available even when Condensed itself is long.",
    "codePreview.test3": "Says the count in the author's language, and just the number when there is none.",
  },
} as const;
