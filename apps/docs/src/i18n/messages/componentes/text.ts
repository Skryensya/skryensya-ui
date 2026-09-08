export const textMessages = {
  es: {
    "demo.text.title.eyebrow": "Integración",
    "demo.text.title.heading": "Exportar configuración",
    "demo.text.title.subtitle":
      "Copia el CSS derivado y pégalo una vez en tu proyecto.",
    "demo.text.reading.eyebrow": "Actualización · hace 5 minutos",
    "demo.text.reading.body":
      "El despliegue terminó sin interrupciones para las personas que ya estaban usando el producto.",
    "demo.text.reading.note":
      "La versión 2.18.4 ya está disponible en Frankfurt y São Paulo.",
    "demo.text.feedback":
      "No se pudo guardar el cambio. Revisa la conexión e intenta de nuevo.",
    "demo.text.before": "El plan",
    "demo.text.after": "incluye soporte prioritario.",

    "textPage.description": "Text: texto de lectura con roles tipográficos y semántica HTML explícita.",
    "textPage.lede": "Text presenta contenido de lectura con roles tipográficos nombrados. Elige el elemento HTML que describe el contenido; Text no crea semántica de encabezado.",
    "textPage.titleBlockTitle": "Bloque de título",
    "textPage.titleBlockBody":
      'Eyebrow, título y subtítulo como una sola unidad. Dos roles componen el encabezado: <code>eyebrow</code> es el sobretítulo en mayúsculas, <code>subtitle</code> es la bajada bajo el título. El aire entre roles lo pone el hermano de abajo (<code>padding-block-start</code> del heading y del subtitle), así el stack del bloque usa <code>data-gap="none"</code>.',
    "textPage.titleBlockLabel": "Bloque de título",
    "textPage.readingTitle": "Lectura con contexto",
    "textPage.readingBody": "Un metadato debe acompañar la lectura sin competir con el cuerpo; la jerarquía sale de rol, tono y peso, no de tamaños arbitrarios. El sobretítulo de arriba usa el rol <code>eyebrow</code>.",
    "textPage.readingLabel": "Texto de actualización",
    "textPage.inlineTitle": "Énfasis dentro de una frase",
    "textPage.inlineBody":
      "Usa el <strong>tag semántico</strong>, no un span con peso: <code>&lt;strong&gt;</code> dentro de Text toma el peso <code>emphasis</code> del sistema (no el bold más pesado del navegador), y a la vez lo anuncia un lector de pantalla. <code>&lt;em&gt;</code> queda en itálica. El eje <code>data-weight</code> es para el peso de un Text entero; esto es para enfatizar <em>dentro</em> de la frase.",
    "textPage.inlineLabel": "Texto inline",
    "textPage.feedbackTitle": "Feedback de validación",
    "textPage.feedbackBody": "El tono <code>danger</code> comunica el problema; el rol de región viva sigue siendo una decisión del contexto que usa Text.",
    "textPage.feedbackLabel": "Mensaje de validación",
    "textPage.contractItem1": "<code>sk-text</code> aporta el estilo base de lectura.",
    "textPage.contractItem2": "<code>data-size</code>: <code>caption</code>, <code>sm</code>, <code>body</code> o <code>lg</code>.",
    "textPage.contractItem3": "<code>data-tone</code>: <code>action</code>, <code>secondary</code>, <code>tertiary</code> o <code>danger</code>.",
    "textPage.contractItem4": "<code>data-weight</code>: <code>body</code>, <code>emphasis</code> o <code>label</code>.",
    "textPage.contractItem5":
      "<code>data-role</code>: <code>eyebrow</code> (sobretítulo en mayúsculas) o <code>subtitle</code> (bajada bajo un título). Un rol compone varios ejes de una vez; en React se pasa como <code>data-role</code>.",
    "textPage.contractItem6": "En React, <code>as</code> acepta <code>p</code>, <code>div</code> o <code>span</code>; por defecto es <code>p</code>.",
    "textPage.contractItem7": "Para encabezados, usa Heading y un elemento <code>h1</code>–<code>h6</code>, no Text.",
    "textPage.test1": "Mantiene Text semántico y aplica su rol de lectura nombrado.",
  },
  en: {
    "demo.text.title.eyebrow": "Integration",
    "demo.text.title.heading": "Export configuration",
    "demo.text.title.subtitle":
      "Copy the derived CSS and paste it once into your project.",
    "demo.text.reading.eyebrow": "Update · 5 minutes ago",
    "demo.text.reading.body":
      "The deployment ended without interruptions for people who were already using the product.",
    "demo.text.reading.note":
      "Version 2.18.4 is now available in Frankfurt and São Paulo.",
    "demo.text.feedback":
      "The change could not be saved. Check the connection and try again.",
    "demo.text.before": "The",
    "demo.text.after": "plan includes priority support.",

    "textPage.description": "Text: reading text with named typographic roles and explicit HTML semantics.",
    "textPage.lede": "Text presents reading content with named typographic roles. Choose the HTML element that describes the content; Text creates no heading semantics.",
    "textPage.titleBlockTitle": "Title block",
    "textPage.titleBlockBody":
      "Eyebrow, title, and subtitle as a single unit. Two roles compose the heading: <code>eyebrow</code> is the uppercase overline, <code>subtitle</code> is the line below the title. The air between roles comes from the sibling below (the heading's and subtitle's own <code>padding-block-start</code>), so the block's stack uses <code>data-gap=\"none\"</code>.",
    "textPage.titleBlockLabel": "Title block",
    "textPage.readingTitle": "Reading with context",
    "textPage.readingBody": "A metadata line should accompany the reading without competing with the body; the hierarchy comes from role, tone, and weight, not arbitrary sizes. The overline above uses the <code>eyebrow</code> role.",
    "textPage.readingLabel": "Update text",
    "textPage.inlineTitle": "Emphasis inside a sentence",
    "textPage.inlineBody":
      "Use the <strong>semantic tag</strong>, not a span with weight: <code>&lt;strong&gt;</code> inside Text takes the system's <code>emphasis</code> weight (not the browser's heavier bold), and a screen reader announces it at the same time. <code>&lt;em&gt;</code> lands in italics. The <code>data-weight</code> axis is for a whole Text's weight; this is for emphasizing <em>inside</em> the sentence.",
    "textPage.inlineLabel": "Inline text",
    "textPage.feedbackTitle": "Validation feedback",
    "textPage.feedbackBody": "The <code>danger</code> tone communicates the problem; the live-region role stays a decision of the context using Text.",
    "textPage.feedbackLabel": "Validation message",
    "textPage.contractItem1": "<code>sk-text</code> supplies the base reading style.",
    "textPage.contractItem2": "<code>data-size</code>: <code>caption</code>, <code>sm</code>, <code>body</code>, or <code>lg</code>.",
    "textPage.contractItem3": "<code>data-tone</code>: <code>action</code>, <code>secondary</code>, <code>tertiary</code>, or <code>danger</code>.",
    "textPage.contractItem4": "<code>data-weight</code>: <code>body</code>, <code>emphasis</code>, or <code>label</code>.",
    "textPage.contractItem5":
      "<code>data-role</code>: <code>eyebrow</code> (uppercase overline) or <code>subtitle</code> (line below a title). A role composes several axes at once; in React it is passed as <code>data-role</code>.",
    "textPage.contractItem6": "In React, <code>as</code> accepts <code>p</code>, <code>div</code>, or <code>span</code>; the default is <code>p</code>.",
    "textPage.contractItem7": "For headings, use Heading and an <code>h1</code>–<code>h6</code> element, not Text.",
    "textPage.test1": "Keeps Text semantic and applies its named reading role.",
  },
} as const;
