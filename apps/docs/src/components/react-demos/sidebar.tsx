/*
 * Live React demo for /components/sidebar. Mirrors the vanilla `app-shell` wrapper used in the
 * page's ComponentPreview: a sidebar next to a stand-in main area, so the collapse behavior is legible.
 */
import { Icon } from "@skryensya/react/icon";
import { NavList, NavListGroup, NavListLink } from "@skryensya/react/nav-list";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger } from "@skryensya/react/sidebar";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const SidebarDemo = framed(function SidebarDemo() {
  return (
    <div className="app-shell">
      <Sidebar defaultCollapsed={false} onCollapsedChange={() => {}}>
        <SidebarHeader>
          <SidebarTrigger label="Collapse navigation" icon={<Icon name="menu" />} />
        </SidebarHeader>

        <SidebarContent>
          <NavList aria-label="Principal">
            <NavListGroup label="Espacio">
              <NavListLink href="/in" icon={<Icon name="info" />} current>
                Inicio
              </NavListLink>
              <NavListLink href="/reportes" icon={<Icon name="calendar" />} trailing="12">
                Reportes
              </NavListLink>
            </NavListGroup>
          </NavList>
        </SidebarContent>

        <SidebarFooter>v0.3.0</SidebarFooter>
      </Sidebar>
      <div className="app-shell__main">
        <p>The content of the app goes here.</p>
      </div>
    </div>
  );
}, {flush: true});
