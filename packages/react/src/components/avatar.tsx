import { avatarParts, type AvatarSize } from "@skryensya/core/avatar";
import { Children, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Image URL. When absent (or it fails to load), the fallback shows. */
  src?: string;
  /** Accessible name and alt text for the image. */
  name?: string;
  size?: AvatarSize;
  /** Fallback content, usually initials. Defaults to the first two letters of `name`. */
  children?: ReactNode;
} & Pick<ImgHTMLAttributes<HTMLImageElement>, "loading">;

export function Avatar({ children, className, loading, name, size = "md", src, ...props }: AvatarProps) {
  const fallback = children ?? (name ? initials(name) : null);

  // With an image, the <img alt> carries the semantics, the wrapper stays a plain box. Without one,
  // the wrapper becomes the img role and the initials go decorative, so there is exactly one node.
  return src ? (
    <span {...props} className={cx(avatarParts.root, className)} data-size={size}>
      <img alt={name ?? ""} className={avatarParts.image} loading={loading} src={src} />
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
};

export function AvatarGroup({ children, className, max, ...props }: AvatarGroupProps) {
  const items = Children.toArray(children);
  const visible = max && items.length > max ? items.slice(0, max) : items;
  const overflow = items.length - visible.length;

  return (
    <div {...props} className={cx(avatarParts.group, className)}>
      {visible}
      {overflow > 0 ? <span className={avatarParts.groupOverflow}>+{overflow}</span> : null}
    </div>
  );
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("");
}
