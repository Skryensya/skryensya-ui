<script lang="ts">
  import {
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import {
    selectAttrs,
    selectEvents,
    selectPositioning,
    type SelectOption,
    type SelectValueChangeDetails,
  } from "@skryensya/core/select";
  import { select } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy } from "svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import { selectorsFor } from "@skryensya/core/selectors";

  /*
   * SELECT, a machine-backed enhancer over `@zag-js/select` (the SAME machine React uses, via
   * `@skryensya/core/machines`). It renders no structure: it scans its authored markup (label,
   * control, trigger, positioner, content, items, and the optional hidden `<select>`) and patches the
   * attributes `connect` returns onto those nodes.
   *
   * There is no native equivalent for a listbox with typeahead, highlighting and controlled placement
   * (decision 8), so a machine earns its place, the same one React uses.
   */
  const root = getRoot();

  /* Derived from the contract's own mount attributes; see `selectorsFor`. */
  const selector = selectorsFor(selectAttrs);

  const trigger = root.querySelector<HTMLElement>(selector.trigger);
  const valueEl = root.querySelector<HTMLElement>(selector.value);
  const content = root.querySelector<HTMLElement>(selector.content);
  const positioner = root.querySelector<HTMLElement>(selector.positioner);
  const itemEls = Array.from(root.querySelectorAll<HTMLElement>(selector.item));

  if (!trigger) throw new Error("Select requires a [data-sk-select-trigger] element.");
  if (!content) throw new Error("Select requires a [data-sk-select-content] element.");
  if (itemEls.length === 0) throw new Error("Select requires at least one [data-sk-select-item].");

  function readItem(el: HTMLElement): SelectOption {
    const value = el.dataset.value;
    if (!value) throw new Error("Every [data-sk-select-item] needs a non-empty data-value.");

    const text = el.querySelector<HTMLElement>(selector.itemText) ?? el;

    return {
      value,
      label: text.textContent?.trim() || value,
      disabled: el.hasAttribute("data-disabled"),
    };
  }

  /*
   * The hidden select is optional, it is what makes the menu submit inside a form, and what a no-JS
   * visitor is left with. When it is there it must agree with the items, because two authored lists
   * that drift render a menu that submits a different value than it shows.
   */
  function assertHiddenSelectMatches(hidden: HTMLSelectElement, items: readonly SelectOption[]): void {
    const authored = Array.from(hidden.options).map((option) => option.value);
    const expected = items.map((item) => item.value);

    if (authored.join(" ") !== expected.join(" ")) {
      throw new Error(
        `Select hidden select drifted from its items: [${authored.join(", ")}] vs [${expected.join(", ")}].`,
      );
    }
  }

  const items = itemEls.map(readItem);
  const hidden = root.querySelector<HTMLSelectElement>(selector.hidden);
  if (hidden) assertHiddenSelectMatches(hidden, items);

  const collection = select.collection<SelectOption>({
    items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    isItemDisabled: (item) => Boolean(item.disabled),
  });

  const placeholder = root.dataset.placeholder ?? "";
  // Captured ONCE, never re-read from the DOM: `getRootProps().id` returns a namespaced id
  // (`select:${id}`) that `applyZagProps` writes back onto `root.id`. Reading `root.id` live from
  // `useMachine`'s reactive factory would feed that prefix back on every recomputation. The imperative
  // original never mutated `root.id`; this reproduces the same thing.
  const selectId = root.id || uniqueId("sk-select");

  // PROGRESSIVE ENHANCEMENT: when the browser has the CSS Anchor Positioning API, the placement lives
  // in select.css (behind the same @supports); the only thing that cannot live in shared CSS is the
  // anchor↔popup relationship: a name unique to this instance that ties THIS trigger to THIS listbox.
  // Where the API is missing, `anchorName` is null and Zag's JS placement (configured below) is the
  // only one; the fallback, not a second-class path.
  const anchorName = supportsAnchorPositioning() ? anchorNameFor(selectId) : null;
  let unbindAnchor: (() => void) | undefined;

  /* Only the parts the consumer gave an id to; the rest still belong to the machine. */
  function authoredIds(): Record<string, string> {
    const ids: Record<string, string> = {};
    const claim = (key: string, el: HTMLElement | null) => {
      if (el?.id) ids[key] = el.id;
    };

    claim("root", root);
    claim("trigger", trigger);
    claim("content", content);
    claim("hiddenSelect", hidden);
    claim("control", root.querySelector(selector.control));
    claim("label", root.querySelector(selector.label));
    claim("positioner", root.querySelector(selector.positioner));

    return ids;
  }

  const readDefaultValue = (): string[] | undefined => {
    const value = root.dataset.value;
    return value ? [value] : undefined;
  };

  // Captured ONCE, before the machine writes anything: reading this live inside the reactive factory
  // would start claiming as "authored" the ids the machine itself generated on the first render.
  const ids = authoredIds();

  const service = useMachine(select.machine, () => ({
    id: selectId,
    // Authored ids win. Left to itself the machine derives its own (`select:brand`) and spreads
    // them over whatever the consumer wrote, so an id they authored would silently change the
    // moment this mounts.
    ids,
    collection,
    name: hidden?.name ?? root.dataset.name,
    disabled: root.hasAttribute("data-disabled"),
    required: root.hasAttribute("data-required"),
    defaultValue: readDefaultValue(),
    /* Shared with React (`selectPositioning`); `boundary` stays here because it is a DOM lookup and
     * the shared const holds no DOM. */
    positioning: { ...selectPositioning, boundary: root.closest("dialog") ? document.documentElement : undefined },
    onValueChange(details: { value: string[] }) {
      const change: SelectValueChangeDetails = { value: details.value };
      root.dispatchEvent(
        new CustomEvent<SelectValueChangeDetails>(selectEvents.valueChange, { bubbles: true, detail: change }),
      );
    },
  }));

  const api = $derived(select.connect(service, normalizeProps));

  // Hoisted out of the patch: these are authored markup, so they are found once rather than re-queried
  // on every state change.
  const labelEl = root.querySelector<HTMLElement>(selector.label);
  const controlEl = root.querySelector<HTMLElement>(selector.control);
  const indicatorEl = root.querySelector<HTMLElement>(selector.indicator);

  const bindings: PartBinding[] = [
    { part: "root", node: () => root, props: () => api.getRootProps() },
    { part: "hiddenSelect", node: () => hidden, props: () => api.getHiddenSelectProps() },
    { part: "label", node: () => labelEl, props: () => api.getLabelProps() },
    { part: "control", node: () => controlEl, props: () => api.getControlProps() },
    { part: "trigger", node: () => trigger, props: () => api.getTriggerProps(), events: true },
    {
      part: "valueText",
      node: () => valueEl,
      props: () => api.getValueTextProps(),
      after: (node) => {
        /* The displayed value is the machine's, it changes on every selection, so this is the one
         * place this writes CONTENT rather than attributes. The placeholder is still theirs. */
        node.textContent = api.valueAsString || placeholder;
      },
    },
    { part: "indicator", node: () => indicatorEl, props: () => api.getIndicatorProps() },
    {
      part: "positioner",
      node: () => positioner,
      // On the anchor path, CSS owns placement (select.css), so drop Zag's inline positioning styles
      // entirely; leaving them would fight the browser's positioner.
      props: () => {
        const props = api.getPositionerProps();
        return anchorName ? stripPositioningStyle(props) : props;
      },
      after: (node) => {
        // Re-asserted HERE, not once at mount: the positioner's patch rewrites its inline style on
        // every render, dropping the hook set earlier. Stamping right after keeps it stable across
        // every open/close; idempotent, so it is free to repeat.
        if (anchorName) unbindAnchor = bindAnchor(trigger, node, anchorName);
      },
    },
    { part: "content", node: () => content, props: () => api.getContentProps(), events: true },

    ...itemEls.flatMap((el, index): PartBinding[] => {
      const item = items[index]!;
      return [
        {
          part: "item",
          node: () => el,
          events: true,
          /*
           * Zag's `aria-selected` tracks the COMMITTED value, not the row under
           * `aria-activedescendant`. The WAI reference implementation moves `aria-selected="true"`
           * onto whichever option is highlighted as you arrow through the list, before Enter commits
           * anything.
           *
           * Spread into a new object rather than mutated in place: the correction is the same, and a
           * fresh plain object is what lets this stay free of casts.
           */
          props: () => ({
            ...api.getItemProps({ item }),
            "aria-selected": item.value === api.highlightedValue ? "true" : undefined,
          }),
        },
        {
          part: "itemText",
          node: () => el.querySelector<HTMLElement>(selector.itemText),
          props: () => api.getItemTextProps({ item }),
        },
        {
          part: "itemIndicator",
          node: () => el.querySelector<HTMLElement>(selector.itemIndicator),
          props: () => api.getItemIndicatorProps({ item }),
        },
      ];
    }),
  ];

  bindParts(bindings);

  onDestroy(() => unbindAnchor?.());
</script>
