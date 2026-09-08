export const dataGridMessages = {
  es: {

    "dataGridPage.description":
      "Data Grid: navegación 2D con roving tabindex para datos tabulares o widgets agrupados.",
    "dataGridPage.betaBadge": "Beta",
    "dataGridPage.lede":
      'La propia especificación WAI-ARIA trata "data grids" y "layout grids" como el mismo patrón. Mismos roles, misma mecánica de roving tabindex, así que este es UN contrato, no dos. Úsalo cuando una grilla de celdas necesita navegación 2D: <a href="/components/table">Table</a> ya cubre el caso de datos tabulares ESTÁTICOS, sin modelo de teclado propio.',
    "dataGridPage.dataTitle": "Datos tabulares",
    "dataGridPage.dataBody": "Celdas de solo texto: la parada de foco es la celda misma.",
    "dataGridPage.dataLabel": "Puntajes por ronda",
    "dataGridPage.layoutTitle": "Widgets agrupados",
    "dataGridPage.layoutBody":
      "Cada celda contiene su propio botón: la parada de foco se la cede a ESE elemento, la celda nunca compite con su propio contenido interactivo por el roving tabindex.",
    "dataGridPage.layoutLabel": "Acciones rápidas",
    "dataGridPage.contractBody":
      'Sin máquina <code>@zag-js/*</code> propia: igual que <code>Treegrid</code>, el modelo de teclado está escrito a mano y es puro, compartido por ambos bindings. <code>wrapCols</code>/<code>wrapRows</code> controlan si las flechas envuelven al borde de la grilla; ambos son <code>false</code> por defecto.',
    "dataGridPage.a11yBody":
      'La raíz lleva <code>role="grid"</code> con <code>aria-label</code> (obligatorio). Cada fila es <code>role="row"</code>, cada celda <code>role="gridcell"</code>. El foco es roving: una sola celda (o su descendiente interactivo) es la parada de tabulación en toda la grilla. <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd>/<kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> mueven entre celdas, <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> dentro de la fila, <kbd class="sk-kbd">Ctrl</kbd>+<kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> saltan al principio/final de la grilla entera.',
    "dataGridPage.testReact1":
      "Le cede la parada de foco al descendiente interactivo PROPIO de la celda, no al div de la celda.",
    "dataGridPage.testReact2":
      "En movimiento vertical, se ajusta a la última celda real de una fila más corta (grilla irregular).",
    "dataGridPage.testVanilla1":
      "Envuelve columnas a la fila siguiente cuando se autora data-wrap-cols.",
    "dataGridPage.testVanilla2": "Clickear una celda mueve la parada de foco ahí.",

    "demo.dataGrid.scoresLabel": "Puntajes por ronda",
    "demo.dataGrid.player": "Jugador",
    "demo.dataGrid.round1": "Ronda 1",
    "demo.dataGrid.round2": "Ronda 2",
    "demo.dataGrid.actionsLabel": "Acciones rápidas",
    "demo.dataGrid.edit": "Editar",
    "demo.dataGrid.copy": "Copiar",
    "demo.dataGrid.delete": "Eliminar",
    "demo.dataGrid.more": "Más opciones",
  },
  en: {

    "dataGridPage.description":
      "Data Grid: 2D roving-tabindex navigation for tabular data or grouped widgets.",
    "dataGridPage.betaBadge": "Beta",
    "dataGridPage.lede":
      'The WAI-ARIA spec itself treats "data grids" and "layout grids" as the same pattern. Identical roles, identical roving-tabindex mechanics, so this is ONE contract, not two. Use it when a grid of cells needs 2D navigation: <a href="/en/components/table">Table</a> already covers STATIC tabular data with no keyboard model of its own.',
    "dataGridPage.dataTitle": "Tabular data",
    "dataGridPage.dataBody": "Plain text cells: the focus stop is the cell itself.",
    "dataGridPage.dataLabel": "Scores by round",
    "dataGridPage.layoutTitle": "Grouped widgets",
    "dataGridPage.layoutBody":
      "Each cell holds its own button: the focus stop hands off to THAT element instead. The cell never competes with its own interactive content for the roving tabindex.",
    "dataGridPage.layoutLabel": "Quick actions",
    "dataGridPage.contractBody":
      'No <code>@zag-js/*</code> machine of its own: same as <code>Treegrid</code>, the keyboard model is hand-rolled and pure, shared by both bindings. <code>wrapCols</code>/<code>wrapRows</code> control whether the arrows wrap at the grid\'s edge; both default to <code>false</code>.',
    "dataGridPage.a11yBody":
      'The root carries <code>role="grid"</code> with <code>aria-label</code> (required). Each row is <code>role="row"</code>, each cell <code>role="gridcell"</code>. Focus is roving: a single cell (or its interactive descendant) is the tab stop for the whole grid. <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd>/<kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> move between cells, <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> within the row, <kbd class="sk-kbd">Ctrl</kbd>+<kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> jump to the start/end of the whole grid.',
    "dataGridPage.testReact1":
      "Hands the roving stop to a cell's OWN interactive descendant, not the cell div.",
    "dataGridPage.testReact2":
      "Clamps into a shorter row's last real cell on vertical movement (ragged grid).",
    "dataGridPage.testVanilla1": "Wraps columns into the next row when data-wrap-cols is set.",
    "dataGridPage.testVanilla2": "Clicking a cell moves the roving stop there.",

    "demo.dataGrid.scoresLabel": "Scores by round",
    "demo.dataGrid.player": "Player",
    "demo.dataGrid.round1": "Round 1",
    "demo.dataGrid.round2": "Round 2",
    "demo.dataGrid.actionsLabel": "Quick actions",
    "demo.dataGrid.edit": "Edit",
    "demo.dataGrid.copy": "Copy",
    "demo.dataGrid.delete": "Delete",
    "demo.dataGrid.more": "More options",
  },
} as const;
