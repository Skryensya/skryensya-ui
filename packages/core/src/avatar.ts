import type { ComponentContract } from "./contract.js";

/*
 * AVATAR, a person or entity's visual token: an image (via ImageFrame), or initials as the
 * fallback. AvatarGroup overlaps a set into a stack and can cap the overflow with a "+N" counter.
 *
 * Appearance is CSS; `avatarInitials` is the shared derivation so React and vanilla stay aligned.
 * Picking a color is still the consumer's call.
 */
export type AvatarSize = "sm" | "md" | "lg";

export const avatarParts = {
  root: "sk-avatar",
  fallback: "sk-avatar__fallback",
  group: "sk-avatar-group",
  groupOverflow: "sk-avatar-group__overflow",
} as const;

export type AvatarPart = keyof typeof avatarParts;
export type AvatarPartClass = (typeof avatarParts)[AvatarPart];

/**
 * Initials for a display name or username: first letter of the first two words, or the first
 * two characters when there is only one word (`ada` → `ad`, `Ada Lovelace` → `AL`).
 * CSS uppercases the paint; this keeps the source string's casing.
 */
export function avatarInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return parts
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("");
}

/*
 * A person, in a circle, and two genuinely different structures rather than one with a hole in it.
 *
 * With an image, an ImageFrame clips the media and the `<img alt>` carries the name. Without one, the
 * wrapper itself becomes the named node and the initials go decorative, so there is exactly ONE
 * node announcing the person either way. Modelled as two signatures because the markup really is two
 * different trees, and a single signature would have to pretend otherwise.
 */
export const avatarContract = {
  id: "avatar",
  css: "@skryensya/core/components/avatar.css",
  parts: avatarParts,

  options: {
    size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-size" },
    /** The accessible name when initials are the fallback. */
    name: { type: "string", attr: "aria-label" },
    /** The image's alt text; React calls this prop `name`. */
    imageName: { type: "string", attr: "alt", prop: "name" },
    src: { type: "string", attr: "src" },
    /** The group's own accessible name; see `AvatarGroup`'s `role="group"` doc for why it is optional. */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    "Avatar.initials": {
      intent: ["person", "user-identity", "no-photo-available"],
      host: { element: "span", when: { src: "absent" } },
      options: ["size", "name"],
      requires: ["name"],
      forbids: ["src"],
      slots: {
        /** The fallback mark, usually initials. Decorative: the wrapper already carries the name. */
        children: { accepts: "text", required: true },
      },
      template: {
        element: "span",
        part: "root",
        host: true,
        attrs: { role: "img" },
        children: [
          { element: "span", part: "fallback", attrs: { "aria-hidden": "true" }, slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/avatar", name: "Avatar" },
    },

    "Avatar.image": {
      intent: ["person", "user-identity", "photo"],
      host: { element: "span", when: { src: "present" } },
      options: ["size", "imageName", "src"],
      requires: ["imageName", "src"],
      slots: {},
      template: {
        element: "span",
        part: "root",
        host: true,
        children: [
          {
            element: "span",
            also: ["sk-image-frame"],
            attrs: {
              "data-aspect": "1/1",
              "data-fit": "cover",
              "data-position": "center",
              "data-radius": "pill",
              "data-border": "none",
            },
            children: [
              {
                element: "img",
                also: ["sk-image-frame__media"],
                options: ["src", "imageName"],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/avatar", name: "Avatar" },
    },

    /*
     * `role="group"`: a pile of people is one unit to assistive tech the same way it is one unit
     * visually. Same reasoning as `split-button.ts`'s own `role="group"` doc. `label` is optional
     * for the same reason it is there: each child avatar already announces its own name, so the
     * group name is a nice-to-have qualifier ("the reviewers"), not the only source of any single
     * avatar's identity.
     */
    AvatarGroup: {
      intent: ["people", "avatar-stack", "group-with-overflow"],
      host: { element: "div" },
      options: ["label"],
      slots: {
        children: {
          accepts: "signature",
          of: ["Avatar.initials", "Avatar.image"],
          required: true,
        },
        overflow: { accepts: "text" },
      },
      template: {
        element: "div",
        part: "group",
        host: true,
        attrs: { role: "group" },
        children: [
          { slot: "children" },
          {
            element: "span",
            part: "groupOverflow",
            slot: "overflow",
            whenGiven: "overflow",
          },
        ],
      },
      react: { from: "@skryensya/react/avatar", name: "AvatarGroup" },
    },
  },
} as const satisfies ComponentContract;
