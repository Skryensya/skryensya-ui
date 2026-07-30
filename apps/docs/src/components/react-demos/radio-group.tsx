/*
 * Live React demo for /components/radio-group. A self-contained island (no function props crossing
 * the Astro boundary), mounted directly from the page.
 *
 * Only TileRadioGroup is left. The plain RadioGroup demo is a usage tree now — see
 * `src/demos/radio-group.ts`. This one cannot follow: it writes `sk-tile__title` and
 * `sk-tile__description`, and no signature emits either, so the composition has nothing to say.
 */
import { TileRadioGroup } from "@skryensya/react/tile-radio-group";
import { framedIn } from "./framed";

/** The demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

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
