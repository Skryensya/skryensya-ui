<script lang="ts">
  import { tabs } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TABS, a machine-backed enhancer over `@zag-js/tabs` (the SAME machine React uses, via
   * @skryensya/core/machines). It renders no structure: it scans its authored markup
   * (`[data-sk-tabs-list]` / `[data-sk-tabs-trigger]` / `[data-sk-tabs-content]`, each with
   * `data-value`) and patches the attributes `connect` returns onto those nodes. It preserves the old
   * contract: it mirrors `api.value` in the root's `data-value` and emits `sk-value-change`.
   *
   * THE FIRST ENHANCER ON `bindParts`, and it was chosen because at 100 lines it exercises the whole
   * interface: a required part (root), an optional one (list, absent from valid markup), a collection
   * keyed by value (the items), a per-part correction that reads the node it just patched (the
   * `aria-controls` fix below), and cross-part work that must run after every patch (the `data-value`
   * mirror). If the interface could not express Tabs it would be wrong, and finding that out here
   * costs 100 lines rather than TimeField's 474.
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

  const bindings: PartBinding[] = [
    { part: "root", node: () => root, props: () => api.getRootProps() },
    // Absent from perfectly valid markup, so it is a binding like any other rather than a guard.
    { part: "list", node: () => list, props: () => api.getListProps(), events: true },

    ...items.flatMap((item): PartBinding[] => [
      {
        part: "trigger",
        node: () => item.trigger,
        events: true,
        props: () => api.getTriggerProps({ value: item.value, disabled: item.disabled || undefined }),
      },
      {
        part: "content",
        node: () => item.content,
        props: () => api.getContentProps({ value: item.value }),
        /*
         * Zag only writes `aria-controls` on the SELECTED trigger (confirmed reading tabs.connect.js).
         * The WAI-ARIA Tabs pattern is explicit that EVERY tab has it ("Each element with role tab has
         * the property aria-controls referring to its associated tabpanel element"), selected or not.
         *
         * Read off the panel rather than out of its props object: `after` runs once the panel has been
         * patched, so its real id is already on the node. That is also what keeps this a correction
         * rather than a guess - the id is the one the panel actually carries, not one recomputed here.
         */
        after: (content) => {
          if (content.id) item.trigger.setAttribute("aria-controls", content.id);
        },
      },
    ]),
  ];

  bindParts(bindings, {
    /*
     * Mirrors the selected value in `data-value`, as the old enhancer did (some CSS/consumer reads it).
     * Zag does not put it on the root on its own. It sits in `then` because it is the root's state
     * expressed after every part has settled, not part of any one part's patch.
     */
    then: () => root.setAttribute("data-value", api.value ?? ""),
  });
</script>
