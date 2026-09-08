export const comboboxMessages = {
  es: {
    "demo.combobox.label": "País",
    "demo.combobox.placeholder": "Buscar país",
    "demo.combobox.hint": "Escribí para filtrar la lista",

    "combobox.description": "Sugerencias editables con estados claros, ayuda contextual y navegación completa por teclado.",
    "combobox.betaBadge": "Beta",
    "combobox.lede": "Sugerencias editables con contexto, estados claros y navegación completa por teclado.",
    "combobox.contractBody1":
      "Combobox filtra una colección autorada sin reemplazar sus opciones. Select conserva una lista cerrada e Input no muestra sugerencias.",
    "combobox.contractBody2":
      "Lo escrito es trabajo del usuario: salir del campo sin elegir nada (desenfocar, clic afuera, Escape) cierra la lista pero <strong>no borra la búsqueda</strong>. Sólo elegir una opción reescribe el input (con la etiqueta elegida), y sólo el ✕ lo vacía. Al reabrir, el filtro vuelve a la lista completa: lo que se ve es la selección, no el último texto tipeado.",
    "combobox.a11yBody1":
      "El foco permanece en el input mientras <code>aria-activedescendant</code> señala la opción activa. Flecha abajo y arriba recorren resultados, Enter selecciona y Escape cierra. <code>hint</code> y <code>error</code> se enlazan mediante <code>aria-describedby</code>; los cambios en la cantidad de resultados se anuncian con una región de estado.",
    "combobox.a11yBody2":
      "Recorrer con el teclado mueve el anillo de foco al ítem resaltado (foco virtual) y el control cede el suyo: hay un solo anillo en pantalla y viaja hacia la lista y de vuelta. Con el puntero no aparece anillo (un anillo siguiendo al cursor se lee como foco roto), sólo la capa de estado.",
    "combobox.test1": "Conserva la búsqueda tipeada cuando el campo queda sin selección.",
    "combobox.test2": "Escribe la etiqueta elegida y reabre sobre la lista completa.",
    "combobox.test3":
      "En modo múltiple, la búsqueda se consume con cada chip agregado.",
    "combobox.test4": "Le pasa la colección filtrada a la máquina antes de renderizar.",
  },
  en: {
    "demo.combobox.label": "Country",
    "demo.combobox.placeholder": "Search country",
    "demo.combobox.hint": "Type to filter the list",

    "combobox.description": "Editable suggestions with clear states, contextual help, and full keyboard navigation.",
    "combobox.betaBadge": "Beta",
    "combobox.lede": "Editable suggestions with context, clear states, and full keyboard navigation.",
    "combobox.contractBody1":
      "Combobox filters an authored collection without replacing its options. Select keeps a closed list, and Input shows no suggestions.",
    "combobox.contractBody2":
      "What is typed is the user's own work: leaving the field without picking anything (blur, click outside, Escape) closes the list but <strong>does not clear the search</strong>. Only picking an option rewrites the input (with the chosen label), and only the ✕ clears it. On reopening, the filter returns to the full list: what shows is the selection, not the last text typed.",
    "combobox.a11yBody1":
      "Focus stays on the input while <code>aria-activedescendant</code> points at the active option. Arrow down and up move through results, Enter selects, and Escape closes. <code>hint</code> and <code>error</code> link through <code>aria-describedby</code>; changes in the result count are announced through a status region.",
    "combobox.a11yBody2":
      "Moving through results by keyboard moves the focus ring to the highlighted item (virtual focus), and the control yields its own: there is one ring on screen, and it travels to the list and back. With the pointer, no ring appears (a ring following the cursor reads as broken focus). Only the state layer.",
    "combobox.test1": "Keeps the typed search when the field is left without a selection.",
    "combobox.test2": "Writes the chosen label and reopens on the whole list.",
    "combobox.test3": "In multiple mode, the search is spent on each chip added.",
    "combobox.test4": "Hands the filtered collection to the machine before it renders.",
  },
} as const;
