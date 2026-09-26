export const clipboardMessages = {
  es: {
    "clipboard.description": "Copia un valor al portapapeles con un clic y confirma si funcionó.",
    "clipboard.betaBadge": "Beta",

    "clipboard.lede":
      "Dos formas, una misma máquina (<code>@zag-js/clipboard</code>) en las dos capas. <strong>CopyButton</strong> es el botón solo, al lado de lo que copia. <strong>Clipboard</strong> suma una etiqueta y un campo de solo lectura con el valor, para cuando hay que verlo antes de copiarlo.",

    "clipboard.whenTitle": "Cuál usar",
    "clipboard.whenItem1":
      "<strong>CopyButton</strong> para un comando, un token o un bloque de código que ya está a la vista: copia <code>value</code> o, al momento del clic, el texto del elemento que nombra <code>target</code>",
    "clipboard.whenItem2":
      "<strong>Clipboard</strong> para un enlace para compartir, una clave de API o un identificador: el valor se ve, se puede seleccionar y copiar con el teclado, y el botón queda al lado",
    "clipboard.whenItem3":
      "Ninguno si la acción hace algo más que copiar (compartir, exportar, descargar): eso es un Button con su propio nombre",

    "clipboard.targetTitle": "Copiar otro elemento",
    "clipboard.targetBody":
      "<code>target</code> es el id del elemento cuyo texto se copia, leído en el momento del clic: si el bloque cambió desde que cargó la página, se copia lo que está en pantalla. Un <code>&lt;template&gt;</code> copia su contenido, para texto que no se muestra.",
    "clipboard.targetLabel": "CopyButton con target",

    "clipboard.fieldTitle": "Un valor que hay que ver",
    "clipboard.fieldBody":
      "La etiqueta nombra el campo, y el campo es de solo lectura: se puede seleccionar a mano o copiar con el teclado, y ese Ctrl+C también cuenta como copia para el botón. Un enlace largo se recorta dentro del campo; el botón nunca se achica.",
    "clipboard.fieldLabel": "Clipboard con enlace para compartir",

    "clipboard.sizesTitle": "Tamaños y variantes",
    "clipboard.sizesBody":
      "<code>size</code> es <code>xs</code>, <code>sm</code> (por defecto) o <code>md</code>, y <code>variant</code> es <code>soft</code> (por defecto) o <code>ghost</code>. No hay <code>solid</code>: copiar nunca es la acción principal de la pantalla. En <code>Clipboard</code> el botón toma la altura del campo, así que estas dos opciones son sólo de <code>CopyButton</code>.",
    "clipboard.sizesLabel": "Tamaños y variantes de CopyButton",

    "clipboard.feedbackTitle": "Qué ve y qué oye quien copia",
    "clipboard.feedbackItem1":
      "El icono cambia a un check y una banderita al lado del botón dice <code>copiedLabel</code> («Copied» por defecto) durante <code>timeout</code> milisegundos (<code>2000</code>)",
    "clipboard.feedbackItem2":
      "Una región viva cortés anuncia lo mismo una vez; la banderita es decorativa (<code>aria-hidden</code>), así que no se lee dos veces",
    "clipboard.feedbackItem3":
      "Si el navegador rechaza la escritura (sin permiso, contexto inseguro), el botón lleva <code>data-error</code> y dice <code>errorLabel</code> en vez de mostrar «Copiado» igual",
    "clipboard.feedbackItem4":
      "<code>label</code> es el nombre accesible del botón en reposo: si la página tiene varios, que diga <em>qué</em> se copia",

    "clipboard.eventsTitle": "Escuchar el resultado",
    "clipboard.eventsBody":
      "En React, <code>onStatusChange</code> recibe <code>\"copied\"</code>, <code>\"error\"</code> o <code>\"idle\"</code>. Sin framework, el mismo dato llega en <code>sk:clipboardstatuschange</code>, que burbujea desde la raíz.",

    "clipboard.demoCopy": "Copiar",
    "clipboard.demoCopyCommand": "Copiar comando de instalación",
    "clipboard.demoCopyLink": "Copiar enlace",
    "clipboard.demoShareLink": "Enlace para compartir",
    "clipboard.demoCopied": "Copiado",
    "clipboard.demoError": "No se pudo copiar",
  },
  en: {
    "clipboard.description": "Copies a value to the clipboard in one click, and confirms whether it worked.",
    "clipboard.betaBadge": "Beta",

    "clipboard.lede":
      "Two shapes, one machine (<code>@zag-js/clipboard</code>) in both bindings. <strong>CopyButton</strong> is the button alone, beside what it copies. <strong>Clipboard</strong> adds a label and a read-only field showing the value, for when the reader should see it before copying.",

    "clipboard.whenTitle": "Which one",
    "clipboard.whenItem1":
      "<strong>CopyButton</strong> for a command, a token or a code block already on screen: it copies <code>value</code> or, at the moment of the click, the text of the element <code>target</code> names",
    "clipboard.whenItem2":
      "<strong>Clipboard</strong> for a share link, an API key or an identifier: the value is visible, can be selected and copied from the keyboard, and the button sits beside it",
    "clipboard.whenItem3":
      "Neither when the action does more than copy (share, export, download): that is a Button with its own name",

    "clipboard.targetTitle": "Copying another element",
    "clipboard.targetBody":
      "<code>target</code> is the id of the element whose text is copied, read at the moment of the click: if the block changed since the page loaded, what is on screen is what gets copied. A <code>&lt;template&gt;</code> copies its content, for text that is not shown.",
    "clipboard.targetLabel": "CopyButton with a target",

    "clipboard.fieldTitle": "A value worth seeing",
    "clipboard.fieldBody":
      "The label names the field, and the field is read-only: it can be selected by hand or copied from the keyboard, and that Ctrl+C counts as a copy for the button too. A long link truncates inside the field; the button never shrinks.",
    "clipboard.fieldLabel": "Clipboard with a share link",

    "clipboard.sizesTitle": "Sizes and variants",
    "clipboard.sizesBody":
      "<code>size</code> is <code>xs</code>, <code>sm</code> (default) or <code>md</code>, and <code>variant</code> is <code>soft</code> (default) or <code>ghost</code>. There is no <code>solid</code>: copying is never the screen's primary action. In <code>Clipboard</code> the button takes the field's height, so both options belong to <code>CopyButton</code> only.",
    "clipboard.sizesLabel": "CopyButton sizes and variants",

    "clipboard.feedbackTitle": "What the person copying sees and hears",
    "clipboard.feedbackItem1":
      "The icon turns into a check and a small flag beside the button says <code>copiedLabel</code> (\"Copied\" by default) for <code>timeout</code> milliseconds (<code>2000</code>)",
    "clipboard.feedbackItem2":
      "A polite live region announces the same thing once; the flag is decorative (<code>aria-hidden</code>), so it is never read twice",
    "clipboard.feedbackItem3":
      "If the browser refuses the write (no permission, an insecure context), the button carries <code>data-error</code> and says <code>errorLabel</code> instead of showing \"Copied\" anyway",
    "clipboard.feedbackItem4":
      "<code>label</code> is the button's accessible name at rest: when a page has several, make it say <em>what</em> is copied",

    "clipboard.eventsTitle": "Listening for the result",
    "clipboard.eventsBody":
      "In React, <code>onStatusChange</code> receives <code>\"copied\"</code>, <code>\"error\"</code> or <code>\"idle\"</code>. Without a framework, the same value arrives on <code>sk:clipboardstatuschange</code>, bubbling from the root.",

    "clipboard.demoCopy": "Copy",
    "clipboard.demoCopyCommand": "Copy the install command",
    "clipboard.demoCopyLink": "Copy link",
    "clipboard.demoShareLink": "Share link",
    "clipboard.demoCopied": "Copied",
    "clipboard.demoError": "Copy failed",
  },
} as const;
