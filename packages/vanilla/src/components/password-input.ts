import PasswordInput from "./PasswordInput.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { passwordInputAttrs } from "@skryensya/core/password-input";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored PasswordInput roots; it never scans or imports another enhancer. */
export const mountPasswordInput = createSvelteMount({
  key: "password-input",
  rootSelector: rootSelectorFor(passwordInputAttrs),
  Component: PasswordInput,
});
