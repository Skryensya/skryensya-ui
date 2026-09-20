export const fileUploadMessages = {
  es: {

    "demo.fileUpload.label": "Adjuntos",
    "demo.fileUpload.dropzone": "Arrastra archivos aquí",
    "demo.fileUpload.trigger": "Elegir archivos",
    "demo.fileUpload.anatomyHint": "PDF o imagen, hasta 10 MB",
    "demo.fileUpload.anatomyItem": "informe-final-consolidado-2026.pdf",
    "demo.fileUpload.anatomyRemove": "Quitar informe-final-consolidado-2026.pdf",

    "demo.fileUpload.overlay": "Suelta los archivos para adjuntarlos",

    "fileUploadPage.description": "Selección y drag-and-drop con límites, rechazo y lista de archivos.",
    "fileUploadPage.anatomyBody":
      "La dropzone (con su glifo, su instrucción y su hint adentro), el conteo y la lista de archivos elegidos. En vivo la caja y la lista conviven, pero solo después de elegir algo, y un diagrama no puede esperar a eso para poder señalar una fila: el espécimen está congelado con las dos. <strong>Cuatro partes no aparecen acá</strong>, y no por olvido: <code>__input</code> está oculto a la vista por diseño (es el input real, el camino del teclado), <code>__overlay</code> y <code>__overlay-body</code> solo existen mientras se arrastra un archivo encima, y <code>__rejection</code> solo después de que algo se rechaza. Ninguna de las tres últimas es dibujable en una foto fija.",
    "fileUploadPage.anatomyLabel": "Anatomía de FileUpload",
    "fileUploadPage.anatomyPreviewLabel": "FileUpload, parte por parte",
    "fileUploadPage.contractBody": "Vanilla emite sk:fileuploadchange y nunca inventa una carga remota. React expone archivos aceptados y rechazados.",
    "fileUploadPage.a11yBody": "El input real permanece disponible para formularios y tecnología asistiva; la dropzone no lo sustituye.",
    "fileUploadPage.validationTitle": "Qué se acepta, y qué se dice cuando no",
    "fileUploadPage.validationBody":
      "Cinco límites, todos opcionales: <code>accept</code> (tipos, en la misma sintaxis del atributo), <code>maxFileSize</code> y <code>minFileSize</code> (peso por archivo), <code>maxTotalSize</code> (peso de todo junto) y <code>maxFiles</code> más <code>multiple</code> (cuántos). Los cuatro primeros los revisa la máquina; el peso total no lo trae y se agrega por su propio <code>validate</code>, porque un formulario con un buzón de 25 MB detrás acepta diez archivos de 5 MB y recién falla al enviar, cuando la persona ya no puede hacer nada. <strong>La línea bajo la instrucción no se escribe a mano</strong>: sale de esos mismos números, así que no puede prometer algo que el validador no cumple. Y cuando algo se rechaza, el mensaje trae el límite adentro: \"pesa demasiado (máximo 5 MB)\" dice qué hacer; \"pesa demasiado\" solo dice que no.",
    "fileUploadPage.chosenTitle": "Lo elegido, antes de enviarlo",
    "fileUploadPage.chosenBody":
      "La caja punteada es el <strong>estado vacío</strong> de este control, y se queda: la lista de archivos va <strong>debajo</strong>, no en su lugar, para que el segundo archivo se suelte donde se soltó el primero. Solo desaparece cuando ya no cabe ninguno más (<code>maxFiles</code> alcanzado), y vuelve al quitar uno. Cada archivo aceptado es una fila con lo que es, cómo se llama, de qué tipo, cuánto pesa y su propio botón para quitarlo. Una imagen se muestra a sí misma: una lista de nombres es un acuse de recibo, no una confirmación, y quien eligió tres fotos entre noventa está comprobando que agarró esas tres. La lista se anuncia con <code>aria-live=\"polite\"</code>, y al quitar una fila el foco pasa a la siguiente en vez de caerse al <code>body</code>.",
    "fileUploadPage.dropScopeTitle": "Dónde se puede soltar",
    "fileUploadPage.dropScopeBody":
      "Por defecto solo cuenta la caja punteada (<code>dropScope: \"zone\"</code>). <code>\"page\"</code> convierte todo el documento en destino, que es lo que ya hace cualquier cliente de correo: se arrastra el archivo sobre la ventana y cae. Pide <code>overlayLabel</code>, porque un destino que no se ve es una función que solo conoce quien la programó. La caja punteada no se va: esta opción <strong>suma</strong> una superficie, nunca reemplaza la que el teclado y el selector de archivos necesitan. Acá el destino es el marco del preview, que es un documento propio: arrastra un archivo encima.",
    "fileUploadPage.pageDropLabel": "Soltar en cualquier parte del documento",
    "fileUploadPage.dropScopeA11yBody":
      "El cartel de arrastre lleva <code>aria-hidden</code>: es respuesta a un gesto de puntero que quien usa lector de pantalla no está haciendo, y el camino accesible a los mismos archivos (la etiqueta, el input real, el botón) no cambia en ninguno de los tres alcances.",

    "fileUploadPage.testVanilla1":
      'La dropzone es un <code class="sk-code">role="button"</code> real y tabulable, no decoración; el trigger es un botón nativo.',
    "fileUploadPage.testVanilla8":
      "Enter o Espacio sobre la dropzone abren el selector de archivos, no solo un click de mouse.",
    "fileUploadPage.testVanilla2":
      'Elegir un archivo válido emite <code class="sk-code">sk:fileuploadchange</code> con el archivo aceptado.',
    "fileUploadPage.testVanilla3":
      'Un archivo que excede el tamaño emite <code class="sk-code">sk:fileuploadchange</code> con el archivo rechazado en vez de aceptado.',
    "fileUploadPage.testVanilla4":
      "El botón de quitar se queda oculto hasta que se acepta un archivo, y aparece cuando eso pasa.",
    "fileUploadPage.testVanilla5":
      "Hacer click en el botón de quitar vacía los archivos aceptados y se vuelve a ocultar.",
    "fileUploadPage.testVanilla6": "Sin dropzone/input/trigger escritos a mano no hace nada, ni tira un error.",
    "fileUploadPage.testVanilla7": "Destruir el mount detiene la máquina y deja de emitir eventos.",

    "fileUploadPage.testReact1": "Anuncia el motivo del rechazo de un archivo en vez de fallar en silencio.",
    "fileUploadPage.testReact2": "Limpia el mensaje de rechazo en cuanto sigue una selección válida.",
  },
  en: {

    "demo.fileUpload.label": "Attachments",
    "demo.fileUpload.dropzone": "Drag files here",
    "demo.fileUpload.trigger": "Choose files",
    "demo.fileUpload.anatomyHint": "PDF or image, up to 10 MB",
    "demo.fileUpload.anatomyItem": "final-consolidated-report-2026.pdf",
    "demo.fileUpload.anatomyRemove": "Remove final-consolidated-report-2026.pdf",

    "demo.fileUpload.overlay": "Drop the files to attach them",

    "fileUploadPage.description": "Selection and drag-and-drop with limits, rejection, and a file list.",
    "fileUploadPage.anatomyBody":
      "The dropzone (with its glyph, its instruction and its hint inside), the tally and the list of chosen files. Live, the box and the list coexist, but only once something has been picked, and a diagram cannot wait for that before it can point at a row: the specimen is frozen with both. <strong>Four parts are not here</strong>, and not by oversight: <code>__input</code> is hidden from sight by design (it is the real input, the keyboard's way in), <code>__overlay</code> and <code>__overlay-body</code> exist only while a file is dragged over the control, and <code>__rejection</code> only after something is refused. None of the last three can be drawn in a still.",
    "fileUploadPage.anatomyLabel": "FileUpload anatomy",
    "fileUploadPage.anatomyPreviewLabel": "FileUpload, part by part",
    "fileUploadPage.contractBody": "Vanilla emits sk:fileuploadchange and never invents a remote upload. React exposes accepted and rejected files.",
    "fileUploadPage.a11yBody": "The real input stays available to forms and assistive technology; the dropzone does not replace it.",
    "fileUploadPage.validationTitle": "What is accepted, and what is said when it is not",
    "fileUploadPage.validationBody":
      "Five limits, all optional: <code>accept</code> (types, in the attribute's own syntax), <code>maxFileSize</code> and <code>minFileSize</code> (per file), <code>maxTotalSize</code> (everything together) and <code>maxFiles</code> plus <code>multiple</code> (how many). The machine checks the first four; the total is not a rule it has, so it is added through its own <code>validate</code> hook, because a form with a 25 MB mailbox behind it takes ten 5 MB files and only fails at submit, where the person can no longer do anything. <strong>The line under the instruction is not hand-written</strong>: it is built from those same numbers, so it cannot promise something the validator will not honour. And when something is refused, the message carries the limit: \"pesa demasiado (máximo 5 MB)\" says what to do about it; \"pesa demasiado\" only says no.",
    "fileUploadPage.chosenTitle": "What you chose, before you send it",
    "fileUploadPage.chosenBody":
      "The dashed box is this control's <strong>empty state</strong>, and it stays: the file list goes <strong>under</strong> it, not in its place, so the second file is dropped where the first one was. It only leaves once no more files fit (<code>maxFiles</code> reached), and comes back when one is removed. Every accepted file is a row with what it is, what it is called, its kind, its size and its own button to take it out. An image shows itself: a list of names is a receipt, not a confirmation, and somebody who picked three photos out of ninety is checking they got those three. The list is announced with <code>aria-live=\"polite\"</code>, and removing a row moves focus to the next one instead of dropping it on the <code>body</code>.",
    "fileUploadPage.dropScopeTitle": "Where a drop counts",
    "fileUploadPage.dropScopeBody":
      "By default only the dashed box counts (<code>dropScope: \"zone\"</code>). <code>\"page\"</code> makes the whole document a target, which is what every mail client already does: drag the file over the window and it lands. It asks for <code>overlayLabel</code>, because a drop target nobody can see is a feature only its author knows about. The dashed box does not go away: this option <strong>adds</strong> a surface, it never replaces the one the keyboard and the file picker need. Here the target is the preview frame, which is a document of its own: drag a file over it.",
    "fileUploadPage.pageDropLabel": "Dropping anywhere in the document",
    "fileUploadPage.dropScopeA11yBody":
      "The drag sheet carries <code>aria-hidden</code>: it answers a pointer gesture a screen reader user is not performing, and the accessible path to the same files (the label, the real input, the button) is unchanged in all three scopes.",

    "fileUploadPage.testVanilla1":
      'The dropzone is a real, tabbable <code class="sk-code">role="button"</code>, not decoration; the trigger is a native button.',
    "fileUploadPage.testVanilla8":
      "Enter or Space on the dropzone opens the file picker, not just a pointer click.",
    "fileUploadPage.testVanilla2":
      'Choosing a valid file emits <code class="sk-code">sk:fileuploadchange</code> with it accepted.',
    "fileUploadPage.testVanilla3":
      'An oversized file emits <code class="sk-code">sk:fileuploadchange</code> with it rejected instead of accepted.',
    "fileUploadPage.testVanilla4":
      "The clear trigger stays hidden until a file is accepted, and shows once one is.",
    "fileUploadPage.testVanilla5":
      "Clicking the clear trigger empties the accepted files and re-hides itself.",
    "fileUploadPage.testVanilla6": "With no authored dropzone/input/trigger, it does nothing, without throwing.",
    "fileUploadPage.testVanilla7": "Destroying the mount stops the machine and it stops emitting events.",

    "fileUploadPage.testReact1": "Announces a rejected file's reason instead of failing silently.",
    "fileUploadPage.testReact2": "Clears the rejection message once a valid selection follows.",
  },
} as const;
