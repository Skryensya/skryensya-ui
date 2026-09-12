export const colorPickerMessages = {
  es: {
    "demo.colorPicker.label": "Color de marca",
    "demo.colorPicker.compactLabel": "Acento",
    "demo.colorPicker.presetsLabel": "Color con presets",
    "demo.colorPicker.nativeLabel": "Color de fondo",

    "colorPicker.description":
      "Selector de color con área de saturación/valor, riel de matiz, riel de alfa, filas hex/RGB/HSL/OKLCH y presets, más un type=color nativo.",
    "colorPicker.betaBadge": "Beta",
    "colorPicker.lede":
      'Tres formas de elegir un color. La <strong>nativa</strong> es un <code>&lt;input type="color"&gt;</code> con el picker del sistema operativo: sin JavaScript, sin presets, un solo hex plano. La <strong>custom</strong> monta un panel derivado de <code>@zag-js/color-picker</code> detrás de un botón swatch, con área 2D, rieles de matiz y alfa, y filas de canal editables en hex, RGB, HSL y OKLCH. OKLCH no lo entiende la máquina directamente (Zag sólo trae rgba/hsla/hsba); esa fila lee y escribe a través de una conversión propia (<code>@skryensya/core/color</code>) sobre el mismo color que la máquina expone, nunca un estado paralelo. La <strong>compact</strong> comparte el mismo control y abre el mismo tipo de panel, sólo que sin las filas de canal: área, riel de matiz y presets.',
    "colorPicker.anatomyBody":
      "El control (label, trigger, swatch) es markup; el panel (área, canales, presets, cuentagotas) es chrome derivado. El espécimen lo deja abierto y congelado para nombrar ambas mitades; los thumbs de los rieles quedan fuera a propósito.",
    "colorPicker.anatomyLabel": "Anatomía de ColorPicker",
    "colorPicker.anatomyPreviewLabel": "ColorPicker, parte por parte",
    "colorPicker.nativeTitle": "Nativo",
    "colorPicker.nativeBody": "El picker de plataforma, sin JavaScript ni enhancer.",
    "colorPicker.customTitle": "Custom",
    "colorPicker.customBody": "El panel completo: área, ambos rieles, los cuatro formatos de canal y el cuentagotas donde el navegador lo soporta.",
    "colorPicker.compactTitle": "Compact",
    "colorPicker.compactBody": "Sin las filas de canal: sólo área, riel de matiz y presets, para un swatch de barra de herramientas.",
    "colorPicker.presetsTitle": "Con presets",
    "colorPicker.presetsBody": "La opción <code>swatches</code> es un string separado por espacios, no una lista de items: un preset sólo tiene un valor, así que no hace falta la forma de colección completa.",
    "colorPicker.disabledTitle": "Disabled",
    "colorPicker.disabledLabel": "ColorPicker (disabled)",
    "colorPicker.whichTitle": "Cuál usar",
    "colorPicker.whichBody":
      "Empieza por el <strong>nativo</strong> cuando el color es un campo de formulario común, sin presets ni necesidad de ver los canales mientras se ajusta. Sube a <strong>custom</strong> (full o compact) cuando hace falta OKLCH, presets de marca, o ver y escribir el mismo color en varios formatos a la vez.",
    "colorPicker.contractBody":
      'React ofrece <code>ColorPicker</code>, <code>CompactColorPicker</code> y <code>NativeColorPicker</code> sobre <code>@zag-js/color-picker</code>. Vanilla hidrata el <code>data-sk-color-picker</code> escrito a mano: parcha el control (label, swatch, input oculto para el envío del formulario) y renderiza el panel con un componente compartido, igual que Calendar hace con DatePicker. El input <code>type="color"</code> nativo no necesita enhancer.',
    "colorPicker.a11yBody":
      'El trigger es icon-only y su nombre accesible lo da <code>triggerLabel</code> ("Elegir color" por default); la máquina agrega su propio <code>aria-labelledby</code> apuntando al label del campo, y como ese atributo le gana a <code>aria-label</code> en el algoritmo de nombre accesible, ambos bindings lo quitan para que <code>triggerLabel</code> sea el que realmente se anuncia. El área 2D y ambos rieles son <code>role="slider"</code> operables por teclado (flechas, Av Pág/Re Pág).',
    "colorPicker.test1": "Rechaza markup al que le falta una parte que necesita parchar.",
    "colorPicker.test2": "Parcha el control escrito a mano y renderiza el popover alrededor de un panel.",
    "colorPicker.test3": "Muestra el color de partida en la custom property del root.",
    "colorPicker.test4": "Confirma un hex escrito a mano y llena cada fila de canal desde él.",
    "colorPicker.test5": "Elige un swatch preset y actualiza el color actual.",
    "colorPicker.test6": "La anatomía compact quita las filas de canal por completo.",
    "colorPicker.test7": "Mantiene el nombre accesible del trigger sin que Zag lo pise.",
  },
  en: {
    "demo.colorPicker.label": "Brand color",
    "demo.colorPicker.compactLabel": "Accent",
    "demo.colorPicker.presetsLabel": "Color with presets",
    "demo.colorPicker.nativeLabel": "Background color",

    "colorPicker.description":
      "A color picker with a saturation/value area, a hue rail, an alpha rail, hex/RGB/HSL/OKLCH rows and presets, plus a native type=color.",
    "colorPicker.betaBadge": "Beta",
    "colorPicker.lede":
      'Three ways to pick a color. The <strong>native</strong> one is an <code>&lt;input type="color"&gt;</code> with the OS\'s own picker: no JavaScript, no presets, one flat hex value. The <strong>custom</strong> one mounts a panel derived from <code>@zag-js/color-picker</code> behind a swatch button, with a 2D area, hue and alpha rails, and channel rows editable in hex, RGB, HSL and OKLCH. The machine does not understand OKLCH directly (Zag only ships rgba/hsla/hsba); that row reads and writes through a conversion this system owns (<code>@skryensya/core/color</code>) over the same color the machine already exposes, never a parallel piece of state. The <strong>compact</strong> one shares the same control and opens the same kind of panel, just without the channel rows: area, hue rail and presets.',
    "colorPicker.anatomyBody":
      "The control (label, trigger, swatch) is markup; the panel (area, channels, presets, eyedropper) is derived chrome. The specimen holds it open and frozen so both halves can be named; rail thumbs stay out on purpose.",
    "colorPicker.anatomyLabel": "ColorPicker anatomy",
    "colorPicker.anatomyPreviewLabel": "ColorPicker, part by part",
    "colorPicker.nativeTitle": "Native",
    "colorPicker.nativeBody": "The platform's own picker, no JavaScript, no enhancer.",
    "colorPicker.customTitle": "Custom",
    "colorPicker.customBody": "The full panel: the area, both rails, all four channel formats, and the eyedropper where the browser supports it.",
    "colorPicker.compactTitle": "Compact",
    "colorPicker.compactBody": "No channel rows: just the area, the hue rail and presets, for a toolbar-sized swatch.",
    "colorPicker.presetsTitle": "With presets",
    "colorPicker.presetsBody": "The <code>swatches</code> option is a space-separated string, not an items list: a preset has exactly one field, so the full collection shape buys nothing here.",
    "colorPicker.disabledTitle": "Disabled",
    "colorPicker.disabledLabel": "ColorPicker (disabled)",
    "colorPicker.whichTitle": "Which to use",
    "colorPicker.whichBody":
      "Start with the <strong>native</strong> one when the color is an ordinary form field, with no presets and no need to see the channels while adjusting it. Move up to <strong>custom</strong> (full or compact) once you need OKLCH, brand presets, or seeing and typing the same color in several formats at once.",
    "colorPicker.contractBody":
      'React offers <code>ColorPicker</code>, <code>CompactColorPicker</code> and <code>NativeColorPicker</code> over <code>@zag-js/color-picker</code>. Vanilla hydrates the authored <code>data-sk-color-picker</code>: it patches the control (label, swatch, a hidden input for form submission) and renders the panel with a shared component, the same way Calendar does for DatePicker. The native <code>type="color"</code> input needs no enhancer.',
    "colorPicker.a11yBody":
      'The trigger is icon-only and its accessible name comes from <code>triggerLabel</code> ("Choose color" by default); the machine also adds its own <code>aria-labelledby</code> pointing at the field\'s label, and since that attribute outranks <code>aria-label</code> in the accessible-name algorithm, both bindings remove it so <code>triggerLabel</code> is what actually gets announced. The 2D area and both rails are keyboard-operable <code>role="slider"</code>s (arrow keys, Page Up/Down).',
    "colorPicker.test1": "Refuses markup that is missing a part it must patch.",
    "colorPicker.test2": "Patches the authored control and renders the popover around a panel.",
    "colorPicker.test3": "Shows the starting color on the root's own custom property.",
    "colorPicker.test4": "Commits a typed hex value and fills every channel row from it.",
    "colorPicker.test5": "Selects a preset swatch and updates the current color.",
    "colorPicker.test6": "The compact anatomy drops the channel-input rows entirely.",
    "colorPicker.test7": "Keeps the trigger's accessible name intact instead of letting Zag override it.",
  },
} as const;
