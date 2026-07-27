import {
  anchoredHooks,
  anchoredParts,
  anchorBoxNameFor,
  anchorNameFor,
  stripPositioningStyle,
  supportsAnchorPositioning,
} from "@skryensya/core/anchored";
import type { CSSProperties } from "react";

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

export function anchored(id: string): Anchored {
  const on = supportsAnchorPositioning();
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
