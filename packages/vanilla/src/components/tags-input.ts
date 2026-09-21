import TagsInput from "./TagsInput.svelte";
import { tagsInputAttrs } from "@skryensya/core/tags-input";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts authored TagsInput roots: the machine takes the authored tags over as its seed. */
export const mountTagsInput = createSvelteMount({
  key: "tags-input",
  rootSelector: `[${tagsInputAttrs.root}]`,
  Component: TagsInput,
});
