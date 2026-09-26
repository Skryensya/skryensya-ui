<script lang="ts">
  import { passwordInput } from "@skryensya/core/machines";
  import {
    isKeyboardClick,
    passwordInputAttrs,
    passwordInputContract,
    passwordInputEvents,
    passwordInputParts,
  } from "@skryensya/core/password-input";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * PASSWORD INPUT, a machine-backed enhancer over `@zag-js/password-input` (the SAME machine React
   * uses, via `@skryensya/core/machines`). It renders no structure: it scans its authored markup and
   * patches the attributes `connect` returns onto those nodes. NumberField.svelte's shape, part for
   * part.
   */
  const root = getRoot();

  const label = root.querySelector<HTMLElement>(`[${passwordInputAttrs.label}]`);
  const control = root.querySelector<HTMLElement>(`[${passwordInputAttrs.control}]`);
  const input = root.querySelector<HTMLInputElement>(`[${passwordInputAttrs.input}]`);
  const trigger = root.querySelector<HTMLButtonElement>(`[${passwordInputAttrs.visibilityTrigger}]`);
  const hint = root.querySelector<HTMLElement>(`.${passwordInputParts.hint}`);

  // Captured ONCE, for NumberField's reason: `getRootProps().id` would feed a prefixed id back in.
  const machineId = root.id || uniqueId("sk-password-input");
  if (hint && !hint.id) hint.id = `${machineId}-hint`;
  const authoredDescribedBy = input?.getAttribute("aria-describedby") ?? undefined;
  const describedBy = [authoredDescribedBy, hint?.id].filter(Boolean).join(" ") || undefined;

  /* Read before the machine rewrites `aria-label`: after the first patch it holds whichever is current. */
  const { showLabel, hideLabel, autoComplete } = passwordInputContract.options;
  const showText = trigger?.getAttribute("aria-label") ?? showLabel.default;
  const hideText = trigger?.getAttribute(passwordInputAttrs.hideLabel) ?? hideLabel.default;
  const authoredAutoComplete = input?.getAttribute("autocomplete");

  const service = useMachine(passwordInput.machine, () => ({
    id: machineId,
    name: input?.name || undefined,
    autoComplete:
      authoredAutoComplete === "new-password" || authoredAutoComplete === "current-password"
        ? authoredAutoComplete
        : autoComplete.default,
    defaultVisible: root.hasAttribute(passwordInputAttrs.defaultVisible),
    ignorePasswordManagers: root.hasAttribute(passwordInputAttrs.ignorePasswordManagers),
    disabled: input?.disabled,
    readOnly: input?.readOnly,
    required: input?.required,
    invalid: root.hasAttribute("data-invalid"),
    translations: { visibilityTrigger: (shown: boolean) => (shown ? hideText : showText) },
    onVisibilityChange(details: { visible: boolean }) {
      root.dispatchEvent(
        new CustomEvent(passwordInputEvents.visibilityChange, { bubbles: true, detail: { visible: details.visible } }),
      );
    },
  }));

  const api = $derived(passwordInput.connect(service, normalizeProps));

  /* All or nothing, NumberField's rule: an incomplete root binds nothing at all. */
  const parts = label && control && input && trigger ? { label, control, input, trigger } : null;

  const bindings: PartBinding[] = [
    { part: "root", node: () => (parts ? root : null), props: () => api.getRootProps() },
    { part: "label", node: () => parts?.label, props: () => api.getLabelProps() },
    { part: "control", node: () => parts?.control, props: () => api.getControlProps() },
    {
      part: "input",
      node: () => parts?.input,
      props: () => ({ ...api.getInputProps(), "aria-describedby": describedBy }),
      events: true,
    },
    {
      part: "visibilityTrigger",
      node: () => parts?.trigger,
      /* The keyboard half Zag leaves out (see core/password-input.ts): a tab stop, and Enter/Space. */
      props: () => ({
        ...api.getVisibilityTriggerProps(),
        tabindex: 0,
        onclick(event: MouseEvent) {
          if (!api.disabled && !input?.readOnly && isKeyboardClick(event)) api.toggleVisible();
        },
      }),
      events: true,
    },
  ];

  bindParts(bindings);
</script>
