---
num: 23
title: Una marca raíz configurable
short: "Una marca raíz"
summary: >-
  El sistema envía una sola configuración de ramps en :root. tokens.scss la incluye siempre y el
  consumidor ajusta su identidad redefiniendo seeds como custom properties; no hay catálogo de marcas,
  entrypoints alternativos ni data-brand.
---

El sistema tiene una sola marca. No se selecciona y no se monta con un atributo: `tokens.scss` declara las
ramps tier 1 sobre `:root` y cualquier consumidor configura su identidad en CSS.

```scss
@import "@skryensya/core/tokens.scss";

:root {
  --seed-accent: oklch(52% 0.19 20);
  --seed-neutral: oklch(58% 0.01 30);
}
```

`--seed-accent` ocupa el rung 600 de accent. `--seed-neutral` aporta el undertone de los grises. Las seeds
de danger, success y warning tienen defaults sobrios y son opcionales. También se puede redefinir un
`--ramp-*` puntual cuando el caso lo requiere.

## Por qué :root y no data-brand

Los tokens de ramp se declaran en la capa `primitives`. El CSS del consumidor queda sin capa y por eso gana
en cascada sin importar el orden de imports. Las rampas derivadas leen los seeds al resolver su valor, así
que cambiar una seed actualiza los stops y los tokens semánticos que referencian sus posiciones.

El contrato del consumidor queda reducido a una regla CSS. No hay nombre de marca que mantener, selector que
propagar al HTML ni posibilidad de que dos subárboles diverjan por accidente.

## Qué cambia del modelo anterior

Se eliminan los archivos `brands/*`, sus exports y la dimensión Brand. Modo de color, alto contraste,
densidad y radio siguen siendo las cuatro dimensiones independientes. Las rampas no son una dimensión: son
la base tier 1 que esas dimensiones consumen.

El validador continúa midiendo contraste para la configuración enviada, incluyendo `color-mix(in oklab, …)`.
Una aplicación que sobreescribe seeds también modifica sus colores y debe comprobar sus propios ratios, igual
que con cualquier override CSS sin capa.

## Lo que se rechazó

- **Mantener una marca base y marcas opcionales.** Conserva dos modelos de consumo y obliga a explicar
  selección, precedence y atributos aunque casi todas las aplicaciones usan una sola identidad.
- **Exigir un mixin o un segundo import después de tokens.scss.** Hace que los ramps puedan faltar y vuelve a
  abrir el error de configuración que la marca raíz elimina.
- **Aplicar seeds a un selector específico.** Mueve una configuración global al markup y permite que partes
  de una aplicación usen identidades distintas sin una necesidad del dominio.
