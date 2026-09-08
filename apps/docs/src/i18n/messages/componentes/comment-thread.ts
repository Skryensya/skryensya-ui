export const commentThreadMessages = {
  es: {

    "commentThread.description":
      "Comentarios anidados en cinco piezas que se usan juntas o sueltas, data-driven y sin backend propio.",
    "commentThread.betaBadge": "Beta",
    "commentThread.lede":
      "Cinco piezas, no un componente con todo adentro. La más simple es <code>Comment</code>: quién escribió, cuándo y qué dijo, válido sin hilo alrededor. Encima se componen <code>CommentActions</code>, <code>CommentVote</code>, <code>CommentComposer</code> y <code>CommentThread</code>. Las respuestas recursan por composición: <code>Comment</code> adentro de <code>Comment</code>, a cualquier profundidad. Nada de esto llama a una API ni guarda un borrador: cada acción se devuelve a quien lo usa.",
    "commentThread.whenTitle": "Cuándo usarlo",
    "commentThread.whenBody1":
      "Cuando hay una conversación con respuestas anidadas de verdad: cada comentario puede tener los suyos, a cualquier profundidad. Un stream plano de publicaciones sin hilos es <a href=\"/componentes/feed\">Feed</a>; una jerarquía SELECCIONABLE (archivos, un índice) es <a href=\"/componentes/tree-view\">TreeView</a>. Este componente es para contenido de solo lectura con acciones (votar, responder, borrar), no para elegir un ítem.",
    "commentThread.whenBody2":
      "Para citar un solo comentario en otra parte no hace falta el hilo: <code>Comment</code> vale por sí solo. La moderación por rol y las menciones enriquecidas (<code>@</code>/<code>#</code>) quedaron afuera a propósito: son decisiones de dominio de cada app, no del sistema de diseño.",
    "commentThread.demoTitle": "El objeto, de lo más simple al hilo profundo",
    "commentThread.demoBody":
      "La pieza más simple: quién escribió, cuándo y qué dijo. No necesita hilo alrededor ni arrastra chrome que no usa.",
    "commentThread.demoAloneLabel": "Un comentario suelto",
    "commentThread.demoActionsTitle": "Con acciones",
    "commentThread.demoActionsBody":
      "El mismo comentario más la fila: un <code>CommentVote</code> compuesto dentro de un <code>CommentActions</code>. Quién puede votar o borrar es composición, no un puñado de flags.",
    "commentThread.demoActionsLabel": "Comentario con acciones",
    "commentThread.demoThreadTitle": "Un hilo corto",
    "commentThread.demoThreadBody":
      "Tres comentarios, uno respondido. El control de plegado sólo aparece donde hay respuestas que plegar, y el último no trae acciones.",
    "commentThread.demoFixedTitle": "Sin plegado",
    "commentThread.demoFixedBody":
      "El mismo hilo profundo de abajo, pero sin <code>collapsible</code> en ningún nivel: no hay control de plegado en ninguna parte y ninguna respuesta puede ocultarse. Para un hilo de soporte o moderación donde ocultar una respuesta nunca es lo que se quiere.",
    "commentThread.demoFixedLabel": "Hilo profundo sin plegado",
    "commentThread.demoDeepTitle": "Profundidad",
    "commentThread.demoDeepBody":
      "Cuatro niveles, con hermanos en varios. El conector se dibuja por respuesta y no se mide: la primera vuelve al control de plegado y la última corta en su propio codo, así que la única forma de ver que eso aguanta en profundidad es renderizarlo.",
    "commentThread.demoThreadLabel": "Hilo corto",
    "commentThread.demoDeepLabel": "Hilo profundo",
    "commentThread.demoLabel": "Comentarios de ejemplo",
    "commentThread.demoLoadingTitle": "Cargando",
    "commentThread.demoLoadingBody":
      "Dos preguntas distintas: qué se ve mientras algo carga, y qué pasa cuando eso tiene que convivir con lo que ya cargó.",
    "commentThread.demoSkeletonTitle": "El placeholder",
    "commentThread.demoSkeletonBody":
      "La forma de un comentario que todavía no llegó: un círculo donde va el avatar, un par de barras para el encabezado y otro par para el cuerpo. Nada de esto se anuncia - <code>Loader.status</code> avisa la espera una sola vez, no una vez por fila.",
    "commentThread.demoSkeletonLabel": "Comentarios cargando",
    "commentThread.demoInfiniteTitle": "En uso: cargando al hacer scroll",
    "commentThread.demoInfiniteBody":
      "Los comentarios ya cargados y el placeholder conviven: al llegar al final del scroll aparece la fila del esqueleto justo donde va a caer el próximo comentario, y a los pocos instantes ese comentario real la reemplaza. Nada de esto lo sabe <code>CommentThread</code> - el hilo nunca se entera de que hay páginas.",
    "commentThread.demoInfiniteLabel": "Hilo con carga progresiva",
    "commentThread.behaviorTitle": "Voto y borrado no tocan el DOM por su cuenta",
    "commentThread.behaviorBody1":
      "Un clic en votar o borrar solo despacha el evento (<code>onVote</code>/<code>onDelete</code> en React, un <code>CustomEvent</code> en Vanilla) - el estado que se ve (<code>aria-pressed</code>, <code>data-voted</code>) es SIEMPRE el que trae el dato de quien lo usa, nunca algo que este componente decida por su cuenta. Plegar un hilo y abrir/cerrar el cuadro de respuesta sí son estado propio, y usan el mismo patrón de disclosure de <code>NavListGroup</code> (<code>aria-expanded</code> + <code>hidden</code>): no hay máquina de Zag, no hace falta una para un click que alterna un booleano.",
    "commentThread.behaviorBody2":
      "Sin <code>role=\"feed\"</code> ni <code>role=\"tree\"</code>: cada comentario es un <code>&lt;article&gt;</code>, y sus respuestas son <code>&lt;article&gt;</code> anidados dentro - la jerarquía que un lector de pantalla ya calcula solo, sin <code>aria-level</code> autorado a mano (la misma exención que la spec normativa de WAI-ARIA da al patrón Tree cuando el árbol entero ya está en el DOM).",
    "commentThread.optionsTitle": "Opciones",
    "commentThread.optionsBody":
      "<code>label</code>: el nombre accesible del hilo. <code>nodes</code>: el árbol de comentarios (cada uno con <code>id</code>, <code>author</code>, <code>timestamp</code>, <code>voteCount</code>, <code>body</code>, y opcionalmente <code>votedByMe</code>, <code>canDelete</code>, <code>replies</code>). <code>composer</code>: la caja para publicar un comentario nuevo, opcional. Los textos de cada control (<code>replyLabel</code>, <code>deleteLabel</code>, <code>voteUpLabel</code>…) son props separadas, nunca texto fijo en un idioma.",
    "commentThread.a11yP1":
      "Cada comentario es un <code>&lt;article&gt;</code> de solo lectura con sus acciones dentro, nunca un widget seleccionable: no hay roving tabindex ni flechas propias, cada control (voto, responder, borrar, plegar) es un <code>&lt;button&gt;</code> normal en el orden de Tab. Los botones de voto son solo-ícono; su nombre accesible viene de un <code>&lt;span&gt;</code> recortado con <code>sk-visually-hidden</code>, no de un <code>aria-label</code> aparte.",
    "commentThread.a11yP2":
      "Borrar no trae confirmación propia: dispara <code>onDelete</code> directo. Quien necesite un paso de confirmación compone <code>Dialog</code> con <code>alert</code> (pensado exactamente para eso) alrededor de su propio manejador, en vez de que este componente cargue una segunda ventana modal que no todos los consumidores necesitan.",
    "commentThread.vanillaApiTitle": "La API en Vanilla",
    "commentThread.vanillaApiBody1":
      "Cuatro cosas y ninguna más: <strong>escuchar</strong> los tres eventos, <strong>vetar</strong> uno con <code>preventDefault()</code>, <strong>escribir</strong> estado con <code>setCommentVote</code>, y <strong>crear</strong> un comentario clonando un <code>CommentTemplate</code>.",
    "commentThread.vanillaApiBody2":
      "Para crear se clona un blueprint y se llenan los campos por los hooks <code>data-sk-comment-*</code>, nunca por las clases de parte: esas son de la hoja de estilos y se mueven cuando cambia la pintura. Es el mismo idiom que usa <a href=\"/componentes/toast\">Toast</a> con su propio <code>ToastTemplate</code>.",
    "commentThread.htmlTitle": "HTML autorado",
    "commentThread.htmlBody":
      "Un comentario recursivo se compone repitiendo esta misma forma dentro de <code>.sk-comment-thread__replies</code>. El <code>FormField</code>/<code>Textarea</code> del formulario de respuesta queda a criterio de quien lo usa - acá se omite por brevedad.",
    "commentThread.reactTitle": "React",
    "commentThread.contractItem1":
      "Las respuestas recursan por COMPOSICIÓN, no como colección de datos: <code>Comment.replies</code> acepta <code>Comment</code>, igual que <code>NavListLink.nested</code> acepta <code>NavListGroup</code>. Por eso cada slot a cualquier profundidad admite contenido compuesto, cosa que una colección no podía: una entrada de colección es DATA, y un subárbol adentro se aplanaba a su texto.",
    "commentThread.contractItem2":
      "<code>CommentComposer</code> no entrega ningún control: su slot acepta cualquier signature, sin <code>of</code>, igual que el de <code>FormField</code>. Un field, un textarea o un editor entran por igual, y ninguno queda fijo en el contrato.",
    "commentThread.contractItem3":
      "La hoja es <code>components/comment-thread.css</code> y publica un prefijo por pieza (<code>sk-comment</code>, <code>sk-comment-actions</code>, <code>sk-comment-vote</code>, <code>sk-comment-composer</code>), porque cada una se usa suelta. Todos los controles son <code>sk-button</code> reales: lo único que la hoja mueve es el tono, vía <code>--sk-button-fg</code>.",
    "commentThread.test1": "Un <code>Comment</code> suelto renderiza autor, fecha y cuerpo, sin hilo ni chrome alrededor.",
    "commentThread.test2": "El slot <code>author</code> acepta contenido compuesto, no solo un string.",
    "commentThread.test3": "No hay control de plegado salvo que el comentario sea <code>collapsible</code> Y tenga respuestas que plegar.",
    "commentThread.test4": "Plegar oculta las RESPUESTAS y deja legible el comentario en sí: su cuerpo y sus acciones siguen ahí.",
    "commentThread.test5": "Las respuestas anidan como <code>Comment</code> de la misma forma, a cualquier profundidad.",
    "commentThread.test6": "<code>CommentVote</code> reporta la dirección clickeada y refleja el voto previo del lector.",
    "commentThread.test7": "<code>CommentActions</code> renderiza solo los botones que recibió, y reporta cada uno.",
    "commentThread.test8": "El composer publica el cuerpo del control que le pasaron y después lo limpia.",
    "commentThread.test9": "Lee un <code>Input</code> de una línea igual que un <code>Textarea</code>: no entrega ninguno.",
    "commentThread.test10": "No publica nada si el control está vacío.",
    "commentThread.test11": "El hilo se nombra a sí mismo y renderiza su composer arriba de los comentarios.",
    "commentThread.test12":
      "Despacha el voto con el id del comentario y la dirección clickeada, sin tocar la pintura por su cuenta.",
    "commentThread.test13": "El voto de una respuesta anidada se atribuye a la respuesta, no al comentario de arriba.",
    "commentThread.test14": "Despacha el borrado solo donde el botón de borrar existe.",
    "commentThread.test15":
      "Alterna <code>aria-expanded</code> y <code>hidden</code> del cuadro de respuesta, acotado a su propio comentario.",
    "commentThread.test16": "Plegar oculta las respuestas de ese comentario y no lo que el comentario dice.",
    "commentThread.test17":
      "Publica una respuesta con el id del comentario que la contiene como <code>parentId</code>, la limpia y cierra el cuadro.",
    "commentThread.test18": "El composer del hilo publica con <code>parentId</code> nulo.",
    "commentThread.test19": "Ignora una respuesta vacía: sin evento, formulario intacto.",
    "commentThread.test20": "Pliega las respuestas de un <code>Comment</code> suelto, sin hilo alrededor.",
    "commentThread.test21": "Un <code>CommentComposer</code> suelto publica reportando que no tiene padre.",
    "commentThread.test22": "Lee un input de una línea igual que un textarea: el composer no entrega ninguno.",
    "commentThread.test23": "También lee una superficie <code>contenteditable</code>, así un Editor puede ser el control.",
    "commentThread.test25": "Cancelar con la caja vacía la cierra sin preguntar: no hay nada que perder.",
    "commentThread.test26": "Cancelar con un borrador despacha <code>discard</code> y deja la caja abierta para que la app decida.",
    "commentThread.test27": "Una respuesta vetada con <code>preventDefault()</code> conserva el borrador y la caja.",
    "commentThread.test24": "El avatar va en el canal, aparte del nombre, para que la línea del hilo pueda colgar de él.",
    "commentThread.test28":
      "El control de plegado es un Button solo-icono en tamaño <code>xs</code>, no una cara achicada acá.",
    "demo.commentThread.label": "Comentarios",
    "demo.commentThread.replyFieldLabel": "Respuesta",
    "demo.commentThread.replyPlaceholder": "Escribí una respuesta…",
    "demo.commentThread.send": "Responder",
    "demo.commentThread.now": "recién",
    "demo.commentThread.loadingLabel": "Cargando comentarios",
    "demo.commentThread.loadingMoreLabel": "Cargando más comentarios",
    "demo.commentThread.deleteTitle": "¿Eliminar el comentario?",
    "demo.commentThread.deleteBody": "Se borra junto con sus respuestas. No se puede deshacer.",
    "demo.commentThread.deleteCancel": "Cancelar",
    "demo.commentThread.deleteConfirm": "Eliminar",
    "demo.commentThread.cancel": "Cancelar",
    "demo.commentThread.discardTitle": "¿Descartar lo escrito?",
    "demo.commentThread.discardBody": "Se pierde lo que escribiste en la respuesta.",
    "demo.commentThread.discardKeep": "Seguir escribiendo",
    "demo.commentThread.discardConfirm": "Descartar",
    "demo.commentThread.author1": "Ada",
    "demo.commentThread.time1": "hace 3h",
    "demo.commentThread.body1": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "demo.commentThread.author2": "Grace",
    "demo.commentThread.time2": "hace 1h",
    "demo.commentThread.body2": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "demo.commentThread.author3": "Linus",
    "demo.commentThread.time3": "hace 40m",
    "demo.commentThread.body3": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "demo.commentThread.author4": "Margaret",
    "demo.commentThread.time4": "hace 10m",
    "demo.commentThread.body4": "Lorem ipsum dolor sit amet.",
    "demo.commentThread.author5": "Alan",
    "demo.commentThread.time5": "hace 5m",
    "demo.commentThread.body5": "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "demo.commentThread.author6": "Barbara",
    "demo.commentThread.time6": "hace 2m",
    "demo.commentThread.body6": "Consectetur adipiscing elit, sed do eiusmod.",
    "demo.commentThread.body7": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    "demo.commentThread.body8": "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
  },
  en: {

    "commentThread.description":
      "Nested comments as five pieces usable together or apart, data-driven with no backend of its own.",
    "commentThread.betaBadge": "Beta",
    "commentThread.lede":
      "Five pieces, not one component with everything folded in. The simplest is <code>Comment</code>: who wrote it, when, and what they said, valid with no thread around it. On top of that compose <code>CommentActions</code>, <code>CommentVote</code>, <code>CommentComposer</code> and <code>CommentThread</code>. Replies recurse by composition: a <code>Comment</code> inside a <code>Comment</code>, at any depth. None of it calls an API or persists a draft: every action is handed back to the consumer.",
    "commentThread.whenTitle": "When to use it",
    "commentThread.whenBody1":
      "When there is a conversation with genuinely nested replies: any comment can have its own, at any depth. A flat stream of posts with no threading is <a href=\"/en/components/feed\">Feed</a>; a SELECTABLE hierarchy (files, an index) is <a href=\"/en/components/tree-view\">TreeView</a>. This one is for read-only content with actions (vote, reply, delete), not for picking an item.",
    "commentThread.whenBody2":
      "Per-node moderation by role and rich mention autocomplete (<code>@</code>/<code>#</code>) are deliberately out of this first version: those are each app's own domain decisions, not the design system's.",
    "commentThread.demoTitle": "The object, from the simplest piece to a deep thread",
    "commentThread.demoBody":
      "The simplest piece: who wrote it, when, and what they said. It needs no thread around it and drags no chrome it does not use.",
    "commentThread.demoAloneLabel": "One comment on its own",
    "commentThread.demoActionsTitle": "With actions",
    "commentThread.demoActionsBody":
      "The same comment plus the row: a <code>CommentVote</code> composed inside a <code>CommentActions</code>. Who may vote or delete is composition, not a handful of flags.",
    "commentThread.demoActionsLabel": "Comment with actions",
    "commentThread.demoThreadTitle": "A short thread",
    "commentThread.demoThreadBody":
      "Three comments, one of them answered. The fold control appears only where there are replies to fold, and the last comment carries no actions.",
    "commentThread.demoFixedTitle": "No folding",
    "commentThread.demoFixedBody":
      "The same deep thread below, but without <code>collapsible</code> at any level: there is no fold control anywhere, and no reply can ever be hidden. For a support or moderation thread where hiding a reply is never the right call.",
    "commentThread.demoFixedLabel": "Deep thread with no folding",
    "commentThread.demoDeepTitle": "Depth",
    "commentThread.demoDeepBody":
      "Four levels, with siblings at several of them. The connector is drawn per reply rather than measured - the first reaches back to the fold control, the last clips at its own elbow - so the only way to see that hold at depth is to render it.",
    "commentThread.demoThreadLabel": "Short thread",
    "commentThread.demoDeepLabel": "Deep thread",
    "commentThread.demoLabel": "Sample comments",
    "commentThread.demoLoadingTitle": "Loading",
    "commentThread.demoLoadingBody":
      "Two different questions: what shows while something is loading, and what happens when that has to sit next to what already loaded.",
    "commentThread.demoSkeletonTitle": "The placeholder",
    "commentThread.demoSkeletonBody":
      "The shape of a comment that has not arrived yet: a circle where the avatar goes, a couple of bars for the header, another couple for the body. None of it is announced - <code>Loader.status</code> reports the wait once, not once per row.",
    "commentThread.demoSkeletonLabel": "Comments loading",
    "commentThread.demoInfiniteTitle": "In use: loading on scroll",
    "commentThread.demoInfiniteBody":
      "Comments already loaded and the placeholder sit side by side: reaching the end of the scroll reveals the skeleton row exactly where the next comment will land, and moments later a real comment replaces it. None of this is <code>CommentThread</code>'s own - the thread never learns that pages exist.",
    "commentThread.demoInfiniteLabel": "Thread with progressive loading",
    "commentThread.behaviorTitle": "Vote and delete never touch the DOM on their own",
    "commentThread.behaviorBody1":
      "A click on vote or delete only dispatches the event (<code>onVote</code>/<code>onDelete</code> in React, a <code>CustomEvent</code> in Vanilla) - the visible state (<code>aria-pressed</code>, <code>data-voted</code>) is ALWAYS whatever the consumer's own data says, never something this component decides on its own. Folding a thread and opening/closing the reply box ARE this component's own state, and use the same disclosure pattern as <code>NavListGroup</code> (<code>aria-expanded</code> + <code>hidden</code>): no Zag machine, none needed for a click that flips one boolean.",
    "commentThread.behaviorBody2":
      "No <code>role=\"feed\"</code>, no <code>role=\"tree\"</code>: every comment is an <code>&lt;article&gt;</code>, and its replies are nested <code>&lt;article&gt;</code> elements inside it - the hierarchy a screen reader already computes on its own, with no hand-authored <code>aria-level</code> (the same exemption WAI-ARIA's own normative Tree spec gives once the whole tree is already in the DOM).",
    "commentThread.optionsTitle": "Options",
    "commentThread.optionsBody":
      "<code>label</code>: the thread's accessible name. <code>nodes</code>: the comment tree (each with <code>id</code>, <code>author</code>, <code>timestamp</code>, <code>voteCount</code>, <code>body</code>, and optionally <code>votedByMe</code>, <code>canDelete</code>, <code>replies</code>). <code>composer</code>: the box for posting a new comment, optional. Every control's copy (<code>replyLabel</code>, <code>deleteLabel</code>, <code>voteUpLabel</code>…) is its own prop, never fixed text in one language.",
    "commentThread.a11yP1":
      "Every comment is a read-only <code>&lt;article&gt;</code> with its actions inside, never a selectable widget: no roving tabindex, no arrow keys of its own - each control (vote, reply, delete, collapse) is a plain <code>&lt;button&gt;</code> in Tab order. The vote buttons are icon-only; their accessible name comes from a <code>&lt;span&gt;</code> clipped with <code>sk-visually-hidden</code>, not a separate <code>aria-label</code>.",
    "commentThread.a11yP2":
      "Delete ships no confirmation of its own: it fires <code>onDelete</code> directly. A consumer who wants a confirm step composes <code>Dialog</code> with <code>alert</code> (built for exactly that) around their own handler, rather than this component shipping a second modal not every consumer needs.",
    "commentThread.vanillaApiTitle": "The Vanilla API",
    "commentThread.vanillaApiBody1":
      "Four things and no more: <strong>listen</strong> to the three events, <strong>veto</strong> one with <code>preventDefault()</code>, <strong>write</strong> state with <code>setCommentVote</code>, and <strong>create</strong> a comment by cloning a <code>CommentTemplate</code>.",
    "commentThread.vanillaApiBody2":
      "Creating means cloning a blueprint and filling it through the <code>data-sk-comment-*</code> hooks, never through part classes: those belong to the stylesheet and move whenever the paint does. It is the same idiom <a href=\"/en/components/toast\">Toast</a> uses with its own <code>ToastTemplate</code>.",
    "commentThread.htmlTitle": "Authored HTML",
    "commentThread.htmlBody":
      "A recursive comment is composed by repeating this same shape inside <code>.sk-comment-thread__replies</code>. The reply form's <code>FormField</code>/<code>Textarea</code> is the consumer's own composition - omitted here for brevity.",
    "commentThread.reactTitle": "React",
    "commentThread.contractItem1":
      "The tree is <code>nodes</code> (not <code>items</code>): the same name <code>TreeView</code>'s own recursive collection already uses.",
    "commentThread.contractItem2":
      "<code>CommentComposer</code> ships no control: its slot takes any signature at all, with no <code>of</code>, exactly as <code>FormField</code>'s own does. A field, a textarea or an editor all fit, and none of them is fixed in the contract.",
    "commentThread.contractItem3":
      "Its stylesheet is <code>components/comment-thread.css</code>, and it publishes one class prefix per piece (<code>sk-comment</code>, <code>sk-comment-actions</code>, <code>sk-comment-vote</code>, <code>sk-comment-composer</code>), because each is used on its own. Every control is a real <code>sk-button</code>: the only thing the sheet moves is the tone, through <code>--sk-button-fg</code>.",
    "commentThread.test1": "A standalone <code>Comment</code> renders author, time and body, with no thread or chrome around it.",
    "commentThread.test2": "The <code>author</code> slot takes composed content, not only a string.",
    "commentThread.test3": "There is no fold control unless the comment is <code>collapsible</code> AND has replies to fold.",
    "commentThread.test4": "Folding hides the REPLIES and leaves the comment itself readable: its body and actions stay put.",
    "commentThread.test5": "Replies nest as <code>Comment</code>s of the same shape, at any depth.",
    "commentThread.test6": "<code>CommentVote</code> reports the direction clicked and reflects the viewer's own past vote.",
    "commentThread.test7": "<code>CommentActions</code> renders only the triggers it was given, and reports each.",
    "commentThread.test8": "The composer submits the body of whatever control it was given, then resets it.",
    "commentThread.test9": "Reads a single-line <code>Input</code> as readily as a <code>Textarea</code>: it ships neither.",
    "commentThread.test10": "Submits nothing when the control is empty.",
    "commentThread.test11": "The thread names itself and renders its composer above the comments.",
    "commentThread.test12":
      "Dispatches vote with the comment's id and the clicked direction, never touching the paint itself.",
    "commentThread.test13": "A nested reply's vote is attributed to the reply, not to the comment above it.",
    "commentThread.test14": "Dispatches delete only where the delete trigger exists.",
    "commentThread.test15":
      "Toggles the reply composer's <code>aria-expanded</code> and <code>hidden</code>, scoped to its own comment.",
    "commentThread.test16": "Collapse hides that comment's replies, not what the comment says.",
    "commentThread.test17":
      "Submits a reply with the enclosing comment's id as <code>parentId</code>, resets it and closes the box.",
    "commentThread.test18": "The thread's own composer submits with a null <code>parentId</code>.",
    "commentThread.test19": "Ignores an empty reply: no event, form left untouched.",
    "commentThread.test20": "Folds the replies of a standalone <code>Comment</code> with no thread around it.",
    "commentThread.test21": "A standalone <code>CommentComposer</code> submits, reporting no parent.",
    "commentThread.test22": "Reads a single-line input as readily as a textarea: the composer ships neither.",
    "commentThread.test23": "Reads a <code>contenteditable</code> surface too, so an Editor can be the control.",
    "commentThread.test25": "Cancelling an empty box closes it without asking: there is nothing to lose.",
    "commentThread.test26": "Cancelling with a draft dispatches <code>discard</code> and leaves the box open for the app to decide.",
    "commentThread.test27": "A reply vetoed with <code>preventDefault()</code> keeps the draft and the box.",
    "commentThread.test24": "The avatar sits in the gutter, apart from the name, so the thread line can hang off it.",
    "commentThread.test28":
      "The fold control is an icon-only Button at the <code>xs</code> size, not a face shrunk here.",
    "demo.commentThread.label": "Comments",
    "demo.commentThread.replyFieldLabel": "Reply",
    "demo.commentThread.replyPlaceholder": "Write a reply…",
    "demo.commentThread.send": "Reply",
    "demo.commentThread.now": "just now",
    "demo.commentThread.loadingLabel": "Loading comments",
    "demo.commentThread.loadingMoreLabel": "Loading more comments",
    "demo.commentThread.deleteTitle": "Delete this comment?",
    "demo.commentThread.deleteBody": "It goes along with its replies. This cannot be undone.",
    "demo.commentThread.deleteCancel": "Cancel",
    "demo.commentThread.deleteConfirm": "Delete",
    "demo.commentThread.cancel": "Cancel",
    "demo.commentThread.discardTitle": "Discard what you wrote?",
    "demo.commentThread.discardBody": "What you typed in the reply is lost.",
    "demo.commentThread.discardKeep": "Keep writing",
    "demo.commentThread.discardConfirm": "Discard",
    "demo.commentThread.author1": "Ada",
    "demo.commentThread.time1": "3h ago",
    "demo.commentThread.body1": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "demo.commentThread.author2": "Grace",
    "demo.commentThread.time2": "1h ago",
    "demo.commentThread.body2": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "demo.commentThread.author3": "Linus",
    "demo.commentThread.time3": "40m ago",
    "demo.commentThread.body3": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "demo.commentThread.author4": "Margaret",
    "demo.commentThread.time4": "10m ago",
    "demo.commentThread.body4": "Lorem ipsum dolor sit amet.",
    "demo.commentThread.author5": "Alan",
    "demo.commentThread.time5": "5m ago",
    "demo.commentThread.body5": "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "demo.commentThread.author6": "Barbara",
    "demo.commentThread.time6": "2m ago",
    "demo.commentThread.body6": "Consectetur adipiscing elit, sed do eiusmod.",
    "demo.commentThread.body7": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    "demo.commentThread.body8": "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
  },
} as const;
