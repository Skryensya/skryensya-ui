export const inputMessages = {
  es: {
    "demo.input.hint": "Te escribimos aquí si algo sale mal.",
    "demo.input.notesLabel": "Notas",
    "demo.input.notesHint": "Cuéntanos qué te pasó, con el detalle que puedas.",
    "demo.input.notesPlaceholder": "Escribe aquí",

    "inputPage.description": "Input: el control de texto nativo, con una clase para el input y el textarea.",
    "inputPage.title": "Input",
    "inputPage.lede":
      "El control de texto nativo se queda nativo: no hay máquina, y no hay un <code>div</code> con borde haciéndose pasar por input. La plataforma se queda con la validación, el autofill, el IME y la asociación al formulario.",
    "inputPage.densityBody": 'La densidad compacta el espacio alrededor del campo, no su área de interacción: Input conserva un mínimo de <code>44px</code> de alto, incluso con <code>data-size="sm"</code>.',
    "inputPage.oneClassTitle": "Una clase para todo control de texto",
    "inputPage.oneClassBody":
      "<code>sk-input</code> va en el <code>&lt;input&gt;</code> y en el <code>&lt;textarea&gt;</code>: es el mismo control visual, así que es un solo set de hooks. Una segunda clase sería un segundo set que mantener sincronizado con el primero.",
    "demo.input.anatomyEmail": "tu@ejemplo.com",
    "demo.input.anatomyEmailLabel": "Email",
    "demo.input.anatomyNotes": "Escribe aquí",
    "inputPage.anatomyBody":
      "El dibujo tiene una sola etiqueta porque el contrato publica una sola clase; lo que vale la pena ver es <strong>cuántos elementos</strong> la llevan. Un anillo por cada uno, saliendo de la misma burbuja: el <code>&lt;input type=\"email\"&gt;</code>, el <code>&lt;textarea&gt;</code> y un <code>&lt;input type=\"time\"&gt;</code> nativo de verdad. Y no hay nada más nombrado: el rótulo, la pista y el error son del FormField, y están dibujados en su propia anatomía.",
    "inputPage.anatomyLabel": "Anatomía de Input",
    "inputPage.anatomyPreviewLabel": "Una clase, tres elementos",
    "inputPage.formFieldTitle": "El rótulo no es del Input",
    "inputPage.formFieldBody":
      'Los dos demos de arriba están envueltos en un <a href="/es/componentes/form-field">FormField</a>, y no por costumbre: el rótulo, la ayuda, el mensaje de error y los seis ids que los atan viven ahí. Por eso este contrato no tiene <code>invalid</code> ni <code>id</code> propios: un control que trajera su propio <code>aria-invalid</code> podría contradecir al mensaje que tiene al lado. Un <code>Input</code> fuera de un <code>FormField</code> igual es un control válido, siempre que lleve su <code>aria-label</code>.',
    "demo.input.rutHint": "Con puntos o sin ellos, da lo mismo.",
    "demo.input.phoneLabel": "Celular",
    "demo.input.siteLabel": "Sitio web",

    "inputPage.formatTitle": "format: la validación que el navegador no trae",
    "inputPage.formatBody":
      'La plataforma sabe comprobar un email y una URL, y no sabe nada de un RUT. <code>format</code> agrega esa capa para los valores que tienen una validez real: <code>"rut"</code>, <code>"url"</code> y <code>"email"</code> los trae el propio core, sin dependencias. No es un <code>pattern</code> con otro nombre: un dígito verificador es aritmética, y ninguna expresión regular expresa eso.',
    "inputPage.formatPreviewLabel": "Tres campos que se validan solos",
    "inputPage.formatCheckBody":
      'Escribe <code>12.345.678-4</code> y sal del campo: el RUT tiene la forma correcta y el dígito verificador no corresponde, que es justo lo que un chequeo de formato deja pasar. Lo mismo con <code>44 123 4567</code>, que tiene nueve dígitos y ningún código de área chileno empieza así, o con <code>foo:bar</code>, que es una URL válida a un esquema que ningún navegador puede abrir.',
    "inputPage.formatMessageBody":
      'El mensaje lo escribe el control en el slot <code>error</code> del <a href="/es/componentes/form-field">FormField</a>, no quien compone el árbol: si un RUT es real no es algo que el árbol pueda saber. Aparece recién cuando sales del campo, y desde ahí sigue al valor en vivo. Un <code>error</code> escrito a mano le gana siempre, porque quien arma el formulario sabe cosas que el dígito verificador no ("ese RUT ya está registrado"). Y la validez va también a <code>setCustomValidity</code>, así que el <code>&lt;form&gt;</code> nativo se niega a enviarse sin que este contrato tenga que reimplementar el submit.',
    "inputPage.formatPhoneTitle": "phone: los planes de numeración son un paquete aparte",
    "inputPage.formatPhoneBody":
      'Un teléfono solo se puede comprobar contra el plan de numeración de su país, y los planes son datos: unos 155 kB de metadata que nadie que valide un RUT debería descargar. Por eso <code>@skryensya/core</code> declara el formato <code>"phone"</code> y no trae validador; lo aporta <code>@skryensya/phone</code>, que envuelve libphonenumber-js. Es el mismo trato que ya tiene <code>@skryensya/editor</code> como peer opcional.',
    "inputPage.formatPhoneUsage":
      'Se instala y se registra una sola vez al arranque. Una llamada explícita y no un import con efecto secundario: un módulo que solo existe por su efecto es lo primero que un bundler agresivo borra, y la falla sería un campo que dejó de validar en silencio.',
    "inputPage.formatPhoneMissing":
      'Si nadie lo registra, el campo <strong>no valida y deja pasar el valor</strong>, con un aviso en consola nombrando el paquete que falta. Un paquete opcional ausente es problema de quien programa, nunca de quien está llenando el formulario: ponerle en rojo un teléfono correcto sería un error que no puede arreglar escribiendo nada.',
    "inputPage.formatPhoneEvidence":
      'Vale la pena saber qué compra esa metadata. Antes de esto el kit traía un plan chileno escrito a mano, y medido contra los datos reales estaba mal en las dos direcciones: aceptaba <code>+56 9 1234 5678</code> (el rango móvil <code>91x</code> no está asignado) y rechazaba <code>+56 44 234 5678</code> (44 sí es código de área). Se borró en vez de dejarlo al lado: dos validadores que contestan distinto sobre el mismo número son peores que uno que hay que instalar.',
    "inputPage.nativeTitle": "NativeInput: el control sin la apariencia",
    "inputPage.nativeBody":
      'La tercera signature del contrato es <code>NativeInput</code>: el mismo elemento sin <code>sk-input</code>, para cuando lo que quieres enseñar es el comportamiento que trae el navegador y no la apariencia del sistema. Es lo que usa el demo del <code>&lt;input type="time"&gt;</code> plano en TimeField.',
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
    "demo.input.anatomyEmail": "you@example.com",
    "demo.input.anatomyEmailLabel": "Email",
    "demo.input.anatomyNotes": "Write here",
    "inputPage.anatomyBody":
      "The drawing carries one label because the contract publishes one class; what is worth seeing is <strong>how many elements</strong> wear it. One ring each, from a single bubble: the <code>&lt;input type=\"email\"&gt;</code>, the <code>&lt;textarea&gt;</code>, and a real native <code>&lt;input type=\"time\"&gt;</code>. Nothing else is named: the label, the hint and the error are FormField's, and they are drawn on FormField's own anatomy.",
    "inputPage.anatomyLabel": "Input anatomy",
    "inputPage.anatomyPreviewLabel": "One class, three elements",
    "inputPage.formFieldTitle": "The label is not the Input's",
    "inputPage.formFieldBody":
      'Both demos above are wrapped in a <a href="/components/form-field">FormField</a>, and not out of habit: the label, the hint, the error message and the six ids that tie them together all live there. That is why this contract has no <code>invalid</code> and no <code>id</code> of its own: a control carrying its own <code>aria-invalid</code> could contradict the message sitting next to it. An <code>Input</code> outside a <code>FormField</code> is still a valid control, as long as it carries its own <code>aria-label</code>.',
    "demo.input.rutHint": "With dots or without them, it makes no difference.",
    "demo.input.phoneLabel": "Mobile",
    "demo.input.siteLabel": "Website",

    "inputPage.formatTitle": "format: the validation the browser does not have",
    "inputPage.formatBody":
      'The platform knows how to check an email and a URL, and knows nothing about a RUT. <code>format</code> adds that layer for values that have a real validity: <code>"rut"</code>, <code>"url"</code> and <code>"email"</code> ship in core itself, with no dependencies. It is not a <code>pattern</code> under another name: a check digit is arithmetic, and no regular expression expresses that.',
    "inputPage.formatPreviewLabel": "Three fields that validate themselves",
    "inputPage.formatCheckBody":
      'Type <code>12.345.678-4</code> and leave the field: the RUT has the right shape and the check digit does not match, which is exactly what a format check lets through. Same with <code>44 123 4567</code>, nine digits that no Chilean area code begins with, or with <code>foo:bar</code>, a valid URL to a scheme no browser can open.',
    "inputPage.formatMessageBody":
      'The control writes the message into <a href="/components/form-field">FormField</a>\'s <code>error</code> slot, not whoever composed the tree: whether a RUT is real is not something a tree can know. It appears once you leave the field, and tracks the value live from then on. A hand-written <code>error</code> always wins, because whoever builds the form knows things the check digit does not ("that RUT is already registered"). Validity also goes to <code>setCustomValidity</code>, so a native <code>&lt;form&gt;</code> refuses to submit without this contract reimplementing submission.',
    "inputPage.formatPhoneTitle": "phone: numbering plans are a separate package",
    "inputPage.formatPhoneBody":
      'A phone number can only be checked against its country\'s numbering plan, and the plans are data: some 155 kB of metadata that nobody validating a RUT should download. So <code>@skryensya/core</code> declares the <code>"phone"</code> format and ships no validator for it; <code>@skryensya/phone</code> provides one, wrapping libphonenumber-js. The same deal <code>@skryensya/editor</code> already has as an optional peer.',
    "inputPage.formatPhoneUsage":
      'Install it and register it once at startup. An explicit call rather than an import with a side effect: a module that exists only for its side effect is the first thing an aggressive bundler drops, and the failure would be a field that silently stopped validating.',
    "inputPage.formatPhoneMissing":
      'With nothing registered, the field <strong>does not validate and lets the value through</strong>, with one console warning naming the missing package. An absent optional package is the developer\'s problem, never the problem of the person filling in the form: painting their correct phone number red would be an error nothing they can type will clear.',
    "inputPage.formatPhoneEvidence":
      'It is worth knowing what that metadata buys. The kit shipped a hand-written Chilean plan before this, and measured against the real data it was wrong in both directions: it accepted <code>+56 9 1234 5678</code> (the <code>91x</code> mobile range is unassigned) and rejected <code>+56 44 234 5678</code> (44 is a real area code). It was deleted rather than kept alongside: two validators that disagree about the same number are worse than one that has to be installed.',
    "inputPage.nativeTitle": "NativeInput: the control without the appearance",
    "inputPage.nativeBody":
      'The contract\'s third signature is <code>NativeInput</code>: the same element without <code>sk-input</code>, for when what you are teaching is the behaviour the browser ships rather than the system\'s appearance. It is what the plain <code>&lt;input type="time"&gt;</code> demo on TimeField uses.',
    "inputPage.test1": "Stays a valid control outside a FormField.",
    "inputPage.test2": "Gives a textarea the same appearance contract as an input.",
    "inputPage.test3": "Writes the height to data-size and leaves the native size attribute alone.",
  },
} as const;
