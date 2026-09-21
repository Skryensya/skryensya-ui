<script lang="ts">
  import { pinInput } from "@skryensya/core/machines";
  import { otpInputAttrs, otpInputContract } from "@skryensya/core/otp-input";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * OTP INPUT, a machine-backed enhancer over `@zag-js/pin-input`: the SAME machine the React
   * binding drives, through `@skryensya/core/machines`. Reads the authored segments (one real
   * `<input>` each, already in the markup) and patches on what `connect` returns; it renders no
   * structure of its own.
   */
  const root = getRoot();

  const label = root.querySelector<HTMLElement>(`.${otpInputContract.parts.label}`);
  const control = root.querySelector<HTMLElement>(`[${otpInputAttrs.control}]`);
  const segments = Array.from(root.querySelectorAll<HTMLInputElement>(`[${otpInputAttrs.segment}]`));
  const hiddenInput = root.querySelector<HTMLInputElement>(`[${otpInputAttrs.hiddenInput}]`);

  /* Captured once, before any patch can rewrite it, the same reason NumberField/Rating capture
     their own id up front. */
  const machineId = root.id || uniqueId("sk-otp-input");

  const readBool = (attr: string) => root.hasAttribute(attr);
  const readString = (attr: string, fallback: string) => root.getAttribute(attr) ?? fallback;
  const segmentLabel = readString("data-item-label", otpInputContract.options.segmentLabel.default);

  const resolveSegmentLabel = (index: number, count: number): string =>
    segmentLabel.replace("{index}", String(index + 1)).replace("{count}", String(count));

  const defaultValueAttr = root.getAttribute("data-default-value");

  const service = useMachine(pinInput.machine, () => ({
    id: machineId,
    count: segments.length || otpInputContract.options.count.default,
    name: root.getAttribute("data-name") ?? undefined,
    type: (root.getAttribute("data-type") as "numeric" | "alphanumeric" | null) ?? undefined,
    mask: readBool("data-mask"),
    /* Same rule the contract states: this family defaults `otp` ON. Only an explicit
       `data-otp="false"` turns off SMS autofill and the numeric keypad it forces on mobile. */
    otp: root.getAttribute("data-otp") !== "false",
    placeholder: root.getAttribute("data-placeholder") ?? undefined,
    disabled: readBool("data-disabled"),
    readOnly: readBool("data-readonly"),
    required: root.hasAttribute("required"),
    invalid: readBool("data-invalid"),
    ...(defaultValueAttr ? { defaultValue: defaultValueAttr.split("") } : {}),
    translations: {
      inputLabel: (index: number, length: number) => resolveSegmentLabel(index, length),
    },
    onValueChange(details: { value: string[] }) {
      root.dispatchEvent(
        new CustomEvent("sk:otpinputvaluechange", { bubbles: true, detail: { value: details.value.join("") } }),
      );
    },
    onValueComplete(details: { value: string[]; valueAsString: string }) {
      root.dispatchEvent(
        new CustomEvent("sk:otpinputvaluecomplete", { bubbles: true, detail: { value: details.valueAsString } }),
      );
    },
    onValueInvalid(details: { value: string; index: number }) {
      root.dispatchEvent(
        new CustomEvent("sk:otpinputinvalid", { bubbles: true, detail: { char: details.value, index: details.index } }),
      );
    },
  }));

  const api = $derived(pinInput.connect(service, normalizeProps));

  /* All or nothing: the same rule NumberField and Rating both state. An incomplete root (missing
     its label, its control, its hidden input, or with zero segments) binds nothing. */
  const parts =
    label && control && hiddenInput && segments.length > 0 ? { label, control, hiddenInput, segments } : null;

  const bindings: PartBinding[] = [
    { part: "root", node: () => (parts ? root : null), props: () => api.getRootProps() },
    { part: "label", node: () => parts?.label, props: () => api.getLabelProps() },
    { part: "control", node: () => parts?.control, props: () => api.getControlProps() },
    { part: "hiddenInput", node: () => parts?.hiddenInput, props: () => api.getHiddenInputProps() },
    ...segments.map(
      (segment, index): PartBinding => ({
        part: `segment-${index}`,
        node: () => (parts ? segment : null),
        props: () => api.getInputProps({ index }),
        events: true,
      }),
    ),
  ];

  bindParts(bindings);
</script>
