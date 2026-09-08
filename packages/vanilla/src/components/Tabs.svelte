<script lang="ts">
  import { tabs } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TABS, a machine-backed enhancer over `@zag-js/tabs` (the SAME machine React uses, via
   * @skryensya/core/machines). It renders no structure: it scans its authored markup
   * (`[data-sk-tabs-list]` / `[data-sk-tabs-trigger]` / `[data-sk-tabs-content]`, each with
   * `data-value`) and patches the attributes `connect` returns onto those nodes. It preserves the old
   * contract: it mirrors `api.value` in the root's `data-value` and emits `sk-value-change`.
   */
  const root = getRoot();

  type Item = { value: string; trigger: HTMLElement; content: HTMLElement; disabled: boolean };

  const valueOf = (el: Element): string => el.getAttribute("data-value") ?? "";
  const disabledOf = (el: Element): boolean =>
    el.hasAttribute("data-disabled") || el.getAttribute("aria-disabled") === "true";

  const list = root.querySelector<HTMLElement>("[data-sk-tabs-list]");
  const contents = Array.from(root.querySelectorAll<HTMLElement>("[data-sk-tabs-content]"));

  const items: Item[] = (list ? Array.from(list.querySelectorAll<HTMLElement>("[data-sk-tabs-trigger]")) : [])
    .map((trigger): Item | null => {
      const value = valueOf(trigger);
      if (!value) return null;
      const content = contents.find((candidate) => valueOf(candidate) === value);
      if (!content) return null;
      return { value, trigger, content, disabled: disabledOf(trigger) };
    })
    .filter((item): item is Item => item !== null);

  if (!root.id) root.id = uniqueId("sk-tabs");
  if (list && !list.id) list.id = uniqueId("sk-tabs-list");

  const orientation: "horizontal" | "vertical" =
    root.getAttribute("data-orientation") === "vertical" ? "vertical" : "horizontal";
  const activationMode: "automatic" | "manual" =
    root.getAttribute("data-activation-mode") === "manual" ? "manual" : "automatic";

  // The initial value: the authored `data-value` if it points at an enabled tab, otherwise the first enabled one.
  const enabled = items.filter((item) => !item.disabled);
  const authored = root.getAttribute("data-value");
  const defaultValue = (authored && enabled.some((i) => i.value === authored) ? authored : enabled[0]?.value) ?? null;

  const service = useMachine(tabs.machine, () => ({
    id: root.id,
    ids: { root: root.id, list: list?.id ?? root.id },
    orientation,
    activationMode,
    defaultValue,
    onValueChange(details: { value: string }) {
      root.dispatchEvent(new CustomEvent("sk-value-change", { bubbles: true, detail: { value: details.value } }));
    },
  }));

  const api = $derived(tabs.connect(service, normalizeProps));

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    // Mirrors the selected value in `data-value`, as the old enhancer did (some CSS/consumer reads it).
    // Zag does not put it on the root on its own.
    root.setAttribute("data-value", api.value ?? "");
    if (list) applyZagProps(list, api.getListProps() as DomProps);
    for (const item of items) {
      applyZagProps(item.trigger, api.getTriggerProps({ value: item.value, disabled: item.disabled || undefined }) as DomProps);
      const contentProps = api.getContentProps({ value: item.value }) as DomProps;
      applyZagProps(item.content, contentProps);
      // Zag only writes `aria-controls` on the SELECTED trigger (confirmed reading
      // tabs.connect.js). The WAI-ARIA Tabs pattern is explicit that EVERY tab has it
      // ("Each element with role tab has the property aria-controls referring to its
      // associated tabpanel element"), selected or not. `getContentProps` already computes
      // each panel's real id regardless of selection, so this is a correction, not a guess.
      if (typeof contentProps.id === "string") item.trigger.setAttribute("aria-controls", contentProps.id);
    }
  });

  // Zag's handlers (onClick/onKeyDown/onFocus) are wired once and re-read on every firing: the machine
  // changes state and with it the closure.
  const cleanups: Array<() => void> = [];
  onMount(() => {
    if (list) {
      cleanups.push(bindZagEvents(list, () => api.getListProps() as DomProps));
    }
    for (const item of items) {
      cleanups.push(
        bindZagEvents(
          item.trigger,
          () =>
            api.getTriggerProps({
              value: item.value,
              disabled: item.disabled || undefined,
            }) as DomProps,
        ),
      );
    }
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
