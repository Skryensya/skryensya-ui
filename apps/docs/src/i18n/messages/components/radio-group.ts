export const radioGroupMessages = {
  es: {
    "demo.radioGroup.label": "Plan",
    "demo.radioGroup.starter.title": "Starter",
    "demo.radioGroup.starter.body": "Para proyectos personales.",
    "demo.radioGroup.pro.title": "Pro",
    "demo.radioGroup.pro.body": "Para equipos en crecimiento.",
    "demo.radioGroup.basic.title": "Basic",
    "demo.radioGroup.basic.body": "Funciones esenciales, sin costo.",

    "radioGroupPage.description": "RadioGroup: una opción exclusiva con inputs nativos y formulario real.",
    "radioGroupPage.lede": "Una elección exclusiva entre alternativas relacionadas. Cada opción es un radio nativo; el nombre compartido impone la exclusión.",
    "radioGroupPage.tileTitle": "Opciones de superficie: TileRadioGroup",
    "radioGroupPage.tileBody1":
      "Cuando cada alternativa necesita título, descripción y una superficie completa, usa <code>TileRadioGroup</code>. Cada item conserva un radio nativo; el grupo no impone disposición.",
    "radioGroupPage.tileBody2":
      'En este preview las opciones van en fila con <a href="/components/inline"><code>sk-inline</code></a> y cada Tile toma <code>flex: 1</code>. En una columna, omite <code>sk-inline</code>.',
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
    "demo.radioGroup.label": "Plan",
    "demo.radioGroup.starter.title": "Starter",
    "demo.radioGroup.starter.body": "For personal projects.",
    "demo.radioGroup.pro.title": "Pro",
    "demo.radioGroup.pro.body": "For growing teams.",
    "demo.radioGroup.basic.title": "Basic",
    "demo.radioGroup.basic.body": "Core features, free forever.",

    "radioGroupPage.description": "RadioGroup: an exclusive choice with native inputs and a real form.",
    "radioGroupPage.lede": "An exclusive choice among related alternatives. Every option is a native radio; the shared name enforces the exclusion.",
    "radioGroupPage.tileTitle": "Surface options: TileRadioGroup",
    "radioGroupPage.tileBody1":
      "When each alternative needs a title, a description, and a whole surface, use <code>TileRadioGroup</code>. Every item keeps a native radio; the group imposes no layout.",
    "radioGroupPage.tileBody2":
      'In this preview the options run in a row with <a href="/en/components/inline"><code>sk-inline</code></a>, and each Tile takes <code>flex: 1</code>. In a column, skip <code>sk-inline</code>.',
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
