import UserSelect from "./UserSelect.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { userSelectAttrs } from "@skryensya/core/user-select";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored UserSelect roots; it never scans or imports another enhancer. */
export const mountUserSelect = createSvelteMount({
  key: "user-select",
  rootSelector: rootSelectorFor(userSelectAttrs),
  Component: UserSelect,
});
