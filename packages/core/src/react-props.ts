import type { ComponentContract, ContractOption, ContractSignature } from "./contract.js";
import { signatureOptions } from "./contract.js";
import { parseInlineStyle } from "./inline-style.js";
import type { UsageTree } from "./usage-tree.js";

/*
 * `attrs` reach the host element untouched, which is right for markup and wrong for JSX: React
 * spells a handful of HTML attributes in camelCase and warns on the hyphenated form. The snippet a
 * page shows is meant to be pasted, so it has to be the React spelling: `tabindex="0"` on a
 * TableScroll printed a console warning in every table demo.
 *
 * In Core rather than in the emitter because BOTH React paths need it and must agree: the printed
 * snippet (`@skryensya/ai-compiler`) and the live island (`@skryensya/react`) have to rename the
 * same handful, or the snippet stops describing the stage beside it.
 */
const JSX_PROP_NAMES: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  accesskey: "accessKey",
  autocapitalize: "autoCapitalize",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  cellpadding: "cellPadding",
  cellspacing: "cellSpacing",
  colspan: "colSpan",
  contenteditable: "contentEditable",
  crossorigin: "crossOrigin",
  datetime: "dateTime",
  enctype: "encType",
  formaction: "formAction",
  inputmode: "inputMode",
  maxlength: "maxLength",
  minlength: "minLength",
  novalidate: "noValidate",
  readonly: "readOnly",
  rowspan: "rowSpan",
  spellcheck: "spellCheck",
  srcset: "srcSet",
  tabindex: "tabIndex",
  usemap: "useMap",
};

/** The React spelling of an authored attribute name. */
export function jsxPropName(attr: string): string {
  // `aria-*` and `data-*` keep their hyphens in JSX; everything else may need the camelCase name.
  if (attr.startsWith("aria-") || attr.startsWith("data-")) return attr;
  return JSX_PROP_NAMES[attr.toLowerCase()] ?? attr;
}

/** One prop a React binding receives, with the declaration it came from when it came from one. */
export type ResolvedReactProp = {
  /** The binding's own name for it: `declared.prop ?? option`, or the React spelling of an attr. */
  readonly name: string;
  /** The REAL value, not a serialization of it: a number stays a number, a boolean a boolean. */
  readonly value: unknown;
  /** The option this came from. Absent for an authored `attrs` entry, which has no declaration. */
  readonly option?: ContractOption;
};

export type ResolvedReactProps = {
  /** In the contract's declaration order, then the authored attrs. That order is what gets printed. */
  readonly props: readonly ResolvedReactProp[];
  /** Merged from every `styleProperty` option and then from an authored `attrs.style`. */
  readonly style: Readonly<Record<string, string | number>> | undefined;
};

/*
 * ONE RESOLUTION, TWO ADAPTERS.
 *
 * There are two React paths over a usage tree: the printed snippet (`@skryensya/ai-compiler`'s
 * `renderJsx`) and the live island (`@skryensya/react`'s `renderTree`). They were two walks making
 * the same decisions in the same order, and each shipped a bug the other had already fixed:
 * `styleProperty` options never reaching Sidebar's `minInlineSize`; an authored `style` string
 * handed to React as a string, which it throws on; and a number printed as `defaultValue="65"`
 * while the island beside it passed `65`. The last one is why this returns REAL VALUES and leaves
 * every question of how to spell them to the caller: a serializer that receives `65` cannot print
 * a string by accident, whereas one that reconstructs the value from a tree can, and did.
 *
 * It resolves ONE NODE. Recursion stays with the callers because they genuinely differ: the island
 * needs React keys and child elements, the snippet needs depth, indentation and line wrapping. This
 * is the same cut `flattenCollectionEntry` already makes for collection entries, where `resolveLeaf`
 * is the caller's and the walk around it is shared.
 *
 * DECLARATION-DRIVEN, not usage-driven. The island used to iterate the options a tree GAVE; this
 * iterates the ones the signature DECLARES, which is what makes the emitted order stable. Nothing
 * is lost: an option a signature does not declare is already a hard `unknown-option` error from
 * `validateUsageTree`, so it cannot reach either binding in a valid tree.
 *
 * DEFAULTS ARE NOT FILLED, deliberately. Neither path fills them today (`fillDefaults` belongs to
 * markup emission, and the docs pass `false` so a reader copies only what an author would write),
 * and a React component resolves its own defaults at render time anyway.
 */
export function resolveReactProps(
  tree: UsageTree,
  contract: ComponentContract,
  signature: ContractSignature,
): ResolvedReactProps {
  const props: ResolvedReactProp[] = [];
  const style: Record<string, string | number> = {};

  for (const [option, declared] of signatureOptions(contract, signature)) {
    const value = tree.options?.[option];
    if (value === undefined) continue;

    if (declared.styleProperty) {
      style[declared.styleProperty] = typeof value === "number" ? value : String(value);
      /*
       * ALSO the named prop, under the OPTION's own key rather than `declared.prop`: a
       * `styleProperty` says where the value lands in markup, not how a React component wants to
       * receive it, and some components (Sidebar's `minInlineSize`) take it as an ordinary prop and
       * build their own style entry from it. Passing both costs nothing for a component that only
       * reads `style` (Carousel), and is the only way one that reads the prop ever sees the value.
       */
      props.push({ name: option, value, option: declared });
      continue;
    }

    props.push({ name: declared.prop ?? option, value, option: declared });
  }

  for (const [attr, value] of Object.entries(tree.attrs ?? {})) {
    /*
     * An authored `attrs.style` is applied AFTER the option styles, so it wins a collision. The two
     * paths used to disagree here: the snippet printed one object literal with the authored
     * declarations last (last key wins, so the author won) while the island spread `optionStyle`
     * over the authored one (so the option won). Same tree, two different paintings. The author's
     * explicit escape hatch is the more specific of the two, so that is the one kept.
     */
    if (attr === "style") {
      for (const [property, declaration] of parseInlineStyle(value)) style[property] = declaration;
      continue;
    }
    props.push({ name: jsxPropName(attr), value });
  }

  return { props, style: Object.keys(style).length > 0 ? style : undefined };
}
