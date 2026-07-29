/*
 * Live React demo for /components/time-field. TimeField owns its own uncontrolled state
 * internally (defaultValue), so no lifted state is needed here.
 */
import { TimeField } from "@skryensya/react/time-field";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const TimeFieldDemo = framed(function TimeFieldDemo() {
  return <TimeField defaultValue="09:30" label="Departure" locale="en-US" name="departure" />;
});
