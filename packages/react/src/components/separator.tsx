import {
  separatorContract,
  separatorParts,
  type SeparatorOrientation,
  type SeparatorSpacing,
  type SeparatorTone,
} from "@skryensya/core/separator";
import { useId, type HTMLAttributes } from "react";

/* Derived, never restated: the defaults live in the contract. */
const {
  orientation: orientationOption,
  spacing: spacingOption,
  tone: toneOption,
} = separatorContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type SeparatorProps = Omit<HTMLAttributes<HTMLHRElement>, "children"> & {
  /** `vertical` takes its height from whatever holds it: a separator has no content of its own. */
  orientation?: SeparatorOrientation;
  /** How loud the rule is. Named by role: chrome, content, sections. */
  tone?: SeparatorTone;
  /** The air around it. `none` for a rule inside something that already spaces it. */
  spacing?: SeparatorSpacing;
  /**
   * The rule is paint, not meaning: it leaves the accessibility tree entirely.
   *
   * Leave it off when the line says two blocks are about different things - that is what the
   * element already means.
   */
  decorative?: boolean;
};

/**
 * A rule between two things.
 *
 * A separator that can be MOVED is a different component with a different keyboard contract; that
 * one is `@skryensya/core/splitter`. This one divides, it does not resize.
 */
export function Separator({
  className,
  decorative = false,
  orientation = orientationOption.default,
  spacing = spacingOption.default,
  tone = toneOption.default,
  ...props
}: SeparatorProps) {
  return (
    <hr
      {...props}
      aria-orientation={orientation}
      className={cx(separatorParts.root, className)}
      data-decorative={decorative ? "" : undefined}
      data-orientation={orientation}
      data-spacing={spacing}
      data-tone={tone}
      role={decorative ? "presentation" : undefined}
    />
  );
}

export type LabelledSeparatorProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The word between the rules: "or", "since 2019", "older". */
  children: string;
  tone?: SeparatorTone;
  spacing?: SeparatorSpacing;
};

/**
 * The one with a word in it.
 *
 * The name comes from the label through `aria-labelledby` and not from the content, because
 * `separator` is not a name-from-content role: a nameless one is announced as "separator", which is
 * the word the visible label exists to replace.
 */
export function LabelledSeparator({
  children,
  className,
  spacing = spacingOption.default,
  tone = toneOption.default,
  ...props
}: LabelledSeparatorProps) {
  const labelId = useId();

  return (
    <div
      {...props}
      aria-labelledby={labelId}
      className={cx(separatorParts.root, className)}
      data-spacing={spacing}
      data-tone={tone}
      role="separator"
    >
      <span aria-hidden="true" className={separatorParts.rule} />
      <span className={separatorParts.label} id={labelId}>
        {children}
      </span>
      <span aria-hidden="true" className={separatorParts.rule} />
    </div>
  );
}
