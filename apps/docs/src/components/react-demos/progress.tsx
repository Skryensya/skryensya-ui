/*
 * Live React demo for /components/progress. Self-contained island (no function props crossing the
 * Astro boundary), mounted directly from the page with `<ProgressDemo client:load />`.
 */
import { Progress } from "@skryensya/react/progress";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const ProgressDemo = framed(function ProgressDemo() {
  return (
    <>
      <Progress label="Subida" value={68} />
      <Progress label="Completado" value={100} tone="success" />
      <Progress label="Cuota" value={24} tone="danger" />
    </>
  );
});
