<script lang="ts">
  import { tileParts } from "@skryensya/core/tile";
  import { collapsible } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, ensureClasses, type DomProps } from "../runtime/apply";

  /*
   * ACCORDION ITEM, un `@zag-js/collapsible` por item, igual que React compone su accordion (ver
   * ADR-0024). Es lo que le faltaba a la capa vanilla: collapsible mide el alto y lo expone en `--height`,
   * y mantiene el contenido presente (`visible = open || closing`) hasta que TERMINA la animación de
   * cierre, así el colapso anima igual que la apertura en vez de desaparecer de golpe. La coordinación
   * single/multiple vive en el padre (Accordion.svelte), que controla `open`; este componente sólo corre
   * la máquina de un item y parchea sus atributos sobre el markup autorado (no renderiza estructura).
   */
  // `id` lo fija el padre (un nodo/id estable por item), así ningún prop `el.*` se lee en el top level
  // del script, eso evita el aviso `state_referenced_locally` de Svelte.
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

  // `open` es controlado por el padre: el click sólo AVISA (onOpenChange); el estado real lo mueve el
  // padre al recalcular el set abierto y devolvernos un nuevo `open`. Es el mismo flujo controlado que
  // usa React (ExpandableTile.onOpenChange → accordion.toggle, con `open` atado a accordion.values).
  const service = useMachine(collapsible.machine, () => ({
    id,
    open,
    disabled,
    onOpenChange(details: { open: boolean }) {
      if (details.open !== open) onToggle(value);
    },
  }));
  const api = $derived(collapsible.connect(service, normalizeProps));

  // El scope del CSS del tile es "tile"; collapsible pondría "collapsible". Lo devolvemos después de
  // parchear, igual que hacen ExpandableTile y React. `applyZagProps` nunca toca `class`.
  const asTile = (node: HTMLElement, part: string) => {
    node.setAttribute("data-scope", "tile");
    node.setAttribute("data-part", part);
  };

  $effect(() => {
    applyZagProps(el, api.getRootProps() as DomProps);
    asTile(el, "item");
    // `sk-interactive` va en el trigger, no en la sección (mismo arreglo que `ExpandableTile.svelte`):
    // la sección envuelve trigger Y contenido, así que el layer pintado detrás de toda ella teñía el
    // contenido revelado al pasar el mouse.
    ensureClasses(el, tileParts.root, tileParts.expandable);
    // Apaga el shim anti-flash de `tile.css` (`:not([data-sk-tile-ready])`): antes de este efecto,
    // el contenido autorado no tiene `hidden` ni `data-state`, así que se veía abierto un instante
    // aunque la sección arranque cerrada. Se pone una vez y nunca se saca, para que un panel
    // asentado en abierto (que más tarde pierde `data-state` por la propia optimización de Zag)
    // no vuelva a caer bajo ese shim.
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
