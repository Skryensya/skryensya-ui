import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate, UIKey } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * MARQUEE DEMOS.
 *
 * Every strip on this page holds ONE kind of child, deliberately. A marquee accepts any inert node,
 * and the way to show that is four strips of four different things, never one strip that mixes a
 * logo, an icon and a loose line of text: from that a reader cannot tell "accepts anything" apart
 * from "unfinished", and only the uniform strip is a thing anyone would ship.
 */

/** Manual strip with its Play control: viewport, track, content and toggle all present to name. */
export const marqueeAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("marquee.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "marquee",
      signature: "Marquee",
      options: { speed: "slow" },
      attrs: { style: "inline-size: min(100%, 22rem)" },
      slots: {
        playLabel: t("demo.marquee.play"),
        pauseLabel: t("demo.marquee.pause"),
        children: logoStrip().slice(0, 3),
      },
    },
    items: [
      namePart(".sk-marquee", "block-start"),
      namePart(".sk-marquee__viewport", "inline-start"),
      namePart(".sk-marquee__track", "block-end", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-marquee__content", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-marquee__toggle", "inline-end"),
      namePart(".sk-marquee__glyph", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-marquee__label", "block-end"),
    ],
  },
});

/**
 * Placeholder brands, the case Marquee exists for. The mark is an asset and the wordmark is real
 * type, so the lockup follows the theme instead of baking one into an image.
 */
const brands = [
  { id: "northstar", name: "NORTHSTAR" },
  { id: "luma", name: "Luma" },
  { id: "kinetiq", name: "kinetiq" },
  { id: "orbital", name: "ORBITAL" },
  { id: "vertex", name: "Vertex" },
  { id: "fieldwork", name: "fieldwork" },
] as const;

function logoStrip(): UsageTree[] {
  return brands.map(({ id, name }) => ({
    contract: "layout",
    signature: "Inline",
    options: { gap: "sm", inlineAlign: "center", wrap: false },
    children: [
      {
        contract: "image-frame",
        signature: "ImageFrame",
        options: { src: `/demos/logos/${id}.svg`, alt: "", aspect: "1/1", radius: "control", border: "subtle" },
        attrs: { style: "flex: none; inline-size: 2rem;" },
      },
      {
        contract: "typography",
        signature: "Text",
        options: { size: "lg", weight: "label", tone: "secondary" },
        children: name,
      },
    ],
  }));
}

const releases = [
  { tone: "success", key: "demo.marquee.badge1" },
  { tone: "accent", key: "demo.marquee.badge2" },
  { tone: "neutral", key: "demo.marquee.badge3" },
  { tone: "warning", key: "demo.marquee.badge4" },
  { tone: "accent", key: "demo.marquee.badge5" },
  { tone: "success", key: "demo.marquee.badge6" },
  { tone: "neutral", key: "demo.marquee.badge7" },
] as const satisfies readonly { tone: string; key: UIKey }[];

/** Badges, and nothing but Badges. */
function badgeStrip(t: Translate): UsageTree[] {
  return releases.map(({ tone, key }) => ({
    contract: "badge",
    signature: "Badge",
    options: { tone },
    children: t(key),
  }));
}

/** One hue per person, so eight avatars read as eight people rather than one repeated default. */
const people = [
  { initials: "AP", swatch: "blue-500" },
  { initials: "MJ", swatch: "emerald-600" },
  { initials: "RS", swatch: "sky-600" },
  { initials: "TK", swatch: "red-500" },
  { initials: "LV", swatch: "blue-700" },
  { initials: "DC", swatch: "emerald-700" },
  { initials: "NB", swatch: "sky-700" },
  { initials: "YQ", swatch: "red-700" },
] as const;

/** Avatars, and nothing but Avatars. Initials, so the strip needs no photographs. */
function avatarStrip(t: Translate): UsageTree[] {
  return people.map(({ initials, swatch }) => ({
    contract: "avatar",
    signature: "Avatar.initials",
    options: { size: "lg", name: t("demo.marquee.person", { initials }) },
    attrs: { style: `--sk-avatar-bg: var(--palette-${swatch}); --sk-avatar-fg: var(--palette-white);` },
    children: initials,
  }));
}

const notes = [
  { title: "demo.marquee.note1Title", body: "demo.marquee.note1Body" },
  { title: "demo.marquee.note2Title", body: "demo.marquee.note2Body" },
  { title: "demo.marquee.note3Title", body: "demo.marquee.note3Body" },
  { title: "demo.marquee.note4Title", body: "demo.marquee.note4Body" },
] as const satisfies readonly { title: UIKey; body: UIKey }[];

/** Cards, and nothing but cards. Vertical travel wants blocks, not a column of loose items. */
function noteStrip(t: Translate): UsageTree[] {
  return notes.map(({ title, body }) => ({
    contract: "box",
    signature: "Box",
    options: { padding: "md", surface: "raised", border: "subtle" },
    children: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "xs" },
      children: [
        { contract: "typography", signature: "Text", options: { weight: "label" }, children: t(title) },
        { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary" }, children: t(body) },
      ],
    },
  }));
}

const controls = (t: Translate) => ({
  playLabel: t("demo.marquee.play"),
  pauseLabel: t("demo.marquee.pause"),
});

/*
 * NO FadeEdge WRAPPER ANYWHERE ON THIS PAGE. Every strip still wears a fade, because an edge that
 * cuts a repeating run off mid-item reads as a mistake rather than as "more content is here" - but
 * Marquee now draws it on its own viewport (`fade`, on by default). Wrapping the component instead
 * masked the Play/Pause button along with the strip, since a mask reaches everything inside it.
 *
 * AND NO Play/Pause BUTTON, on all but two of them. `control` is opt-in, so most strips here are
 * what an ambient logo row actually looks like in a page. The two that carry it are the ones the
 * page is about: the requested marquee, whose button is its only cause of motion, and the one
 * example that exists to show the opt-in.
 */

export const marqueeManualTree = (t: Translate): UsageTree => ({
  contract: "marquee",
  signature: "Marquee",
  options: { speed: "slow" },
  slots: { ...controls(t), children: logoStrip() },
});

export const marqueeAutoplayTree = (): UsageTree => ({
  contract: "marquee",
  signature: "Marquee.autoplay",
  options: { direction: "right", speed: "slow" },
  slots: { children: logoStrip() },
});

/** The same strip with the control asked for, so the page shows what `control` adds. */
export const marqueeControlTree = (t: Translate): UsageTree => ({
  contract: "marquee",
  signature: "Marquee.autoplay",
  options: { direction: "right", speed: "slow", control: true },
  slots: { ...controls(t), children: logoStrip() },
});

export const marqueeBadgeTree = (t: Translate): UsageTree => ({
  contract: "marquee",
  signature: "Marquee.autoplay",
  options: { speed: "normal" },
  slots: { children: badgeStrip(t) },
});

export const marqueeAvatarTree = (t: Translate): UsageTree => ({
  contract: "marquee",
  signature: "Marquee.autoplay",
  options: { direction: "right", speed: "normal" },
  slots: { children: avatarStrip(t) },
});

export const marqueeVerticalTree = (t: Translate): UsageTree => ({
  contract: "marquee",
  signature: "Marquee.autoplay",
  options: { direction: "up", speed: "slow" },
  attrs: { style: "--sk-marquee-vertical-size: 15rem; inline-size: min(100%, 24rem); margin-inline: auto;" },
  slots: { children: noteStrip(t) },
});

/** The one strip that opts out, so the page shows what `fade="none"` actually buys. */
export const marqueeNoFadeTree = (): UsageTree => ({
  contract: "marquee",
  signature: "Marquee.autoplay",
  options: { speed: "slow", fade: "none" },
  slots: { children: logoStrip() },
});
