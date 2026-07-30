/*
 * The one live React demo /components/list still needs.
 *
 * The other five moved to `src/demos/list.ts` as usage trees. This one could not follow: it is the
 * FLOOR of the page ladder — a bare `<li>` holding nothing but text — and `ListItem` declares
 * `title` as a required slot with no `children`, so "a row with no slots at all" is precisely what
 * the contract cannot say. See the note in `src/demos/list.ts`.
 */
import { List, ListItem } from "@skryensya/react/list";
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
