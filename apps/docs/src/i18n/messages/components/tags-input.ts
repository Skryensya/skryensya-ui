export const tagsInputMessages = {
  es: {
    "demo.tagsInput.label": "Temas",
    "demo.tagsInput.placeholder": "Agrega un tema",
    "demo.tagsInput.removeLabel": "Quitar",
    "demo.tagsInput.tag.react": "react",
    "demo.tagsInput.tag.svelte": "svelte",
    "demo.tagsInput.tag.css": "css",
    "demo.tagsInput.tag.a11y": "accesibilidad",
    "demo.tagsInput.emailsLabel": "Destinatarios",
    "demo.tagsInput.emailsPlaceholder": "nombre@ejemplo.cl",
    "demo.tagsInput.maxLabel": "Hasta tres habilidades",
    "demo.tagsInput.maxPlaceholder": "Agrega una habilidad",
    "demo.tagsInput.readOnlyLabel": "Temas asignados",
    "demo.tagsInput.fieldLabel": "Temas de interés",
    "demo.tagsInput.fieldHint": "Escribe uno y presiona Enter, o sepáralos con comas.",

    "tagsInputPage.description":
      "TagsInput: varios valores escritos en un mismo campo, con el chip de Tag y el vocabulario de quien escribe.",
    "tagsInputPage.lede":
      "Un campo que guarda <em>varios</em> valores. Acepta lo que se escriba, y ahí está toda la diferencia con <a href=\"/es/componentes/combobox\">Combobox</a>: ese resuelve lo tecleado contra sus propias opciones, este toma el vocabulario de la persona.",
    "tagsInputPage.anatomyBody":
      "El diagrama nombra el campo, la caja que lo dibuja, un chip y la entrada que comparte la fila con ellos.",
    "tagsInputPage.anatomyLabel": "Anatomía de TagsInput",
    "tagsInputPage.anatomyPreviewLabel": "TagsInput, parte por parte",
    "tagsInputPage.composesTitle": "El chip es un Tag, no un dibujo parecido",
    "tagsInputPage.composesBody":
      "Cada tag lleva las clases de <a href=\"/es/componentes/tag\">Tag</a> y su botón de quitar es el mismo <code>Button</code> que usa Tag: de ahí vienen la capa de estado, el anillo de foco y el área de toque de 44px. Un sistema donde el chip de un filtro y el chip de un campo son dos dibujos distintos tiene dos chips. Lo que esta familia aporta es el campo alrededor.",
    "tagsInputPage.markupTitle": "Los tags se escriben como markup",
    "tagsInputPage.markupBody":
      "Los tags iniciales van en el markup, un elemento cada uno, no en un atributo que alguien tenga que parsear: así el campo se lee antes de que llegue su JavaScript. El enhancer lee esa lista como semilla y la reemplaza de una vez por la viva, que es la excepción que este componente comparte con <a href=\"/es/componentes/file-upload\">FileUpload</a>: la lista no es estructura que alguien escribió, es el <em>valor</em>, y en cuanto alguien teclea un tag nuevo no hay elemento escrito que pueda serlo.",
    "tagsInputPage.emptyTitle": "Vacío",
    "tagsInputPage.emptyBody":
      "Como empieza un formulario: sólo el placeholder. Enter confirma un tag, y la coma también, que es lo que ya trae una lista pegada de una planilla.",
    "tagsInputPage.emptyPreviewLabel": "TagsInput vacío",
    "tagsInputPage.maxTitle": "Un máximo, y lo que pasa al llegar",
    "tagsInputPage.maxBody":
      "<code>max</code> corta la lista. Vale la pena saber cómo, porque es de la máquina y no una decisión de esta página: pasado el máximo el tag se rechaza <strong>en silencio</strong> y el texto se queda en la entrada en vez de volverse chip. Esa es toda la señal que hay. Una página que necesita <em>decir</em> por qué cuenta los tags en <code>valueChange</code> y escribe su propio mensaje.",
    "tagsInputPage.maxPreviewLabel": "TagsInput con tope de tres",
    "tagsInputPage.readOnlyTitle": "Sólo lectura",
    "tagsInputPage.readOnlyBody":
      "No es lo mismo que <code>disabled</code>: un campo de sólo lectura se sigue leyendo. Conserva su forma y pierde las afordancias, así que los botones de quitar se van con la interacción, no con la lectura.",
    "tagsInputPage.readOnlyPreviewLabel": "TagsInput de sólo lectura",
    "tagsInputPage.fieldTitle": "Dentro de un FormField",
    "tagsInputPage.fieldBody":
      "La etiqueta visible, la ayuda y el error son trabajo de <a href=\"/es/componentes/form-field\">FormField</a>. La opción <code>label</code> de acá es el nombre accesible de la entrada, que es el control donde alguien efectivamente aterriza; cuando hay FormField, repite su etiqueta.",
    "tagsInputPage.fieldPreviewLabel": "TagsInput dentro de un FormField",
    "tagsInputPage.whenTitle": "Cuándo usarlo",
    "tagsInputPage.whenItem1":
      "Varios valores escritos en un mismo campo: temas, destinatarios, etiquetas, habilidades.",
    "tagsInputPage.whenItem2":
      "Si los valores tienen que salir de una lista conocida, es un <a href=\"/es/componentes/combobox\">Combobox</a>: elegir esto en su lugar es aceptar las erratas como dato.",
    "tagsInputPage.whenItem3":
      "Si los chips no son un campo sino filtros aplicados o palabras clave para mostrar, es <a href=\"/es/componentes/tag\">Tag</a> a secas.",
    "tagsInputPage.whenItem4":
      "Si lo que se agrega viene de la plataforma y no del teclado, es <a href=\"/es/componentes/file-upload\">FileUpload</a>.",
    "tagsInputPage.contractItem1":
      "<code>label</code> es obligatorio y va en la <strong>entrada</strong>, no en la caja: la caja no es un control, así que un nombre escrito ahí no nombra nada donde un lector de pantalla aterrice.",
    "tagsInputPage.contractItem2":
      "<code>removeLabel</code> es un solo texto para todos los botones de quitar, y a propósito no es un patrón con <code>{value}</code> como el <code>itemLabel</code> de Rating: interpolar por tag es copia que el emisor no puede producir, así que el markup y React anunciarían nombres distintos para el mismo botón.",
    "tagsInputPage.contractItem3":
      "Con <code>allowDuplicates</code> apagado el repetido se descarta en silencio y la entrada se limpia igual; no hay rechazo que mostrar.",
    "tagsInputPage.contractItem4":
      "El input oculto lleva el valor completo, así que un <code>&lt;form&gt;</code> normal lo envía sin JavaScript de por medio.",
  },
  en: {
    "demo.tagsInput.label": "Topics",
    "demo.tagsInput.placeholder": "Add a topic",
    "demo.tagsInput.removeLabel": "Remove",
    "demo.tagsInput.tag.react": "react",
    "demo.tagsInput.tag.svelte": "svelte",
    "demo.tagsInput.tag.css": "css",
    "demo.tagsInput.tag.a11y": "accessibility",
    "demo.tagsInput.emailsLabel": "Recipients",
    "demo.tagsInput.emailsPlaceholder": "name@example.org",
    "demo.tagsInput.maxLabel": "Up to three skills",
    "demo.tagsInput.maxPlaceholder": "Add a skill",
    "demo.tagsInput.readOnlyLabel": "Assigned topics",
    "demo.tagsInput.fieldLabel": "Topics of interest",
    "demo.tagsInput.fieldHint": "Type one and press Enter, or separate them with commas.",

    "tagsInputPage.description":
      "TagsInput: several values typed into one field, with Tag's own chip and the writer's own vocabulary.",
    "tagsInputPage.lede":
      "A field that holds <em>several</em> values. It accepts whatever is typed, and that is the whole difference from <a href=\"/components/combobox\">Combobox</a>: that one resolves what is typed against its own options, this one takes the person's vocabulary.",
    "tagsInputPage.anatomyBody":
      "The diagram names the field, the box that draws it, one chip, and the entry that shares the row with them.",
    "tagsInputPage.anatomyLabel": "TagsInput anatomy",
    "tagsInputPage.anatomyPreviewLabel": "TagsInput, part by part",
    "tagsInputPage.composesTitle": "The chip is a Tag, not something that looks like one",
    "tagsInputPage.composesBody":
      "Every tag carries <a href=\"/components/tag\">Tag</a>'s classes, and its delete control is the same <code>Button</code> Tag uses: that is where the state layer, the focus ring and the 44px hit target come from. A system where the chip in a filter bar and the chip in a field are two different drawings has two chips. What this family adds is the field around them.",
    "tagsInputPage.markupTitle": "The tags are authored as markup",
    "tagsInputPage.markupBody":
      "The starting tags are in the markup, one element each, rather than in an attribute somebody has to parse: that is what makes the field readable before its JavaScript arrives. The enhancer reads that list as its seed and swaps the whole of it for the live one, which is the exception this component shares with <a href=\"/components/file-upload\">FileUpload</a>: the list is not structure a person wrote, it is the <em>value</em>, and the moment somebody types a new tag there is no authored element for it to be.",
    "tagsInputPage.emptyTitle": "Empty",
    "tagsInputPage.emptyBody":
      "How a form starts: nothing but the placeholder. Enter commits a tag, and so does the comma, which is what a list pasted from a spreadsheet already has between its values.",
    "tagsInputPage.emptyPreviewLabel": "An empty TagsInput",
    "tagsInputPage.maxTitle": "A maximum, and what happens at it",
    "tagsInputPage.maxBody":
      "<code>max</code> caps the list. It is worth knowing how, because this is the machine's behaviour and not a decision of this page: past the maximum a tag is refused <strong>in silence</strong>, and the text stays in the entry instead of turning into a chip. That is the whole signal. A page that needs to <em>say</em> why counts the tags on <code>valueChange</code> and writes its own message.",
    "tagsInputPage.maxPreviewLabel": "TagsInput capped at three",
    "tagsInputPage.readOnlyTitle": "Read-only",
    "tagsInputPage.readOnlyBody":
      "Not the same as <code>disabled</code>: a read-only field is still read. It keeps its shape and loses the affordances, so the delete controls go with the interaction rather than with the reading.",
    "tagsInputPage.readOnlyPreviewLabel": "A read-only TagsInput",
    "tagsInputPage.fieldTitle": "Inside a FormField",
    "tagsInputPage.fieldBody":
      "The visible label, the hint and the error are <a href=\"/components/form-field\">FormField</a>'s job. The <code>label</code> option here is the accessible name of the entry, which is the control somebody actually lands on; with a FormField around it, it repeats that field's label.",
    "tagsInputPage.fieldPreviewLabel": "TagsInput inside a FormField",
    "tagsInputPage.whenTitle": "When to use it",
    "tagsInputPage.whenItem1":
      "Several values typed into one field: topics, recipients, labels, skills.",
    "tagsInputPage.whenItem2":
      "When the values must come from a known list it is a <a href=\"/components/combobox\">Combobox</a>: choosing this instead means accepting typos as data.",
    "tagsInputPage.whenItem3":
      "When the chips are not a field but applied filters or keywords to display, that is a plain <a href=\"/components/tag\">Tag</a>.",
    "tagsInputPage.whenItem4":
      "When what is added comes from the platform rather than the keyboard, that is <a href=\"/components/file-upload\">FileUpload</a>.",
    "tagsInputPage.contractItem1":
      "<code>label</code> is required and lands on the <strong>entry</strong>, not on the box: the box is not a control, so a name written there would name nothing a screen reader ever reaches.",
    "tagsInputPage.contractItem2":
      "<code>removeLabel</code> is one string for every delete control, and deliberately not a <code>{value}</code> pattern like Rating's <code>itemLabel</code>: interpolating per tag is copy the emitter cannot produce, so the markup and React would announce two different names for the same button.",
    "tagsInputPage.contractItem3":
      "With <code>allowDuplicates</code> off, a repeat is dropped in silence and the entry clears anyway; there is no rejection to show.",
    "tagsInputPage.contractItem4":
      "The hidden input carries the whole value, so a plain <code>&lt;form&gt;</code> submits it with no JavaScript in between.",
  },
} as const;
