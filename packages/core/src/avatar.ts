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
