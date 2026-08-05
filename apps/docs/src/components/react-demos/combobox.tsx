/*
 * Live React demo for /components/combobox. Self-contained island (no function props crossing the
 * Astro boundary), mounted directly from the page with a bare `<ComboboxBasicDemo client:load />`.
 */
import { Combobox } from "@skryensya/react/combobox";
import { Icon } from "@skryensya/react/icon";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn(import.meta.url);

const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const countryNames = [
  "Argentina", "Bolivia", "Brazil", "Canada", "Chile", "Colombia", "Ecuador",
  "France", "Germany", "Italy", "Japan", "Mexico", "Paraguay", "Peru",
  "Portugal", "Spain", "United Kingdom", "United States", "Uruguay", "Venezuela",
];

const countries = countryNames.map((name) => ({ label: name, value: slug(name) }));

export const ComboboxBasicDemo = framed(function ComboboxBasicDemo() {
  return (
    <Combobox
      label="Country"
      hint="Write to filter. Use the arrows to scroll."
      placeholder="Search country"
      items={countries}
      clearIndicator={<Icon name="close" />}
      itemIndicator={<Icon name="check" />}
      triggerIndicator={<Icon name="chevron-down" />}
    />
  );
}, {viewport: "menu"});
