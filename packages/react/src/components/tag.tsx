import { tagParts, type TagTone } from "@skryensya/core/tag";
import { type HTMLAttributes, type ReactNode } from "react";
import { Button } from "./button.js";
import { Icon } from "./icon.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
  tone?: TagTone;
  /** Called when the remove control is used. */
  onRemove?: () => void;
  /**
   * Whether the remove control exists. Structure, which is the contract's; `onRemove` is behaviour,
   * which is not. Defaults to whether a handler was given, so the common call site is unchanged.
   */
  removable?: boolean;
  /** Accessible name for the remove control. Defaults to "Remove". */
  removeLabel?: string;
};

export function Tag({ children, className, onRemove, removable, removeLabel = "Remove", tone = "neutral", ...props }: TagProps) {
  const hasRemove = removable ?? onRemove !== undefined;
  return (
    <span
      {...props}
      className={cx(tagParts.root, className)}
      data-removable={hasRemove ? "" : undefined}
      data-tone={tone}
    >
      <span className={tagParts.label}>{children}</span>
      {/* A real Button, not a chip-shaped lookalike: the state layer, the focus ring and the 44px hit
          target come with it. `close` is the system's icon for dismissing, never a literal "×". */}
      {hasRemove ? (
        <Button
          aria-label={removeLabel}
          className={tagParts.remove}
          iconOnly
          onClick={onRemove}
          size="sm"
          variant="ghost"
        >
          <Icon name="close" />
        </Button>
      ) : null}
    </span>
  );
}
