<script lang="ts">
  import { collapsible } from "@skryensya/core/machines";
  import { tileEvents, tileParts } from "@skryensya/core/tile";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * EXPANDABLE TILE, enhancer machine-backed sobre `@zag-js/collapsible` (la misma máquina que usa
   * React en tile.tsx). Zag collapsible aporta lo que el FSM viejo hacía a mano: mide el alto y lo
   * expone en `--height`, y mantiene el contenido presente hasta que termina la animación de cierre.
   * El CSS compartido (`css/components/tile.css`) ya funciona con esa salida, React lo prueba.
   */
  const root = getRoot();
  const trigger = root.querySelector<HTMLElement>('[data-part="trigger"]');
  const content = root.querySelector<HTMLElement>('[data-part="content"], [data-part="expandable-content"]');
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

  // El scope del CSS del tile es "tile"; Zag pondría "collapsible". Lo devolvemos después de parchear,
  // igual que hace React. Las clases `sk-tile*` las autora el consumidor (applyZagProps nunca toca
  // class); garantizamos `sk-interactive` como hacía el enhancer viejo.
  const scopeTile = (el: HTMLElement) => el.setAttribute("data-scope", "tile");

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(trigger, api.getTriggerProps() as DomProps);
    applyZagProps(content, api.getContentProps() as DomProps);
    scopeTile(root);
    scopeTile(trigger);
    scopeTile(content);
    root.classList.add(tileParts.root, tileParts.interactive, tileParts.expandable, "sk-interactive");
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    cleanups.push(bindZagEvents(trigger, () => collapsible.connect(service, normalizeProps).getTriggerProps() as DomProps));
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
