<script lang="ts">
  import {
    anchoredParts,
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import { tooltip } from "@skryensya/core/machines";
  import {
    tooltipDefaultPlacement,
    tooltipPlacementToZag,
    tooltipPlacements,
    type TooltipPlacement,
  } from "@skryensya/core/tooltip";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TOOLTIP, enhancer machine-backed sobre `@zag-js/tooltip` (la MISMA máquina que usa React, vía
   * @skryensya/core/machines). No renderiza estructura: escanea el markup autorado
   * (`[data-sk-anchor-trigger]` / `[data-sk-anchor-positioner]` / `[data-sk-anchor-content]`) y
   * parchea sobre esos nodos los atributos que devuelve `connect`.
   */
  const root = getRoot();

  const trigger = root.querySelector<HTMLElement>("[data-sk-anchor-trigger]");
  const positioner = root.querySelector<HTMLElement>("[data-sk-anchor-positioner]");
  const content = root.querySelector<HTMLElement>("[data-sk-anchor-content]");
  /*
   * La flecha es OPCIONAL: sin este nodo no hay flecha, y ése es el default. Se busca por la clase del
   * pattern y no por un `data-sk-*` propio porque no hay nada que este enhancer le tenga que decir en
   * la ruta del navegador: la coloca la hoja. Sólo hace falta encontrarla para el fallback.
   */
  const arrow = positioner?.querySelector<HTMLElement>(`.${anchoredParts.arrow}`) ?? null;

  if (!root.id) root.id = uniqueId("sk-tooltip");

  const numberAttr = (name: string): number | undefined => {
    const raw = root.getAttribute(name);
    if (raw === null) return undefined;
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) ? value : undefined;
  };

  // `interactive` es el "hoverable" de WCAG 1.4.13: mantiene el tooltip abierto mientras el puntero
  // viaja hacia él. Apagado por defecto (ver core/tooltip.ts); se enciende por markup y el CSS lee el
  // mismo atributo para devolverle `pointer-events` al contenido.
  // Encendido por defecto: es lo que cumple WCAG 1.4.13 "hoverable" (ver core/tooltip.ts). El
  // opt-out es explícito y es salirse del criterio a sabiendas.
  const interactive = root.getAttribute("data-interactive") !== "false";

  /*
   * La colocación se autora en el root y se copia al positioner, que es donde la lee la hoja (en React
   * el positioner se portalea, así que no puede depender de la herencia). Un valor que no esté en el
   * juego de cuatro se ignora.
   *
   * SE RESUELVE EL DEFAULT en vez de dejar el atributo afuera. La caja se las arregla sin él, la
   * flecha no: sus reglas van por `[data-sk-placement]` y el default del pattern es block-end,
   * mientras que el de un tooltip es block-start, así que un tooltip sin placement autorada terminaba
   * con la caja arriba y la flecha abajo. Escribir el lado resuelto hace que las dos, y la machine,
   * digan lo mismo.
   */
  const authoredPlacement = root.getAttribute("data-sk-placement");
  const placement = tooltipPlacements.includes(authoredPlacement as TooltipPlacement)
    ? (authoredPlacement as TooltipPlacement)
    : tooltipDefaultPlacement;
  positioner?.setAttribute("data-sk-placement", placement);

  const service = useMachine(tooltip.machine, () => ({
    id: root.id,
    ids: { trigger: trigger?.id || undefined, content: content?.id || undefined },
    openDelay: numberAttr("data-open-delay"),
    closeDelay: numberAttr("data-close-delay"),
    interactive,
    // Sólo pesa en el fallback JS: con anclas, `position-area` ya colocó y Zag no posiciona.
    positioning: { placement: tooltipPlacementToZag[placement] },
    disabled: root.hasAttribute("data-disabled"),
    onOpenChange(details: { open: boolean }) {
      root.dispatchEvent(
        new CustomEvent("sk-open-change", { bubbles: true, detail: { open: details.open } }),
      );
    },
  }));

  const api = $derived(tooltip.connect(service, normalizeProps));

  /*
   * La ruta de anchor positioning, que ahora es del pattern Anclaje (ADR-25). Cuando el navegador
   * tiene la API, el que coloca es el NAVEGADOR: cableamos un nombre único entre el trigger y el
   * positioner, y NO le pasamos al positioner el `style` inline que trae Zag, porque serían dos
   * motores de posicionamiento peleando. Sin la API, el `style` de Zag pasa intacto y él posiciona.
   *
   * El nombre va sobre LOS DOS elementos y no se hereda del root: en React el positioner se portalea
   * al body, y este enhancer usa el mismo helper para que las dos capas se comporten igual.
   */
  const anchored = supportsAnchorPositioning();
  let unbindAnchor: (() => void) | undefined;

  if (anchored && trigger) {
    unbindAnchor = bindAnchor(trigger, positioner, anchorNameFor(root.id));
  }

  const positionerProps = (props: DomProps): DomProps =>
    anchored ? (stripPositioningStyle(props) as DomProps) : props;

  $effect(() => {
    const contentProps = api.getContentProps() as DomProps;

    if (trigger) applyZagProps(trigger, api.getTriggerProps() as DomProps);
    if (positioner) applyZagProps(positioner, positionerProps(api.getPositionerProps() as DomProps));
    /*
     * EN LA RUTA DEL NAVEGADOR NO SE LE ESCRIBE NADA A LA FLECHA: la coloca la hoja contra el mismo
     * ancla, y su estado abierto lo lee del contenido con `:has()`.
     *
     * En el fallback sí, porque ahí la coloca la machine: `getArrowProps` la marca como
     * `[data-part=arrow]`, que es por donde `@zag-js/popper` la encuentra para moverla, y `data-side`
     * (el lado que la machine RESOLVIÓ) es lo que la hoja lee para rotarla. Ese lado es dato firme
     * sólo acá: en la otra ruta el que decide dónde quedó la caja es el navegador, y la opinión de la
     * machine puede no coincidir. Se lee de las props y no del DOM para no depender de en qué orden se
     * parchean los nodos.
     */
    if (arrow && !anchored) {
      applyZagProps(arrow, api.getArrowProps() as DomProps);
      const side = contentProps["data-side"];
      if (typeof side === "string") arrow.setAttribute("data-side", side);
    }
    if (content) {
      applyZagProps(content, contentProps);
      // El CSS necesita saber si el contenido es alcanzable por el puntero; el estado vive en la
      // máquina, así que se espeja como atributo en vez de duplicar la condición en la hoja. Sólo
      // se escribe el opt-out: alcanzable es el defecto de la hoja.
      if (interactive) content.removeAttribute("data-interactive");
      else content.setAttribute("data-interactive", "false");
    }
  });

  // Los handlers de Zag se cablean una vez y se re-leen en cada disparo: la máquina cambia de estado
  // y con ella el closure.
  const cleanups: Array<() => void> = [];
  onMount(() => {
    if (trigger) {
      cleanups.push(
        bindZagEvents(trigger, () => api.getTriggerProps() as DomProps),
      );
    }
    if (content) {
      cleanups.push(
        bindZagEvents(content, () => api.getContentProps() as DomProps),
      );
    }
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
  });
</script>
