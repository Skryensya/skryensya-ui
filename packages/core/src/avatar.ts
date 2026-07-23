/*
 * AVATAR, a person or entity's visual token: an image, or initials as the fallback.
 *
 * AvatarGroup overlaps a set into a stack and can cap the overflow with a "+N" counter. The
 * component owns appearance only; deriving initials or picking a colour is the consumer's call.
 */
export type AvatarSize = "sm" | "md" | "lg";

export const avatarParts = {
  root: "ds-avatar",
  image: "ds-avatar__image",
  fallback: "ds-avatar__fallback",
  group: "ds-avatar-group",
  groupOverflow: "ds-avatar-group__overflow",
} as const;

export type AvatarPart = keyof typeof avatarParts;
export type AvatarPartClass = (typeof avatarParts)[AvatarPart];
