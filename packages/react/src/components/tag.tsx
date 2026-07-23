import { tagParts, type TagTone } from "@skryensya/core/tag";
import { type HTMLAttributes, type ReactNode } from "react";

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
      {onRemove ? (
        <button aria-label={removeLabel} className={tagParts.remove} onClick={onRemove} type="button">
          ×
        </button>
      ) : null}
    </span>
  );
}
