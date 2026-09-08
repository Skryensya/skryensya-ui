export const treeViewMessages = {
  es: {
    "demo.treeView.label": "Proyecto",
    "demo.tree.initialLabel": "Proyecto",
    "demo.tree.multipleLabel": "Archivos del proyecto",
    "demo.tree.disabledLabel": "Proyecto con rama deshabilitada",
    "demo.tree.filesLabel": "Archivos del proyecto",
    "demo.tree.source": "src",
    "demo.tree.components": "componentes",
    "demo.tree.buttonFile": "botón.tsx",
    "demo.tree.indexFile": "índice.ts",
    "demo.tree.disabledFolder": "legado",
    "demo.tree.selection": "Selección",
    "demo.tree.expansion": "Expansión",

    "treeViewPage.description": "Jerarquías expandibles con selección simple o múltiple.",
    "treeViewPage.betaBadge": "Beta",
    "treeViewPage.lede":
      'Una jerarquía que se recorre con el teclado: las ramas se abren y cierran, los nodos se seleccionan. Usa TreeView cuando la relación padre-hijo <em>es</em> el contenido: archivos, categorías, una organización. Para divulgaciones hermanas sin jerarquía usa <a href="/components/accordion">Accordion</a>; para navegar por secciones, <a href="/components/sidebar">Sidebar</a>.',
    "treeViewPage.minimalTitle": "Árbol mínimo",
    "treeViewPage.minimalBody":
      "Lo mínimo es la anatomía completa y nada más: una raíz, la lista, y por cada nodo una rama (<code>branch</code> + <code>branch-control</code> + <code>branch-content</code>) o una hoja (<code>item</code>). Sin atributos de estado, todo arranca cerrado y sin selección.",
    "treeViewPage.minimalLabel": "TreeView mínimo",
    "treeViewPage.initialTitle": "Estado inicial",
    "treeViewPage.initialBody":
      "<code>data-expanded-value</code> y <code>data-selected-value</code> listan los <code>data-value</code> que arrancan abiertos y seleccionados. Aceptan espacios o comas como separador, y son sólo el estado <em>inicial</em>: desde ahí manda la máquina.",
    "treeViewPage.initialLabel": "Abierto y seleccionado de entrada",
    "treeViewPage.multipleTitle": "Selección múltiple",
    "treeViewPage.multipleBody":
      'data-selection-mode="multiple" deja marcar varios nodos con <kbd class="sk-kbd">Ctrl</kbd>/<kbd class="sk-kbd">⌘</kbd> y extender el rango con <kbd class="sk-kbd">Shift</kbd>. Las ramas anidan sin límite: una rama es un nodo con <code>branch-content</code>, tenga la profundidad que tenga, y la guía vertical marca de quién cuelga cada nivel.',
    "treeViewPage.multipleLabel": "Selección múltiple y tres niveles",
    "treeViewPage.disabledTitle": "Nodos deshabilitados",
    "treeViewPage.disabledBody":
      "Un nodo con <code>disabled</code> no se selecciona ni recibe foco, pero se sigue leyendo. Una rama deshabilitada tampoco se abre, así que no la uses para esconder contenido: para eso, no lo autores.",
    "treeViewPage.disabledLabel": "Nodo deshabilitado",
    "treeViewPage.eventsTitle": "Iconos y eventos",
    "treeViewPage.eventsBody":
      "TreeView reserva una columna para el control de apertura y otra para un icono estructural. Pasa <code>branchIcon</code> para todas las carpetas y <code>leafIcon</code> para todos los archivos: no hace falta inventar un icono por extensión o tipo de dato. La selección y la apertura se escuchan como eventos sobre la raíz.",
    "treeViewPage.eventsLabel": "Archivos con iconos",
    "treeViewPage.contractItem1": 'La raíz se autora con <code>data-sk-tree-view</code> y <code>class="sk-tree-view"</code>; su <code>aria-label</code> nombra el árbol.',
    "treeViewPage.contractItem2":
      "La lista lleva <code>data-sk-tree-view-tree</code>. Cada hijo directo es una rama (<code>data-sk-tree-view-branch</code>) o una hoja (<code>data-sk-tree-view-item</code>).",
    "treeViewPage.contractItem3":
      "Una rama contiene su control (<code>data-sk-tree-view-branch-control</code>, con indicador y texto) y su contenido (<code>data-sk-tree-view-branch-content</code>), que es otra lista de ramas y hojas.",
    "treeViewPage.contractItem4":
      "<code>data-value</code> identifica el nodo: es lo que aparece en los eventos y en <code>data-expanded-value</code> / <code>data-selected-value</code>. Es único en todo el árbol; sin él, el enhancer deriva un id de la posición, que se rompe al reordenar el markup.",
    "treeViewPage.contractItem5": "Cada fila clicable lleva <code>sk-interactive</code>: de ahí salen hover, foco, pressed, selección y el anillo de foco. El componente no pinta estados por su cuenta.",
    "treeViewPage.contractItem6":
      "Eventos sobre la raíz: <code>sk-selection-change</code> con <code>detail.selectedValue</code> y <code>sk-expanded-change</code> con <code>detail.expandedValue</code>, ambos arrays de <code>data-value</code>.",
    "treeViewPage.hooksBody":
      "La sangría, el inset de la fila y la guía vertical son hooks: el árbol viene angosto a propósito, porque la sangría se paga una vez por nivel. Ensancha el paso, dale aire a las filas o apaga la guía sin tocar el resto.",
    "treeViewPage.a11yBody":
      'La máquina publica <code>role="tree"</code>/<code>treeitem</code> con el nivel y la posición de cada nodo, y gestiona el teclado: flechas para moverse, <kbd class="sk-kbd">→</kbd>/<kbd class="sk-kbd">←</kbd> para abrir y cerrar ramas, <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> y typeahead por letra. El foco es roving: el árbol entero es una sola parada de tabulación, no una por nodo.',
    "treeViewPage.test1": "Parcha la semántica de árbol sobre el markup autorado y monta una sola vez.",
    "treeViewPage.test2": "Expande una rama desde su control y lo comunica.",
    "treeViewPage.test3": "Selecciona una hoja y reporta el valor que escribió la composición.",

    "treeViewPage.testReact1": "Renderiza la semántica de árbol a partir de la prop nodes.",
    "treeViewPage.testReact2":
      'Expande una rama desde su control y llama a <code class="sk-code">onExpandedChange</code>.',
    "treeViewPage.testReact3":
      'Las ramas abiertas se pueden sembrar con <code class="sk-code">defaultExpandedValue</code>.',
    "treeViewPage.testReact4":
      'Selecciona una hoja y llama a <code class="sk-code">onSelectionChange</code>.',
    "treeViewPage.testReact5": "Reemplaza la selección en modo single.",
    "treeViewPage.testReact6": "Extiende la selección en modo multiple con el modificador de la plataforma.",
    "treeViewPage.testReact7": "Un nodo deshabilitado queda fuera de la selección.",
  },
  en: {
    "demo.treeView.label": "Project",
    "demo.tree.initialLabel": "Project",
    "demo.tree.multipleLabel": "Project files",
    "demo.tree.disabledLabel": "Project with a disabled branch",
    "demo.tree.filesLabel": "Project files",
    "demo.tree.source": "src",
    "demo.tree.components": "components",
    "demo.tree.buttonFile": "button.tsx",
    "demo.tree.indexFile": "index.ts",
    "demo.tree.disabledFolder": "legacy",
    "demo.tree.selection": "Selection",
    "demo.tree.expansion": "Expansion",

    "treeViewPage.description": "Expandable hierarchies with single or multiple selection.",
    "treeViewPage.betaBadge": "Beta",
    "treeViewPage.lede":
      'A hierarchy you move through with the keyboard: branches open and close, nodes get selected. Use TreeView when the parent-child relationship <em>is</em> the content: files, categories, an organization. For sibling disclosures with no hierarchy use <a href="/en/components/accordion">Accordion</a>; to navigate between sections, <a href="/en/components/sidebar">Sidebar</a>.',
    "treeViewPage.minimalTitle": "Minimal tree",
    "treeViewPage.minimalBody":
      "The minimum is the complete anatomy and nothing else: a root, the list, and for every node a branch (<code>branch</code> + <code>branch-control</code> + <code>branch-content</code>) or a leaf (<code>item</code>). With no state attributes, everything starts closed and unselected.",
    "treeViewPage.minimalLabel": "Minimal TreeView",
    "treeViewPage.initialTitle": "Initial state",
    "treeViewPage.initialBody":
      "<code>data-expanded-value</code> and <code>data-selected-value</code> list the <code>data-value</code>s that start open and selected. They accept spaces or commas as a separator, and are only the <em>initial</em> state: from there the machine takes over.",
    "treeViewPage.initialLabel": "Open and selected from the start",
    "treeViewPage.multipleTitle": "Multiple selection",
    "treeViewPage.multipleBody":
      'data-selection-mode="multiple" lets you mark several nodes with <kbd class="sk-kbd">Ctrl</kbd>/<kbd class="sk-kbd">⌘</kbd> and extend the range with <kbd class="sk-kbd">Shift</kbd>. Branches nest with no limit: a branch is a node with <code>branch-content</code>, whatever its depth, and the vertical guide marks which one each level hangs from.',
    "treeViewPage.multipleLabel": "Multiple selection and three levels",
    "treeViewPage.disabledTitle": "Disabled nodes",
    "treeViewPage.disabledBody":
      "A node with <code>disabled</code> cannot be selected or receive focus, but it still reads. A disabled branch does not open either, so do not use it to hide content: for that, do not author it in the first place.",
    "treeViewPage.disabledLabel": "Disabled node",
    "treeViewPage.eventsTitle": "Icons and events",
    "treeViewPage.eventsBody":
      "TreeView reserves one column for the expand control and another for a structural icon. Pass <code>branchIcon</code> for every folder and <code>leafIcon</code> for every file: no need to invent an icon per extension or data type. Selection and expansion get listened to as events on the root.",
    "treeViewPage.eventsLabel": "Files with icons",
    "treeViewPage.contractItem1": 'The root is authored with <code>data-sk-tree-view</code> and <code>class="sk-tree-view"</code>; its <code>aria-label</code> names the tree.',
    "treeViewPage.contractItem2":
      "The list carries <code>data-sk-tree-view-tree</code>. Every direct child is a branch (<code>data-sk-tree-view-branch</code>) or a leaf (<code>data-sk-tree-view-item</code>).",
    "treeViewPage.contractItem3":
      "A branch contains its control (<code>data-sk-tree-view-branch-control</code>, with an indicator and text) and its content (<code>data-sk-tree-view-branch-content</code>), which is another list of branches and leaves.",
    "treeViewPage.contractItem4":
      "<code>data-value</code> identifies the node: it is what shows up in events and in <code>data-expanded-value</code> / <code>data-selected-value</code>. It is unique across the whole tree; without it, the enhancer derives an id from position, which breaks when the markup gets reordered.",
    "treeViewPage.contractItem5": "Every clickable row carries <code>sk-interactive</code>: that is where hover, focus, pressed, selection, and the focus ring come from. The component paints no states on its own.",
    "treeViewPage.contractItem6":
      "Events on the root: <code>sk-selection-change</code> with <code>detail.selectedValue</code>, and <code>sk-expanded-change</code> with <code>detail.expandedValue</code>, both arrays of <code>data-value</code>.",
    "treeViewPage.hooksBody":
      "Indent, row inset, and the vertical guide are hooks: the tree ships narrow on purpose, because the indent gets paid once per level. Widen the step, give the rows more air, or turn off the guide without touching the rest.",
    "treeViewPage.a11yBody":
      'The machine publishes <code>role="tree"</code>/<code>treeitem</code> with each node\'s level and position, and manages the keyboard: arrows to move, <kbd class="sk-kbd">→</kbd>/<kbd class="sk-kbd">←</kbd> to open and close branches, <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd>, and letter typeahead. Focus is roving: the whole tree is a single tab stop, not one per node.',
    "treeViewPage.test1": "Patches tree semantics onto authored markup and mounts once.",
    "treeViewPage.test2": "Expands a branch from its control and says so.",
    "treeViewPage.test3": "Selects a leaf and reports the value the composition wrote.",

    "treeViewPage.testReact1": "Renders tree semantics from the nodes prop.",
    "treeViewPage.testReact2":
      'Expands a branch from its control and calls <code class="sk-code">onExpandedChange</code>.',
    "treeViewPage.testReact3":
      'Open branches can be seeded with <code class="sk-code">defaultExpandedValue</code>.',
    "treeViewPage.testReact4":
      'Selects a leaf and calls <code class="sk-code">onSelectionChange</code>.',
    "treeViewPage.testReact5": "Replaces the selection in single mode.",
    "treeViewPage.testReact6": "Extends the selection in multiple mode with the platform's own modifier.",
    "treeViewPage.testReact7": "A disabled node is left out of the selection.",
  },
} as const;
