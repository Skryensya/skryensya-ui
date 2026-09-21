<script lang="ts">
  import { ratingGroup } from "@skryensya/core/machines";
  import { ratingAttrs, ratingContract, ratingEvents } from "@skryensya/core/rating";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * RATING, a machine-backed enhancer over `@zag-js/rating-group`: the SAME machine the React
   * binding drives, through `@skryensya/core/machines`. It renders no structure. The authored markup
   * already has one radio per step, and this scans it and patches on what `connect` returns.
   *
   * ONLY THE INPUT SIGNATURE IS ENHANCED. `RatingDisplay` has no machine and needs none: its whole
   * state is the value the emitter already wrote into `--sk-rating-value`, which the stylesheet
   * turns into a colour stop on its own, so there is nothing for an enhancer to do to it and no
   * selector here that would match it.
   */
  const root = getRoot();

  const control = root.querySelector<HTMLElement>(`[${ratingAttrs.control}]`);
  const items = Array.from(root.querySelectorAll<HTMLElement>(`[${ratingAttrs.item}]`));
  const hidden = root.querySelector<HTMLInputElement>(`[${ratingAttrs.input}]`);

  /* Captured once, before any patch can rewrite them. Same reason NumberField captures its id. */
  const machineId = root.id || uniqueId("sk-rating");
  const authoredLabel = control?.getAttribute("aria-label") ?? undefined;

  const numberOf = (value: string | null) => (value === null || value === "" ? undefined : Number(value));
  const defaultValue = numberOf(root.getAttribute("data-default-value"));
  const itemLabel = root.getAttribute("data-item-label") ?? ratingContract.options.itemLabel.default;

  const service = useMachine(ratingGroup.machine, () => ({
    id: machineId,
    count: items.length || ratingContract.options.max.default,
    name: root.getAttribute("data-name") ?? undefined,
    /*
     * SPREAD, NOT `defaultValue: undefined`. `@zag-js/core`'s `bindable` decides controlled from the
     * presence of the KEY, not from the value being defined, so handing it an undefined `value` pins
     * the rating at its initial number forever while still firing `onValueChange`. The React binding
     * carries the same note; it was measured against the machine, not guessed.
     */
    ...(defaultValue === undefined ? {} : { defaultValue }),
    disabled: root.hasAttribute("data-disabled"),
    readOnly: root.hasAttribute("data-readonly"),
    allowHalf: false,
    translations: {
      ratingValueText: (index: number) => itemLabel.replace("{value}", String(index)),
    },
    onValueChange(details: { value: number }) {
      root.dispatchEvent(
        new CustomEvent(ratingEvents.valueChange, { bubbles: true, detail: { value: details.value } }),
      );
    },
  }));

  const api = $derived(ratingGroup.connect(service, normalizeProps));

  /* All or nothing, the rule NumberField's own comment spells out: an incomplete root binds nothing
     rather than getting live listeners and no attributes. */
  const parts = control && items.length > 0 && hidden ? { control, items, hidden } : null;

  const bindings: PartBinding[] = [
    { part: "root", node: () => (parts ? root : null), props: () => api.getRootProps() },
    {
      part: "control",
      node: () => parts?.control,
      /* The machine points `aria-labelledby` at a label element this layer never renders, so the
         authored `aria-label` is restored over it. Without this the group has no accessible name. */
      props: () => ({ ...api.getControlProps(), "aria-labelledby": undefined, "aria-label": authoredLabel }),
      events: true,
    },
    ...items.map(
      (item, index): PartBinding => ({
        part: `item-${index + 1}`,
        node: () => (parts ? item : null),
        /* `aria-roledescription="rating"` is Zag's, in English, and not overridable through its own
           translations. Dropped rather than mistranslated: `role="radio"` inside a named group
           already says everything it added. */
        props: () => ({ ...api.getItemProps({ index: index + 1 }), "aria-roledescription": undefined }),
        events: true,
      }),
    ),
    { part: "input", node: () => parts?.hidden, props: () => api.getHiddenInputProps() },
  ];

  bindParts(bindings);
</script>
