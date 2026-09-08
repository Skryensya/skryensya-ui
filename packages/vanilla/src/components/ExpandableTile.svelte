<script lang="ts">
  import { collapsible } from "@skryensya/core/machines";
  import { tileEvents, tileParts } from "@skryensya/core/tile";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, ensureClasses, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * EXPANDABLE TILE, a machine-backed enhancer over `@zag-js/collapsible` (the same machine React uses
   * in tile.tsx). Zag collapsible provides what the old FSM did by hand: it measures the height and
   * exposes it in `--height`, and keeps the content present until the closing animation finishes. The
   * shared CSS (`css/components/tile.css`) already works with that output, React proves it.
   */
  const root = getRoot();
  const trigger = root.querySelector<HTMLElement>('[data-part="trigger"]');
  // Direct child, for the reason spelled out in Accordion.svelte: `data-part="content"` names both
  // the collapsible panel and the copy block a Tile puts inside its own trigger.
  const content = root.querySelector<HTMLElement>(
    ':scope > [data-part="content"], :scope > [data-part="expandable-content"]',
  );
  if (!trigger || !content) throw new Error("ExpandableTile requires trigger and content parts.");

  if (!root.id) root.id = uniqueId("sk-tile");
  const disabled = root.hasAttribute("data-disabled");
  const defaultOpen = root.hasAttribute("data-default-open") || root.hasAttribute("data-open");

  const service = useMachine(collapsible.machine, () => ({
    id: root.id,
    disabled,
    defaultOpen,
    onOpenChange(details: { open: boolean }) {
      root.dispatchEvent(new CustomEvent(tileEvents.openChange, { bubbles: true, detail: { open: details.open } }));
    },
  }));
  const api = $derived(collapsible.connect(service, normalizeProps));

  // The tile's CSS scope is "tile"; Zag would set "collapsible". We put it back after patching, just
  // like React does. The `sk-tile*` classes are authored by the consumer (applyZagProps never touches
  // class); we guarantee `sk-interactive` the way the old enhancer did, but on the TRIGGER, not on the
  // section: the section is a container, not the control, and the layer painted behind the whole section
  // tinted the revealed content on hover (and `sk-tile--interactive` blocked selecting that same text
  // through `user-select: none`).
  const scopeTile = (el: HTMLElement) => el.setAttribute("data-scope", "tile");

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(trigger, api.getTriggerProps() as DomProps);
    applyZagProps(content, api.getContentProps() as DomProps);
    scopeTile(root);
    scopeTile(trigger);
    scopeTile(content);
    ensureClasses(root, tileParts.root, tileParts.expandable);
    ensureClasses(trigger, tileParts.interactive, "sk-interactive");
    // Same anti-flash handoff as `AccordionItem.svelte`: see that file's own comment and
    // `tile.css`'s `:not([data-sk-tile-ready])` rule for why this is set once and never removed.
    root.setAttribute("data-sk-tile-ready", "");
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    cleanups.push(bindZagEvents(trigger, () => api.getTriggerProps() as DomProps));
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
