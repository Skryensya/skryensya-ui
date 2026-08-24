import {
  anchoredHooks,
  anchoredParts,
  anchorBoxNameFor,
  anchorNameFor,
  stripPositioningStyle,
  supportsAnchorPositioning,
} from "@skryensya/core/anchored";
import { useSyncExternalStore, type CSSProperties } from "react";

/*
 * The React side of the Anclaje pattern (decision 25), and the reason the anchored components here
 * stopped each carrying their own copy of this.
 *
 * React portals every positioner to the body, so the anchor name cannot be inherited from a shared
 * ancestor, there is none. It goes on BOTH elements as an inline custom property, which is the only
 * arrangement that survives the portal.
 *
 * The CLASSES are unconditional: `patterns/anchored.css` is written so `sk-anchored` is correct
 * whether or not the browser has the API. Only the WIRING is conditional, because only the wiring
 * would be wrong on the fallback path: dropping the machine's inline style with no browser engine to
 * take over would leave the popup unplaced.
 */
const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export type Anchored = {
  /** True when the browser is the positioning engine and the machine must not also place things. */
  on: boolean;
  /** Merge onto the element the popup is measured against, AFTER spreading the machine's props. */
  anchor: (
    className: string,
    machineStyle?: CSSProperties,
  ) => { className: string; style: CSSProperties };
  /**
   * Wraps the machine's positioner props: same props, minus the placement the browser now owns. It
   * also carries the box's own anchor name, which is what an arrow inside it measures.
   */
  positioner: <T extends { style?: CSSProperties }>(
    props: T,
    className: string,
  ) => Omit<T, "style"> & { className: string; style: CSSProperties | undefined };
};

/*
 * `supportsAnchorPositioning()` is a BROWSER question, and the server cannot answer it: it has no
 * `CSS`, so it always says no and renders the machine's inline placement. If the client asked the
 * real question during hydration it would say yes and render the anchor names instead, and React
 * would report a mismatch on every anchored component (decision 25 note).
 *
 * So the answer is routed through `useSyncExternalStore`, whose whole job is exactly this: React
 * uses the SERVER snapshot for the hydration pass, so the first client render matches the HTML by
 * construction, then re-renders with the client snapshot once hydration is done. The store never
 * changes, hence the no-op `subscribe`; this is a one-way flip at mount, not a subscription.
 *
 * The extra render is free in practice: every anchored box here is CLOSED at mount, so nothing is
 * placed by either engine before the flip lands.
 */
const subscribeToNothing = () => () => {};
const clientSupport = () => supportsAnchorPositioning();
const serverSupport = () => false;

/*
 * `enabled`: an escape hatch for a caller whose anchor lives inside ANOTHER anchor-positioned box
 * (a submenu, hanging off a trigger that is itself inside the parent menu's `.sk-anchored` panel).
 * Measured against a live nested Menu: the browser engine lays such a box out with a valid rect and
 * then never PAINTS it, an anchor-positioned element cannot itself be reached as an anchor from
 * inside another anchor-positioned box. `position: fixed` widens which anchors are reachable
 * (`anchored.css`'s own note) but does not fix this doubly-nested case. `false` here keeps the
 * machine's own placement. The already-working fallback this pattern ships for browsers with no
 * engine at all. For exactly the boxes the engine cannot place, instead of a box that is `on` but
 * invisible.
 */
export function useAnchored(id: string, enabled = true): Anchored {
  const browserSupport = useSyncExternalStore(subscribeToNothing, clientSupport, serverSupport);
  const on = enabled && browserSupport;
  const anchorStyle = on
    ? ({ [anchoredHooks.name]: anchorNameFor(id) } as CSSProperties)
    : undefined;
  const boxStyle = on
    ? ({
        [anchoredHooks.name]: anchorNameFor(id),
        [anchoredHooks.boxName]: anchorBoxNameFor(id),
      } as CSSProperties)
    : undefined;

  return {
    on,

    anchor(className: string, machineStyle?: CSSProperties) {
      return {
        className: cx(className, anchoredParts.anchor),
        style: { ...machineStyle, ...anchorStyle },
      };
    },

    positioner<T extends { style?: CSSProperties }>(props: T, className: string) {
      return {
        ...stripPositioningStyle(props),
        className: cx(className, anchoredParts.positioner),
        style: on ? boxStyle : props.style,
      };
    },
  };
}
