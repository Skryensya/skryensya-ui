export const stepsMessages = {
  es: {
    "demo.steps.brand.label": "Elegir marca",
    "demo.steps.brand.description": "Tu intención cromática",
    "demo.steps.ramps.label": "Ajustar rampas",
    "demo.steps.ramps.description": "Define la luz y la sombra",
    "demo.steps.contrast.label": "Auditar contraste",
    "demo.steps.contrast.description": "Prueba cada par de color",
    "demo.steps.export.label": "Exportar",
    "demo.steps.export.description": "Publica el contrato",
    "demo.steps.account.label": "Cuenta",
    "demo.steps.account.description": "Datos de acceso",
    "demo.steps.shipping.label": "Envío",
    "demo.steps.shipping.description": "Dirección de entrega",
    "demo.steps.payment.label": "Pago",
    "demo.steps.payment.description": "Método y facturación",

    "stepsPage.description": "Steps: indicador de progreso lineal con estados complete / current / upcoming.",
    "stepsPage.lede":
      "Steps muestra el avance sobre una secuencia ordenada. Cada paso reporta uno de tres estados <code>complete</code>, <code>current</code>, <code>upcoming</code>; el componente exhibe la secuencia, no gobierna cuál está activo ni guarda la navegación entre pasos.",
    "stepsPage.anatomyBody":
      "Este diagrama nombra el recorrido, el ítem, el marcador, la etiqueta y la descripción. El espécimen está congelado; los Steps vivos empiezan abajo.",
    "stepsPage.anatomyLabel": "Anatomía de Steps",
    "stepsPage.anatomyPreviewLabel": "Steps, parte por parte",
    "stepsPage.body": "En React, <code>current</code> deriva el estado de los pasos que no declaran el suyo; un paso puede sobrescribirlo con <code>status</code>. <code>description</code> agrega contexto sin convertir el paso en una tarjeta.",
    "stepsPage.mobileTitle": "En móvil",
    "stepsPage.mobileBody":
      "Cuando el viewport no llega a <code>40rem</code>, el recorrido se vuelve un riel vertical automáticamente: el marcador queda a la izquierda y cada etiqueta conserva todo su ancho. No hay truncado ni scroll horizontal.",
    "stepsPage.verticalTitle": "Opción: vertical en cualquier tamaño",
    "stepsPage.verticalBody":
      '<code>data-orientation="vertical"</code> pide el mismo riel a cualquier ancho de viewport, no solo en móvil: el caso de uso es un wizard con contenido a la derecha, donde el paso a paso es la navegación de una barra lateral fija en vez de un fallback de espacio angosto. La marca <code>data-orientation="horizontal"</code> hace el inverso: fuerza el recorrido horizontal incluso por debajo de <code>40rem</code>.',
    "stepsPage.verticalLabel": "Steps vertical",
    "stepsPage.test1": "Deriva completo / actual / pendiente a partir del índice actual.",
    "stepsPage.test2": "Un paso puede anular su estado explícitamente.",
  },
  en: {
    "demo.steps.brand.label": "Choose brand",
    "demo.steps.brand.description": "Your chromatic intent",
    "demo.steps.ramps.label": "Adjust ramps",
    "demo.steps.ramps.description": "Define light and shadow",
    "demo.steps.contrast.label": "Audit contrast",
    "demo.steps.contrast.description": "Test each colour pair",
    "demo.steps.export.label": "Export",
    "demo.steps.export.description": "Publish the contract",
    "demo.steps.account.label": "Account",
    "demo.steps.account.description": "Sign-in details",
    "demo.steps.shipping.label": "Shipping",
    "demo.steps.shipping.description": "Delivery address",
    "demo.steps.payment.label": "Payment",
    "demo.steps.payment.description": "Method and billing",

    "stepsPage.description": "Steps: a linear progress indicator with complete / current / upcoming states.",
    "stepsPage.lede":
      "Steps shows progress across an ordered sequence. Every step reports one of three states: <code>complete</code>, <code>current</code>, <code>upcoming</code>: the component displays the sequence; it does not govern which one is active or keep navigation between steps.",
    "stepsPage.anatomyBody":
      "This diagram names the trail, the item, the marker, the label, and the description. The specimen is frozen; the live Steps start below.",
    "stepsPage.anatomyLabel": "Steps anatomy",
    "stepsPage.anatomyPreviewLabel": "Steps, part by part",
    "stepsPage.body": "In React, <code>current</code> derives the state of steps that declare none of their own; a step can override it with <code>status</code>. <code>description</code> adds context without turning the step into a card.",
    "stepsPage.mobileTitle": "On mobile",
    "stepsPage.mobileBody":
      "When the viewport falls below <code>40rem</code>, the trail automatically becomes a vertical rail: the marker sits on the left, and every label keeps its full width. There is no truncation or horizontal scroll.",
    "stepsPage.verticalTitle": "Option: vertical at any size",
    "stepsPage.verticalBody":
      '<code>data-orientation="vertical"</code> asks for the same rail at any viewport width, not only on mobile: the use case is a wizard with content on the right, where the step-by-step is a fixed sidebar\'s navigation rather than a narrow-space fallback. <code>data-orientation="horizontal"</code> does the reverse: it forces the horizontal trail even below <code>40rem</code>.',
    "stepsPage.verticalLabel": "Vertical Steps",
    "stepsPage.test1": "Derives complete / current / upcoming from the current index.",
    "stepsPage.test2": "Lets a step override its status explicitly.",
  },
} as const;
