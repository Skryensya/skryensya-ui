/*
 * Live React demos for /components/flyout. Each export is a self-contained island (no function
 * props crossing the Astro boundary), mounted directly from the page with a bare
 * `<FlyoutBasicDemo client:load />`.
 */
import { Flyout } from "@skryensya/react/flyout";
import { Icon } from "@skryensya/react/icon";
import { Stack } from "@skryensya/react/layout";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const chevrons = {
  indicator: <Icon name="chevron-right" />,
  openIndicator: <Icon name="chevron-left" />,
  itemIndicator: <Icon name="check" />,
};

export const FlyoutBasicDemo = framed(function FlyoutBasicDemo() {
  return (
    <Flyout
      label="Plan"
      defaultValue={["starter"]}
      {...chevrons}
      options={[
        { value: "starter", label: "Starter" },
        { value: "pro", label: "Pro" },
        { value: "enterprise", label: "Enterprise" },
      ]}
    />
  );
}, {viewport: "menu"});

export const FlyoutRailDemo = framed(function FlyoutRailDemo() {
  return (
    <div style={{ inlineSize: "13.5rem", maxInlineSize: "100%" }}>
      <Flyout
        label="Densidad"
        defaultValue={["1"]}
        {...chevrons}
        options={[
          { value: "0.5", label: "Condensada" },
          { value: "0.6", label: "Densa" },
          { value: "0.8", label: "Compacta" },
          { value: "1", label: "Chest of drawers" },
          { value: "1.2", label: "Amplia" },
        ]}
      />
    </div>
  );
}, {viewport: "menu"});

export const FlyoutExclusiveDemo = framed(function FlyoutExclusiveDemo() {
  return (
    <Stack gap="md" style={{ inlineSize: "13.5rem" }}>
      <Flyout
        label="Densidad"
        defaultValue={["1"]}
        {...chevrons}
        options={[
          { value: "0.5", label: "Condensada" },
          { value: "1", label: "Chest of drawers" },
          { value: "1.2", label: "Amplia" },
        ]}
      />
      <Flyout
        label="Redondez"
        defaultValue={["1"]}
        {...chevrons}
        options={[
          { value: "0", label: "Recta" },
          { value: "1", label: "Suave" },
          { value: "2", label: "Redonda" },
        ]}
      />
    </Stack>
  );
}, {viewport: "menu"});

export const FlyoutDisabledItemDemo = framed(function FlyoutDisabledItemDemo() {
  return (
    <Flyout
      label="Region"
      defaultValue={["eu"]}
      {...chevrons}
      options={[
        { value: "eu", label: "Europa" },
        { value: "us", label: "America" },
        { value: "apac", label: "Asia-Pacific", disabled: true },
        { value: "latam", label: "Latin America" },
      ]}
    />
  );
}, {viewport: "menu"});

export const FlyoutDisabledDemo = framed(function FlyoutDisabledDemo() {
  return (
    <Flyout
      label="Plan"
      defaultValue={["pro"]}
      disabled
      {...chevrons}
      options={[
        { value: "starter", label: "Starter" },
        { value: "pro", label: "Pro" },
        { value: "enterprise", label: "Enterprise" },
      ]}
    />
  );
}, {viewport: "menu"});

export const FlyoutLongDemo = framed(function FlyoutLongDemo() {
  return (
    <Flyout
      label="Idioma"
      defaultValue={["es"]}
      {...chevrons}
      options={[
        { value: "es", label: "Spanish" },
        { value: "en", label: "English" },
        { value: "pt", label: "Português" },
        { value: "fr", label: "Français" },
        { value: "de", label: "Deutsch" },
        { value: "it", label: "Italiano" },
        { value: "nl", label: "Nederlands" },
        { value: "pl", label: "Polski" },
        { value: "sv", label: "Svenska" },
        { value: "ja", label: "日本語" },
      ]}
    />
  );
}, {viewport: "menu"});

export const FlyoutPlaceholderDemo = framed(function FlyoutPlaceholderDemo() {
  return (
    <Flyout
      label="Tema"
      placeholder="Personalizado"
      {...chevrons}
      options={[
        { value: "dawn", label: "Dawn" },
        { value: "dusk", label: "Dusk" },
        { value: "ember", label: "Ember" },
      ]}
    />
  );
}, {viewport: "menu"});
