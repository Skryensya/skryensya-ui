import {
  vaulDataParts,
  vaulEvents,
  vaulParts,
  vaulScope,
  type VaulEdge,
  type VaulOpenChangeDetails,
  vaulContract,
} from "@skryensya/core/vaul";
import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type DialogHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { useVaulDrag } from "./vaul-drag.js";

/* Derived, never restated: the defaults live in the contract. */
const { dismissThreshold: thresholdOption, draggable: draggableOption, edge: edgeOption } = vaulContract.options;

/*
 * VAUL: a modal panel anchored to an edge.
 *
 * The modality is the platform's (a native `<dialog>`): opening is `showModal()`, which is a call,
 * so the consumer reaches it through `ref`. What this binding owns is what the Vanilla mount owns for
 * authored markup: the drag on the handle (`useVaulDrag`, the same pure verdict as `connectVaul`),
 * light dismiss from the backdrop, and the `sk:vaulopenchange` announcement on every close.
 *
 * The handle is always drawn and always `aria-hidden`. It used to be drawn here with no gesture
 * behind it, an affordance that lied; the panel is still dismissible by Escape and by its own close
 * control in every case, and above the desktop breakpoint the CSS hides the grip and the hook drops
 * the grab to match.
 */
export type VaulProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, "aria-label" | "children"> & {
  children: ReactNode;
  /**
   * Names the panel. Required: `showModal()` gives the root an implicit `role="dialog"` whether or
   * not the composition thinks about it, and Vaul has no header of its own to source a name from
   * the way `Dialog`'s required `title` slot does. This is that same requirement, as a plain
   * option instead of a slot. Named `label`, not `aria-label`, the same as every other option this
   * binding maps to an `aria-*` attribute internally (see `Feed`'s own `label`). The contract's
   * key, not the DOM spelling, is the binding's own prop name.
   */
  label: string;
  /** Which edge it arrives from. Logical, so the inline edges follow writing direction. */
  edge?: VaulEdge;
  /** Set false to keep the panel and its handle but not the drag. */
  draggable?: boolean;
  /** Fraction (0–1) of the panel's size a release must have travelled to dismiss it. */
  dismissThreshold?: number;
  /** Every close, however it happened: drag, backdrop, Escape or a `method="dialog"` form. */
  onOpenChange?: (details: VaulOpenChangeDetails) => void;
  /** The dialog itself, so the consumer can call `showModal()`. */
  ref?: Ref<HTMLDialogElement>;
  /**
   * The DRAWER shape: the panel fills its edge rather than sitting against it (`Vaul.drawer` in
   * the contract). One modifier class, which is the whole of what `drawer.css` is, so it is a
   * signature of this family rather than a component with its own parts to keep in step.
   */
  drawer?: boolean;
};

function VaulRoot({
  children,
  className,
  dismissThreshold = thresholdOption.default,
  draggable = draggableOption.default,
  drawer = false,
  edge = edgeOption.default,
  label,
  onOpenChange,
  ref,
  ...props
}: VaulProps) {
  const dialog = useRef<HTMLDialogElement | null>(null);
  useVaulDrag(dialog, { enabled: draggable, edge, threshold: dismissThreshold });

  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    const root = dialog.current;
    if (!root) return;

    const announce = () => {
      root.dispatchEvent(new CustomEvent(vaulEvents.openChange, { detail: { open: root.open }, bubbles: true }));
      onOpenChangeRef.current?.({ open: root.open });
    };
    /* The backdrop is the dialog's own box: a click on the dialog outside its rectangle is a click
       on the backdrop. Same rule as the Vanilla mount. */
    const onLightDismiss = (event: MouseEvent) => {
      if (event.target !== root) return;
      const box = root.getBoundingClientRect();
      const outside =
        event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
      if (outside) root.close();
    };

    root.addEventListener("close", announce);
    root.addEventListener("click", onLightDismiss);
    return () => {
      root.removeEventListener("close", announce);
      root.removeEventListener("click", onLightDismiss);
    };
  }, []);

  const setRef = (node: HTMLDialogElement | null) => {
    dialog.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <dialog
      {...props}
      ref={setRef}
      aria-label={label}
      className={[vaulParts.root, drawer ? "sk-drawer" : undefined, className].filter(Boolean).join(" ")}
      data-edge={edge}
      /* The scope markers the enhancer writes at runtime, so both bindings carry them at rest,
         the same pair Tile's binding renders rather than waiting for a script. */
      data-part={vaulDataParts.root}
      data-scope={vaulScope}
      data-sk-vaul=""
    >
      <div aria-hidden="true" className={vaulParts.handle} data-part="handle" />
      {children}
    </dialog>
  );
}

type VaulButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> & {
  children: ReactNode;
  /** Button's look, untyped the way Popover's and Menu's trigger trio are: Vaul does not own it. */
  variant?: string;
  tone?: string;
  size?: string;
  iconOnly?: boolean;
};

const buttonAttrs = ({ className, iconOnly, size, tone, variant }: Pick<VaulButtonProps, "className" | "iconOnly" | "size" | "tone" | "variant">) => ({
  className: ["sk-button", "sk-interactive", className].filter(Boolean).join(" "),
  "data-icon-only": iconOnly ? "" : undefined,
  "data-size": size,
  "data-tone": tone,
  "data-variant": variant,
});

export type VaulTriggerProps = VaulButtonProps & {
  /** The `id` of the Vaul this opens. */
  opens: string;
};

/*
 * WHAT OPENS IT, from wherever the page puts the button. The same facts the Vanilla mount writes
 * onto an authored `data-sk-vaul-open` trigger: `aria-controls`, `aria-haspopup="dialog"`, and an
 * `aria-expanded` that follows the dialog, including closes the trigger did not cause.
 */
function VaulTrigger({ children, className, iconOnly, onClick, opens, size, tone, variant, ...props }: VaulTriggerProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const panel = document.getElementById(opens);
    if (!(panel instanceof HTMLDialogElement)) return;
    const sync = () => setExpanded(panel.open);
    sync();
    panel.addEventListener("close", sync);
    return () => panel.removeEventListener("close", sync);
  }, [opens]);

  return (
    <button
      {...props}
      {...buttonAttrs({ className, iconOnly, size, tone, variant })}
      aria-controls={opens}
      aria-expanded={expanded}
      aria-haspopup="dialog"
      data-sk-vaul-open={opens}
      onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const panel = document.getElementById(opens);
        if (!(panel instanceof HTMLDialogElement)) return;
        if (!panel.open) panel.showModal();
        setExpanded(true);
      }}
      type="button"
    >
      {children}
    </button>
  );
}

export type VaulCloseProps = VaulButtonProps;

/** WHAT CLOSES IT from inside the panel: the nearest `<dialog>` is the one it belongs to. */
function VaulClose({ children, className, iconOnly, onClick, size, tone, variant, ...props }: VaulCloseProps) {
  return (
    <button
      {...props}
      {...buttonAttrs({ className, iconOnly, size, tone, variant })}
      data-sk-vaul-close=""
      onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.currentTarget.closest("dialog")?.close();
      }}
      type="button"
    >
      {children}
    </button>
  );
}

/* `Vaul.Trigger` and `Vaul.Close`, the contract's signature names, reached through the root export. */
export const Vaul = Object.assign(VaulRoot, { Trigger: VaulTrigger, Close: VaulClose });

/*
 * The drawer shape, as its own export rather than a flag callers must remember.
 *
 * `Vaul.drawer` is a signature, and a signature maps to a NAME: React has no way to know which one
 * a tree chose, so a shared component with a `drawer` prop would have needed the contract to carry a
 * redundant option whose only job is to repeat what the signature already said.
 */
export type DrawerProps = Omit<VaulProps, "drawer">;

export function Drawer(props: DrawerProps) {
  return <Vaul {...props} drawer />;
}
