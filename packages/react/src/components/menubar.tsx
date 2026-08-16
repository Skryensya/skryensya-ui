import { menubarParts, resolveMenubarKey, type MenubarFocus } from "@skryensya/core/menubar";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * MENUBAR, the React binding — composable, one component per `menubar.ts` signature, the same shape
 * `treegrid.tsx`/`data-grid.tsx` already use: `Menubar` (the root) reads its own children ONCE,
 * synchronously, off `children` — never a registry any child populates as it renders — to know the
 * structural facts (how many top-level items, which have a dropdown, how many entries each
 * dropdown has) `resolveMenubarKey` needs, then hands the result down through context so
 * `MenubarItem`/`MenubarMenuItem` only ever ask "am I the current stop" / "is my menu open".
 */

type MenubarContextValue = {
  isTriggerStop: (topIndex: number) => boolean;
  isMenuItemStop: (topIndex: number, subIndex: number) => boolean;
  isOpen: (topIndex: number) => boolean;
  onTriggerClick: (topIndex: number, hasMenu: boolean) => void;
  onMenuItemClick: (topIndex: number, subIndex: number) => void;
  registerTrigger: (topIndex: number, element: HTMLElement | null) => void;
  registerMenuItem: (topIndex: number, subIndex: number, element: HTMLElement | null) => void;
};

const MenubarContext = createContext<MenubarContextValue | null>(null);

function useMenubarContext(component: string): MenubarContextValue {
  const context = useContext(MenubarContext);
  if (!context) throw new Error(`Menubar.${component} must be rendered inside Menubar.`);
  return context;
}

type TopShape = { hasMenu: boolean; subCount: number };

/** `Menubar`'s own children → each `MenubarItem`'s shape — a plain, synchronous read of props: does
 *  it carry a `MenubarMenu`, and if so, how many `MenubarMenuItem`s does that menu have. */
function readTops(children: ReactNode): TopShape[] {
  return Children.toArray(children)
    .filter((child): child is ReactElement<MenubarItemProps> => isValidElement(child) && child.type === MenubarItem)
    .map((item) => {
      const menu = Children.toArray(item.props.children).find(
        (child): child is ReactElement<{ children?: ReactNode }> => isValidElement(child) && child.type === MenubarMenu,
      );
      return { hasMenu: Boolean(menu), subCount: menu ? Children.count(menu.props.children) : 0 };
    });
}

export type MenubarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: string;
  children: ReactNode;
};

export function Menubar({ children, className, label, ...props }: MenubarProps) {
  const [focus, setFocus] = useState<MenubarFocus>({ topIndex: 0, subIndex: null });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggers = useRef(new Map<number, HTMLElement>());
  const menuItems = useRef(new Map<string, HTMLElement>());
  const menuItemKey = (topIndex: number, subIndex: number) => `${topIndex}:${subIndex}`;

  const tops = useMemo(() => readTops(children), [children]);
  const topCount = tops.length;
  const hasMenuAt = (topIndex: number) => tops[topIndex]?.hasMenu ?? false;
  const subCountOf = (topIndex: number) => tops[topIndex]?.subCount ?? 0;

  const currentFocus = (): MenubarFocus => {
    const active = document.activeElement;
    for (const [topIndex, element] of triggers.current) if (element === active) return { topIndex, subIndex: null };
    for (const [key, element] of menuItems.current) {
      if (element !== active) continue;
      const [topIndex, subIndex] = key.split(":").map(Number);
      return { topIndex: topIndex!, subIndex: subIndex! };
    }
    return focus;
  };

  const moveFocus = (next: MenubarFocus) => {
    setFocus(next);
    const target = next.subIndex === null ? triggers.current.get(next.topIndex) : menuItems.current.get(menuItemKey(next.topIndex, next.subIndex));
    target?.focus();
  };

  const openMenu = (topIndex: number, subIndex: number | null) => {
    setOpenIndex(topIndex);
    moveFocus({ topIndex, subIndex });
  };

  const closeMenu = () => {
    setOpenIndex(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || !topCount) return;
    const focusNow = currentFocus();
    const action = resolveMenubarKey({ key: event.key, focus: focusNow, topCount, hasMenuAt, subCountOf });
    if (action.kind === "none") return;
    event.preventDefault();
    if (action.kind === "move") {
      setFocus(action.focus);
      moveFocus(action.focus);
    } else if (action.kind === "open") {
      const subCount = subCountOf(action.topIndex);
      openMenu(action.topIndex, subCount < 1 ? null : action.focusLast ? subCount - 1 : 0);
    } else if (action.kind === "close") {
      closeMenu();
      moveFocus({ topIndex: focusNow.topIndex, subIndex: null });
    } else if (action.kind === "moveTop") {
      if (action.keepOpen && hasMenuAt(action.topIndex)) {
        const subCount = subCountOf(action.topIndex);
        openMenu(action.topIndex, subCount < 1 ? null : 0);
      } else {
        closeMenu();
        moveFocus({ topIndex: action.topIndex, subIndex: null });
      }
    }
  };

  const context: MenubarContextValue = {
    isTriggerStop: (topIndex) => focus.topIndex === topIndex && focus.subIndex === null,
    isMenuItemStop: (topIndex, subIndex) => focus.topIndex === topIndex && focus.subIndex === subIndex,
    isOpen: (topIndex) => openIndex === topIndex,
    onTriggerClick: (topIndex, hasMenu) => {
      if (!hasMenu) {
        moveFocus({ topIndex, subIndex: null });
        return;
      }
      if (openIndex === topIndex) {
        closeMenu();
        moveFocus({ topIndex, subIndex: null });
      } else {
        openMenu(topIndex, null);
      }
    },
    onMenuItemClick: (topIndex) => {
      closeMenu();
      moveFocus({ topIndex, subIndex: null });
    },
    registerTrigger: (topIndex, element) => {
      if (element) triggers.current.set(topIndex, element);
      else triggers.current.delete(topIndex);
    },
    registerMenuItem: (topIndex, subIndex, element) => {
      const key = menuItemKey(topIndex, subIndex);
      if (element) menuItems.current.set(key, element);
      else menuItems.current.delete(key);
    },
  };

  const items = Children.map(children, (child, index) =>
    isValidElement(child) && child.type === MenubarItem
      ? cloneElement(child as ReactElement<Record<string, unknown>>, { topIndex: index })
      : child,
  );

  return (
    <MenubarContext.Provider value={context}>
      <div
        {...props}
        aria-label={label}
        className={cx(menubarParts.root, className)}
        onKeyDown={onKeyDown}
        role="menubar"
      >
        {items}
      </div>
    </MenubarContext.Provider>
  );
}

export type MenubarItemProps = {
  label: string;
  children?: ReactNode;
  /** Fires when a LEAF item (no `MenubarMenu` child) is activated — a dropdown item's own
   *  `MenubarMenuItem.onActivate` is what fires for a command inside a menu instead. */
  onActivate?: () => void;
};

/** `topIndex` is injected by the parent `Menubar`, see the comment there — never author-set. */
type InjectedMenubarItemProps = MenubarItemProps & { topIndex: number };

export function MenubarItem(publicProps: MenubarItemProps) {
  const { children, label, onActivate, topIndex } = publicProps as InjectedMenubarItemProps;
  const context = useMenubarContext("Item");
  const menu = Children.toArray(children).find(
    (child): child is ReactElement<{ children?: ReactNode }> => isValidElement(child) && child.type === MenubarMenu,
  );
  const hasMenu = Boolean(menu);
  const open = context.isOpen(topIndex);

  return (
    <div className={menubarParts.itemWrapper}>
      <button
        aria-expanded={hasMenu ? open : undefined}
        aria-haspopup={hasMenu ? "menu" : undefined}
        className={cx(menubarParts.item, "sk-interactive")}
        onClick={() => {
          if (!hasMenu) onActivate?.();
          context.onTriggerClick(topIndex, hasMenu);
        }}
        ref={(element) => context.registerTrigger(topIndex, element)}
        role="menuitem"
        tabIndex={context.isTriggerStop(topIndex) ? 0 : -1}
        type="button"
      >
        {label}
      </button>
      {menu ? cloneElement(menu as ReactElement<Record<string, unknown>>, { topIndex, open }) : null}
    </div>
  );
}

export type MenubarMenuProps = { children: ReactNode };

/** `topIndex`/`open` are injected by the parent `MenubarItem` — never author-set. */
type InjectedMenubarMenuProps = MenubarMenuProps & { topIndex: number; open: boolean };

export function MenubarMenu(publicProps: MenubarMenuProps) {
  const { children, open, topIndex } = publicProps as InjectedMenubarMenuProps;
  const items = Children.map(children, (child, index) =>
    isValidElement(child) && child.type === MenubarMenuItem
      ? cloneElement(child as ReactElement<Record<string, unknown>>, { topIndex, subIndex: index })
      : child,
  );
  return (
    <div className={menubarParts.positioner} hidden={!open}>
      <div className={menubarParts.menu} role="menu">
        {items}
      </div>
    </div>
  );
}

export type MenubarMenuItemProps = {
  children: ReactNode;
  onActivate?: () => void;
};

/** `topIndex`/`subIndex` are injected by the parent `MenubarMenu` — never author-set. */
type InjectedMenubarMenuItemProps = MenubarMenuItemProps & { topIndex: number; subIndex: number };

export function MenubarMenuItem(publicProps: MenubarMenuItemProps) {
  const { children, onActivate, subIndex, topIndex } = publicProps as InjectedMenubarMenuItemProps;
  const context = useMenubarContext("MenuItem");
  return (
    <button
      className={cx(menubarParts.menuItem, "sk-interactive")}
      onClick={() => {
        onActivate?.();
        context.onMenuItemClick(topIndex, subIndex);
      }}
      ref={(element) => context.registerMenuItem(topIndex, subIndex, element)}
      role="menuitem"
      tabIndex={context.isMenuItemStop(topIndex, subIndex) ? 0 : -1}
      type="button"
    >
      {children}
    </button>
  );
}
