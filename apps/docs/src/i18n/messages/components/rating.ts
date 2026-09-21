export const ratingMessages = {
  es: {
    "demo.rating.displayLabel": "4,3 de 5",
    "demo.rating.inputLabel": "Tu puntuación",
    "demo.rating.count": "128 reseñas",
    "demo.rating.fraction38": "3,8 de 5",
    "demo.rating.fraction43": "4,3 de 5",
    "demo.rating.fraction50": "5 de 5",
    "demo.rating.sizeSm": "4 de 5, chico",
    "demo.rating.sizeMd": "4 de 5, mediano",
    "demo.rating.sizeLg": "4 de 5, grande",

    "ratingPage.description": "Rating: la misma medición en dos direcciones, una que se elige y otra que se reporta.",
    "ratingPage.lede":
      "Una misma escala vista desde los dos lados: <code>RatingDisplay</code> reporta un promedio ya calculado y <code>Rating</code> es el control con el que alguien lo produce. Son dos signatures de un contrato y no dos contratos, porque el símbolo, la escala y la lectura son los mismos; separarlos serían dos hojas de estilo para una idea.",
    "ratingPage.inputTitle": "El input es un grupo de radios",
    "ratingPage.inputBody":
      "Elegir uno de un conjunto corto y ordenado es exactamente lo que WAI-ARIA resuelve con <code>radiogroup</code>: una sola parada de tabulación, las flechas mueven, y el nombre lo lleva el grupo. La otra candidata era un slider, y pierde en lo que esto realmente es: cinco opciones discretas, no un continuo.",
    "ratingPage.fractionTitle": "El display no redondea",
    "ratingPage.fractionBody":
      "Un promedio de 4,3 dibujado como 4 es el componente mintiendo sobre su propio dato, y peor: 4,3 y 3,8 quedarían idénticos. La tira se rellena en la fracción exacta, y exacta quiere decir medida en símbolos y no en tira: cada símbolo entero se lleva su casilla completa, con el espacio que viene después, y lo que sobra se lleva esa fracción de UN símbolo. Así 4,3 de 5 corta tres décimos adentro de la quinta estrella, en vez de quedarse justo antes de ella.",
    "ratingPage.fractionPreviewLabel": "3,8 y 4,3 no se dibujan igual",
    "ratingPage.asymmetryBody":
      "La asimetría es a propósito: <strong>el display acepta decimales y el input solo pasos enteros</strong>. Pedirle a alguien que apunte a la mitad de un símbolo de 20px es un blanco de 10px, y en una pantalla táctil es cara o sello; promediar lo que eligieron cien personas es aritmética. Si tu producto prefiere mostrar 4,5 antes que 4,3, <code>ratingRoundToHalf</code> está en core y se aplica antes de pasar el valor, nunca adentro del contrato.",
    "ratingPage.anatomyLabel": "Anatomía de Rating",
    "ratingPage.anatomyBody":
      "Una sola etiqueta para el símbolo, porque lo que importa es que <strong>las dos signatures llevan el mismo</strong>: la tira que pinta el display y el glifo dentro de cada radio son la misma máscara. Por eso cambiar <code>--sk-rating-symbol</code> las cambia a las dos de una vez.",
    "ratingPage.anatomyPreviewLabel": "Un símbolo, dos direcciones",
    "ratingPage.symbolTitle": "El símbolo es CSS, no un icono",
    "ratingPage.symbolBody":
      "Y es una salida deliberada de cómo dibuja el resto del kit. El vocabulario de iconos nombra <em>roles</em> (\"borrar\", \"cerrar\") que cada set dibuja a su manera, y la unidad de una escala no es uno de esos. Tampoco podría serlo: <code>attrs</code> en un icon set es por <em>set</em> y no por icono, así que \"estrella llena\" y \"estrella vacía\" no pueden ser dos roles sin que algún set publicado quede degenerado (Lucide no tiene estrella llena; la de Material no puede volverse contorno). Entonces el glifo es una máscara detrás de <code>--sk-rating-symbol</code>: se ve igual con cualquier set instalado, y cambiarlo por un corazón o un pulgar es una declaración.",
    "ratingPage.sizeTitle": "Tamaños",
    "ratingPage.sizeBody":
      "<code>symbolSize</code> mueve el símbolo y con él la cara del paso: cada radio es el botón de icono del kit, de 24, 32 o 40 px, y los tres tamaños pasan el mínimo de 24 px que pide WCAG 2.2. Hacia arriba y hacia abajo el blanco sigue llegando a 44 px; a los costados no, y es a propósito: hay cinco uno al lado del otro, y el blanco del vecino le robaría los últimos píxeles a esta estrella.",
    "ratingPage.sizePreviewLabel": "sm, md y lg",
    "ratingPage.a11yBody":
      "El input es un <code>radiogroup</code> con un radio por paso: una parada de tabulación, flechas para moverse, <code>aria-posinset</code> y <code>aria-setsize</code> diciendo \"3 de 5\". El display es un <code>role=\"img\"</code> con todos sus símbolos <code>aria-hidden</code>, así la lectura se anuncia una vez como un hecho en vez de como cinco imágenes que alguien tiene que sumar.",
    "ratingPage.a11yLabelBody":
      "<code>label</code> es obligatorio en las dos signatures: una fila de símbolos no anuncia nada por sí sola, y \"4,3 de 5\" es una frase que solo quien compone puede escribir en el idioma de quien lee. El nombre de cada paso sale de <code>itemLabel</code>, que por defecto es solo el número: el grupo ya tiene nombre, y \"3 estrellas\" repetiría un símbolo del que nadie fue informado, en un idioma que nadie eligió.",
  },
  en: {
    "demo.rating.displayLabel": "4.3 out of 5",
    "demo.rating.inputLabel": "Your rating",
    "demo.rating.count": "128 reviews",
    "demo.rating.fraction38": "3.8 out of 5",
    "demo.rating.fraction43": "4.3 out of 5",
    "demo.rating.fraction50": "5 out of 5",
    "demo.rating.sizeSm": "4 out of 5, small",
    "demo.rating.sizeMd": "4 out of 5, medium",
    "demo.rating.sizeLg": "4 out of 5, large",

    "ratingPage.description": "Rating: one measurement in two directions, one chosen and one reported.",
    "ratingPage.lede":
      "One scale seen from both ends: <code>RatingDisplay</code> reports an average already calculated, and <code>Rating</code> is the control that produces it. Two signatures of one contract rather than two contracts, because the symbol, the scale and the reading are the same; splitting them would be two stylesheets for one idea.",
    "ratingPage.inputTitle": "The input is a radio group",
    "ratingPage.inputBody":
      "Picking one of a short ordered set is exactly what WAI-ARIA answers with <code>radiogroup</code>: one tab stop, arrows to move, and the group carrying the name. A slider was the other candidate, and loses on what this actually is: five discrete choices, not a continuum.",
    "ratingPage.fractionTitle": "The display does not round",
    "ratingPage.fractionBody":
      "An average of 4.3 drawn as 4 is the component lying about its own data, and worse: 4.3 and 3.8 would look identical. The strip fills the exact fraction, and exact means measured in symbols rather than in strip: every whole symbol takes its full tile, trailing gap included, and what is left over takes that much of ONE symbol. So 4.3 out of 5 stops three tenths into the fifth star instead of just short of it.",
    "ratingPage.fractionPreviewLabel": "3.8 and 4.3 do not draw the same",
    "ratingPage.asymmetryBody":
      "The asymmetry is deliberate: <strong>the display takes fractions and the input only whole steps</strong>. Asking someone to land a pointer on half of a 20px symbol is a 10px target, and on a touch screen it is a coin toss; averaging what a hundred people chose is arithmetic. If your product would rather show 4.5 than 4.3, <code>ratingRoundToHalf</code> is in core and is applied on the way in, never inside the contract.",
    "ratingPage.anatomyLabel": "Rating anatomy",
    "ratingPage.anatomyBody":
      "One label for the symbol, because what matters is that <strong>both signatures wear it</strong>: the strip the display paints and the glyph inside each radio are the same mask. That is why changing <code>--sk-rating-symbol</code> changes both at once.",
    "ratingPage.anatomyPreviewLabel": "One symbol, two directions",
    "ratingPage.symbolTitle": "The symbol is CSS, not an icon",
    "ratingPage.symbolBody":
      "And it is a deliberate departure from how the rest of the kit draws things. The icon vocabulary names <em>roles</em> (\"delete\", \"close\") that each set draws its own way, and the unit of a scale is not one of those. It could not be anyway: <code>attrs</code> on an icon set is per <em>set</em>, not per icon, so \"filled star\" and \"empty star\" cannot be two roles without one published set being degenerate (Lucide has no filled star; Material's cannot become an outline). So the glyph is a mask behind <code>--sk-rating-symbol</code>: it looks the same whichever set is installed, and swapping it for a heart or a thumb is one declaration.",
    "ratingPage.sizeTitle": "Sizes",
    "ratingPage.sizeBody":
      "<code>symbolSize</code> moves the symbol and the step's face with it: each radio is the kit's icon button at 24, 32 or 40px, and all three clear the 24px minimum WCAG 2.2 asks for. The target still reaches 44px above and below; sideways it does not, on purpose: five of them sit side by side, and the neighbour's target would steal the last pixels of this one's star.",
    "ratingPage.sizePreviewLabel": "sm, md and lg",
    "ratingPage.a11yBody":
      "The input is a <code>radiogroup</code> with one radio per step: one tab stop, arrows to move, <code>aria-posinset</code> and <code>aria-setsize</code> saying \"3 of 5\". The display is a <code>role=\"img\"</code> with every symbol <code>aria-hidden</code>, so the reading is announced once as one fact rather than as five images someone has to add up.",
    "ratingPage.a11yLabelBody":
      "<code>label</code> is required on both signatures: a row of symbols announces nothing on its own, and \"4.3 out of 5\" is a sentence only the composer can write in the reader's language. Each step's own name comes from <code>itemLabel</code>, a bare number by default: the group is already named, and \"3 stars\" would repeat a symbol the reader was never told about, in a language nobody chose.",
  },
} as const;
