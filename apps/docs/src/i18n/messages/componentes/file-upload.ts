export const fileUploadMessages = {
  es: {

    "demo.fileUpload.label": "Adjuntos",
    "demo.fileUpload.dropzone": "Arrastra archivos aquí",
    "demo.fileUpload.trigger": "Elegir archivos",

    "fileUploadPage.description": "Selección y drag-and-drop con límites, rechazo y lista de archivos.",
    "fileUploadPage.contractBody": "Vanilla emite sk-file-change y nunca inventa una carga remota. React expone archivos aceptados y rechazados.",
    "fileUploadPage.a11yBody": "El input real permanece disponible para formularios y tecnología asistiva; la dropzone no lo sustituye.",

    "fileUploadPage.testVanilla1":
      'La dropzone es un <code class="sk-code">role="button"</code> real y tabulable, no decoración; el trigger es un botón nativo.',
    "fileUploadPage.testVanilla8":
      "Enter o Espacio sobre la dropzone abren el selector de archivos, no solo un click de mouse.",
    "fileUploadPage.testVanilla2":
      'Elegir un archivo válido emite <code class="sk-code">sk-file-change</code> con el archivo aceptado.',
    "fileUploadPage.testVanilla3":
      'Un archivo que excede el tamaño emite <code class="sk-code">sk-file-change</code> con el archivo rechazado en vez de aceptado.',
    "fileUploadPage.testVanilla4":
      "El botón de quitar se queda oculto hasta que se acepta un archivo, y aparece cuando eso pasa.",
    "fileUploadPage.testVanilla5":
      "Hacer click en el botón de quitar vacía los archivos aceptados y se vuelve a ocultar.",
    "fileUploadPage.testVanilla6": "Sin dropzone/input/trigger autorados no hace nada, ni tira un error.",
    "fileUploadPage.testVanilla7": "Destruir el mount detiene la máquina y deja de emitir eventos.",

    "fileUploadPage.testReact1": "Anuncia el motivo del rechazo de un archivo en vez de fallar en silencio.",
    "fileUploadPage.testReact2": "Limpia el mensaje de rechazo en cuanto sigue una selección válida.",
  },
  en: {

    "demo.fileUpload.label": "Attachments",
    "demo.fileUpload.dropzone": "Drag files here",
    "demo.fileUpload.trigger": "Choose files",

    "fileUploadPage.description": "Selection and drag-and-drop with limits, rejection, and a file list.",
    "fileUploadPage.contractBody": "Vanilla emits sk-file-change and never invents a remote upload. React exposes accepted and rejected files.",
    "fileUploadPage.a11yBody": "The real input stays available to forms and assistive technology; the dropzone does not replace it.",

    "fileUploadPage.testVanilla1":
      'The dropzone is a real, tabbable <code class="sk-code">role="button"</code>, not decoration; the trigger is a native button.',
    "fileUploadPage.testVanilla8":
      "Enter or Space on the dropzone opens the file picker, not just a pointer click.",
    "fileUploadPage.testVanilla2":
      'Choosing a valid file emits <code class="sk-code">sk-file-change</code> with it accepted.',
    "fileUploadPage.testVanilla3":
      'An oversized file emits <code class="sk-code">sk-file-change</code> with it rejected instead of accepted.',
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
