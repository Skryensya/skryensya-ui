---
num: 5
title: Los primitivos de color se escriben en OKLCH
short: "Color en OKLCH"
summary: >-
  Los primitivos de color se escriben en oklch() porque la luminosidad es perceptualmente uniforme:
  escribir una rampa es caminar el valor L por una curva suave, con chroma explícito y hue estable dentro
  de cada rampa. Eso deja que una marca cambie hue, neutral y perfil L/C sin tocar los nombres que consume
  la semántica. El validador convierte OKLCH a luminancia WCAG por su cuenta.
---

Las rampas se pueden escribir en hex, HSL, o en un espacio perceptual. Necesitan pasos *perceptualmente*
parejos, que `500 → 600` se vea como un movimiento consistente en cada posición, y se busca derivar
los estados de hover/pressed empujando la luminosidad en vez de escribir cada uno a mano.

**Cada primitivo de color se escribe en `oklch()`.** La luminosidad es perceptualmente uniforme, así que
escribir una rampa es caminar el valor `L` por una curva suave. El hue se mantiene constante dentro de
una rampa, es literalmente el tercer argumento, pero una marca puede elegir otro perfil de `L/C`: más
vivo, más apagado, más nocturno, más terroso. Sigue siendo `accent-600`, no `blue-600`.

## Consecuencias

La derivación de estados con `color-mix(in oklab, …)` y la sintaxis de color relativo
(`oklch(from … calc(l + .08) c h)`) queda disponible para los consumidores sin tokens extra.

[El validador](/decisiones/0007-el-validador) tiene que convertir OKLCH → sRGB-lineal →
luminancia-WCAG él mismo, porque no hay `getComputedStyle` en Node. Está implementado una sola vez, en
`scripts/parse.mjs`, y es la parte más delicada del repo.

El soporte de `oklch()` es Baseline. Un consumidor que necesite navegadores antiguos requeriría una capa
de fallback en hex que no se construyó.
