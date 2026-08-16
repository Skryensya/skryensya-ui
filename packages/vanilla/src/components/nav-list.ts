import { createConnectMount, uniqueId } from "../runtime/svelte-hydrate.js";

const selector = {
  trigger: "[data-sk-nav-list-group-trigger]",
  list: "[data-sk-nav-list-group-list]",
} as const;

/*
 * NAV LIST — only the collapsible-group case needs a runtime at all (the plain, always-visible
 * group is pure static markup, same as the rest of `NavList`). WAI-ARIA APG "Disclosure
 * (Navigation)": a button toggles `aria-expanded` and the `hidden` state of the list it names via
 * `aria-controls` — Enter/Space activation is already free from `<button>` native semantics, so
 * this enhancer's own job is the click toggle, generating the id `aria-controls` needs (ids are
 * never baked into static markup by this system, the same reasoning `Checkbox`'s own
 * `aria-controls` fix already established for a sibling relationship), and Escape — the ONE
 * keyboard requirement the pattern does not mark optional (unlike arrow keys/Home/End, which its
 * own page explicitly labels "(Optional)", confirmed fetching the example, not assumed): "If a
 * dropdown is open and focus is inside the navigation region, pressing Esc will close the
 * dropdown" and return focus to the trigger.
 */
function connect(trigger: HTMLElement): () => void {
  const group = trigger.parentElement;
  const list = group?.querySelector<HTMLElement>(selector.list);
  if (!group || !list) return () => {};

  const id = list.id || uniqueId("sk-nav-list-group");
  list.id = id;
  trigger.setAttribute("aria-controls", id);

  const isOpen = () => trigger.getAttribute("aria-expanded") === "true";

  const sync = () => {
    list.hidden = !isOpen();
  };

  const setOpen = (open: boolean) => {
    trigger.setAttribute("aria-expanded", String(open));
    sync();
  };

  const onClick = () => setOpen(!isOpen());

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !isOpen()) return;
    event.preventDefault();
    setOpen(false);
    trigger.focus();
  };

  sync();
  trigger.addEventListener("click", onClick);
  group.addEventListener("keydown", onKeyDown);
  return () => {
    trigger.removeEventListener("click", onClick);
    group.removeEventListener("keydown", onKeyDown);
  };
}

export const mountNavListGroup = createConnectMount({
  key: "nav-list-group",
  rootSelector: selector.trigger,
  connect,
});
