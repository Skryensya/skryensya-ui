/*
 * Live React demos for /components/accordion. Each export is a self-contained island (no function
 * props crossing the Astro boundary), mounted directly from the page with a bare
 * `<AccordionSingleDemo client:load />`.
 *
 * ALL THREE ISLANDS ARE STILL HERE because none of this page's four previews can be a usage tree.
 * There is no `src/demos/accordion.ts`; writing one would mean writing a demo the page does not
 * show. Two holes, both measured against `artifacts/ai-manifest.json` and confirmed by the
 * validator, and both of them are in TILE, not in Accordion — the Accordion family itself is fine:
 *
 * 1. `sk-tile__chevron` is a declared part of the `tile` contract that NO signature's template
 *    paints. It is not a class you can reach by choosing the right signature; there is no
 *    `TileChevron`, and the two `<span data-state="closed|open">` children it wraps are STRUCTURE,
 *    so no option or `attrs` can fill them either — `attrs` land on the host, never on a child.
 *    Every one of the four previews on this page ends its trigger with that chevron, and
 *    `tile.css` keys the open/closed swap on exactly `.sk-tile__chevron > [data-state]`.
 *
 * 2. `TileContent` DOES emit `sk-tile__title` and `sk-tile__description` (so the older note that
 *    "no signature emits them" is stale), but its `parents` list is
 *    `[TileLink, TileButton, TileCheckbox, TileSwitch, ExpandableTileTrigger]` — it omits
 *    `Accordion.Trigger`. The validator answers `invalid-parent`, so a title over a description
 *    inside an accordion item has no expression, even though React's `Accordion.Trigger` IS an
 *    `ExpandableTileTrigger` underneath and would render it correctly. One entry in one array.
 *
 * The fourth preview, "Details nativo", is blocked further back: there is no `details` family in
 * the catalogue at all, so `sk-details`, `sk-details__summary`, `sk-details__content` and
 * `sk-details-group` are unreachable the way anything unpublished is.
 *
 * What is NOT the blocker, in case the next reader assumes it: `defaultOpen` on `Accordion.Item`
 * works in both bindings. It emits `data-default-open` (which `Accordion.svelte` reads) and a
 * `defaultOpen` prop (which reaches the collapsible machine and renders `data-state="open"`).
 *
 * While these stay authored they carry the drift the tree exists to remove, and it is live today:
 * these islands are English-only but BOTH pages import them, so on `/componentes/accordion` the
 * Vanilla stage is Spanish and the React stage beside it is English. On top of that,
 * `AccordionMultipleDemo`'s two body paragraphs are shorter than the same demo's authored HTML, so
 * that preview's two stages measure 21px apart in both locales. Do not patch either by hand: a
 * fourth copy of these sentences is what the port is deleting. Fix the two holes above, then
 * delete this file.
 */
import { Accordion } from "@skryensya/react/accordion";
import { Icon } from "@skryensya/react/icon";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

function Chevron() {
  return (
    <span className="sk-tile__chevron" aria-hidden="true">
      <span data-state="closed">
        <Icon name="chevron-down" />
      </span>
      <span data-state="open">
        <Icon name="chevron-up" />
      </span>
    </span>
  );
}

export const AccordionSingleDemo = framed(function AccordionSingleDemo() {
  return (
    <Accordion type="single" defaultValue="environment">
      <Accordion.Item value="environment">
        <Accordion.Trigger>
          <span className="sk-tile__content">
            <span className="sk-tile__title">Environment</span>
            <span className="sk-tile__description">Production · Frankfurt</span>
          </span>
          <Chevron />
        </Accordion.Trigger>
        <Accordion.Content>
          <div className="sk-stack" data-gap="sm">
            <p className="sk-tile__description">
              Node 22 runs in three replicas behind the Frankfurt balancer. Traffic is distributed
              round-robin and a replica recycles itself if it fails two health checks in a row.
            </p>
            <p className="sk-tile__description">
              Secrets are injected at boot from the regional vault, so no sensitive value is left in
              the image or build log.
            </p>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
});

export const AccordionExclusiveDemo = framed(function AccordionExclusiveDemo() {
  return (
    <Accordion type="single" defaultValue="runtime">
      <Accordion.Item value="runtime">
        <Accordion.Trigger>
          <span className="sk-tile__content">
            <span className="sk-tile__title">Runtime</span>
            <span className="sk-tile__description">Version and region</span>
          </span>
          <Chevron />
        </Accordion.Trigger>
        <Accordion.Content>
          <div className="sk-stack" data-gap="sm">
            <p className="sk-tile__description">
              Node 22 on the Frankfurt shared pool. Each deployment reserves two vCPUs and 512 MB,
              with autoscaling up to six replicas when the request queue exceeds the threshold.
            </p>
            <p className="sk-tile__description">
              The healthcheck hits <code>/status</code> every ten seconds; three failures in a row
              take the replica out of the balancer without cutting off in-flight traffic.
            </p>
          </div>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="rollout">
        <Accordion.Trigger>
          <span className="sk-tile__content">
            <span className="sk-tile__title">Rollout</span>
            <span className="sk-tile__description">Canary by percentage</span>
          </span>
          <Chevron />
        </Accordion.Trigger>
        <Accordion.Content>
          <div className="sk-stack" data-gap="sm">
            <p className="sk-tile__description">
              The canary rises in three legs, 10%, 50% and 100%, and waits for the error and latency
              metrics to remain stable before advancing to each leg.
            </p>
            <p className="sk-tile__description">
              If a section degrades, the rollout stops by itself and notifies the guard channel:
              nothing advances without a green light.
            </p>
          </div>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="rollback">
        <Accordion.Trigger>
          <span className="sk-tile__content">
            <span className="sk-tile__title">Rollback</span>
            <span className="sk-tile__description">Previous stable version</span>
          </span>
          <Chevron />
        </Accordion.Trigger>
        <Accordion.Content>
          <p className="sk-tile__description">Restore v2.18.4 if the canary fails checks.</p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
});

export const AccordionMultipleDemo = framed(function AccordionMultipleDemo() {
  return (
    <Accordion type="multiple" defaultValue={["runtime", "rollout"]}>
      <Accordion.Item value="runtime">
        <Accordion.Trigger>
          <span className="sk-tile__content">
            <span className="sk-tile__title">Runtime</span>
            <span className="sk-tile__description">Version and region</span>
          </span>
          <Chevron />
        </Accordion.Trigger>
        <Accordion.Content>
          <div className="sk-stack" data-gap="sm">
            <p className="sk-tile__description">
              Node 22 on the Frankfurt shared pool. Each deployment reserves two vCPUs and 512 MB,
              with autoscaling up to six replicas.
            </p>
            <p className="sk-tile__description">
              The healthcheck hits <code>/status</code> every ten seconds; three failures in a row
              take the replica out of the balancer.
            </p>
          </div>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="rollout">
        <Accordion.Trigger>
          <span className="sk-tile__content">
            <span className="sk-tile__title">Rollout</span>
            <span className="sk-tile__description">Canary by percentage</span>
          </span>
          <Chevron />
        </Accordion.Trigger>
        <Accordion.Content>
          <div className="sk-stack" data-gap="sm">
            <p className="sk-tile__description">
              The canary rises in three legs, 10%, 50% and 100%, and waits for the error and latency
              metrics to remain stable before advancing to each leg.
            </p>
            <p className="sk-tile__description">
              If a section degrades, the rollout stops by itself and notifies the guard channel:
              nothing advances without a green light.
            </p>
          </div>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="rollback">
        <Accordion.Trigger>
          <span className="sk-tile__content">
            <span className="sk-tile__title">Rollback</span>
            <span className="sk-tile__description">Previous stable version</span>
          </span>
          <Chevron />
        </Accordion.Trigger>
        <Accordion.Content>
          <p className="sk-tile__description">Restore v2.18.4 if the canary fails checks.</p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
});
