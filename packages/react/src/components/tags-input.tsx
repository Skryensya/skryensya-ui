import { tagsInput } from "@skryensya/core/machines";
import { tagParts } from "@skryensya/core/tag";
import {
  tagsInputContract,
  tagsInputEvents,
  tagsInputParts,
} from "@skryensya/core/tags-input";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useRef } from "react";
import { Button } from "./button.js";
import { Icon } from "./icon.js";

/* Derived, never restated: the defaults live in the contract. */
const {
  delimiter: delimiterOption,
  editable: editableOption,
  removeLabel: removeLabelOption,
} = tagsInputContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type TagsInputProps = {
  id?: string;
  /**
   * The accessible name of the entry. Required: with no name a screen reader announces an edit
   * field and nothing about what goes in it.
   */
  label: string;
  placeholder?: string;
  /** Every delete control's accessible name. One string for all of them; see the contract's note. */
  removeLabel?: string;
  /** The tags it starts with. Uncontrolled. */
  defaultValue?: string[];
  /** The tags, controlled. Spread conditionally: see the note inside. */
  value?: string[];
  /** How many tags the field accepts. Past it a new tag is refused in silence; see the contract. */
  max?: number;
  /** The character that both commits a tag and splits a pasted list. */
  delimiter?: string;
  allowDuplicates?: boolean;
  /** Whether a committed tag can be reopened (Enter, or a double click) and rewritten in place. */
  editable?: boolean;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  className?: string;
  onValueChange?: (details: { value: string[] }) => void;
};

/**
 * Several values typed into one field.
 *
 * It accepts whatever was typed, which is the whole difference from a Combobox: that one resolves
 * what is typed to one of its own options, and this one takes the person's own vocabulary.
 */
export function TagsInput({
  allowDuplicates,
  className,
  defaultValue,
  delimiter = delimiterOption.default,
  disabled,
  editable = editableOption.default,
  id,
  invalid,
  label,
  max,
  name,
  onValueChange,
  placeholder,
  readOnly,
  removeLabel = removeLabelOption.default,
  required,
  value,
}: TagsInputProps) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);

  /*
   * SPREAD, NOT `value: undefined`.
   *
   * `@zag-js/core`'s `bindable` reads controlled-vs-uncontrolled off the presence of the KEY, not
   * off the value being defined, so passing `value` unconditionally pins an uncontrolled field at
   * its initial tags forever: the callbacks still fire and nothing is ever added. The Rating
   * binding carries the same note, measured against the machine rather than guessed.
   */
  const service = useMachine(tagsInput.machine, {
    id: resolvedId,
    name,
    ...(value === undefined ? {} : { value }),
    ...(defaultValue === undefined ? {} : { defaultValue }),
    ...(max === undefined ? {} : { max }),
    delimiter,
    allowDuplicates,
    editable,
    disabled,
    readOnly,
    invalid,
    required,
    onValueChange(details) {
      onValueChange?.({ value: details.value });
      /* The same channel authored markup gets, with the same detail. */
      rootRef.current?.dispatchEvent(
        new CustomEvent(tagsInputEvents.valueChange, { bubbles: true, detail: { value: details.value } }),
      );
    },
  });
  const api = tagsInput.connect(service, normalizeProps);

  return (
    <div
      {...api.getRootProps()}
      className={cx(tagsInputParts.root, className)}
      data-disabled={disabled ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-required={required ? "" : undefined}
      ref={rootRef}
    >
      <div {...api.getControlProps()} className={tagsInputParts.control}>
        {/* The node that stands for the whole list. `display: contents`, so it adds no box. */}
        <span className={tagsInputParts.list}>
          {api.value.map((tag, index) => {
            const item = { index, value: tag };

            return (
              <span {...api.getItemProps(item)} className={tagsInputParts.item} key={`${tag}-${index}`}>
                {/* THE CHIP IS A TAG, composed rather than redrawn: see the contract's own header. */}
                <span
                  {...api.getItemPreviewProps(item)}
                  className={`${tagsInputParts.preview} ${tagParts.root}`}
                  data-removable=""
                >
                  <span
                    {...api.getItemTextProps(item)}
                    className={`${tagsInputParts.text} ${tagParts.label}`}
                  >
                    {tag}
                  </span>
                  {/* A real Button, like Tag's own remove control: state layer, focus ring, hit target. */}
                  <Button
                    {...api.getItemDeleteTriggerProps(item)}
                    aria-label={removeLabel}
                    className={`${tagsInputParts.remove} ${tagParts.remove}`}
                    iconOnly
                    size="sm"
                    variant="ghost"
                  >
                    <Icon name="close" />
                  </Button>
                </span>
                <input {...api.getItemInputProps(item)} className={tagsInputParts.itemInput} />
              </span>
            );
          })}
        </span>
        <input
          {...api.getInputProps()}
          aria-label={label}
          className={tagsInputParts.input}
          placeholder={placeholder}
        />
      </div>
      <input {...api.getHiddenInputProps()} className={tagsInputParts.hidden} />
    </div>
  );
}
