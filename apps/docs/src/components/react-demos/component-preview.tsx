/*
 * Live React demos for /components/component-preview. Only the previews that demonstrate a real
 * component get a live island: "Minimal anatomy" and "The complete example" demonstrate the
 * ComponentPreview's own chrome (a nested srcdoc mockup of the preview UI itself),
 * so they have no React equivalent and are skipped.
 */
import { Button } from "@skryensya/react/button";
import { Grid } from "@skryensya/react/layout";
import { TileLink } from "@skryensya/react/tile";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn("component-preview");

export const SaveActionDemo = framed(function SaveActionDemo() {
  return <Button onClick={() => {}}>Save changes</Button>;
});

const screenTiles = [
  { href: "/facturacion", title: "Billing", description: "Plans, payments, and receipts." },
  { href: "/equipo", title: "Equipo", description: "Personas, roles y permisos." },
  { href: "/dominios", title: "Dominios", description: "DNS y certificados." },
  { href: "/registros", title: "Registros", description: "Activity and audit." },
  { href: "/integraciones", title: "Integraciones", description: "Webhooks and API keys." },
  { href: "/notificaciones", title: "Notificaciones", description: "Mail y alertas." },
];

export const ScreensGridDemo = framed(function ScreensGridDemo() {
  return (
    <Grid columns={3} multicol>
      {screenTiles.map((tile) => (
        <TileLink href={tile.href} key={tile.href}>
          <span className="sk-tile__content">
            <span className="sk-tile__title">{tile.title}</span>
            <span className="sk-tile__description">{tile.description}</span>
          </span>
        </TileLink>
      ))}
    </Grid>
  );
});
