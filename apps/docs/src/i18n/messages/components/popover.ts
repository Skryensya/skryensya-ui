export const popoverMessages = {
  es: {
    "demo.popover.trigger": "Ver perfil",
    "demo.popover.description": "Matemática y escritora.",
    "demo.popover.body": "Escribió el primer algoritmo pensado para una máquina.",
    "demo.popover.close": "Cerrar",
    "demo.popoverStructured.trigger": "Ver equipo",
    "demo.popoverStructured.role": "Ingeniera de software",
    "demo.popoverStructured.body": "Coordina el equipo de plataforma y revisa cada release antes de publicarla.",
    "demo.popoverStructured.dismiss": "Ignorar",
    "demo.popoverStructured.action": "Enviar mensaje",
    "demo.popoverPlacement.blockStart": "Se abre arriba del disparador.",
    "demo.popoverPlacement.blockEnd": "Se abre debajo del disparador.",
    "demo.popoverPlacement.inlineStart": "Se abre al inicio en línea (izquierda en LTR).",
    "demo.popoverPlacement.inlineEnd": "Se abre al final en línea (derecha en LTR).",

    "popoverPage.description": "Contenido no modal con título, descripción y cierre explícito sobre top layer nativo.",
    "popoverPage.anatomyBody":
      "Este diagrama nombra el trigger, el panel abierto, el título, la descripción y el cierre. El espécimen está congelado; los popovers vivos empiezan abajo.",
    "popoverPage.anatomyLabel": "Anatomía de Popover",
    "popoverPage.anatomyPreviewLabel": "Popover abierto, parte por parte",
    "popoverPage.structuredTitle": "Contenido estructurado",
    "popoverPage.structuredBody":
      "El contrato no tiene un slot de <code>header</code> ni de <code>footer</code>, y no le hace falta: <code>children</code> acepta un nodo, así que una fila de encabezado (avatar y nombre) y una fila de acciones al final son composición, hechas con las mismas piezas publicadas (Inline, Stack, Avatar, Text, Button): nada de marcado propio de esta página.",
    "popoverPage.structuredLabel": "Popover con encabezado y pie",
    "popoverPage.placementTitle": "Colocación",
    "popoverPage.placementBody":
      "Las cuatro colocaciones posibles, con <code>Popover.bare</code> en vez de <code>Popover</code>: aquí el punto es <code>placement</code>, no el título ni el botón de cierre. La etiqueta de cada disparador es el valor de la opción que usa.",
    "popoverPage.placementLabel": "Popover en las cuatro colocaciones",
    "popoverPage.contractBody": "Popover describe contenido auxiliar rico. Menu contiene acciones; Tooltip solo una descripción corta.",
    "popoverPage.a11yBody": "La plataforma posee top layer, Escape y light-dismiss mediante popover=auto.",

    "popoverPage.testReact1":
      'Liga el trigger a su contenido vía <code class="sk-code">popovertarget</code>/id, con <code class="sk-code">popover=auto</code>.',
    "popoverPage.testReact2": "Renderiza un título y una descripción en la anatomía completa (no bare).",
    "popoverPage.testReact3":
      'Renderiza un botón de cerrar en la anatomía completa, ligado a <code class="sk-code">popoverTargetAction=hide</code>.',
    "popoverPage.testReact4":
      "Omite por completo el título, la descripción y el botón de cerrar en modo bare.",
    "popoverPage.testReact5": "No renderiza flecha por defecto, y solo una cuando se pide.",
    "popoverPage.testReact6": "Escribe el placement elegido sobre el contenido.",
    "popoverPage.testReact7": "Nombra un trigger icon-only con triggerLabel.",
    "popoverPage.testReact8":
      'Liga el panel a su propio título/descripción vía <code class="sk-code">aria-labelledby</code>/<code class="sk-code">aria-describedby</code>, igual que Dialog.',
    "popoverPage.testReact9":
      "No lleva ni aria-labelledby ni aria-describedby sin un título/descripción a los que apuntar.",
    "popoverPage.testReact10":
      "No lleva ni aria-labelledby ni aria-describedby en modo bare, aunque se den título y descripción.",
    "popoverPage.testReact11":
      'Pasa <code class="sk-code">triggerVariant</code>/<code class="sk-code">triggerSize</code>/<code class="sk-code">triggerIconOnly</code> al botón del trigger.',
    "popoverPage.testReact12":
      "Deja fuera los atributos de variante, tamaño e icon-only del trigger cuando no se piden.",
  },
  en: {
    "demo.popover.trigger": "View profile",
    "demo.popover.description": "Mathematician and writer.",
    "demo.popover.body": "Wrote the first algorithm intended for a machine.",
    "demo.popover.close": "Close",
    "demo.popoverStructured.trigger": "View team",
    "demo.popoverStructured.role": "Software engineer",
    "demo.popoverStructured.body": "Coordinates the platform team and reviews every release before it ships.",
    "demo.popoverStructured.dismiss": "Dismiss",
    "demo.popoverStructured.action": "Send message",
    "demo.popoverPlacement.blockStart": "Opens above the trigger.",
    "demo.popoverPlacement.blockEnd": "Opens below the trigger.",
    "demo.popoverPlacement.inlineStart": "Opens at inline-start (left in LTR).",
    "demo.popoverPlacement.inlineEnd": "Opens at inline-end (right in LTR).",

    "popoverPage.description": "Non-modal content with a title, description, and explicit close over the native top layer.",
    "popoverPage.anatomyBody":
      "This diagram names the trigger, the open panel, the title, the description, and the close control. The specimen is frozen; the live popovers start below.",
    "popoverPage.anatomyLabel": "Popover anatomy",
    "popoverPage.anatomyPreviewLabel": "An open Popover, part by part",
    "popoverPage.structuredTitle": "Structured content",
    "popoverPage.structuredBody":
      "The contract has no <code>header</code> or <code>footer</code> slot, and does not need one: <code>children</code> accepts a node, so a header row (avatar and name) and an action row at the end are composition, built from the same published pieces (Inline, Stack, Avatar, Text, Button): no markup of this page's own.",
    "popoverPage.structuredLabel": "Popover with a header and footer",
    "popoverPage.placementTitle": "Placement",
    "popoverPage.placementBody":
      "All four placements, with <code>Popover.bare</code> instead of <code>Popover</code>: the point here is <code>placement</code>, not the title or the close button. Each trigger's label is the option value it uses.",
    "popoverPage.placementLabel": "Popover in all four placements",
    "popoverPage.contractBody": "Popover describes rich auxiliary content. Menu holds actions; Tooltip holds only a short description.",
    "popoverPage.a11yBody": "The platform owns the top layer, Escape, and light-dismiss through popover=auto.",

    "popoverPage.testReact1":
      'Links the trigger to its content via <code class="sk-code">popovertarget</code>/id, with <code class="sk-code">popover=auto</code>.',
    "popoverPage.testReact2": "Renders a title and description in the full (non-bare) anatomy.",
    "popoverPage.testReact3":
      'Renders a close button in the full anatomy, wired to <code class="sk-code">popoverTargetAction=hide</code>.',
    "popoverPage.testReact4": "Omits the title, description and close button entirely in bare mode.",
    "popoverPage.testReact5": "Renders no arrow by default, and one only when asked.",
    "popoverPage.testReact6": "Writes the chosen placement onto the content.",
    "popoverPage.testReact7": "Names an icon-only trigger with triggerLabel.",
    "popoverPage.testReact8":
      'Links the panel to its own title/description via <code class="sk-code">aria-labelledby</code>/<code class="sk-code">aria-describedby</code>, same as Dialog.',
    "popoverPage.testReact9":
      "Carries neither aria-labelledby nor aria-describedby without a title/description to point at.",
    "popoverPage.testReact10":
      "Carries neither aria-labelledby nor aria-describedby in bare mode, even with title/description given.",
    "popoverPage.testReact11":
      'Passes <code class="sk-code">triggerVariant</code>/<code class="sk-code">triggerSize</code>/<code class="sk-code">triggerIconOnly</code> through to the trigger button.',
    "popoverPage.testReact12":
      "Leaves the trigger's variant/size/icon-only attributes off when unset.",
  },
} as const;
