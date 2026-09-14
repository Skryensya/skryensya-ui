export const playgroundMessages = {
  es: {
    "playground.title": "Playground",
    "playground.description":
      "Editá y ejecutá los ejemplos de cada componente, en React y en Vanilla, sin instalar nada.",
    /* The only navigation this app has: it lives at its own origin, so "back" is a real destination
       and not a browser button. */
    "playground.backToDocs": "Volver a la documentación",
    /* El 404 del playground: esta app tiene una sola ruta real, así que una ruta perdida acá casi
       siempre es un enlace viejo a la documentación. El encabezado es propio y no el de la
       documentación ("Esta ruta no está en la documentación") porque este no es ese sitio. */
    "playground.notFoundHeading": "Esta dirección no existe acá.",
    "playground.notFoundLede":
      "Esta dirección no es del playground. Puede que el enlace sea viejo, o que la página que buscás esté en la documentación.",
    "playground.components": "Componentes",
    "playground.binding": "Binding",
    "playground.loading": "Cargando el kit…",
    "playground.failed":
      "No se pudo cargar el kit. Recargá la página; si sigue, revisá que exista apps/playground/public/sandbox (pnpm --filter @skryensya/playground sandbox).",
    "playground.offline":
      "El sandbox no puede alcanzar codesandbox.io, que es donde compila y corre el código. Suele ser una VPN, un proxy o un bloqueador de contenido; el resto del sitio no lo necesita.",
    /* El enlace se lee en una barra llena de controles, así que dice lo corto: adónde va. A QUÉ
       página va lo resuelve el catálogo (`playground-catalogue.ts` apunta al ejemplo exacto), y eso
       no es algo que la etiqueta tenga que deletrear. */
    "playground.docsLink": "Ver la documentación",
    "playground.files": "Archivos del ejemplo",
    /* La paleta de búsqueda de esta app: el mismo ⌘K de la documentación, sobre el catálogo del
       playground en vez del índice del sitio. */
    "playground.search": "Buscar un ejemplo",
    "playground.searchPlaceholder": "Buscar un componente o un ejemplo…",
    "playground.reload": "Recargar la vista previa",
    /* El control ofrece siempre la OTRA disposición, así que cada nombre dice adónde lleva
       apretarlo, no dónde ya estamos. */
    "playground.layoutSideBySide": "Poner el código y la vista previa lado a lado",
    "playground.layoutStacked": "Poner la vista previa debajo del código",
    "playground.hideRail": "Ocultar la lista de componentes",
    "playground.showRail": "Mostrar la lista de componentes",
    "playground.resizeRail": "Cambiar el ancho de la lista",
    "playground.resizePanes": "Cambiar el ancho del editor",
    "playground.resizePanesBlock": "Cambiar el alto del editor",
    "playground.discardTitle": "¿Descartar los cambios?",
    "playground.discardBody": "Hay ediciones sin guardar en este ejemplo. Cambiar de ejemplo las descarta.",
    "playground.discardCancel": "Seguir editando",
    "playground.discardConfirm": "Descartar",
  },
  en: {
    "playground.title": "Playground",
    "playground.description":
      "Edit and run every component's examples, in React and in Vanilla, with nothing to install.",
    "playground.backToDocs": "Back to the documentation",
    "playground.notFoundHeading": "This address does not exist here.",
    "playground.notFoundLede":
      "This address is not part of the playground. The link may be old, or the page you want may live in the documentation.",
    "playground.components": "Components",
    "playground.binding": "Binding",
    "playground.loading": "Loading the kit…",
    "playground.failed":
      "The kit could not be loaded. Reload the page; if it persists, check that apps/playground/public/sandbox exists (pnpm --filter @skryensya/playground sandbox).",
    "playground.offline":
      "The sandbox cannot reach codesandbox.io, which is where it compiles and runs the code. Usually a VPN, a proxy or a content blocker; nothing else on this site needs it.",
    "playground.docsLink": "View the docs",
    "playground.files": "Example files",
    "playground.search": "Search an example",
    "playground.searchPlaceholder": "Search a component or an example…",
    "playground.reload": "Reload the preview",
    "playground.layoutSideBySide": "Put the code and the preview side by side",
    "playground.layoutStacked": "Put the preview below the code",
    "playground.hideRail": "Hide the component list",
    "playground.showRail": "Show the component list",
    "playground.resizeRail": "Resize the component list",
    "playground.resizePanes": "Resize the editor's width",
    "playground.resizePanesBlock": "Resize the editor's height",
    "playground.discardTitle": "Discard your changes?",
    "playground.discardBody": "This example has unsaved edits. Switching examples discards them.",
    "playground.discardCancel": "Keep editing",
    "playground.discardConfirm": "Discard",
  },
} as const;
