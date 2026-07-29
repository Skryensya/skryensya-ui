/*
 * Live React demo for /components/slider. Uncontrolled sliders backed by the Slider component's
 * own internal state; onValueChange is a no-op since function props can't cross the island boundary.
 */
import { Slider } from "@skryensya/react/slider";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const SliderDemo = framed(function SliderDemo() {
  return (
    <div className="sk-inline">
      <Slider aria-label="Volumen" defaultValue={65} onValueChange={() => {}} />
      <Slider aria-label="Brillo" defaultValue={30} disabled />
    </div>
  );
});
