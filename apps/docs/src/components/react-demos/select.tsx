/*
 * Live React demos for /components/select. Each export is a self-contained island (no function
 * props crossing the Astro boundary), mounted directly from the page with a bare
 * `<SelectBasicDemo client:load />`.
 */
import { Icon } from "@skryensya/react/icon";
import { NativeSelect } from "@skryensya/react/select-native";
import { Select } from "@skryensya/react/select";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const SelectBasicDemo = framed(function SelectBasicDemo() {
  return (
    <Select
      label="Plan"
      name="plan"
      defaultValue={["starter"]}
      indicator={<Icon name="chevron-down" />}
      openIndicator={<Icon name="chevron-up" />}
      itemIndicator={<Icon name="check" />}
      options={[
        { value: "starter", label: "Starter" },
        { value: "pro", label: "Pro" },
        { value: "enterprise", label: "Enterprise" },
      ]}
    />
  );
}, {viewport: "menu"});

export const NativeSelectDemo = framed(function NativeSelectDemo() {
  return (
    <NativeSelect
      aria-label="Plan"
      name="plan"
      options={[
        { value: "starter", label: "Starter" },
        { value: "pro", label: "Pro" },
      ]}
    />
  );
}, {viewport: "menu"});
