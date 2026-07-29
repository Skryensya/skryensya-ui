/*
 * Live React demos for /components/avatar. Self-contained island (no function props crossing the
 * Astro boundary), mounted directly from the page with a bare `<AvatarDemo client:load />`.
 */
import { Avatar, AvatarGroup } from "@skryensya/react/avatar";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const ACCENT_HEX = "1f5fc3";
const ON_ACCENT_HEX = "ffffff";
const demoSrc = (initials: string) =>
  `https://dummyimage.com/160/${ACCENT_HEX}/${ON_ACCENT_HEX}?text=${initials}`;

export const AvatarDemo = framed(function AvatarDemo() {
  return (
    <div className="sk-inline">
      <Avatar name="Ada Lovelace" size="sm" src={demoSrc("AL")} />
      <Avatar name="Alan Turing" src={demoSrc("AT")} />
      <Avatar name="Grace Hopper" size="lg" src={demoSrc("GH")} />

      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Alan Turing" />
      <Avatar name="Grace Hopper" size="lg" />

      <AvatarGroup max={3}>
        <Avatar name="Ada Lovelace" src={demoSrc("AL")} />
        <Avatar name="Alan Turing" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Raul G" />
        <Avatar name="Person 2" />
        <Avatar name="Person 3" />
        <Avatar name="Person 4" />
        <Avatar name="Person 5" />
        <Avatar name="Person 6" />
        <Avatar name="Person 7" />
        <Avatar name="Person 8" />
      </AvatarGroup>
    </div>
  );
});
