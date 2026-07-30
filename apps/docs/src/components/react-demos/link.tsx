/*
 * Live React demo for the authored TileLink stage. The prose Link demo is tree-driven; TileLink
 * stays an island because tile title/description parts are unreachable.
 */
import { TileLink } from "@skryensya/react/tile-link";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const TileLinkDemo = framed(function TileLinkDemo() {
  return (
    <TileLink href="/usage">
      <span className="sk-tile__content">
        <span className="sk-tile__title">Usage details</span>
        <span className="sk-tile__description">Open the account usage report.</span>
      </span>
    </TileLink>
  );
});
