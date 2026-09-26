import {
  CLIPBOARD_COPIED_EVENT,
  clipboardAttrs,
  clipboardContract,
  clipboardEvents,
  clipboardParts,
  readClipboardTarget,
  writeClipboard,
  type ClipboardOptions,
  type ClipboardStatus,
} from "@skryensya/core/clipboard";
import { clipboard } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useAnchored } from "./anchored.js";
import { Icon } from "./icon.js";

export type { ClipboardStatus } from "@skryensya/core/clipboard";

const {
  copiedLabel: copiedLabelOption,
  errorLabel: errorLabelOption,
  label: labelOption,
  size: sizeOption,
  timeout: timeoutOption,
  variant: variantOption,
} = clipboardContract.options;

type SharedProps = {
  id?: string;
  /** The button's accessible name at rest. Say WHAT is copied when a page has several. */
  label?: string;
  copiedLabel?: string;
  errorLabel?: string;
  /** How long, in ms, "Copied" (or "Copy failed") lasts. */
  timeout?: number;
  /** Every change: `copied` on the click, `error` if the browser refused the write, `idle` after. */
  onStatusChange?: (status: ClipboardStatus) => void;
};

export type CopyButtonProps = SharedProps & {
  /** What is copied. */
  value?: string;
  /** Or the id of the element whose text is copied, read at the moment of the click. Wins over `value`. */
  target?: string;
  size?: ClipboardOptions["size"];
  variant?: ClipboardOptions["variant"];
};

export type ClipboardProps = SharedProps & {
  /** What is copied, and what the field shows. */
  value: string;
  /** What the value is ("Share link"). Visible, and the field's name. */
  fieldLabel: ReactNode;
};

/*
 * THE SHARED HALF: the machine, the write, and the status. The same contract the Vanilla enhancer
 * keeps (Clipboard.svelte): Zag owns the copied state and its timer, the click writes with core's
 * `writeClipboard` and tells the machine with `INPUT.COPY`, and a refused write shows as `error`
 * for as long as the copied state lasts.
 */
function useClipboard(options: {
  id: string;
  rootId?: string;
  value: string;
  target?: string;
  label: string;
  copiedLabel: string;
  errorLabel: string;
  timeout: number;
  onStatusChange?: (status: ClipboardStatus) => void;
}) {
  const [failed, setFailed] = useState(false);
  const service = useMachine(clipboard.machine, {
    id: options.id,
    ids: { root: options.rootId },
    value: options.value,
    timeout: options.timeout,
    translations: { triggerLabel: (copied: boolean) => (copied ? options.copiedLabel : options.label) },
  });
  const api = clipboard.connect(service, normalizeProps);
  const status: ClipboardStatus = !api.copied ? "idle" : failed ? "error" : "copied";

  /* Reported once per change, and on the DOM too, the event the enhancer dispatches. */
  const trigger = useRef<HTMLButtonElement>(null);
  const reported = useRef<ClipboardStatus>("idle");
  const onStatusChange = useRef(options.onStatusChange);
  onStatusChange.current = options.onStatusChange;
  useEffect(() => {
    if (status === reported.current) return;
    reported.current = status;
    onStatusChange.current?.(status);
    const host = trigger.current?.closest(`[${clipboardAttrs.root}]`) ?? trigger.current;
    host?.dispatchEvent(new CustomEvent(clipboardEvents.statusChange, { bubbles: true, detail: { status } }));
  }, [status]);

  const copy = () => {
    const text = options.target
      ? readClipboardTarget(trigger.current?.ownerDocument ?? document, options.target)
      : api.value;
    setFailed(false);
    service.send(CLIPBOARD_COPIED_EVENT);
    if (!text) {
      setFailed(true);
      return;
    }
    void writeClipboard(text).then((copied) => {
      if (!copied) setFailed(true);
    });
  };

  return { api, status, copy, trigger };
}

/** The button: glyphs, live region and flag. Shared by both signatures. */
function Trigger({
  clip,
  id,
  label,
  copiedLabel,
  errorLabel,
  size,
  variant,
  root,
  target,
  value,
}: {
  clip: ReturnType<typeof useClipboard>;
  id: string;
  label: string;
  copiedLabel: string;
  errorLabel: string;
  size: string;
  variant: string;
  root?: boolean;
  target?: string;
  value?: string;
}) {
  const anchored = useAnchored(id);
  const { onClick: _machineCopy, ...triggerProps } = clip.api.getTriggerProps();
  const error = clip.status === "error";
  const anchor = anchored.anchor(`${clipboardParts.trigger} sk-button sk-interactive sk-icon-toggle`);
  const flag = anchored.positioner({}, clipboardParts.feedback);
  return (
    <button
      {...triggerProps}
      {...anchor}
      {...(root ? { [clipboardAttrs.root]: "" } : {})}
      {...{ [clipboardAttrs.trigger]: "" }}
      aria-label={error ? errorLabel : triggerProps["aria-label"]}
      data-error={error ? "" : undefined}
      data-icon-only=""
      data-size={size}
      data-target={target}
      data-variant={variant}
      id={id}
      onClick={clip.copy}
      ref={clip.trigger}
      type="button"
      value={value}
    >
      <span aria-hidden="true" className={clipboardParts.face} data-face="idle">
        <Icon name="copy" />
      </span>
      <span aria-hidden="true" className={clipboardParts.face} data-face="copied">
        <Icon name="check" />
      </span>
      <span aria-live="polite" className={clipboardParts.status}>
        {clip.status === "copied" ? copiedLabel : error ? errorLabel : ""}
      </span>
      <span
        {...flag}
        aria-hidden="true"
        data-sk-placement="inline-start"
        data-state={clip.api.copied ? "open" : undefined}
      >
        <span {...{ [clipboardAttrs.feedbackText]: "copied" }}>{copiedLabel}</span>
        <span {...{ [clipboardAttrs.feedbackText]: "error" }}>{errorLabel}</span>
        <span aria-hidden="true" className="sk-anchored-arrow" />
      </span>
    </button>
  );
}

/** Copies a value, or the text of another element, with one click. */
export function CopyButton({
  id,
  value = "",
  target,
  label = labelOption.default,
  copiedLabel = copiedLabelOption.default,
  errorLabel = errorLabelOption.default,
  timeout = timeoutOption.default,
  size = sizeOption.default,
  variant = variantOption.default,
  onStatusChange,
}: CopyButtonProps) {
  const generatedId = useId();
  const triggerId = id ?? `sk-copy-button-${generatedId.replace(/:/g, "")}`;
  const clip = useClipboard({
    id: triggerId,
    value,
    target,
    label,
    copiedLabel,
    errorLabel,
    timeout,
    onStatusChange,
  });
  return (
    <Trigger
      clip={clip}
      copiedLabel={copiedLabel}
      errorLabel={errorLabel}
      id={triggerId}
      label={label}
      root
      size={size}
      target={target}
      value={value || undefined}
      variant={variant}
    />
  );
}

/** A value in a read-only field, with the copy button beside it: a share link, an API key. */
export function Clipboard({
  id,
  value,
  fieldLabel,
  label = labelOption.default,
  copiedLabel = copiedLabelOption.default,
  errorLabel = errorLabelOption.default,
  timeout = timeoutOption.default,
  onStatusChange,
}: ClipboardProps) {
  const generatedId = useId();
  const rootId = id ?? `sk-clipboard-${generatedId.replace(/:/g, "")}`;
  const clip = useClipboard({
    id: rootId,
    rootId,
    value,
    label,
    copiedLabel,
    errorLabel,
    timeout,
    onStatusChange,
  });
  /* Controlled below: the field always shows the current value, never Zag's initial one. */
  const { defaultValue: _initial, ...inputProps } = clip.api.getInputProps();
  return (
    <div {...clip.api.getRootProps()} className={clipboardParts.root} {...{ [clipboardAttrs.root]: "" }}>
      <label {...clip.api.getLabelProps()} className={clipboardParts.label}>
        {fieldLabel}
      </label>
      <div className={clipboardParts.control}>
        <input
          {...inputProps}
          {...{ [clipboardAttrs.input]: "" }}
          className={`${clipboardParts.input} sk-input`}
          spellCheck={false}
          type="text"
          value={value}
        />
        <Trigger
          clip={clip}
          copiedLabel={copiedLabel}
          errorLabel={errorLabel}
          id={`${rootId}-trigger`}
          label={label}
          size="md"
          variant="soft"
        />
      </div>
    </div>
  );
}
