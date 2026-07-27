---
num: 18
title: El radio es una dimensión, no una propiedad de marca
short: "El radio es dimensión"
summary: >-
  La redondez de esquina es una quinta dimensión componible, marca, modo de color, alto contraste,
  densidad y radio, ortogonal a la marca. Usa el mecanismo de la densidad: un multiplicador
  (`--radius-multiplier`) que escala una escala de radios por rol, así control y surface siguen distintos
  y una sola perilla los mueve a todos. Se activa con data-radius (none / sm / md / lg / xl) como presets
  del multiplicador, o con un valor continuo directo. pill es el invariante deliberado de la dimensión. Es
  invariante a la densidad porque es redondez, no espacio.
---

El radio de esquina es una dimensión componible, ortogonal a la marca: ninguna marca lo setea. Tratarlo
como "propiedad de marca" no describiría nada real, las ocho marcas comparten los mismos pasos de escala
para los roles de radio, así que la redondez es un eje propio, no un rasgo de la paleta.

Un producto quiere elegir la **redondez global** de la UI, esquinas vivas, redondeadas o suaves, sin
cambiar de marca, y sin que esa elección se enrede con el modo de color, el contraste o la densidad. Eso
es, exactamente, la forma de una dimensión.

## Es una dimensión más, y compone igual que las otras

El [modelo de cuatro dimensiones](/decisiones/0003-cuatro-dimensiones-que-componen) pasa a ser de cinco:
marca, modo de color, alto contraste, densidad y **radio**. La prueba de que sumar una dimensión no
reabre la explosión combinatoria es la misma de siempre: no se escribe una hoja por combinación, se
escribe **un bloque de override** que re-declara tokens semánticos y compone en la cascada.

| Dimensión | Posee | Mecanismo | Se activa con |
|---|---|---|---|
| **Marca** | rampas tier-1 | cambia la paleta primitiva | `data-brand` |
| **Modo de color** | color tier-2 | `light-dark()` elige slot | `color-scheme` |
| **Alto contraste** | color tier-2 | un bloque de override re-declara los mismos tokens | `data-contrast` |
| **Densidad** | espaciado tier-2 | un multiplicador en runtime | `--sk-density` |
| **Radio** | redondez tier-2 | un multiplicador en runtime | `data-radius` / `--radius-multiplier` |

El mecanismo es el de la **densidad**: un **multiplicador**, no un remapeo por nivel de cada rol. La
redondez global es una magnitud, "qué tan vivas son las esquinas", y lo que se quiere es escalar toda la
familia con un número, no que todo caiga al mismo radio. `semantic/_radius.scss` declara los roles como
`base × var(--radius-multiplier)` (control sobre `--scale-radius-md`, surface sobre `--scale-radius-lg`),
así conservan su lugar en la escala: surface siempre 1.5× control, a cualquier multiplicador.
`dimensions/radius.scss` re-declara **solo** `--radius-multiplier` bajo `[data-radius="…"]` en la capa
`overrides`, que gana sobre `semantic` por orden de capa: `none 0 · sm 0.5 · md 1 · lg 1.5 · xl 2`. Un
producto también puede setear el multiplicador a un valor continuo (p. ej. `1.25`) fuera de esa escalera.
La línea de base sin atributo es el default semántico (multiplicador 1) y equivale a `data-radius="md"`;
ese valor se declara explícito además, para poder resetear a base dentro de un subárbol `xl` o `none`.

## El invariante: pill no se mueve

La dimensión toca los dos roles de **redondez** y deja quieto el rol de **forma**:

- `--radius-control` y `--radius-surface` se mueven, son "qué tan vivas son las esquinas".
- `--radius-pill` es **invariante**. Un pill es una forma, una lozenge completamente redonda, no un
  ajuste de redondez; volverlo un rectángulo en `none` borraría su identidad.

Cada dimensión lleva su invariante deliberado adentro: la densidad tiene el piso de 24px de WCAG
([decisión 4](/decisiones/0004-la-densidad-es-un-multiplicador-con-el-piso-adentro)), el radio tiene el
pill. Es una propiedad por construcción, no por documentación.

## Ortogonal a la marca y a la densidad

El radio es su propia dimensión, ortogonal a la marca. Y es invariante a la densidad, porque es una
preocupación de redondez, no de espacio: la [decisión 4](/decisiones/0004-la-densidad-es-un-multiplicador-con-el-piso-adentro)
es la fuente de por qué la densidad no lo escala, y ésta es la fuente de qué lo escala.

El [validador](/decisiones/0007-el-validador) cubre el archivo nuevo sin cambios de reglas: `dimensions/`
se mapea a tier semántico. Ahora solo re-declara `--radius-multiplier` (un número, sin referencias tier-1);
las referencias a `--scale-radius-*` viven en `semantic/_radius.scss` y se chequean como cualquier semántico
apuntan hacia abajo, no hacia arriba, y nada interfiere con los chequeos de completitud de modo, que miran
`modes/hc.scss` puntualmente.
