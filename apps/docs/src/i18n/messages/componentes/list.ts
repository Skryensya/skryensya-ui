export const listMessages = {
  es: {

    "demo.list.preferences": "Preferencias",
    "demo.list.resources": "Recursos del proyecto",
    "demo.list.team": "Equipo",
    "demo.list.active": "Activo",
    "demo.list.notifications.title": "Notificaciones",
    "demo.list.notifications.description": "Resumen semanal cada viernes.",
    "demo.list.timezone.title": "Zona horaria",
    "demo.list.timezone.description": "Se usa para programar envíos.",
    "demo.list.timezone.value": "GMT−3",
    "demo.list.language.title": "Idioma",
    "demo.list.language.description": "Interfaz y correos.",
    "demo.list.language.value": "Español",
    "demo.list.dateFormat.title": "Formato de fecha",
    "demo.list.dateFormat.description": "Cómo se escriben días y meses.",
    "demo.list.dateFormat.value": "31/12/2026",
    "demo.list.homePage.title": "Página de inicio",
    "demo.list.homePage.description": "Dónde caes al entrar.",
    "demo.list.homePage.value": "Resumen",
    "demo.list.prerequisites.title": "Prerrequisitos",
    "demo.list.prerequisites.description": "Qué necesitas antes de instalar.",
    "demo.list.gettingStarted.title": "Guía de inicio",
    "demo.list.gettingStarted.description":
      "Instala y configura tu primer proyecto.",
    "demo.list.customization.title": "Personalización",
    "demo.list.customization.description":
      "Ajusta color, densidad, radio e iconografía.",
    "demo.list.tokenReference.title": "Referencia de tokens",
    "demo.list.tokenReference.description":
      "Consulta roles, escalas y cadenas de decisión.",
    "demo.list.tiers.title": "Tiers",
    "demo.list.tiers.description": "Qué capa resuelve cada decisión.",
    "demo.list.first.name": "John Doe",
    "demo.list.first.role": "Sistema de diseño y experiencia.",
    "demo.list.second.name": "Jane Doe",
    "demo.list.second.role": "Componentes e infraestructura.",
    "demo.list.third.name": "Richard Roe",
    "demo.list.third.role": "Estrategia y descubrimiento.",
    "demo.list.fourth.name": "Mary Major",
    "demo.list.fourth.role": "Investigación y contenido.",
    "demo.list.area.design": "Diseño",
    "demo.list.area.engineering": "Ingeniería",
    "demo.list.area.product": "Producto",
    "demo.list.integrations": "Integraciones",

    "listPage.description":
      "List: colección semántica de filas (ul/ol) con anatomía real (leading, contenido, trailing), divisores, filas interactivas y orden.",
    "listPage.lede":
      "Una <strong>lista con UI</strong>, no un <code>&lt;li&gt;</code> con tipografía. Por debajo es un <code>&lt;ul&gt;</code> o <code>&lt;ol&gt;</code> real (el lector oye una lista de N ítems), y encima aporta la anatomía de fila: <strong>leading</strong> (icono, avatar, número), <strong>contenido</strong> (título y descripción) y <strong>trailing</strong> (meta, badge, acción), con divisores. Es composable por partes y funcional: una fila que actúa es un <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code> real, nunca un <code>onClick</code> en el <code>&lt;li&gt;</code>.",
    "listPage.stepsTitle": "La fila, un slot a la vez",
    "listPage.stepsBody":
      "Los seis ejemplos que siguen son <strong>la misma lista</strong>, y cada uno agrega exactamente una pieza sobre el anterior. Se leen en orden: lo que aparece de nuevo en cada paso es lo único que cambió en el markup.",
    "listPage.step1Title": "1 · Sólo la lista",
    "listPage.step1Body":
      "El piso: un <code>&lt;ul&gt;</code> real con filas y divisores, sin un solo slot. Ya hay altura de fila, inset y hairlines, y el lector oye <em>lista de 5 ítems</em>. Muchas listas no necesitan nada más que esto.",
    "listPage.step1Note": "ul + item",
    "listPage.step2Title": "2 · Título y descripción",
    "listPage.step2Body":
      "Entra <code>sk-list__content</code>, la columna que flexiona. El título y la descripción se apilan, y es la única parte de la fila que se encoge: por eso un título largo corta ahí y no empuja la fila más ancha que su contenedor.",
    "listPage.step2Note": "+ content",
    "listPage.step3Title": "3 · Media al inicio",
    "listPage.step3Body":
      "Entra <code>sk-list__leading</code>: un icono, un avatar o un número. Es <strong>decorativo</strong>, no nombra la fila: quien la nombra es el título. Un slot vacío no existe para el layout, así que las filas sin icono no arrastran padding fantasma.",
    "listPage.step3Note": "+ leading (Icon)",
    "listPage.step4Title": "4 · Meta al final",
    "listPage.step4Body":
      "Entra <code>sk-list__trailing</code> y la fila queda completa. Se ancla al final con <code>margin-inline-start: auto</code> y trae <code>tabular-nums</code>, así que las cifras de filas distintas se alinean en columna. Acepta texto o un componente, como un Badge.",
    "listPage.step4Note": "+ trailing + Badge",
    "listPage.step5Title": "5 · La fila actúa",
    "listPage.step5Body":
      'Misma anatomía, ahora envuelta en un <code>a[href]</code> real con <code>sk-list__action sk-interactive</code>. El foco y el teclado son nativos, y el hover, foco y press vienen del <a href="/state-layer">state layer</a>. El <code>&lt;li&gt;</code> pasa a ser sólo el que lleva el divisor.',
    "listPage.step5Note": "+ a[href] + state layer",
    "listPage.step6Title": "6 · Todo junto",
    "listPage.step6Body":
      "El techo de la escalera: filas interactivas, dos piezas en el trailing, densidad <code>compact</code> y una fila deshabilitada. Nada nuevo del componente, sólo lo anterior combinado.",
    "listPage.step6Note": "+ density",
    "listPage.contractItem1":
      'Raíz: <code>&lt;ul class="sk-list"&gt;</code> o <code>&lt;ol&gt;</code>. Cada fila es un <code>&lt;li class="sk-list__item"&gt;</code>.',
    "listPage.contractItem2":
      "Anatomía de fila: <code>sk-list__leading</code>, <code>sk-list__content</code> (con <code>sk-list__title</code> y <code>sk-list__description</code>) y <code>sk-list__trailing</code>. Todas opcionales; compón las que uses.",
    "listPage.contractItem3":
      'Secuencias de instrucciones: usa <a href="/componentes/process-list">ProcessList</a>, que conserva un <code>&lt;ol&gt;</code> y posee los marcadores, conectores y contenido de cada paso.',
    "listPage.contractItem4":
      'Fila funcional: un <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code> con <code>sk-list__action sk-interactive</code> dentro del <code>&lt;li&gt;</code>. Llena la fila y hereda foco, teclado y state layer.',
    "listPage.contractItem5":
      'Estado persistente: ninguno. List no modela selección ni destino actual; para navegación activa usa <a href="/nav-list">Nav list</a>.',
    "listPage.contractItem6": 'Variantes: <code>data-density="compact"</code> y <code>data-dividers="none"</code>.',
    "listPage.contractItem7": "Sin inicialización: el comportamiento es del <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code> nativo.",
    "listPage.test1": "Renderiza una lista semántica con filas estáticas, de enlace y de botón.",
    "listPage.test2": "Renderiza una lista ordenada cuando el orden importa.",
  },
  en: {

    "demo.list.preferences": "Preferences",
    "demo.list.resources": "Project resources",
    "demo.list.team": "Team",
    "demo.list.active": "Active",
    "demo.list.notifications.title": "Notifications",
    "demo.list.notifications.description": "Weekly summary every Friday.",
    "demo.list.timezone.title": "Time zone",
    "demo.list.timezone.description": "Used to schedule sends.",
    "demo.list.timezone.value": "GMT−3",
    "demo.list.language.title": "Language",
    "demo.list.language.description": "Interface and emails.",
    "demo.list.language.value": "Spanish",
    "demo.list.dateFormat.title": "Date format",
    "demo.list.dateFormat.description": "How days and months are written.",
    "demo.list.dateFormat.value": "31/12/2026",
    "demo.list.homePage.title": "Home page",
    "demo.list.homePage.description": "Where you land when you sign in.",
    "demo.list.homePage.value": "Summary",
    "demo.list.prerequisites.title": "Prerequisites",
    "demo.list.prerequisites.description": "What you need before installing.",
    "demo.list.gettingStarted.title": "Getting started",
    "demo.list.gettingStarted.description":
      "Install and set up your first project.",
    "demo.list.customization.title": "Customization",
    "demo.list.customization.description":
      "Adjust color, density, radius and iconography.",
    "demo.list.tokenReference.title": "Token reference",
    "demo.list.tokenReference.description":
      "Look up roles, scales and decision chains.",
    "demo.list.tiers.title": "Tiers",
    "demo.list.tiers.description": "Which layer resolves each decision.",
    "demo.list.first.name": "John Doe",
    "demo.list.first.role": "Design system and experience.",
    "demo.list.second.name": "Jane Doe",
    "demo.list.second.role": "Components and infrastructure.",
    "demo.list.third.name": "Richard Roe",
    "demo.list.third.role": "Strategy and discovery.",
    "demo.list.fourth.name": "Mary Major",
    "demo.list.fourth.role": "Research and content.",
    "demo.list.area.design": "Design",
    "demo.list.area.engineering": "Engineering",
    "demo.list.area.product": "Product",
    "demo.list.integrations": "Integrations",

    "listPage.description":
      "List: a semantic row collection (ul/ol) with real anatomy (leading, content, trailing), dividers, interactive rows, and ordering.",
    "listPage.lede":
      "A <strong>list with UI</strong>, not an <code>&lt;li&gt;</code> with typography. Underneath it is a real <code>&lt;ul&gt;</code> or <code>&lt;ol&gt;</code> (a reader hears a list of N items), and on top of that it adds row anatomy: <strong>leading</strong> (icon, avatar, number), <strong>content</strong> (title and description), and <strong>trailing</strong> (meta, badge, action), with dividers. It composes piece by piece and stays functional: a row that acts is a real <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code>, never an <code>onClick</code> on the <code>&lt;li&gt;</code>.",
    "listPage.stepsTitle": "The row, one slot at a time",
    "listPage.stepsBody":
      "The six examples below are <strong>the same list</strong>, and each one adds exactly one piece over the last. Read them in order: whatever shows up new at each step is the only thing that changed in the markup.",
    "listPage.step1Title": "1 · Just the list",
    "listPage.step1Body":
      "The floor: a real <code>&lt;ul&gt;</code> with rows and dividers, not a single slot. There is already row height, inset, and hairlines, and the reader hears <em>list of 5 items</em>. Many lists need nothing more than this.",
    "listPage.step1Note": "ul + item",
    "listPage.step2Title": "2 · Title and description",
    "listPage.step2Body":
      "In comes <code>sk-list__content</code>, the column that flexes. Title and description stack, and it is the only part of the row that shrinks: that is why a long title ellipsizes there instead of pushing the row wider than its container.",
    "listPage.step2Note": "+ content",
    "listPage.step3Title": "3 · Leading media",
    "listPage.step3Body":
      "In comes <code>sk-list__leading</code>: an icon, an avatar, or a number. It is <strong>decorative</strong>, it does not name the row: the title does that. An empty slot does not exist for layout purposes, so rows with no icon carry no phantom padding.",
    "listPage.step3Note": "+ leading (Icon)",
    "listPage.step4Title": "4 · Trailing meta",
    "listPage.step4Body":
      "In comes <code>sk-list__trailing</code>, and the row is complete. It anchors to the end with <code>margin-inline-start: auto</code> and carries <code>tabular-nums</code>, so figures across rows line up in a column. It takes text or a component, like a Badge.",
    "listPage.step4Note": "+ trailing + Badge",
    "listPage.step5Title": "5 · The row acts",
    "listPage.step5Body":
      'Same anatomy, now wrapped in a real <code>a[href]</code> with <code>sk-list__action sk-interactive</code>. Focus and keyboard are native, and hover, focus, and press come from the <a href="/en/state-layer">state layer</a>. The <code>&lt;li&gt;</code> becomes just the thing carrying the divider.',
    "listPage.step5Note": "+ a[href] + state layer",
    "listPage.step6Title": "6 · Everything together",
    "listPage.step6Body":
      "The top of the ladder: interactive rows, two pieces in the trailing slot, <code>compact</code> density, and one disabled row. Nothing new from the component, just the above combined.",
    "listPage.step6Note": "+ density",
    "listPage.contractItem1":
      'Root: <code>&lt;ul class="sk-list"&gt;</code> or <code>&lt;ol&gt;</code>. Each row is an <code>&lt;li class="sk-list__item"&gt;</code>.',
    "listPage.contractItem2":
      "Row anatomy: <code>sk-list__leading</code>, <code>sk-list__content</code> (with <code>sk-list__title</code> and <code>sk-list__description</code>), and <code>sk-list__trailing</code>. All optional; compose whichever you use.",
    "listPage.contractItem3":
      'Instruction sequences: use <a href="/en/components/process-list">ProcessList</a>, which keeps an <code>&lt;ol&gt;</code> and owns the markers, connectors, and content of each step.',
    "listPage.contractItem4":
      'Functional row: an <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code> with <code>sk-list__action sk-interactive</code> inside the <code>&lt;li&gt;</code>. It fills the row and inherits focus, keyboard, and the state layer.',
    "listPage.contractItem5":
      'Persistent state: none. List models neither selection nor a current destination; for active navigation use <a href="/en/nav-list">Nav list</a>.',
    "listPage.contractItem6": 'Variants: <code>data-density="compact"</code> and <code>data-dividers="none"</code>.',
    "listPage.contractItem7": "No initialization needed: the behavior belongs to the native <code>&lt;a&gt;</code>/<code>&lt;button&gt;</code>.",
    "listPage.test1": "Renders a semantic list with static, link and button rows.",
    "listPage.test2": "Renders an ordered list when order is meaningful.",
  },
} as const;
