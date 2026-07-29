/*
 * Live React demos for /components/icon. Each export is a self-contained island (no function props
 * crossing the Astro boundary), mounted directly from the page with a bare `<IconBasicDemo client:load />`.
 */
import { Icon } from "@skryensya/react/icon";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const IconBasicDemo = framed(function IconBasicDemo() {
  return (
    <div className="sk-inline">
      <Icon name="search" size="lg" />
      <Icon name="settings" size="lg" />
      <Icon name="warning" size="lg" />
      <Icon name="check" size="lg" />
      <Icon name="close" size="lg" />
    </div>
  );
});

export const IconSizeDemo = framed(function IconSizeDemo() {
  return (
    <div className="sk-inline">
      <Icon name="check" size="sm" />
      <Icon name="check" />
      <Icon name="check" size="lg" />
    </div>
  );
});
