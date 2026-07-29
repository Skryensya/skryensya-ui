/*
 * Live React demos for /components/navbar. Each export is a self-contained island (no function
 * props crossing the Astro boundary), mounted directly from the page with a bare
 * `<NavbarBasicDemo client:load />`.
 */
import { Button } from "@skryensya/react/button";
import { NavList, NavListGroup, NavListLink } from "@skryensya/react/nav-list";
import { Navbar, NavbarActions, NavbarBrand } from "@skryensya/react/navbar";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const NavbarBasicDemo = framed(function NavbarBasicDemo() {
  return (
    <Navbar>
      <NavbarBrand>Atlas</NavbarBrand>

      <NavList orientation="horizontal" aria-label="Principal">
        <NavListGroup>
          <NavListLink href="/in" current>
            Inicio
          </NavListLink>
          <NavListLink href="/proyectos">Proyectos</NavListLink>
          <NavListLink href="/reportes">Reportes</NavListLink>
          <NavListLink href="/equipo">Equipo</NavListLink>
        </NavListGroup>
      </NavList>

      <NavbarActions>
        <Button variant="ghost" onClick={() => {}}>
          Invite
        </Button>
        <Button variant="primary" onClick={() => {}}>
          New project
        </Button>
      </NavbarActions>
    </Navbar>
  );
}, {flush: true});
