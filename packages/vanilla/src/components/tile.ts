import { tileParts } from "@skryensya/core/tile";

export function interactiveTileClass(className?: string): string {
  const base = `${tileParts.root} ${tileParts.interactive} sk-interactive`;
  return className ? `${base} ${className}` : base;
}

export function expandableTileClass(className?: string): string {
  const base = `${tileParts.root} ${tileParts.interactive} ${tileParts.expandable}`;
  return className ? `${base} ${className}` : base;
}
