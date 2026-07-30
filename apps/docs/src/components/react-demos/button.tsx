/*
 * The one live React demo /components/button still needs.
 *
 * The other six moved to `src/demos/button.ts` as usage trees, so the page emits their markup, their
 * TSX and their live island from one authoring. TileButton could not follow them: its face is
 * `sk-tile__content` / `__title` / `__description`, three classes the tile contract declares as parts
 * and that NO signature emits — see the note in `src/demos/button.ts`. Until the contract grows those
 * signatures, this demo stays hand-written, and the page shows hand-written markup beside it.
 */
import { TileButton } from "@skryensya/react/tile-button";
import { framedIn } from "./framed";

/** Runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const TileButtonDemo = framed(function TileButtonDemo() {
  return (
    <TileButton onClick={() => {}}>
      <span className="sk-tile__content">
        <span className="sk-tile__title">Run deployment</span>
        <span className="sk-tile__description">Start the production deployment now.</span>
      </span>
    </TileButton>
  );
});
