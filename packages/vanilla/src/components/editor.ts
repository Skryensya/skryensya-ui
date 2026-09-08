import { editorParts, editorAttrs, type EditorCommandName } from "@skryensya/core/editor";
import { editorIcons, type EditorIconName } from "@skryensya/core/editor-icons";
import { renderIconBox } from "@skryensya/core/icon";
import { toolbarParts } from "@skryensya/core/toolbar";
import { popoverParts } from "@skryensya/core/popover";
import { anchoredParts } from "@skryensya/core/anchored";
import { createEditorView, setEditorContent, type EditorView, type EditorState } from "@skryensya/editor/view";
import { suppressPointerFocusRing } from "@skryensya/editor/focus-modality";
import {
  editorCommands,
  markActive,
  blockActive,
  canUndo,
  canRedo,
  setLink,
  unsetLink,
  setParagraph,
} from "@skryensya/editor/commands";
import { editorSchema } from "@skryensya/editor/schema";
import { docToHTML, docToMarkdown } from "@skryensya/editor/serialize";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * EDITOR, no `@zag-js/*` machine: ProseMirror's own `EditorState`/`EditorView` already ARE the
 * state machine here (same reasoning `menubar.ts`/`treegrid.ts` give for their own hand-rolled
 * behaviour - no existing machine covers this). That makes this an ORDINARY imperative enhancer
 * like `toolbar.ts`'s own (`connect(root) -> cleanup`, mounted through `createConnectMount`), not
 * a machine-backed Svelte component - there is no reactive state for Svelte's own runes to own,
 * only DOM this function patches directly every time ProseMirror dispatches a transaction.
 *
 * The CONTENT surface is where ProseMirror mounts and takes over as its own contenteditable root
 * - adopt, never author, the same rule `ColorPicker.svelte` follows for its own control. The
 * TOOLBAR's buttons are DERIVED chrome, built here rather than authored in the contract's static
 * template (same reason ColorPicker's popover panel isn't templated either): which buttons exist
 * and which are pressed comes from ProseMirror's own live selection, not from markup.
 */

let idCounter = 0;
const uniqueId = (prefix: string) => `${prefix}-${(idCounter += 1)}`;

type ToolbarState = { active: Set<EditorCommandName>; canUndo: boolean; canRedo: boolean };

function readToolbarState(state: EditorState): ToolbarState {
  const active = new Set<EditorCommandName>();
  if (markActive(state, editorSchema.marks.strong!)) active.add("toggleBold");
  if (markActive(state, editorSchema.marks.em!)) active.add("toggleItalic");
  if (markActive(state, editorSchema.marks.underline!)) active.add("toggleUnderline");
  if (markActive(state, editorSchema.marks.code!)) active.add("toggleCode");
  if (markActive(state, editorSchema.marks.link!)) active.add("toggleLink");
  if (blockActive(state, editorSchema.nodes.heading!, { level: 1 })) active.add("heading1");
  if (blockActive(state, editorSchema.nodes.heading!, { level: 2 })) active.add("heading2");
  if (blockActive(state, editorSchema.nodes.heading!, { level: 3 })) active.add("heading3");
  if (blockActive(state, editorSchema.nodes.code_block!)) active.add("toggleCodeBlock");
  for (let depth = state.selection.$from.depth; depth > 0; depth--) {
    const name = state.selection.$from.node(depth).type.name;
    if (name === "bullet_list") active.add("toggleBulletList");
    if (name === "ordered_list") active.add("toggleOrderedList");
    if (name === "blockquote") active.add("toggleBlockquote");
  }
  return { active, canUndo: canUndo(state), canRedo: canRedo(state) };
}

const TOGGLES_TO_PARAGRAPH = new Set<EditorCommandName>(["heading1", "heading2", "heading3", "toggleCodeBlock"]);

const GROUPS: readonly {
  label: string;
  buttons: readonly { command: EditorCommandName; label: string; icon: EditorIconName }[];
}[] = [
  {
    label: "Estilo de texto",
    buttons: [
      { command: "toggleBold", label: "Negrita", icon: "bold" },
      { command: "toggleItalic", label: "Cursiva", icon: "italic" },
      { command: "toggleUnderline", label: "Subrayado", icon: "underline" },
    ],
  },
  {
    label: "Estructura",
    buttons: [
      { command: "heading1", label: "Título 1", icon: "heading-1" },
      { command: "heading2", label: "Título 2", icon: "heading-2" },
      { command: "heading3", label: "Título 3", icon: "heading-3" },
      { command: "toggleBulletList", label: "Lista con viñetas", icon: "list-bulleted" },
      { command: "toggleOrderedList", label: "Lista numerada", icon: "list-ordered" },
      { command: "toggleBlockquote", label: "Cita", icon: "quote" },
    ],
  },
  {
    label: "Código",
    buttons: [
      { command: "toggleCode", label: "Código en línea", icon: "code" },
      { command: "toggleCodeBlock", label: "Bloque de código", icon: "code-block" },
    ],
  },
  {
    label: "Historial",
    buttons: [
      { command: "undo", label: "Deshacer", icon: "undo" },
      { command: "redo", label: "Rehacer", icon: "redo" },
    ],
  },
];

const SVG_NS = "http://www.w3.org/2000/svg";

/** Builds a real `<svg class="sk-icon">`, the same box shape `@skryensya/vanilla/icon`'s own
 *  `mountIcons` enhancer produces - decorative (the button around it already carries `aria-label`). */
function buildIconSvg(name: EditorIconName): SVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  const { presentation, box, body } = renderIconBox({ icon: editorIcons[name], size: "sm" });
  for (const [key, value] of presentation) svg.setAttribute(key, value);
  for (const [key, value] of box) svg.setAttribute(key, value);
  svg.insertAdjacentHTML("afterbegin", body);
  return svg;
}

function connect(root: HTMLElement): () => void {
  const toolbar = root.querySelector<HTMLElement>("[data-sk-toolbar]");
  const content = root.querySelector<HTMLElement>(`.${editorParts.content}`);
  const hiddenInput = root.querySelector<HTMLTextAreaElement>(`.${editorParts.hiddenInput}`);
  if (!content) throw new Error(`[data-sk-editor] necesita un .${editorParts.content}.`);
  if (!toolbar) throw new Error("[data-sk-editor] necesita un [data-sk-toolbar]: no existe una versión sin toolbar.");

  /*
   * No generated id on the ROOT: it was assigned here and read by nothing, and an id only one
   * binding writes is a divergence G2 reports for nothing in return.
   *
   * The CONTENT gets one, because that id is real: it is what a `FormField`'s label points its
   * `for` at, which is exactly what React's `useFormFieldControl` mints for the same element. An
   * author writing this markup by hand supplies it; nothing had been minting it when the enhancer
   * built the control instead.
   */
  if (!content.id) content.id = uniqueId("sk-editor-content");

  const readOnly = root.hasAttribute("data-readonly");
  const disabled = root.hasAttribute("data-disabled");
  const placeholder = root.dataset.placeholder ?? "";
  // The authored/emitted content div starts with whatever markup the template (or an author) put
  // there; `data-default-value` overrides it when the caller set the option directly (React's own
  // equivalent, `defaultValue`, is a prop rather than authored innerHTML for the same reason).
  const defaultValueHTML = root.dataset.defaultValue ?? content.innerHTML;
  const autoFocus = root.hasAttribute("data-autofocus");

  const buttons = new Map<EditorCommandName, HTMLButtonElement>();

  function runCommand(view: EditorView, name: EditorCommandName, href?: string): void {
    if (name === "toggleLink") {
      const command = markActive(view.state, editorSchema.marks.link!) ? unsetLink : setLink(href ?? "");
      command(view.state, view.dispatch, view);
    } else if (TOGGLES_TO_PARAGRAPH.has(name) && readToolbarState(view.state).active.has(name)) {
      setParagraph(view.state, view.dispatch, view);
    } else {
      editorCommands[name as Exclude<EditorCommandName, "toggleLink">](view.state, view.dispatch, view);
    }
    view.focus();
  }

  function makeButton(getView: () => EditorView | undefined, command: EditorCommandName, label: string, icon: EditorIconName): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `${editorParts.toolbarButton} sk-button sk-interactive`;
    button.dataset.size = "sm";
    button.dataset.variant = "ghost";
    button.setAttribute("data-icon-only", "");
    button.setAttribute(editorAttrs.command, command);
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", "false");
    button.title = label;
    button.appendChild(buildIconSvg(icon));
    // Keeps the ProseMirror selection alive - a plain click already steals focus from the content
    // surface before `click` fires, which would collapse the selection a mark toggle needs.
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      const view = getView();
      if (view) runCommand(view, command);
    });
    buttons.set(command, button);
    return button;
  }

  /*
   * Native Popover API markup, by hand: `popover.ts`'s own contract needs no enhancer at all ("the
   * native Popover API owns light-dismiss, Escape and the top layer... both bindings are the same
   * markup twice"), and `popover.css` positions every instance off ONE static, scope-shared anchor
   * name - no per-instance JS binding the way ColorPicker/DatePicker/Tooltip need. Reusing the
   * exact class shape `Popover.tsx` renders is what makes this markup pick up that same CSS.
   */
  function buildLinkPopover(getView: () => EditorView | undefined): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = popoverParts.root;
    const contentId = uniqueId("sk-editor-link");

    const trigger = document.createElement("button");
    trigger.type = "button";
    // Popover's own trigger classes PLUS the same icon-button shape every other button on this bar
    // carries (`makeButton` above): small, ghost, icon-only. Popover publishes those three as
    // `triggerVariant`/`triggerSize`/`triggerIconOnly` (popover.ts) and they reach exactly these
    // attributes; without them the trigger draws at Button's own defaults - a bordered, raised,
    // control-height box - and the link reads as a stray control beside the bar, not the last
    // button in it.
    trigger.className = `${editorParts.toolbarButton} sk-button sk-interactive ${popoverParts.trigger} ${anchoredParts.anchor}`;
    trigger.dataset.size = "sm";
    trigger.dataset.variant = "ghost";
    trigger.setAttribute("data-icon-only", "");
    trigger.setAttribute("popovertarget", contentId);
    trigger.setAttribute("aria-label", "Insertar enlace");
    trigger.appendChild(buildIconSvg("link"));
    buttons.set("toggleLink", trigger);

    const positioner = document.createElement("div");
    positioner.id = contentId;
    positioner.setAttribute("popover", "auto");
    positioner.className = `${popoverParts.positioner} ${popoverParts.content} ${anchoredParts.positioner}`;
    positioner.dataset.skPlacement = "block-end";

    // Same shape `Popover.tsx` renders when `arrow` is set: a decorative span, first child of the
    // positioner, so this popover visually connects to its trigger the same way every other one on
    // the site does - its absence read as "disconnected" (confirmed live).
    const arrow = document.createElement("span");
    arrow.className = anchoredParts.arrow;
    arrow.setAttribute("aria-hidden", "true");
    positioner.appendChild(arrow);

    const form = document.createElement("form");
    form.style.display = "flex";
    form.style.gap = "var(--space-inline-xs)";
    form.style.padding = "var(--space-inset-sm)";

    const input = document.createElement("input");
    input.type = "url";
    input.name = "href";
    input.placeholder = "https://…";
    input.setAttribute("aria-label", "URL");
    input.className = "sk-input";
    input.dataset.size = "sm";

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "sk-button sk-interactive";
    submit.dataset.size = "sm";
    submit.dataset.tone = "accent";
    submit.textContent = "Añadir";

    form.append(input, submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const view = getView();
      const href = input.value;
      if (view && href) runCommand(view, "toggleLink", href);
      positioner.hidePopover?.();
    });

    // Same close control `Popover.tsx` renders whenever it is not `bare` - an explicit way out
    // beyond Escape/light-dismiss, matching the reference Popover demo's own anatomy.
    const close = document.createElement("button");
    close.type = "button";
    close.className = `sk-button sk-interactive ${popoverParts.close}`;
    close.setAttribute("popovertarget", contentId);
    close.setAttribute("popovertargetaction", "hide");
    close.textContent = "Cerrar";

    positioner.append(form, close);
    wrapper.append(trigger, positioner);
    return wrapper;
  }

  function paintButtons(state: ToolbarState): void {
    for (const [command, button] of buttons) {
      if (command === "toggleLink") {
        button.setAttribute("aria-label", state.active.has("toggleLink") ? "Editar enlace" : "Insertar enlace");
        continue;
      }
      button.setAttribute("aria-pressed", String(state.active.has(command)));
      if (command === "undo") button.disabled = readOnly || disabled || !state.canUndo;
      else if (command === "redo") button.disabled = readOnly || disabled || !state.canRedo;
      else button.disabled = readOnly || disabled;
    }
  }

  let view: EditorView | undefined;

  GROUPS.forEach((group, index) => {
    if (index > 0) {
      const separator = document.createElement("span");
      separator.className = toolbarParts.separator;
      separator.setAttribute("aria-hidden", "true");
      toolbar.appendChild(separator);
    }
    const groupEl = document.createElement("div");
    groupEl.className = toolbarParts.group;
    groupEl.setAttribute("role", "group");
    groupEl.setAttribute("aria-label", group.label);
    for (const button of group.buttons) {
      groupEl.appendChild(makeButton(() => view, button.command, button.label, button.icon));
    }
    toolbar.appendChild(groupEl);
  });

  const separator = document.createElement("span");
  separator.className = toolbarParts.separator;
  separator.setAttribute("aria-hidden", "true");
  toolbar.appendChild(separator);

  const linkGroup = document.createElement("div");
  linkGroup.className = toolbarParts.group;
  linkGroup.setAttribute("role", "group");
  linkGroup.setAttribute("aria-label", "Insertar");
  linkGroup.appendChild(buildLinkPopover(() => view));
  toolbar.appendChild(linkGroup);

  view = createEditorView({
    mount: content,
    document,
    defaultValueHTML,
    placeholder,
    autoFocus,
    editable: () => !readOnly && !disabled,
    onTransaction(state, tr) {
      paintButtons(readToolbarState(state));
      if (!tr || tr.docChanged) {
        const html = docToHTML(state.doc, document);
        if (hiddenInput) hiddenInput.value = html;
        root.dispatchEvent(
          new CustomEvent("sk-editor-change", {
            bubbles: true,
            detail: { html, markdown: docToMarkdown(state.doc), doc: state.doc },
          }),
        );
      }
    },
  });

  /*
   * Vanilla's own escape hatch, symmetric with React's `ref`-based `EditorHandle`: since a Vanilla
   * consumer has no ref to grab, the live view (and small convenience readers/`setContent`) travel
   * as this one event's `detail` instead - dispatched once, right after mount.
   */
  root.dispatchEvent(
    new CustomEvent("sk-editor-ready", {
      bubbles: true,
      detail: {
        view,
        getHTML: () => docToHTML(view!.state.doc, document),
        getMarkdown: () => docToMarkdown(view!.state.doc),
        getJSON: () => view!.state.doc,
        setContent: (html: string) => setEditorContent(view!, html, document),
      },
    }),
  );

  const stopSuppressingPointerFocusRing = suppressPointerFocusRing(content, `.${editorParts.content}`);

  return () => {
    stopSuppressingPointerFocusRing();
    view?.destroy();
  };
}

export const mountEditor = createConnectMount({
  key: "editor",
  rootSelector: "[data-sk-editor]",
  connect,
});
