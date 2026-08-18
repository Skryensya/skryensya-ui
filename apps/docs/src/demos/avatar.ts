import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const ACCENT_HEX = "1f5fc3";
const ON_ACCENT_HEX = "ffffff";
/*
 * 96, not the displayed avatar's own pixel size (32/40/48 for sm/md/lg): dummyimage.com's baked-in
 * text does not scale proportionally with the requested canvas — a 160px canvas (the previous
 * value) drew the SAME roughly-fixed-size initials as a 64px one, just with more empty margin
 * around them, so at avatar scale the letters read as tiny and thin next to the real, properly
 * sized initials `Avatar.initials` renders as text. 96 keeps enough headroom for a retina lg
 * avatar (48px × 2) while drawing initials that are a much larger share of the square, measured.
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
const AVATAR_FALLBACK_STYLE = "--sk-avatar-bg: var(--ramp-accent-600); --sk-avatar-fg: var(--ramp-neutral-0);";

/*
 * Sixteen swatches, four steps off four ramp families (accent/danger/success/info) — enough hues
 * that no two neighbors read as "the same person's avatar, twice", and every step dark enough for
 * the white fallback ink to stay readable (measured: below ~65% L). Not five families × ~3 steps:
 * `warning`'s own ramp runs lighter at every step than the other four (its 600 is closer to their
 * 400), so mixing it in unevenly would have made a couple of avatars look washed out next to the
 * rest for no reason a reader could see.
 */
const AVATAR_PALETTE = [
  "accent-400", "accent-500", "accent-600", "accent-700",
  "danger-400", "danger-500", "danger-600", "danger-700",
  "success-400", "success-500", "success-600", "success-700",
  "info-400", "info-500", "info-600", "info-700",
] as const;

/** A-P: sixteen distinct one-letter identities, so sixteen different colors read as sixteen different people, not one repeated. */
const AVATAR_LETTERS = "ABCDEFGHIJKLMNOP".split("");

/*
 * Six `lg`, five `md`, five `sm`: the REAL three tokens (avatar.css's `data-size`), in blocks large
 * → small, not sixteen invented pixel values. A "sizes" reader has to come away knowing there are
 * three sizes, not sixteen; this demo is about the COLOR hook, and reusing the real size scale
 * keeps the two concerns from bleeding into each other.
 */
const AVATAR_COLOR_SIZES: readonly ("lg" | "md" | "sm")[] = [
  "lg", "lg", "lg", "lg", "lg", "lg",
  "md", "md", "md", "md", "md",
  "sm", "sm", "sm", "sm", "sm",
];

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

/** The same identity at all three sizes, so the scale reads as one avatar growing, not three. */
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
  ],
});

/*
 * Sixteen identities, each its own hue off the base palette, largest first: the same "color is a
 * styling hook" idea `avatarSizesTree` shows with one color, scaled up to the real reason a hook
 * exists there at all — "tinting avatars per person is the most ordinary thing an app does with
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
        style: `--sk-avatar-bg: var(--ramp-${swatch}); --sk-avatar-fg: var(--ramp-neutral-0); box-shadow: 0 0 0 2px var(--color-bg-surface);`,
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
