export const chartsMessages = {
  es: {

    "chartsPage.betaBadge": "Beta",
    "chartsPage.description":
      "Una serie de valores con nombre hecha visible. Las barras viven en Core; línea y área son un renderer opcional. La card alrededor es una composición.",
    "chartsPage.lede":
      "Chart es un contrato: <code>points</code>, <code>kind</code> y un <code>label</code> que dice qué miden los números. No es la API de una librería de gráficos. Las barras se pintan desde markup. Línea y área cambian el import a <code>@skryensya/charts/react</code>, un drop-in que dibuja un overlay sobre el mismo listado. TanStack existe, en otro subpath, para el caso que este contrato no cubre.",
    "chartsPage.calloutBody":
      "<strong>No hay <code>ChartCard</code>.</strong> Título, acción, superficie y números de apoyo son de <a href=\"/componentes/box\">Box</a>, <a href=\"/componentes/heading\">Heading</a>, <a href=\"/componentes/stat\">Stat</a> y <a href=\"/componentes/button\">Button</a>. El gráfico sólo pinta la serie. Publicarlo como variante de card habría crecido exactamente el componente que Card se niega a ser; la receta está en <code>metric-panel</code>.",
    "chartsPage.cardsTitle": "Una card con un chart",
    "chartsPage.cardsBody":
      "Lo primero que se pide. Tres composiciones, no tres componentes: el número lo dice el texto, el gráfico dice la forma, y el botón dice a dónde ir después.",
    "chartsPage.analyticsTitle": "Analítica, con la tendencia al borde",
    "chartsPage.analyticsBody":
      "El número vive en el texto. El área es un sparkline: <code>flush</code> cancela el padding del Box para que la serie llegue al borde, y <code>labels={false}</code> esconde el eje sin borrar los datos del DOM. Línea y área importan el renderer opcional.",
    "chartsPage.analyticsLabel": "Visitas de las últimas ocho semanas",
    "chartsPage.analyticsNote": "Box + Badge + Button + Chart area · flush",
    "chartsPage.historyTitle": "Historial, con una barra destacada",
    "chartsPage.historyBody":
      "Barras con etiquetas, sin motor. El tono de la serie es <code>neutral</code>; Diciembre lleva <code>tone=\"accent\"</code> para destacarlo contra sus hermanas. Los dos Stats hundidos son apoyo, no pares del titular.",
    "chartsPage.historyLabel": "Aportes de los últimos cinco meses",
    "chartsPage.historyNote": "Box + Chart bar + Stat + Button",
    "chartsPage.usageTitle": "Consumo, con los números debajo",
    "chartsPage.usageBody":
      "Otra vez barras. El gráfico no intenta decir 3.4 kW: eso lo dice el Stat. Un gráfico del que hay que estimar valores contra un eje es una tabla peor.",
    "chartsPage.usageLabel": "Consumo eléctrico de toda la casa",
    "chartsPage.usageNote": "Box + Chart bar + Stat",
    "chartsPage.pieceTitle": "El gráfico, solo",
    "chartsPage.pieceBody":
      "Cuando no hay card alrededor, Chart sigue siendo la misma signature: una lista de entradas, cada una con etiqueta y número. <code>kind</code> elige la forma.",
    "chartsPage.barTitle": "Barras, sin renderer",
    "chartsPage.barBody":
      "Cada entrada trae su valor y la hoja divide por el máximo de la serie. Un gráfico de barras se pinta desde markup autorado. No hace falta <code>@skryensya/charts</code>.",
    "chartsPage.barLabel": "Componentes documentados por trimestre",
    "chartsPage.barNote": "Chart · kind bar",
    "chartsPage.lineTitle": "Línea, con el renderer opcional",
    "chartsPage.lineBody":
      "Una línea necesita un path, y CSS no puede calcularlo. El mismo componente, importado desde <code>@skryensya/charts/react</code>, dibuja el overlay. Las props no cambian.",
    "chartsPage.lineLabel": "Latencia de interacción por versión",
    "chartsPage.lineNote": "Chart · kind line · @skryensya/charts",
    "chartsPage.areaTitle": "Área, el mismo drop-in",
    "chartsPage.areaBody":
      "Un área es la línea cerrada hasta la base. El renderer pinta dos paths: el relleno cerrado y el trazo abierto, para no dibujar un eje vertical que el contrato no tiene.",
    "chartsPage.areaLabel": "Peso del bundle por semana",
    "chartsPage.areaNote": "Chart · kind area · @skryensya/charts",
    "chartsPage.integrationsTitle": "Chart con otros componentes",
    "chartsPage.integrationsBody":
      "Cuatro composiciones más, cada una un contrato que ya existe junto a Chart, no una capacidad nueva inventada para gráficos.",
    "chartsPage.periodTitle": "Un selector cambia la serie",
    "chartsPage.periodBody":
      "<code>Segmented</code> elige el período; Chart sigue siendo la misma signature, sólo cambian sus <code>points</code>. El encabezado y el control no se mueven, así que el cambio se lee como un dato distinto, no como una card distinta.",
    "chartsPage.periodLabel": "Tráfico del sitio, por período",
    "chartsPage.periodNote": "Segmented + Chart bar",
    "chartsPage.tableTitle": "Chart y Table, la misma serie dos veces",
    "chartsPage.tableBody":
      "El gráfico dice la forma; la tabla dice el número exacto y permite comparar fila por fila, el caso que <code>avoidWhen</code> en la semántica de Chart ya marca como <em>\"gráfico peor que tabla\"</em>. Cada uno lleva su propio nombre accesible: <code>label</code> en Chart, <code>TableCaption</code> en Table.",
    "chartsPage.tableLabel": "Ingresos por trimestre",
    "chartsPage.tableNote": "Chart bar + Table",
    "chartsPage.detailTitle": "Un detalle por punto, con Tooltip",
    "chartsPage.detailBody":
      "La barra de Chart es <code>aria-hidden</code> y no tiene nombre propio, así que no es un trigger válido para Tooltip: el contrato de Tooltip exige que su contenido envuelva un control con su propio nombre accesible. Acá el trigger es un <code>Button.action</code> real por punto, debajo del gráfico; no duplica el overlay ni toca la lista accesible.",
    "chartsPage.detailLabel": "Latencia por endpoint, con detalle",
    "chartsPage.detailNote": "Chart bar + Tooltip + Button",
    "chartsPage.galleryTitle": "Formatos y tamaños, lado a lado",
    "chartsPage.galleryBody":
      "Las mismas opciones de siempre (<code>kind</code>, <code>tone</code>, <code>height</code>, <code>format</code>, <code>flush</code>, <code>grid</code>) a escala de card, para que la diferencia se lea de un vistazo.",
    "chartsPage.galleryLabel": "Cuatro chart cards, distintas opciones",
    "chartsPage.galleryNote": "Grid + 4 Chart",
    "chartsPage.metricTabsTitle": "Tabs, no Segmented: métricas distintas",
    "chartsPage.metricTabsBody":
      "El selector de período de arriba cambia una SERIE bajo una configuración; esto es distinto: cada tab es una métrica distinta, con su propio chart y su propio tono, la misma diferencia que <code>hero-with-audience-tabs</code> traza para un pitch. Los tres paneles comparten la misma altura de chart para que cambiar de tab no mueva el resto de la página.",
    "chartsPage.metricTabsLabel": "Ingresos, usuarios y errores por semana",
    "chartsPage.metricTabsNote": "Tabs + Stat + Chart bar",
    "chartsPage.legendTitle": "Una leyenda, hecha de Badge",
    "chartsPage.legendBody":
      "Cada entrada lleva su propio <code>tone</code> (el override por punto que el contrato ya tiene) y la leyenda de abajo repite ese mapeo en Badges del mismo tono. Es decoración: <code>values</code> ya pinta el número de cada barra y la etiqueta ya nombra la categoría, así que la leyenda no es la única fuente de nada.",
    "chartsPage.legendLabel": "Presupuesto por equipo, cinco categorías",
    "chartsPage.legendNote": "Chart bar · tone por punto + Badge",
    "chartsPage.comparisonTitle": "Dos períodos, lado a lado",
    "chartsPage.comparisonBody":
      "No es un chart con dos series  -  el contrato no tiene una segunda serie que darle. Son dos paneles independientes en un Grid, el actual con <code>tone=\"accent\"</code> y superficie <code>surface</code>, el anterior con <code>tone=\"neutral\"</code> y superficie <code>sunken</code>, para que el ojo encuentre \"ahora\" antes que \"antes\".",
    "chartsPage.comparisonLabel": "Ingresos del trimestre, este año contra el anterior",
    "chartsPage.comparisonNote": "Grid + 2 × (Stat + Chart area)",
    "chartsPage.tanstackTitle": "Cuando el contrato no alcanza",
    "chartsPage.tanstackBody":
      "Facetas, apilados, scatter, brushing: eso es otro trabajo. El escape hatch vive en <code>@skryensya/charts/react/tanstack</code>, un import aparte para que salir del contrato se vea en el diff. Ahí la API es la de TanStack, sin changelog nuestro, y el peer pre-alpha queda sin instalar para quien no lo pidió.",
    "chartsPage.doTitle": "Sí",
    "chartsPage.doHeading": "Prácticas recomendadas",
    "chartsPage.doItem1":
      "Da a cada chart un <code>label</code> que diga qué mide, no \"gráfico\".",
    "chartsPage.doItem2":
      "Escribe <code>description</code> con la forma de los datos: rango, tendencia y unidades.",
    "chartsPage.doItem3":
      "Pon el número que importa en un <a href=\"/componentes/stat\">Stat</a>, no en el eje.",
    "chartsPage.doItem4":
      "Usa <code>tone</code> de la serie y, si hace falta, el de una entrada. El color sigue a los tokens.",
    "chartsPage.doItem5":
      "Compón la card con Box. No pidas un componente ChartCard al kit.",
    "chartsPage.dontTitle": "No",
    "chartsPage.dontHeading": "Errores frecuentes",
    "chartsPage.dontItem1":
      "No importes TanStack desde el camino documentado. El contrato no lo nombra.",
    "chartsPage.dontItem2":
      "No uses un chart para tres valores: una <a href=\"/componentes/table\">tabla</a> o un Stat se leen mejor.",
    "chartsPage.dontItem3":
      "No codifiques información sólo con color: la etiqueta y el valor siguen en el DOM a propósito.",
    "chartsPage.dontItem4":
      "No pongas título, acción o superficie en Chart. Eso es de lo que lo contiene.",
    "chartsPage.dontItem5":
      "No dibujes una serie de ceros como estado vacío: cero es un dato, y el vacío es no haber serie.",
    "chartsPage.implTitle": "Implementación",
    "chartsPage.implBody":
      "Un import para barras: <code>@skryensya/react/chart</code> y <code>components/chart.css</code>. Línea y área cambian el módulo a <code>@skryensya/charts/react</code> y dejan las props igual. El motor es una mejora de un gráfico que ya funcionaba.",
    "chartsPage.installBody":
      "Barras no piden más que Core y el binding. La hoja no entra en el bundle base: hay que importarla, igual que Stat.",
    "chartsPage.installLineBody":
      "Línea y área añaden el paquete opcional. No instala TanStack: ese peer sólo entra con el subpath <code>react/tanstack</code>.",
    "chartsPage.a11yP1":
      "La serie es una lista real de texto real. Un lector de pantalla lee \"Dic, 18, Ene, 22\" desde el DOM, no un <code>aria-label</code> que avisa que hay datos y se niega a decir cuáles.",
    "chartsPage.a11yP2":
      "<code>label</code> es obligatorio: una serie de números sin nada que diga qué miden es el único gráfico peor que ningún gráfico.",
    "chartsPage.a11yP3":
      "<code>description</code> es la forma de los datos en palabras, para quien no va a ver las barras.",
    "chartsPage.a11yP4":
      "<code>labels={false}</code> oculta las etiquetas, no las borra. El sparkline sigue siendo una lista.",
    "chartsPage.a11yP5":
      "El overlay de línea y área es <code>aria-hidden</code>: es una segunda pintura de la misma lista, y leer las dos sería leer la serie dos veces.",
    "chartsPage.testBarsNoEngine":
      "Las barras no pintan overlay: no necesitan este paquete.",
    "chartsPage.testLineOverlay":
      "La línea se pinta en el overlay y marca el gráfico como renderizado.",
    "chartsPage.testListIsData":
      "La serie sigue siendo una lista de texto, que es la representación accesible.",
    "chartsPage.testCardsAreComposition":
      "Las cards del dashboard se componen con Box, Stat, Chart y Button, sin inventar ChartCard.",
    "chartsPage.testNoTanstackApi":
      "El camino documentado no expone la gramática de TanStack.",

    "demo.charts.month.dec": "Dic",
    "demo.charts.month.jan": "Ene",
    "demo.charts.month.feb": "Feb",
    "demo.charts.month.mar": "Mar",
    "demo.charts.month.apr": "Abr",
    "demo.charts.weekday.mon": "L",
    "demo.charts.weekday.tue": "M",
    "demo.charts.weekday.wed": "X",
    "demo.charts.weekday.thu": "J",
    "demo.charts.weekday.fri": "V",
    "demo.charts.weekday.monShort": "Lun",
    "demo.charts.weekday.tueShort": "Mar",
    "demo.charts.weekday.wedShort": "Mié",
    "demo.charts.weekday.thuShort": "Jue",
    "demo.charts.weekday.friShort": "Vie",
    "demo.charts.weekday.satShort": "Sáb",
    "demo.charts.weekday.sunShort": "Dom",
    "demo.charts.week": "Sem",

    "demo.charts.history.heading": "Historial de aportes",
    "demo.charts.history.subtitle": "Actividad de los últimos cinco meses",
    "demo.charts.history.chartLabel": "Aportes por mes",
    "demo.charts.history.chartDescription":
      "Cinco meses de aportes. Diciembre está destacado, marzo es el más alto.",
    "demo.charts.history.upcomingLabel": "Próximo",
    "demo.charts.history.upcomingValue": "Mayo 2026",
    "demo.charts.history.upcomingChange": "Programado",
    "demo.charts.history.savingsLabel": "Plan de ahorro",
    "demo.charts.history.savingsValue": "Acelerado",
    "demo.charts.history.savingsChange": "Recurrente",
    "demo.charts.history.button": "Ver informe completo",

    "demo.charts.usage.heading": "Consumo eléctrico",
    "demo.charts.usage.subtitle": "Toda la casa",
    "demo.charts.usage.chartLabel": "Consumo por hora",
    "demo.charts.usage.chartDescription": "Ocho intervalos de dos horas. El pico es al mediodía, 31.",
    "demo.charts.usage.nowLabel": "En uso ahora",
    "demo.charts.usage.solarLabel": "Generación solar",
    "demo.charts.usage.solarChange": "+18%",

    "demo.charts.bar.label": "Componentes documentados por trimestre",
    "demo.charts.bar.description": "Cinco barras, una por trimestre, subiendo de 14 a 72 componentes.",

    "demo.charts.line.label": "Latencia de interacción por versión",
    "demo.charts.line.description":
      "Una línea descendente: la latencia baja de 182 a 74 milisegundos entre la 0.4 y la 0.9.",

    "demo.charts.area.label": "Peso del bundle por semana",
    "demo.charts.area.description":
      "Un área con el peso del bundle, bajando de 148 a 103 kB a lo largo de seis semanas.",

    "demo.charts.table.heading": "Ingresos por trimestre",
    "demo.charts.table.subtitle": "La forma arriba, el número exacto abajo",
    "demo.charts.table.chartDescription":
      "Cuatro trimestres, subiendo de 184 mil a 238 mil, con una baja en el tercero.",
    "demo.charts.table.caption": "Ingresos por trimestre, en dólares",
    "demo.charts.table.headQuarter": "Trimestre",
    "demo.charts.table.headRevenue": "Ingresos",
    "demo.charts.table.headChange": "Variación",

    "demo.charts.pointDetail.heading": "Latencia por endpoint",
    "demo.charts.pointDetail.subtitle":
      "El valor exacto está siempre en la lista; el tooltip lo repite para quien mira las barras",
    "demo.charts.pointDetail.chartDescription":
      "Cinco endpoints. El más lento es /search con 118 ms, el más rápido /health con 9 ms.",

    "demo.charts.legend.heading": "Presupuesto por equipo",
    "demo.charts.legend.subtitle": "Año fiscal 2026, en dólares",
    "demo.charts.legend.chartDescription":
      "Cinco equipos. Ingeniería es el mayor con 182 mil; Legal el menor con 21 mil.",

    "demo.charts.metricTabs.ariaLabel": "Elegir métrica",
    "demo.charts.metricTabs.revenueTab": "Ingresos",
    "demo.charts.metricTabs.revenueHeading": "Ingresos",
    "demo.charts.metricTabs.usersTab": "Usuarios",
    "demo.charts.metricTabs.usersHeading": "Usuarios activos",
    "demo.charts.metricTabs.errorsTab": "Errores",
    "demo.charts.metricTabs.errorsHeading": "Errores de servidor",
    "demo.charts.metricTabs.statLabel": "Últimas 6 semanas",

    "demo.charts.gallery.conversionTitle": "Conversión",
    "demo.charts.gallery.conversionChartLabel": "Conversión diaria",
    "demo.charts.gallery.errorsTitle": "Errores",
    "demo.charts.gallery.errorsChartLabel": "Errores por día",
    "demo.charts.gallery.cpuTitle": "CPU",
    "demo.charts.gallery.cpuChartLabel": "Uso de CPU",
    "demo.charts.gallery.spendTitle": "Gasto",
    "demo.charts.gallery.spendChartLabel": "Gasto diario",

    "demo.charts.comparison.currentTitle": "T4 2026",
    "demo.charts.comparison.priorTitle": "T4 2025",
    "demo.charts.comparison.statLabel": "Ingresos del trimestre",
    "demo.charts.comparison.chartLabelSuffix": "ingresos por mes",
    "demo.charts.comparison.currentValue": "231,7K",
    "demo.charts.comparison.currentChange": "+22%",
    "demo.charts.comparison.priorValue": "194,9K",

    "demo.charts.period.heading": "Tráfico del sitio",
    "demo.charts.period.subtitle": "Páginas vistas, por período",
    "demo.charts.period.ariaLabel": "Elegir período",
    "demo.charts.period.chartDescription": "La serie cambia con el período elegido; el control queda arriba.",
    "demo.charts.period.chartLabelPrefix": "Páginas vistas,",

    "demo.charts.analytics.heading": "Analítica",
    "demo.charts.analytics.statLabel": "Visitas este mes",
    "demo.charts.analytics.statValue": "418,2 mil",
    "demo.charts.analytics.statChange": "+10%",
    "demo.charts.analytics.button": "Ver analítica",
    "demo.charts.analytics.chartLabel": "Visitas por semana",
    "demo.charts.analytics.chartDescription": "Ocho semanas, subiendo de 38.200 a 61.400 visitas.",
  },
  en: {

    "chartsPage.betaBadge": "Beta",
    "chartsPage.description":
      "A series of labelled values made visible. Bars live in Core; line and area are an optional renderer. The card around them is a composition.",
    "chartsPage.lede":
      "Chart is a contract: <code>points</code>, <code>kind</code>, and a <code>label</code> that says what the numbers measure. It is not a charting library's API. Bars paint from markup. Line and area swap the import to <code>@skryensya/charts/react</code>, a drop-in that draws an overlay on the same list. TanStack exists, on another subpath, for the job this contract does not cover.",
    "chartsPage.calloutBody":
      "<strong>There is no <code>ChartCard</code>.</strong> Title, action, surface, and supporting numbers belong to <a href=\"/en/components/box\">Box</a>, <a href=\"/en/components/heading\">Heading</a>, <a href=\"/en/components/stat\">Stat</a>, and <a href=\"/en/components/button\">Button</a>. The chart only paints the series. Publishing it as a card variant would have grown exactly the component Card refuses to be; the recipe lives in <code>metric-panel</code>.",
    "chartsPage.cardsTitle": "A card with a chart",
    "chartsPage.cardsBody":
      "The first thing anyone asks for. Three compositions, not three components: the number lives in the text, the chart lives in the shape, and the button says where to go next.",
    "chartsPage.analyticsTitle": "Analytics, with the trend at the edge",
    "chartsPage.analyticsBody":
      "The number lives in the text. The area is a sparkline: <code>flush</code> cancels the Box padding so the series reaches the edge, and <code>labels={false}</code> hides the axis without removing the data from the DOM. Line and area import the optional renderer.",
    "chartsPage.analyticsLabel": "Visits over the last eight weeks",
    "chartsPage.analyticsNote": "Box + Badge + Button + Chart area · flush",
    "chartsPage.historyTitle": "History, with one bar emphasized",
    "chartsPage.historyBody":
      "Labelled bars, no engine. The series tone is <code>neutral</code>; December carries <code>tone=\"accent\"</code> to stand out against its siblings. The two sunken Stats are supporting, not peers of the headline.",
    "chartsPage.historyLabel": "Contributions over the last five months",
    "chartsPage.historyNote": "Box + Chart bar + Stat + Button",
    "chartsPage.usageTitle": "Usage, with the numbers underneath",
    "chartsPage.usageBody":
      "Bars again. The chart does not try to say 3.4 kW: that is what Stat is for. A chart you have to estimate values off is a worse table.",
    "chartsPage.usageLabel": "Whole-home power usage",
    "chartsPage.usageNote": "Box + Chart bar + Stat",
    "chartsPage.pieceTitle": "The chart, on its own",
    "chartsPage.pieceBody":
      "When there is no card around it, Chart is still the same signature: a list of entries, each with a label and a number. <code>kind</code> picks the shape.",
    "chartsPage.barTitle": "Bars, with no renderer",
    "chartsPage.barBody":
      "Each entry carries its value and the stylesheet divides by the series maximum. A bar chart paints from authored markup. <code>@skryensya/charts</code> is not required.",
    "chartsPage.barLabel": "Documented components per quarter",
    "chartsPage.barNote": "Chart · kind bar",
    "chartsPage.lineTitle": "Line, with the optional renderer",
    "chartsPage.lineBody":
      "A line needs a path, and CSS cannot compute one. The same component, imported from <code>@skryensya/charts/react</code>, draws the overlay. The props do not change.",
    "chartsPage.lineLabel": "Interaction latency per version",
    "chartsPage.lineNote": "Chart · kind line · @skryensya/charts",
    "chartsPage.areaTitle": "Area, the same drop-in",
    "chartsPage.areaBody":
      "An area is the line closed down to the baseline. The renderer paints two paths: a closed fill and an open stroke, so it never draws a vertical axis the contract does not have.",
    "chartsPage.areaLabel": "Bundle weight per week",
    "chartsPage.areaNote": "Chart · kind area · @skryensya/charts",
    "chartsPage.integrationsTitle": "Chart with other components",
    "chartsPage.integrationsBody":
      "Four more compositions, each a contract that already exists alongside Chart, not a new capability invented for charts specifically.",
    "chartsPage.periodTitle": "A selector swaps the series",
    "chartsPage.periodBody":
      "<code>Segmented</code> picks the period; Chart stays the same signature, only its <code>points</code> change. The heading and the control hold still, so the change reads as different data, not a different card.",
    "chartsPage.periodLabel": "Site traffic, by period",
    "chartsPage.periodNote": "Segmented + Chart bar",
    "chartsPage.tableTitle": "Chart and Table, the same series twice",
    "chartsPage.tableBody":
      "The chart says the shape; the table says the exact number and lets you compare row by row, the case Chart's own semantic <code>avoidWhen</code> already names as <em>\"a chart worse than a table\"</em>. Each carries its own accessible name: <code>label</code> on Chart, <code>TableCaption</code> on Table.",
    "chartsPage.tableLabel": "Revenue by quarter",
    "chartsPage.tableNote": "Chart bar + Table",
    "chartsPage.detailTitle": "A per-point detail, with Tooltip",
    "chartsPage.detailBody":
      "Chart's bar is <code>aria-hidden</code> with no name of its own, so it is not a valid Tooltip trigger: Tooltip's own contract requires its content to wrap a control that already has an accessible name. Here the trigger is a real <code>Button.action</code> per point, underneath the chart; it duplicates neither the overlay nor the accessible list.",
    "chartsPage.detailLabel": "Latency by endpoint, with detail",
    "chartsPage.detailNote": "Chart bar + Tooltip + Button",
    "chartsPage.galleryTitle": "Formats and sizes, side by side",
    "chartsPage.galleryBody":
      "The same options as always (<code>kind</code>, <code>tone</code>, <code>height</code>, <code>format</code>, <code>flush</code>, <code>grid</code>) at card scale, so the difference between them reads at a glance.",
    "chartsPage.galleryLabel": "Four chart cards, different options",
    "chartsPage.galleryNote": "Grid + 4 Chart",
    "chartsPage.metricTabsTitle": "Tabs, not Segmented: different metrics",
    "chartsPage.metricTabsBody":
      "The period selector above changes one SERIES under a setting; this is different: each tab is a distinct metric, with its own chart and its own tone, the same distinction <code>hero-with-audience-tabs</code> draws for a pitch. All three panels share the same chart height so switching tabs never moves the rest of the page.",
    "chartsPage.metricTabsLabel": "Revenue, users and errors per week",
    "chartsPage.metricTabsNote": "Tabs + Stat + Chart bar",
    "chartsPage.legendTitle": "A legend, made of Badge",
    "chartsPage.legendBody":
      "Each entry carries its own <code>tone</code> (the contract's own per-point override) and the legend below repeats that mapping as Badges of the same tone. It is decoration: <code>values</code> already paints each bar's own number and the label already names the category, so the legend is never the only source of anything.",
    "chartsPage.legendLabel": "Budget by team, five categories",
    "chartsPage.legendNote": "Chart bar · per-point tone + Badge",
    "chartsPage.comparisonTitle": "Two periods, side by side",
    "chartsPage.comparisonBody":
      "Not one chart with two series  -  the contract has no second series to give it. Two independent panels in a Grid, the current one <code>tone=\"accent\"</code> on a <code>surface</code> box, the prior one <code>tone=\"neutral\"</code> on a <code>sunken</code> one, so the eye finds \"now\" before it finds \"then\".",
    "chartsPage.comparisonLabel": "Quarterly revenue, this year against last",
    "chartsPage.comparisonNote": "Grid + 2 × (Stat + Chart area)",
    "chartsPage.tanstackTitle": "When the contract is not enough",
    "chartsPage.tanstackBody":
      "Facets, stacks, scatter, brushing: that is a different job. The escape hatch lives at <code>@skryensya/charts/react/tanstack</code>, a separate import so leaving the contract is visible in the diff. There the API is TanStack's, with no changelog of ours, and the pre-alpha peer stays uninstalled for anyone who did not ask for it.",
    "chartsPage.doTitle": "Do",
    "chartsPage.doHeading": "Recommended practice",
    "chartsPage.doItem1":
      "Give every chart a <code>label</code> that says what it measures, not \"chart\".",
    "chartsPage.doItem2":
      "Write a <code>description</code> carrying the shape of the data: range, trend, and units.",
    "chartsPage.doItem3":
      "Put the number that matters in a <a href=\"/en/components/stat\">Stat</a>, not on the axis.",
    "chartsPage.doItem4":
      "Use the series <code>tone</code> and, when needed, an entry's own. Color follows the tokens.",
    "chartsPage.doItem5":
      "Compose the card with Box. Do not ask the kit for a ChartCard component.",
    "chartsPage.dontTitle": "Don't",
    "chartsPage.dontHeading": "Common mistakes",
    "chartsPage.dontItem1":
      "Don't import TanStack on the documented path. The contract does not name it.",
    "chartsPage.dontItem2":
      "Don't use a chart for three values: a <a href=\"/en/components/table\">table</a> or a Stat reads better.",
    "chartsPage.dontItem3":
      "Don't encode information in color alone: the label and value stay in the DOM on purpose.",
    "chartsPage.dontItem4":
      "Don't put a title, an action, or a surface on Chart. Those belong to whatever contains it.",
    "chartsPage.dontItem5":
      "Don't draw a series of zeros as an empty state: zero is a datum, and empty is no series at all.",
    "chartsPage.implTitle": "Implementation",
    "chartsPage.implBody":
      "One import for bars: <code>@skryensya/react/chart</code> and <code>components/chart.css</code>. Line and area swap the module to <code>@skryensya/charts/react</code> and leave the props alone. The engine is an upgrade to a chart that already worked.",
    "chartsPage.installBody":
      "Bars ask for nothing beyond Core and the binding. The sheet is not in the base bundle: import it, the same way Stat does.",
    "chartsPage.installLineBody":
      "Line and area add the optional package. It does not install TanStack: that peer only arrives with the <code>react/tanstack</code> subpath.",
    "chartsPage.a11yP1":
      "The series is a real list of real text. A screen reader reads \"Dec, 18, Jan, 22\" off the DOM, not an <code>aria-label</code> that announces data exists and then refuses to say what it is.",
    "chartsPage.a11yP2":
      "<code>label</code> is required: a series of numbers with nothing saying what they measure is the one chart worse than no chart.",
    "chartsPage.a11yP3":
      "<code>description</code> is the shape of the data in words, for a reader who is not going to see the bars.",
    "chartsPage.a11yP4":
      "<code>labels={false}</code> hides the labels, it does not delete them. The sparkline is still a list.",
    "chartsPage.a11yP5":
      "The line and area overlay is <code>aria-hidden</code>: it is a second painting of the same list, and reading both would read the series twice.",
    "chartsPage.testBarsNoEngine":
      "Bars paint no overlay: they never need this package.",
    "chartsPage.testLineOverlay":
      "The line is painted into the overlay and flags the chart as rendered.",
    "chartsPage.testListIsData":
      "The series stays a list of text, which is the accessible rendering.",
    "chartsPage.testCardsAreComposition":
      "The dashboard cards are composed from Box, Stat, Chart, and Button, without inventing ChartCard.",
    "chartsPage.testNoTanstackApi":
      "The documented path does not expose TanStack's grammar.",

    "demo.charts.month.dec": "Dec",
    "demo.charts.month.jan": "Jan",
    "demo.charts.month.feb": "Feb",
    "demo.charts.month.mar": "Mar",
    "demo.charts.month.apr": "Apr",
    "demo.charts.weekday.mon": "Mo",
    "demo.charts.weekday.tue": "Tu",
    "demo.charts.weekday.wed": "We",
    "demo.charts.weekday.thu": "Th",
    "demo.charts.weekday.fri": "Fr",
    "demo.charts.weekday.monShort": "Mon",
    "demo.charts.weekday.tueShort": "Tue",
    "demo.charts.weekday.wedShort": "Wed",
    "demo.charts.weekday.thuShort": "Thu",
    "demo.charts.weekday.friShort": "Fri",
    "demo.charts.weekday.satShort": "Sat",
    "demo.charts.weekday.sunShort": "Sun",
    "demo.charts.week": "Wk",

    "demo.charts.history.heading": "Contribution History",
    "demo.charts.history.subtitle": "Last 5 months of activity",
    "demo.charts.history.chartLabel": "Contributions per month",
    "demo.charts.history.chartDescription":
      "Five months of contributions. December is emphasized, March is the tallest.",
    "demo.charts.history.upcomingLabel": "Upcoming",
    "demo.charts.history.upcomingValue": "May 2026",
    "demo.charts.history.upcomingChange": "Scheduled",
    "demo.charts.history.savingsLabel": "Savings plan",
    "demo.charts.history.savingsValue": "Accelerated",
    "demo.charts.history.savingsChange": "Recurring",
    "demo.charts.history.button": "View Full Report",

    "demo.charts.usage.heading": "Power Usage",
    "demo.charts.usage.subtitle": "Whole Home",
    "demo.charts.usage.chartLabel": "Usage by hour",
    "demo.charts.usage.chartDescription": "Eight two-hour intervals. The peak is at noon, 31.",
    "demo.charts.usage.nowLabel": "Currently Using",
    "demo.charts.usage.solarLabel": "Solar Gen",
    "demo.charts.usage.solarChange": "+18%",

    "demo.charts.bar.label": "Documented components per quarter",
    "demo.charts.bar.description": "Five bars, one per quarter, rising from 14 to 72 components.",

    "demo.charts.line.label": "Interaction latency per version",
    "demo.charts.line.description":
      "A descending line: latency drops from 182 to 74 milliseconds between 0.4 and 0.9.",

    "demo.charts.area.label": "Bundle weight per week",
    "demo.charts.area.description":
      "An area for bundle weight, falling from 148 to 103 kB across six weeks.",

    "demo.charts.table.heading": "Revenue by quarter",
    "demo.charts.table.subtitle": "The shape above, the exact figure below",
    "demo.charts.table.chartDescription":
      "Four quarters, rising from 184K to 238K, with a dip in the third.",
    "demo.charts.table.caption": "Revenue by quarter, in dollars",
    "demo.charts.table.headQuarter": "Quarter",
    "demo.charts.table.headRevenue": "Revenue",
    "demo.charts.table.headChange": "Change",

    "demo.charts.pointDetail.heading": "Latency by endpoint",
    "demo.charts.pointDetail.subtitle":
      "The exact value is always in the list; the tooltip repeats it for someone reading the bars",
    "demo.charts.pointDetail.chartDescription":
      "Five endpoints. The slowest is /search at 118 ms, the fastest /health at 9 ms.",

    "demo.charts.legend.heading": "Budget by team",
    "demo.charts.legend.subtitle": "Fiscal year 2026, in dollars",
    "demo.charts.legend.chartDescription":
      "Five teams. Engineering is the largest at 182K; Legal the smallest at 21K.",

    "demo.charts.metricTabs.ariaLabel": "Choose metric",
    "demo.charts.metricTabs.revenueTab": "Revenue",
    "demo.charts.metricTabs.revenueHeading": "Revenue",
    "demo.charts.metricTabs.usersTab": "Users",
    "demo.charts.metricTabs.usersHeading": "Active users",
    "demo.charts.metricTabs.errorsTab": "Errors",
    "demo.charts.metricTabs.errorsHeading": "Server errors",
    "demo.charts.metricTabs.statLabel": "Last 6 weeks",

    "demo.charts.gallery.conversionTitle": "Conversion",
    "demo.charts.gallery.conversionChartLabel": "Daily conversion",
    "demo.charts.gallery.errorsTitle": "Errors",
    "demo.charts.gallery.errorsChartLabel": "Errors per day",
    "demo.charts.gallery.cpuTitle": "CPU",
    "demo.charts.gallery.cpuChartLabel": "CPU usage",
    "demo.charts.gallery.spendTitle": "Spend",
    "demo.charts.gallery.spendChartLabel": "Daily spend",

    "demo.charts.comparison.currentTitle": "Q4 2026",
    "demo.charts.comparison.priorTitle": "Q4 2025",
    "demo.charts.comparison.statLabel": "Quarterly revenue",
    "demo.charts.comparison.chartLabelSuffix": "revenue by month",
    "demo.charts.comparison.currentValue": "231.7K",
    "demo.charts.comparison.currentChange": "+22%",
    "demo.charts.comparison.priorValue": "194.9K",

    "demo.charts.period.heading": "Site traffic",
    "demo.charts.period.subtitle": "Page views, by period",
    "demo.charts.period.ariaLabel": "Choose period",
    "demo.charts.period.chartDescription": "The series changes with the chosen period; the control stays put.",
    "demo.charts.period.chartLabelPrefix": "Page views,",

    "demo.charts.analytics.heading": "Analytics",
    "demo.charts.analytics.statLabel": "Visits this month",
    "demo.charts.analytics.statValue": "418.2K",
    "demo.charts.analytics.statChange": "+10%",
    "demo.charts.analytics.button": "View Analytics",
    "demo.charts.analytics.chartLabel": "Visits per week",
    "demo.charts.analytics.chartDescription": "Eight weeks, rising from 38,200 to 61,400 visits.",
  },
} as const;
