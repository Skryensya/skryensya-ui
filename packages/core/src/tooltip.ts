import type { ComponentContract } from "./contract.js";

/*
 * TOOLTIP, el contrato.
 *
 * Un tooltip es una DESCRIPCIÓN AUXILIAR, nunca el nombre del control ni el único lugar donde vive
 * un dato. La máquina cuelga `aria-describedby` del trigger mientras está abierto, no
 * `aria-labelledby`: el trigger ya tiene que tener nombre accesible por su cuenta (su texto, o un
 * `aria-label` si es icon-only) y el tooltip lo AMPLÍA.
 *
 * Esa restricción no es purismo, es lo que hace que el componente sea honesto en dos escenarios que
 * no tienen arreglo dentro del componente:
 *
 *   1. TOUCH. No hay hover. Zag abre en `pointerenter` y en `focus` (gateado por `isFocusVisible`,
 *      así que un click con mouse no lo dispara). En un teléfono el tooltip prácticamente no se ve.
 *   2. SIN JS. El contenido se pinta oculto y sólo la máquina lo abre; sin la capa vanilla montada
 *      no aparece nunca.
 *
 * En los dos casos no se pierde información PORQUE el contrato prohíbe que haya información ahí que
 * no esté en otro lado. Un tooltip que es la única fuente de algo es un bug de quien lo usa, y no lo
 * puede detectar el sistema: por eso está escrito acá arriba.
 *
 * WCAG 1.4.13 (Content on Hover or Focus) pide tres cosas, y las tres se cumplen POR DEFECTO:
 *
 *   - Descartable: Escape cierra, sin mover el puntero ni el foco.
 *   - Persistente: no se cierra sola por un temporizador.
 *   - Hoverable: el puntero puede llegar hasta el tooltip sin que desaparezca. Esto es la opción
 *     `interactive` de la máquina, y acá viene encendida.
 *
 * Ese default está medido, no supuesto. Con `interactive` apagado el contenido recibe
 * `pointer-events: none`, el puntero nunca lo alcanza y el tooltip se cierra en el camino: eso
 * FALLA el criterio. La tentación es apagarlo razonando "un tooltip descriptivo no tiene nada que
 * clickear", y es un error de lectura: hoverable no existe para poder operar el tooltip, existe para
 * poder LEERLO, que es justo lo que necesita alguien con magnificación de pantalla o con temblor.
 *
 * Se puede apagar (`data-interactive="false"` / `interactive={false}`). Apagarlo es salirse del
 * criterio a sabiendas.
 */

import { anchorPlacements, anchorPlacementToZag, type AnchorPlacement } from "./anchored.js";

export type TooltipOpenChangeDetails = {
  open: boolean;
};

/**
 * De qué lado del trigger sale. El vocabulario es el del pattern Anclaje (ADR-11), no uno propio del
 * tooltip: son los mismos cuatro lados en ejes lógicos que pide cualquier caja anclada, y tenerlos
 * dos veces era tener dos que se podían separar. Estos alias se quedan porque son el nombre con el
 * que el contrato del tooltip ya se documentó.
 */
export type TooltipPlacement = AnchorPlacement;

export const tooltipPlacements = anchorPlacements;

export const tooltipPlacementToZag = anchorPlacementToZag;

/**
 * UN TOOLTIP SALE ARRIBA, y es el único de los anclados que no cae hacia abajo: abajo está lo que el
 * puntero acaba de tocar y lo que está por tocar.
 *
 * Está acá y no sólo en la hoja porque hay tres lugares que tienen que coincidir en el mismo lado: el
 * `position-area` de la caja, el de la FLECHA (que ya no cuelga de la caja y no puede deducirlo) y la
 * placement que se le pasa a la machine para el fallback. Cuando el default vivía sólo en el CSS los
 * tres se separaban en cuanto nadie autoraba `data-sk-placement`: la caja salía arriba, la flecha
 * abajo y la machine la colocaba abajo. Los bindings resuelven contra esta constante y escriben el
 * resultado, así que la ausencia de placement deja de ser un cuarto caso.
 */
export const tooltipDefaultPlacement: TooltipPlacement = "block-start";

export type TooltipOptions = {
  id?: string;
  /** ms antes de abrir en hover. Zag usa 400 por defecto. */
  openDelay?: number;
  /** ms antes de cerrar al salir. Zag usa 150 por defecto. */
  closeDelay?: number;
  /**
   * WCAG 1.4.13 "hoverable": el tooltip sigue abierto si el puntero entra en él. Por defecto
   * `true`; apagarlo hace que el componente falle el criterio.
   */
  interactive?: boolean;
  /** De qué lado sale. Por defecto `block-start`. */
  placement?: TooltipPlacement;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: TooltipOpenChangeDetails) => void;
};

/*
 * Las parts espejan la anatomía de `@zag-js/tooltip` (trigger, positioner, content, arrow,
 * arrowTip), con una diferencia: `arrowTip` no existe acá. Zag parte la flecha en dos, un contenedor
 * que posiciona y un hijo rotado que pinta; nuestro rombo es UN solo elemento, porque en la ruta del
 * navegador lo posiciona `position-area` y no hacen falta dos cajas para eso.
 *
 * La flecha es OPCIONAL en las dos capas y no tiene part propia: se autora con la clase del pattern
 * (`sk-anchored-arrow`) adentro del positioner, y de ahí hereda los hooks con los que este componente
 * la pinta. Que salga del TRIGGER y no del centro de la caja es geometría del pattern, contada ahí.
 */
export const tooltipParts = {
  root: "sk-tooltip",
  trigger: "sk-tooltip__trigger",
  positioner: "sk-tooltip__positioner",
  content: "sk-tooltip__content",
} as const;

export type TooltipPart = keyof typeof tooltipParts;
export type TooltipPartClass = (typeof tooltipParts)[TooltipPart];

/** Los ganchos que la capa vanilla escanea sobre el markup autorado. */
export const tooltipAttrs = {
  root: "data-sk-anchor",
  trigger: "data-sk-anchor-trigger",
  positioner: "data-sk-anchor-positioner",
  content: "data-sk-anchor-content",
  /**
   * La colocación pedida. Se autora en el ROOT y termina en el POSITIONER: en React el positioner se
   * portalea al body, donde la herencia desde el root ya no llega, así que la hoja lo lee ahí. La
   * flecha lo lee desde el positioner también, con el combinador de hijo.
   */
  placement: "data-sk-placement",
} as const;

export type TooltipAttr = keyof typeof tooltipAttrs;
export type TooltipAttrName = (typeof tooltipAttrs)[TooltipAttr];

/*
 * A hint that expands a control's own name; never replaces it. Wired as `aria-describedby`, so the
 * control must already be named: a tooltip that IS the name disappears for anyone who never hovers.
 *
 * `portals` is the honest part. React portals the floating content out of the subtree so an ancestor
 * with `overflow: hidden` cannot clip it; authored markup keeps the positioner in place and lets CSS
 * anchoring position it (decision 25). Two strategies for one job; declared here so a consumer can
 * scope the portal, and so the symmetry gate knows to look inside one container rather than two.
 */
export const tooltipContract = {
  id: "tooltip",
  css: "@skryensya/core/components/tooltip.css",
  parts: tooltipParts,

  options: {
    placement: {
      type: "enum",
      values: ["block-start", "block-end", "inline-start", "inline-end"],
      /*
       * `block-start`, matching `tooltipDefaultPlacement` above; the constant this file exports so
       * that the box, the arrow and the machine name one side. It read `block-end` here, which is
       * the PATTERN's default and the one thing a tooltip deliberately does not share: below is what
       * the pointer just touched. So a tree that left placement alone emitted `block-end` into the
       * markup while the React binding resolved `block-start`, and the same tooltip came out on
       * opposite sides of its trigger in the two bindings.
       */
      default: "block-start",
      attr: "data-sk-placement",
      /*
       * Machine configuration: the enhancer reads it off the root because authored markup has no
       * other channel, React passes it as a prop, and Zag never writes it back.
       */
      machineInput: true,
    },
    /**
     * Draw the small arrow pointing at the trigger. Off unless asked for, in both bindings.
     *
     * It was unreachable from a tree until now: authored markup writes a `sk-anchored-arrow` span
     * inside the positioner, React takes an `arrow` prop, and the contract declared neither; so
     * every emitted tooltip came out without one while all three documented demos draw one.
     *
     * The attribute is bookkeeping rather than wiring: the enhancer finds the arrow by the pattern's
     * class, not by this. It is marked machine input so the gate reads it as configuration present
     * on one side by construction, which is what it is.
     */
    arrow: { type: "boolean", attr: "data-arrow", trueValue: "", machineInput: true },
  },

  signatures: {
    Tooltip: {
      intent: ["hint", "expand-a-control-name", "explain-an-icon-button"],
      host: { element: "span" },
      mount: "data-sk-anchor",
      options: ["placement", "arrow"],
      portals: true,
      slots: {
        /** The control being described. It carries its own accessible name. */
        children: { accepts: "signature", required: true },
        /** The hint: keep it short, as it is a description, not documentation. */
        content: { accepts: "text", required: true },
      },
      /*
       * THE TRIGGER IS A WRAPPER, and it was the missing half of this template.
       *
       * The enhancer scans for `[data-sk-anchor-trigger]`, `[data-sk-anchor-positioner]` and
       * `[data-sk-anchor-content]` and patches Zag's props onto whatever it finds. Only the
       * positioner was ever written, so an emitted tooltip had no trigger to bind and could never
       * open in Vanilla; the component was published and unusable from a tree at the same time.
       *
       * It has to be an element of our own rather than the consumer's control, because
       * `getTriggerProps` returns BUTTON props: putting them on their control would work only if
       * their control were a button, and wrapping it in one of ours would put two controls in the
       * tab order for one action. A span carries the props and the anchor name and stays out of the
       * way, which is exactly what the React binding already did and the template did not say.
       */
      template: {
        element: "span",
        part: "root",
        host: true,
        children: [
          {
            element: "span",
            part: "trigger",
            also: ["sk-anchor"],
            mount: "data-sk-anchor-trigger",
            slot: "children",
          },
          {
            element: "div",
            part: "positioner",
            also: ["sk-anchored"],
            mount: "data-sk-anchor-positioner",
            children: [
              /* Decorative by construction: it repeats the box's own direction, and the box is
                 already announced through `aria-describedby`. */
              {
                element: "span",
                also: ["sk-anchored-arrow"],
                attrs: { "aria-hidden": "true" },
                whenGiven: "arrow",
              },
              {
                element: "div",
                part: "content",
                mount: "data-sk-anchor-content",
                attrs: { role: "tooltip" },
                slot: "content",
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/tooltip", name: "Tooltip" },
    },
  },
} as const satisfies ComponentContract;
