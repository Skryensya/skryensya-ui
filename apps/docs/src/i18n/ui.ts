/*
 * EVERY TRANSLATABLE STRING IN THE SITE CHROME, in one place.
 *
 * Two dictionaries, because they are keyed by different things and drift for different reasons:
 *
 *   - `ui`      keyed by a dotted STRING KEY. The chrome's own copy: buttons, aria-labels, the
 *               command palette, the footer.
 *   - `navLabel` keyed by the item's SPANISH HREF, which is the stable identity of a page in
 *               `lib/navigation.ts`. Only pages whose label is actually a Spanish word appear here:
 *               a component's name ("Avatar", "Button", "SegmentedControl") is a proper noun and is
 *               the same string in both languages, so it falls through untranslated by DEFAULT
 *               rather than by 60 hand-copied identity entries that could rot.
 *
 * The Spanish dictionary is the source: `es` is the default locale, and every key here already
 * existed as a literal in a component. Adding a locale means adding a column, never touching the
 * markup again.
 */

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = "es" satisfies Locale;

/** What the language switcher shows. Endonyms: a reader looking for English scans for "English". */
export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export const ui = {
  es: {
    "nav.openMenu": "Abrir navegación",
    "nav.global": "Navegación global",
    "nav.drawer": "Navegación",
    "nav.closeDrawer": "Cerrar navegación",
    "nav.between": "Navegación entre documentos",
    "nav.notWritten": "Todavía no escrita",
    "nav.docs": "Docs",
    "nav.customize": "Personalizar",
    "nav.resizeRail": "Cambiar el ancho de la navegación",
    /* Los dos primeros enlaces del documento, invisibles hasta que reciben el foco. Nombran el
       DESTINO y no la acción, porque son lo primero que se escucha al entrar y "saltar" no dice
       adónde. El contenido va primero: es lo que casi todo el mundo vino a leer. */
    "nav.skipToContent": "Ir al contenido",
    "nav.playground": "Playground",
    "playground.title": "Playground",
    "playground.description":
      "Editá y ejecutá los ejemplos de cada componente, en React y en Vanilla, sin instalar nada.",
    "playground.components": "Componentes",
    "playground.binding": "Binding",
    "playground.loading": "Cargando el kit…",
    "playground.failed":
      "No se pudo cargar el kit. Recargá la página; si sigue, revisá que exista public/sandbox (pnpm run sandbox).",
    "playground.offline":
      "El sandbox no puede alcanzar codesandbox.io, que es donde compila y corre el código. Suele ser una VPN, un proxy o un bloqueador de contenido; el resto del sitio no lo necesita.",
    "playground.docsLink": "Ver la documentación",
    "playground.hideRail": "Ocultar la lista de componentes",
    "playground.showRail": "Mostrar la lista de componentes",
    "playground.resizeRail": "Cambiar el ancho de la lista",
    "playground.discardTitle": "¿Descartar los cambios?",
    "playground.discardBody": "Hay ediciones sin guardar en este ejemplo. Cambiar de ejemplo las descarta.",
    "playground.discardCancel": "Seguir editando",
    "playground.discardConfirm": "Descartar",
    "nav.skipToNav": "Ir a la navegación",

    "status.wip": "En progreso",
    "status.ariaReviewed": "Revisado contra WAI-ARIA APG",

    "search.label": "Buscar",
    "search.dialog": "Buscar en la documentación",
    "search.placeholder": "Buscar componentes y páginas…",
    "search.results": "Resultados",
    "search.empty": "Sin resultados.",
    "search.hintNavigate": "navegar",
    "search.hintOpen": "abrir",
    "search.hintClose": "cerrar",
    "search.exploreComponents": "Explorar componentes",
    "search.layoutGuide": "Guía de layout y lectura",

    "action.close": "Cerrar",

    "prefs.palette": "Paleta de color",
    "prefs.paletteNamed": "Paleta: {name}",
    /* Alcance del acento. El nombre del grupo dice de QUÉ eje se elige; cada opción nombra lo que
     * ese nivel deja de color, no su número: "2" no significa nada sin la tabla de /acento al lado. */
    "prefs.accent": "Alcance del acento",
    "prefs.accent3.short": "Todo",
    "prefs.accent2.short": "Enlaces",
    "prefs.accent1.short": "Acción",
    "prefs.accent1": "Alcance del acento: solo la acción",
    "prefs.accent2": "Alcance del acento: acción y enlaces",
    "prefs.accent3": "Alcance del acento: todo",
    "prefs.contrastNormal": "Contraste: normal",
    "prefs.contrastHigh": "Contraste: alto",
    "prefs.language": "Idioma",
    "prefs.modeSystem": "Modo: sistema",
    "prefs.modeLight": "Modo: claro",
    "prefs.modeDark": "Modo: oscuro",

    "toc.title": "En esta página",

    "code.condensed": "Condensado",
    "code.full": "Completo",
    "code.showFull": "Mostrar código completo",
    /* Expandir/contraer, no "mostrar más/menos": colapsado ya muestra todo el código, con scroll
     * dentro de su ventana. Lo que cambia el botón es cuánto espacio ocupa el bloque en la página,
     * no cuánto se puede leer. */
    "code.expand": "Expandir",
    "code.expandTo": "Expandir el bloque a sus {count} líneas",
    "code.collapse": "Contraer",
    "code.collapseTo": "Contraer el bloque a {count} líneas",
    "code.lines": "{count} líneas",
    "code.region": "Bloque de código, {label}",
    "code.regionPlain": "Bloque de código",

    "copy.code": "Copiar código",
    "copy.copied": "Copiado",
    "copy.error": "Error al copiar",
    "copy.codeCopied": "Código copiado",
    "copy.failed": "No se pudo copiar el código",
    "copy.action": "Copiar",

    "preview.reloadAction": "Recargar",
    "preview.openInPlayground": "Ver en Playground",
    "preview.moreActions": "Más acciones: {name}",
    "preview.screenToggleLabel": "Tamaño de pantalla ({name}): {hint}",
    "preview.bindingGroup": "Vínculo del código: {name}",
    "preview.screenGroup": "Tamaño de pantalla: {name}",
    "preview.screenFree": "Ancho libre",
    "preview.screenFreeHint":
      "Ancho libre · el preview ocupa la columna entera y crece hasta el alto de su contenido",
    "preview.screenTablet": "Tablet",
    "preview.screenTabletHint":
      "Tablet · 768 × 1024 px, la franja donde los layouts de dos columnas empiezan a ceder",
    "preview.screenMobile": "Móvil",
    "preview.screenMobileHint":
      "Móvil · 390 × 844 px, el ancho donde todo termina apilado",
    "preview.reactSource": "Fuente React",
    "preview.sourceComponent": "Componente",

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
    "demo.pagination.label": "Paginación",
    "demo.pagination.previous": "Página anterior",
    "demo.pagination.next": "Página siguiente",
    "demo.box.title": "Resumen",
    "demo.box.body": "Una sección semántica con superficie, borde y padding.",
    "demo.box.action": "Administrar",

    "box.description": "Superficie visual y semántica elegida por quien la usa; sin interacción propia.",
    "box.lede":
      "Box sólo posee superficie, borde y padding. Quien lo usa elige el elemento semántico. No aporta interacción ni convierte el contenido en un destino o acción.",
    "box.whenTitle": "Cuándo usarlo",
    "box.whenBody1":
      'Usa Box para contenido estático o para una superficie con varios controles independientes. Si toda la superficie representa exactamente una interacción, elige el componente semántico correspondiente: <a href="/componentes/link">Link</a>, <a href="/componentes/button">Button</a>, <a href="/componentes/checkbox">Checkbox</a>, <a href="/componentes/radio-group">RadioGroup</a> o <a href="/componentes/accordion">Accordion</a>.',
    "box.whenBody2":
      'Box y Tile comparten superficie, borde, radio y el vocabulario de <code>padding</code>. Usa <code>data-padding="none"</code> en HTML o <code>padding="none"</code> en React cuando el header o la imagen del contenido deban tocar el borde; ese hijo es quien declara su propio inset. La diferencia entre ambos es exclusivamente la interacción que Tile sí posee.',
    "box.whenBody3":
      'La guía <a href="/componentes/card">Card</a> aplica esta decisión a cards de contenido, noticia, producto, enlace, acción, selección y métricas.',
    "box.htmlTitle": "HTML autorado",
    "box.contractItem1": 'En HTML, elige el elemento semántico y añade la clase <code>sk-box</code>.',
    "box.contractItem2":
      '<code>data-surface</code> acepta <code>none</code>, <code>sunken</code>, <code>surface</code> o <code>raised</code>.',
    "box.contractItem3": '<code>data-border</code> acepta <code>none</code>, <code>subtle</code> o <code>default</code>.',
    "box.contractItem4":
      '<code>data-padding</code> acepta <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>.',
    "box.contractItem5": 'En React, <code>as</code> selecciona el elemento; <code>surface</code>, <code>border</code> y <code>padding</code> renderizan esos atributos.',
    "box.test1": "Conserva la propiedad semántica del elemento que le da el consumidor al aplicar los valores por defecto de Box.",

    "demo.wrapper.title": "Columna",
    "demo.wrapper.body": "El contenido se centra y deja de crecer al llegar al techo.",
    "demo.stack.title": "Resumen",
    "demo.stack.body": "La solicitud está lista para revisar.",
    "demo.stack.action": "Ver detalles",
    "demo.inline.title": "Proyecto Atlas",
    "demo.inline.status": "3 cambios sin publicar",
    "demo.inline.preview": "Vista previa",
    "demo.inline.publish": "Publicar",
    "demo.primitives.title": "Resumen",
    "demo.primitives.body": "Un bloque con espaciado, superficie y jerarquía.",
    "demo.primitives.action": "Ver detalles",
    "demo.primitives.updated": "Actualizado hoy",
    "demo.primitives.cell.first": "Uno",
    "demo.primitives.cell.second": "Dos",
    "demo.primitives.cell.third": "Tres",
    "demo.input.hint": "Te escribimos acá si algo sale mal.",
    "demo.input.notesLabel": "Notas",
    "demo.input.notesHint": "Contanos qué te pasó, con el detalle que puedas.",
    "demo.input.notesPlaceholder": "Escribí acá",
    "demo.formField.hint": "Sólo la usamos para las boletas.",
    "demo.formField.error": "Ingresa una dirección laboral.",
    "demo.formField.planHint": "Lo vas a poder cambiar después.",
    "demo.breadcrumb.label": "Migas de pan",
    "demo.breadcrumb.home": "Inicio",
    "demo.breadcrumb.projects": "Proyectos",
    "demo.breadcrumb.settings": "Configuración",
    "demo.breadcrumb.longAncestor":
      "Migración del layer vanilla a componentes Svelte",
    "demo.breadcrumb.longCurrent":
      "Máquinas Zag compartidas entre el layer vanilla y los componentes Svelte",

    "breadcrumb.description": "Ubicación jerárquica con enlaces reales y página actual explícita.",
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
    "breadcrumb.contractBody": "Usa nav + ol; el último elemento lleva aria-current=page y no es un enlace.",
    "breadcrumb.a11yBody": "El label distingue estas migas de otras navegaciones de la página.",

    "demo.callout.neutral.title": "Mantenimiento programado",
    "demo.callout.neutral.body":
      "El domingo de 02:00 a 04:00 UTC el panel estará en solo lectura.",
    "demo.callout.info.title": "Nueva versión",
    "demo.callout.info.body": "Una actualización está disponible.",
    "demo.callout.warning.title": "Tu plan expira en 3 días",
    "demo.callout.warning.body":
      "Elige un plan para no interrumpir los despliegues.",
    "demo.callout.warning.action": "Ver planes",
    "demo.callout.success.body": "Tus cambios se guardaron.",
    "demo.callout.success.action": "Ver detalle",

    "callout.description":
      "Callout: mensaje inline persistente con tono (incluido neutral), anuncio accesible y componente React.",
    "callout.lede1":
      "Callout es un mensaje inline que permanece en el layout mientras dure su condición. A diferencia de Toast, transitorio y montado en una región flotante, Callout vive en el flujo del contenido. Un solo peso visual, el panel con borde: el tono es la única variable, así que dos Callouts nunca compiten por cuál se ve más urgente.",
    "callout.lede2":
      "Es puramente informativo: muestra algo, no ejecuta nada. No tiene cierre; a diferencia de Toast, Callout no se puede descartar, porque nada en la página depende de que desaparezca. La única pieza interactiva que puede llevar es una acción de recuperación, y el contrato la limita a <code>translucent</code> o <code>danger</code> para que nunca compita con la acción primaria real de la página.",
    "callout.tonesTitle": "Tonos",
    "callout.tonesBody1":
      'El tono decide si el panel se pinta con color semántico. <code>info</code>, <code>success</code>, <code>warning</code> y <code>danger</code> colorean el mensaje. Solo <code>danger</code> se anuncia como <code>role="alert"</code> (assertive); el resto usa <code>role="status"</code> (polite); es la minoría de casos que de verdad interrumpe, no el nombre del componente, el que decide eso.',
    "callout.tonesBody2":
      "Los cuatro leen un <strong>rol de feedback</strong>, nunca el acento: el tono dice qué pasó, así que no puede cambiar cuando cambia la marca. <code>info</code> tuvo su propia rampa recién en la decisión 26 (<code>docs/decisiones/0026-info-es-un-rol-de-feedback-no-el-acento.md</code>); antes leía <code>accent</code>, y una marca magenta pintaba de magenta cada aviso informativo.",
    "callout.neutralTitle": "Neutral",
    "callout.neutralBody":
      "El default: superficie y borde, sin pintura semántica. Existe para cuando el color no debería ser la señal prominente, el texto ya carga el mensaje. Úsalo en avisos ordinarios, confirmaciones breves o cualquier caso donde pintar el panel de “éxito” o “info” añadiría urgencia que el contenido no tiene.",
    "callout.neutralLabel": "Callout neutral",
    "callout.infoTitle": "Info, con título",
    "callout.infoBody": "Un título junto al icono nombra la condición en vez de solo describirla en la primera línea.",
    "callout.infoLabel": "Callout info",
    "callout.warningTitle": "Warning, con un Link de recuperación",
    "callout.warningBody": "La acción de recuperación es un <code>Link</code> simple: un destino, no un comando.",
    "callout.warningLabel": "Callout warning",
    "callout.successTitle": "Success, con un Button translucent",
    "callout.successBody":
      'Cuando la acción es un <a href="/componentes/button">Button</a>, el slot solo acepta <code>variant="translucent"</code> o <code>variant="danger"</code>; nunca <code>primary</code> ni el default <code>neutral</code>: un Callout no es el lugar de la llamada a la acción principal de la página. Usa <code>translucent</code> para botones que se mezclan con el fondo coloreado del callout, y <code>danger</code> cuando necesites una acción destructiva que destaque visualmente.',
    "callout.successLabel": "Callout success",
    "callout.anatomyTitle": "Anatomía",
    "callout.anatomyItem1": "<code>sk-callout__icon</code> es decorativo y solo aparece cuando aporta una señal visual.",
    "callout.anatomyItem2": "<code>sk-callout__content</code> agrupa título opcional y descripción.",
    "callout.anatomyItem3":
      "<code>sk-callout__actions</code> aloja la acción de recuperación opcional que pertenece al consumidor; nunca un cierre: Callout no tiene ninguno.",
    "callout.anatomyItem4":
      "<code>data-tone</code> acepta <code>neutral</code> (default), <code>info</code>, <code>success</code>, <code>warning</code> o <code>danger</code>.",
    "callout.reactBody":
      'El código está en la pestaña <strong>React</strong> de cada ejemplo. <code>actions</code> es el único punto de interactividad: un <code>ReactNode</code> que el consumidor arma con el <code>Link</code> o el <code>Button</code> (<code>translucent</code>/<code>danger</code>) que necesite. No hay <code>dismissible</code> ni <code>onDismiss</code>; si necesitas que el mensaje se pueda cerrar, es un <a href="/componentes/toast">Toast</a>, no un Callout.',
    "callout.test1": "El tono danger se anuncia asertivo (<code>role=\"alert\"</code>); los demás, con cortesía.",
    "callout.test2": "Nunca renderiza un control para cerrarlo: no es dismissible.",
    "callout.test3": "El icono y las acciones opcionales se renderizan como partes explícitas.",

    "demo.slider.volume": "Volumen",
    "demo.slider.brightness": "Brillo",
    "demo.slider.priceMin": "Precio mínimo",
    "demo.slider.priceMax": "Precio máximo",
    "demo.select.label": "Plan",
    "demo.calendar.locale": "es-DO",
    "demo.calendar.availability": "Disponibilidad",
    "demo.calendar.stay": "Estadía",

    "calendar.description":
      "Grid de fecha independiente: día, mes o año/década, sin campo ni popover, con el mismo botón cambiando de vista.",
    "calendar.lede":
      'El grid de fecha en sí, separado del campo que lo abre. <a href="/componentes/date-picker">DatePicker</a> lo nestea dentro de un popover; esta página es el mismo componente de pie, para cuando el calendario <em>es</em> la UI (una página de reservas, un filtro de dashboard) y no hace falta un input detrás.',
    "calendar.gridTitle": "Grid",
    "calendar.gridBody":
      "Detrás sigue corriendo <code>@zag-js/date-picker</code> (no hay una máquina de calendario separada en este stack), configurada <code>inline</code>: la misma navegación por teclado, el mismo grid con seis semanas fijas.",
    "calendar.gridLabel": "Calendar",
    "calendar.viewTitle": "Cambiar de vista: botones, no selects",
    "calendar.viewBody1":
      'El encabezado no tiene dos <code>&lt;select&gt;</code> de mes y año: es un solo botón, <code>sk-calendar__view-trigger</code>, que muestra la fecha visible («marzo 2026» en vista de día, «2026» en vista de mes, «2020–2029» en vista de año) y al hacer clic <strong>escala</strong> un nivel (día → mes → año) en vez de forzar a desplazarse mes por mes hasta una fecha lejana.',
    "calendar.viewBody2":
      'Elegir un mes o un año en su grilla <strong>desciende</strong> un nivel: tocar «Ene» en la vista de mes vuelve a la vista de día ya parada en enero; tocar un año en la vista de año vuelve a la vista de mes de ese año. Ir y volver (escalar para elegir la década, descender tocando la celda) reemplaza lo que antes hacían dos selects nativos, sin perder la navegación por teclado del grid (roles <code>grid</code>/<code>gridcell</code>, foco administrado por Zag).',
    "calendar.rangeTitle": "Selección en rango",
    "calendar.rangeBody1":
      '<code>data-selection-mode="range"</code> cambia el criterio de selección: el primer clic fija el inicio, el segundo el fin. Zag marca cada día intermedio <code>data-in-range</code> (no <code>data-selected</code>, que queda solo para los dos extremos) y, mientras se está eligiendo el fin, el mismo estado aparece como <code>data-in-hover-range</code> a medida que el mouse se mueve, sin JS propio: el <code>onPointerMove</code> que lo alimenta solo se activa cuando el modo es <code>range</code>.',
    "calendar.rangeBody2":
      "Ese atributo vive en el <em>trigger</em>, no en la celda, así que un relleno limitado a su propio botón dejaría un espacio entre cada día. <code>sk-calendar__cell:has(...)</code> alcanza el estado del trigger desde la celda (la misma técnica que ya usa el anillo de foco de Combobox) para pintar la celda completa y que la franja se vea continua bajo <code>border-collapse</code>.",
    "calendar.rangeLabel": "Calendar (rango)",
    "calendar.minMaxTitle": "Rango acotado: min y max",
    "calendar.minMaxBody1":
      "<code>data-min</code> / <code>data-max</code> (fechas ISO) deshabilitan todo lo que caiga fuera del rango. En vista de día, Zag ya marca esas celdas <code>data-disabled</code>/<code>aria-disabled</code> y el propio <code>onClick</code> del día se niega a disparar la selección.",
    "calendar.minMaxBody2":
      "Min/max llega igual a mes y año: <code>getMonthsGrid</code>/<code>getYearsGrid</code> resuelven su propio <code>disabled</code> nativo por celda, comparando contra min/max la fecha enfocada <em>llevada a ese mes o año</em> (no «¿tiene este mes algún día válido?»: un matiz que puede deshabilitar un mes que sí toca el rango si el día enfocado, trasladado a ese mes, cae fuera). Ninguna de las dos vistas necesitó CSS nuevo: ambas ya pasan por <code>.sk-button:disabled</code>.",
    "calendar.minMaxLabel": "Calendar (min/max)",
    "calendar.contractItem1":
      '<code>sk-calendar__header</code> agrupa anterior, el botón de vista y siguiente; los tres leen "anterior/siguiente <em>de la vista activa</em>" (mes en vista de día, año en vista de mes, década en vista de año), Zag ajusta la etiqueta accesible sola.',
    "calendar.contractItem2":
      "<code>sk-calendar__table</code> se reusa en las tres vistas; <code>sk-calendar__month-grid</code> y <code>sk-calendar__year-grid</code> son hooks de modificador sobre la misma tabla, no marcado distinto.",
    "calendar.contractItem3":
      "<code>sk-calendar__cell-trigger</code> es el mismo botón de celda en día, mes y año: mismo tamaño, mismo estado de selección/hoy/deshabilitado.",
    "calendar.a11yBody":
      "El grid es <code>role=\"grid\"</code> navegable por teclado en las tres vistas. El locale determina meses y las abreviaturas de dos letras visibles en el grid de día; el nombre completo localizado permanece en cada <code>&lt;abbr&gt;</code>.",
    "calendar.test1": "Genera todo el grid desde una raíz autorada vacía, una sola vez.",
    "calendar.test2": "Nombra los días de la semana en el locale autorado.",
    "calendar.test3": "Abre en la fecha autorada en vez de en hoy.",

    "demo.datePicker.locale": "es-DO",
    "demo.datePicker.label": "Reserva",
    "demo.datePicker.placeholder": "dd/mm/aaaa",
    "demo.datePicker.clear": "Limpiar fecha",
    "demo.combobox.label": "País",
    "demo.combobox.placeholder": "Buscar país",
    "demo.combobox.hint": "Escribí para filtrar la lista",
    "demo.copyButton.label": "Copiar código",
    "demo.copyButton.idle": "Copiar",
    "demo.popover.trigger": "Ver perfil",
    "demo.popover.description": "Matemática y escritora.",
    "demo.popover.body": "Escribió el primer algoritmo pensado para una máquina.",
    "demo.popover.close": "Cerrar",
    "demo.popup.trigger": "Filtros",
    "demo.popup.onlyActive": "Solo activos",
    "demo.processList.label": "Instalar @skryensya",
    "demo.processList.install.title": "Instala la librería",
    "demo.processList.install.body": "Añade el núcleo y el binding de React al proyecto.",
    "demo.processList.import.title": "Importa ProcessList",
    "demo.processList.import.body": "Carga el CSS y después importa los componentes.",
    "demo.processList.render.title": "Renderiza las instrucciones",
    "demo.processList.render.body": "El contador conserva la numeración sin estado adicional.",
    "demo.processList.done": "Instalación lista",
    "demo.processList.docs": "Abrir documentación",
    /* Las fechas se escriben acá, no se formatean en el demo: el árbol tiene un `Translate` y no un
       locale, e `Intl` necesita el locale. Cada idioma escribe la fecha como la escribe ese idioma. */
    "demo.changelog.label": "Cambios de Accordion",
    /* Sin traducir, igual que en el changelog real. Ver la nota en `changelog.kind.*`. */
    "demo.changelog.kind.breaking": "breaking",
    "demo.changelog.kind.feature": "feature",
    "demo.changelog.kind.bugfix": "bugfix",
    "demo.changelog.kind.rework": "rework",
    /* Una sola fecha: la del release que sí salió. El otro no tiene, y ésa es justamente la forma
       en que el contrato dice que todavía no se publicó. */
    "demo.changelog.date": "29 de julio de 2026",
    /* Cada entrada es un titular y su explicación: lo primero es lo que se escanea, lo segundo lo que
       se lee cuando alguien se detuvo ahí. */
    "demo.changelog.breaking.title": "El evento cambió de nombre",
    "demo.changelog.breaking.body": "Pasó a llamarse sk:accordionvaluechange. El anterior ya no se emite.",
    "demo.changelog.bugfix.title": "La parte se busca sólo como hija directa",
    "demo.changelog.bugfix.body": "El enhancer la buscaba en cualquier descendiente, así que una sección anidada ataba su propio título como panel.",
    "demo.changelog.rework.title": "collapsible pasa a ser false por defecto",
    "demo.changelog.rework.body": "Es como se comportaba el acordeón de una sola sección desde siempre.",
    "demo.changelog.feature.title": "Primera publicación del contrato",
    "demo.changelog.feature.body": "Sale con sus tres firmas y las opciones que las componen.",
    "demo.changelog.chore.title": "El enhancer se publica con el resto del paquete",
    "demo.changelog.chore.body": "Antes salía como módulo aparte. Ni el markup ni las opciones se mueven.",
    "demo.accordion.detailsLabel": "Configuración de despliegue",
    "demo.dialog.open": "Borrar proyecto",
    "demo.dialog.title": "¿Borrar este proyecto?",
    "demo.dialog.body": "Se elimina el proyecto y todo su historial. Esta acción no se puede deshacer.",
    "demo.dialog.cancel": "Cancelar",
    "demo.dialog.confirm": "Borrar",
    "demo.dialogVaul.open": "Abrir dialog",
    "demo.dialogVaul.title": "Caja centrada, Vaul en móvil",
    "demo.dialogVaul.body": "Angosta la ventana debajo de 52rem y este mismo dialog gana un Vaul block-end. El markup del dialog no cambia.",
    "demo.dialogVaul.whatChanges": "Qué cambia",
    "demo.dialogVaul.edgeTitle": "Llega desde el borde",
    "demo.dialogVaul.edgeBody": "Slide block-end en vez de escala centrada.",
    "demo.dialogVaul.dragTitle": "Se arrastra para cerrar",
    "demo.dialogVaul.dragBody": "Con handle, y sólo abajo del breakpoint.",
    "demo.dialogVaul.sameTitle": "Sigue siendo el dialog",
    "demo.dialogVaul.sameBody": "Foco, Escape y página inerte son de la plataforma.",
    "demo.dialogVaul.later": "Ahora no",
    "demo.dialogVaul.understood": "Entendido",

    /*
     * The Dialog page, migrated onto `ComponentPageShell` as the second proof of the shape
     * `AccordionPage` piloted: `dialog.*` for the exact same reason `accordion.*` exists above.
     */
    "dialog.description":
      "El dialog centrado de la plataforma. Opcional: Dialog Vaul cuando el contenido pide una superficie desde el borde en móvil.",
    "dialog.lede":
      'Un <code>&lt;dialog class="sk-dialog"&gt;</code> centrado. <code>showModal()</code> entrega foco, Escape, página inerte y backdrop; el sistema pinta la superficie. Sin enhancer: el único JavaScript es abrir.',
    "dialog.confirmTitle": "Confirm",
    "dialog.confirmJsComment": "Opcional: leer qué botón cerró el form.",
    "dialog.confirmAnatomy":
      'Anatomía: <code>sk-dialog__header</code> (título con <code>Heading</code> + <code>sk-dialog__title</code>, y cierre), <code>sk-dialog__body</code> y <code>sk-dialog__footer</code> (controles). El cierre y el footer son <code>&lt;form method="dialog"&gt;</code>: cierran sin handler y dejan el <code>value</code> en <code>dialog.returnValue</code>.',
    "dialog.openingTitle": "Abrirlo",
    "dialog.contractTitle": "Contrato",
    "dialog.contractItem1":
      'Abre un <code>&lt;dialog class="sk-dialog"&gt;</code> con <code>showModal()</code>, no un <code>div</code> con roles imitadas.',
    "dialog.contractItem2":
      'Anatomía: <code>sk-dialog__header</code> (<code>sk-heading sk-dialog__title</code> + <code>sk-dialog__close</code>), <code>sk-dialog__body</code>, <code>sk-dialog__footer</code> (controles, opcional). El título es <a class="sk-link sk-interactive" href="/componentes/heading">Heading</a> (casi siempre con <code>data-flush</code>).',
    "dialog.contractItem3":
      'Asocia el título con <code>aria-labelledby</code> apuntando al <code>id</code> del Heading (o un nombre accesible equivalente).',
    "dialog.contractItem4":
      'Cierre y acciones usan <code>&lt;form method="dialog"&gt;</code>; <code>value</code> en cada botón si necesitas saber cuál se eligió.',
    "dialog.contractItem5":
      'No añadas un focus trap propio: <code>showModal()</code> ya contiene el foco y restaura al cerrar.',
    "dialog.contractItem6":
      'Importa <a class="sk-link sk-interactive" href="/scroll-lock">scroll lock</a> si quieres congelar la página detrás sin CLS al desaparecer la scrollbar.',
    "dialog.contractItem7":
      'Con <a class="sk-link sk-interactive" href="/transparencias"><code>prefers-reduced-transparency</code></a>, el backdrop deja la mezcla translúcida y pasa a un fondo opaco; la modalidad no cambia.',
    "dialog.vaulTitle": "Opción: Dialog Vaul",
    "dialog.vaulIntro":
      "Cuando el contenido pide una superficie desde el borde en móvil, el mismo <code>&lt;dialog&gt;</code> puede optar en <strong>Dialog Vaul</strong>: añade slide, light-dismiss y drag-to-dismiss. La modalidad (foco, Escape, inert) sigue siendo de <code>showModal()</code>.",
    "dialog.vaulAddsTitle": "Qué añade",
    "dialog.vaulAddsItem1":
      'Abre y cierra con triggers y closers autorados (<code>data-sk-dialog-vaul-open</code> / <code>-close</code>).',
    "dialog.vaulAddsItem2": "Por debajo de <code>52rem</code>, deja arrastrar el handle hacia <code>block-end</code>.",
    "dialog.vaulAddsItem3": "Light-dismiss al pulsar fuera del rectángulo del panel.",
    "dialog.vaulAddsItem4":
      '<code>data-sk-dialog-vaul</code> opta en la mejora; <code>data-edge="block-end"</code> nombra el borde. El handle es opcional.',
    "dialog.vaulInstallTitle": "Instalar Dialog Vaul",
    "dialog.a11yIntro":
      "Con <code>showModal()</code> la plataforma ya hace el trabajo. No reimplementes un focus trap en JavaScript (decisión 11 / técnica WCAG H102).",
    "dialog.a11yItem1":
      '<strong>Al abrir</strong> el foco entra al dialog. Sin <code>autofocus</code>, aterriza en el primer control enfocable. En un confirm destructivo pon <code>autofocus</code> en <strong>Cancelar</strong> (la opción segura), no en Borrar ni en el cierre.',
    "dialog.a11yItem2":
      '<strong>Orden en el DOM</strong>: el título va <em>antes</em> del botón de cerrar. Si el cierre fuera el primer nodo enfocable y el contenido largo, <code>showModal()</code> podría abrir el panel ya scrolleado hacia ese control.',
    "dialog.a11yItem3":
      '<strong>Tab / Shift+Tab</strong> ciclan entre controles del dialog. La página detrás queda <code>inert</code>: no recibe foco. Sí se puede llegar al chrome del navegador (barra de direcciones); eso es intencional, no un bug.',
    "dialog.a11yItem4":
      '<strong>Escape</strong> cierra el dialog (evento <code>cancel</code>) y restaura el foco al trigger. Equivale a descartar, no a confirmar: mismo <code>returnValue</code> vacío / cancel que el botón de cerrar con <code>value="cancel"</code>.',
    "dialog.a11yItem5":
      '<strong>Al cerrar</strong> el foco vuelve al elemento que abrió el dialog, si sigue en la página. No hace falta guardarlo a mano.',
    "dialog.a11yItem6":
      'El botón de cerrar es un <code>sk-button</code> con <code>data-icon-only</code> y <code>aria-label="Cerrar"</code>. El icono es decorativo (<code>&lt;span data-sk-icon="close"&gt;</code>); el nombre es del botón.',
    "dialog.borderTitle": "El borde siempre encendido no es estético",
    "dialog.borderBody":
      "En alto contraste el panel y la página resuelven al mismo color: suavizar <code>--sk-dialog-border-width</code> deja el dialog invisible sin que falle un solo test. Por eso llega en <code>1px</code> y no en <code>0</code>.",
    "dialog.test1": "Cierra a través del <code>&lt;form method=\"dialog\"&gt;</code> de la plataforma, no de un handler.",
    "dialog.test2": "Renderiza la anatomía contra la que la hoja de estilos escribe su contrato.",
    "dialog.test3": "Omite el form del pie cuando no hay nada que poner en él.",

    "demo.drawer.label": "Navegación",
    "demo.drawer.brand": "Estudio",
    "demo.drawer.close": "Cerrar",
    "demo.drawer.main": "Principal",
    "demo.drawer.work": "Trabajo",
    "demo.drawer.account": "Cuenta",
    "demo.drawer.summary": "Resumen",
    "demo.drawer.agenda": "Agenda",
    "demo.drawer.files": "Archivos",
    "demo.drawer.team": "Equipo",
    "demo.drawer.settings": "Ajustes",
    "demo.drawer.userName": "Ada Kovač",
    "demo.splitButton.primary": "Guardar",
    "demo.splitButton.menuLabel": "Más opciones",
    "demo.splitButton.copy": "Guardar una copia",
    "demo.splitButton.template": "Guardar como plantilla",
    "demo.accordion.environment.title": "Entorno",
    "demo.accordion.environment.description": "Producción · Fráncfort",
    "demo.accordion.environment.p1": "Node 22 corre en tres réplicas detrás del balanceador de Fráncfort. El tráfico se reparte por round-robin y una réplica se recicla sola si falla dos health checks seguidos.",
    "demo.accordion.environment.p2": "Los secretos se inyectan en el arranque desde el vault regional, así que ningún valor sensible queda en la imagen ni en el log de build.",
    "demo.accordion.runtime.title": "Runtime",
    "demo.accordion.runtime.description": "Versión y región",
    "demo.accordion.runtime.p1": "Node 22 sobre el pool compartido de Fráncfort. Cada despliegue reserva dos vCPU y 512 MB, con autoscaling hasta seis réplicas cuando la cola de peticiones supera el umbral.",
    "demo.accordion.runtime.p2a": "El healthcheck pega a ",
    "demo.accordion.runtime.p2code": "/status",
    "demo.accordion.runtime.p2b": " cada diez segundos; tres fallos seguidos sacan la réplica del balanceador sin cortar el tráfico en vuelo.",
    "demo.accordion.rollout.title": "Rollout",
    "demo.accordion.rollout.description": "Canary por porcentaje",
    "demo.accordion.rollout.p1": "El canary sube en tres tramos, 10%, 50% y 100%, y espera a que las métricas de error y latencia se mantengan estables antes de avanzar a cada tramo.",
    "demo.accordion.rollout.p2": "Si un tramo degrada, el rollout se detiene solo y avisa al canal de guardia: nada avanza sin luz verde.",
    "demo.accordion.rollback.title": "Rollback",
    "demo.accordion.rollback.description": "Versión estable anterior",
    "demo.accordion.rollback.p1": "Restaura v2.18.4 si el canary falla las comprobaciones.",
    "demo.menu.label": "Acciones del archivo",
    "demo.menu.trigger": "Acciones",
    "demo.menu.rename": "Renombrar",
    "demo.menu.favorite": "Favorito",
    "demo.menu.export": "Exportar",
    "demo.menu.multilevel.label": "Insertar contenido",
    "demo.menu.multilevel.trigger": "Insertar",
    "demo.menu.multilevel.heading": "Encabezado",
    "demo.menu.multilevel.media": "Medios",
    "demo.menu.multilevel.image": "Imagen",
    "demo.menu.multilevel.upload": "Subir archivo",
    "demo.menu.multilevel.fromUrl": "Desde una URL",
    "demo.menu.multilevel.video": "Video",
    "demo.menu.multilevel.table": "Tabla",
    "demo.menu.compact.label": "Formato de texto",
    "demo.menu.compact.trigger": "Formato",
    "demo.menu.compact.bold": "Negrita",
    "demo.menu.compact.italic": "Cursiva",
    "demo.menu.compact.underline": "Subrayado",
    "demo.menu.compact.strikethrough": "Tachado",
    "demo.menu.compact.alignLeft": "Alinear a la izquierda",
    "demo.menu.compact.alignCenter": "Alinear al centro",
    "demo.menu.compact.alignRight": "Alinear a la derecha",
    "demo.menu.context.label": "Acciones del elemento",
    "demo.menu.context.area": "Clic derecho (o mantén presionado) dentro de esta área",
    "demo.menu.context.copy": "Copiar",
    "demo.menu.context.paste": "Pegar",
    "demo.menu.context.delete": "Eliminar",
    "demo.menu.safety.trigger": "Archivo",
    "demo.menu.safety.new": "Nuevo",
    "demo.menu.safety.share": "Compartir",
    "demo.menu.safety.email": "Por correo",
    "demo.menu.safety.link": "Copiar enlace",
    "demo.menu.safety.delete": "Eliminar",
    "demo.radioGroup.label": "Plan",
    "demo.navList.label": "Principal",
    "demo.navList.group": "Espacio",
    "demo.navList.home": "Inicio",
    "demo.navList.reports": "Reportes",
    "demo.navList.collapsibleNavLabel": "Cuenta",
    "demo.navList.collapsibleLabel": "Grupo colapsable",
    "demo.navList.account": "Mi cuenta",
    "demo.navList.settings": "Ajustes",
    "demo.navList.billing": "Facturación",
    "demo.navbar.nav": "Principal",
    "demo.navbar.home": "Inicio",
    "demo.navbar.projects": "Proyectos",
    "demo.navbar.reports": "Reportes",
    "demo.navbar.team": "Equipo",
    "demo.navbar.invite": "Invitar",
    "demo.navbar.newProject": "Nuevo proyecto",
    "demo.imageFrame.alt": "Paisaje de demostración",
    "demo.imageFrame.aspectLabel": "Proporciones de ImageFrame",
    "demo.imageFrame.fitLabel": "Modos de object-fit",
    "demo.imageFrame.positionLabel": "Anclas de recorte",
    "demo.mediaGradient.title": "Horizonte costero",
    "demo.mediaGradient.caption": "Texto legible sobre la foto.",
    "demo.mediaGradient.body": "Cuerpo de la card debajo del media.",
    "demo.timeField.label": "Salida",
    "demo.heading.sample": "La plataforma está lista",
    "demo.heading.label.h4Floor": "h4 · 18 · piso (también h5 y h6)",
    "demo.heading.label.h5Same": "h5 · mismo que h4",
    "demo.heading.label.h6Same": "h6 · mismo que h4",
    "demo.heading.page.eyebrow": "OPERACIONES · MAYO 2026",
    "demo.heading.page.title":
      "La plataforma está lista para el próximo despliegue",
    "demo.heading.page.lede":
      "Un título de página comunica el resultado antes de que la persona lea los detalles.",
    "demo.heading.outline.title": "Estado del despliegue",
    "demo.heading.outline.ready": "Regiones listas",
    "demo.heading.outline.readyBody":
      "Frankfurt y São Paulo ya reciben tráfico.",
    "demo.heading.outline.next": "Siguiente verificación",
    "demo.heading.outline.nextBody":
      "Revisa la latencia después del cambio de tráfico.",
    "demo.heading.compact.title": "Uso del almacenamiento",
    "demo.heading.compact.body":
      "El nivel semántico sigue siendo h2 aunque el panel necesita el piso visual (h4).",
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
    "demo.tabs.basic.label": "Proyecto",
    "demo.tabs.basic.summary": "Resumen",
    "demo.tabs.basic.summaryBody":
      "Atlas está listo para el lanzamiento de julio.",
    "demo.tabs.basic.activity": "Actividad",
    "demo.tabs.basic.activityBody":
      "Tres cambios aprobados durante la última semana.",
    "demo.tabs.states.label": "Revisión",
    "demo.tabs.states.details": "Detalles",
    "demo.tabs.states.detailsTitle": "Solicitud #248",
    "demo.tabs.states.detailsBody": "Actualiza el runtime de Atlas a Node 24.",
    "demo.tabs.states.validation": "Validación",
    "demo.tabs.states.validationTitle": "12 comprobaciones aprobadas",
    "demo.tabs.states.validationBody":
      "Tipos, pruebas y revisión de dependencias sin fallos.",
    "demo.tabs.states.settings": "Ajustes",
    "demo.tabs.states.settingsBody":
      "Los ajustes estarán disponibles después de aprobar la solicitud.",
    "demo.loader.sizesLabel": "Tamaños de Loader",
    "demo.loader.speedsLabel": "Velocidades de Loader",
    "demo.loader.size.sm": "Dentro de controles",
    "demo.loader.size.md": "Estado inline",
    "demo.loader.size.lg": "Región o carga inicial",
    "demo.loader.speed.fast": "Ciclo corto",
    "demo.loader.speed.normal": "Ciclo base",
    "demo.loader.speed.slow": "Ciclo largo",
    "demo.loader.loadingResults": "Cargando resultados",
    "demo.loader.syncing": "Sincronizando en segundo plano",
    "demo.carousel.label": "Novedades",
    "demo.carousel.productivity.eyebrow": "Productividad",
    "demo.carousel.productivity.title": "Búsqueda",
    "demo.carousel.productivity.body":
      "Encuentra cualquier proyecto al instante, con atajos y filtros vivos.",
    "demo.carousel.context.eyebrow": "Contexto",
    "demo.carousel.context.title": "Actividad",
    "demo.carousel.context.body":
      "Seis meses de cambios en una línea de tiempo que no pierde el hilo.",
    "demo.carousel.analytics.eyebrow": "Analítica",
    "demo.carousel.analytics.title": "Informes",
    "demo.carousel.analytics.body":
      "Cohortes, exportación programada y métricas que caben en una card.",
    "demo.carousel.collaboration.eyebrow": "Colaboración",
    "demo.carousel.collaboration.title": "Equipo",
    "demo.carousel.collaboration.body":
      "Invita, asigna roles y comparte espacios sin salir del flujo.",
    "demo.carousel.readMore": "Leer más",
    "demo.carousel.focusLabel": "Novedades, con enlace en cada tarjeta",
    "demo.carousel.team.label": "Equipo",
    "demo.carousel.person.first.role": "Plataforma",
    "demo.carousel.person.second.role": "Compiladores",
    "demo.carousel.person.third.role": "Redes",
    "demo.carousel.person.fourth.role": "Genética",
    "demo.carousel.person.fifth.role": "Recuperación",
    "demo.grid.label": "Proyectos recientes",
    "demo.link.before": "Un párrafo con un ",
    "demo.link.neutral": "enlace del color del texto",
    "demo.link.middle": " y otro ",
    "demo.link.primary": "de color primary",
    "demo.link.after": ", los dos con subrayado permanente.",
    "demo.progress.upload": "Subida",
    "demo.progress.complete": "Completado",
    "demo.progress.quota": "Cuota",
    "demo.emptyState.title": "Todavía no hay proyectos",
    "demo.emptyState.description":
      "Crea el primero para organizar el trabajo del equipo.",
    "demo.emptyState.action": "Crear proyecto",
    "demo.segmented.label": "Rango",
    "demo.segmented.day": "Día",
    "demo.segmented.week": "Semana",
    "demo.segmented.month": "Mes",
    "demo.flyout.density": "Densidad",
    "demo.flyout.densityCondensed": "Condensada",
    "demo.flyout.densityDense": "Densa",
    "demo.flyout.densityCompact": "Compacta",
    "demo.flyout.densityComfortable": "Cómoda",
    "demo.flyout.densitySpacious": "Amplia",
    "demo.flyout.radius": "Redondez",
    "demo.flyout.radiusSquare": "Recta",
    "demo.flyout.radiusSubtle": "Sutil",
    "demo.flyout.radiusSoft": "Suave",
    "demo.flyout.radiusStrong": "Marcada",
    "demo.flyout.radiusRound": "Redonda",
    "demo.flyout.region": "Región",
    "demo.flyout.regionEurope": "Europa",
    "demo.flyout.regionAmericas": "América",
    "demo.flyout.regionApac": "Asia-Pacífico",
    "demo.flyout.regionLatam": "Latinoamérica",
    "demo.flyout.language": "Idioma",
    "demo.flyout.theme": "Tema",
    "demo.flyout.themeCustom": "Personalizado",
    "demo.toast.dismiss": "Descartar",
    "demo.toast.linkCopied": "Enlace copiado al portapapeles.",
    "demo.toast.documentArchived": "Documento archivado",
    "demo.toast.movedToArchived": "Se movió a Archivados.",
    "demo.toast.undo": "Deshacer",
    "demo.checkbox.emailAlerts": "Alertas por email",
    "demo.switch.deployAutomatically": "Desplegar automáticamente",
    "demo.treeView.label": "Proyecto",
    "demo.button.save": "Guardar",
    "demo.button.cancel": "Cancelar",
    "demo.button.delete": "Borrar",
    "demo.button.download": "Descargar",
    "demo.button.continue": "Continuar",
    "demo.button.settings": "Configuración",
    "demo.button.edit": "Editar",
    "demo.button.add": "Añadir",
    "demo.button.copy": "Copiar",
    "demo.button.moreActions": "Más acciones",
    "demo.button.goFirstComponent": "Ir a primer componente",
    "demo.button.small": "Chico",
    "demo.button.large": "Grande",
    "demo.button.withIcon": "Con icono",
    "demo.button.retry": "Reintentar",
    "demo.button.dismiss": "Descartar",

    "button.description": "Button: hooks de estilo, enhancer vanilla mínimo y componente React.",
    "button.lede": 'Styling hooks sobre el <code>&lt;button&gt;</code> nativo, un enhancer vanilla y un componente React.',
    "button.variantsTitle": "Variantes",
    "button.translucentBody":
      "<code>translucent</code> tiene un fondo semi-transparente que se mezcla con fondos coloreados. Úsalo en callouts, cards coloreadas, o cualquier contexto donde el botón necesita integrarse visualmente con su contenedor sin competir con él.",
    "button.sizesTitle": "Tamaños",
    "button.sizesLabel": "Button · sm / md / lg",
    "button.sizeHitNote": "ya incluido: la cara sm pinta a 32px, el hit sigue en 44px",
    "button.iconTitle": "Con icono",
    "button.iconBody":
      "El icono va antes o después del texto según lo que necesite decir primero: adelante para anticipar el tipo de acción, atrás para señalar hacia dónde lleva. Es solo el orden en <code>children</code>: el mismo <code>gap</code> entre icono y texto en los dos casos.",
    "button.iconLabel": "Button con icono",
    "button.iconOnlyTitle": "Solo icono",
    "button.iconOnlyLabel": "Solo icono",
    "button.iconOnlySmLabel": "Solo icono · sm",
    "button.linkTitle": "Como enlace",
    "button.linkBody":
      'Cualquier forma de arriba (variante, tamaño, icono, solo icono) también renderiza como enlace: mismas clases, mismos atributos <code>data-*</code>, solo cambia el tag (<code>&lt;a href&gt;</code> en vez de <code>&lt;button&gt;</code>). En React, pasarle <code>href</code> a <code>Button</code> hace el cambio. Un enlace no puede ser <code>disabled</code>: renderiza contenido no enlazado en su lugar.',
    "button.linkLabel": "Button como enlace",
    "button.tileTitle": "TileButton",
    "button.tileBody": "Cuando toda la superficie es una acción, no solo una etiqueta adentro.",
    "button.tileLabel": "TileButton",
    "button.vanillaInitTitle": "Inicializar vanilla",
    "button.iconsComment":
      "Los iconos se autoran como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "button.sizeHitComment":
      "Ya viene en components/button.css. No hay que\n   escribirlo: está acá porque es la parte del componente\n   que más sorprende, y conviene saber que existe.\n\n   El positioning NO se declara acá a propósito: lo pone\n   .sk-interactive (state layer). Un position propio haría\n   de cualquier botón el bloque contenedor de lo que tenga\n   dentro en absoluto.",
    "button.test1": "Es un <code>&lt;button&gt;</code> nativo que no envía formularios por defecto.",
    "button.test2": "El estado deshabilitado llega al control nativo y a la tecnología de asistencia.",
    "button.test3": "Como enlace, renderiza con la apariencia de Button y los atributos del ancla.",
    "button.test4": "El enhancer da un <code>type</code> seguro a los botones autorados, y montar dos veces es idempotente.",
    "button.test5": "Un botón solo-icono sin nombre accesible es rechazado por el enhancer.",

    "demo.list.preferences": "Preferencias",
    "demo.list.resources": "Recursos del proyecto",
    "demo.list.team": "Equipo",
    "demo.list.active": "Activo",
    "demo.list.notifications.title": "Notificaciones",
    "demo.list.notifications.description": "Resumen semanal cada viernes.",
    "demo.list.timezone.title": "Zona horaria",
    "demo.list.timezone.description": "Se usa para programar envíos.",
    "demo.list.timezone.value": "GMT−3",
    "demo.list.language.title": "Idioma",
    "demo.list.language.description": "Interfaz y correos.",
    "demo.list.language.value": "Español",
    "demo.list.dateFormat.title": "Formato de fecha",
    "demo.list.dateFormat.description": "Cómo se escriben días y meses.",
    "demo.list.dateFormat.value": "31/12/2026",
    "demo.list.homePage.title": "Página de inicio",
    "demo.list.homePage.description": "Dónde caes al entrar.",
    "demo.list.homePage.value": "Resumen",
    "demo.list.prerequisites.title": "Prerrequisitos",
    "demo.list.prerequisites.description": "Qué necesitas antes de instalar.",
    "demo.list.gettingStarted.title": "Guía de inicio",
    "demo.list.gettingStarted.description":
      "Instala y configura tu primer proyecto.",
    "demo.list.customization.title": "Personalización",
    "demo.list.customization.description":
      "Ajusta color, densidad, radio e iconografía.",
    "demo.list.tokenReference.title": "Referencia de tokens",
    "demo.list.tokenReference.description":
      "Consulta roles, escalas y cadenas de decisión.",
    "demo.list.tiers.title": "Tiers",
    "demo.list.tiers.description": "Qué capa resuelve cada decisión.",
    "demo.list.first.name": "John Doe",
    "demo.list.first.role": "Sistema de diseño y experiencia.",
    "demo.list.second.name": "Jane Doe",
    "demo.list.second.role": "Componentes e infraestructura.",
    "demo.list.third.name": "Richard Roe",
    "demo.list.third.role": "Estrategia y descubrimiento.",
    "demo.list.fourth.name": "Mary Major",
    "demo.list.fourth.role": "Investigación y contenido.",
    "demo.list.area.design": "Diseño",
    "demo.list.area.engineering": "Ingeniería",
    "demo.list.area.product": "Producto",
    "demo.table.plans": "Planes disponibles",
    "demo.table.plan": "Plan",
    "demo.table.usage": "Uso",
    "demo.table.status": "Estado",
    "demo.table.starter": "Starter",
    "demo.table.starterUsage": "Equipos pequeños",
    "demo.table.team": "Team",
    "demo.table.teamUsage": "Hasta 50 personas",
    "demo.table.active": "Activo",
    "demo.table.trial": "En prueba",
    "demo.table.taxNote": "Los precios no incluyen impuestos.",
    "demo.table.regions": "Rendimiento por región",
    "demo.table.resizeLabel": "Redimensionar columna",
    "demo.table.service": "Servicio",
    "demo.table.latency": "Latencia",
    "demo.table.errors": "Errores",
    "demo.table.uptime": "Disponibilidad",
    "demo.table.deployments": "Despliegues recientes",
    "demo.table.when": "Cuándo",
    "demo.table.who": "Quién",
    "demo.table.result": "Resultado",
    "demo.table.succeeded": "Exitoso",
    "demo.table.running": "En curso",
    "demo.table.environment": "Entorno",
    "demo.table.failed": "Fallido",
    "demo.table.rowsPerPage": "Filas por página",
    "demo.table.pagination": "Paginación",
    "demo.table.previousPage": "Página anterior",
    "demo.table.nextPage": "Página siguiente",
    "demo.table.minutesAgo": "Hace {n} min",
    "demo.table.hoursAgo": "Hace {n} h",
    "demo.table.range": "{start}–{end} de {total}",
    "demo.badge.settings": "Configuración",
    "demo.badge.unread": "Novedades sin leer",
    "demo.badge.online": "En línea",

    "badge.description": "Badge: etiqueta estática con tonos semánticos, styling hooks y componente React.",
    "badge.lede":
      "Badge es una etiqueta visual estática para estados, categorías o metadatos cortos. No comunica selección, contador ni navegación por sí sola; esa semántica pertenece al contenido o al contenedor.",
    "badge.tagTitle": "Etiqueta",
    "badge.tagBody":
      "La forma con texto: un estado, una categoría o un metadato corto. Cada tono lleva un borde de su propio color, así el neutral, cuyo fondo es el lienzo, no queda como un rectángulo invisible.",
    "badge.tagLabel": "Badge",
    "badge.dotTitle": "Dot",
    "badge.dotBody":
      "Un badge que es <strong>sólo un punto</strong>: sin texto, comunica por color y posición. Suelto es una luz de estado; su relleno es un tono saturado para que se lea a unos pocos píxeles.",
    "badge.dotLabel": "Badge dot",
    "badge.cornerTitle": "En la esquina de un elemento",
    "badge.cornerBody":
      'Envuelve el elemento en <code>sk-badge-holder</code> y el dot se ancla arriba a la derecha, un indicador de novedades sobre un botón, de presencia sobre un avatar. Un anillo del color de la superficie lo despega del contenido de abajo. El punto lleva su propio <code>aria-label</code> porque significa algo; el elemento anfitrión no cambia.',
    "badge.cornerLabel": "Badge dot en la esquina",
    "badge.test1": "Renderiza su etiqueta accesible y reenvía los atributos semánticos.",
    "badge.test2": "Ancla un dot de estado sin agregar contenido visible.",

    "demo.carousel.nativeLabel": "Novedades (sin JS)",
    "demo.checkbox.group": "Permisos del repositorio",
    "demo.checkbox.read": "Lectura",
    "demo.checkbox.write": "Escritura",
    "demo.checkbox.admin": "Administración",
    "demo.checkbox.critical.title": "Alertas críticas",
    "demo.checkbox.critical.body": "Notifica caídas y degradaciones.",
    "demo.checkbox.private.title": "Repositorios privados",
    "demo.checkbox.private.body": "Incluye actividad de proyectos privados.",
    "demo.checkbox.disabled.title": "Canal heredado",
    "demo.checkbox.disabled.body": "Gestionado por la organización.",
    "demo.flyout.plan": "Plan",
    "demo.flyout.placeholder": "Elige un plan",
    "demo.heading.flush": "Título sin margen propio",
    "demo.list.integrations": "Integraciones",
    "demo.loader.simulation": "Simulación de carga",
    "demo.loader.busy": "Cargando resultados…",
    "demo.loader.ready": "Resultados listos.",
    "demo.loader.start": "Simular carga",
    "demo.loader.contexts": "Loader en contexto",
    "demo.loader.page.title": "Página",
    "demo.loader.page.body": "Carga una vista completa.",
    "demo.loader.card.title": "Card",
    "demo.loader.card.body": "Carga contenido dentro de una superficie.",
    "demo.loader.control.title": "Control",
    "demo.loader.control.body": "Reserva espacio junto a una acción.",
    "demo.radioGroup.starter.title": "Starter",
    "demo.radioGroup.starter.body": "Para proyectos personales.",
    "demo.radioGroup.pro.title": "Pro",
    "demo.radioGroup.pro.body": "Para equipos en crecimiento.",
    "demo.stat.summary": "Resumen del negocio",
    "demo.stat.income": "Ingresos",
    "demo.stat.orders": "Pedidos",
    "demo.stat.cancellations": "Cancelaciones",
    "demo.stat.versus": "vs. mes anterior",
    "demo.stat.relative": "Rendimiento relativo",
    "demo.stat.cumulative": "Acumulado del período",
    "demo.stat.activity": "Actividad",
    "demo.stat.increases": "Aumenta",
    "demo.stat.decreases": "Disminuye",
    "demo.stat.stable": "Estable",
    "demo.switch.auto.title": "Despliegue automático",
    "demo.switch.auto.body": "Publica cuando las verificaciones pasan.",
    "demo.switch.public.title": "URL pública",
    "demo.switch.public.body": "Cualquiera con el enlace puede verla.",
    "demo.table.activity": "Actividad de despliegues",
    "demo.table.page": "Página",
    "demo.tabs.status": "Panel activo",
    "demo.tabs.summary": "Resumen",
    "demo.tabs.activity": "Actividad",
    "demo.tabs.metrics": "Métricas",
    "demo.tabs.settings": "Ajustes",
    "demo.tabs.summary.body": "Estado general del espacio de trabajo.",
    "demo.tabs.activity.body": "Cambios recientes del equipo.",
    "demo.tabs.metrics.body": "Rendimiento y uso del proyecto.",
    "demo.tabs.settings.body": "Preferencias del espacio de trabajo.",
    "demo.text.before": "El plan",
    "demo.text.after": "incluye soporte prioritario.",
    "demo.toast.emit": "Emitir toast",
    "demo.toast.dynamic": "La exportación terminó.",
    "demo.toast.syncing": "Sincronizando",
    "demo.toast.syncingBody": "Esto puede tardar unos segundos.",
    "demo.toast.deploymentCreated": "Despliegue creado",
    "demo.toast.deploymentCreatedBody": "La versión ya está disponible.",
    "demo.toast.connectionFailed": "No se pudo conectar",
    "demo.toast.connectionFailedBody": "Revisa tu conexión y vuelve a intentarlo.",
    "demo.toast.status.saved": "Cambios guardados",
    "demo.toast.status.copied": "Enlace copiado",
    "demo.toast.status.failed": "No se pudo guardar",
    "demo.toast.stack.first": "Exportación preparada.",
    "demo.toast.stack.second": "Informe enviado.",
    "demo.toast.stack.third": "Permisos actualizados.",
    "demo.toc.title": "En esta página",
    "demo.toc.summary": "Resumen",
    "demo.toc.installation": "Instalación",
    "demo.toc.configuration": "Configuración",
    "demo.toc.configuration.env": "Variables de entorno",
    "demo.toc.configuration.flags": "Flags opcionales",
    "demo.toc.reference": "Referencia",
    "demo.commandPalette.open": "Abrir paleta",
    "demo.commandPalette.label": "Buscar",
    "demo.commandPalette.section": "Componentes",
    "demo.commandPalette.button": "Button",
    "demo.commandPalette.dialog": "Dialog",
    "demo.commandPalette.toc": "Toc",
    "demo.componentPreview.title": "Botón primario",
    "demo.componentPreview.button": "Guardar",
    "demo.avatar.label": "Avatares de ejemplo",
    "demo.avatar.imageLabel": "Avatares con foto",
    "demo.avatar.sizesLabel": "Tamaños de avatar",
    "demo.avatar.colorsLabel": "Avatares de colores",
    "demo.avatar.colorPersonName": "Avatar {letter}",
    "demo.avatar.groupLabel": "Avatares apilados",
    "demo.avatar.personOne": "Persona 1",
    "demo.avatar.personTwo": "Persona 2",
    "demo.avatar.personThree": "Persona 3",

    "avatar.description": "Avatar: ImageFrame o iniciales, AvatarGroup con colapso +N y componente React.",
    "avatar.lede":
      'Avatar es el token visual de una persona o entidad: una foto recortada con <strong>ImageFrame</strong> (1/1, cover, pill) o, sin imagen, las dos primeras letras del nombre. <strong>AvatarGroup</strong> apila un conjunto y colapsa el excedente en un contador «+N».',
    "avatar.body":
      'Con imagen, el avatar anida <code>sk-image-frame</code> y el <code>&lt;img alt&gt;</code> aporta la semántica. Sin ella, el contenedor toma <code>role="img"</code> y las iniciales quedan decorativas. En React, <code>avatarInitials(name)</code> deriva el fallback cuando no pasas hijos: dos palabras → primera letra de cada una; una sola → los dos primeros caracteres.',
    "avatar.imagesTitle": "Con imagen",
    "avatar.imagesBody":
      'Con <code>src</code>, el avatar recorta la foto dentro de <strong>ImageFrame</strong> (1/1, cover, pill); el <code>&lt;img alt&gt;</code> aporta la semántica.',
    "avatar.sizesTitle": "Tamaños",
    "avatar.sizesBody":
      'Tres tamaños, <code>sm</code> / <code>md</code> / <code>lg</code>, la misma escala que Button.',
    "avatar.colorsTitle": "Colores",
    "avatar.colorsBody":
      'El fondo y la tinta son hooks de estilo (<code>--sk-avatar-bg</code> / <code>--sk-avatar-fg</code>): tintar un avatar por persona es lo más común que hace una app con ellos. Dieciséis identidades, cada una de un color distinto de la paleta base, con el mismo anillo que usa <strong>AvatarGroup</strong> para separar sus discos.',
    "avatar.groupTitle": "Avatares apilados",
    "avatar.groupBody":
      '<strong>AvatarGroup</strong> superpone un conjunto y colapsa el excedente en un contador «+N».',
    "avatar.test1": "Sin imagen, deriva las iniciales del nombre (dos palabras → una letra de cada una).",
    "avatar.test2": "Con un solo nombre, usa sus dos primeros caracteres.",
    "avatar.test3": "Con <code>src</code>, la imagen se renderiza dentro de ImageFrame.",
    "avatar.test4": "AvatarGroup limita los avatares visibles y colapsa el resto en un contador «+N».",

    "demo.fileUpload.label": "Adjuntos",
    "demo.fileUpload.dropzone": "Arrastra archivos aquí",
    "demo.fileUpload.trigger": "Elegir archivos",
    "demo.numberField.label": "Cantidad",
    "demo.numberField.decrement": "Disminuir",
    "demo.numberField.increment": "Aumentar",
    "demo.placeholder.loading": "Cargando publicación…",
    "demo.placeholder.loaded": "Publicación cargada.",
    "demo.placeholder.research": "Investigación",
    "demo.placeholder.title": "Cuando una ruta deja de ser lineal",
    "demo.placeholder.body":
      "Doce entrevistas muestran dónde se pierde el contexto y qué señales ayudan a recuperarlo.",
    "demo.placeholder.readTime": "8 min de lectura · actualizado hoy",
    "demo.processList.first.title": "Crea el espacio",
    "demo.processList.first.description": "Elige una región y un nombre estable.",
    "demo.processList.second.title": "Invita al equipo",
    "demo.processList.second.description": "Asigna roles antes de compartir el enlace.",
    "demo.processList.third.title": "Publica",
    "demo.processList.third.description": "Revisa permisos y confirma el cambio.",
    "demo.sidebar.collapse": "Contraer navegación",
    "demo.sidebar.nav": "Principal",
    "demo.sidebar.workspace": "Espacio",
    "demo.sidebar.home": "Inicio",
    "demo.sidebar.reports": "Reportes",
    "demo.sidebar.content": "El contenido de la app va aquí.",
    "demo.sidebar.resize": "Cambiar el ancho de la navegación",
    "demo.sidebar.files": "Archivos del proyecto",
    "demo.sidebar.explorer": "Explorador",
    "demo.sidebar.longFile": "informe-anual-consolidado.md",
    "demo.sidebar.resizeContent": "Arrastra el borde de la barra. El nombre que no entra se corta con puntos suspensivos; nunca aparece un scroll horizontal.",
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
    "demo.tooltip.export.label": "Exportar",
    "demo.tooltip.export.content": "Descarga el periodo visible en CSV",
    "demo.tooltip.metric.value": "Ingresos $48.2k",
    "demo.tooltip.metric.label": "Cómo se calcula Ingresos",
    "demo.tooltip.metric.content": "Suma facturada del periodo, sin impuestos ni reembolsos",
    "demo.tooltip.truncated.content": "Migración del pipeline de facturación",
    "demo.toolbar.actions": "Acciones de documento",
    "demo.toolbar.edit": "Editar",
    "demo.toolbar.copy": "Copiar",
    "demo.toolbar.delete": "Borrar",
    "demo.toolbar.viewControls": "Controles de vista",
    "demo.toolbar.screenSize": "Tamaño de pantalla",
    "demo.toolbar.free": "Libre",
    "demo.toolbar.tablet": "Tablet",
    "demo.toolbar.mobile": "Móvil",
    "demo.toolbar.binding": "Binding",
    "demo.tree.initialLabel": "Proyecto",
    "demo.tree.multipleLabel": "Archivos del proyecto",
    "demo.tree.disabledLabel": "Proyecto con rama deshabilitada",
    "demo.tree.filesLabel": "Archivos del proyecto",
    "demo.tree.source": "src",
    "demo.tree.components": "componentes",
    "demo.tree.buttonFile": "botón.tsx",
    "demo.tree.indexFile": "índice.ts",
    "demo.tree.disabledFolder": "legado",
    "demo.tree.selection": "Selección",
    "demo.tree.expansion": "Expansión",

    /*
     * The Accordion page's own copy: one shared component (AccordionPage.astro) renders both
     * locales, so every string it needs a `t()` key rather than a hand-copied twin in a second
     * .astro file. Grouped here as its own block, the same shape `demo.*` already uses per demo.
     */
    "accordion.description": "Una o varias divulgaciones Tile coordinadas en un solo marco.",
    "architecture.title": "Cómo se construyen los componentes",
    "architecture.lede":
      "Todos siguen el mismo modelo: una base compartida para que se vean y se comporten igual, más el binding que elegís para tu aplicación. Esta página usa Accordion como ejemplo.",
    "architecture.layersTitle": "El modelo, en cuatro piezas",
    "architecture.layer1":
      '<strong>Contrato.</strong> Define las partes, opciones y reglas del componente. Es el plano que comparten la documentación y todas las implementaciones.',
    "architecture.layer2":
      '<strong>Estilos.</strong> Un stylesheet publicado aplica los tokens y los estados visuales. Podés ajustarlo con style hooks sin copiar el componente.',
    "architecture.layer3":
      '<strong>Comportamiento.</strong> Sólo los componentes interactivos agregan una máquina que gestiona estado, teclado y atributos accesibles.',
    "architecture.layer4":
      '<strong>Binding.</strong> Elegís cómo usarlo: HTML con Vanilla, componentes declarativos con React o sólo CSS cuando no hace falta interacción.',
    "architecture.flowTitle": "Qué pasa cuando alguien interactúa",
    "architecture.flow1":
      '<strong>La persona actúa.</strong> Hace click, toca o usa el teclado sobre un control nativo.',
    "architecture.flow2":
      '<strong>El componente decide.</strong> Su comportamiento aplica la regla correspondiente: abrir, seleccionar, validar o cambiar de vista.',
    "architecture.flow3":
      '<strong>La interfaz se actualiza.</strong> El estado, los atributos accesibles y los estilos cambian juntos.',
    "architecture.flow4":
      '<strong>Tu aplicación se entera.</strong> React llama el callback; Vanilla emite un evento. Sólo conectás ese dato si lo necesitás.',
    "architecture.useTitle": "Cómo elegir qué usar",
    "architecture.use1":
      '<strong>Necesitás apariencia.</strong> Importá el stylesheet del componente.',
    "architecture.use2":
      '<strong>Necesitás interacción en HTML.</strong> Escribí el markup del contrato y montá el enhancer Vanilla.',
    "architecture.use3":
      '<strong>Usás React.</strong> Importá el componente React y pasá props; el binding resuelve el markup y el comportamiento.',
    "architecture.exampleTitle": "Ejemplo: Accordion",
    "architecture.exampleBody":
      'Accordion usa las cuatro piezas: su contrato nombra raíz, item, trigger y contenido; sus estilos reutilizan Tile; su comportamiento coordina qué secciones están abiertas; y React o Vanilla te entregan el valor cuando cambia. El detalle de sus opciones está en la pestaña <strong>Referencia</strong> de cada componente, generada desde el contrato.',
    "accordion.intro":
      'Si el estado puede vivir en el HTML y te alcanza con un grupo exclusivo nativo, la opción más simple es {detailsLink}, al final de esta página. Elige Accordion cuando necesites valor controlado, <code>multiple</code> o escuchar los cambios de estado.',
    "accordion.detailsNativoLabel": "Details nativo",
    "accordion.iconsNote":
      'Los chevrons son placeholders (<code>&lt;span data-sk-icon="chevron-*"&gt;</code>): ningún componente monta un set de iconos por vos, así que hace falta esta línea además.',
    "accordion.oneItemTitle": "Accordion de un solo item",
    "accordion.oneItemBody":
      "Para una divulgación aislada, usa Accordion con un único item: la raíz aporta el marco y el Tile conserva la superficie y el state layer.",
    "accordion.oneItemLabel": "Accordion de un item",
    "accordion.exclusiveTitle": "Accordion de grupo exclusivo",
    "accordion.exclusiveBody":
      '<code>data-type="single"</code> en HTML, <code>type="single"</code> en React, mantiene como máximo un item abierto. Con <code>data-collapsible="false"</code> o <code>collapsible={false}</code>, el item abierto no puede cerrarse.',
    "accordion.exclusiveLabel": "Accordion single",
    "accordion.multipleTitle": "Accordion de grupo múltiple",
    "accordion.multipleBody":
      '<code>type="multiple"</code> conserva cada disclosure de forma independiente.',
    "accordion.multipleLabel": "Accordion multiple",
    "accordion.contractTitle": "Contrato",
    "accordion.contractSelection":
      'Abrir un item no pinta el borde de selección: eso queda para checkbox y radio.',
    "accordion.contractRest": "El resto del contrato (partes, opciones, valores por defecto y qué acepta cada slot) sale del contrato compilado y vive en {reference}.",
    "accordion.contractEvent":
      'El estado se escucha por evento sobre la raíz, no por callback: <code>sk:accordionvaluechange</code>, con el valor en <code>event.detail.value</code>.',
    "accordion.nativeLede":
      '<code>&lt;details&gt;</code> y <code>&lt;summary&gt;</code> ya son una divulgación accesible de la plataforma. Comparte un atributo <code>name</code> entre siblings para que el navegador mantenga un único item abierto: un accordion nativo, sin máquina ni <code>@skryensya/vanilla</code>.',
    "accordion.decisionHeadNeed": "Necesitas",
    "accordion.decisionHeadUse": "Usa",
    "accordion.decisionRow1Need": "Que funcione antes de que cargue cualquier script, o sin JavaScript",
    "accordion.decisionRow1Use": "Details nativo",
    "accordion.decisionRow2Need": "Un grupo exclusivo simple: alcanza con compartir <code>name</code>",
    "accordion.decisionRow2Use": "Details nativo",
    "accordion.decisionRow3Need": "Mantener varias secciones abiertas a la vez",
    "accordion.decisionRow3Use": "Accordion (<code>multiple</code>)",
    "accordion.decisionRow4Need": "Fijar o leer el valor abierto desde afuera: estado, props, otro componente",
    "accordion.decisionRow4Use": "Accordion",
    "accordion.decisionRow5Need": "Escuchar cuándo cambia, para sincronizar con el resto de la UI",
    "accordion.decisionRow5Use": "Accordion",
    "accordion.decisionRow6Need": "Garantizar la misma transición animada en cualquier navegador",
    "accordion.decisionRow6Use": "Accordion",
    "accordion.nativeBody":
      'Comparte los mismos tokens que Tile (título, descripción, chevron), así el grupo se ve igual sin componer un Tile adentro.',
    "accordion.nativePreviewLabel": "Details con name compartido",
    "accordion.nativeInstallTitle": "Instalar sólo Details",
    "accordion.nativeContractTitle": "Contrato nativo",
    "accordion.nativeContractItem1":
      'El primer hijo interactivo de cada <code>&lt;details&gt;</code> es su <code>&lt;summary&gt;</code>.',
    "accordion.nativeContractItem2":
      'El atributo <code>open</code> declara el estado inicial en HTML.',
    "accordion.nativeContractItem3":
      'El mismo <code>name</code> entre siblings hace exclusivo el grupo; sin <code>name</code>, cada disclosure es independiente.',
    "accordion.nativeContractItem4":
      'El navegador cambia <code>open</code>; no hay un valor controlado ni evento del sistema que escuchar.',
    "accordion.nativeContractItem5":
      'El chevron se pinta solo dentro de <code>&lt;summary&gt;</code>: reemplaza la marca nativa (<code>&lt;summary&gt;</code> apaga el triángulo del navegador) y alterna con CSS puro sobre <code>details[open]</code>, sin script propio.',
    "accordion.a11yTitle": "Accesibilidad",
    "accordion.a11yP1":
      'Cada trigger es un <code>&lt;button&gt;</code> nativo: Enter y Espacio lo activan sin script propio, y su <code>aria-expanded</code> (escrito por la máquina, nunca a mano) es lo único que anuncia el estado. El chevron es <code>aria-hidden="true"</code>: es la misma información dicha dos veces, y solo una debe llegar al lector de pantalla.',
    "accordion.a11yP2":
      "<kbd>Tab</kbd> y <kbd>Shift</kbd>+<kbd>Tab</kbd> mueven el foco entre triggers en el orden normal de la página: el patrón base que la APG de ARIA describe para un accordion no exige más que eso — flechas, <kbd>Home</kbd> y <kbd>End</kbd> entre triggers son una mejora opcional que este componente no implementa hoy. Abrir un item no le quita el foco a su trigger ni se lo da al contenido: el recorrido con teclado sigue siendo el mismo, igual que con el mouse.",
    "accordion.a11yP3":
      '{detailsLink} no tiene nada de esto porque no lo necesita: un <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code> es una divulgación accesible de la plataforma, con su propio manejo de foco y teclado ya resuelto por el navegador.',

    "accordion.testReact1":
      "En modo single, abrir un ítem cierra el anterior y dispara onValueChange con el nuevo valor.",
    "accordion.testReact2":
      "En modo multiple, abrir un ítem no cierra los demás abiertos.",
    "accordion.testReact3":
      'Un ítem trae las clases correctas (<code class="sk-code">sk-tile--expandable</code>, sin <code class="sk-code">--interactive</code>) y <code class="sk-code">aria-expanded</code> alterna al hacer click en el trigger.',
    "accordion.testReact4":
      'Cada trigger queda envuelto en un <code class="sk-code">role="heading"</code> con <code class="sk-code">aria-level</code> (3 por defecto, configurable), para que un lector de pantalla que navega por headings encuentre las secciones.',
    "accordion.testVanilla1":
      "En modo single, abrir un ítem cierra el anterior (animado) y emite el evento sk:accordionvaluechange.",
    "accordion.testVanilla2":
      "En modo multiple, los ítems se abren de forma independiente.",

    "hooks.intro":
      "El token sale del CSS publicado. El valor se resuelve en vivo contra el elemento real del componente y cambia con las dimensiones elegidas arriba.",
    "hooks.definition": "Token",
    "hooks.resolvedValue": "Valor",

    "tokens.primitive": "Primitivos",
    "tokens.semantic": "Semánticos",
    "tokens.component": "Por componente",
    "tokens.search": "Buscar",
    "tokens.searchPlaceholder": "Nombre o valor…",
    "tokens.all": "Todos",
    "tokens.group": "Grupo",
    "tokens.groups": "{count} grupos",
    "tokens.groupCount": "{count} grupo",
    "tokens.definition": "Token",
    "tokens.resolvedValue": "Valor",

    "vanilla.title": "Vanilla: instalar y montar",
    "vanilla.intro":
      "Esta ruta no necesita React. Instala Core para los estilos y Vanilla para el enhancer; después elige una estrategia de montaje para cada raíz. Ambas son idempotentes.",
    "vanilla.autoTitle": "Auto, sólo los enhancers presentes",
    "vanilla.autoBody":
      "Úsalo cuando la página contiene varios componentes del sistema: escanea los roots data-sk-* presentes e importa sólo esos tipos. Más sobre cómo funciona en {autoLink}.",
    "vanilla.autoLinkLabel": "Montaje automático",
    "vanilla.onlyTitle": "Sólo {name}",
    "vanilla.onlyBody":
      "Este entry point importa sólo el enhancer de {name}. Sin argumento monta sus instancias en el documento; al pasar una raíz, monta exclusivamente esa instancia.",
    "vanilla.instance": "una instancia",
    "vanilla.autoComment":
      "Cada selector presente dispara sólo el import dinámico de su enhancer.",
    "vanilla.componentComment":
      "Monta sólo {name}; no carga ni recorre otros enhancers.",

    "section.start": "Empezar",
    "section.start.blurb": "Pon el sistema en una pantalla.",
    "section.system": "Sistema",
    "section.system.blurb": "Las reglas que mantienen todo consistente.",
    "section.components": "Componentes",
    "section.components.blurb": "Catálogo A–Z de piezas del sistema.",
    "group.firstSteps": "Primeros pasos",
    "group.foundations": "Fundamentos",
    "group.explore": "Explorar",
    "group.layout": "Layout",
    "group.global": "Global",
    "group.componentActions": "Acciones y entrada",
    "group.componentActions.blurb": "Para capturar datos, elegir opciones y ejecutar tareas.",
    "group.componentNavigation": "Navegación y orientación",
    "group.componentNavigation.blurb": "Para moverse entre páginas, vistas y jerarquías.",
    "group.componentContent": "Contenido y datos",
    "group.componentContent.blurb": "Para presentar información, medios y colecciones.",
    "group.componentFeedback": "Estado y comunicación",
    "group.componentFeedback.blurb": "Para explicar qué ocurre, qué falta y qué sigue.",
    "group.componentLayers": "Capas y revelación",
    "group.componentLayers.blurb": "Para mostrar detalle o tareas sin perder el contexto.",
    "group.componentLayout": "Layout y utilidades",
    "group.componentLayout.blurb": "Para componer, espaciar y sostener la interfaz.",

    /*
     * The reference and changes tabs. Keyed generically, not under `accordion.*`, because both
     * components render from the compiled contract and take the id as a prop: the copy is the same
     * sentence on every component page, exactly like `hooks.*`.
     */
    "contract.tab": "Referencia",
    "contract.title": "Referencia",

    /*
     * The hero-tabs shell (ComponentPageShell): also keyed generically rather than per component,
     * for the same reason as `contract.*` above. `{name}` is the one thing that changes.
     */
    "component.tabUsage": "Uso",
    "component.tabInstall": "Instalación",
    "component.tabStyle": "Style hooks",
    "component.tabA11y": "Accesibilidad",
    "component.tabTests": "Tests",
    "component.tabsAriaLabel": "Referencia de {name}",
    /* The "the code is in the preview's React tab" note: identical boilerplate on every page whose
       only React-specific content is that tab, so it is one key rather than N copies. */
    "component.reactNote": "El código está en la pestaña <strong>React</strong> del preview.",
    /* The hand-written "what the contract says that Referencia's JSON doesn't" subsection every
       page's Uso tab carries (see AccordionPage/DialogPage): one heading word, not N copies. */
    "component.contractNotesTitle": "Contrato",

    "sourceViewer.title": "Explorar el código fuente",
    "sourceViewer.intro": "Explora los archivos propios de {name}: contrato, estilos, bindings y pruebas.",
    "sourceViewer.treeLabel": "Archivos de {name}",
    "sourceViewer.treeAriaLabel": "Archivos fuente de {name}",
    "sourceViewer.resize": "Cambiar el ancho del árbol de archivos",

    /* Resumen de tests: una línea por test, no el código (ya está en Referencia). Sirve para
       confirmar de un vistazo qué queda cubierto sin tener que leer el archivo de test entero. */
    "tests.title": "Tests",
    "tests.intro": "Qué valida cada test, en una línea. El código completo está en Referencia.",
    "tests.statusPassed": "Pasó",
    "tests.statusFailed": "Falló",
    "tests.statusUnknown": "No corrido",

    /* "Changelog" y no "Cambios": es el nombre del componente y de la sección, y se deja igual en
       los dos idiomas. La palabra ya se usa así acá; traducirla sólo de un lado hacía que la misma
       sección se llamara distinto según la URL. */
    "changelog.tab": "Changelog",
    "changelog.title": "Changelog",
    "changelog.empty": "Nada todavía. El contrato no se movió desde su primera publicación.",
    /* Los cinco kinds NO se traducen, y es la misma decisión que "Changelog" acá arriba: son el
       vocabulario con el que se escribe un commit y con el que la gente ya lee un release de
       cualquier otro paquete. Traducidos de un solo lado, la misma entrada se llamaría distinto
       según la URL, y "rehecho" no significa nada que "rework" no diga mejor. */
    "changelog.kind.breaking": "breaking",
    "changelog.kind.feature": "feature",
    "changelog.kind.bugfix": "bugfix",
    "changelog.kind.rework": "rework",
    "changelog.kind.chore": "chore",

    "carousel.description":
      "Carousel: región scroll-snap nativa de slides con controles machine-backed (Zag), snap-to-index y una base sin JS.",
    "carousel.lede":
      "Secciones desplazables <strong>nativas</strong>: la pista es un <code>&lt;div&gt;</code> con <code>scroll-snap-type</code>, así que el desplazamiento, el momentum táctil y los puntos de anclaje son de la plataforma, no de un script. Encima van dos capas de control sobre ese mismo sustrato: una base <strong>sin JS</strong> con los pseudo-elementos nativos de carrusel, y un enhancer <strong>machine-backed</strong> sobre <code>@zag-js/carousel</code> que mide la pista, deriva las páginas y dibuja botones y dots. Cada slide es cualquier contenido: una card, una imagen, un stat.",
    "carousel.cardsTitle": "Carrusel de tarjetas",
    "carousel.cardsBody":
      'Con <code>data-sk-carousel</code> el enhancer corre la máquina: prev/next (se deshabilitan en los extremos), un dot por <strong>página</strong>, teclado, arrastre y re-medición al cambiar de tamaño. Aquí cada slide es una card con <a href="/componentes/image-frame">ImageFrame</a> y un cuerpo compuesto con <code>Box</code>, <code>Stack</code> y <code>Text</code>, sin clases locales. El tamaño base de CSS deja asomar la siguiente.',
    "carousel.cardsLabel": "Carrusel de tarjetas",
    "carousel.dotsTitle": "Un dot por página, no por slide",
    "carousel.dotsBody":
      "Es la razón concreta por la que acá hay una máquina y no un contador. Las posiciones de anclaje <strong>alcanzables</strong> no son una por slide: cuando un slide asoma, los últimos se recortan todos contra el scroll máximo y colapsan en la misma posición. Un carrusel hecho a mano dibuja ahí un dot por slide y termina con dots que <em>nunca</em> se pueden activar y un botón «siguiente» que nunca se deshabilita. La máquina deriva las páginas de <code>getScrollSnapPositions</code> (medidas, recortadas y deduplicadas), así que los dots y el scroll coinciden por construcción. Se ve achicando la ventana sobre cualquiera de los ejemplos: cambian los slides que entran, cambia la cantidad de dots, y el último siempre se puede alcanzar.",
    "carousel.multiTitle": "Multi-up, loop y autoplay",
    "carousel.multiBody1":
      "Slides más angostos entran de a varios por página, y la máquina las cuenta midiendo. Con <code>data-loop</code> el carrusel da la vuelta, con <code>data-autoplay</code> avanza solo (vacío para los 4000 ms por defecto, o un retardo en ms).",
    "carousel.multiBody2":
      "Con <code>data-autoplay</code> aparece además un <strong>botón de pausa</strong>: algo que se mueve solo tiene que poder detenerse (WCAG 2.2.2), así que la opción y el control son una sola cosa. El botón siempre dice lo que va a hacer según lo último que el usuario pidió: pasar el mouse por encima o llevar el foco de teclado a cualquier parte del carrusel — no sólo a los botones — pausa la rotación mientras dure, y la retoma al salir, salvo que la otra condición siga activa. Un click en el botón manda por encima de todo eso hasta el próximo click. A quien declara <code>prefers-reduced-motion</code> no se le arranca: el carrusel queda quieto y el botón ofrece reproducir. También se pausa solo cuando la pestaña deja de estar visible.",
    "carousel.multiLabel": "Multi-up + autoplay",
    "carousel.multiNote": "Avatar + meta · data-loop · data-autoplay",
    "carousel.focusTitle": "Foco dentro de una tarjeta",
    "carousel.focusLabel": "Foco dentro de una tarjeta",
    "carousel.focusBody1":
      "El patrón de WAI-ARIA dice que el foco de teclado pausa la rotación \"en cualquier parte del carrusel, incluyendo los elementos de siguiente y anterior slide\" — una frase fácil de leer como \"sólo los botones\". Esta tarjeta agrega un enlace real (\"Leer más\") adentro de cada slide para probar que también cuenta: Tab hacia el enlace pausa el autoplay, Tab o Shift+Tab hacia afuera lo retoma.",
    "carousel.focusBody2":
      "No hizo falta código nuevo para esto: el listener de foco vive en la raíz del carrusel, y <code>focusin</code>/<code>focusout</code> burbujean desde cualquier descendiente, así que un enlace, un botón o cualquier control dentro de una tarjeta ya queda cubierto.",
    "carousel.focusNote": "Link real por tarjeta · Tab para probar la pausa",
    "carousel.bareTitle": "Sin controles",
    "carousel.bareBody1":
      "<code>data-controls=\"none\"</code> apaga las <strong>dos</strong> capas: ni botones y dots del enhancer, ni <code>::scroll-button</code> y <code>::scroll-marker</code> nativos. Queda la pista desnuda, que sigue siendo un scroller con snap: cada slide es una parada (<code>scroll-snap-stop: always</code>), así que deslizar nunca se saltea una card.",
    "carousel.bareBody2":
      "Lo que no cambia es el comportamiento: los controles eran el chrome. El teclado sigue andando con el foco en la pista, y <code>sk-carousel-goto</code> / <code>sk-carousel-change</code> siguen siendo el mismo par de eventos.",
    "carousel.bareBody3":
      "Y acá se ve por qué el <strong>arrastre con mouse viene prendido</strong>: una rueda vertical scrollea la <em>página</em>, no la pista horizontal que tienes debajo del cursor. Sin arrastre, un puntero de escritorio no tendría ninguna forma de recorrer esto. El cursor <code>grab</code> es todo el aviso, y sólo aparece donde el arrastre de verdad funciona. Desactívalo con <code>data-mouse-drag=\"off\"</code> cuando el texto de los slides esté para seleccionarse: el arrastre suprime la selección.",
    "carousel.bareLabel": "Sin controles",
    "carousel.bareNote": 'data-controls="none" · arrastra y desliza',
    "carousel.nativeTitle": "Sin JS: controles nativos",
    "carousel.nativeBody":
      "El <strong>mismo markup</strong> sin <code>data-sk-carousel</code>: el enhancer no lo toca y los pseudo-elementos nativos (<code>::scroll-button</code> y <code>::scroll-marker</code>) dibujan los controles con <strong>cero JavaScript</strong>. El adapter CSS del set elegido les da los SVG de <code>chevron-left</code> y <code>chevron-right</code>, sin sustituirlos por glifos tipográficos. Hoy funciona en Chrome/Edge; en el resto degrada a un scroller con snap nativo (sin flechas ni dots, pero se desliza igual). Cuando el enhancer monta, esta capa se apaga para no duplicar.",
    "carousel.nativeLabel": "Sin JS (CSS nativo)",
    "carousel.nativeNote": "iconos del set + scroll buttons nativos",
    "carousel.nativeCssLabel": "la base sin JS",
    "carousel.apiTitle": "Snap-to-index y eventos",
    "carousel.apiBody":
      "El control programático es un par de eventos en la raíz: envía <code>sk-carousel-goto</code> para anclar a una página y escucha <code>sk-carousel-change</code> para saber cuál está activa. En React, el <code>ref</code> del <code>&lt;Carousel&gt;</code> expone <code>snapTo(index)</code>, que envía ese mismo evento.",
    "carousel.contractItem1":
      'Raíz: <code>&lt;section class="sk-carousel" data-sk-carousel&gt;</code> con una pista <code>&lt;div class="sk-carousel__track"&gt;</code> de <code>&lt;div class="sk-carousel__slide"&gt;</code>. No es una lista: la máquina le da <code>role="group"</code> a cada slide, lo que la saca de la lista y dejaría una lista sin ítems.',
    "carousel.contractItem2":
      "Slides: cualquier contenido. <code>--sk-carousel-slide-size</code> fija el ancho (peek o multi-up) y es la <strong>única</strong> perilla de tamaño: vale igual con y sin JS, porque la máquina mide la pista en vez de imponerle anchos.",
    "carousel.contractItem3":
      'Opciones en la raíz: <code>data-controls="none"</code>, <code>data-loop</code>, <code>data-autoplay</code> (vacío o ms), <code>data-orientation="vertical"</code>.',
    "carousel.contractItem4":
      'Arrastre con mouse: <strong>prendido</strong>. <code>data-mouse-drag="off"</code> lo apaga, para slides cuyo texto se tenga que poder seleccionar.',
    "carousel.contractItem5":
      "Snap: cada slide es una parada, con <code>scroll-snap-stop: always</code>, así que deslizar nunca salta una. Las paradas <em>alcanzables</em> se recortan contra el fin del scroll, por eso los últimos slides pueden compartir la última.",
    "carousel.contractItem6":
      "Controles: el enhancer los dibuja, uno por página medida; en un extremo el botón se deshabilita. Prev/next respetan el floor táctil. Los dots se ven compactos; el área clicable crece en bloque sin ensanchar el layout ni solaparse. Sin JS, los pseudo-elementos nativos hacen de baseline (Chrome/Edge) y el adapter <code>@skryensya/icons-*/carousel.css</code> les suministra los mismos roles estables de chevron que usa el enhancer.",
    "carousel.contractItem7":
      "Teclado: con el foco en la pista, <kbd class=\"sk-kbd\">←</kbd>/<kbd class=\"sk-kbd\">→</kbd> mueven una página y <kbd class=\"sk-kbd\">Inicio</kbd>/<kbd class=\"sk-kbd\">Fin</kbd> saltan a los extremos; las mismas teclas funcionan con el foco en los dots.",
    "carousel.contractItem8":
      'API: <code>sk-carousel-goto</code> (comando) y <code>sk-carousel-change</code> (salida, con <code>{"{ index, count }"}</code>); en React, <code>ref.snapTo(index)</code>.',
    "carousel.contractItem9": "Movimiento reducido: el desplazamiento suave se apaga con <code>prefers-reduced-motion</code>.",
    "carousel.nativeCssComment1": "cero JS: la plataforma dibuja los controles",
    "carousel.nativeCssComment2": "Anterior",
    "carousel.nativeCssComment3": "Siguiente",
    "carousel.nativeCssComment4": "la fila de dots",
    "carousel.nativeCssComment5":
      "Las cajas de ::scroll-button se maquetan después del scroller, en el\n   flujo del padre. El grid de 3 columnas les reserva los extremos.",
    "carousel.bootstrapComment": "corre la máquina en cada [data-sk-carousel]",
    "carousel.apiComment1": "anclar a una página (0-based): el mismo comando que envía snapTo() del ref de React",
    "carousel.apiComment2": "leer la página activa cada vez que cambia (swipe, rueda, botón, tecla, arrastre o goto)",
    "carousel.apiComment3": "{ index, count }  ← count son PÁGINAS medidas, no slides",
    "carousel.test1": "Renderiza una región <code>section</code> con una pista de slides con scroll-snap.",
    "carousel.test2": "Nombra la región y cada slide para la tecnología de asistencia.",
    "carousel.test3": "Dibuja un punto por página MEDIDA, no uno por slide.",
    "carousel.test4": "Se ancla a un punto y reporta la página en el evento de cambio.",
    "carousel.test5":
      "El foco en el ENLACE de una tarjeta (no sólo en los botones prev/next) pausa el autoplay, y lo retoma al perderlo.",

    "changelogPage.description":
      "Changelog: historial fechado con riel, donde la fecha es lo que se busca y el punto dice qué tipo de cambio fue.",
    "changelogPage.lede":
      "Un historial fechado, lo más nuevo arriba. La fecha encabeza cada entrada porque es lo que el lector viene a buscar, y el punto del riel es una marca neutra que dice <em>cuándo</em>: el <em>qué</em> lo dice la palabra al lado. Es estático: no hay enhancer ni estado.",
    "changelogPage.previewNote": "cuatro tipos",
    "changelogPage.whenTitle": "Cuándo usarlo",
    "changelogPage.whenItem1":
      "Usa Changelog para release notes y para el historial de un contrato: cosas que pasaron, cada una con su día.",
    "changelogPage.whenItem2":
      'Usa <a href="/componentes/process-list">ProcessList</a> para instrucciones en orden. Numera sus marcadores con un <code>counter()</code> de CSS, así que una lista con lo más nuevo arriba se numeraría al revés del tiempo.',
    "changelogPage.whenItem3":
      'Usa <a href="/componentes/steps">Steps</a> cuando haya progreso: <code>complete</code>, <code>current</code>, <code>upcoming</code>. Su conector dice cuánto trabajo queda atrás, que de un cambio ya publicado no es una afirmación que nadie pueda hacer.',
    "changelogPage.contractItem1":
      'La raíz es <code>&lt;ol class="sk-changelog" reversed&gt;</code>. El <code>reversed</code> es fijo, no una opción: lo más nuevo arriba es lo que un changelog <em>es</em>. Nadie dibuja los números, pero el árbol de accesibilidad los lee, y ahí tienen que contar hacia atrás.',
    "changelogPage.contractItem2":
      "<strong>La fecha son dos campos.</strong> La opción <code>date</code> es el día legible por una máquina (<code>YYYY-MM-DD</code>) y aterriza en <code>&lt;time datetime&gt;</code>; el texto visible es un slot, porque una fecha formateada es copy en un idioma y Core no envía ninguno. Formatea con <code>Intl.DateTimeFormat</code> y llena el slot.",
    "changelogPage.contractItem3":
      "<strong>El tipo también son dos.</strong> La opción <code>kind</code> marca la entrada (<code>added</code>, <code>changed</code>, <code>fixed</code>, <code>removed</code>, <code>breaking</code>); el slot es la palabra, y es obligatorio, así que el tipo nunca queda sólo en el color.",
    "changelogPage.contractItem4":
      "<code>target</code> es opcional: la opción, parte o firma a la que le pegó el cambio. Una entrada sobre el contrato entero no lleva ninguno.",
    "changelogPage.contractItem5":
      "<strong>Un solo color.</strong> Pintar cada tipo con su color de estado dejaba un riel verde, azul y ámbar al costado de una página que es prosa, y el verde ganaba por cantidad: casi toda entrada de casi todo changelog es una alta. El punto es una marca neutra; el tipo ya está escrito al lado. <code>breaking</code> es la única excepción, porque es el único tipo cuyo costo de pasar desapercibido es el build de quien te consume: se lleva el punto y la palabra. Si querés la paleta de estado de vuelta, es una declaración de <code>--sk-changelog-marker-color</code> por tipo.",
    "changelogPage.datesTitle": "Fechas, no versiones",
    "changelogPage.datesBody":
      "Este contrato no tiene campo de versión y es a propósito. Un número de versión sólo dice algo si quien lee sabe qué releases existen; una fecha se lee sola. Cuando haya versiones publicadas, el lugar para ponerlas es el slot de la fecha, junto al día, no en vez de él.",
    "changelogPage.test1": "Renderiza una lista ordenada de releases en orden inverso (el más reciente primero).",
    "changelogPage.test2": "Un release sin fecha se marca «sin publicar» y no renderiza hora alguna.",
    "changelogPage.test3": "El tipo de cambio se dibuja como un Badge.",
    "changelogPage.test4": "Título y descripción se renderizan como partes separadas.",

    "checkbox.description": "Checkbox nativo: estado independiente, indeterminado y formulario sin máquina.",
    "checkbox.lede": 'Una elección independiente. Conserva un <code>input type="checkbox"</code>: submit, reset, teclado y validación pertenecen al browser.',
    "checkbox.body":
      "El control usa los roles <code>check</code> y <code>remove</code> del set de iconos, no un trazo CSS. Importa <code>@skryensya/core/components/checkbox.css</code> y llama <code>initComponents()</code> una vez.",
    "checkbox.groupTitle": "Un checkbox que agrupa a otros: CheckboxGroup",
    "checkbox.groupBody1":
      "<code>indeterminate</code> no es un tercer valor que alguien pueda elegir: es lo que un padre dice cuando <strong>sus hijos no se ponen de acuerdo</strong>. Por eso el glifo es <code>remove</code> y no un check a medias, y por eso el padre no envía nada al formulario, los que tienen <code>name</code> y <code>value</code> son los hijos.",
    "checkbox.groupNote": "tres estados a partir de dos booleanos",
    "checkbox.groupBody2":
      "El estado del padre es <strong>derivado</strong>, nunca escrito a mano: se recalcula desde los hijos en cada cambio. Al revés, un padre con estado propio empieza a mentir en cuanto alguien marca un hijo. Por eso el contrato no le da un <code>checked</code> que se pueda fijar: cuáles hijos arrancan marcados es dato de cada entrada (<code>defaultChecked</code>), no del grupo.",
    "checkbox.groupBody3":
      "Un hijo <code>disabled</code> no cuenta como voto: una casilla que nadie puede alcanzar no debería impedir que el padre diga «todos». Y un <code>reset</code> del formulario devuelve los hijos a sus atributos <strong>sin disparar ningún evento</strong>, así que el enhancer vuelve a derivar después del reset; sin eso el padre quedaría contradiciendo a sus propios hijos hasta el siguiente click.",
    "checkbox.tileTitle": "Checkbox de superficie: TileCheckbox",
    "checkbox.tileBody1":
      "Cuando la elección necesita título, descripción y toda la superficie como target, usa <code>TileCheckbox</code>. Es el mismo control (<code>sk-checkbox__control</code> + iconos); solo cambia el contenedor.",
    "checkbox.tileBody2":
      'El enhancer <code>tile-checkbox</code> (Svelte + <code>@zag-js/checkbox</code>, la misma máquina que React) hidrata cada label <code>data-sk-tile-checkbox</code> con <code>initComponents()</code>: controla su <code>input[data-part="input"]</code> (oculto) y sincroniza <code>data-state</code>; el <code>[data-part="indicator"]</code> es el control visual.',
    "checkbox.reactBody": "React dibuja los iconos del set enlazado.",
    "checkbox.contractItem1": "<code>defaultChecked</code> deja el estado al input; un reset vuelve a ese valor.",
    "checkbox.contractItem2": "<code>checked</code> controla el valor; <code>onCheckedChange</code> comunica la intención.",
    "checkbox.contractItem3":
      '<code>"indeterminate"</code> es visual: no envía un valor hasta que la persona elige checked o unchecked. El glifo es <code>remove</code>.',
    "checkbox.contractItem4":
      "<code>CheckboxGroup</code> <strong>deriva</strong> el estado del padre, nunca lo guarda: <code>checked</code> cuando están todos, <code>indeterminate</code> cuando no coinciden. <code>checked</code> e <code>indeterminate</code> son flags independientes del input y pueden estar los dos encendidos a la vez; el enhancer apaga el segundo al salir de ese estado, y el CSS le da prioridad al guion por si acaso.",
    "checkbox.contractItem5": 'El texto vive dentro del <code>label</code>; si no hay texto, proporciona <code>aria-label</code>.',
    "checkbox.contractItem6":
      "El state layer va en <code>sk-checkbox__control</code>, no en el label: la selección es el relleno del control, y el texto no hereda el color on-accent.",
    "checkbox.contractItem7": "TileCheckbox reutiliza <code>sk-checkbox__control</code> y los mismos indicadores; no inventa otro glifo.",
    "checkbox.iconsComment1": "Los indicadores check/remove se escriben a mano como placeholders",
    "checkbox.iconsComment2": "<span data-sk-icon>; mountIcons los reemplaza por el <svg> del set.",
    "checkbox.iconsComment3":
      "Cada label se autora con data-sk-tile-checkbox (data-name, data-value,\ndata-default-checked) más su input y su indicador.",
    "checkbox.iconsComment4": "initComponents las hidrata con la máquina @zag-js/checkbox.",
    "checkbox.test1":
      "Alterna el estado marcado y el <code>data-state</code> de la raíz al hacer click, emitiendo <code>sk:checkedchange</code>.",
    "checkbox.test2": "Está asociado al formulario y respeta su <code>default-checked</code>.",
    "checkbox.groupTest1":
      "Deriva los tres estados del padre a partir de los hijos, al montar y en cada cambio.",
    "checkbox.groupTest2":
      "Marca y desmarca a todos los hijos desde el padre, y reporta qué cambió en <code>sk:checkboxgroupvaluechange</code>.",
    "checkbox.groupTest3":
      "Deja en paz al hijo <code>disabled</code> y no deja que impida al padre decir «todos».",
    "checkbox.groupTest4": "Cuenta solo a sus propios hijos, nunca a los de un grupo anidado.",
    "checkbox.groupTest5":
      "Vuelve a derivar el padre tras un <code>reset</code> del formulario, que restaura a los hijos en silencio.",

    "codePreview.description": "Preview de código Shiki con resaltado en build/SSR y comportamiento Vanilla opt-in.",
    "codePreview.lede":
      "Superficie para HTML resaltado por Shiki, con copiar, vista condensada/completa y preview de bloques largos. Shiki termina su trabajo en build o SSR; el navegador recibe HTML y sólo monta los controles que el documento autoró.",
    "codePreview.exampleNote": 'Para presentar este bloque debajo del render real de un componente, usa <a href="/componentes/component-preview">ComponentPreview</a>.',
    "codePreview.contractTitle": "Contrato de carga",
    "codePreview.contractItem1":
      "<code>@skryensya/core/components/code-preview.css</code> contiene la anatomía y consume las variables duales <code>--shiki-light</code> y <code>--shiki-dark</code>.",
    "codePreview.contractItem2":
      "<code>initComponents()</code> no conoce <code>[data-sk-code-preview]</code>. Importar el auto-loader nunca descarga este enhancer.",
    "codePreview.contractItem3":
      "<code>mountCodePreview()</code> es el único seam de comportamiento y es idempotente. El resaltado no forma parte de ese runtime.",
    "codePreview.highlightTitle": "Resaltar en build o SSR",
    "codePreview.mountTitle": "Montar explícitamente",
    "codePreview.mountBody":
      "Los componentes normales se descubren por selector. CodePreview se monta en una segunda llamada deliberada, para que ninguna aplicación cargue un preview de documentación por accidente.",
    "codePreview.highlightComment": "Se ejecuta en build/SSR, nunca en el navegador.",
    "codePreview.mountComment1": "CopyButton y los componentes normales: imports dinámicos por selector.",
    "codePreview.mountComment2": "CodePreview es opt-in y queda fuera del auto-loader.",
    "codePreview.test1": "Cambia densidad, expande, colapsa y monta de forma idempotente.",
    "codePreview.test2": "El botón para revelar más sigue disponible aunque el modo Condensado ya sea largo.",
    "codePreview.test3": "Dice el conteo en el idioma del autor, y solo el número cuando no hay uno.",

    "combobox.description": "Sugerencias editables con estados claros, ayuda contextual y navegación completa por teclado.",
    "combobox.lede": "Sugerencias editables con contexto, estados claros y navegación completa por teclado.",
    "combobox.contractBody1":
      "Combobox filtra una colección autorada sin reemplazar sus opciones. Select conserva una lista cerrada e Input no muestra sugerencias.",
    "combobox.contractBody2":
      "Lo escrito es trabajo del usuario: salir del campo sin elegir nada (desenfocar, clic afuera, Escape) cierra la lista pero <strong>no borra la búsqueda</strong>. Sólo elegir una opción reescribe el input (con la etiqueta elegida), y sólo el ✕ lo vacía. Al reabrir, el filtro vuelve a la lista completa: lo que se ve es la selección, no el último texto tipeado.",
    "combobox.a11yBody1":
      "El foco permanece en el input mientras <code>aria-activedescendant</code> señala la opción activa. Flecha abajo y arriba recorren resultados, Enter selecciona y Escape cierra. <code>hint</code> y <code>error</code> se enlazan mediante <code>aria-describedby</code>; los cambios en la cantidad de resultados se anuncian con una región de estado.",
    "combobox.a11yBody2":
      "Recorrer con el teclado mueve el anillo de foco al ítem resaltado (foco virtual) y el control cede el suyo: hay un solo anillo en pantalla y viaja hacia la lista y de vuelta. Con el puntero no aparece anillo (un anillo siguiendo al cursor se lee como foco roto), sólo la capa de estado.",
    "combobox.test1": "Conserva la búsqueda tipeada cuando el campo queda sin selección.",
    "combobox.test2": "Escribe la etiqueta elegida y reabre sobre la lista completa.",
    "combobox.test3":
      "En modo múltiple, la búsqueda se consume con cada chip agregado.",
    "combobox.test4": "Le pasa la colección filtrada a la máquina antes de renderizar.",

    "commandPalette.description": "CommandPalette: listbox buscable dentro de un Dialog nativo, con atajo opt-in y cierre por IconButton.",
    "commandPalette.lede":
      'Una <strong>paleta de comandos</strong>: un campo que filtra un índice y un listbox con <code>aria-activedescendant</code>, alojados en un <a href="/componentes/dialog"><code>Dialog</code></a> nativo (<code>showModal</code>, Esc, foco). El atajo (<a href="/hotkey">Hotkey</a>) es opt-in por atributo; este sitio lo usa con {hotkey}.',
    "commandPalette.contractItem1": 'Raíz: <code>&lt;dialog class="sk-dialog sk-command-palette" data-sk-command-palette&gt;</code>.',
    "commandPalette.contractItem2":
      'Índice JSON vía <code>data-sk-command-palette-index</code> (id del <code>&lt;script type="application/json"&gt;</code>).',
    "commandPalette.contractItem3":
      'Abrir: <code>data-sk-command-palette-open</code> + <code>aria-controls</code> al id del dialog (o el valor del atributo igual al id).',
    "commandPalette.contractItem4":
      'Atajo opcional: <code>data-sk-command-palette-hotkey="mod+k"</code>. Sin él, solo el botón abre.',
    "commandPalette.contractItem5":
      'Cerrar: <code>&lt;form method="dialog"&gt;</code> con IconButton (<code>sk-dialog__close sk-command-palette__close</code>), Esc, o clic en el backdrop.',
    "commandPalette.contractItem6":
      "<code>entries</code> es una opción del contrato, no del uso normal: existe para que un árbol (como el de arriba) pueda sembrar el índice del demo: se emite como el <code>&lt;script&gt;</code> mismo en Vanilla, y como el prop <code>items</code> (parseado) en React. Una composición real sigue autorando su propio índice.",
    "commandPalette.test1": "No reclama nada en reposo: sin opciones y sin popup expandido.",
    "commandPalette.test2": "Filtra a medida que se tipea y apunta al primer resultado.",
    "commandPalette.test3": "Abre desde su trigger y recién ahí llena la lista.",

    "copyButton.description": "CopyButton: copia el texto de un elemento por id y confirma brevemente el resultado.",
    "copyButton.lede":
      'CopyButton copia el texto del elemento indicado y cambia brevemente de icono para confirmar el resultado. Es un Button ghost icon-only con anatomía propia: el enhancer solo enlaza el clipboard y el feedback; tú escribes el markup. El tamaño es el del Button: <strong>md</strong> (por defecto) o <code>data-size="sm"</code> (cara a 32px, hit a 44px vía <code>::after</code>).',
    "copyButton.previewNote": "md · sm",
    "copyButton.contractItem1": "<code>data-sk-copy-button-target</code> es el id del elemento cuyo texto se copia.",
    "copyButton.contractItem2": 'Usa Clipboard API y recurre a <code>execCommand("copy")</code> cuando hace falta.',
    "copyButton.contractItem3":
      "El estado <code>copied</code> dura brevemente y se anuncia como <strong>Copied</strong> (o el label que autorices en <code>data-sk-copy-button-success-label</code>).",
    "copyButton.contractItem4":
      "Ese mismo label aparece al lado del botón como una banderita con flecha, justo lo que dura el icono de check, en el tono de success (o de danger si falló). No es un tooltip: nunca se queda con el puntero, así que un segundo clic sigue llegando al botón.",
    "copyButton.contractItem5":
      'La banderita se coloca con el pattern <a href="/anclaje">Anclaje</a>: el root lleva además <code>sk-anchor</code> y ella <code>sk-anchored</code> con <code>data-sk-placement="inline-start"</code>. Sin anchor positioning en el navegador no se dibuja, porque acá no hay machine que la coloque; el icono y el live region siguen igual.',
    "copyButton.contractItem6": "Los iconos son placeholders <code>data-sk-icon</code>; el set lo enlaza <code>mountIcons</code> (ADR-15).",
    "copyButton.iconsComment":
      "Los iconos se autoran como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "copyButton.test1": "Copia su blanco autorado, anuncia éxito y vuelve al estado inicial.",
    "copyButton.test2": "Nombra el ancla que ata un botón a su propia bandera de estado.",
    "copyButton.test3": "Reporta un blanco autorado que no existe.",

    "componentPreview.description":
      "Render de un componente y su código en una superficie documentada, con bindings y fuentes opcionales.",
    "componentPreview.lede":
      "Une el <strong>render real del componente</strong> y su implementación en una sola superficie. El stage es un <code>iframe srcdoc</code> estático: no crea una ruta, pero sí su propio DOM, viewport y top layer. Debajo, CodePreview muestra el código.",
    "componentPreview.responsibilitiesTitle": "Responsabilidades",
    "componentPreview.respItem1":
      "<strong>ComponentPreview</strong> posee el marco, la cabecera, el stage renderizado y los paneles de binding o fuente.",
    "componentPreview.respItem2":
      "<strong>CodePreview</strong> posee cada superficie de código: Shiki, copiar, densidad y expansión de bloques largos.",
    "componentPreview.respItem3":
      "El frame queda en <code>about:srcdoc</code>. Toast, Dialog, Drawer, estilos fixed y queries de viewport se resuelven contra el ejemplo, no contra el chrome de documentación.",
    "componentPreview.crossBody":
      "CSS y JavaScript no atraviesan el límite del documento automáticamente. El adapter de este sitio copia sus stylesheets, sincroniza modo, contraste, radio y densidad, y ejecuta el mismo bootstrap Vanilla dentro del realm del frame. El contenido es autorado y de confianza; no se usa para HTML arbitrario de terceros.",
    "componentPreview.minimalTitle": "Anatomía mínima",
    "componentPreview.minimalBody":
      "El stage de este ejemplo es otro ComponentPreview: el mismo <code>srcdoc</code>, un nivel más adentro. El frame anidado clona los estilos de su padre y monta su propio runtime, así que recargar, arrastrar el borde o cambiar el modo de color funcionan en los dos niveles a la vez.",
    "componentPreview.minimalNote": "dentro de un ComponentPreview",
    "componentPreview.flushBody":
      'Añade <code>data-sk-component-preview-flush</code> al iframe y a su body cuando el componente sea un layout. Usa <code>data-sk-component-preview-viewport="menu"</code> para listboxes y popovers, u <code>overlay</code> para dialogs, drawers y toasts. El botón de recarga remonta el <code>srcdoc</code> (útil para count-ups y loaders). Los tabs son <code>SegmentedControl</code> normales.',
    "componentPreview.resizerBody":
      "El <code>resizer</code> es el borde inferior del stage, al estilo del asa de un <code>textarea</code>: arrastrarlo (o <kbd class=\"sk-kbd\">↑</kbd> / <kbd class=\"sk-kbd\">↓</kbd> con el foco puesto) fija el alto en <code>data-sk-component-preview-resized</code>. Desde ahí el alto es del lector: el runtime del frame deja de auto-ajustarlo y pasa su documento a <code>overflow: auto</code>, así achicarlo muestra scroll en vez de recortar el ejemplo. Doble clic (o <kbd class=\"sk-kbd\">Home</kbd>) devuelve el alto al contenido.",
    "componentPreview.screenTitle": "Tamaño de pantalla",
    "componentPreview.screenBody1":
      "<code>screens</code> agrega al header un segmented <strong>Libre · Tablet · Móvil</strong>. <em>Libre</em> es el stage de siempre: ancho completo y alto ajustado al contenido. Los dos presets fijan <strong>ancho y alto</strong>, porque un dispositivo es las dos cosas: un preset de sólo ancho muestra el reflow pero nunca lo que queda bajo la línea de flotación, que es la mitad de lo que una pantalla chica le hace a un layout.",
    "componentPreview.screenBody2":
      "Las medidas caen a propósito a cada lado de los breakpoints del sistema (<code>compact</code> 36rem, <code>desktop</code> 52rem): móvil 390×844 queda debajo de los dos, tablet 768×1024 queda en medio. Así los dos presets ejercitan las bandas donde el layout realmente cambia, en vez de ser dos anchos arbitrarios. Van en <code>px</code> y no en <code>rem</code> porque el viewport de un dispositivo es una medida física: quien sube el tamaño de fuente raíz quiere ver <em>ese</em> reflow en una pantalla de teléfono, no un teléfono que creció.",
    "componentPreview.screenBody3":
      "El ejemplo de abajo es un <code>Grid</code> multicol, cuyos carriles están atados justamente a esos breakpoints: uno debajo de <code>compact</code>, dos a partir de ahí, tres desde <code>desktop</code>. Cada preset cae en una banda distinta, así que los tres se ven diferentes. Las media queries resuelven contra el viewport <strong>del frame</strong>, que es el ancho del preset: eso es lo que compra el <code>iframe</code> y no compraría una container query sobre un <code>div</code>.",
    "componentPreview.screenNote": "3 carriles libre · 2 en tablet · 1 en móvil",
    "componentPreview.screenBody4":
      "Con un preset activo el stage es un dispositivo: el runtime deja de auto-ajustar y el documento scrollea adentro, igual que en el aparato real. El resizer se esconde (el preset ya es dueño del alto, y dos dueños del mismo alto es el bug); volver a <em>Libre</em> devuelve el arrastre. El alto se topa en <code>80svh</code> para que el código de abajo siga alcanzable: el frame scrollea, así que lo único que se pierde es la fidelidad de las unidades <code>vh</code> del propio ejemplo.",
    "componentPreview.screenBody5":
      "Viene <strong>encendido en todos los previews</strong> del sitio. «¿Esto aguanta en un teléfono?» es una pregunta que se le puede hacer a cualquier componente, no sólo a los que son evidentemente un layout: la etiqueta de un botón envuelve, una tabla se desborda, un dialog no entra. Dejarlo a criterio de quien escribe cada página significaría tener la respuesta justamente en las demos que alguien ya pensó, que son las que ya estaban bien.",
    "componentPreview.screenBody6":
      'La elección es <strong>del documento, no del preview</strong>, y se comparte igual que la preferencia Vanilla | React: cambiarla en un ejemplo la cambia en todos, vive en <code>&lt;html data-sk-component-preview-screen-pref&gt;</code> y se guarda en <code>localStorage["sk"].screen</code>, así que sobrevive a recargas y a navegar entre páginas. Es la misma razón que en el binding: el lector le está haciendo la pregunta <em>a la página</em>, no a una demo suelta, y elegir de nuevo en cada ejemplo que pasa sería el trabajo que la preferencia compartida existe para evitar. <em>Libre</em> es la ausencia del atributo, no un tercer valor.',
    "componentPreview.screenBody7":
      "Los tres controles son iconos del vocabulario estable (<code>screen-desktop</code>, <code>screen-tablet</code> y <code>screen-mobile</code>), así que los tres sets homologados los dibujan. Sin texto visible, cada opción lleva su nombre en <code>aria-label</code> y en <code>title</code>: el glifo es decorativo, exactamente como en un Button icon-only.",
    "componentPreview.screenBody8":
      "Se apaga por preview con <code>screens={false}</code>, para los casos donde el preset engaña más de lo que informa.",
    "componentPreview.fullTitle": "El ejemplo completo",
    "componentPreview.fullBody":
      "La superficie entera, también anidada: cabecera con nota, recarga y tabs de binding, stage, resizer y un CodePreview por binding. Los tabs de adentro son independientes de los de afuera: la preferencia Vanilla | React se comparte por documento, y el frame es su propio documento.",
    "componentPreview.fullNote": "la superficie completa",
    "componentPreview.bareTitle": "La parte portable",
    "componentPreview.bareBody1":
      "Todo lo de arriba (el selector Vanilla/React, los presets de pantalla, el compilador de árboles que arma cada stage) es la maquinaria de ESTE sitio para comparar dos bindings de OTRO componente. Ninguna parte de eso es algo que un consumidor compondría en su producto.",
    "componentPreview.bareBody2":
      "Lo que sí es portable: un título con su nota, un stage con lo que se muestra, y su código debajo, compuesto desde <code>CodePreview</code>, no reimplementado. Eso es <code>ComponentPreview.bare</code>, la misma raíz y las mismas parts con menos anatomía, igual que <code>Popover.bare</code>.",
    "componentPreview.mountTitle": "Montar explícitamente",
    "componentPreview.mountBody":
      "ComponentPreview y CodePreview quedan fuera de <code>initComponents()</code>: una aplicación no descarga superficies de documentación por accidente. Ese montaje controla la superficie host; el contenido del <code>srcdoc</code> ejecuta su propio entry point.",
    "componentPreview.frameMountLabel": "runtime dentro del srcdoc",
    "componentPreview.test1": "Cambia el binding y monta el panel de fuente Vanilla anidado de forma idempotente.",
    "componentPreview.test2": "El toggle Vanilla | React se comparte entre todos los previews de la página.",
    "componentPreview.test3":
      "Recorre libre → tablet → mobile → libre al hacer click, marcando el stage y limpiándolo para libre.",
    "componentPreview.test4": "Recarga el stage del srcdoc desde el documento autorado.",

    "datePicker.description":
      "Campo de fecha único o en rango, con nativo type=date y calendario custom detrás de un trigger.",
    "datePicker.lede":
      'Dos versiones, un solo campo. La <strong>nativa</strong> es un <code>&lt;input type="date"&gt;</code> con el chrome del sistema: teclado, formulario y calendario del SO vienen de la plataforma, sin JavaScript. La <strong>custom</strong> monta un <a href="/componentes/calendar">Calendar</a> detrás de un trigger con la misma forma de campo, para cuando necesitas rango, localización explícita o un calendario consistente entre navegadores. Las dos comparten <code>.sk-date-picker__control</code>, así que se ven igual. El calendario en sí (encabezado, vistas, grillas) es responsabilidad de Calendar, no de este componente: DatePicker sólo lo nestea dentro de su popover.',
    "datePicker.nativeTitle": "Nativo",
    "datePicker.nativeBody": "El control de plataforma, sin JavaScript ni enhancer.",
    "datePicker.nativeLabel": "DatePicker nativo",
    "datePicker.customTitle": "Custom",
    "datePicker.customBody": "El campo custom y su calendario emergente viven en una demostración independiente.",
    "datePicker.customLabel": "DatePicker custom",
    "datePicker.disabledTitle": "Disabled",
    "datePicker.disabledBody":
      "<code>data-disabled</code> en la raíz configura la máquina y Zag reparte el estado solo: <code>data-disabled</code> en <code>sk-date-picker__control</code>, y un <code>disabled</code> nativo en el input y en el trigger. Pero cada uno de esos tres leía su color/fondo/borde desde un hook (<code>--sk-date-picker-fg</code>/<code>-bg</code>/<code>-border-color</code>) declarado sin condición, así que deshabilitar el campo no cambiaba nada de lo que esos hooks resolvían: el campo seguía leyéndose interactivo. La regla vive ahora en un solo lugar, <code>.sk-date-picker__control[data-disabled]</code>, que reescribe esos tres hooks: el input y el trigger los heredan sin reglas propias.",
    "datePicker.disabledLabel": "DatePicker (disabled)",
    "datePicker.whichTitle": "Cuál usar",
    "datePicker.whichBody":
      "Empieza por el <strong>nativo</strong>: es el que funciona sin JS y el que el sistema operativo ya sabe presentar en cada plataforma. Sube al <strong>custom</strong> sólo cuando el nativo no alcanza: selección de <em>rango</em>, una zona horaria y un locale que no pueden quedar como string ambiguo, o un calendario que se vea igual en todos los navegadores. Es la misma decisión que Select nativo vs. Select custom.",
    "datePicker.contractBody":
      'React ofrece <code>DatePicker</code> sobre la misma máquina que <code>Calendar</code> (<code>@zag-js/date-picker</code>), y reusa el mismo cuerpo de calendario: no hay dos implementaciones del grid. Vanilla hidrata el <code>data-sk-date-picker</code> autorado: parchea el control y renderiza el calendario con el componente compartido de Calendar. El input <code>type="date"</code> nativo no necesita enhancer.',
    "datePicker.mobileTitle": "En móvil",
    "datePicker.mobileBody":
      'Bajo el breakpoint de escritorio (30rem) el calendario custom deja de colgar del campo y se vuelve una <strong>hoja inferior</strong>: el positioner llena la pantalla como scrim y el contenido se ancla al borde inferior, a todo el ancho, y sube. Toma el <em>aspecto</em> del Vaul, no el arrastre (es un popover de Zag, no un <code>&lt;dialog&gt;</code> nativo), pero cierra igual al tocar fuera o con <kbd class="sk-kbd">Esc</kbd>. Es el mismo corte responsivo que <a href="/componentes/dialog">Dialog Vaul</a>.',
    "datePicker.a11yBody":
      'La fecha usa valores <code>DateValue</code> y zona horaria explícita; no se modela como string ambiguo de locale. El control conserva nombre accesible por su <code>label</code>. La accesibilidad del grid en sí (rol, navegación por teclado, cambio de vista) es contrato de <a href="/componentes/calendar">Calendar</a>.',
    "datePicker.test1": "Rechaza markup al que le falta una parte que necesita parchar.",
    "datePicker.test2": "Parcha el control autorado y renderiza el popover alrededor de un calendario.",
    "datePicker.test3": "Llena el campo con el día que eligió quien lee.",

    "drawer.description": "Un Vaul en el borde inline, a lo alto de la pantalla. Envía hooks y nada de estructura.",
    "drawer.lede":
      'Un drawer <strong>es</strong> un <a href="/vaul">Vaul</a> en el borde inline, corriendo a lo alto de la pantalla. Esa frase es el componente entero: el borde, el slide, el backdrop, el drag y el top layer son del pattern, y este archivo sólo dice <em>qué Vaul es un drawer</em> y cómo se ve.',
    "drawer.hooksTitle": "Envía hooks y nada de estructura",
    "drawer.hooksBody1":
      "Por la regla del sistema: cada línea de estructura que un drawer podría tener es estructura que una hoja inferior necesita idéntica, y esa estructura compartida <strong>es</strong> el pattern. Un drawer que reimplementara el panel sería un segundo Vaul con otro nombre.",
    "drawer.hooksBody2":
      "Los hooks del drawer <strong>son</strong> los del Vaul, re-declarados. Un consumidor afina <code>--sk-drawer-*</code> y no se entera nunca de que hay un Vaul abajo: el pattern queda como detalle de implementación en vez de una segunda superficie pública que mantener sincronizada.",
    "drawer.whenTitle": "Cuándo es un drawer y cuándo no",
    "drawer.whenHeadNeed": "Necesitas",
    "drawer.whenHeadUse": "Usa",
    "drawer.whenRow1Need": "Navegación o filtros al costado, a lo alto",
    "drawer.whenRow1Use": "<code>sk-drawer</code>",
    "drawer.whenRow2Need": "Una hoja que sube desde abajo en móvil",
    "drawer.whenRow2Use": '<a href="/componentes/dialog">Dialog</a> (opción Vaul)',
    "drawer.whenRow3Need": "Una caja centrada",
    "drawer.whenRow3Use": '<a href="/componentes/dialog">Dialog</a>',
    "drawer.whenRow4Need": "Un riel permanente que no tapa la página",
    "drawer.whenRow4Use": '<a href="/componentes/sidebar">Sidebar</a>',
    "drawer.whenBody":
      'El sidebar y el drawer no compiten: un <a href="/componentes/sidebar">sidebar</a> es un shell que vive en el layout, y un drawer es modal y tapa la página. Este sitio usa los dos, el riel arriba de 52rem, el drawer abajo, con <strong>una sola</strong> nav-list adentro de los dos.',
    "drawer.markupTitle": "Markup contract",
    "drawer.markupBody":
      "El root lleva <code>sk-vaul sk-drawer</code> sobre un <code>&lt;dialog&gt;</code> nativo, Vaul lo exige, más su <code>data-edge</code>. El handle es opcional: sin él no hay drag, y el drawer sigue completo.",
    "drawer.nativeTitle": "Drawer nativo",
    "drawer.nativeLede":
      'La misma superficie puede quedarse en la plataforma. Conserva <code>&lt;dialog class="sk-vaul sk-drawer"&gt;</code>, omite <code>data-sk-vaul</code> y ábrelo con <code>showModal()</code>: no carga enhancer, drag ni light-dismiss.',
    "drawer.nativeBody":
      "<code>&lt;form method=\"dialog\"&gt;</code> cierra sin un listener propio; Escape, foco, página inerte, backdrop y restauración pertenecen al navegador. Los estilos y la transición siguen siendo los mismos porque viven en Core, no en el enhancer.",
    "drawer.nativeLabel": "Drawer nativo",
    "drawer.openTitle": "Abrir",
    "drawer.nativeContractTitle": "Contrato nativo",
    "drawer.nativeContractItem1": "La raíz sigue siendo un <code>&lt;dialog&gt;</code> abierto con <code>showModal()</code>.",
    "drawer.nativeContractItem2": "Sin <code>data-sk-vaul</code>, el auto-loader no monta nada.",
    "drawer.nativeContractItem3": "Sin handle no se anuncia una interacción de drag que no existe.",
    "drawer.nativeContractItem4": "El enhancer sólo hace falta para drag-to-dismiss y light-dismiss.",
    "drawer.compositionComment": "un drawer ES un Vaul",
    "drawer.compositionComment2": "toca tres bordes del viewport: un radio ahí se lee como\n     un error",
    "drawer.demoOpenLabel": "Abrir drawer nativo",
    "drawer.demoPanelTitle": "Panel nativo",
    "drawer.demoPanelBody": "La plataforma posee modalidad, foco, Escape y restauración.",
    "drawer.demoCloseLabel": "Cerrar",
    "drawer.demoAriaLabel": "Drawer nativo de ejemplo",
    "drawer.test1": "Agrega el modificador de drawer solo para la firma de drawer.",

    "emptyState.description": "Explica por qué no hay contenido y ofrece una siguiente acción concreta.",
    "emptyState.contractBody": "El título nombra el estado, la descripción explica, y la acción resuelve. No uses EmptyState durante carga.",
    "emptyState.a11yBody": "El icono es decorativo; el texto y la acción sostienen el significado sin depender de una ilustración.",

    "fileUploadPage.description": "Selección y drag-and-drop con límites, rechazo y lista de archivos.",
    "fileUploadPage.contractBody": "Vanilla emite sk-file-change y nunca inventa una carga remota. React expone archivos aceptados y rechazados.",
    "fileUploadPage.a11yBody": "El input real permanece disponible para formularios y tecnología asistiva; la dropzone no lo sustituye.",

    "flyout.description": "Flyout: elige un valor como Select, con el panel al lado del trigger.",
    "flyout.lede1":
      'Un selector de valor como <a href="/componentes/select">Select</a>, pero el panel abre al <strong>inline-end</strong> del trigger (no debajo). Pensado para rieles estrechos (por ejemplo el sidebar de <a href="/personalizar">Personalizar</a>) donde un menú hacia abajo no cabe.',
    "flyout.lede2":
      "No es un “menu” de navegación (ADR-0017): es un picker. Abre al <strong>click</strong> del trigger (y con teclado). Elegir un ítem emite <code>sk-value-change</code> y cierra. Escape o click fuera también cierran. Solo puede haber un Flyout abierto a la vez.",
    "flyout.whenTitle": "Cuándo usarlo",
    "flyout.whenItem1":
      "<strong>Flyout</strong>: el espacio debajo del control es escaso (sidebar, toolbar, rail) y el panel debe abrirse al lado.",
    "flyout.whenItem2":
      '<strong>Select</strong>: hay sitio debajo, quieres typeahead / posicionamiento Zag, o es un formulario estándar. Para elección nativa de plataforma, usa el <a href="/componentes/select#select-nativo">Select nativo</a>.',
    "flyout.behaviorTitle": "Comportamiento",
    "flyout.behaviorItem1":
      "<strong>Abrir:</strong> click en el trigger, o teclado (<code>Enter</code>, <code>Space</code>, <code>ArrowDown</code>, <code>ArrowRight</code>). No abre al hover.",
    "flyout.behaviorItem2":
      '<strong>Elegir:</strong> click o <code>Enter</code> / <code>Space</code> en un ítem. Emite <code>sk-value-change</code> con <code>{\'{ value: string[] }\'}</code> y cierra.',
    "flyout.behaviorItem3": "<strong>Cerrar:</strong> Escape (devuelve el foco al trigger), click fuera, o elegir un ítem.",
    "flyout.behaviorItem4":
      "<strong>Exclusivo:</strong> al abrir uno, los demás escuchan <code>sk-flyout-open</code> y se cierran.",
    "flyout.behaviorItem5":
      "<strong>Ancho:</strong> el panel mide al menos <code>280px</code> y crece con el ítem más largo (con tope de viewport).",
    "flyout.behaviorItem6":
      "<strong>Viewport:</strong> si no cabe al inline-end, abre al inline-start; el top se ajusta para no salirse del viewport (también al hacer scroll o resize).",
    "flyout.anatomyTitle": "Anatomía",
    "flyout.anatomyBody":
      'Los items <strong>son</strong> la colección: el enhancer los lee del DOM. Cada <code>data-sk-flyout-item</code> necesita un <code>data-value</code>. El panel vive en el root (<code>position: absolute</code> por defecto; el enhancer lo fija con <code>position: fixed</code> cuando un ancestro recorta).',
    "flyout.vanillaInitTitle": "Inicializar Vanilla",
    "flyout.listenTitle": "Escuchar el cambio",
    "flyout.railTitle": "En un riel estrecho",
    "flyout.railBody":
      "El caso típico: un control de ~13.5rem de ancho. El panel sale al inline-end y no compite con el alto del rail.",
    "flyout.railLabel": "Flyout en riel",
    "flyout.exclusiveTitle": "Solo uno abierto",
    "flyout.exclusiveBody":
      "Abre uno y luego el otro: el primero se cierra solo. Mismo contrato en Vanilla y React vía el evento de documento <code>sk-flyout-open</code>.",
    "flyout.exclusiveLabel": "Dos Flyouts",
    "flyout.disabledItemTitle": "Ítem deshabilitado",
    "flyout.disabledItemBody":
      "Marca el ítem con <code>data-disabled</code> (o <code>disabled: true</code> en React). No se puede elegir; el resto sigue activo.",
    "flyout.disabledItemLabel": "Ítem deshabilitado",
    "flyout.disabledTitle": "Flyout deshabilitado",
    "flyout.disabledBody": "<code>data-disabled</code> en la raíz (o <code>disabled</code> en React) bloquea apertura y cambio de valor.",
    "flyout.disabledLabel": "Flyout deshabilitado",
    "flyout.longTitle": "Lista larga",
    "flyout.longBody":
      "El panel limita su alto (<code>--sk-flyout-panel-max-block-size</code>, 18rem por defecto) y hace scroll cuando hace falta.",
    "flyout.longLabel": "Lista larga",
    "flyout.placeholderTitle": "Placeholder",
    "flyout.placeholderBody":
      "Si no hay <code>data-value</code> que coincida con un ítem (por ejemplo un valor externo “personalizado”) el trigger muestra el placeholder.",
    "flyout.placeholderLabel": "Placeholder",
    "flyout.remountTitle": "Remontar con otro valor",
    "flyout.remountBody":
      'El enhancer posee el texto del trigger. Para forzar un valor desde fuera (reset, URL, reparación), desmonta, escribe <code>data-value</code> y vuelve a montar, el mismo patrón que usa <a href="/personalizar">Personalizar</a>.',
    "flyout.contractItem1": "La raíz lleva <code>data-sk-flyout</code> y la anatomía de parts documentada.",
    "flyout.contractItem2":
      'El evento de valor es el mismo que Select: <code>sk-value-change</code> con <code>{\'{ value: string[] }\'}</code>.',
    "flyout.contractItem3": 'Apertura exclusiva vía <code>sk-flyout-open</code> (detalle <code>{\'{ root }\'}</code>).',
    "flyout.contractItem4": "Sin máquina Zag en v1: enhancer propio, apertura por click/teclado.",
    "flyout.contractItem5": "React renderiza el mismo contrato sin portal (panel en el root).",
    "flyout.contractItem6": "El enhancer no inventa clases; solo conecta los nodos autorados.",
    "flyout.test1": "Abre al hacer click y mantiene ARIA + el texto de valor sincronizados.",
    "flyout.test2": "Cierra con Escape.",
    "flyout.test3": "Mantiene abierto un solo flyout a la vez.",
    "flyout.test4": "Voltea el panel a inline-start cuando el lado final se sale del viewport.",

    "grid.description": "Grid: columnas iguales con gap nombrado y semántica elegida por quien lo usa.",
    "grid.lede":
      "Una grilla de columnas iguales para grupos de contenido. Cada columna usa <code>minmax(0, 1fr)</code>: evita que el tamaño mínimo intrínseco ensanche las columnas.",
    "grid.multicolTitle": "CSS Multi-column Layout",
    "grid.multicolBody1":
      '<a href="https://www.w3.org/TR/css-multicol-1/">CSS Multi-column Layout Module Level 1</a> llama <strong>multi-column layout</strong> a este flujo. <code>data-multicol</code> activa las columnas CSS: cada tarjeta termina antes de partirse y la siguiente continúa en el mismo carril.',
    "grid.multicolBody2":
      '<code>data-columns</code> marca el máximo de carriles. Con <code>data-columns="4"</code>, la colección usa 1 carril antes de <code>36rem</code>, 2 desde <code>36rem</code>, 3 desde <code>52rem</code> y 4 desde <code>72rem</code>. Valores <code>1</code>, <code>2</code> y <code>3</code> se detienen en ese máximo.',
    "grid.multicolLabel": "Multi-column layout",
    "grid.multicolBody3":
      "Las columnas llenan un carril de arriba hacia abajo antes de pasar al siguiente. Conserva un orden útil en el DOM y úsalo para tarjetas independientes; no para una secuencia cuyo orden visual de izquierda a derecha tenga significado.",
    "grid.htmlTitle": "HTML autorado",
    "grid.htmlBody": "Elige el elemento semántico, como <code>section</code>, y aplica <code>sk-grid</code>. No requiere inicialización vanilla.",
    "grid.reactBody": "La prop <code>as</code> conserva esa elección semántica.",
    "grid.contractItem1":
      "<code>sk-grid</code> crea una grilla de columnas iguales; <code>data-columns</code> admite <code>1</code>, <code>2</code>, <code>3</code> o <code>4</code>.",
    "grid.contractItem2":
      "<code>data-gap</code> admite <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>; el valor por defecto es <code>md</code>.",
    "grid.contractItem3":
      "<code>data-multicol</code> activa el muro de tarjetas por columnas. <code>data-columns</code> define su máximo de carriles: 1 → 2 → 3 → 4 en los breakpoints <code>36rem</code>, <code>52rem</code> y <code>72rem</code>. En React se pasa como <code>data-multicol</code>.",
    "grid.contractItem4": "En React, <code>Grid</code> recibe <code>as</code>, <code>columns</code> y <code>gap</code>; <code>columns</code> tiene por defecto <code>1</code>.",
    "grid.test1": "Renderiza Stack, Inline y Grid según los contratos de layout documentados.",
    "layoutGridPage.description":
      "Layout Grid: un flujo de página con medidas narrow, content, breakout y full-width.",
    "layoutGridPage.lede":
      "Layout Grid da cuatro anchos nombrados a un único flujo de contenido. El elemento raíz conserva su semántica —puede ser <code>main</code>, <code>article</code> o una sección— y cada hijo directo decide si necesita otra medida con <code>data-width</code>.",
    "layoutGridPage.exampleKicker": "Guía de publicación",
    "layoutGridPage.exampleTitle": "Una guía que se lee de principio a fin",
    "layoutGridPage.exampleIntro":
      "Una página clara convierte una decisión compleja en un recorrido que se puede seguir.",
    "layoutGridPage.exampleFirstSectionTitle": "Primero, define la historia",
    "layoutGridPage.exampleFirstSectionBody":
      "La jerarquía y el ritmo hacen que cada sección llegue en el momento indicado.",
    "layoutGridPage.exampleHeroKicker": "Actualización de producto",
    "layoutGridPage.exampleHeroTitle": "Una decisión necesita espacio para respirar",
    "layoutGridPage.exampleHeroBody":
      "El fondo cambia el contexto sin soltar el hilo de lectura.",
    "layoutGridPage.exampleSecondSectionTitle": "Después, acompaña la decisión",
    "layoutGridPage.exampleSecondSectionBody":
      "La misma medida mantiene la lectura estable mientras el contenido gana importancia.",
    "layoutGridPage.exampleFooter":
      "Skryensya UI · Un sistema para interfaces cuidadas.",
    "layoutGridPage.levelsTitle": "Cuatro anchos, un flujo",
    "layoutGridPage.levelsBody":
      "Sin atributo, cada hijo directo vive en <code>content</code>. Sólo agrega <code>data-width</code> cuando el elemento necesita una medida distinta; no hace falta un wrapper por nivel.",
    "layoutGridPage.levelNarrow": "Prosa, resúmenes o formularios de lectura concentrada.",
    "layoutGridPage.levelContent": "La medida por defecto para el contenido principal.",
    "layoutGridPage.levelBreakout": "Figuras, tablas o grupos que necesitan más aire lateral.",
    "layoutGridPage.levelFullWidth": "Fondos, bordes o medios que llegan al borde de la grilla.",
    "layoutGridPage.fullWidthTitle": "Full-width sin soltar el contenido",
    "layoutGridPage.fullWidthBody":
      "Un hijo directo <code>full-width</code> se vuelve una grilla con las mismas columnas. Sus hijos directos vuelven a <code>content</code> por defecto, y pueden usar <code>narrow</code>, <code>breakout</code> o <code>full-width</code> otra vez.",
    "layoutGridPage.htmlTitle": "HTML semántico",
    "layoutGridPage.htmlBody":
      "La clase sólo define la geometría. Elige <code>main</code>, <code>section</code>, <code>figure</code> y los demás elementos por lo que significan; <code>data-width</code> sólo acepta <code>narrow</code>, <code>content</code>, <code>breakout</code> o <code>full-width</code>.",
    "layoutGridPage.reactBody":
      "En React, <code>LayoutGrid</code> sólo imprime <code>sk-layout-grid</code>; los hijos conservan sus elementos y el mismo <code>data-width</code>.",
    "layoutGridPage.configTitle": "Configuración pública",
    "layoutGridPage.configBody1":
      "Los cuatro custom properties públicos viven en el root y se pueden sobrescribir por página o sección.",
    "layoutGridPage.configBody2":
      "Conserva <code>narrow ≤ content ≤ breakout</code>. Los tracks intermedios se calculan a partir de esas diferencias; invertir el orden no describe una medida válida.",
    "layoutGridPage.test1":
      "Renderiza LayoutGrid sin apropiarse de la semántica ni de data-width de sus hijos.",

    "heading.description": "Heading: jerarquía semántica y tamaño visual independientes.",
    "heading.lede":
      "Heading separa la jerarquía del documento de su apariencia. Elige <code>as</code> según el nivel semántico y <code>size</code> según el tamaño que necesita el contexto visual.",
    "heading.sizesTitle": "Tamaños",
    "heading.sizesBody":
      "Tres displays encima de la escala de documento. En el documento, <code>h1</code>–<code>h4</code> bajan de tamaño; <code>h5</code> y <code>h6</code> comparten el piso de <code>h4</code> (18px).",
    "heading.displayTitle": "Display",
    "heading.displayLabel": "Escala display",
    "heading.documentTitle": "Documento",
    "heading.documentLabel": "Escala h1–h6",
    "heading.pageTitleTitle": "Título de página",
    "heading.pageTitleBody": "El único <code>h1</code> presenta la página; un display aporta presencia sin inventar otra semántica.",
    "heading.pageTitleLabel": "Título de página",
    "heading.outlineTitle": "Jerarquía de secciones",
    "heading.outlineBody": "La estructura avanza de <code>h2</code> a <code>h3</code>; el tamaño visual puede acompañar el nivel.",
    "heading.outlineLabel": "Jerarquía de contenido",
    "heading.compactTitle": "Jerarquía compacta",
    "heading.compactBody": "Un heading conserva su lugar en el documento aunque el contexto visual use el piso <code>h4</code>.",
    "heading.compactLabel": "Heading compacto",
    "heading.flushTitle": "Flush",
    "heading.flushBody":
      "<code>data-flush</code> (React: <code>flush</code>) quita el aire de block, arriba y abajo. Es opt-in explícito: úsalo cuando el heading es lo primero (o lo último) del contenedor (título de dialog con <code>sk-dialog__title</code>, cabecera de card) y no quieres que el margen o el padding lo empujen contra el borde. No se infiere de <code>:first-child</code>.",
    "heading.flushLabel": "Heading flush",
    "heading.contractItem1":
      "<code>data-size</code> acepta <code>display-lg</code>, <code>display-md</code>, <code>display-sm</code>, <code>h1</code>, <code>h2</code>, <code>h3</code>, <code>h4</code>, <code>h5</code> y <code>h6</code>. <code>h5</code>/<code>h6</code> pintan igual que <code>h4</code>.",
    "heading.contractItem2": "Aliases legados: <code>sm</code>→<code>h3</code>, <code>md</code>→<code>h2</code>, <code>lg</code>→<code>h1</code>, <code>display</code>→<code>display-sm</code>.",
    "heading.contractItem3": "En HTML, usa <code>h1</code>–<code>h6</code> para la jerarquía del documento; <code>data-size</code> no la modifica.",
    "heading.contractItem4": "En React, <code>as</code> acepta <code>h1</code>–<code>h6</code> (default <code>h2</code>); <code>size</code> por defecto es <code>h2</code>.",
    "heading.contractItem5": "<code>data-flush</code> / React <code>flush</code>: sin margen ni padding de block (arriba y abajo). Explícito; no automático.",
    "heading.contractItem6": "No requiere inicialización vanilla.",
    "heading.test1": "Separa la jerarquía del encabezado de su tamaño visual.",
    "heading.test2": "El flush se activa con un atributo explícito, no por posición.",
    "heading.test3": "El tamaño visual de h5 y h6 tiene un piso en h4.",

    "iconPage.description":
      "Icon: el pattern sk-icon en React y vanilla, con roles del vocabulario, geometría propia, tamaños y a11y en el call site.",
    "iconPage.lede":
      'Cómo pones un icono en pantalla: <code>&lt;Icon&gt;</code> en React, <code>data-sk-icon</code> + <code>mountIcons</code> en vanilla, o el <code>&lt;svg class="sk-icon"&gt;</code> a mano. El vocabulario de roles, los sets como marca y por qué el CSS no toca fill/stroke viven en <a href="/iconos">Iconografía</a>.',
    "iconPage.reactTitle": "React",
    "iconPage.reactBody1":
      "<code>Icon</code> toma <code>name</code> <strong>o</strong> <code>data</code>, nunca los dos. <code>name</code> es un rol portable que sobrevive un cambio de set; <code>data</code> es geometría tuya, acoplada a propósito y visible en el call site.",
    "iconPage.reactNote": "React renderiza (decisión 14)",
    "iconPage.reactBody2":
      '<code>&lt;Icon name="…"&gt;</code> dibuja sin configuración: Phosphor viaja con <code>@skryensya/react</code>. Para otro set, lo instalas y envuelves la app una vez.',
    "iconPage.providerNote": "Lucide/Material son opt-in",
    "iconPage.providerLabel": "cambiar el set por defecto",
    "iconPage.vanillaTitle": "Vanilla: hidratar por nombre, o escribir el markup",
    "iconPage.vanillaBody1":
      "<code>mountIcons(root, set)</code> reemplaza un placeholder con el <strong>nombre</strong> del rol por el mismo <code>&lt;svg class=\"sk-icon\"&gt;</code> que escribirías a mano. El set es siempre explícito; para dos sets en una página, hidratas cada subárbol con el suyo.",
    "iconPage.vanillaHydrateNote": "escribes el nombre, no el <svg>",
    "iconPage.vanillaBindLabel": "una vez, al arrancar",
    "iconPage.vanillaBindNote": "mountIcons no lo llama initComponents()",
    "iconPage.vanillaBody2":
      "Un <code>data-sk-icon</code> que el set no cubre se deja intacto y se avisa: la geometría del <strong>proyecto</strong> no es un rol, y se escribe como <code>&lt;svg&gt;</code> propio.",
    "iconPage.vanillaRawLabel": "geometría propia, a mano",
    "iconPage.vanillaRawNote": "para un dibujo que ningún set tiene",
    "iconPage.a11yItem1":
      "<strong>Sin <code>label</code> el icono es decorativo</strong>, lleva <code>aria-hidden=\"true\"</code>. Es el caso normal: en un botón con texto, el texto ya nombra la acción.",
    "iconPage.a11yItem2":
      '<strong>En un botón de solo icono, el nombre accesible es del botón</strong> (<code>aria-label="Cerrar diálogo"</code>), no del <code>&lt;svg&gt;</code>. El icono adentro sigue decorativo.',
    "iconPage.a11yItem3":
      "<strong>Con <code>label</code> el icono es contenido</strong>, <code>role=\"img\"</code> más <code>aria-label</code>. Solo cuando el icono se para solo y significa algo por sí mismo.",
    "iconPage.a11yItem4": "<code>focusable=\"false\"</code> siempre: un <code>&lt;svg&gt;</code> no es un tab stop.",
    "iconPage.sizeTitle": "Tamaño",
    "iconPage.sizeBody":
      "Tres valores de <strong>un</strong> hook. <code>--sk-icon-size</code> es invariante a densidad: la densidad es espaciado; un icono es contenido al lado de un glifo: si el texto no encoge, el icono tampoco.",
    "iconPage.sizeLabel": "Icon · sm / md / lg",
    "iconPage.sizeNote": "no hay prop numérica",
    "iconPage.test1": "Resuelve un nombre estable contra el set enlazado.",
    "iconPage.test2": "Renderiza geometría propia del proyecto sin ningún binding.",
    "iconPage.test3": "Es decorativo sin un label, y es contenido con uno.",

    "imageFrame.description": "ImageFrame: marco que recorta y posiciona media con aspect-ratio, object-fit y object-position.",
    "imageFrame.lede":
      'ImageFrame es el <strong>marco de media</strong>: una caja que fija un aspect ratio, recorta con radio/borde y decide cómo llena la imagen (<code>object-fit</code>) y desde dónde (<code>object-position</code>). No es un componente de imagen con CDN ni un Avatar: es el pattern que Card, Tile y galerías reutilizan en vez de copiar <code>aspect-ratio</code> a mano. Para tipo sobre la foto, compón con <a href="/gradientes">Gradientes</a> (<code>sk-media-gradient</code>).',
    "imageFrame.aspectTitle": "Aspect",
    "imageFrame.aspectBody":
      "<code>data-aspect</code> es la caja, no el archivo. Con <code>cover</code> (por defecto) la media rellena y se recorta; con <code>auto</code> el marco sigue la medida intrínseca del media.",
    "imageFrame.fitTitle": "Fit",
    "imageFrame.fitBody":
      "Misma caja <code>1/1</code>, distinto <code>data-fit</code>: <code>cover</code> recorta, <code>contain</code> letterboxa (se ve el fondo del marco), <code>fill</code> estira.",
    "imageFrame.positionTitle": "Position",
    "imageFrame.positionBody":
      "Con <code>cover</code>, <code>data-position</code> elige el ancla del recorte. El demo concentra un disco arriba-izquierda y un bloque abajo-derecha para que el ancla se note.",
    "imageFrame.reactBody":
      '<code>src</code> / <code>alt</code> pintan un <code>img</code> con la clase media. Para <code>picture</code> o <code>video</code>, pasa hijos con <code>className="sk-image-frame__media"</code> (o deja el <code>img</code>/<code>video</code> como hijo directo: el CSS también los alcanza).',
    "imageFrame.contractItem1":
      "Raíz: <code>sk-image-frame</code>. Media: <code>sk-image-frame__media</code>, o <code>img</code>/<code>video</code>/<code>picture &gt; img</code> hijo directo.",
    "imageFrame.contractItem2":
      "<code>data-aspect</code>: <code>auto</code>, <code>1/1</code>, <code>4/3</code>, <code>3/2</code>, <code>16/9</code>, <code>3/4</code>, <code>2/3</code>, <code>9/16</code>.",
    "imageFrame.contractItem3":
      "<code>data-fit</code>: <code>cover</code> (default), <code>contain</code>, <code>fill</code>, <code>none</code>, <code>scale-down</code>.",
    "imageFrame.contractItem4":
      "<code>data-position</code>: <code>center</code> (default), <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>, y las cuatro esquinas (<code>top-left</code>, …).",
    "imageFrame.contractItem5":
      "<code>data-radius</code>: <code>none</code>, <code>top</code>, <code>control</code>, <code>surface</code>, <code>pill</code> (default).",
    "imageFrame.contractItem6": "<code>data-border</code>: <code>none</code> (default), <code>subtle</code>, <code>default</code>.",
    "imageFrame.contractItem7":
      "Hooks: <code>--sk-image-frame-aspect</code>, <code>--sk-image-frame-fit</code>, <code>--sk-image-frame-position</code>, <code>--sk-image-frame-radius</code>, <code>--sk-image-frame-border-*</code>, <code>--sk-image-frame-bg</code>.",
    "imageFrame.test1": "Traduce las props de geometría a atributos <code>data-*</code> en la raíz autorada.",
    "imageFrame.test2": "Renderiza un <code>img</code> desde <code>src</code>/<code>alt</code> cuando no se pasan hijos.",
    "imageFrame.test3": "Mantiene un caption junto al medio de <code>src</code>.",

    "inputPage.description": "Input: el control de texto nativo, con una clase para el input y el textarea.",
    "inputPage.title": "Input",
    "inputPage.lede":
      "El control de texto nativo se queda nativo: no hay máquina, y no hay un <code>div</code> con borde haciéndose pasar por input. La plataforma se queda con la validación, el autofill, el IME y la asociación al formulario.",
    "inputPage.densityBody": 'La densidad compacta el espacio alrededor del campo, no su área de interacción: Input conserva un mínimo de <code>44px</code> de alto, incluso con <code>data-size="sm"</code>.',
    "inputPage.oneClassTitle": "Una clase para todo control de texto",
    "inputPage.oneClassBody":
      "<code>sk-input</code> va en el <code>&lt;input&gt;</code> y en el <code>&lt;textarea&gt;</code>: es el mismo control visual, así que es un solo set de hooks. Una segunda clase sería un segundo set que mantener sincronizado con el primero.",
    "inputPage.formFieldTitle": "El rótulo no es del Input",
    "inputPage.formFieldBody":
      'Los dos demos de arriba están envueltos en un <a href="/componentes/form-field">FormField</a>, y no por costumbre: el rótulo, la ayuda, el mensaje de error y los seis ids que los atan viven ahí. Por eso este contrato no tiene <code>invalid</code> ni <code>id</code> propios — un control que trajera su propio <code>aria-invalid</code> podría contradecir al mensaje que tiene al lado. Un <code>Input</code> fuera de un <code>FormField</code> igual es un control válido, siempre que lleve su <code>aria-label</code>.',
    "inputPage.nativeTitle": "NativeInput: el control sin la apariencia",
    "inputPage.nativeBody":
      'La tercera signature del contrato es <code>NativeInput</code>: el mismo elemento sin <code>sk-input</code>, para cuando lo que querés enseñar es el comportamiento que trae el navegador y no la apariencia del sistema. Es lo que usa el demo del <code>&lt;input type="time"&gt;</code> plano en TimeField.',
    "inputPage.test1": "Sigue siendo un control válido fuera de un FormField.",
    "inputPage.test2": "Le da al textarea el mismo contrato de apariencia que al input.",
    "inputPage.test3": "Escribe el alto en data-size y deja en paz al atributo size nativo.",

    "formFieldPage.description":
      "FormField: el cromo alrededor de cualquier control — rótulo, ayuda, error — y los seis ids que los atan.",
    "formFieldPage.title": "FormField",
    "formFieldPage.lede":
      "Un campo es cromo más un control, y lo que los une son seis ids. Escritos a mano, cada uno es una oportunidad de estar mal en silencio: un <code>aria-describedby</code> con un typo no se ve en pantalla y rompe a todos los lectores de pantalla que leen el formulario.",
    "formFieldPage.wiringTitle": "Seis ids a partir de un nombre",
    "formFieldPage.wiringBody":
      "El rótulo apunta al control, el control apunta de vuelta a la ayuda y al error, y cada uno de esos carga el id al que lo apuntan. El contrato los deriva todos del id del campo: ningún binding se inventa uno propio, y por eso los ids de React (<code>useId</code>) y los del emisor (un slug) pueden ser distintos sin que la relación cambie.",
    "formFieldPage.independentTitle": "Independiente de Input, a propósito",
    "formFieldPage.independentBody":
      "<code>sk-form-field</code> es el cromo alrededor de <em>cualquier</em> control: envuelve un select o un textarea igual de bien, como acá abajo. Nombrarlo por el control que más veces sostiene lo volvería mentira la primera vez que sostenga otro — y por eso su slot <code>children</code> acepta cualquier signature y el cableado apunta a <code>\"control\"</code> en vez de a un input.",
    "formFieldPage.errorTitle": "El error es texto, no un color",
    "formFieldPage.errorBody":
      "La <em>presencia</em> del mensaje es lo que invalida el campo: no hay una opción <code>invalid</code> aparte que pueda quedar desfasada de él. <code>--sk-form-field-error-fg</code> tiñe un mensaje que igual tiene que existir, y <code>aria-invalid</code>, que ya escribís para los lectores de pantalla, es lo que sigue el hook <code>--sk-input-border-color</code>. El color nunca es la única señal de error (WCAG 1.4.1).",
    "formFieldPage.avoidTitle": "Cuándo no usarlo",
    "formFieldPage.avoidBody":
      "Cuando el control no lleva rótulo visible: ahí el control mismo lleva su <code>aria-label</code> y no hay campo. Y cuando el control ya trae su propio rótulo cableado por su máquina — NumberField, TimeField, Combobox — envolverlo agregaría un segundo <code>for</code> compitiendo con el primero.",
    "formFieldPage.reactBody":
      "En React, <code>FormField</code> hace el cableado que en markup escribís a mano: genera el <code>id</code>, arma el <code>aria-describedby</code> de la ayuda y del error, y pasa <code>required</code> y <code>disabled</code> al control nativo. Se importa desde <code>@skryensya/react/form-field</code>, su propio módulo, y cualquier control puede leer ese contexto — que es la alternativa a que cada uno se haga su copia del cableado.",
    "formFieldPage.a11yBody":
      "El asterisco de <code>required</code> es decorativo (<code>aria-hidden</code>): lo que de verdad lo dice es el atributo <code>required</code> del control, porque «requerido» tiene que sobrevivir a ser leído en voz alta. La ayuda y el error se anuncian por <code>aria-describedby</code> en ese orden, y sólo se apunta a lo que existe: sin error escrito no hay <code>aria-invalid</code>, porque un atributo que apunta a un mensaje que nadie escribió describe algo que no está.",
    "formFieldPage.test1": "Cablea label, hint y error al control que envuelve.",
    "formFieldPage.test2": "El mensaje de error es lo que vuelve inválido al campo.",
    "formFieldPage.test3": "Pasa required y disabled al control nativo.",
    "formFieldPage.test4": "Cablea un textarea igual que un input.",
    "formFieldPage.test5": "Pasa axe con ayuda y error a la vez.",

    "skipLink.description":
      "SkipLink: el primer enlace del documento, invisible hasta que recibe el foco, para saltear el chrome que se repite.",
    "skipLink.lede":
      'SkipLink es el <strong>primer enlace del documento</strong> y el único componente cuyo éxito se ve como ausencia: quien navega con mouse no se entera nunca de que está. Toda página abre con el mismo chrome —la marca, la navegación global, el buscador—, y quien lee con teclado lo recorre entero antes de llegar a lo que vino a buscar, en cada página. Eso es lo que la <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.4.1 llama un bloque que hay que poder saltear. Este enlace es el salto, y es el de la plataforma: un <code>href</code> a un id de la misma página, así que funciona antes de que corra un solo script.',
    "skipLink.demoContentLabel": "Ir al contenido",
    "skipLink.demoNavLabel": "Ir a la navegación",
    "skipLink.tryItBody":
      'Este sitio usa dos: apretá <kbd class="sk-kbd">Tab</kbd> con el foco al principio de esta página y va a aparecer arriba a la izquierda “Ir al contenido”; otro Tab más y aparece “Ir a la navegación”. En la vista de abajo pasa lo mismo, pero adentro del marco: el enlace está ahí desde el primer render, sólo que mide un píxel hasta que lo enfocás.',
    "skipLink.severalTitle": "Puede haber más de uno, y el orden es la decisión",
    "skipLink.severalBody1":
      'Una página con un índice permanente razonablemente ofrece dos: uno al contenido y otro a la navegación. No son un grupo ni una lista: son dos enlaces sueltos que resultan ser las dos primeras cosas del documento, y por eso la signature toma <em>un</em> destino en vez de una colección. Con una colección, el caso común —exactamente uno— tendría que escribirse como arreglo, y el orden quedaría adentro de una opción, donde nadie lo mira.',
    "skipLink.severalBody2":
      'El primero es el que recibe todo el mundo, así que tiene que contestar la pregunta con la que llegó la mayoría, y esa pregunta casi siempre es “dejame leer esta página”, no “llevame a otra”. Por eso el contenido va primero. Quien sí quería el índice está a un Tab más; al revés, quien quería la página pagaría varios.',
    "skipLink.severalLabel": "Los dos, en orden",
    "skipLink.severalBody3":
      'Sólo se ve el que tiene el foco: los dos ocupan la misma esquina del marco y se turnan, así que en la vista de arriba hay que apretar <kbd class="sk-kbd">Tab</kbd> dos veces para verlos a los dos. El Stack que los envuelve es de la demo, no del patrón: un árbol de uso tiene una sola raíz y estos son hermanos. En un documento real van sueltos arriba del <code>&lt;body&gt;</code>, como muestra el HTML.',
    "skipLink.targetTitle": "El destino tiene que poder recibir el foco",
    "skipLink.targetBody1":
      'Es la mitad que nadie recuerda y la que decide si el enlace sirve. Seguir un enlace interno hace scroll en todos los navegadores, pero mueve el <em>foco</em> sólo en algunos. Donde no lo mueve, el Tab siguiente sigue desde el enlace y devuelve a quien lee al chrome que acababa de pedir saltear: un enlace de salto que en silencio no hace nada es peor que no tener ninguno, porque ya le dijimos que funcionaba.',
    "skipLink.targetBody2":
      '<code>tabindex="-1"</code> en el destino cierra ese hueco. Lo saca del <em>orden</em> de tabulación —no agrega una parada nueva— y lo vuelve un blanco válido para el foco. En React viene como valor, <code>skipLinkTarget</code>, y no como una frase en la documentación: una regla escrita en prosa es una regla que alguien copia mal una vez.',
    "skipLink.hiddenTitle": "Escondido quiere decir recortado, nunca borrado",
    "skipLink.hiddenBody1":
      'Ni <code>display: none</code> ni <code>visibility: hidden</code>: los dos sacan al elemento del árbol de accesibilidad, y lo que está fuera de ese árbol tampoco lo alcanza el Tab, que es lo único que este componente tiene que ser. En reposo es una caja de un píxel recortada con <code>clip-path</code>, exactamente como el patrón <a href="/styling-hooks">visually-hidden</a>.',
    "skipLink.hiddenBody2":
      'Lo que sí lo separa de ese patrón es una declaración con consecuencia: <code>visually-hidden</code> vuelve a <code>position: static</code> al recibir el foco, así que el enlace entra al layout y todo lo de abajo se mueve, justo cuando quien lee está tratando de entender dónde cayó. Acá la posición es <code>fixed</code> en los dos estados —escondido y visible son la misma caja fuera de flujo—, así que enfocarlo cambia lo que se pinta y nada más. La página no se mueve nunca.',
    "skipLink.firstTitle": "Va primero, o no es un salto",
    "skipLink.firstBody":
      'Cualquier cosa enfocable antes del enlace es, por definición, un bloque que nadie puede saltear. Por eso el lugar es el principio del <code>&lt;body&gt;</code> y no “arriba de todo visualmente”: las dos cosas coinciden acá porque es <code>fixed</code>, pero la que importa es el orden del documento.',
    "skipLink.contractBody":
      'Una sola signature y una sola opción, <code>href</code>, requerida: un enlace de salto sin destino no es nada. El contrato no declara reglas <code>a11y</code> y esa ausencia es deliberada —las que tiene (que el destino sea enfocable, que no haya nada enfocable antes, y que el contenido se ofrezca antes que la navegación cuando hay dos) hablan de elementos y de hermanos que el árbol de uso no contiene, y una regla que ninguna máquina puede decidir no debería figurar como si alguien la chequeara.',
    "skipLink.a11yIntro": "Lo que este componente resuelve y lo que sigue siendo tuyo:",
    "skipLink.a11yItem1":
      "<strong>WCAG 2.4.1 (Bypass Blocks), nivel A.</strong> Es el criterio que pide una forma de saltear el contenido que se repite en todas las páginas.",
    "skipLink.a11yItem2":
      'Poné <code>tabindex="-1"</code> en el destino. Sin eso, en varios navegadores el enlace hace scroll y deja el foco donde estaba.',
    "skipLink.a11yItem3":
      "Que sea lo primero enfocable del documento. Si hay algo antes, ese algo es el bloque que no se puede saltear.",
    "skipLink.a11yItem4":
      'Nombralo por el <em>destino</em>, no por la acción: “Ir al contenido” dice adónde lleva, “Saltar” no. Es lo primero que escucha quien entra a la página.',
    "skipLink.a11yItem5":
      "Si hay dos, el contenido va primero. El primero es el único que muchos van a usar, y tiene que ser el que la mayoría necesita.",
    "skipLink.test1":
      "Es un <code>&lt;a&gt;</code> con href, no un botón con onClick: el salto, el foco y el botón Atrás son de la plataforma.",
    "skipLink.test2":
      "En reposo sigue en el árbol de accesibilidad: si estuviera con display none, este test no lo encontraría, y el Tab tampoco.",
    "skipLink.test3":
      "El destino recibe su requisito como valor (<code>skipLinkTarget</code>), y el href apunta al id que lo lleva.",
    "kbdPage.description": "Kbd: una tecla dibujada, el <kbd> nativo con styling hooks y wrapper React.",
    "kbdPage.lede":
      'Kbd es una <strong>tecla dibujada</strong>: el <code>&lt;kbd&gt;</code> nativo con el aspecto de una tecla física. La usas para mostrar un atajo, el ⌘K del buscador de arriba, el Esc en el pie de una <a href="/componentes/command-palette">CommandPalette</a>. Es estática, como Badge: sin estado, sin máquina, sin enhancer vanilla. La semántica del <code>&lt;kbd&gt;</code> es de la plataforma; el componente solo aporta la pinta.',
    "kbdPage.squareTitle": "Un glifo se lee cuadrado",
    "kbdPage.squareBody":
      'Una sola tecla (<kbd class="sk-kbd">K</kbd>, <kbd class="sk-kbd">⌘</kbd>, <kbd class="sk-kbd">↑</kbd>) toma un mínimo cuadrado en vez de quedar como una astilla; una etiqueta más larga (<kbd class="sk-kbd">Esc</kbd>, <kbd class="sk-kbd">Enter</kbd>) crece con su texto. El mínimo es <code>--sk-kbd-min-size</code>, relativo a la propia tipografía de la tecla, así que se mantiene cuadrada a cualquier tamaño.',
    "kbdPage.pressedTitle": "El estado apretado",
    "kbdPage.pressedBody1":
      'Kbd no es un control, no se clickea, así que su único estado <strong>refleja</strong> un evento externo: <code>data-pressed</code>, que lo prende mientras su tecla física está apretada, igual que un componente refleja el <code>data-state</code> de una máquina. Lo escribe quien mira el teclado, no el kbd. Prendida, la tecla se pone en acento, se hunde un pixel y pierde su sombra, como una tecla real que baja. La transición usa la intención <code>feedback</code> (<a href="/motion">motion</a>).',
    "kbdPage.pressedBody2":
      'Pruébalo: aprieta cualquiera de estas y se prende sola; mantén <kbd class="sk-kbd" data-key="meta">⌘</kbd> y suma otra para ver la combinación.',
    "kbdPage.echoAriaLabel": "Teclas que reaccionan al teclado",
    "kbdPage.chordBody":
      'Un acorde entero también, como una unidad, aprieta <kbd class="sk-kbd" data-hotkey="mod+enter">⌘ ↵</kbd> y se prende cuando la combinación completa está abajo:',
    "kbdPage.scriptBody":
      'Lo pone un script chico de la doc mientras la tecla física está apretada; para el acorde usa el <code>matchesHotkey</code> del <a href="/hotkey">primitivo de hotkey</a>, el mismo matcher que el atajo. El badge ⌘K del buscador de arriba nace de esa pareja: <code>formatHotkey</code> da el texto por plataforma, Kbd le pone la caja.',
    "kbdPage.test1": "Renderiza un <code>&lt;kbd&gt;</code> nativo con la clase de la parte.",
    "kbdPage.test2": "Conserva la className del consumidor junto a la de la parte.",
    "kbdPage.test3": "Reenvía los atributos nativos.",

    "linkPage.description": "Link: un enlace de texto, siempre subrayado, el único tratamiento que WCAG 1.4.1 permite.",
    "linkPage.lede":
      'Link conserva la semántica nativa de <code>&lt;a&gt;</code>: úsalo para navegar y proporciona un <code>href</code> válido. Es un <strong>enlace de texto</strong> con subrayado permanente, el único tratamiento que WCAG 1.4.1 permite en prosa. El hover usa el state layer (<code>sk-interactive</code>), no un color inventado por el componente.',
    "linkPage.tileTitle": "Link de superficie: TileLink",
    "linkPage.tileBody1":
      "Cuando toda una superficie es un único destino, usa <code>TileLink</code>. También renderiza un <code>&lt;a&gt;</code>, pero no es <code>sk-link</code>: conserva la geometría Tile y su state layer porque el contexto, no un subrayado en prosa, comunica que la superficie es navegable.",
    "linkPage.tileBody2": "El HTML autorado funciona sin inicialización. <code>createTileLink</code> solo crea el ancla cuando el árbol se genera desde JavaScript.",
    "linkPage.whyTitle": "Por qué un solo tipo, y no tres",
    "linkPage.whyBody1":
      'Un enlace dentro de un bloque de texto <strong>no se puede distinguir por color solo</strong>: es <a class="sk-link sk-interactive" href="https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html">WCAG 1.4.1 (Use of Color)</a>, nivel A. Solo hay dos formas de cumplir: un indicador que no sea color <em>en reposo</em>, un subrayado permanente, o un contraste de ≥3:1 entre el color del enlace y el del texto <em>más</em> una señal no-color en hover <em>y</em> foco.',
    "linkPage.whyBody2":
      "La segunda vía es frágil: hay que re-medir ese 3:1 en cada marca y cada modo, y quien lee la página quieta, o no puede hacer hover, no recibe ninguna señal hasta tocar el enlace. Un subrayado que aparece solo en hover deja el texto en reposo sin pista, y sin subrayado se falla el criterio de plano. Así que <code>sk-link</code> tiene <strong>una</strong> forma, subrayado siempre, y no un hook para apagarlo: ofrecer <code>hover</code> o <code>none</code> sería ofrecer una manera de fallar 1.4.1.",
    "linkPage.calloutBody":
      "<strong>¿Y los enlaces que no van subrayados?</strong> Un ítem de navegación, un breadcrumb, el prev/next del pie, esos se distinguen por <em>ubicación</em>, no por color, así que 1.4.1 no les pide subrayado. Pero no son <code>sk-link</code>: usan el pattern <code>nav-list</code> o un botón <code>ghost</code>. <code>sk-link</code> es, por definición, el enlace <em>dentro del texto</em>.",
    "linkPage.toneTitle": "El tono no cambia la regla",
    "linkPage.toneBody":
      'Por defecto el enlace toma el <strong>mismo color que el texto</strong> y se apoya enteramente en el subrayado. <code>data-tone="primary"</code> lo pinta del color primary de marca. En ambos casos el subrayado es obligatorio: sin él, el tono primary solo se distinguiría por color (falla WCAG 1.4.1), y el default no se distinguiría de la prosa.',
    "linkPage.contractItem1": "Renderiza un ancla nativa: <code>href</code> define el destino.",
    "linkPage.contractItem2": "<code>data-tone</code> es opcional: sin él, el color del texto; <code>primary</code> usa el color primary de marca.",
    "linkPage.contractItem3":
      "<strong>El subrayado no es configurable</strong>: siempre está, porque un enlace de texto sin señal no-color permanente falla WCAG 1.4.1.",
    "linkPage.contractItem4": "No establece <code>target</code>, <code>rel</code> ni ningún comportamiento para enlaces externos.",
    "linkPage.contractItem5":
      "Lleva <code>sk-interactive</code>: hover, press y foco vienen del state layer. El <code>::before</code> se abre un poco más que la tinta para que el wash no se lea como una mancha sobre los glifos; el subrayado permanente sigue siendo la señal en reposo.",
    "linkPage.test1": "Renderiza un enlace nativo con el state layer compartido para hover/press/foco.",

    "listPage.description":
      "List: colección semántica de filas (ul/ol) con anatomía real (leading, contenido, trailing), divisores, filas interactivas y orden.",
    "listPage.lede":
      "Una <strong>lista con UI</strong>, no un <code>&lt;li&gt;</code> con tipografía. Por debajo es un <code>&lt;ul&gt;</code> o <code>&lt;ol&gt;</code> real (el lector oye una lista de N ítems), y encima aporta la anatomía de fila: <strong>leading</strong> (icono, avatar, número), <strong>contenido</strong> (título y descripción) y <strong>trailing</strong> (meta, badge, acción), con divisores. Es composable por partes y funcional: una fila que actúa es un <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code> real, nunca un <code>onClick</code> en el <code>&lt;li&gt;</code>.",
    "listPage.stepsTitle": "La fila, un slot a la vez",
    "listPage.stepsBody":
      "Los seis ejemplos que siguen son <strong>la misma lista</strong>, y cada uno agrega exactamente una pieza sobre el anterior. Se leen en orden: lo que aparece de nuevo en cada paso es lo único que cambió en el markup.",
    "listPage.step1Title": "1 · Sólo la lista",
    "listPage.step1Body":
      "El piso: un <code>&lt;ul&gt;</code> real con filas y divisores, sin un solo slot. Ya hay altura de fila, inset y hairlines, y el lector oye <em>lista de 5 ítems</em>. Muchas listas no necesitan nada más que esto.",
    "listPage.step1Note": "ul + item",
    "listPage.step2Title": "2 · Título y descripción",
    "listPage.step2Body":
      "Entra <code>sk-list__content</code>, la columna que flexiona. El título y la descripción se apilan, y es la única parte de la fila que se encoge: por eso un título largo corta ahí y no empuja la fila más ancha que su contenedor.",
    "listPage.step2Note": "+ content",
    "listPage.step3Title": "3 · Media al inicio",
    "listPage.step3Body":
      "Entra <code>sk-list__leading</code>: un icono, un avatar o un número. Es <strong>decorativo</strong>, no nombra la fila: quien la nombra es el título. Un slot vacío no existe para el layout, así que las filas sin icono no arrastran padding fantasma.",
    "listPage.step3Note": "+ leading (Icon)",
    "listPage.step4Title": "4 · Meta al final",
    "listPage.step4Body":
      "Entra <code>sk-list__trailing</code> y la fila queda completa. Se ancla al final con <code>margin-inline-start: auto</code> y trae <code>tabular-nums</code>, así que las cifras de filas distintas se alinean en columna. Acepta texto o un componente, como un Badge.",
    "listPage.step4Note": "+ trailing + Badge",
    "listPage.step5Title": "5 · La fila actúa",
    "listPage.step5Body":
      'Misma anatomía, ahora envuelta en un <code>a[href]</code> real con <code>sk-list__action sk-interactive</code>. El foco y el teclado son nativos, y el hover, foco y press vienen del <a href="/state-layer">state layer</a>. El <code>&lt;li&gt;</code> pasa a ser sólo el que lleva el divisor.',
    "listPage.step5Note": "+ a[href] + state layer",
    "listPage.step6Title": "6 · Todo junto",
    "listPage.step6Body":
      "El techo de la escalera: filas interactivas, dos piezas en el trailing, densidad <code>compact</code> y una fila deshabilitada. Nada nuevo del componente, sólo lo anterior combinado.",
    "listPage.step6Note": "+ density",
    "listPage.contractItem1":
      'Raíz: <code>&lt;ul class="sk-list"&gt;</code> o <code>&lt;ol&gt;</code>. Cada fila es un <code>&lt;li class="sk-list__item"&gt;</code>.',
    "listPage.contractItem2":
      "Anatomía de fila: <code>sk-list__leading</code>, <code>sk-list__content</code> (con <code>sk-list__title</code> y <code>sk-list__description</code>) y <code>sk-list__trailing</code>. Todas opcionales; compón las que uses.",
    "listPage.contractItem3":
      'Secuencias de instrucciones: usa <a href="/componentes/process-list">ProcessList</a>, que conserva un <code>&lt;ol&gt;</code> y posee los marcadores, conectores y contenido de cada paso.',
    "listPage.contractItem4":
      'Fila funcional: un <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code> con <code>sk-list__action sk-interactive</code> dentro del <code>&lt;li&gt;</code>. Llena la fila y hereda foco, teclado y state layer.',
    "listPage.contractItem5":
      'Estado persistente: ninguno. List no modela selección ni destino actual; para navegación activa usa <a href="/nav-list">Nav list</a>.',
    "listPage.contractItem6": 'Variantes: <code>data-density="compact"</code> y <code>data-dividers="none"</code>.',
    "listPage.contractItem7": "Sin inicialización: el comportamiento es del <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code> nativo.",
    "listPage.test1": "Renderiza una lista semántica con filas estáticas, de enlace y de botón.",
    "listPage.test2": "Renderiza una lista ordenada cuando el orden importa.",

    "loaderPage.description": "Loader: simulación de carga indeterminada, patrones de uso, tamaños y velocidad.",
    "loaderPage.lede":
      "Loader comunica trabajo <strong>indeterminado</strong>: la operación está activa, pero no existe una fracción honesta que mostrar. El sistema ofrece dos diseños circulares y dos lineales con las mismas reglas semánticas para componer acciones, regiones y cargas iniciales.",
    "loaderPage.calloutBody":
      "El contrato contiene <code>ring</code>, <code>sweep</code>, <code>bars</code> y <code>dots</code>. Son diseños visuales del mismo Loader, no componentes distintos.",
    "loaderPage.simTitle": "Simulación",
    "loaderPage.simBody":
      "Un único contenedor cambia de ocupado a listo. No necesita una pantalla, métricas ni una card exterior: sólo la marca, el texto que explica el trabajo y una acción para repetirlo.",
    "loaderPage.simLabel": "Análisis de mezcla",
    "loaderPage.simNote": "Ocupado → listo",
    "loaderPage.simBody2":
      "<code>bars</code> aporta movimiento sin fingir un porcentaje. El contenedor conserva <code>aria-busy</code> y el estado visible aporta el anuncio accesible.",
    "loaderPage.contextsTitle": "Patrones completos",
    "loaderPage.contextsLabel": "Loader en contexto",
    "loaderPage.contextsBody":
      "Loader posee la marca, no la superficie ni el ciclo de vida. El contexto decide dónde vive, quién aporta el nombre accesible y qué región conserva <code>aria-busy=\"true\"</code>.",
    "loaderPage.contextsNote": "Acción local · actualización de región · carga inicial",
    "loaderPage.contextsItem1": "En un botón, Loader es decorativo: «Guardando…» ya nombra el estado.",
    "loaderPage.contextsItem2": "En una actualización local, conserva el contenido previo y marca la región como ocupada.",
    "loaderPage.contextsItem3": "En una carga inicial, acompaña la marca con un título y una explicación; evita una pantalla vacía.",
    "loaderPage.sizeTitle": "Tamaño",
    "loaderPage.sizeBody":
      "Usa <code>sm</code> dentro de controles, <code>md</code> junto a texto y <code>lg</code> cuando la marca ocupa una región propia. El tamaño no comunica cuánto trabajo queda.",
    "loaderPage.sizeLabel": "Tamaños de Loader",
    "loaderPage.speedTitle": "Velocidad",
    "loaderPage.speedBody":
      "<code>speed</code> reescribe el styling hook <code>--sk-loader-duration</code> desde tokens de intención (<code>--motion-loading-duration*</code>), no desde milisegundos crudos. Elige la cadencia por presencia visual, no como promesa sobre la duración real de la operación.",
    "loaderPage.speedLabel": "Velocidades de Loader",
    "loaderPage.speedOverrideLabel": "override local",
    "loaderPage.semanticsTitle": "Semántica",
    "loaderPage.semanticsItem1": 'Con nombre accesible usa <code>role="status"</code>; React lo escribe al pasar <code>label</code>.',
    "loaderPage.semanticsItem2": "Sin <code>label</code>, React lo vuelve decorativo para acompañar texto sin duplicarlo.",
    "loaderPage.semanticsItem3": 'Marca la región afectada con <code>aria-busy="true"</code>; Loader no controla la operación.',
    "loaderPage.semanticsItem4":
      'Si conoces el avance, usa <a href="/componentes/progress">Progress</a>, no una velocidad distinta.',
    "loaderPage.reducedTitle": "Movimiento reducido",
    "loaderPage.reducedBody":
      "Los cuatro diseños conservan una silueta reconocible y detienen todo movimiento con <code>prefers-reduced-motion: reduce</code>. El texto de estado permanece: reducir movimiento no puede convertir una operación pendiente en una señal invisible.",
    "loaderPage.reactBody":
      "Props: <code>size</code>, <code>variant</code>, <code>speed</code> y <code>label</code>. Los valores por defecto son <code>md</code>, <code>ring</code> y <code>normal</code>.",
    "loaderPage.test1": "Expone el trabajo indeterminado con nombre como un status cortés (<code>polite</code>).",
    "loaderPage.test2": "Escribe los ejes ortogonales de variante y velocidad en la raíz.",
    "loaderPage.test3": "Queda decorativo cuando el control que lo rodea ya aporta el significado de estado.",

    "menuPage.description": "Acciones, checkboxes y radios con navegación por teclado y typeahead.",
    "menuPage.contractBody":
      "Menu ejecuta acciones, también como context menu mediante <code>contextTarget</code> o <code>data-sk-menu-context-trigger</code>. Un item con <code>children</code> crea un submenú. Para elegir un valor de formulario usa Select; para sugerencias editables, Combobox.",
    "menuPage.a11yBody": "La máquina gestiona flechas, Home, End, Escape, typeahead y retorno de foco.",
    "menuPage.multilevelTitle": "Submenús anidados",
    "menuPage.multilevelBody":
      "Un submenú es el mismo <code>children</code> apuntando de vuelta a sí mismo: no hay un límite de profundidad propio, así que Insertar → Medios → Imagen anida un tercer nivel con la misma forma que el primero.",
    "menuPage.compactTitle": "Densidad compacta",
    "menuPage.compactBody":
      "<code>density: \"compact\"</code> achica cada fila a <code>--size-control-sm</code> (piso de 24px, WCAG 2.2 mínimo) en vez de los 44px de <code>--size-touch-target</code>: un intercambio explícito de área de toque por más filas visibles, para un menú con muchos comandos.",
    "menuPage.contextTitle": "Como context menu",
    "menuPage.contextBody":
      "<code>data-sk-menu-context-trigger</code> (o <code>contextTarget</code> en React) reemplaza al trigger: el elemento absorbe el evento <code>contextmenu</code> del botón derecho y abre el menú, en vez de necesitar un botón visible.",
    "menuPage.safetyTitle": "Intención del puntero (safety triangle)",
    "menuPage.safetyBody":
      "Cuando un submenú está abierto, cruzar en diagonal sobre otro item del menú padre no lo resalta ni cierra el submenú. Lo que lo sostiene es un elemento real: el <em>safe area</em>, un triángulo recortado con <code>clip-path</code> que vive DENTRO del trigger y va del puntero al borde cercano del submenú. Mientras el puntero está sobre él, el navegador no dispara <code>pointerleave</code> en el trigger —un descendiente cuenta como el elemento— así que la máquina nunca entra en <code>closing</code> y los items de abajo nunca reciben el <code>pointermove</code> con el que robarían el resaltado. El polígono propio de <code>@zag-js/menu</code> no alcanzaba: sólo puede vetar un cierre temprano durante los 100ms de <code>waitForCloseDelay</code>, no extenderlos, y con el puntero quieto adentro del polígono el submenú igual se cerraba a los ~90ms. Abrí «Compartir» y cruzá diagonalmente hacia el submenú: el triángulo pintado es el mismo elemento que estás tocando, no un dibujo aparte.",

    "navbarPage.description": "Navbar: la barra, con la lista de navegación como pattern horizontal.",
    "navbarPage.lede":
      "Navbar es la <strong>barra</strong>: superficie, marca y un lugar para acciones. No tiene máquina y no la necesita, es un <code>&lt;header&gt;</code> con links, y todo eso lo envía la plataforma.",
    "navbarPage.linksTitle": "Los links no son del navbar",
    "navbarPage.linksBody":
      "Son el pattern <a href=\"/nav-list\"><code>nav-list</code></a> en horizontal, la misma estructura que hospeda el sidebar en vertical. Que dos componentes necesiten esta estructura exacta es lo que la vuelve un pattern y no un componente: antes el navbar y el sidebar tenían cada uno su lista, con las mismas reglas escritas dos veces y libres de divergir.",
    "navbarPage.currentTitle": "La página actual es de la plataforma",
    "navbarPage.currentBody":
      'El link actual se marca con <code>aria-current="page"</code>, que el consumidor ya tiene que escribir para los lectores de pantalla. Los styling hooks lo siguen en vez de pedir una clase modificadora, y un <code>state</code> lo escribe una máquina; aquí no hay ninguna.',
    "navbarPage.test1": "Usa un landmark <code>header</code> y deja la navegación a su hijo NavList.",

    "numberFieldPage.description": "Entrada numérica localizada con límites, pasos y controles de incremento.",
    "numberFieldPage.contractBody": "El valor público conserva string y valueAsNumber. Intl.NumberFormat controla la presentación.",
    "numberFieldPage.a11yBody": "Los triggers tienen nombres propios y el input anuncia min, max, valor actual y estado inválido.",

    "paginationPage.description": "Pagination: ventana de páginas como función pura del core, con primera, última y elipsis.",
    "paginationPage.lede":
      "Pagination recorre un conjunto paginado, una página a la vez. La ventana visible es la parte interesante, y vive como función pura en el core: primera y última siempre presentes, la actual con un hermano a cada lado, y las corridas ocultas colapsan en una elipsis.",
    "paginationPage.body":
      'Prev/next usan los roles <code>chevron-left</code> y <code>chevron-right</code> del set. La página actual lleva <code>aria-current="page"</code>; prev/next se deshabilitan en los bordes. La elipsis es texto inerte, no un objetivo. Los targets llevan <code>sk-interactive</code>.',
    "paginationPage.rangeTitle": "La ventana, en el core",
    "paginationPage.rangeBody": "El renderizado y los handlers son del binding; el cálculo es del core y es testeable en aislamiento:",
    "paginationPage.reactBody": "React dibuja los chevrons del set enlazado.",
    "paginationPage.test1": "Marca la página actual y deshabilita prev/next en los límites.",
    "paginationPage.test2": "Colapsa páginas lejanas detrás de una elipsis y reporta clicks acotados al rango.",

    "placeholderPage.description": "Placeholder: geometría decorativa para reservar el lugar del contenido mientras carga.",
    "placeholderPage.lede":
      "Placeholder reserva la forma del contenido que todavía no llegó. Reduce saltos de layout y ofrece una señal visual breve; el contenedor conserva la responsabilidad de explicar qué está cargando.",
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
    "placeholderPage.shapesTitle": "Formas",
    "placeholderPage.shapesItem1": "<code>text</code>: una línea; es el valor por defecto.",
    "placeholderPage.shapesItem2": "<code>block</code>: media, tablas o regiones rectangulares.",
    "placeholderPage.shapesItem3": "<code>circle</code>: avatares y controles circulares.",
    "placeholderPage.shapesBody":
      "Ajusta <code>--sk-placeholder-inline-size</code>, <code>--sk-placeholder-block-size</code> o <code>--sk-placeholder-size</code> desde el layout consumidor. La forma no conoce el contenido.",
    "placeholderPage.reducedTitle": "Movimiento reducido",
    "placeholderPage.reducedBody":
      "El brillo se desplaza con <code>transform</code>. Con <code>prefers-reduced-motion: reduce</code>, desaparece la animación y permanece el relleno estático.",
    "placeholderPage.reactBody": "El código está en la pestaña <strong>React</strong> de cada preview.",
    "placeholderPage.test1": "Renderiza geometría decorativa y reenvía las clases de layout.",
    "placeholderPage.test2": "No tiene violaciones serias de accesibilidad dentro de una región busy nombrada.",

    "popoverPage.description": "Contenido no modal con título, descripción y cierre explícito sobre top layer nativo.",
    "popoverPage.contractBody": "Popover describe contenido auxiliar rico. Menu contiene acciones; Tooltip solo una descripción corta.",
    "popoverPage.a11yBody": "La plataforma posee top layer, Escape y light-dismiss mediante popover=auto.",

    "popupPage.description": "Superficie flotante mínima para composiciones que no necesitan chrome de Popover.",
    "popupPage.contractBody": "Popup aporta ancla y superficie, no semántica interna. Si el patrón tiene título y acciones de cierre, usa Popover.",
    "popupPage.a11yBody": "El contenido debe aportar su propia semántica; Popup no inventa roles dialog o menu.",

    "processListPage.description": "ProcessList: secuencia ordenada de instrucciones con marcadores conectados y contenido arbitrario.",
    "processListPage.lede":
      "Una secuencia estática de instrucciones donde el contenido es lo principal. Usa un <code>&lt;ol&gt;</code> real, numera cada <code>&lt;li&gt;</code> y conecta visualmente los pasos sin convertirlos en estados de progreso.",
    "processListPage.whenTitle": "Cuándo usarlo",
    "processListPage.whenItem1": "Usa ProcessList para recetas, instalaciones y procedimientos cuyo orden importa.",
    "processListPage.whenItem2": 'Usa <a href="/componentes/list">List</a> para colecciones de filas estáticas o interactivas.',
    "processListPage.whenItem3":
      'Usa <a href="/componentes/steps">Steps</a> cuando existan estados <code>complete</code>, <code>current</code> o <code>upcoming</code>.',
    "processListPage.contractItem1": 'La raíz siempre es <code>&lt;ol class="sk-process-list"&gt;</code>.',
    "processListPage.contractItem2": 'Cada instrucción es un <code>&lt;li class="sk-process-list__item"&gt;</code>.',
    "processListPage.contractItem3":
      "<code>sk-process-list__title</code> identifica el paso y <code>sk-process-list__content</code> admite cualquier contenido de flujo.",
    "processListPage.contractItem4": "El contador genera los números; no se escriben manualmente ni representan progreso.",
    "processListPage.contractItem5": "No existen estados persistentes ni filas completamente clicables. Para progreso usa Steps.",
    "processListPage.test1": "Renderiza una secuencia ordenada nativa de instrucciones.",
    "processListPage.test2": "Mantiene el título y el contenido arbitrario de cada paso dentro de su ítem.",

    "progressPage.description": "Progress: barra determinada con fracción recortada en el core, tonos y componente React.",
    "progressPage.lede":
      "Progress es una barra <strong>determinada</strong>: el consumidor conoce el valor. La fracción se recorta a <code>[0, max]</code> en el core (<code>progressFraction</code>), de modo que el ancho pintado y <code>aria-valuenow</code> nunca pueden divergir.",
    "progressPage.body": 'Para trabajo sin un valor medible usa <a href="/componentes/loader">Loader</a>: su semántica es indeterminada.',
    "progressPage.test1": "Expone el valor en el rol <code>progressbar</code> y pinta el relleno correspondiente.",
    "progressPage.test2": "Recorta un valor fuera de rango para que el relleno y <code>aria-valuenow</code> coincidan.",

    "radioGroupPage.description": "RadioGroup: una opción exclusiva con inputs nativos y formulario real.",
    "radioGroupPage.lede": "Una elección exclusiva entre alternativas relacionadas. Cada opción es un radio nativo; el nombre compartido impone la exclusión.",
    "radioGroupPage.tileTitle": "Opciones de superficie: TileRadioGroup",
    "radioGroupPage.tileBody1":
      "Cuando cada alternativa necesita título, descripción y una superficie completa, usa <code>TileRadioGroup</code>. Cada item conserva un radio nativo; el grupo no impone disposición.",
    "radioGroupPage.tileBody2":
      'En este preview las opciones van en fila con <a href="/componentes/inline"><code>sk-inline</code></a> y cada Tile toma <code>flex: 1</code>. En una columna, omite <code>sk-inline</code>.',
    "radioGroupPage.tileBody3":
      'El enhancer <code>tile-radio-group</code> (Svelte + <code>@zag-js/radio-group</code>, la misma máquina que React) hidrata la raíz <code>data-sk-tile-radio-group</code> con <code>initComponents()</code>: garantiza la exclusión mutua y sincroniza el estado de cada <code>[data-part="item"]</code> con su radio real.',
    "radioGroupPage.tileBody4": "Importa <code>@skryensya/core/components/radio-group.css</code> y llama <code>initComponents()</code> una vez.",
    "radioGroupPage.contractItem1": "<code>name</code> es obligatorio y lo comparten todas las opciones.",
    "radioGroupPage.contractItem2": "<code>defaultValue</code> conserva el estado nativo y respeta reset de formularios.",
    "radioGroupPage.contractItem3": "<code>value</code> controla la opción seleccionada; <code>onValueChange</code> reporta cambios.",
    "radioGroupPage.contractItem4":
      "El grupo necesita un nombre accesible: <code>aria-label</code>, <code>aria-labelledby</code> o un <code>fieldset</code> con <code>legend</code>.",
    "radioGroupPage.test1":
      "Es un radiogroup, respeta el valor por defecto, mantiene los valores mutuamente excluyentes y emite el evento.",
    "radioGroupPage.test2": "Marca el <code>data-state</code> del ítem seleccionado.",

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

    "selectPage.description": "Select: un listbox enhanced con máquina, para Vanilla y React.",
    "selectPage.lede":
      "El selector principal cuando la interacción necesita typeahead, highlight, popup controlado y posicionamiento. <code>Select</code> comparte su contrato de parts en <code>@skryensya/vanilla</code> y <code>@skryensya/react</code>; la máquina de cada binding es un detalle interno.",
    "selectPage.nativeLinkBody": 'Para una elección estándar de formulario, usa el <a href="#select-nativo">Select nativo</a> documentado al final: no carga un enhancer, conserva el comportamiento de plataforma y estiliza su picker mediante mejora progresiva.',
    "selectPage.enhancedLabel": "Select enhanced",
    "selectPage.densityBody": "La densidad compacta el espacio alrededor del selector, no sus objetivos táctiles: el trigger y cada opción conservan un mínimo de <code>44px</code> de alto.",
    "selectPage.htmlTitle": "HTML autorado",
    "selectPage.htmlBody":
      "Los items <strong>son</strong> la colección: el enhancer los lee del DOM, igual que tabs lee sus triggers. Cada <code>data-sk-select-item</code> necesita un <code>data-value</code>. El markup completo está en la pestaña <strong>Vanilla</strong> del preview.",
    "selectPage.vanillaInitTitle": "Inicializar Vanilla",
    "selectPage.listenTitle": "Escuchar el cambio",
    "selectPage.formsTitle": "Formularios y fallback sin JavaScript",
    "selectPage.enhancedContractTitle": "Contrato enhanced",
    "selectPage.enhancedContractItem1": "La raíz lleva <code>data-sk-select</code> y la anatomía de parts documentada.",
    "selectPage.enhancedContractItem2": "El enhancer no renderiza markup ni inventa clases; sólo conecta los nodos autorados.",
    "selectPage.enhancedContractItem3": "El texto del valor lo posee la máquina; placeholder, opciones e ids siguen siendo del consumidor.",
    "selectPage.enhancedContractItem4": "React renderiza el mismo contrato y no hidrata el markup Vanilla.",
    "selectPage.nativeTitle": "Select nativo",
    "selectPage.nativeLede":
      'Es un <code>&lt;select&gt;</code> real: la selección, el teclado, el envío de formularios y la accesibilidad siguen perteneciendo al navegador. skryensya/ui aplica <code>sk-select-native</code>; no hay <code>data-sk-*</code>, máquina ni paquete <code>@skryensya/vanilla</code>.',
    "selectPage.nativeBody":
      "Úsalo para una elección estándar. Elige el Select enhanced sólo cuando necesites su colección controlada, markup de items, posicionamiento o evento <code>sk-value-change</code>; la apariencia ya no es motivo para reemplazar el control nativo.",
    "selectPage.nativeLabel": "Select nativo",
    "selectPage.progressiveTitle": "Mejora progresiva",
    "selectPage.progressiveBody":
      "Si el navegador soporta <code>appearance: base-select</code> y <code>::picker(select)</code>, Core aplica al campo, al picker y a sus opciones la misma superficie, espaciado, estados e iconos que usa Select. Los demás navegadores ignoran ese bloque y conservan el popup clásico del sistema operativo. El HTML y el comportamiento no cambian.",
    "selectPage.nativeInstallTitle": "Instalar sólo el Select nativo",
    "selectPage.nativeContractTitle": "Contrato nativo",
    "selectPage.nativeContractItem1": "Usa un <code>&lt;label&gt;</code> asociado o un nombre accesible equivalente.",
    "selectPage.nativeContractItem2": "La selección, el teclado y la serialización del <code>form</code> pertenecen al navegador.",
    "selectPage.nativeContractItem3": "<code>disabled</code> es el atributo nativo; no se sustituye por estado JavaScript.",
    "selectPage.nativeContractItem4": "Customizable select uniforma el picker; el popup clásico sigue siendo el fallback.",
    "selectPage.iconsComment": "Los iconos se autoran como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "selectPage.formsComment": "Opcional: hace que el Select se envíe en un form, y es lo\n     que queda sin JS. Sus <option> tienen que coincidir con\n     los items, o el enhancer tira.",
    "selectPage.test1": "Usa la máquina de Zag select para la selección del popup y el valor del form.",
    "selectPage.test2": "Conduce la máquina sobre el markup autorado: ARIA, selección y el texto del valor.",
    "selectPage.test3": "Emite <code>sk-value-change</code>, y el cleanup detiene la máquina.",

    "sidebarPage.description": "Sidebar: el shell que se contrae a un riel, con la lista de navegación como pattern invitado.",
    "sidebarPage.lede":
      "Sidebar es el <strong>shell</strong>: un header, un medio que scrollea, un footer, y el colapso. Se contrae a un <strong>riel</strong>, se angosta, nunca se esconde.",
    "sidebarPage.contentTitle": "Una cosa es el sidebar; otra, su contenido",
    "sidebarPage.contentBody":
      'Lo que va adentro no es asunto del sidebar. La lista de destinos es el pattern <a href="/nav-list"><code>nav-list</code></a>, invitada aquí y con la misma estructura que usa el navbar en horizontal. Por eso no hay un <code>sk-sidebar__link</code>: esa lista nunca fue del sidebar, y nombrarla así sería nombrar a un inquilino.',
    "sidebarPage.collapseBody": "Contrae el sidebar con el botón: la lista se vuelve un riel de iconos, y sigue toda ahí.",
    "sidebarPage.widthTitle": "El ancho lo decide quien lee",
    "sidebarPage.widthBody1":
      "Autorar un <code>SidebarResizeHandle</code> adentro del sidebar es lo que lo vuelve redimensionable. No hay una opción <code>resizable</code> al lado: dos formas de decir lo mismo son dos formas de contradecirse, y la hoja de estilos lee ese mismo hecho con <code>:has()</code>.",
    "sidebarPage.widthBody2":
      "El recorrido lo acotan <code>--sk-sidebar-min-inline-size</code> y <code>--sk-sidebar-max-inline-size</code>, y el <code>clamp()</code> vive en el CSS: el arrastre escribe <strong>una</strong> propiedad y ninguna de las dos bindings hace la cuenta. Por eso una marca que mueva esos hooks mueve el resize con ella, sin volver a ejecutar nada.",
    "sidebarPage.widthBody3":
      "Para una barra sola, <code>minInlineSize</code> y <code>maxInlineSize</code> escriben esos dos hooks desde el markup o desde las props, con cualquier largo de CSS (<code>18rem</code>, <code>30%</code>, <code>min(24rem, 40vw)</code>). Son azúcar sobre los hooks, no un segundo mecanismo: quien tenga cincuenta barras iguales sigue poniendo el hook una vez en su hoja de estilos. Los extremos son de la instancia y el ancho expandido no, y la división no es caprichosa: el ancho expandido es el tamaño para el que la barra fue diseñada, y eso es una decisión del sistema; el recorrido depende de la pantalla y del contenido de quien lee.",
    "sidebarPage.widthBody4":
      "Redimensiona con el clic <strong>mantenido</strong>: la presión sola no hace nada, el gesto arranca recién cuando el puntero viajó cuatro píxeles. Un clic suelto en el borde del panel no mueve el ancho, no dispara <code>sk-resize-change</code> y no escribe nada en el almacenamiento, que es lo que antes congelaba en el navegador de quien lee un ancho que nunca eligió.",
    "sidebarPage.widthBody5":
      "Es un splitter completo, no sólo un arrastre: las flechas lo mueven de a poco (con <kbd class=\"sk-kbd\">Shift</kbd>, más rápido), <kbd class=\"sk-kbd\">Home</kbd> y <kbd class=\"sk-kbd\">End</kbd> van a los extremos, y doble clic o <kbd class=\"sk-kbd\">Enter</kbd> devuelven el ancho por defecto. Con <code>storageKey</code> el ancho sobrevive a la recarga; sin él, dura la sesión, que es el caso de este preview.",
    "sidebarPage.widthBody6":
      'Adentro va un <a href="/componentes/tree-view">TreeView</a> a propósito: es el invitado cuyo ancho correcto nadie puede saber de antemano. El nombre que no entra se corta con puntos suspensivos y el panel nunca scrollea en horizontal; ensancharlo es la respuesta, no una barra de scroll lateral.',
    "sidebarPage.resizableLabel": "Sidebar redimensionable",
    "sidebarPage.detailsTitle": "Por qué no es un <code>&lt;details&gt;</code>",
    "sidebarPage.detailsBody1":
      "Un disclosure lo envía la plataforma: <code>&lt;details&gt;</code> / <code>&lt;summary&gt;</code>, sin máquina. Un sidebar colapsable <em>no</em> es un disclosure. Un <code>&lt;details&gt;</code> cerrado esconde su contenido; un sidebar contraído lo sigue mostrando, sólo que como iconos. Como la plataforma no envía nada para eso, un enhancer chico se gana su lugar, y no reimplementa nada que ya exista.",
    "sidebarPage.detailsBody2":
      "Por eso los labels se desvanecen pero <strong>no</strong> se quitan del DOM: contraído, el label es lo único que le pone nombre al icono para un lector de pantalla. Un grupo anidado que <em>sí</em> esconde sus items sigue siendo un disclosure, y va en <code>&lt;details&gt;</code>.",
    "sidebarPage.widthStatesTitle": "Un ancho, dos estados",
    "sidebarPage.widthStatesBody1":
      "Los dos anchos son dos valores de <strong>un</strong> styling hook. El consumidor escribe <code>inline-size: var(--sk-sidebar-inline-size)</code> una vez; contraer re-declara ese hook no agrega uno nuevo, que es la regla de los styling hooks. El <code>state</code> lo escribe la máquina como <code>data-state</code> en la raíz, nunca a mano.",
    "sidebarPage.widthStatesBody2":
      "El riel mide exactamente un control, y contraído el sidebar le pasa a la lista el padding que <em>centra</em> el icono en ese cuadrado, calculado, no adivinado, así queda centrado en las tres densidades. Es el shell re-declarando un hook del pattern: nunca toca su markup.",
    "sidebarPage.widthStatesBody3":
      "Tampoco hay bloque de <code>prefers-reduced-motion</code>: la duración sale de los tokens de intención de expand/collapse, que ya se achican solos. El sidebar le presta esa intención a la lista, así los labels se desvanecen en el mismo tiempo en que se mueve el ancho.",
    "sidebarPage.triggerTitle": "El trigger no lleva label visible",
    "sidebarPage.triggerBody":
      "Mide un icono de ancho, así que su nombre accesible va en un <code>aria-label</code> (o en texto visualmente oculto): un label visible adentro sería texto adentro de un cuadrado del ancho de un icono. El enhancer parchea atributos, nunca contenido, el nombre es tuyo.",
    "sidebarPage.htmlTitle": "HTML autorado",
    "sidebarPage.htmlBody1":
      "El enhancer busca <code>[data-sk-sidebar]</code>, acepta un <code>[data-sk-sidebar-trigger]</code> o un <code>[data-sk-sidebar-resize]</code> y parchea <code>aria-expanded</code>, <code>aria-controls</code> y <code>data-state</code>. No escribe markup ni clases. El markup completo está en la pestaña <strong>Vanilla</strong> del preview.",
    "sidebarPage.htmlBody2":
      'En ese markup, el <code>.app-shell</code> que envuelve al <code>&lt;aside&gt;</code> y el <code>.app-shell__main</code> de al lado <strong>no son del sidebar</strong>: son la app que lo consume, puesta ahí porque un riel sin nada al lado no se lee. Lo que copias es el <code>&lt;aside class="sk-sidebar"&gt;</code>; el resto lo pone tu layout.',
    "sidebarPage.vanillaInitTitle": "Inicializar vanilla",
    "sidebarPage.reactBody":
      "Controlado (<code>collapsed</code>) o no controlado (<code>defaultCollapsed</code>), con <code>onCollapsedChange</code> para persistir la preferencia. El evento equivalente en vanilla es <code>sk-collapsed-change</code>. Persistir es del consumidor: con qué clave y por usuario o por dispositivo no lo decide un design system. El código está en la pestaña <strong>React</strong> del preview.",
    "sidebarPage.iconsComment": "Los iconos se autoran como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "sidebarPage.test1": "Colapsa en modo no controlado y reporta el cambio.",
    "sidebarPage.test2": "El trigger apunta al contenido que controla.",
    "sidebarPage.test3":
      "Escribe el estado colapsado, emite el cambio, y la limpieza remueve los listeners.",
    "sidebarPage.test4": "Escribe la propiedad de ancho mientras se arrastra, y solo mientras se arrastra.",
    "sidebarPage.test5": "Restaura un ancho guardado al montar, y deja intacto un sidebar sin clave.",

    "sliderPage.description": "Slider: range nativo con skin, relleno pintado sin JavaScript y componente React.",
    "sliderPage.lede":
      'Slider es un <code>&lt;input type="range"&gt;</code> real con skin: teclado, participación en formularios y árbol de accesibilidad vienen de la plataforma. La porción rellena se expone como la propiedad <code>--sk-slider-fill</code> (0–1): el valor inicial lo pinta el CSS solo, y seguir el pulgar mientras se arrastra es lo único que necesita el binding.',
    "sliderPage.body1":
      "En Vanilla, <code>data-sk-slider</code> registra el binding mínimo que reescribe <code>--sk-slider-fill</code> en cada <code>input</code>, nada más: teclado, foco y formulario siguen siendo de la plataforma. En React, <code>&lt;Slider&gt;</code> mantiene la propiedad en sincronía en modo controlado y no controlado, y reporta el cambio como número vía <code>onValueChange</code>.",
    "sliderPage.body2":
      "El <code>value</code> del contrato es <strong>dónde arranca el pulgar</strong>, y cada binding lo escribe con su nombre: <code>value</code> en el markup, <code>defaultValue</code> en React. No es cosmético: <code>value</code> en React significa controlado, así que emitirlo entregaba un slider que no se podía mover.",
    "sliderPage.test1": "Sigue siendo un <code>&lt;input type=\"range\"&gt;</code> nativo y reporta los cambios de valor como números.",
    "sliderPage.test2": "Pinta el relleno inicial desde el valor dentro de [min, max] al montar.",
    "sliderPage.rangeTitle": "Dos pulgares",
    "sliderPage.rangeBody":
      'Dos <code>&lt;input type="range"&gt;</code> nativos, no el widget SVG a mano que la propia APG de WAI-ARIA publica como único ejemplo para este patrón — cada input ya trae teclado, foco y árbol de accesibilidad gratis de la plataforma, y la propia guía WAI advierte que un widget hecho a mano puede fallar con lectores de pantalla táctiles. Ningún pulgar puede arrastrarse más allá del otro: <code>sliderRangeBounds</code> calcula el límite de cada uno contra dónde está el OTRO en ese momento, nunca contra un mínimo o máximo fijo.',
    "sliderPage.rangeLabel": "Rango de precio",
    "sliderPage.testRange1":
      "El máximo del pulgar bajo queda acotado por el valor actual del pulgar alto, y viceversa.",
    "sliderPage.testRange2":
      "Al cambiar un valor, reacota el OTRO pulgar y reporta ambos valores en el cambio.",
    "sliderPage.testRange3":
      "Ningún pulgar puede superar al otro — el min/max nativo recorta incluso una escritura directa de valor que se pase del límite.",

    "splitButtonPage.description": "Acción principal estable y menú adyacente con acciones alternativas.",
    "splitButtonPage.contractBody": "La acción principal no cambia silenciosamente al elegir el menú. Si no hay una acción dominante, usa Menu.",
    "splitButtonPage.a11yBody": "Son dos botones independientes: uno ejecuta y el otro anuncia y abre las alternativas.",
    "splitButtonPage.smallTitle": "Tamaño small",
    "splitButtonPage.smallBody": "Las dos mitades escalan juntas — <code>size</code> en el Button primario, <code>triggerSize</code> en el trigger del Menu.",
    "splitButtonPage.smallLabel": "SplitButton, tamaño small",
    "splitButtonPage.menuFirstTitle": "El menú primero",
    "splitButtonPage.menuFirstBody": "Compuesto a mano con <code>Inline</code> en vez del contrato de SplitButton — que siempre ordena la acción antes que el menú, el patrón real de un split button (el trigger va después, y solo pasa a la izquierda por espejado <code>dir=\"rtl\"</code>, nunca como elección autorada en el mismo idioma). Esto demuestra que <code>squareStart</code>/<code>squareEnd</code> funcionan en cualquier orden, no solo en el que arma SplitButton.",
    "splitButtonPage.menuFirstLabel": "SplitButton, menú primero",

    "stackPage.description": "Stack: primitive de layout vertical con separación y alineación transversal.",
    "stackPage.lede":
      "Stack apila contenido en el eje vertical. Es un pattern estructural: el elemento que lo lleva conserva la semántica del contenido, y el gap expresa la separación entre sus hijos.",
    "stackPage.htmlTitle": "HTML autorado",
    "stackPage.htmlBody": "Elige directamente el elemento semántico; Stack no requiere inicialización vanilla.",
    "stackPage.reactBody": "Usa <code>as</code> para elegir el elemento que renderiza el adapter sin perder el contrato de layout.",
    "stackPage.contractItem1": "<code>sk-stack</code> crea una grilla de una columna y apila sus hijos verticalmente.",
    "stackPage.contractItem2":
      "<code>data-gap</code> acepta <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>; al omitirlo usa <code>md</code>.",
    "stackPage.contractItem3":
      "<code>data-align</code> alinea en el eje transversal: <code>start</code>, <code>center</code>, <code>end</code> o <code>stretch</code>. Al omitirlo, la grilla estira los hijos.",
    "stackPage.contractItem4": "En React, <code>as</code> es opcional y renderiza <code>div</code> si no se indica.",
    "stackPage.test1": "Renderiza Stack, Inline y Grid según los contratos de layout documentados.",

    "statPage.description": "Stat: métrica de titular con label, valor tabular y cambio coloreado por tendencia.",
    "statPage.lede":
      "Stat es una métrica de titular: label tenue, valor grande en mono tabular, y un cambio opcional. La <strong>tendencia</strong> colorea el cambio con independencia de su signo, «bajar» es bueno para churn y «subir» es bueno para ingresos, así que el consumidor decide qué dirección es positiva.",
    "statPage.cardTitle": "Stat Card",
    "statPage.cardBody":
      '<a href="/componentes/card#stat-card">Card</a> no añade otra variante a Stat: <a href="/componentes/box">Box</a> aporta la superficie y Grid organiza la colección. La flecha baja en cancelaciones, pero <code>trend="up"</code> comunica que ese cambio es favorable.',
    "statPage.animateTitle": "Animar el valor",
    "statPage.animateBody":
      "El count-up es <strong>opt-in</strong>: el mismo Stat Card, con <code>animate</code> / <code>data-animate</code> y un valor numérico. Sin él el markup sigue estático. La duración sale de <code>--motion-count-duration</code>; con <code>prefers-reduced-motion</code> salta al final.",
    "statPage.animateLabel": "Stat Cards animadas",
    "statPage.animateNote": "Mismo card · animate + format / data-count",
    "statPage.test1": "Colorea el cambio según la tendencia, no según el signo.",
    "statPage.test2": "Omite el elemento de cambio cuando no se pasa ninguno.",
    "statPage.test3": "Cuenta un valor numérico hacia arriba cuando <code>animate</code> está activo.",

    "stepsPage.description": "Steps: indicador de progreso lineal con estados complete / current / upcoming.",
    "stepsPage.lede":
      "Steps muestra el avance sobre una secuencia ordenada. Cada paso reporta uno de tres estados <code>complete</code>, <code>current</code>, <code>upcoming</code>; el componente exhibe la secuencia, no gobierna cuál está activo ni guarda la navegación entre pasos.",
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

    "switchPage.description": "Switch: una preferencia binaria persistente sobre checkbox nativo.",
    "switchPage.lede": "Un estado binario que toma efecto inmediatamente: encendido o apagado. Para una selección que requiere guardar, usa Checkbox.",
    "switchPage.body": "No requiere inicialización Vanilla: el checkbox nativo conserva teclado, reset y submit de formularios. React sólo encapsula ese mismo control.",
    "switchPage.tileTitle": "Switch de superficie: TileSwitch",
    "switchPage.tileBody1":
      "Cuando la preferencia necesita título, descripción y toda la superficie como target, usa <code>TileSwitch</code>. Es el mismo control (<code>sk-switch__control</code> + thumb); solo cambia el contenedor, la misma relación que <code>TileCheckbox</code> tiene con Checkbox.",
    "switchPage.tileBody2":
      'El enhancer <code>tile-switch</code> (Svelte + <code>@zag-js/checkbox</code>, la misma máquina que TileCheckbox y que React) hidrata cada label <code>data-sk-tile-switch</code> con <code>initComponents()</code>: controla su <code>input[data-part="input"]</code> (oculto, <code>role="switch"</code>) y sincroniza <code>data-state</code>; el <code>[data-part="indicator"]</code> es el control visual.',
    "switchPage.contractItem1": '<code>El input sigue siendo checkbox</code>; <code>role="switch"</code> comunica la semántica correcta.',
    "switchPage.contractItem2": "<code>defaultChecked</code> deja el valor al browser; <code>checked</code> lo controla.",
    "switchPage.contractItem3":
      "<code>onCheckedChange</code> (<code>onCheck</code> en TileSwitch) reporta la intención; no infiere persistencia ni hace requests.",
    "switchPage.contractItem4": "Úsalo sólo si el cambio toma efecto de inmediato y hay exactamente dos estados: sin indeterminate, a diferencia de Checkbox.",
    "switchPage.contractItem5": "TileSwitch reutiliza <code>sk-switch__control</code> y el mismo thumb; no inventa otro control.",
    "switchPage.test1":
      "Alterna el estado marcado y el <code>data-state</code> de la raíz al hacer click, emitiendo <code>sk:checkedchange</code>.",
    "switchPage.test2": "Está asociado al formulario y respeta su <code>default-checked</code>.",

    "tablePage.description": "Tabla nativa legible con scroll horizontal y filas o columnas sticky.",
    "tablePage.lede":
      "Table mantiene la semántica nativa de <code>&lt;table&gt;</code>. El wrapper de overflow preserva un ancho legible por columna y desplaza la tabla en vez de comprimirla. Header y primera columna sticky son opt-in y usan el mismo contrato en móvil y desktop.",
    "tablePage.scrollTitle": "Scroll horizontal sin comprimir",
    "tablePage.scrollBody":
      'Dentro de <code>.sk-table-scroll</code>, cada celda conserva el piso <code>--sk-table-cell-min-inline-size</code>; los encabezados de fila conservan uno mayor. Una tabla <code>data-layout="fixed"</code> usa además <code>--sk-table-fixed-min-inline-size</code>. En pantallas estrechas aparece scroll, no columnas de 56px ni texto letra por letra. El wrapper admite foco para desplazamiento por teclado y pinta un scrollbar compacto pero visible.',
    "tablePage.stickyColTitle": "Primera columna sticky",
    "tablePage.stickyColBody":
      'Usa <code>data-sticky-column</code> en HTML o <code>stickyColumn</code> en React. La primera celda de cada fila queda congelada y su sombra separa el identificador de los datos que pasan por debajo. Conviene que sea un <code>&lt;th scope="row"&gt;</code>. No depende de un breakpoint: funciona igual con touch, mouse, zoom o una ventana angosta.',
    "tablePage.stickyColLabel": "Primera columna sticky",
    "tablePage.stickyHeadTitle": "Header row sticky",
    "tablePage.stickyHeadBody":
      "Usa <code>data-sticky-header</code> o <code>stickyHeader</code>. El wrapper gana scroll vertical y un alto máximo de <code>20rem</code>, que puedes sobrescribir como en este ejemplo. El encabezado queda visible tanto en desktop como en móvil; si combinas ambos modifiers, la celda de la esquina queda sobre las dos capas.",
    "tablePage.stickyHeadLabel": "Fila de encabezado sticky",
    "tablePage.resizableTitle": "Columnas redimensionables",
    "tablePage.resizableBody":
      'Usa <code>data-resizable-columns</code> en HTML o <code>resizableColumns</code> en React, junto con <code>resizeLabel</code> (obligatoria). El binding inserta un separador real (<code>role="separator"</code>) entre cada par de encabezados — el mismo primitivo compartido, <code>@skryensya/core/splitter</code>, que ya usan el separador de <a href="/componentes/sidebar">Sidebar</a> y el redimensionador de columnas de <a href="/componentes/treegrid">Treegrid</a>. Arrastra el borde de un encabezado, o enfócalo y usa las flechas (Shift para el paso grueso), Home/End para los extremos, Enter o doble click para restablecer el par a un reparto parejo.',
    "tablePage.resizableLabel": "Rendimiento por región, redimensionable",
    "tablePage.pagerTitle": "Con paginación",
    "tablePage.pagerBody":
      '<code>data-sk-table-pager</code> es el enhancer vanilla; <code>sk-table-pager</code> es el pattern de layout (tabla + barra). Marcas las filas, dejas el <code>nav</code> vacío y (opcional) un status y un <a class="sk-link sk-interactive" href="/componentes/select"><code>Select</code></a> de tamaño de página. El tamaño va al inicio de la barra; status y <a class="sk-link sk-interactive" href="/componentes/pagination"><code>Pagination</code></a> van juntos en <code>sk-table-pager__end</code>. Usa <code>data-layout="fixed"</code> para que no bailen los anchos de columna.',
    "tablePage.pagerLabel": "Table + Pagination",
    "tablePage.boxTitle": "Dentro de un Box",
    "tablePage.boxBody":
      "Dentro del <code>padding</code> de un <code>.sk-box</code>, la <code>.sk-table</code> redondea con el radio de elemento anidado (<code>--radius-control</code>) en vez del de superficie: Box aporta la superficie y la tabla es un elemento dentro de ella. Así el radio queda más ajustado, nunca colapsa a una caja cuadrada, y sigue acompañando al eje <code>data-radius</code>.",
    "tablePage.boxLabel": "Table en Box",
    "tablePage.densityTitle": "Densidad local",
    "tablePage.densityBody":
      "El contrato del scope es solo <code>data-sk-density-scope</code> y un valor de densidad. Aquí <code>--sk-density-factor</code> es relativo al sistema; escribe <code>--sk-density</code> en el mismo nodo si necesitas un valor absoluto. Los números siguen siendo continuos.",
    "tablePage.densityWideLabel": "Table amplia · 1.2× del sistema",
    "tablePage.densityCompactLabel": "Table compacta · 0.6× del sistema",
    "tablePage.reactBody": "El binding está en <strong>Vanilla | React</strong>. En Vanilla basta el HTML con <code>data-sk-*</code>; <code>initComponents</code> (y <code>mountIcons</code>) los carga el sitio.",
    "tablePage.test1": "Renderiza la estructura nativa de la tabla con todas las clases de parte estables.",
    "tablePage.test2": "Los encabezados son columnas por defecto, preservando el scope de fila explícito.",

    "tabsPage.description": "Tres ejemplos de Tabs, de la anatomía básica al control manual.",
    "tabsPage.lede":
      "Empieza con dos vistas, añade estados e iconos y termina con una navegación vertical controlada. La anatomía no cambia al crecer: lista, triggers y un panel por cada valor.",
    "tabsPage.basicTitle": "1. Básico",
    "tabsPage.basicBody": "Dos triggers y dos paneles. <code>data-value</code> enlaza cada opción con su contenido; el enhancer completa roles, foco y ARIA.",
    "tabsPage.basicLabel": "Tabs básicos",
    "tabsPage.statesTitle": "2. Estados e iconos",
    "tabsPage.statesBody": "El mismo contrato admite labels compuestos y opciones deshabilitadas. El icono acompaña al texto; nunca reemplaza el nombre accesible del tab.",
    "tabsPage.statesLabel": "Tabs con estados",
    "tabsPage.advancedTitle": "3. Orientación y estado",
    "tabsPage.advancedBody":
      "En orientación vertical, las flechas recorren el rail. Con activación manual, mover el foco no cambia el panel: Enter o Espacio confirma la selección. El evento actualiza la región viva debajo del componente.",
    "tabsPage.advancedLabel": "Tabs verticales con control manual",
    "tabsPage.vanillaInitTitle": "Inicializar vanilla",
    "tabsPage.vanillaInitBody": "<code>initComponents</code> conecta los Tabs. Los iconos se montan por separado con el set elegido por la aplicación.",
    "tabsPage.contractItem1": "La raíz usa <code>data-sk-tabs</code> y conserva el valor activo en <code>data-value</code>.",
    "tabsPage.contractItem2": "Cada trigger y panel declara el mismo <code>data-value</code>.",
    "tabsPage.contractItem3": "<code>data-disabled</code> retira una opción de la interacción.",
    "tabsPage.contractItem4": "<code>data-orientation=\"vertical\"</code> cambia el eje de navegación y del indicador.",
    "tabsPage.contractItem5": "<code>data-activation-mode=\"manual\"</code> separa foco y selección.",
    "tabsPage.contractItem6": "Vanilla emite <code>sk-value-change</code>; React expone <code>onValueChange</code>.",
    "tabsPage.reactBody": "El componente renderiza la misma anatomía desde <code>items</code>. Usa <code>value</code> y <code>onValueChange</code> cuando otro estado de la aplicación dependa de la pestaña activa.",
    "tabsPage.test1": "Conecta la pestaña seleccionada con su panel nombrado.",
    "tabsPage.test2": "Refleja la selección en el atributo <code>data-*</code> de la raíz.",
    "tabsPage.test3": "Mueve el foco itinerante con Flecha derecha sin cambiar la selección manual.",

    "tagPage.description": "Tag: chip de palabra clave opcionalmente removible, con tonos y componente React.",
    "tagPage.lede":
      'Tag clasifica contenido sobre el que el usuario puede actuar: filtros, facetas, chips. Donde <a href="/componentes/badge">Badge</a> es una etiqueta de estado de solo lectura, Tag es más cuadrado (radio de control, no píldora) para leerse como accionable, y puede llevar un botón de quitar.',
    "tagPage.body": "Cuando es removible, la etiqueta y el botón de quitar son dos objetivos distintos: el nombre accesible del control nombra el tag que remueve.",
    "tagPage.xTitle": "La X es un Button, no un dibujo de uno",
    "tagPage.xBody1":
      'El control de quitar es un <a href="/componentes/button">Button</a> real (<code>sk-button sk-interactive</code> con <code>data-size="sm"</code>, <code>data-icon-only</code> y <code>data-variant="ghost"</code>) y <code>sk-tag__remove</code> es sólo el modificador que lo encoge al alto de la cápsula. Tag no envía interacción propia.',
    "tagPage.xBody2":
      'Lo que se gana es lo que ya no hay que mantener acá: el hover y el press vienen del <a href="/state-layer">state layer</a>, el anillo de foco es el mismo de todos los controles, y el área de toque llega a <strong>44px</strong> por el <code>::after</code> del botón aunque la cara pinte 20px. Antes eran 20px de cara y 20px de blanco útil.',
    "tagPage.xBody3": "El color sigue siendo <code>currentColor</code>, así que cada tono trae su X en su propio color sin una regla por tono.",
    "tagPage.reactBody": "El código está en la pestaña <strong>React</strong> del preview. <code>onRemove</code> es opcional.",
    "tagPage.test1": "Lleva su tono y su etiqueta.",
    "tagPage.test2": "Expone un control de remover nombrado solo cuando se pasa <code>onRemove</code>.",

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
    "textPage.contractItem3": "<code>data-tone</code>: <code>primary</code>, <code>secondary</code>, <code>tertiary</code> o <code>danger</code>.",
    "textPage.contractItem4": "<code>data-weight</code>: <code>body</code>, <code>emphasis</code> o <code>label</code>.",
    "textPage.contractItem5":
      "<code>data-role</code>: <code>eyebrow</code> (sobretítulo en mayúsculas) o <code>subtitle</code> (bajada bajo un título). Un rol compone varios ejes de una vez; en React se pasa como <code>data-role</code>.",
    "textPage.contractItem6": "En React, <code>as</code> acepta <code>p</code>, <code>div</code> o <code>span</code>; por defecto es <code>p</code>.",
    "textPage.contractItem7": "Para encabezados, usa Heading y un elemento <code>h1</code>–<code>h6</code>, no Text.",
    "textPage.test1": "Mantiene Text semántico y aplica su rol de lectura nombrado.",

    "themeTogglePage.description": "Theme Toggle: cicla el modo de color system → claro → oscuro y re-tematiza con color-scheme.",
    "themeTogglePage.lede":
      'Theme Toggle cicla el <strong>modo de color</strong> (system → claro → oscuro → system). Es un Button ghost icon-only con tres caras apiladas; al hacer clic escribe <code>data-scheme</code> y <code>color-scheme</code> en <code>&lt;html&gt;</code> para que <code>light-dark()</code> re-tematice. El tamaño es el del Button: <strong>md</strong> (por defecto) o <code>data-size="sm"</code> / <code>size="sm"</code>. La persistencia la pone la app.',
    "themeTogglePage.previewNote": "md · sm",
    "themeTogglePage.contractItem1":
      "Las caras usan los roles estables <code>mode-system</code>, <code>mode-light</code> y <code>mode-dark</code>, marcadas con <code>data-sk-theme-toggle-icon</code>.",
    "themeTogglePage.contractItem2": "El enhancer aplica el modo en <code>document.documentElement</code> y dispara <code>sk-theme-toggle-change</code> con <code>detail.value</code>.",
    "themeTogglePage.contractItem3":
      'Un script FOUC en el <code>&lt;head&gt;</code> debe leer la preferencia guardada y pintar <code>data-scheme</code> / <code>color-scheme</code> antes del primer paint (ver <a href="/primer-componente">Primer componente</a>).',
    "themeTogglePage.test1": "Monta una sola vez y recorre sistema → claro → oscuro al hacer click.",
    "themeTogglePage.test2": "Dispara <code>sk-theme-toggle-change</code> con el nuevo modo.",
    "themeTogglePage.test3": "Mantiene sincronizados todos los ThemeToggle cuando uno cambia.",

    "tilePage.description": "Patrón visual para una única interacción; Box para superficies estáticas o varios controles.",
    "tilePage.lede": 'Invariante estricta: cada Tile tiene exactamente una intención interactiva. Un Tile nunca es una superficie estática. Para contenido estático o varios controles independientes, usa <a href="/componentes/box">Box</a>.',
    "tilePage.body1": "Tile es una receta visual que los componentes semánticos aplican sobre el elemento nativo correcto. Las demos y los contratos de TileLink, TileButton, TileCheckbox, TileSwitch y TileRadioGroup viven junto a Link, Button, Checkbox, Switch y RadioGroup.",
    "tilePage.body2": 'La guía <a href="/componentes/card">Card</a> compara estas raíces con Box en cards reales de contenido, noticia, producto, enlace, acción, selección y métricas.',
    "tilePage.chooseTitle": "Elige por comportamiento",
    "tilePage.headNeed": "Necesidad",
    "tilePage.headComponent": "Componente",
    "tilePage.headNative": "Contrato nativo",
    "tilePage.row1Need": "Contenido estático o varios controles",
    "tilePage.row1Native": "El elemento que elija quien lo usa.",
    "tilePage.row2Need": "Navegar a un destino",
    "tilePage.row2Native": '<code>TileLink</code> usa <code>&lt;a href&gt;</code>',
    "tilePage.row3Need": "Ejecutar una acción",
    "tilePage.row3Native": '<code>TileButton</code> usa <code>&lt;button type="button"&gt;</code>',
    "tilePage.row4Need": "Seleccionar independientemente",
    "tilePage.row4Native": '<code>TileCheckbox</code> usa <code>&lt;input type="checkbox"&gt;</code>',
    "tilePage.row5Need": "Preferencia binaria con efecto inmediato",
    "tilePage.row5Native": '<code>TileSwitch</code> usa <code>&lt;input type="checkbox" role="switch"&gt;</code>',
    "tilePage.row6Need": "Elegir una opción exclusiva",
    "tilePage.row6Native": '<code>TileRadioGroup</code> usa <code>&lt;input type="radio"&gt;</code>',
    "tilePage.row7Need": "Mostrar u ocultar detalles (uno o varios)",
    "tilePage.row7Native": '<code>&lt;button&gt;</code> trigger; una o varias divulgaciones Tile',
    "tilePage.contractsTitle": "Contratos",
    "tilePage.contractItem1": "Link y botón no requieren enhancer: el navegador ya provee su comportamiento.",
    "tilePage.contractItem2":
      "Checkbox, switch, radio group y Accordion conservan inputs o botón reales. Sus enhancers Vanilla leen los hooks <code>data-part</code> documentados en los componentes semánticos. Una sola divulgación es Accordion con un item.",
    "tilePage.contractItem3":
      'No anides controles interactivos dentro de un Tile. Si hacen falta acciones independientes, usa <a href="/componentes/box">Box</a> y deja los controles como hermanos.',
    "tilePage.contractItem4": "Los bindings React renderizan el mismo contrato semántico; no montan el enhancer Vanilla.",
    "tilePage.contractItem5":
      "Todos los Tile aceptan <code>data-padding</code> con <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>; React expone el mismo valor como <code>padding</code>. El default es <code>md</code>.",
    "tilePage.test1": "Renderiza cada raíz de Tile de React con una variante interactiva o de disclosure explícita.",
    "tilePage.test2": "Renderiza la anatomía compartida de título y descripción para los tiles seleccionables.",
    "tilePage.test3": "Soporta cambios de checkbox en modo no controlado.",

    "timeFieldPage.description": "Un campo de hora segmentado: hora, minuto y AM/PM como partes editables e independientes, operables por teclado.",
    "timeFieldPage.lede":
      'Un campo para una hora de reloj local, sin fecha, sin zona horaria. Hora, minuto y (en un locale de 12 horas) AM/PM son tres segmentos editables independientes en un solo campo, en vez del chrome del propio <code>&lt;input type="time"&gt;</code>, que difiere lo suficiente entre Chrome, Firefox y Safari como para no poder estilarse ni confiar en que se vea igual dos veces. No existe una machine <code>@zag-js/time-picker</code>, así que este componente es estado a mano, como Slider y Segmented, pero tampoco hay popover: una versión anterior ponía un selector de ruedas detrás de un trigger, y resultó no ser ni más simple ni más accesible que construir los segmentos directamente.',
    "timeFieldPage.contractBody":
      "El orden de los segmentos y el separador entre ellos se leen del propio <code>formatToParts</code> de <code>Intl.DateTimeFormat</code>, no se asumen: algunos locales ponen el periodo del día antes de la hora, y el separador no siempre es <code>\":\"</code>. El valor público sigue siendo el string canónico <code>HH:mm</code>, la misma forma que envía un <code>&lt;input type=\"time\"&gt;</code> plano, llevado en un input oculto, así que un formulario detrás de TimeField nunca tiene que parsear un string dependiente del locale. React lo guarda como estado del componente (<code>value</code>/<code>defaultValue</code>, un callback <code>onValueChange</code>). Vanilla hidrata el <code>data-sk-time-field</code> autorado: el consumidor sólo autora la raíz y su label, y el componente genera los segmentos a partir de <code>data-locale</code>.",
    "timeFieldPage.editTitle": "Editar un segmento",
    "timeFieldPage.editBody":
      'Escribir un dígito llena el segmento enfocado y avanza en cuanto ningún otro dígito podría mantenerlo válido: escribir <kbd class="sk-kbd">1</kbd> en el segmento de hora de un campo de 12 horas espera brevemente un posible segundo dígito (<code>10</code>–<code>12</code>), escribir <kbd class="sk-kbd">9</kbd> avanza de inmediato, porque ningún segundo dígito podría seguirlo y seguir siendo ≤ 12. Las flechas arriba/abajo suben o bajan el valor y dan la vuelta en los extremos; <kbd class="sk-kbd">Retroceso</kbd> limpia el segmento; <kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> mueven entre segmentos; escribir la primera letra de la etiqueta AM/PM del locale en ese segmento lo fija directamente.',
    "timeFieldPage.nativeTitle": "Si sólo necesitas el selector de la plataforma",
    "timeFieldPage.nativeBody":
      'Un <code>&lt;input type="time"&gt;</code> plano sigue funcionando, no necesita CSS ni JavaScript, y trae gratis el teclado y selector del sistema operativo. Sube a TimeField sólo cuando la inconsistencia de ese selector entre navegadores, o la ausencia total de hooks de estilo, realmente te cuesta algo, la misma decisión que DatePicker toma contra un <code>type="date"</code> plano.',
    "timeFieldPage.nativeLabel": "Input de hora nativo",
    "timeFieldPage.a11yBody":
      'Cada segmento es <code>role="spinbutton"</code> dentro de un <code>role="group"</code> nombrado por el label del campo: <code>aria-valuenow</code>/<code>aria-valuetext</code> llevan su valor actual (un placeholder amistoso como «hh» antes de fijar nada, no un string vacío), y <code>aria-valuemin</code>/<code>aria-valuemax</code> su rango real: 1–12 para un segmento de hora en un locale de 12 horas, 0–23 en uno de 24. Cada segmento es su propia parada de tabulación, igual que ya funciona un input de fecha nativo de varias partes, así que el uso por teclado no necesita nada más que Tab y las flechas documentadas arriba.',
    "timeFieldPage.test1": "Monta una sola vez y nombra el grupo a partir del label autorado.",
    "timeFieldPage.test2": "Deriva los segmentos del locale, no del markup.",
    "timeFieldPage.test3": "Empieza vacío, con placeholders en vez de una hora inventada.",

    "toastPage.description": "Toast: feedback transitorio en una región flotante. Misma anatomía que Callout, con ciclo de vida de la app.",
    "toastPage.lede":
      'Toast comunica feedback transitorio en una región flotante. El ítem es un <a href="/componentes/callout">Callout</a>, mismo markup, mismos tonos, envuelto en <code>sk-toast-region</code> y en el ciclo de vida del toast (montaje, dismiss, timeout opcional).',
    "toastPage.emitTitle": "Después de una acción",
    "toastPage.emitBody":
      "Es el caso real: un toast no se escribe ya visible, aparece porque algo pasó. Lo que sí es estable en el HTML son tres piezas: el control que dispara la acción, una <code>sk-toast-region</code> <strong>vacía</strong>, y un <code>&lt;template&gt;</code> con el ítem. La app clona, inserta y vuelve a montar; <code>initComponents</code> es idempotente, así que sólo toca lo recién insertado.",
    "toastPage.emitLabel": "Toast después de una acción",
    "toastPage.emitNote": "Pulsa el botón",
    "toastPage.simpleTitle": "Simple",
    "toastPage.simpleBody":
      'tone="neutral" (el default). En un toast el color casi nunca debería ser la señal principal: ya flota y se retira. Neutral deja que el texto diga el aviso sin pintar urgencia de más, y flota sobre una superficie <strong>raised</strong> (<code>--color-bg-surface-raised</code> + <code>--elevation-raised</code>) para leerse como chrome elevado, no como panel de página. Ver el mismo criterio en <a href="/componentes/callout">Callout</a>.',
    "toastPage.simpleLabel": "Toast simple",
    "toastPage.statusTitle": "Con estado",
    "toastPage.statusBody1": 'Los tonos de estado colorean el panel. <code>danger</code> se anuncia como <code>role="alert"</code> (assertive); el resto como <code>role="status"</code> (polite).',
    "toastPage.statusBody2":
      "El primero no lleva ✕: tiene <code>data-timeout</code>, así que se retira solo. Los otros dos piden algo de la persona, un despliegue que confirmar y un error que leer, y por eso se quedan hasta que se cierren. La regla práctica: <strong>si el toast puede cerrarse solo, no necesita ✕; si no puede, el ✕ es obligatorio</strong>.",
    "toastPage.statusLabel": "Toast con estado",
    "toastPage.actionTitle": "Con acción",
    "toastPage.actionBody":
      "<code>sk-callout__actions</code> es una sola columna: la acción de recuperación y el cierre viven ahí, en ese orden. Un toast con acción no lleva <code>data-timeout</code>, desaparecer antes de que alguien alcance a pulsar “Deshacer” convierte la acción en decorado.",
    "toastPage.actionLabel": "Toast con acción",
    "toastPage.stackTitle": "Apilado",
    "toastPage.stackBody1":
      "Es el <strong>comportamiento por defecto</strong>, no una opción que se prende: cuatro toasts sueltos se comen un cuarto de la pantalla, y nadie pide eso a propósito, una región con varios toasts es el resultado normal de una app que cuenta lo que hizo. Los toasts se solapan sobre la huella de <strong>uno</strong>, el más nuevo al frente y los anteriores asomando por detrás; al pasar el puntero (o al entrar el foco con el teclado) la pila se abre y vuelve a ser la lista normal.",
    "toastPage.stackBody2":
      "La salida es <code>data-stack=\"off\"</code>, para la región rara cuyo objetivo <em>es</em> mostrar varios mensajes a la vez. El ejemplo de tonos de más arriba lo usa: son tres toasts que hay que ver juntos, no una pila.",
    "toastPage.stackBody3":
      "Agrupa sobre la caja del <strong>más nuevo</strong>: es el único que queda en flujo, así que la región mide lo que mide él, y los de atrás salen de flujo estirados a esa misma caja. Por eso la pila se lee como un objeto y no como cartas descuadradas: si cada uno midiera su propio contenido, un toast de dos líneas detrás de uno de una sobresaldría por arriba y ningún borde de la pila calzaría con el siguiente.",
    "toastPage.stackBody4":
      "El único número del efecto es la <strong>profundidad</strong>, y sale del DOM: <code>sibling-count() - sibling-index()</code> da 0 para el más nuevo y uno más por cada uno detrás. La app apendea y remueve nodos, nunca lleva un índice. La opacidad se apaga sola en el cuarto (<code>calc(3 - depth)</code> se clampea), y donde el navegador no soporta leer el índice en CSS la región queda como la lista normal de arriba, que es la degradación honesta.",
    "toastPage.stackBody5":
      "Esa misma profundidad es el <strong>retardo</strong> de cada paso al abrir (<code>--sk-toast-cascade</code>): el de adelante sale primero y cada uno detrás lo sigue un beat después, así la pila se despliega en vez de inflarse toda junta. Volver al flujo es un cambio de <em>layout</em>, y el layout no transiciona, en el instante en que dejan de estar absolutos ya están varias filas más arriba; eso no se puede interpolar, así que en vez de animar el salto se lo tapa: cada toast entra con un fade y unos pixeles de subida hasta el lugar que acaba de tomar, en la misma cascada. El más nuevo no participa, nunca se movió y no debe parpadear.",
    "toastPage.stackLabel": "Pila de toasts",
    "toastPage.stackNote": "Pasa el puntero para abrirla",
    "toastPage.stackBody6":
      "El JavaScript es el mismo del primer ejemplo, y el HTML también: clonar, insertar, montar y remover en <code>sk-dismiss</code>. No hay nada que agregar para apilar. Los hooks son de la región: <code>--sk-toast-peek</code> (cuánto asoma cada uno), <code>--sk-toast-shrink</code> (cuánto encoge cada paso hacia atrás) y <code>--sk-toast-cascade</code> (cuánto se separan en el tiempo al abrir). Ningún toast sabe que está en una pila.",
    "toastPage.closeTitle": "El cierre es un Button",
    "toastPage.closeBody1":
      'El ✕ se construye como <a href="/componentes/button">Button</a> icon-only en tamaño <code>sm</code> (<code>data-size="sm" data-icon-only data-variant="ghost"</code>), no como un control ad hoc. Con eso hereda lo que ya resuelve Button: la cara de 32px, el hit target de 44px que <code>::after</code> expande más allá de esa cara, el state layer de hover y presión, y el foco. Sin texto visible, <code>aria-label</code> es obligatorio.',
    "toastPage.closeBody2":
      "Conserva además la clase de parte <code>sk-toast__dismiss</code>; propia de Toast, no prestada de Callout: es el gancho que busca el enhancer para cablear el dismiss, la que hace que el glifo lea el color del tono (<code>currentColor</code>) en vez del acento que pintaría un ghost normal, y la que corrige la <strong>posición óptica</strong>. Un icon-only ghost es casi todo aire: 16px de glifo en una caja de 32px, más el inset del panel, dejan el ✕ flotando en un hueco. La parte lo tira de vuelta media unidad de inset, así el <em>glifo</em> cae donde el padding dice que está el borde del contenido, sin que el área de click pierda un pixel.",
    "toastPage.lifecycleTitle": "El ciclo de vida es de la app",
    "toastPage.lifecycleBody1":
      'Toast no gestiona colas ni persistencia: esos ciclos pertenecen a la aplicación. El componente aporta la región, reutiliza la anatomía de <a href="/componentes/callout">Callout</a>; icono, título, descripción, acciones; más su propio dismiss, anuncia el tono y avisa cuándo se quiere ir.',
    "toastPage.lifecycleBody2":
      'En Vanilla, <code>data-sk-toast</code> sobre un <code>sk-callout</code> registra el dismiss nativo y anuncia el tono. <code>data-timeout</code> es opcional; al vencer emite <code>sk-dismiss</code> (igual que el ✕) con <code>detail.reason</code>, <code>"timeout"</code> o <code>"dismiss"</code>, por si la app distingue “se fue solo” de “lo cerraron”. El componente nunca retira el nodo: eso lo hace quien lo puso.',
    "toastPage.reactBody":
      'El código está en la pestaña <strong>React</strong> de cada preview. La API refleja Callout (<code>title</code>, <code>icon</code>, <code>actions</code>, <code>tone</code>) más <code>timeout</code> y <code>onDismiss</code> con razón. Sin <code>tone</code>, es neutral.',
    "toastPage.vanillaComment": "Los iconos se escriben como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "toastPage.test1": "Aplica la semántica compartida de región viva y reporta el cierre por botón nativo.",
    "toastPage.test2": "Solo agenda los timeouts autorados y los limpia durante el cleanup.",
    "toastPage.test3": "Monta el markup de toast autorado a través del enhancer del registro.",

    "tocPage.description": "Toc: el índice de un documento largo. Lista sus secciones (h2/h3) y marca la actual con scroll-spy.",
    "tocPage.lede":
      'El índice de un documento: una lista de enlaces a sus secciones (<code>h2</code>/<code>h3</code>), con la actual marcada por un scroll-spy. Cada fila es un enlace con <a href="/state-layer"><code>sk-interactive</code></a> (state layer) en tamaño caption: un índice se escanea, no se lee, y a tamaño de prosa competía con el documento que indexa. El icono es opcional.',
    "tocPage.anatomyTitle": "Anatomía",
    "tocPage.anatomyBody": "Raíz <code>&lt;aside&gt;</code>, un <code>&lt;details&gt;</code> como shell del disclosure, y dentro un <code>&lt;nav&gt;</code> con la lista de enlaces.",
    "tocPage.anatomyLabel": "Texto",
    "tocPage.levelsTitle": "Niveles",
    "tocPage.levelsBody":
      'Un <code>h3</code> marca <code>data-level="h3"</code> y se sangra bajo su <code>h2</code>. La sangría la lleva el enlace, nunca el ítem: en el ítem movería el borde inicial de la fila y con él la columna donde se pinta la marca de la sección actual, que dejaría de ser una sola línea vertical.',
    "tocPage.levelsLabel": "h2 y h3",
    "tocPage.iconsTitle": "Iconos",
    "tocPage.iconsBody": "El enlace admite un ícono decorativo delante de la etiqueta: la etiqueta ya nombra el destino, así que el ícono no lleva accesible name propio.",
    "tocPage.iconsLabel": "Con iconos",
    "tocPage.iconsCodeLabel": "enlace con icono",
    "tocPage.railTitle": "Rail o disclosure",
    "tocPage.railBody1":
      'El contrato publica UNA forma: un <code>&lt;details&gt;</code> interactivo, cerrado: el comportamiento de la plataforma, gratis. Es un consumidor con columna de sobra el que lo convierte en un <strong>rail</strong> siempre abierto y sticky junto a la prosa, igual que <code>sidebar</code> nunca decide por sí mismo que se vuelve un drawer. En este sitio, ese consumidor es el shell de docs: por debajo de <code>wide</code> el mismo <code>Toc</code> es la <strong>disclosure</strong> que el contrato ya emite; a partir de <code>wide</code>, <code>shell.scss</code> lo fuerza abierto e inerte.',
    "tocPage.railBody2":
      "<code>&lt;details&gt;</code> es lo que abarata ese cambio: el estado abierto, el toggle, el teclado y la accesibilidad son de la plataforma. Como disclosure, las filas llevan el gutter ellas mismas en vez del contenedor: el destino táctil llega a los dos bordes de la pantalla mientras el texto se queda en el margen del documento.",
    "tocPage.spaceTitle": "Espacio reservado",
    "tocPage.spaceBody":
      "En este sitio el track del grid es el ancho del TOC (<code>--docs-toc-inline-size</code>). El <code>&lt;aside&gt;</code> está siempre en flujo: antes de <code>data-ready</code> la lista queda invisible con altura mínima, así los enlaces no empujan el layout al aparecer.",
    "tocPage.clsTitle": "Sin CLS",
    "tocPage.clsBody":
      "Un árbol ya conoce sus ítems al componerse: es el caso de arriba. El shell real de este sitio tampoco los descubre en el navegador: los encabezados de una página estática son los mismos para todos los lectores, así que calcularlos en cada carga es pagar todas las veces por un dato que ya era cierto al compilar. El layout renderiza el cuerpo de la página a HTML (<code>Astro.slots.render</code>), lee ahí sus propias secciones y las entrega como <code>items</code>: la lista viaja en el HTML, con los <code>id</code> ya puestos en los encabezados. Sin secciones, marca <code>data-empty</code>.",
    "tocPage.clsCodeLabel": "en el layout",
    "tocPage.clsBody2":
      "Lo único que queda en el navegador es lo que no se puede saber antes de que haya un lector: el scroll-spy, y las páginas cuyo índice depende del estado (la de Accordion arma uno por tab, así que el layout la marca <code>pending</code> y deja la lista a su propio script).",
    "tocPage.clsBody3":
      "Montado, el mismo enhancer conecta el switch rail/disclosure y el scroll-spy que marca <code>aria-current</code> según la sección que cruza la banda superior del viewport: <code>connectToc</code>, detrás de <code>data-sk-toc</code>.",
    "tocPage.contractItem1":
      'Raíz: <code>&lt;aside class="sk-toc" data-sk-toc&gt;</code> con un <code>&lt;details class="sk-toc__inner" data-sk-toc-disclosure&gt;</code> dentro: <code>&lt;summary class="sk-toc__summary"&gt;</code> y <code>&lt;ul class="sk-toc__list"&gt;</code>.',
    "tocPage.contractItem2": "Forma: una sola, un <code>&lt;details&gt;</code> cerrado. Rail sticky es una decisión del consumidor, no del contrato (ver arriba).",
    "tocPage.contractItem3":
      "Cada ítem: <code>sk-toc__item</code> con su <code>data-level</code>. El enlace es <code>sk-toc__link sk-interactive</code>, con la etiqueta en <code>sk-toc__label</code> y un gutter inicial (<code>--sk-toc-gutter</code>) donde vive la marca de la sección actual.",
    "tocPage.contractItem4": 'Icono opcional: <code>&lt;span class="sk-toc__icon"&gt;</code> como primer hijo del enlace.',
    "tocPage.contractItem5": 'Estado activo: <code>aria-current="true"</code> en el enlace, escrito por el scroll-spy en tiempo de ejecución.',
    "tocPage.test1": "Nombra el nav a partir del caption y da nivel a cada ítem.",
    "tocPage.test2": "Siembra <code>aria-current</code> desde la composición antes de que el spy reporte.",
    "tocPage.test3": "Mueve <code>aria-current</code> a medida que los encabezados entran a la banda.",

    "toolbarPage.description": "Agrupa controles relacionados y permite recorrerlos con flechas.",
    "toolbarPage.contractBody": "Toolbar agrupa controles; no reemplaza Navbar ni Menu. Los grupos internos usan role=group.",
    "toolbarPage.a11yBody": "Flechas recorren controles; Home y End saltan a los extremos. Tab entra y sale de la barra.",
    "toolbarPage.compositeTitle": "Toolbar con widgets compuestos",
    "toolbarPage.compositeBody":
      "Un grupo no tiene que ser botones sueltos: puede ser un widget compuesto entero, como un Segmented. La barra trata cada widget compuesto como <strong>una sola parada</strong>: el roving tabindex del Segmented ya deja una sola opción en <code>tabindex=\"0\"</code>, así que Toolbar sólo visita esa. Adentro del Segmented, las flechas navegan sus propias opciones; no escapan hacia el siguiente grupo de la barra. Este es el patrón real que usa el propio header del component preview de este sitio: el selector de tamaño de pantalla y el toggle Vanilla/React de cada demo en esta página son dos Segmented dentro de un Toolbar.",
    "toolbarPage.compositeLabel": "Toolbar con Segmented anidado",

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
      'La <strong>flecha</strong> sigue el mismo reparto: sale del <em>trigger</em> y no del centro de la caja, así que sigue apuntando al control aunque la caja se haya corrido para no salirse de pantalla, y voltea junto con ella. Vive adentro del positioner y aun así se ancla al trigger, porque es <code>fixed</code>: un fijo lo contiene el viewport, no su padre. En el fallback la coloca la máquina. Está contado en <a href="/anclaje">Anclaje</a>.',
    "tooltipPage.test1": "Describe el trigger en vez de nombrarlo.",
    "tooltipPage.test2": "Se mantiene cerrado mientras está deshabilitado.",

    "wrapperPage.description": "Wrapper: columna de página con un techo de ancho de una escala.",
    "wrapperPage.lede":
      "Wrapper es la columna de página: un máximo de ancho centrado, con padding inline. Es lo que otros llaman <em>container</em>, pero ese nombre ya es de las <em>container queries</em>, así que aquí el rol se llama <strong>wrapper</strong>. El tamaño es una <strong>escala</strong> (<code>sm</code>, <code>md</code>, <code>lg</code>, <code>full</code>), no un nombre de uso: el techo dice qué tan ancha puede crecer la columna; el trabajo que hace lo decide quien la escribe.",
    "wrapperPage.ceilingTitle": "Un techo de ancho",
    "wrapperPage.ceilingBody":
      'Cada tamaño es un <strong>techo de ancho</strong> distinto: la columna se centra y deja de crecer al llegar a él. Abajo, un Wrapper con <code>data-size="sm"</code>: el margen a los costados es el techo haciendo su trabajo.',
    "wrapperPage.belowBody":
      "Debajo de su techo, cualquier wrapper es simplemente <code>100%</code>, por eso en una pantalla angosta los cuatro tamaños se ven iguales, y sólo se separan cuando hay lugar. Los techos son estables: la densidad cambia el espaciado y los controles, nunca el ancho máximo de la columna.",
    "wrapperPage.tableTitle": "Los cuatro techos",
    "wrapperPage.tableHeadSize": "Tamaño",
    "wrapperPage.tableHeadCeiling": "Techo",
    "wrapperPage.tableRow1": "42rem",
    "wrapperPage.tableRow2": "64rem · por defecto",
    "wrapperPage.tableRow3": "90rem",
    "wrapperPage.tableRow4": "sin techo, el viewport entero",
    "wrapperPage.siteTitle": "En este sitio",
    "wrapperPage.siteBody":
      'Esta documentación se envuelve a sí misma, con dos pasos. El header y el shell de tres columnas llevan ambos <code>data-size="lg"</code> (y el sitio afina el techo a un valor propio), así que un solo número mantiene sus bordes alineados. La columna que estás leyendo es <code>md</code>: el <code>&lt;main&gt;</code> lleva <code>data-size="md"</code> y su techo es el token, no un número copiado. Y una herramienta a pantalla completa, como el configurador, suelta el wrapper del todo.',
    "wrapperPage.contractItem1": 'En HTML, añade <code>sk-wrapper</code> al elemento que delimita la columna.',
    "wrapperPage.contractItem2":
      '<code>data-size</code> acepta <code>sm</code>, <code>md</code> (por defecto), <code>lg</code> o <code>full</code> (sin techo).',
    "wrapperPage.contractItem3": 'Los techos son tokens de tier 2: <code>--size-wrapper-sm</code>, <code>--size-wrapper-md</code>, <code>--size-wrapper-lg</code>.',
    "wrapperPage.contractItem4":
      'El único hook que un consumidor afina es <code>--sk-wrapper-max</code>, para un ancho que la escala todavía no nombra, sin reimplementar el centrado ni el padding.',
    "wrapperPage.test1": "Renderiza Wrapper como una columna de página sobre la escala de tamaños.",

    "treeViewPage.description": "Jerarquías expandibles con selección simple o múltiple.",
    "treeViewPage.lede":
      'Una jerarquía que se recorre con el teclado: las ramas se abren y cierran, los nodos se seleccionan. Usa TreeView cuando la relación padre-hijo <em>es</em> el contenido: archivos, categorías, una organización. Para divulgaciones hermanas sin jerarquía usa <a href="/componentes/accordion">Accordion</a>; para navegar por secciones, <a href="/componentes/sidebar">Sidebar</a>.',
    "treeViewPage.minimalTitle": "Árbol mínimo",
    "treeViewPage.minimalBody":
      "Lo mínimo es la anatomía completa y nada más: una raíz, la lista, y por cada nodo una rama (<code>branch</code> + <code>branch-control</code> + <code>branch-content</code>) o una hoja (<code>item</code>). Sin atributos de estado, todo arranca cerrado y sin selección.",
    "treeViewPage.minimalLabel": "TreeView mínimo",
    "treeViewPage.initialTitle": "Estado inicial",
    "treeViewPage.initialBody":
      "<code>data-expanded-value</code> y <code>data-selected-value</code> listan los <code>data-value</code> que arrancan abiertos y seleccionados. Aceptan espacios o comas como separador, y son sólo el estado <em>inicial</em>: desde ahí manda la máquina.",
    "treeViewPage.initialLabel": "Abierto y seleccionado de entrada",
    "treeViewPage.multipleTitle": "Selección múltiple",
    "treeViewPage.multipleBody":
      'data-selection-mode="multiple" deja marcar varios nodos con <kbd class="sk-kbd">Ctrl</kbd>/<kbd class="sk-kbd">⌘</kbd> y extender el rango con <kbd class="sk-kbd">Shift</kbd>. Las ramas anidan sin límite: una rama es un nodo con <code>branch-content</code>, tenga la profundidad que tenga, y la guía vertical marca de quién cuelga cada nivel.',
    "treeViewPage.multipleLabel": "Selección múltiple y tres niveles",
    "treeViewPage.disabledTitle": "Nodos deshabilitados",
    "treeViewPage.disabledBody":
      "Un nodo con <code>disabled</code> no se selecciona ni recibe foco, pero se sigue leyendo. Una rama deshabilitada tampoco se abre, así que no la uses para esconder contenido: para eso, no lo autores.",
    "treeViewPage.disabledLabel": "Nodo deshabilitado",
    "treeViewPage.eventsTitle": "Iconos y eventos",
    "treeViewPage.eventsBody":
      "TreeView reserva una columna para el control de apertura y otra para un icono estructural. Pasa <code>branchIcon</code> para todas las carpetas y <code>leafIcon</code> para todos los archivos: no hace falta inventar un icono por extensión o tipo de dato. La selección y la apertura se escuchan como eventos sobre la raíz.",
    "treeViewPage.eventsLabel": "Archivos con iconos",
    "treeViewPage.contractItem1": 'La raíz se autora con <code>data-sk-tree-view</code> y <code>class="sk-tree-view"</code>; su <code>aria-label</code> nombra el árbol.',
    "treeViewPage.contractItem2":
      "La lista lleva <code>data-sk-tree-view-tree</code>. Cada hijo directo es una rama (<code>data-sk-tree-view-branch</code>) o una hoja (<code>data-sk-tree-view-item</code>).",
    "treeViewPage.contractItem3":
      "Una rama contiene su control (<code>data-sk-tree-view-branch-control</code>, con indicador y texto) y su contenido (<code>data-sk-tree-view-branch-content</code>), que es otra lista de ramas y hojas.",
    "treeViewPage.contractItem4":
      "<code>data-value</code> identifica el nodo: es lo que aparece en los eventos y en <code>data-expanded-value</code> / <code>data-selected-value</code>. Es único en todo el árbol; sin él, el enhancer deriva un id de la posición, que se rompe al reordenar el markup.",
    "treeViewPage.contractItem5": "Cada fila clicable lleva <code>sk-interactive</code>: de ahí salen hover, foco, pressed, selección y el anillo de foco. El componente no pinta estados por su cuenta.",
    "treeViewPage.contractItem6":
      "Eventos sobre la raíz: <code>sk-selection-change</code> con <code>detail.selectedValue</code> y <code>sk-expanded-change</code> con <code>detail.expandedValue</code>, ambos arrays de <code>data-value</code>.",
    "treeViewPage.hooksBody":
      "La sangría, el inset de la fila y la guía vertical son hooks: el árbol viene angosto a propósito, porque la sangría se paga una vez por nivel. Ensancha el paso, dale aire a las filas o apaga la guía sin tocar el resto.",
    "treeViewPage.a11yBody":
      'La máquina publica <code>role="tree"</code>/<code>treeitem</code> con el nivel y la posición de cada nodo, y gestiona el teclado: flechas para moverse, <kbd class="sk-kbd">→</kbd>/<kbd class="sk-kbd">←</kbd> para abrir y cerrar ramas, <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> y typeahead por letra. El foco es roving: el árbol entero es una sola parada de tabulación, no una por nodo.',
    "treeViewPage.test1": "Parcha la semántica de árbol sobre el markup autorado y monta una sola vez.",
    "treeViewPage.test2": "Expande una rama desde su control y lo comunica.",
    "treeViewPage.test3": "Selecciona una hoja y reporta el valor que escribió la composición.",

    "treegridPage.description": "Filas jerárquicas con columnas: expande o colapsa una sin perder el resto de sus valores.",
    "treegridPage.lede":
      'Combina jerarquía y columnas a la vez — el patrón WAI-ARIA <code>treegrid</code>. Úsalo cuando cada fila necesita varios valores independientes ADEMÁS de su lugar en la jerarquía (un mensaje con remitente, un archivo con tamaño y fecha). Para una sola columna de texto jerárquico usa <a href="/componentes/tree-view">TreeView</a>; para columnas sin jerarquía, <a href="/componentes/table">Table</a>.',
    "treegridPage.minimalTitle": "Bandeja de entrada",
    "treegridPage.minimalBody":
      "El ejemplo que la propia especificación WAI-ARIA usa: dos columnas (Asunto, De), una carpeta abierta con dos mensajes, una carpeta colapsada cuyo único mensaje queda oculto, y un mensaje suelto en la raíz.",
    "treegridPage.minimalLabel": "Bandeja de entrada de ejemplo",
    "treegridPage.contractItem1":
      "Casi siempre envuelto en <code>TreegridScroll</code> — misma razón que <code>TableScroll</code>: un flex o un grid le da <code>min-size: auto</code>, y una grilla más ancha que su espacio revienta la superficie si nadie la envuelve.",
    "treegridPage.contractItem2":
      '<code>Treegrid</code> es un <code>&lt;table role="treegrid"&gt;</code> que EXIGE <code>label</code>: ese <code>role</code> no trae nombre accesible implícito, a diferencia de una tabla nativa.',
    "treegridPage.contractItem3":
      "<code>TreegridHead</code> / <code>TreegridHeadRow</code> / <code>TreegridColumnHeader</code> son encabezados de columna comunes — la misma forma que ya tiene <code>Table</code>.",
    "treegridPage.contractItem4":
      "Cada <code>TreegridRow</code> se autora PLANA, en el orden del documento — nunca anidada dentro de otra fila, un <code>&lt;tr&gt;</code> no puede contener otro <code>&lt;tr&gt;</code>. <code>level</code>, <code>setSize</code> y <code>posInset</code> son hechos propios que el autor ya conoce por escribir la fila en ese orden, no algo que el componente deriva.",
    "treegridPage.contractItem5":
      "<code>expanded</code> sólo se autoría en una fila que TIENE hijos — su ausencia, no un valor <code>false</code>, es lo que marca una fila como hoja. <code>true</code>/<code>false</code> controla si sus descendientes están visibles en este momento.",
    "treegridPage.contractItem6":
      'Cada <code>TreegridCell</code> es un <code>&lt;td role="gridcell"&gt;</code> común; la primera celda de una fila con hijos gana la sangría por CSS y un botón de apertura real que el binding inserta — nunca autorado, y decorativo para el lector de pantalla (<code>aria-expanded</code> en la fila ya anuncia el estado).',
    "treegridPage.contractItem7":
      '<code>resizableColumns</code> (apagada por defecto) inserta un separador <code>role="separator"</code> real entre cada par de encabezados — el mismo primitivo compartido de <code>@skryensya/core/splitter</code> que usa el separador de <code>Sidebar</code>. Exige <code>resizeLabel</code>: el separador es binding-insertado, así que nada más lo nombra para un lector de pantalla.',
    "treegridPage.hooksBody":
      "La sangría por nivel y el ancho reservado para el glyph de apertura son hooks: <code>--sk-treegrid-indent</code> y <code>--sk-treegrid-indicator-size</code>.",
    "treegridPage.a11yBody":
      'Cada fila lleva <code>role="row"</code> con <code>aria-level</code>/<code>aria-setsize</code>/<code>aria-posinset</code> — hechos ESTÁTICOS que no cambian al colapsar un hermano, sólo la visibilidad cambia — y <code>aria-expanded</code> únicamente si tiene hijos. Cada celda lleva <code>role="gridcell"</code>. El foco es roving: una sola fila o celda es la parada de tabulación en toda la grilla. <kbd class="sk-kbd">→</kbd> expande una rama colapsada o entra a su primera celda; <kbd class="sk-kbd">←</kbd> colapsa una rama abierta o sube a la fila padre; <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd> mueven entre filas visibles; <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> y <kbd class="sk-kbd">Ctrl</kbd>+<kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> saltan al principio/final; <kbd class="sk-kbd">Enter</kbd> alterna una rama con foco de fila o activa cualquier otro foco. Esta versión es fiel al ejemplo base de WAI (<code>treegrid-1</code>): celdas de solo texto, sin control interactivo propio dentro de una celda — por eso <kbd class="sk-kbd">Tab</kbd> siempre sale de la grilla, sin nada que interceptar.',
    "treegridPage.testVanilla1":
      "Al montar, esconde el único hijo de la rama que arranca colapsada.",
    "treegridPage.testVanilla2":
      "Flecha derecha sobre una rama colapsada la expande y revela su hijo, sin mover el foco de la fila.",
    "treegridPage.testVanilla3":
      "Clickear la primera celda de una rama la alterna y mueve el foco a la fila.",
    "treegridPage.testReact1":
      "Respeta el <code>expanded</code> inicial de cada fila, y esconde solo el descendiente de la rama colapsada.",
    "treegridPage.testReact2":
      "Flecha izquierda sobre una rama abierta la colapsa y esconde a sus hijos.",
    "treegridPage.testReact3": "Enter activa una fila hoja con foco.",

    "treegridPage.stressTitle": "Explorador de archivos (stress test)",
    "treegridPage.stressBody":
      "Cuatro columnas en vez de dos, contenido largo que fuerza el elipsis en más de una columna, siete niveles de profundidad (los cinco primeros con regla CSS propia, el sexto y el séptimo cayendo al tope compartido), ramas colapsadas en más de un nivel a la vez — incluida una en la raíz — y <code>resizableColumns</code>: arrastra o usa las flechas sobre el borde de un encabezado para redimensionar el par de columnas a los lados.",
    "treegridPage.stressLabel": "Explorador de archivos de ejemplo",

    "demo.treegrid.label": "Mensajes",
    "demo.treegrid.subject": "Asunto",
    "demo.treegrid.from": "De",
    "demo.treegrid.inbox": "Recibidos",
    "demo.treegrid.meeting": "Reunión de equipo",
    "demo.treegrid.lunch": "Almuerzo",
    "demo.treegrid.drafts": "Borradores",
    "demo.treegrid.untitled": "Sin título",
    "demo.treegrid.me": "Yo",
    "demo.treegrid.sent": "Enviados",

    "demo.treegridStress.label": "Explorador de archivos",
    "demo.treegridStress.resizeLabel": "Redimensionar columna",
    "demo.treegridStress.colName": "Nombre",
    "demo.treegridStress.colType": "Tipo",
    "demo.treegridStress.colSize": "Tamaño",
    "demo.treegridStress.colModified": "Modificado",
    "demo.treegridStress.typeFolder": "Carpeta",
    "demo.treegridStress.typeTs": "Archivo TypeScript",
    "demo.treegridStress.typeTest": "Archivo de test",
    "demo.treegridStress.typeStyle": "Hoja de estilos",
    "demo.treegridStress.typeConfig": "Configuración",
    "demo.treegridStress.typeMarkdown": "Documento Markdown",
    "demo.treegridStress.typeText": "Documento de texto",
    "demo.treegridStress.projectAlpha": "proyecto-alpha",
    "demo.treegridStress.src": "src",
    "demo.treegridStress.components": "components",
    "demo.treegridStress.buttonFolder": "Button",
    "demo.treegridStress.buttonTsx": "Button.tsx",
    "demo.treegridStress.internalTypesFolder": "tipos-internos-del-componente-con-props-extendidas",
    "demo.treegridStress.buttonPropsTs": "ButtonProps.ts",
    "demo.treegridStress.buttonTestTsx": "Button.test.tsx",
    "demo.treegridStress.buttonModuleCss": "Button.module.css",
    "demo.treegridStress.modalTsx": "Modal.tsx",
    "demo.treegridStress.utilsFolder": "utils",
    "demo.treegridStress.formatUtil": "format-currency-and-long-date-strings-for-every-supported-locale.ts",
    "demo.treegridStress.packageJson": "package.json",
    "demo.treegridStress.readme":
      "README-instrucciones-de-instalación-configuración-y-despliegue-para-todo-el-equipo.md",
    "demo.treegridStress.readmeModified": "Hace 3 semanas por Alice Fernández del equipo de Diseño",
    "demo.treegridStress.projectBeta": "proyecto-beta",
    "demo.treegridStress.indexTs": "index.ts",
    "demo.treegridStress.license": "licencia.txt",
    "demo.treegridStress.modified2d": "Hace 2 días",
    "demo.treegridStress.modified3d": "Hace 3 días",
    "demo.treegridStress.modified4d": "Hace 4 días",
    "demo.treegridStress.modified1h": "Hace 1 hora",
    "demo.treegridStress.modified5h": "Hace 5 horas",
    "demo.treegridStress.modified1day": "Hace 1 día",
    "demo.treegridStress.modified1week": "Hace 1 semana",
    "demo.treegridStress.modified1month": "Hace 1 mes",
    "demo.treegridStress.modified6months": "Hace 6 meses",

    "meterPage.description":
      "Meter: una medición dentro de un rango conocido, nunca el avance de una tarea.",
    "meterPage.lede":
      'Un valor medido ahora, no una tarea en curso — el rol WAI-ARIA <code>meter</code>, distinto de <code>progressbar</code>. Úsalo para uso de disco, nivel de batería, una calificación sobre una escala. Para el avance de una tarea con inicio y fin, usa <a href="/componentes/progress">Progress</a>.',
    "meterPage.body":
      "A diferencia de Progress, <code>min</code> es un parámetro real y con frecuencia distinto de cero — una calificación de 1 a 5, una temperatura. El relleno se calcula con <code>meterFraction(value, min, max)</code>, no con <code>value / max</code>.",
    "meterPage.test1": "Aplica role=meter con los tres atributos aria-value obligatorios.",
    "meterPage.test2":
      "Respeta un min distinto de cero al pintar el relleno, a diferencia de Progress.",
    "meterPage.a11yBody":
      'El rol <code>meter</code> lleva <code>aria-valuenow</code>/<code>aria-valuemin</code>/<code>aria-valuemax</code> siempre presentes, y <code>aria-valuetext</code> opcional para cuando el número solo no alcanza ("50% (6 horas) restantes"). Sin interacción de teclado: es una medición, no un control.',

    "demo.meter.rating": "Calificación",
    "demo.meter.ratingText": "4 de 5 estrellas",
    "demo.meter.disk": "Uso de disco",
    "demo.meter.diskText": "92% usado",
    "demo.meter.battery": "Batería",
    "demo.meter.batteryText": "68% restante",

    "feedPage.description":
      "Feed: un stream de publicaciones independientes, cada una anunciada con su posición.",
    "feedPage.lede":
      'Un stream desplazable de unidades de contenido independientes (posts, comentarios) — el rol WAI-ARIA <code>feed</code>. Cada <code>FeedArticle</code> declara su propia posición (<code>aria-posinset</code>/<code>aria-setsize</code>), así un lector de pantalla anuncia "2 de 3" sin tener que leer el resto del stream primero.',
    "feedPage.body":
      'WAI-ARIA es explícito: el rol <code>feed</code> "no está asociado a ninguna convención de teclado bien establecida" — Page Up/Page Down/Ctrl+Home/Ctrl+End son recomendaciones, no requisitos. Esta versión se queda puramente estática: sin máquina, sin manejo de teclado propio.',
    "feedPage.test1": "Aplica role=feed, lo nombra, y refleja aria-busy.",
    "feedPage.test2":
      "Cada artículo recibe role=article con aria-posinset/aria-setsize y un nombre real enlazado.",
    "feedPage.test3":
      "Permite setSize=-1 para un total indeterminado, por la propia licencia de WAI.",
    "feedPage.a11yBody":
      'La raíz lleva <code>role="feed"</code> con <code>aria-label</code> (obligatorio, el rol no trae nombre implícito) y <code>aria-busy</code> mientras carga más contenido. Cada <code>FeedArticle</code> es un <code>role="article"</code> con <code>aria-posinset</code>/<code>aria-setsize</code>, nombrado por su propio slot de etiqueta vía <code>aria-labelledby</code> — nunca solo referenciado, siempre renderizado.',

    "demo.feed.label": "Actividad reciente",
    "demo.feed.author1": "María — hace 2 horas",
    "demo.feed.body1": "Publicó el resumen del sprint.",
    "demo.feed.author2": "Diego — hace 5 horas",
    "demo.feed.body2": "Comentó en el issue #482.",
    "demo.feed.author3": "Lucía — ayer",
    "demo.feed.body3": "Cerró tres tickets del backlog.",

    "dataGridPage.description":
      "Data Grid: navegación 2D con roving tabindex para datos tabulares o widgets agrupados.",
    "dataGridPage.lede":
      'La propia especificación WAI-ARIA trata "data grids" y "layout grids" como el mismo patrón — mismos roles, misma mecánica de roving tabindex — así que este es UN contrato, no dos. Úsalo cuando una grilla de celdas necesita navegación 2D: <a href="/componentes/table">Table</a> ya cubre el caso de datos tabulares ESTÁTICOS, sin modelo de teclado propio.',
    "dataGridPage.dataTitle": "Datos tabulares",
    "dataGridPage.dataBody": "Celdas de solo texto: la parada de foco es la celda misma.",
    "dataGridPage.dataLabel": "Puntajes por ronda",
    "dataGridPage.layoutTitle": "Widgets agrupados",
    "dataGridPage.layoutBody":
      "Cada celda contiene su propio botón: la parada de foco se la cede a ESE elemento, la celda nunca compite con su propio contenido interactivo por el roving tabindex.",
    "dataGridPage.layoutLabel": "Acciones rápidas",
    "dataGridPage.contractBody":
      'Sin máquina <code>@zag-js/*</code> propia — igual que <code>Treegrid</code>, el modelo de teclado está escrito a mano y es puro, compartido por ambos bindings. <code>wrapCols</code>/<code>wrapRows</code> controlan si las flechas envuelven al borde de la grilla; ambos son <code>false</code> por defecto.',
    "dataGridPage.a11yBody":
      'La raíz lleva <code>role="grid"</code> con <code>aria-label</code> (obligatorio). Cada fila es <code>role="row"</code>, cada celda <code>role="gridcell"</code>. El foco es roving — una sola celda (o su descendiente interactivo) es la parada de tabulación en toda la grilla. <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd>/<kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> mueven entre celdas, <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> dentro de la fila, <kbd class="sk-kbd">Ctrl</kbd>+<kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> saltan al principio/final de la grilla entera.',
    "dataGridPage.testReact1":
      "Le cede la parada de foco al descendiente interactivo PROPIO de la celda, no al div de la celda.",
    "dataGridPage.testReact2":
      "En movimiento vertical, se ajusta a la última celda real de una fila más corta (grilla irregular).",
    "dataGridPage.testVanilla1":
      "Envuelve columnas a la fila siguiente cuando se autora data-wrap-cols.",
    "dataGridPage.testVanilla2": "Clickear una celda mueve la parada de foco ahí.",

    "demo.dataGrid.scoresLabel": "Puntajes por ronda",
    "demo.dataGrid.player": "Jugador",
    "demo.dataGrid.round1": "Ronda 1",
    "demo.dataGrid.round2": "Ronda 2",
    "demo.dataGrid.actionsLabel": "Acciones rápidas",
    "demo.dataGrid.edit": "Editar",
    "demo.dataGrid.copy": "Copiar",
    "demo.dataGrid.delete": "Eliminar",
    "demo.dataGrid.more": "Más opciones",

    "menubarPage.description":
      "Menubar: una barra horizontal persistente de comandos, algunos con desplegable.",
    "menubarPage.lede":
      'El patrón WAI-ARIA <code>menubar</code>: <code>menubar-editor</code>, el ejemplo que le da nombre. No es <a href="/componentes/menu">Menu</a> (un solo trigger, un solo popup) — acá son VARIOS ítems en una sola fila de roving tabindex, donde flecha izquierda/derecha mueve entre ellos, y el detalle que una implementación ingenua se pierde: moverse a un ítem adyacente mientras un desplegable está abierto cierra el viejo y abre el nuevo, no solo mueve un resaltado.',
    "menubarPage.contractBody":
      'Sin máquina <code>@zag-js/*</code> propia — igual que <code>Treegrid</code>/<code>DataGrid</code>, escrito a mano y compartido por ambos bindings. Alcance de v1: UN nivel de desplegable por ítem, sin submenús anidados — <code>Menu</code> ya cubre el caso de submenús arbitrariamente anidados con un solo trigger, y los propios ejemplos de WAI (<code>menubar-editor</code>, <code>menubar-navigation</code>) tampoco necesitan un segundo nivel.',
    "menubarPage.label": "Barra de menú",
    "menubarPage.a11yBody":
      'La raíz lleva <code>role="menubar"</code> con <code>aria-label</code> (obligatorio). Cada ítem de nivel superior es <code>role="menuitem"</code>, con <code>aria-haspopup="menu"</code>/<code>aria-expanded</code> solo si abre un desplegable. El foco es roving — una sola parada en toda la barra. <kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> mueven entre ítems (y si un desplegable estaba abierto, abren el del ítem nuevo en vez de solo mover el resaltado); <kbd class="sk-kbd">↓</kbd> abre el desplegable y enfoca su primer ítem, <kbd class="sk-kbd">↑</kbd> el último; dentro de un desplegable abierto, <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd> mueven entre sus comandos; <kbd class="sk-kbd">Escape</kbd> lo cierra y devuelve el foco a su trigger; <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> saltan al primer/último ítem (o al primer/último comando si el desplegable está abierto).',
    "menubarPage.testCore1":
      "Al moverse mientras un desplegable estaba abierto, mantiene abierto el del ítem SIGUIENTE — el detalle que un roving tabindex plano se pierde.",
    "menubarPage.testReact1":
      "Moverse a la derecha mientras un desplegable está abierto lo cierra y abre el del ítem adyacente.",
    "menubarPage.testReact2": "Escape cierra el desplegable abierto y devuelve el foco a su trigger.",
    "menubarPage.testVanilla1": "Clickear afuera de la barra cierra cualquier desplegable abierto.",

    "demo.menubar.label": "Barra de menú",
    "demo.menubar.file": "Archivo",
    "demo.menubar.new": "Nuevo",
    "demo.menubar.open": "Abrir",
    "demo.menubar.save": "Guardar",
    "demo.menubar.edit": "Editar",
    "demo.menubar.undo": "Deshacer",
    "demo.menubar.redo": "Rehacer",

    "inlinePage.description": "Inline, el pattern de layout horizontal y adaptable.",
    "inlinePage.lede":
      "Organiza elementos en horizontal y los devuelve a otra línea cuando el espacio se agota. Úsalo para barras de acciones y pares label–control; la semántica pertenece al elemento que eliges.",
    "inlinePage.previewLabel": "Barra de acciones",
    "inlinePage.previewNote": "Box + Stack + Inline + Button",
    "inlinePage.htmlTitle": "HTML autorado",
    "inlinePage.htmlBody": "Usa <code>sk-inline</code> en el elemento semántico que corresponda. Los atributos describen el espaciado, la alineación vertical, la distribución horizontal y si la fila puede envolver sus hijos.",
    "inlinePage.contractItem1": "<code>as</code> elige el elemento raíz; por defecto es <code>div</code>.",
    "inlinePage.contractItem2": "<code>gap</code> acepta <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>; por defecto es <code>md</code>.",
    "inlinePage.contractItem3": "<code>align</code> acepta <code>start</code>, <code>center</code>, <code>end</code> o <code>baseline</code>; por defecto es <code>center</code>.",
    "inlinePage.contractItem4": "<code>justify</code> acepta <code>start</code>, <code>center</code>, <code>end</code> o <code>between</code>; en HTML se escribe con <code>data-justify</code>.",
    "inlinePage.contractItem5": '<code>wrap</code> permite envolver los hijos; por defecto es <code>true</code>. Usa <code>data-wrap="false"</code> para una sola fila en HTML.',
    "inlinePage.test1": "Renderiza Stack, Inline y Grid según los contratos de layout documentados.",

    "primitivasPage.title": "Primitivas",
    "primitivasPage.description": "Primitivas de layout y tipografía: estructura reutilizable, roles de lectura y adapters React.",
    "primitivasPage.lede":
      "Box, Wrapper, ImageFrame, Stack, Inline y Grid son patterns de layout. Text, Heading y Link expresan el rol de lectura; no reemplazan la semántica: eliges el elemento que corresponde al contenido.",
    "primitivasPage.previewLabel": "Primitivas",
    "primitivasPage.htmlTitle": "HTML autorado",
    "primitivasPage.htmlBody":
      "Importa <code>patterns/layout.css</code> para Box, Wrapper, ImageFrame, Stack, Inline y Grid, y <code>components/typography.css</code> para Text, Heading y Link. No requieren inicialización vanilla.",
    "primitivasPage.contractsTitle": "Contratos",
    "primitivasPage.contractItem1": "<code>Box</code> controla superficie, borde y padding; el consumidor elige <code>as</code>.",
    "primitivasPage.contractItem2": "<code>Wrapper</code> fija el techo de la columna de página en una escala (<code>sm</code>, <code>md</code>, <code>lg</code>, <code>full</code>).",
    "primitivasPage.contractItem3": "<code>ImageFrame</code> recorta media a un aspect ratio y controla <code>object-fit</code> / posición.",
    "primitivasPage.contractItem4": "<code>Stack</code>, <code>Inline</code> y <code>Grid</code> tienen gaps nombrados que siguen la dimensión de densidad.",
    "primitivasPage.contractItem5": "<code>Heading</code> separa jerarquía (<code>as</code>) de tamaño visual (<code>size</code>).",
    "primitivasPage.contractItem6": "<code>Link</code> subraya por defecto: no depende solo del color para reconocerse.",

    "cardPage.description": "Card no es un componente: guía para componer tarjetas semánticas con Box, Tile y componentes de contenido.",
    "cardPage.lede":
      'Card es un <strong>resultado de composición</strong>, no un componente del sistema. El contenido decide su estructura; la interacción decide si la superficie nace de <a href="/componentes/box">Box</a> o de <a href="/componentes/tile">Tile</a>.',
    "cardPage.calloutBody":
      'No existen <code>sk-card</code>, <code>@skryensya/react/card</code> ni <code>components/card.css</code>. Importa las piezas que la card realmente usa.',
    "cardPage.chooseTitle": "Elige por comportamiento",
    "cardPage.chooseBody":
      "«Card» describe la forma visual, pero no dice qué hace. Empieza por la semántica y la interacción; después compón el contenido con Stack, Inline, Heading, Text, Badge, Stat u otras piezas.",
    "cardPage.tableHeadSurface": "La superficie…",
    "cardPage.tableHeadUses": "Usa",
    "cardPage.tableHeadElement": "Elemento real",
    "cardPage.tableRow1Surface": "presenta contenido o contiene varios controles",
    "cardPage.tableRow1Element": "<code>article</code>, <code>section</code> o <code>div</code>",
    "cardPage.tableRow2Surface": "navega completa a un destino",
    "cardPage.tableRow2Element": "<code>a[href]</code>",
    "cardPage.tableRow3Surface": "ejecuta completa una acción",
    "cardPage.tableRow3Element": "<code>button</code>",
    "cardPage.tableRow4Surface": "activa una opción independiente",
    "cardPage.tableRow4Element": '<code>input[type=checkbox]</code>',
    "cardPage.tableRow5Surface": "elige una opción exclusiva",
    "cardPage.tableRow5Element": '<code>input[type=radio]</code>',
    "cardPage.tableRow6Surface": "revela contenido",
    "cardPage.tableRow6Element": "<code>button</code> o <code>details</code>",
    "cardPage.geometryBody":
      "Box y Tile parten aquí de la misma superficie, borde sutil, radio y padding <code>lg</code>. Tile conserva ese contenido y añade el state layer de <code>sk-interactive</code>; la diferencia visible aparece al hacer hover, foco o press, no en una segunda receta de card.",
    "cardPage.basicTitle": "Card básica",
    "cardPage.basicBody":
      'El piso de la escalera: una superficie, un título y un párrafo. Nada aquí es interactivo, así que la raíz es <a href="/componentes/box">Box</a> sobre un <code>article</code>. No hay ninguna clase <code>card</code> en juego, sólo la superficie, el borde sutil y el padding <code>lg</code>.',
    "cardPage.basicNote": "Box + Stack + Heading + Text",
    "cardPage.metaTitle": "Estado y fecha",
    "cardPage.metaBody":
      'El mismo Box, ahora con jerarquía: <a href="/componentes/badge">Badge</a> dice el estado y un Text en <code>caption</code> la fecha. La card no creció una API, creció contenido.',
    "cardPage.metaNote": "Box + Inline + Badge + Text",
    "cardPage.accentSoftTitle": "Acento suave",
    "cardPage.accentSoftBody":
      "El fondo de acento se pide reescribiendo los hooks que Box ya publica: <code>--sk-box-bg</code> a <code>--color-bg-accent-subtle</code> y el borde a <code>--color-border-accent</code>; nunca con un <code>background</code> crudo sobre <code>.sk-box</code>, que saltearía la superficie que el patrón administra. Como el relleno es sutil, el texto sigue usando los tokens normales.",
    "cardPage.accentSoftNote": "Box + hooks de superficie",
    "cardPage.accentSolidTitle": "Acento sólido",
    "cardPage.accentSolidBody":
      "Cuando el relleno es el color de acción, el texto ya no se lee contra la página sino contra ese relleno, y por eso viene de <code>--color-text-on-accent</code>. En modo oscuro el acento es un azul <em>claro</em> y ese token se da vuelta a casi negro: un <code>data-tone</code> acá se resolvería contra el fondo equivocado y quedaría ilegible en uno de los dos modos.",
    "cardPage.accentSolidNote": "Box + color de acción + texto on-accent",
    "cardPage.statTitle": "Card de métrica",
    "cardPage.statBody":
      '<a href="/componentes/stat">Stat</a> pone la métrica y Box pone la card. La colección entra en una grilla sin que Stat se convierta en superficie ni gane una variante <code>card</code> en su API.',
    "cardPage.statNote": "Box + Stat + Icon",
    "cardPage.linkTitle": "Card que navega",
    "cardPage.linkBody":
      "Primer peldaño interactivo. Toda la superficie lleva a <strong>un</strong> destino, así que la raíz es el propio <code>a[href]</code>: un TileLink. No hay enlace estirado por CSS ni un <code>onClick</code> sobre un <code>div</code>, y el título es lo que nombra al enlace.",
    "cardPage.linkNote": "TileLink + Icon",
    "cardPage.actionTitle": "Card que actúa",
    "cardPage.actionBody":
      "Misma geometría, otro elemento de plataforma: esto <em>hace</em> algo, así que es un <code>button</code>. La forma no decide el elemento; la intención sí.",
    "cardPage.actionNote": "TileButton + Icon",
    "cardPage.selectTitle": "Card que se elige",
    "cardPage.selectBody":
      "Y una preferencia es un checkbox. La superficie vuelve a ser la misma, pero el estado lo lleva la plataforma: se marca con la barra espaciadora, entra en un formulario y un lector de pantalla la anuncia como casilla.",
    "cardPage.selectNote": "TileCheckbox",
    "cardPage.mediaTitle": "Card con imagen",
    "cardPage.mediaBody":
      'Entra el medio. El Box no lleva padding: ya recorta por <code>overflow</code>, así que un <a href="/componentes/image-frame">ImageFrame</a> con <code>data-radius="none"</code> llega al borde y hereda la esquina redondeada. El inset del texto lo repone <code>.sk-card-body</code>, porque un padding en la raíz también habría metido para adentro a la foto.',
    "cardPage.mediaNote": "Box + ImageFrame + Badge",
    "cardPage.gradientTitle": "Card con gradiente",
    "cardPage.gradientBody":
      "El lavado que mantiene legible el texto sobre la foto. Se dimensiona según el <strong>tipo</strong> que protege y no según un porcentaje de la imagen: el caption es la caja y el gradiente la rellena, desvaneciéndose hacia la foto. Las tres cards muestran los tres valores de <code>data-strength</code> (<code>sm</code>, <code>md</code> y <code>lg</code>) sobre el mismo panel claro, porque es opacidad y tinte y nunca cuánta imagen se tapa. Las imágenes son claras a propósito: sobre un fondo ya oscuro el lavado no se vería y el ejemplo diría lo contrario de lo que enseña.",
    "cardPage.gradientNote": "ImageFrame + MediaCaption + MediaGradient (sm · md · lg)",
    "cardPage.mediaLinkTitle": "Card con imagen que navega",
    "cardPage.mediaLinkBody":
      'Los tres a la vez: medio, gradiente y navegación. Es un TileLink con <code>data-padding="none"</code> para que la foto llegue al borde, y todo lo de adentro es un <code>span</code>, porque un <code>a</code> no puede contener contenido interactivo de bloque.',
    "cardPage.mediaLinkNote": "TileLink + ImageFrame + MediaGradient",
    "cardPage.productTitle": "Card de producto",
    "cardPage.productBody":
      "El techo de la escalera, y el ejemplo que prueba la regla. Acá viven <strong>dos</strong> decisiones independientes (ver detalle y añadir), así que la raíz no puede ser un Tile: un enlace y un botón anidados dentro de un <code>a</code> son HTML inválido, y un click de superficie completa sólo podría significar una de las dos. Para esto existe Box.",
    "cardPage.productNote": "Box + Badge + Link + Button",
    "cardPage.doTitle": "Do · Haz",
    "cardPage.doHeading": "Deja que el comportamiento elija la raíz",
    "cardPage.doItem1": "Usa Box para contenido y para varios controles independientes.",
    "cardPage.doItem2": "Usa un Tile semántico cuando toda la superficie tiene una sola intención.",
    "cardPage.doItem3": "Conserva headings, listas, precios y estados como componentes de contenido.",
    "cardPage.doItem4": "Haz que el foco visible alcance la superficie interactiva completa.",
    "cardPage.doItem5": "Deja que el contenido determine la altura; agrupa sólo cards comparables.",
    "cardPage.dontTitle": "Don't · Evita",
    "cardPage.dontHeading": "No conviertas la apariencia en una API",
    "cardPage.dontItem1": "No crees un componente Card con variantes <code>news</code>, <code>product</code> o <code>stat</code>.",
    "cardPage.dontItem2": "No pongas <code>onClick</code> ni <code>tabindex</code> en un Box o <code>div</code>.",
    "cardPage.dontItem3": "No anides botones, enlaces o inputs dentro de TileLink o TileButton.",
    "cardPage.dontItem4": "No dupliques el mismo destino en la superficie y en un enlace interior.",
    "cardPage.dontItem5": "No recortes contenido importante sólo para igualar alturas.",
    "cardPage.implTitle": "Implementación",
    "cardPage.implBody":
      "No hay un import de Card. Importa Box o el Tile semántico elegido, sus estilos y únicamente las piezas de contenido presentes. Esto mantiene cada dependencia y cada contrato visibles en el call site.",

    "indexPage.title": "Explorar componentes",
    "indexPage.description": "Componentes, patrones y primitivas organizados según la tarea que resuelven.",
    "indexPage.lede":
      'Empieza por la tarea: capturar datos, orientar, presentar contenido o comunicar estado. Cada tarjeta explica cuándo usar la pieza. Si buscas reglas, roles y sets de iconos, ve a <a href="/iconos">Fundamentos → Iconografía</a>.',
    "indexPage.searchLabel": "Buscar componentes",
    "indexPage.countSuffix": "componentes",

    "vaulPage.description": "Un pattern: panel modal anclado a un borde del viewport, con drag-to-dismiss opcional.",
    "vaulPage.lede":
      "Un panel modal anclado a un <strong>borde</strong> del viewport: llega desde ese borde, deja la página inerte detrás de un backdrop, y se va por donde vino. El borde es la idea entera, un Vaul se nombra por de dónde viene, nunca por la forma que hace al llegar.",
    "vaulPage.whyPatternTitle": "Por qué es un pattern y no un componente",
    "vaulPage.whyPatternBody1":
      'La regla es una sola pregunta: <em>¿podría un segundo componente necesitar esta estructura exacta?</em> Aquí la respuesta no es una predicción, ya pasa, hoy, en este repo: <a href="/componentes/drawer">Drawer</a> <strong>es</strong> un Vaul en el borde inline. La opción <a href="/componentes/dialog">Dialog Vaul</a> reutiliza la misma interacción block-end en móvil sin convertir Dialog en un componente Vaul.',
    "vaulPage.whyPatternBody2":
      "Así que Vaul envía <strong>hooks y estructura</strong>. Un drawer que reimplementara el panel sería un segundo Vaul con otro nombre.",
    "vaulPage.edgeTitle": "El borde es un dato, no un componente",
    "vaulPage.edgeBody":
      "Tres bordes, un pattern. <code>data-edge</code> elige; nada más cambia. Los bordes inline son lógicos, así que se dan vuelta solos en RTL en vez de clavarse del lado equivocado de la pantalla.",
    "vaulPage.nativeTitle": "Exige el <code>&lt;dialog&gt;</code> nativo",
    "vaulPage.nativeBody":
      "El focus trap, ESC, el fondo inerte, la restauración del foco, el top layer y un <code>::backdrop</code> real son comportamientos que la plataforma ya tiene. Un Vaul sobre un div los reimplementa en JavaScript que habría que enviar, y el top layer y <code>:modal</code> no están disponibles para un div a ningún precio.",
    "vaulPage.zagTitle": "Zag no se usa aquí, y ese es el hallazgo",
    "vaulPage.zagBody":
      "La regla es que Zag entra sólo cuando la coordinación de estado vale su costo. Se revisó el registro antes de escribir una línea: <strong>no existe una máquina de Vaul</strong>. Y lo que Zag sí podría cubrir es exactamente lo que la plataforma ya hace mejor, <code>@zag-js/dialog</code> reimplementaría la modalidad que el <code>&lt;dialog&gt;</code> regala, y <code>@zag-js/presence</code> es redundante contra <code>@starting-style</code>. Que la respuesta sea \"ninguna\" es la regla funcionando, no una excepción.",
    "vaulPage.dragTitle": "El drag es lo único que cuesta JS",
    "vaulPage.dragBody1":
      "Queda <strong>un</strong> comportamiento sin equivalente en la plataforma y sin máquina en Zag: arrastrar el panel hacia su borde para cerrarlo. Ése, y sólo ése, es el enhancer. <strong>Vaul está completo sin él</strong>: sin JS hay panel, slide, backdrop, ESC y click afuera.",
    "vaulPage.dragBody2":
      "Se cierra por distancia <strong>o</strong> por velocidad: un flick es una intención, y esperar a que cruce un umbral de distancia es exactamente lo que hace que una hoja se sienta trabada. La velocidad se mide sobre los <strong>últimos milímetros</strong> del gesto, no sobre el promedio: si arrastras despacio, dudas, y solo entonces tiras, el tirón es real, promediado desde que apoyaste el dedo se diluye hasta parecer que no te moviste. Y un flick <em>de vuelta</em> le gana a la distancia: la última palabra de la mano es su palabra.",
    "vaulPage.noDragLabel": "sin drag",
    "vaulPage.resistTitle": "Para el otro lado, resiste",
    "vaulPage.resistBody1":
      "Tirar del panel hacia adentro no lo despega de su borde, pero tampoco lo deja clavado: cede arrancando 1∶1 bajo la yema y se curva hasta un tope de unos 12px. Que el dedo se mueva y la cosa de abajo no es el único momento en que una superficie de manipulación directa se delata como un dibujo de una superficie. La asimetría <em>es</em> el mensaje: para ese lado no hay camino.",
    "vaulPage.resistBody2":
      "Y lo que aparece en ese hueco es <strong>más panel</strong>: el material sigue de largo pasado el borde, así que levantar una hoja revela hoja y no una franja de backdrop. Son dos números distintos a propósito, cuánto cede (<code>--sk-vaul-overpull</code>) y hasta dónde llega el material (<code>--sk-vaul-material</code>), y el segundo se declara como un piso sobre el primero para que ceder no pueda ganarle nunca. El material se pinta <em>encima</em> de la elevación: al revés, la sombra del panel teñía justo la franja que se acaba de descubrir, y una hoja levantada mostraba una banda oscura donde debería estar su propia superficie, que es exactamente el agujero que esto existe para no tener.",
    "vaulPage.resistBody3": "El backdrop va con eso: su opacidad sigue al drag. Un backdrop a full con el panel a medio salir estaría mintiendo sobre qué es modal.",
    "vaulPage.handleTitle": "El handle sigue al borde",
    "vaulPage.handleBody":
      "No es cosmético: una hoja se tira hacia abajo desde una barra que cruza su techo, y un panel lateral se tira de costado desde una barra por su borde interior. Una píldora horizontal en un drawer anuncia el gesto equivocado, y un affordance que miente es peor que no tener ninguno.",
    "vaulPage.desktopTitle": "En desktop no se arrastra",
    "vaulPage.desktopBody":
      "El handle es un affordance <strong>táctil</strong>: una barra que se tira con el pulgar. En un puntero no hay nada que tirar que un click afuera o un ESC no hagan mejor, así que arriba del breakpoint del sistema (<code>52rem</code>, el mismo ancho donde el sidebar se vuelve drawer y el dialog se vuelve hoja) el handle se oculta y el enhancer no cablea el drag. El CSS y el JS hacen el mismo corte, con el mismo <code>matchMedia</code>, así que nunca hay un handle colgando en un ancho donde no arrastra.",
    "vaulPage.motionTitle": "Motion: llegar, salir y soltar son tres intenciones",
    "vaulPage.motionBody1":
      "Cada una con sus tokens, nunca una duración promediada: entrar se anuncia, salir ya está decidido. Con <code>prefers-reduced-motion</code> el panel <strong>sigue llegando</strong>, se cae el viaje, no el Vaul, y el fade del backdrop es lo que dice que la página quedó inerte. El drag no se toca: es manipulación directa, no motion que el sistema te reproduce.",
    "vaulPage.motionBody2":
      '<a href="/transparencias"><code>prefers-reduced-transparency</code></a> no elimina el backdrop: lo vuelve opaco. La modalidad y la respuesta directa al drag permanecen.',
    "vaulPage.motionBody3":
      "<strong>Soltar</strong> es la tercera, y es propia: un panel soltado no está saliendo, está terminando el impulso que la mano ya le dio. Por eso no consume <code>enter</code> ni <code>exit</code>, los dos son cortos porque nadie los espera, sino el intent <code>release</code>, con una duración larga a propósito: cortarla es lo que hace que el panel se frene en seco debajo del dedo en vez de seguir de largo. Un mismo intent para los dos destinos: volver a casa y irse del todo son el mismo tiro con distinto final. Es el único intent que bajo <code>prefers-reduced-motion</code> no puede soltar su viaje, el panel está donde lo dejó el dedo y tiene que llegar a algún lado, así que suelta el lujo y aterriza corto.",
    "vaulPage.demoOpenLabel": "Compartir archivo",
    "vaulPage.demoTitle": "Propuesta comercial Q3",
    "vaulPage.demoMeta": "PDF · 2,4 MB · editado hace 2 h",
    "vaulPage.demoClose": "Cerrar",
    "vaulPage.demoShareToggle": "Cualquiera con el enlace puede ver",
    "vaulPage.demoPeopleLabel": "Personas con acceso",
    "vaulPage.demoOwner": "Dueña",
    "vaulPage.demoCanEdit": "Puede editar",
    "vaulPage.demoCanComment": "Puede comentar",
    "vaulPage.demoReadOnly": "Solo lectura",
    "vaulPage.demoInviteSent": "Invitación enviada",
    "vaulPage.demoDesignTeam": "Equipo de diseño",
    "vaulPage.demoDesignTeamMeta": "6 personas",
    "vaulPage.demoCancel": "Cancelar",
    "vaulPage.demoShare": "Compartir",
    "vaulPage.vanillaComment1": "Sólo el drag. Abrir es showModal() y cerrar es close():",
    "vaulPage.vanillaComment2": "la modalidad es de la plataforma.",
    "vaulPage.vanillaComment3": "fracción del panel que hay que arrastrar",
    "vaulPage.vanillaComment4": "px/ms: un flick cierra sin cruzar la distancia",
    "vaulPage.noDragComment": "sin handle y sin drag: Vaul sigue completo",
    "vaulPage.test1": "Lleva las marcas de scope del enhancer en reposo.",
    "vaulPage.test2": "Dibuja el handle como decoración, siempre.",
    "vaulPage.test3": "Cierra con un drag lento que llega suficientemente lejos (solo distancia).",
    "vaulPage.test4": "Un flick rápido y corto cierra aunque la distancia sea chica.",
    "vaulPage.test5": "Un flick de vuelta a casa le gana a un drag largo: la dirección le gana a la distancia.",

    "landing.title": "skryensya/ui",
    "landing.description":
      "Componentes, primitives y fundamentos para construir interfaces que funcionan como un sistema.",
    "landing.brand": "skryensya/ui",
    "landing.hero.title": "Piezas para construir interfaces que funcionan como un sistema.",
    "landing.hero.lede":
      "Componentes, primitives y fundamentos que puedes usar por separado o combinar para construir interfaces completas. Basados en la plataforma web, con contratos compartidos para HTML, JavaScript y React.",
    "landing.hero.ctaComponents": "Explorar componentes",
    "landing.hero.ctaPlayground": "Abrir Playground",

    "landing.start.title": "Empieza por cualquier parte.",
    "landing.start.lede": "No necesitas adoptar un sistema entero para resolver un problema.",
    "landing.start.body":
      "Usa un componente. Construye con primitives. Adopta los fundamentos. Explora un patrón completo.",
    "landing.start.meet": "Todas las piezas están diseñadas para encontrarse cuando las necesitas.",
    "landing.start.components.title": "Componentes",
    "landing.start.components.body":
      "Controles y elementos de interfaz listos para formar parte de algo mayor.",
    "landing.start.components.items": "Button · Input · Select · Combobox · Dialog · Tabs",
    "landing.start.components.cta": "Explorar componentes →",
    "landing.start.primitives.title": "Primitives",
    "landing.start.primitives.body":
      "Piezas pequeñas para definir estructura, composición e interacción sin empezar desde cero.",
    "landing.start.primitives.items": "Box · Stack · Inline · Grid · Popover",
    "landing.start.primitives.cta": "Explorar primitives →",
    "landing.start.foundations.title": "Fundamentos",
    "landing.start.foundations.body":
      "Las decisiones compartidas que mantienen coherente el sistema a medida que crece.",
    "landing.start.foundations.items": "Color · Space · Type · Dimensions · Density · Motion",
    "landing.start.foundations.cta": "Explorar fundamentos →",
    "landing.start.patterns.title": "Patrones",
    "landing.start.patterns.body":
      "Componentes y primitives trabajando juntos para resolver interacciones recurrentes.",
    "landing.start.patterns.items": "Forms · Search · Navigation · Selection · Application UI",
    "landing.start.patterns.cta": "Explorar patrones →",

    "landing.composition.title": "De una pieza a una interfaz.",
    "landing.composition.lede": "Empieza con algo pequeño.",
    "landing.composition.caption.input": "Empieza con algo pequeño.",
    "landing.composition.caption.input-button": "Añade una acción.",
    "landing.composition.caption.input-button-listbox": "Introduce selección.",
    "landing.composition.caption.combobox": "Define cómo se relacionan.",
    "landing.composition.caption.form-dialog": "Añade estructura alrededor.",
    "landing.composition.caption.full":
      "Y termina construyendo una interfaz completa con las mismas reglas.",
    "landing.composition.stage.input": "Input",
    "landing.composition.stage.input-button": "Input + Button",
    "landing.composition.stage.input-button-listbox": "Input + Button + Listbox",
    "landing.composition.stage.combobox": "Combobox",
    "landing.composition.stage.form-dialog": "Combobox + Form + Dialog",
    "landing.composition.stage.full": "Interfaz completa",
    "landing.composition.stagesLabel": "Etapas de composición",
    "landing.composition.inputLabel": "Búsqueda",
    "landing.composition.searchPlaceholder": "Buscar…",
    "landing.composition.searchAction": "Buscar",
    "landing.composition.listboxLabel": "Plan",
    "landing.composition.notesLabel": "Notas",
    "landing.composition.notesPlaceholder": "Añade contexto…",
    "landing.composition.openDialog": "Confirmar",
    "landing.composition.dialogTitle": "¿Guardar selección?",
    "landing.composition.dialogBody":
      "La selección y las notas se guardarán con las mismas reglas del sistema.",
    "landing.composition.dialogCancel": "Cancelar",
    "landing.composition.dialogConfirm": "Guardar",
    "landing.composition.after":
      "No son piezas aisladas que casualmente se ven parecidas. Comparten fundamentos, estados y comportamiento para poder componerse sin redefinir el sistema cada vez.",
    "landing.composition.cta": "Ver cómo se componen →",

    "landing.rules.title": "Las mismas reglas, desde abajo.",
    "landing.rules.lede":
      "Una interfaz coherente no empieza en Button o Dialog. Empieza en las decisiones que todos ellos comparten.",
    "landing.rules.color.title": "Color",
    "landing.rules.color.body":
      "Roles semánticos que pueden responder al tema, contexto y accent.",
    "landing.rules.color.cta": "Explorar color →",
    "landing.rules.dimensions.title": "Dimensions",
    "landing.rules.dimensions.body":
      "Una escala común para que componentes distintos compartan proporciones.",
    "landing.rules.dimensions.cta": "Explorar dimensions →",
    "landing.rules.density.title": "Density",
    "landing.rules.density.body":
      "Cambia cuánto espacio necesita la interfaz sin rediseñar cada pieza.",
    "landing.rules.density.cta": "Explorar density →",
    "landing.rules.motion.title": "Motion",
    "landing.rules.motion.body":
      "Transiciones y movimiento definidos como parte del lenguaje del sistema.",
    "landing.rules.motion.cta": "Explorar motion →",
    "landing.rules.states.title": "State layers",
    "landing.rules.states.body":
      "Hover, focus, pressed y otros estados responden a un modelo común de interacción.",
    "landing.rules.states.cta": "Explorar states →",

    "landing.lab.title": "Cambia una regla. Observa el sistema.",
    "landing.lab.theme": "Theme",
    "landing.lab.themeLight": "Light",
    "landing.lab.themeDark": "Dark",
    "landing.lab.accent": "Accent",
    "landing.lab.density": "Density",
    "landing.lab.densityCompact": "Compacto",
    "landing.lab.densityDefault": "Predeterminado",
    "landing.lab.densityComfortable": "Cómodo",
    "landing.lab.densityPresets": "Presets de densidad",
    "landing.lab.contrast": "Contrast",
    "landing.lab.contrastLow": "Low",
    "landing.lab.contrastHigh": "High",
    "landing.lab.radius": "Radio",
    "landing.lab.radiusPresets": "Presets de radio",
    "landing.lab.after":
      "Los componentes no mantienen copias independientes de estas decisiones. Consumen los mismos fundamentos. Cambia el sistema y la interfaz responde.",
    "landing.lab.ctaTheming": "Explorar theming →",
    "landing.lab.ctaPlayground": "Abrir en Playground →",
    "landing.lab.previewTitle": "Crear proyecto",
    "landing.lab.nameLabel": "Nombre",
    "landing.lab.namePlaceholder": "Mi proyecto",
    "landing.lab.planLabel": "Plan",
    "landing.lab.submit": "Continuar",
    "landing.lab.cancel": "Cancelar",

    "landing.platform.title": "La plataforma web también es una pieza.",
    "landing.platform.lede":
      "skryensya/ui no intenta reemplazar HTML y CSS con una abstracción propia. Construye sobre ellos.",
    "landing.platform.html.title": "Cuando HTML es suficiente",
    "landing.platform.html.body": "La estructura permanece como HTML.",
    "landing.platform.css.title": "Cuando CSS es suficiente",
    "landing.platform.css.body": "El sistema visual permanece en CSS.",
    "landing.platform.js.title": "Cuando aparece interacción",
    "landing.platform.js.body": "JavaScript añade el comportamiento necesario.",
    "landing.platform.closing":
      "Usa la plataforma cuando la plataforma sea suficiente. Añade comportamiento cuando la interacción lo requiera.",
    "landing.platform.cta": "Entender la arquitectura →",

    "landing.behavior.title": "El comportamiento también se compone.",
    "landing.behavior.lede":
      "Combinar elementos visuales es fácil. Conseguir que su interacción siga siendo correcta es otra cosa.",
    "landing.behavior.body":
      "Un Combobox, Menu o Dialog necesita coordinar estructura, estado, teclado, focus y semántica. En skryensya/ui esas relaciones también forman parte del componente.",
    "landing.behavior.comboboxTitle": "Combobox",
    "landing.behavior.keyboard": "Keyboard",
    "landing.behavior.keyNav": "Navigate",
    "landing.behavior.keySelect": "Select",
    "landing.behavior.keyClose": "Close",
    "landing.behavior.state": "State",
    "landing.behavior.states": "open · focused · invalid · disabled",
    "landing.behavior.semantics": "Semantics",
    "landing.behavior.semanticsChain": "combobox → listbox → option",
    "landing.behavior.after":
      "La apariencia es una parte del componente. Su comportamiento también.",
    "landing.behavior.ctaCombobox": "Explorar Combobox →",
    "landing.behavior.ctaInteractive": "Ver componentes interactivos →",

    "landing.bindings.title": "Una pieza. Dos formas de usarla.",
    "landing.bindings.lede":
      "La forma de renderizar una interfaz no debería cambiar el modelo del componente.",
    "landing.bindings.vanilla.title": "HTML + JavaScript",
    "landing.bindings.vanilla.body":
      "Escribe la estructura y añade comportamiento donde lo necesites.",
    "landing.bindings.vanilla.cta": "Empezar con Vanilla →",
    "landing.bindings.react.title": "React",
    "landing.bindings.react.body": "Renderiza el mismo concepto desde React.",
    "landing.bindings.react.cta": "Empezar con React →",
    "landing.bindings.after":
      "Debajo hay un contrato compartido. Estados, semántica, comportamiento y styling hooks siguen perteneciendo al mismo sistema.",
    "landing.bindings.ctaContracts": "Entender los contratos →",

    "landing.needs.title": "Componentes que llevan a otros componentes.",
    "landing.needs.lede":
      "No siempre sabes el nombre de la pieza que necesitas. A veces sabes solamente qué quieres construir.",
    "landing.needs.forms.title": "Necesito recoger información",
    "landing.needs.forms.items":
      "Input · Checkbox · Select · Radio Group · Date Picker · File Upload",
    "landing.needs.forms.cta": "Explorar formularios →",
    "landing.needs.selection.title": "Necesito presentar opciones",
    "landing.needs.selection.items":
      "Select · Combobox · Listbox · Menu · Command Palette",
    "landing.needs.selection.cta": "Explorar selección →",
    "landing.needs.overlays.title": "Necesito mostrar algo sobre la interfaz",
    "landing.needs.overlays.items": "Popover · Tooltip · Dialog · Drawer · Toast",
    "landing.needs.overlays.cta": "Explorar overlays →",
    "landing.needs.nav.title": "Necesito estructurar una aplicación",
    "landing.needs.nav.items": "Navbar · Sidebar · Breadcrumb · Tabs · Pagination",
    "landing.needs.nav.cta": "Explorar navegación →",
    "landing.needs.data.title": "Necesito mostrar información",
    "landing.needs.data.items": "Table · List · Tree View · Stat · Badge · Avatar",
    "landing.needs.data.cta": "Explorar data display →",

    "landing.patterns.title": "No busques solamente componentes. Explora soluciones.",
    "landing.patterns.lede":
      "Un componente resuelve una parte del problema. Un patrón muestra cómo varias partes pueden trabajar juntas.",
    "landing.patterns.search.title": "Search",
    "landing.patterns.search.body":
      "Input + Combobox + Keyboard navigation + Empty state",
    "landing.patterns.search.cta": "Explorar Search →",
    "landing.patterns.settings.title": "Settings",
    "landing.patterns.settings.body": "Forms + Sections + Validation + Actions",
    "landing.patterns.settings.cta": "Explorar Settings →",
    "landing.patterns.command.title": "Command palette",
    "landing.patterns.command.body": "Dialog + Search + Listbox + Commands",
    "landing.patterns.command.cta": "Explorar Command palette →",
    "landing.patterns.appNav.title": "Application navigation",
    "landing.patterns.appNav.body":
      "Sidebar + Navigation + Disclosure + Responsive behavior",
    "landing.patterns.appNav.cta": "Explorar Application navigation →",
    "landing.patterns.allCta": "Explorar todos los patrones →",

    "landing.growth.title": "Diseñado usándolo.",
    "landing.growth.lede":
      "skryensya/ui no intenta anticipar cada interfaz posible. El sistema crece a partir de problemas reales.",
    "landing.growth.body":
      "Una necesidad produce una solución. La solución revela una pieza. La pieza revela una regla. Y cuando esa regla puede servir más allá del problema que la originó, pasa a formar parte del sistema.",
    "landing.growth.chain": "Necesidad → Solución → Pieza → Sistema",
    "landing.growth.closing": "Así evoluciona skryensya/ui.",
    "landing.growth.ctaProject": "Conocer el proyecto →",
    "landing.growth.ctaChangelog": "Ver el changelog →",

    "landing.playground.title": "Explora. Combina. Cambia.",
    "landing.playground.lede":
      "El Playground es un espacio para entender el sistema construyendo con él.",
    "landing.playground.body":
      "Prueba componentes. Combina piezas. Cambia sus estados. Modifica los fundamentos. Compara HTML y React. Observa qué permanece igual.",
    "landing.playground.cta": "Abrir Playground",

    "landing.close.title": "Construye desde donde quieras.",
    "landing.close.lede":
      "Empieza con un componente o utiliza el sistema como fundamento de una interfaz completa.",
    "landing.close.ctaStart": "Empezar →",
    "landing.close.ctaComponents": "Explorar componentes →",
    "landing.close.ctaDocs": "Leer la documentación →",
    "landing.close.linkGithub": "GitHub",
    "landing.close.linkChangelog": "Changelog",
    "landing.close.linkPlayground": "Playground",
    "landing.close.linkComponents": "Components",
    "landing.close.linkFoundations": "Foundations",

    "footer.body":
      "Este sitio consume {core} y los paquetes de componentes por sus exports maps, con bundler, el mismo camino que documenta. Cada píxel sale de un token.",
  },

  en: {
    "nav.openMenu": "Open navigation",
    "nav.global": "Global navigation",
    "nav.drawer": "Navigation",
    "nav.closeDrawer": "Close navigation",
    "nav.between": "Document navigation",
    "nav.notWritten": "Not written yet",
    "nav.docs": "Docs",
    "nav.customize": "Customize",
    "nav.resizeRail": "Resize the navigation",
    "nav.skipToContent": "Go to content",
    "nav.playground": "Playground",
    "playground.title": "Playground",
    "playground.description":
      "Edit and run every component's examples, in React and in Vanilla, with nothing to install.",
    "playground.components": "Components",
    "playground.binding": "Binding",
    "playground.loading": "Loading the kit…",
    "playground.failed":
      "The kit could not be loaded. Reload the page; if it persists, check that public/sandbox exists (pnpm run sandbox).",
    "playground.offline":
      "The sandbox cannot reach codesandbox.io, which is where it compiles and runs the code. Usually a VPN, a proxy or a content blocker; nothing else on this site needs it.",
    "playground.docsLink": "Read the documentation",
    "playground.hideRail": "Hide the component list",
    "playground.showRail": "Show the component list",
    "playground.resizeRail": "Resize the component list",
    "playground.discardTitle": "Discard your changes?",
    "playground.discardBody": "This example has unsaved edits. Switching examples discards them.",
    "playground.discardCancel": "Keep editing",
    "playground.discardConfirm": "Discard",
    "nav.skipToNav": "Go to navigation",

    "status.wip": "Work in progress",
    "status.ariaReviewed": "Reviewed against WAI-ARIA APG",

    "search.label": "Search",
    "search.dialog": "Search the documentation",
    "search.placeholder": "Search components and pages…",
    "search.results": "Results",
    "search.empty": "No results.",
    "search.hintNavigate": "navigate",
    "search.hintOpen": "open",
    "search.hintClose": "close",
    "search.exploreComponents": "Browse components",
    "search.layoutGuide": "Layout and reading guide",

    "action.close": "Close",

    "prefs.palette": "Color palette",
    "prefs.paletteNamed": "Palette: {name}",
    "prefs.accent": "Accent reach",
    "prefs.accent3.short": "All",
    "prefs.accent2.short": "Links",
    "prefs.accent1.short": "Action",
    "prefs.accent1": "Accent reach: action only",
    "prefs.accent2": "Accent reach: action and links",
    "prefs.accent3": "Accent reach: all",
    "prefs.contrastNormal": "Contrast: normal",
    "prefs.contrastHigh": "Contrast: high",
    "prefs.language": "Language",
    "prefs.modeSystem": "Mode: system",
    "prefs.modeLight": "Mode: light",
    "prefs.modeDark": "Mode: dark",

    "toc.title": "On this page",

    "code.condensed": "Condensed",
    "code.full": "Full",
    "code.showFull": "Show full code",
    "code.expand": "Expand",
    "code.expandTo": "Expand the block to all {count} lines",
    "code.collapse": "Collapse",
    "code.collapseTo": "Collapse the block to {count} lines",
    "code.lines": "{count} lines",
    "code.region": "Code block, {label}",
    "code.regionPlain": "Code block",

    "copy.code": "Copy code",
    "copy.copied": "Copied",
    "copy.error": "Copy failed",
    "copy.codeCopied": "Code copied",
    "copy.failed": "Could not copy the code",
    "copy.action": "Copy",

    "preview.reloadAction": "Reload",
    "preview.openInPlayground": "View in Playground",
    "preview.moreActions": "More actions: {name}",
    "preview.screenToggleLabel": "Screen size ({name}): {hint}",
    "preview.bindingGroup": "Code binding: {name}",
    "preview.screenGroup": "Screen size: {name}",
    "preview.screenFree": "Free width",
    "preview.screenFreeHint":
      "Free width · the preview fills the column and grows to its content height",
    "preview.screenTablet": "Tablet",
    "preview.screenTabletHint":
      "Tablet · 768 × 1024 px, where two-column layouts begin to yield",
    "preview.screenMobile": "Mobile",
    "preview.screenMobileHint":
      "Mobile · 390 × 844 px, where every layout finishes stacking",
    "preview.reactSource": "React source",
    "preview.sourceComponent": "Component",

    /* The demos' words. The composition they sit in is shared: see the Spanish block above. */
    "demo.tag.design": "design",
    "demo.tag.active": "active",
    "demo.tag.deprecated": "deprecated",
    "demo.tag.remove": "Remove {name}",
    "demo.pagination.label": "Pagination",
    "demo.pagination.previous": "Previous page",
    "demo.pagination.next": "Next page",
    "demo.box.title": "Summary",
    "demo.box.body": "A semantic section with surface, border and padding.",
    "demo.box.action": "Manage",

    "box.description": "Visual and semantic surface chosen by whoever uses it; no interaction of its own.",
    "box.lede":
      "Box only owns surface, border and padding. Whoever uses it chooses the semantic element. It adds no interaction and does not turn the content into a destination or an action.",
    "box.whenTitle": "When to use it",
    "box.whenBody1":
      'Use Box for static content or for a surface with several independent controls. If the whole surface represents exactly one interaction, choose the matching semantic component instead: <a href="/en/components/link">Link</a>, <a href="/en/components/button">Button</a>, <a href="/en/components/checkbox">Checkbox</a>, <a href="/en/components/radio-group">RadioGroup</a> or <a href="/en/components/accordion">Accordion</a>.',
    "box.whenBody2":
      'Box and Tile share surface, border, radius and the <code>padding</code> vocabulary. Use <code>data-padding="none"</code> in HTML or <code>padding="none"</code> in React when a header or the content\'s image needs to touch the border; that child is the one declaring its own inset. The only difference between the two is the interaction Tile owns and Box does not.',
    "box.whenBody3":
      'The <a href="/en/components/card">Card</a> guide applies this decision to content, news, product, link, action, selection and metric cards.',
    "box.htmlTitle": "Authored HTML",
    "box.contractItem1": 'In HTML, pick the semantic element and add the <code>sk-box</code> class.',
    "box.contractItem2":
      '<code>data-surface</code> accepts <code>none</code>, <code>sunken</code>, <code>surface</code> or <code>raised</code>.',
    "box.contractItem3": '<code>data-border</code> accepts <code>none</code>, <code>subtle</code> or <code>default</code>.',
    "box.contractItem4":
      '<code>data-padding</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> or <code>xl</code>.',
    "box.contractItem5":
      'In React, <code>as</code> selects the element; <code>surface</code>, <code>border</code> and <code>padding</code> render those attributes.',
    "box.test1": "Keeps semantic ownership with the caller while applying Box defaults.",

    "demo.wrapper.title": "Column",
    "demo.wrapper.body": "Content centres and stops growing once it reaches the ceiling.",
    "demo.stack.title": "Summary",
    "demo.stack.body": "The request is ready for review.",
    "demo.stack.action": "See details",
    "demo.inline.title": "Project Atlas",
    "demo.inline.status": "3 unpublished changes",
    "demo.inline.preview": "Preview",
    "demo.inline.publish": "Publish",
    "demo.primitives.title": "Summary",
    "demo.primitives.body": "A block with spacing, surface and hierarchy.",
    "demo.primitives.action": "See details",
    "demo.primitives.updated": "Updated today",
    "demo.primitives.cell.first": "One",
    "demo.primitives.cell.second": "Two",
    "demo.primitives.cell.third": "Three",
    "demo.input.hint": "We write here if something goes wrong.",
    "demo.input.notesLabel": "Notes",
    "demo.input.notesHint": "Tell us what happened, in as much detail as you can.",
    "demo.input.notesPlaceholder": "Write here",
    "demo.formField.hint": "We only use it for receipts.",
    "demo.formField.error": "Enter a work address.",
    "demo.formField.planHint": "You can change it later.",
    "demo.breadcrumb.label": "Breadcrumbs",
    "demo.breadcrumb.home": "Home",
    "demo.breadcrumb.projects": "Projects",
    "demo.breadcrumb.settings": "Settings",
    "demo.breadcrumb.longAncestor":
      "Migration from vanilla layer to Svelte components",
    "demo.breadcrumb.longCurrent":
      "Zag machines shared between vanilla layer and Svelte components",

    "breadcrumb.description": "Hierarchical location with real links and an explicit current page.",
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
    "breadcrumb.contractBody": "Use nav + ol; the last item carries aria-current=page and is not a link.",
    "breadcrumb.a11yBody": "The label tells these crumbs apart from other navigation on the page.",

    "demo.callout.neutral.title": "Scheduled maintenance",
    "demo.callout.neutral.body":
      "On Sunday from 02:00 to 04:00 UTC the panel will be read-only.",
    "demo.callout.info.title": "New version",
    "demo.callout.info.body": "An update is available.",
    "demo.callout.warning.title": "Your plan expires in 3 days",
    "demo.callout.warning.body":
      "Choose a plan so your deployments are not interrupted.",
    "demo.callout.warning.action": "View plans",
    "demo.callout.success.body": "Your changes have been saved.",
    "demo.callout.success.action": "View details",

    "callout.description":
      "Callout: persistent inline message with tone (including neutral), an accessible announcement and a React component.",
    "callout.lede1":
      "Callout is an inline message that stays in the layout for as long as its condition holds. Unlike Toast, transient and mounted in a floating region, Callout lives in the flow of content. One visual weight, the bordered panel: tone is the only variable, so two Callouts never compete over which looks more urgent.",
    "callout.lede2":
      "It is purely informational: it shows something, it runs nothing. It has no dismiss; unlike Toast, a Callout cannot be dismissed, because nothing on the page depends on it going away. The one interactive piece it can carry is a recovery action, and the contract narrows it to <code>translucent</code> or <code>danger</code> so it never competes with the page's real primary action.",
    "callout.tonesTitle": "Tones",
    "callout.tonesBody1":
      'The tone decides whether the panel paints with semantic color. <code>info</code>, <code>success</code>, <code>warning</code> and <code>danger</code> color the message. Only <code>danger</code> announces as <code>role="alert"</code> (assertive); the rest use <code>role="status"</code> (polite); it is the minority of cases that truly interrupt, not the component\'s name, that decides that.',
    "callout.tonesBody2":
      "All four read a <strong>feedback role</strong>, never the accent: tone says what happened, so it cannot change when the brand changes. <code>info</code> only got its own ramp in decision 26 (<code>docs/decisiones/0026-info-es-un-rol-de-feedback-no-el-acento.md</code>); before, it read <code>accent</code>, and a magenta brand painted every informational notice magenta.",
    "callout.neutralTitle": "Neutral",
    "callout.neutralBody":
      "The default: surface and border, no semantic paint. It exists for when color should not be the prominent signal, because the text already carries the message. Use it for ordinary notices, short confirmations, or any case where painting the panel \"success\" or \"info\" would add urgency the content doesn't have.",
    "callout.neutralLabel": "Neutral callout",
    "callout.infoTitle": "Info, with a title",
    "callout.infoBody": "A title next to the icon names the condition instead of only describing it in the first line.",
    "callout.infoLabel": "Info callout",
    "callout.warningTitle": "Warning, with a recovery Link",
    "callout.warningBody": "The recovery action is a plain <code>Link</code>: a destination, not a command.",
    "callout.warningLabel": "Warning callout",
    "callout.successTitle": "Success, with a translucent Button",
    "callout.successBody":
      'When the action is a <a href="/en/components/button">Button</a>, the slot only accepts <code>variant="translucent"</code> or <code>variant="danger"</code>; never <code>primary</code> nor the default <code>neutral</code>: a Callout is not the place for the page\'s main call to action. Use <code>translucent</code> for buttons that blend with the callout\'s colored background, and <code>danger</code> when you need a destructive action to stand out visually.',
    "callout.successLabel": "Success callout",
    "callout.anatomyTitle": "Anatomy",
    "callout.anatomyItem1": "<code>sk-callout__icon</code> is decorative and only appears when it carries a visual signal.",
    "callout.anatomyItem2": "<code>sk-callout__content</code> groups the optional title and description.",
    "callout.anatomyItem3":
      "<code>sk-callout__actions</code> hosts the optional recovery action that belongs to the consumer; never a dismiss control: Callout has none.",
    "callout.anatomyItem4":
      "<code>data-tone</code> accepts <code>neutral</code> (default), <code>info</code>, <code>success</code>, <code>warning</code> or <code>danger</code>.",
    "callout.reactBody":
      'The code is in the <strong>React</strong> tab of each example. <code>actions</code> is the only point of interactivity: a <code>ReactNode</code> the consumer assembles from whichever <code>Link</code> or <code>Button</code> (<code>translucent</code>/<code>danger</code>) it needs. There is no <code>dismissible</code> or <code>onDismiss</code>; if you need the message to be closable, that\'s a <a href="/en/components/toast">Toast</a>, not a Callout.',
    "callout.test1": 'The danger tone announces assertively (<code>role="alert"</code>); every other tone, politely.',
    "callout.test2": "Never renders a dismiss control: it is not dismissible.",
    "callout.test3": "The icon and optional actions render as explicit parts.",

    "demo.slider.volume": "Volume",
    "demo.slider.brightness": "Brightness",
    "demo.slider.priceMin": "Minimum price",
    "demo.slider.priceMax": "Maximum price",
    "demo.select.label": "Plan",
    "demo.calendar.locale": "en-US",
    "demo.calendar.availability": "Availability",
    "demo.calendar.stay": "Stay",

    "calendar.description":
      "Standalone date grid for a day, month, or year/decade view, with no field or popover and the same button switching views.",
    "calendar.lede":
      'The date grid itself, separate from the field that opens it. <a href="/en/components/date-picker">DatePicker</a> nests it inside a popover; this page is the same component standing alone, for when the calendar <em>is</em> the UI (a reservations page, a dashboard filter) and no input is needed behind it.',
    "calendar.gridTitle": "Grid",
    "calendar.gridBody":
      "Underneath it still runs <code>@zag-js/date-picker</code> (there is no separate calendar machine in this stack), configured <code>inline</code>: the same keyboard navigation, the same grid with six fixed weeks.",
    "calendar.gridLabel": "Calendar",
    "calendar.viewTitle": "Switching views: buttons, not selects",
    "calendar.viewBody1":
      'The header does not carry two month/year <code>&lt;select&gt;</code> elements: it is a single button, <code>sk-calendar__view-trigger</code>, which shows the visible date ("March 2026" in day view, "2026" in month view, "2020–2029" in year view) and on click <strong>climbs</strong> one level (day → month → year) instead of forcing you to page month by month toward a distant date.',
    "calendar.viewBody2":
      'Choosing a month or a year in its grid <strong>descends</strong> one level: tapping "Jan" in month view returns to day view already parked on January; tapping a year in year view returns to the month view for that year. Climbing up and descending back down (climb to pick the decade, descend by tapping a cell) replaces what two native selects used to do, without losing the grid\'s keyboard navigation (<code>grid</code>/<code>gridcell</code> roles, focus managed by Zag).',
    "calendar.rangeTitle": "Range selection",
    "calendar.rangeBody1":
      '<code>data-selection-mode="range"</code> changes the selection rule: the first click sets the start, the second the end. Zag marks every day in between <code>data-in-range</code> (not <code>data-selected</code>, which stays reserved for the two endpoints) and, while the end is still being chosen, the same state appears as <code>data-in-hover-range</code> as the pointer moves, with no JavaScript of your own: the <code>onPointerMove</code> feeding it only turns on when the mode is <code>range</code>.',
    "calendar.rangeBody2":
      "That attribute lives on the <em>trigger</em>, not the cell, so a fill limited to its own button would leave a gap between days. <code>sk-calendar__cell:has(...)</code> reaches the trigger's state from the cell (the same technique Combobox's focus ring already uses) to paint the whole cell, so the band reads as continuous under <code>border-collapse</code>.",
    "calendar.rangeLabel": "Calendar (range)",
    "calendar.minMaxTitle": "Bounded range: min and max",
    "calendar.minMaxBody1":
      "<code>data-min</code> / <code>data-max</code> (ISO dates) disable everything falling outside the range. In day view, Zag already marks those cells <code>data-disabled</code>/<code>aria-disabled</code>, and the day's own <code>onClick</code> refuses to fire the selection.",
    "calendar.minMaxBody2":
      'Min/max reaches month and year just the same: <code>getMonthsGrid</code>/<code>getYearsGrid</code> resolve their own native <code>disabled</code> per cell, comparing the focused date <em>carried into that month or year</em> against min/max (not "does this month have any valid day?": a nuance that can disable a month that does touch the range, if the focused day, moved into that month, falls outside it). Neither view needed new CSS: both already go through <code>.sk-button:disabled</code>.',
    "calendar.minMaxLabel": "Calendar (min/max)",
    "calendar.contractItem1":
      '<code>sk-calendar__header</code> groups previous, the view button and next; all three read "previous/next <em>of the active view</em>" (month in day view, year in month view, decade in year view), Zag adjusts the accessible label on its own.',
    "calendar.contractItem2":
      "<code>sk-calendar__table</code> is reused across the three views; <code>sk-calendar__month-grid</code> and <code>sk-calendar__year-grid</code> are modifier hooks on the same table, not different markup.",
    "calendar.contractItem3":
      "<code>sk-calendar__cell-trigger</code> is the same cell button in day, month and year views: same size, same selected/today/disabled state.",
    "calendar.a11yBody":
      'The grid is a keyboard-navigable <code>role="grid"</code> in all three views. The locale determines the months and the two-letter abbreviations visible in the day grid; the localized full name stays on each <code>&lt;abbr&gt;</code>.',
    "calendar.test1": "Generates the whole grid from an empty authored root, once.",
    "calendar.test2": "Names the weekdays in the authored locale.",
    "calendar.test3": "Opens on the authored date rather than on today.",

    "demo.datePicker.locale": "en-US",
    "demo.datePicker.label": "Booking",
    "demo.datePicker.placeholder": "mm/dd/yyyy",
    "demo.datePicker.clear": "Clear date",
    "demo.combobox.label": "Country",
    "demo.combobox.placeholder": "Search country",
    "demo.combobox.hint": "Type to filter the list",
    "demo.copyButton.label": "Copy code",
    "demo.copyButton.idle": "Copy",
    "demo.popover.trigger": "View profile",
    "demo.popover.description": "Mathematician and writer.",
    "demo.popover.body": "Wrote the first algorithm intended for a machine.",
    "demo.popover.close": "Close",
    "demo.popup.trigger": "Filters",
    "demo.popup.onlyActive": "Active only",
    "demo.processList.label": "Install @skryensya",
    "demo.processList.install.title": "Install the library",
    "demo.processList.install.body": "Add the core and the React binding to the project.",
    "demo.processList.import.title": "Import ProcessList",
    "demo.processList.import.body": "Load the CSS, then import the components.",
    "demo.processList.render.title": "Render the instructions",
    "demo.processList.render.body": "The counter keeps the numbering with no extra state.",
    "demo.processList.done": "Install complete",
    "demo.processList.docs": "Open the documentation",
    /* The dates are written here rather than formatted in the demo: the tree has a `Translate` and
       not a locale, and `Intl` needs the locale. Each language writes a date the way it writes dates. */
    "demo.changelog.label": "Accordion changes",
    "demo.changelog.kind.breaking": "breaking",
    "demo.changelog.kind.feature": "feature",
    "demo.changelog.kind.bugfix": "bugfix",
    "demo.changelog.kind.rework": "rework",
    /* One date: the release that actually shipped. The other has none, and that absence is exactly
       how the contract says a version has not been published. */
    "demo.changelog.date": "29 July 2026",
    /* Every entry is a headline and its explanation: the first is what gets scanned, the second is
       what gets read once someone has stopped on it. */
    "demo.changelog.breaking.title": "The event was renamed",
    "demo.changelog.breaking.body": "It is now called sk:accordionvaluechange. The old one is no longer emitted.",
    "demo.changelog.bugfix.title": "The part is scoped to a direct child",
    "demo.changelog.bugfix.body": "The enhancer looked for it on any descendant, so a nested section bound its own title as the panel.",
    "demo.changelog.rework.title": "collapsible now defaults to false",
    "demo.changelog.rework.body": "Which is how a single-section accordion had always behaved anyway.",
    "demo.changelog.feature.title": "First published contract",
    "demo.changelog.feature.body": "It ships with its three signatures and the options that compose them.",
    "demo.changelog.chore.title": "The enhancer ships with the rest of the package",
    "demo.changelog.chore.body": "It used to be a separate module. Neither the markup nor the options move.",
    "demo.accordion.detailsLabel": "Deployment settings",
    "demo.dialog.open": "Delete project",
    "demo.dialog.title": "Delete this project?",
    "demo.dialog.body": "The project and all its history are removed. This cannot be undone.",
    "demo.dialog.cancel": "Cancel",
    "demo.dialog.confirm": "Delete",
    "demo.dialogVaul.open": "Open dialog",
    "demo.dialogVaul.title": "Centred box, Vaul on mobile",
    "demo.dialogVaul.body": "Narrow the window below 52rem and this same dialog gains a block-end Vaul. The dialog's markup does not change.",
    "demo.dialogVaul.whatChanges": "What changes",
    "demo.dialogVaul.edgeTitle": "Arrives from the edge",
    "demo.dialogVaul.edgeBody": "Block-end slide instead of a centred scale.",
    "demo.dialogVaul.dragTitle": "Drags to dismiss",
    "demo.dialogVaul.dragBody": "With a handle, only below the breakpoint.",
    "demo.dialogVaul.sameTitle": "Still the same dialog",
    "demo.dialogVaul.sameBody": "Focus, Escape and an inert page are the platform's.",
    "demo.dialogVaul.later": "Not now",
    "demo.dialogVaul.understood": "Got it",

    "dialog.description":
      "The platform's centered dialog. Optional: Dialog Vaul when content asks for an edge-anchored surface on mobile.",
    "dialog.lede":
      'A centered <code>&lt;dialog class="sk-dialog"&gt;</code>. <code>showModal()</code> hands you focus, Escape, an inert page and a backdrop; the system paints the surface. No enhancer: the only JavaScript is opening it.',
    "dialog.confirmTitle": "Confirm",
    "dialog.confirmJsComment": "Optional: read which button closed the form.",
    "dialog.confirmAnatomy":
      'Anatomy: <code>sk-dialog__header</code> (a title with <code>Heading</code> + <code>sk-dialog__title</code>, and a close button), <code>sk-dialog__body</code> and <code>sk-dialog__footer</code> (controls). The close button and the footer are a <code>&lt;form method="dialog"&gt;</code>: they close with no handler and leave the <code>value</code> in <code>dialog.returnValue</code>.',
    "dialog.openingTitle": "Opening it",
    "dialog.contractTitle": "Contract",
    "dialog.contractItem1":
      'Opens a <code>&lt;dialog class="sk-dialog"&gt;</code> with <code>showModal()</code>, not a <code>div</code> imitating the roles.',
    "dialog.contractItem2":
      'Anatomy: <code>sk-dialog__header</code> (<code>sk-heading sk-dialog__title</code> + <code>sk-dialog__close</code>), <code>sk-dialog__body</code>, <code>sk-dialog__footer</code> (controls, optional). The title is a <a class="sk-link sk-interactive" href="/en/components/heading">Heading</a> (almost always with <code>data-flush</code>).',
    "dialog.contractItem3":
      'Associates the title with <code>aria-labelledby</code> pointing at the Heading\'s <code>id</code> (or an equivalent accessible name).',
    "dialog.contractItem4":
      'Close and action controls use <code>&lt;form method="dialog"&gt;</code>; give each button a <code>value</code> if you need to know which one was chosen.',
    "dialog.contractItem5":
      "Don't add a focus trap of your own: <code>showModal()</code> already contains focus and restores it on close.",
    "dialog.contractItem6":
      'Import <a class="sk-link sk-interactive" href="/en/scroll-lock">scroll lock</a> if you want to freeze the page behind it with no CLS when the scrollbar disappears.',
    "dialog.contractItem7":
      'With <a class="sk-link sk-interactive" href="/en/transparency"><code>prefers-reduced-transparency</code></a>, the backdrop drops the translucent blend for an opaque one; modality does not change.',
    "dialog.vaulTitle": "Option: Dialog Vaul",
    "dialog.vaulIntro":
      "When content asks for an edge-anchored surface on mobile, the same <code>&lt;dialog&gt;</code> can opt into <strong>Dialog Vaul</strong>: it adds slide, light-dismiss and drag-to-dismiss. Modality (focus, Escape, inert) still comes from <code>showModal()</code>.",
    "dialog.vaulAddsTitle": "What it adds",
    "dialog.vaulAddsItem1":
      'Opens and closes with authored triggers and closers (<code>data-sk-dialog-vaul-open</code> / <code>-close</code>).',
    "dialog.vaulAddsItem2": "Below <code>52rem</code>, lets you drag the handle toward <code>block-end</code>.",
    "dialog.vaulAddsItem3": "Light-dismiss when the pointer lands outside the panel's rectangle.",
    "dialog.vaulAddsItem4":
      '<code>data-sk-dialog-vaul</code> opts into the enhancement; <code>data-edge="block-end"</code> names the edge. The handle is optional.',
    "dialog.vaulInstallTitle": "Installing Dialog Vaul",
    "dialog.a11yIntro":
      "With <code>showModal()</code>, the platform already does the work. Do not reimplement a focus trap in JavaScript (decision 11 / WCAG technique H102).",
    "dialog.a11yItem1":
      '<strong>On open</strong>, focus enters the dialog. With no <code>autofocus</code>, it lands on the first focusable control. In a destructive confirm, put <code>autofocus</code> on <strong>Cancel</strong> (the safe option), not on Delete or the close button.',
    "dialog.a11yItem2":
      '<strong>DOM order</strong>: the title comes <em>before</em> the close button. If the close button were the first focusable node and the content were long, <code>showModal()</code> could open the panel already scrolled to that control.',
    "dialog.a11yItem3":
      '<strong>Tab / Shift+Tab</strong> cycle between the dialog\'s controls. The page behind it is <code>inert</code>: it receives no focus. The browser chrome (address bar) is still reachable; that is intentional, not a bug.',
    "dialog.a11yItem4":
      '<strong>Escape</strong> closes the dialog (a <code>cancel</code> event) and restores focus to the trigger. It counts as dismissing, not confirming: the same empty/cancel <code>returnValue</code> as the close button with <code>value="cancel"</code>.',
    "dialog.a11yItem5":
      '<strong>On close</strong>, focus returns to whatever element opened the dialog, if it is still on the page. Nothing to save by hand.',
    "dialog.a11yItem6":
      'The close button is an <code>sk-button</code> with <code>data-icon-only</code> and <code>aria-label="Close"</code>. Its icon is decorative (<code>&lt;span data-sk-icon="close"&gt;</code>); the accessible name belongs to the button.',
    "dialog.borderTitle": "Always-on borders aren't just aesthetic",
    "dialog.borderBody":
      "In high contrast, the panel and the page resolve to the same color: softening <code>--sk-dialog-border-width</code> would leave the dialog invisible without a single test failing. That is why it ships at <code>1px</code> rather than <code>0</code>.",
    "dialog.test1": "Closes through the platform's own <code>&lt;form method=\"dialog\"&gt;</code>, not a handler.",
    "dialog.test2": "Renders the anatomy the stylesheet contracts against.",
    "dialog.test3": "Omits the footer form when there is nothing to put in it.",

    "demo.drawer.label": "Navigation",
    "demo.drawer.brand": "Estudio",
    "demo.drawer.close": "Close",
    "demo.drawer.main": "Main",
    "demo.drawer.work": "Work",
    "demo.drawer.account": "Account",
    "demo.drawer.summary": "Overview",
    "demo.drawer.agenda": "Agenda",
    "demo.drawer.files": "Files",
    "demo.drawer.team": "Team",
    "demo.drawer.settings": "Settings",
    "demo.drawer.userName": "Ada Kovač",
    "demo.splitButton.primary": "Save",
    "demo.splitButton.menuLabel": "More options",
    "demo.splitButton.copy": "Save a copy",
    "demo.splitButton.template": "Save as template",
    "demo.accordion.environment.title": "Environment",
    "demo.accordion.environment.description": "Production · Frankfurt",
    "demo.accordion.environment.p1": "Node 22 runs in three replicas behind the Frankfurt balancer. Traffic is distributed round-robin and a replica recycles itself if it fails two health checks in a row.",
    "demo.accordion.environment.p2": "Secrets are injected at boot from the regional vault, so no sensitive value is left in the image or build log.",
    "demo.accordion.runtime.title": "Runtime",
    "demo.accordion.runtime.description": "Version and region",
    "demo.accordion.runtime.p1": "Node 22 on the Frankfurt shared pool. Each deployment reserves two vCPUs and 512 MB, with autoscaling up to six replicas when the request queue exceeds the threshold.",
    "demo.accordion.runtime.p2a": "The healthcheck hits ",
    "demo.accordion.runtime.p2code": "/status",
    "demo.accordion.runtime.p2b": " every ten seconds; three failures in a row take the replica out of the balancer without cutting off in-flight traffic.",
    "demo.accordion.rollout.title": "Rollout",
    "demo.accordion.rollout.description": "Canary by percentage",
    "demo.accordion.rollout.p1": "The canary rises in three legs, 10%, 50% and 100%, and waits for the error and latency metrics to remain stable before advancing to each leg.",
    "demo.accordion.rollout.p2": "If a section degrades, the rollout stops by itself and notifies the guard channel: nothing advances without a green light.",
    "demo.accordion.rollback.title": "Rollback",
    "demo.accordion.rollback.description": "Previous stable version",
    "demo.accordion.rollback.p1": "Restore v2.18.4 if the canary fails checks.",
    "demo.menu.label": "File actions",
    "demo.menu.trigger": "Actions",
    "demo.menu.rename": "Rename",
    "demo.menu.favorite": "Favourite",
    "demo.menu.export": "Export",
    "demo.menu.multilevel.label": "Insert content",
    "demo.menu.multilevel.trigger": "Insert",
    "demo.menu.multilevel.heading": "Heading",
    "demo.menu.multilevel.media": "Media",
    "demo.menu.multilevel.image": "Image",
    "demo.menu.multilevel.upload": "Upload file",
    "demo.menu.multilevel.fromUrl": "From a URL",
    "demo.menu.multilevel.video": "Video",
    "demo.menu.multilevel.table": "Table",
    "demo.menu.compact.label": "Text format",
    "demo.menu.compact.trigger": "Format",
    "demo.menu.compact.bold": "Bold",
    "demo.menu.compact.italic": "Italic",
    "demo.menu.compact.underline": "Underline",
    "demo.menu.compact.strikethrough": "Strikethrough",
    "demo.menu.compact.alignLeft": "Align left",
    "demo.menu.compact.alignCenter": "Align center",
    "demo.menu.compact.alignRight": "Align right",
    "demo.menu.context.label": "Item actions",
    "demo.menu.context.area": "Right-click (or press and hold) inside this area",
    "demo.menu.context.copy": "Copy",
    "demo.menu.context.paste": "Paste",
    "demo.menu.context.delete": "Delete",
    "demo.menu.safety.trigger": "File",
    "demo.menu.safety.new": "New",
    "demo.menu.safety.share": "Share",
    "demo.menu.safety.email": "By email",
    "demo.menu.safety.link": "Copy link",
    "demo.menu.safety.delete": "Delete",
    "demo.radioGroup.label": "Plan",
    "demo.navList.label": "Primary",
    "demo.navList.group": "Space",
    "demo.navList.home": "Home",
    "demo.navList.reports": "Reports",
    "demo.navList.collapsibleNavLabel": "Account",
    "demo.navList.collapsibleLabel": "Collapsible group",
    "demo.navList.account": "My account",
    "demo.navList.settings": "Settings",
    "demo.navList.billing": "Billing",
    "demo.navbar.nav": "Primary",
    "demo.navbar.home": "Home",
    "demo.navbar.projects": "Projects",
    "demo.navbar.reports": "Reports",
    "demo.navbar.team": "Team",
    "demo.navbar.invite": "Invite",
    "demo.navbar.newProject": "New project",
    "demo.imageFrame.alt": "Demonstration landscape",
    "demo.imageFrame.aspectLabel": "ImageFrame aspect ratios",
    "demo.imageFrame.fitLabel": "object-fit modes",
    "demo.imageFrame.positionLabel": "Crop anchors",
    "demo.mediaGradient.title": "Coastal horizon",
    "demo.mediaGradient.caption": "Legible text on the photo.",
    "demo.mediaGradient.body": "Card body below the media.",
    "demo.timeField.label": "Departure",
    "demo.heading.sample": "The platform is ready",
    "demo.heading.label.h4Floor": "h4 · 18 · floor (also h5 and h6)",
    "demo.heading.label.h5Same": "h5 · same as h4",
    "demo.heading.label.h6Same": "h6 · same as h4",
    "demo.heading.page.eyebrow": "OPERATIONS · MAY 2026",
    "demo.heading.page.title": "The platform is ready for the next deployment",
    "demo.heading.page.lede":
      "A page title communicates the result before the person reads the details.",
    "demo.heading.outline.title": "Deployment status",
    "demo.heading.outline.ready": "Regions ready",
    "demo.heading.outline.readyBody":
      "Frankfurt and São Paulo already receive traffic.",
    "demo.heading.outline.next": "Next verification",
    "demo.heading.outline.nextBody": "Check latency after the traffic change.",
    "demo.heading.compact.title": "Storage usage",
    "demo.heading.compact.body":
      "The semantic level is still h2 although the panel needs the visual floor (h4).",
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
    "demo.tabs.basic.label": "Project",
    "demo.tabs.basic.summary": "Summary",
    "demo.tabs.basic.summaryBody": "Atlas is ready for the July launch.",
    "demo.tabs.basic.activity": "Activity",
    "demo.tabs.basic.activityBody":
      "Three changes approved during the last week.",
    "demo.tabs.states.label": "Review",
    "demo.tabs.states.details": "Details",
    "demo.tabs.states.detailsTitle": "Request #248",
    "demo.tabs.states.detailsBody": "Update the Atlas runtime to Node 24.",
    "demo.tabs.states.validation": "Validation",
    "demo.tabs.states.validationTitle": "12 checks passed",
    "demo.tabs.states.validationBody":
      "Types, tests and dependency review with no failures.",
    "demo.tabs.states.settings": "Settings",
    "demo.tabs.states.settingsBody":
      "Settings will be available after the request is approved.",
    "demo.loader.sizesLabel": "Loader sizes",
    "demo.loader.speedsLabel": "Loader speeds",
    "demo.loader.size.sm": "Inside controls",
    "demo.loader.size.md": "Inline status",
    "demo.loader.size.lg": "Region or initial load",
    "demo.loader.speed.fast": "Short cycle",
    "demo.loader.speed.normal": "Base cycle",
    "demo.loader.speed.slow": "Long cycle",
    "demo.loader.loadingResults": "Loading results",
    "demo.loader.syncing": "Syncing in the background",
    "demo.carousel.label": "What's new",
    "demo.carousel.productivity.eyebrow": "Productivity",
    "demo.carousel.productivity.title": "Search",
    "demo.carousel.productivity.body":
      "Find any project instantly, with shortcuts and live filters.",
    "demo.carousel.context.eyebrow": "Context",
    "demo.carousel.context.title": "Activity",
    "demo.carousel.context.body":
      "Six months of changes in a timeline that keeps its thread.",
    "demo.carousel.analytics.eyebrow": "Analytics",
    "demo.carousel.analytics.title": "Reports",
    "demo.carousel.analytics.body":
      "Cohorts, scheduled exports, and metrics that fit in one card.",
    "demo.carousel.collaboration.eyebrow": "Collaboration",
    "demo.carousel.collaboration.title": "Team",
    "demo.carousel.collaboration.body":
      "Invite, assign roles, and share spaces without leaving the flow.",
    "demo.carousel.readMore": "Read more",
    "demo.carousel.focusLabel": "What's new, with a link on every card",
    "demo.carousel.team.label": "Team",
    "demo.carousel.person.first.role": "Platform",
    "demo.carousel.person.second.role": "Compilers",
    "demo.carousel.person.third.role": "Networks",
    "demo.carousel.person.fourth.role": "Genetics",
    "demo.carousel.person.fifth.role": "Retrieval",
    "demo.grid.label": "Recent projects",
    "demo.link.before": "A paragraph with a ",
    "demo.link.neutral": "text-coloured link",
    "demo.link.middle": " and another ",
    "demo.link.primary": "primary-coloured one",
    "demo.link.after": ", both with a permanent underline.",
    "demo.progress.upload": "Upload",
    "demo.progress.complete": "Complete",
    "demo.progress.quota": "Quota",
    "demo.emptyState.title": "There are no projects yet",
    "demo.emptyState.description":
      "Create the first one to organize the team's work.",
    "demo.emptyState.action": "Create project",
    "demo.segmented.label": "Range",
    "demo.segmented.day": "Day",
    "demo.segmented.week": "Week",
    "demo.segmented.month": "Month",
    "demo.flyout.density": "Density",
    "demo.flyout.densityCondensed": "Condensed",
    "demo.flyout.densityDense": "Dense",
    "demo.flyout.densityCompact": "Compact",
    "demo.flyout.densityComfortable": "Comfortable",
    "demo.flyout.densitySpacious": "Spacious",
    "demo.flyout.radius": "Roundness",
    "demo.flyout.radiusSquare": "Square",
    "demo.flyout.radiusSubtle": "Subtle",
    "demo.flyout.radiusSoft": "Soft",
    "demo.flyout.radiusStrong": "Strong",
    "demo.flyout.radiusRound": "Round",
    "demo.flyout.region": "Region",
    "demo.flyout.regionEurope": "Europe",
    "demo.flyout.regionAmericas": "Americas",
    "demo.flyout.regionApac": "Asia-Pacific",
    "demo.flyout.regionLatam": "Latin America",
    "demo.flyout.language": "Language",
    "demo.flyout.theme": "Theme",
    "demo.flyout.themeCustom": "Custom",
    "demo.toast.dismiss": "Dismiss",
    "demo.toast.linkCopied": "Link copied to clipboard.",
    "demo.toast.documentArchived": "Document archived",
    "demo.toast.movedToArchived": "Moved to Archived.",
    "demo.toast.undo": "Undo",
    "demo.checkbox.emailAlerts": "Email alerts",
    "demo.switch.deployAutomatically": "Deploy automatically",
    "demo.treeView.label": "Project",
    "demo.button.save": "Save",
    "demo.button.cancel": "Cancel",
    "demo.button.delete": "Delete",
    "demo.button.download": "Download",
    "demo.button.continue": "Continue",
    "demo.button.settings": "Settings",
    "demo.button.edit": "Edit",
    "demo.button.add": "Add",
    "demo.button.copy": "Copy",
    "demo.button.moreActions": "More actions",
    "demo.button.goFirstComponent": "Go to first component",
    "demo.button.small": "Small",
    "demo.button.large": "Large",
    "demo.button.withIcon": "With icon",
    "demo.button.retry": "Retry",
    "demo.button.dismiss": "Dismiss",

    "button.description": "Button: style hooks, a minimal vanilla enhancer and a React component.",
    "button.lede": 'Styling hooks over the native <code>&lt;button&gt;</code>, a vanilla enhancer, and a React component.',
    "button.variantsTitle": "Variants",
    "button.translucentBody":
      "<code>translucent</code> has a semi-transparent background that blends with colored backgrounds. Use it in callouts, colored cards, or any context where the button needs to visually integrate with its container instead of competing with it.",
    "button.sizesTitle": "Sizes",
    "button.sizesLabel": "Button · sm / md / lg",
    "button.sizeHitNote": "ships already: the sm face paints at 32px, the hit stays 44px",
    "button.iconTitle": "With icon",
    "button.iconBody":
      "The icon sits before or after the label depending on what needs saying first: leading to signal the kind of action, trailing to point where it goes. It is only the order in <code>children</code>: the same <code>gap</code> between icon and text either way.",
    "button.iconLabel": "Button with icon",
    "button.iconOnlyTitle": "Icon only",
    "button.iconOnlyLabel": "Icon only",
    "button.iconOnlySmLabel": "Icon only · sm",
    "button.linkTitle": "As a link",
    "button.linkBody":
      'Any shape above (variant, size, icon, icon-only) also renders as a link: same classes, same <code>data-*</code> attributes, only the tag changes (<code>&lt;a href&gt;</code> instead of <code>&lt;button&gt;</code>). In React, passing <code>href</code> to <code>Button</code> makes the switch. A link cannot be <code>disabled</code>: it renders unlinked content instead.',
    "button.linkLabel": "Button as a link",
    "button.tileTitle": "TileButton",
    "button.tileBody": "When the whole surface is one action, not just a label inside it.",
    "button.tileLabel": "TileButton",
    "button.vanillaInitTitle": "Initialize vanilla",
    "button.iconsComment":
      "Icons are authored as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "button.sizeHitComment":
      "Already ships in components/button.css. No need\n   to write it: it's here because it's the part of the\n   component that surprises most, and it's worth knowing\n   it exists.\n\n   Positioning is NOT declared here on purpose: it's set\n   by .sk-interactive (state layer). A position of its own\n   would turn any button into the containing block for\n   whatever it holds in absolute.",
    "button.test1": "Is a native <code>&lt;button&gt;</code> that does not submit forms by default.",
    "button.test2": "Disabled state reaches both the native control and assistive technology.",
    "button.test3": "As a link, renders with Button's appearance and the anchor's attributes.",
    "button.test4": "The enhancer gives authored buttons a safe <code>type</code>, and mounting twice is idempotent.",
    "button.test5": "An icon-only button with no accessible name is refused by the enhancer.",

    "demo.list.preferences": "Preferences",
    "demo.list.resources": "Project resources",
    "demo.list.team": "Team",
    "demo.list.active": "Active",
    "demo.list.notifications.title": "Notifications",
    "demo.list.notifications.description": "Weekly summary every Friday.",
    "demo.list.timezone.title": "Time zone",
    "demo.list.timezone.description": "Used to schedule sends.",
    "demo.list.timezone.value": "GMT−3",
    "demo.list.language.title": "Language",
    "demo.list.language.description": "Interface and emails.",
    "demo.list.language.value": "Spanish",
    "demo.list.dateFormat.title": "Date format",
    "demo.list.dateFormat.description": "How days and months are written.",
    "demo.list.dateFormat.value": "31/12/2026",
    "demo.list.homePage.title": "Home page",
    "demo.list.homePage.description": "Where you land when you sign in.",
    "demo.list.homePage.value": "Summary",
    "demo.list.prerequisites.title": "Prerequisites",
    "demo.list.prerequisites.description": "What you need before installing.",
    "demo.list.gettingStarted.title": "Getting started",
    "demo.list.gettingStarted.description":
      "Install and set up your first project.",
    "demo.list.customization.title": "Customization",
    "demo.list.customization.description":
      "Adjust color, density, radius and iconography.",
    "demo.list.tokenReference.title": "Token reference",
    "demo.list.tokenReference.description":
      "Look up roles, scales and decision chains.",
    "demo.list.tiers.title": "Tiers",
    "demo.list.tiers.description": "Which layer resolves each decision.",
    "demo.list.first.name": "John Doe",
    "demo.list.first.role": "Design system and experience.",
    "demo.list.second.name": "Jane Doe",
    "demo.list.second.role": "Components and infrastructure.",
    "demo.list.third.name": "Richard Roe",
    "demo.list.third.role": "Strategy and discovery.",
    "demo.list.fourth.name": "Mary Major",
    "demo.list.fourth.role": "Research and content.",
    "demo.list.area.design": "Design",
    "demo.list.area.engineering": "Engineering",
    "demo.list.area.product": "Product",
    "demo.table.plans": "Available plans",
    "demo.table.plan": "Plan",
    "demo.table.usage": "Usage",
    "demo.table.status": "Status",
    "demo.table.starter": "Starter",
    "demo.table.starterUsage": "Small teams",
    "demo.table.team": "Team",
    "demo.table.teamUsage": "Up to 50 people",
    "demo.table.active": "Active",
    "demo.table.trial": "Trialling",
    "demo.table.taxNote": "Prices do not include tax.",
    "demo.table.regions": "Performance by region",
    "demo.table.resizeLabel": "Resize column",
    "demo.table.service": "Service",
    "demo.table.latency": "Latency",
    "demo.table.errors": "Errors",
    "demo.table.uptime": "Uptime",
    "demo.table.deployments": "Recent deployments",
    "demo.table.when": "When",
    "demo.table.who": "Who",
    "demo.table.result": "Result",
    "demo.table.succeeded": "Succeeded",
    "demo.table.running": "Running",
    "demo.table.environment": "Environment",
    "demo.table.failed": "Failed",
    "demo.table.rowsPerPage": "Rows per page",
    "demo.table.pagination": "Pagination",
    "demo.table.previousPage": "Previous page",
    "demo.table.nextPage": "Next page",
    "demo.table.minutesAgo": "{n} min ago",
    "demo.table.hoursAgo": "{n} h ago",
    "demo.table.range": "{start}–{end} of {total}",
    "demo.badge.settings": "Settings",
    "demo.badge.unread": "Unread news",
    "demo.badge.online": "Online",

    "badge.description": "Badge: static tag with semantic tones, styling hooks and a React component.",
    "badge.lede":
      "Badge is a static visual label for statuses, categories or short metadata. It does not communicate selection, a counter or navigation on its own; that semantics belongs to the content or the container.",
    "badge.tagTitle": "Label",
    "badge.tagBody":
      "The shape with text: a status, a category or a short piece of metadata. Every tone carries a border in its own color, so neutral — whose background is the canvas — never reads as an invisible rectangle.",
    "badge.tagLabel": "Badge",
    "badge.dotTitle": "Dot",
    "badge.dotBody":
      "A badge that is <strong>just a dot</strong>: no text, it communicates through color and position. On its own it's a status light; its fill is a saturated tone so it reads at just a few pixels.",
    "badge.dotLabel": "Badge dot",
    "badge.cornerTitle": "In the corner of an element",
    "badge.cornerBody":
      "Wrap the element in <code>sk-badge-holder</code> and the dot anchors to the top right — a new-activity indicator on a button, a presence indicator on an avatar. A ring in the surface's color lifts it off the content underneath. The dot carries its own <code>aria-label</code> because it means something; the host element does not change.",
    "badge.cornerLabel": "Badge dot in the corner",
    "badge.test1": "Renders its accessible label and forwards semantic attributes.",
    "badge.test2": "Anchors a status dot without adding visible content.",

    "demo.carousel.nativeLabel": "News (no JS)",
    "demo.checkbox.group": "Repository permissions",
    "demo.checkbox.read": "Read",
    "demo.checkbox.write": "Write",
    "demo.checkbox.admin": "Admin",
    "demo.checkbox.critical.title": "Critical alerts",
    "demo.checkbox.critical.body": "Notify outages and degradations.",
    "demo.checkbox.private.title": "Private repositories",
    "demo.checkbox.private.body": "Include activity from private projects.",
    "demo.checkbox.disabled.title": "Inherited channel",
    "demo.checkbox.disabled.body": "Managed by the organization.",
    "demo.flyout.plan": "Plan",
    "demo.flyout.placeholder": "Choose a plan",
    "demo.heading.flush": "Heading without its own margin",
    "demo.list.integrations": "Integrations",
    "demo.loader.simulation": "Loading simulation",
    "demo.loader.busy": "Loading results…",
    "demo.loader.ready": "Results are ready.",
    "demo.loader.start": "Simulate loading",
    "demo.loader.contexts": "Loader in context",
    "demo.loader.page.title": "Page",
    "demo.loader.page.body": "Loading a complete view.",
    "demo.loader.card.title": "Card",
    "demo.loader.card.body": "Loading content inside a surface.",
    "demo.loader.control.title": "Control",
    "demo.loader.control.body": "Reserving space beside an action.",
    "demo.radioGroup.starter.title": "Starter",
    "demo.radioGroup.starter.body": "For personal projects.",
    "demo.radioGroup.pro.title": "Pro",
    "demo.radioGroup.pro.body": "For growing teams.",
    "demo.stat.summary": "Business summary",
    "demo.stat.income": "Income",
    "demo.stat.orders": "Orders",
    "demo.stat.cancellations": "Cancellations",
    "demo.stat.versus": "vs. previous month",
    "demo.stat.relative": "Relative performance",
    "demo.stat.cumulative": "Period total",
    "demo.stat.activity": "Activity",
    "demo.stat.increases": "Increases",
    "demo.stat.decreases": "Decreases",
    "demo.stat.stable": "Stable",
    "demo.switch.auto.title": "Automatic deployment",
    "demo.switch.auto.body": "Publish when all checks pass.",
    "demo.switch.public.title": "Public URL",
    "demo.switch.public.body": "Anyone with the link can view it.",
    "demo.table.activity": "Deployment activity",
    "demo.table.page": "Page",
    "demo.tabs.status": "Active panel",
    "demo.tabs.summary": "Summary",
    "demo.tabs.activity": "Activity",
    "demo.tabs.metrics": "Metrics",
    "demo.tabs.settings": "Settings",
    "demo.tabs.summary.body": "Overall workspace status.",
    "demo.tabs.activity.body": "Recent changes from the team.",
    "demo.tabs.metrics.body": "Project performance and usage.",
    "demo.tabs.settings.body": "Workspace preferences.",
    "demo.text.before": "The",
    "demo.text.after": "plan includes priority support.",
    "demo.toast.emit": "Emit toast",
    "demo.toast.dynamic": "The export finished.",
    "demo.toast.syncing": "Syncing",
    "demo.toast.syncingBody": "This may take a few seconds.",
    "demo.toast.deploymentCreated": "Deployment created",
    "demo.toast.deploymentCreatedBody": "The version is now available.",
    "demo.toast.connectionFailed": "Could not connect",
    "demo.toast.connectionFailedBody": "Check your connection and try again.",
    "demo.toast.status.saved": "Changes saved",
    "demo.toast.status.copied": "Link copied",
    "demo.toast.status.failed": "Could not save",
    "demo.toast.stack.first": "Export prepared.",
    "demo.toast.stack.second": "Report sent.",
    "demo.toast.stack.third": "Permissions updated.",
    "demo.toc.title": "On this page",
    "demo.toc.summary": "Summary",
    "demo.toc.installation": "Installation",
    "demo.toc.configuration": "Configuration",
    "demo.toc.configuration.env": "Environment variables",
    "demo.toc.configuration.flags": "Optional flags",
    "demo.toc.reference": "Reference",
    "demo.commandPalette.open": "Open palette",
    "demo.commandPalette.label": "Search",
    "demo.commandPalette.section": "Components",
    "demo.commandPalette.button": "Button",
    "demo.commandPalette.dialog": "Dialog",
    "demo.commandPalette.toc": "Toc",
    "demo.componentPreview.title": "Primary button",
    "demo.componentPreview.button": "Save",
    "demo.avatar.label": "Example avatars",
    "demo.avatar.imageLabel": "Photo avatars",
    "demo.avatar.sizesLabel": "Avatar sizes",
    "demo.avatar.colorsLabel": "Colored avatars",
    "demo.avatar.colorPersonName": "Avatar {letter}",
    "demo.avatar.groupLabel": "Stacked avatars",
    "demo.avatar.personOne": "Person 1",
    "demo.avatar.personTwo": "Person 2",
    "demo.avatar.personThree": "Person 3",

    "avatar.description": "Avatar: ImageFrame or initials, AvatarGroup with +N collapse, and a React component.",
    "avatar.lede":
      'Avatar is the visual token for a person or entity: a cropped photo with <strong>ImageFrame</strong> (1/1, cover, pill), or, with no image, the first two letters of the name. <strong>AvatarGroup</strong> stacks a set and collapses the overflow into a "+N" counter.',
    "avatar.body":
      'With an image, the avatar nests <code>sk-image-frame</code> and the <code>&lt;img alt&gt;</code> carries the semantics. Without one, the container takes <code>role="img"</code> and the initials stay decorative. In React, <code>avatarInitials(name)</code> derives the fallback when you pass no children: two words → first letter of each; a single word → its first two characters.',
    "avatar.imagesTitle": "With an image",
    "avatar.imagesBody":
      'With <code>src</code>, the avatar crops the photo inside <strong>ImageFrame</strong> (1/1, cover, pill); the <code>&lt;img alt&gt;</code> carries the semantics.',
    "avatar.sizesTitle": "Sizes",
    "avatar.sizesBody":
      'Three sizes, <code>sm</code> / <code>md</code> / <code>lg</code>, the same scale Button uses.',
    "avatar.colorsTitle": "Colors",
    "avatar.colorsBody":
      'Background and ink are styling hooks (<code>--sk-avatar-bg</code> / <code>--sk-avatar-fg</code>): tinting an avatar per person is the most ordinary thing an app does with them. Sixteen identities, each a different color off the base palette, ringed the same way <strong>AvatarGroup</strong> separates its own overlapping discs.',
    "avatar.groupTitle": "Stacked avatars",
    "avatar.groupBody":
      '<strong>AvatarGroup</strong> overlaps a set and collapses the overflow into a "+N" counter.',
    "avatar.test1": "With no image, derives initials from the name (two words → one letter from each).",
    "avatar.test2": "With a single name, uses its first two characters.",
    "avatar.test3": "With <code>src</code>, the image renders inside ImageFrame.",
    "avatar.test4": "AvatarGroup caps visible avatars and collapses the rest into a \"+N\" counter.",

    "demo.fileUpload.label": "Attachments",
    "demo.fileUpload.dropzone": "Drag files here",
    "demo.fileUpload.trigger": "Choose files",
    "demo.numberField.label": "Quantity",
    "demo.numberField.decrement": "Decrease",
    "demo.numberField.increment": "Increase",
    "demo.placeholder.loading": "Loading post…",
    "demo.placeholder.loaded": "Post loaded.",
    "demo.placeholder.research": "Research",
    "demo.placeholder.title": "When a route stops being linear",
    "demo.placeholder.body":
      "Twelve interviews show where context is lost and what signs help to recover it.",
    "demo.placeholder.readTime": "8 min read · updated today",
    "demo.processList.first.title": "Create the workspace",
    "demo.processList.first.description": "Choose a region and a stable name.",
    "demo.processList.second.title": "Invite the team",
    "demo.processList.second.description": "Assign roles before sharing the link.",
    "demo.processList.third.title": "Publish",
    "demo.processList.third.description": "Review permissions and confirm the change.",
    "demo.sidebar.collapse": "Collapse navigation",
    "demo.sidebar.nav": "Primary",
    "demo.sidebar.workspace": "Workspace",
    "demo.sidebar.home": "Home",
    "demo.sidebar.reports": "Reports",
    "demo.sidebar.content": "The content of the app goes here.",
    "demo.sidebar.resize": "Resize the navigation",
    "demo.sidebar.files": "Project files",
    "demo.sidebar.explorer": "Explorer",
    "demo.sidebar.longFile": "consolidated-annual-report.md",
    "demo.sidebar.resizeContent": "Drag the panel edge. A name that does not fit is truncated with an ellipsis; a horizontal scrollbar never appears.",
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
    "demo.tooltip.export.label": "Export",
    "demo.tooltip.export.content": "Download the visible period as CSV",
    "demo.tooltip.metric.value": "Revenue $48.2k",
    "demo.tooltip.metric.label": "How Revenue is calculated",
    "demo.tooltip.metric.content": "Amount invoiced for the period, before tax and refunds",
    "demo.tooltip.truncated.content": "Billing pipeline migration",
    "demo.toolbar.actions": "Document actions",
    "demo.toolbar.edit": "Edit",
    "demo.toolbar.copy": "Copy",
    "demo.toolbar.delete": "Delete",
    "demo.toolbar.viewControls": "View controls",
    "demo.toolbar.screenSize": "Screen size",
    "demo.toolbar.free": "Free",
    "demo.toolbar.tablet": "Tablet",
    "demo.toolbar.mobile": "Mobile",
    "demo.toolbar.binding": "Binding",
    "demo.tree.initialLabel": "Project",
    "demo.tree.multipleLabel": "Project files",
    "demo.tree.disabledLabel": "Project with a disabled branch",
    "demo.tree.filesLabel": "Project files",
    "demo.tree.source": "src",
    "demo.tree.components": "components",
    "demo.tree.buttonFile": "button.tsx",
    "demo.tree.indexFile": "index.ts",
    "demo.tree.disabledFolder": "legacy",
    "demo.tree.selection": "Selection",
    "demo.tree.expansion": "Expansion",

    "accordion.description": "One or more Tile disclosures coordinated into a single frame.",
    "architecture.title": "How components are built",
    "architecture.lede":
      "Every component follows the same model: a shared base so it looks and behaves consistently, plus the binding you choose for your application. This page uses Accordion as the example.",
    "architecture.layersTitle": "The model in four pieces",
    "architecture.layer1":
      '<strong>Contract.</strong> Defines the component parts, options, and rules. It is the blueprint shared by the documentation and every implementation.',
    "architecture.layer2":
      '<strong>Styles.</strong> A published stylesheet applies tokens and visual states. You can adjust it with style hooks without copying the component.',
    "architecture.layer3":
      '<strong>Behavior.</strong> Only interactive components add a machine that manages state, keyboard input, and accessibility attributes.',
    "architecture.layer4":
      '<strong>Binding.</strong> Choose how to use it: HTML with Vanilla, declarative components with React, or CSS alone when no interaction is needed.',
    "architecture.flowTitle": "What happens when someone interacts",
    "architecture.flow1":
      '<strong>The person acts.</strong> They click, tap, or use the keyboard on a native control.',
    "architecture.flow2":
      '<strong>The component decides.</strong> Its behavior applies the relevant rule: open, select, validate, or change views.',
    "architecture.flow3":
      '<strong>The interface updates.</strong> State, accessibility attributes, and styles change together.',
    "architecture.flow4":
      '<strong>Your application hears about it.</strong> React calls the callback; Vanilla emits an event. Connect that data only when you need it.',
    "architecture.useTitle": "How to choose what to use",
    "architecture.use1":
      '<strong>You need appearance.</strong> Import the component stylesheet.',
    "architecture.use2":
      '<strong>You need interaction in HTML.</strong> Write the contract markup and mount the Vanilla enhancer.',
    "architecture.use3":
      '<strong>You use React.</strong> Import the React component and pass props; the binding handles markup and behavior.',
    "architecture.exampleTitle": "Example: Accordion",
    "architecture.exampleBody":
      "Accordion uses all four pieces: its contract names the root, item, trigger, and content; its styles reuse Tile; its behavior coordinates which sections are open; and React or Vanilla give you the value when it changes. Its options are listed in each component's <strong>Reference</strong> tab, generated from the contract.",
    "accordion.intro":
      'If the state can live in HTML and a native exclusive group is enough, the simplest option is {detailsLink}, at the end of this page. Choose Accordion when you need a controlled value, <code>multiple</code>, or to listen for state changes.',
    "accordion.detailsNativoLabel": "Native details",
    "accordion.iconsNote":
      'Chevrons are placeholders (<code>&lt;span data-sk-icon="chevron-*"&gt;</code>): no component mounts an icon set for you, so this line is needed too.',
    "accordion.oneItemTitle": "Accordion with a single item",
    "accordion.oneItemBody":
      "For an isolated disclosure, use Accordion with a single item: the root provides the frame and the Tile keeps the surface and state layer.",
    "accordion.oneItemLabel": "Accordion of one item",
    "accordion.exclusiveTitle": "Accordion as an exclusive group",
    "accordion.exclusiveBody":
      '<code>data-type="single"</code> in HTML, <code>type="single"</code> in React, keeps at most one item open. With <code>data-collapsible="false"</code> or <code>collapsible={false}</code>, the open item cannot be closed.',
    "accordion.exclusiveLabel": "Accordion single",
    "accordion.multipleTitle": "Accordion as a multiple group",
    "accordion.multipleBody":
      '<code>type="multiple"</code> keeps each disclosure independent.',
    "accordion.multipleLabel": "Accordion multiple",
    "accordion.contractTitle": "Contract",
    "accordion.contractSelection":
      "Opening an item does not paint the selection border: that is for checkbox and radio.",
    "accordion.contractRest": "The rest of the contract (parts, options, defaults, and what each slot accepts) comes from the compiled contract and lives in {reference}.",
    "accordion.contractEvent":
      'State is heard through an event on the root, not a callback: <code>sk:accordionvaluechange</code>, with the value on <code>event.detail.value</code>.',
    "accordion.nativeLede":
      '<code>&lt;details&gt;</code> and <code>&lt;summary&gt;</code> are already an accessible platform disclosure. Share a <code>name</code> attribute between siblings so the browser keeps a single item open: a native accordion, with no machine and no <code>@skryensya/vanilla</code>.',
    "accordion.decisionHeadNeed": "You need",
    "accordion.decisionHeadUse": "Use",
    "accordion.decisionRow1Need": "It has to work before any script loads, or without JavaScript at all",
    "accordion.decisionRow1Use": "Native details",
    "accordion.decisionRow2Need": "A simple exclusive group: sharing <code>name</code> is enough",
    "accordion.decisionRow2Use": "Native details",
    "accordion.decisionRow3Need": "Keep several sections open at once",
    "accordion.decisionRow3Use": "Accordion (<code>multiple</code>)",
    "accordion.decisionRow4Need": "Set or read the open value from outside: state, props, another component",
    "accordion.decisionRow4Use": "Accordion",
    "accordion.decisionRow5Need": "Listen for when it changes, to sync with the rest of the UI",
    "accordion.decisionRow5Use": "Accordion",
    "accordion.decisionRow6Need": "Guarantee the same animated transition in every browser",
    "accordion.decisionRow6Use": "Accordion",
    "accordion.nativeBody":
      'It shares the same tokens as Tile (title, description, chevron), so the group looks the same without composing a Tile inside it.',
    "accordion.nativePreviewLabel": "Details with a shared name",
    "accordion.nativeInstallTitle": "Install only Details",
    "accordion.nativeContractTitle": "Native contract",
    "accordion.nativeContractItem1":
      'The first interactive child of each <code>&lt;details&gt;</code> is its <code>&lt;summary&gt;</code>.',
    "accordion.nativeContractItem2":
      'The <code>open</code> attribute declares the initial state in HTML.',
    "accordion.nativeContractItem3":
      'The same <code>name</code> between siblings makes the group exclusive; without <code>name</code>, each disclosure is independent.',
    "accordion.nativeContractItem4":
      'The browser changes <code>open</code>; there is no controlled value or system event to listen to.',
    "accordion.nativeContractItem5":
      "The chevron paints only inside <code>&lt;summary&gt;</code>: it replaces the native marker (<code>&lt;summary&gt;</code> turns off the browser's own triangle) and toggles with plain CSS keyed on <code>details[open]</code>, with no script of its own.",
    "accordion.a11yTitle": "Accessibility",
    "accordion.a11yP1":
      'Each trigger is a native <code>&lt;button&gt;</code>: Enter and Space activate it with no script of its own, and its <code>aria-expanded</code> (written by the machine, never by hand) is the only thing that announces the state. The chevron is <code>aria-hidden="true"</code>: it is the same information said twice, and only one should reach the screen reader.',
    "accordion.a11yP2":
      "<kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> move focus between triggers in the page's normal order: the base keyboard pattern the ARIA APG describes for an accordion asks for nothing more — arrow keys, <kbd>Home</kbd> and <kbd>End</kbd> between triggers are an optional enhancement this component does not implement today. Opening an item does not take focus from its trigger or hand it to the content: keyboard traversal stays the same, same as with the mouse.",
    "accordion.a11yP3":
      '{detailsLink} has none of this because it does not need it: a <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code> is an accessible platform disclosure, with its own focus and keyboard handling already solved by the browser.',

    "accordion.testReact1":
      "In single mode, opening an item closes the previous one and fires onValueChange with the new value.",
    "accordion.testReact2":
      "In multiple mode, opening an item does not close the others that are open.",
    "accordion.testReact3":
      'An item carries the right classes (<code class="sk-code">sk-tile--expandable</code>, no <code class="sk-code">--interactive</code>) and <code class="sk-code">aria-expanded</code> toggles on trigger click.',
    "accordion.testReact4":
      'Each trigger is wrapped in a <code class="sk-code">role="heading"</code> with <code class="sk-code">aria-level</code> (defaults to 3, configurable), so a screen reader navigating by heading finds the sections.',
    "accordion.testVanilla1":
      "In single mode, opening an item closes the previous one (animated) and emits the sk:accordionvaluechange event.",
    "accordion.testVanilla2":
      "In multiple mode, items open independently.",

    "hooks.intro":
      "Token comes from the published CSS. Value resolves live against the real component element and changes with the dimensions selected above.",
    "hooks.definition": "Token",
    "hooks.resolvedValue": "Value",

    "tokens.primitive": "Primitives",
    "tokens.semantic": "Semantic",
    "tokens.component": "By component",
    "tokens.search": "Search",
    "tokens.searchPlaceholder": "Name or value…",
    "tokens.all": "All",
    "tokens.group": "Group",
    "tokens.groups": "{count} groups",
    "tokens.groupCount": "{count} group",
    "tokens.definition": "Token",
    "tokens.resolvedValue": "Value",

    "vanilla.title": "Vanilla: install and mount",
    "vanilla.intro":
      "This route does not need React. Install Core for styles and Vanilla for the enhancer, then choose one mounting strategy for each root. Both are idempotent.",
    "vanilla.autoTitle": "Auto, only the enhancers present",
    "vanilla.autoBody":
      "Use this when the page contains several system components: it scans the data-sk-* roots present and imports only those types. More on how it works at {autoLink}.",
    "vanilla.autoLinkLabel": "Automatic mounting",
    "vanilla.onlyTitle": "Only {name}",
    "vanilla.onlyBody":
      "This entry point imports only the {name} enhancer. With no argument it mounts every instance in the document; pass a root to mount only that instance.",
    "vanilla.instance": "one instance",
    "vanilla.autoComment":
      "Each selector present triggers only its enhancer's dynamic import.",
    "vanilla.componentComment":
      "Mounts only {name}; it neither loads nor scans other enhancers.",

    "section.start": "Get started",
    "section.start.blurb": "Put the system on a screen.",
    "section.system": "System",
    "section.system.blurb": "The rules that keep everything consistent.",
    "section.components": "Components",
    "section.components.blurb": "A–Z catalog of the system's pieces.",
    "group.firstSteps": "First steps",
    "group.foundations": "Foundations",
    "group.explore": "Browse",
    "group.layout": "Layout",
    "group.global": "Global",
    "group.componentActions": "Actions and input",
    "group.componentActions.blurb": "Capture data, choose options, and run tasks.",
    "group.componentNavigation": "Navigation and orientation",
    "group.componentNavigation.blurb": "Move between pages, views, and hierarchies.",
    "group.componentContent": "Content and data",
    "group.componentContent.blurb": "Present information, media, and collections.",
    "group.componentFeedback": "Status and communication",
    "group.componentFeedback.blurb": "Explain what is happening, missing, or next.",
    "group.componentLayers": "Layers and disclosure",
    "group.componentLayers.blurb": "Reveal detail or focused tasks without losing context.",
    "group.componentLayout": "Layout and utilities",
    "group.componentLayout.blurb": "Compose, space, and support the interface.",

    "contract.tab": "Reference",
    "contract.title": "Reference",

    "component.tabUsage": "Usage",
    "component.tabInstall": "Installation",
    "component.tabStyle": "Style hooks",
    "component.tabA11y": "Accessibility",
    "component.tabTests": "Tests",
    "component.tabsAriaLabel": "{name} reference",
    "component.reactNote": "The code is in the preview's <strong>React</strong> tab.",
    "component.contractNotesTitle": "Contract",

    "sourceViewer.title": "Browse the source",
    "sourceViewer.intro": "Browse {name}'s component-owned files: contract, styles, bindings, and tests.",
    "sourceViewer.treeLabel": "{name} files",
    "sourceViewer.treeAriaLabel": "{name} source files",
    "sourceViewer.resize": "Resize the file tree",

    "tests.title": "Tests",
    "tests.intro": "What each test checks, in one line. Full code is under Reference.",
    "tests.statusPassed": "Passed",
    "tests.statusFailed": "Failed",
    "tests.statusUnknown": "Not run",

    "changelog.tab": "Changelog",
    "changelog.title": "Changelog",
    "changelog.empty": "Nothing yet. The contract has not moved since it was first published.",
    "changelog.kind.breaking": "breaking",
    "changelog.kind.feature": "feature",
    "changelog.kind.bugfix": "bugfix",
    "changelog.kind.rework": "rework",
    "changelog.kind.chore": "chore",

    "carousel.description":
      "Carousel: a native scroll-snap slide region with machine-backed (Zag) controls, snap-to-index, and a JS-free base.",
    "carousel.lede":
      "Scrollable sections that are <strong>native</strong>: the track is a <code>&lt;div&gt;</code> with <code>scroll-snap-type</code>, so scrolling, touch momentum and anchor points belong to the platform, not a script. On top of that sit two control layers over the same substrate: a <strong>JS-free</strong> base using native carousel pseudo-elements, and a <strong>machine-backed</strong> enhancer over <code>@zag-js/carousel</code> that measures the track, derives the pages, and draws buttons and dots. Each slide is any content: a card, an image, a stat.",
    "carousel.cardsTitle": "Card carousel",
    "carousel.cardsBody":
      'With <code>data-sk-carousel</code> the enhancer runs the machine: prev/next (disabled at the ends), one dot per <strong>page</strong>, keyboard, drag, and re-measuring on resize. Here every slide is a card with <a href="/en/components/image-frame">ImageFrame</a> and a body composed of <code>Box</code>, <code>Stack</code> and <code>Text</code>, with no local classes. The default CSS size lets the next one peek through.',
    "carousel.cardsLabel": "Card carousel",
    "carousel.dotsTitle": "One dot per page, not per slide",
    "carousel.dotsBody":
      "This is the concrete reason there is a machine here and not a counter. The <strong>reachable</strong> anchor positions are not one per slide: once a slide starts to peek through, the trailing ones all clip against the maximum scroll and collapse onto the same position. A hand-rolled carousel draws one dot per slide there and ends up with dots that can <em>never</em> be activated and a \"next\" button that never disables. The machine derives pages from <code>getScrollSnapPositions</code> (measured, clipped and deduplicated), so the dots and the scroll agree by construction. You can see it by shrinking the window over any of the examples: the slides that fit change, the dot count changes, and the last one is always reachable.",
    "carousel.multiTitle": "Multi-up, loop and autoplay",
    "carousel.multiBody1":
      "Narrower slides fit several per page, and the machine counts them by measuring. With <code>data-loop</code> the carousel wraps around; with <code>data-autoplay</code> it advances on its own (empty for the default 4000ms, or a delay in ms).",
    "carousel.multiBody2":
      "<code>data-autoplay</code> also brings a <strong>pause button</strong>: anything that moves on its own has to be stoppable (WCAG 2.2.2), so the option and the control are one and the same thing. The button always says what it will do based on what the user last asked for: hovering the mouse over the carousel or moving keyboard focus anywhere inside it — not just the buttons — pauses rotation for as long as that lasts, and resumes it on leaving, unless the other condition is still active. A click on the button overrides all of that until the next click. For anyone who declares <code>prefers-reduced-motion</code>, it never starts: the carousel stays still and the button offers to play. It also pauses on its own once the tab is no longer visible.",
    "carousel.multiLabel": "Multi-up + autoplay",
    "carousel.multiNote": "Avatar + meta · data-loop · data-autoplay",
    "carousel.focusTitle": "Focus inside a card",
    "carousel.focusLabel": "Focus inside a card",
    "carousel.focusBody1":
      "The WAI-ARIA pattern says keyboard focus pauses rotation \"anywhere in the carousel content, including the next and previous slide elements\" — easy to read as \"only the buttons\". This card adds a real link (\"Read more\") inside every slide to prove it also counts: Tab onto the link pauses autoplay, Tab or Shift+Tab away resumes it.",
    "carousel.focusBody2":
      "No new code was needed for this: the focus listener lives on the carousel's root, and <code>focusin</code>/<code>focusout</code> bubble from any descendant, so a link, a button, or any control inside a card is already covered.",
    "carousel.focusNote": "A real link per card · Tab to test the pause",
    "carousel.bareTitle": "No controls",
    "carousel.bareBody1":
      "<code>data-controls=\"none\"</code> turns off <strong>both</strong> layers: neither the enhancer's buttons and dots, nor the native <code>::scroll-button</code> and <code>::scroll-marker</code>. What is left is the bare track, still a scroller with snap: every slide is a stop (<code>scroll-snap-stop: always</code>), so swiping never skips a card.",
    "carousel.bareBody2":
      "What does not change is the behavior: the controls were only the chrome. The keyboard still works with focus on the track, and <code>sk-carousel-goto</code> / <code>sk-carousel-change</code> are still the same pair of events.",
    "carousel.bareBody3":
      "And here you can see why <strong>mouse drag ships on</strong>: a vertical wheel scrolls the <em>page</em>, not the horizontal track sitting under the cursor. Without drag, a desktop pointer would have no way to move through this at all. The <code>grab</code> cursor is the entire hint, and it only shows up where drag actually works. Turn it off with <code>data-mouse-drag=\"off\"</code> when the slide text needs to stay selectable: drag suppresses selection.",
    "carousel.bareLabel": "No controls",
    "carousel.bareNote": 'data-controls="none" · drag and swipe',
    "carousel.nativeTitle": "No JS: native controls",
    "carousel.nativeBody":
      "The <strong>same markup</strong> without <code>data-sk-carousel</code>: the enhancer never touches it, and the native pseudo-elements (<code>::scroll-button</code> and <code>::scroll-marker</code>) draw the controls with <strong>zero JavaScript</strong>. The chosen set's CSS adapter feeds them the <code>chevron-left</code> and <code>chevron-right</code> SVGs, rather than swapping in typographic glyphs. It works in Chrome/Edge today; everywhere else it degrades to a scroller with native snap (no arrows or dots, but it still swipes). Once the enhancer mounts, this layer turns itself off so nothing doubles up.",
    "carousel.nativeLabel": "No JS (native CSS)",
    "carousel.nativeNote": "set icons + native scroll buttons",
    "carousel.nativeCssLabel": "the JS-free base",
    "carousel.apiTitle": "Snap-to-index and events",
    "carousel.apiBody":
      "Programmatic control is a pair of events on the root: send <code>sk-carousel-goto</code> to pin to a page, and listen for <code>sk-carousel-change</code> to know which one is active. In React, the <code>&lt;Carousel&gt;</code>'s <code>ref</code> exposes <code>snapTo(index)</code>, which sends that same event.",
    "carousel.contractItem1":
      'Root: <code>&lt;section class="sk-carousel" data-sk-carousel&gt;</code> with a track <code>&lt;div class="sk-carousel__track"&gt;</code> of <code>&lt;div class="sk-carousel__slide"&gt;</code>. Not a list: the machine gives every slide <code>role="group"</code>, which takes it out of listhood and would otherwise leave a list with no list items.',
    "carousel.contractItem2":
      "Slides: any content. <code>--sk-carousel-slide-size</code> sets the width (peek or multi-up) and is the <strong>only</strong> sizing knob: it holds equally with and without JS, because the machine measures the track instead of imposing widths on it.",
    "carousel.contractItem3":
      'Root options: <code>data-controls="none"</code>, <code>data-loop</code>, <code>data-autoplay</code> (empty or ms), <code>data-orientation="vertical"</code>.',
    "carousel.contractItem4":
      'Mouse drag: <strong>on</strong>. <code>data-mouse-drag="off"</code> turns it off, for slides whose text needs to stay selectable.',
    "carousel.contractItem5":
      "Snap: every slide is a stop, with <code>scroll-snap-stop: always</code>, so swiping never skips one. <em>Reachable</em> stops clip against the end of the scroll, which is why the last few slides can end up sharing the final one.",
    "carousel.contractItem6":
      "Controls: the enhancer draws them, one per measured page; the button disables at each end. Prev/next respect the touch-target floor. The dots read compact; the clickable area grows as a block without widening the layout or overlapping. Without JS, the native pseudo-elements act as the baseline (Chrome/Edge), and the <code>@skryensya/icons-*/carousel.css</code> adapter feeds them the same stable chevron roles the enhancer uses.",
    "carousel.contractItem7":
      "Keyboard: with focus on the track, <kbd class=\"sk-kbd\">←</kbd>/<kbd class=\"sk-kbd\">→</kbd> move one page and <kbd class=\"sk-kbd\">Home</kbd>/<kbd class=\"sk-kbd\">End</kbd> jump to the ends; the same keys work with focus on the dots.",
    "carousel.contractItem8":
      'API: <code>sk-carousel-goto</code> (command) and <code>sk-carousel-change</code> (output, with <code>{"{ index, count }"}</code>); in React, <code>ref.snapTo(index)</code>.',
    "carousel.contractItem9": "Reduced motion: smooth scrolling turns off with <code>prefers-reduced-motion</code>.",
    "carousel.nativeCssComment1": "zero JS: the platform draws the controls",
    "carousel.nativeCssComment2": "Previous",
    "carousel.nativeCssComment3": "Next",
    "carousel.nativeCssComment4": "the dot row",
    "carousel.nativeCssComment5":
      "The ::scroll-button boxes are laid out after the scroller, in the\n   parent's flow. The 3-column grid reserves the ends for them.",
    "carousel.bootstrapComment": "runs the machine on every [data-sk-carousel]",
    "carousel.apiComment1": "pin to a page (0-based): the same command snapTo() sends from the React ref",
    "carousel.apiComment2": "read the active page every time it changes (swipe, wheel, button, key, drag or goto)",
    "carousel.apiComment3": "{ index, count } ← count is measured PAGES, not slides",
    "carousel.test1": "Renders a <code>section</code> region with a scroll-snap track of slides.",
    "carousel.test2": "Names the region and every slide for assistive tech.",
    "carousel.test3": "Draws one dot per MEASURED page, not one per slide.",
    "carousel.test4": "Snaps to a dot and reports the page on the change event.",
    "carousel.test5":
      "Focus landing on a card's LINK (not just the prev/next buttons) pauses autoplay, and resumes it on blur.",

    "changelogPage.description":
      "Changelog: a dated history with a rail, where the date is what a reader is looking for and the marker says what kind of change it was.",
    "changelogPage.lede":
      "A dated history, newest on top. The date heads every entry because that is what the reader came looking for, and the rail's marker is a neutral mark that says <em>when</em>: the <em>what</em> is the word beside it. It is static: no enhancer, no state.",
    "changelogPage.previewNote": "four kinds",
    "changelogPage.whenTitle": "When to use it",
    "changelogPage.whenItem1":
      "Use Changelog for release notes and for a contract's history: things that happened, each with its own day.",
    "changelogPage.whenItem2":
      'Use <a href="/en/components/process-list">ProcessList</a> for instructions in order. It numbers its markers with a CSS <code>counter()</code>, so a list with the newest on top would count backward through time.',
    "changelogPage.whenItem3":
      'Use <a href="/en/components/steps">Steps</a> when there is progress: <code>complete</code>, <code>current</code>, <code>upcoming</code>. Its connector says how much work is left behind, which is not a claim anyone can make about a change that already shipped.',
    "changelogPage.contractItem1":
      'The root is <code>&lt;ol class="sk-changelog" reversed&gt;</code>. <code>reversed</code> is fixed, not an option: newest on top is what a changelog <em>is</em>. Nobody draws the numbers, but the accessibility tree reads them, and there they have to count backward.',
    "changelogPage.contractItem2":
      "<strong>The date is two fields.</strong> The <code>date</code> option is the machine-readable day (<code>YYYY-MM-DD</code>) and lands in <code>&lt;time datetime&gt;</code>; the visible text is a slot, because a formatted date is copy in a language and Core ships none. Format it with <code>Intl.DateTimeFormat</code> and fill the slot.",
    "changelogPage.contractItem3":
      "<strong>The kind is also two things.</strong> The <code>kind</code> option marks the entry (<code>added</code>, <code>changed</code>, <code>fixed</code>, <code>removed</code>, <code>breaking</code>); the slot is the word, and it is required, so the kind never lives in color alone.",
    "changelogPage.contractItem4":
      "<code>target</code> is optional: the option, part or signature the change touched. An entry about the whole contract carries none.",
    "changelogPage.contractItem5":
      "<strong>One color.</strong> Painting every kind with its status color left a green, blue and amber rail beside a page that is prose, and green won by sheer volume: almost every entry in almost every changelog is an addition. The marker is a neutral mark; the kind is already spelled out beside it. <code>breaking</code> is the one exception, because it is the only kind whose cost of going unnoticed is the build of whoever consumes you: it keeps the marker and the word. If you want the status palette back, that is a <code>--sk-changelog-marker-color</code> declaration per kind.",
    "changelogPage.datesTitle": "Dates, not versions",
    "changelogPage.datesBody":
      "This contract has no version field, and that is on purpose. A version number only says something if the reader knows which releases exist; a date reads on its own. Once there are published versions, the place for them is the date's own slot, next to the day, not instead of it.",
    "changelogPage.test1": "Renders a reversed ordered list of releases (most recent first).",
    "changelogPage.test2": "A release with no date is marked unreleased and renders no time at all.",
    "changelogPage.test3": "The kind of change is drawn as a Badge.",
    "changelogPage.test4": "Title and description render as separate parts.",

    "checkbox.description": "Native checkbox: independent state, indeterminate, and form handling with no machine.",
    "checkbox.lede": 'An independent choice. It keeps an <code>input type="checkbox"</code>: submit, reset, keyboard and validation belong to the browser.',
    "checkbox.body":
      "The control uses the icon set's <code>check</code> and <code>remove</code> roles, not a CSS stroke. Import <code>@skryensya/core/components/checkbox.css</code> and call <code>initComponents()</code> once.",
    "checkbox.groupTitle": "A checkbox that groups others: CheckboxGroup",
    "checkbox.groupBody1":
      "<code>indeterminate</code> is not a third value someone can pick: it is what a parent says when <strong>its children disagree</strong>. That is why the glyph is <code>remove</code> rather than a half check, and why the parent submits nothing to the form — the children, which carry <code>name</code> and <code>value</code>, are the ones that do.",
    "checkbox.groupNote": "three states from two booleans",
    "checkbox.groupBody2":
      "The parent's state is <strong>derived</strong>, never hand-written: it is recalculated from the children on every change. The other way around, a parent with its own state starts lying the moment someone checks a child. That is why the contract gives it no settable <code>checked</code>: which children start checked is per-entry data (<code>defaultChecked</code>), not the group's.",
    "checkbox.groupBody3":
      "A <code>disabled</code> child is not a vote: a box nobody can reach should not keep the parent from saying “all”. And a form <code>reset</code> restores the children from their attributes <strong>without firing a single event</strong>, so the enhancer re-derives after it; without that the parent would sit contradicting its own children until the next click.",
    "checkbox.tileTitle": "A surface checkbox: TileCheckbox",
    "checkbox.tileBody1":
      "When the choice needs a title, a description, and the whole surface as its target, use <code>TileCheckbox</code>. It is the same control (<code>sk-checkbox__control</code> + icons); only the container changes.",
    "checkbox.tileBody2":
      'The <code>tile-checkbox</code> enhancer (Svelte + <code>@zag-js/checkbox</code>, the same machine React uses) hydrates every <code>data-sk-tile-checkbox</code> label with <code>initComponents()</code>: it controls its (hidden) <code>input[data-part="input"]</code> and syncs <code>data-state</code>; the <code>[data-part="indicator"]</code> is the visual control.',
    "checkbox.reactBody": "React draws the icons from the linked set.",
    "checkbox.contractItem1": "<code>defaultChecked</code> leaves the state to the input; a reset returns to that value.",
    "checkbox.contractItem2": "<code>checked</code> controls the value; <code>onCheckedChange</code> communicates intent.",
    "checkbox.contractItem3":
      '<code>"indeterminate"</code> is visual: it submits no value until the person picks checked or unchecked. The glyph is <code>remove</code>.',
    "checkbox.contractItem4":
      "<code>CheckboxGroup</code> <strong>derives</strong> the parent's state, never stores it: <code>checked</code> when they all are, <code>indeterminate</code> when they disagree. <code>checked</code> and <code>indeterminate</code> are independent flags off the input and can both be on at once; the enhancer turns the second off when leaving that state, and the CSS gives the dash priority in case it is not.",
    "checkbox.contractItem5": 'The text lives inside the <code>label</code>; with no text, provide an <code>aria-label</code>.',
    "checkbox.contractItem6":
      "The state layer sits on <code>sk-checkbox__control</code>, not the label: selection is the control's own fill, and the text never inherits the on-accent color.",
    "checkbox.contractItem7": "TileCheckbox reuses <code>sk-checkbox__control</code> and the same indicators; it invents no other glyph.",
    "checkbox.iconsComment1": "The check/remove indicators are authored as placeholders",
    "checkbox.iconsComment2": "<span data-sk-icon>; mountIcons replaces them with the <svg> of the set.",
    "checkbox.iconsComment3":
      "Every label is authored with data-sk-tile-checkbox (data-name, data-value,\ndata-default-checked) plus its input and its indicator.",
    "checkbox.iconsComment4": "initComponents hydrates them with the @zag-js/checkbox machine.",
    "checkbox.test1":
      "Toggles checked state and the root's <code>data-state</code> on click, emitting <code>sk:checkedchange</code>.",
    "checkbox.test2": "Is form-associated and honours its <code>default-checked</code>.",
    "checkbox.groupTest1":
      "Derives the parent's three states from its children, on mount and on every change.",
    "checkbox.groupTest2":
      "Checks and unchecks every child from the parent, and reports what changed on <code>sk:checkboxgroupvaluechange</code>.",
    "checkbox.groupTest3":
      "Leaves a <code>disabled</code> child alone and does not let it hold the parent back from “all”.",
    "checkbox.groupTest4": "Counts only its own children, never a nested group's.",
    "checkbox.groupTest5":
      "Re-derives the parent after a form <code>reset</code>, which restores the children silently.",

    "codePreview.description": "Shiki code preview with build/SSR highlighting and opt-in Vanilla behavior.",
    "codePreview.lede":
      "A surface for HTML highlighted by Shiki, with copy, condensed/full views and a preview for long blocks. Shiki finishes its work at build or SSR time; the browser receives HTML and only mounts the controls the document authored.",
    "codePreview.exampleNote": 'To present this block underneath a component\'s real render, use <a href="/en/components/component-preview">ComponentPreview</a>.',
    "codePreview.contractTitle": "Loading contract",
    "codePreview.contractItem1":
      "<code>@skryensya/core/components/code-preview.css</code> holds the anatomy and consumes the dual <code>--shiki-light</code> and <code>--shiki-dark</code> variables.",
    "codePreview.contractItem2":
      "<code>initComponents()</code> does not know about <code>[data-sk-code-preview]</code>. Importing the auto-loader never downloads this enhancer.",
    "codePreview.contractItem3":
      "<code>mountCodePreview()</code> is the only behavior seam, and it is idempotent. Highlighting is not part of that runtime.",
    "codePreview.highlightTitle": "Highlighting at build or SSR time",
    "codePreview.mountTitle": "Mounting explicitly",
    "codePreview.mountBody":
      "Regular components are discovered by selector. CodePreview mounts on a second, deliberate call, so that no application loads a documentation preview by accident.",
    "codePreview.highlightComment": "Runs at build/SSR time, never in the browser.",
    "codePreview.mountComment1": "CopyButton and regular components: dynamic imports by selector.",
    "codePreview.mountComment2": "CodePreview is opt-in and stays outside the auto-loader.",
    "codePreview.test1": "Switches density, expands, collapses and mounts idempotently.",
    "codePreview.test2": "Keeps the disclosure control available even when Condensed itself is long.",
    "codePreview.test3": "Says the count in the author's language, and just the number when there is none.",

    "combobox.description": "Editable suggestions with clear states, contextual help, and full keyboard navigation.",
    "combobox.lede": "Editable suggestions with context, clear states, and full keyboard navigation.",
    "combobox.contractBody1":
      "Combobox filters an authored collection without replacing its options. Select keeps a closed list, and Input shows no suggestions.",
    "combobox.contractBody2":
      "What is typed is the user's own work: leaving the field without picking anything (blur, click outside, Escape) closes the list but <strong>does not clear the search</strong>. Only picking an option rewrites the input (with the chosen label), and only the ✕ clears it. On reopening, the filter returns to the full list: what shows is the selection, not the last text typed.",
    "combobox.a11yBody1":
      "Focus stays on the input while <code>aria-activedescendant</code> points at the active option. Arrow down and up move through results, Enter selects, and Escape closes. <code>hint</code> and <code>error</code> link through <code>aria-describedby</code>; changes in the result count are announced through a status region.",
    "combobox.a11yBody2":
      "Moving through results by keyboard moves the focus ring to the highlighted item (virtual focus), and the control yields its own: there is one ring on screen, and it travels to the list and back. With the pointer, no ring appears (a ring following the cursor reads as broken focus) — only the state layer.",
    "combobox.test1": "Keeps the typed search when the field is left without a selection.",
    "combobox.test2": "Writes the chosen label and reopens on the whole list.",
    "combobox.test3": "In multiple mode, the search is spent on each chip added.",
    "combobox.test4": "Hands the filtered collection to the machine before it renders.",

    "commandPalette.description": "CommandPalette: a searchable listbox inside a native Dialog, with an opt-in shortcut and an IconButton close.",
    "commandPalette.lede":
      'A <strong>command palette</strong>: a field that filters an index, and a listbox with <code>aria-activedescendant</code>, hosted in a native <a href="/en/components/dialog"><code>Dialog</code></a> (<code>showModal</code>, Esc, focus). The shortcut (<a href="/en/hotkey">Hotkey</a>) is opt-in by attribute; this site uses it with {hotkey}.',
    "commandPalette.contractItem1": 'Root: <code>&lt;dialog class="sk-dialog sk-command-palette" data-sk-command-palette&gt;</code>.',
    "commandPalette.contractItem2":
      'JSON index via <code>data-sk-command-palette-index</code> (the id of the <code>&lt;script type="application/json"&gt;</code>).',
    "commandPalette.contractItem3":
      "Opening: <code>data-sk-command-palette-open</code> + <code>aria-controls</code> set to the dialog's id (or the attribute's value equal to the id).",
    "commandPalette.contractItem4":
      'Optional shortcut: <code>data-sk-command-palette-hotkey="mod+k"</code>. Without it, only the button opens it.',
    "commandPalette.contractItem5":
      'Closing: a <code>&lt;form method="dialog"&gt;</code> with an IconButton (<code>sk-dialog__close sk-command-palette__close</code>), Esc, or a click on the backdrop.',
    "commandPalette.contractItem6":
      "<code>entries</code> is a contract option, not part of normal usage: it exists so a tree (like the one above) can seed the demo's index — it is emitted as the <code>&lt;script&gt;</code> itself in Vanilla, and as the (parsed) <code>items</code> prop in React. A real composition still authors its own index.",
    "commandPalette.test1": "Claims nothing at rest: no options and no expanded popup.",
    "commandPalette.test2": "Filters as the reader types and points at the first hit.",
    "commandPalette.test3": "Opens from its trigger and fills the list only then.",

    "copyButton.description": "CopyButton: copies an element's text by id and briefly confirms the result.",
    "copyButton.lede":
      'CopyButton copies the text of the element it names and briefly swaps its icon to confirm the result. It is a ghost, icon-only Button with its own anatomy: the enhancer only wires up the clipboard and the feedback; you write the markup. Its size is Button\'s own: <strong>md</strong> (the default) or <code>data-size="sm"</code> (a 32px face, a 44px hit via <code>::after</code>).',
    "copyButton.previewNote": "md · sm",
    "copyButton.contractItem1": "<code>data-sk-copy-button-target</code> is the id of the element whose text gets copied.",
    "copyButton.contractItem2": 'Uses the Clipboard API and falls back to <code>execCommand("copy")</code> when needed.',
    "copyButton.contractItem3":
      "The <code>copied</code> state lasts briefly and announces as <strong>Copied</strong> (or the label you authored in <code>data-sk-copy-button-success-label</code>).",
    "copyButton.contractItem4":
      "That same label appears beside the button as a small flag with an arrow, for exactly as long as the check icon shows, in the success tone (or danger if it failed). It is not a tooltip: it never traps the pointer, so a second click still reaches the button.",
    "copyButton.contractItem5":
      'The flag is placed with the <a href="/en/anchoring">Anchoring</a> pattern: the root also carries <code>sk-anchor</code>, and the flag carries <code>sk-anchored</code> with <code>data-sk-placement="inline-start"</code>. With no anchor positioning in the browser it does not draw, because there is no machine here to place it; the icon and the live region stay the same.',
    "copyButton.contractItem6": "The icons are <code>data-sk-icon</code> placeholders; <code>mountIcons</code> links the set (ADR-15).",
    "copyButton.iconsComment":
      "Icons are authored as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "copyButton.test1": "Copies its authored target, announces success and resets.",
    "copyButton.test2": "Names the anchor tying one button to its own status flag.",
    "copyButton.test3": "Reports an authored target that does not exist.",

    "componentPreview.description":
      "Renders a component and its code on a documented surface, with optional bindings and sources.",
    "componentPreview.lede":
      "Joins the component's <strong>real render</strong> and its implementation on a single surface. The stage is a static <code>iframe srcdoc</code>: it creates no route, but it does get its own DOM, viewport and top layer. Below it, CodePreview shows the code.",
    "componentPreview.responsibilitiesTitle": "Responsibilities",
    "componentPreview.respItem1":
      "<strong>ComponentPreview</strong> owns the frame, the header, the rendered stage, and the binding or source panels.",
    "componentPreview.respItem2":
      "<strong>CodePreview</strong> owns every code surface: Shiki, copy, density, and long-block expansion.",
    "componentPreview.respItem3":
      "The frame lives at <code>about:srcdoc</code>. Toast, Dialog, Drawer, fixed styles and viewport queries resolve against the example, not against the documentation chrome.",
    "componentPreview.crossBody":
      "CSS and JavaScript do not cross the document boundary on their own. This site's adapter copies its stylesheets, syncs mode, contrast, radius and density, and runs the same Vanilla bootstrap inside the frame's realm. The content is authored and trusted; it is not used for arbitrary third-party HTML.",
    "componentPreview.minimalTitle": "Minimal anatomy",
    "componentPreview.minimalBody":
      "This example's stage is another ComponentPreview: the same <code>srcdoc</code>, one level deeper. The nested frame clones its parent's styles and mounts its own runtime, so reloading, dragging the edge, or switching color mode work at both levels at once.",
    "componentPreview.minimalNote": "inside a ComponentPreview",
    "componentPreview.flushBody":
      'Add <code>data-sk-component-preview-flush</code> to the iframe and its body when the component is a layout. Use <code>data-sk-component-preview-viewport="menu"</code> for listboxes and popovers, or <code>overlay</code> for dialogs, drawers and toasts. The reload button remounts the <code>srcdoc</code> (useful for count-ups and loaders). The tabs are regular <code>SegmentedControl</code>s.',
    "componentPreview.resizerBody":
      "The <code>resizer</code> is the stage's bottom edge, styled after a <code>textarea</code>'s handle: dragging it (or pressing <kbd class=\"sk-kbd\">↑</kbd> / <kbd class=\"sk-kbd\">↓</kbd> while it has focus) sets the height in <code>data-sk-component-preview-resized</code>. From then on the height belongs to the reader: the frame runtime stops auto-sizing it and switches its document to <code>overflow: auto</code>, so shrinking it shows a scrollbar instead of clipping the example. Double-clicking (or pressing <kbd class=\"sk-kbd\">Home</kbd>) returns the height to the content.",
    "componentPreview.screenTitle": "Screen size",
    "componentPreview.screenBody1":
      "<code>screens</code> adds a <strong>Free · Tablet · Mobile</strong> segmented control to the header. <em>Free</em> is the usual stage: full width, height fit to content. The two presets fix <strong>both width and height</strong>, because a device is both of those: a width-only preset shows the reflow but never what sits below the fold, which is half of what a small screen does to a layout.",
    "componentPreview.screenBody2":
      "The measurements deliberately fall on either side of the system's own breakpoints (<code>compact</code> at 36rem, <code>desktop</code> at 52rem): mobile at 390×844 sits below both, tablet at 768×1024 sits between them. That way the two presets exercise the bands where the layout actually changes, instead of being two arbitrary widths. They are in <code>px</code>, not <code>rem</code>, because a device's viewport is a physical measurement: someone who bumps the root font size wants to see <em>that</em> reflow on a phone screen, not a phone that grew.",
    "componentPreview.screenBody3":
      "The example below is a multicol <code>Grid</code> whose lanes are tied to exactly those breakpoints: one below <code>compact</code>, two from there on, three from <code>desktop</code>. Each preset lands in a different band, so all three look different. The media queries resolve against the <strong>frame's</strong> viewport, which is the preset's width: that is what the <code>iframe</code> buys that a container query on a plain <code>div</code> would not.",
    "componentPreview.screenNote": "3 free lanes · 2 on tablet · 1 on mobile",
    "componentPreview.screenBody4":
      "With an active preset the stage becomes a device: the runtime stops auto-sizing and the document scrolls inside it, just like on a real device. The resizer hides itself (the preset already owns the height, and two owners of the same height is the bug); switching back to <em>Free</em> returns the drag handle. The height caps at <code>80svh</code> so the code below stays reachable: the frame scrolls, so the only thing lost is the fidelity of the example's own <code>vh</code> units.",
    "componentPreview.screenBody5":
      'It ships <strong>on by default in every preview</strong> on the site. "Does this hold up on a phone?" is a question worth asking of any component, not only the ones that are obviously a layout: a button label wraps, a table overflows, a dialog does not fit. Leaving it to each page author\'s judgment would mean the answer lands exactly in the demos someone already thought hard about, the ones that were already fine.',
    "componentPreview.screenBody6":
      'The choice belongs <strong>to the document, not the preview</strong>, and is shared the same way the Vanilla | React preference is: changing it in one example changes it everywhere. It lives on <code>&lt;html data-sk-component-preview-screen-pref&gt;</code> and is saved in <code>localStorage["sk"].screen</code>, so it survives reloads and navigating between pages. The reason is the same as for the binding preference: the reader is asking the question <em>of the page</em>, not of one loose demo, and choosing again in every example that goes by would be exactly the work the shared preference exists to avoid. <em>Free</em> is the absence of the attribute, not a third value.',
    "componentPreview.screenBody7":
      "The three controls are icons from the stable vocabulary (<code>screen-desktop</code>, <code>screen-tablet</code> and <code>screen-mobile</code>), so every homologated set draws them. With no visible text, each option carries its name in <code>aria-label</code> and <code>title</code>: the glyph is decorative, exactly as in an icon-only Button.",
    "componentPreview.screenBody8":
      "It turns off per preview with <code>screens={false}</code>, for the cases where the preset misleads more than it informs.",
    "componentPreview.fullTitle": "The full example",
    "componentPreview.fullBody":
      "The whole surface, also nested: a header with a note, reload and binding tabs, the stage, the resizer, and a CodePreview per binding. The inner tabs are independent of the outer ones: the Vanilla | React preference is shared per document, and the frame is its own document.",
    "componentPreview.fullNote": "the full surface",
    "componentPreview.bareTitle": "The portable part",
    "componentPreview.bareBody1":
      "Everything above (the Vanilla/React switch, the screen presets, the tree compiler that builds each stage) is THIS site's own machinery for comparing two bindings of ANOTHER component. None of it is something a consumer would compose into their product.",
    "componentPreview.bareBody2":
      "What is portable: a title with its note, a stage showing what is being demonstrated, and its code underneath, composed from <code>CodePreview</code> rather than reimplemented. That is <code>ComponentPreview.bare</code>: the same root and the same parts with less anatomy, just like <code>Popover.bare</code>.",
    "componentPreview.mountTitle": "Mounting explicitly",
    "componentPreview.mountBody":
      "ComponentPreview and CodePreview stay outside <code>initComponents()</code>: an application does not download documentation surfaces by accident. That mount controls the host surface; the <code>srcdoc</code> content runs its own entry point.",
    "componentPreview.frameMountLabel": "runtime inside the srcdoc",
    "componentPreview.test1": "Switches binding and mounts the nested Vanilla source panel idempotently.",
    "componentPreview.test2": "Shares the Vanilla | React toggle across every preview on the page.",
    "componentPreview.test3":
      "Cycles free → tablet → mobile → free on click, marking the stage and clearing it for free.",
    "componentPreview.test4": "Reloads the srcdoc stage from the authored document.",

    "datePicker.description":
      "A single or range date field, with a native type=date and a custom calendar behind a trigger.",
    "datePicker.lede":
      "Two versions, one field. The <strong>native</strong> one is an <code>&lt;input type=\"date\"&gt;</code> with the system's own chrome: keyboard, form handling and the OS calendar come from the platform, no JavaScript. The <strong>custom</strong> one mounts a <a href=\"/en/components/calendar\">Calendar</a> behind a trigger with the same field shape, for when you need a range, an explicit locale, or a calendar that looks the same across browsers. Both share <code>.sk-date-picker__control</code>, so they look alike. The calendar itself (header, views, grids) is Calendar's responsibility, not this component's: DatePicker only nests it inside its popover.",
    "datePicker.nativeTitle": "Native",
    "datePicker.nativeBody": "The platform's own control, no JavaScript, no enhancer.",
    "datePicker.nativeLabel": "Native DatePicker",
    "datePicker.customTitle": "Custom",
    "datePicker.customBody": "The custom field and its popover calendar live in their own demo.",
    "datePicker.customLabel": "Custom DatePicker",
    "datePicker.disabledTitle": "Disabled",
    "datePicker.disabledBody":
      "<code>data-disabled</code> on the root configures the machine, and Zag hands the state out on its own: <code>data-disabled</code> on <code>sk-date-picker__control</code>, and a native <code>disabled</code> on the input and the trigger. But each of those three read its color/background/border from a hook (<code>--sk-date-picker-fg</code>/<code>-bg</code>/<code>-border-color</code>) declared with no condition, so disabling the field changed nothing those hooks resolved to: the field kept reading as interactive. The rule now lives in one place, <code>.sk-date-picker__control[data-disabled]</code>, which rewrites those three hooks: the input and the trigger inherit them with no rules of their own.",
    "datePicker.disabledLabel": "DatePicker (disabled)",
    "datePicker.whichTitle": "Which to use",
    "datePicker.whichBody":
      "Start with the <strong>native</strong> one: it is the one that works with no JS and the one the operating system already knows how to present on every platform. Move up to <strong>custom</strong> only once native falls short: <em>range</em> selection, a timezone and a locale that cannot stay an ambiguous string, or a calendar that looks the same across browsers. It is the same decision as native Select vs. custom Select.",
    "datePicker.contractBody":
      'React offers <code>DatePicker</code> over the same machine as <code>Calendar</code> (<code>@zag-js/date-picker</code>), and reuses the same calendar body: there is no second grid implementation. Vanilla hydrates the authored <code>data-sk-date-picker</code>: it patches the control and renders the calendar with Calendar\'s own shared component. The native <code>type="date"</code> input needs no enhancer.',
    "datePicker.mobileTitle": "On mobile",
    "datePicker.mobileBody":
      'Below the desktop breakpoint (30rem) the custom calendar stops hanging off the field and becomes a <strong>bottom sheet</strong>: the positioner fills the screen as a scrim, and the content anchors to the bottom edge, full width, and rises. It takes the Vaul\'s <em>look</em>, not its drag (this is a Zag popover, not a native <code>&lt;dialog&gt;</code>), but it closes the same way, on an outside tap or <kbd class="sk-kbd">Esc</kbd>. It is the same responsive cut as <a href="/en/components/dialog">Dialog Vaul</a>.',
    "datePicker.a11yBody":
      'The date uses <code>DateValue</code> values and an explicit timezone; it is never modeled as an ambiguous locale string. The control keeps an accessible name through its <code>label</code>. The grid\'s own accessibility (role, keyboard navigation, view switching) is <a href="/en/components/calendar">Calendar</a>\'s contract.',
    "datePicker.test1": "Refuses markup that is missing a part it must patch.",
    "datePicker.test2": "Patches the authored control and renders the popover around a calendar.",
    "datePicker.test3": "Fills the field with the day the reader picked.",

    "drawer.description": "A Vaul on the inline edge, running the full height of the screen. Ships hooks and no structure.",
    "drawer.lede":
      'A drawer <strong>is</strong> a <a href="/en/vaul">Vaul</a> on the inline edge, running the full height of the screen. That sentence is the whole component: the edge, the slide, the backdrop, the drag and the top layer belong to the pattern, and this file only says <em>which Vaul is a drawer</em> and how it looks.',
    "drawer.hooksTitle": "Ships hooks and no structure",
    "drawer.hooksBody1":
      "By the system's own rule: every line of structure a drawer could have is structure a bottom sheet would need identically, and that shared structure <strong>is</strong> the pattern. A drawer that reimplemented the panel would be a second Vaul under another name.",
    "drawer.hooksBody2":
      "The drawer's hooks <strong>are</strong> the Vaul's, redeclared. A consumer tunes <code>--sk-drawer-*</code> and never learns there is a Vaul underneath: the pattern stays an implementation detail instead of a second public surface to keep in sync.",
    "drawer.whenTitle": "When it is a drawer and when it is not",
    "drawer.whenHeadNeed": "You need",
    "drawer.whenHeadUse": "Use",
    "drawer.whenRow1Need": "Side navigation or filters, full height",
    "drawer.whenRow1Use": "<code>sk-drawer</code>",
    "drawer.whenRow2Need": "A sheet that rises from the bottom on mobile",
    "drawer.whenRow2Use": '<a href="/en/components/dialog">Dialog</a> (Vaul option)',
    "drawer.whenRow3Need": "A centered box",
    "drawer.whenRow3Use": '<a href="/en/components/dialog">Dialog</a>',
    "drawer.whenRow4Need": "A permanent rail that never covers the page",
    "drawer.whenRow4Use": '<a href="/en/components/sidebar">Sidebar</a>',
    "drawer.whenBody":
      'The sidebar and the drawer do not compete: a <a href="/en/components/sidebar">sidebar</a> is a shell that lives in the layout, and a drawer is modal and covers the page. This site uses both, the rail above 52rem, the drawer below, with <strong>a single</strong> nav-list inside either one.',
    "drawer.markupTitle": "Markup contract",
    "drawer.markupBody":
      "The root carries <code>sk-vaul sk-drawer</code> over a native <code>&lt;dialog&gt;</code>, which Vaul requires, plus its <code>data-edge</code>. The handle is optional: without it there is no drag, and the drawer is still complete.",
    "drawer.nativeTitle": "Native drawer",
    "drawer.nativeLede":
      'The same surface can stay on the platform. Keep <code>&lt;dialog class="sk-vaul sk-drawer"&gt;</code>, skip <code>data-sk-vaul</code>, and open it with <code>showModal()</code>: no enhancer, drag, or light-dismiss loads.',
    "drawer.nativeBody":
      "<code>&lt;form method=\"dialog\"&gt;</code> closes with no listener of its own; Escape, focus, an inert page, backdrop and restoration all belong to the browser. The styles and the transition stay the same, because they live in Core, not in the enhancer.",
    "drawer.nativeLabel": "Native drawer",
    "drawer.openTitle": "Opening it",
    "drawer.nativeContractTitle": "Native contract",
    "drawer.nativeContractItem1": "The root is still a <code>&lt;dialog&gt;</code> opened with <code>showModal()</code>.",
    "drawer.nativeContractItem2": "Without <code>data-sk-vaul</code>, the auto-loader mounts nothing.",
    "drawer.nativeContractItem3": "Without a handle, no drag interaction that doesn't exist gets announced.",
    "drawer.nativeContractItem4": "The enhancer is only needed for drag-to-dismiss and light-dismiss.",
    "drawer.compositionComment": "a drawer IS a Vaul",
    "drawer.compositionComment2": "touches three edges of the viewport: a radius there\n     reads as a bug",
    "drawer.demoOpenLabel": "Open native drawer",
    "drawer.demoPanelTitle": "Native panel",
    "drawer.demoPanelBody": "The platform owns modality, focus, Escape and restoration.",
    "drawer.demoCloseLabel": "Close",
    "drawer.demoAriaLabel": "Example native drawer",
    "drawer.test1": "Adds the drawer modifier only for the drawer signature.",

    "emptyState.description": "Explains why there is no content and offers a concrete next action.",
    "emptyState.contractBody": "The title names the state, the description explains, and the action resolves it. Do not use EmptyState during loading.",
    "emptyState.a11yBody": "The icon is decorative; the text and the action carry the meaning without depending on an illustration.",

    "fileUploadPage.description": "Selection and drag-and-drop with limits, rejection, and a file list.",
    "fileUploadPage.contractBody": "Vanilla emits sk-file-change and never invents a remote upload. React exposes accepted and rejected files.",
    "fileUploadPage.a11yBody": "The real input stays available to forms and assistive technology; the dropzone does not replace it.",

    "flyout.description": "Flyout: pick a value like Select, with the panel opening beside the trigger.",
    "flyout.lede1":
      'A value picker like <a href="/en/components/select">Select</a>, but the panel opens at the trigger\'s <strong>inline-end</strong> (not below it). Built for narrow rails (the <a href="/en/customize">Customize</a> sidebar, say) where a menu opening downward would not fit.',
    "flyout.lede2":
      "It is not a navigation \"menu\" (ADR-0017): it is a picker. It opens on <strong>click</strong> of the trigger (and by keyboard). Picking an item emits <code>sk-value-change</code> and closes. Escape or a click outside also close it. Only one Flyout can be open at a time.",
    "flyout.whenTitle": "When to use it",
    "flyout.whenItem1":
      "<strong>Flyout</strong>: space below the control is scarce (sidebar, toolbar, rail) and the panel needs to open to the side.",
    "flyout.whenItem2":
      '<strong>Select</strong>: there is room below, you want typeahead / Zag positioning, or it is a standard form. For a native platform choice, use the <a href="/en/components/select#native-select">native Select</a>.',
    "flyout.behaviorTitle": "Behavior",
    "flyout.behaviorItem1":
      "<strong>Open:</strong> click on the trigger, or keyboard (<code>Enter</code>, <code>Space</code>, <code>ArrowDown</code>, <code>ArrowRight</code>). It does not open on hover.",
    "flyout.behaviorItem2":
      "<strong>Pick:</strong> click or <code>Enter</code> / <code>Space</code> on an item. It emits <code>sk-value-change</code> with <code>{\"{ value: string[] }\"}</code> and closes.",
    "flyout.behaviorItem3": "<strong>Close:</strong> Escape (returns focus to the trigger), a click outside, or picking an item.",
    "flyout.behaviorItem4":
      "<strong>Exclusive:</strong> opening one makes the others, which listen for <code>sk-flyout-open</code>, close.",
    "flyout.behaviorItem5":
      "<strong>Width:</strong> the panel measures at least <code>280px</code> and grows with the longest item (capped by the viewport).",
    "flyout.behaviorItem6":
      "<strong>Viewport:</strong> if it does not fit at inline-end, it opens at inline-start; the top adjusts to stay inside the viewport (also on scroll or resize).",
    "flyout.anatomyTitle": "Anatomy",
    "flyout.anatomyBody":
      "The items <strong>are</strong> the collection: the enhancer reads them off the DOM. Every <code>data-sk-flyout-item</code> needs a <code>data-value</code>. The panel lives on the root (<code>position: absolute</code> by default; the enhancer pins it to <code>position: fixed</code> when an ancestor clips it).",
    "flyout.vanillaInitTitle": "Initializing Vanilla",
    "flyout.listenTitle": "Listening for the change",
    "flyout.railTitle": "On a narrow rail",
    "flyout.railBody":
      "The typical case: a control about 13.5rem wide. The panel opens at inline-end and does not compete with the rail's own height.",
    "flyout.railLabel": "Flyout on a rail",
    "flyout.exclusiveTitle": "Only one open",
    "flyout.exclusiveBody":
      "Open one and then the other: the first closes on its own. Same contract in Vanilla and React, through the document-level <code>sk-flyout-open</code> event.",
    "flyout.exclusiveLabel": "Two Flyouts",
    "flyout.disabledItemTitle": "Disabled item",
    "flyout.disabledItemBody":
      "Mark the item with <code>data-disabled</code> (or <code>disabled: true</code> in React). It cannot be picked; the rest stay active.",
    "flyout.disabledItemLabel": "Disabled item",
    "flyout.disabledTitle": "Disabled Flyout",
    "flyout.disabledBody": "<code>data-disabled</code> on the root (or <code>disabled</code> in React) blocks opening and value changes.",
    "flyout.disabledLabel": "Disabled Flyout",
    "flyout.longTitle": "Long list",
    "flyout.longBody":
      "The panel caps its own height (<code>--sk-flyout-panel-max-block-size</code>, 18rem by default) and scrolls once it needs to.",
    "flyout.longLabel": "Long list",
    "flyout.placeholderTitle": "Placeholder",
    "flyout.placeholderBody":
      'With no <code>data-value</code> matching an item (an external "custom" value, say) the trigger shows the placeholder.',
    "flyout.placeholderLabel": "Placeholder",
    "flyout.remountTitle": "Remounting with another value",
    "flyout.remountBody":
      'The enhancer owns the trigger\'s text. To force a value from outside (reset, URL, repair), unmount, write <code>data-value</code>, and mount again — the same pattern <a href="/en/customize">Customize</a> uses.',
    "flyout.contractItem1": "The root carries <code>data-sk-flyout</code> and the documented parts anatomy.",
    "flyout.contractItem2":
      "The value event is the same as Select's: <code>sk-value-change</code> with <code>{\"{ value: string[] }\"}</code>.",
    "flyout.contractItem3": "Exclusive opening through <code>sk-flyout-open</code> (detail <code>{\"{ root }\"}</code>).",
    "flyout.contractItem4": "No Zag machine in v1: its own enhancer, opening by click/keyboard.",
    "flyout.contractItem5": "React renders the same contract with no portal (the panel stays on the root).",
    "flyout.contractItem6": "The enhancer invents no classes; it only wires up the authored nodes.",
    "flyout.test1": "Opens on click and keeps ARIA + the value text in sync.",
    "flyout.test2": "Closes on Escape.",
    "flyout.test3": "Keeps only one flyout open at a time.",
    "flyout.test4": "Flips the panel to inline-start when the end side overflows the viewport.",

    "grid.description": "Grid: equal columns with a named gap and semantics chosen by whoever uses it.",
    "grid.lede":
      "An equal-column grid for groups of content. Every column uses <code>minmax(0, 1fr)</code>: it keeps the intrinsic minimum size from widening the columns.",
    "grid.multicolTitle": "CSS Multi-column Layout",
    "grid.multicolBody1":
      '<a href="https://www.w3.org/TR/css-multicol-1/">CSS Multi-column Layout Module Level 1</a> calls this flow <strong>multi-column layout</strong>. <code>data-multicol</code> turns on CSS columns: every card finishes before breaking, and the next one continues in the same lane.',
    "grid.multicolBody2":
      '<code>data-columns</code> sets the maximum number of lanes. With <code>data-columns="4"</code>, the collection uses 1 lane below <code>36rem</code>, 2 from <code>36rem</code>, 3 from <code>52rem</code>, and 4 from <code>72rem</code>. Values <code>1</code>, <code>2</code>, and <code>3</code> stop at that ceiling.',
    "grid.multicolLabel": "Multi-column layout",
    "grid.multicolBody3":
      "Columns fill one lane top to bottom before moving to the next. It keeps a useful DOM order, so use it for independent cards, not for a sequence whose left-to-right visual order carries meaning.",
    "grid.htmlTitle": "Authored HTML",
    "grid.htmlBody": "Choose the semantic element, such as <code>section</code>, and apply <code>sk-grid</code>. No vanilla initialization needed.",
    "grid.reactBody": "The <code>as</code> prop keeps that semantic choice.",
    "grid.contractItem1":
      "<code>sk-grid</code> creates an equal-column grid; <code>data-columns</code> accepts <code>1</code>, <code>2</code>, <code>3</code>, or <code>4</code>.",
    "grid.contractItem2":
      "<code>data-gap</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, or <code>xl</code>; the default is <code>md</code>.",
    "grid.contractItem3":
      "<code>data-multicol</code> turns on the column-flowing card wall. <code>data-columns</code> sets its lane ceiling: 1 → 2 → 3 → 4 at the <code>36rem</code>, <code>52rem</code>, and <code>72rem</code> breakpoints. In React it is passed as <code>data-multicol</code>.",
    "grid.contractItem4": "In React, <code>Grid</code> takes <code>as</code>, <code>columns</code>, and <code>gap</code>; <code>columns</code> defaults to <code>1</code>.",
    "grid.test1": "Renders Stack, Inline and Grid as the documented layout contracts.",
    "layoutGridPage.description":
      "Layout Grid: one page flow with narrow, content, breakout, and full-width measures.",
    "layoutGridPage.lede":
      "Layout Grid gives one content flow four named widths. The root keeps its semantics —it can be <code>main</code>, <code>article</code>, or a section— and each direct child chooses another measure only when it needs one with <code>data-width</code>.",
    "layoutGridPage.exampleKicker": "Publishing guide",
    "layoutGridPage.exampleTitle": "A guide that reads from start to finish",
    "layoutGridPage.exampleIntro":
      "A clear page turns a complex decision into a path readers can follow.",
    "layoutGridPage.exampleFirstSectionTitle": "First, define the story",
    "layoutGridPage.exampleFirstSectionBody":
      "Hierarchy and rhythm bring each section forward at the right moment.",
    "layoutGridPage.exampleHeroKicker": "Product update",
    "layoutGridPage.exampleHeroTitle": "A decision needs room to breathe",
    "layoutGridPage.exampleHeroBody":
      "The background changes context without releasing the reading flow.",
    "layoutGridPage.exampleSecondSectionTitle": "Then, support the decision",
    "layoutGridPage.exampleSecondSectionBody":
      "The same measure keeps reading steady while the content gains importance.",
    "layoutGridPage.exampleFooter":
      "Skryensya UI · A system for thoughtful interfaces.",
    "layoutGridPage.levelsTitle": "Four widths, one flow",
    "layoutGridPage.levelsBody":
      "Without an attribute, every direct child lives in <code>content</code>. Add <code>data-width</code> only when an element needs another measure; there is no wrapper per level.",
    "layoutGridPage.levelNarrow": "Prose, summaries, or forms with a concentrated reading measure.",
    "layoutGridPage.levelContent": "The default measure for primary content.",
    "layoutGridPage.levelBreakout": "Figures, tables, or groups that need more inline room.",
    "layoutGridPage.levelFullWidth": "Backgrounds, borders, or media that reach the grid edge.",
    "layoutGridPage.fullWidthTitle": "Full width without releasing content",
    "layoutGridPage.fullWidthBody":
      "A direct <code>full-width</code> child becomes a grid with the same columns. Its direct children return to <code>content</code> by default and may use <code>narrow</code>, <code>breakout</code>, or <code>full-width</code> again.",
    "layoutGridPage.htmlTitle": "Semantic HTML",
    "layoutGridPage.htmlBody":
      "The class defines geometry only. Choose <code>main</code>, <code>section</code>, <code>figure</code>, and every other element for its meaning; <code>data-width</code> accepts only <code>narrow</code>, <code>content</code>, <code>breakout</code>, or <code>full-width</code>.",
    "layoutGridPage.reactBody":
      "In React, <code>LayoutGrid</code> only renders <code>sk-layout-grid</code>; children keep their elements and the same <code>data-width</code>.",
    "layoutGridPage.configTitle": "Public configuration",
    "layoutGridPage.configBody1":
      "The four public custom properties live on the root and can be overridden per page or section.",
    "layoutGridPage.configBody2":
      "Keep <code>narrow ≤ content ≤ breakout</code>. Intermediate tracks are calculated from those differences; reversing their order does not describe a valid measure.",
    "layoutGridPage.test1":
      "Renders LayoutGrid without taking over its children's semantics or data-width.",

    "heading.description": "Heading: semantic hierarchy and visual size, independent of each other.",
    "heading.lede":
      "Heading separates the document's hierarchy from its appearance. Choose <code>as</code> for the semantic level and <code>size</code> for whatever size the visual context needs.",
    "heading.sizesTitle": "Sizes",
    "heading.sizesBody":
      "Three displays sit above the document scale. In the document, <code>h1</code>–<code>h4</code> step down in size; <code>h5</code> and <code>h6</code> share <code>h4</code>'s floor (18px).",
    "heading.displayTitle": "Display",
    "heading.displayLabel": "Display scale",
    "heading.documentTitle": "Document",
    "heading.documentLabel": "h1–h6 scale",
    "heading.pageTitleTitle": "Page title",
    "heading.pageTitleBody": "The one <code>h1</code> presents the page; a display size adds presence without inventing another semantic level.",
    "heading.pageTitleLabel": "Page title",
    "heading.outlineTitle": "Section hierarchy",
    "heading.outlineBody": "The structure moves from <code>h2</code> to <code>h3</code>; the visual size can follow the level.",
    "heading.outlineLabel": "Content hierarchy",
    "heading.compactTitle": "Compact hierarchy",
    "heading.compactBody": "A heading keeps its place in the document even when the visual context uses the <code>h4</code> floor.",
    "heading.compactLabel": "Compact heading",
    "heading.flushTitle": "Flush",
    "heading.flushBody":
      "<code>data-flush</code> (React: <code>flush</code>) strips block space, top and bottom. It is explicit opt-in: use it when the heading is the first (or last) thing in its container (a dialog title with <code>sk-dialog__title</code>, a card header) and you do not want the margin or padding pushing it away from the edge. It is never inferred from <code>:first-child</code>.",
    "heading.flushLabel": "Flush heading",
    "heading.contractItem1":
      "<code>data-size</code> accepts <code>display-lg</code>, <code>display-md</code>, <code>display-sm</code>, <code>h1</code>, <code>h2</code>, <code>h3</code>, <code>h4</code>, <code>h5</code>, and <code>h6</code>. <code>h5</code>/<code>h6</code> paint the same as <code>h4</code>.",
    "heading.contractItem2": "Legacy aliases: <code>sm</code>→<code>h3</code>, <code>md</code>→<code>h2</code>, <code>lg</code>→<code>h1</code>, <code>display</code>→<code>display-sm</code>.",
    "heading.contractItem3": "In HTML, use <code>h1</code>–<code>h6</code> for the document hierarchy; <code>data-size</code> does not change it.",
    "heading.contractItem4": "In React, <code>as</code> accepts <code>h1</code>–<code>h6</code> (default <code>h2</code>); <code>size</code> defaults to <code>h2</code>.",
    "heading.contractItem5": "<code>data-flush</code> / React <code>flush</code>: no block margin or padding (top and bottom). Explicit; never automatic.",
    "heading.contractItem6": "Needs no vanilla initialization.",
    "heading.test1": "Separates heading hierarchy from its visual size.",
    "heading.test2": "Opts into flush with an explicit attribute, not by position.",
    "heading.test3": "Floors h5 and h6 visual size at h4.",

    "iconPage.description":
      "Icon: the sk-icon pattern in React and vanilla, with vocabulary roles, your own geometry, sizes, and a11y at the call site.",
    "iconPage.lede":
      'How you put an icon on screen: <code>&lt;Icon&gt;</code> in React, <code>data-sk-icon</code> + <code>mountIcons</code> in vanilla, or a hand-written <code>&lt;svg class="sk-icon"&gt;</code>. The role vocabulary, sets as a brand choice, and why the CSS never touches fill/stroke live in <a href="/en/icons">Iconography</a>.',
    "iconPage.reactTitle": "React",
    "iconPage.reactBody1":
      "<code>Icon</code> takes <code>name</code> <strong>or</strong> <code>data</code>, never both. <code>name</code> is a portable role that survives a set change; <code>data</code> is your own geometry, deliberately coupled and visible at the call site.",
    "iconPage.reactNote": "React renders it (decision 14)",
    "iconPage.reactBody2":
      '<code>&lt;Icon name="…"&gt;</code> draws with no configuration: Phosphor ships with <code>@skryensya/react</code>. For a different set, install it and wrap the app once.',
    "iconPage.providerNote": "Lucide/Material are opt-in",
    "iconPage.providerLabel": "switching the default set",
    "iconPage.vanillaTitle": "Vanilla: hydrate by name, or write the markup",
    "iconPage.vanillaBody1":
      "<code>mountIcons(root, set)</code> replaces a placeholder carrying the role's <strong>name</strong> with the same <code>&lt;svg class=\"sk-icon\"&gt;</code> you would write by hand. The set is always explicit; for two sets on one page, hydrate each subtree with its own.",
    "iconPage.vanillaHydrateNote": "you write the name, not the <svg>",
    "iconPage.vanillaBindLabel": "once, at startup",
    "iconPage.vanillaBindNote": "mountIcons does not call initComponents()",
    "iconPage.vanillaBody2":
      "A <code>data-sk-icon</code> the set does not cover is left untouched, with a warning: the <strong>project's</strong> own geometry is not a role, and gets written as its own <code>&lt;svg&gt;</code>.",
    "iconPage.vanillaRawLabel": "your own geometry, by hand",
    "iconPage.vanillaRawNote": "for a drawing no set has",
    "iconPage.a11yItem1":
      "<strong>With no <code>label</code> the icon is decorative</strong>, carrying <code>aria-hidden=\"true\"</code>. This is the normal case: in a button with text, the text already names the action.",
    "iconPage.a11yItem2":
      '<strong>In an icon-only button, the accessible name belongs to the button</strong> (<code>aria-label="Close dialog"</code>), not the <code>&lt;svg&gt;</code>. The icon inside stays decorative.',
    "iconPage.a11yItem3":
      "<strong>With a <code>label</code> the icon is content</strong>, <code>role=\"img\"</code> plus <code>aria-label</code>. Only when the icon stands alone and means something on its own.",
    "iconPage.a11yItem4": "<code>focusable=\"false\"</code> always: an <code>&lt;svg&gt;</code> is not a tab stop.",
    "iconPage.sizeTitle": "Size",
    "iconPage.sizeBody":
      "Three values off <strong>one</strong> hook. <code>--sk-icon-size</code> is invariant to density: density is spacing; an icon is content beside a glyph — if the text does not shrink, neither does the icon.",
    "iconPage.sizeLabel": "Icon · sm / md / lg",
    "iconPage.sizeNote": "no numeric prop",
    "iconPage.test1": "Resolves a stable name against the bound set.",
    "iconPage.test2": "Renders project geometry without any binding.",
    "iconPage.test3": "Is decorative without a label, and content with one.",

    "imageFrame.description": "ImageFrame: a frame that crops and positions media with aspect-ratio, object-fit and object-position.",
    "imageFrame.lede":
      'ImageFrame is the <strong>media frame</strong>: a box that fixes an aspect ratio, crops with a radius/border, and decides how the image fills it (<code>object-fit</code>) and from where (<code>object-position</code>). It is not a CDN image component or an Avatar: it is the pattern Card, Tile, and galleries reuse instead of copying <code>aspect-ratio</code> by hand. For type over the photo, compose with <a href="/en/gradients">Gradients</a> (<code>sk-media-gradient</code>).',
    "imageFrame.aspectTitle": "Aspect",
    "imageFrame.aspectBody":
      "<code>data-aspect</code> is the box, not the file. With <code>cover</code> (the default) the media fills and gets cropped; with <code>auto</code> the frame follows the media's own intrinsic size.",
    "imageFrame.fitTitle": "Fit",
    "imageFrame.fitBody":
      "Same <code>1/1</code> box, different <code>data-fit</code>: <code>cover</code> crops, <code>contain</code> letterboxes (the frame's own background shows), <code>fill</code> stretches.",
    "imageFrame.positionTitle": "Position",
    "imageFrame.positionBody":
      "With <code>cover</code>, <code>data-position</code> picks the crop's anchor. The demo puts a disc in the top-left and a block in the bottom-right so the anchor stands out.",
    "imageFrame.reactBody":
      '<code>src</code> / <code>alt</code> paint an <code>img</code> with the media class. For <code>picture</code> or <code>video</code>, pass children with <code>className="sk-image-frame__media"</code> (or leave the <code>img</code>/<code>video</code> as a direct child: the CSS reaches those too).',
    "imageFrame.contractItem1":
      "Root: <code>sk-image-frame</code>. Media: <code>sk-image-frame__media</code>, or a direct-child <code>img</code>/<code>video</code>/<code>picture &gt; img</code>.",
    "imageFrame.contractItem2":
      "<code>data-aspect</code>: <code>auto</code>, <code>1/1</code>, <code>4/3</code>, <code>3/2</code>, <code>16/9</code>, <code>3/4</code>, <code>2/3</code>, <code>9/16</code>.",
    "imageFrame.contractItem3":
      "<code>data-fit</code>: <code>cover</code> (default), <code>contain</code>, <code>fill</code>, <code>none</code>, <code>scale-down</code>.",
    "imageFrame.contractItem4":
      "<code>data-position</code>: <code>center</code> (default), <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>, and the four corners (<code>top-left</code>, …).",
    "imageFrame.contractItem5":
      "<code>data-radius</code>: <code>none</code>, <code>top</code>, <code>control</code>, <code>surface</code>, <code>pill</code> (default).",
    "imageFrame.contractItem6": "<code>data-border</code>: <code>none</code> (default), <code>subtle</code>, <code>default</code>.",
    "imageFrame.contractItem7":
      "Hooks: <code>--sk-image-frame-aspect</code>, <code>--sk-image-frame-fit</code>, <code>--sk-image-frame-position</code>, <code>--sk-image-frame-radius</code>, <code>--sk-image-frame-border-*</code>, <code>--sk-image-frame-bg</code>.",
    "imageFrame.test1": "Maps geometry props to data attributes on the authored root.",
    "imageFrame.test2": "Renders a media img from src/alt when children are omitted.",
    "imageFrame.test3": "Keeps a caption beside the src media.",

    "inputPage.description": "Input: the native text control, with one class for the input and the textarea.",
    "inputPage.title": "Input",
    "inputPage.lede":
      "The native text control stays native: there is no machine, and no bordered <code>div</code> pretending to be an input. The platform keeps validation, autofill, IME, and form association.",
    "inputPage.densityBody": 'Density compacts the space around the field, not its interaction area: Input keeps a minimum height of <code>44px</code>, even with <code>data-size="sm"</code>.',
    "inputPage.oneClassTitle": "One class for every text control",
    "inputPage.oneClassBody":
      "<code>sk-input</code> goes on both the <code>&lt;input&gt;</code> and the <code>&lt;textarea&gt;</code>: it is the same visual control, so it is one set of hooks. A second class would be a second set to keep in sync with the first.",
    "inputPage.formFieldTitle": "The label is not the Input's",
    "inputPage.formFieldBody":
      'Both demos above are wrapped in a <a href="/en/components/form-field">FormField</a>, and not out of habit: the label, the hint, the error message and the six ids that tie them together all live there. That is why this contract has no <code>invalid</code> and no <code>id</code> of its own — a control carrying its own <code>aria-invalid</code> could contradict the message sitting next to it. An <code>Input</code> outside a <code>FormField</code> is still a valid control, as long as it carries its own <code>aria-label</code>.',
    "inputPage.nativeTitle": "NativeInput: the control without the appearance",
    "inputPage.nativeBody":
      'The contract\'s third signature is <code>NativeInput</code>: the same element without <code>sk-input</code>, for when what you are teaching is the behaviour the browser ships rather than the system\'s appearance. It is what the plain <code>&lt;input type="time"&gt;</code> demo on TimeField uses.',
    "inputPage.test1": "Stays a valid control outside a FormField.",
    "inputPage.test2": "Gives a textarea the same appearance contract as an input.",
    "inputPage.test3": "Writes the height to data-size and leaves the native size attribute alone.",

    "formFieldPage.description":
      "FormField: the chrome around any control — label, hint, error — and the six ids that tie them together.",
    "formFieldPage.title": "FormField",
    "formFieldPage.lede":
      "A field is chrome plus a control, and what binds them is six ids. Written by hand, every one of them is a chance to be silently wrong: a mistyped <code>aria-describedby</code> shows nothing on screen and breaks every screen reader that reads the form.",
    "formFieldPage.wiringTitle": "Six ids from one name",
    "formFieldPage.wiringBody":
      "The label points at the control, the control points back at the hint and the error, and each of those carries the id being pointed at. The contract derives all of them from the field's own id: neither binding invents one, which is why React's ids (<code>useId</code>) and the emitter's (a slug) can differ without the relationship changing.",
    "formFieldPage.independentTitle": "Independent of Input, on purpose",
    "formFieldPage.independentBody":
      "<code>sk-form-field</code> is the chrome around <em>any</em> control: it wraps a select or a textarea just as well, as below. Naming it after whichever control it most often holds would turn into a lie the first time it holds another — which is why its <code>children</code> slot accepts any signature and the wiring points at <code>\"control\"</code> rather than at an input.",
    "formFieldPage.errorTitle": "The error is text, not a color",
    "formFieldPage.errorBody":
      "The <em>presence</em> of the message is what makes the field invalid: there is no separate <code>invalid</code> option that could fall out of step with it. <code>--sk-form-field-error-fg</code> tints a message that has to exist anyway, and <code>aria-invalid</code>, which you already write for screen readers, is what the <code>--sk-input-border-color</code> hook follows. Color is never the only error signal (WCAG 1.4.1).",
    "formFieldPage.avoidTitle": "When not to use it",
    "formFieldPage.avoidBody":
      "When the control carries no visible label: there the control itself carries its <code>aria-label</code> and there is no field. And when the control already brings its own label wired by its machine — NumberField, TimeField, Combobox — wrapping it would add a second <code>for</code> competing with the first.",
    "formFieldPage.reactBody":
      "In React, <code>FormField</code> does the wiring you write by hand in markup: it generates the <code>id</code>, assembles the <code>aria-describedby</code> for the hint and the error, and passes <code>required</code> and <code>disabled</code> to the native control. It is imported from <code>@skryensya/react/form-field</code>, its own module, and any control can read that context — which is the alternative to each of them growing its own copy of the wiring.",
    "formFieldPage.a11yBody":
      "The <code>required</code> asterisk is decorative (<code>aria-hidden</code>): what actually says it is the control's <code>required</code> attribute, because \"required\" has to survive being read aloud. The hint and the error are announced through <code>aria-describedby</code> in that order, and only what exists is pointed at: with no error written there is no <code>aria-invalid</code>, because an attribute pointing at a message nobody wrote describes something that is not there.",
    "formFieldPage.test1": "Wires the label, hint and error to the control it wraps.",
    "formFieldPage.test2": "The error message is what makes the field invalid.",
    "formFieldPage.test3": "Passes required and disabled to the native control.",
    "formFieldPage.test4": "Wires a textarea exactly as it wires an input.",
    "formFieldPage.test5": "Passes axe with a hint and an error at once.",

    "skipLink.description":
      "SkipLink: the first link in the document, invisible until it is focused, for bypassing the chrome that repeats.",
    "skipLink.lede":
      'SkipLink is the <strong>first link in the document</strong> and the one component whose success looks like absence: someone reading with a pointer never learns it is there. Every page opens with the same chrome — the brand, the global navigation, the search trigger — and someone reading with a keyboard walks through all of it before reaching what they came for, on every page. That is what <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.4.1 calls a block to bypass. This link is the bypass, and it is the platform\'s own: an <code>href</code> to an id on the same page, so it works before a single script has run.',
    "skipLink.demoContentLabel": "Go to content",
    "skipLink.demoNavLabel": "Go to navigation",
    "skipLink.tryItBody":
      'This site uses two: press <kbd class="sk-kbd">Tab</kbd> with focus at the top of this page and “Go to content” appears in the upper-left corner; one more Tab and “Go to navigation” takes its place. The same happens in the preview below, inside its frame: the link has been there since the first render, it is just one pixel wide until you focus it.',
    "skipLink.severalTitle": "There may be more than one, and the order is the decision",
    "skipLink.severalBody1":
      "A page with a persistent index reasonably offers two: one to the content and one to the navigation. They are not a group and not a list: they are two loose links that happen to be the first two things in the document, which is why the signature takes <em>one</em> destination rather than a collection. With a collection, the common case — exactly one — would have to be written as an array, and the order would live inside an option where nobody looks.",
    "skipLink.severalBody2":
      "The first one is what everybody gets, so it has to answer the question most readers arrived with, and that question is almost always “let me read this page”, not “take me somewhere else”. That is why content comes first. A reader who did want the index is one more Tab away; the other way round, a reader who wanted the page would pay several.",
    "skipLink.severalLabel": "Both, in order",
    "skipLink.severalBody3":
      'Only the focused one is visible: they share the frame\'s corner and take turns, so the preview above needs two presses of <kbd class="sk-kbd">Tab</kbd> to show both. The Stack around them is the demo\'s, not the pattern\'s: a usage tree has one root and these are siblings. In a real document they sit loose at the top of the <code>&lt;body&gt;</code>, as the HTML shows.',
    "skipLink.targetTitle": "The destination has to be focusable",
    "skipLink.targetBody1":
      "It is the half nobody remembers and the half that decides whether the link works at all. Following an in-page link scrolls in every browser, but it moves <em>focus</em> in only some of them. Where it does not, the next Tab resumes from the link and returns the reader to the chrome they just asked to skip: a skip link that silently does nothing is worse than none, because the reader was told it worked.",
    "skipLink.targetBody2":
      '<code>tabindex="-1"</code> on the destination closes that gap. It takes the element out of the tab <em>order</em> — it adds no new stop — while making it a valid focus target. In React it arrives as a value, <code>skipLinkTarget</code>, rather than as a sentence in the docs: a rule written in prose is a rule someone copies wrong once.',
    "skipLink.hiddenTitle": "Hidden means clipped, never removed",
    "skipLink.hiddenBody1":
      'Not <code>display: none</code> and not <code>visibility: hidden</code>: both remove the element from the accessibility tree, and what is outside that tree cannot be reached by Tab either, which is the one thing this component has to be. At rest it is a one-pixel box clipped with <code>clip-path</code>, exactly like the <a href="/en/styling-hooks">visually-hidden</a> pattern.',
    "skipLink.hiddenBody2":
      "What separates it from that pattern is one declaration with a real consequence: <code>visually-hidden</code> returns to <code>position: static</code> when focused, so the element enters the layout and everything below it moves, at the exact moment the reader is trying to work out where they landed. Here the position is <code>fixed</code> in both states — hidden and revealed are the same out-of-flow box — so focusing it changes what is painted and nothing else. The page never moves.",
    "skipLink.firstTitle": "It goes first, or it is not a bypass",
    "skipLink.firstBody":
      "Anything focusable before the link is, by definition, a block nobody can bypass. That is why its place is the start of the <code>&lt;body&gt;</code> rather than “visually at the top”: the two coincide here because it is <code>fixed</code>, but the one that matters is document order.",
    "skipLink.contractBody":
      "One signature and one option, <code>href</code>, required: a skip link with no destination is nothing. The contract declares no <code>a11y</code> rules, and that absence is deliberate — its rules (the destination is focusable, nothing focusable comes before it, and content is offered before navigation when there are two) are about elements and siblings the usage tree does not contain, and a rule no machine can settle should not appear as though something checks it.",
    "skipLink.a11yIntro": "What this component settles, and what stays yours:",
    "skipLink.a11yItem1":
      "<strong>WCAG 2.4.1 (Bypass Blocks), level A.</strong> The criterion that asks for a way past content repeated across pages.",
    "skipLink.a11yItem2":
      'Put <code>tabindex="-1"</code> on the destination. Without it, several browsers scroll and leave focus where it was.',
    "skipLink.a11yItem3":
      "Make it the first focusable thing in the document. If something comes before it, that something is the block nobody can bypass.",
    "skipLink.a11yItem4":
      'Name it after the <em>destination</em>, not the action: “Go to content” says where it leads, “Skip” does not. It is the first thing a reader hears on the page.',
    "skipLink.a11yItem5":
      "If there are two, content goes first. The first one is the only one many readers will ever use, so it has to be the one most of them need.",
    "skipLink.test1":
      "It is an <code>&lt;a&gt;</code> with an href, not a button with onClick: the jump, the focus move and the Back button are the platform's.",
    "skipLink.test2":
      "At rest it is still in the accessibility tree: with display none this test would not find it, and neither would Tab.",
    "skipLink.test3":
      "The destination receives its own requirement as a value (<code>skipLinkTarget</code>), and the href points at the id that carries it.",
    "kbdPage.description": "Kbd: a drawn key, the native <kbd> with styling hooks and a React wrapper.",
    "kbdPage.lede":
      'Kbd is a <strong>drawn key</strong>: the native <code>&lt;kbd&gt;</code> with the look of a physical key. You use it to show a shortcut, the ⌘K on the search bar above, the Esc in a <a href="/en/components/command-palette">CommandPalette</a>\'s footer. It is static, like Badge: no state, no machine, no vanilla enhancer. The <code>&lt;kbd&gt;</code>\'s semantics belong to the platform; the component only adds the look.',
    "kbdPage.squareTitle": "A glyph reads square",
    "kbdPage.squareBody":
      'A single key (<kbd class="sk-kbd">K</kbd>, <kbd class="sk-kbd">⌘</kbd>, <kbd class="sk-kbd">↑</kbd>) takes a square minimum instead of reading as a sliver; a longer label (<kbd class="sk-kbd">Esc</kbd>, <kbd class="sk-kbd">Enter</kbd>) grows with its text. The minimum is <code>--sk-kbd-min-size</code>, relative to the key\'s own typography, so it stays square at any size.',
    "kbdPage.pressedTitle": "The pressed state",
    "kbdPage.pressedBody1":
      'Kbd is not a control, it is not clicked, so its one state <strong>reflects</strong> an external event: <code>data-pressed</code>, which turns on while its physical key is held down, the same way a component reflects a machine\'s <code>data-state</code>. Whoever is watching the keyboard writes it, not the kbd. Lit up, the key takes the accent, sinks a pixel, and loses its shadow, like a real key going down. The transition uses the <code>feedback</code> intent (<a href="/en/motion">motion</a>).',
    "kbdPage.pressedBody2":
      'Try it: press any of these and it lights up on its own; hold <kbd class="sk-kbd" data-key="meta">⌘</kbd> and add another to see the combination.',
    "kbdPage.echoAriaLabel": "Keys that react to the keyboard",
    "kbdPage.chordBody":
      'A whole chord too, as one unit: press <kbd class="sk-kbd" data-hotkey="mod+enter">⌘ ↵</kbd> and it lights up once the whole combination is down:',
    "kbdPage.scriptBody":
      "A small doc script sets it while the physical key is held down; for the chord it uses the hotkey primitive's own <code>matchesHotkey</code>, the same matcher the shortcut uses. The ⌘K badge on the search bar above is born from that pair: <code>formatHotkey</code> gives the per-platform text, Kbd gives it the box.",
    "kbdPage.test1": "Renders a native <code>&lt;kbd&gt;</code> carrying the part class.",
    "kbdPage.test2": "Keeps a consumer className alongside the part's own.",
    "kbdPage.test3": "Passes through native attributes.",

    "linkPage.description": "Link: a text link, always underlined, the only treatment WCAG 1.4.1 allows.",
    "linkPage.lede":
      "Link keeps <code>&lt;a&gt;</code>'s native semantics: use it to navigate, and give it a valid <code>href</code>. It is a <strong>text link</strong> with a permanent underline, the only treatment WCAG 1.4.1 allows in prose. Hover uses the state layer (<code>sk-interactive</code>), not a color the component invents.",
    "linkPage.tileTitle": "A surface link: TileLink",
    "linkPage.tileBody1":
      "When a whole surface is a single destination, use <code>TileLink</code>. It also renders an <code>&lt;a&gt;</code>, but it is not <code>sk-link</code>: it keeps Tile's geometry and state layer, because the context — not a prose underline — communicates that the surface is navigable.",
    "linkPage.tileBody2": "The authored HTML works with no initialization. <code>createTileLink</code> only creates the anchor when the tree is generated from JavaScript.",
    "linkPage.whyTitle": "Why one shape, not three",
    "linkPage.whyBody1":
      "A link inside a block of text <strong>cannot be told apart by color alone</strong>: that is <a class=\"sk-link sk-interactive\" href=\"https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html\">WCAG 1.4.1 (Use of Color)</a>, level A. There are only two ways to comply: a non-color indicator <em>at rest</em>, a permanent underline, or a ≥3:1 contrast between the link's color and the text's <em>plus</em> a non-color signal on hover <em>and</em> focus.",
    "linkPage.whyBody2":
      "The second path is fragile: that 3:1 has to be re-measured for every brand and every mode, and whoever is reading a still page, or cannot hover, gets no signal until they touch the link. An underline that only appears on hover leaves resting text with no clue, and with no underline the flat criterion fails. So <code>sk-link</code> has <strong>one</strong> shape, always underlined, and no hook to turn it off: offering <code>hover</code> or <code>none</code> would be offering a way to fail 1.4.1.",
    "linkPage.calloutBody":
      "<strong>What about links that are not underlined?</strong> A nav item, a breadcrumb, the prev/next in a footer — those are told apart by <em>location</em>, not color, so 1.4.1 does not ask them for an underline. But they are not <code>sk-link</code>: they use the <code>nav-list</code> pattern or a <code>ghost</code> button. <code>sk-link</code> is, by definition, the link <em>inside the text</em>.",
    "linkPage.toneTitle": "Tone does not change the rule",
    "linkPage.toneBody":
      'By default the link takes the <strong>same color as the text</strong> and relies entirely on the underline. <code>data-tone="primary"</code> paints it in the brand\'s primary color. Either way the underline stays mandatory: without it, the primary tone would be told apart by color alone (a WCAG 1.4.1 failure), and the default would not be told apart from the prose at all.',
    "linkPage.contractItem1": "Renders a native anchor: <code>href</code> sets the destination.",
    "linkPage.contractItem2": "<code>data-tone</code> is optional: without it, the text's own color; <code>primary</code> uses the brand's primary color.",
    "linkPage.contractItem3":
      "<strong>The underline is not configurable</strong>: it is always there, because a text link with no permanent non-color signal fails WCAG 1.4.1.",
    "linkPage.contractItem4": "It sets no <code>target</code>, <code>rel</code>, or any behavior for external links.",
    "linkPage.contractItem5":
      "It carries <code>sk-interactive</code>: hover, press, and focus come from the state layer. The <code>::before</code> opens a bit wider than the ink, so the wash does not read as a smear over the glyphs; the permanent underline stays the resting signal.",
    "linkPage.test1": "Renders a native link with the shared state layer for hover/press/focus.",

    "listPage.description":
      "List: a semantic row collection (ul/ol) with real anatomy (leading, content, trailing), dividers, interactive rows, and ordering.",
    "listPage.lede":
      "A <strong>list with UI</strong>, not an <code>&lt;li&gt;</code> with typography. Underneath it is a real <code>&lt;ul&gt;</code> or <code>&lt;ol&gt;</code> (a reader hears a list of N items), and on top of that it adds row anatomy: <strong>leading</strong> (icon, avatar, number), <strong>content</strong> (title and description), and <strong>trailing</strong> (meta, badge, action), with dividers. It composes piece by piece and stays functional: a row that acts is a real <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code>, never an <code>onClick</code> on the <code>&lt;li&gt;</code>.",
    "listPage.stepsTitle": "The row, one slot at a time",
    "listPage.stepsBody":
      "The six examples below are <strong>the same list</strong>, and each one adds exactly one piece over the last. Read them in order: whatever shows up new at each step is the only thing that changed in the markup.",
    "listPage.step1Title": "1 · Just the list",
    "listPage.step1Body":
      "The floor: a real <code>&lt;ul&gt;</code> with rows and dividers, not a single slot. There is already row height, inset, and hairlines, and the reader hears <em>list of 5 items</em>. Many lists need nothing more than this.",
    "listPage.step1Note": "ul + item",
    "listPage.step2Title": "2 · Title and description",
    "listPage.step2Body":
      "In comes <code>sk-list__content</code>, the column that flexes. Title and description stack, and it is the only part of the row that shrinks: that is why a long title ellipsizes there instead of pushing the row wider than its container.",
    "listPage.step2Note": "+ content",
    "listPage.step3Title": "3 · Leading media",
    "listPage.step3Body":
      "In comes <code>sk-list__leading</code>: an icon, an avatar, or a number. It is <strong>decorative</strong>, it does not name the row: the title does that. An empty slot does not exist for layout purposes, so rows with no icon carry no phantom padding.",
    "listPage.step3Note": "+ leading (Icon)",
    "listPage.step4Title": "4 · Trailing meta",
    "listPage.step4Body":
      "In comes <code>sk-list__trailing</code>, and the row is complete. It anchors to the end with <code>margin-inline-start: auto</code> and carries <code>tabular-nums</code>, so figures across rows line up in a column. It takes text or a component, like a Badge.",
    "listPage.step4Note": "+ trailing + Badge",
    "listPage.step5Title": "5 · The row acts",
    "listPage.step5Body":
      'Same anatomy, now wrapped in a real <code>a[href]</code> with <code>sk-list__action sk-interactive</code>. Focus and keyboard are native, and hover, focus, and press come from the <a href="/en/state-layer">state layer</a>. The <code>&lt;li&gt;</code> becomes just the thing carrying the divider.',
    "listPage.step5Note": "+ a[href] + state layer",
    "listPage.step6Title": "6 · Everything together",
    "listPage.step6Body":
      "The top of the ladder: interactive rows, two pieces in the trailing slot, <code>compact</code> density, and one disabled row. Nothing new from the component, just the above combined.",
    "listPage.step6Note": "+ density",
    "listPage.contractItem1":
      'Root: <code>&lt;ul class="sk-list"&gt;</code> or <code>&lt;ol&gt;</code>. Each row is an <code>&lt;li class="sk-list__item"&gt;</code>.',
    "listPage.contractItem2":
      "Row anatomy: <code>sk-list__leading</code>, <code>sk-list__content</code> (with <code>sk-list__title</code> and <code>sk-list__description</code>), and <code>sk-list__trailing</code>. All optional; compose whichever you use.",
    "listPage.contractItem3":
      'Instruction sequences: use <a href="/en/components/process-list">ProcessList</a>, which keeps an <code>&lt;ol&gt;</code> and owns the markers, connectors, and content of each step.',
    "listPage.contractItem4":
      'Functional row: an <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code> with <code>sk-list__action sk-interactive</code> inside the <code>&lt;li&gt;</code>. It fills the row and inherits focus, keyboard, and the state layer.',
    "listPage.contractItem5":
      'Persistent state: none. List models neither selection nor a current destination; for active navigation use <a href="/en/nav-list">Nav list</a>.',
    "listPage.contractItem6": 'Variants: <code>data-density="compact"</code> and <code>data-dividers="none"</code>.',
    "listPage.contractItem7": "No initialization needed: the behavior belongs to the native <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code>.",
    "listPage.test1": "Renders a semantic list with static, link and button rows.",
    "listPage.test2": "Renders an ordered list when order is meaningful.",

    "loaderPage.description": "Loader: indeterminate loading simulation, usage patterns, sizes, and speed.",
    "loaderPage.lede":
      "Loader communicates <strong>indeterminate</strong> work: the operation is active, but there is no honest fraction to show. The system offers two circular designs and two linear ones, with the same semantic rules for composing actions, regions, and initial loads.",
    "loaderPage.calloutBody":
      "The contract carries <code>ring</code>, <code>sweep</code>, <code>bars</code>, and <code>dots</code>. They are visual designs of the same Loader, not separate components.",
    "loaderPage.simTitle": "Simulation",
    "loaderPage.simBody":
      "A single container switches from busy to ready. It needs no screen, no metrics, no outer card: just the mark, the text explaining the work, and an action to run it again.",
    "loaderPage.simLabel": "Blend analysis",
    "loaderPage.simNote": "Busy → ready",
    "loaderPage.simBody2":
      "<code>bars</code> adds motion with no percentage to fake. The container carries <code>aria-busy</code>, and the visible state provides the accessible announcement.",
    "loaderPage.contextsTitle": "Full patterns",
    "loaderPage.contextsLabel": "Loader in context",
    "loaderPage.contextsBody":
      "Loader owns the mark, not the surface or the lifecycle. Context decides where it lives, who supplies the accessible name, and which region carries <code>aria-busy=\"true\"</code>.",
    "loaderPage.contextsNote": "Local action · region update · initial load",
    "loaderPage.contextsItem1": "In a button, Loader is decorative: \"Saving…\" already names the state.",
    "loaderPage.contextsItem2": "In a local update, it keeps the previous content and marks the region busy.",
    "loaderPage.contextsItem3": "In an initial load, it pairs the mark with a title and an explanation; it avoids a blank screen.",
    "loaderPage.sizeTitle": "Size",
    "loaderPage.sizeBody":
      "Use <code>sm</code> inside controls, <code>md</code> beside text, and <code>lg</code> when the mark owns its own region. Size does not communicate how much work is left.",
    "loaderPage.sizeLabel": "Loader sizes",
    "loaderPage.speedTitle": "Speed",
    "loaderPage.speedBody":
      "<code>speed</code> rewrites the <code>--sk-loader-duration</code> styling hook from intent tokens (<code>--motion-loading-duration*</code>), not raw milliseconds. Choose the cadence for visual presence, not as a promise about the operation's real duration.",
    "loaderPage.speedLabel": "Loader speeds",
    "loaderPage.speedOverrideLabel": "local override",
    "loaderPage.semanticsTitle": "Semantics",
    "loaderPage.semanticsItem1": 'With an accessible name it uses <code>role="status"</code>; React writes it when you pass <code>label</code>.',
    "loaderPage.semanticsItem2": "With no <code>label</code>, React makes it decorative, to pair with text without duplicating it.",
    "loaderPage.semanticsItem3": 'It marks the affected region with <code>aria-busy="true"</code>; Loader does not control the operation.',
    "loaderPage.semanticsItem4":
      'If you know the progress, use <a href="/en/components/progress">Progress</a>, not a different speed.',
    "loaderPage.reducedTitle": "Reduced motion",
    "loaderPage.reducedBody":
      "All four designs keep a recognizable silhouette and stop all motion under <code>prefers-reduced-motion: reduce</code>. The status text stays: reducing motion cannot turn a pending operation into an invisible signal.",
    "loaderPage.reactBody":
      "Props: <code>size</code>, <code>variant</code>, <code>speed</code>, and <code>label</code>. The defaults are <code>md</code>, <code>ring</code>, and <code>normal</code>.",
    "loaderPage.test1": "Exposes labelled indeterminate work as a polite status.",
    "loaderPage.test2": "Writes orthogonal variant and speed axes onto the root.",
    "loaderPage.test3": "Stays decorative when the surrounding control already carries the status meaning.",

    "menuPage.description": "Actions, checkboxes, and radios with keyboard navigation and typeahead.",
    "menuPage.contractBody":
      "Menu runs actions, and also works as a context menu through <code>contextTarget</code> or <code>data-sk-menu-context-trigger</code>. An item with <code>children</code> creates a submenu. To pick a form value use Select; for editable suggestions, Combobox.",
    "menuPage.a11yBody": "The machine manages arrows, Home, End, Escape, typeahead, and focus return.",
    "menuPage.multilevelTitle": "Nested submenus",
    "menuPage.multilevelBody":
      "A submenu is the same <code>children</code> slot pointing back at itself: there is no depth limit of its own, so Insert → Media → Image nests a third level in the same shape as the first.",
    "menuPage.compactTitle": "Compact density",
    "menuPage.compactBody":
      "<code>density: \"compact\"</code> shrinks each row to <code>--size-control-sm</code> (a 24px floor, WCAG 2.2's minimum) instead of <code>--size-touch-target</code>'s 44px: an explicit trade of hit area for more visible rows, for a menu with a lot of commands.",
    "menuPage.contextTitle": "As a context menu",
    "menuPage.contextBody":
      "<code>data-sk-menu-context-trigger</code> (or <code>contextTarget</code> in React) replaces the trigger: the element absorbs the right-click <code>contextmenu</code> event and opens the menu, instead of needing a visible button.",
    "menuPage.safetyTitle": "Pointer intent (safety triangle)",
    "menuPage.safetyBody":
      "When a submenu is open, crossing another parent-menu item on a diagonal path does not highlight it or close the submenu. What holds it is a real element: the <em>safe area</em>, a <code>clip-path</code> triangle living INSIDE the trigger and reaching from the pointer to the submenu's near edge. While the pointer is over it the browser fires no <code>pointerleave</code> on the trigger — a descendant counts as the element — so the machine never enters <code>closing</code> and the rows underneath never get the <code>pointermove</code> they would steal the highlight with. <code>@zag-js/menu</code>'s own polygon was not enough: it can only veto an early close during <code>waitForCloseDelay</code>'s 100ms, never extend them, and a pointer parked motionless inside the polygon still lost the submenu at ~90ms. Open \"Share\" and cross diagonally toward the submenu: the painted triangle is the very element you are touching, not a separate drawing of it.",

    "navbarPage.description": "Navbar: the bar, with the navigation list as a horizontal pattern.",
    "navbarPage.lede":
      "Navbar is the <strong>bar</strong>: a surface, a brand mark, and a place for actions. It has no machine and needs none — it is a <code>&lt;header&gt;</code> with links, and the platform ships all of that.",
    "navbarPage.linksTitle": "The links do not belong to the navbar",
    "navbarPage.linksBody":
      "They are the <a href=\"/en/nav-list\"><code>nav-list</code></a> pattern, laid out horizontally, the same structure that hosts the sidebar vertically. That two components need this exact structure is what makes it a pattern rather than a component: before, the navbar and the sidebar each had their own list, with the same rules written twice and free to drift apart.",
    "navbarPage.currentTitle": "The current page belongs to the platform",
    "navbarPage.currentBody":
      'The current link is marked with <code>aria-current="page"</code>, which the consumer already has to write for screen readers. The styling hooks follow it instead of asking for a modifier class, and a <code>state</code> would be written by a machine; there is none here.',
    "navbarPage.test1": "Uses a header landmark while leaving navigation to its NavList child.",

    "numberFieldPage.description": "Localized numeric entry with limits, steps, and increment controls.",
    "numberFieldPage.contractBody": "The public value keeps both string and valueAsNumber. Intl.NumberFormat controls the presentation.",
    "numberFieldPage.a11yBody": "The triggers carry their own names, and the input announces min, max, current value, and invalid state.",

    "paginationPage.description": "Pagination: a page window as a pure function from core, with first, last, and ellipsis.",
    "paginationPage.lede":
      "Pagination moves through a paginated set, one page at a time. The visible window is the interesting part, and it lives as a pure function in core: first and last always present, the current page with one sibling on each side, and hidden runs collapsing into an ellipsis.",
    "paginationPage.body":
      'Prev/next use the set\'s <code>chevron-left</code> and <code>chevron-right</code> roles. The current page carries <code>aria-current="page"</code>; prev/next disable at the edges. The ellipsis is inert text, never a target. The targets carry <code>sk-interactive</code>.',
    "paginationPage.rangeTitle": "The window, in core",
    "paginationPage.rangeBody": "Rendering and handlers belong to the binding; the calculation belongs to core and is testable in isolation:",
    "paginationPage.reactBody": "React draws the chevrons from the linked set.",
    "paginationPage.test1": "Marks the current page and disables prev/next at the bounds.",
    "paginationPage.test2": "Collapses far pages behind an ellipsis and reports clicks clamped to range.",

    "placeholderPage.description": "Placeholder: decorative geometry that reserves content's place while it loads.",
    "placeholderPage.lede":
      "Placeholder reserves the shape of content that has not arrived yet. It cuts layout shift and offers a brief visual signal; the container keeps the responsibility of explaining what is loading.",
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
    "placeholderPage.shapesTitle": "Shapes",
    "placeholderPage.shapesItem1": "<code>text</code>: a single line; it is the default.",
    "placeholderPage.shapesItem2": "<code>block</code>: media, tables, or rectangular regions.",
    "placeholderPage.shapesItem3": "<code>circle</code>: avatars and circular controls.",
    "placeholderPage.shapesBody":
      "Adjust <code>--sk-placeholder-inline-size</code>, <code>--sk-placeholder-block-size</code>, or <code>--sk-placeholder-size</code> from the consuming layout. The shape does not know the content.",
    "placeholderPage.reducedTitle": "Reduced motion",
    "placeholderPage.reducedBody":
      "The sheen moves with <code>transform</code>. Under <code>prefers-reduced-motion: reduce</code>, the animation disappears and the static fill remains.",
    "placeholderPage.reactBody": "The code is in each preview's <strong>React</strong> tab.",
    "placeholderPage.test1": "Renders decorative geometry and forwards layout classes.",
    "placeholderPage.test2": "Has no serious accessibility violations inside a labelled busy region.",

    "popoverPage.description": "Non-modal content with a title, description, and explicit close over the native top layer.",
    "popoverPage.contractBody": "Popover describes rich auxiliary content. Menu holds actions; Tooltip holds only a short description.",
    "popoverPage.a11yBody": "The platform owns the top layer, Escape, and light-dismiss through popover=auto.",

    "popupPage.description": "A minimal floating surface for compositions that need none of Popover's chrome.",
    "popupPage.contractBody": "Popup provides an anchor and a surface, not internal semantics. If the pattern has a title and closing actions, use Popover.",
    "popupPage.a11yBody": "The content must provide its own semantics; Popup invents no dialog or menu roles.",

    "processListPage.description": "ProcessList: an ordered instruction sequence with connected markers and arbitrary content.",
    "processListPage.lede":
      "A static instruction sequence where the content is what matters. It uses a real <code>&lt;ol&gt;</code>, numbers each <code>&lt;li&gt;</code>, and visually connects the steps without turning them into progress states.",
    "processListPage.whenTitle": "When to use it",
    "processListPage.whenItem1": "Use ProcessList for recipes, installs, and procedures whose order matters.",
    "processListPage.whenItem2": 'Use <a href="/en/components/list">List</a> for static or interactive row collections.',
    "processListPage.whenItem3":
      'Use <a href="/en/components/steps">Steps</a> when there are <code>complete</code>, <code>current</code>, or <code>upcoming</code> states.',
    "processListPage.contractItem1": 'The root is always <code>&lt;ol class="sk-process-list"&gt;</code>.',
    "processListPage.contractItem2": 'Every instruction is an <code>&lt;li class="sk-process-list__item"&gt;</code>.',
    "processListPage.contractItem3":
      "<code>sk-process-list__title</code> identifies the step, and <code>sk-process-list__content</code> accepts any flow content.",
    "processListPage.contractItem4": "The counter generates the numbers; they are never hand-written and never represent progress.",
    "processListPage.contractItem5": "There are no persistent states or fully clickable rows. For progress, use Steps.",
    "processListPage.test1": "Renders a native ordered sequence of instructions.",
    "processListPage.test2": "Keeps each title and arbitrary step content inside its item.",

    "progressPage.description": "Progress: a determinate bar with a fraction clamped in core, tones, and a React component.",
    "progressPage.lede":
      "Progress is a <strong>determinate</strong> bar: the consumer knows the value. The fraction is clamped to <code>[0, max]</code> in core (<code>progressFraction</code>), so the painted width and <code>aria-valuenow</code> can never drift apart.",
    "progressPage.body": 'For work with no measurable value, use <a href="/en/components/loader">Loader</a>: its semantics are indeterminate.',
    "progressPage.test1": "Exposes the value on the progressbar role and paints the matching fill.",
    "progressPage.test2": "Clamps an out-of-range value so the paint and aria-valuenow agree.",

    "radioGroupPage.description": "RadioGroup: an exclusive choice with native inputs and a real form.",
    "radioGroupPage.lede": "An exclusive choice among related alternatives. Every option is a native radio; the shared name enforces the exclusion.",
    "radioGroupPage.tileTitle": "Surface options: TileRadioGroup",
    "radioGroupPage.tileBody1":
      "When each alternative needs a title, a description, and a whole surface, use <code>TileRadioGroup</code>. Every item keeps a native radio; the group imposes no layout.",
    "radioGroupPage.tileBody2":
      'In this preview the options run in a row with <a href="/en/components/inline"><code>sk-inline</code></a>, and each Tile takes <code>flex: 1</code>. In a column, skip <code>sk-inline</code>.',
    "radioGroupPage.tileBody3":
      'The <code>tile-radio-group</code> enhancer (Svelte + <code>@zag-js/radio-group</code>, the same machine React uses) hydrates the <code>data-sk-tile-radio-group</code> root with <code>initComponents()</code>: it guarantees mutual exclusion and syncs each <code>[data-part="item"]</code>\'s state with its real radio.',
    "radioGroupPage.tileBody4": "Import <code>@skryensya/core/components/radio-group.css</code> and call <code>initComponents()</code> once.",
    "radioGroupPage.contractItem1": "<code>name</code> is required and shared by every option.",
    "radioGroupPage.contractItem2": "<code>defaultValue</code> keeps the native state and respects form resets.",
    "radioGroupPage.contractItem3": "<code>value</code> controls the selected option; <code>onValueChange</code> reports changes.",
    "radioGroupPage.contractItem4":
      "The group needs an accessible name: <code>aria-label</code>, <code>aria-labelledby</code>, or a <code>fieldset</code> with a <code>legend</code>.",
    "radioGroupPage.test1":
      "Is a radiogroup, honours the default value, keeps values mutually exclusive, and emits the event.",
    "radioGroupPage.test2": "Marks the selected item's <code>data-state</code>.",

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

    "selectPage.description": "Select: a machine-enhanced listbox, for Vanilla and React.",
    "selectPage.lede":
      "The main picker for when the interaction needs typeahead, highlighting, a controlled popup, and positioning. <code>Select</code> shares its parts contract across <code>@skryensya/vanilla</code> and <code>@skryensya/react</code>; each binding's machine is an internal detail.",
    "selectPage.nativeLinkBody": 'For a standard form choice, use the <a href="#native-select">native Select</a> documented at the end: it loads no enhancer, keeps platform behavior, and styles its picker through progressive enhancement.',
    "selectPage.enhancedLabel": "Enhanced Select",
    "selectPage.densityBody": "Density compacts the space around the picker, not its touch targets: the trigger and every option keep a minimum height of <code>44px</code>.",
    "selectPage.htmlTitle": "Authored HTML",
    "selectPage.htmlBody":
      "The items <strong>are</strong> the collection: the enhancer reads them off the DOM, the same way tabs reads its triggers. Every <code>data-sk-select-item</code> needs a <code>data-value</code>. The full markup is in the preview's <strong>Vanilla</strong> tab.",
    "selectPage.vanillaInitTitle": "Initializing Vanilla",
    "selectPage.listenTitle": "Listening for the change",
    "selectPage.formsTitle": "Forms and the no-JavaScript fallback",
    "selectPage.enhancedContractTitle": "Enhanced contract",
    "selectPage.enhancedContractItem1": "The root carries <code>data-sk-select</code> and the documented parts anatomy.",
    "selectPage.enhancedContractItem2": "The enhancer renders no markup and invents no classes; it only wires up the authored nodes.",
    "selectPage.enhancedContractItem3": "The machine owns the value text; the placeholder, options, and ids stay the consumer's.",
    "selectPage.enhancedContractItem4": "React renders the same contract and does not hydrate the Vanilla markup.",
    "selectPage.nativeTitle": "Native Select",
    "selectPage.nativeLede":
      "A real <code>&lt;select&gt;</code>: selection, keyboard, form submission, and accessibility all still belong to the browser. skryensya/ui applies <code>sk-select-native</code>; there is no <code>data-sk-*</code>, no machine, and no <code>@skryensya/vanilla</code> package.",
    "selectPage.nativeBody":
      "Use it for a standard choice. Pick the enhanced Select only when you need its controlled collection, item markup, positioning, or the <code>sk-value-change</code> event; appearance is no longer a reason to replace the native control.",
    "selectPage.nativeLabel": "Native Select",
    "selectPage.progressiveTitle": "Progressive enhancement",
    "selectPage.progressiveBody":
      "If the browser supports <code>appearance: base-select</code> and <code>::picker(select)</code>, Core applies the same surface, spacing, states, and icons Select uses to the field, the picker, and its options. Every other browser ignores that block and keeps the operating system's classic popup. The HTML and behavior never change.",
    "selectPage.nativeInstallTitle": "Installing just the native Select",
    "selectPage.nativeContractTitle": "Native contract",
    "selectPage.nativeContractItem1": "Use an associated <code>&lt;label&gt;</code> or an equivalent accessible name.",
    "selectPage.nativeContractItem2": "Selection, keyboard, and the <code>form</code>'s serialization belong to the browser.",
    "selectPage.nativeContractItem3": "<code>disabled</code> is the native attribute; it is never replaced by JavaScript state.",
    "selectPage.nativeContractItem4": "Customizable select unifies the picker; the classic popup stays the fallback.",
    "selectPage.iconsComment": "Icons are authored as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "selectPage.formsComment": "Optional: makes the Select submit inside a form, and it is\n     what remains with no JS. Its <option>s have to match\n     the items, or the enhancer throws.",
    "selectPage.test1": "Uses the Zag select machine for popup selection and form value.",
    "selectPage.test2": "Drives the machine over authored markup: ARIA, selection and the value text.",
    "selectPage.test3": "Emits <code>sk-value-change</code>, and cleanup stops the machine.",

    "sidebarPage.description": "Sidebar: the shell that collapses to a rail, with the navigation list as a guest pattern.",
    "sidebarPage.lede":
      "Sidebar is the <strong>shell</strong>: a header, a scrolling middle, a footer, and the collapse. It collapses to a <strong>rail</strong>, narrows, and never hides.",
    "sidebarPage.contentTitle": "The sidebar is one thing; its content is another",
    "sidebarPage.contentBody":
      'What goes inside is not the sidebar\'s business. The destination list is the <a href="/en/nav-list"><code>nav-list</code></a> pattern, a guest here, with the same structure the navbar uses horizontally. That is why there is no <code>sk-sidebar__link</code>: that list was never the sidebar\'s, and naming it that way would be naming a tenant.',
    "sidebarPage.collapseBody": "Collapse the sidebar with the button: the list becomes a rail of icons, and it is all still there.",
    "sidebarPage.widthTitle": "Width belongs to the reader",
    "sidebarPage.widthBody1":
      "Authoring a <code>SidebarResizeHandle</code> inside the sidebar is what makes it resizable. There is no <code>resizable</code> option beside it: two ways to say the same thing are two ways to contradict each other, and the stylesheet reads that same fact with <code>:has()</code>.",
    "sidebarPage.widthBody2":
      "The travel is bounded by <code>--sk-sidebar-min-inline-size</code> and <code>--sk-sidebar-max-inline-size</code>, and the <code>clamp()</code> lives in the CSS: the drag writes <strong>one</strong> property, and neither binding does the math. That is why a brand that moves those hooks moves the resize with it, with nothing to re-run.",
    "sidebarPage.widthBody3":
      "For a single bar, <code>minInlineSize</code> and <code>maxInlineSize</code> write those two hooks from the markup or from props, with any CSS length (<code>18rem</code>, <code>30%</code>, <code>min(24rem, 40vw)</code>). They are sugar over the hooks, not a second mechanism: whoever has fifty identical bars still sets the hook once in their stylesheet. The extremes belong to the instance and the expanded width does not, and the split is not arbitrary: the expanded width is the size the bar was designed for, a system decision; the travel depends on the reader's own screen and content.",
    "sidebarPage.widthBody4":
      "It resizes on a <strong>held</strong> click: pressure alone does nothing, the gesture only starts once the pointer has traveled four pixels. A loose click on the panel's edge does not move the width, does not fire <code>sk-resize-change</code>, and writes nothing to storage — which is what used to freeze a width nobody chose into a reader's browser.",
    "sidebarPage.widthBody5":
      "It is a full splitter, not just a drag: the arrows move it in small steps (faster with <kbd class=\"sk-kbd\">Shift</kbd>), <kbd class=\"sk-kbd\">Home</kbd> and <kbd class=\"sk-kbd\">End</kbd> jump to the extremes, and a double-click or <kbd class=\"sk-kbd\">Enter</kbd> return the default width. With <code>storageKey</code> the width survives a reload; without it, it lasts the session, which is this preview's case.",
    "sidebarPage.widthBody6":
      'A <a href="/en/components/tree-view">TreeView</a> sits inside on purpose: it is the guest whose correct width nobody can know ahead of time. A name that does not fit gets ellipsized, and the panel never scrolls horizontally; widening it is the answer, not a side scrollbar.',
    "sidebarPage.resizableLabel": "Resizable sidebar",
    "sidebarPage.detailsTitle": "Why it is not a <code>&lt;details&gt;</code>",
    "sidebarPage.detailsBody1":
      "A disclosure ships from the platform: <code>&lt;details&gt;</code> / <code>&lt;summary&gt;</code>, no machine. A collapsible sidebar is <em>not</em> a disclosure. A closed <code>&lt;details&gt;</code> hides its content; a collapsed sidebar still shows it, just as icons. Since the platform ships nothing for that, a small enhancer earns its place, and reimplements nothing that already exists.",
    "sidebarPage.detailsBody2":
      "That is why the labels fade but are <strong>not</strong> removed from the DOM: collapsed, the label is the only thing naming the icon for a screen reader. A nested group that <em>does</em> hide its items is still a disclosure, and belongs in a <code>&lt;details&gt;</code>.",
    "sidebarPage.widthStatesTitle": "One width, two states",
    "sidebarPage.widthStatesBody1":
      "The two widths are two values of <strong>one</strong> styling hook. The consumer writes <code>inline-size: var(--sk-sidebar-inline-size)</code> once; collapsing redeclares that hook, adding no new one, which is the styling hooks rule. The machine writes <code>state</code> as <code>data-state</code> on the root, never by hand.",
    "sidebarPage.widthStatesBody2":
      "The rail measures exactly one control, and collapsed, the sidebar hands the list the padding that <em>centers</em> the icon in that square, calculated, not guessed, so it stays centered across all three densities. It is the shell redeclaring a hook of the pattern: it never touches its markup.",
    "sidebarPage.widthStatesBody3":
      "There is also no <code>prefers-reduced-motion</code> block: the duration comes from the expand/collapse intent tokens, which already shrink themselves. The sidebar lends that intent to the list, so the labels fade in the same time the width moves.",
    "sidebarPage.triggerTitle": "The trigger carries no visible label",
    "sidebarPage.triggerBody":
      "It measures one icon wide, so its accessible name goes in an <code>aria-label</code> (or visually hidden text): a visible label inside would be text inside a square the width of an icon. The enhancer patches attributes, never content — the name is yours.",
    "sidebarPage.htmlTitle": "Authored HTML",
    "sidebarPage.htmlBody1":
      "The enhancer looks for <code>[data-sk-sidebar]</code>, accepts a <code>[data-sk-sidebar-trigger]</code> or a <code>[data-sk-sidebar-resize]</code>, and patches <code>aria-expanded</code>, <code>aria-controls</code>, and <code>data-state</code>. It writes no markup or classes. The full markup is in the preview's <strong>Vanilla</strong> tab.",
    "sidebarPage.htmlBody2":
      'In that markup, the <code>.app-shell</code> wrapping the <code>&lt;aside&gt;</code> and the <code>.app-shell__main</code> beside it <strong>do not belong to the sidebar</strong>: they are the app consuming it, put there because a rail with nothing beside it does not read. What you copy is the <code>&lt;aside class="sk-sidebar"&gt;</code>; your layout supplies the rest.',
    "sidebarPage.vanillaInitTitle": "Initializing vanilla",
    "sidebarPage.reactBody":
      "Controlled (<code>collapsed</code>) or uncontrolled (<code>defaultCollapsed</code>), with <code>onCollapsedChange</code> to persist the preference. The equivalent vanilla event is <code>sk-collapsed-change</code>. Persisting belongs to the consumer: which key, and per-user or per-device, is not a design system's decision. The code is in the preview's <strong>React</strong> tab.",
    "sidebarPage.iconsComment": "Icons are authored as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "sidebarPage.test1": "Collapses uncontrolled and reports the change.",
    "sidebarPage.test2": "Points the trigger at the content it controls.",
    "sidebarPage.test3": "Writes collapsed state, emits the change, and cleanup removes listeners.",
    "sidebarPage.test4": "Writes the width property while dragging, and only while dragging.",
    "sidebarPage.test5": "Restores a stored width on mount, and leaves an unkeyed sidebar alone.",

    "sliderPage.description": "Slider: a native range with a skin, a fill painted with no JavaScript, and a React component.",
    "sliderPage.lede":
      'Slider is a real <code>&lt;input type="range"&gt;</code> with a skin: keyboard, form participation, and the accessibility tree all come from the platform. The filled portion is exposed as the <code>--sk-slider-fill</code> property (0-1): the initial value is painted by CSS alone, and following the thumb while dragging is all the binding needs to do.',
    "sliderPage.body1":
      "In Vanilla, <code>data-sk-slider</code> registers the minimal binding that rewrites <code>--sk-slider-fill</code> on every <code>input</code>, nothing more: keyboard, focus, and the form all stay the platform's. In React, <code>&lt;Slider&gt;</code> keeps the property in sync in both controlled and uncontrolled mode, and reports the change as a number through <code>onValueChange</code>.",
    "sliderPage.body2":
      "The contract's <code>value</code> is <strong>where the thumb starts</strong>, and each binding writes it under its own name: <code>value</code> in the markup, <code>defaultValue</code> in React. It is not cosmetic: <code>value</code> in React means controlled, so emitting it produced a slider that could not move.",
    "sliderPage.test1": "Stays a native <code>&lt;input type=\"range\"&gt;</code> and reports value changes as numbers.",
    "sliderPage.test2": "Paints the initial fill from the value within [min, max] on mount.",
    "sliderPage.rangeTitle": "Two thumbs",
    "sliderPage.rangeBody":
      'Two native <code>&lt;input type="range"&gt;</code> elements, not the hand-rolled SVG widget the WAI-ARIA APG itself publishes as the only example for this pattern — each input already gets keyboard, focus, and an accessibility tree for free from the platform, and WAI\'s own guidance warns that a hand-rolled widget can fail for touch-based screen reader users. Neither thumb can be dragged past the other: <code>sliderRangeBounds</code> computes each one\'s bound against where the OTHER sits right now, never against a fixed min/max.',
    "sliderPage.rangeLabel": "Price range",
    "sliderPage.testRange1":
      "The low thumb's max is bounded by the high thumb's current value, and vice versa.",
    "sliderPage.testRange2":
      "Changing one value re-bounds the OTHER thumb and reports both values on the change.",
    "sliderPage.testRange3":
      "Neither thumb can exceed the other — native min/max clamps even a direct value write past the bound.",

    "splitButtonPage.description": "A stable primary action with an adjacent menu of alternative actions.",
    "splitButtonPage.contractBody": "The primary action never silently changes when the menu is chosen. If there is no dominant action, use Menu.",
    "splitButtonPage.a11yBody": "They are two independent buttons: one runs the action, and the other announces and opens the alternatives.",
    "splitButtonPage.smallTitle": "Small size",
    "splitButtonPage.smallBody": "Both halves scale together — <code>size</code> on the primary Button, <code>triggerSize</code> on the Menu's own trigger.",
    "splitButtonPage.smallLabel": "SplitButton, small size",
    "splitButtonPage.menuFirstTitle": "The menu, first",
    "splitButtonPage.menuFirstBody": "Composed by hand with <code>Inline</code> instead of SplitButton's own contract — which always orders the action before the menu, the real split-button pattern (the trigger comes after, and only moves to the left through <code>dir=\"rtl\"</code> mirroring, never as an authored choice in the same language direction). This shows <code>squareStart</code>/<code>squareEnd</code> work in either order, not only the one SplitButton itself assembles.",
    "splitButtonPage.menuFirstLabel": "SplitButton, menu first",

    "stackPage.description": "Stack: a vertical layout primitive with gap and cross-axis alignment.",
    "stackPage.lede":
      "Stack stacks content along the vertical axis. It is a structural pattern: the element carrying it keeps the content's own semantics, and the gap expresses the separation between its children.",
    "stackPage.htmlTitle": "Authored HTML",
    "stackPage.htmlBody": "Choose the semantic element directly; Stack needs no vanilla initialization.",
    "stackPage.reactBody": "Use <code>as</code> to choose the element the adapter renders, without losing the layout contract.",
    "stackPage.contractItem1": "<code>sk-stack</code> creates a one-column grid and stacks its children vertically.",
    "stackPage.contractItem2":
      "<code>data-gap</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, or <code>xl</code>; omitting it uses <code>md</code>.",
    "stackPage.contractItem3":
      "<code>data-align</code> aligns on the cross axis: <code>start</code>, <code>center</code>, <code>end</code>, or <code>stretch</code>. Omitting it stretches the children.",
    "stackPage.contractItem4": "In React, <code>as</code> is optional and renders a <code>div</code> if not given.",
    "stackPage.test1": "Renders Stack, Inline and Grid as the documented layout contracts.",

    "statPage.description": "Stat: a headline metric with a label, a tabular value, and a trend-colored change.",
    "statPage.lede":
      "Stat is a headline metric: a dim label, a large tabular-mono value, and an optional change. <strong>Trend</strong> colors the change independent of its sign — \"down\" is good for churn and \"up\" is good for revenue, so the consumer decides which direction is positive.",
    "statPage.cardTitle": "Stat Card",
    "statPage.cardBody":
      '<a href="/en/components/card#stat-card">Card</a> adds no extra variant to Stat: <a href="/en/components/box">Box</a> supplies the surface and Grid organizes the collection. The arrow points down on cancellations, but <code>trend="up"</code> communicates that the change is favorable.',
    "statPage.animateTitle": "Animating the value",
    "statPage.animateBody":
      "The count-up is <strong>opt-in</strong>: the same Stat Card, with <code>animate</code> / <code>data-animate</code> and a numeric value. Without it, the markup stays static. The duration comes from <code>--motion-count-duration</code>; under <code>prefers-reduced-motion</code> it jumps straight to the end.",
    "statPage.animateLabel": "Animated Stat Cards",
    "statPage.animateNote": "Same card · animate + format / data-count",
    "statPage.test1": "Colors the change by trend, not by sign.",
    "statPage.test2": "Omits the change element when no change is given.",
    "statPage.test3": "Counts a numeric value up when animate is on.",

    "stepsPage.description": "Steps: a linear progress indicator with complete / current / upcoming states.",
    "stepsPage.lede":
      "Steps shows progress across an ordered sequence. Every step reports one of three states — <code>complete</code>, <code>current</code>, <code>upcoming</code> — the component displays the sequence; it does not govern which one is active or keep navigation between steps.",
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
    "switchPage.test1":
      "Toggles checked state and the root's <code>data-state</code> on click, emitting <code>sk:checkedchange</code>.",
    "switchPage.test2": "Is form-associated and honours its <code>default-checked</code>.",
    "tablePage.description": "Readable native table with horizontal scroll and sticky rows or columns.",
    "tablePage.lede":
      "Table keeps native <code>&lt;table&gt;</code> semantics. The overflow wrapper preserves a readable per-column width and scrolls the table instead of compressing it. Sticky header and sticky first column are opt-in and share the same contract on mobile and desktop.",
    "tablePage.scrollTitle": "Horizontal scroll without compressing",
    "tablePage.scrollBody":
      'Inside <code>.sk-table-scroll</code>, every cell keeps the <code>--sk-table-cell-min-inline-size</code> floor; row headers keep a larger one. A <code>data-layout="fixed"</code> table also uses <code>--sk-table-fixed-min-inline-size</code>. On narrow screens, scroll appears — not 56px columns or letter-by-letter text. The wrapper accepts focus for keyboard scrolling and paints a compact but visible scrollbar.',
    "tablePage.stickyColTitle": "Sticky first column",
    "tablePage.stickyColBody":
      'Use <code>data-sticky-column</code> in HTML or <code>stickyColumn</code> in React. The first cell of each row stays frozen, and its shadow separates the identifier from the data passing underneath. It should be a <code>&lt;th scope="row"&gt;</code>. It does not depend on a breakpoint: it works the same with touch, mouse, zoom, or a narrow window.',
    "tablePage.stickyColLabel": "Sticky first column",
    "tablePage.stickyHeadTitle": "Sticky header row",
    "tablePage.stickyHeadBody":
      "Use <code>data-sticky-header</code> or <code>stickyHeader</code>. The wrapper gains vertical scroll and a max height of <code>20rem</code>, which you can override as in this example. The header stays visible on both desktop and mobile; if you combine both modifiers, the corner cell sits above both layers.",
    "tablePage.stickyHeadLabel": "Sticky header row",
    "tablePage.resizableTitle": "Resizable columns",
    "tablePage.resizableBody":
      'Use <code>data-resizable-columns</code> in HTML or <code>resizableColumns</code> in React, together with <code>resizeLabel</code> (required). The binding inserts a real separator (<code>role="separator"</code>) between every pair of headers — the same shared primitive, <code>@skryensya/core/splitter</code>, that <a href="/en/components/sidebar">Sidebar</a>\'s own resize handle and <a href="/en/components/treegrid">Treegrid</a>\'s own column resizer already use. Drag a header\'s edge, or focus it and use the arrow keys (Shift for the coarse step), Home/End for the extremes, Enter or double-click to reset the pair to an even split.',
    "tablePage.resizableLabel": "Performance by region, resizable",
    "tablePage.pagerTitle": "With pagination",
    "tablePage.pagerBody":
      '<code>data-sk-table-pager</code> is the vanilla enhancer; <code>sk-table-pager</code> is the layout pattern (table + bar). You mark the rows, leave the <code>nav</code> empty and, optionally, a status and a page-size <a class="sk-link sk-interactive" href="/en/components/select"><code>Select</code></a>. Page size sits at the start of the bar; status and <a class="sk-link sk-interactive" href="/en/components/pagination"><code>Pagination</code></a> sit together in <code>sk-table-pager__end</code>. Use <code>data-layout="fixed"</code> so column widths do not shift.',
    "tablePage.pagerLabel": "Table + Pagination",
    "tablePage.boxTitle": "Inside a Box",
    "tablePage.boxBody":
      "Inside a <code>.sk-box</code>'s <code>padding</code>, the <code>.sk-table</code> rounds with the nested-element radius (<code>--radius-control</code>) instead of the surface one: Box provides the surface and the table is an element inside it. That keeps the radius tighter, never collapses into a square box, and still follows the <code>data-radius</code> axis.",
    "tablePage.boxLabel": "Table in Box",
    "tablePage.densityTitle": "Local density",
    "tablePage.densityBody":
      "The scope contract is just <code>data-sk-density-scope</code> and a density value. Here <code>--sk-density-factor</code> is relative to the system; write <code>--sk-density</code> on the same node if you need an absolute value. The numbers stay continuous.",
    "tablePage.densityWideLabel": "Wide table · 1.2× system",
    "tablePage.densityCompactLabel": "Compact table · 0.6× system",
    "tablePage.reactBody":
      "The binding is <strong>Vanilla | React</strong>. In Vanilla, plain HTML with <code>data-sk-*</code> is enough; <code>initComponents</code> (and <code>mountIcons</code>) load it for the site.",
    "tablePage.test1": "Renders the native table structure with every stable part class.",
    "tablePage.test2": "Headers default to columns while preserving explicit row scope.",

    "tabsPage.description": "Three Tabs examples, from basic anatomy to manual control.",
    "tabsPage.lede":
      "Start with two views, add states and icons, and end with controlled vertical navigation. The anatomy does not change as it grows: a list, triggers, and one panel per value.",
    "tabsPage.basicTitle": "1. Basic",
    "tabsPage.basicBody":
      "Two triggers and two panels. <code>data-value</code> links each option to its content; the enhancer fills in roles, focus, and ARIA.",
    "tabsPage.basicLabel": "Basic Tabs",
    "tabsPage.statesTitle": "2. States and icons",
    "tabsPage.statesBody":
      "The same contract accepts composite labels and disabled options. The icon rides alongside the text; it never replaces the tab's accessible name.",
    "tabsPage.statesLabel": "Tabs with states",
    "tabsPage.advancedTitle": "3. Orientation and state",
    "tabsPage.advancedBody":
      "In vertical orientation, the arrows move along the rail. With manual activation, moving focus does not change the panel: Enter or Space confirms the selection. The event updates the live region below the component.",
    "tabsPage.advancedLabel": "Vertical Tabs with manual control",
    "tabsPage.vanillaInitTitle": "Initializing vanilla",
    "tabsPage.vanillaInitBody":
      "<code>initComponents</code> connects Tabs. Icons mount separately with the set the application chooses.",
    "tabsPage.contractItem1": "The root uses <code>data-sk-tabs</code> and keeps the active value in <code>data-value</code>.",
    "tabsPage.contractItem2": "Every trigger and panel declares the same <code>data-value</code>.",
    "tabsPage.contractItem3": "<code>data-disabled</code> removes an option from interaction.",
    "tabsPage.contractItem4": '<code>data-orientation="vertical"</code> changes the navigation and indicator axis.',
    "tabsPage.contractItem5": '<code>data-activation-mode="manual"</code> separates focus from selection.',
    "tabsPage.contractItem6": "Vanilla emits <code>sk-value-change</code>; React exposes <code>onValueChange</code>.",
    "tabsPage.reactBody":
      "The component renders the same anatomy from <code>items</code>. Use <code>value</code> and <code>onValueChange</code> when another piece of application state depends on the active tab.",
    "tabsPage.test1": "Connects the selected tab with its labelled panel.",
    "tabsPage.test2": "Mirrors selection on the root data attribute.",
    "tabsPage.test3": "Moves roving focus with ArrowRight without changing manual selection.",

    "tagPage.description": "Tag: an optionally removable keyword chip, with tones and a React component.",
    "tagPage.lede":
      'Tag classifies content the user can act on: filters, facets, chips. Where <a href="/en/components/badge">Badge</a> is a read-only status label, Tag is more squared (control radius, not a pill) to read as actionable, and can carry a remove button.',
    "tagPage.body":
      "When removable, the label and the remove button are two separate targets: the control's accessible name names the tag it removes.",
    "tagPage.xTitle": "The X is a Button, not a drawing of one",
    "tagPage.xBody1":
      'The remove control is a real <a href="/en/components/button">Button</a> (<code>sk-button sk-interactive</code> with <code>data-size="sm"</code>, <code>data-icon-only</code>, and <code>data-variant="ghost"</code>), and <code>sk-tag__remove</code> is only the modifier that shrinks it to the capsule\'s height. Tag ships no interaction of its own.',
    "tagPage.xBody2":
      'What that buys is what no longer has to be maintained here: hover and press come from the <a href="/en/state-layer">state layer</a>, the focus ring is the same one every control uses, and the touch target reaches <strong>44px</strong> through the button\'s <code>::after</code> even though the face paints at 20px. It used to be 20px of face and 20px of usable slack.',
    "tagPage.xBody3":
      "The color still comes from <code>currentColor</code>, so every tone carries its own X in its own color with no rule per tone.",
    "tagPage.reactBody": "The code is in the preview's <strong>React</strong> tab. <code>onRemove</code> is optional.",
    "tagPage.test1": "Carries its tone and label.",
    "tagPage.test2": "Exposes a named remove control only when onRemove is given.",

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
    "textPage.contractItem3": "<code>data-tone</code>: <code>primary</code>, <code>secondary</code>, <code>tertiary</code>, or <code>danger</code>.",
    "textPage.contractItem4": "<code>data-weight</code>: <code>body</code>, <code>emphasis</code>, or <code>label</code>.",
    "textPage.contractItem5":
      "<code>data-role</code>: <code>eyebrow</code> (uppercase overline) or <code>subtitle</code> (line below a title). A role composes several axes at once; in React it is passed as <code>data-role</code>.",
    "textPage.contractItem6": "In React, <code>as</code> accepts <code>p</code>, <code>div</code>, or <code>span</code>; the default is <code>p</code>.",
    "textPage.contractItem7": "For headings, use Heading and an <code>h1</code>–<code>h6</code> element, not Text.",
    "textPage.test1": "Keeps Text semantic and applies its named reading role.",

    "themeTogglePage.description": "Theme Toggle: cycles color mode system → light → dark and re-themes with color-scheme.",
    "themeTogglePage.lede":
      "Theme Toggle cycles the <strong>color mode</strong> (system → light → dark → system). It is a ghost, icon-only Button with three stacked faces; on click it writes <code>data-scheme</code> and <code>color-scheme</code> on <code>&lt;html&gt;</code> so <code>light-dark()</code> re-themes. Its size is Button's own: <strong>md</strong> (default) or <code>data-size=\"sm\"</code> / <code>size=\"sm\"</code>. Persistence is the app's job.",
    "themeTogglePage.previewNote": "md · sm",
    "themeTogglePage.contractItem1":
      "The faces use the stable <code>mode-system</code>, <code>mode-light</code>, and <code>mode-dark</code> roles, marked with <code>data-sk-theme-toggle-icon</code>.",
    "themeTogglePage.contractItem2": "The enhancer applies the mode on <code>document.documentElement</code> and fires <code>sk-theme-toggle-change</code> with <code>detail.value</code>.",
    "themeTogglePage.contractItem3":
      'A FOUC script in the <code>&lt;head&gt;</code> must read the stored preference and paint <code>data-scheme</code> / <code>color-scheme</code> before the first paint (see <a href="/en/first-component">First component</a>).',
    "themeTogglePage.test1": "Mounts once and cycles system → light → dark on click.",
    "themeTogglePage.test2": "Dispatches sk-theme-toggle-change with the new mode.",
    "themeTogglePage.test3": "Keeps every ThemeToggle in sync when one cycles.",

    "tilePage.description": "A visual pattern for a single interaction; Box for static surfaces or several controls.",
    "tilePage.lede": 'Strict invariant: every Tile has exactly one interactive intent. A Tile is never a static surface. For static content or several independent controls, use <a href="/en/components/box">Box</a>.',
    "tilePage.body1": "Tile is a visual recipe the semantic components apply over the correct native element. TileLink, TileButton, TileCheckbox, TileSwitch, and TileRadioGroup's demos and contracts live beside Link, Button, Checkbox, Switch, and RadioGroup.",
    "tilePage.body2": 'The <a href="/en/components/card">Card</a> guide compares these roots against Box across real content, news, product, link, action, selection, and metric cards.',
    "tilePage.chooseTitle": "Choose by behavior",
    "tilePage.headNeed": "Need",
    "tilePage.headComponent": "Component",
    "tilePage.headNative": "Native contract",
    "tilePage.row1Need": "Static content or several controls",
    "tilePage.row1Native": "Whatever element the consumer chooses.",
    "tilePage.row2Need": "Navigate to a destination",
    "tilePage.row2Native": '<code>TileLink</code> uses <code>&lt;a href&gt;</code>',
    "tilePage.row3Need": "Run an action",
    "tilePage.row3Native": '<code>TileButton</code> uses <code>&lt;button type="button"&gt;</code>',
    "tilePage.row4Need": "Select independently",
    "tilePage.row4Native": '<code>TileCheckbox</code> uses <code>&lt;input type="checkbox"&gt;</code>',
    "tilePage.row5Need": "A binary preference with immediate effect",
    "tilePage.row5Native": '<code>TileSwitch</code> uses <code>&lt;input type="checkbox" role="switch"&gt;</code>',
    "tilePage.row6Need": "Choose an exclusive option",
    "tilePage.row6Native": '<code>TileRadioGroup</code> uses <code>&lt;input type="radio"&gt;</code>',
    "tilePage.row7Need": "Show or hide details (one or several)",
    "tilePage.row7Native": '<code>&lt;button&gt;</code> trigger; one or several Tile disclosures',
    "tilePage.contractsTitle": "Contracts",
    "tilePage.contractItem1": "Link and button need no enhancer: the browser already provides their behavior.",
    "tilePage.contractItem2":
      "Checkbox, switch, radio group, and Accordion keep real inputs or a real button. Their Vanilla enhancers read the <code>data-part</code> hooks documented on the semantic components. A single disclosure is Accordion with one item.",
    "tilePage.contractItem3":
      'Never nest interactive controls inside a Tile. If independent actions are needed, use <a href="/en/components/box">Box</a> and leave the controls as siblings.',
    "tilePage.contractItem4": "The React bindings render the same semantic contract; they never mount the Vanilla enhancer.",
    "tilePage.contractItem5":
      "Every Tile accepts <code>data-padding</code> with <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, or <code>xl</code>; React exposes the same value as <code>padding</code>. The default is <code>md</code>.",
    "tilePage.test1": "Renders every React Tile root with an explicit interactive or disclosure variant.",
    "tilePage.test2": "Renders the shared title and description anatomy for selectable tiles.",
    "tilePage.test3": "Supports uncontrolled checkbox changes.",

    "timeFieldPage.description": "A segmented time field: hour, minute, and AM/PM as independent, editable, keyboard-operable parts.",
    "timeFieldPage.lede":
      "A field for a local clock time, no date, no timezone. Hour, minute, and (in a 12-hour locale) AM/PM are three independent editable segments in a single field, instead of the native <code>&lt;input type=\"time\"&gt;</code>'s own chrome, which differs enough between Chrome, Firefox, and Safari that it cannot be styled or trusted to look the same twice. There is no <code>@zag-js/time-picker</code> machine, so this component is hand-rolled state, like Slider and Segmented, but there is no popover either: an earlier version put a wheel picker behind a trigger, and it turned out to be neither simpler nor more accessible than building the segments directly.",
    "timeFieldPage.contractBody":
      "The order of the segments and the separator between them are read from <code>Intl.DateTimeFormat</code>'s own <code>formatToParts</code>, never assumed: some locales put the period of day before the hour, and the separator is not always <code>\":\"</code>. The public value stays the canonical <code>HH:mm</code> string, the same shape a plain <code>&lt;input type=\"time\"&gt;</code> sends, carried in a hidden input, so a form behind TimeField never has to parse a locale-dependent string. React keeps it as component state (<code>value</code>/<code>defaultValue</code>, an <code>onValueChange</code> callback). Vanilla hydrates the authored <code>data-sk-time-field</code>: the consumer only authors the root and its label, and the component generates the segments from <code>data-locale</code>.",
    "timeFieldPage.editTitle": "Editing a segment",
    "timeFieldPage.editBody":
      'Typing a digit fills the focused segment and advances as soon as no other digit could keep it valid: typing <kbd class="sk-kbd">1</kbd> in a 12-hour field\'s hour segment briefly waits for a possible second digit (<code>10</code>–<code>12</code>), typing <kbd class="sk-kbd">9</kbd> advances immediately, because no second digit could follow it and stay ≤ 12. The up/down arrows raise or lower the value and wrap at the ends; <kbd class="sk-kbd">Backspace</kbd> clears the segment; <kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> move between segments; typing the locale\'s AM/PM label\'s first letter in that segment sets it directly.',
    "timeFieldPage.nativeTitle": "If you only need the platform's own picker",
    "timeFieldPage.nativeBody":
      'A plain <code>&lt;input type="time"&gt;</code> still works, needs no CSS or JavaScript, and comes with the operating system\'s own keyboard and picker for free. Move up to TimeField only once that picker\'s cross-browser inconsistency, or the total absence of styling hooks, actually costs you something — the same decision DatePicker makes against a plain <code>type="date"</code>.',
    "timeFieldPage.nativeLabel": "Native time input",
    "timeFieldPage.a11yBody":
      "Every segment is a <code>role=\"spinbutton\"</code> inside a <code>role=\"group\"</code> named by the field's label: <code>aria-valuenow</code>/<code>aria-valuetext</code> carry its current value (a friendly placeholder like \"hh\" before anything is set, never an empty string), and <code>aria-valuemin</code>/<code>aria-valuemax</code> carry its real range: 1–12 for an hour segment in a 12-hour locale, 0–23 in a 24-hour one. Every segment is its own tab stop, the same way a native multi-part date input already works, so keyboard use needs nothing beyond Tab and the arrows documented above.",
    "timeFieldPage.test1": "Mounts once and names the group from the authored label.",
    "timeFieldPage.test2": "Derives the segments from the locale, not from the markup.",
    "timeFieldPage.test3": "Starts empty, with placeholders instead of a made-up time.",

    "toastPage.description": "Toast: transient feedback in a floating region. Same anatomy as Callout, with the app's own lifecycle.",
    "toastPage.lede":
      'Toast communicates transient feedback in a floating region. The item is a <a href="/en/components/callout">Callout</a>, same markup, same tones, wrapped in <code>sk-toast-region</code> and in the toast\'s own lifecycle (mount, dismiss, optional timeout).',
    "toastPage.emitTitle": "After an action",
    "toastPage.emitBody":
      "This is the real case: a toast is never authored already visible, it appears because something happened. What stays stable in the HTML are three pieces: the control that fires the action, an <strong>empty</strong> <code>sk-toast-region</code>, and a <code>&lt;template&gt;</code> holding the item. The app clones, inserts, and mounts again; <code>initComponents</code> is idempotent, so it only touches what was just inserted.",
    "toastPage.emitLabel": "Toast after an action",
    "toastPage.emitNote": "Press the button",
    "toastPage.simpleTitle": "Simple",
    "toastPage.simpleBody":
      'tone="neutral" (the default). In a toast, color should almost never be the primary signal: it already floats and retires. Neutral lets the text carry the notice without painting extra urgency, and it floats over a <strong>raised</strong> surface (<code>--color-bg-surface-raised</code> + <code>--elevation-raised</code>) to read as elevated chrome, not a page panel. See the same rule in <a href="/en/components/callout">Callout</a>.',
    "toastPage.simpleLabel": "Simple toast",
    "toastPage.statusTitle": "With state",
    "toastPage.statusBody1": 'Status tones color the panel. <code>danger</code> announces as <code>role="alert"</code> (assertive); the rest as <code>role="status"</code> (polite).',
    "toastPage.statusBody2":
      "The first carries no ✕: it has <code>data-timeout</code>, so it retires on its own. The other two ask something of the person — a rollout to confirm, an error to read — and so they stay until dismissed. The practical rule: <strong>if a toast can close itself, it needs no ✕; if it cannot, the ✕ is mandatory</strong>.",
    "toastPage.statusLabel": "Toast with state",
    "toastPage.actionTitle": "With an action",
    "toastPage.actionBody":
      "<code>sk-callout__actions</code> is a single column: the recovery action and the close control live there, in that order. A toast with an action carries no <code>data-timeout</code> — disappearing before someone can reach \"Undo\" turns the action into decoration.",
    "toastPage.actionLabel": "Toast with an action",
    "toastPage.stackTitle": "Stacked",
    "toastPage.stackBody1":
      "It is the <strong>default behavior</strong>, not an opt-in setting: four loose toasts eat a quarter of the screen, and nobody asks for that on purpose — a region with several toasts is the normal result of an app reporting what it did. Toasts overlap on the footprint of <strong>one</strong>, the newest in front and the earlier ones peeking out behind; hovering the pointer (or entering focus by keyboard) opens the stack back into a normal list.",
    "toastPage.stackBody2":
      "The escape hatch is <code>data-stack=\"off\"</code>, for the rare region whose <em>goal</em> is showing several messages at once. The tones example above uses it: those are three toasts meant to be seen together, not a stack.",
    "toastPage.stackBody3":
      "It groups on the box of the <strong>newest</strong> one: it is the only one that stays in flow, so the region measures whatever it measures, and the ones behind leave flow stretched to that same box. That is why the stack reads as one object instead of a fan of uneven cards: if each measured its own content, a two-line toast sitting behind a one-line one would poke out above, and no stack edge would line up with the next.",
    "toastPage.stackBody4":
      "The only number driving the effect is <strong>depth</strong>, and it comes straight from the DOM: <code>sibling-count() - sibling-index()</code> gives 0 for the newest and one more per toast behind it. The app appends and removes nodes, never keeps an index. Opacity fades out on its own by the fourth (<code>calc(3 - depth)</code> clamps), and where the browser cannot read the sibling index in CSS, the region falls back to the plain list above, which is the honest degradation.",
    "toastPage.stackBody5":
      "That same depth is the <strong>delay</strong> for each step on open (<code>--sk-toast-cascade</code>): the front one leaves first and each one behind follows a beat later, so the stack unfurls instead of inflating all at once. Returning to flow is a <em>layout</em> change, and layout does not transition — the instant they stop being absolute they are already several rows higher; that cannot be interpolated, so instead of animating the jump, it gets covered: every toast enters with a fade and a few pixels of rise into the spot it just took, on the same cascade. The newest one never participates — it never moved, and it must not flicker.",
    "toastPage.stackLabel": "Toast stack",
    "toastPage.stackNote": "Hover to open it",
    "toastPage.stackBody6":
      "The JavaScript is the same as the first example, and so is the HTML: clone, insert, mount, and remove on <code>sk-dismiss</code>. There is nothing extra to add for stacking. The hooks belong to the region: <code>--sk-toast-peek</code> (how much each one peeks out), <code>--sk-toast-shrink</code> (how much each step back shrinks), and <code>--sk-toast-cascade</code> (how far apart they open in time). No toast knows it is in a stack.",
    "toastPage.closeTitle": "The close control is a Button",
    "toastPage.closeBody1":
      'The ✕ is built as an icon-only <a href="/en/components/button">Button</a> at <code>sm</code> size (<code>data-size="sm" data-icon-only data-variant="ghost"</code>), not an ad hoc control. That way it inherits what Button already solved: the 32px face, the 44px hit target <code>::after</code> expands past that face, the hover/press state layer, and focus. With no visible text, <code>aria-label</code> is mandatory.',
    "toastPage.closeBody2":
      "It also carries the <code>sk-toast__dismiss</code> part class — Toast's own, not borrowed from Callout: it is the hook the enhancer looks for to wire up the dismiss, the one that makes the glyph read the tone's own color (<code>currentColor</code>) instead of the accent a normal ghost would paint, and the one that fixes the <strong>optical position</strong>. An icon-only ghost is almost all air: a 16px glyph inside a 32px box, plus the panel's own inset, leaves the ✕ floating in a gap. The part pulls it back half an inset unit, so the <em>glyph</em> lands where the padding says the content's edge is, without the click area losing a single pixel.",
    "toastPage.lifecycleTitle": "The lifecycle belongs to the app",
    "toastPage.lifecycleBody1":
      'Toast manages no queues and no persistence: those lifecycles belong to the application. The component supplies the region, reuses <a href="/en/components/callout">Callout</a>\'s anatomy — icon, title, description, actions — plus its own dismiss, announces the tone, and signals when it wants to leave.',
    "toastPage.lifecycleBody2":
      '\nIn Vanilla, <code>data-sk-toast</code> on a <code>sk-callout</code> registers the native dismiss and announces the tone. <code>data-timeout</code> is optional; on expiry it fires <code>sk-dismiss</code> (same as the ✕) with <code>detail.reason</code>, <code>"timeout"</code> or <code>"dismiss"</code>, in case the app distinguishes "it left on its own" from "someone closed it." The component never removes the node: whoever placed it does that.',
    "toastPage.reactBody":
      'The code is in each preview\'s <strong>React</strong> tab. The API mirrors Callout\'s (<code>title</code>, <code>icon</code>, <code>actions</code>, <code>tone</code>) plus <code>timeout</code> and <code>onDismiss</code> with a reason. With no <code>tone</code>, it is neutral.',
    "toastPage.vanillaComment": "Icons are written as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "toastPage.test1": "Applies the shared live-region semantics and reports native button dismissal.",
    "toastPage.test2": "Only schedules authored timeouts and clears them during cleanup.",
    "toastPage.test3": "Mounts authored toast markup through the registry enhancer.",

    "tocPage.description": "Toc: the index of a long document. Lists its sections (h2/h3) and marks the current one with a scroll-spy.",
    "tocPage.lede":
      'A document\'s index: a list of links to its sections (<code>h2</code>/<code>h3</code>), with the current one marked by a scroll-spy. Every row is a link carrying <a href="/en/state-layer"><code>sk-interactive</code></a> (state layer) at caption size: an index gets scanned, not read, and at prose size it competed with the document it indexes. The icon is optional.',
    "tocPage.anatomyTitle": "Anatomy",
    "tocPage.anatomyBody": "Root <code>&lt;aside&gt;</code>, a <code>&lt;details&gt;</code> as the disclosure's shell, and inside it a <code>&lt;nav&gt;</code> with the link list.",
    "tocPage.anatomyLabel": "Text",
    "tocPage.levelsTitle": "Levels",
    "tocPage.levelsBody":
      "An <code>h3</code> is marked <code>data-level=\"h3\"</code> and indents under its <code>h2</code>. The link carries the indent, never the item: on the item it would shift the row's own leading edge and, with it, the column where the current-section mark is painted, which would stop being one straight vertical line.",
    "tocPage.levelsLabel": "h2 and h3",
    "tocPage.iconsTitle": "Icons",
    "tocPage.iconsBody": "The link accepts a decorative icon ahead of the label: the label already names the destination, so the icon carries no accessible name of its own.",
    "tocPage.iconsLabel": "With icons",
    "tocPage.iconsCodeLabel": "link with an icon",
    "tocPage.railTitle": "Rail or disclosure",
    "tocPage.railBody1":
      "The contract publishes ONE shape: an interactive, closed <code>&lt;details&gt;</code> — the platform's own behavior, for free. It is a consumer with column to spare that turns it into an always-open, sticky <strong>rail</strong> beside the prose, the same way <code>sidebar</code> never decides on its own to become a drawer. On this site, that consumer is the docs shell: below <code>wide</code> the same <code>Toc</code> is the <strong>disclosure</strong> the contract already emits; from <code>wide</code> on, <code>shell.scss</code> forces it open and inert.",
    "tocPage.railBody2":
      "<code>&lt;details&gt;</code> is what makes that switch cheap: the open state, the toggle, the keyboard, and the accessibility all belong to the platform. As a disclosure, the rows carry their own gutter instead of the container: the touch target reaches both edges of the screen while the text stays in the document's own margin.",
    "tocPage.spaceTitle": "Reserved space",
    "tocPage.spaceBody":
      "On this site the grid's track is the TOC's own width (<code>--docs-toc-inline-size</code>). The <code>&lt;aside&gt;</code> always stays in flow: before <code>data-ready</code> the list stays invisible at a minimum height, so the links never push the layout around when they appear.",
    "tocPage.clsTitle": "No CLS",
    "tocPage.clsBody":
      "A tree already knows its items when it is composed: that is the case above. This site's real shell does not discover them in the browser either: a static page's headings are the same for every reader, so computing them on every load means paying every time for a fact that was already true at build time. The layout renders the page's body to HTML (<code>Astro.slots.render</code>), reads its own sections there, and hands them over as <code>items</code>: the list travels in the HTML, with the <code>id</code>s already set on the headings. With no sections, it marks <code>data-empty</code>.",
    "tocPage.clsCodeLabel": "in the layout",
    "tocPage.clsBody2":
      "The only thing left in the browser is what cannot be known before there is a reader: the scroll-spy, and pages whose index depends on state (Accordion's own page builds one per tab, so the layout marks it <code>pending</code> and leaves the list to its own script).",
    "tocPage.clsBody3":
      "Once mounted, the same enhancer wires up the rail/disclosure switch and the scroll-spy that marks <code>aria-current</code> based on which section crosses the viewport's top band: <code>connectToc</code>, behind <code>data-sk-toc</code>.",
    "tocPage.contractItem1":
      'Root: <code>&lt;aside class="sk-toc" data-sk-toc&gt;</code> with a <code>&lt;details class="sk-toc__inner" data-sk-toc-disclosure&gt;</code> inside: <code>&lt;summary class="sk-toc__summary"&gt;</code> and <code>&lt;ul class="sk-toc__list"&gt;</code>.',
    "tocPage.contractItem2": "Shape: one only, a closed <code>&lt;details&gt;</code>. A sticky rail is a consumer decision, not the contract's (see above).",
    "tocPage.contractItem3":
      "Every item: <code>sk-toc__item</code> with its own <code>data-level</code>. The link is <code>sk-toc__link sk-interactive</code>, with the label in <code>sk-toc__label</code> and a leading gutter (<code>--sk-toc-gutter</code>) where the current-section mark lives.",
    "tocPage.contractItem4": 'Optional icon: <code>&lt;span class="sk-toc__icon"&gt;</code> as the link\'s first child.',
    "tocPage.contractItem5": 'Active state: <code>aria-current="true"</code> on the link, written by the scroll-spy at runtime.',
    "tocPage.test1": "Names the nav after the caption and levels each item.",
    "tocPage.test2": "Seeds aria-current from the composition before the spy reports.",
    "tocPage.test3": "Moves aria-current as headings enter the band.",

    "toolbarPage.description": "Groups related controls and lets you move through them with arrows.",
    "toolbarPage.contractBody": "Toolbar groups controls; it does not replace Navbar or Menu. Internal groups use role=group.",
    "toolbarPage.a11yBody": "Arrows move through controls; Home and End jump to the ends. Tab enters and exits the bar.",
    "toolbarPage.compositeTitle": "Toolbar with composite widgets",
    "toolbarPage.compositeBody":
      "A group does not have to be loose buttons: it can be a whole composite widget, like a Segmented. The bar treats every composite widget as <strong>a single stop</strong>: Segmented's own roving tabindex already leaves one option at <code>tabindex=\"0\"</code>, so Toolbar only ever visits that one. Inside the Segmented, arrows navigate its own options; they never escape to the bar's next group. This is the real pattern this site's own component preview header uses: the screen-size selector and the Vanilla/React toggle on every demo on this page are two Segmenteds inside a Toolbar.",
    "toolbarPage.compositeLabel": "Toolbar with a nested Segmented",

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

    "wrapperPage.description": "Wrapper: a page column with a width ceiling from a scale.",
    "wrapperPage.lede":
      "Wrapper is the page column: a centered max width, with inline padding. It is what others call a <em>container</em>, but that name already belongs to <em>container queries</em>, so here the role is called <strong>wrapper</strong>. Size is a <strong>scale</strong> (<code>sm</code>, <code>md</code>, <code>lg</code>, <code>full</code>), not a usage name: the ceiling says how wide the column can grow; whoever writes it decides what job it does.",
    "wrapperPage.ceilingTitle": "A width ceiling",
    "wrapperPage.ceilingBody":
      'Every size is a distinct <strong>width ceiling</strong>: the column centers and stops growing once it reaches it. Below, a Wrapper with <code>data-size="sm"</code>: the margin on both sides is the ceiling doing its job.',
    "wrapperPage.belowBody":
      "Below its ceiling, any wrapper is simply <code>100%</code>, which is why on a narrow screen all four sizes look the same, and they only diverge once there is room. The ceilings are stable: density changes spacing and controls, never the column's own maximum width.",
    "wrapperPage.tableTitle": "The four ceilings",
    "wrapperPage.tableHeadSize": "Size",
    "wrapperPage.tableHeadCeiling": "Ceiling",
    "wrapperPage.tableRow1": "42rem",
    "wrapperPage.tableRow2": "64rem · default",
    "wrapperPage.tableRow3": "90rem",
    "wrapperPage.tableRow4": "no ceiling, the full viewport",
    "wrapperPage.siteTitle": "On this site",
    "wrapperPage.siteBody":
      'This documentation wraps itself, in two steps. The header and the three-column shell both carry <code>data-size="lg"</code> (and the site tunes the ceiling to its own value), so one single number keeps their edges aligned. The column you are reading is <code>md</code>: the <code>&lt;main&gt;</code> carries <code>data-size="md"</code> and its ceiling is the token, not a copied number. And a full-screen tool, like the configurator, drops the wrapper entirely.',
    "wrapperPage.contractItem1": 'In HTML, add <code>sk-wrapper</code> to the element bounding the column.',
    "wrapperPage.contractItem2":
      '<code>data-size</code> accepts <code>sm</code>, <code>md</code> (default), <code>lg</code>, or <code>full</code> (no ceiling).',
    "wrapperPage.contractItem3": 'The ceilings are tier-2 tokens: <code>--size-wrapper-sm</code>, <code>--size-wrapper-md</code>, <code>--size-wrapper-lg</code>.',
    "wrapperPage.contractItem4":
      'The only hook a consumer tunes is <code>--sk-wrapper-max</code>, for a width the scale does not yet name, without reimplementing the centering or the padding.',
    "wrapperPage.test1": "Renders Wrapper as a page column on the size scale.",

    "treeViewPage.description": "Expandable hierarchies with single or multiple selection.",
    "treeViewPage.lede":
      'A hierarchy you move through with the keyboard: branches open and close, nodes get selected. Use TreeView when the parent-child relationship <em>is</em> the content: files, categories, an organization. For sibling disclosures with no hierarchy use <a href="/en/components/accordion">Accordion</a>; to navigate between sections, <a href="/en/components/sidebar">Sidebar</a>.',
    "treeViewPage.minimalTitle": "Minimal tree",
    "treeViewPage.minimalBody":
      "The minimum is the complete anatomy and nothing else: a root, the list, and for every node a branch (<code>branch</code> + <code>branch-control</code> + <code>branch-content</code>) or a leaf (<code>item</code>). With no state attributes, everything starts closed and unselected.",
    "treeViewPage.minimalLabel": "Minimal TreeView",
    "treeViewPage.initialTitle": "Initial state",
    "treeViewPage.initialBody":
      "<code>data-expanded-value</code> and <code>data-selected-value</code> list the <code>data-value</code>s that start open and selected. They accept spaces or commas as a separator, and are only the <em>initial</em> state: from there the machine takes over.",
    "treeViewPage.initialLabel": "Open and selected from the start",
    "treeViewPage.multipleTitle": "Multiple selection",
    "treeViewPage.multipleBody":
      'data-selection-mode="multiple" lets you mark several nodes with <kbd class="sk-kbd">Ctrl</kbd>/<kbd class="sk-kbd">⌘</kbd> and extend the range with <kbd class="sk-kbd">Shift</kbd>. Branches nest with no limit: a branch is a node with <code>branch-content</code>, whatever its depth, and the vertical guide marks which one each level hangs from.',
    "treeViewPage.multipleLabel": "Multiple selection and three levels",
    "treeViewPage.disabledTitle": "Disabled nodes",
    "treeViewPage.disabledBody":
      "A node with <code>disabled</code> cannot be selected or receive focus, but it still reads. A disabled branch does not open either, so do not use it to hide content: for that, do not author it in the first place.",
    "treeViewPage.disabledLabel": "Disabled node",
    "treeViewPage.eventsTitle": "Icons and events",
    "treeViewPage.eventsBody":
      "TreeView reserves one column for the expand control and another for a structural icon. Pass <code>branchIcon</code> for every folder and <code>leafIcon</code> for every file: no need to invent an icon per extension or data type. Selection and expansion get listened to as events on the root.",
    "treeViewPage.eventsLabel": "Files with icons",
    "treeViewPage.contractItem1": 'The root is authored with <code>data-sk-tree-view</code> and <code>class="sk-tree-view"</code>; its <code>aria-label</code> names the tree.',
    "treeViewPage.contractItem2":
      "The list carries <code>data-sk-tree-view-tree</code>. Every direct child is a branch (<code>data-sk-tree-view-branch</code>) or a leaf (<code>data-sk-tree-view-item</code>).",
    "treeViewPage.contractItem3":
      "A branch contains its control (<code>data-sk-tree-view-branch-control</code>, with an indicator and text) and its content (<code>data-sk-tree-view-branch-content</code>), which is another list of branches and leaves.",
    "treeViewPage.contractItem4":
      "<code>data-value</code> identifies the node: it is what shows up in events and in <code>data-expanded-value</code> / <code>data-selected-value</code>. It is unique across the whole tree; without it, the enhancer derives an id from position, which breaks when the markup gets reordered.",
    "treeViewPage.contractItem5": "Every clickable row carries <code>sk-interactive</code>: that is where hover, focus, pressed, selection, and the focus ring come from. The component paints no states on its own.",
    "treeViewPage.contractItem6":
      "Events on the root: <code>sk-selection-change</code> with <code>detail.selectedValue</code>, and <code>sk-expanded-change</code> with <code>detail.expandedValue</code>, both arrays of <code>data-value</code>.",
    "treeViewPage.hooksBody":
      "Indent, row inset, and the vertical guide are hooks: the tree ships narrow on purpose, because the indent gets paid once per level. Widen the step, give the rows more air, or turn off the guide without touching the rest.",
    "treeViewPage.a11yBody":
      'The machine publishes <code>role="tree"</code>/<code>treeitem</code> with each node\'s level and position, and manages the keyboard: arrows to move, <kbd class="sk-kbd">→</kbd>/<kbd class="sk-kbd">←</kbd> to open and close branches, <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd>, and letter typeahead. Focus is roving: the whole tree is a single tab stop, not one per node.',
    "treeViewPage.test1": "Patches tree semantics onto authored markup and mounts once.",
    "treeViewPage.test2": "Expands a branch from its control and says so.",
    "treeViewPage.test3": "Selects a leaf and reports the value the composition wrote.",

    "treegridPage.description": "Hierarchical rows with columns: expand or collapse one without losing the rest of its values.",
    "treegridPage.lede":
      'Combines hierarchy and columns at once — the WAI-ARIA <code>treegrid</code> pattern. Use it when every row needs several independent values IN ADDITION to its place in the hierarchy (a message with a sender, a file with a size and a date). For a single column of hierarchical text use <a href="/en/components/tree-view">TreeView</a>; for columns with no hierarchy, <a href="/en/components/table">Table</a>.',
    "treegridPage.minimalTitle": "Inbox",
    "treegridPage.minimalBody":
      "The exact example the WAI-ARIA spec itself uses: two columns (Subject, From), a folder that starts open with two messages, a collapsed folder whose one message stays hidden, and a loose message at the root.",
    "treegridPage.minimalLabel": "Sample inbox",
    "treegridPage.contractItem1":
      "Almost always wrapped in <code>TreegridScroll</code> — the same reason as <code>TableScroll</code>: a flex or grid parent gives it <code>min-size: auto</code>, and a grid wider than its space blows the surface open if nothing wraps it.",
    "treegridPage.contractItem2":
      '<code>Treegrid</code> is a <code>&lt;table role="treegrid"&gt;</code> that REQUIRES <code>label</code> — that role carries no implicit accessible name, unlike a native table.',
    "treegridPage.contractItem3":
      "<code>TreegridHead</code> / <code>TreegridHeadRow</code> / <code>TreegridColumnHeader</code> are plain column headers — the same shape <code>Table</code> already has.",
    "treegridPage.contractItem4":
      "Each <code>TreegridRow</code> is authored FLAT, in document order — never nested inside another row, a <code>&lt;tr&gt;</code> cannot contain a <code>&lt;tr&gt;</code>. <code>level</code>, <code>setSize</code>, and <code>posInset</code> are facts the author already knows from writing the row in that order, not something the component derives.",
    "treegridPage.contractItem5":
      "<code>expanded</code> is only authored on a row that HAS children — its absence, not a <code>false</code> value, is what marks a row a leaf. <code>true</code>/<code>false</code> controls whether its descendants are currently visible.",
    "treegridPage.contractItem6":
      'Each <code>TreegridCell</code> is a plain <code>&lt;td role="gridcell"&gt;</code>; the first cell of a row with children gets the indent from CSS and a real disclosure button the binding inserts — never authored, and decorative to a screen reader (the row\'s own <code>aria-expanded</code> already announces the state).',
    "treegridPage.contractItem7":
      '<code>resizableColumns</code> (off by default) inserts a real <code>role="separator"</code> between every pair of column headers — the same shared <code>@skryensya/core/splitter</code> primitive Sidebar\'s own separator uses. Requires <code>resizeLabel</code>: the separator is binding-inserted, so nothing else names it for a screen reader.',
    "treegridPage.hooksBody":
      "Per-level indent and the width reserved for the disclosure glyph are hooks: <code>--sk-treegrid-indent</code> and <code>--sk-treegrid-indicator-size</code>.",
    "treegridPage.a11yBody":
      'Every row carries <code>role="row"</code> with <code>aria-level</code>/<code>aria-setsize</code>/<code>aria-posinset</code> — STATIC facts that never change when a sibling collapses, only visibility does — plus <code>aria-expanded</code> only when it has children. Every cell carries <code>role="gridcell"</code>. Focus is roving: a single row or cell is the tab stop for the whole grid. <kbd class="sk-kbd">→</kbd> expands a collapsed branch or enters its first cell; <kbd class="sk-kbd">←</kbd> collapses an open branch or moves up to the parent row; <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd> move between visible rows; <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> and <kbd class="sk-kbd">Ctrl</kbd>+<kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> jump to the start/end; <kbd class="sk-kbd">Enter</kbd> toggles a branch with row focus, or activates any other focus. This version is faithful to WAI\'s base example (<code>treegrid-1</code>): text-only cells, no interactive control of its own inside a cell — which is why <kbd class="sk-kbd">Tab</kbd> always just leaves the grid, with nothing to intercept.',
    "treegridPage.testVanilla1":
      "On mount, hides the one child of the branch that starts collapsed.",
    "treegridPage.testVanilla2":
      "Right Arrow on a collapsed branch expands it and reveals its child, without moving the row's focus.",
    "treegridPage.testVanilla3":
      "Clicking a branch's first cell toggles it and moves focus to the row.",
    "treegridPage.testReact1":
      "Honors each row's initial <code>expanded</code>, and hides only the collapsed branch's own descendant.",
    "treegridPage.testReact2":
      "Left Arrow on an open branch collapses it and hides its children.",
    "treegridPage.testReact3": "Enter activates a focused leaf row.",

    "treegridPage.stressTitle": "File explorer (stress test)",
    "treegridPage.stressBody":
      "Four columns instead of two, long content that forces ellipsis in more than one column, seven levels deep (the first five with their own CSS rule, the sixth and seventh falling back to the shared ceiling), collapsed branches at more than one level at once — including one at the root — and <code>resizableColumns</code>: drag or use the arrow keys on a header's edge to resize the pair of columns on either side.",
    "treegridPage.stressLabel": "Sample file explorer",

    "demo.treegrid.label": "Messages",
    "demo.treegrid.subject": "Subject",
    "demo.treegrid.from": "From",
    "demo.treegrid.inbox": "Inbox",
    "demo.treegrid.meeting": "Team meeting",
    "demo.treegrid.lunch": "Lunch",
    "demo.treegrid.drafts": "Drafts",
    "demo.treegrid.untitled": "Untitled",
    "demo.treegrid.me": "Me",
    "demo.treegrid.sent": "Sent",

    "demo.treegridStress.label": "File explorer",
    "demo.treegridStress.resizeLabel": "Resize column",
    "demo.treegridStress.colName": "Name",
    "demo.treegridStress.colType": "Type",
    "demo.treegridStress.colSize": "Size",
    "demo.treegridStress.colModified": "Modified",
    "demo.treegridStress.typeFolder": "Folder",
    "demo.treegridStress.typeTs": "TypeScript file",
    "demo.treegridStress.typeTest": "Test file",
    "demo.treegridStress.typeStyle": "Stylesheet",
    "demo.treegridStress.typeConfig": "Config",
    "demo.treegridStress.typeMarkdown": "Markdown document",
    "demo.treegridStress.typeText": "Text document",
    "demo.treegridStress.projectAlpha": "project-alpha",
    "demo.treegridStress.src": "src",
    "demo.treegridStress.components": "components",
    "demo.treegridStress.buttonFolder": "Button",
    "demo.treegridStress.buttonTsx": "Button.tsx",
    "demo.treegridStress.internalTypesFolder": "internal-types-for-the-component-with-extended-props",
    "demo.treegridStress.buttonPropsTs": "ButtonProps.ts",
    "demo.treegridStress.buttonTestTsx": "Button.test.tsx",
    "demo.treegridStress.buttonModuleCss": "Button.module.css",
    "demo.treegridStress.modalTsx": "Modal.tsx",
    "demo.treegridStress.utilsFolder": "utils",
    "demo.treegridStress.formatUtil": "format-currency-and-long-date-strings-for-every-supported-locale.ts",
    "demo.treegridStress.packageJson": "package.json",
    "demo.treegridStress.readme":
      "README-install-configure-and-deploy-instructions-for-the-whole-team.md",
    "demo.treegridStress.readmeModified": "3 weeks ago by Alice Fernández from the Design team",
    "demo.treegridStress.projectBeta": "project-beta",
    "demo.treegridStress.indexTs": "index.ts",
    "demo.treegridStress.license": "license.txt",
    "demo.treegridStress.modified2d": "2 days ago",
    "demo.treegridStress.modified3d": "3 days ago",
    "demo.treegridStress.modified4d": "4 days ago",
    "demo.treegridStress.modified1h": "1 hour ago",
    "demo.treegridStress.modified5h": "5 hours ago",
    "demo.treegridStress.modified1day": "1 day ago",
    "demo.treegridStress.modified1week": "1 week ago",
    "demo.treegridStress.modified1month": "1 month ago",
    "demo.treegridStress.modified6months": "6 months ago",

    "meterPage.description":
      "Meter: a measurement within a known range, never a task's completion.",
    "meterPage.lede":
      'A value measured right now, not a task in progress — the WAI-ARIA <code>meter</code> role, distinct from <code>progressbar</code>. Use it for disk usage, battery level, a rating on a scale. For a task\'s progress with a start and an end, use <a href="/en/components/progress">Progress</a>.',
    "meterPage.body":
      "Unlike Progress, <code>min</code> is a real parameter and often non-zero — a 1-to-5 rating, a temperature. The fill is computed with <code>meterFraction(value, min, max)</code>, not <code>value / max</code>.",
    "meterPage.test1": "Sets role=meter with the three required aria-value attributes.",
    "meterPage.test2": "Honors a non-zero min when painting the fill, unlike Progress.",
    "meterPage.a11yBody":
      'The <code>meter</code> role carries <code>aria-valuenow</code>/<code>aria-valuemin</code>/<code>aria-valuemax</code> always present, and an optional <code>aria-valuetext</code> for when the raw number alone is not enough ("50% (6 hours) remaining"). No keyboard interaction: it is a measurement, not a control.',

    "demo.meter.rating": "Rating",
    "demo.meter.ratingText": "4 out of 5 stars",
    "demo.meter.disk": "Disk usage",
    "demo.meter.diskText": "92% used",
    "demo.meter.battery": "Battery",
    "demo.meter.batteryText": "68% remaining",

    "feedPage.description":
      "Feed: a stream of independent posts, each announced with its own position.",
    "feedPage.lede":
      'A scrollable stream of independent content units (posts, comments) — the WAI-ARIA <code>feed</code> role. Each <code>FeedArticle</code> states its own position (<code>aria-posinset</code>/<code>aria-setsize</code>), so a screen reader announces "2 of 3" without reading the rest of the stream first.',
    "feedPage.body":
      'WAI-ARIA is explicit: the <code>feed</code> role "is not associated with any well-established keyboard conventions" — Page Up/Page Down/Ctrl+Home/Ctrl+End are recommendations, not requirements. This version stays purely static: no machine, no keyboard handling of its own.',
    "feedPage.test1": "Sets role=feed, names it, and reflects aria-busy.",
    "feedPage.test2":
      "Each article gets role=article with aria-posinset/aria-setsize and a real labelled name.",
    "feedPage.test3": "Allows setSize=-1 for an undetermined total, per WAI's own allowance.",
    "feedPage.a11yBody":
      'The root carries <code>role="feed"</code> with <code>aria-label</code> (required, the role has no implicit name) and <code>aria-busy</code> while more content loads. Each <code>FeedArticle</code> is a <code>role="article"</code> with <code>aria-posinset</code>/<code>aria-setsize</code>, named by its own label slot via <code>aria-labelledby</code> — never just referenced, always rendered.',

    "demo.feed.label": "Recent activity",
    "demo.feed.author1": "María — 2 hours ago",
    "demo.feed.body1": "Posted the sprint summary.",
    "demo.feed.author2": "Diego — 5 hours ago",
    "demo.feed.body2": "Commented on issue #482.",
    "demo.feed.author3": "Lucía — yesterday",
    "demo.feed.body3": "Closed three backlog tickets.",

    "dataGridPage.description":
      "Data Grid: 2D roving-tabindex navigation for tabular data or grouped widgets.",
    "dataGridPage.lede":
      'The WAI-ARIA spec itself treats "data grids" and "layout grids" as the same pattern — identical roles, identical roving-tabindex mechanics — so this is ONE contract, not two. Use it when a grid of cells needs 2D navigation: <a href="/en/components/table">Table</a> already covers STATIC tabular data with no keyboard model of its own.',
    "dataGridPage.dataTitle": "Tabular data",
    "dataGridPage.dataBody": "Plain text cells: the focus stop is the cell itself.",
    "dataGridPage.dataLabel": "Scores by round",
    "dataGridPage.layoutTitle": "Grouped widgets",
    "dataGridPage.layoutBody":
      "Each cell holds its own button: the focus stop hands off to THAT element instead — the cell never competes with its own interactive content for the roving tabindex.",
    "dataGridPage.layoutLabel": "Quick actions",
    "dataGridPage.contractBody":
      'No <code>@zag-js/*</code> machine of its own — same as <code>Treegrid</code>, the keyboard model is hand-rolled and pure, shared by both bindings. <code>wrapCols</code>/<code>wrapRows</code> control whether the arrows wrap at the grid\'s edge; both default to <code>false</code>.',
    "dataGridPage.a11yBody":
      'The root carries <code>role="grid"</code> with <code>aria-label</code> (required). Each row is <code>role="row"</code>, each cell <code>role="gridcell"</code>. Focus is roving — a single cell (or its interactive descendant) is the tab stop for the whole grid. <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd>/<kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> move between cells, <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> within the row, <kbd class="sk-kbd">Ctrl</kbd>+<kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> jump to the start/end of the whole grid.',
    "dataGridPage.testReact1":
      "Hands the roving stop to a cell's OWN interactive descendant, not the cell div.",
    "dataGridPage.testReact2":
      "Clamps into a shorter row's last real cell on vertical movement (ragged grid).",
    "dataGridPage.testVanilla1": "Wraps columns into the next row when data-wrap-cols is set.",
    "dataGridPage.testVanilla2": "Clicking a cell moves the roving stop there.",

    "demo.dataGrid.scoresLabel": "Scores by round",
    "demo.dataGrid.player": "Player",
    "demo.dataGrid.round1": "Round 1",
    "demo.dataGrid.round2": "Round 2",
    "demo.dataGrid.actionsLabel": "Quick actions",
    "demo.dataGrid.edit": "Edit",
    "demo.dataGrid.copy": "Copy",
    "demo.dataGrid.delete": "Delete",
    "demo.dataGrid.more": "More options",

    "menubarPage.description":
      "Menubar: a persistent horizontal bar of commands, some opening a dropdown.",
    "menubarPage.lede":
      'The WAI-ARIA <code>menubar</code> pattern: <code>menubar-editor</code>, the example it is named after. Not <a href="/en/components/menu">Menu</a> (one trigger, one popup) — here there are SEVERAL items in a single roving-tabindex row, where Left/Right moves between them, and the detail a naive implementation misses: moving to an adjacent item while a dropdown is open closes the old one and opens the new one too, not just moves a highlight.',
    "menubarPage.contractBody":
      'No <code>@zag-js/*</code> machine of its own — same as <code>Treegrid</code>/<code>DataGrid</code>, hand-rolled and shared by both bindings. v1 scope: ONE level of dropdown per item, no nested submenus — <code>Menu</code> already covers arbitrarily-nested submenus for a single trigger, and WAI\'s own examples (<code>menubar-editor</code>, <code>menubar-navigation</code>) do not need a second level either.',
    "menubarPage.label": "Menu bar",
    "menubarPage.a11yBody":
      'The root carries <code>role="menubar"</code> with <code>aria-label</code> (required). Each top-level item is <code>role="menuitem"</code>, with <code>aria-haspopup="menu"</code>/<code>aria-expanded</code> only if it opens a dropdown. Focus is roving — a single stop for the whole bar. <kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> move between items (and if a dropdown was open, open the new item\'s instead of just moving the highlight); <kbd class="sk-kbd">↓</kbd> opens the dropdown and focuses its first item, <kbd class="sk-kbd">↑</kbd> the last; inside an open dropdown, <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd> move between its commands; <kbd class="sk-kbd">Escape</kbd> closes it and returns focus to its trigger; <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> jump to the first/last item (or the first/last command if a dropdown is open).',
    "menubarPage.testCore1":
      "Moving while a dropdown was open keeps the NEXT item's dropdown open — the detail a plain roving tabindex misses.",
    "menubarPage.testReact1":
      "Moving right while a dropdown is open closes it and opens the adjacent item's dropdown.",
    "menubarPage.testReact2": "Escape closes the open dropdown and returns focus to its trigger.",
    "menubarPage.testVanilla1": "Clicking outside the bar closes any open dropdown.",

    "demo.menubar.label": "Menu bar",
    "demo.menubar.file": "File",
    "demo.menubar.new": "New",
    "demo.menubar.open": "Open",
    "demo.menubar.save": "Save",
    "demo.menubar.edit": "Edit",
    "demo.menubar.undo": "Undo",
    "demo.menubar.redo": "Redo",

    "inlinePage.description": "Inline, the horizontal, wrapping layout pattern.",
    "inlinePage.lede":
      "Lays out elements horizontally and wraps them onto another line once space runs out. Use it for action bars and label–control pairs; the semantics belong to whichever element you choose.",
    "inlinePage.previewLabel": "Action bar",
    "inlinePage.previewNote": "Box + Stack + Inline + Button",
    "inlinePage.htmlTitle": "Authored HTML",
    "inlinePage.htmlBody": "Use <code>sk-inline</code> on the matching semantic element. The attributes describe spacing, cross-axis alignment, horizontal distribution, and whether the row can wrap its children.",
    "inlinePage.contractItem1": "<code>as</code> chooses the root element; the default is <code>div</code>.",
    "inlinePage.contractItem2": "<code>gap</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, or <code>xl</code>; the default is <code>md</code>.",
    "inlinePage.contractItem3": "<code>align</code> accepts <code>start</code>, <code>center</code>, <code>end</code>, or <code>baseline</code>; the default is <code>center</code>.",
    "inlinePage.contractItem4": "<code>justify</code> accepts <code>start</code>, <code>center</code>, <code>end</code>, or <code>between</code>; in HTML it is written as <code>data-justify</code>.",
    "inlinePage.contractItem5": 'wrap lets children wrap; the default is <code>true</code>. Use <code>data-wrap="false"</code> for a single row in HTML.',
    "inlinePage.test1": "Renders Stack, Inline and Grid as the documented layout contracts.",

    "primitivasPage.title": "Primitives",
    "primitivasPage.description": "Layout and typography primitives: reusable structure, reading roles, and React adapters.",
    "primitivasPage.lede":
      "Box, Wrapper, ImageFrame, Stack, Inline, and Grid are layout patterns. Text, Heading, and Link express the reading role; they do not replace semantics: you choose the element that matches the content.",
    "primitivasPage.previewLabel": "Primitives",
    "primitivasPage.htmlTitle": "Authored HTML",
    "primitivasPage.htmlBody":
      "Import <code>patterns/layout.css</code> for Box, Wrapper, ImageFrame, Stack, Inline, and Grid, and <code>components/typography.css</code> for Text, Heading, and Link. None need vanilla initialization.",
    "primitivasPage.contractsTitle": "Contracts",
    "primitivasPage.contractItem1": "<code>Box</code> controls surface, border, and padding; the consumer chooses <code>as</code>.",
    "primitivasPage.contractItem2": "<code>Wrapper</code> sets the page column's ceiling to a scale (<code>sm</code>, <code>md</code>, <code>lg</code>, <code>full</code>).",
    "primitivasPage.contractItem3": "<code>ImageFrame</code> crops media to an aspect ratio and controls <code>object-fit</code> / position.",
    "primitivasPage.contractItem4": "<code>Stack</code>, <code>Inline</code>, and <code>Grid</code> have named gaps that follow the density dimension.",
    "primitivasPage.contractItem5": "<code>Heading</code> separates hierarchy (<code>as</code>) from visual size (<code>size</code>).",
    "primitivasPage.contractItem6": "<code>Link</code> underlines by default: it does not rely on color alone to be recognized.",

    "cardPage.description": "Card is not a component: a guide for composing semantic cards with Box, Tile, and content components.",
    "cardPage.lede":
      'Card is a <strong>composition result</strong>, not a system component. Content decides its structure; interaction decides whether the surface is born from <a href="/en/components/box">Box</a> or from <a href="/en/components/tile">Tile</a>.',
    "cardPage.calloutBody":
      "There is no <code>sk-card</code>, <code>@skryensya/react/card</code>, or <code>components/card.css</code>. Import whichever pieces the card actually uses.",
    "cardPage.chooseTitle": "Choose by behavior",
    "cardPage.chooseBody":
      "\"Card\" describes the visual shape, but says nothing about what it does. Start from semantics and interaction; then compose the content with Stack, Inline, Heading, Text, Badge, Stat, or other pieces.",
    "cardPage.tableHeadSurface": "The surface…",
    "cardPage.tableHeadUses": "Use",
    "cardPage.tableHeadElement": "Real element",
    "cardPage.tableRow1Surface": "presents content or holds several controls",
    "cardPage.tableRow1Element": "<code>article</code>, <code>section</code>, or <code>div</code>",
    "cardPage.tableRow2Surface": "navigates entirely to a destination",
    "cardPage.tableRow2Element": "<code>a[href]</code>",
    "cardPage.tableRow3Surface": "runs an action entirely",
    "cardPage.tableRow3Element": "<code>button</code>",
    "cardPage.tableRow4Surface": "toggles an independent option",
    "cardPage.tableRow4Element": '<code>input[type=checkbox]</code>',
    "cardPage.tableRow5Surface": "chooses an exclusive option",
    "cardPage.tableRow5Element": '<code>input[type=radio]</code>',
    "cardPage.tableRow6Surface": "reveals content",
    "cardPage.tableRow6Element": "<code>button</code> or <code>details</code>",
    "cardPage.geometryBody":
      "Box and Tile both start from the same surface, subtle border, radius, and <code>lg</code> padding here. Tile keeps that content and adds <code>sk-interactive</code>'s state layer; the visible difference shows up on hover, focus, or press, not in a second card recipe.",
    "cardPage.basicTitle": "Basic card",
    "cardPage.basicBody":
      'The floor of the ladder: a surface, a title, and a paragraph. Nothing here is interactive, so the root is <a href="/en/components/box">Box</a> on an <code>article</code>. No <code>card</code> class is in play, just the surface, the subtle border, and <code>lg</code> padding.',
    "cardPage.basicNote": "Box + Stack + Heading + Text",
    "cardPage.metaTitle": "Status and date",
    "cardPage.metaBody":
      'The same Box, now with hierarchy: <a href="/en/components/badge">Badge</a> states the status and a <code>caption</code>-sized Text states the date. The card grew no API, it grew content.',
    "cardPage.metaNote": "Box + Inline + Badge + Text",
    "cardPage.accentSoftTitle": "Soft accent",
    "cardPage.accentSoftBody":
      "The accent background gets requested by rewriting the hooks Box already publishes: <code>--sk-box-bg</code> to <code>--color-bg-accent-subtle</code> and the border to <code>--color-border-accent</code>; never a raw <code>background</code> on <code>.sk-box</code>, which would skip past the surface the pattern manages. Since the fill is subtle, the text keeps using the normal tokens.",
    "cardPage.accentSoftNote": "Box + surface hooks",
    "cardPage.accentSolidTitle": "Solid accent",
    "cardPage.accentSolidBody":
      "When the fill is the action color, the text is no longer read against the page but against that fill, which is why it comes from <code>--color-text-on-accent</code>. In dark mode the accent is a <em>light</em> blue and that token flips to near-black: a <code>data-tone</code> here would resolve against the wrong background and end up unreadable in one of the two modes.",
    "cardPage.accentSolidNote": "Box + action color + on-accent text",
    "cardPage.statTitle": "Metric card",
    "cardPage.statBody":
      '<a href="/en/components/stat">Stat</a> supplies the metric and Box supplies the card. The collection drops into a grid without Stat turning into a surface or growing a <code>card</code> variant in its API.',
    "cardPage.statNote": "Box + Stat + Icon",
    "cardPage.linkTitle": "Card that navigates",
    "cardPage.linkBody":
      "First interactive rung. The whole surface leads to <strong>one</strong> destination, so the root is the <code>a[href]</code> itself: a TileLink. There is no CSS-stretched link and no <code>onClick</code> on a <code>div</code>, and the title is what names the link.",
    "cardPage.linkNote": "TileLink + Icon",
    "cardPage.actionTitle": "Card that acts",
    "cardPage.actionBody":
      "Same geometry, a different platform element: this one <em>does</em> something, so it is a <code>button</code>. The shape does not decide the element; the intent does.",
    "cardPage.actionNote": "TileButton + Icon",
    "cardPage.selectTitle": "Card that gets chosen",
    "cardPage.selectBody":
      "And a preference is a checkbox. The surface is the same again, but the state belongs to the platform: it toggles with the space bar, it enters a form, and a screen reader announces it as a checkbox.",
    "cardPage.selectNote": "TileCheckbox",
    "cardPage.mediaTitle": "Card with an image",
    "cardPage.mediaBody":
      'Media arrives. The Box carries no padding: it already clips through <code>overflow</code>, so an <a href="/en/components/image-frame">ImageFrame</a> at <code>data-radius="none"</code> reaches the edge and inherits the rounded corner. The text inset gets restored by <code>.sk-card-body</code>, because padding on the root would have inset the photo too.',
    "cardPage.mediaNote": "Box + ImageFrame + Badge",
    "cardPage.gradientTitle": "Card with a gradient",
    "cardPage.gradientBody":
      "The wash that keeps text readable over a photo. It sizes itself to the <strong>type</strong> it protects, not to a percentage of the image: the caption is the box and the gradient fills it, fading toward the photo. The three cards show the three <code>data-strength</code> values (<code>sm</code>, <code>md</code>, and <code>lg</code>) over the same pale panel, because strength is opacity and tint, never how much of the image gets covered. The images are deliberately light: over an already-dark background the wash would not show and the example would argue against itself.",
    "cardPage.gradientNote": "ImageFrame + MediaCaption + MediaGradient (sm · md · lg)",
    "cardPage.mediaLinkTitle": "Card with a navigating image",
    "cardPage.mediaLinkBody":
      'All three at once: media, gradient, and navigation. It is a TileLink at <code>data-padding="none"</code> so the photo reaches the edge, and everything inside is a <code>span</code>, because an <code>a</code> cannot hold block-level interactive content.',
    "cardPage.mediaLinkNote": "TileLink + ImageFrame + MediaGradient",
    "cardPage.productTitle": "Product card",
    "cardPage.productBody":
      "The top of the ladder, and the example that proves the rule. <strong>Two</strong> independent decisions live here (view detail and add), so the root cannot be a Tile: a link and a button nested inside an <code>a</code> is invalid HTML, and a whole-surface click could only ever mean one of the two. This is exactly what Box exists for.",
    "cardPage.productNote": "Box + Badge + Link + Button",
    "cardPage.doTitle": "Do",
    "cardPage.doHeading": "Let behavior choose the root",
    "cardPage.doItem1": "Use Box for content and for several independent controls.",
    "cardPage.doItem2": "Use a semantic Tile when the whole surface has a single intent.",
    "cardPage.doItem3": "Keep headings, lists, prices, and statuses as content components.",
    "cardPage.doItem4": "Let visible focus reach the whole interactive surface.",
    "cardPage.doItem5": "Let content determine height; group only comparable cards.",
    "cardPage.dontTitle": "Don't",
    "cardPage.dontHeading": "Don't turn appearance into an API",
    "cardPage.dontItem1": "Don't create a Card component with <code>news</code>, <code>product</code>, or <code>stat</code> variants.",
    "cardPage.dontItem2": "Don't put <code>onClick</code> or <code>tabindex</code> on a Box or <code>div</code>.",
    "cardPage.dontItem3": "Don't nest buttons, links, or inputs inside TileLink or TileButton.",
    "cardPage.dontItem4": "Don't duplicate the same destination on the surface and on an inner link.",
    "cardPage.dontItem5": "Don't crop important content just to match heights.",
    "cardPage.implTitle": "Implementation",
    "cardPage.implBody":
      "There is no Card import. Import Box or the chosen semantic Tile, its styles, and only the content pieces present. This keeps every dependency and every contract visible at the call site.",

    "indexPage.title": "Explore components",
    "indexPage.description": "Components, patterns, and primitives organized by the task they solve.",
    "indexPage.lede":
      'Start with the task: capture data, provide orientation, present content, or communicate status. Each card explains when to use the piece. For icon roles, sets, and rules, go to <a href="/en/icons">Fundamentals → Iconography</a>.',
    "indexPage.searchLabel": "Search components",
    "indexPage.countSuffix": "components",

    "vaulPage.description": "A pattern: a modal panel anchored to a viewport edge, with optional drag-to-dismiss.",
    "vaulPage.lede":
      "A modal panel anchored to an <strong>edge</strong> of the viewport: it arrives from that edge, leaves the page inert behind a backdrop, and leaves the way it came. The edge is the whole idea — a Vaul is named for where it comes from, never for the shape it takes on arrival.",
    "vaulPage.whyPatternTitle": "Why it is a pattern, not a component",
    "vaulPage.whyPatternBody1":
      'The rule is a single question: <em>could a second component need this exact structure?</em> Here the answer is not a prediction, it already happens, today, in this repo: <a href="/en/components/drawer">Drawer</a> <strong>is</strong> a Vaul on the inline edge. The <a href="/en/components/dialog">Dialog Vaul</a> option reuses that same block-end interaction on mobile without turning Dialog into a Vaul component.',
    "vaulPage.whyPatternBody2":
      "So Vaul ships <strong>hooks and structure</strong>. A drawer that reimplemented the panel would just be a second Vaul under another name.",
    "vaulPage.edgeTitle": "The edge is data, not a component",
    "vaulPage.edgeBody":
      "Three edges, one pattern. <code>data-edge</code> picks; nothing else changes. The inline edges are logical, so they flip on their own under RTL instead of sticking to the wrong side of the screen.",
    "vaulPage.nativeTitle": "It requires the native <code>&lt;dialog&gt;</code>",
    "vaulPage.nativeBody":
      "The focus trap, ESC, an inert background, focus restoration, the top layer, and a real <code>::backdrop</code> are all behaviors the platform already has. A Vaul on a div would reimplement them in JavaScript that would have to ship, and the top layer and <code>:modal</code> are not available to a div at any price.",
    "vaulPage.zagTitle": "Zag is not used here, and that is the finding",
    "vaulPage.zagBody":
      "The rule is that Zag only comes in when state coordination is worth its cost. The registry got checked before writing a single line: <strong>no Vaul machine exists</strong>. And whatever Zag could cover here is exactly what the platform already does better: <code>@zag-js/dialog</code> would reimplement the modality <code>&lt;dialog&gt;</code> hands over for free, and <code>@zag-js/presence</code> is redundant against <code>@starting-style</code>. The answer being \"none\" is the rule working, not an exception to it.",
    "vaulPage.dragTitle": "Drag is the only thing that costs JS",
    "vaulPage.dragBody1":
      "One behavior remains with no platform equivalent and no Zag machine: dragging the panel toward its edge to dismiss it. That, and only that, is the enhancer. <strong>Vaul is complete without it</strong>: with no JS there is still a panel, slide, backdrop, ESC, and click-outside.",
    "vaulPage.dragBody2":
      "It closes by distance <strong>or</strong> by speed: a flick is an intention, and waiting for it to cross a distance threshold is exactly what makes a sheet feel stuck. Speed gets measured over the gesture's <strong>last few millimeters</strong>, not the average: drag slowly, hesitate, and only then pull, and the pull is real — averaged from the moment your finger landed, it would dilute down to looking like you never moved. And a flick <em>back</em> beats distance: the hand's last word is the one that counts.",
    "vaulPage.noDragLabel": "no drag",
    "vaulPage.resistTitle": "Toward the other side, it resists",
    "vaulPage.resistBody1":
      "Pulling the panel inward does not detach it from its edge, but it does not leave it stuck either: it gives, tracking 1∶1 under the fingertip at first, and curves toward a stop around 12px. A finger moving with nothing underneath responding is not the only moment a direct-manipulation surface gives itself away as a drawing of one. The asymmetry <em>is</em> the message: that side has nowhere to go.",
    "vaulPage.resistBody2":
      "And what shows up in that gap is <strong>more panel</strong>: the material keeps going past the edge, so lifting a sheet reveals more sheet, not a strip of backdrop. Those are two deliberately different numbers — how much it gives (<code>--sk-vaul-overpull</code>) and how far the material reaches (<code>--sk-vaul-material</code>) — and the second is declared as a floor over the first, so give can never outrun it. The material paints <em>over</em> the elevation: the other way around, the panel's own shadow would tint exactly the strip that just got revealed, and a lifted sheet would show a dark band where its own surface should be — precisely the hole this exists to not have.",
    "vaulPage.resistBody3": "The backdrop moves with it: its opacity follows the drag. A full-strength backdrop with the panel halfway out would be lying about what counts as modal.",
    "vaulPage.handleTitle": "The handle follows the edge",
    "vaulPage.handleBody":
      "It is not cosmetic: a bottom sheet gets pulled down from a bar crossing its own ceiling, and a side panel gets pulled sideways from a bar along its inner edge. A horizontal pill on a drawer announces the wrong gesture, and an affordance that lies is worse than having none at all.",
    "vaulPage.desktopTitle": "On desktop, it does not drag",
    "vaulPage.desktopBody":
      "The handle is a <strong>touch</strong> affordance: a bar you pull with a thumb. With a pointer there is nothing to pull that a click outside or an ESC would not do better, so above the system breakpoint (<code>52rem</code>, the same width where the sidebar becomes a drawer and the dialog becomes a sheet) the handle hides and the enhancer never wires up the drag. CSS and JS make the same cut, with the same <code>matchMedia</code>, so there is never a handle dangling at a width where it does not drag.",
    "vaulPage.motionTitle": "Motion: arriving, leaving, and releasing are three intents",
    "vaulPage.motionBody1":
      "Each with its own tokens, never one averaged duration: arriving gets announced, leaving is already decided. Under <code>prefers-reduced-motion</code> the panel <strong>still arrives</strong> — the trip drops, not the Vaul — and the backdrop's fade is what tells you the page went inert. The drag itself is untouched: it is direct manipulation, not motion the system plays back at you.",
    "vaulPage.motionBody2":
      '<a href="/en/transparency"><code>prefers-reduced-transparency</code></a> does not remove the backdrop: it makes it opaque. Modality and the direct drag response both stay.',
    "vaulPage.motionBody3":
      "<strong>Releasing</strong> is the third, and its own thing: a released panel is not leaving, it is finishing the momentum the hand already gave it. That is why it consumes neither <code>enter</code> nor <code>exit</code> — both are short because nobody is waiting on them — but the <code>release</code> intent instead, deliberately long: cutting it short is what would make the panel snap to a stop under the finger instead of carrying through. One intent covers both destinations: returning home and leaving entirely are the same throw with a different landing. It is the one intent that, under <code>prefers-reduced-motion</code>, cannot drop its own trip — the panel is wherever the finger left it and still has to land somewhere — so it drops the flourish and lands short instead.",
    "vaulPage.demoOpenLabel": "Share file",
    "vaulPage.demoTitle": "Q3 commercial proposal",
    "vaulPage.demoMeta": "PDF · 2.4 MB · edited 2h ago",
    "vaulPage.demoClose": "Close",
    "vaulPage.demoShareToggle": "Anyone with the link can view",
    "vaulPage.demoPeopleLabel": "People with access",
    "vaulPage.demoOwner": "Owner",
    "vaulPage.demoCanEdit": "Can edit",
    "vaulPage.demoCanComment": "Can comment",
    "vaulPage.demoReadOnly": "Read-only",
    "vaulPage.demoInviteSent": "Invite sent",
    "vaulPage.demoDesignTeam": "Design team",
    "vaulPage.demoDesignTeamMeta": "6 people",
    "vaulPage.demoCancel": "Cancel",
    "vaulPage.demoShare": "Share",
    "vaulPage.vanillaComment1": "Just the drag. Opening is showModal() and closing is close():",
    "vaulPage.vanillaComment2": "modality belongs to the platform.",
    "vaulPage.vanillaComment3": "fraction of the panel that has to be dragged",
    "vaulPage.vanillaComment4": "px/ms: a flick closes without crossing the distance",
    "vaulPage.noDragComment": "no handle and no drag: Vaul is still complete",
    "vaulPage.test1": "Carries the enhancer's scope markers at rest.",
    "vaulPage.test2": "Draws the handle as decoration, always.",
    "vaulPage.test3": "Dismisses on a slow drag that travels far enough (distance alone).",
    "vaulPage.test4": "A fast, short flick closes it even when the distance is small.",
    "vaulPage.test5": "A flick back home overrules a far drag: direction beats distance.",

    "landing.title": "skryensya/ui",
    "landing.description":
      "Components, primitives and foundations for building interfaces that work as a system.",
    "landing.brand": "skryensya/ui",
    "landing.hero.title": "Pieces for building interfaces that work as a system.",
    "landing.hero.lede":
      "Components, primitives and foundations you can use alone or combine to build complete interfaces. Built on the web platform, with shared contracts for HTML, JavaScript and React.",
    "landing.hero.ctaComponents": "Explore components",
    "landing.hero.ctaPlayground": "Open Playground",

    "landing.start.title": "Start anywhere.",
    "landing.start.lede": "You do not need to adopt an entire system to solve one problem.",
    "landing.start.body":
      "Use a component. Build with primitives. Adopt the foundations. Explore a full pattern.",
    "landing.start.meet": "Every piece is designed to meet the others when you need them.",
    "landing.start.components.title": "Components",
    "landing.start.components.body":
      "Controls and interface elements ready to become part of something larger.",
    "landing.start.components.items": "Button · Input · Select · Combobox · Dialog · Tabs",
    "landing.start.components.cta": "Explore components →",
    "landing.start.primitives.title": "Primitives",
    "landing.start.primitives.body":
      "Small pieces for structure, composition and interaction without starting from scratch.",
    "landing.start.primitives.items": "Box · Stack · Inline · Grid · Popover",
    "landing.start.primitives.cta": "Explore primitives →",
    "landing.start.foundations.title": "Foundations",
    "landing.start.foundations.body":
      "Shared decisions that keep the system coherent as it grows.",
    "landing.start.foundations.items": "Color · Space · Type · Dimensions · Density · Motion",
    "landing.start.foundations.cta": "Explore foundations →",
    "landing.start.patterns.title": "Patterns",
    "landing.start.patterns.body":
      "Components and primitives working together to solve recurring interactions.",
    "landing.start.patterns.items": "Forms · Search · Navigation · Selection · Application UI",
    "landing.start.patterns.cta": "Explore patterns →",

    "landing.composition.title": "From one piece to an interface.",
    "landing.composition.lede": "Start with something small.",
    "landing.composition.caption.input": "Start with something small.",
    "landing.composition.caption.input-button": "Add an action.",
    "landing.composition.caption.input-button-listbox": "Introduce selection.",
    "landing.composition.caption.combobox": "Define how they relate.",
    "landing.composition.caption.form-dialog": "Add structure around them.",
    "landing.composition.caption.full":
      "And finish by building a complete interface with the same rules.",
    "landing.composition.stage.input": "Input",
    "landing.composition.stage.input-button": "Input + Button",
    "landing.composition.stage.input-button-listbox": "Input + Button + Listbox",
    "landing.composition.stage.combobox": "Combobox",
    "landing.composition.stage.form-dialog": "Combobox + Form + Dialog",
    "landing.composition.stage.full": "Full interface",
    "landing.composition.stagesLabel": "Composition stages",
    "landing.composition.inputLabel": "Search",
    "landing.composition.searchPlaceholder": "Search…",
    "landing.composition.searchAction": "Search",
    "landing.composition.listboxLabel": "Plan",
    "landing.composition.notesLabel": "Notes",
    "landing.composition.notesPlaceholder": "Add context…",
    "landing.composition.openDialog": "Confirm",
    "landing.composition.dialogTitle": "Save selection?",
    "landing.composition.dialogBody":
      "The selection and notes will be saved with the same system rules.",
    "landing.composition.dialogCancel": "Cancel",
    "landing.composition.dialogConfirm": "Save",
    "landing.composition.after":
      "These are not isolated pieces that happen to look alike. They share foundations, states and behaviour so they can compose without reinventing the system each time.",
    "landing.composition.cta": "See how they compose →",

    "landing.rules.title": "The same rules, from the bottom up.",
    "landing.rules.lede":
      "A coherent interface does not start at Button or Dialog. It starts in the decisions they all share.",
    "landing.rules.color.title": "Color",
    "landing.rules.color.body":
      "Semantic roles that can respond to theme, context and accent.",
    "landing.rules.color.cta": "Explore color →",
    "landing.rules.dimensions.title": "Dimensions",
    "landing.rules.dimensions.body":
      "A shared scale so different components share proportions.",
    "landing.rules.dimensions.cta": "Explore dimensions →",
    "landing.rules.density.title": "Density",
    "landing.rules.density.body":
      "Change how much space the interface needs without redesigning each piece.",
    "landing.rules.density.cta": "Explore density →",
    "landing.rules.motion.title": "Motion",
    "landing.rules.motion.body":
      "Transitions and movement defined as part of the system language.",
    "landing.rules.motion.cta": "Explore motion →",
    "landing.rules.states.title": "State layers",
    "landing.rules.states.body":
      "Hover, focus, pressed and other states respond to a shared interaction model.",
    "landing.rules.states.cta": "Explore states →",

    "landing.lab.title": "Change one rule. Watch the system.",
    "landing.lab.theme": "Theme",
    "landing.lab.themeLight": "Light",
    "landing.lab.themeDark": "Dark",
    "landing.lab.accent": "Accent",
    "landing.lab.density": "Density",
    "landing.lab.densityCompact": "Compact",
    "landing.lab.densityDefault": "Default",
    "landing.lab.densityComfortable": "Comfortable",
    "landing.lab.densityPresets": "Density presets",
    "landing.lab.contrast": "Contrast",
    "landing.lab.contrastLow": "Low",
    "landing.lab.contrastHigh": "High",
    "landing.lab.radius": "Radius",
    "landing.lab.radiusPresets": "Radius presets",
    "landing.lab.after":
      "Components do not keep independent copies of these decisions. They consume the same foundations. Change the system and the interface responds.",
    "landing.lab.ctaTheming": "Explore theming →",
    "landing.lab.ctaPlayground": "Open in Playground →",
    "landing.lab.previewTitle": "Create project",
    "landing.lab.nameLabel": "Name",
    "landing.lab.namePlaceholder": "My project",
    "landing.lab.planLabel": "Plan",
    "landing.lab.submit": "Continue",
    "landing.lab.cancel": "Cancel",

    "landing.platform.title": "The web platform is a piece too.",
    "landing.platform.lede":
      "skryensya/ui does not try to replace HTML and CSS with its own abstraction. It builds on them.",
    "landing.platform.html.title": "When HTML is enough",
    "landing.platform.html.body": "Structure stays as HTML.",
    "landing.platform.css.title": "When CSS is enough",
    "landing.platform.css.body": "The visual system stays in CSS.",
    "landing.platform.js.title": "When interaction appears",
    "landing.platform.js.body": "JavaScript adds the behaviour that is needed.",
    "landing.platform.closing":
      "Use the platform when the platform is enough. Add behaviour when interaction requires it.",
    "landing.platform.cta": "Understand the architecture →",

    "landing.behavior.title": "Behaviour composes too.",
    "landing.behavior.lede":
      "Combining visual elements is easy. Keeping their interaction correct is another matter.",
    "landing.behavior.body":
      "A Combobox, Menu or Dialog has to coordinate structure, state, keyboard, focus and semantics. In skryensya/ui those relationships are part of the component too.",
    "landing.behavior.comboboxTitle": "Combobox",
    "landing.behavior.keyboard": "Keyboard",
    "landing.behavior.keyNav": "Navigate",
    "landing.behavior.keySelect": "Select",
    "landing.behavior.keyClose": "Close",
    "landing.behavior.state": "State",
    "landing.behavior.states": "open · focused · invalid · disabled",
    "landing.behavior.semantics": "Semantics",
    "landing.behavior.semanticsChain": "combobox → listbox → option",
    "landing.behavior.after":
      "Appearance is one part of the component. Its behaviour is too.",
    "landing.behavior.ctaCombobox": "Explore Combobox →",
    "landing.behavior.ctaInteractive": "See interactive components →",

    "landing.bindings.title": "One piece. Two ways to use it.",
    "landing.bindings.lede":
      "How you render an interface should not change the component model.",
    "landing.bindings.vanilla.title": "HTML + JavaScript",
    "landing.bindings.vanilla.body":
      "Write the structure and add behaviour where you need it.",
    "landing.bindings.vanilla.cta": "Start with Vanilla →",
    "landing.bindings.react.title": "React",
    "landing.bindings.react.body": "Render the same concept from React.",
    "landing.bindings.react.cta": "Start with React →",
    "landing.bindings.after":
      "Underneath sits a shared contract. States, semantics, behaviour and styling hooks still belong to the same system.",
    "landing.bindings.ctaContracts": "Understand the contracts →",

    "landing.needs.title": "Components that lead to other components.",
    "landing.needs.lede":
      "You do not always know the name of the piece you need. Sometimes you only know what you want to build.",
    "landing.needs.forms.title": "I need to collect information",
    "landing.needs.forms.items":
      "Input · Checkbox · Select · Radio Group · Date Picker · File Upload",
    "landing.needs.forms.cta": "Explore forms →",
    "landing.needs.selection.title": "I need to present options",
    "landing.needs.selection.items":
      "Select · Combobox · Listbox · Menu · Command Palette",
    "landing.needs.selection.cta": "Explore selection →",
    "landing.needs.overlays.title": "I need to show something over the interface",
    "landing.needs.overlays.items": "Popover · Tooltip · Dialog · Drawer · Toast",
    "landing.needs.overlays.cta": "Explore overlays →",
    "landing.needs.nav.title": "I need to structure an application",
    "landing.needs.nav.items": "Navbar · Sidebar · Breadcrumb · Tabs · Pagination",
    "landing.needs.nav.cta": "Explore navigation →",
    "landing.needs.data.title": "I need to display information",
    "landing.needs.data.items": "Table · List · Tree View · Stat · Badge · Avatar",
    "landing.needs.data.cta": "Explore data display →",

    "landing.patterns.title": "Do not only look for components. Explore solutions.",
    "landing.patterns.lede":
      "A component solves one part of the problem. A pattern shows how several parts can work together.",
    "landing.patterns.search.title": "Search",
    "landing.patterns.search.body":
      "Input + Combobox + Keyboard navigation + Empty state",
    "landing.patterns.search.cta": "Explore Search →",
    "landing.patterns.settings.title": "Settings",
    "landing.patterns.settings.body": "Forms + Sections + Validation + Actions",
    "landing.patterns.settings.cta": "Explore Settings →",
    "landing.patterns.command.title": "Command palette",
    "landing.patterns.command.body": "Dialog + Search + Listbox + Commands",
    "landing.patterns.command.cta": "Explore Command palette →",
    "landing.patterns.appNav.title": "Application navigation",
    "landing.patterns.appNav.body":
      "Sidebar + Navigation + Disclosure + Responsive behavior",
    "landing.patterns.appNav.cta": "Explore Application navigation →",
    "landing.patterns.allCta": "Explore all patterns →",

    "landing.growth.title": "Designed by using it.",
    "landing.growth.lede":
      "skryensya/ui does not try to anticipate every possible interface. The system grows from real problems.",
    "landing.growth.body":
      "A need produces a solution. The solution reveals a piece. The piece reveals a rule. And when that rule can serve beyond the problem that created it, it becomes part of the system.",
    "landing.growth.chain": "Need → Solution → Piece → System",
    "landing.growth.closing": "That is how skryensya/ui evolves.",
    "landing.growth.ctaProject": "About the project →",
    "landing.growth.ctaChangelog": "See the changelog →",

    "landing.playground.title": "Explore. Combine. Change.",
    "landing.playground.lede":
      "The Playground is a space to understand the system by building with it.",
    "landing.playground.body":
      "Try components. Combine pieces. Change their states. Modify foundations. Compare HTML and React. Watch what stays the same.",
    "landing.playground.cta": "Open Playground",

    "landing.close.title": "Build from wherever you are.",
    "landing.close.lede":
      "Start with a component or use the system as the foundation of a complete interface.",
    "landing.close.ctaStart": "Get started →",
    "landing.close.ctaComponents": "Explore components →",
    "landing.close.ctaDocs": "Read the documentation →",
    "landing.close.linkGithub": "GitHub",
    "landing.close.linkChangelog": "Changelog",
    "landing.close.linkPlayground": "Playground",
    "landing.close.linkComponents": "Components",
    "landing.close.linkFoundations": "Foundations",

    "footer.body":
      "This site consumes {core} and the component packages through their exports maps, with a bundler: the same path it documents. Every pixel comes from a token.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)["es"];

/*
 * Nav labels that are Spanish PROSE, keyed by the item's Spanish href.
 *
 * Anything absent keeps the label authored in `lib/navigation.ts`, which is the right answer for the
 * ~60 component entries: "Avatar", "Combobox" and "SegmentedControl" are names, not words, and a
 * translation table full of `"Avatar": "Avatar"` is a table that will eventually disagree with itself.
 */
export const navLabel: Record<Locale, Partial<Record<string, string>>> = {
  es: {},
  en: {
    "/": "Installation",
    "/prerrequisitos": "Prerequisites",
    "/primer-componente": "Your first component",
    "/montaje-automatico": "Automatic mounting",
    "/arquitectura": "Architecture",
    "/referencia": "Tokens",
    "/dimensiones": "Dimensions",
    "/zoom": "Zoom and reflow",
    "/densidad": "Component density",
    "/acento": "Accent reach",
    "/gradientes": "Gradients",
    "/transparencias": "Transparency",
    "/iconos": "Iconography",
    "/almacenamiento": "Storage",
    "/anclaje": "Anchoring",
    "/componentes/date-picker": "DatePicker",
    "/componentes/calendar": "Calendar",
  },
};
