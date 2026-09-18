export const radioGroupMessages = {
  es: {
    "demo.matrix.easy": "Es fácil de usar",
    "demo.matrix.fast": "Responde rápido",
    "demo.matrix.recommend": "Lo recomendaría",
    "radioGroupPage.matrixTitle": "Componer: varias preguntas, una escala",
    "radioGroupPage.matrixTable": "Cada fila es una pregunta y cada columna un punto de la escala. La escala se nombra una sola vez, en la cabecera, en lugar de repetirse bajo cada fila. Cada celda lleva un <strong>radio suelto</strong> cuyo <code>name</code> es su fila: para el navegador, los radios que comparten nombre son un mismo grupo estén donde estén, y eso es lo que hace que una tabla de radios se comporte como una pregunta por fila. El radio de la celda no lleva etiqueta visible, porque ya la nombran el encabezado de su fila y el de su columna.",
    "radioGroupPage.matrixCaption": "Cuánto estás de acuerdo con cada afirmación",
    "radioGroupPage.matrixStatement": "Afirmación",
    "radioGroupPage.matrixLabel": "Likert de tabla",
    "radioGroupPage.likertTitle": "Componer: escala Likert",
    "radioGroupPage.likertBody":
      "Una escala Likert no es un componente: es <strong>este mismo grupo de radios</strong> en horizontal dentro de un <a href=\"/es/componentes/box\">Box</a>, con los extremos nombrados debajo. El navegador sigue manejando la selección y el teclado. Cuatro puntos a propósito: una escala par no tiene centro donde estacionarse, así que quien tiene una opinión se inclina. Tres, cinco o siete funcionan igual.",
    "radioGroupPage.likertLabel": "Escala Likert, compuesta",
    "demo.radioGroup.label": "Plan",
    "demo.radioGroup.starter.title": "Starter",
    "demo.radioGroup.starter.body": "Para proyectos personales.",
    "demo.radioGroup.pro.title": "Pro",
    "demo.radioGroup.pro.body": "Para equipos en crecimiento.",
    "demo.radioGroup.basic.title": "Basic",
    "demo.radioGroup.basic.body": "Funciones esenciales, sin costo.",

    "radioGroupPage.description": "RadioGroup: una opción exclusiva con inputs nativos y formulario real.",
    "radioGroupPage.lede": "Una elección exclusiva entre alternativas relacionadas. Cada opción es un radio nativo; el nombre compartido impone la exclusión.",
    "radioGroupPage.anatomyBody":
      "Este diagrama nombra el grupo, cada opción, el input, el control, el indicador y la etiqueta. El espécimen está congelado; los RadioGroup vivos empiezan abajo.",
    "radioGroupPage.anatomyLabel": "Anatomía de RadioGroup",
    "radioGroupPage.anatomyPreviewLabel": "RadioGroup, parte por parte",
    "radioGroupPage.tileTitle": "Opciones de superficie: TileRadioGroup",
    "radioGroupPage.tileBody1":
      "Cuando cada alternativa necesita título, descripción y una superficie completa, usa <code>TileRadioGroup</code>. Cada item conserva un radio nativo; el grupo no impone disposición.",
    "radioGroupPage.tileBody2":
      'En este preview las opciones van en fila con <a href="/es/componentes/inline"><code>sk-inline</code></a> y cada Tile toma <code>flex: 1</code>. En una columna, omite <code>sk-inline</code>.',
    "radioGroupPage.tileBody3":
      'El enhancer <code>tile-radio-group</code> (Svelte + <code>@zag-js/radio-group</code>, la misma máquina que React) hidrata la raíz <code>data-sk-tile-radio-group</code> con <code>initComponents()</code>: garantiza la exclusión mutua y sincroniza el estado de cada <code>[data-part="item"]</code> con su radio real.',
    "radioGroupPage.tileBody4": "Importa <code>@skryensya/core/components/radio-group.css</code> y llama <code>initComponents()</code> una vez.",
    "radioGroupPage.contractItem1": "<code>name</code> es obligatorio y lo comparten todas las opciones.",
    "radioGroupPage.contractItem2": "<code>defaultValue</code> conserva el estado nativo y respeta reset de formularios.",
    "radioGroupPage.contractItem3": "<code>value</code> controla la opción seleccionada; <code>onValueChange</code> reporta cambios.",
    "radioGroupPage.contractItem4":
      "El grupo necesita un nombre accesible: <code>aria-label</code>, <code>aria-labelledby</code> o un <code>fieldset</code> con <code>legend</code>.",
    "radioGroupPage.test1":
      "Es un radiogroup, respeta el valor por defecto, mantiene los valores mutuamente excluyentes y emite el evento.",
    "radioGroupPage.test2": "Marca el <code>data-state</code> del ítem seleccionado.",
  },
  en: {
    "demo.matrix.easy": "It is easy to use",
    "demo.matrix.fast": "It responds quickly",
    "demo.matrix.recommend": "I would recommend it",
    "radioGroupPage.matrixTitle": "Compose: several questions, one scale",
    "radioGroupPage.matrixTable": "Every row is a question and every column a point on the scale. The scale is named once, in the head, instead of repeating under every row. Each cell holds a <strong>single radio</strong> whose <code>name</code> is its row: to the browser, radios sharing a name are one group wherever they sit, and that is what makes a table of radios behave like one question per row. The cell's radio carries no visible label, because its row header and its column header already name it.",
    "radioGroupPage.matrixCaption": "How much you agree with each statement",
    "radioGroupPage.matrixStatement": "Statement",
    "radioGroupPage.matrixLabel": "Table Likert",
    "radioGroupPage.likertTitle": "Compose: a Likert scale",
    "radioGroupPage.likertBody":
      "A Likert scale is not a component: it is <strong>this same radio group</strong>, laid across a <a href=\"/components/box\">Box</a>, with its two ends named underneath. The browser still owns selection and the keyboard. Four points on purpose: an even scale has no middle to park on, so a reader with an opinion has to lean. Three, five or seven work the same way.",
    "radioGroupPage.likertLabel": "Likert scale, composed",
    "demo.radioGroup.label": "Plan",
    "demo.radioGroup.starter.title": "Starter",
    "demo.radioGroup.starter.body": "For personal projects.",
    "demo.radioGroup.pro.title": "Pro",
    "demo.radioGroup.pro.body": "For growing teams.",
    "demo.radioGroup.basic.title": "Basic",
    "demo.radioGroup.basic.body": "Core features, free forever.",

    "radioGroupPage.description": "RadioGroup: an exclusive choice with native inputs and a real form.",
    "radioGroupPage.lede": "An exclusive choice among related alternatives. Every option is a native radio; the shared name enforces the exclusion.",
    "radioGroupPage.anatomyBody":
      "This diagram names the group, each option, the input, the control, the indicator and the label. The specimen is frozen; the live RadioGroups begin below.",
    "radioGroupPage.anatomyLabel": "RadioGroup anatomy",
    "radioGroupPage.anatomyPreviewLabel": "RadioGroup, part by part",
    "radioGroupPage.tileTitle": "Surface options: TileRadioGroup",
    "radioGroupPage.tileBody1":
      "When each alternative needs a title, a description, and a whole surface, use <code>TileRadioGroup</code>. Every item keeps a native radio; the group imposes no layout.",
    "radioGroupPage.tileBody2":
      'In this preview the options run in a row with <a href="/components/inline"><code>sk-inline</code></a>, and each Tile takes <code>flex: 1</code>. In a column, skip <code>sk-inline</code>.',
    "radioGroupPage.tileBody3":
      'The <code>tile-radio-group</code> enhancer (Svelte + <code>@zag-js/radio-group</code>, the same machine React uses) hydrates the <code>data-sk-tile-radio-group</code> root with <code>initComponents()</code>: it guarantees mutual exclusion and syncs each <code>[data-part="item"]</code>\'s state with its real radio.',
    "radioGroupPage.tileBody4": "Import <code>@skryensya/core/components/radio-group.css</code> and call <code>initComponents()</code> once.",
    "radioGroupPage.contractItem1": "<code>name</code> is required and shared by every option.",
    "radioGroupPage.contractItem2": "<code>defaultValue</code> keeps the native state and respects form resets.",
    "radioGroupPage.contractItem3": "<code>value</code> controls the selected option; <code>onValueChange</code> reports changes.",
    "radioGroupPage.contractItem4":
      "The group needs an accessible name: <code>aria-label</code>, <code>aria-labelledby</code>, or a <code>fieldset</code> with a <code>legend</code>.",
    "radioGroupPage.test1":
      "Is a radiogroup, honours the default value, keeps values mutually exclusive, and emits the event.",
    "radioGroupPage.test2": "Marks the selected item's <code>data-state</code>.",
  },
} as const;
