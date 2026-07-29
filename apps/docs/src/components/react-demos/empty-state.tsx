/*
 * Live React demo for /components/empty-state. Self-contained island (no function props crossing
 * the Astro boundary), mounted directly from the page with a bare `<EmptyStateBasicDemo client:load />`.
 */
import { EmptyState } from "@skryensya/react/empty-state";
import { Icon } from "@skryensya/react/icon";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const EmptyStateBasicDemo = framed(function EmptyStateBasicDemo() {
  return (
    <EmptyState
      title="There are no projects yet"
      description="Create the first one to organize the work."
      icon={<Icon name="search" />}
      actions={
        <button type="button" onClick={() => {}}>
          Crear proyecto
        </button>
      }
    />
  );
});
