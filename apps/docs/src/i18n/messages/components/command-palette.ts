export const commandPaletteMessages = {
  es: {
    "demo.commandPalette.open": "Abrir paleta",
    "demo.commandPalette.label": "Buscar",
    "demo.commandPalette.section": "Componentes",
    "demo.commandPalette.button": "Button",
    "demo.commandPalette.dialog": "Dialog",
    "demo.commandPalette.toc": "Toc",

    "commandPalette.description": "CommandPalette: listbox buscable dentro de un Dialog nativo, con atajo opt-in y cierre por IconButton.",
    "commandPalette.lede":
      'Una <strong>paleta de comandos</strong>: un campo que filtra un índice y un listbox con <code>aria-activedescendant</code>, alojados en un <a href="/components/dialog"><code>Dialog</code></a> nativo (<code>showModal</code>, Esc, foco). El atajo (<a href="/hotkey">Hotkey</a>) es opt-in por atributo; este sitio lo usa con {hotkey}.',
    "commandPalette.contractItem1": 'Raíz: <code>&lt;dialog class="sk-dialog sk-command-palette" data-sk-command-palette&gt;</code>.',
    "commandPalette.contractItem2":
      'Índice JSON vía <code>data-sk-command-palette-index</code> (id del <code>&lt;script type="application/json"&gt;</code>).',
    "commandPalette.contractItem3":
      'Abrir: <code>data-sk-command-palette-open</code> + <code>aria-controls</code> al id del dialog (o el valor del atributo igual al id).',
    "commandPalette.contractItem4":
      'Atajo opcional: <code>data-sk-command-palette-hotkey="mod+k"</code>. Sin él, solo el botón abre.',
    "commandPalette.contractItem5":
      'Cerrar: <code>&lt;form method="dialog"&gt;</code> con IconButton (<code>sk-dialog__close sk-command-palette__close</code>), Esc, o clic en el backdrop.',
    "commandPalette.contractItem6":
      "<code>entries</code> es una opción del contrato, no del uso normal: existe para que un árbol (como el de arriba) pueda sembrar el índice del demo: se emite como el <code>&lt;script&gt;</code> mismo en Vanilla, y como el prop <code>items</code> (parseado) en React. Una composición real sigue autorando su propio índice.",
    "commandPalette.test1": "No reclama nada en reposo: sin opciones y sin popup expandido.",
    "commandPalette.test2": "Filtra a medida que se tipea y apunta al primer resultado.",
    "commandPalette.test3": "Abre desde su trigger y recién ahí llena la lista.",
  },
  en: {
    "demo.commandPalette.open": "Open palette",
    "demo.commandPalette.label": "Search",
    "demo.commandPalette.section": "Components",
    "demo.commandPalette.button": "Button",
    "demo.commandPalette.dialog": "Dialog",
    "demo.commandPalette.toc": "Toc",

    "commandPalette.description": "CommandPalette: a searchable listbox inside a native Dialog, with an opt-in shortcut and an IconButton close.",
    "commandPalette.lede":
      'A <strong>command palette</strong>: a field that filters an index, and a listbox with <code>aria-activedescendant</code>, hosted in a native <a href="/en/components/dialog"><code>Dialog</code></a> (<code>showModal</code>, Esc, focus). The shortcut (<a href="/en/hotkey">Hotkey</a>) is opt-in by attribute; this site uses it with {hotkey}.',
    "commandPalette.contractItem1": 'Root: <code>&lt;dialog class="sk-dialog sk-command-palette" data-sk-command-palette&gt;</code>.',
    "commandPalette.contractItem2":
      'JSON index via <code>data-sk-command-palette-index</code> (the id of the <code>&lt;script type="application/json"&gt;</code>).',
    "commandPalette.contractItem3":
      "Opening: <code>data-sk-command-palette-open</code> + <code>aria-controls</code> set to the dialog's id (or the attribute's value equal to the id).",
    "commandPalette.contractItem4":
      'Optional shortcut: <code>data-sk-command-palette-hotkey="mod+k"</code>. Without it, only the button opens it.',
    "commandPalette.contractItem5":
      'Closing: a <code>&lt;form method="dialog"&gt;</code> with an IconButton (<code>sk-dialog__close sk-command-palette__close</code>), Esc, or a click on the backdrop.',
    "commandPalette.contractItem6":
      "<code>entries</code> is a contract option, not part of normal usage: it exists so a tree (like the one above) can seed the demo's index: it is emitted as the <code>&lt;script&gt;</code> itself in Vanilla, and as the (parsed) <code>items</code> prop in React. A real composition still authors its own index.",
    "commandPalette.test1": "Claims nothing at rest: no options and no expanded popup.",
    "commandPalette.test2": "Filters as the reader types and points at the first hit.",
    "commandPalette.test3": "Opens from its trigger and fills the list only then.",
  },
} as const;
