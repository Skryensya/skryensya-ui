export const selectMessages = {
  es: {
    "demo.select.label": "Plan",

    "selectPage.description": "Select: un listbox enhanced con máquina, para Vanilla y React.",
    "selectPage.anatomyBody":
      "Un Select cerrado es un trigger: el positioner, el content y las filas sólo existen mientras el listbox está arriba. Por eso el espécimen se dibuja abierto y se queda así. Está congelado; el Select vivo es el de abajo.",
    "selectPage.anatomyLabel": "Anatomía de Select",
    "selectPage.anatomyPreviewLabel": "Select abierto, parte por parte",
    "selectPage.lede":
      "El selector principal cuando la interacción necesita typeahead, highlight, popup controlado y posicionamiento. <code>Select</code> comparte su contrato de parts en <code>@skryensya/vanilla</code> y <code>@skryensya/react</code>; la máquina de cada binding es un detalle interno.",
    "selectPage.nativeLinkBody": 'Para una elección estándar de formulario, usa el <a href="#select-nativo">Select nativo</a> documentado al final: no carga un enhancer, conserva el comportamiento de plataforma y estiliza su picker mediante mejora progresiva.',
    "selectPage.enhancedLabel": "Select enhanced",
    "selectPage.densityBody": "La densidad compacta el espacio alrededor del selector, no sus objetivos táctiles: el trigger y cada opción conservan un mínimo de <code>44px</code> de alto.",
    "selectPage.htmlTitle": "HTML escrito a mano",
    "selectPage.htmlBody":
      "Los items <strong>son</strong> la colección: el enhancer los lee del DOM, igual que tabs lee sus triggers. Cada <code>data-sk-select-item</code> necesita un <code>data-value</code>. El markup completo está en la pestaña <strong>Vanilla</strong> del preview.",
    "selectPage.vanillaInitTitle": "Inicializar Vanilla",
    "selectPage.listenTitle": "Escuchar el cambio",
    "selectPage.formsTitle": "Formularios y fallback sin JavaScript",
    "selectPage.enhancedContractTitle": "Contrato enhanced",
    "selectPage.enhancedContractItem1": "La raíz lleva <code>data-sk-select</code> y la anatomía de parts documentada.",
    "selectPage.enhancedContractItem2": "El enhancer no renderiza markup ni inventa clases; sólo conecta los nodos escritos a mano.",
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
    "selectPage.test2": "Conduce la máquina sobre el markup escrito a mano: ARIA, selección y el texto del valor.",
    "selectPage.test3": "Emite <code>sk-value-change</code>, y el cleanup detiene la máquina.",
  },
  en: {
    "demo.select.label": "Plan",

    "selectPage.description": "Select: a machine-enhanced listbox, for Vanilla and React.",
    "selectPage.anatomyBody":
      "A closed Select is a trigger: the positioner, the content and the rows only exist while the listbox is up. So the specimen is drawn open and stays open. It is frozen; the live Select is the one below.",
    "selectPage.anatomyLabel": "Select anatomy",
    "selectPage.anatomyPreviewLabel": "An open Select, part by part",
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
  },
} as const;
