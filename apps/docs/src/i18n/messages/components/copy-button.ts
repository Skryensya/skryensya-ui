/*
 * NO CONSUMER. Nothing in `src/` reads these keys: the page they documented is gone and its
 * copy was left behind. Kept here rather than deleted in the move, so the deletion is its own
 * reviewable change instead of a silent loss inside a 9,800-line refactor.
 */
export const copyButtonMessages = {
  es: {
    "demo.copyButton.label": "Copiar código",
    "demo.copyButton.idle": "Copiar",

    "copyButton.description": "CopyButton: copia el texto de un elemento por id y confirma brevemente el resultado.",
    "copyButton.lede":
      'CopyButton copia el texto del elemento indicado y cambia brevemente de icono para confirmar el resultado. Es un Button ghost icon-only con anatomía propia: el enhancer solo enlaza el clipboard y el feedback; tú escribes el markup. El tamaño es el del Button: <strong>md</strong> (por defecto) o <code>data-size="sm"</code> (cara a 32px, hit a 44px vía <code>::after</code>).',
    "copyButton.previewNote": "md · sm",
    "copyButton.contractItem1": "<code>data-sk-copy-button-target</code> es el id del elemento cuyo texto se copia.",
    "copyButton.contractItem2": 'Usa Clipboard API y recurre a <code>execCommand("copy")</code> cuando hace falta.',
    "copyButton.contractItem3":
      "El estado <code>copied</code> dura brevemente y se anuncia como <strong>Copied</strong> (o el label que autorices en <code>data-sk-copy-button-success-label</code>).",
    "copyButton.contractItem4":
      "Ese mismo label aparece al lado del botón como una banderita con flecha, justo lo que dura el icono de check, en el tono de success (o de danger si falló). No es un tooltip: nunca se queda con el puntero, así que un segundo clic sigue llegando al botón.",
    "copyButton.contractItem5":
      'La banderita se coloca con el pattern <a href="/anchoring">Anclaje</a>: el root lleva además <code>sk-anchor</code> y ella <code>sk-anchored</code> con <code>data-sk-placement="inline-start"</code>. Sin anchor positioning en el navegador no se dibuja, porque acá no hay machine que la coloque; el icono y el live region siguen igual.',
    "copyButton.contractItem6": "Los iconos son placeholders <code>data-sk-icon</code>; el set lo enlaza <code>mountIcons</code> (ADR-19).",
    "copyButton.iconsComment":
      "Los iconos se autoran como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "copyButton.test1": "Copia su blanco escrito a mano, anuncia éxito y vuelve al estado inicial.",
    "copyButton.test2": "Nombra el ancla que ata un botón a su propia bandera de estado.",
    "copyButton.test3": "Reporta un blanco escrito a mano que no existe.",
  },
  en: {
    "demo.copyButton.label": "Copy code",
    "demo.copyButton.idle": "Copy",

    "copyButton.description": "CopyButton: copies an element's text by id and briefly confirms the result.",
    "copyButton.lede":
      'CopyButton copies the text of the element it names and briefly swaps its icon to confirm the result. It is a ghost, icon-only Button with its own anatomy: the enhancer only wires up the clipboard and the feedback; you write the markup. Its size is Button\'s own: <strong>md</strong> (the default) or <code>data-size="sm"</code> (a 32px face, a 44px hit via <code>::after</code>).',
    "copyButton.previewNote": "md · sm",
    "copyButton.contractItem1": "<code>data-sk-copy-button-target</code> is the id of the element whose text gets copied.",
    "copyButton.contractItem2": 'Uses the Clipboard API and falls back to <code>execCommand("copy")</code> when needed.',
    "copyButton.contractItem3":
      "The <code>copied</code> state lasts briefly and announces as <strong>Copied</strong> (or the label you authored in <code>data-sk-copy-button-success-label</code>).",
    "copyButton.contractItem4":
      "That same label appears beside the button as a small flag with an arrow, for exactly as long as the check icon shows, in the success tone (or danger if it failed). It is not a tooltip: it never traps the pointer, so a second click still reaches the button.",
    "copyButton.contractItem5":
      'The flag is placed with the <a href="/en/anchoring">Anchoring</a> pattern: the root also carries <code>sk-anchor</code>, and the flag carries <code>sk-anchored</code> with <code>data-sk-placement="inline-start"</code>. With no anchor positioning in the browser it does not draw, because there is no machine here to place it; the icon and the live region stay the same.',
    "copyButton.contractItem6": "The icons are <code>data-sk-icon</code> placeholders; <code>mountIcons</code> links the set (ADR-19).",
    "copyButton.iconsComment":
      "Icons are authored as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "copyButton.test1": "Copies its authored target, announces success and resets.",
    "copyButton.test2": "Names the anchor tying one button to its own status flag.",
    "copyButton.test3": "Reports an authored target that does not exist.",
  },
} as const;
