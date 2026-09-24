export const userSelectMessages = {
  es: {
    "userSelectPage.placeholder": "Seleccionar personas",
    "userSelectPage.searchPlaceholder": "Buscar personas...",
    "userSelectPage.description": "UserSelect: un selector múltiple de personas compuesto sobre Select, Avatar y GroupedAvatar.",
    "userSelectPage.lede":
      "No es una primitive nueva: es <code>Select</code> mismo, su trigger, su máquina, su chrome de dropdown, combinado con <code>Avatar</code> y <code>GroupedAvatar</code> para representar la selección, y un campo de búsqueda para filtrar. Compártelo visualmente al lado de un <code>Select</code> normal y son claramente la misma familia.",
    "userSelectPage.calloutBody":
      "El trigger reutiliza exactamente el chrome de <code>Select</code> (altura, borde, radio, focus, chevron). El dropdown reutiliza su posicionamiento, su portal y su animación, con <code>composite: false</code> para poder alojar un campo de búsqueda real junto al listbox. Cada fila es un <code>Avatar</code> autoreado, nunca reconstruido por este componente.",
    "userSelectPage.basicTitle": "Selección múltiple con búsqueda",
    "userSelectPage.basicBody":
      "Busca por nombre o email; la búsqueda nunca cierra el dropdown ni limpia la selección. Cada fila entera es el objetivo de clic: el check es sólo el estado visual, nunca un control aparte.",
    "userSelectPage.statesTitle": "Estados",
    "userSelectPage.statesBody":
      "Vacío, un usuario, varios (con el <code>+N</code> de <code>GroupedAvatar</code>), deshabilitado, cargando y sin resultados: todos leen los mismos tokens y patrones que ya usa el resto del sistema.",
    "userSelectPage.a11yTitle": "Accesibilidad",
    "userSelectPage.a11yItem1":
      "El trigger expone una única etiqueta textual (\"Select users, 3 users selected\"); los avatars dentro son decorativos (<code>aria-hidden</code>), así un lector de pantalla nunca interpreta imágenes superpuestas.",
    "userSelectPage.a11yItem2":
      "Cada fila es una única opción (<code>role=\"option\"</code>); el avatar, el nombre y el check no son controles independientes.",
    "userSelectPage.a11yItem3":
      "<code>Tab</code> enfoca el trigger; <code>Enter</code>/<code>Space</code> abre y mueve el foco al buscador; las flechas navegan el listado; <code>Enter</code> selecciona o deselecciona la fila activa; <code>Escape</code> cierra y devuelve el foco al trigger.",
    "userSelectPage.a11yItem4":
      "El estado seleccionado nunca depende sólo del color: el check permanece visible además del tinte de fondo.",
    "userSelectPage.vanillaTitle": "Vanilla",
    "userSelectPage.vanillaBody":
      "El enhancer nunca inventa una fila: lee <code>data-value</code>, el nodo de texto y un <code>data-email</code> opcional de cada <code>[data-sk-select-item]</code> ya autorado, y clona su propio <code>.sk-avatar</code> para el resumen del trigger, nunca deriva iniciales por su cuenta. El wrapper del listado (<code>role=\"listbox\"</code>), la fila vacía y el pie \"N seleccionados · Clear all\" se generan solos si no los autoras.",
    "userSelectPage.iconsTitle": "Iconos",
    "userSelectPage.listenTitle": "Escuchar el cambio",
    "userSelectPage.reactTitle": "React",
    "userSelectPage.reactBody":
      "Completamente controlado, como <code>Select</code>: <code>value</code>/<code>onValueChange</code> son del consumidor. Reutiliza el mismo <code>@zag-js/select</code> que usa <code>Select</code>, con <code>multiple</code> y <code>composite: false</code>.",
  },
  en: {
    "userSelectPage.placeholder": "Select users",
    "userSelectPage.searchPlaceholder": "Search users...",
    "userSelectPage.description": "UserSelect: a multi-person picker composed from Select, Avatar and GroupedAvatar.",
    "userSelectPage.lede":
      "This is not a new primitive: it is <code>Select</code> itself, its trigger, its machine, its dropdown chrome, combined with <code>Avatar</code> and <code>GroupedAvatar</code> to represent the selection, and a search field to filter it. Set it beside a plain <code>Select</code> and they read as the same family.",
    "userSelectPage.calloutBody":
      "The trigger reuses Select's exact chrome (height, border, radius, focus, chevron). The dropdown reuses its positioning, portal and animation, with <code>composite: false</code> so it can hold a real search field next to the listbox. Every row is an authored <code>Avatar</code>, never one this component rebuilds.",
    "userSelectPage.basicTitle": "Multi-select with search",
    "userSelectPage.basicBody":
      "Search by name or email; searching never closes the dropdown or clears the selection. The whole row is the click target: the check is only the visual state, never a separate control.",
    "userSelectPage.statesTitle": "States",
    "userSelectPage.statesBody":
      "Empty, one user, several (with <code>GroupedAvatar</code>'s own <code>+N</code>), disabled, loading and no results: all reading the same tokens and patterns the rest of the system already uses.",
    "userSelectPage.a11yTitle": "Accessibility",
    "userSelectPage.a11yItem1":
      "The trigger carries one composed text label (\"Select users, 3 users selected\"); the avatars inside it are decorative (<code>aria-hidden</code>), so a screen reader never parses stacked images.",
    "userSelectPage.a11yItem2":
      "Each row is a single option (<code>role=\"option\"</code>); the avatar, the name and the check are never independent controls.",
    "userSelectPage.a11yItem3":
      "<code>Tab</code> focuses the trigger; <code>Enter</code>/<code>Space</code> opens it and moves focus to the search field; the arrows navigate the list; <code>Enter</code> toggles the active row; <code>Escape</code> closes and returns focus to the trigger.",
    "userSelectPage.a11yItem4":
      "Selected state never depends on color alone: the check stays visible alongside the background tint.",
    "userSelectPage.vanillaTitle": "Vanilla",
    "userSelectPage.vanillaBody":
      "The enhancer never invents a row: it reads <code>data-value</code>, the text node and an optional <code>data-email</code> off each authored <code>[data-sk-select-item]</code>, and clones its own <code>.sk-avatar</code> for the trigger's summary, it never derives initials on its own. The list wrapper (<code>role=\"listbox\"</code>), the empty row and the \"N selected · Clear all\" footer generate themselves when not authored.",
    "userSelectPage.iconsTitle": "Icons",
    "userSelectPage.listenTitle": "Listening for the change",
    "userSelectPage.reactTitle": "React",
    "userSelectPage.reactBody":
      "Fully controlled, like <code>Select</code>: <code>value</code>/<code>onValueChange</code> stay the consumer's. It reuses the same <code>@zag-js/select</code> machine <code>Select</code> uses, with <code>multiple</code> and <code>composite: false</code>.",
  },
} as const;
