export const checkboxMessages = {
  es: {
    "demo.checkbox.emailAlerts": "Alertas por email",
    "demo.checkbox.group": "Permisos del repositorio",
    "demo.checkbox.read": "Lectura",
    "demo.checkbox.write": "Escritura",
    "demo.checkbox.admin": "Administración",
    "demo.checkbox.critical.title": "Alertas críticas",
    "demo.checkbox.critical.body": "Notifica caídas y degradaciones.",
    "demo.checkbox.private.title": "Repositorios privados",
    "demo.checkbox.private.body": "Incluye actividad de proyectos privados.",
    "demo.checkbox.disabled.title": "Canal heredado",
    "demo.checkbox.disabled.body": "Gestionado por la organización.",

    "checkbox.description": "Checkbox nativo: estado independiente, indeterminado y formulario sin máquina.",
    "checkbox.lede": 'Una elección independiente. Conserva un <code>input type="checkbox"</code>: submit, reset, teclado y validación pertenecen al browser.',
    "checkbox.body":
      "El control usa los roles <code>check</code> y <code>remove</code> del set de iconos, no un trazo CSS. Importa <code>@skryensya/core/components/checkbox.css</code> y llama <code>initComponents()</code> una vez.",
    "checkbox.groupTitle": "Un checkbox que agrupa a otros: CheckboxGroup",
    "checkbox.groupBody1":
      "<code>indeterminate</code> no es un tercer valor que alguien pueda elegir: es lo que un padre dice cuando <strong>sus hijos no se ponen de acuerdo</strong>. Por eso el glifo es <code>remove</code> y no un check a medias, y por eso el padre no envía nada al formulario, los que tienen <code>name</code> y <code>value</code> son los hijos.",
    "checkbox.groupNote": "tres estados a partir de dos booleanos",
    "checkbox.groupBody2":
      "El estado del padre es <strong>derivado</strong>, nunca escrito a mano: se recalcula desde los hijos en cada cambio. Al revés, un padre con estado propio empieza a mentir en cuanto alguien marca un hijo. Por eso el contrato no le da un <code>checked</code> que se pueda fijar: cuáles hijos arrancan marcados es dato de cada entrada (<code>defaultChecked</code>), no del grupo.",
    "checkbox.groupBody3":
      "Un hijo <code>disabled</code> no cuenta como voto: una casilla que nadie puede alcanzar no debería impedir que el padre diga «todos». Y un <code>reset</code> del formulario devuelve los hijos a sus atributos <strong>sin disparar ningún evento</strong>, así que el enhancer vuelve a derivar después del reset; sin eso el padre quedaría contradiciendo a sus propios hijos hasta el siguiente click.",
    "checkbox.tileTitle": "Checkbox de superficie: TileCheckbox",
    "checkbox.tileBody1":
      "Cuando la elección necesita título, descripción y toda la superficie como target, usa <code>TileCheckbox</code>. Es el mismo control (<code>sk-checkbox__control</code> + iconos); solo cambia el contenedor.",
    "checkbox.tileBody2":
      'El enhancer <code>tile-checkbox</code> (Svelte + <code>@zag-js/checkbox</code>, la misma máquina que React) hidrata cada label <code>data-sk-tile-checkbox</code> con <code>initComponents()</code>: controla su <code>input[data-part="input"]</code> (oculto) y sincroniza <code>data-state</code>; el <code>[data-part="indicator"]</code> es el control visual.',
    "checkbox.reactBody": "React dibuja los iconos del set enlazado.",
    "checkbox.contractItem1": "<code>defaultChecked</code> deja el estado al input; un reset vuelve a ese valor.",
    "checkbox.contractItem2": "<code>checked</code> controla el valor; <code>onCheckedChange</code> comunica la intención.",
    "checkbox.contractItem3":
      '<code>"indeterminate"</code> es visual: no envía un valor hasta que la persona elige checked o unchecked. El glifo es <code>remove</code>.',
    "checkbox.contractItem4":
      "<code>CheckboxGroup</code> <strong>deriva</strong> el estado del padre, nunca lo guarda: <code>checked</code> cuando están todos, <code>indeterminate</code> cuando no coinciden. <code>checked</code> e <code>indeterminate</code> son flags independientes del input y pueden estar los dos encendidos a la vez; el enhancer apaga el segundo al salir de ese estado, y el CSS le da prioridad al guion por si acaso.",
    "checkbox.contractItem5": 'El texto vive dentro del <code>label</code>; si no hay texto, proporciona <code>aria-label</code>.',
    "checkbox.contractItem6":
      "El state layer va en <code>sk-checkbox__control</code>, no en el label: la selección es el relleno del control, y el texto no hereda el color on-accent.",
    "checkbox.contractItem7": "TileCheckbox reutiliza <code>sk-checkbox__control</code> y los mismos indicadores; no inventa otro glifo.",
    "checkbox.iconsComment1": "Los indicadores check/remove se escriben a mano como placeholders",
    "checkbox.iconsComment2": "<span data-sk-icon>; mountIcons los reemplaza por el <svg> del set.",
    "checkbox.iconsComment3":
      "Cada label se autora con data-sk-tile-checkbox (data-name, data-value,\ndata-default-checked) más su input y su indicador.",
    "checkbox.iconsComment4": "initComponents las hidrata con la máquina @zag-js/checkbox.",
    "checkbox.test1":
      "Alterna el estado marcado y el <code>data-state</code> de la raíz al hacer click, emitiendo <code>sk:checkedchange</code>.",
    "checkbox.test2": "Está asociado al formulario y respeta su <code>default-checked</code>.",
    "checkbox.groupTest1":
      "Deriva los tres estados del padre a partir de los hijos, al montar y en cada cambio.",
    "checkbox.groupTest2":
      "Marca y desmarca a todos los hijos desde el padre, y reporta qué cambió en <code>sk:checkboxgroupvaluechange</code>.",
    "checkbox.groupTest3":
      "Deja en paz al hijo <code>disabled</code> y no deja que impida al padre decir «todos».",
    "checkbox.groupTest4": "Cuenta solo a sus propios hijos, nunca a los de un grupo anidado.",
    "checkbox.groupTest5":
      "Vuelve a derivar el padre tras un <code>reset</code> del formulario, que restaura a los hijos en silencio.",
  },
  en: {
    "demo.checkbox.emailAlerts": "Email alerts",
    "demo.checkbox.group": "Repository permissions",
    "demo.checkbox.read": "Read",
    "demo.checkbox.write": "Write",
    "demo.checkbox.admin": "Admin",
    "demo.checkbox.critical.title": "Critical alerts",
    "demo.checkbox.critical.body": "Notify outages and degradations.",
    "demo.checkbox.private.title": "Private repositories",
    "demo.checkbox.private.body": "Include activity from private projects.",
    "demo.checkbox.disabled.title": "Inherited channel",
    "demo.checkbox.disabled.body": "Managed by the organization.",

    "checkbox.description": "Native checkbox: independent state, indeterminate, and form handling with no machine.",
    "checkbox.lede": 'An independent choice. It keeps an <code>input type="checkbox"</code>: submit, reset, keyboard and validation belong to the browser.',
    "checkbox.body":
      "The control uses the icon set's <code>check</code> and <code>remove</code> roles, not a CSS stroke. Import <code>@skryensya/core/components/checkbox.css</code> and call <code>initComponents()</code> once.",
    "checkbox.groupTitle": "A checkbox that groups others: CheckboxGroup",
    "checkbox.groupBody1":
      "<code>indeterminate</code> is not a third value someone can pick: it is what a parent says when <strong>its children disagree</strong>. That is why the glyph is <code>remove</code> rather than a half check, and why the parent submits nothing to the form: the children, which carry <code>name</code> and <code>value</code>, are the ones that do.",
    "checkbox.groupNote": "three states from two booleans",
    "checkbox.groupBody2":
      "The parent's state is <strong>derived</strong>, never hand-written: it is recalculated from the children on every change. The other way around, a parent with its own state starts lying the moment someone checks a child. That is why the contract gives it no settable <code>checked</code>: which children start checked is per-entry data (<code>defaultChecked</code>), not the group's.",
    "checkbox.groupBody3":
      "A <code>disabled</code> child is not a vote: a box nobody can reach should not keep the parent from saying “all”. And a form <code>reset</code> restores the children from their attributes <strong>without firing a single event</strong>, so the enhancer re-derives after it; without that the parent would sit contradicting its own children until the next click.",
    "checkbox.tileTitle": "A surface checkbox: TileCheckbox",
    "checkbox.tileBody1":
      "When the choice needs a title, a description, and the whole surface as its target, use <code>TileCheckbox</code>. It is the same control (<code>sk-checkbox__control</code> + icons); only the container changes.",
    "checkbox.tileBody2":
      'The <code>tile-checkbox</code> enhancer (Svelte + <code>@zag-js/checkbox</code>, the same machine React uses) hydrates every <code>data-sk-tile-checkbox</code> label with <code>initComponents()</code>: it controls its (hidden) <code>input[data-part="input"]</code> and syncs <code>data-state</code>; the <code>[data-part="indicator"]</code> is the visual control.',
    "checkbox.reactBody": "React draws the icons from the linked set.",
    "checkbox.contractItem1": "<code>defaultChecked</code> leaves the state to the input; a reset returns to that value.",
    "checkbox.contractItem2": "<code>checked</code> controls the value; <code>onCheckedChange</code> communicates intent.",
    "checkbox.contractItem3":
      '<code>"indeterminate"</code> is visual: it submits no value until the person picks checked or unchecked. The glyph is <code>remove</code>.',
    "checkbox.contractItem4":
      "<code>CheckboxGroup</code> <strong>derives</strong> the parent's state, never stores it: <code>checked</code> when they all are, <code>indeterminate</code> when they disagree. <code>checked</code> and <code>indeterminate</code> are independent flags off the input and can both be on at once; the enhancer turns the second off when leaving that state, and the CSS gives the dash priority in case it is not.",
    "checkbox.contractItem5": 'The text lives inside the <code>label</code>; with no text, provide an <code>aria-label</code>.',
    "checkbox.contractItem6":
      "The state layer sits on <code>sk-checkbox__control</code>, not the label: selection is the control's own fill, and the text never inherits the on-accent color.",
    "checkbox.contractItem7": "TileCheckbox reuses <code>sk-checkbox__control</code> and the same indicators; it invents no other glyph.",
    "checkbox.iconsComment1": "The check/remove indicators are authored as placeholders",
    "checkbox.iconsComment2": "<span data-sk-icon>; mountIcons replaces them with the <svg> of the set.",
    "checkbox.iconsComment3":
      "Every label is authored with data-sk-tile-checkbox (data-name, data-value,\ndata-default-checked) plus its input and its indicator.",
    "checkbox.iconsComment4": "initComponents hydrates them with the @zag-js/checkbox machine.",
    "checkbox.test1":
      "Toggles checked state and the root's <code>data-state</code> on click, emitting <code>sk:checkedchange</code>.",
    "checkbox.test2": "Is form-associated and honours its <code>default-checked</code>.",
    "checkbox.groupTest1":
      "Derives the parent's three states from its children, on mount and on every change.",
    "checkbox.groupTest2":
      "Checks and unchecks every child from the parent, and reports what changed on <code>sk:checkboxgroupvaluechange</code>.",
    "checkbox.groupTest3":
      "Leaves a <code>disabled</code> child alone and does not let it hold the parent back from “all”.",
    "checkbox.groupTest4": "Counts only its own children, never a nested group's.",
    "checkbox.groupTest5":
      "Re-derives the parent after a form <code>reset</code>, which restores the children silently.",
  },
} as const;
