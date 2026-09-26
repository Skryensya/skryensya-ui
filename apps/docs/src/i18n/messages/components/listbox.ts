export const listboxMessages = {
  es: {
    "listbox.description": "Una lista siempre abierta para elegir una o varias opciones en el lugar.",
    "listbox.betaBadge": "Beta",
    "listbox.lede":
      "Listbox es la lista de opciones de un Select sin el desplegable: siempre abierta, ocupa lo que ocupan sus opciones y se elige ahí mismo. Corre sobre <code>@zag-js/listbox</code>, la misma máquina en las dos capas.",

    "listbox.anatomyBody":
      "Una etiqueta que nombra la lista y la lista con sus opciones. Cada opción tiene su texto y un check que sólo se ve cuando está elegida; el check es decorativo, lo que se anuncia es <code>aria-selected</code>.",
    "listbox.anatomyLabel": "Anatomía de Listbox",
    "listbox.anatomyPreviewLabel": "Un Listbox, parte por parte",

    "listbox.whenTitle": "Cuándo usarlo",
    "listbox.whenItem1":
      "Quien elige tiene que ver todas las opciones mientras lo hace: una vista, unos pocos filtros, los elementos sobre los que va a actuar.",
    "listbox.whenItem2":
      "Se puede elegir más de una, y marcar y desmarcar sin abrir nada es más rápido que un desplegable.",
    "listbox.whenItem3":
      "<strong>No</strong> para un campo de formulario que se envía: Listbox no tiene <code>input</code> ni <code>name</code>. Eso es Select, RadioGroup o un grupo de Checkbox, que el navegador ya envía.",

    "listbox.singleTitle": "Una opción",
    "listbox.singleBody":
      "<code>selectionMode=\"single\"</code>, el valor por defecto: elegir una reemplaza la anterior. La opción que empieza elegida se marca con <code>defaultSelected</code> en la opción misma.",
    "listbox.singleLabel": "Listbox de una opción",

    "listbox.multipleTitle": "Varias opciones",
    "listbox.multipleBody":
      "<code>selectionMode=\"multiple\"</code>: cada clic, o <kbd>Espacio</kbd>, marca o desmarca esa opción sin tocar las demás, y la lista se anuncia con <code>aria-multiselectable</code>. Una opción <code>disabled</code> no se puede elegir ni resaltar: el teclado la salta. <code>extended</code> es el modelo de una lista de archivos de escritorio: un clic reemplaza, y <kbd>Ctrl</kbd>/<kbd>⌘</kbd> o <kbd>Shift</kbd> agregan.",
    "listbox.multipleLabel": "Listbox de varias opciones",

    "listbox.horizontalTitle": "En horizontal",
    "listbox.horizontalBody":
      "<code>orientation=\"horizontal\"</code> pone las opciones en fila y cambia las teclas: las flechas izquierda y derecha recorren la lista. Si no caben, la fila se desplaza en vez de partirse.",
    "listbox.horizontalLabel": "Listbox horizontal",

    "listbox.keyboardTitle": "Teclado",
    "listbox.keyboardItem1":
      "El foco queda en la lista, no en cada opción: <kbd>Tab</kbd> entra y sale de una vez, y <code>aria-activedescendant</code> dice cuál está resaltada.",
    "listbox.keyboardItem2":
      "Las flechas mueven el resaltado, <kbd>Inicio</kbd> y <kbd>Fin</kbd> van a la primera y la última opción habilitada, y <kbd>Espacio</kbd> o <kbd>Enter</kbd> eligen.",
    "listbox.keyboardItem3": "Escribir una letra salta a la primera opción que empieza con ella.",

    "listbox.eventsTitle": "Escuchar el cambio",
    "listbox.eventsBody":
      "Cada cambio dispara <code>sk:listboxvaluechange</code> en la raíz con <code>{ value }</code>, todos los valores elegidos después del cambio. En React es <code>onValueChange</code>, y <code>value</code> la controla.",

    "listbox.demoViewLabel": "Vista",
    "listbox.demoViewList": "Lista",
    "listbox.demoViewBoard": "Tablero",
    "listbox.demoViewCalendar": "Calendario",
    "listbox.demoViewTimeline": "Línea de tiempo",
    "listbox.demoLabelsLabel": "Etiquetas",
    "listbox.demoLabelBug": "Bug",
    "listbox.demoLabelDocs": "Documentación",
    "listbox.demoLabelDesign": "Diseño",
    "listbox.demoLabelPerformance": "Rendimiento",
    "listbox.demoLabelLegacy": "Legado",
    "listbox.demoDaysLabel": "Días de entrega",
    "listbox.demoDay.mon": "Lun",
    "listbox.demoDay.tue": "Mar",
    "listbox.demoDay.wed": "Mié",
    "listbox.demoDay.thu": "Jue",
    "listbox.demoDay.fri": "Vie",
  },
  en: {
    "listbox.description": "An always-open list for choosing one or several options in place.",
    "listbox.betaBadge": "Beta",
    "listbox.lede":
      "Listbox is a Select's list of options without the dropdown: always open, it takes the room its options need and you choose right there. It runs on <code>@zag-js/listbox</code>, the same machine in both bindings.",

    "listbox.anatomyBody":
      "A label that names the list, and the list with its options. Each option has its text and a check that only shows when it is chosen; the check is decorative, what is announced is <code>aria-selected</code>.",
    "listbox.anatomyLabel": "Listbox anatomy",
    "listbox.anatomyPreviewLabel": "A Listbox, part by part",

    "listbox.whenTitle": "When to use it",
    "listbox.whenItem1":
      "The person choosing should see every option while they choose: a view, a few filters, the items they are about to act on.",
    "listbox.whenItem2":
      "More than one can be chosen, and ticking and unticking without opening anything is faster than a dropdown.",
    "listbox.whenItem3":
      "<strong>Not</strong> for a form field that gets submitted: Listbox has no <code>input</code> and no <code>name</code>. That is a Select, a RadioGroup or a group of Checkboxes, which the browser already submits.",

    "listbox.singleTitle": "One option",
    "listbox.singleBody":
      "<code>selectionMode=\"single\"</code>, the default: choosing one replaces the last. The option that starts chosen is marked with <code>defaultSelected</code> on the option itself.",
    "listbox.singleLabel": "Single-choice Listbox",

    "listbox.multipleTitle": "Several options",
    "listbox.multipleBody":
      "<code>selectionMode=\"multiple\"</code>: each click, or <kbd>Space</kbd>, ticks or unticks that option and leaves the rest alone, and the list announces itself with <code>aria-multiselectable</code>. A <code>disabled</code> option can be neither chosen nor highlighted: the keyboard skips it. <code>extended</code> is the desktop file-list model: a click replaces, and <kbd>Ctrl</kbd>/<kbd>⌘</kbd> or <kbd>Shift</kbd> add.",
    "listbox.multipleLabel": "Multiple-choice Listbox",

    "listbox.horizontalTitle": "Horizontal",
    "listbox.horizontalBody":
      "<code>orientation=\"horizontal\"</code> lays the options out in a row and changes the keys: the left and right arrows move through the list. If they do not fit, the row scrolls instead of wrapping.",
    "listbox.horizontalLabel": "Horizontal Listbox",

    "listbox.keyboardTitle": "Keyboard",
    "listbox.keyboardItem1":
      "Focus stays on the list, not on each option: <kbd>Tab</kbd> enters and leaves it in one stop, and <code>aria-activedescendant</code> says which one is highlighted.",
    "listbox.keyboardItem2":
      "The arrows move the highlight, <kbd>Home</kbd> and <kbd>End</kbd> go to the first and last enabled option, and <kbd>Space</kbd> or <kbd>Enter</kbd> choose.",
    "listbox.keyboardItem3": "Typing a letter jumps to the first option that starts with it.",

    "listbox.eventsTitle": "Listening for the change",
    "listbox.eventsBody":
      "Every change fires <code>sk:listboxvaluechange</code> on the root with <code>{ value }</code>, every chosen value after the change. In React it is <code>onValueChange</code>, and <code>value</code> controls it.",

    "listbox.demoViewLabel": "View",
    "listbox.demoViewList": "List",
    "listbox.demoViewBoard": "Board",
    "listbox.demoViewCalendar": "Calendar",
    "listbox.demoViewTimeline": "Timeline",
    "listbox.demoLabelsLabel": "Labels",
    "listbox.demoLabelBug": "Bug",
    "listbox.demoLabelDocs": "Documentation",
    "listbox.demoLabelDesign": "Design",
    "listbox.demoLabelPerformance": "Performance",
    "listbox.demoLabelLegacy": "Legacy",
    "listbox.demoDaysLabel": "Delivery days",
    "listbox.demoDay.mon": "Mon",
    "listbox.demoDay.tue": "Tue",
    "listbox.demoDay.wed": "Wed",
    "listbox.demoDay.thu": "Thu",
    "listbox.demoDay.fri": "Fri",
  },
};
