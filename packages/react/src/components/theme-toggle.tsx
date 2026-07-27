import {
  applyColorMode,
  colorModeLabel,
  isColorMode,
  nextColorMode,
  readColorMode,
  themeToggleAttrs,
  themeToggleEvents,
  themeToggleParts,
  type ColorMode,
  type ThemeToggleChangeDetail,
} from "@skryensya/core/theme-toggle";
import type { ButtonSize } from "@skryensya/core/button";
import { type ButtonHTMLAttributes, useEffect, useState } from "react";
import { Icon } from "./icon.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ThemeToggleProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onChange" | "type" | "value"
> & {
  /** Controlled color mode. */
  value?: ColorMode;
  /** Uncontrolled initial mode. Defaults to the document's current `data-scheme`, or `system`. */
  defaultValue?: ColorMode;
  /** Fires after each cycle. */
  onValueChange?: (value: ColorMode) => void;
  /** Override accessible names per mode (defaults are English). */
  labels?: Partial<Record<ColorMode, string>>;
  /** Same size axis as Button. Default is control-md; `sm` paints at 32px with a 44px hit. */
  size?: ButtonSize;
};

function documentMode(): ColorMode {
  if (typeof document === "undefined") return "system";
  return readColorMode(document.documentElement);
}

/**
 * Icon-only button that cycles color mode on `<html>`. Faces use the stable roles
 * `mode-system`, `mode-light`, `mode-dark` (ADR-15: the set is still linked by the app).
 */
export function ThemeToggle({
  className,
  defaultValue,
  labels,
  onValueChange,
  size,
  value,
  ...props
}: ThemeToggleProps) {
  const [uncontrolled, setUncontrolled] = useState<ColorMode>(() => {
    if (isColorMode(defaultValue)) return defaultValue;
    return documentMode();
  });
  const mode = value ?? uncontrolled;

  useEffect(() => {
    applyColorMode(document.documentElement, mode);
  }, [mode]);

  // Peer ThemeToggles write `data-scheme` on `<html>` and announce via the change event;
  // mirror that into uncontrolled state so every instance cycles from the same place.
  useEffect(() => {
    if (value !== undefined) return;
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<ThemeToggleChangeDetail>).detail?.value;
      if (!isColorMode(next)) return;
      setUncontrolled((prev) => (prev === next ? prev : next));
    };
    document.addEventListener(themeToggleEvents.change, onChange);
    return () => document.removeEventListener(themeToggleEvents.change, onChange);
  }, [value]);

  const setMode = (next: ColorMode) => {
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  return (
    <button
      {...props}
      aria-label={colorModeLabel(mode, labels)}
      className={cx(`${themeToggleParts.root} sk-button sk-interactive`, className)}
      data-sk-theme-toggle=""
      data-icon-only=""
      data-scheme={mode}
      data-size={size}
      data-variant="ghost"
      type="button"
      onClick={(event) => {
        props.onClick?.(event);
        if (event.defaultPrevented) return;
        const next = nextColorMode(readColorMode(document.documentElement));
        setMode(next);
        applyColorMode(document.documentElement, next);
        event.currentTarget.dispatchEvent(
          new CustomEvent<ThemeToggleChangeDetail>(themeToggleEvents.change, {
            bubbles: true,
            detail: { value: next },
          }),
        );
      }}
    >
      <Icon name="mode-system" data-sk-theme-toggle-icon="system" />
      <Icon name="mode-light" data-sk-theme-toggle-icon="light" />
      <Icon name="mode-dark" data-sk-theme-toggle-icon="dark" />
    </button>
  );
}
