---
num: 10
title: El motion se maneja con tokens de intención
short: "Motion por intención"
summary: >-
  El motion se maneja con tokens de intención: los componentes describen qué significa una transición
  (entrar, responder, expandir), no cuánto dura, así que los valores técnicos evolucionan sin tocar
  ninguna API. La regla de tier-skip del validador ya prohíbe que un componente use una duración cruda.
  Reduced motion no es un interruptor a cero: redefine los mismos tokens según su rol, así que ningún
  componente cambia.
---

Sin un lenguaje, cada equipo elige duraciones y easings arbitrarios. Con uno, los componentes describen
**qué significa** una transición, entrar, responder, expandir, no cuánto dura, así que los valores
técnicos evolucionan sin tocar la API de ningún componente.

Motion **no es opt-in**: vive en `primitives.scss` y `semantic.scss`, es decir que viene en el bundle base.
Si se importa `tokens.scss`, ya está incluido.

## Los mismos tres tiers que el color

- **Tier 1, valores técnicos, sin significado.** `--scale-duration-{instant,fast,moderate,slow}`,
  `--scale-easing-{linear,standard,enter,exit,emphasized,spring}`.
- **Tier 2, intención.** `--motion-enter-{duration,easing,distance}`, `--motion-feedback-*`,
  `--motion-expand-*`, más una escala `--motion-distance-{none,sm,md,lg}`.
- **Tier 3, los componentes consumen intención, y solo intención.**

## Enforced gratis por la regla que ya existía

Como las duraciones y easings de escala son primitivos de tier 1, la regla de tier-skip del
[validador](/decisiones/0007-el-validador) **ya prohíbe** que un componente referencie una duración
cruda: tiene que pasar por un token de intención. No hizo falta una regla nueva, la del color hace el
trabajo.

Ajustar un primitivo (`fast` de 120 a 100ms) reestiliza el sistema entero con cero ediciones en
componentes. Ese es todo el punto de una API semántica.

```css
/* Falla el build: un componente no llega a un primitivo. */
.ds-dialog { transition: opacity var(--scale-duration-fast); }

/* Así se consume. */
.ds-dialog {
  transition: opacity var(--motion-enter-duration) var(--motion-enter-easing);
  translate: 0 var(--motion-enter-distance);
}
```

## La dirección lleva significado

**Entrar decelera** (`easing-enter`) y viaja una distancia `md` hasta su lugar. **Salir acelera**
(`easing-exit`), dura menos y viaja menos: sobre un elemento que se va ya se decidió, así que hacer
esperar al usuario es latencia pura. La distancia mapea jerarquía: `lg` para navegación y profundidad,
`sm` para reveals inline.

Los springs existen como primitivo pero están marcados **no para UI crítica**: el overshoot se lee como
imprecisión.

## Reduced motion es una variante funcional, no un interruptor

Un `@media` que pone todas las duraciones en cero es la solución fácil y está mal: hace imperceptibles
los cambios de estado esenciales. En vez de eso, el mismo bloque redefine los **mismos** tokens de
intención según su rol:

| Rol | Qué le pasa |
|---|---|
| **Helpful** (enter, exit, reveal, navigate) | distancia a 0, queda un fade corto |
| **Essential** (state-change, expand/collapse) | conserva una duración breve y legible |
| **Decorative** (emphasize) | a 0 |
| **Continuous** (loading) | duración más suave; el componente debería cambiar a una variante no espacial |

Como redefine tokens que los componentes ya consumen, **ningún componente cambia**. La reducción es
sistémica, no per-componente.

## Lo que se rechazó

- *Exponer solo tokens técnicos (`duration-fast`, `ease-in-out`).* Es exactamente lo que deja a los
  equipos elegir arbitrariamente; los tokens de intención son todo el pedido.
- *Un provider en JS como fuente de verdad.* Los tokens son custom properties, así que
  `prefers-reduced-motion` funciona con cero JS. Un provider solo haría falta para forzar un modo contra
  la preferencia del sistema operativo.
