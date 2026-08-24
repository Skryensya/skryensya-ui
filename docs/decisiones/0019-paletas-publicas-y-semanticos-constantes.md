---
num: 19
title: Paletas públicas y semánticos constantes
short: "Paletas públicas"
summary: >-
  Core deja de publicar rampas de rol tier 1. Publica paletas Tailwind-like sin significado como
  materia prima y expresa marca, feedback, superficies, texto y bordes como bundles semánticos
  explícitos que no derivan combinaciones de color en runtime.
---

El modelo de color cambia de `ramp -> semantic` a `palette -> semantic`. Una **Palette** es tier 1, se
nombra por hue (`--palette-slate-500`, `--palette-blue-600`) y usa la escala Tailwind `50`–`950`, más
`--palette-white` y `--palette-black`. Los valores son los OKLCH publicados por Tailwind; Core puede elegir
otros rungs semánticos si un par de contraste lo exige, pero no altera la paleta base.

Los semánticos (`--color-*`) siguen siendo la capa que nombra significado: superficies, texto, bordes,
actions, accent y feedback. Pueden referenciar palettes y `light-dark()`, pero no generan colores con
`color-mix()` ni recetas Sass. Un componente o styling hook tier 3 nunca referencia `--palette-*`; solo
consume semánticos. Esa es la nueva regla que reemplaza “tier 3 nunca alcanza una rampa”.

## Marca, accent y feedback

`accent` deja de ser una rampa. Es un bundle semántico completo: action primary, text accent/link, border
accent/focus y bg accent subtle cambian juntos. La marca default puede apuntar a `blue`; un tenant no crea
`--palette-accent-*`, re-declara el bundle semántico de accent.

`danger`, `success`, `warning` e `info` también dejan de ser rampas. Son roles semánticos de feedback que
por default leen `red`, `emerald`, `amber` y `sky`. El feedback nunca lee accent: un aviso informativo no
cambia de meaning cuando cambia la marca.

La dimensión `accent reach` desaparece. Los estados current de navegación usan accent directo; badges, tags,
kbd y marcadores decorativos usan los semánticos base de accent; ghost/quiet actions quedan en
`--color-text-primary`; el media gradient usa `--color-action-accent`. No queda `data-accent` ni tokens
globales `--color-decorative-*`, `--color-nav-current-*`, `--color-action-quiet-fg` o
`--color-decorative-wash`.

## Lo que sustituye

Esta decisión sustituye las partes de ADR-0019, ADR-0019, ADR-0019, ADR-0019 y ADR-0019 que asumían ramps
de rol como primitivo público. Conserva tres invariantes de esas decisiones: componentes no consumen tier 1,
el contraste se valida sobre el CSS que se publica, y la marca se expresa como CSS ordinario sin selector
`data-brand`.

## Costo aceptado

El sistema publica muchas más variables tier 1 que antes porque expone todas las palettes Tailwind-like,
incluidas varias neutrales. Se acepta porque esas variables son constantes auditables, evitan generación de
color en runtime y dan una base común para productos que necesitan re-declarar bundles semánticos sin inventar
una paleta propia desde cero.
