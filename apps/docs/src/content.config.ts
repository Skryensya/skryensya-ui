import { defineCollection } from "astro:content";

/*
 * El sitio no documenta las decisiones: viven en el repo (docs/decisiones/), y ésa es su única
 * casa. No hay colección que leerlas, el registro es la fuente, y no se refleja aquí.
 */
export const collections = {} satisfies Record<string, ReturnType<typeof defineCollection>>;
