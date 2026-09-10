export const sidebarMessages = {
  es: {
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

    "sidebarPage.description": "Sidebar: el shell que se contrae a un riel, con la lista de navegación como pattern invitado.",
    "sidebarPage.lede":
      "Sidebar es el <strong>shell</strong>: un header, un medio que scrollea, un footer, y el colapso. Se contrae a un <strong>riel</strong>, se angosta, nunca se esconde.",
    "sidebarPage.contentTitle": "Una cosa es el sidebar; otra, su contenido",
    "sidebarPage.contentBody":
      'Lo que va adentro no es asunto del sidebar. La lista de destinos es el pattern <a href="/nav-list"><code>nav-list</code></a>, invitada aquí y con la misma estructura que usa el navbar en horizontal. Por eso no hay un <code>sk-sidebar__link</code>: esa lista nunca fue del sidebar, y nombrarla así sería nombrar a un inquilino.',
    "sidebarPage.collapseBody": "Contrae el sidebar con el botón: la lista se vuelve un riel de iconos, y sigue toda ahí.",
    "sidebarPage.widthTitle": "El ancho lo decide quien lee",
    "sidebarPage.widthBody1":
      "Autorar un <code>SidebarResizeHandle</code> adentro del sidebar es lo que lo vuelve redimensionable. No hay una opción <code>resizable</code> al lado: dos formas de decir lo mismo son dos formas de contradecirse. La hoja de estilos ni siquiera necesita preguntarlo: siempre lee <code>--sk-sidebar-resize-inline-size</code>, una propiedad que sólo escribe un arrastre o un ancho recordado, así que una barra sin handle se queda en su ancho expandido por el fallback.",
    "sidebarPage.widthBody2":
      "El recorrido lo acotan <code>--sk-sidebar-min-inline-size</code> y <code>--sk-sidebar-max-inline-size</code>, y el <code>clamp()</code> vive en el CSS: el arrastre escribe <strong>una</strong> propiedad y ninguna de las dos bindings hace la cuenta. Por eso una marca que mueva esos hooks mueve el resize con ella, sin volver a ejecutar nada.",
    "sidebarPage.widthBody3":
      "Para una barra sola, <code>minInlineSize</code> y <code>maxInlineSize</code> escriben esos dos hooks desde el markup o desde las props, con cualquier largo de CSS (<code>18rem</code>, <code>30%</code>, <code>min(24rem, 40vw)</code>). Son azúcar sobre los hooks, no un segundo mecanismo: quien tenga cincuenta barras iguales sigue poniendo el hook una vez en su hoja de estilos. Los extremos son de la instancia y el ancho expandido no, y la división no es caprichosa: el ancho expandido es el tamaño para el que la barra fue diseñada, y eso es una decisión del sistema; el recorrido depende de la pantalla y del contenido de quien lee.",
    "sidebarPage.widthBody4":
      "Redimensiona con el clic <strong>mantenido</strong>: la presión sola no hace nada, el gesto arranca recién cuando el puntero viajó cuatro píxeles. Un clic suelto en el borde del panel no mueve el ancho, no dispara <code>sk-resize-change</code> y no escribe nada en el almacenamiento, que es lo que antes congelaba en el navegador de quien lee un ancho que nunca eligió.",
    "sidebarPage.widthBody5":
      "Es un splitter completo, no sólo un arrastre: las flechas lo mueven de a poco (con <kbd class=\"sk-kbd\">Shift</kbd>, más rápido), <kbd class=\"sk-kbd\">Home</kbd> y <kbd class=\"sk-kbd\">End</kbd> van a los extremos, y doble clic o <kbd class=\"sk-kbd\">Enter</kbd> devuelven el ancho por defecto. Con <code>storageKey</code> el ancho sobrevive a la recarga; sin él, dura la sesión, que es el caso de este preview.",
    "sidebarPage.widthBody6":
      'Adentro va un <a href="/components/tree-view">TreeView</a> a propósito: es el invitado cuyo ancho correcto nadie puede saber de antemano. El nombre que no entra se corta con puntos suspensivos y el panel nunca scrollea en horizontal; ensancharlo es la respuesta, no una barra de scroll lateral.',
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
    "sidebarPage.floatingTriggerTitle": "El trigger flotante",
    "sidebarPage.floatingTriggerBody":
      "<code>floating</code> es una decisión de pintura, no un segundo padre legal: el trigger se sigue autorando adentro de <code>Sidebar</code>, <code>SidebarHeader</code> o <code>SidebarFooter</code>, pero se levanta visualmente al rincón superior del panel. Este demo no tiene <code>SidebarHeader</code> en absoluto: es exactamente el caso donde no hay una fila propia para dibujar un trigger, así que flota sobre el panel en vez de competir por lugar. <code>--elevation-raised</code> es lo que lo separa del contenido sobre el que se apoya.",
    "sidebarPage.floatingTriggerLabel": "Sidebar · trigger flotante",
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
  },
  en: {
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

    "sidebarPage.description": "Sidebar: the shell that collapses to a rail, with the navigation list as a guest pattern.",
    "sidebarPage.lede":
      "Sidebar is the <strong>shell</strong>: a header, a scrolling middle, a footer, and the collapse. It collapses to a <strong>rail</strong>, narrows, and never hides.",
    "sidebarPage.contentTitle": "The sidebar is one thing; its content is another",
    "sidebarPage.contentBody":
      'What goes inside is not the sidebar\'s business. The destination list is the <a href="/en/nav-list"><code>nav-list</code></a> pattern, a guest here, with the same structure the navbar uses horizontally. That is why there is no <code>sk-sidebar__link</code>: that list was never the sidebar\'s, and naming it that way would be naming a tenant.',
    "sidebarPage.collapseBody": "Collapse the sidebar with the button: the list becomes a rail of icons, and it is all still there.",
    "sidebarPage.widthTitle": "Width belongs to the reader",
    "sidebarPage.widthBody1":
      "Authoring a <code>SidebarResizeHandle</code> inside the sidebar is what makes it resizable. There is no <code>resizable</code> option beside it: two ways to say the same thing are two ways to contradict each other. The stylesheet never has to ask: it always reads <code>--sk-sidebar-resize-inline-size</code>, a property only a drag or a remembered width ever writes, so a bar with no handle stays at its expanded width through the fallback.",
    "sidebarPage.widthBody2":
      "The travel is bounded by <code>--sk-sidebar-min-inline-size</code> and <code>--sk-sidebar-max-inline-size</code>, and the <code>clamp()</code> lives in the CSS: the drag writes <strong>one</strong> property, and neither binding does the math. That is why a brand that moves those hooks moves the resize with it, with nothing to re-run.",
    "sidebarPage.widthBody3":
      "For a single bar, <code>minInlineSize</code> and <code>maxInlineSize</code> write those two hooks from the markup or from props, with any CSS length (<code>18rem</code>, <code>30%</code>, <code>min(24rem, 40vw)</code>). They are sugar over the hooks, not a second mechanism: whoever has fifty identical bars still sets the hook once in their stylesheet. The extremes belong to the instance and the expanded width does not, and the split is not arbitrary: the expanded width is the size the bar was designed for, a system decision; the travel depends on the reader's own screen and content.",
    "sidebarPage.widthBody4":
      "It resizes on a <strong>held</strong> click: pressure alone does nothing, the gesture only starts once the pointer has traveled four pixels. A loose click on the panel's edge does not move the width, does not fire <code>sk-resize-change</code>, and writes nothing to storage: which is what used to freeze a width nobody chose into a reader's browser.",
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
      "It measures one icon wide, so its accessible name goes in an <code>aria-label</code> (or visually hidden text): a visible label inside would be text inside a square the width of an icon. The enhancer patches attributes, never content: the name is yours.",
    "sidebarPage.floatingTriggerTitle": "The floating trigger",
    "sidebarPage.floatingTriggerBody":
      "<code>floating</code> is a paint decision, not a second legal parent: the trigger is still authored inside <code>Sidebar</code>, <code>SidebarHeader</code>, or <code>SidebarFooter</code>, but it visually lifts to the panel's own corner. This demo has no <code>SidebarHeader</code> at all: it is exactly the case where there is no header row of its own to draw a trigger on, so it floats over the panel instead of competing for room. <code>--elevation-raised</code> is what separates it from whatever it rests over.",
    "sidebarPage.floatingTriggerLabel": "Sidebar · floating trigger",
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
  },
} as const;
