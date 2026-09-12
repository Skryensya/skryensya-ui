export const sliderMessages = {
  es: {

    "demo.slider.volume": "Volumen",
    "demo.slider.brightness": "Brillo",
    "demo.slider.priceMin": "Precio mínimo",
    "demo.slider.priceMax": "Precio máximo",

    "sliderPage.description": "Slider: control Zag con pista real, extremos alcanzables y componente React.",
    "sliderPage.lede":
      "Slider usa <code>@zag-js/slider</code>: el pulgar se centra sobre una pista real, así que 0% y 100% son los extremos visuales de la línea. Zag mantiene teclado, foco y participación en formularios con un input oculto.",
    "sliderPage.anatomyBody":
      "Este diagrama nombra la pista, el relleno y el pulgar. El espécimen está congelado; los sliders vivos empiezan abajo.",
    "sliderPage.anatomyLabel": "Anatomía de Slider",
    "sliderPage.anatomyPreviewLabel": "Slider, parte por parte",
    "sliderPage.body1":
      "En Vanilla, <code>data-sk-slider</code> monta la misma máquina que React y parchea la anatomía escrita a mano. En React, <code>&lt;Slider&gt;</code> conecta esa máquina directamente y reporta el cambio como número vía <code>onValueChange</code>.",
    "sliderPage.body2":
      "El <code>value</code> del contrato es <strong>dónde arranca el pulgar</strong>, y cada binding lo escribe con su nombre: <code>data-value</code> en el markup, <code>defaultValue</code> en React. No es cosmético: <code>value</code> en React significa controlado, así que emitirlo entregaba un slider que no se podía mover.",
    "sliderPage.test1": "Expone la semántica ARIA de slider desde la máquina Zag y reporta cambios como números.",
    "sliderPage.test2": "Pinta la pista y el relleno desde los porcentajes que publica la máquina.",
    "sliderPage.rangeTitle": "Dos pulgares",
    "sliderPage.rangeBody":
      "El rango usa la misma máquina Zag con dos pulgares. La máquina mantiene <code>aria-valuemin</code>/<code>aria-valuemax</code> de cada pulgar contra el valor actual del otro, y el relleno usa los porcentajes publicados por la máquina en vez de una fórmula duplicada.",
    "sliderPage.rangeLabel": "Rango de precio",
    "sliderPage.testRange1":
      "El máximo del pulgar bajo queda acotado por el valor actual del pulgar alto, y viceversa.",
    "sliderPage.testRange2":
      "Al cambiar un valor, reacota el OTRO pulgar y reporta ambos valores en el cambio.",
    "sliderPage.testRange3":
      "Ningún pulgar puede superar al otro. El min/max nativo recorta incluso una escritura directa de valor que se pase del límite.",
  },
  en: {

    "demo.slider.volume": "Volume",
    "demo.slider.brightness": "Brightness",
    "demo.slider.priceMin": "Minimum price",
    "demo.slider.priceMax": "Maximum price",

    "sliderPage.description": "Slider: a Zag control with a real track, reachable ends, and a React component.",
    "sliderPage.lede":
      "Slider uses <code>@zag-js/slider</code>: the thumb is centered over a real track, so 0% and 100% are the visual ends of the line. Zag keeps keyboard, focus, and form participation through a hidden input.",
    "sliderPage.anatomyBody":
      "This diagram names the track, the fill, and the thumb. The specimen is frozen; the live sliders start below.",
    "sliderPage.anatomyLabel": "Slider anatomy",
    "sliderPage.anatomyPreviewLabel": "Slider, part by part",
    "sliderPage.body1":
      "In Vanilla, <code>data-sk-slider</code> mounts the same machine React uses and patches the authored anatomy. In React, <code>&lt;Slider&gt;</code> connects that machine directly and reports changes as numbers through <code>onValueChange</code>.",
    "sliderPage.body2":
      "The contract's <code>value</code> is <strong>where the thumb starts</strong>, and each binding writes it under its own name: <code>data-value</code> in markup, <code>defaultValue</code> in React. It is not cosmetic: <code>value</code> in React means controlled, so emitting it produced a slider that could not move.",
    "sliderPage.test1": "Exposes slider ARIA semantics from the Zag machine and reports changes as numbers.",
    "sliderPage.test2": "Paints the track and range from the percentages the machine publishes.",
    "sliderPage.rangeTitle": "Two thumbs",
    "sliderPage.rangeBody":
      "The range uses the same Zag machine with two thumbs. The machine keeps each thumb's <code>aria-valuemin</code>/<code>aria-valuemax</code> bounded by the other thumb's current value, and the fill uses the machine's published percentages instead of duplicating the formula.",
    "sliderPage.rangeLabel": "Price range",
    "sliderPage.testRange1":
      "The low thumb's max is bounded by the high thumb's current value, and vice versa.",
    "sliderPage.testRange2":
      "Changing one value re-bounds the OTHER thumb and reports both values on the change.",
    "sliderPage.testRange3":
      "Neither thumb can exceed the other. Native min/max clamps even a direct value write past the bound.",
  },
} as const;
