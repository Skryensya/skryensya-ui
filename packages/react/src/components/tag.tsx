import { tagParts, type TagTone } from "@skryensya/core/tag";
import { type HTMLAttributes, type ReactNode } from "react";
import { Button } from "./button.js";
import { Icon } from "./icon.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
  tone?: TagTone;
  /** Called when the remove control is used. Omit to render a plain tag with no remove button. */
  onRemove?: () => void;
  /** Accessible name for the remove control. Defaults to "Remove". */
  removeLabel?: string;
};

export function Tag({ children, className, onRemove, removeLabel = "Remove", tone = "neutral", ...props }: TagProps) {
  return (
    <span {...props} className={cx(tagParts.root, className)} data-tone={tone}>
      <span className={tagParts.label}>{children}</span>
      {/* A real Button, not a chip-shaped lookalike: the state layer, the focus ring and the 44px hit
          target come with it. `close` is the system's icon for dismissing, never a literal "×". */}
      {onRemove ? (
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
