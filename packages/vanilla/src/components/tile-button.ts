import { interactiveTileClass } from "./tile.js";
import type { Space } from "@skryensya/core/layout";


export type TileButtonInit = {
  disabled?: boolean;
  className?: string;
  padding?: Space;
};

export function createTileButton({ disabled, className, padding }: TileButtonInit = {}): HTMLButtonElement {
  const element = document.createElement("button");
  element.className = interactiveTileClass(className);
  element.type = "button";
  element.disabled = Boolean(disabled);
  element.dataset.scope = "tile";
  element.dataset.part = "root";
  if (padding) element.dataset.padding = padding;
  return element;
}
