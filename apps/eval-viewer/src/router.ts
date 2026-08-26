import { useEffect, useState } from "react";

/*
 * A HAND-ROLLED ROUTER, not a library: three route shapes total, and the only things this app
 * actually needs from "not being a SPA" are real URLs (bookmarkable, shareable, back/forward-able)
 * and full-looking navigation via real `<a href>` elements — not a client-side view-state that
 * resets on refresh. Reaching for react-router for three routes would be exactly the speculative
 * abstraction this app's own history (`vite.config.ts`'s doc comments) argues against everywhere
 * else; the History API plus one delegated click listener covers the whole surface.
 */

export type Route =
  | { type: "cases" }
  | { type: "case"; caseId: string }
  | { type: "execution"; caseId: string; runId: string; lang: "es" | "en" };

export function parseRoute(pathname: string): Route {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "case" && segments[1]) {
    if (segments[2] && segments[3] && (segments[3] === "es" || segments[3] === "en")) {
      return { type: "execution", caseId: segments[1], runId: segments[2], lang: segments[3] };
    }
    return { type: "case", caseId: segments[1] };
  }

  return { type: "cases" };
}

export function casesPath(): string {
  return "/";
}

export function casePath(caseId: string): string {
  return `/case/${encodeURIComponent(caseId)}`;
}

export function executionPath(caseId: string, runId: string, lang: "es" | "en"): string {
  return `/case/${encodeURIComponent(caseId)}/${encodeURIComponent(runId)}/${lang}`;
}

/** Pushes a new URL and notifies every `useRoute()` subscriber. A no-op if already there. */
export function navigate(path: string): void {
  if (path === location.pathname + location.search) return;
  history.pushState(null, "", path);
  dispatchEvent(new PopStateEvent("popstate"));
}

/** Re-renders on both browser back/forward AND `navigate()`'s own synthetic `popstate`. */
export function useRoute(): Route {
  const [pathname, setPathname] = useState(() => location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return parseRoute(pathname);
}

/*
 * ONE delegated listener for the whole document, rather than a custom `<NavLink>` wrapper around
 * every kit component that happens to render an `<a>` (`ListItemLink`, `Breadcrumb`, `Link`, a
 * `Button.navigation`). Those are real anchors with real `href`s by contract (see `list`/`breadcrumb`/
 * `typography` in the catalogue) — this only intercepts the same-origin, unmodified left-clicks a
 * client-side transition can actually handle, and lets everything else (cmd-click, middle-click,
 * external links, downloads) fall through to normal browser behavior untouched.
 */
export function installLinkInterceptor(): () => void {
  function onClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = (event.target as Element).closest("a");
    if (!anchor || !anchor.hasAttribute("href")) return;
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;

    event.preventDefault();
    navigate(url.pathname + url.search);
  }

  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
