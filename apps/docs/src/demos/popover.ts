import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * A profile card behind a trigger, from the contract published for it.
 *
 * The authored version this replaces carried two inline anchor names,
 * `style="--sk-anchored-name: --profile-anchor"` on the trigger and on the panel, because until
 * recently nothing else could name an anchor without JS. The stylesheet scopes one static name now,
 * so the composition says nothing about anchoring at all, which is the point: where a panel opens is
 * the component's business, not the page's.
 */
export const popoverTree = (t: Translate): UsageTree => ({
  contract: "popover",
  signature: "Popover",
  options: { panelId: "profile-popover", arrow: true, closeLabel: t("demo.popover.close") },
  slots: {
    trigger: t("demo.popover.trigger"),
    title: "Ada Lovelace",
    description: t("demo.popover.description"),
    children: t("demo.popover.body"),
  },
});

/*
 * The same contract, past the point where `title`/`description` are enough: a header (who), a body
 * (what) and a footer (what to do about it), all inside `children`. The contract has no dedicated
 * header/footer slot, and does not need one, `children` already accepts a node, and a node is
 * composition, not prose. Built entirely from published signatures (Inline/Stack for the rows,
 * Avatar.initials, Text, Button.action), not a single hand-rolled class.
 *
 * `Popover.bare`, not `Popover`: `Popover`'s template renders a "Cerrar" button unconditionally,
 * with no `whenGiven` to opt out of it. A footer that already ends in its own dismiss action
 * ("Ignorar") does not need a second, unrelated close control appended under it. Light-dismiss and
 * Escape still close the panel either way, that part of the contract is the platform's, not the
 * button's. `Popover.bare` renders no title, no description and no close button, which is exactly
 * the shape this composition wants.
 */
export const popoverStructuredTree = (t: Translate): UsageTree => ({
  contract: "popover",
  signature: "Popover.bare",
  options: { panelId: "team-popover", arrow: true, bare: true },
  slots: {
    trigger: t("demo.popoverStructured.trigger"),
    children: [
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm" },
        children: [
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { size: "md", name: "Grace Hopper" },
            children: "GH",
          },
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              { contract: "typography", signature: "Text", options: { weight: "emphasis" }, children: "Grace Hopper" },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary", size: "sm" },
                children: t("demo.popoverStructured.role"),
              },
            ],
          },
        ],
      },
      {
        contract: "typography",
        signature: "Text",
        options: { size: "sm" },
        children: t("demo.popoverStructured.body"),
      },
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", justify: "end" },
        children: [
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost", size: "sm" },
            children: t("demo.popoverStructured.dismiss"),
          },
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "accent", size: "sm" },
            children: t("demo.popoverStructured.action"),
          },
        ],
      },
    ],
  },
});

/*
 * The four logical sides at once, `Popover.bare` rather than `Popover`: the point here is
 * `placement`, not chrome, and a title/close button on four panels in a row would be four times the
 * furniture and half the signal. Each trigger's label IS the option value it sets, so reading the
 * row reads the enum.
 *
 * Wrapped in two nested, padded `Box`es: the anchor engine flips a placement to the opposite side
 * when its preferred side has no room, and a trigger sitting flush against the preview stage's top
 * edge has no room above it: `block-start` would silently render as if it were `block-end`. One
 * `xl` Box (the scale's ceiling, 32px) measured 56px above the trigger against a 58px panel, six
 * pixels short; nesting a second one is real, published space, not a magic number chosen to win a
 * pixel count.
 */
export const popoverPlacementTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { padding: "xl" },
  children: {
    contract: "box",
    signature: "Box",
    options: { padding: "xl" },
    children: {
      contract: "layout",
      signature: "Inline",
      options: { gap: "md" },
      children: [
        {
          contract: "popover",
          signature: "Popover.bare",
          options: { panelId: "place-block-start", placement: "block-start", arrow: true, bare: true },
          slots: { trigger: "block-start", children: t("demo.popoverPlacement.blockStart") },
        },
        {
          contract: "popover",
          signature: "Popover.bare",
          options: { panelId: "place-block-end", placement: "block-end", arrow: true, bare: true },
          slots: { trigger: "block-end", children: t("demo.popoverPlacement.blockEnd") },
        },
        {
          contract: "popover",
          signature: "Popover.bare",
          options: { panelId: "place-inline-start", placement: "inline-start", arrow: true, bare: true },
          slots: { trigger: "inline-start", children: t("demo.popoverPlacement.inlineStart") },
        },
        {
          contract: "popover",
          signature: "Popover.bare",
          options: { panelId: "place-inline-end", placement: "inline-end", arrow: true, bare: true },
          slots: { trigger: "inline-end", children: t("demo.popoverPlacement.inlineEnd") },
        },
      ],
    },
  },
});
