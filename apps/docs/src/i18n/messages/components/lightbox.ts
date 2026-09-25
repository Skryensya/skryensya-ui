export const lightboxMessages = {
  es: {
    "lightbox.description": "Muestra una imagen, o una galería, tan grande como permite la pantalla, en un diálogo modal.",
    "lightbox.lede":
      "Lightbox es un <code>&lt;dialog&gt;</code> modal y nada más: no existe un rol <code>lightbox</code>. La plataforma pone la capa superior, la página inerte, <kbd>Esc</kbd> y el fondo; el componente agrega qué imagen se ve, cómo pasar a la siguiente y cómo acercarse a ella.",
    "lightbox.galleryTitle": "Una galería son sus miniaturas",
    "lightbox.galleryBody":
      "Cada miniatura es un <code>Lightbox.Trigger</code>: un enlace a la imagen completa que nombra el <code>id</code> del lightbox en <code>opens</code>. Todas las que nombran el mismo id, en el orden de la página, forman la galería. Sin JavaScript, el enlace igual abre la foto.",
    "lightbox.tryBody":
      "Prueba <kbd>←</kbd> y <kbd>→</kbd>, <kbd>+</kbd>, <kbd>-</kbd> y <kbd>0</kbd>, la barra de zoom y arrastrar con zoom; con mouse, la rueda y el doble clic no hacen zoom. En táctil: deslizar cambia de foto, pellizcar acerca, doble toque acerca y deslizar hacia abajo cierra.",
    "lightbox.singleTitle": "Una sola imagen",
    "lightbox.singleBody":
      "Con una imagen no hay contador ni flechas: nada que una sola foto no necesite. La imagen se muestra entera, siempre en su propia proporción, y nunca se agranda más allá de sus propios píxeles.",
    "lightbox.loopTitle": "Loop y errores",
    "lightbox.loopBody":
      "Con <code>loop</code>, la siguiente de la última es la primera. La del medio no existe: el error se dice con palabras, los controles siguen funcionando y la navegación la atraviesa.",
    "lightbox.programmaticTitle": "Abrirlo desde código",
    "lightbox.programmaticBody":
      "No hace falta una miniatura en la página. <code>open</code>, <code>close</code>, <code>next</code>, <code>previous</code>, <code>goTo</code> y <code>resetZoom</code> corren exactamente el mismo ciclo que un clic: foco, página inerte, bloqueo de scroll y limpieza al cerrar. Un <code>open</code> mientras está abierto reemplaza lo que se ve; nunca se apila un segundo visor.",
    "lightbox.reactProviderTitle": "React: un visor para toda la app",
    "lightbox.reactProviderBody":
      "<code>LightboxProvider</code> renderiza un único lightbox y <code>useLightbox()</code> devuelve su handle desde cualquier componente. Se puede llamar antes de que el diálogo se monte: el último <code>open</code> se guarda y se aplica al montar.",
    "lightbox.declarativeTitle": "React: declarativo",
    "lightbox.declarativeBody":
      "<code>open</code>, <code>images</code> e <code>index</code> como props, con <code>onOpenChange</code> y <code>onIndexChange</code>. Las props son pedidos: cerrar con <kbd>Esc</kbd> o el botón siempre gana y se informa, porque un modal que el padre pudiera mantener abierto contra <kbd>Esc</kbd> sería una trampa de teclado.",
    "lightbox.vanillaTitle": "Vanilla",
    "lightbox.vanillaBody":
      "El enhancer lee la configuración del <code>&lt;dialog&gt;</code> y escucha las miniaturas en el documento, así que las que se agregan después también pertenecen a la galería. <code>getLightbox(id)</code> devuelve el controlador para abrirlo desde un script.",
    "lightbox.keyboardTitle": "Teclado",
    "lightbox.key.escape": "Cierra y devuelve el foco.",
    "lightbox.key.tab": "Recorre los controles sin salir del visor.",
    "lightbox.key.arrows": "Imagen anterior o siguiente. Con zoom, mueven la imagen.",
    "lightbox.key.homeEnd": "Primera o última imagen.",
    "lightbox.key.zoom": "Acerca o aleja.",
    "lightbox.key.reset": "Vuelve a ajustar la imagen.",
    "lightbox.optionsTitle": "Opciones",
    "lightbox.optionsBody":
      "<code>loop</code>, <code>zoom</code>, <code>maxZoom</code> (1 a 10, por defecto 4), <code>showCounter</code>, <code>showCaption</code> y <code>closeOnBackdropClick</code>, en el lightbox o en cada <code>open</code>. Cada imagen es <code>{ src, alt, thumbnailSrc?, title?, description?, credit?, width?, height? }</code>; <code>alt</code> es obligatorio y puede ser <code>\"\"</code>.",
    "lightbox.contractItem1":
      "La imagen completa se carga sólo cuando se muestra, y se precargan sus dos vecinas cuando termina: nunca la galería entera.",
    "lightbox.contractItem2":
      "Con <code>width</code> y <code>height</code>, la caja de la imagen existe antes del primer byte, así que nada salta al llegar la foto; con <code>thumbnailSrc</code>, la miniatura se ve difuminada mientras tanto.",
    "lightbox.contractItem3":
      "El bloqueo de scroll es <code>patterns/scroll-lock.css</code>, el mismo de todo diálogo modal: importarlo es el consentimiento (ADR-0005).",
    "lightbox.a11yP1":
      "Sigue el patrón Modal Dialog de WAI-ARIA sobre el <code>&lt;dialog&gt;</code> nativo con <code>showModal()</code>, que ya es <code>role=\"dialog\"</code> modal y deja inerte el resto de la página: no se agrega <code>aria-modal</code> ni un barrido de <code>aria-hidden</code>. Su nombre es <code>label</code> (por defecto «Image viewer»).",
    "lightbox.a11yItem1":
      "El foco va a Cerrar al abrir, <kbd>Tab</kbd> da la vuelta dentro del visor y, al cerrar, vuelve a lo que lo abrió. Si eso ya no está en la página, va a la miniatura de la foto en que se terminó, o a <code>fallbackFocus</code>; nunca a un elemento desconectado.",
    "lightbox.a11yItem2":
      "Anterior y siguiente en los extremos usan <code>aria-disabled</code>, no <code>disabled</code>: un botón que se deshabilita teniendo el foco lo tiraría fuera del diálogo.",
    "lightbox.a11yItem3":
      "Una región <code>aria-live=\"polite\"</code> dice «Imagen 3 de 12» y el título, una sola vez cuando la navegación se detiene, no por cada tecla. Un error se anuncia con palabras.",
    "lightbox.a11yItem4":
      "Cada gesto tiene otra forma de hacerse con un solo puntero o el teclado: deslizar es Anterior/Siguiente, pellizcar es doble toque o Acercar/Alejar, deslizar hacia abajo es Cerrar. Anterior, Siguiente y Cerrar miden 44 px, y los que flotan sobre la foto tienen una superficie propia, legible sobre fotos claras u oscuras. La barra de zoom es la de Canvas; en una pantalla táctil sin mouse se oculta, porque ahí el zoom es la foto misma.",
    "lightbox.a11yItem5":
      "El foco visible son dos anillos, uno oscuro y uno claro, de al menos 3 px: siempre hay contraste contra lo que haya detrás. Con <code>prefers-reduced-motion</code> se quitan los movimientos y quedan los fundidos.",
    "lightbox.closeLabel": "Cerrar visor",
    "lightbox.previousLabel": "Imagen anterior",
    "lightbox.nextLabel": "Imagen siguiente",
    "lightbox.zoomInLabel": "Acercar",
    "lightbox.zoomOutLabel": "Alejar",
    "lightbox.resetZoomLabel": "Restablecer zoom",
    "lightbox.errorLabel": "No se pudo cargar esta imagen.",
    "lightbox.counterLabel": "Imagen {index} de {count}",
    "lightbox.demo.label": "Visor de imágenes",
    "lightbox.demo.galleryLabel": "Fotos del viaje",
    "lightbox.demo.dawnAlt": "Un fiordo azul entre acantilados de roca, visto desde lo alto",
    "lightbox.demo.dawnTitle": "Fiordo",
    "lightbox.demo.dawnDescription": "Luz de la mañana sobre el agua, antes de que se levante el viento.",
    "lightbox.demo.forestAlt": "Una calle angosta de edificios de ladrillo bajo un cielo azul",
    "lightbox.demo.forestTitle": "Calle",
    "lightbox.demo.panoramaAlt": "Mar en calma, islas con niebla y rocas en la orilla",
    "lightbox.demo.panoramaTitle": "Costa",
    "lightbox.demo.panoramaDescription": "Entera y en su propia proporción: el visor nunca la recorta.",
    "lightbox.demo.lighthouseAlt": "Una cascada que cae a una garganta cubierta de musgo, entre pinos",
    "lightbox.demo.lighthouseTitle": "Cascada",
    "lightbox.demo.snowAlt": "Un campamento en la nieve bajo montañas blancas",
    "lightbox.demo.snowDescription": "Casi toda blanca: los controles mantienen su contraste sobre su propia superficie.",
    "lightbox.demo.tinyAlt": "Un cachorro negro sobre un piso de madera",
    "lightbox.demo.tinyDescription": "Una imagen de 240 px: se muestra a su tamaño, nunca agrandada.",
    "lightbox.demo.brokenAlt": "Una foto que no existe, para mostrar el error",
    "lightbox.demo.brokenTitle": "Imagen que falla",
  },
  en: {
    "lightbox.description": "Shows one image, or a gallery, as large as the screen allows, in a modal dialog.",
    "lightbox.lede":
      "Lightbox is a modal <code>&lt;dialog&gt;</code> and nothing else: there is no <code>lightbox</code> role. The platform provides the top layer, the inert page, <kbd>Esc</kbd> and the backdrop; the component adds which image is showing, how to reach the next one and how to look closer.",
    "lightbox.galleryTitle": "A gallery is its thumbnails",
    "lightbox.galleryBody":
      "Each thumbnail is a <code>Lightbox.Trigger</code>: a link to the full image that names the lightbox's <code>id</code> in <code>opens</code>. Every one naming the same id, in page order, is the gallery. With no JavaScript, the link still opens the photo.",
    "lightbox.tryBody":
      "Try <kbd>←</kbd> and <kbd>→</kbd>, <kbd>+</kbd>, <kbd>-</kbd> and <kbd>0</kbd>, the zoom bar and dragging while zoomed; with a mouse, the wheel and a double click do not zoom. On touch: a swipe changes photo, a pinch zooms, a double tap zooms and a swipe down closes.",
    "lightbox.singleTitle": "A single image",
    "lightbox.singleBody":
      "With one image there is no counter and there are no arrows: nothing a single photo does not need. The image is shown whole, always at its own ratio, and is never enlarged past its own pixels.",
    "lightbox.loopTitle": "Loop and errors",
    "lightbox.loopBody":
      "With <code>loop</code>, next from the last is the first. The middle one does not exist: the error is said in words, the controls keep working and navigation goes straight through it.",
    "lightbox.programmaticTitle": "Opening it from code",
    "lightbox.programmaticBody":
      "No thumbnail has to be on the page. <code>open</code>, <code>close</code>, <code>next</code>, <code>previous</code>, <code>goTo</code> and <code>resetZoom</code> run exactly the lifecycle a click does: focus, inert page, scroll lock and cleanup on close. An <code>open</code> while open replaces what is showing; a second viewer is never stacked.",
    "lightbox.reactProviderTitle": "React: one viewer for the whole app",
    "lightbox.reactProviderBody":
      "<code>LightboxProvider</code> renders one lightbox and <code>useLightbox()</code> returns its handle from any component. It can be called before the dialog mounts: the last <code>open</code> is kept and applied on mount.",
    "lightbox.declarativeTitle": "React: declarative",
    "lightbox.declarativeBody":
      "<code>open</code>, <code>images</code> and <code>index</code> as props, with <code>onOpenChange</code> and <code>onIndexChange</code>. The props are requests: closing with <kbd>Esc</kbd> or the button always wins and is reported, because a modal a parent could hold open against <kbd>Esc</kbd> would be a keyboard trap.",
    "lightbox.vanillaTitle": "Vanilla",
    "lightbox.vanillaBody":
      "The enhancer reads its settings off the <code>&lt;dialog&gt;</code> and listens for thumbnails on the document, so ones added later belong to the gallery too. <code>getLightbox(id)</code> returns the controller for opening it from a script.",
    "lightbox.keyboardTitle": "Keyboard",
    "lightbox.key.escape": "Closes and returns focus.",
    "lightbox.key.tab": "Moves through the controls without leaving the viewer.",
    "lightbox.key.arrows": "Previous or next image. When zoomed, they move the image.",
    "lightbox.key.homeEnd": "First or last image.",
    "lightbox.key.zoom": "Zooms in or out.",
    "lightbox.key.reset": "Fits the image again.",
    "lightbox.optionsTitle": "Options",
    "lightbox.optionsBody":
      "<code>loop</code>, <code>zoom</code>, <code>maxZoom</code> (1 to 10, 4 by default), <code>showCounter</code>, <code>showCaption</code> and <code>closeOnBackdropClick</code>, on the lightbox or on each <code>open</code>. Each image is <code>{ src, alt, thumbnailSrc?, title?, description?, credit?, width?, height? }</code>; <code>alt</code> is required and may be <code>\"\"</code>.",
    "lightbox.contractItem1":
      "The full image is loaded only when it is shown, and its two neighbours are preloaded once it has: never the whole gallery.",
    "lightbox.contractItem2":
      "With <code>width</code> and <code>height</code>, the image's box exists before its first byte, so nothing jumps when the photo lands; with <code>thumbnailSrc</code>, the thumbnail shows blurred meanwhile.",
    "lightbox.contractItem3":
      "The scroll lock is <code>patterns/scroll-lock.css</code>, the same as every modal dialog's: importing it is the consent (ADR-0005).",
    "lightbox.a11yP1":
      "It follows WAI-ARIA's Modal Dialog pattern on the native <code>&lt;dialog&gt;</code> with <code>showModal()</code>, which already is a modal <code>role=\"dialog\"</code> and makes the rest of the page inert: no <code>aria-modal</code> and no <code>aria-hidden</code> sweep are added. Its name is <code>label</code> (\"Image viewer\" by default).",
    "lightbox.a11yItem1":
      "Focus goes to Close on open, <kbd>Tab</kbd> wraps inside the viewer, and on close focus returns to what opened it. If that is no longer on the page, it goes to the thumbnail of the photo the reader ended on, or to <code>fallbackFocus</code>; never to a disconnected element.",
    "lightbox.a11yItem2":
      "Previous and next at the ends use <code>aria-disabled</code>, not <code>disabled</code>: a button that disables itself while focused would drop focus out of the dialog.",
    "lightbox.a11yItem3":
      "An <code>aria-live=\"polite\"</code> region says \"Image 3 of 12\" and the title, once when navigation settles, not on every key. An error is announced in words.",
    "lightbox.a11yItem4":
      "Every gesture has a single-pointer or keyboard alternative: a swipe is Previous/Next, a pinch is a double tap or Zoom in/out, a swipe down is Close. Previous, Next and Close are 44px, and the ones that float over the photo sit on a surface of their own, readable over light or dark photos. The zoom bar is Canvas's; on a touchscreen with no mouse it is hidden, because there the photo itself is the zoom.",
    "lightbox.a11yItem5":
      "The focus indicator is two rings, one dark and one light, at least 3px: there is always contrast against whatever is behind. With <code>prefers-reduced-motion</code>, movement goes and the fades stay.",
    "lightbox.closeLabel": "Close viewer",
    "lightbox.previousLabel": "Previous image",
    "lightbox.nextLabel": "Next image",
    "lightbox.zoomInLabel": "Zoom in",
    "lightbox.zoomOutLabel": "Zoom out",
    "lightbox.resetZoomLabel": "Reset zoom",
    "lightbox.errorLabel": "This image could not be loaded.",
    "lightbox.counterLabel": "Image {index} of {count}",
    "lightbox.demo.label": "Image viewer",
    "lightbox.demo.galleryLabel": "Trip photos",
    "lightbox.demo.dawnAlt": "A blue fjord between rock cliffs, seen from above",
    "lightbox.demo.dawnTitle": "Fjord",
    "lightbox.demo.dawnDescription": "Morning light on the water, before the wind picks up.",
    "lightbox.demo.forestAlt": "A narrow street of brick buildings under a blue sky",
    "lightbox.demo.forestTitle": "Street",
    "lightbox.demo.panoramaAlt": "Calm sea, misty islands and rocks on the shore",
    "lightbox.demo.panoramaTitle": "Coast",
    "lightbox.demo.panoramaDescription": "Whole and at its own ratio: the viewer never crops it.",
    "lightbox.demo.lighthouseAlt": "A waterfall dropping into a moss-covered gorge among pines",
    "lightbox.demo.lighthouseTitle": "Waterfall",
    "lightbox.demo.snowAlt": "A camp in the snow below white mountains",
    "lightbox.demo.snowDescription": "Almost all white: the controls keep their contrast on a surface of their own.",
    "lightbox.demo.tinyAlt": "A black puppy on a wooden floor",
    "lightbox.demo.tinyDescription": "A 240px image: shown at its own size, never enlarged.",
    "lightbox.demo.brokenAlt": "A photo that does not exist, to show the error",
    "lightbox.demo.brokenTitle": "An image that fails",
  },
} as const;
