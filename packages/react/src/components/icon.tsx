/*
 * React's icon renderer.
 *
 * React renders, it does not hydrate (decision 14), which is why there is a component here and
 * nothing in @skryensya/vanilla. It is not an omission: the vanilla layer exists for the behavior the
 * platform does not give, and an icon has no behavior. A vanilla consumer writes the `<svg>` by hand;
 * the markup contract is documented and never shipped (decision 8).
 */
import { renderIconBox, type IconData, type IconSet, type IconSize, type StableIconName } from "@skryensya/core/icon";
import { phosphorIcons } from "@skryensya/icons-phosphor";
import { createContext, useContext, type ReactNode, type SVGAttributes } from "react";

/*
 * The bound set. It goes through context and not through a prop because the foundational components
 * (select, tile, sidebar) consume roles internally and passing them down would be drilling through the
 * whole tree.
 *
 * And it goes through context and not a global module registry because the site, the real consumer
 * (decision 12), will want to show two sets on the same page, and a module variable can only hold one.
 *
 * The default is Phosphor: `<Icon name="close" />` draws with no configuration (decision 15, revised).
 * The price is that Phosphor, and only Phosphor, travels in every React consumer's bundle, just like
 * `brands/default.scss` travels in core. Stepping outside the default is still opt-in: you install
 * `@skryensya/icons-lucide` or `@skryensya/icons-material` and wrap the tree in
 * `<IconSetProvider set={…}>`. Those two are NOT bundled until they are imported.
 */
const IconSetContext = createContext<IconSet>(phosphorIcons);

export type IconSetProviderProps = {
  /** The set that occupies the stable vocabulary. Binding it is the same as choosing a brand. */
  set: IconSet;
  children: ReactNode;
};

export function IconSetProvider({ set, children }: IconSetProviderProps) {
  return <IconSetContext.Provider value={set}>{children}</IconSetContext.Provider>;
}

type IconBaseProps = Omit<
  SVGAttributes<SVGSVGElement>,
  // the renderer writes them; letting them through lets the consumer break accessibility and the viewBox
  "children" | "dangerouslySetInnerHTML" | "role" | "aria-label" | "aria-hidden" | "focusable" | "viewBox"
> & {
  /**
   * The accessible name. With a label the icon is content (`role="img"`); without a label it is
   * decorative (`aria-hidden`).
   *
   * An icon inside a control with text is decorative: the text already names the action. An icon ALONE
   * inside a button is too: the accessible name belongs to the button (`aria-label`), not to the svg.
   * The label here is for the icon that stands alone and means something by itself.
   */
  label?: string;
  size?: IconSize;
};

/*
 * `name` or `data`, never both; the discriminated union IS the distinction the original proposal split
 * between <Icon> and <SetIcon> (decision 15).
 *
 *   name → a system role, portable, survives a change of set
 *   data → project geometry, coupled on purpose, and the consumer's
 *
 * There is no SetIcon because it would be the system typing a tenant's vocabulary (decision 2). An app
 * that wants names for its icons writes its own three-line wrapper over `data`.
 */
export type IconProps = IconBaseProps &
  ({ name: StableIconName; data?: never } | { data: IconData; name?: never });

export function Icon({ name, data, label, size = "md", className, ...props }: IconProps) {
  // The context always has a set: Phosphor by default, or whichever an IconSetProvider higher up binds.
  // `data` does not read the context, it is project geometry, portable without a set (decision 15).
  const set = useContext(IconSetContext);
  const icon = name !== undefined ? set[name] : data!;

  // The box is computed once, in core, as data: presentation are the set's attrs (without the keys the
  // box reserves), box is what the binding dictates. This component is only the adapter to JSX.
  const { presentation, box, body } = renderIconBox({ icon, dataIcon: name, size, label, className });

  // presentation first (fill/stroke), then the consumer's props, then the box, which wins. In JSX the
  // last spread overrides, so this order reproduces the exact precedence: a set cannot touch the viewBox
  // or the a11y, and the consumer can override fill/stroke but not the contract.
  const boxProps: Record<string, string> = {};
  for (const [k, v] of box) boxProps[k === "class" ? "className" : k] = v;

  // `presentation` is the set's raw attrs (`stroke-width`, `stroke-linecap`, …), correct as literal
  // HTML attribute names for vanilla's own `setAttribute` calls, but React's SVG props expect the
  // DOM property spelling (`strokeWidth`) for the multi-word ones: spread as-is, a glyph carrying one
  // of these (an outlined arrow, say) renders with React warning "Invalid DOM property" and dropping
  // the attribute silently, which is a real bug, not a lint nit  -  the icon paints thinner than the
  // set drew it. `fill`/`stroke` themselves are already single words, so the replace is a no-op there.
  const presentationProps: Record<string, string> = {};
  for (const [k, v] of presentation) {
    presentationProps[k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  }

  return (
    <svg
      {...presentationProps}
      {...props}
      {...boxProps}
      // The body is trusted by contract: authored or build-time geometry, never from a user or an API
      // (decision 15, "the stated cost"). Today that is a type convention, not a rule the validator
      // enforces.
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
