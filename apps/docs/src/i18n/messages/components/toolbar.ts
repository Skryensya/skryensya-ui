export const toolbarMessages = {
  es: {
    "demo.toolbar.actions": "Acciones de documento",
    "demo.toolbar.edit": "Editar",
    "demo.toolbar.copy": "Copiar",
    "demo.toolbar.delete": "Borrar",
    "demo.toolbar.viewControls": "Controles de vista",
    "demo.toolbar.screenSize": "Tamaño de pantalla",
    "demo.toolbar.free": "Libre",
    "demo.toolbar.tablet": "Tablet",
    "demo.toolbar.mobile": "Móvil",
    "demo.toolbar.binding": "Binding",

    "toolbarPage.description": "Agrupa controles relacionados y permite recorrerlos con flechas.",
    "toolbarPage.betaBadge": "Beta",
    "toolbarPage.contractBody": "Toolbar agrupa controles; no reemplaza Navbar ni Menu. Los grupos internos usan role=group.",
    "toolbarPage.a11yBody": "Flechas recorren controles; Home y End saltan a los extremos. Tab entra y sale de la barra.",
    "toolbarPage.compositeTitle": "Toolbar con widgets compuestos",
    "toolbarPage.compositeBody":
      "Un grupo no tiene que ser botones sueltos: puede ser un widget compuesto entero, como un Segmented. La barra trata cada widget compuesto como <strong>una sola parada</strong>: el roving tabindex del Segmented ya deja una sola opción en <code>tabindex=\"0\"</code>, así que Toolbar sólo visita esa. Adentro del Segmented, las flechas navegan sus propias opciones; no escapan hacia el siguiente grupo de la barra. Este es el patrón real que usa el propio header del component preview de este sitio: el selector de tamaño de pantalla y el toggle Vanilla/React de cada demo en esta página son dos Segmented dentro de un Toolbar.",
    "toolbarPage.compositeLabel": "Toolbar con Segmented anidado",
    "toolbarPage.wysiwygTitle": "Toolbar como barra de un editor",
    "toolbarPage.wysiwygBody":
      'El uso que le da nombre al patrón, <code>editor-toolbar</code>, en el contrato: agrupar los controles de formato de un editor de texto enriquecido. Para un editor real construido sobre este mismo Toolbar - con los comandos efectivamente conectados - ver <a href="/components/editor">Editor</a>.',
  },
  en: {
    "demo.toolbar.actions": "Document actions",
    "demo.toolbar.edit": "Edit",
    "demo.toolbar.copy": "Copy",
    "demo.toolbar.delete": "Delete",
    "demo.toolbar.viewControls": "View controls",
    "demo.toolbar.screenSize": "Screen size",
    "demo.toolbar.free": "Free",
    "demo.toolbar.tablet": "Tablet",
    "demo.toolbar.mobile": "Mobile",
    "demo.toolbar.binding": "Binding",

    "toolbarPage.description": "Groups related controls and lets you move through them with arrows.",
    "toolbarPage.betaBadge": "Beta",
    "toolbarPage.contractBody": "Toolbar groups controls; it does not replace Navbar or Menu. Internal groups use role=group.",
    "toolbarPage.a11yBody": "Arrows move through controls; Home and End jump to the ends. Tab enters and exits the bar.",
    "toolbarPage.compositeTitle": "Toolbar with composite widgets",
    "toolbarPage.compositeBody":
      "A group does not have to be loose buttons: it can be a whole composite widget, like a Segmented. The bar treats every composite widget as <strong>a single stop</strong>: Segmented's own roving tabindex already leaves one option at <code>tabindex=\"0\"</code>, so Toolbar only ever visits that one. Inside the Segmented, arrows navigate its own options; they never escape to the bar's next group. This is the real pattern this site's own component preview header uses: the screen-size selector and the Vanilla/React toggle on every demo on this page are two Segmenteds inside a Toolbar.",
    "toolbarPage.compositeLabel": "Toolbar with a nested Segmented",
    "toolbarPage.wysiwygTitle": "Toolbar heading an editor",
    "toolbarPage.wysiwygBody":
      'The use that names the pattern, <code>editor-toolbar</code>, in the contract: grouping a rich-text editor\'s own formatting controls. For a real editor built on this same Toolbar - with the commands actually wired up - see <a href="/en/components/editor">Editor</a>.',
  },
} as const;
