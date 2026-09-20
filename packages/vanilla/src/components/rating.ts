import Rating from "./Rating.svelte";
import { ratingAttrs } from "@skryensya/core/rating";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Rating roots; RatingDisplay has no machine and is never matched. */
export const mountRating = createSvelteMount({
  key: "rating",
  rootSelector: `[${ratingAttrs.root}]`,
  Component: Rating,
});
