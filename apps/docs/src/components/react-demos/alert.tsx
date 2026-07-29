/*
 * Live React demos for /components/alert. Each export is a self-contained island (no function
 * props crossing the Astro boundary), mounted directly from the page with a bare
 * `<AlertNeutralDemo client:load />`.
 */
import { Alert } from "@skryensya/react/alert";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

function SomeFunction() {}

export const AlertNeutralDemo = framed(function AlertNeutralDemo() {
  return (
    <Alert tone="neutral" title="Scheduled maintenance" onDismiss={SomeFunction}>
      On Sunday from 02:00 to 04:00 UTC the panel will be read-only.
    </Alert>
  );
});

export const AlertBannerDemo = framed(function AlertBannerDemo() {
  return (
    <Alert tone="info" title="New version">
      An update is available.
    </Alert>
  );
});

export const AlertAccentDemo = framed(function AlertAccentDemo() {
  return (
    <Alert
      onDismiss={SomeFunction}
      actions={
        <a className="sk-link sk-interactive" href="/en/first-component">
          View plans
        </a>
      }
      presentation="accent"
      title="Your plan expires in 3 days"
      tone="warning"
    >
      Choose a plan so as not to interrupt your deployments.
    </Alert>
  );
});

export const AlertInlineDemo = framed(function AlertInlineDemo() {
  return (
    <Alert presentation="inline" tone="success">
      Your changes have been saved.
    </Alert>
  );
});
