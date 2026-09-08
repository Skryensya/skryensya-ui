export const switchMessages = {
  es: {
    "demo.switch.deployAutomatically": "Desplegar automáticamente",
    "demo.switch.auto.title": "Despliegue automático",
    "demo.switch.auto.body": "Publica cuando las verificaciones pasan.",
    "demo.switch.public.title": "URL pública",
    "demo.switch.public.body": "Cualquiera con el enlace puede verla.",

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
  },
  en: {
    "demo.switch.deployAutomatically": "Deploy automatically",
    "demo.switch.auto.title": "Automatic deployment",
    "demo.switch.auto.body": "Publish when all checks pass.",
    "demo.switch.public.title": "Public URL",
    "demo.switch.public.body": "Anyone with the link can view it.",
    "switchPage.description": "Switch: a persistent binary preference over a native checkbox.",
    "switchPage.lede":
      "A binary state that takes effect immediately: on or off. For a selection that needs saving, use Checkbox.",
    "switchPage.body":
      "Needs no Vanilla initialization: the native checkbox already keeps keyboard, reset and form submission. React only wraps that same control.",
    "switchPage.tileTitle": "Surface switch: TileSwitch",
    "switchPage.tileBody1":
      "When the preference needs a title, a description and the whole surface as its target, use <code>TileSwitch</code>. It's the same control (<code>sk-switch__control</code> plus thumb); only the container changes, the same relationship <code>TileCheckbox</code> has with Checkbox.",
    "switchPage.tileBody2":
      'The <code>tile-switch</code> enhancer (Svelte + <code>@zag-js/checkbox</code>, the same machine TileCheckbox and React use) hydrates every <code>data-sk-tile-switch</code> label with <code>initComponents()</code>: it drives its <code>input[data-part="input"]</code> (hidden, <code>role="switch"</code>) and syncs <code>data-state</code>; <code>[data-part="indicator"]</code> is the visual control.',
    "switchPage.contractItem1":
      '<code>The input is still a checkbox</code>; <code>role="switch"</code> communicates the correct semantics.',
    "switchPage.contractItem2":
      "<code>defaultChecked</code> leaves the value to the browser; <code>checked</code> controls it.",
    "switchPage.contractItem3":
      "<code>onCheckedChange</code> (<code>onCheck</code> on TileSwitch) reports intent; it never infers persistence or makes a request.",
    "switchPage.contractItem4":
      "Reach for it only when the change takes effect immediately and there are exactly two states: no indeterminate, unlike Checkbox.",
    "switchPage.contractItem5":
      "TileSwitch reuses <code>sk-switch__control</code> and the same thumb; it invents no second control.",
    "switchPage.test1":
      "Toggles checked state and the root's <code>data-state</code> on click, emitting <code>sk:checkedchange</code>.",
    "switchPage.test2": "Is form-associated and honours its <code>default-checked</code>.",
  },
} as const;
