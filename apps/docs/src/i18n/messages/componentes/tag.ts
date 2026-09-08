export const tagMessages = {
  es: {

    /*
     * THE CONTENT OF THE DEMOS, so a usage tree can be written ONCE and read in either language.
     *
     * A demo's tree is its composition (which signature, nested how, with which options), and none
     * of that is Spanish or English. Only the words inside it are, so only the words live here: the
     * two pages import the same tree factory from `src/demos/` and hand it their translator. Before
     * this, each page carried its own copy of the tree, which is the same duplication the tree came
     * to remove, one language later.
     *
     * A demo string that is a PROPER NOUN stays in the tree (`react`, `frontend`, `tokens`): it is
     * not translated, and a key for it would only be an identity entry that can rot.
     */
    "demo.tag.design": "diseño",
    "demo.tag.active": "activo",
    "demo.tag.deprecated": "deprecado",
    "demo.tag.remove": "Quitar {name}",

    "tagPage.description": "Tag: chip de palabra clave opcionalmente removible, con tonos y componente React.",
    "tagPage.lede":
      'Tag clasifica contenido sobre el que el usuario puede actuar: filtros, facetas, chips. Donde <a href="/componentes/badge">Badge</a> es una etiqueta de estado de solo lectura, Tag es más cuadrado (radio de control, no píldora) para leerse como accionable.',
    "tagPage.simpleTitle": "Tags de palabra clave",
    "tagPage.simpleBody":
      "Una etiqueta quieta categoriza contenido sin sugerir estado, alerta o eliminación.",
    "tagPage.simpleLabel": "Tag simple",
    "tagPage.tonesTitle": "Tags con tono",
    "tagPage.tonesBody":
      "El tono comunica función. Activo, beta, deprecado, pero sigue siendo Tag. Si sólo quieres un estado de lectura, Badge es la pieza correcta.",
    "tagPage.tonesLabel": "Tonos",
    "tagPage.linksTitle": "Tags enlace",
    "tagPage.linksBody":
      "Un tag enlace navega a una faceta o palabra clave. No puede ser dismissible: si el usuario debe quitar un filtro, usa un tag removible con su botón separado.",
    "tagPage.linksLabel": "Tags enlace",
    "tagPage.removableTitle": "Tags removibles",
    "tagPage.removableBody":
      "Cuando es removible, la etiqueta y el botón de quitar son dos objetivos distintos. El nombre accesible del control nombra el tag exacto que remueve.",
    "tagPage.removableLabel": "Tags removibles",
    "tagPage.test1": "Lleva su tono y su etiqueta.",
    "tagPage.test2": "Expone un control de remover nombrado solo cuando se pasa <code>onRemove</code>.",
    "tagPage.test3": "El control de remover compone Button real: foco, press y área de toque vienen de Button.",
    "tagPage.testLink": "Renderiza un tag navegable como enlace y nunca como dismissible.",
  },
  en: {

    /* The demos' words. The composition they sit in is shared: see the Spanish block above. */
    "demo.tag.design": "design",
    "demo.tag.active": "active",
    "demo.tag.deprecated": "deprecated",
    "demo.tag.remove": "Remove {name}",

    "tagPage.description": "Tag: an optionally removable keyword chip, with tones and a React component.",
    "tagPage.lede":
      'Tag classifies content the user can act on: filters, facets, chips. Where <a href="/en/components/badge">Badge</a> is a read-only status label, Tag is more squared (control radius, not a pill) to read as actionable.',
    "tagPage.simpleTitle": "Keyword tags",
    "tagPage.simpleBody":
      "A quiet label categorizes content without implying status, warning, or removal.",
    "tagPage.simpleLabel": "Simple tag",
    "tagPage.tonesTitle": "Tonal tags",
    "tagPage.tonesBody":
      "Tone communicates function. Active, beta, deprecated, but the component is still Tag. If you only need read-only status, Badge is the right piece.",
    "tagPage.tonesLabel": "Tones",
    "tagPage.linksTitle": "Link tags",
    "tagPage.linksBody":
      "A link tag navigates to a facet or keyword. It cannot be dismissible: if the user needs to remove a filter, use a removable tag with its separate button.",
    "tagPage.linksLabel": "Link tags",
    "tagPage.removableTitle": "Removable tags",
    "tagPage.removableBody":
      "When removable, the label and the remove button are two separate targets. The control's accessible name names the exact tag it removes.",
    "tagPage.removableLabel": "Removable tags",
    "tagPage.test1": "Carries its tone and label.",
    "tagPage.test2": "Exposes a named remove control only when onRemove is given.",
    "tagPage.test3": "The remove control composes a real Button: focus, press, and hit area come from Button.",
    "tagPage.testLink": "Renders a navigable tag as a link and never as dismissible.",
  },
} as const;
