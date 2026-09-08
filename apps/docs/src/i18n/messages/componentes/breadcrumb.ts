export const breadcrumbMessages = {
  es: {
    "demo.breadcrumb.label": "Migas de pan",
    "demo.breadcrumb.home": "Inicio",
    "demo.breadcrumb.projects": "Proyectos",
    "demo.breadcrumb.settings": "Configuración",
    "demo.breadcrumb.longAncestor":
      "Migración del layer vanilla a componentes Svelte",
    "demo.breadcrumb.longCurrent":
      "Máquinas Zag compartidas entre el layer vanilla y los componentes Svelte",
    "demo.breadcrumb.documents": "Documentos",
    "demo.breadcrumb.activeProjects": "Proyectos activos",
    "demo.breadcrumb.designSystem": "Sistema de diseño",
    "demo.breadcrumb.sharedComponents": "Componentes compartidos",

    "breadcrumb.description": "Ubicación jerárquica con enlaces reales y página actual explícita.",
    "breadcrumb.betaBadge": "Beta",
    "breadcrumb.examplesTitle": "Ejemplos",
    "breadcrumb.twoTitle": "Dos niveles",
    "breadcrumb.twoBody": "El caso mínimo: un enlace al nivel anterior y la página actual, sin enlace ni separador final.",
    "breadcrumb.twoLabel": "Breadcrumb de dos niveles",
    "breadcrumb.multiTitle": "Varios niveles",
    "breadcrumb.multiBody": "Cada nivel intermedio es un enlace real seguido de su separador; solo el último elemento pierde ambos.",
    "breadcrumb.multiLabel": "Breadcrumb de varios niveles",
    "breadcrumb.iconTitle": "Separador con ícono",
    "breadcrumb.iconBody":
      'El separador es una ranura de contenido: sin llenarla el template escribe <code>/</code>, y acepta texto (<code>·</code>, <code>›</code>) o un <a href="/componentes/icon">Icon</a>, como <code>chevron-right</code>. Nada más: puntuación con un título adentro no es puntuación.',
    "breadcrumb.iconLabel": "Breadcrumb con separador de ícono",
    "breadcrumb.longTitle": "Etiquetas largas",
    "breadcrumb.longBody":
      "Un nivel intermedio largo no debería empujar el resto del trail fuera de la columna, y la página actual no debería truncarse: es justo la etiqueta que el breadcrumb existe para mostrar completa. Cada parte resuelve el exceso de forma distinta.",
    "breadcrumb.longItem1":
      '<code>sk-breadcrumb__link</code> corta con elipsis a <code>--sk-breadcrumb-link-max</code> (16ch por default) y expone el texto completo en <code>title</code>; un ancestro largo se lee como referencia, no como el foco de la página.',
    "breadcrumb.longItem2":
      '<code>sk-breadcrumb__current</code> nunca trunca: envuelve en varias líneas (<code>overflow-wrap: anywhere</code>) para que el título completo siga siendo legible aunque no quepa en una sola línea.',
    "breadcrumb.longLabel": "Breadcrumb con etiquetas largas",
    "breadcrumb.collapseTitle": "Colapsa para entrar",
    "breadcrumb.collapseBody":
      'Cuando la senda no entra en una sola línea, un enhancer esconde los niveles ancestro. Nunca el primero ni la página actual. Detrás de un disclosure «…» que abre un <a href="/componentes/menu">Menu</a> real con esos mismos niveles: el patrón de teclado de un menú ARIA (flechas, Home/End, typeahead), no una lista plana. Sin JavaScript, o con menos de cuatro niveles, el markup sigue completo por sí solo.',
    "breadcrumb.collapseLabel": "Breadcrumb que colapsa para entrar",
    "breadcrumb.collapseTriggerLabel": "Mostrar niveles ocultos",
    "breadcrumb.contractBody": "Usa nav + ol; el último elemento lleva aria-current=page y no es un enlace.",
    "breadcrumb.a11yBody":
      'El label distingue estas migas de otras navegaciones de la página. El disclosure «…» de una senda colapsada lleva su propio <code>aria-label</code> (<code>collapsedLabel</code>) y abre un <a href="/componentes/menu">Menu</a> real, <code>role="menu"</code>: navegación con flechas, Home/End, typeahead y cierre con Escape son del patrón de menú, no algo que este componente reimplemente.',
    "breadcrumb.test1": "Una senda corta se renderiza sin colapsar: no hay «…» que valga la pena mostrar.",
    "breadcrumb.test2": "El trigger «…» expone su <code>aria-label</code> y <code>aria-haspopup=\"menu\"</code>, y abre un <a href=\"/componentes/menu\">Menu</a> real con los niveles ocultos.",
    "breadcrumb.test3": "Una senda que entra en una línea queda sin colapsar.",
    "breadcrumb.test4": "El colapso se recalcula en cada resize, incluso al achicarse desde un estado ya expandido.",
    "breadcrumb.test5": "Una senda corta no gana ni siquiera el elemento «…»: nada vale la pena esconder.",
    "breadcrumb.test6": "Una senda que entra en una línea no toca ningún crumb: el «…» queda oculto.",
    "breadcrumb.test7": "Sin espacio, el «…» abre un <a href=\"/componentes/menu\">Menu</a> real con los crumbs escondidos, cada uno como enlace navegable; el primero y la página actual quedan siempre a la vista.",
    "breadcrumb.test8": "Cada resize vuelve a medir la senda: primero expande todo, así nunca queda atascado colapsado de más.",
    "breadcrumb.test9": "Al desmontar el enhancer, todos los crumbs vuelven a quedar visibles.",
  },
  en: {
    "demo.breadcrumb.label": "Breadcrumbs",
    "demo.breadcrumb.home": "Home",
    "demo.breadcrumb.projects": "Projects",
    "demo.breadcrumb.settings": "Settings",
    "demo.breadcrumb.longAncestor":
      "Migration from vanilla layer to Svelte components",
    "demo.breadcrumb.longCurrent":
      "Zag machines shared between vanilla layer and Svelte components",
    "demo.breadcrumb.documents": "Documents",
    "demo.breadcrumb.activeProjects": "Active projects",
    "demo.breadcrumb.designSystem": "Design system",
    "demo.breadcrumb.sharedComponents": "Shared components",

    "breadcrumb.description": "Hierarchical location with real links and an explicit current page.",
    "breadcrumb.betaBadge": "Beta",
    "breadcrumb.examplesTitle": "Examples",
    "breadcrumb.twoTitle": "Two levels",
    "breadcrumb.twoBody": "The minimum case: a link to the previous level and the current page, with no trailing link or separator.",
    "breadcrumb.twoLabel": "Two-level breadcrumb",
    "breadcrumb.multiTitle": "Several levels",
    "breadcrumb.multiBody": "Every intermediate level is a real link followed by its separator; only the last item loses both.",
    "breadcrumb.multiLabel": "Multi-level breadcrumb",
    "breadcrumb.iconTitle": "Icon separator",
    "breadcrumb.iconBody":
      'The separator is a content slot: leave it empty and the template writes <code>/</code>, or fill it with text (<code>·</code>, <code>›</code>) or an <a href="/en/components/icon">Icon</a>, such as <code>chevron-right</code>. Nothing else: punctuation with a heading inside it is not punctuation.',
    "breadcrumb.iconLabel": "Breadcrumb with an icon separator",
    "breadcrumb.longTitle": "Long labels",
    "breadcrumb.longBody":
      "A long intermediate level should not push the rest of the trail out of the column, and the current page should not truncate: that is exactly the label the breadcrumb exists to show in full. Each part resolves the overflow differently.",
    "breadcrumb.longItem1":
      '<code>sk-breadcrumb__link</code> ellipsizes at <code>--sk-breadcrumb-link-max</code> (16ch by default) and exposes the full text through <code>title</code>; a long ancestor reads as a reference, not the focus of the page.',
    "breadcrumb.longItem2":
      '<code>sk-breadcrumb__current</code> never truncates: it wraps across lines (<code>overflow-wrap: anywhere</code>) so the full title stays legible even when it does not fit on one line.',
    "breadcrumb.longLabel": "Breadcrumb with long labels",
    "breadcrumb.collapseTitle": "Collapsing to fit",
    "breadcrumb.collapseBody":
      'When the trail does not fit on one line, an enhancer hides the ancestor levels: never the first one or the current page. Behind a "…" disclosure that opens a real <a href="/en/components/menu">Menu</a> holding those same levels: an ARIA menu\'s own keyboard pattern (arrow keys, Home/End, typeahead), not a plain list. Without JavaScript, or under four levels, the markup is still complete on its own.',
    "breadcrumb.collapseLabel": "Breadcrumb that collapses to fit",
    "breadcrumb.collapseTriggerLabel": "Show hidden levels",
    "breadcrumb.contractBody": "Use nav + ol; the last item carries aria-current=page and is not a link.",
    "breadcrumb.a11yBody":
      'The label tells these crumbs apart from other navigation on the page. A collapsed trail\'s "…" disclosure carries its own <code>aria-label</code> (<code>collapsedLabel</code>) and opens a real <a href="/en/components/menu">Menu</a>, <code>role="menu"</code>: arrow-key navigation, Home/End, typeahead and Escape to close all come from the menu pattern, not something this component reimplements.',
    "breadcrumb.test1": "A short trail renders uncollapsed: there is no \"…\" worth showing.",
    "breadcrumb.test2": "The \"…\" trigger exposes its <code>aria-label</code> and <code>aria-haspopup=\"menu\"</code>, and opens a real <a href=\"/en/components/menu\">Menu</a> of the hidden levels.",
    "breadcrumb.test3": "A trail that fits on one line stays uncollapsed.",
    "breadcrumb.test4": "The collapse is re-measured on every resize, even shrinking back from an already-expanded state.",
    "breadcrumb.test5": "A short trail doesn't even grow the \"…\" item: nothing is worth hiding.",
    "breadcrumb.test6": "A trail that fits on one line leaves every crumb untouched: the \"…\" stays hidden.",
    "breadcrumb.test7": "With no room, the \"…\" opens a real <a href=\"/en/components/menu\">Menu</a> of the hidden crumbs, each one a navigable link; the first crumb and the current page stay visible either way.",
    "breadcrumb.test8": "Every resize re-measures the trail: it expands first, so it never gets stuck over-collapsed.",
    "breadcrumb.test9": "Unmounting the enhancer restores every crumb to visible.",
  },
} as const;
