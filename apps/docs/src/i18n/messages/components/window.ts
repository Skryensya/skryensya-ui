export const windowMessages = {
  es: {
    "demo.window.trigger": "Abrir inspector",
    "demo.window.title": "Inspector",
    "demo.window.body": "Arrastra la barra de título para moverla, y un borde o una esquina para cambiarle el tamaño.",
    "demo.window.close": "Cerrar",
    "demo.window.minimize": "Minimizar",
    "demo.window.maximize": "Maximizar",
    "demo.window.restore": "Restaurar",
    "demo.windowFixed.trigger": "Abrir notas",
    "demo.windowFixed.title": "Notas",
    "demo.windowFixed.body": "Esta ventana se mueve, pero no cambia de tamaño.",

    "windowPage.description":
      "Un panel no modal que se mueve, cambia de tamaño, se minimiza y se maximiza, al lado de la página y sin bloquearla.",
    "windowPage.lede":
      "Una <strong>ventana</strong> es para lo que tiene que quedar abierto mientras sigues trabajando: una paleta de herramientas, un inspector, un chat. La barra de título la arrastra, los bordes y las esquinas la redimensionan, y sus controles la minimizan, la maximizan y la cierran. A diferencia de un <code>Dialog</code>, la página de atrás sigue viva.",
    "windowPage.fixedTitle": "Tamaño fijo",
    "windowPage.fixedBody":
      "Con <code>resizable={false}</code> desaparecen los bordes y también los controles de minimizar y maximizar: la máquina no cambia la etapa de una ventana que no puede redimensionar, y un control que no hace nada es peor que ninguno. Se sigue moviendo.",
    "windowPage.fixedLabel": "Ventana de tamaño fijo",
    "windowPage.contractBody":
      "La máquina es <code>@zag-js/floating-panel</code>, la misma en los dos bindings. Ella escribe <code>--x</code>, <code>--y</code>, <code>--width</code> y <code>--height</code> en el posicionador; la hoja solo los lee. Varias ventanas abiertas comparten una pila: la última enfocada queda arriba y las demás llevan <code>data-behind</code>. Sin JavaScript no hay ventana, así que no pongas en una nada que no exista en otro lado.",
    "windowPage.a11yBody":
      "El contenido es un <code>role=\"dialog\"</code> <strong>sin</strong> <code>aria-modal</code>, nombrado por su título: la página no queda inerte y nada dice lo contrario. Al abrir, el foco entra a la ventana; al cerrar, vuelve al disparador. Los controles son botones de icono con nombre propio (<code>closeLabel</code>, <code>minimizeLabel</code>, <code>maximizeLabel</code>, <code>restoreLabel</code>), que reemplazan el \"Close Window\" en inglés que trae Zag.",
    "windowPage.keyboardTitle": "Teclado",
    "window.key.arrows": "Con el foco en la ventana, la mueve. Con Shift, en pasos más largos.",
    "window.key.escape": "Cierra la ventana. Durante un arrastre o un cambio de tamaño, lo cancela y la deja donde estaba.",
    "window.key.dblclick": "Doble clic en la barra de título: maximiza, o restaura si ya estaba maximizada o minimizada.",
  },
  en: {
    "demo.window.trigger": "Open inspector",
    "demo.window.title": "Inspector",
    "demo.window.body": "Drag the title bar to move it, and an edge or a corner to resize it.",
    "demo.window.close": "Close",
    "demo.window.minimize": "Minimize",
    "demo.window.maximize": "Maximize",
    "demo.window.restore": "Restore",
    "demo.windowFixed.trigger": "Open notes",
    "demo.windowFixed.title": "Notes",
    "demo.windowFixed.body": "This window moves, but it does not resize.",

    "windowPage.description":
      "A non-modal panel that moves, resizes, minimizes and maximizes, beside the page and without blocking it.",
    "windowPage.lede":
      "A <strong>window</strong> is for what has to stay open while you keep working: a tool palette, an inspector, a chat. The title bar drags it, the edges and corners resize it, and its controls minimize, maximize and close it. Unlike a <code>Dialog</code>, the page behind it stays live.",
    "windowPage.fixedTitle": "Fixed size",
    "windowPage.fixedBody":
      "With <code>resizable={false}</code> the edges go, and so do the minimize and maximize controls: the machine will not change the stage of a window it cannot resize, and a control that does nothing is worse than none. It still moves.",
    "windowPage.fixedLabel": "Fixed-size window",
    "windowPage.contractBody":
      "The machine is <code>@zag-js/floating-panel</code>, the same one in both bindings. It writes <code>--x</code>, <code>--y</code>, <code>--width</code> and <code>--height</code> on the positioner; the stylesheet only reads them. Open windows share one stack: the last one focused sits on top and the others carry <code>data-behind</code>. No JavaScript means no window, so put nothing in one that exists nowhere else.",
    "windowPage.a11yBody":
      "The content is a <code>role=\"dialog\"</code> <strong>without</strong> <code>aria-modal</code>, named by its title: the page does not go inert and nothing claims it does. Opening moves focus into the window; closing returns it to the trigger. The controls are icon buttons with names of their own (<code>closeLabel</code>, <code>minimizeLabel</code>, <code>maximizeLabel</code>, <code>restoreLabel</code>), which replace the English \"Close Window\" Zag ships.",
    "windowPage.keyboardTitle": "Keyboard",
    "window.key.arrows": "With focus on the window, moves it. With Shift, in larger steps.",
    "window.key.escape": "Closes the window. During a drag or a resize, cancels it and puts the window back.",
    "window.key.dblclick": "Double-click the title bar: maximizes, or restores when already maximized or minimized.",
  },
} as const;
