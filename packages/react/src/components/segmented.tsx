import { segmentedParts, type SegmentedOption } from "@skryensya/core/segmented";
import { useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent as ReactKeyboardEvent } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type SegmentedControlProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "aria-label"
> & {
  options: readonly SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The group's own accessible name — WAI's Radio Group pattern expects one on `role="radiogroup"`. */
  label: string;
};

export function SegmentedControl({
  className,
  defaultValue,
  label,
  onValueChange,
  options,
  value,
  ...props
}: SegmentedControlProps) {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(() => value ?? defaultValue ?? options.find((option) => !option.disabled)?.value ?? options[0]?.value);
  const selected = controlled ? value : internal;

  const rootRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const indicator = indicatorRef.current;
    if (!root || !indicator) return;

    const alignIndicator = () => {
      const option = root.querySelector<HTMLButtonElement>('[role="radio"][aria-checked="true"]');
      if (!option) return;

      indicator.style.transform = `translate3d(${option.offsetLeft}px, ${option.offsetTop}px, 0)`;
      indicator.style.inlineSize = `${option.offsetWidth}px`;
      indicator.style.blockSize = `${option.offsetHeight}px`;
      root.setAttribute("data-sk-segmented-ready", "");
    };

    alignIndicator();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(alignIndicator);
    observer.observe(root);
    return () => observer.disconnect();
  }, [selected]);

  const select = (next: string) => {
    if (next === selected || options.find((option) => option.value === next)?.disabled) return;
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };

  const onOptionKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, current: string) => {
    const enabled = options.filter((option) => !option.disabled);
    const index = enabled.findIndex((option) => option.value === current);
    if (index === -1) return;

    const next = event.key === "Home"
      ? enabled[0]
      : event.key === "End"
        ? enabled.at(-1)
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? enabled[(index - 1 + enabled.length) % enabled.length]
          : event.key === "ArrowRight" || event.key === "ArrowDown"
            ? enabled[(index + 1) % enabled.length]
            : undefined;

    if (!next) return;

    event.preventDefault();
    [...(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [])]
      .find((option) => option.dataset.value === next.value)
      ?.focus();
    select(next.value);
  };

  return (
    <div
      {...props}
      aria-label={label}
      className={cx(segmentedParts.root, className)}
      data-value={selected}
      ref={rootRef}
      role="radiogroup"
    >
      <span aria-hidden="true" className={segmentedParts.indicator} ref={indicatorRef} />
      {options.map((option) => (
        <button
          aria-checked={option.value === selected}
          className={`${segmentedParts.option} sk-interactive`}
          data-value={option.value}
          disabled={option.disabled}
          key={option.value}
          onClick={() => select(option.value)}
          onKeyDown={(event) => onOptionKeyDown(event, option.value)}
          role="radio"
          tabIndex={option.value === selected && !option.disabled ? 0 : -1}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
