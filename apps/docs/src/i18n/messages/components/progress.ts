export const progressMessages = {
  es: {
    "demo.progress.upload": "Subida",
    "demo.progress.complete": "Completado",
    "demo.progress.quota": "Cuota",

    "progressPage.description": "Progress: barra determinada con fracción recortada en el core, tonos y componente React.",
    "progressPage.lede":
      "Progress es una barra <strong>determinada</strong>: el consumidor conoce el valor. La fracción se recorta a <code>[0, max]</code> en el core (<code>progressFraction</code>), de modo que el ancho pintado y <code>aria-valuenow</code> nunca pueden divergir.",
    "progressPage.body": 'Para trabajo sin un valor medible usa <a href="/components/loader">Loader</a>: su semántica es indeterminada.',
    "progressPage.test1": "Expone el valor en el rol <code>progressbar</code> y pinta el relleno correspondiente.",
    "progressPage.test2": "Recorta un valor fuera de rango para que el relleno y <code>aria-valuenow</code> coincidan.",
  },
  en: {
    "demo.progress.upload": "Upload",
    "demo.progress.complete": "Complete",
    "demo.progress.quota": "Quota",

    "progressPage.description": "Progress: a determinate bar with a fraction clamped in core, tones, and a React component.",
    "progressPage.lede":
      "Progress is a <strong>determinate</strong> bar: the consumer knows the value. The fraction is clamped to <code>[0, max]</code> in core (<code>progressFraction</code>), so the painted width and <code>aria-valuenow</code> can never drift apart.",
    "progressPage.body": 'For work with no measurable value, use <a href="/en/components/loader">Loader</a>: its semantics are indeterminate.',
    "progressPage.test1": "Exposes the value on the progressbar role and paints the matching fill.",
    "progressPage.test2": "Clamps an out-of-range value so the paint and aria-valuenow agree.",
  },
} as const;
