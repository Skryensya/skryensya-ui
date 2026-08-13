/*
 * Live React demo for the "As a context menu" section of /componentes/menu and /en/components/menu.
 *
 * The context-menu shape has no `tree` route (see `MenuPage.astro`'s own note on the Vanilla side):
 * `contextTarget` is a slot for arbitrary content, not a signature the usage-tree compiler knows
 * how to emit, so both bindings of this one demo are hand-authored rather than derived from one
 * tree. `menuContextCss` (demos/menu.ts) is what keeps them from drifting into two different-looking
 * demos: the same string is injected into this frame's `<head>` (via `framed`'s `css` option) and
 * into the Vanilla stage (via `ComponentPreview`'s `css` prop), so the box painted here is styled by
 * the exact rules the reader sees on the CSS tab.
 *
 * `contextTarget` wraps whatever `ReactNode` it is given in a plain trigger `<div>` with no class of
 * its own (`Menu` has no `contextTargetClassName` to reach it): `.menu-context-demo__area` lives on
 * the CHILD instead. The trigger div then just shrink-wraps that child with no box of its own, so
 * the painted hit area is identical either way.
 *
 * A `kind: "separator"` entry between "Paste" and "Delete", matching the Vanilla source's divider:
 * `MenuItem` grew that fourth kind (core/src/menu.ts) once the item template gained a way to tell a
 * separator from "any kind given" (checkbox/radio already collapsed into that), so this declarative
 * `items` list can express the divider the same way the hand-authored markup always could.
 */
import { Menu } from "@skryensya/react/menu";
import { menuContextCss } from "../../demos/menu";
import { framedIn } from "./framed";

const framed = framedIn(import.meta.url);

type MenuContextDemoProps = {
  ariaLabel: string;
  area: string;
  copyLabel: string;
  pasteLabel: string;
  deleteLabel: string;
};

export const MenuContextDemo = framed(
  function MenuContextDemo({ ariaLabel, area, copyLabel, pasteLabel, deleteLabel }: MenuContextDemoProps) {
    return (
      <div className="menu-context-demo">
        <Menu
          label={ariaLabel}
          density="compact"
          contextTarget={
            <div className="menu-context-demo__area">
              <p>{area}</p>
            </div>
          }
          items={[
            { value: "copy", label: copyLabel },
            { value: "paste", label: pasteLabel },
            { value: "menu-context-separator", kind: "separator" },
            { value: "delete", label: deleteLabel, tone: "danger" },
          ]}
        />
      </div>
    );
  },
  { viewport: "menu", css: menuContextCss },
);
