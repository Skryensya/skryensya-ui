import { popoverContract, popoverParts, type PopoverPlacement } from "@skryensya/core/popover";
import { useId, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { anchoredParts } from "@skryensya/core/anchored";


const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

const {
  triggerVariant: triggerVariantOption,
  triggerSize: triggerSizeOption,
  triggerIconOnly: triggerIconOnlyOption,
} = popoverContract.options;

export type PopoverProps = Omit<HTMLAttributes<HTMLDivElement>, "content" | "title"> & {
  trigger: ReactNode;
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Draw a small arrow pointing at the trigger. Off by default; decorative, never announced. */
  arrow?: boolean;
  /**
   * The bare surface: an anchor and a panel, with no title, no description and no close control.
   * It is the same component with less anatomy (`Popover.bare` in the contract) rather than a
   * second component, because duplicating the parts would leave a reader choosing between two names
   * for one thing. Escape and light-dismiss still work: they are the platform's, not the chrome's.
   */
  bare?: boolean;
  placement?: PopoverPlacement;
  triggerLabel?: string;
  closeLabel?: string;
  contentClassName?: string;
  triggerClassName?: string;
  /** Passed straight to the trigger's own `data-variant`/`data-size`; see `popover.ts`'s identical
   *  option doc. `Button`'s own `[data-variant="…"]`/`[data-size="…"]` rules (button.css) apply to
   *  the trigger directly once these are set; nothing here repeats their CSS. */
  triggerVariant?: string;
  triggerSize?: string;
  /** The SAME attribute `Button`'s own `iconOnly` option writes; see `popover.ts`'s identical
   *  option doc. Pair it with `triggerLabel`. */
  triggerIconOnly?: boolean;
  /**
   * Where the floating content is portalled. Defaults to `document.body`, which is right whenever
   * an ancestor might clip it. Pass a ref to keep the content inside a subtree instead: a preview
   * frame, a scoped test harness, or a dialog that owns its own stacking context.
   */
  container?: RefObject<HTMLElement>;
};

/** Native Popover API: the browser owns light-dismiss, Escape and top-layer behaviour. */
export function Popover({
  bare = false,
  container,
  children,
  className,
  closeLabel = "Cerrar",
  contentClassName,
  description,
  id,
  arrow = false,
  placement = "block-end",
  trigger,
  triggerClassName,
  triggerIconOnly = false,
  triggerLabel,
  triggerSize,
  triggerVariant,
  title,
  ...props
}: PopoverProps) {
  const generatedId = useId();
  const contentId = id ?? `${generatedId}-popover`;
  // Same relationship `Dialog` fixes between its `<dialog>` and its own title/body (see
  // `dialog.tsx`): `popover="auto"` grants no implicit accessible name the way `<dialog>` at least
  // tries to, so without this a screen reader focusing or announcing the popover gets nothing from
  // its OWN heading. Two separate `useId()` calls, not one derived from `contentId`, for the same
  // reason `Dialog` doesn't derive its own from the dialog's id either: the panel's id is author-
  // supplied (`panelId`, tied to the trigger's `popovertarget`) and does not need to double as a
  // stem for ids the author never sees or sets.
  const titleId = useId();
  const descriptionId = useId();
  const hasTitle = Boolean(title) && !bare;
  const hasDescription = Boolean(description) && !bare;

  return (
    <div {...props} className={cx(popoverParts.root, className)}>
      <button
        aria-label={triggerLabel}
        className={cx("sk-button", "sk-interactive", popoverParts.trigger, anchoredParts.anchor, triggerClassName)}
        popoverTarget={contentId}
        type="button"
        {...{
          [triggerVariantOption.attr]: triggerVariant,
          [triggerSizeOption.attr]: triggerSize,
          [triggerIconOnlyOption.attr]: triggerIconOnly ? triggerIconOnlyOption.trueValue : undefined,
        }}
      >
        {trigger}
      </button>
      <div
        aria-describedby={hasDescription ? descriptionId : undefined}
        aria-labelledby={hasTitle ? titleId : undefined}
        className={cx(popoverParts.positioner, popoverParts.content, anchoredParts.positioner, contentClassName)}
        data-sk-placement={placement}
        id={contentId}
        popover="auto"
      >
        {arrow ? <span aria-hidden="true" className={anchoredParts.arrow} /> : null}
        {hasTitle ? (
          <h2 className={popoverParts.title} id={titleId}>
            {title}
          </h2>
        ) : null}
        {hasDescription ? (
          <p className={popoverParts.description} id={descriptionId}>
            {description}
          </p>
        ) : null}
        {children}
        {bare ? null : (
        <button
          className={cx("sk-button", "sk-interactive", popoverParts.close)}
          popoverTarget={contentId}
          popoverTargetAction="hide"
          type="button"
        >
          {closeLabel}
        </button>
        )}
      </div>
    </div>
  );
}
