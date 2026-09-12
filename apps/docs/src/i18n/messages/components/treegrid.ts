export const treegridMessages = {
  es: {

    "treegridPage.description": "Filas jerárquicas con columnas: expande o colapsa una sin perder el resto de sus valores.",
    "treegridPage.betaBadge": "Beta",
    "treegridPage.lede":
      'Combina jerarquía y columnas a la vez: el patrón WAI-ARIA <code>treegrid</code>. Úsalo cuando cada fila necesita varios valores independientes ADEMÁS de su lugar en la jerarquía (un mensaje con remitente, un archivo con tamaño y fecha). Para una sola columna de texto jerárquico usa <a href="/components/tree-view">TreeView</a>; para columnas sin jerarquía, <a href="/components/table">Table</a>.',
    "treegridPage.minimalTitle": "Bandeja de entrada",
    "treegridPage.anatomyBody":
      "Este diagrama nombra el scroll, la tabla, cabecera, cuerpo, filas, celdas y el disclosure. El espécimen está congelado; los Treegrid vivos empiezan abajo.",
    "treegridPage.anatomyLabel": "Anatomía de Treegrid",
    "treegridPage.anatomyPreviewLabel": "Treegrid, parte por parte",
    "treegridPage.minimalBody":
      "El ejemplo que la propia especificación WAI-ARIA usa: dos columnas (Asunto, De), una carpeta abierta con dos mensajes, una carpeta colapsada cuyo único mensaje queda oculto, y un mensaje suelto en la raíz.",
    "treegridPage.minimalLabel": "Bandeja de entrada de ejemplo",
    "treegridPage.contractItem1":
      "Casi siempre envuelto en <code>TreegridScroll</code>: misma razón que <code>TableScroll</code>: un flex o un grid le da <code>min-size: auto</code>, y una grilla más ancha que su espacio revienta la superficie si nadie la envuelve.",
    "treegridPage.contractItem2":
      '<code>Treegrid</code> es un <code>&lt;table role="treegrid"&gt;</code> que EXIGE <code>label</code>: ese <code>role</code> no trae nombre accesible implícito, a diferencia de una tabla nativa.',
    "treegridPage.contractItem3":
      "<code>TreegridHead</code> / <code>TreegridHeadRow</code> / <code>TreegridColumnHeader</code> son encabezados de columna comunes: la misma forma que ya tiene <code>Table</code>.",
    "treegridPage.contractItem4":
      "Cada <code>TreegridRow</code> se autora PLANA, en el orden del documento: nunca anidada dentro de otra fila, un <code>&lt;tr&gt;</code> no puede contener otro <code>&lt;tr&gt;</code>. <code>level</code>, <code>setSize</code> y <code>posInset</code> son hechos propios que el autor ya conoce por escribir la fila en ese orden, no algo que el componente deriva.",
    "treegridPage.contractItem5":
      "<code>expanded</code> sólo se autoría en una fila que TIENE hijos: su ausencia, no un valor <code>false</code>, es lo que marca una fila como hoja. <code>true</code>/<code>false</code> controla si sus descendientes están visibles en este momento.",
    "treegridPage.contractItem6":
      'Cada <code>TreegridCell</code> es un <code>&lt;td role="gridcell"&gt;</code> común; la primera celda de una fila con hijos gana la sangría por CSS y un botón de apertura real que el binding inserta: nunca escrito a mano, y decorativo para el lector de pantalla (<code>aria-expanded</code> en la fila ya anuncia el estado).',
    "treegridPage.contractItem7":
      '<code>resizableColumns</code> (apagada por defecto) inserta un separador <code>role="separator"</code> real entre cada par de encabezados: el mismo primitivo compartido de <code>@skryensya/core/splitter</code> que usa el separador de <code>Sidebar</code>. Exige <code>resizeLabel</code>: el separador es binding-insertado, así que nada más lo nombra para un lector de pantalla.',
    "treegridPage.hooksBody":
      "La sangría por nivel y el ancho reservado para el glyph de apertura son hooks: <code>--sk-treegrid-indent</code> y <code>--sk-treegrid-indicator-size</code>.",
    "treegridPage.a11yBody":
      'Cada fila lleva <code>role="row"</code> con <code>aria-level</code>/<code>aria-setsize</code>/<code>aria-posinset</code>: hechos ESTÁTICOS que no cambian al colapsar un hermano, sólo la visibilidad cambia: y <code>aria-expanded</code> únicamente si tiene hijos. Cada celda lleva <code>role="gridcell"</code>. El foco es roving: una sola fila o celda es la parada de tabulación en toda la grilla. <kbd class="sk-kbd">→</kbd> expande una rama colapsada o entra a su primera celda; <kbd class="sk-kbd">←</kbd> colapsa una rama abierta o sube a la fila padre; <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd> mueven entre filas visibles; <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> y <kbd class="sk-kbd">Ctrl</kbd>+<kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> saltan al principio/final; <kbd class="sk-kbd">Enter</kbd> alterna una rama con foco de fila o activa cualquier otro foco. Esta versión es fiel al ejemplo base de WAI (<code>treegrid-1</code>): celdas de solo texto, sin control interactivo propio dentro de una celda: por eso <kbd class="sk-kbd">Tab</kbd> siempre sale de la grilla, sin nada que interceptar.',
    "treegridPage.testVanilla1":
      "Al montar, esconde el único hijo de la rama que arranca colapsada.",
    "treegridPage.testVanilla2":
      "Flecha derecha sobre una rama colapsada la expande y revela su hijo, sin mover el foco de la fila.",
    "treegridPage.testVanilla3":
      "Clickear la primera celda de una rama la alterna y mueve el foco a la fila.",
    "treegridPage.testReact1":
      "Respeta el <code>expanded</code> inicial de cada fila, y esconde solo el descendiente de la rama colapsada.",
    "treegridPage.testReact2":
      "Flecha izquierda sobre una rama abierta la colapsa y esconde a sus hijos.",
    "treegridPage.testReact3": "Enter activa una fila hoja con foco.",

    "treegridPage.stressTitle": "Explorador de archivos (stress test)",
    "treegridPage.stressBody":
      "Cuatro columnas en vez de dos, contenido largo que fuerza el elipsis en más de una columna, siete niveles de profundidad (los cinco primeros con regla CSS propia, el sexto y el séptimo cayendo al tope compartido), ramas colapsadas en más de un nivel a la vez: incluida una en la raíz: y <code>resizableColumns</code>: arrastra o usa las flechas sobre el borde de un encabezado para redimensionar el par de columnas a los lados.",
    "treegridPage.stressLabel": "Explorador de archivos de ejemplo",

    "demo.treegrid.label": "Mensajes",
    "demo.treegrid.subject": "Asunto",
    "demo.treegrid.from": "De",
    "demo.treegrid.inbox": "Recibidos",
    "demo.treegrid.meeting": "Reunión de equipo",
    "demo.treegrid.lunch": "Almuerzo",
    "demo.treegrid.drafts": "Borradores",
    "demo.treegrid.untitled": "Sin título",
    "demo.treegrid.me": "Yo",
    "demo.treegrid.sent": "Enviados",

    "demo.treegridStress.label": "Explorador de archivos",
    "demo.treegridStress.resizeLabel": "Redimensionar columna",
    "demo.treegridStress.colName": "Nombre",
    "demo.treegridStress.colType": "Tipo",
    "demo.treegridStress.colSize": "Tamaño",
    "demo.treegridStress.colModified": "Modificado",
    "demo.treegridStress.typeFolder": "Carpeta",
    "demo.treegridStress.typeTs": "Archivo TypeScript",
    "demo.treegridStress.typeTest": "Archivo de test",
    "demo.treegridStress.typeStyle": "Hoja de estilos",
    "demo.treegridStress.typeConfig": "Configuración",
    "demo.treegridStress.typeMarkdown": "Documento Markdown",
    "demo.treegridStress.typeText": "Documento de texto",
    "demo.treegridStress.projectAlpha": "proyecto-alpha",
    "demo.treegridStress.src": "src",
    "demo.treegridStress.components": "components",
    "demo.treegridStress.buttonFolder": "Button",
    "demo.treegridStress.buttonTsx": "Button.tsx",
    "demo.treegridStress.internalTypesFolder": "tipos-internos-del-componente-con-props-extendidas",
    "demo.treegridStress.buttonPropsTs": "ButtonProps.ts",
    "demo.treegridStress.buttonTestTsx": "Button.test.tsx",
    "demo.treegridStress.buttonModuleCss": "Button.module.css",
    "demo.treegridStress.modalTsx": "Modal.tsx",
    "demo.treegridStress.utilsFolder": "utils",
    "demo.treegridStress.formatUtil": "format-currency-and-long-date-strings-for-every-supported-locale.ts",
    "demo.treegridStress.packageJson": "package.json",
    "demo.treegridStress.readme":
      "README-instrucciones-de-instalación-configuración-y-despliegue-para-todo-el-equipo.md",
    "demo.treegridStress.readmeModified": "Hace 3 semanas por Alice Fernández del equipo de Diseño",
    "demo.treegridStress.projectBeta": "proyecto-beta",
    "demo.treegridStress.indexTs": "index.ts",
    "demo.treegridStress.license": "licencia.txt",
    "demo.treegridStress.modified2d": "Hace 2 días",
    "demo.treegridStress.modified3d": "Hace 3 días",
    "demo.treegridStress.modified4d": "Hace 4 días",
    "demo.treegridStress.modified1h": "Hace 1 hora",
    "demo.treegridStress.modified5h": "Hace 5 horas",
    "demo.treegridStress.modified1day": "Hace 1 día",
    "demo.treegridStress.modified1week": "Hace 1 semana",
    "demo.treegridStress.modified1month": "Hace 1 mes",
    "demo.treegridStress.modified6months": "Hace 6 meses",
  },
  en: {

    "treegridPage.description": "Hierarchical rows with columns: expand or collapse one without losing the rest of its values.",
    "treegridPage.betaBadge": "Beta",
    "treegridPage.lede":
      'Combines hierarchy and columns at once: the WAI-ARIA <code>treegrid</code> pattern. Use it when every row needs several independent values IN ADDITION to its place in the hierarchy (a message with a sender, a file with a size and a date). For a single column of hierarchical text use <a href="/en/components/tree-view">TreeView</a>; for columns with no hierarchy, <a href="/en/components/table">Table</a>.',
    "treegridPage.minimalTitle": "Inbox",
    "treegridPage.anatomyBody":
      "This diagram names the scroll, the table, head, body, rows, cells and the disclosure. The specimen is frozen; the live Treegrids begin below.",
    "treegridPage.anatomyLabel": "Treegrid anatomy",
    "treegridPage.anatomyPreviewLabel": "Treegrid, part by part",
    "treegridPage.minimalBody":
      "The exact example the WAI-ARIA spec itself uses: two columns (Subject, From), a folder that starts open with two messages, a collapsed folder whose one message stays hidden, and a loose message at the root.",
    "treegridPage.minimalLabel": "Sample inbox",
    "treegridPage.contractItem1":
      "Almost always wrapped in <code>TreegridScroll</code>: the same reason as <code>TableScroll</code>: a flex or grid parent gives it <code>min-size: auto</code>, and a grid wider than its space blows the surface open if nothing wraps it.",
    "treegridPage.contractItem2":
      '<code>Treegrid</code> is a <code>&lt;table role="treegrid"&gt;</code> that REQUIRES <code>label</code>: that role carries no implicit accessible name, unlike a native table.',
    "treegridPage.contractItem3":
      "<code>TreegridHead</code> / <code>TreegridHeadRow</code> / <code>TreegridColumnHeader</code> are plain column headers: the same shape <code>Table</code> already has.",
    "treegridPage.contractItem4":
      "Each <code>TreegridRow</code> is authored FLAT, in document order: never nested inside another row, a <code>&lt;tr&gt;</code> cannot contain a <code>&lt;tr&gt;</code>. <code>level</code>, <code>setSize</code>, and <code>posInset</code> are facts the author already knows from writing the row in that order, not something the component derives.",
    "treegridPage.contractItem5":
      "<code>expanded</code> is only authored on a row that HAS children: its absence, not a <code>false</code> value, is what marks a row a leaf. <code>true</code>/<code>false</code> controls whether its descendants are currently visible.",
    "treegridPage.contractItem6":
      'Each <code>TreegridCell</code> is a plain <code>&lt;td role="gridcell"&gt;</code>; the first cell of a row with children gets the indent from CSS and a real disclosure button the binding inserts: never authored, and decorative to a screen reader (the row\'s own <code>aria-expanded</code> already announces the state).',
    "treegridPage.contractItem7":
      '<code>resizableColumns</code> (off by default) inserts a real <code>role="separator"</code> between every pair of column headers: the same shared <code>@skryensya/core/splitter</code> primitive Sidebar\'s own separator uses. Requires <code>resizeLabel</code>: the separator is binding-inserted, so nothing else names it for a screen reader.',
    "treegridPage.hooksBody":
      "Per-level indent and the width reserved for the disclosure glyph are hooks: <code>--sk-treegrid-indent</code> and <code>--sk-treegrid-indicator-size</code>.",
    "treegridPage.a11yBody":
      'Every row carries <code>role="row"</code> with <code>aria-level</code>/<code>aria-setsize</code>/<code>aria-posinset</code>: STATIC facts that never change when a sibling collapses, only visibility does: plus <code>aria-expanded</code> only when it has children. Every cell carries <code>role="gridcell"</code>. Focus is roving: a single row or cell is the tab stop for the whole grid. <kbd class="sk-kbd">→</kbd> expands a collapsed branch or enters its first cell; <kbd class="sk-kbd">←</kbd> collapses an open branch or moves up to the parent row; <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd> move between visible rows; <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> and <kbd class="sk-kbd">Ctrl</kbd>+<kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> jump to the start/end; <kbd class="sk-kbd">Enter</kbd> toggles a branch with row focus, or activates any other focus. This version is faithful to WAI\'s base example (<code>treegrid-1</code>): text-only cells, no interactive control of its own inside a cell: which is why <kbd class="sk-kbd">Tab</kbd> always just leaves the grid, with nothing to intercept.',
    "treegridPage.testVanilla1":
      "On mount, hides the one child of the branch that starts collapsed.",
    "treegridPage.testVanilla2":
      "Right Arrow on a collapsed branch expands it and reveals its child, without moving the row's focus.",
    "treegridPage.testVanilla3":
      "Clicking a branch's first cell toggles it and moves focus to the row.",
    "treegridPage.testReact1":
      "Honors each row's initial <code>expanded</code>, and hides only the collapsed branch's own descendant.",
    "treegridPage.testReact2":
      "Left Arrow on an open branch collapses it and hides its children.",
    "treegridPage.testReact3": "Enter activates a focused leaf row.",

    "treegridPage.stressTitle": "File explorer (stress test)",
    "treegridPage.stressBody":
      "Four columns instead of two, long content that forces ellipsis in more than one column, seven levels deep (the first five with their own CSS rule, the sixth and seventh falling back to the shared ceiling), collapsed branches at more than one level at once: including one at the root: and <code>resizableColumns</code>: drag or use the arrow keys on a header's edge to resize the pair of columns on either side.",
    "treegridPage.stressLabel": "Sample file explorer",

    "demo.treegrid.label": "Messages",
    "demo.treegrid.subject": "Subject",
    "demo.treegrid.from": "From",
    "demo.treegrid.inbox": "Inbox",
    "demo.treegrid.meeting": "Team meeting",
    "demo.treegrid.lunch": "Lunch",
    "demo.treegrid.drafts": "Drafts",
    "demo.treegrid.untitled": "Untitled",
    "demo.treegrid.me": "Me",
    "demo.treegrid.sent": "Sent",

    "demo.treegridStress.label": "File explorer",
    "demo.treegridStress.resizeLabel": "Resize column",
    "demo.treegridStress.colName": "Name",
    "demo.treegridStress.colType": "Type",
    "demo.treegridStress.colSize": "Size",
    "demo.treegridStress.colModified": "Modified",
    "demo.treegridStress.typeFolder": "Folder",
    "demo.treegridStress.typeTs": "TypeScript file",
    "demo.treegridStress.typeTest": "Test file",
    "demo.treegridStress.typeStyle": "Stylesheet",
    "demo.treegridStress.typeConfig": "Config",
    "demo.treegridStress.typeMarkdown": "Markdown document",
    "demo.treegridStress.typeText": "Text document",
    "demo.treegridStress.projectAlpha": "project-alpha",
    "demo.treegridStress.src": "src",
    "demo.treegridStress.components": "components",
    "demo.treegridStress.buttonFolder": "Button",
    "demo.treegridStress.buttonTsx": "Button.tsx",
    "demo.treegridStress.internalTypesFolder": "internal-types-for-the-component-with-extended-props",
    "demo.treegridStress.buttonPropsTs": "ButtonProps.ts",
    "demo.treegridStress.buttonTestTsx": "Button.test.tsx",
    "demo.treegridStress.buttonModuleCss": "Button.module.css",
    "demo.treegridStress.modalTsx": "Modal.tsx",
    "demo.treegridStress.utilsFolder": "utils",
    "demo.treegridStress.formatUtil": "format-currency-and-long-date-strings-for-every-supported-locale.ts",
    "demo.treegridStress.packageJson": "package.json",
    "demo.treegridStress.readme":
      "README-install-configure-and-deploy-instructions-for-the-whole-team.md",
    "demo.treegridStress.readmeModified": "3 weeks ago by Alice Fernández from the Design team",
    "demo.treegridStress.projectBeta": "project-beta",
    "demo.treegridStress.indexTs": "index.ts",
    "demo.treegridStress.license": "license.txt",
    "demo.treegridStress.modified2d": "2 days ago",
    "demo.treegridStress.modified3d": "3 days ago",
    "demo.treegridStress.modified4d": "4 days ago",
    "demo.treegridStress.modified1h": "1 hour ago",
    "demo.treegridStress.modified5h": "5 hours ago",
    "demo.treegridStress.modified1day": "1 day ago",
    "demo.treegridStress.modified1week": "1 week ago",
    "demo.treegridStress.modified1month": "1 month ago",
    "demo.treegridStress.modified6months": "6 months ago",
  },
} as const;
