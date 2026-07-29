/*
 * Live React demos for /components/accordion. Each export is a self-contained island (no function
 * props crossing the Astro boundary), mounted directly from the page with a bare
 * `<AccordionSingleDemo client:load />`.
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
