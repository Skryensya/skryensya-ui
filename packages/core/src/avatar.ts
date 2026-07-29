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
 * wrapper itself becomes the named node and the initials go decorative — so there is exactly ONE
 * node announcing the person either way. Modelled as two signatures because the markup really is two
 * different trees, and a single signature would have to pretend otherwise.
 */
export const avatarContract = {
  id: "avatar",
  css: "@skryensya/core/components/avatar.css",
  parts: avatarParts,

  options: {
    size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-size" },
    /** The person's name: the alt text with an image, the accessible name without one. */
    name: { type: "string", attr: "aria-label" },
    src: { type: "string", attr: "src" },
  },

  signatures: {
    "Avatar.initials": {
      intent: ["person", "user-identity", "no-photo-available"],
      host: { element: "span" },
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
  },
} as const satisfies ComponentContract;
