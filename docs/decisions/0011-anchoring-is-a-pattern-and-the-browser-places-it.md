---
num: 11
title: El anclaje es un pattern, y el que coloca es el navegador
short: "Anclaje: un pattern, motor del navegador"
summary: >-
  Nueve componentes flotan anclados a un trigger y cada uno resolvía la colocación por su cuenta: tres
  dialectos de CSS, cuatro copias del probe de soporte y una geometría a mano. Esta decisión los unifica
  en un PATTERN, `sk-anchored`, que envía la estructura del positioner y sus styling hooks, más un
  módulo mínimo en `@skryensya/core/anchored` que sólo hace el cableado ancla↔popup. El motor primario
  es la API de CSS Anchor Positioning, o sea EL NAVEGADOR; donde no está, posiciona la machine de Zag.
  No se agrega un motor propio ni una dependencia directa de Floating UI.
---

Tooltip, Popover, Popup, Menu, Select, Combobox, Date picker, Flyout y los submenús hacen todos la
misma cosa: poner una caja al lado de un elemento, voltearla cuando no entra, y esconderla si el ancla
se va de pantalla. La anatomía ya era la misma sin que nadie la hubiera nombrado, `__trigger`,
`__positioner`, `__content` en seis de ellos. Lo que estaba duplicado era el resto.

## Lo que había

Cuatro caminos para un solo comportamiento:

- **Tooltip y Select**: anchor positioning con fallback a Zag, implementado dos veces y distinto. Dos
  probes de soporte, dos convenciones para nombrar el ancla (`--sk-select-anchor-${id}` contra
  `--${root.id}-anchor`), dos funciones que sacan el `style` inline de Zag del positioner.
- **Popover y Popup**: anchor positioning sin fallback ninguno.
- **Menu, Combobox, Date picker**: sólo Zag, sin bloque `@supports` en ninguna parte, o sea que en un
  navegador con la API igual posicionaban por JS.
- **Flyout**: geometría a mano, `computeFlyoutFixedCoords`, con su propio flip y su propio clamp.

Tres dialectos de CSS para lo mismo, además: `position-area` con hooks en tooltip, `top: anchor(bottom)`
crudo en select, y un `position-area` hardcodeado sin hooks en popover.

## Es un pattern, por la regla de la decisión 8

La pregunta de [ADR-2](./0002-what-tier-3-ships.md) es si un segundo componente podría necesitar
esta estructura exacta. Acá no es hipotético: **nueve** ya la necesitan. Así que envía hooks *y*
estructura, como Vaul, y no sólo variables.

`.sk-anchored` se pone **al lado** de la clase del positioner del componente, no la reemplaza, igual que
`sk-interactive` convive con `sk-button`. El componente sigue siendo el dueño de su pintura y de su
`z-index`; el pattern es dueño de la colocación y nada más.

## El motor primario es el navegador

Donde está la API de anchor positioning, coloca el navegador: sin loop de layout, sin medir en cada
scroll, y con `position-try-fallbacks` y `position-visibility` resolviendo el volteo y el ancla perdida
en el motor de layout, que es donde esa información ya vive. Donde no está, posiciona la machine de Zag.

**El fallback no es un camino inferior**, es el mismo contrato ejecutado por otro motor. Lo que exige es
que los dos no corran a la vez: en el camino del navegador el binding le saca al positioner el `style`
inline que trae Zag, y ésa es la razón por la que las declaraciones del pattern pueden quedarse sin
`!important`. Es carga estructural: `position-try` sólo puede voltear declaraciones que NO son
`!important`, así que un `!important` ahí apagaría el volteo.

## Un dialecto, `position-area`

Se elige la gramática de tooltip.css, `position-area` más hooks, y se abandona la de select.css,
`top: anchor(bottom); left: anchor(left)`. Las dos funcionan; la diferencia es que
`position-try-fallbacks: flip-block | flip-inline` existe **para voltear `position-area`**. Con insets
crudos hay que escribir cada fallback a mano y se vuelve a tener geometría, sólo que declarativa.

`anchor-size()` sobrevive como un hook opcional, `--sk-anchored-size`, porque el `sameWidth` de Select
es una necesidad real y no un dialecto: el listbox tiene que medir lo que mide su trigger.

## No se agrega un motor

Floating UI **ya está en el árbol**, como `@zag-js/popper`, que es lo que usan las machines. Una
dependencia directa de `@floating-ui/dom` sería una segunda copia del mismo motor para resolver un
problema que en el camino primario resuelve el navegador y en el fallback resuelve la machine. Y
`computeFlyoutFixedCoords`, la única geometría propia que quedaba, deja de ser API: pasa a ser el
fallback privado de Flyout, que es el único anclado sin machine.

## Cuatro colocaciones, en ejes lógicos

`block-start`, `block-end`, `inline-start`, `inline-end`, pedidas con `data-sk-placement` sobre el
positioner y no sobre el root, porque en React el positioner se portalea al body y la herencia desde el
root no llega. Se dan vuelta solas en RTL; el único lugar donde no es el fallback de Zag, cuyas
placements son físicas, y ahí el binding traduce.

El vocabulario **no se agranda** por los casos raros. Un submenú quiere `inline-end` alineado al
block-start, y eso se pide sobrescribiendo `--sk-anchored-position-area` directamente, que para eso es
un hook. Agregar una quinta placement al vocabulario público por un caso sería dejar que la excepción
escriba el contrato.

## La flecha es opcional, y se autora

Un cuadrado rotado 45° que asoma por el borde de la caja hacia el ancla. **No se inventa**: si el
markup no trae `.sk-anchored-arrow`, no hay flecha, y ése es el default. Un tooltip o un popover la
quieren porque son chrome flotante que tiene que decir *de qué control* está hablando; un menu, un
select o un combobox no, porque ahí la relación ya la dice el borde compartido con el trigger.

Es **decorativa**, así que va siempre con `aria-hidden`: no agrega información, repite la que la
colocación ya da.

Se pinta ENCIMA de la caja y no debajo, que es lo que hace desaparecer la costura: el relleno del
cuadrado tapa el pedazo de borde por donde entra, y sus dos bordes de afuera continúan el de la caja.
Un `z-index: -1` la escondería justo donde más se usa, en un Popover, donde el positioner y el
contenido son el MISMO elemento y su propio fondo la taparía.

### Sale del ancla, no del centro de la caja

La diferencia aparece apenas la caja se corre: `anchor-center` la centra sobre el ancla pero la mete de
vuelta en pantalla si no entra, así que un trigger cerca del borde deja la caja desplazada, y una
flecha dibujada al 50% de esa caja apunta a cualquier lado menos al control. Es el caso normal de un
botón de barra, no un borde raro. Así que la flecha no se coloca contra la caja: es **otra caja
anclada** contra la misma ancla, con el mismo `position-area` y el mismo volteo.

Y aun así vive ADENTRO del positioner, que parecería imposible: el spec sólo deja usar como ancla algo
que sea *descendiente del bloque contenedor* del elemento, y el trigger no cuelga del positioner. Lo
que lo resuelve es **`position: fixed`**: el bloque contenedor de un fijo es el viewport, donde el
trigger sí vive, aunque en el DOM la flecha siga adentro. Con `absolute` el bloque contenedor sería el
positioner y `anchor()` y `anchor-center` quedarían inválidos EN SILENCIO, cayendo al fallback sin
avisar y sin que `CSS.supports` deje de decir que sí.

Quedarse adentro tampoco es prolijidad, hace falta por tres cosas a la vez: el **top layer**, donde la
caja de un Popover sólo entra con sus hijos; la **costura**, que sólo se tapa pintando encima del fondo
y del borde de la caja, y para eso hay que ser su hija posicionada; y el **fallback**, donde coloca la
machine y `@zag-js/popper` busca la flecha adentro del elemento flotante.

Voltea junto con la caja porque lleva el alto de la caja (`anchor-size()`) como margen del lado de
afuera: las dos tienen la misma huella de bloque, así que cruzan el umbral de `position-try` a la vez.
Un tamaño es el único dato del otro elemento que se puede leer sin que el scroll lo desactualice, y por
eso la colocación va siempre por `position-area` y nunca por `anchor()` en los insets: Blink compensa
el scroll de lo primero, no de lo segundo, que se atrasa un scrollY entero.

## Costos, dichos

- **La anatomía de Flyout cambia.** `sk-flyout__panel` se parte en `__positioner` y `__content`. Es un
  cambio de contrato para quien autoró el markup de un flyout. Se hace igual: Flyout era el único
  desalineado de nueve, y el valor del pattern es que la anatomía sea una sola.
- **Popover y Popup necesitan un estado degradado explícito.** Hoy, sin la API, quedan `position: fixed`
  sin coordenadas debajo de `popover="auto"`, así que gobierna el `inset: 0` del user-agent y la caja no
  aparece cerca de su trigger. No tienen machine, así que no hay fallback de JS que las coloque: el
  degradado pasa a ser una hoja centrada en el viewport, elegida a propósito en vez de heredada por
  accidente.
- **El pattern es opt-in, como todos.** Importar `patterns/anchored.css` es un import más para el
  consumidor que arma su propia hoja. Es el mismo costo que ya pagan `nav-list.css` o `scroll-lock.css`.
- **El positioner tiene que llevar un `anchor-name` propio.** Un segundo ident por instancia, escrito
  por el binding igual que el primero, sólo para que su flecha pueda medirlo. `anchor-scope` sobre un
  nombre compartido no alcanza: dos anclados abiertos a la vez (un menú y su submenú) responderían los
  dos, y cada flecha tiene que medir SU caja.
- **Al voltear, el `rotate` no acompaña.** `position-try` da vuelta insets, márgenes y alineación, pero
  `rotate` no es una propiedad que acepte. El rombo es simétrico a 180°, así que la FORMA queda igual y
  sólo cambian cuáles de sus lados llevan el borde: invisible en un tooltip, que no tiene borde, una
  línea del lado que no es en un popover, que sí. Es el resto de un costo que antes era la flecha
  entera dibujada en el borde equivocado de la caja.
- **El positioner no puede llevar `transform` ni `translate`.** Cualquiera de las dos lo convierte en
  bloque contenedor de sus descendientes `fixed`, y con eso la flecha pierde el ancla mientras dure. Se
  pagó al mover el desplazamiento de entrada del tooltip desde el positioner a sus dos piezas.
