import { skipLinkParts } from "@skryensya/core/skip-link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

/*
 * SKIP LINK: markup and nothing else, because the behaviour is the platform's.
 *
 * An in-page `href` already moves the reader and, in the browsers that do it, focus; the Back button
 * already returns them. A scripted `onClick` + `scrollIntoView` + `focus()` would reimplement all of
 * that and lose the middle-click, the context menu and the status bar preview on the way. So there
 * is no state here, no machine and no vanilla enhancer: the two bindings are the same anchor twice,
 * the same reason `Dialog` and `Details` are contracts with nothing running behind them.
 *
 * WHAT THIS COMPONENT CANNOT DO FOR YOU is make the destination focusable. See `SkipLinkTargetProps`.
 */
export type SkipLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
  /** In-page, so an id: `#main-nav`. What makes the jump the browser's rather than a script's. */
  href: string;
  /** What it says when it appears. A destination, not an instruction: "Go to navigation". */
  children: ReactNode;
};

export function SkipLink({ children, className, href, ...props }: SkipLinkProps) {
  return (
    <a
      {...props}
      className={
        className
          ? `${skipLinkParts.root} sk-interactive ${className}`
          : `${skipLinkParts.root} sk-interactive`
      }
      href={href}
    >
      {children}
    </a>
  );
}

/**
 * The props a skip link's DESTINATION needs, as a value rather than as a sentence in a doc.
 *
 * `tabindex="-1"` is the whole of it, and it is required: following an in-page link scrolls in every
 * browser but moves FOCUS in only some, and where it does not the next Tab resumes from the link,
 * returning the reader to the chrome they just asked to bypass. It belongs to the destination, which
 * is an element this component does not render and must not, so it is offered here to be spread onto
 * whatever the consumer is pointing at:
 *
 *   <SkipLink href="#main-nav">Ir a la navegación</SkipLink>
 *   <nav id="main-nav" {...skipLinkTarget}>…</nav>
 *
 * A value and not a prose rule because a rule in prose is a rule that gets copied wrong once.
 */
export type SkipLinkTargetProps = { tabIndex: -1 };

export const skipLinkTarget: SkipLinkTargetProps = { tabIndex: -1 };
