/*
 * Live React demo for /components/split-button.
 */
import { SplitButton } from "@skryensya/react/split-button";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const SplitButtonDemo = framed(function SplitButtonDemo() {
  return (
    <SplitButton menuLabel="More options" menuItems={[{ label: "Save a copy", value: "save-copy" }]} onClick={() => {}}>
      Save
    </SplitButton>
  );
}, {viewport: "menu"});
