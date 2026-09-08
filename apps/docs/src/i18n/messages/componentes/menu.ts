export const menuMessages = {
  es: {
    "demo.menu.label": "Acciones del archivo",
    "demo.menu.trigger": "Acciones",
    "demo.menu.rename": "Renombrar",
    "demo.menu.favorite": "Favorito",
    "demo.menu.export": "Exportar",
    "demo.menu.multilevel.label": "Insertar contenido",
    "demo.menu.multilevel.trigger": "Insertar",
    "demo.menu.multilevel.heading": "Encabezado",
    "demo.menu.multilevel.media": "Medios",
    "demo.menu.multilevel.image": "Imagen",
    "demo.menu.multilevel.upload": "Subir archivo",
    "demo.menu.multilevel.fromUrl": "Desde una URL",
    "demo.menu.multilevel.video": "Video",
    "demo.menu.multilevel.table": "Tabla",
    "demo.menu.compact.label": "Formato de texto",
    "demo.menu.compact.trigger": "Formato",
    "demo.menu.compact.bold": "Negrita",
    "demo.menu.compact.italic": "Cursiva",
    "demo.menu.compact.underline": "Subrayado",
    "demo.menu.compact.strikethrough": "Tachado",
    "demo.menu.compact.alignLeft": "Alinear a la izquierda",
    "demo.menu.compact.alignCenter": "Alinear al centro",
    "demo.menu.compact.alignRight": "Alinear a la derecha",
    "demo.menu.context.label": "Acciones del elemento",
    "demo.menu.context.area": "Clic derecho (o mantén presionado) dentro de esta área",
    "demo.menu.context.copy": "Copiar",
    "demo.menu.context.paste": "Pegar",
    "demo.menu.context.delete": "Eliminar",
    "demo.menu.safety.trigger": "Archivo",
    "demo.menu.safety.new": "Nuevo",
    "demo.menu.safety.share": "Compartir",
    "demo.menu.safety.email": "Por correo",
    "demo.menu.safety.emailOutlook": "Outlook",
    "demo.menu.safety.emailGmail": "Gmail",
    "demo.menu.safety.emailApple": "Apple Mail",
    "demo.menu.safety.emailYahoo": "Yahoo",
    "demo.menu.safety.link": "Copiar enlace",
    "demo.menu.safety.print": "Imprimir",
    "demo.menu.safety.pdf": "Exportar como PDF",
    "demo.menu.safety.pdfHighRes": "Alta resolución",
    "demo.menu.safety.pdfCompressed": "Comprimido",
    "demo.menu.safety.delete": "Eliminar",

    "menuPage.description": "Acciones, checkboxes y radios con navegación por teclado y typeahead.",
    "menuPage.contractBody":
      "Menu ejecuta acciones, también como context menu mediante <code>contextTarget</code> o <code>data-sk-menu-context-trigger</code>. Un item con <code>children</code> crea un submenú. Para elegir un valor de formulario usa Select; para sugerencias editables, Combobox.",
    "menuPage.a11yBody": "La máquina gestiona flechas, Home, End, Escape, typeahead y retorno de foco.",
    "menuPage.multilevelTitle": "Submenús anidados",
    "menuPage.multilevelBody":
      "Un submenú es el mismo <code>children</code> apuntando de vuelta a sí mismo: no hay un límite de profundidad propio, así que Insertar → Medios → Imagen anida un tercer nivel con la misma forma que el primero.",
    "menuPage.compactTitle": "Densidad compacta",
    "menuPage.compactBody":
      "<code>density: \"compact\"</code> achica cada fila a <code>--size-control-sm</code> (piso de 24px, WCAG 2.2 mínimo) en vez de los 44px de <code>--size-touch-target</code>: un intercambio explícito de área de toque por más filas visibles, para un menú con muchos comandos.",
    "menuPage.contextTitle": "Como context menu",
    "menuPage.contextBody":
      "<code>data-sk-menu-context-trigger</code> (o <code>contextTarget</code> en React) reemplaza al trigger: el elemento absorbe el evento <code>contextmenu</code> del botón derecho y abre el menú, en vez de necesitar un botón visible.",
    "menuPage.safetyTitle": "Intención del puntero (safety triangle)",
    "menuPage.safetyBody":
      "Cuando un submenú está abierto, cruzar en diagonal sobre otro item del menú padre no lo resalta ni cierra el submenú. Lo que lo sostiene es un elemento real: el <em>safe area</em>, un triángulo recortado con <code>clip-path</code> que vive DENTRO del trigger y va del puntero al borde cercano del submenú. Mientras el puntero está sobre él, el navegador no dispara <code>pointerleave</code> en el trigger -un descendiente cuenta como el elemento- así que la máquina nunca entra en <code>closing</code> y los items de abajo nunca reciben el <code>pointermove</code> con el que robarían el resaltado. El polígono propio de <code>@zag-js/menu</code> no alcanzaba: sólo puede vetar un cierre temprano durante los 100ms de <code>waitForCloseDelay</code>, no extenderlos, y con el puntero quieto adentro del polígono el submenú igual se cerraba a los ~90ms. Abrí «Compartir» y cruzá diagonalmente hacia el submenú: el triángulo pintado es el mismo elemento que estás tocando, no un dibujo aparte.",

    "menuPage.testVanilla1":
      'El trigger monta con <code class="sk-code">aria-haspopup="menu"</code> y <code class="sk-code">aria-expanded="false"</code>: el menú no abre solo.',
    "menuPage.testVanilla2":
      'Un click abre el menú; <kbd>Escape</kbd> lo cierra y devuelve el foco al trigger.',
    "menuPage.testVanilla3":
      "Un pointerdown fuera del menú lo cierra, el mismo dismiss-layer que un click adentro ya usa.",
    "menuPage.testVanilla4":
      'Elegir un item dispara el evento <code class="sk-code">sk-select</code> con su value y cierra el menú.',
    "menuPage.testVanilla5":
      'Un item deshabilitado nunca dispara <code class="sk-code">sk-select</code>; el menú se queda abierto.',
    "menuPage.testVanilla6":
      'Un checkbox alterna <code class="sk-code">data-checked</code> y emite <code class="sk-code">sk-checked-change</code>.',
    "menuPage.testVanilla7":
      "Dos radios del mismo grupo son mutuamente excluyentes; elegir uno cierra el menú, como un comando.",
    "menuPage.testVanilla8":
      'Un item con <code class="sk-code">href</code> se renderiza como un <code class="sk-code">&lt;a&gt;</code> real con <code class="sk-code">role="menuitem"</code>.',
    "menuPage.testVanilla9":
      "ArrowDown mueve el resaltado por la lista, saltando el item deshabilitado.",
    "menuPage.testVanilla10":
      'Un item con <code class="sk-code">children</code> monta una segunda instancia real de Menu, cerrada hasta que se abre.',
    "menuPage.testVanilla11":
      "Elegir un item del submenú cierra todo el árbol, padre incluido.",

    "menuPage.testReact1":
      'El trigger monta con <code class="sk-code">aria-haspopup="menu"</code> y <code class="sk-code">aria-expanded="false"</code>: el menú no abre solo.',
    "menuPage.testReact2":
      'Un click abre el menú; <kbd>Escape</kbd> lo cierra y devuelve el foco al trigger.',
    "menuPage.testReact3":
      "Un pointerdown fuera del menú lo cierra, el mismo dismiss-layer que un click adentro ya usa.",
    "menuPage.testReact4":
      'Elegir un item llama a <code class="sk-code">onSelect</code> con su value y cierra el menú.',
    "menuPage.testReact5":
      'Un item deshabilitado nunca llama a <code class="sk-code">onSelect</code>; el menú se queda abierto.',
    "menuPage.testReact6":
      'Un checkbox alterna <code class="sk-code">aria-checked</code> y llama a <code class="sk-code">onCheckedChange</code>.',
    "menuPage.testReact7":
      "Dos radios del mismo grupo son mutuamente excluyentes; elegir uno cierra el menú, como un comando.",
    "menuPage.testReact8":
      'Un item con <code class="sk-code">href</code> se renderiza como un <code class="sk-code">&lt;a&gt;</code> real.',
    "menuPage.testReact9":
      "ArrowDown mueve el resaltado por la lista, saltando el item deshabilitado.",
    "menuPage.testReact10":
      "Elegir un item del submenú cierra todo el árbol, padre incluido.",
  },
  en: {
    "demo.menu.label": "File actions",
    "demo.menu.trigger": "Actions",
    "demo.menu.rename": "Rename",
    "demo.menu.favorite": "Favourite",
    "demo.menu.export": "Export",
    "demo.menu.multilevel.label": "Insert content",
    "demo.menu.multilevel.trigger": "Insert",
    "demo.menu.multilevel.heading": "Heading",
    "demo.menu.multilevel.media": "Media",
    "demo.menu.multilevel.image": "Image",
    "demo.menu.multilevel.upload": "Upload file",
    "demo.menu.multilevel.fromUrl": "From a URL",
    "demo.menu.multilevel.video": "Video",
    "demo.menu.multilevel.table": "Table",
    "demo.menu.compact.label": "Text format",
    "demo.menu.compact.trigger": "Format",
    "demo.menu.compact.bold": "Bold",
    "demo.menu.compact.italic": "Italic",
    "demo.menu.compact.underline": "Underline",
    "demo.menu.compact.strikethrough": "Strikethrough",
    "demo.menu.compact.alignLeft": "Align left",
    "demo.menu.compact.alignCenter": "Align center",
    "demo.menu.compact.alignRight": "Align right",
    "demo.menu.context.label": "Item actions",
    "demo.menu.context.area": "Right-click (or press and hold) inside this area",
    "demo.menu.context.copy": "Copy",
    "demo.menu.context.paste": "Paste",
    "demo.menu.context.delete": "Delete",
    "demo.menu.safety.trigger": "File",
    "demo.menu.safety.new": "New",
    "demo.menu.safety.share": "Share",
    "demo.menu.safety.email": "By email",
    "demo.menu.safety.emailOutlook": "Outlook",
    "demo.menu.safety.emailGmail": "Gmail",
    "demo.menu.safety.emailApple": "Apple Mail",
    "demo.menu.safety.emailYahoo": "Yahoo",
    "demo.menu.safety.link": "Copy link",
    "demo.menu.safety.print": "Print",
    "demo.menu.safety.pdf": "Export as PDF",
    "demo.menu.safety.pdfHighRes": "High resolution",
    "demo.menu.safety.pdfCompressed": "Compressed",
    "demo.menu.safety.delete": "Delete",

    "menuPage.description": "Actions, checkboxes, and radios with keyboard navigation and typeahead.",
    "menuPage.contractBody":
      "Menu runs actions, and also works as a context menu through <code>contextTarget</code> or <code>data-sk-menu-context-trigger</code>. An item with <code>children</code> creates a submenu. To pick a form value use Select; for editable suggestions, Combobox.",
    "menuPage.a11yBody": "The machine manages arrows, Home, End, Escape, typeahead, and focus return.",
    "menuPage.multilevelTitle": "Nested submenus",
    "menuPage.multilevelBody":
      "A submenu is the same <code>children</code> slot pointing back at itself: there is no depth limit of its own, so Insert → Media → Image nests a third level in the same shape as the first.",
    "menuPage.compactTitle": "Compact density",
    "menuPage.compactBody":
      "<code>density: \"compact\"</code> shrinks each row to <code>--size-control-sm</code> (a 24px floor, WCAG 2.2's minimum) instead of <code>--size-touch-target</code>'s 44px: an explicit trade of hit area for more visible rows, for a menu with a lot of commands.",
    "menuPage.contextTitle": "As a context menu",
    "menuPage.contextBody":
      "<code>data-sk-menu-context-trigger</code> (or <code>contextTarget</code> in React) replaces the trigger: the element absorbs the right-click <code>contextmenu</code> event and opens the menu, instead of needing a visible button.",
    "menuPage.safetyTitle": "Pointer intent (safety triangle)",
    "menuPage.safetyBody":
      "When a submenu is open, crossing another parent-menu item on a diagonal path does not highlight it or close the submenu. What holds it is a real element: the <em>safe area</em>, a <code>clip-path</code> triangle living INSIDE the trigger and reaching from the pointer to the submenu's near edge. While the pointer is over it the browser fires no <code>pointerleave</code> on the trigger: a descendant counts as the element: so the machine never enters <code>closing</code> and the rows underneath never get the <code>pointermove</code> they would steal the highlight with. <code>@zag-js/menu</code>'s own polygon was not enough: it can only veto an early close during <code>waitForCloseDelay</code>'s 100ms, never extend them, and a pointer parked motionless inside the polygon still lost the submenu at ~90ms. Open \"Share\" and cross diagonally toward the submenu: the painted triangle is the very element you are touching, not a separate drawing of it.",

    "menuPage.testVanilla1":
      'The trigger mounts with <code class="sk-code">aria-haspopup="menu"</code> and <code class="sk-code">aria-expanded="false"</code>: the menu never opens on its own.',
    "menuPage.testVanilla2":
      'A click opens the menu; <kbd>Escape</kbd> closes it and returns focus to the trigger.',
    "menuPage.testVanilla3":
      "A pointerdown outside the menu closes it, the same dismiss layer a click inside already uses.",
    "menuPage.testVanilla4":
      'Choosing an item fires the <code class="sk-code">sk-select</code> event with its value and closes the menu.',
    "menuPage.testVanilla5":
      'A disabled item never fires <code class="sk-code">sk-select</code>; the menu stays open.',
    "menuPage.testVanilla6":
      'A checkbox toggles <code class="sk-code">data-checked</code> and emits <code class="sk-code">sk-checked-change</code>.',
    "menuPage.testVanilla7":
      "Two radios in the same group are mutually exclusive; choosing one closes the menu, like a command.",
    "menuPage.testVanilla8":
      'An item with <code class="sk-code">href</code> renders as a real <code class="sk-code">&lt;a&gt;</code> with <code class="sk-code">role="menuitem"</code>.',
    "menuPage.testVanilla9":
      "ArrowDown moves the highlight through the item list, skipping the disabled one.",
    "menuPage.testVanilla10":
      'An item with <code class="sk-code">children</code> mounts a real second Menu instance, closed until opened.',
    "menuPage.testVanilla11":
      "Choosing a submenu item closes the whole tree, parent included.",

    "menuPage.testReact1":
      'The trigger mounts with <code class="sk-code">aria-haspopup="menu"</code> and <code class="sk-code">aria-expanded="false"</code>: the menu never opens on its own.',
    "menuPage.testReact2":
      'A click opens the menu; <kbd>Escape</kbd> closes it and returns focus to the trigger.',
    "menuPage.testReact3":
      "A pointerdown outside the menu closes it, the same dismiss layer a click inside already uses.",
    "menuPage.testReact4":
      'Choosing an item calls <code class="sk-code">onSelect</code> with its value and closes the menu.',
    "menuPage.testReact5":
      'A disabled item never calls <code class="sk-code">onSelect</code>; the menu stays open.',
    "menuPage.testReact6":
      'A checkbox toggles <code class="sk-code">aria-checked</code> and calls <code class="sk-code">onCheckedChange</code>.',
    "menuPage.testReact7":
      "Two radios in the same group are mutually exclusive; choosing one closes the menu, like a command.",
    "menuPage.testReact8":
      'An item with <code class="sk-code">href</code> renders as a real <code class="sk-code">&lt;a&gt;</code>.',
    "menuPage.testReact9":
      "ArrowDown moves the highlight through the item list, skipping the disabled one.",
    "menuPage.testReact10":
      "Choosing a submenu item closes the whole tree, parent included.",
  },
} as const;
