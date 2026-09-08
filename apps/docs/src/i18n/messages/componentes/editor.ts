export const editorMessages = {
  es: {
    "demo.editor.placeholder": "Escribe algo…",
    "demo.editor.label": "Contenido",

    "editorPage.description": "Editor: superficie de texto enriquecido con una barra de formato arriba, construida sobre ProseMirror.",
    "editorPage.betaBadge": "Beta",
    "editorPage.lede":
      "Un <code>&lt;textarea&gt;</code> con barra de herramientas arriba, pero de verdad: negrita, cursiva, subrayado, enlaces, títulos, listas, citas y bloques de código, con deshacer y rehacer. Cada cambio entrega el contenido en tres formatos a la vez.",
    "editorPage.formatsTitle": "Formatos de salida",
    "editorPage.formatsBody":
      "Cada cambio entrega <code>html</code> (vía <code>DOMSerializer</code>), <code>markdown</code> (vía <code>prosemirror-markdown</code>) y <code>doc</code>, el nodo de ProseMirror sin serializar, los tres a la vez. El subrayado no tiene sintaxis nativa en CommonMark: se exporta como <code>&lt;u&gt;</code> HTML embebido - una salida válida, pero una entrada con pérdida, ya que el editor nunca vuelve a leer su propio Markdown en uso normal.",
    "editorPage.contractItem1":
      "<code>sk-editor</code> compone la barra (<code>Toolbar</code>, reusada sin cambios) y la superficie de contenido (<code>sk-input</code>, la misma caja que Textarea).",
    "editorPage.contractItem2":
      "El valor inicial es <code>defaultValue</code>, un string HTML - no controlado: no existe un <code>value</code> en vivo, porque una superficie contenteditable controlada pelea contra sus propias mutaciones del DOM en cada render.",
    "editorPage.contractItem3":
      "No existe una versión sin barra: <code>Editor</code> es la única signature, y siempre viene con su propia barra de formato.",
    "editorPage.contractItem4":
      "El motor (<code>@skryensya/editor</code>) es un peer dependency opcional de React y Vanilla: importar cualquier otro componente nunca instala ProseMirror.",
    "editorPage.compactTitle": "Barra compacta",
    "editorPage.compactBody":
      "<code>toolbarCompact</code> reduce el padding y el gap de la barra - la misma anatomía, más chica, no un juego distinto de botones. Es una opción, no una segunda signature: a diferencia de <code>ColorPicker.compact</code> (que quita filas enteras del panel), acá sólo cambia el espaciado, así que sigue la misma lógica que <code>CodePreview.density</code>. Pensada para un espacio angosto - un comentario, una respuesta corta.",
    "editorPage.compactLabel": "Editor con barra compacta",
    "editorPage.a11yBody":
      "La superficie es <code>role=\"textbox\"</code> con <code>aria-multiline=\"true\"</code>; dentro de un FormField hereda su <code>id</code>/<code>aria-describedby</code>/<code>aria-invalid</code>. Cada botón de la barra anuncia su estado con <code>aria-pressed</code>, y la barra hereda el roving tabindex de Toolbar: las flechas se mueven entre botones y Tab entra y sale de la barra en un solo paso.",
  },
  en: {
    "demo.editor.placeholder": "Write something…",
    "demo.editor.label": "Content",

    "editorPage.description": "Editor: a rich-text surface with a formatting bar on top, built on ProseMirror.",
    "editorPage.betaBadge": "Beta",
    "editorPage.lede":
      "A <code>&lt;textarea&gt;</code> with a toolbar on top, for real: bold, italic, underline, links, headings, lists, blockquotes and code blocks, with undo/redo. Every change reports the content in three formats at once.",
    "editorPage.formatsTitle": "Output formats",
    "editorPage.formatsBody":
      "Every change reports <code>html</code> (via <code>DOMSerializer</code>), <code>markdown</code> (via <code>prosemirror-markdown</code>) and <code>doc</code>, the raw ProseMirror node, all three at once. Underline has no native CommonMark syntax: it serializes as raw embedded <code>&lt;u&gt;</code> HTML - a valid output, but a lossy input, since the editor never re-reads its own Markdown in normal use.",
    "editorPage.contractItem1":
      "<code>sk-editor</code> composes the bar (<code>Toolbar</code>, reused unchanged) and the content surface (<code>sk-input</code>, the same box Textarea uses).",
    "editorPage.contractItem2":
      "The initial value is <code>defaultValue</code>, an HTML string - uncontrolled: there is no live <code>value</code>, because a controlled contenteditable surface fights its own DOM mutations on every render.",
    "editorPage.contractItem3":
      "There is no toolbar-less version: <code>Editor</code> is the only signature, and it always ships with its own formatting bar.",
    "editorPage.contractItem4":
      "The engine (<code>@skryensya/editor</code>) is an optional peer dependency of both React and Vanilla: importing any other component never installs ProseMirror.",
    "editorPage.compactTitle": "Compact bar",
    "editorPage.compactBody":
      "<code>toolbarCompact</code> tightens the bar's own padding and gap - the same anatomy, smaller, not a different button set. It is an option, not a second signature: unlike <code>ColorPicker.compact</code> (which drops whole panel rows), only spacing changes here, so it follows <code>CodePreview.density</code>'s own shape instead. Meant for a tight space - a comment, a short reply.",
    "editorPage.compactLabel": "Editor with a compact bar",
    "editorPage.a11yBody":
      "The surface is <code>role=\"textbox\"</code> with <code>aria-multiline=\"true\"</code>; nested in a FormField it inherits its <code>id</code>/<code>aria-describedby</code>/<code>aria-invalid</code>. Every bar button announces its state with <code>aria-pressed</code>, and the bar inherits Toolbar's own roving tabindex: arrows move between buttons, and Tab enters and exits the bar in one step.",
  },
} as const;
