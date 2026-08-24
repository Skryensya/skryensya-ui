import {
  breadcrumbParts,
  collapsibleBreadcrumbRange,
  type BreadcrumbItem,
} from "@skryensya/core/breadcrumb";
import { menuParts, type MenuItem } from "@skryensya/core/menu";
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAnchored } from "./anchored.js";
import { MenuPopup, useMenuMachine } from "./menu.js";

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export type BreadcrumbProps = {
  items: readonly BreadcrumbItem[];
  label?: string;
  separator?: ReactNode;
  /** What the "…" disclosure trigger is called, on the trail whose enhancer collapses to fit. */
  collapsedLabel?: string;
};

function Crumb({
  item,
  current,
  separator,
}: {
  item: BreadcrumbItem;
  current: boolean;
  separator: ReactNode;
}) {
  return (
    <li className={breadcrumbParts.item}>
      {item.href && !current ? (
        <a className={breadcrumbParts.link} href={item.href} title={item.label}>
          {item.label}
        </a>
      ) : (
        // The CSS styles `.sk-breadcrumb__current`; without the class the page you are on
        // was the one crumb that never got its own styling.
        <span aria-current={current ? "page" : undefined} className={breadcrumbParts.current}>
          {item.label}
        </span>
      )}
      {separator}
    </li>
  );
}

/** Every item, flat, uncollapsed — the short trail's own render and the shadow measurer's content. */
function FlatCrumbs({ items, separator }: { items: readonly BreadcrumbItem[]; separator: ReactNode }) {
  return items.map((item, index) => {
    const current = item.current ?? index === items.length - 1;
    const last = index === items.length - 1;
    return (
      <Crumb
        current={current}
        item={item}
        key={`${item.href ?? "current"}-${item.label}`}
        separator={
          last ? null : (
            <span aria-hidden="true" className={breadcrumbParts.separator}>
              {separator}
            </span>
          )
        }
      />
    );
  });
}

export function Breadcrumb({
  items,
  label = "Migas de pan",
  separator = "/",
  collapsedLabel = "Mostrar niveles ocultos",
}: BreadcrumbProps) {
  const range = collapsibleBreadcrumbRange(items.length);

  const navRef = useRef<HTMLElement>(null);
  // The full trail, laid out off-screen (`position: absolute; visibility: hidden`) purely to
  // measure its true, unconstrained width — decoupled from whatever the VISIBLE list currently
  // shows. Measuring the visible list instead would need it to be fully expanded first, and since
  // that is state this component owns, an effect driven by that same state to decide THAT state is
  // self-referential: collapsing shrinks the visible list, which un-collapses it to re-measure,
  // which finds it overflows again, which collapses it again — a ping-pong `setCollapsed` never
  // settles out of. The shadow list's width never depends on `collapsed`, so there is nothing to
  // chase.
  const shadowRef = useRef<HTMLOListElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const menuId = useId();
  // Called unconditionally, like every other hook here, even on a trail that never collapses
  // (`range` null) — hooks cannot be called only from inside the branch that needs them, the same
  // reason `MenubarItem` (`menubar.tsx`) calls this for every item regardless of whether it has a
  // dropdown. What is collapsed, real navigation links, opens as a real `Menu` — the ARIA menu
  // pattern's own keyboard model (arrow keys, Home/End, typeahead), not a plain list of `<a>`s.
  const { service: menuService, api: menuApi } = useMenuMachine({ id: menuId, defaultOpen: false });
  const anchor = useAnchored(menuId, true);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const shadow = shadowRef.current;
    if (!nav || !shadow || !range) return;
    nav.setAttribute("data-sk-breadcrumb-ready", "");

    const measure = () => setCollapsed(shadow.scrollWidth > nav.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [range, items]);

  if (!range) {
    return (
      <nav
        aria-label={label}
        className={breadcrumbParts.root}
        data-collapsed-label={collapsedLabel}
        data-sk-breadcrumb=""
        ref={navRef}
      >
        <ol className={breadcrumbParts.list} role="list">
          <FlatCrumbs items={items} separator={separator} />
        </ol>
      </nav>
    );
  }

  const first = items[0]!;
  const middle = items.slice(range.start, range.end + 1);
  const last = items[items.length - 1]!;
  const lastCurrent = last.current ?? true;

  return (
    <nav
      aria-label={label}
      className={breadcrumbParts.root}
      data-collapsed-label={collapsedLabel}
      data-sk-breadcrumb=""
      ref={navRef}
    >
      <ol
        aria-hidden="true"
        className={breadcrumbParts.list}
        inert
        ref={shadowRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          insetInlineStart: 0,
          insetBlockStart: 0,
          inlineSize: "max-content",
          pointerEvents: "none",
        }}
      >
        <FlatCrumbs items={items} separator={separator} />
      </ol>
      <ol className={breadcrumbParts.list} role="list">
        <Crumb
          current={first.current ?? false}
          item={first}
          key={`${first.href ?? "current"}-${first.label}`}
          separator={
            <span aria-hidden="true" className={breadcrumbParts.separator}>
              {separator}
            </span>
          }
        />
        {collapsed ? (
          <li className={cx(breadcrumbParts.item, "sk-breadcrumb__item--collapse", menuParts.root)}>
            <button
              {...menuApi.getTriggerProps()}
              {...anchor.anchor(breadcrumbParts.collapseTrigger)}
              aria-label={collapsedLabel}
              type="button"
            >
              …
            </button>
            <MenuPopup
              api={menuApi}
              checkedState={{}}
              items={middle.map(
                (item): MenuItem => ({
                  value: `${item.href ?? "current"}-${item.label}`,
                  label: item.label,
                  href: item.href,
                }),
              )}
              positionerProps={anchor.positioner(menuApi.getPositionerProps(), menuParts.positioner)}
              service={menuService}
              setCheckedState={() => {}}
            />
            <span aria-hidden="true" className={breadcrumbParts.separator}>
              {separator}
            </span>
          </li>
        ) : (
          middle.map((item) => (
            <Crumb
              current={item.current ?? false}
              item={item}
              key={`${item.href ?? "current"}-${item.label}`}
              separator={
                <span aria-hidden="true" className={breadcrumbParts.separator}>
                  {separator}
                </span>
              }
            />
          ))
        )}
        <Crumb current={lastCurrent} item={last} separator={null} />
      </ol>
    </nav>
  );
}
