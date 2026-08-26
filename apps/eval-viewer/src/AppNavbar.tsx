import { IconStateButton } from "@skryensya/react/icon-state-button";
import { Navbar, NavbarActions, NavbarBrand } from "@skryensya/react/navbar";
import type { IconStateFace } from "@skryensya/core/icon-state-button";
import { colorModeLabel } from "@skryensya/core/theme-toggle";
import { useColorMode } from "./useColorMode";

/*
 * Composed and validated via `validate_ui` before being written here (see the conversation this file
 * came from — the exact tree, faces collection included, round-tripped through the MCP server for
 * real). `faces` matches the shape `validate_ui`'s own emitted `reactData` companion file returned;
 * kept inline instead of a separate module since it's three static entries, not a real collection an
 * eval case would compose.
 */
const faces: readonly IconStateFace[] = [
  { name: "system", icon: "mode-system" },
  { name: "light", icon: "mode-light" },
  { name: "dark", icon: "mode-dark" },
];

export function AppNavbar() {
  const [mode, cycle] = useColorMode();

  return (
    <Navbar>
      <NavbarBrand>eval-viewer</NavbarBrand>
      <NavbarActions>
        {/*
         * `data-variant="ghost"` + `data-icon-only`: `Button`'s own options (`packages/core`'s
         * `button` contract), not `IconStateButton`'s — that contract only declares `current`, but
         * its template borrows `.sk-button`'s class via `also`, so `.sk-button`'s OWN data-attribute
         * options still apply and still matter. Without them the button fell back to `data-variant`'s
         * contract default, `"neutral"` — a filled, bordered button, confirmed live as the "not the
         * design system's real button" look. `apps/docs/src/components/ThemeToggle.astro`, the kit's
         * own reference header theme toggle, sets exactly these two for the same reason: a toolbar
         * icon action is ghost and icon-only, not a filled default button.
         */}
        <IconStateButton
          current={mode}
          faces={faces}
          aria-label={colorModeLabel(mode)}
          onClick={cycle}
          data-variant="ghost"
          data-icon-only=""
        />
      </NavbarActions>
    </Navbar>
  );
}
