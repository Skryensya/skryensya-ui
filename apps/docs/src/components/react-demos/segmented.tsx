/*
 * Live React demo for /components/segmented. Self-contained island: the current selection is
 * local state, kept entirely inside the demo (no function props cross the Astro boundary).
 */
import { useState } from "react";
import { SegmentedControl } from "@skryensya/react/segmented";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const SegmentedDemo = framed(function SegmentedDemo() {
  const [range, setRange] = useState("day");
  return (
    <SegmentedControl
      aria-label="Rango"
      value={range}
      onValueChange={setRange}
      options={[
        { value: "day", label: "Day" },
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
      ]}
    />
  );
});
