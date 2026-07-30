/*
 * One live React island for /components/flyout. The other six demos on that page are usage trees
 * now (`src/demos/flyout.ts`), which emit their own island — this is the one that could not be.
 *
 * The placeholder shows only while the CURRENT VALUE matches no item, and the Flyout contract has no
 * way to set such a value: it maps `defaultValue` to `data-default-value`, which the Vanilla
 * enhancer never reads, and hands React a `string` where `FlyoutProps.defaultValue` is `string[]`.
 * So the demo whose whole subject is "no item is selected" stays authored, in both bindings.
 *
 * It takes its words as plain props because the tree-less demo would otherwise be the last place on
 * this page where Spanish and English are written twice — which is exactly the drift the trees came
 * to end. `framed()` serialises plain data into the frame, so a page passes `t(…)` straight in.
 */
import { Flyout } from "@skryensya/react/flyout";
import { Icon } from "@skryensya/react/icon";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const FlyoutPlaceholderDemo = framed(function FlyoutPlaceholderDemo({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <Flyout
      label={label}
      /* Deliberately not one of the three: this is the state the demo exists to show. */
      defaultValue={["custom"]}
      placeholder={placeholder}
      indicator={<Icon name="chevron-right" />}
      openIndicator={<Icon name="chevron-left" />}
      itemIndicator={<Icon name="check" />}
      options={[
        { value: "dawn", label: "Dawn" },
        { value: "dusk", label: "Dusk" },
        { value: "ember", label: "Ember" },
      ]}
    />
  );
}, { viewport: "menu" });
