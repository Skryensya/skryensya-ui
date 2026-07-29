/*
 * Live React demo for /components/popup. Self-contained island (no function props crossing the
 * Astro boundary), mounted directly from the page with `<PopupDemo client:load />`.
 */
import { Popup } from "@skryensya/react/popup";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const PopupDemo = framed(function PopupDemo() {
  return (
    <Popup trigger="Filtros" arrow>
      <label>
        <input type="checkbox" /> Active only
      </label>
    </Popup>
  );
}, {viewport: "menu"});
