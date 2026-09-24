<script lang="ts">
  import {
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import { avatarParts } from "@skryensya/core/avatar";
  import { comboboxParts } from "@skryensya/core/combobox";
  import { select } from "@skryensya/core/machines";
  import { selectAttrs, selectParts, selectPositioning, type SelectOption } from "@skryensya/core/select";
  import { selectorsFor } from "@skryensya/core/selectors";
  import { userSelectAttrs, userSelectEvents, userSelectSearchKey } from "@skryensya/core/user-select";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * USER SELECT, a machine-backed enhancer over `@zag-js/select` (the SAME machine `Select.svelte`
   * uses, always `multiple: true` and `composite: false` here - see the React binding's own note on
   * why: it splits Zag's markup into a `role="dialog"` wrapper that can hold a real search field
   * (`content`, patched below) and a nested `role="listbox"` around the rows alone (`list`, generated
   * around whatever the author wrote).
   *
   * Every row stays hand-authored, avatar included: this enhancer never builds a row, it only reads
   * `data-value` / the item-text node / `data-email` off it, same as `Select.svelte` reads its own
   * items. The ONE thing it renders is the trigger's live avatar summary, because that has no
   * authored form (it changes with the selection) - and even that clones the AUTHORED avatar off the
   * matching row rather than re-deriving one, so initials-vs-photo stays Avatar's call, never this
   * file's.
   */
  const root = getRoot();

  const selector = selectorsFor(selectAttrs);
  const own = selectorsFor(userSelectAttrs);

  const fromTemplate = (template: string, values: Record<string, string>) => {
    let result = template;
    for (const [key, value] of Object.entries(values)) result = result.replaceAll(`{${key}}`, value);
    return result;
  };

  const control = root.querySelector<HTMLElement>(selector.control);
  const trigger = root.querySelector<HTMLElement>(selector.trigger);
  const valueEl = root.querySelector<HTMLElement>(selector.value);
  const indicatorEl = root.querySelector<HTMLElement>(selector.indicator);
  const positioner = root.querySelector<HTMLElement>(selector.positioner);
  const content = root.querySelector<HTMLElement>(selector.content);
  const search = root.querySelector<HTMLInputElement>(own.search);
  const hidden = root.querySelector<HTMLSelectElement>(selector.hidden);

  if (!trigger) throw new Error("UserSelect requires a [data-sk-select-trigger] element.");
  if (!content) throw new Error("UserSelect requires a [data-sk-select-content] element.");
  if (!valueEl) throw new Error("UserSelect requires a [data-sk-select-value] element.");
  if (!search) throw new Error("UserSelect requires a [data-sk-user-select-search] element.");

  type Authored = {
    node: HTMLElement;
    item: SelectOption;
    key: string;
    avatar: HTMLElement | null;
    text: HTMLElement | null;
    indicator: HTMLElement | null;
  };

  const readItem = (node: HTMLElement): Authored => {
    const value = node.dataset.value;
    if (!value) throw new Error("Every [data-sk-select-item] needs a non-empty data-value.");
    const text = node.querySelector<HTMLElement>(selector.itemText) ?? node;
    const label = text.textContent?.trim() || value;
    const email = node.dataset.email ?? "";
    return {
      node,
      item: { value, label, disabled: node.hasAttribute("data-disabled") },
      key: userSelectSearchKey(`${label} ${email}`),
      avatar: node.querySelector<HTMLElement>(`.${avatarParts.root}`),
      text: node.querySelector<HTMLElement>(selector.itemText),
      indicator: node.querySelector<HTMLElement>(selector.itemIndicator),
    };
  };

  const authored: Authored[] = Array.from(root.querySelectorAll<HTMLElement>(selector.item)).map(readItem);
  const authoredByValue = new Map(authored.map((row) => [row.item.value, row]));

  function assertHiddenSelectMatches(hiddenSelect: HTMLSelectElement, items: readonly Authored[]): void {
    const got = Array.from(hiddenSelect.options).map((option) => option.value);
    const expected = items.map((row) => row.item.value);
    if (got.join(" ") !== expected.join(" "))
      throw new Error(`UserSelect hidden select drifted from its items: [${got.join(", ")}] vs [${expected.join(", ")}].`);
  }
  if (hidden) assertHiddenSelectMatches(hidden, authored);

  // The rows stay exactly where the author put them; ONLY the wrapper around them is generated. A
  // `role="listbox"` (`composite: false`'s `getListProps()`) belongs on this element, never on
  // `content`, which also holds the search field - a listbox's only valid children are its options.
  let listEl = root.querySelector<HTMLElement>(own.list);
  if (!listEl) {
    listEl = document.createElement("div");
    listEl.setAttribute(userSelectAttrs.list, "");
    if (authored[0]) {
      authored[0].node.before(listEl);
      listEl.append(...authored.map((row) => row.node));
    } else {
      content.append(listEl);
    }
  }

  let emptyEl = root.querySelector<HTMLElement>(own.empty);
  if (!emptyEl) {
    emptyEl = document.createElement("div");
    emptyEl.className = comboboxParts.empty;
    emptyEl.setAttribute(userSelectAttrs.empty, "");
    emptyEl.setAttribute("role", "presentation");
    content.append(emptyEl);
  }

  let statusEl = root.querySelector<HTMLElement>(own.status);
  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.className = `${comboboxParts.status} sk-visually-hidden`;
    statusEl.setAttribute(userSelectAttrs.status, "");
    statusEl.setAttribute("role", "status");
    statusEl.setAttribute("aria-atomic", "true");
    content.append(statusEl);
  }

  let footerEl = root.querySelector<HTMLElement>(own.footer);
  let countEl = footerEl?.querySelector<HTMLElement>(own.count) ?? null;
  let clearEl = footerEl?.querySelector<HTMLButtonElement>(own.clear) ?? null;
  if (!footerEl) {
    footerEl = document.createElement("span");
    footerEl.className = "sk-inline";
    footerEl.dataset.align = "center";
    footerEl.dataset.gap = "sm";
    footerEl.dataset.justify = "between";
    footerEl.setAttribute(userSelectAttrs.footer, "");

    countEl = document.createElement("span");
    countEl.className = "sk-text";
    countEl.dataset.size = "caption";
    countEl.dataset.tone = "secondary";
    countEl.setAttribute(userSelectAttrs.count, "");

    clearEl = document.createElement("button");
    clearEl.className = "sk-button sk-interactive";
    clearEl.dataset.variant = "ghost";
    clearEl.dataset.size = "sm";
    clearEl.type = "button";
    clearEl.textContent = root.dataset.clearLabel || "Clear all";
    clearEl.setAttribute(userSelectAttrs.clear, "");

    footerEl.append(countEl, clearEl);
    content.append(footerEl);
  }

  const placeholder = root.dataset.placeholder || "Select users";
  if (!search.placeholder) search.placeholder = root.dataset.searchPlaceholder || "Search users...";
  const maxAvatars = Number(root.dataset.maxAvatars) || 3;

  const emptyMessage = () =>
    authored.length === 0
      ? root.dataset.emptyLabel || "No users available"
      : fromTemplate(root.dataset.noResultsLabel || 'No users found for "{query}"', { query });

  const resultText = (count: number) => {
    if (count === 0) return emptyMessage();
    const template =
      count === 1 ? (root.dataset.resultLabel ?? "1 result available") : (root.dataset.resultsLabel ?? "{count} results available");
    return fromTemplate(template, { count: String(count) });
  };

  const makeCollection = (items: SelectOption[]) =>
    select.collection<SelectOption>({
      items,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
      isItemDisabled: (item) => Boolean(item.disabled),
    });

  // `$state.raw`: always REPLACED wholesale by a filter pass, never mutated row by row.
  let visible = $state.raw(authored);
  let query = $state("");

  const filterAuthoredItems = (value: string) => {
    const needle = userSelectSearchKey(value.trim());
    const next = needle ? authored.filter((row) => row.key.includes(needle)) : authored;
    visible = next;
    const shown = new Set(next);
    for (const row of authored) {
      const hiddenNow = !shown.has(row);
      if (row.node.hidden !== hiddenNow) row.node.hidden = hiddenNow;
    }
  };

  const collection = $derived(makeCollection(visible.map((row) => row.item)));

  const readDefaultValue = (): string[] | undefined => {
    const value = root.dataset.value;
    return value ? value.split(" ").filter(Boolean) : undefined;
  };

  const machineId = root.id || uniqueId("sk-user-select");
  const anchorName = supportsAnchorPositioning() ? anchorNameFor(machineId) : null;
  let unbindAnchor: (() => void) | undefined;

  const service = useMachine(select.machine, () => ({
    id: machineId,
    collection,
    name: hidden?.name ?? root.dataset.name,
    multiple: true,
    composite: false,
    // Multiple selection defaults this to false already; stated explicitly because "does not close
    // on select" is the one behavior this whole component depends on.
    closeOnSelect: false,
    disabled: root.hasAttribute("data-disabled"),
    defaultValue: readDefaultValue(),
    positioning: { ...selectPositioning, boundary: root.closest("dialog") ? document.documentElement : undefined },
    onValueChange(details: { value: string[] }) {
      root.dispatchEvent(new CustomEvent(userSelectEvents.valueChange, { bubbles: true, detail: { value: details.value } }));
    },
  }));

  const api = $derived(select.connect(service, normalizeProps));

  const selectedRows = () => api.value.map((value) => authoredByValue.get(value)).filter((row): row is Authored => row != null);

  const triggerLabel = () => {
    const selected = selectedRows();
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return `${placeholder}, ${selected[0]!.item.label} selected`;
    return `${placeholder}, ${selected.length} users selected`;
  };

  let renderedKey = "";
  const renderTriggerValue = () => {
    const selected = selectedRows();
    const nextKey = selected.map((row) => row.item.value).join(" ");
    if (nextKey === renderedKey) return;
    renderedKey = nextKey;

    valueEl.replaceChildren();
    if (selected.length === 0) {
      valueEl.textContent = placeholder;
      return;
    }

    const wrap = document.createElement("span");
    wrap.className = "sk-inline";
    wrap.dataset.align = "center";
    wrap.dataset.gap = "sm";
    wrap.dataset.wrap = "false";

    if (selected.length === 1) {
      const avatar = selected[0]!.avatar?.cloneNode(true) as HTMLElement | undefined;
      if (avatar) wrap.append(avatar);
    } else {
      const group = document.createElement("div");
      group.className = avatarParts.group;
      group.setAttribute("role", "group");
      const shown = selected.slice(0, maxAvatars);
      for (const row of shown) {
        const avatar = row.avatar?.cloneNode(true) as HTMLElement | undefined;
        if (avatar) group.append(avatar);
      }
      const overflow = selected.length - shown.length;
      if (overflow > 0) {
        const badge = document.createElement("span");
        badge.className = avatarParts.groupOverflow;
        badge.textContent = `+${overflow}`;
        group.append(badge);
      }
      wrap.append(group);
    }

    const label = document.createElement("span");
    label.className = selectParts.value;
    label.textContent = selected.length === 1 ? selected[0]!.item.label : `${selected.length} users`;
    wrap.append(label);
    valueEl.append(wrap);
  };

  const bindings: PartBinding[] = [
    { part: "root", node: () => root, props: () => api.getRootProps() },
    { part: "hiddenSelect", node: () => hidden, props: () => (hidden ? api.getHiddenSelectProps() : null) },
    { part: "control", node: () => control, props: () => api.getControlProps() },
    {
      part: "trigger",
      node: () => trigger,
      props: () => api.getTriggerProps(),
      events: true,
      after: (node) => {
        node.setAttribute("aria-label", triggerLabel());
        node.removeAttribute("aria-labelledby");
      },
    },
    {
      part: "valueText",
      node: () => valueEl,
      props: () => ({ "aria-hidden": "true" }),
      after: () => renderTriggerValue(),
    },
    { part: "indicator", node: () => indicatorEl, props: () => api.getIndicatorProps() },
    {
      part: "positioner",
      node: () => positioner,
      props: () => {
        const props = api.getPositionerProps();
        return anchorName ? stripPositioningStyle(props) : props;
      },
      after: (node) => {
        if (anchorName) unbindAnchor = bindAnchor(trigger, node, anchorName);
      },
    },
    { part: "content", node: () => content, props: () => api.getContentProps(), events: true },
    {
      // `composite: false` puts the listbox role, `aria-multiselectable` and `aria-activedescendant`
      // here, on the wrapper around the rows, never on `content`.
      part: "list",
      node: () => listEl,
      props: () => api.getListProps(),
      after: (node) => {
        // `getListProps()` defaults this to a real tab stop (its OTHER use case: a standalone
        // listbox). Here the search field is the one real tab stop; the list is reached through it
        // via `aria-activedescendant`, never by Tab.
        node.setAttribute("tabindex", "-1");
      },
    },
    {
      part: "empty",
      node: () => emptyEl,
      props: () => ({}),
      after: (node) => {
        node.hidden = visible.length > 0;
        node.textContent = emptyMessage();
      },
    },
    {
      part: "status",
      node: () => statusEl,
      props: () => ({}),
      after: (node) => {
        const text = api.open ? resultText(visible.length) : "";
        if (node.textContent !== text) node.textContent = text;
      },
    },
    {
      part: "footer",
      node: () => footerEl,
      props: () => ({}),
      after: (node) => {
        node.hidden = api.value.length === 0;
      },
    },
    {
      part: "count",
      node: () => countEl,
      props: () => ({}),
      after: (node) => {
        node.textContent = `${api.value.length} selected`;
      },
    },
    { part: "clear", node: () => clearEl, props: () => api.getClearTriggerProps(), events: true },
  ];

  bindParts(bindings);

  /*
   * ── The rows stay hand-written ───────────────────────────────────────────────────────────────
   * Same precedent as `Combobox.svelte`'s own note: `dirtyItems()` is a diff that MUTATES
   * `appliedHighlight` / `appliedSelection` / `patchedOnce`, so it is only correct called once per
   * round - one binding per row would call it once per row, each call after the first consuming a
   * set the previous one already emptied.
   */
  let appliedHighlight: string | null = null;
  let appliedSelection = new Set<string>();
  let patchedOnce = false;
  const dirtyItems = (): Authored[] => {
    const selection = new Set(api.value);
    if (!patchedOnce) {
      patchedOnce = true;
      appliedHighlight = api.highlightedValue;
      appliedSelection = selection;
      return authored;
    }
    const dirty = new Set<string>();
    if (appliedHighlight !== api.highlightedValue) {
      if (appliedHighlight != null) dirty.add(appliedHighlight);
      if (api.highlightedValue != null) dirty.add(api.highlightedValue);
      appliedHighlight = api.highlightedValue;
    }
    for (const value of selection) if (!appliedSelection.has(value)) dirty.add(value);
    for (const value of appliedSelection) if (!selection.has(value)) dirty.add(value);
    appliedSelection = selection;
    if (dirty.size === 0) return [];
    return authored.filter((row) => dirty.has(row.item.value));
  };

  $effect(() => {
    for (const row of dirtyItems()) {
      applyZagProps(row.node, api.getItemProps({ item: row.item }) as DomProps);
      if (row.text) applyZagProps(row.text, api.getItemTextProps({ item: row.item }) as DomProps);
      if (row.indicator) applyZagProps(row.indicator, api.getItemIndicatorProps({ item: row.item }) as DomProps);
    }
  });

  // The search field is never Zag-managed (the select machine has no input of its own): typing
  // filters the AUTHORED rows, same source of truth as everywhere else in this file. Space is
  // stopped from bubbling into `content`'s own keydown handler, which otherwise reads it as
  // "toggle the highlighted row" (correct for a bare listbox, wrong for a field where someone is
  // typing "Jane Cooper"); Enter, the arrows, Home and End all still reach it untouched.
  let wasOpen = false;
  const cleanups: Array<() => void> = [];
  onMount(() => {
    for (const row of authored) cleanups.push(bindZagEvents(row.node, () => api.getItemProps({ item: row.item }) as DomProps));

    const onInput = () => {
      query = search.value;
      filterAuthoredItems(query);
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === " ") event.stopPropagation();
    };
    search.addEventListener("input", onInput);
    search.addEventListener("keydown", onKeydown);
    cleanups.push(
      () => search.removeEventListener("input", onInput),
      () => search.removeEventListener("keydown", onKeydown),
    );
  });

  // Closing spends the search, same as Combobox's typed query: the next open starts from the full
  // roster, never a stale filtered view.
  $effect(() => {
    if (wasOpen && !api.open) {
      query = "";
      search.value = "";
      filterAuthoredItems("");
    }
    wasOpen = api.open;
  });

  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
  });
</script>
