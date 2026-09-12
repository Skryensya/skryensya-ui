import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE ANATOMY SPECIMEN: frozen open markup. A live Popover sits in the top layer behind `popover`
 * and dismisses on the first pointer press in an inert frame. No mount attributes and no `popover`
 * attribute (that UA rule would hide the panel). The positioner is forced back into flow in
 * `popoverAnatomyCss` so the panel contributes to Annotated's measured box.
 *
 * The positioner node also carries `sk-popover__content` (the emitter's `also`), so both classes
 * name the same painted surface; the diagram labels the content class.
 *
 * `data-state="open"` is a STYLING hook here, not a machine write: popover.css paints closed as
 * `opacity: 0` until `:popover-open`, and anchored.css hides the arrow until open. Without either
 * selector matching, the specimen was just a trigger. The anatomy CSS below forces the open paint;
 * this attribute is what makes the arrow's `visibility: visible` rule fire (same three-way open
 * test anchored.css uses for Menu/Tooltip/Popover).
 */
const popoverAnatomySpecimen = (t: Translate): string => `<div class="sk-popover">
  <button class="sk-popover__trigger sk-button sk-interactive sk-anchor" type="button" tabindex="-1" aria-expanded="true">
    ${t("demo.popover.trigger")}
  </button>
  <div class="sk-popover__positioner sk-popover__content sk-anchored" data-state="open" data-sk-placement="block-end">
    <span class="sk-anchored-arrow" aria-hidden="true"></span>
    <h2 class="sk-popover__title">Ada Lovelace</h2>
    <p class="sk-popover__description">${t("demo.popover.description")}</p>
    <p>${t("demo.popover.body")}</p>
    <button class="sk-popover__close sk-button sk-interactive" type="button" tabindex="-1">
      ${t("demo.popover.close")}
    </button>
  </div>
</div>`;

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

export const popoverAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("popoverPage.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${popoverAnatomySpecimen(t)}
  </div>
  ${label(".sk-popover", "block-start", "sk-popover", ' data-ring-placement="offset" data-ring-distance="8"')}
  ${label(".sk-popover__trigger", "inline-start", "sk-popover__trigger")}
  ${label(".sk-popover__content", "inline-start", "sk-popover__content")}
  ${label(".sk-anchored-arrow", "inline-end", "sk-anchored-arrow")}
  ${label(".sk-popover__title", "inline-end", "sk-popover__title", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-popover__description", "inline-end", "sk-popover__description", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-popover__close", "block-end", "sk-popover__close")}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

export const popoverAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-popover {
  display: inline-grid;
  justify-items: start;
  gap: var(--space-stack-md);
  inline-size: min(100%, 16rem);
}

/*
 * Back in flow, same reason as Menu: .sk-anchored is position:fixed, so out of flow the panel
 * contributes nothing to Annotated's measured box and the frame collapses to the trigger alone.
 * relative (not static): still in flow under the trigger, AND a containing block for the
 * absolute arrow below. Plain specificity beats the pattern rule (no !important).
 *
 * OPEN PAINT: .sk-popover__content defaults to opacity 0 / scaled / blurred until
 * :popover-open. This specimen has no popover attribute (UA closed-[popover] would hide it),
 * so the open look has to be forced here the way Menu forces data-state=open on its panel.
 */
.sk-annotated__subject > .sk-popover > .sk-popover__positioner {
  position: relative;
  inline-size: 100%;
  display: grid;
  gap: var(--space-stack-sm);
  opacity: 1;
  scale: 1;
  translate: 0 0;
  filter: blur(0);
  margin: 0;
  pointer-events: none;
}

/* Absolute against the static panel, not fixed against the viewport (the @supports path in
 * anchored.css). Top-centred on the panel's near edge so it still reads as the tip of the box. */
.sk-annotated__subject > .sk-popover > .sk-popover__positioner > .sk-anchored-arrow {
  position: absolute;
  inset-block-start: calc(-1 * var(--sk-anchored-arrow-size, 8px) / 2);
  inset-inline-start: 50%;
  translate: -50% 0;
  margin: 0;
}

.sk-annotated__subject {
  text-align: center;
}`;

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
            options: { tone: "accent", size: "sm" },
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
