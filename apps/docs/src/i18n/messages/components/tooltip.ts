export const tooltipMessages = {
  es: {
    "demo.tooltip.export.label": "Exportar",
    "demo.tooltip.export.content": "Descarga el periodo visible en CSV",
    "demo.tooltip.metric.value": "Ingresos $48.2k",
    "demo.tooltip.metric.label": "Cómo se calcula Ingresos",
    "demo.tooltip.metric.content": "Suma facturada del periodo, sin impuestos ni reembolsos",
    "demo.tooltip.truncated.content": "Migración del pipeline de facturación",

    "tooltipPage.description": "Tooltip: una descripción auxiliar anclada al trigger, con aria-describedby, Escape y CSS anchor positioning.",
    "tooltipPage.lede":
      "Tooltip es una <strong>descripción auxiliar</strong>, nunca el nombre de un control ni el único lugar donde vive un dato. La máquina cuelga <code>aria-describedby</code> del trigger mientras está abierto, no <code>aria-labelledby</code>: el control ya tiene que tener nombre accesible por su cuenta, y el tooltip lo amplía.",
    "tooltipPage.ruleTitle": "La regla que no puede verificar el sistema",
    "tooltipPage.ruleBody1":
      "Hay dos situaciones sin arreglo posible dentro del componente. En <strong>touch</strong> no hay hover: la máquina abre en <code>pointerenter</code> y en <code>focus</code>, así que en un teléfono el tooltip prácticamente no aparece. <strong>Sin JavaScript</strong> el contenido se pinta oculto y solo la máquina lo abre, así que tampoco aparece.",
    "tooltipPage.ruleBody2":
      "En los dos casos no se pierde información <em>porque</em> el contrato prohíbe que haya información ahí que no esté en otro lado. Un tooltip que es la única fuente de algo es un bug de quien lo usa, y el validador no lo puede detectar: por eso está escrito acá y en el contrato de <code>@skryensya/core/tooltip</code>.",
    "tooltipPage.wcagTitle": "WCAG 1.4.13",
    "tooltipPage.wcagBody1":
      "El criterio <em>Content on Hover or Focus</em> pide tres cosas, y las tres se cumplen por defecto. <strong>Descartable</strong>: <kbd class=\"sk-kbd\">Esc</kbd> cierra sin mover el puntero ni el foco. <strong>Persistente</strong>: no se cierra sola por un temporizador. <strong>Hoverable</strong>: el puntero puede llegar hasta el tooltip sin que desaparezca.",
    "tooltipPage.wcagBody2":
      'Ese último es la opción <code>interactive</code> de la máquina, y viene <strong>encendida</strong>. Con ella apagada el contenido recibe <code>pointer-events: none</code>, el puntero nunca lo alcanza y el tooltip se cierra en el camino: eso falla el criterio. La tentación es apagarla razonando que un tooltip descriptivo no tiene nada que clickear, y es un error de lectura: <em>hoverable</em> no existe para poder operar el tooltip, existe para poder <strong>leerlo</strong>, que es justo lo que necesita alguien con magnificación de pantalla o con temblor. Se puede apagar con <code>data-interactive="false"</code>, y apagarlo es salirse del criterio a sabiendas.',
    "tooltipPage.placementTitle": "Colocación",
    "tooltipPage.placementBody":
      "<code>data-sk-placement</code> acepta cuatro valores en ejes lógicos: <code>block-start</code> (el defecto), <code>block-end</code>, <code>inline-start</code> y <code>inline-end</code>. Son una <em>preferencia</em>, no una garantía: si no entra, voltea al lado opuesto del mismo eje, porque quien pide <code>inline-end</code> quiere el tooltip al costado y caer arriba sería desobedecer, no adaptarse.",
    "tooltipPage.positioningTitle": "Posicionamiento",
    "tooltipPage.positioningBody1":
      'Donde hay <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning" rel="noopener noreferrer" target="_blank">CSS anchor positioning</a>, el navegador coloca el tooltip: sin bucle de layout y sin medir en cada scroll. El enhancer estampa un <code>anchor-name</code> único y deja de pasarle a Zag los estilos inline, para que no haya dos motores de posicionamiento peleando. Los navegadores sin la API se quedan con el posicionamiento JS de Zag, que es el fallback, no un camino inferior.',
    "tooltipPage.positioningBody2":
      'La <strong>flecha</strong> sigue el mismo reparto: sale del <em>trigger</em> y no del centro de la caja, así que sigue apuntando al control aunque la caja se haya corrido para no salirse de pantalla, y voltea junto con ella. Vive adentro del positioner y aun así se ancla al trigger, porque es <code>fixed</code>: un fijo lo contiene el viewport, no su padre. En el fallback la coloca la máquina. Está contado en <a href="/anchoring">Anclaje</a>.',
    "tooltipPage.test1": "Describe el trigger en vez de nombrarlo.",
    "tooltipPage.test2": "Se mantiene cerrado mientras está deshabilitado.",
  },
  en: {
    "demo.tooltip.export.label": "Export",
    "demo.tooltip.export.content": "Download the visible period as CSV",
    "demo.tooltip.metric.value": "Revenue $48.2k",
    "demo.tooltip.metric.label": "How Revenue is calculated",
    "demo.tooltip.metric.content": "Amount invoiced for the period, before tax and refunds",
    "demo.tooltip.truncated.content": "Billing pipeline migration",

    "tooltipPage.description": "Tooltip: an auxiliary description anchored to the trigger, with aria-describedby, Escape, and CSS anchor positioning.",
    "tooltipPage.lede":
      "Tooltip is an <strong>auxiliary description</strong>, never a control's name and never the only place a piece of data lives. The machine hangs <code>aria-describedby</code> off the trigger while it is open, not <code>aria-labelledby</code>: the control already has to have its own accessible name, and the tooltip expands on it.",
    "tooltipPage.ruleTitle": "The rule the system cannot verify",
    "tooltipPage.ruleBody1":
      "There are two situations with no fix possible inside the component. On <strong>touch</strong> there is no hover: the machine opens on <code>pointerenter</code> and on <code>focus</code>, so on a phone the tooltip practically never appears. <strong>With no JavaScript</strong>, the content paints hidden and only the machine opens it, so it does not appear either.",
    "tooltipPage.ruleBody2":
      "In both cases no information is lost <em>because</em> the contract forbids there being information there that lives nowhere else. A tooltip that is the sole source of something is a bug on the consumer's side, and the validator cannot catch it: that is why it is written here and in <code>@skryensya/core/tooltip</code>'s own contract.",
    "tooltipPage.wcagTitle": "WCAG 1.4.13",
    "tooltipPage.wcagBody1":
      "The <em>Content on Hover or Focus</em> criterion asks for three things, and all three hold by default. <strong>Dismissible</strong>: <kbd class=\"sk-kbd\">Esc</kbd> closes without moving the pointer or focus. <strong>Persistent</strong>: it never closes itself on a timer. <strong>Hoverable</strong>: the pointer can reach the tooltip without it disappearing.",
    "tooltipPage.wcagBody2":
      'That last one is the machine\'s <code>interactive</code> option, and it ships <strong>on</strong>. With it off, the content gets <code>pointer-events: none</code>, the pointer never reaches it, and the tooltip closes along the way: that fails the criterion. The temptation is to turn it off, reasoning that a descriptive tooltip has nothing to click, and that is a misreading: <em>hoverable</em> does not exist so the tooltip can be operated, it exists so it can be <strong>read</strong>, which is exactly what someone using screen magnification or with a tremor needs. It can be turned off with <code>data-interactive="false"</code>, and turning it off means knowingly stepping outside the criterion.',
    "tooltipPage.placementTitle": "Placement",
    "tooltipPage.placementBody":
      "<code>data-sk-placement</code> accepts four values on logical axes: <code>block-start</code> (the default), <code>block-end</code>, <code>inline-start</code>, and <code>inline-end</code>. They are a <em>preference</em>, not a guarantee: if it does not fit, it flips to the opposite side of the same axis, because whoever asked for <code>inline-end</code> wants the tooltip to the side, and landing above would be disobeying, not adapting.",
    "tooltipPage.positioningTitle": "Positioning",
    "tooltipPage.positioningBody1":
      "Where <a href=\"https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning\" rel=\"noopener noreferrer\" target=\"_blank\">CSS anchor positioning</a> exists, the browser places the tooltip: no layout loop, no measuring on every scroll. The enhancer stamps a unique <code>anchor-name</code> and stops handing Zag inline styles, so there are never two positioning engines fighting each other. Browsers without the API fall back to Zag's JS positioning, which is the fallback, not a lesser path.",
    "tooltipPage.positioningBody2":
      "The <strong>arrow</strong> follows the same split: it comes off the <em>trigger</em>, not the box's center, so it keeps pointing at the control even after the box has shifted to stay on screen, and it flips right along with it. It lives inside the positioner and still anchors to the trigger, because it is <code>fixed</code>: a fixed element is contained by the viewport, not its parent. In the fallback, the machine places it. It is covered in <a href=\"/en/anchoring\">Anchoring</a>.",
    "tooltipPage.test1": "Describes the trigger rather than naming it.",
    "tooltipPage.test2": "Stays closed while disabled.",
  },
} as const;
