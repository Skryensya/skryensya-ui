export const inputMessages = {
  es: {
    "demo.input.hint": "Te escribimos acá si algo sale mal.",
    "demo.input.notesLabel": "Notas",
    "demo.input.notesHint": "Contanos qué te pasó, con el detalle que puedas.",
    "demo.input.notesPlaceholder": "Escribí acá",

    "inputPage.description": "Input: el control de texto nativo, con una clase para el input y el textarea.",
    "inputPage.title": "Input",
    "inputPage.lede":
      "El control de texto nativo se queda nativo: no hay máquina, y no hay un <code>div</code> con borde haciéndose pasar por input. La plataforma se queda con la validación, el autofill, el IME y la asociación al formulario.",
    "inputPage.densityBody": 'La densidad compacta el espacio alrededor del campo, no su área de interacción: Input conserva un mínimo de <code>44px</code> de alto, incluso con <code>data-size="sm"</code>.',
    "inputPage.oneClassTitle": "Una clase para todo control de texto",
    "inputPage.oneClassBody":
      "<code>sk-input</code> va en el <code>&lt;input&gt;</code> y en el <code>&lt;textarea&gt;</code>: es el mismo control visual, así que es un solo set de hooks. Una segunda clase sería un segundo set que mantener sincronizado con el primero.",
    "inputPage.formFieldTitle": "El rótulo no es del Input",
    "inputPage.formFieldBody":
      'Los dos demos de arriba están envueltos en un <a href="/components/form-field">FormField</a>, y no por costumbre: el rótulo, la ayuda, el mensaje de error y los seis ids que los atan viven ahí. Por eso este contrato no tiene <code>invalid</code> ni <code>id</code> propios: un control que trajera su propio <code>aria-invalid</code> podría contradecir al mensaje que tiene al lado. Un <code>Input</code> fuera de un <code>FormField</code> igual es un control válido, siempre que lleve su <code>aria-label</code>.',
    "inputPage.nativeTitle": "NativeInput: el control sin la apariencia",
    "inputPage.nativeBody":
      'La tercera signature del contrato es <code>NativeInput</code>: el mismo elemento sin <code>sk-input</code>, para cuando lo que querés enseñar es el comportamiento que trae el navegador y no la apariencia del sistema. Es lo que usa el demo del <code>&lt;input type="time"&gt;</code> plano en TimeField.',
    "inputPage.test1": "Sigue siendo un control válido fuera de un FormField.",
    "inputPage.test2": "Le da al textarea el mismo contrato de apariencia que al input.",
    "inputPage.test3": "Escribe el alto en data-size y deja en paz al atributo size nativo.",
  },
  en: {
    "demo.input.hint": "We write here if something goes wrong.",
    "demo.input.notesLabel": "Notes",
    "demo.input.notesHint": "Tell us what happened, in as much detail as you can.",
    "demo.input.notesPlaceholder": "Write here",

    "inputPage.description": "Input: the native text control, with one class for the input and the textarea.",
    "inputPage.title": "Input",
    "inputPage.lede":
      "The native text control stays native: there is no machine, and no bordered <code>div</code> pretending to be an input. The platform keeps validation, autofill, IME, and form association.",
    "inputPage.densityBody": 'Density compacts the space around the field, not its interaction area: Input keeps a minimum height of <code>44px</code>, even with <code>data-size="sm"</code>.',
    "inputPage.oneClassTitle": "One class for every text control",
    "inputPage.oneClassBody":
      "<code>sk-input</code> goes on both the <code>&lt;input&gt;</code> and the <code>&lt;textarea&gt;</code>: it is the same visual control, so it is one set of hooks. A second class would be a second set to keep in sync with the first.",
    "inputPage.formFieldTitle": "The label is not the Input's",
    "inputPage.formFieldBody":
      'Both demos above are wrapped in a <a href="/en/components/form-field">FormField</a>, and not out of habit: the label, the hint, the error message and the six ids that tie them together all live there. That is why this contract has no <code>invalid</code> and no <code>id</code> of its own: a control carrying its own <code>aria-invalid</code> could contradict the message sitting next to it. An <code>Input</code> outside a <code>FormField</code> is still a valid control, as long as it carries its own <code>aria-label</code>.',
    "inputPage.nativeTitle": "NativeInput: the control without the appearance",
    "inputPage.nativeBody":
      'The contract\'s third signature is <code>NativeInput</code>: the same element without <code>sk-input</code>, for when what you are teaching is the behaviour the browser ships rather than the system\'s appearance. It is what the plain <code>&lt;input type="time"&gt;</code> demo on TimeField uses.',
    "inputPage.test1": "Stays a valid control outside a FormField.",
    "inputPage.test2": "Gives a textarea the same appearance contract as an input.",
    "inputPage.test3": "Writes the height to data-size and leaves the native size attribute alone.",
  },
} as const;
