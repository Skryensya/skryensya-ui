import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

const ACCENT_HEX = "1f5fc3";
const ON_ACCENT_HEX = "ffffff";
/*
 * 96, not the displayed avatar's own pixel size (32/40/48/64 for sm/md/lg/xl): dummyimage.com's
 * baked-in text does not scale proportionally with the requested canvas. A 160px canvas (the previous
 * value) drew the SAME roughly-fixed-size initials as a 64px one, just with more empty margin
 * around them, so at avatar scale the letters read as tiny and thin next to the real, properly
 * sized initials `Avatar.initials` renders as text. 96 keeps enough headroom for a retina lg
 * avatar (48px × 2) while drawing initials that are a much larger share of the square, measured.
 * The photo demo tops out at `lg` deliberately: an `xl` disc is 64px, and a retina one would want
 * a 128px canvas, which is where dummyimage's fixed-size text starts looking small again.
 */
const demoSrc = (initials: string) =>
  `https://dummyimage.com/96/${ACCENT_HEX}/${ON_ACCENT_HEX}?text=${initials}`;

/*
 * A fallback avatar's own background, straight from the base RAMP palette (Tier 1) rather than a
 * `--color-*` semantic token (Tier 2): this is one fixed hue with no status attached to it, not
 * "danger" or "success" wearing an avatar-shaped costume, so it has no semantic hook to reach for.
 * Written as an inline `style`, not a class in avatar.css, because that keeps the choice exactly
 * where it belongs: one demo's own decoration, not a new system default every consumer inherits.
 * `--sk-avatar-bg`/`--sk-avatar-fg` are the component's own hooks (avatar.css); overriding them
 * inline is the same escape hatch a consumer reskin uses, just authored on the tree instead of in a
 * stylesheet.
 */
const AVATAR_FALLBACK_STYLE = "--sk-avatar-bg: var(--palette-blue-600); --sk-avatar-fg: var(--palette-white);";

/*
 * Sixteen swatches, four steps off four semantic families (accent/danger/success/info). Enough hues
 * that no two neighbors read as "the same person's avatar, twice", and every step dark enough for
 * the white fallback ink to stay readable. Warning stays out because it runs lighter at comparable
 * stops, so mixing it in unevenly would have made a couple of avatars look washed out next to the
 * rest for no reason a reader could see.
 *
 * ORDERED FAMILY-BY-FAMILY ACROSS EACH ROW, not four blues then four reds, and the reason is
 * `AVATAR_COLOR_SIZES` below. That list walks the size scale in blocks of four, so a
 * family-contiguous palette would have laid one whole family under each size and painted an
 * accidental claim the demo does not make: blue is the big one, sky is the small one. Rotating the
 * step within each family instead (blue-400, red-500, emerald-600, sky-700, then blue-500, …) gives
 * every block of four one avatar from each family, uses each family/step pair exactly once across
 * the sixteen, and leaves size and hue visibly independent, which is the whole point of both being
 * separate hooks. It also fixes what the old contiguous order cost on its own terms: adjacent steps
 * of ONE hue (blue-400 beside blue-500) are exactly the "same person twice" this comment says the
 * palette exists to avoid.
 */
const AVATAR_PALETTE = [
  "blue-400", "red-500", "emerald-600", "sky-700",
  "blue-500", "red-600", "emerald-700", "sky-400",
  "blue-600", "red-700", "emerald-400", "sky-500",
  "blue-700", "red-400", "emerald-500", "sky-600",
] as const;

/** A-P: sixteen distinct one-letter identities, so sixteen different colors read as sixteen different people, not one repeated. */
const AVATAR_LETTERS = "ABCDEFGHIJKLMNOP".split("");

/*
 * Four of each: the REAL four tokens (avatar.css's `data-size`), in blocks large → small, not
 * sixteen invented pixel values. A "sizes" reader has to come away knowing there are four sizes,
 * not sixteen; this demo is about the COLOR hook, and reusing the real size scale keeps the two
 * concerns from bleeding into each other.
 *
 * Four-and-four-and-four-and-four rather than the old uneven 6/5/5, which was arithmetic left over
 * from a three-size scale dividing sixteen swatches. An even split is the thing a reader can
 * actually count off the screen, and it is the only arrangement that does not accidentally imply
 * one size matters more than another. It only reads that way because `AVATAR_PALETTE` is ordered to
 * cross the blocks rather than sit inside them; see its own comment.
 */
const AVATAR_COLOR_SIZES: readonly ("xl" | "lg" | "md" | "sm")[] = [
  "xl", "xl", "xl", "xl",
  "lg", "lg", "lg", "lg",
  "md", "md", "md", "md",
  "sm", "sm", "sm", "sm",
];


/** Group, disc, fallback and overflow: the stacked set with every avatar part present. */
export const avatarAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("avatar.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "avatar",
      signature: "AvatarGroup",
      options: { label: t("demo.avatar.groupLabel") },
      slots: {
        children: [
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { name: t("demo.avatar.personOne") },
            attrs: { style: AVATAR_FALLBACK_STYLE },
            children: "P1",
          },
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { name: t("demo.avatar.personTwo") },
            attrs: { style: AVATAR_FALLBACK_STYLE },
            children: "P2",
          },
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { name: t("demo.avatar.personThree") },
            attrs: { style: AVATAR_FALLBACK_STYLE },
            children: "P3",
          },
        ],
        overflow: "+1",
      },
    },
    items: [
      namePart(".sk-avatar-group", "block-start", { ringPlacement: "offset", ringDistance: 6 }),
      namePart(".sk-avatar", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-avatar__fallback", "inline-end"),
      namePart(".sk-avatar-group__overflow", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/** Photo identities, cropped by ImageFrame inside the Avatar contract. */
export const avatarImageTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", inlineAlign: "center" },
  attrs: { "aria-label": t("demo.avatar.imageLabel") },
  children: [
    {
      contract: "avatar",
      signature: "Avatar.image",
      options: { imageName: "Ada Lovelace", size: "sm", src: demoSrc("AL") },
    },
    {
      contract: "avatar",
      signature: "Avatar.image",
      options: { imageName: "Alan Turing", size: "md", src: demoSrc("AT") },
    },
    {
      contract: "avatar",
      signature: "Avatar.image",
      options: { imageName: "Grace Hopper", size: "lg", src: demoSrc("GH") },
    },
  ],
});

/** The same identity at all four sizes, so the scale reads as one avatar growing, not four. */
export const avatarSizesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", inlineAlign: "center" },
  attrs: { "aria-label": t("demo.avatar.sizesLabel") },
  children: [
    {
      contract: "avatar",
      signature: "Avatar.initials",
      options: { name: "Ada Lovelace", size: "sm" },
      attrs: { style: AVATAR_FALLBACK_STYLE },
      children: "AL",
    },
    {
      contract: "avatar",
      signature: "Avatar.initials",
      options: { name: "Ada Lovelace", size: "md" },
      attrs: { style: AVATAR_FALLBACK_STYLE },
      children: "AL",
    },
    {
      contract: "avatar",
      signature: "Avatar.initials",
      options: { name: "Ada Lovelace", size: "lg" },
      attrs: { style: AVATAR_FALLBACK_STYLE },
      children: "AL",
    },
    {
      contract: "avatar",
      signature: "Avatar.initials",
      options: { name: "Ada Lovelace", size: "xl" },
      attrs: { style: AVATAR_FALLBACK_STYLE },
      children: "AL",
    },
  ],
});

/*
 * Sixteen identities, each its own hue off the base palette, largest first: the same "color is a
 * styling hook" idea `avatarSizesTree` shows with one color, scaled up to the real reason a hook
 * exists there at all: "tinting avatars per person is the most ordinary thing an app does with
 * them" (avatar.css). Rings each disc in the surface color, `box-shadow: 0 0 0 2px
 * var(--color-bg-surface)`, the EXACT rule `.sk-avatar-group` already uses to separate its own
 * overlapping discs (avatar.css): these avatars never overlap, but the same ring still reads as
 * "this component's own chrome", not sixteen mismatched swatches, so the two examples feel like one
 * family instead of two different demos that happen to share a page.
 */
export const avatarColorsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", inlineAlign: "center" },
  attrs: { "aria-label": t("demo.avatar.colorsLabel") },
  children: AVATAR_PALETTE.map((swatch, index) => {
    const letter = AVATAR_LETTERS[index];
    return {
      contract: "avatar",
      signature: "Avatar.initials",
      options: { name: t("demo.avatar.colorPersonName", { letter }), size: AVATAR_COLOR_SIZES[index] },
      attrs: {
        style: `--sk-avatar-bg: var(--palette-${swatch}); --sk-avatar-fg: var(--palette-white); box-shadow: 0 0 0 2px var(--color-bg-surface);`,
      },
      children: letter,
    };
  }),
});

/** A capped group: three identities visible, the rest collapsed into a "+N" counter. */
export const avatarGroupTree = (t: Translate): UsageTree => ({
  contract: "avatar",
  signature: "AvatarGroup",
  options: { label: t("demo.avatar.groupLabel") },
  slots: {
    children: [
      {
        contract: "avatar",
        signature: "Avatar.initials",
        options: { name: t("demo.avatar.personOne") },
        children: "P1",
      },
      {
        contract: "avatar",
        signature: "Avatar.initials",
        options: { name: t("demo.avatar.personTwo") },
        children: "P2",
      },
      {
        contract: "avatar",
        signature: "Avatar.initials",
        options: { name: t("demo.avatar.personThree") },
        children: "P3",
      },
    ],
    overflow: "+1",
  },
});

/*
 * AN AVATAR IN SOMETHING, which is the state every other demo on this page deliberately is not.
 *
 * The four above are specimens: discs in a bare row, which is the right way to compare a size ramp
 * or sixteen tints and the wrong way to answer "what do I actually write". This one is the
 * molecule, and it is the published one: `Inline` holding the avatar next to a `Stack` of two
 * `Text`s, name over role, exactly the shape `hero-with-testimonial` already ships (get_examples).
 * Adapted rather than invented, so the page teaches the pattern the rest of the kit uses instead of
 * a second one that only exists here.
 *
 * Two `Text`s and not one string with a comma, for that example's own reason: a screen reader
 * announces the name and the role as two separate facts, in the order a sighted reader's eye takes
 * them. `weight: "emphasis"` on the name, `tone: "secondary"` on the role.
 *
 * `xl`, and this is the demo that earns it: a 64px disc is the profile PORTRAIT, the one place an
 * avatar is the subject of its own box rather than a marker sitting beside a row of text. At `md`
 * this same molecule is a comment header or a list row; the shape does not change with the size,
 * which is the other thing worth showing.
 */
export const avatarProfileTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { padding: "md", surface: "surface", border: "subtle" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "md", inlineAlign: "center" },
      children: [
        {
          contract: "avatar",
          signature: "Avatar.initials",
          options: { name: "Ada Lovelace", size: "xl" },
          attrs: { style: AVATAR_FALLBACK_STYLE },
          children: "AL",
        },
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "none", align: "start" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { weight: "emphasis" },
              children: "Ada Lovelace",
            },
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary", size: "sm" },
              children: t("demo.avatar.profileRole"),
            },
          ],
        },
      ],
    },
  ],
});
