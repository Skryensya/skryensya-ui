export const formFieldMessages = {
  es: {
    "demo.formField.hint": "Sólo la usamos para las boletas.",
    "demo.formField.error": "Ingresa una dirección laboral.",
    "demo.formField.planHint": "Lo vas a poder cambiar después.",

    "formFieldPage.description":
      "FormField: el cromo alrededor de cualquier control. Rótulo, ayuda, error, y los seis ids que los atan.",
    "formFieldPage.title": "FormField",
    "formFieldPage.lede":
      "Un campo es cromo más un control, y lo que los une son seis ids. Escritos a mano, cada uno es una oportunidad de estar mal en silencio: un <code>aria-describedby</code> con un typo no se ve en pantalla y rompe a todos los lectores de pantalla que leen el formulario.",
    "formFieldPage.wiringTitle": "Seis ids a partir de un nombre",
    "formFieldPage.wiringBody":
      "El rótulo apunta al control, el control apunta de vuelta a la ayuda y al error, y cada uno de esos carga el id al que lo apuntan. El contrato los deriva todos del id del campo: ningún binding se inventa uno propio, y por eso los ids de React (<code>useId</code>) y los del emisor (un slug) pueden ser distintos sin que la relación cambie.",
    "formFieldPage.independentTitle": "Independiente de Input, a propósito",
    "formFieldPage.independentBody":
      "<code>sk-form-field</code> es el cromo alrededor de <em>cualquier</em> control: envuelve un select o un textarea igual de bien, como acá abajo. Nombrarlo por el control que más veces sostiene lo volvería mentira la primera vez que sostenga otro: y por eso su slot <code>children</code> acepta cualquier signature y el cableado apunta a <code>\"control\"</code> en vez de a un input.",
    "formFieldPage.errorTitle": "El error es texto, no un color",
    "formFieldPage.errorBody":
      "La <em>presencia</em> del mensaje es lo que invalida el campo: no hay una opción <code>invalid</code> aparte que pueda quedar desfasada de él. <code>--sk-form-field-error-fg</code> tiñe un mensaje que igual tiene que existir, y <code>aria-invalid</code>, que ya escribís para los lectores de pantalla, es lo que sigue el hook <code>--sk-input-border-color</code>. El color nunca es la única señal de error (WCAG 1.4.1).",
    "formFieldPage.avoidTitle": "Cuándo no usarlo",
    "formFieldPage.avoidBody":
      "Cuando el control no lleva rótulo visible: ahí el control mismo lleva su <code>aria-label</code> y no hay campo. Y cuando el control ya trae su propio rótulo cableado por su máquina: NumberField, TimeField, Combobox: envolverlo agregaría un segundo <code>for</code> compitiendo con el primero.",
    "formFieldPage.reactBody":
      "En React, <code>FormField</code> hace el cableado que en markup escribís a mano: genera el <code>id</code>, arma el <code>aria-describedby</code> de la ayuda y del error, y pasa <code>required</code> y <code>disabled</code> al control nativo. Se importa desde <code>@skryensya/react/form-field</code>, su propio módulo, y cualquier control puede leer ese contexto: que es la alternativa a que cada uno se haga su copia del cableado.",
    "formFieldPage.a11yBody":
      "El asterisco de <code>required</code> es decorativo (<code>aria-hidden</code>): lo que de verdad lo dice es el atributo <code>required</code> del control, porque «requerido» tiene que sobrevivir a ser leído en voz alta. La ayuda y el error se anuncian por <code>aria-describedby</code> en ese orden, y sólo se apunta a lo que existe: sin error escrito no hay <code>aria-invalid</code>, porque un atributo que apunta a un mensaje que nadie escribió describe algo que no está.",
    "formFieldPage.test1": "Cablea label, hint y error al control que envuelve.",
    "formFieldPage.test2": "El mensaje de error es lo que vuelve inválido al campo.",
    "formFieldPage.test3": "Pasa required y disabled al control nativo.",
    "formFieldPage.test4": "Cablea un textarea igual que un input.",
    "formFieldPage.test5": "Pasa axe con ayuda y error a la vez.",
  },
  en: {
    "demo.formField.hint": "We only use it for receipts.",
    "demo.formField.error": "Enter a work address.",
    "demo.formField.planHint": "You can change it later.",

    "formFieldPage.description":
      "FormField: the chrome around any control. Label, hint, error, and the six ids that tie them together.",
    "formFieldPage.title": "FormField",
    "formFieldPage.lede":
      "A field is chrome plus a control, and what binds them is six ids. Written by hand, every one of them is a chance to be silently wrong: a mistyped <code>aria-describedby</code> shows nothing on screen and breaks every screen reader that reads the form.",
    "formFieldPage.wiringTitle": "Six ids from one name",
    "formFieldPage.wiringBody":
      "The label points at the control, the control points back at the hint and the error, and each of those carries the id being pointed at. The contract derives all of them from the field's own id: neither binding invents one, which is why React's ids (<code>useId</code>) and the emitter's (a slug) can differ without the relationship changing.",
    "formFieldPage.independentTitle": "Independent of Input, on purpose",
    "formFieldPage.independentBody":
      "<code>sk-form-field</code> is the chrome around <em>any</em> control: it wraps a select or a textarea just as well, as below. Naming it after whichever control it most often holds would turn into a lie the first time it holds another: which is why its <code>children</code> slot accepts any signature and the wiring points at <code>\"control\"</code> rather than at an input.",
    "formFieldPage.errorTitle": "The error is text, not a color",
    "formFieldPage.errorBody":
      "The <em>presence</em> of the message is what makes the field invalid: there is no separate <code>invalid</code> option that could fall out of step with it. <code>--sk-form-field-error-fg</code> tints a message that has to exist anyway, and <code>aria-invalid</code>, which you already write for screen readers, is what the <code>--sk-input-border-color</code> hook follows. Color is never the only error signal (WCAG 1.4.1).",
    "formFieldPage.avoidTitle": "When not to use it",
    "formFieldPage.avoidBody":
      "When the control carries no visible label: there the control itself carries its <code>aria-label</code> and there is no field. And when the control already brings its own label wired by its machine: NumberField, TimeField, Combobox: wrapping it would add a second <code>for</code> competing with the first.",
    "formFieldPage.reactBody":
      "In React, <code>FormField</code> does the wiring you write by hand in markup: it generates the <code>id</code>, assembles the <code>aria-describedby</code> for the hint and the error, and passes <code>required</code> and <code>disabled</code> to the native control. It is imported from <code>@skryensya/react/form-field</code>, its own module, and any control can read that context: which is the alternative to each of them growing its own copy of the wiring.",
    "formFieldPage.a11yBody":
      "The <code>required</code> asterisk is decorative (<code>aria-hidden</code>): what actually says it is the control's <code>required</code> attribute, because \"required\" has to survive being read aloud. The hint and the error are announced through <code>aria-describedby</code> in that order, and only what exists is pointed at: with no error written there is no <code>aria-invalid</code>, because an attribute pointing at a message nobody wrote describes something that is not there.",
    "formFieldPage.test1": "Wires the label, hint and error to the control it wraps.",
    "formFieldPage.test2": "The error message is what makes the field invalid.",
    "formFieldPage.test3": "Passes required and disabled to the native control.",
    "formFieldPage.test4": "Wires a textarea exactly as it wires an input.",
    "formFieldPage.test5": "Passes axe with a hint and an error at once.",
  },
} as const;
