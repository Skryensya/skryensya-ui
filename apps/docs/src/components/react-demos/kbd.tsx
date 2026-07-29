/*
 * Live React demos for /components/kbd. Each export is a self-contained island (no function props
 * crossing the Astro boundary), mounted directly from the page with a bare `<KbdBasicDemo client:load />`.
 */
import { Kbd } from "@skryensya/react/kbd";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const KbdBasicDemo = framed(function KbdBasicDemo() {
  return (
    <div className="sk-inline">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>↵</Kbd>
    </div>
  );
});
