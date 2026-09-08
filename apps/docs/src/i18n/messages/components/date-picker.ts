export const datePickerMessages = {
  es: {

    "demo.datePicker.locale": "es-DO",
    "demo.datePicker.label": "Reserva",
    "demo.datePicker.placeholder": "dd/mm/aaaa",
    "demo.datePicker.clear": "Limpiar fecha",

    "datePicker.description":
      "Campo de fecha único o en rango, con nativo type=date y calendario custom detrás de un trigger.",
    "datePicker.lede":
      'Dos versiones, un solo campo. La <strong>nativa</strong> es un <code>&lt;input type="date"&gt;</code> con el chrome del sistema: teclado, formulario y calendario del SO vienen de la plataforma, sin JavaScript. La <strong>custom</strong> monta un <a href="/components/calendar">Calendar</a> detrás de un trigger con la misma forma de campo, para cuando necesitas rango, localización explícita o un calendario consistente entre navegadores. Las dos comparten <code>.sk-date-picker__control</code>, así que se ven igual. El calendario en sí (encabezado, vistas, grillas) es responsabilidad de Calendar, no de este componente: DatePicker sólo lo nestea dentro de su popover.',
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
      'Bajo el breakpoint de escritorio (30rem) el calendario custom deja de colgar del campo y se vuelve una <strong>hoja inferior</strong>: el positioner llena la pantalla como scrim y el contenido se ancla al borde inferior, a todo el ancho, y sube. Toma el <em>aspecto</em> del Vaul, no el arrastre (es un popover de Zag, no un <code>&lt;dialog&gt;</code> nativo), pero cierra igual al tocar fuera o con <kbd class="sk-kbd">Esc</kbd>. Es el mismo corte responsivo que <a href="/components/dialog">Dialog Vaul</a>.',
    "datePicker.a11yBody":
      'La fecha usa valores <code>DateValue</code> y zona horaria explícita; no se modela como string ambiguo de locale. El control conserva nombre accesible por su <code>label</code>. La accesibilidad del grid en sí (rol, navegación por teclado, cambio de vista) es contrato de <a href="/components/calendar">Calendar</a>.',
    "datePicker.test1": "Rechaza markup al que le falta una parte que necesita parchar.",
    "datePicker.test2": "Parcha el control autorado y renderiza el popover alrededor de un calendario.",
    "datePicker.test3": "Llena el campo con el día que eligió quien lee.",
  },
  en: {

    "demo.datePicker.locale": "en-US",
    "demo.datePicker.label": "Booking",
    "demo.datePicker.placeholder": "mm/dd/yyyy",
    "demo.datePicker.clear": "Clear date",

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
  },
} as const;
