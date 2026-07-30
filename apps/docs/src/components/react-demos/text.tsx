/*
 * Live React demo for the authored Text inline stage. Other Text demos are tree-driven; inline
 * stays an island because the point is `<strong>` inside the paragraph.
 */
import { Text } from "@skryensya/react/text";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const TextInlineDemo = framed(function TextInlineDemo() {
  return (
    <Text>
      The <strong>Pro</strong> plan includes five active environments and preserves the reading flow
      within the same paragraph.
    </Text>
  );
});
