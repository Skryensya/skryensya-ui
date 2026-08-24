import { tocParts } from "@skryensya/core/toc";
import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

/*
 * TOC: the React half of the same contract the Vanilla enhancer connects to.
 *
 * Copies `connectToc` rather than improving on it (the rule `NOT-PUBLISHED.md` already states for
 * `dialog`/`command-palette`): one shape shipped. A compact, always-open index, and a scroll-spy
 * that moves `aria-current` on its own. The `<details>`/`<summary>` pair and the `matchMedia` that
 * pinned it open past `wide` are both gone; see `core/toc.ts`'s own header for why the disclosure
 * stopped being a second shape of this contract.
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
  const [current, setCurrent] = useState<string | undefined>(
    () => items.find((item) => item.current)?.href,
  );

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
        // Nothing in the band means "between sections", not "nowhere": the last answer stands.
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
      data-sk-toc=""
      ref={rootRef}
    >
      <nav aria-label={title} className={tocParts.nav}>
        <h2 className={tocParts.title}>{title}</h2>
        <ul className={tocParts.list} role="list">
          {items.map((item) => (
            <li className={tocParts.item} data-level={item.level ?? "h2"} key={item.href}>
              <a
                aria-current={current === item.href ? "location" : undefined}
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
    </aside>
  );
}
