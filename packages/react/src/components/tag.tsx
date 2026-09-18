import { tagEvents, tagParts, type TagTone, tagContract } from "@skryensya/core/tag";
import { type AnchorHTMLAttributes, type HTMLAttributes } from "react";
import { Button } from "./button.js";
import { Icon } from "./icon.js";

/* Derived, never restated: the default lives in the contract. */
const { tone: toneOption, removeLabel: removeLabelOption } = tagContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type TagOwnProps = {
  /** Plain chip text. Matches the contract slot (`accepts: "text"`). */
  children: string;
  tone?: TagTone;
};

type StaticTagProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> &
  TagOwnProps & {
    href?: undefined;
    /**
     * Called when the remove control is used. Structure is `removable`; this is behaviour only.
     * Also dispatches `sk:tagremove` on the host so the contract event and the React prop agree.
     */
    onRemove?: () => void;
    /** Whether the remove control exists. Defaults to false; must be set explicitly. */
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

export function Tag({ children, className, tone = toneOption.default, ...props }: TagProps) {
  if (props.href !== undefined) {
    return (
      <a {...props} className={cx(`${tagParts.root} sk-interactive`, className)} data-tone={tone}>
        <span className={tagParts.label}>{children}</span>
      </a>
    );
  }

  const { onRemove, removable = false, removeLabel = removeLabelOption.default, ...spanProps } = props;
  return (
    <span
      {...spanProps}
      className={cx(tagParts.root, className)}
      data-removable={removable ? "" : undefined}
      data-tone={tone}
    >
      <span className={tagParts.label}>{children}</span>
      {/* A real Button, not a chip-shaped lookalike: the state layer, the focus ring and the 44px hit
          target come with it. `close` is the system's icon for dismissing, never a literal "×". */}
      {removable ? (
        <Button
          aria-label={removeLabel}
          className={tagParts.remove}
          iconOnly
          onClick={(event) => {
            onRemove?.();
            event.currentTarget
              .closest(`.${tagParts.root}`)
              ?.dispatchEvent(new CustomEvent(tagEvents.remove, { bubbles: true }));
          }}
          size="sm"
          variant="ghost"
        >
          <Icon name="close" />
        </Button>
      ) : null}
    </span>
  );
}
