/*
 * Live React demo for /components/popover. Self-contained island (no function props crossing the
 * Astro boundary), mounted directly from the page with `<PopoverDemo client:load />`.
 */
import { Popover } from "@skryensya/react/popover";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const PopoverDemo = framed(function PopoverDemo() {
  return (
    <Popover title="Ada Lovelace" description="Mathematician and writer." trigger="View profile" arrow>
      <a href="/people/ada">Open profile</a>
    </Popover>
  );
}, {viewport: "overlay"});
