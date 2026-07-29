/*
 * Live React demos for /components/breadcrumb. Each export is a self-contained island: `Breadcrumb`
 * takes only data (`items`), no function props, so every demo is a plain data literal.
 */
import { Breadcrumb } from "@skryensya/react/breadcrumb";
import { Icon } from "@skryensya/react/icon";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const BreadcrumbTwoLevelDemo = framed(function BreadcrumbTwoLevelDemo() {
  return (
    <Breadcrumb
      items={[
        { href: "/en", label: "Home" },
        { label: "Projects", current: true },
      ]}
    />
  );
});

export const BreadcrumbMultiLevelDemo = framed(function BreadcrumbMultiLevelDemo() {
  return (
    <Breadcrumb
      items={[
        { href: "/en", label: "Home" },
        { href: "/en/projects", label: "Projects" },
        { href: "/en/projects/kit-digital", label: "Kit Digital" },
        { label: "Settings", current: true },
      ]}
    />
  );
});

export const BreadcrumbIconSeparatorDemo = framed(function BreadcrumbIconSeparatorDemo() {
  return (
    <Breadcrumb
      separator={<Icon name="chevron-right" />}
      items={[
        { href: "/en", label: "Home" },
        { href: "/en/projects", label: "Projects" },
        { label: "Kit Digital", current: true },
      ]}
    />
  );
});

export const BreadcrumbLongLabelsDemo = framed(function BreadcrumbLongLabelsDemo() {
  return (
    <Breadcrumb
      items={[
        { href: "/en", label: "Home" },
        {
          href: "/en/projects",
          label: "Migration from vanilla layer to Svelte components",
        },
        {
          label: "Zag machines shared between vanilla layer and Svelte components",
          current: true,
        },
      ]}
    />
  );
});
