/*
 * Live React demo for /components/number-field. Self-contained island (no function props crossing
 * the Astro boundary), mounted directly from the page with `<NumberFieldDemo client:visible />`.
 */
import { NumberField } from "@skryensya/react/number-field";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn("number-field");

export const NumberFieldDemo = framed(function NumberFieldDemo() {
  return <NumberField defaultValue="2" label="Quantity" min={0} step={1} />;
});
