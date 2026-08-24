import { tagParts, type TagTone } from "@skryensya/core/tag";
import { type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { Button } from "./button.js";
import { Icon } from "./icon.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type TagOwnProps = {
  children: ReactNode;
  tone?: TagTone;
};

type StaticTagProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> &
  TagOwnProps & {
    href?: undefined;
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

type LinkTagProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> &
  TagOwnProps & {
    href: string;
    /** A link tag navigates. It cannot also carry a nested dismiss button. */
    onRemove?: never;
    removable?: never;
    removeLabel?: never;
  };

export type TagProps = StaticTagProps | LinkTagProps;

export function Tag({ children, className, tone = "neutral", ...props }: TagProps) {
  if (props.href !== undefined) {
    return (
      <a {...props} className={cx(`${tagParts.root} sk-interactive`, className)} data-tone={tone}>
        <span className={tagParts.label}>{children}</span>
      </a>
    );
  }

  const { onRemove, removable, removeLabel = "Remove", ...spanProps } = props;
  const hasRemove = removable ?? onRemove !== undefined;
  return (
    <span
      {...spanProps}
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
