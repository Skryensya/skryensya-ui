/*
 * Live React demos for /components/list. Each export is a self-contained island (no function props
 * crossing the Astro boundary), mounted directly from the page with a bare `<ListPlainDemo client:load />`.
 * `.sk-list-demo` (authored globally on the list docs page) gives the row the width a real column
 * would have, same as the Vanilla srcdoc demos.
 */
import { Badge } from "@skryensya/react/badge";
import { Icon } from "@skryensya/react/icon";
import { List, ListItem, ListItemLink } from "@skryensya/react/list";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const ListPlainDemo = framed(function ListPlainDemo() {
  return (
    <div className="sk-list-demo">
      <List aria-label="Integraciones">
        <ListItem>Slack</ListItem>
        <ListItem>Notion</ListItem>
        <ListItem>Figma</ListItem>
        <ListItem>GitHub</ListItem>
        <ListItem>Linear</ListItem>
      </List>
    </div>
  );
});

export const ListTitledDemo = framed(function ListTitledDemo() {
  return (
    <div className="sk-list-demo">
      <List aria-label="Preferencias">
        <ListItem title="Notifications" description="Weekly summary every Friday." />
        <ListItem title="Time zone" description="Used to schedule shipments." />
        <ListItem title="Idioma" description="Interfaz y correos." />
        <ListItem title="Date format" description="How to write days and months." />
        <ListItem title="Home page" description="Where you land when you enter." />
      </List>
    </div>
  );
});

export const ListLeadingDemo = framed(function ListLeadingDemo() {
  return (
    <div className="sk-list-demo">
      <List aria-label="Preferencias">
        <ListItem
          leading={<Icon name="info" />}
          title="Notifications"
          description="Weekly summary every Friday."
        />
        <ListItem
          leading={<Icon name="calendar" />}
          title="Time zone"
          description="Used to schedule shipments."
        />
        <ListItem leading={<Icon name="settings" />} title="Idioma" description="Interfaz y correos." />
        <ListItem
          leading={<Icon name="calendar" />}
          title="Date format"
          description="How to write days and months."
        />
        <ListItem
          leading={<Icon name="visibility" />}
          title="Home page"
          description="Where you land when you enter."
        />
      </List>
    </div>
  );
});

export const ListTrailingDemo = framed(function ListTrailingDemo() {
  return (
    <div className="sk-list-demo">
      <List aria-label="Preferencias">
        <ListItem
          leading={<Icon name="info" />}
          title="Notifications"
          description="Weekly summary every Friday."
          trailing={<Badge tone="success">Active</Badge>}
        />
        <ListItem
          leading={<Icon name="calendar" />}
          title="Time zone"
          description="Used to schedule shipments."
          trailing="GMT−3"
        />
        <ListItem
          leading={<Icon name="settings" />}
          title="Language"
          description="Interface and emails."
          trailing="Spanish"
        />
        <ListItem
          leading={<Icon name="calendar" />}
          title="Date format"
          description="How to write days and months."
          trailing="31/12/2026"
        />
        <ListItem
          leading={<Icon name="visibility" />}
          title="Home page"
          description="Where you land when you enter."
          trailing="Summary"
        />
      </List>
    </div>
  );
});

export const ListLinksDemo = framed(function ListLinksDemo() {
  return (
    <div className="sk-list-demo">
      <List aria-label="Project resources">
        <ListItemLink
          href="/en/prerequisites"
          leading={<Icon name="info" />}
          title="Prerequisites"
          description="What you need before installing."
          trailing={<Icon name="arrow-right" />}
        />
        <ListItemLink
          href="/en/first-component"
          leading={<Icon name="info" />}
          title="Getting Started"
          description="Install and configure your first project."
          trailing={<Icon name="arrow-right" />}
        />
        <ListItemLink
          href="/en/customize"
          leading={<Icon name="settings" />}
          title="Personalization"
          description="Adjust color, density, radius and iconography."
          trailing={<Icon name="arrow-right" />}
        />
        <ListItemLink
          href="/en/reference"
          leading={<Icon name="copy" />}
          title="Token Reference"
          description="Consult roles, scales and decision chains."
          trailing={<Icon name="arrow-right" />}
        />
        <ListItemLink
          href="/en/tiers"
          leading={<Icon name="copy" />}
          title="Tiers"
          description="Which layer resolves each decision."
          trailing={<Icon name="arrow-right" />}
        />
      </List>
    </div>
  );
});

export const ListFullDemo = framed(function ListFullDemo() {
  return (
    <div className="sk-list-demo">
      <List aria-label="Equipo" density="compact">
        <ListItemLink
          href="/equipo/allison"
          leading={<Icon name="user" />}
          title="Allison Pena"
          description="Design and experience system."
          trailing={
            <>
              <Badge>Design</Badge>
              <Icon name="arrow-right" />
            </>
          }
        />
        <ListItemLink
          href="/equipo/mateo"
          leading={<Icon name="user" />}
          title="Mateo Ruiz"
          description="Components and infrastructure."
          trailing={
            <>
              <Badge>Engineering</Badge>
              <Icon name="arrow-right" />
            </>
          }
        />
        <ListItemLink
          href="/equipo/elena"
          leading={<Icon name="user" />}
          title="Elena Torres"
          description="Strategy and discovery."
          trailing={
            <>
              <Badge>Product</Badge>
              <Icon name="arrow-right" />
            </>
          }
        />
        <ListItemLink
          href="/equipo/nadia"
          leading={<Icon name="user" />}
          title="Nadia Sepulveda"
          description="Research and content."
          trailing={
            <>
              <Badge>Product</Badge>
              <Icon name="arrow-right" />
            </>
          }
        />
        <ListItemLink
          href="/equipo/tomas"
          aria-disabled="true"
          leading={<Icon name="user" />}
          title="Tomas Vidal"
          description="On leave until September."
          trailing={<Badge>Engineering</Badge>}
        />
      </List>
    </div>
  );
});
