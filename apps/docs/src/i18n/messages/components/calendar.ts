export const calendarMessages = {
  es: {
    "demo.calendar.locale": "es-DO",
    "demo.calendar.availability": "Disponibilidad",
    "demo.calendar.stay": "Estadía",

    "calendar.description":
      "Grid de fecha independiente: día, mes o año/década, sin campo ni popover, con el mismo botón cambiando de vista.",
    "calendar.betaBadge": "Beta",
    "calendar.lede":
      'El grid de fecha en sí, separado del campo que lo abre. <a href="/components/date-picker">DatePicker</a> lo nestea dentro de un popover; esta página es el mismo componente de pie, para cuando el calendario <em>es</em> la UI (una página de reservas, un filtro de dashboard) y no hace falta un input detrás.',
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
    "calendar.test4": "Pinta cada control del calendario en un solo escalón de tamaño, incluidas las celdas de día.",
  },
  en: {
    "demo.calendar.locale": "en-US",
    "demo.calendar.availability": "Availability",
    "demo.calendar.stay": "Stay",

    "calendar.description":
      "Standalone date grid for a day, month, or year/decade view, with no field or popover and the same button switching views.",
    "calendar.betaBadge": "Beta",
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
    "calendar.test4": "Paints every control in the calendar at one size tier, day cells included.",
  },
} as const;
