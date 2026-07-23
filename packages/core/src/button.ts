export type ButtonVariant = "neutral" | "primary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /**
   * The icon-only shape: a control-sized square holding a single glyph. Orthogonal to variant and
   * size, any of those can be icon-only. Because the box has no room for a visible label, an
   * icon-only button MUST carry an accessible name (`aria-label` / `aria-labelledby`); the bindings
   * refuse to build one without it.
   */
  iconOnly?: boolean;
};

export const buttonParts = {
  root: "ds-button",
} as const;

export type ButtonPart = keyof typeof buttonParts;
export type ButtonPartClass = (typeof buttonParts)[ButtonPart];
