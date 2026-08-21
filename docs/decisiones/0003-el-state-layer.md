---
num: 3
title: El state layer usa `currentColor` y una escalera de un solo layer activo
short: "El state layer"
summary: >-
  El state layer es el mecanismo de interacción del sistema, no un extra opt-in: viaja en el bundle base
  (tokens.scss), siempre presente, y ningún componente inventa sus propios colores de hover/pressed. Es un
  overlay semitransparente teñido con currentColor, así que un solo token cubre superficies neutras y
  rellenos saturados en ambos modos. Se muestra exactamente un layer activo a la vez, por una escalera de
  prioridad resuelta por orden de archivo, nunca por suma de opacidades. El layer nunca es la única señal:
  el foco lleva un anillo independiente verificado a 3:1, en su propia familia de tokens.
---

Los estados interactivos (hover, focus, pressed, selected, dragged) necesitan un tratamiento visual
consistente en cada componente, variante y color semántico, sin inventar un color por combinación. El
patrón es un overlay semitransparente: el **state layer**.

## Es el mecanismo de interacción del sistema, no un opt-in

El state layer es [un pattern](/decisiones/0002-que-envia-tier-3) según la regla de qué envía tier 3, 
envía estructura, porque button, tile, menu-item y tab necesitan todos el mismo `::before`. Pero, a
diferencia de los otros patterns, **no es opt-in**: viaja en `tokens.scss`, el bundle base, igual que el
[motion](/decisiones/0004-motion-por-tokens-de-intencion).

La razón es que la interacción es **universal**. Un pattern como el top layer del dialog lo necesitan
solo algunas apps, así que se importa aparte. Pero todo componente interactivo tiene estados, y un
componente que se inventa sus propios colores de hover/pressed está reimplementando esto, exactamente lo
que pasó con el botón antes de corregirlo. Hacerlo base es lo que convierte al state layer en **la** forma
de expresar estados, no una de dos.

El `::before` es **inerte hasta que un elemento lleva la clase `sk-interactive`**, así que enviarlo en
base no cuesta nada sobre lo que no es interactivo. La clase es la API del mecanismo, marca qué
elementos son interactivos, no un opt-in de bundle: no hay nada que importar.

## El tinte es `currentColor`

`--state-layer-color: currentColor`, el color de contenido del propio componente. Un solo token cubre
todo:

- **Subsume negro-sobre-claro / blanco-sobre-oscuro.** Una superficie neutra tiene texto oscuro (modo
  claro) o claro (modo oscuro), así que el layer oscurece o aclara solo, sin una rama por modo.
- **Es correcto sobre rellenos saturados**, donde negro/blanco falla: el contenido de un botón primario
  es `on-accent` (casi blanco), así que el layer es un velo blanco sobre azul. Un overlay negro ahí se
  ve turbio.
- **Cero tokens de color por componente.**

## Exactamente un layer activo

Se muestra la opacidad de **un solo** estado. Las opacidades **nunca se suman**. La escalera, de mayor a
menor prioridad:

```
disabled > dragged > pressed > focus > hover > selected > default
```

Y se realiza **sin selectores combinados**: cada regla de estado asigna el mismo
`--state-layer-opacity`, todos los selectores tienen la misma especificidad (0,2,0), así que cuando
varios coinciden decide el **orden en el archivo**. Las reglas están escritas en prioridad ascendente: la
última gana. `disabled` fuerza la opacidad a 0.

## `selected` es el escalón más bajo, no una base aditiva

Una base persistente debajo de hover significaría dos capas superpuestas, es decir, opacidad sumada, que
el modelo prohíbe. Así que selected es el más bajo y hover/pressed lo reemplazan.

La selección nunca desaparece porque **siempre lleva un indicador independiente**: un check, un control
relleno, un riel, un peso. Un equipo que necesite un selected+hover más fuerte define un token de
opacidad combinada dedicado, nunca una suma en runtime.

## Las opacidades son invariantes al modo

Un número no puede vivir dentro de `light-dark()`
([por qué](/decisiones/0019-paletas-publicas-y-semanticos-constantes)), así que la escalera no cambia entre
claro y oscuro. Tampoco se duplica en alto contraste: más `currentColor` acercaría el fondo al texto
y haría que la superficie se leyera apagada. `[data-contrast="high"]` conserva el wash y añade un
keyline inset cuyo ancho crece con la opacidad del estado; el anillo de foco independiente pasa a 3px.

## Accesibilidad, no negociable

El layer **nunca es la única señal**:

- El foco lleva un anillo independiente, verificado a ≥3:1 por
  [el validador](/decisiones/0019-paletas-publicas-y-semanticos-constantes). Por eso vive en su propia familia `--focus-ring-*` y
  **no** dentro de `--state-layer-*`: el nombre carga la garantía. Meterlo adentro diría que el anillo
  es parte del layer, cuando toda la garantía es que es independiente.
- La selección lleva un indicador real.
- `disabled` atenúa con los tokens del componente y **fuerza el layer a 0**.
- Se usa `:focus-visible`, no `:focus`, así un clic con mouse no deja un layer pegado.
- El fade respeta `prefers-reduced-motion`.

## Implementación y caso borde

Un `::before` con `pointer-events: none` y `z-index: -1` bajo `isolation: isolate`, más
`border-radius: inherit`. Las variantes con `:has()` dejan que la misma clase cubra controles nativos e
inputs envueltos en label, `::before` no renderiza en un `<input>`.

Un consumidor con un selector más específico que `.sk-interactive:hover` puede romper la escalera. Es
una limitación de CSS, la misma que acepta la especificidad de las variantes en
[los tres tiers](/decisiones/0019-paletas-publicas-y-semanticos-constantes).
