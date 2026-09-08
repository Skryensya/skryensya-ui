import { defineCollection } from "astro:content";

/*
 * The site does not document the decisions: they live in the repo (docs/decisions/), and that is
 * their only home. There is no collection reading them, the register is the source, and it is not
 * mirrored here.
 */
export const collections = {} satisfies Record<string, ReturnType<typeof defineCollection>>;
