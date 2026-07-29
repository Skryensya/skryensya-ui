/*
 * Live React demos for /components/steps.
 */
import { Steps } from "@skryensya/react/steps";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const StepsDemo = framed(function StepsDemo() {
  return (
    <Steps
      current={1}
      steps={[
        { label: "Choose a brand", description: "Your chromatic intent" },
        { label: "Define ramps", description: "Export each position" },
        { label: "Audit contrast", description: "Test each color pair" },
        { label: "Export", description: "Publish the contract" },
      ]}
    />
  );
});

export const StepsVerticalDemo = framed(function StepsVerticalDemo() {
  return (
    <Steps
      current={1}
      data-orientation="vertical"
      steps={[
        { label: "Account", description: "Sign-in details" },
        { label: "Shipping", description: "Delivery address" },
        { label: "Payment", description: "Method and billing" },
      ]}
    />
  );
});
