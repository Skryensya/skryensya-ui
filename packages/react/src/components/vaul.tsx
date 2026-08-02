import { vaulDataParts, vaulParts, vaulScope, type VaulEdge } from "@skryensya/core/vaul";
import type { DialogHTMLAttributes, ReactNode } from "react";

/*
 * VAUL — the React half, which did not exist.
 *
 * A modal panel anchored to an edge. The modality is the platform's (a native `<dialog>`), the
 * classes and parts are ours, and drag-to-dismiss is the Vanilla enhancer's because neither the
 * platform nor Zag has it. This binding therefore renders markup and nothing else: opening is
 * `showModal()`, which is a call, and dragging is a gesture — neither is something a composition
 * says, and both are things the consumer or the enhancer supplies.
 *
 * The handle is always drawn and always `aria-hidden`. It is the affordance for a gesture that only
 * exists where the enhancer runs, and announcing a grip that may do nothing is worse than silence:
 * the panel is dismissible by Escape and by its own close control in every case.
 */
export type VaulProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, "children"> & {
  children: ReactNode;
  /** Which edge it arrives from. Logical, so the inline edges follow writing direction. */
  edge?: VaulEdge;
  /**
   * The DRAWER shape: the panel fills its edge rather than sitting against it — `Vaul.drawer` in
   * the contract. One modifier class, which is the whole of what `drawer.css` is, so it is a
   * signature of this family rather than a component with its own parts to keep in step.
   */
  drawer?: boolean;
};

export function Vaul({ children, className, drawer = false, edge = "block-end", ...props }: VaulProps) {
  return (
    <dialog
      {...props}
      className={[vaulParts.root, drawer ? "sk-drawer" : undefined, className].filter(Boolean).join(" ")}
      data-edge={edge}
      /* The scope markers the enhancer writes at runtime, so both bindings carry them at rest —
         the same pair Tile's binding renders rather than waiting for a script. */
      data-part={vaulDataParts.root}
      data-scope={vaulScope}
    >
      <div aria-hidden="true" className={vaulParts.handle} data-part="handle" />
      {children}
    </dialog>
  );
}

/*
 * The drawer shape, as its own export rather than a flag callers must remember.
 *
 * `Vaul.drawer` is a signature, and a signature maps to a NAME — React has no way to know which one
 * a tree chose, so a shared component with a `drawer` prop would have needed the contract to carry a
 * redundant option whose only job is to repeat what the signature already said.
 */
export type DrawerProps = Omit<VaulProps, "drawer">;

export function Drawer(props: DrawerProps) {
  return <Vaul {...props} drawer />;
}
