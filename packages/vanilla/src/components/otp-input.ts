import OtpInput from "./OtpInput.svelte";
import { otpInputAttrs } from "@skryensya/core/otp-input";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored OtpInput roots. */
export const mountOtpInput = createSvelteMount({
  key: "otp-input",
  rootSelector: `[${otpInputAttrs.root}]`,
  Component: OtpInput,
});
