/*
 * Live React demo for /components/tag. No function props cross the Astro boundary, so `onRemove`
 * closures stay local to this island.
 */
import { Tag } from "@skryensya/react/tag";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const TagDemo = framed(function TagDemo() {
  return (
    <div className="sk-inline">
      <Tag>design</Tag>
      <Tag tone="accent">tokens</Tag>
      <Tag tone="success">activo</Tag>
      <Tag tone="warning">beta</Tag>
      <Tag tone="danger">deprecado</Tag>
      <Tag tone="accent" onRemove={() => {}} removeLabel="Quitar react">
        react
      </Tag>
      <Tag onRemove={() => {}} removeLabel="Quitar frontend">
        frontend
      </Tag>
    </div>
  );
});
