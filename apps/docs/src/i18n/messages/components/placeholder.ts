export const placeholderMessages = {
  es: {
    "demo.placeholder.loading": "Cargando publicación…",
    "demo.placeholder.loaded": "Publicación cargada.",
    "demo.placeholder.research": "Investigación",
    "demo.placeholder.title": "Cuando una ruta deja de ser lineal",
    "demo.placeholder.body":
      "Doce entrevistas muestran dónde se pierde el contexto y qué señales ayudan a recuperarlo.",
    "demo.placeholder.readTime": "8 min de lectura · actualizado hoy",
    "demo.placeholder.roleSample": "El texto real de este rol",

    "placeholderPage.description": "Placeholder: geometría decorativa para reservar el lugar del contenido mientras carga.",
    "placeholderPage.lede":
      "Placeholder reserva la forma del contenido que todavía no llegó. Reduce saltos de layout y ofrece una señal visual breve; el contenedor conserva la responsabilidad de explicar qué está cargando.",
    "placeholderPage.anatomyBody":
      "Este diagrama nombra el root y las líneas de un <code>Placeholder.paragraph</code>. Las demás firmas son un solo <code>sk-placeholder</code> sin parte hija; solo el párrafo hace que <code>sk-placeholder__line</code> valga la pena. Está congelado; los layouts vivos empiezan abajo.",
    "placeholderPage.anatomyLabel": "Anatomía de Placeholder",
    "placeholderPage.anatomyPreviewLabel": "Placeholder, parte por parte",
    "placeholderPage.calloutBody":
      'Placeholder siempre es decorativo. Usa <code>aria-busy="true"</code> y un mensaje de estado en la región que espera los datos.',
    "placeholderPage.layoutTitle": "Layout pendiente",
    "placeholderPage.layoutBody":
      "La geometría sigue el layout final: una card del kit (<code>Box</code> + <code>Stack</code>) con media, texto y byline. Este primer ejemplo permanece siempre en carga para poder inspeccionar el Placeholder.",
    "placeholderPage.layoutLabel": "Layout con Placeholder",
    "placeholderPage.layoutNote": "Siempre pendiente",
    "placeholderPage.swapTitle": "Carga simulada",
    "placeholderPage.swapBody":
      "El segundo ejemplo espera <strong>5 segundos</strong>, retira el layout provisional y muestra el contenido real en el mismo espacio: <code>ImageFrame</code>, <code>Badge</code>, <code>Heading</code>, <code>Text</code> y <code>Avatar</code>.",
    "placeholderPage.swapLabel": "Placeholder → contenido",
    "placeholderPage.swapNote": "Carga falsa · 5 s",
    "placeholderPage.shapesTitle": "Cuatro firmas, un primitivo",
    "placeholderPage.shapesBody":
      "Cada firma lleva sólo las opciones que le corresponden: un círculo no acepta <code>text</code> y un párrafo no acepta <code>fill</code>. Componer un skeleton específico es elegir firmas y nombrar roles, nunca escribir medidas.",
    "placeholderPage.shapesItem1": "<code>Placeholder</code>: una línea, con el rol tipográfico que reemplaza.",
    "placeholderPage.shapesItem2": "<code>Placeholder.paragraph</code>: varias líneas con la última corta.",
    "placeholderPage.shapesItem3": "<code>Placeholder.block</code>: media, tablas o regiones rectangulares; <code>fill</code> toma la caja y la esquina del padre.",
    "placeholderPage.shapesItem4": "<code>Placeholder.circle</code>: avatares, en la misma escala que usa Avatar.",
    "placeholderPage.shapesLabel": "Las cuatro firmas",
    "placeholderPage.matchTitle": "El skeleton mide lo que va a reemplazar",
    "placeholderPage.matchBody":
      "<code>text=\"h3\"</code> no es \"más o menos alto como un h3\": resuelve al mismo par de tokens de tamaño e interlineado que lee <code>Heading</code>. Acá cada fila es un Placeholder al lado del texto real del mismo rol. Coinciden porque leen lo mismo, no porque alguien los midió; si cambia la escala tipográfica, se mueven juntos.",
    "placeholderPage.matchLabel": "Skeleton y texto real, mismo rol",
    "placeholderPage.matchNote": "h1 · h3 · body · caption",
    "placeholderPage.reducedTitle": "Movimiento reducido",
    "placeholderPage.reducedBody":
      "El brillo se desplaza con <code>transform</code>. Con <code>prefers-reduced-motion: reduce</code>, desaparece la animación y permanece el relleno estático.",
    "placeholderPage.reactBody": "El código está en la pestaña <strong>React</strong> de cada preview.",
    "placeholderPage.test1": "Una línea toma su alto del rol tipográfico que reemplaza, no de un largo escrito a mano.",
    "placeholderPage.test2": "No tiene violaciones serias de accesibilidad dentro de una región busy nombrada.",
    "placeholderPage.test3": "El párrafo dibuja líneas reales y publica la última medida en la raíz.",
    "placeholderPage.test4": "React acota la cantidad de líneas igual que el emisor, así los dos bindings dibujan lo mismo.",
    "placeholderPage.test5": "Un bloque con fill toma la caja del padre; el círculo toma la escala de Avatar.",
    "placeholderPage.test6": "Ninguna de las cuatro firmas entra al árbol de accesibilidad.",
  },
  en: {
    "demo.placeholder.loading": "Loading post…",
    "demo.placeholder.loaded": "Post loaded.",
    "demo.placeholder.research": "Research",
    "demo.placeholder.title": "When a route stops being linear",
    "demo.placeholder.body":
      "Twelve interviews show where context is lost and what signs help to recover it.",
    "demo.placeholder.readTime": "8 min read · updated today",
    "demo.placeholder.roleSample": "The real text of this role",

    "placeholderPage.description": "Placeholder: decorative geometry that reserves content's place while it loads.",
    "placeholderPage.lede":
      "Placeholder reserves the shape of content that has not arrived yet. It cuts layout shift and offers a brief visual signal; the container keeps the responsibility of explaining what is loading.",
    "placeholderPage.anatomyBody":
      "This diagram names the root and the lines of a <code>Placeholder.paragraph</code>. The other signatures are a single <code>sk-placeholder</code> with no child part; only the paragraph makes <code>sk-placeholder__line</code> worth naming. It is frozen; the live layouts start below.",
    "placeholderPage.anatomyLabel": "Placeholder anatomy",
    "placeholderPage.anatomyPreviewLabel": "Placeholder, part by part",
    "placeholderPage.calloutBody":
      'Placeholder is always decorative. Use <code>aria-busy="true"</code> and a status message on the region waiting for the data.',
    "placeholderPage.layoutTitle": "Pending layout",
    "placeholderPage.layoutBody":
      "The geometry follows the final layout: a kit card (<code>Box</code> + <code>Stack</code>) with media, text, and a byline. This first example stays loading forever so the Placeholder can be inspected.",
    "placeholderPage.layoutLabel": "Layout with Placeholder",
    "placeholderPage.layoutNote": "Always pending",
    "placeholderPage.swapTitle": "Simulated load",
    "placeholderPage.swapBody":
      "The second example waits <strong>5 seconds</strong>, drops the provisional layout, and shows the real content in the same space: <code>ImageFrame</code>, <code>Badge</code>, <code>Heading</code>, <code>Text</code>, and <code>Avatar</code>.",
    "placeholderPage.swapLabel": "Placeholder → content",
    "placeholderPage.swapNote": "Fake load · 5 s",
    "placeholderPage.shapesTitle": "Four signatures, one primitive",
    "placeholderPage.shapesBody":
      "Each signature carries only the options that apply to it: a circle takes no <code>text</code>, a paragraph takes no <code>fill</code>. Composing a specific skeleton is choosing signatures and naming roles, never writing measurements.",
    "placeholderPage.shapesItem1": "<code>Placeholder</code>: one line, carrying the type role it replaces.",
    "placeholderPage.shapesItem2": "<code>Placeholder.paragraph</code>: several lines with a short last one.",
    "placeholderPage.shapesItem3": "<code>Placeholder.block</code>: media, tables, or rectangular regions; <code>fill</code> takes the parent's box and corner.",
    "placeholderPage.shapesItem4": "<code>Placeholder.circle</code>: avatars, on the same scale Avatar uses.",
    "placeholderPage.shapesLabel": "The four signatures",
    "placeholderPage.matchTitle": "A skeleton measures what it will replace",
    "placeholderPage.matchBody":
      "<code>text=\"h3\"</code> does not mean \"roughly as tall as an h3\": it resolves to the same size and leading token pair <code>Heading</code> reads. Each row below is a Placeholder beside the real text of the same role. They line up because both read the same tokens, not because anyone measured; change the type scale and they move together.",
    "placeholderPage.matchLabel": "Skeleton and real text, same role",
    "placeholderPage.matchNote": "h1 · h3 · body · caption",
    "placeholderPage.reducedTitle": "Reduced motion",
    "placeholderPage.reducedBody":
      "The sheen moves with <code>transform</code>. Under <code>prefers-reduced-motion: reduce</code>, the animation disappears and the static fill remains.",
    "placeholderPage.reactBody": "The code is in each preview's <strong>React</strong> tab.",
    "placeholderPage.test1": "A line takes its height from the type role it replaces, not from a hand-written length.",
    "placeholderPage.test2": "Has no serious accessibility violations inside a labelled busy region.",
    "placeholderPage.test3": "The paragraph draws real lines and publishes the last line's measure on the root.",
    "placeholderPage.test4": "React clamps the line count exactly as the emitter does, so both bindings draw the same thing.",
    "placeholderPage.test5": "A filled block takes the parent's box; the circle takes Avatar's scale.",
    "placeholderPage.test6": "None of the four signatures enters the accessibility tree.",
  },
} as const;
