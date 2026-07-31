import {
  computeFlyoutFixedCoords,
  flyoutAttrs,
  flyoutEvents,
  flyoutParts,
  type FlyoutOption,
  type FlyoutOptions,
  type FlyoutOpenDetails,
  type FlyoutValueChangeDetails,
} from "@skryensya/core/flyout";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

export type FlyoutProps = Omit<FlyoutOptions, "options"> & {
  label?: ReactNode;
  /** Decorative closed-state geometry supplied by the consumer's bound icon set. */
  indicator?: ReactNode;
  /** Decorative open-state geometry supplied by the consumer's bound icon set. */
  openIndicator?: ReactNode;
  /** Decorative checked-state geometry supplied by the consumer's bound icon set. */
  itemIndicator?: ReactNode;
  options: readonly FlyoutOption[];
};

const PANEL_GAP_PX = 4;
const VIEWPORT_PAD_PX = 8;

/**
 * Controlled/uncontrolled value picker with a side panel (no portal). Opens on click / keyboard;
 * closes on Escape, outside pointerdown, or item commit. Only one flyout stays open. Placement
 * flips/clamps so the panel stays inside the viewport.
 */
export function Flyout({
  id,
  label,
  indicator,
  openIndicator,
  itemIndicator,
  disabled,
  value: valueProp,
  defaultValue,
  placeholder = "Select option",
  options,
  onValueChange,
}: FlyoutProps) {
  const generatedId = useId();
  const flyoutId = id ?? generatedId;
  const panelId = `${flyoutId}-panel`;
  const labelId = label ? `${flyoutId}-label` : undefined;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);

  const initialValue = Array.isArray(defaultValue) ? defaultValue[0] : defaultValue;
  const [uncontrolled, setUncontrolled] = useState(initialValue ?? options[0]?.value ?? "");
  const controlled = valueProp !== undefined;
  const value = controlled ? (valueProp[0] ?? "") : uncontrolled;
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  const placePanel = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    const root = rootRef.current;
    if (!trigger || !panel || !root) return;

    panel.dataset.placement = "fixed";
    panel.style.position = "fixed";
    const panelRect = panel.getBoundingClientRect();
    const coords = computeFlyoutFixedCoords({
      trigger: trigger.getBoundingClientRect(),
      panelWidth: panelRect.width || panel.offsetWidth,
      panelHeight: panelRect.height || panel.offsetHeight,
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: document.documentElement.clientHeight,
      gap: PANEL_GAP_PX,
      padding: VIEWPORT_PAD_PX,
      rtl: getComputedStyle(root).direction === "rtl",
    });
    panel.style.top = `${coords.top}px`;
    panel.style.left = `${coords.left}px`;
    panel.style.right = "auto";
    panel.dataset.side = coords.side;
  }, []);

  const clearPlacement = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    delete panel.dataset.placement;
    delete panel.dataset.side;
    panel.style.removeProperty("position");
    panel.style.removeProperty("top");
    panel.style.removeProperty("left");
    panel.style.removeProperty("right");
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    clearPlacement();
  }, [clearPlacement]);

  const openPanel = useCallback(() => {
    if (disabled) return;
    const root = rootRef.current;
    if (root) {
      document.dispatchEvent(
        new CustomEvent<FlyoutOpenDetails>(flyoutEvents.open, { detail: { root } }),
      );
    }
    setOpen(true);
  }, [disabled]);

  useEffect(() => {
    if (!open) return;
    placePanel();

    const onViewportChange = () => placePanel();
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [open, placePanel]);

  useEffect(() => {
    const onExclusiveOpen = (event: Event) => {
      const detail = (event as CustomEvent<FlyoutOpenDetails>).detail;
      const root = rootRef.current;
      if (!detail || !root || detail.root === root) return;
      close();
    };
    document.addEventListener(flyoutEvents.open, onExclusiveOpen);
    return () => document.removeEventListener(flyoutEvents.open, onExclusiveOpen);
  }, [close]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root || root.contains(event.target as Node)) return;
      close();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, close]);

  const emitChange = (next: string) => {
    const details: FlyoutValueChangeDetails = { value: [next] };
    if (!controlled) setUncontrolled(next);
    onValueChange?.(details);
  };

  const commit = (next: string) => {
    const option = options.find((candidate) => candidate.value === next);
    if (!option || option.disabled) return;
    emitChange(next);
    close();
  };

  const onFlyoutKeyDown = (event: ReactKeyboardEvent) => {
    if (disabled) return;

    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
      triggerRef.current?.focus();
      return;
    }

    if (event.currentTarget === triggerRef.current) {
      if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPanel();
      }
    }
  };

  return (
    <div
      ref={rootRef}
      className={flyoutParts.root}
      {...{ [flyoutAttrs.root]: "" }}
      data-value={value || undefined}
      data-disabled={disabled ? "" : undefined}
      id={id}
    >
      {label ? (
        <label className={flyoutParts.label} {...{ [flyoutAttrs.label]: "" }} id={labelId}>
          {label}
        </label>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        className={`${flyoutParts.trigger} sk-interactive`}
        {...{ [flyoutAttrs.trigger]: "" }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby={labelId}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        data-state={open ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
        onClick={() => (open ? close() : openPanel())}
        onKeyDown={onFlyoutKeyDown}
      >
        <span className={flyoutParts.value} {...{ [flyoutAttrs.value]: "" }}>
          {selected?.label || placeholder}
        </span>
        <span className={flyoutParts.indicator} {...{ [flyoutAttrs.indicator]: "" }} aria-hidden="true">
          <span data-state="closed">{indicator}</span>
          <span data-state="open">{openIndicator}</span>
        </span>
      </button>

      <ul
        ref={panelRef}
        id={panelId}
        role="listbox"
        className={flyoutParts.panel}
        {...{ [flyoutAttrs.panel]: "" }}
        aria-labelledby={labelId}
        hidden={!open}
        data-state={open ? "open" : "closed"}
        tabIndex={open ? -1 : undefined}
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <li
              key={option.value}
              role="option"
              className={`${flyoutParts.item} sk-interactive`}
              {...{ [flyoutAttrs.item]: "" }}
              data-value={option.value}
              aria-selected={checked}
              aria-disabled={option.disabled || undefined}
              data-state={checked ? "checked" : undefined}
              data-disabled={option.disabled ? "" : undefined}
              tabIndex={open && checked && !option.disabled ? 0 : -1}
              onClick={() => commit(option.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  commit(option.value);
                }
                onFlyoutKeyDown(event);
              }}
            >
              <span className={flyoutParts.itemText} {...{ [flyoutAttrs.itemText]: "" }}>
                {option.label}
              </span>
              <span className={flyoutParts.itemIndicator} {...{ [flyoutAttrs.itemIndicator]: "" }} aria-hidden="true">
                {itemIndicator}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Re-export the shared event name for consumers wiring DOM listeners.
export { flyoutEvents };
