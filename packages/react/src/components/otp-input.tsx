import { pinInput } from "@skryensya/core/machines";
import { otpInputContract, otpInputEvents, otpInputParts, type OtpInputType } from "@skryensya/core/otp-input";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useRef, type ReactNode } from "react";

/* Derived, never restated: the defaults live in the contract. */
const {
  count: countOption,
  mask: maskOption,
  otp: otpOption,
  placeholder: placeholderOption,
  segmentLabel: segmentLabelOption,
  type: typeOption,
} = otpInputContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type OtpInputProps = {
  id?: string;
  name?: string;
  /** Names the control. A row of segments announces nothing on its own. */
  label: string;
  hint?: ReactNode;
  count?: number;
  type?: OtpInputType;
  mask?: boolean;
  /** `autocomplete="one-time-code"` and a numeric keypad on mobile. On by default; see the contract. */
  otp?: boolean;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  segmentLabel?: string;
  className?: string;
  onValueChange?: (details: { value: string }) => void;
  onValueComplete?: (details: { value: string }) => void;
  onValueInvalid?: (details: { char: string; index: number }) => void;
};

/** Renders `label`/`{index}`/`{count}` placeholders into a segment's own accessible name. */
function resolveSegmentLabel(pattern: string, index: number, count: number): string {
  return pattern.replace("{index}", String(index + 1)).replace("{count}", String(count));
}

export function OtpInput({
  className,
  count = countOption.default,
  defaultValue,
  disabled,
  hint,
  id,
  invalid,
  label,
  mask = maskOption.default,
  name,
  onValueChange,
  onValueComplete,
  onValueInvalid,
  otp = otpOption.default,
  placeholder = placeholderOption.default,
  readOnly,
  required,
  segmentLabel = segmentLabelOption.default,
  type = typeOption.default,
  value,
}: OtpInputProps) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const hintId = hint ? `${resolvedId}-hint` : undefined;

  /*
   * SPLIT TO AN ARRAY GOING IN, JOINED TO A STRING COMING OUT. The contract's own `value`/
   * `defaultValue` are one string ("123456"), which is what an author types and what a server
   * returns; the machine wants one entry per segment. The seam is here, not in the contract, so
   * every consumer of this component still reads and writes a single field.
   */
  const service = useMachine(pinInput.machine, {
    id: resolvedId,
    name,
    count,
    type,
    mask,
    otp,
    placeholder,
    disabled,
    readOnly,
    required,
    invalid,
    ...(value === undefined ? {} : { value: value.split("") }),
    ...(defaultValue === undefined ? {} : { defaultValue: defaultValue.split("") }),
    translations: {
      inputLabel: (index, length) => resolveSegmentLabel(segmentLabel, index, length),
    },
    onValueChange(details) {
      const joined = details.value.join("");
      onValueChange?.({ value: joined });
      rootRef.current?.dispatchEvent(
        new CustomEvent(otpInputEvents.valueChange, { bubbles: true, detail: { value: joined } }),
      );
    },
    onValueComplete(details) {
      onValueComplete?.({ value: details.valueAsString });
      rootRef.current?.dispatchEvent(
        new CustomEvent(otpInputEvents.valueComplete, {
          bubbles: true,
          detail: { value: details.valueAsString },
        }),
      );
    },
    onValueInvalid(details) {
      onValueInvalid?.({ char: details.value, index: details.index });
      rootRef.current?.dispatchEvent(
        new CustomEvent(otpInputEvents.invalid, {
          bubbles: true,
          detail: { char: details.value, index: details.index },
        }),
      );
    },
  });
  const api = pinInput.connect(service, normalizeProps);

  return (
    <div
      {...api.getRootProps()}
      aria-describedby={hintId}
      className={cx(otpInputParts.root, className)}
      ref={rootRef}
    >
      <label {...api.getLabelProps()} className={otpInputParts.label}>
        {label}
      </label>
      <div {...api.getControlProps()} className={otpInputParts.control}>
        {/* `count`, not `api.items`: pin-input's own `connect()` exposes no items array, unlike
            rating-group's. The segment count is what THIS binding was given, same source the
            contract's own emitter reads for authored markup. */}
        {Array.from({ length: count }, (_, index) => (
          <input
            {...api.getInputProps({ index })}
            className={`${otpInputParts.segment} sk-interactive`}
            // eslint-disable-next-line react/no-array-index-key -- segments have no other identity
            key={index}
          />
        ))}
      </div>
      <input {...api.getHiddenInputProps()} className={otpInputParts.hiddenInput} />
      {hint ? (
        <span className={otpInputParts.hint} id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
