export const megamenuMessages = {
  es: {

    "megamenuPage.description":
      "Categorías de navegación que despliegan un panel borde a borde con varias columnas de enlaces.",
    "megamenuPage.anatomyBody":
      "Este diagrama nombra la barra, el trigger y el panel abierto con sus columnas NavList. El espécimen está congelado; el megamenu vivo empieza abajo.",
    "megamenuPage.anatomyLabel": "Anatomía de Megamenu",
    "megamenuPage.anatomyPreviewLabel": "Megamenu abierto, parte por parte",
    "megamenuPage.contractBody":
      "Megamenu es distinto de Menu/Menubar: sin <code>role=\"menu\"</code>, sin flechas ni typeahead. Cada categoría es un <code>&lt;button aria-expanded&gt;</code> y su panel son 2-4 <code>NavListGroup</code> (el mismo componente que usa NavList), enlaces comunes que se recorren con Tab. El panel mide el mismo ancho que la barra entera (anclado a la barra, no al trigger).",
    "megamenuPage.a11yBody":
      "Tab recorre los enlaces del panel en orden normal del documento, sin trampa de foco. Escape cierra el panel abierto y devuelve el foco a su trigger. El hover con intención (~150ms) es una mejora sólo para mouse; click/Enter/Space funcionan igual en cualquier dispositivo.",

    "megamenuPage.testVanilla1":
      "Las N posicionadoras escritas a mano colapsan en un solo panel compartido, dimensionado por una regla oculta con las columnas de cada trigger.",
    "megamenuPage.testVanilla2":
      "Un click abre el panel de ese trigger con sus propias columnas.",
    "megamenuPage.testVanilla3": "Un click en el MISMO trigger lo cierra. Un toggle.",
    "megamenuPage.testVanilla4":
      "Un click en un trigger DISTINTO cambia el contenido del panel compartido, de forma excluyente.",
    "megamenuPage.testVanilla5": "Abre por intención de hover recién cuando pasa su demora, no al instante.",
    "megamenuPage.testVanilla6": "Sacar el puntero antes de que pase la demora cancela la apertura por hover.",
    "megamenuPage.testVanilla7":
      "Cierra por intención de hover recién cuando pasa su propia demora, una vez que el puntero deja el trigger Y el panel.",
    "megamenuPage.testVanilla8": "Volver a entrar al panel compartido cancela su cierre pendiente.",
    "megamenuPage.testVanilla9": "Escape cierra el panel abierto y devuelve el foco a su trigger.",
    "megamenuPage.testVanilla10": "El foco saliendo de toda la barra cierra el panel abierto.",
    "megamenuPage.testVanilla11":
      "El foco moviéndose de un trigger a su propio panel (portado afuera) NO lo cierra.",
    "megamenuPage.testVanilla12":
      "Pasar el puntero por un enlace con preview cambia la imagen, revirtiendo recién al dejar todos los enlaces con preview.",

    "megamenuPage.testReact1":
      "Renderiza un solo panel compartido, dimensionado por una regla oculta con las columnas de cada trigger.",
    "megamenuPage.testReact2":
      "Un click abre el panel de ese trigger con sus propias columnas.",
    "megamenuPage.testReact3": "Un click en el MISMO trigger lo cierra. Un toggle.",
    "megamenuPage.testReact4":
      "Un click en un trigger DISTINTO cambia el contenido del panel compartido, de forma excluyente.",
    "megamenuPage.testReact5": "Abre por intención de hover recién cuando pasa su demora, no al instante.",
    "megamenuPage.testReact6": "Sacar el puntero antes de que pase la demora cancela la apertura por hover.",
    "megamenuPage.testReact7":
      "Cierra por intención de hover recién cuando pasa su propia demora, una vez que el puntero deja el trigger Y el panel.",
    "megamenuPage.testReact8": "Volver a entrar al panel compartido cancela su cierre pendiente.",
    "megamenuPage.testReact9": "Escape cierra el panel abierto y devuelve el foco a su trigger.",
    "megamenuPage.testReact10": "El foco saliendo de toda la barra cierra el panel abierto.",
    "megamenuPage.testReact11":
      "El foco moviéndose de un trigger a su propio panel (portado afuera) NO lo cierra.",
    "megamenuPage.testReact12":
      "Pasar el puntero por un enlace con preview cambia la imagen, revirtiendo recién al dejar todos los enlaces con preview.",
    "demo.megamenu.label": "Navegación principal",
    "demo.megamenu.trigger1": "Producto",
    "demo.megamenu.trigger2": "Recursos",
    "demo.megamenu.group1": "Plataforma",
    "demo.megamenu.group2": "Soluciones",
    "demo.megamenu.group3": "Aprender",
    "demo.megamenu.group4": "Comunidad",
    "demo.megamenu.link1": "Resumen",
    "demo.megamenu.link2": "Precios",
    "demo.megamenu.link3": "Integraciones",
    "demo.megamenu.link4": "Para equipos",
    "demo.megamenu.link5": "Para empresas",
    "demo.megamenu.link6": "Documentación",
    "demo.megamenu.link7": "Guías",
    "demo.megamenu.link8": "Foro",
    "demo.megamenu.link9": "Blog",
  },
  en: {

    "megamenuPage.description":
      "Navigation categories that open an edge-to-edge panel of several link columns.",
    "megamenuPage.anatomyBody":
      "This diagram names the bar, the trigger, and the open panel with its NavList columns. The specimen is frozen; the live megamenu starts below.",
    "megamenuPage.anatomyLabel": "Megamenu anatomy",
    "megamenuPage.anatomyPreviewLabel": "An open Megamenu, part by part",
    "megamenuPage.contractBody":
      "Megamenu is deliberately unlike Menu/Menubar: no <code>role=\"menu\"</code>, no arrow keys or typeahead. Each category is a plain <code>&lt;button aria-expanded&gt;</code> and its panel is 2-4 <code>NavListGroup</code>s (the same component NavList uses), ordinary links you Tab through. The panel matches the whole bar's own width (anchored to the bar, not the trigger).",
    "megamenuPage.a11yBody":
      "Tab flows through a panel's links in normal document order, no focus trap. Escape closes the open panel and returns focus to its trigger. Hover-intent (~150ms) is a mouse-only enhancement; click/Enter/Space work identically on any device.",

    "megamenuPage.testVanilla1":
      "The N authored positioners collapse into one shared panel, sized by a hidden ruler holding every trigger's columns.",
    "megamenuPage.testVanilla2": "A click opens that trigger's panel with its own columns.",
    "megamenuPage.testVanilla3": "A click on the SAME trigger closes it. A toggle.",
    "megamenuPage.testVanilla4":
      "A click on a DIFFERENT trigger switches the shared panel's content, exclusively.",
    "megamenuPage.testVanilla5": "Opens on hover intent only once its own delay elapses, not immediately.",
    "megamenuPage.testVanilla6": "Leaving before the delay elapses cancels the hover-intent open.",
    "megamenuPage.testVanilla7":
      "Closes on hover intent only once its own delay elapses, after the pointer leaves both the trigger and the panel.",
    "megamenuPage.testVanilla8": "Re-entering the shared panel cancels its pending close.",
    "megamenuPage.testVanilla9": "Escape closes the open panel and returns focus to its trigger.",
    "megamenuPage.testVanilla10": "Focus leaving the whole bar closes the open panel.",
    "megamenuPage.testVanilla11":
      "Focus moving from a trigger into its own (portalled-out) panel does NOT close it.",
    "megamenuPage.testVanilla12":
      "Hovering a preview link swaps the image, reverting only once every preview link is left.",

    "megamenuPage.testReact1":
      "Renders one shared panel, sized by a hidden ruler holding every trigger's columns.",
    "megamenuPage.testReact2": "A click opens that trigger's panel with its own columns.",
    "megamenuPage.testReact3": "A click on the SAME trigger closes it. A toggle.",
    "megamenuPage.testReact4":
      "A click on a DIFFERENT trigger switches the shared panel's content, exclusively.",
    "megamenuPage.testReact5": "Opens on hover intent only once its own delay elapses, not immediately.",
    "megamenuPage.testReact6": "Leaving before the delay elapses cancels the hover-intent open.",
    "megamenuPage.testReact7":
      "Closes on hover intent only once its own delay elapses, after the pointer leaves both the trigger and the panel.",
    "megamenuPage.testReact8": "Re-entering the shared panel cancels its pending close.",
    "megamenuPage.testReact9": "Escape closes the open panel and returns focus to its trigger.",
    "megamenuPage.testReact10": "Focus leaving the whole bar closes the open panel.",
    "megamenuPage.testReact11":
      "Focus moving from a trigger into its own (portalled-out) panel does NOT close it.",
    "megamenuPage.testReact12":
      "Hovering a preview link swaps the image, reverting only once every preview link is left.",

    "demo.megamenu.label": "Main navigation",
    "demo.megamenu.trigger1": "Product",
    "demo.megamenu.trigger2": "Resources",
    "demo.megamenu.group1": "Platform",
    "demo.megamenu.group2": "Solutions",
    "demo.megamenu.group3": "Learn",
    "demo.megamenu.group4": "Community",
    "demo.megamenu.link1": "Overview",
    "demo.megamenu.link2": "Pricing",
    "demo.megamenu.link3": "Integrations",
    "demo.megamenu.link4": "For teams",
    "demo.megamenu.link5": "For enterprise",
    "demo.megamenu.link6": "Documentation",
    "demo.megamenu.link7": "Guides",
    "demo.megamenu.link8": "Forum",
    "demo.megamenu.link9": "Blog",
  },
} as const;
