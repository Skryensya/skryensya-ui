<script lang="ts">
  import { tileParts } from "@skryensya/core/tile";
  import { collapsible } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, ensureClasses, type DomProps } from "../runtime/apply";

  /*
   * ACCORDION ITEM, one `@zag-js/collapsible` per item, the same way React composes its accordion (see
   * ADR-0024). It is what the vanilla layer was missing: collapsible measures the height and exposes it
   * in `--height`, and keeps the content present (`visible = open || closing`) until the closing
   * animation FINISHES, so collapsing animates like opening instead of disappearing all at once. The
   * single/multiple coordination lives in the parent (Accordion.svelte), which controls `open`; this
   * component only runs one item's machine and patches its attributes onto the authored markup (it
   * renders no structure).
   */
  // `id` is set by the parent (a stable node/id per item), so no `el.*` prop is read at the script's
  // top level, which avoids Svelte's `state_referenced_locally` warning.
  type Props = {
    id: string;
    value: string;
    el: HTMLElement;
    trigger: HTMLElement | null;
    content: HTMLElement | null;
    open: boolean;
    disabled: boolean;
    onToggle: (value: string) => void;
  };
  const { id, value, el, trigger, content, open, disabled, onToggle }: Props = $props();

  // `open` is controlled by the parent: the click only NOTIFIES (onOpenChange); the real state is moved
  // by the parent when it recomputes the open set and hands us back a new `open`. It is the same
  // controlled flow React uses (ExpandableTile.onOpenChange → accordion.toggle, with `open` tied to
  // accordion.values).
  const service = useMachine(collapsible.machine, () => ({
    id,
    open,
    disabled,
    onOpenChange(details: { open: boolean }) {
      if (details.open !== open) onToggle(value);
    },
  }));
  const api = $derived(collapsible.connect(service, normalizeProps));

  // The tile's CSS scope is "tile"; collapsible would set "collapsible". We put it back after patching,
  // just like ExpandableTile and React do. `applyZagProps` never touches `class`.
  const asTile = (node: HTMLElement, part: string) => {
    node.setAttribute("data-scope", "tile");
    node.setAttribute("data-part", part);
  };

  $effect(() => {
    applyZagProps(el, api.getRootProps() as DomProps);
    asTile(el, "item");
    // `sk-interactive` goes on the trigger, not on the section (same fix as `ExpandableTile.svelte`):
    // the section wraps trigger AND content, so the layer painted behind all of it tinted the revealed
    // content on hover.
    ensureClasses(el, tileParts.root, tileParts.expandable);
    // Turns off `tile.css`'s anti-flash shim (`:not([data-sk-tile-ready])`): before this effect, the
    // authored content has neither `hidden` nor `data-state`, so it was visible open for an instant even
    // if the section starts closed. It is set once and never removed, so a panel settled open (which
    // later loses `data-state` through Zag's own optimization) does not fall back under that shim.
    el.setAttribute("data-sk-tile-ready", "");
    el.dataset.value = value;
    if (trigger) {
      applyZagProps(trigger, api.getTriggerProps() as DomProps);
      asTile(trigger, "trigger");
      ensureClasses(trigger, tileParts.interactive, "sk-interactive");
    }
    if (content) {
      applyZagProps(content, api.getContentProps() as DomProps);
      asTile(content, "content");
    }
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    if (trigger) {
      cleanups.push(
        bindZagEvents(trigger, () => api.getTriggerProps() as DomProps),
      );
    }
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
