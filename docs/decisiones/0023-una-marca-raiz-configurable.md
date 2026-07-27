---
num: 23
title: Una marca raíz con rampas explícitas
short: "Una marca raíz"
summary: >-
  Core envía una configuración completa de rampas en :root. El consumidor sustituye roles completos
  con CSS tier 1 generado por su herramienta de marca; no hay inputs de generación, catálogo de marcas,
  entrypoints alternativos ni data-brand.
---

El sistema tiene una sola marca. No se selecciona ni se monta con un atributo: `tokens.scss` declara las
rampas tier 1 sobre `:root` y cualquier consumidor configura su identidad con CSS ordinario.

```scss
@import "@skryensya/core/tokens.scss";
@import "./brand-ramps.css";
```

`brand-ramps.css` contiene cada posición de los roles que reemplaza, por ejemplo
`--ramp-accent-50` hasta `--ramp-accent-950`. La herramienta de marca puede generarlas con cualquier
curva, pero Core solo conoce la salida explícita.

## Por qué :root y no data-brand

Las rampas se declaran en la capa `primitives`. El CSS del consumidor queda sin capa y por eso gana en
cascada sin depender del orden de imports. No hay nombre de marca que mantener, selector que propagar al
HTML ni posibilidad de que dos subárboles diverjan por accidente.

## Por qué el rol completo

Una posición aislada no expresa la curva ni permite revisar sus relaciones. Reemplazar el rol completo
hace visibles todos sus valores, conserva un solo origen para cada rampa y permite que contraste se valide
contra lo que realmente se publica. Accent y neutral forman la identidad; danger, success, warning e info
son roles de feedback independientes y solo se reemplazan cuando el producto lo necesita.

Este contrato sustituye la generación implícita dentro de Core descrita históricamente en
[ADR-22](/decisiones/0022-la-marca-base-y-la-receta-derivada). La generación sigue siendo útil, pero vive
en tooling y exporta CSS; no forma parte del runtime.

## Qué no cambia

Modo de color, alto contraste, densidad y radio siguen siendo las cuatro dimensiones independientes. Las
rampas no son una dimensión: son la base tier 1 que esas dimensiones consumen. El validador continúa
midiendo contraste para el set enviado, incluyendo cualquier `color-mix(in oklab, …)` explícito.

## El costo

Un archivo de marca es más largo que dos colores de entrada. La verbosidad se acepta porque la asume una
herramienta, no cada componente, y porque elimina comportamiento implícito del contrato de Core.

## Lo que se rechazó

- **Conservar colores raíz dentro de Core.** Acopla una política de generación concreta al contrato
  runtime y oculta el alcance real de un cambio.
- **Permitir overrides de posiciones sueltas como vía principal.** Produce rampas parciales y hace
  difícil revisar contraste y coherencia.
- **Aplicar una marca a un selector específico.** Mueve una configuración global al markup y permite
  identidades divergentes sin una necesidad del dominio.
