import { editorContract, editorParts, type EditorCommandName } from "@skryensya/core/editor";
import { editorIcons, type EditorIconName } from "@skryensya/core/editor-icons";
import { suppressPointerFocusRing } from "@skryensya/editor/focus-modality";
import {
  createEditorView,
  setEditorContent,
  type EditorView,
  type EditorState,
  type PMNode,
} from "@skryensya/editor/view";
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
import { docToHTML, docToMarkdown } from "@skryensya/editor/serialize";
import { editorSchema } from "@skryensya/editor/schema";
import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ForwardedRef,
  type RefObject,
} from "react";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "./toolbar.js";
import { Popover } from "./popover.js";
import { Icon } from "./icon.js";
import { useFormFieldControl } from "./form-field.js";

const cx = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

export type EditorValue = { html: string; markdown: string; doc: PMNode };

export type EditorHandle = {
  /** The live ProseMirror view. An escape hatch - most consumers never need it. */
  view: EditorView | null;
  getHTML(): string;
  getMarkdown(): string;
  getJSON(): PMNode | null;
  focus(): void;
  /** Replaces the whole document with fresh content parsed from an HTML string. */
  setContent(html: string): void;
};

/* Active-mark/active-block bookkeeping the toolbar reads every transaction. A plain object rather
 * than a `Set`: it is diffed by React on every keystroke/selection move, and an object literal's
 * shallow-equal-by-field re-render is cheaper to reason about here than set membership. */
type ToolbarState = {
  readonly active: ReadonlySet<EditorCommandName>;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
};

/** `setBlockType`-based commands: clicking an already-active one runs `setParagraph` instead, so
 *  the button reads as a real toggle (see `setParagraph`'s own comment in `@skryensya/editor`). */
const TOGGLES_TO_PARAGRAPH = new Set<EditorCommandName>(["heading1", "heading2", "heading3", "toggleCodeBlock"]);

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

/*
 * The one place an `EditorView` is constructed and torn down for `Editor`. Mount-only (empty
 * dep array): rebuilding the view on every render would lose
 * the user's cursor and undo history the moment a parent re-renders with a new inline `onChange`
 * closure, which is why `onChange`/`readOnly`/`disabled` are read through refs updated every
 * render rather than captured as effect dependencies.
 */
function useProseMirrorEditor(options: {
  defaultValue?: string;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange?: (value: EditorValue) => void;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const initialToolbarState: ToolbarState = { active: new Set(), canUndo: false, canRedo: false };
  const [toolbarState, setToolbarState] = useState<ToolbarState>(initialToolbarState);
  const toolbarStateRef = useRef<ToolbarState>(initialToolbarState);

  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    const mount = contentRef.current;
    if (!mount) return;

    const view = createEditorView({
      mount,
      document,
      defaultValueHTML: latest.current.defaultValue,
      placeholder: latest.current.placeholder,
      autoFocus: latest.current.autoFocus,
      editable: () => !latest.current.readOnly && !latest.current.disabled,
      onTransaction(state, tr) {
        const next = readToolbarState(state);
        toolbarStateRef.current = next;
        setToolbarState(next);
        if (!tr || tr.docChanged) {
          const html = docToHTML(state.doc, document);
          if (hiddenInputRef.current) hiddenInputRef.current.value = html;
          latest.current.onChange?.({ html, markdown: docToMarkdown(state.doc), doc: state.doc });
        }
      },
    });

    viewRef.current = view;
    const stopSuppressingPointerFocusRing = suppressPointerFocusRing(mount, `.${editorParts.content}`);
    return () => {
      stopSuppressingPointerFocusRing();
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    viewRef.current?.setProps({ editable: () => !options.readOnly && !options.disabled });
  }, [options.readOnly, options.disabled]);

  const runCommand = useCallback((name: EditorCommandName, href?: string) => {
    const view = viewRef.current;
    if (!view) return;
    if (name === "toggleLink") {
      const command = toolbarStateHasLink(view.state) ? unsetLink : setLink(href ?? "");
      command(view.state, view.dispatch, view);
    } else if (TOGGLES_TO_PARAGRAPH.has(name) && toolbarStateRef.current.active.has(name)) {
      setParagraph(view.state, view.dispatch, view);
    } else {
      editorCommands[name](view.state, view.dispatch, view);
    }
    view.focus();
  }, []);

  return { contentRef, hiddenInputRef, viewRef, toolbarState, runCommand };
}

function toolbarStateHasLink(state: EditorState): boolean {
  return markActive(state, editorSchema.marks.link!);
}

function useImperativeEditorHandle(ref: ForwardedRef<EditorHandle>, viewRef: RefObject<EditorView | null>) {
  useImperativeHandle(ref, () => ({
    get view() {
      return viewRef.current;
    },
    getHTML: () => (viewRef.current ? docToHTML(viewRef.current.state.doc, document) : ""),
    getMarkdown: () => (viewRef.current ? docToMarkdown(viewRef.current.state.doc) : ""),
    getJSON: () => viewRef.current?.state.doc ?? null,
    focus: () => viewRef.current?.focus(),
    setContent: (html: string) => {
      if (viewRef.current) setEditorContent(viewRef.current, html, document);
    },
  }));
}

export type EditorProps = {
  id?: string;
  className?: string;
  /** Initial content, as an HTML string. Uncontrolled: there is no live `value` - a controlled
   *  contenteditable surface fights its own DOM mutations every render. Read the current content
   *  from `onChange`, or imperatively via a `ref`. */
  defaultValue?: string;
  onChange?: (value: EditorValue) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Submitted under this name via the hidden textarea (HTML value). */
  name?: string;
  /** Names the content surface for a reader, when nothing external (a FormField's own label) already does. */
  label?: string;
};

export type EditorWithToolbarProps = EditorProps & {
  /** A smaller toolbar: tighter padding and gaps, the same buttons - an option, not a different
   *  anatomy (see `editorContract`'s own `toolbarCompact` comment for why that split holds here). */
  compact?: boolean;
  /**
   * The toolbar's own accessible name. The contract has published this as `toolbarLabel` all along
   * and this binding hardcoded the default instead, so a consumer who set it got it in authored
   * markup and silently did not in React. Its default is the contract's, read from there rather
   * than written twice.
   */
  toolbarLabel?: string;
};

const GROUPS: readonly {
  readonly label: string;
  readonly buttons: readonly { readonly command: EditorCommandName; readonly label: string; readonly icon: EditorIconName }[];
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

function ToolbarButton({
  active,
  command,
  disabled,
  icon,
  label,
  onRun,
}: {
  active: boolean;
  command: EditorCommandName;
  disabled?: boolean;
  icon: EditorIconName;
  label: string;
  onRun: (command: EditorCommandName) => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cx(editorParts.toolbarButton, "sk-button", "sk-interactive")}
      data-icon-only=""
      data-sk-editor-command={command}
      data-size="sm"
      data-variant="ghost"
      disabled={disabled}
      // Keeps the ProseMirror selection alive: a plain click already steals focus from the
      // content surface before `onClick` fires, which would collapse the selection a mark toggle
      // needs. `mousedown` fires first, so preventing its default keeps focus (and the selection)
      // right where it was.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onRun(command)}
      title={label}
      type="button"
    >
      <Icon data={editorIcons[icon]} size="sm" />
    </button>
  );
}

function LinkButton({ active, onSubmit }: { active: boolean; onSubmit: (href: string) => void }) {
  return (
    <Popover
      arrow
      placement="block-end"
      trigger={<Icon data={editorIcons.link} size="sm" />}
      // The same icon-button shape every other button on this bar has (`ToolbarButton` above):
      // small, ghost, icon-only. Without it Popover's trigger draws at Button's own defaults - a
      // bordered, raised, control-height box - and the link reads as a stray control dropped next
      // to the bar rather than the last button in it.
      triggerClassName={editorParts.toolbarButton}
      triggerIconOnly
      triggerLabel={active ? "Editar enlace" : "Insertar enlace"}
      triggerSize="sm"
      triggerVariant="ghost"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const href = (new FormData(event.currentTarget).get("href") as string | null) ?? "";
          if (href) onSubmit(href);
          event.currentTarget.closest<HTMLElement>("[popover]")?.hidePopover?.();
        }}
        style={{ display: "flex", gap: "var(--space-inline-xs)", padding: "var(--space-inset-sm)" }}
      >
        <input aria-label="URL" className="sk-input" data-size="sm" name="href" placeholder="https://…" type="url" />
        <button className="sk-button sk-interactive" data-size="sm" data-tone="accent" type="submit">
          Añadir
        </button>
      </form>
    </Popover>
  );
}

/** Toolbar + surface, the "robust, one import" path. */
export const Editor = forwardRef<EditorHandle, EditorWithToolbarProps>(function Editor(
  {
    autoFocus,
    className,
    compact = false,
    defaultValue,
    disabled = false,
    id,
    label,
    name,
    onChange,
    placeholder,
    readOnly = false,
    toolbarLabel = editorContract.options.toolbarLabel.default,
  },
  ref,
) {
  const { contentRef, hiddenInputRef, viewRef, toolbarState, runCommand } = useProseMirrorEditor({
    autoFocus,
    defaultValue,
    disabled,
    onChange,
    placeholder,
    readOnly,
  });
  useImperativeEditorHandle(ref, viewRef);
  const control = useFormFieldControl({ id, disabled });

  return (
    <div className={cx(editorParts.root, className)} data-sk-editor="" data-toolbar-compact={compact ? "" : undefined}>
      <Toolbar label={toolbarLabel}>
        {GROUPS.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 ? <ToolbarSeparator /> : null}
            <ToolbarGroup aria-label={group.label}>
              {group.buttons.map((button) => (
                <ToolbarButton
                  active={toolbarState.active.has(button.command)}
                  command={button.command}
                  disabled={
                    (button.command === "undo" && !toolbarState.canUndo) ||
                    (button.command === "redo" && !toolbarState.canRedo) ||
                    readOnly ||
                    disabled
                  }
                  icon={button.icon}
                  key={button.command}
                  label={button.label}
                  onRun={runCommand}
                />
              ))}
            </ToolbarGroup>
          </Fragment>
        ))}
        <ToolbarSeparator />
        <ToolbarGroup aria-label="Insertar">
          <LinkButton active={toolbarState.active.has("toggleLink")} onSubmit={(href) => runCommand("toggleLink", href)} />
        </ToolbarGroup>
      </Toolbar>
      <textarea
        aria-hidden="true"
        className={editorParts.hiddenInput}
        name={name}
        ref={hiddenInputRef}
        style={{
          border: 0,
          clip: "rect(0 0 0 0)",
          height: "1px",
          margin: "-1px",
          overflow: "hidden",
          padding: 0,
          position: "absolute",
          width: "1px",
          whiteSpace: "nowrap",
          /* The contract's own `hiddenInputStyle` ends with `word-wrap: normal`, and leaving it off
           * here made the two bindings' computed style differ by one declaration. */
          wordWrap: "normal",
        }}
        readOnly
        tabIndex={-1}
      />
      <div
        aria-describedby={control.describedBy}
        aria-disabled={disabled ? "true" : undefined}
        aria-invalid={control.invalid ? "true" : undefined}
        aria-label={label}
        aria-multiline="true"
        aria-readonly={readOnly ? "true" : undefined}
        className={cx(editorParts.content, "sk-input")}
        id={control.id}
        ref={contentRef}
        role="textbox"
        tabIndex={0}
      />
    </div>
  );
});
