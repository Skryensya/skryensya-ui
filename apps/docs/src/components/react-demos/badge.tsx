/*
 * Live React demos for /components/badge. Self-contained island (no function props crossing the
 * Astro boundary), mounted directly from the page with a bare `<BadgeDemo client:load />`.
 *
 * Note: the "Dot" and "Dot in the corner" showcases are NOT made live here. `Badge` (see
 * packages/react/src/components/badge.tsx) requires `children: ReactNode` and has no `dot` prop —
 * the dot shape only exists in the vanilla/CSS layer (`data-dot` on `.sk-badge`). The docs page's
 * `holderReact` code sample already references a `dot` prop that the component does not implement,
 * so a live demo for those two showcases is not possible without changing the component itself,
 * which is out of scope here.
 */
import { Badge } from "@skryensya/react/badge";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const BadgeDemo = framed(function BadgeDemo() {
  return (
    <div className="sk-inline">
      <Badge>Neutral</Badge>
      <Badge tone="accent">Accent</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
    </div>
  );
});
