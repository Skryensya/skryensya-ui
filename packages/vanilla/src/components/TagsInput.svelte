<script lang="ts">
  import { tagsInput } from "@skryensya/core/machines";
  import { tagParts } from "@skryensya/core/tag";
  import { tagsInputAttrs, tagsInputContract, tagsInputEvents, tagsInputParts } from "@skryensya/core/tags-input";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onMount } from "svelte";
  import { remountIcons } from "../icon.js";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TAGS INPUT, a machine-backed enhancer over `@zag-js/tags-input`: the SAME machine the React
   * binding drives, through `@skryensya/core/machines`.
   *
   * IT RENDERS THE TAGS, and that is the deliberate exception this component shares with
   * FileUpload. The rule it bends ("an enhancer renders nothing") is about AUTHORED STRUCTURE:
   * markup a person wrote, which an enhancer has no business replacing. The tags are not that. They
   * are the VALUE, written into the markup so the field is readable before its JavaScript arrives,
   * and the moment somebody types one there is no authored element for it to be. Patching alone
   * would give the vanilla binding a field that can delete tags and never add one.
   *
   * So the authored list is read for its values, and then replaced, once, by the live one: the
   * `items` node exists in the contract for exactly this, and `replaceWith` is what hands the seed
   * over to the machine in a single operation instead of emptying a node and filling it again.
   */
  const root = getRoot();

  const control = root.querySelector<HTMLElement>(`[${tagsInputAttrs.control}]`);
  const authoredList = root.querySelector<HTMLElement>(`[${tagsInputAttrs.list}]`);
  const input = root.querySelector<HTMLInputElement>(`[${tagsInputAttrs.input}]`);
  const hidden = root.querySelector<HTMLInputElement>(`[${tagsInputAttrs.hidden}]`);

  /* The live list, swapped in for the authored one below. */
  let renderedList = $state<HTMLElement | null>(null);

  /* Captured once, before any patch can rewrite them. Same reason Rating captures its own id. */
  const machineId = root.id || uniqueId("sk-tags-input");
  const authoredLabel = input?.getAttribute("aria-label") ?? undefined;

  /* The seed: the tags the author wrote, in the order they wrote them. */
  const defaultValue = Array.from(
    authoredList?.querySelectorAll<HTMLElement>(`[${tagsInputAttrs.item}]`) ?? [],
  )
    .map((item) => item.dataset.value ?? "")
    .filter((value) => value !== "");

  const removeLabel =
    root.querySelector<HTMLElement>(`[${tagsInputAttrs.remove}]`)?.getAttribute("aria-label") ??
    tagsInputContract.options.removeLabel.default;

  const numberOf = (value: string | null) => (value === null || value === "" ? undefined : Number(value));

  const service = useMachine(tagsInput.machine, () => ({
    id: machineId,
    name: root.getAttribute("data-name") ?? undefined,
    /*
     * SPREAD, NOT `defaultValue: undefined`. `@zag-js/core`'s `bindable` decides controlled from the
     * presence of the KEY, not from the value being defined. The React binding carries the same
     * note, and it was measured against the machine rather than guessed.
     */
    ...(defaultValue.length === 0 ? {} : { defaultValue }),
    ...(numberOf(root.getAttribute("data-max")) === undefined
      ? {}
      : { max: numberOf(root.getAttribute("data-max")) }),
    delimiter: root.getAttribute("data-delimiter") ?? tagsInputContract.options.delimiter.default,
    allowDuplicates: root.hasAttribute("data-allow-duplicates"),
    /* The only option whose attribute means the NEGATIVE: `editable` is on unless it says otherwise. */
    editable: root.getAttribute("data-editable") !== "false",
    disabled: root.hasAttribute("data-disabled"),
    readOnly: root.hasAttribute("data-readonly"),
    invalid: root.hasAttribute("data-invalid"),
    required: root.hasAttribute("data-required"),
    onValueChange(details: { value: string[] }) {
      root.dispatchEvent(
        new CustomEvent(tagsInputEvents.valueChange, { bubbles: true, detail: { value: details.value } }),
      );
    },
  }));

  const api = $derived(tagsInput.connect(service, normalizeProps));

  /*
   * THE HAND-OVER, once. After it the authored seed is gone and the machine owns the list; doing it
   * on mount rather than in an effect keeps it from running again on every state change.
   */
  onMount(() => {
    if (authoredList && renderedList) authoredList.replaceWith(renderedList);
  });

  /* The rendered rows carry `data-sk-icon` placeholders; the page's own icon set upgrades them. */
  $effect(() => {
    void api.value.length;
    remountIcons(root);
  });

  /* All or nothing, the rule NumberField's comment spells out: an incomplete root binds nothing. */
  const parts = control && input && hidden ? { control, input, hidden } : null;

  const bindings: PartBinding[] = [
    { part: "root", node: () => (parts ? root : null), props: () => api.getRootProps() },
    { part: "control", node: () => parts?.control, props: () => api.getControlProps(), events: true },
    {
      part: "input",
      node: () => parts?.input,
      /* The authored name is restored over the machine's own props: without it the entry, which is
         the control a reader actually lands on, has no accessible name at all. */
      props: () => ({ ...api.getInputProps(), "aria-label": authoredLabel }),
      events: true,
    },
    { part: "hidden", node: () => parts?.hidden, props: () => api.getHiddenInputProps() },
  ];

  bindParts(bindings);
</script>

<!--
  THE LIVE LIST. It is mounted here, at the end of the root, and moved into the control on mount
  (see the hand-over above): a Svelte component renders where it is mounted, and where these belong
  is inside the field, before the entry.
-->
<span bind:this={renderedList} class={tagsInputParts.list} {...{ [tagsInputAttrs.list]: "" }}>
  {#each api.value as tag, index (`${tag}-${index}`)}
    <span {...api.getItemProps({ index, value: tag })} class={tagsInputParts.item}>
      <!-- The chip IS a Tag, composed rather than redrawn: see the contract's own header. -->
      <span
        {...api.getItemPreviewProps({ index, value: tag })}
        class="{tagsInputParts.preview} {tagParts.root}"
        data-removable=""
      >
        <span {...api.getItemTextProps({ index, value: tag })} class="{tagsInputParts.text} {tagParts.label}">
          {tag}
        </span>
        <!-- The same system-owned Button + close icon the emitted markup writes, and that Tag's own
             remove control is: the state layer, the focus ring and the hit target come with it. -->
        <button
          {...api.getItemDeleteTriggerProps({ index, value: tag })}
          class="{tagsInputParts.remove} {tagParts.remove} sk-button sk-interactive"
          aria-label={removeLabel}
          type="button"
          data-variant="ghost"
          data-tone="neutral"
          data-size="sm"
          data-icon-only=""
          data-sk-button=""
        >
          <span data-sk-icon="close" data-sk-icon-size="md"></span>
        </button>
      </span>
      <input {...api.getItemInputProps({ index, value: tag })} class={tagsInputParts.itemInput} />
    </span>
  {/each}
</span>
