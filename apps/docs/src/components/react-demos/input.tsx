/*
 * Live React demos for /components/input. Each export is a self-contained island (no function
 * props crossing the Astro boundary), mounted directly from the page with a bare
 * `<InputBasicDemo client:load />`.
 */
import { useState } from "react";
import { Field, Input, Textarea } from "@skryensya/react/input";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const InputBasicDemo = framed(function InputBasicDemo() {
  const [email, setEmail] = useState("");
  const error = email === "" ? "Enter a work address." : undefined;

  return (
    <>
      <Field label="Email" hint="We only use it for ballots." error={error} required>
        <Input
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field label="Notes">
        <Textarea name="notes" />
      </Field>
    </>
  );
});
