<script lang="ts">
  import { anchorNameFor, bindAnchor, supportsAnchorPositioning } from "@skryensya/core/anchored";
  import {
    CLIPBOARD_COPIED_EVENT,
    CLIPBOARD_DEFAULT_TIMEOUT,
    clipboardAttrs,
    clipboardEvents,
    readClipboardTarget,
    writeClipboard,
    type ClipboardStatus,
  } from "@skryensya/core/clipboard";
  import { clipboard } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy } from "svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * CLIPBOARD, over `@zag-js/clipboard` (the SAME machine React uses). Two authored shapes mount here:
   * `CopyButton`, where the root IS the button, and `Clipboard`, a root holding a label, a read-only
   * field and the button. It renders nothing; it patches Zag's props onto what is there.
   *
   * THE TRIGGER'S CLICK IS OURS, not Zag's: Zag's `COPY` writes and cannot fail, so the click writes
   * with core's `writeClipboard` and tells the machine with `INPUT.COPY` (see core/src/clipboard.ts).
   * Everything else, the copied state, its timer, the ids and the label's `for`, is the machine's.
   */
  const root = getRoot();
  const trigger = root.matches(`[${clipboardAttrs.trigger}]`)
    ? root
    : root.querySelector<HTMLElement>(`[${clipboardAttrs.trigger}]`);
  if (!trigger) throw new Error("Clipboard requires a [data-sk-clipboard-trigger] button.");
  const input = root.querySelector<HTMLInputElement>(`[${clipboardAttrs.input}]`);
  const label = root.querySelector<HTMLLabelElement>("label");
  const status = trigger.querySelector<HTMLElement>(`[${clipboardAttrs.status}]`);
  const flag = trigger.querySelector<HTMLElement>(`[${clipboardAttrs.feedback}]`);
  const flagText = (which: "copied" | "error") =>
    flag?.querySelector(`[${clipboardAttrs.feedbackText}="${which}"]`)?.textContent?.trim() || undefined;

  if (!root.id) root.id = uniqueId("sk-clipboard");
  if (!trigger.id) trigger.id = `${root.id}-trigger`;

  const idleLabel = trigger.getAttribute("aria-label") ?? "Copy";
  const copiedLabel = flagText("copied") ?? "Copied";
  const errorLabel = flagText("error") ?? "Copy failed";
  const timeout = Number.parseInt(root.getAttribute("data-timeout") ?? "", 10);
  const initialValue = input?.getAttribute("value") ?? trigger.getAttribute("value") ?? "";

  /* Whether the LAST write was refused. Only shown while the machine is in its copied state, so it
     never has to be reset: the next click clears it, and idle hides it. */
  let failed = $state(false);

  const service = useMachine(clipboard.machine, () => ({
    id: root.id,
    ids: {
      root: root === trigger ? undefined : root.id,
      input: input?.id || undefined,
      label: label?.id || undefined,
    },
    defaultValue: initialValue,
    timeout: Number.isFinite(timeout) ? timeout : CLIPBOARD_DEFAULT_TIMEOUT,
    translations: { triggerLabel: (copied: boolean) => (copied ? copiedLabel : idleLabel) },
  }));
  const api = $derived(clipboard.connect(service, normalizeProps));
  const current = $derived<ClipboardStatus>(!api.copied ? "idle" : failed ? "error" : "copied");

  const onClick = () => {
    const target = trigger.getAttribute("data-target");
    const text = target ? readClipboardTarget(document, target) : api.value;
    failed = false;
    /* Optimistic, as before: the check shows on the click, not after the permission prompt the
       write can wait on. A refusal corrects it a beat later. */
    service.send(CLIPBOARD_COPIED_EVENT);
    if (!text) {
      failed = true;
      return;
    }
    void writeClipboard(text).then((copied) => {
      if (!copied) failed = true;
    });
  };
  trigger.addEventListener("click", onClick);

  const unbindAnchor =
    flag && supportsAnchorPositioning() ? bindAnchor(trigger, flag, anchorNameFor(trigger.id)) : undefined;

  onDestroy(() => {
    trigger.removeEventListener("click", onClick);
    unbindAnchor?.();
  });

  let announced: ClipboardStatus = "idle";

  const bindings: PartBinding[] = [
    {
      part: "root",
      node: () => (root === trigger ? null : root),
      props: () => api.getRootProps(),
    },
    { part: "label", node: () => label, props: () => api.getLabelProps() },
    { part: "input", node: () => input, props: () => api.getInputProps(), events: true },
    {
      part: "trigger",
      node: () => trigger,
      /* Attributes only: `events` stays off so Zag's own click (the write that cannot fail) never runs. */
      props: () => api.getTriggerProps(),
      classes: ["sk-interactive"],
      after: (node) => {
        node.toggleAttribute(clipboardAttrs.error, current === "error");
        if (current === "error") node.setAttribute("aria-label", errorLabel);
      },
    },
  ];

  bindParts(bindings, {
    then: () => {
      if (flag) {
        if (api.copied) flag.setAttribute("data-state", "open");
        else flag.removeAttribute("data-state");
      }
      if (current === announced) return;
      announced = current;
      if (status) status.textContent = current === "copied" ? copiedLabel : current === "error" ? errorLabel : "";
      root.dispatchEvent(
        new CustomEvent(clipboardEvents.statusChange, { bubbles: true, detail: { status: current } }),
      );
    },
  });
</script>
