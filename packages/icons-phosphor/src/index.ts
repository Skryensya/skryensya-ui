/*
 * Phosphor Icons enlazado al vocabulario estable, un set de iconos es una marca (decisión 15).
 *
 * El sistema nombra el rol (`chevron-down`); este paquete dice qué dibujo lo ocupa, igual que la
 * configuración raíz dice qué tono ocupa `--palette-blue-600`. Cambiar de set no mueve un solo call site:
 * eso es la portabilidad, funcionando.
 *
 * Vive fuera de @skryensya/core por dos razones que ya estaban decididas: core no nombra inquilinos
 * (decisión 2), y sus dependencies están vacías. Aquí Phosphor Icons es una devDependency, la geometría se
 * generó en build, así que tu bundle recibe 32 iconos de datos y cero runtime de la librería.
 */
import type { IconSet } from "@skryensya/core/icon";
import { generated } from "./generated/set.js";

/** El set completo. `satisfies IconSet` prueba que cubre el vocabulario entero. */
export const phosphorIcons: IconSet = generated satisfies IconSet;
