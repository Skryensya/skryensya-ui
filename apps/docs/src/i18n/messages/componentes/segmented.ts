export const segmentedMessages = {
  es: {
    "demo.segmented.label": "Rango",
    "demo.segmented.day": "Día",
    "demo.segmented.week": "Semana",
    "demo.segmented.month": "Mes",

    "segmentedPage.description": "SegmentedControl: elección única y visible sobre un grupo pequeño, con semántica radiogroup.",
    "segmentedPage.lede":
      'SegmentedControl es una elección única de un conjunto pequeño y fijo, mostrado de una vez: un radiogroup con ropa de barra de botones. Para navegar entre paneles usa <a href="/componentes/tabs">Tabs</a>; para muchas opciones o texto libre, <a href="/componentes/select">Select</a>.',
    "segmentedPage.body":
      "El enhancer vanilla selecciona con click y con flechas; <code>Home</code> y <code>End</code> saltan al primer y último segmento. La opción elegida queda en <code>data-value</code> y se anuncia con <code>aria-checked</code>. Cada segmento pinta a <code>--size-control-sm</code> y conserva un hit de <code>44px</code> vía <code>::after</code> (el indicador sigue la caja pintada).",
    "segmentedPage.vanillaInitTitle": "Inicializar vanilla",
    "segmentedPage.reactBody":
      "Es controlado (<code>value</code>) o no controlado (<code>defaultValue</code>); al cambiar, el indicador se alinea y viaja hasta la opción nueva con el token de motion de cambio de estado.",
    "segmentedPage.test1": "Conecta las partes autoradas en un único radiogroup con foco itinerante (roving).",
    "segmentedPage.test2": "Selecciona con click y navegación por flechas, saltando las opciones deshabilitadas.",
  },
  en: {
    "demo.segmented.label": "Range",
    "demo.segmented.day": "Day",
    "demo.segmented.week": "Week",
    "demo.segmented.month": "Month",

    "segmentedPage.description": "SegmentedControl: a single, visible choice over a small group, with radiogroup semantics.",
    "segmentedPage.lede":
      'SegmentedControl is a single choice from a small, fixed set, shown all at once: a radiogroup dressed as a button bar. To navigate between panels use <a href="/en/components/tabs">Tabs</a>; for many options or free text, <a href="/en/components/select">Select</a>.',
    "segmentedPage.body":
      "The vanilla enhancer selects on click and with arrows; <code>Home</code> and <code>End</code> jump to the first and last segment. The chosen option lands in <code>data-value</code> and announces through <code>aria-checked</code>. Every segment paints at <code>--size-control-sm</code> and keeps a <code>44px</code> hit target through <code>::after</code> (the indicator follows the painted box).",
    "segmentedPage.vanillaInitTitle": "Initializing vanilla",
    "segmentedPage.reactBody":
      "It is controlled (<code>value</code>) or uncontrolled (<code>defaultValue</code>); on change, the indicator aligns and travels to the new option with the state-change motion token.",
    "segmentedPage.test1": "Patches the authored parts into one roving radiogroup.",
    "segmentedPage.test2": "Selects on click and arrow navigation, skipping disabled options.",
  },
} as const;
