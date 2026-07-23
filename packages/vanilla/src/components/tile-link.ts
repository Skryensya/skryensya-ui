import { interactiveTileClass } from "./tile.js";
import type { Space } from "@skryensya/core/layout";


export type TileLinkInit = {
  href: string;
  target?: HTMLAnchorElement["target"];
  rel?: string;
  className?: string;
  padding?: Space;
};

export function createTileLink({ href, target, rel, className, padding }: TileLinkInit): HTMLAnchorElement {
  const element = document.createElement("a");
  element.className = interactiveTileClass(className);
  element.href = href;
  if (target) element.target = target;
  if (rel) element.rel = rel;
  element.dataset.scope = "tile";
  if (padding) element.dataset.padding = padding;
  element.dataset.part = "root";
  return element;
}
