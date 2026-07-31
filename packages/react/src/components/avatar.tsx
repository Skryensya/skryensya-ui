import { avatarInitials, avatarParts, type AvatarSize } from "@skryensya/core/avatar";
import { imageFrameParts } from "@skryensya/core/image-frame";
import { Children, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from "react";
import { ImageFrame } from "./image-frame.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Image URL. When absent, the fallback (initials) shows. */
  src?: string;
  /** Accessible name and alt text for the image. */
  name?: string;
  size?: AvatarSize;
  /** Fallback content, usually initials. Defaults to the first two letters of `name`. */
  children?: ReactNode;
} & Pick<ImgHTMLAttributes<HTMLImageElement>, "loading">;

export function Avatar({ children, className, loading, name, size = "md", src, ...props }: AvatarProps) {
  const fallback = children ?? (name ? avatarInitials(name) : null);

  // With an image, ImageFrame clips the media and <img alt> carries the semantics. Without one,
  // the wrapper becomes the img role and the initials go decorative, so there is exactly one node.
  return src ? (
    <span {...props} className={cx(avatarParts.root, className)} data-size={size}>
      <ImageFrame as="span" aspect="1/1" fit="cover" radius="pill">
        <img
          alt={name ?? ""}
          className={imageFrameParts.media}
          loading={loading}
          src={src}
        />
      </ImageFrame>
    </span>
  ) : (
    <span {...props} aria-label={name} className={cx(avatarParts.root, className)} data-size={size} role="img">
      <span aria-hidden="true" className={avatarParts.fallback}>{fallback}</span>
    </span>
  );
}

export type AvatarGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  /** Cap the visible avatars; the rest collapse into a "+N" counter. */
  max?: number;
  /** Explicit overflow label for a composition that already supplies its visible avatars. */
  overflow?: ReactNode;
};

export function AvatarGroup({ children, className, max, overflow: overflowLabel, ...props }: AvatarGroupProps) {
  const items = Children.toArray(children);
  const visible = max && items.length > max ? items.slice(0, max) : items;
  const overflowCount = items.length - visible.length;
  const overflow = overflowCount > 0 ? `+${overflowCount}` : overflowLabel;

  return (
    <div {...props} className={cx(avatarParts.group, className)}>
      {visible}
      {overflow != null ? <span className={avatarParts.groupOverflow}>{overflow}</span> : null}
    </div>
  );
}
