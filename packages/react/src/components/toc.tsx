import { tocParts } from "@skryensya/core/toc";
import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

/*
 * TOC — the React half of the same contract the Vanilla enhancer connects to.
 *
 * Copies `connectToc` rather than improving on it (the rule `NOT-PUBLISHED.md` already states for
 * `copy-button`/`dialog`/`command-palette`): one shape shipped (an interactive `<details>`, closed
 * by default), a scroll-spy that moves `aria-current` on its own, and a consumer's stylesheet is
 * what turns this into an always-open rail — this component does not guess a breakpoint for it.
 */
export type TocItem = {
  href: string;
  level?: "h2" | "h3";
  /** Seeds the initial `aria-current`, before the spy has anything to report. */
  current?: boolean;
  children: ReactNode;
  /** Decorative: the label already names the destination. */
  icon?: ReactNode;
};

export type TocProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  /** The caption above the list, and the accessible name of the nav beside it. */
  title?: string;
  items: readonly TocItem[];
};

export function Toc({ className, items, title, ...props }: TocProps) {
  const rootRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [current, setCurrent] = useState<string | undefined>(
    () => items.find((item) => item.current)?.href,
  );

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    const wide =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--breakpoint-wide")
        .trim() || "72rem";
    const rail = window.matchMedia(`(min-width: ${wide})`);
    const sync = () => {
      details.open = rail.matches;
      const summary = details.querySelector<HTMLElement>("summary");
      if (summary) summary.tabIndex = rail.matches ? -1 : 0;
    };

    sync();
    rail.addEventListener("change", sync);
    return () => rail.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const links = [...root.querySelectorAll<HTMLAnchorElement>("a[href^='#']")];
    if (links.length < 2) return;

    const hrefById = new Map(links.map((link) => [decodeURIComponent(link.hash.slice(1)), link.hash]));
    const headings = [...hrefById.keys()]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length < 2) return;

    const onScreen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target.id);
          else onScreen.delete(entry.target.id);
        }

        const currentId = headings.find((heading) => onScreen.has(heading.id))?.id;
        // Nothing in the band means "between sections", not "nowhere" — the last answer stands.
        if (!currentId) return;
        setCurrent(hrefById.get(currentId));
      },
      { rootMargin: "-72px 0px -70% 0px" },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [items]);

  return (
    <aside
      {...props}
      className={className ? `${tocParts.root} ${className}` : tocParts.root}
      ref={rootRef}
    >
      <details className={tocParts.disclosure} ref={detailsRef}>
        <summary className={`${tocParts.summary} sk-interactive`}>
          <h2 className={tocParts.title}>{title}</h2>
          <span aria-hidden="true" className={tocParts.chevron} />
        </summary>
        <nav aria-label={title} className={tocParts.nav}>
          <ul className={tocParts.list}>
            {items.map((item) => (
              <li className={tocParts.item} data-level={item.level ?? "h2"} key={item.href}>
                <a
                  aria-current={current === item.href ? "true" : undefined}
                  className={`${tocParts.link} sk-interactive`}
                  href={item.href}
                >
                  {item.icon ? <span className={tocParts.icon}>{item.icon}</span> : null}
                  <span className={tocParts.label}>{item.children}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </aside>
  );
}
