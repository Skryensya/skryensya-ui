export const kbdMessages = {
  es: {
    "kbdPage.description": "Kbd: una tecla dibujada, el <kbd> nativo con styling hooks y wrapper React.",
    "kbdPage.lede":
      'Kbd es una <strong>tecla dibujada</strong>: el <code>&lt;kbd&gt;</code> nativo con el aspecto de una tecla física. La usas para mostrar un atajo, el ⌘K del buscador de arriba, el Esc en el pie de una <a href="/components/command-palette">CommandPalette</a>. Es estática, como Badge: sin estado, sin máquina, sin enhancer vanilla. La semántica del <code>&lt;kbd&gt;</code> es de la plataforma; el componente solo aporta la pinta. El reposo es <code>neutral</code>; <code>tone="accent"</code> es el chip de marca.',
    "kbdPage.toneTitle": "Con acento y sin acento",
    "kbdPage.toneBody":
      'El default es una tecla de plástico: superficie raised, bisel claro arriba y un peldaño abajo. <code>data-tone="accent"</code> (en React, <code>tone="accent"</code>) es el mismo capuchón pintado con la marca, para un atajo que tiene que gritar. El ⌘K del chrome y el pie de la paleta se quedan en el default.',
    "kbdPage.squareTitle": "Un glifo se lee cuadrado",
    "kbdPage.squareBody":
      'Una sola tecla (<kbd class="sk-kbd">K</kbd>, <kbd class="sk-kbd">⌘</kbd>, <kbd class="sk-kbd">↑</kbd>) toma un mínimo cuadrado en vez de quedar como una astilla; una etiqueta más larga (<kbd class="sk-kbd">Esc</kbd>, <kbd class="sk-kbd">Enter</kbd>) crece con su texto. El mínimo es <code>--sk-kbd-min-size</code>, relativo a la propia tipografía de la tecla, así que se mantiene cuadrada a cualquier tamaño.',
    "kbdPage.pressedTitle": "El estado apretado",
    "kbdPage.pressedBody1":
      'Kbd no es un control, no se clickea, así que su único estado <strong>refleja</strong> un evento externo: <code>data-pressed</code>, que lo prende mientras su tecla física está apretada, igual que un componente refleja el <code>data-state</code> de una máquina. Lo escribe quien mira el teclado, no el kbd. Neutral se hunde: el bisel se invierte y el relleno pasa a sunken. Accent, además, toma el color de acción: "este atajo está vivo" es información. La transición usa la intención <code>feedback</code> (<a href="/motion">motion</a>).',
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
    "kbdPage.test4": "El tono por defecto es <code>neutral</code>; <code>accent</code> se pide.",
  },
  en: {
    "kbdPage.description": "Kbd: a drawn key, the native <kbd> with styling hooks and a React wrapper.",
    "kbdPage.lede":
      'Kbd is a <strong>drawn key</strong>: the native <code>&lt;kbd&gt;</code> with the look of a physical key. You use it to show a shortcut, the ⌘K on the search bar above, the Esc in a <a href="/en/components/command-palette">CommandPalette</a>\'s footer. It is static, like Badge: no state, no machine, no vanilla enhancer. The <code>&lt;kbd&gt;</code>\'s semantics belong to the platform; the component only adds the look. Rest is <code>neutral</code>; <code>tone="accent"</code> is the brand chip.',
    "kbdPage.toneTitle": "With accent and without",
    "kbdPage.toneBody":
      'The default is a plastic key: a raised surface, a light bevel on top and a ledge underneath. <code>data-tone="accent"</code> (in React, <code>tone="accent"</code>) is the same cap painted with the brand, for a shortcut that has to shout. The chrome ⌘K and the palette footer stay on the default.',
    "kbdPage.squareTitle": "A glyph reads square",
    "kbdPage.squareBody":
      'A single key (<kbd class="sk-kbd">K</kbd>, <kbd class="sk-kbd">⌘</kbd>, <kbd class="sk-kbd">↑</kbd>) takes a square minimum instead of reading as a sliver; a longer label (<kbd class="sk-kbd">Esc</kbd>, <kbd class="sk-kbd">Enter</kbd>) grows with its text. The minimum is <code>--sk-kbd-min-size</code>, relative to the key\'s own typography, so it stays square at any size.',
    "kbdPage.pressedTitle": "The pressed state",
    "kbdPage.pressedBody1":
      'Kbd is not a control, it is not clicked, so its one state <strong>reflects</strong> an external event: <code>data-pressed</code>, which turns on while its physical key is held down, the same way a component reflects a machine\'s <code>data-state</code>. Whoever is watching the keyboard writes it, not the kbd. Neutral sinks: the bevel inverts and the fill goes sunken. Accent also takes the action colour: "this shortcut is live" is information. The transition uses the <code>feedback</code> intent (<a href="/en/motion">motion</a>).',
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
    "kbdPage.test4": "The default tone is <code>neutral</code>; <code>accent</code> is opt-in.",
  },
} as const;
