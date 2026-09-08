export const menubarMessages = {
  es: {

    "menubarPage.description":
      "Menubar: una barra horizontal persistente de comandos, algunos con desplegable.",
    "menubarPage.lede":
      'El patrón WAI-ARIA <code>menubar</code>: <code>menubar-editor</code>, el ejemplo que le da nombre. No es <a href="/components/menu">Menu</a> (un solo trigger, un solo popup): acá son VARIOS ítems en una sola fila de roving tabindex, donde flecha izquierda/derecha mueve entre ellos, y el detalle que una implementación ingenua se pierde: moverse a un ítem adyacente mientras un desplegable está abierto cierra el viejo y abre el nuevo, no solo mueve un resaltado.',
    "menubarPage.contractBody":
      'Sin máquina <code>@zag-js/*</code> propia: igual que <code>Treegrid</code>/<code>DataGrid</code>, escrito a mano y compartido por ambos bindings. Alcance de v1, de la BARRA misma: UN desplegable por ítem de nivel superior, y ni siquiera eso lo maneja <code>Menubar</code> a mano: moverse a un ítem vecino con el desplegable abierto cierra el viejo y abre el nuevo, todo vía la propia <code>api.setOpen()</code> de <code>Menu</code>. El CONTENIDO de un desplegable no tiene ese límite: es un <code>Menu</code> real, así que anida submenús tan profundo como <code>Menu</code> permite (ver «Desplegables con submenú» más abajo).',
    "menubarPage.label": "Barra de menú",
    "menubarPage.submenuTitle": "Desplegables con submenú",
    "menubarPage.submenuBody":
      'Un ítem del desplegable puede abrir su propio submenú: «Exportar» aquí: porque el desplegable ENTERO es un <code>Menu</code> real, y los submenús arbitrariamente anidados ya son de <code>Menu</code>, no algo que <code>Menubar</code> tenga que reimplementar. El alcance propio de la barra (roving tabindex, un desplegable por ítem de nivel superior) no cambia: sólo el CONTENIDO de un desplegable puede anidar tan profundo como <code>Menu</code> permite.',
    "menubarPage.navSkinTitle": "Como nav-list",
    "menubarPage.navSkinBody":
      'La opción <code>nav</code> del ítem cambia el trigger por el link real de <code>nav-list</code> (<code>sk-nav-list__link</code>/<code>__label</code>) en vez de un <code>Button</code>, y cada entrada del desplegable con <code>href</code> es un <code>&lt;a&gt;</code> real que navega: el ejemplo <code>menubar-navigation</code> de WAI-ARIA. La barra sigue siendo <code>Menubar</code>: roving tabindex, desplegables, todo el comportamiento; lo único que cambia es el elemento y las clases que pinta el trigger.',
    "menubarPage.a11yBody":
      'La raíz lleva <code>role="menubar"</code> con <code>aria-label</code> (obligatorio). Cada ítem de nivel superior es <code>role="menuitem"</code>, con <code>aria-haspopup="menu"</code>/<code>aria-expanded</code> solo si abre un desplegable. El foco es roving: una sola parada en toda la barra. <kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> mueven entre ítems (y si un desplegable estaba abierto, abren el del ítem nuevo en vez de solo mover el resaltado); <kbd class="sk-kbd">↓</kbd> abre el desplegable y enfoca su primer ítem, <kbd class="sk-kbd">↑</kbd> el último; dentro de un desplegable abierto, <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd> mueven entre sus comandos; <kbd class="sk-kbd">Escape</kbd> lo cierra y devuelve el foco a su trigger; <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> saltan al primer/último ítem (o al primer/último comando si el desplegable está abierto).',
    "menubarPage.testCore1":
      "Al moverse mientras un desplegable estaba abierto, mantiene abierto el del ítem SIGUIENTE. El detalle que un roving tabindex plano se pierde.",
    "menubarPage.testReact1":
      "Moverse a la derecha mientras un desplegable está abierto lo cierra y abre el del ítem adyacente.",
    "menubarPage.testReact2": "Escape cierra el desplegable abierto y devuelve el foco a su trigger.",
    "menubarPage.testVanilla1": "Clickear el trigger de un ítem vecino mientras un desplegable está abierto cierra el primero y abre el del vecino.",

    "demo.menubar.label": "Barra de menú",
    "demo.menubar.file": "Archivo",
    "demo.menubar.new": "Nuevo",
    "demo.menubar.open": "Abrir",
    "demo.menubar.save": "Guardar",
    "demo.menubar.export": "Exportar",
    "demo.menubar.pdf": "PDF",
    "demo.menubar.csv": "CSV",
    "demo.menubar.print": "Imprimir",
    "demo.menubar.edit": "Editar",
    "demo.menubar.undo": "Deshacer",
    "demo.menubar.redo": "Rehacer",
    "demo.menubar.destinations": "Destinos",
  },
  en: {

    "menubarPage.description":
      "Menubar: a persistent horizontal bar of commands, some opening a dropdown.",
    "menubarPage.lede":
      'The WAI-ARIA <code>menubar</code> pattern: <code>menubar-editor</code>, the example it is named after. Not <a href="/en/components/menu">Menu</a> (one trigger, one popup): here there are SEVERAL items in a single roving-tabindex row, where Left/Right moves between them, and the detail a naive implementation misses: moving to an adjacent item while a dropdown is open closes the old one and opens the new one too, not just moves a highlight.',
    "menubarPage.contractBody":
      'No <code>@zag-js/*</code> machine of its own: same as <code>Treegrid</code>/<code>DataGrid</code>, hand-rolled and shared by both bindings. v1 scope, of the BAR itself: ONE dropdown per top-level item, and even that is not hand-managed: moving to a neighboring item while a dropdown is open closes the old one and opens the new one through <code>Menu</code>\'s own <code>api.setOpen()</code>. A dropdown\'s own CONTENT has no such limit: it is a real <code>Menu</code>, so it nests submenus exactly as deep as <code>Menu</code> allows (see "Dropdowns with a submenu" below).',
    "menubarPage.label": "Menu bar",
    "menubarPage.submenuTitle": "Dropdowns with a submenu",
    "menubarPage.submenuBody":
      'A dropdown item can open its own submenu: "Export" here: because the WHOLE dropdown is a real <code>Menu</code>, and arbitrarily-nested submenus already belong to <code>Menu</code>, not something <code>Menubar</code> has to reimplement. The bar\'s own scope (roving tabindex, one dropdown per top-level item) does not change: only a dropdown\'s own CONTENT can nest as deep as <code>Menu</code> allows.',
    "menubarPage.navSkinTitle": "As nav-list",
    "menubarPage.navSkinBody":
      "The item's <code>nav</code> option swaps the trigger for <code>nav-list</code>'s own real link (<code>sk-nav-list__link</code>/<code>__label</code>) instead of a <code>Button</code>, and every dropdown entry with an <code>href</code> is a real <code>&lt;a&gt;</code> that navigates: WAI-ARIA's own <code>menubar-navigation</code> example. The bar is still a real <code>Menubar</code>: roving tabindex, dropdowns, every behavior; only the trigger's element and classes change.",
    "menubarPage.a11yBody":
      'The root carries <code>role="menubar"</code> with <code>aria-label</code> (required). Each top-level item is <code>role="menuitem"</code>, with <code>aria-haspopup="menu"</code>/<code>aria-expanded</code> only if it opens a dropdown. Focus is roving: a single stop for the whole bar. <kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> move between items (and if a dropdown was open, open the new item\'s instead of just moving the highlight); <kbd class="sk-kbd">↓</kbd> opens the dropdown and focuses its first item, <kbd class="sk-kbd">↑</kbd> the last; inside an open dropdown, <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd> move between its commands; <kbd class="sk-kbd">Escape</kbd> closes it and returns focus to its trigger; <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> jump to the first/last item (or the first/last command if a dropdown is open).',
    "menubarPage.testCore1":
      "Moving while a dropdown was open keeps the NEXT item's dropdown open. The detail a plain roving tabindex misses.",
    "menubarPage.testReact1":
      "Moving right while a dropdown is open closes it and opens the adjacent item's dropdown.",
    "menubarPage.testReact2": "Escape closes the open dropdown and returns focus to its trigger.",
    "menubarPage.testVanilla1": "Clicking a neighboring item's trigger while one dropdown is open closes the first and opens the neighbor's.",

    "demo.menubar.label": "Menu bar",
    "demo.menubar.file": "File",
    "demo.menubar.new": "New",
    "demo.menubar.open": "Open",
    "demo.menubar.save": "Save",
    "demo.menubar.export": "Export",
    "demo.menubar.pdf": "PDF",
    "demo.menubar.csv": "CSV",
    "demo.menubar.print": "Print",
    "demo.menubar.edit": "Edit",
    "demo.menubar.undo": "Undo",
    "demo.menubar.redo": "Redo",
    "demo.menubar.destinations": "Destinations",
  },
} as const;
