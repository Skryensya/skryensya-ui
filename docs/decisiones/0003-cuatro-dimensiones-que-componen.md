---
num: 3
title: Cuatro dimensiones que componen en vez de multiplicarse
short: "Cuatro dimensiones"
summary: >-
  Marca, modo de color, alto contraste y densidad multiplicadas darían 96 hojas escritas a mano con las
  ocho marcas enviadas. La salida es hacerlas ortogonales: cada dimensión posee una capa distinta del
  grafo de tokens, así que componen en la cascada en vez de enumerarse. El límite de dos slots de
  light-dark() moldea el resto del modelo, el alto contraste es un bloque de override aparte, y todo token
  mode-aware es necesariamente un token de color.
---

Marca, modo de color, alto contraste y densidad. En crudo son una explosión combinatoria, 8 marcas ×
2 modos × 2 contrastes × 3 densidades = 96 hojas escritas a mano, y cada componente o marca nueva la
multiplica. No hay marca default: se elige una con `data-brand` o se define una propia.

La salida es hacerlas **ortogonales**: cada dimensión posee una capa distinta del grafo de tokens, así
que componen en la cascada en vez de enumerarse.

| Dimensión | Posee | Mecanismo | Se activa con |
|---|---|---|---|
| **Marca** | rampas tier-1 | cambia la paleta primitiva | `data-brand` |
| **Modo de color** | color tier-2 | `light-dark()` elige slot | `color-scheme` |
| **Alto contraste** | color tier-2 | un bloque de override re-declara los mismos tokens | `data-contrast` |
| **Densidad** | espaciado tier-2 | un multiplicador en runtime | `--sk-density` |

`oscuro × ember × compacto` no existe en ningún lado del disco: lo computa el navegador desde un archivo
de marca elegido más los tokens base.

## La prueba de que es real

Cada `brands/*.scss` contiene **cero tokens semánticos**. Una marca es tier 1 puro.

Esta ortogonalidad es estructural y frágil: en el momento en que un token semántico referencia un hue en
vez de [una posición de rampa](/decisiones/0002-nombrar-por-rol-nunca-por-inquilino), o un archivo de
marca empieza a pisar semánticos, dos dimensiones comparten capa y la explosión vuelve. Las reglas de
dirección de tiers y de no-valores-crudos del [validador](/decisiones/0007-el-validador) existen en
parte para custodiar esto.

## El límite de dos slots de `light-dark()` dicta el resto del modelo

`light-dark()` es la forma nativa de servir uno de dos valores según el `color-scheme` usado. Invertir
`color-scheme` en `<html>` re-tematiza la página sin CSS extra y regala scrollbars y controles nativos
oscuros. Pero tiene dos límites duros: toma **exactamente dos argumentos**, y solo vale **donde vale un
`<color>`**.

Los dos límites no se pelean: se aceptan, y moldean el modelo.

- **Tres modos no entran en dos slots.** Por eso el alto contraste *no* es un tercer argumento: es un
  bloque de override aparte (`modes/hc.scss`) que re-declara los mismos tokens semánticos con posiciones
  de rampa `hc-*`, todavía envuelto en `light-dark()` para que componga con el eje claro/oscuro.
- **Lo que no es color no puede ser mode-aware, punto.** Una sombra, un largo, una familia tipográfica
  jamás pueden vivir dentro de `light-dark()`. Donde una sombra necesita variar por modo, su *color* se
  aísla en su propio token (`--shadow-md`) y el composite de `box-shadow` (`--elevation-raised`) lo
  referencia.

**Consecuencia:** todo token mode-aware del sistema es, necesariamente, un token de color. Eso es una
propiedad de la plataforma, no una decisión estética, y es por lo que la elevación se modela como
token-de-color-más-composite. Cualquiera que agregue un token no-color que varíe por modo va a chocar
contra esta pared; el arreglo es siempre "extraer la parte de color".
