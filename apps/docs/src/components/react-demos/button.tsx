/*
 * Live React demos for /components/button. Each export is a self-contained island (no function
 * props crossing the Astro boundary — those can't serialize for `client:load`), mounted directly
 * from the page with a bare `<ButtonBasicDemo client:load />`.
 *
 * `framed()` gives each one its own srcdoc frame, the same isolation the Vanilla binding beside it
 * already had. Call sites do not change: the isolation is a property of the demo, not something
 * every page has to remember to ask for.
 */
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import { TileButton } from "@skryensya/react/tile-button";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const ButtonBasicDemo = framed(function ButtonBasicDemo() {
  return (
    <div className="sk-inline">
      <Button variant="primary" onClick={() => {}}>
        Save
      </Button>
      <Button variant="neutral" onClick={() => {}}>
        Cancel
      </Button>
      <Button variant="danger" onClick={() => {}}>
        Delete
      </Button>
    </div>
  );
});

/** Every Button shape rendered as a link: same classes, same data-* attributes, only the tag (`<a>`) and the `href` prop differ. */
export const ButtonAsLinkDemo = framed(function ButtonAsLinkDemo() {
  return (
    <div className="sk-inline">
      <Button variant="primary" href="/en/first-component">
        Go to first component
      </Button>
      <Button size="sm" variant="neutral" href="/en/first-component">
        Small
      </Button>
      <Button size="lg" variant="neutral" href="/en/first-component">
        Large
      </Button>
      <Button variant="neutral" href="/en/first-component">
        <Icon name="download" />
        With icon
      </Button>
      <Button iconOnly variant="ghost" aria-label="Go to first component" href="/en/first-component">
        <Icon name="arrow-right" />
      </Button>
    </div>
  );
});

export const ButtonSizeDemo = framed(function ButtonSizeDemo() {
  return (
    <div className="sk-inline">
      <Button size="sm" variant="primary" onClick={() => {}}>
        Save
      </Button>
      <Button variant="primary" onClick={() => {}}>
        Save
      </Button>
      <Button size="lg" variant="primary" onClick={() => {}}>
        Save
      </Button>
      <Button size="sm" iconOnly variant="ghost" aria-label="More actions" onClick={() => {}}>
        <Icon name="more" />
      </Button>
      <Button iconOnly variant="ghost" aria-label="More actions" onClick={() => {}}>
        <Icon name="more" />
      </Button>
    </div>
  );
});

export const TileButtonDemo = framed(function TileButtonDemo() {
  return (
    <TileButton onClick={() => {}}>
      <span className="sk-tile__content">
        <span className="sk-tile__title">Run deployment</span>
        <span className="sk-tile__description">Start the production deployment now.</span>
      </span>
    </TileButton>
  );
});

export const ButtonIconDemo = framed(function ButtonIconDemo() {
  return (
    <Button variant="primary" onClick={() => {}}>
      <Icon name="download" />
      Descargar
    </Button>
  );
});

export const ButtonIconOnlyDemo = framed(function ButtonIconOnlyDemo() {
  return (
    <div className="sk-inline">
      <Button iconOnly aria-label="Settings" onClick={() => {}}>
        <Icon name="settings" />
      </Button>
      <Button iconOnly variant="ghost" aria-label="Editar" onClick={() => {}}>
        <Icon name="edit" />
      </Button>
    </div>
  );
});

export const ButtonIconOnlySmDemo = framed(function ButtonIconOnlySmDemo() {
  return (
    <div className="sk-inline">
      <Button size="sm" iconOnly aria-label="Settings" onClick={() => {}}>
        <Icon name="settings" />
      </Button>
      <Button size="sm" iconOnly variant="ghost" aria-label="Editar" onClick={() => {}}>
        <Icon name="edit" />
      </Button>
      <Button size="sm" iconOnly variant="primary" aria-label="Add" onClick={() => {}}>
        <Icon name="add" />
      </Button>
    </div>
  );
});
