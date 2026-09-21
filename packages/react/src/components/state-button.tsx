import { stateButtonAttrs, stateButtonParts, type IconStateFace } from "@skryensya/core/state-button";
import { iconToggleAttrs, iconToggleParts } from "@skryensya/core/icon-toggle";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Icon } from "./icon.js";

/*
 * ICON STATE BUTTON, the React half (decision 33, reversed: this is the signature now, not a
 * primitive underneath CopyButton/ThemeToggle. Both are gone). `faces` is author-supplied, the
 * same shape the authored/vanilla contract's `faces` items slot takes; `current` picks which one
 * carries `data-active`, the same comparison Icon Toggle's own pattern CSS already reads. Nothing
 * here decides WHEN `current` changes. That is the consumer's click handler, not this component's.
 */

function classes(...values: readonly (string | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export type StateButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  /** Which face's `name` is current. Absent means no face carries `data-active`. */
  current?: string;
  faces: readonly IconStateFace[];
};

export const StateButton = forwardRef<HTMLButtonElement, StateButtonProps>(function StateButton(
  { className, current, faces, ...props },
  ref,
) {
  return (
    <button
      {...props}
      className={classes(stateButtonParts.root, iconToggleParts.root, "sk-button", "sk-interactive", className)}
      data-icon-only=""
      ref={ref}
      type="button"
      {...{ [stateButtonAttrs.current]: current }}
    >
      {faces.map((face) => (
        // No `data-sk-icon-size`: that is the vanilla enhancer's own control attribute (`icon.ts`),
        // read once to size the icon it builds and never meant to persist. `Icon`'s own `size` prop
        // already defaults to `"md"`, so this side needs nothing extra to match.
        <Icon
          key={face.name}
          name={face.icon}
          {...{
            [stateButtonAttrs.face]: face.name,
            [iconToggleAttrs.active]: face.name === current ? "" : undefined,
          }}
        />
      ))}
    </button>
  );
});
