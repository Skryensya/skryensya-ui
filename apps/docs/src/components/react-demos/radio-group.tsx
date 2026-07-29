/*
 * Live React demos for /components/radio-group. Each export is a self-contained island (no
 * function props crossing the Astro boundary), mounted directly from the page.
 */
import { RadioGroup } from "@skryensya/react/radio-group";
import { TileRadioGroup } from "@skryensya/react/tile-radio-group";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const RadioGroupDemo = framed(function RadioGroupDemo() {
  return (
    <RadioGroup
      name="plan"
      defaultValue="pro"
      items={[
        { value: "basic", label: "Basic" },
        { value: "pro", label: "Professional" },
      ]}
      onValueChange={() => {}}
    />
  );
});

export const TileRadioGroupDemo = framed(function TileRadioGroupDemo() {
  return (
    <TileRadioGroup
      className="plan-tiles"
      orientation="horizontal"
      name="plan"
      defaultValue="pro"
      items={[
        { value: "basic", children: "Basic" },
        { value: "pro", children: "Professional" },
      ]}
      onValueChange={() => {}}
    />
  );
});
