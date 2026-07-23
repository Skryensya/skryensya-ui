import { navbarParts } from "@skryensya/core/navbar";
import { type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type NavbarProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

/*
 * The bar. The links go inside as a `<NavList orientation="horizontal">`, the same list the
 * sidebar hosts, rather than a second one that could drift from it (decision 17).
 *
 * A `<header>`, not a `<nav>`: the NavList inside is the nav landmark, and nesting one in another
 * would announce two.
 */
export function Navbar({ children, className, ...props }: NavbarProps) {
  return (
    <header {...props} className={cx(navbarParts.root, className)}>
      {children}
    </header>
  );
}

export type NavbarBrandProps = HTMLAttributes<HTMLElement> & { children: ReactNode };

export function NavbarBrand({ children, className, ...props }: NavbarBrandProps) {
  return (
    <div {...props} className={cx(navbarParts.brand, className)}>
      {children}
    </div>
  );
}

export type NavbarActionsProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function NavbarActions({ children, className, ...props }: NavbarActionsProps) {
  return (
    <div {...props} className={cx(navbarParts.actions, className)}>
      {children}
    </div>
  );
}
