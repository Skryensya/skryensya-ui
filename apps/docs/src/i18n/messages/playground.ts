export const playgroundMessages = {
  es: {
    "playground.title": "Playground",
    "playground.description":
      "Editá y ejecutá los ejemplos de cada componente, en React y en Vanilla, sin instalar nada.",
    "playground.components": "Componentes",
    "playground.binding": "Binding",
    "playground.loading": "Cargando el kit…",
    "playground.failed":
      "No se pudo cargar el kit. Recargá la página; si sigue, revisá que exista apps/playground/public/sandbox (pnpm --filter @skryensya/playground sandbox).",
    "playground.offline":
      "El sandbox no puede alcanzar codesandbox.io, que es donde compila y corre el código. Suele ser una VPN, un proxy o un bloqueador de contenido; el resto del sitio no lo necesita.",
    "playground.docsLink": "Ver la documentación",
    "playground.hideRail": "Ocultar la lista de componentes",
    "playground.showRail": "Mostrar la lista de componentes",
    "playground.resizeRail": "Cambiar el ancho de la lista",
    "playground.discardTitle": "¿Descartar los cambios?",
    "playground.discardBody": "Hay ediciones sin guardar en este ejemplo. Cambiar de ejemplo las descarta.",
    "playground.discardCancel": "Seguir editando",
    "playground.discardConfirm": "Descartar",
  },
  en: {
    "playground.title": "Playground",
    "playground.description":
      "Edit and run every component's examples, in React and in Vanilla, with nothing to install.",
    "playground.components": "Components",
    "playground.binding": "Binding",
    "playground.loading": "Loading the kit…",
    "playground.failed":
      "The kit could not be loaded. Reload the page; if it persists, check that apps/playground/public/sandbox exists (pnpm --filter @skryensya/playground sandbox).",
    "playground.offline":
      "The sandbox cannot reach codesandbox.io, which is where it compiles and runs the code. Usually a VPN, a proxy or a content blocker; nothing else on this site needs it.",
    "playground.docsLink": "Read the documentation",
    "playground.hideRail": "Hide the component list",
    "playground.showRail": "Show the component list",
    "playground.resizeRail": "Resize the component list",
    "playground.discardTitle": "Discard your changes?",
    "playground.discardBody": "This example has unsaved edits. Switching examples discards them.",
    "playground.discardCancel": "Keep editing",
    "playground.discardConfirm": "Discard",
  },
} as const;
