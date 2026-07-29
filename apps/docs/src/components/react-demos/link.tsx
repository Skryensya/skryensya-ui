/*
 * Live React demos for /components/link. Each export is a self-contained island (no function props
 * crossing the Astro boundary), mounted directly from the page with a bare `<LinkBasicDemo client:load />`.
 */
import { Link } from "@skryensya/react/link";
import { TileLink } from "@skryensya/react/tile-link";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const LinkBasicDemo = framed(function LinkBasicDemo() {
  return (
    <p>
      A paragraph with a link <Link href="/en/components/link">of the text color</Link> and another{" "}
      <Link href="/en/components/link" tone="primary">
        of primary color
      </Link>
      , both with permanent underlining.
    </p>
  );
});

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
