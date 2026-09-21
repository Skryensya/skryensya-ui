export const stateButtonMessages = {
  es: {
    "demo.state-button.viewMode.title": "Modo de vista",
    "demo.state-button.viewMode.grid": "Modo de vista: cuadrícula",
    "demo.state-button.viewMode.list": "Modo de vista: lista",
    "demo.state-button.viewMode.compact": "Modo de vista: compacto",
    "demo.state-button.themeToggle.title": "Modo de tema",
    "demo.state-button.copy.title": "Copiar al portapapeles",

    "stateButtonPage.description":
      "StateButton: un botón que muestra uno de N estados nombrados, cada uno con su propio ícono, y deja que quien lo usa escriba el comportamiento.",
    "stateButtonPage.lede":
      "Un botón de estado es un primitivo para mostrar uno de varios estados posibles. A diferencia de un Switch (que es para on/off) o un Icon simple (que no cambia), este componente deja que tú decidas cuántos estados hay, cuál está activo, y qué pasa cuando se hace clic.",
    "stateButtonPage.anatomyTitle": "Anatomía: estados nombrados con íconos",
    "stateButtonPage.anatomyBody":
      "Cada estado tiene un nombre (grid, list, light, dark), un ícono que lo representa, y una etiqueta accesible (aria-label). El botón siempre es icon-only: no hay texto visible, sólo glifos.",
    "stateButtonPage.behaviorTitle": "El comportamiento lo escribes tú",
    "stateButtonPage.behaviorBody":
      "StateButton no decide cuándo cambiar de estado. Tú escribes la función que cambia <code>activeState</code> cuando se hace clic: un ciclo (grid → list → compact → grid), un toggle (light ↔ dark), un flujo (ready → copied → ready), lo que necesites.",
    "stateButtonPage.variantTitle": "Variantes y tamaño heredados de Button",
    "stateButtonPage.variantBody":
      "El <code>variant</code> y el <code>size</code> son los de Button: ghost, primary, danger, etc. Con otros estilos. La forma más común en una toolbar es ghost + sm.",
    "stateButtonPage.useCaseThemeTitle": "Ejemplo: ciclo de modo de tema",
    "stateButtonPage.useCaseThemeBody":
      "Tres estados: light (sol), dark (luna), auto (automático). El ícono cambia con el estado, la función onClick cicla entre los tres.",
    "stateButtonPage.useCaseViewTitle": "Ejemplo: modo de vista",
    "stateButtonPage.useCaseViewBody":
      "Tres estados: grid, list, compact. El usuario hace clic para elegir cómo ver los datos. El estado se guarda en la URL o en localStorage.",
    "stateButtonPage.useCaseCopyTitle": "Ejemplo: copia al portapapeles",
    "stateButtonPage.useCaseCopyBody":
      "Dos estados: ready (ícono copy) y copied (ícono check). Después de hacer clic, un timeout vuelve a ready. La función está hecha en <code>@skryensya/core/copy-button</code>.",
    "stateButtonPage.whenTitle": "Cuándo usarlo",
    "stateButtonPage.whenItem1":
      "Necesitas un control icon-only que muestre uno de varios estados, cada uno con su propio ícono.",
    "stateButtonPage.whenItem2":
      "Los estados varían según el caso: no hay un set fijo. Si siempre son on/off, es un Switch.",
    "stateButtonPage.whenItem3":
      "Quien lo usa va a escribir el comportamiento: un ciclo, un toggle, un flujo personalizado.",
    "stateButtonPage.avoidTitle": "Cuándo no usarlo",
    "stateButtonPage.avoidItem1":
      "Si hay sólo dos estados que se leen como on/off: usa un Switch o un Toggle simple.",
    "stateButtonPage.avoidItem2":
      "Si el comportamiento ya está hecho: usa <code>@skryensya/core/theme-toggle</code> o <code>@skryensya/core/copy-button</code>, que están hechos sobre StateButton.",
    "stateButtonPage.avoidItem3":
      "Si el ícono es puramente decorativo y no cambia: usa Icon, sin la anatomía de estados.",
    "stateButtonPage.avoidItem4":
      "Si necesitas texto visible además del ícono: usa Button.action, no esta anatomía icon-only.",
    "stateButtonPage.contractItem1":
      "El botón siempre es <code>data-icon-only</code>. El nombre accesible es <code>aria-label</code> o <code>aria-labelledby</code> en el botón.",
    "stateButtonPage.contractItem2":
      "El <code>name</code> nombra el comportamiento (theme-toggle, view-mode, copy-status) para que el CSS y el comportamiento hablen el mismo idioma.",
    "stateButtonPage.contractItem3":
      "El <code>states</code> es un array de {name, icon, ariaLabel}: cada estado tiene su propio ícono y su propia etiqueta accesible.",
    "stateButtonPage.contractItem4":
      "El <code>variant</code> y el <code>size</code> vienen de Button: el primitivo no tiene opinión sobre aspecto.",
  },
  en: {
    "demo.state-button.viewMode.title": "View mode",
    "demo.state-button.viewMode.grid": "View mode: grid",
    "demo.state-button.viewMode.list": "View mode: list",
    "demo.state-button.viewMode.compact": "View mode: compact",
    "demo.state-button.themeToggle.title": "Theme mode",
    "demo.state-button.copy.title": "Copy to clipboard",

    "stateButtonPage.description":
      "StateButton: a button that shows one of N named states, each with its own icon, and lets you write the behavior.",
    "stateButtonPage.lede":
      "A state button is a primitive to show one of several possible states. Unlike a Switch (which is for on/off) or a simple Icon (which does not change), this component lets you decide how many states there are, which is active, and what happens when clicked.",
    "stateButtonPage.anatomyTitle": "Anatomy: named states with icons",
    "stateButtonPage.anatomyBody":
      "Each state has a name (grid, list, light, dark), an icon that represents it, and an accessible label (aria-label). The button is always icon-only: no visible text, just glyphs.",
    "stateButtonPage.behaviorTitle": "You write the behavior",
    "stateButtonPage.behaviorBody":
      "StateButton does not decide when to change state. You write the function that changes <code>activeState</code> when clicked: a cycle (grid → list → compact → grid), a toggle (light ↔ dark), a flow (ready → copied → ready), whatever you need.",
    "stateButtonPage.variantTitle": "Variants and size inherited from Button",
    "stateButtonPage.variantBody":
      "The <code>variant</code> and <code>size</code> are from Button: ghost, primary, danger, etc. The most common form in a toolbar is ghost + sm.",
    "stateButtonPage.useCaseThemeTitle": "Example: theme mode cycle",
    "stateButtonPage.useCaseThemeBody":
      "Three states: light (sun), dark (moon), auto (automatic). The icon changes with the state, the onClick function cycles through all three.",
    "stateButtonPage.useCaseViewTitle": "Example: view mode",
    "stateButtonPage.useCaseViewBody":
      "Three states: grid, list, compact. The user clicks to choose how to view the data. The state is saved in the URL or localStorage.",
    "stateButtonPage.useCaseCopyTitle": "Example: copy to clipboard",
    "stateButtonPage.useCaseCopyBody":
      "Two states: ready (copy icon) and copied (check icon). After clicking, a timeout returns to ready. The function is built into <code>@skryensya/core/copy-button</code>.",
    "stateButtonPage.whenTitle": "When to use it",
    "stateButtonPage.whenItem1":
      "You need an icon-only control that shows one of several states, each with its own icon.",
    "stateButtonPage.whenItem2":
      "States vary by use case: there is no fixed set. If it is always on/off, use a Switch.",
    "stateButtonPage.whenItem3":
      "The person using it will write the behavior: a cycle, a toggle, a custom flow.",
    "stateButtonPage.avoidTitle": "When not to use it",
    "stateButtonPage.avoidItem1":
      "If there are only two states that read as on/off: use a Switch or a simple Toggle.",
    "stateButtonPage.avoidItem2":
      "If the behavior is already built: use <code>@skryensya/core/theme-toggle</code> or <code>@skryensya/core/copy-button</code>, which are built on StateButton.",
    "stateButtonPage.avoidItem3":
      "If the icon is purely decorative and does not change: use Icon, without the state anatomy.",
    "stateButtonPage.avoidItem4":
      "If you need visible text alongside the icon: use Button.action, not this icon-only anatomy.",
    "stateButtonPage.contractItem1":
      "The button is always <code>data-icon-only</code>. The accessible name is <code>aria-label</code> or <code>aria-labelledby</code> on the button.",
    "stateButtonPage.contractItem2":
      "The <code>name</code> names the behavior (theme-toggle, view-mode, copy-status) so CSS and behavior speak the same language.",
    "stateButtonPage.contractItem3":
      "The <code>states</code> is an array of {name, icon, ariaLabel}: each state has its own icon and its own accessible label.",
    "stateButtonPage.contractItem4":
      "The <code>variant</code> and <code>size</code> come from Button: the primitive has no opinion about appearance.",
  },
};
