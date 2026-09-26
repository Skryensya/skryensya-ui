import { stickerContract, stickerParts } from "@skryensya/core/sticker";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import type { HTMLAttributes, ReactNode } from "react";

/* Derived, never restated: the values and defaults live in the contract. */
const o = stickerContract.options;

type StickerLook = Omit<SignatureOptionsOf<typeof stickerContract, "Sticker">, "src" | "alt">;

/*
 * The two ways in, as the contract's `exactlyOneOf` says them: an image by `src`, which then OWES an
 * `alt` (empty when it is decoration, never invented here), or authored artwork as children. A
 * union rather than two optional props, so passing both, or neither, is a type error instead of a
 * sticker with two pictures stacked in one silhouette or none at all.
 */
type StickerArtwork =
  | { src: string; alt: string; children?: never }
  | { src?: never; alt?: never; children: ReactNode };

export type StickerProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & StickerLook & StickerArtwork;

/**
 * Artwork turned into a die-cut sticker. `state` is the consumer's: write `"peeled"` or `"applied"`
 * and the stylesheet plays the transition. The component owns no state and reacts to no click.
 */
export function Sticker({
  state = o.state.default,
  peelOrigin = o.peelOrigin.default,
  src,
  alt,
  children,
  className,
  ...props
}: StickerProps) {
  /*
   * The artwork is rendered twice, the second time inside the `aria-hidden` flap that lifts when it
   * peels (see `sticker.ts`). Both copies stay mounted through every state: changing `state` changes
   * one attribute, so an image never reloads and an inline svg never remounts mid-transition.
   */
  const art = (copy: boolean) =>
    src != null ? <img src={src} alt={copy ? "" : alt} /> : children;

  return (
    <span
      {...props}
      className={className ? `${stickerParts.root} ${className}` : stickerParts.root}
      {...{ [o.state.attr]: state, [o.peelOrigin.attr]: peelOrigin }}
    >
      <span className={stickerParts.art}>{art(false)}</span>
      <span className={stickerParts.flap} aria-hidden="true">
        <span className={stickerParts.art}>{art(true)}</span>
      </span>
    </span>
  );
}
