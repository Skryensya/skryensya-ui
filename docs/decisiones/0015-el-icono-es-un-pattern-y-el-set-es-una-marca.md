---
num: 15
title: El icono es un pattern, y un set de iconos es una marca
short: "El icono es un pattern"
summary: >-
  La propuesta de iconos traía tres piezas grandes: custom elements compilados desde Svelte, un
  contrato de provider con `hasIcon`/`getIcon` en runtime, y un generador de manifiesto con
  allowlist. Las tres caen por decisiones que ya existen, sin que haga falta criterio nuevo. Lo que
  queda es chico: `.sk-icon` es un pattern (ADR-8), porque la estructura `<svg>` la comparte cada
  componente que muestra un icono; core nombra los roles y nunca a un proveedor (ADR-2), así que un
  set de iconos se enlaza igual que se enlaza una marca, y el sistema trae uno por defecto, como
  trae `brands/default.scss`; y no hay codegen, porque el allowlist reimplementa el tree-shaking del
  bundler (ADR-6). El icono no es opt-in: el CSS viaja en base y la geometría existe desde que se
  instala. Lo opt-in es salirse del set. Vanilla no renderiza estructura de icono, pero sí enlaza el
  set: `mountIcons` reemplaza un placeholder por nombre con la geometría del set enlazado, la misma
  inyección que hace `<Icon>` en React (revisión 2026-07).
---

El Tile de divulgación originalmente dibujaba su chevron con un carácter de texto. Era un icono
tipográfico: no escala con nada, no hereda `currentColor` de forma predecible y depende de qué
fuente resuelva el navegador. El pattern de icono lo reemplaza por roles del set:

```html
<span class="sk-tile__chevron" data-part="chevron" aria-hidden="true">
  <span data-state="closed"><svg class="sk-icon" data-icon="chevron-down"></svg></span>
  <span data-state="open"><svg class="sk-icon" data-icon="chevron-up"></svg></span>
</span>
```

El trigger elige un ícono u otro por estado; nunca rota un glifo.

## El icono es un pattern

[ADR-8](/decisiones/0008-que-envia-tier-3) da la regla sin excepciones:

> **¿Muchos componentes comparten esta estructura exacta?**

Para el icono la respuesta no admite matiz. Este envoltorio es idéntico en el chevron del tile, en el
indicador del select, en el toggle del sidebar y en el tono del badge:

```html
<svg class="sk-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
```

Sí → es un **pattern**. Envía styling hooks *y* estructura, exactamente por la razón que enuncia
ADR-8: la estructura compartida es todo el punto, y duplicarla por componente es lo que el pattern
existe para prevenir. `.sk-icon` es a los iconos lo que `sk-interactive` es a la interacción, una
clase a la que cualquier elemento opta.

No es un componente. Un componente envía solo hooks porque el markup de cada consumidor difiere; aquí
el markup **no** difiere. Ese es el corte que ADR-8 pide hacer, cayendo del otro lado que `button`.

Y viaja en base, como el state layer. Un icono no es un extra al que un componente opta: apenas algo
muestra un chevron, un close o un glifo de estado necesita esta misma caja, y un componente que
dimensiona su propio icono está reinventándola, que es el mismo argumento por el que el state layer
no es opt-in. Las reglas son inertes hasta que un elemento lleva `sk-icon`, así que una página sin
iconos no paga nada.

**Lo opt-in es salirse del set**, no tener iconos.

## Core nombra roles, nunca a un proveedor

La propuesta pedía `@acme/core/icon/providers/lucide`, `/tabler`, `/phosphor`. Eso choca de frente con
[ADR-2](/decisiones/0002-nombrar-por-rol-nunca-por-inquilino): Lucide es un **inquilino**. Un módulo
de core que se llama `lucide` es un nombre que deja de ser verdad el día que el proyecto cambie de
set, que es exactamente el día para el que la propuesta decía existir.

Y choca con una restricción dura: las `dependencies` de `@skryensya/core` están vacías, a propósito
(el README lo dice, y [ADR-12](/decisiones/0012-monorepo-y-el-sitio) explica para qué).
Core no puede depender de Lucide sin dejar de ser el paquete que dice ser.

Las dos objeciones tienen la misma salida, y ya está escrita en el sistema. Miremos cómo funciona una
marca:

| | tier 1 lo aporta el inquilino | el sistema nombra la posición |
|---|---|---|
| color | la marca declara el hue de `--ramp-accent-600` | `semantic` referencia `--ramp-accent-600`, nunca "azul" |
| icono | el set declara la geometría de `search` | el sistema referencia `search`, nunca "magnifying-glass" |

**Un set de iconos es una marca.** El isomorfismo es exacto: `nombre estable : geometría` es
`posición de ramp : hue`. Core publica el vocabulario de roles (`StableIconName`) y la forma del dato
(`IconData`); quién los llena lo elige el consumidor, igual que `tokens.scss` no envía ramps y obliga
a elegir una marca.

### Dónde viven los sets

En paquetes aparte, uno por librería:

| paquete | librería | trazo | viewBox | licencia |
|---|---|---|---|---|
| `@skryensya/icons-lucide` | Lucide | contorno 2px | `0 0 24 24` | ISC |
| `@skryensya/icons-phosphor` | Phosphor, peso regular | relleno | `0 0 256 256` | MIT |
| `@skryensya/icons-material` | Material Symbols, outlined 400 | relleno | `0 -960 960 960` | Apache-2.0 |

Ninguno puede vivir adentro de core, y las dos razones ya estaban decididas: core no nombra
inquilinos, y sus `dependencies` están vacías. Un set real viene de una librería externa, así que
core no puede contenerlo sin romper las dos cosas a la vez.

Por eso los sets viven en paquetes aparte y no adentro de core: es aditivo y no toca el resto del modelo.
El vocabulario, el pattern, el renderer y `IconData` viven en core; la geometría vive en cada paquete de
set, que se instala como se instala una marca.

Y el isomorfismo con la marca aguanta casi entero, pero **se rompe en un punto que hay que decir**:
`tokens.scss` no envía ramps, pero el sistema sí envía `brands/default.scss`, así que nadie arranca
con colores rotos. Con iconos no se puede: una marca son once números que se pueden autorar; un set
son 32 dibujos que no. Instalar `@skryensya/core` y `@skryensya/react` da vocabulario, CSS y renderer, 
y ningún icono hasta que se elija un set. Es una línea de install, la misma clase de elección que la
marca, pero no es gratis como la marca.

Por eso `Icon` tampoco cae solo a un set: importar uno adentro del renderer metería su geometría en el
bundle de todo el mundo, incluido quien eligió otro. Un `<Icon name="close" />` sin `IconSetProvider`
lanza, con los tres paquetes nombrados en el mensaje.

Por eso `Icon` y `SetIcon`, la mejor idea de la propuesta, se colapsan en una sola. Ver
[abajo](#seticon-no-existe-porque-la-tenencia-es-del-consumidor).

## No hay providers, ni manifiesto, ni codegen

La propuesta define el provider como un servicio de runtime:

```ts
hasIcon(name: string): name is Name
getIcon(name: Name, options?: Options): IconData | undefined
```

Un `hasIcon` que responde por un nombre arbitrario en runtime necesita el catálogo entero en memoria
que es precisamente lo que el allowlist existía para evitar. El contrato se contradice con su
propia justificación.

Y el allowlist falla [el test de borrado](/decisiones/0006-css-puro-sin-build):

> Bórrese la capa. ¿Reaparece la complejidad en los llamadores? Si no reaparece, no estaba haciendo nada.

Bórrense `generate-icon-manifest.ts`, `generate-icon-types.ts`, `resolve-icon.ts` y
`define-provider.ts`. El consumidor escribe un objeto literal que mapea nombres a geometría. Eso no es
complejidad que reaparece: **el objeto literal ES el manifiesto**, y `satisfies` da el mismo error de
tipo que darían los tipos generados. Lo único que hacía el generador era eliminar código muerto, que
es el trabajo del bundler.

Es el principio de ADR-6 aplicado un tier más arriba: no reimplementar el runtime de la plataforma, 
y el tree-shaking es parte del toolchain que ya existe. Un pipeline que lo repite en build time es la
misma clase de error que un emisor de tokens que reimplementa `light-dark()`.

Lo que queda del contrato de proveedor es un tipo, no un servicio:

```ts
export type IconSet = Readonly<Record<StableIconName, IconData>>;
```

Datos, no un servicio. No hay nada que resolver: es un índice.

### El codegen que sí se gana el lugar

Los paquetes de sets tienen un `scripts/generate.mjs`, y eso **no** contradice lo de arriba: son dos
codegen distintos, y el test de borrado los separa limpio.

- **El generador de manifiesto** decidía *qué iconos entran al bundle*. Bórrelo: el consumidor escribe
  un objeto literal, `satisfies` da el mismo error que los tipos generados, y el bundler ya hacía el
  tree-shaking. No reaparece complejidad → no hacía nada.
- **El generador de set** convierte *el formato de la librería a `IconData`*. Phosphor y Material no
  publican datos: publican archivos `.svg`. Bórrelo y el consumidor parsea SVG en runtime, o se ata a
  `?raw`, que es de Vite y no del ecosistema. Reaparece complejidad → hace algo.

Es el mismo principio de [ADR-6](/decisiones/0006-css-puro-sin-build) cayendo distinto porque el
problema es distinto, igual que el dialog cae en nativo y el combobox en máquina. Y hay una prueba de
que no es el runtime de nadie: no existe bundler que convierta un `.svg` a `IconData` sin un plugin.

El resultado paga dos veces: la librería queda como **devDependency**, así que el bundle del consumidor
recibe 32 iconos de datos y cero runtime de Lucide, Phosphor o Material.

El precio es redistribución: el archivo generado lleva geometría de terceros. Las tres licencias lo
permiten (ISC, MIT, Apache-2.0) y cada paquete incluye el aviso, pero es una obligación que ahora
existe y antes no.

## Vanilla no envía iconos

La propuesta compila componentes de Svelte a custom elements: `<sk-icon name="search">`. Cae por dos
caminos independientes.

**Uno.** [ADR-14](/decisiones/0014-core-vanilla-y-react) y ADR-8 definen la capa vanilla: los
enhancers **no renderizan markup y nunca escriben una clase**. `<sk-icon>` renderiza el `<svg>` entero
y escribe `class="sk-icon"`. Es la definición exacta de lo que la capa vanilla no es. `mountButton`
ni siquiera crea un botón: parchea `aria-disabled` sobre uno que el consumidor escribió, y *lanza* si
la clase no está.

**Dos.** El test de borrado. Bórrese Svelte y el registro de custom elements. El consumidor escribe:

```html
<svg class="sk-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">…</svg>
```

No reaparece complejidad. Es markup. La capa no hacía nada, salvo traer un lenguaje de autoría nuevo
y un paso de compilación para el único componente del sistema que no tiene estado. Las máquinas de
este repo son Zag, y un icono no tiene máquina.

Hay un tercer costo que conviene decir aunque los dos anteriores ya alcanzan: los custom elements
traen shadow DOM, y el shadow DOM corta la cascada. Todo el modelo de tier 3, `.hero .sk-button {
--sk-button-bg: … }`, sin pelea de especificidad, que es la razón de ser de los styling hooks, vive
de que el CSS del consumidor alcance al elemento. Un shadow root lo impide.

Entonces **la capa vanilla no envía nada para iconos**, y no es una omisión: es la regla cayendo. La
capa vanilla existe para el comportamiento que la plataforma no da. Un icono no tiene comportamiento.
Lo que queda es un **markup contract**, que por ADR-8 se documenta y nunca se envía.

React sí envía un componente, y tampoco es una excepción: ADR-14 ya dice que *"cada binding usa el
idioma natural de su ecosistema, vanilla preserva markup autorado; React renderiza"*. La asimetría
está decidida desde antes.

## `SetIcon` no existe, porque la tenencia es del consumidor

La propuesta separa `<Icon name="search">` (rol portable) de `<SetIcon name="airplane-tilt">`
(nombre del proveedor). La distinción es correcta y hay que conservarla. El componente aparte, no.

Bórrese `SetIcon`. ¿Qué hace la app que necesita `airplane-tilt`?

```tsx
import { Icon } from "@skryensya/react/icon";
import { airplaneTilt } from "./icons";

<Icon data={airplaneTilt} />
```

No reaparece complejidad, y la app que quiera nombres los tipa en tres líneas con su propio objeto.
Un `SetIcon` en el sistema sería el sistema tipando el vocabulario de un inquilino, ADR-2 otra vez, y
la misma división que ya rige el CSS: la app escribe su capa estructural, el sistema publica los
hooks.

Así que `Icon` toma `name` **o** `data`, y la unión discriminada es la distinción, en un componente:

```tsx
<Icon name="chevron-down" />        {/* un rol del sistema */}
<Icon data={airplaneTilt} />        {/* geometría del proyecto */}
```

`name` lee el set enlazado por contexto, porque los componentes fundacionales (select, tile, sidebar)
consumen roles adentro y no pueden recibirlos por prop sin drilling. `data` no lee nada.

El contexto se gana el lugar por un consumidor concreto: [el sitio](/decisiones/0012-monorepo-y-el-sitio)
va a querer mostrar dos sets en una misma página, y un registro global de módulo no puede.

## El vocabulario estable cubre la app, no solo al sistema

La propuesta enuncia una regla, *incluir los iconos que necesitan los componentes fundacionales, no
cada concepto de producto*, y acto seguido lista `search`, `edit`, `delete`, `upload`, `calendar`.
Ningún componente fundacional necesita esos, así que se contradice sola. Pero es **la regla** la que
está mal, no la lista.

El criterio no es *quién lo consume*, es **qué pasa si no está**. Un vocabulario que llegara hasta
`chevron-down` y nada más no evitaría el problema: cada proyecto declararía `search` y `delete` por su
cuenta, y el rol más común de todos terminaría con un nombre distinto en cada app, que es exactamente
lo que un vocabulario estable existe para impedir. Un nombre que falta no desaparece; reaparece doce
veces con doce nombres. Es el [test de borrado](/decisiones/0006-css-puro-sin-build) otra vez, aplicado
a una palabra.

Entonces cubre los casos más usados de una app, en 32 roles: dirección (`chevron-*`, `arrow-*`,
`external-link`), acción (`add`, `remove`, `close`, `check`, `search`, `edit`, `delete`, `copy`,
`filter`, `refresh`, `more`, `menu`), estado (`info`, `success`, `warning`, `danger`) y sistema
(`calendar`, `upload`, `download`, `settings`, `user`, `visibility`, `visibility-off`).

**Cada nombre es un rol, nunca un dibujo**, [ADR-2](/decisiones/0002-nombrar-por-rol-nunca-por-inquilino)
un tier más arriba. Por eso `delete` y no `trash`, `edit` y no `pencil`, `search` y no
`magnifying-glass`, `more` y no `dots`, `visibility` y no `eye`: el nombre tiene que seguir siendo
verdad cuando otro set dibuje el rol distinto, que es la misma prueba que un ramp llamado `accent`
pasa y uno llamado `blue` falla. `chevron-*` y `arrow-*` son la excepción consciente: nombran una
dirección, y la distinción entre los dos, chevron revela, arrow mueve, no tiene otro nombre corto.

Nótese `danger`, no `error`: el sistema ya dice `danger` en `--color-text-danger`, en
`--color-action-danger` y en `BadgeTone`. El glosario es explícito en que una palabra no coexiste con
su sinónimo, o gana o cambia.

Lo que **no** se movió es el límite de arriba. Un concepto de **producto**, `invoice`, `warehouse`,
`airplane-tilt`, no entra por más usado que sea en una app, porque no es un rol que otro proyecto
comparta. Sale como `data`, y ese es el único opt-in que hay aquí.

Y el costo de cada nombre hay que decirlo, porque no lo paga quien lo agrega: `IconSet` es completo,
así que **un rol nuevo es trabajo obligatorio para todo autor de set**. Por eso 32 y no 80. ADR-8
cierra con "ante duda genuina, preferir `component`", porque promover después es aditivo y degradar
rompe; la misma asimetría vale aquí, girada: agregar un rol es gratis para quien lo usa y una deuda
para quien dibuja, y sacarlo rompe a todos. Ante duda, no entra.

## El CSS no toca `fill` ni `stroke`

Un detalle chico con una razón que no es chica. La propuesta escribe:

```css
.sk-icon { fill: currentColor; }
```

Un set de contorno (Lucide, Tabler) dibuja con `fill="none" stroke="currentColor"` en el `<svg>` raíz.
Y una declaración CSS **le gana a un atributo de presentación**. Esa regla volvería sólido cualquier
set de contorno, en silencio.

Es el mismo defecto que la propuesta tiene en el tamaño: pone `width="32"` cuando `size` es un número,
mientras el CSS declara `inline-size: var(--sk-icon-size, 1.25rem)`, y el CSS gana, así que la
escotilla numérica no funciona. Aquí se cierra borrándola: `size` es `sm | md | lg` y nada más. Un
tamaño arbitrario se pide donde se piden todos los valores arbitrarios del sistema, redeclarando el
hook:

```css
.hero .sk-icon { --sk-icon-size: 2rem; }
```

Entonces **`fill` y `stroke` son del set**, que es donde vive la intención de la geometría, y el CSS
solo pone caja y tamaño. El color llega por `currentColor`, heredado del contenedor.

Eso tiene un corolario gratis: no hace falta bloque `forced-colors`. La propuesta escribía
`color: ButtonText`, que afirma que todo icono vive en un botón, y `forced-color-adjust: auto`, que ya
es el default. Como el icono no tiene color propio, en modo de contraste forzado el navegador fuerza
el `color` del contenedor y `currentColor` lo sigue solo. Test de borrado: se borra el bloque y no
reaparece nada.

Por la misma razón el icono no declara ni un token de color, y por lo tanto no necesita override en
`modes/hc.scss` ni entra en `contrast-pairs.json`: es correcto en las ocho marcas y en los tres modos
sin una línea. El [validador](/decisiones/0007-el-validador) no tiene nada que revisar porque no hay
nada que romper.

## El tamaño es invariante a densidad

`--size-icon-*` referencia una escala tier 1 propia y no se multiplica por `--sk-density`.
[ADR-4](/decisiones/0004-la-densidad-es-un-multiplicador-con-el-piso-adentro) y el glosario acotan la
densidad a espaciado: tipografía, radios, anillos de foco y áreas de toque quedan afuera. Un icono es
contenido que se para al lado de un glifo, si el texto no encoge, el icono tampoco. La densidad
acerca las cosas; no las achica.

## Trade-offs

**Instalar el sistema no da iconos.** `@skryensya/core` y `@skryensya/react` traen vocabulario, CSS y
renderer; la geometría llega recién con `pnpm add @skryensya/icons-lucide`. Es la misma clase de
elección que la marca, pero no es gratis como la marca: `brands/default.scss` viaja adentro de core
porque son once números autorables, y un set son 32 dibujos que no lo son. Un default autorado a mano se
rechaza: dibujado a mano queda peor que cualquier librería real, y mantenerlo serían 32 cosas que nadie
querría tocar.

**Un rename río arriba rompe el build, y eso es a propósito.** La tabla rol→nombre la mantiene un
humano, y Lucide renombra (`Filter` → `Funnel`, `Trash2`, `TriangleAlert`). El generador falla con el
rol y el nombre adentro del mensaje en vez de emitir un set con un agujero, y `--check` en `lint`
prueba que el archivo generado no quedó viejo. Es el mismo trato que el validador de tokens le da a un
`var()` que no resuelve: frenar el release en vez de vivir en prosa un año.

**Tres sets son tres tablas de 32 que se mantienen a mano**, y ninguna librería promete que sus
nombres sobrevivan un major. El costo real de un rol nuevo no es agregarlo al vocabulario: es
encontrarle un dibujo en las tres librerías y que las tres lo tengan.

**Los tres pesan distinto.** Phosphor genera ~12 kB de datos, Material ~9,7 kB, Lucide ~5,7 kB, el
contorno de trazo es más barato que la forma rellena. No es una diferencia que importe casi nunca,
pero está, y no la elige el sistema.

**El `body` es markup confiable, y el sistema no lo verifica.** `Icon` hace
`dangerouslySetInnerHTML`. Es correcto para geometría autorada o de build, y es una vulnerabilidad si
alguien le pasa un SVG de un usuario o de una API. Hoy la garantía es una convención de tipo, no una
regla ejecutable: el validador lee `css/**` y no mira TypeScript. Un `<script>` dentro de un `body`
autorado pasaría. Vive como riesgo aceptado mientras los sets sean del proyecto; el día que un set
venga de afuera, el chequeo se gana su lugar.

## Revisión (2026-07): Phosphor es el set por defecto

La decisión original cerraba con **"instalar el sistema no da iconos"**: `Icon` sin
`IconSetProvider` lanzaba, con los tres paquetes nombrados en el mensaje, y el argumento era que
importar un set adentro del renderer metería su geometría en el bundle de todo el mundo.

Se revisó. Ahora **`@skryensya/react` trae Phosphor como default**: `IconSetContext` se crea con
`phosphorIcons`, así que `<Icon name="close" />` dibuja sin configuración, exactamente como
`brands/default.scss` viaja en core y nadie arranca con colores rotos. El argumento de aquella
decisión, "una marca son once números autorables; un set son 32 dibujos que no", sigue siendo cierto,
pero deja de ser una razón para no tener default: el default no se autora a mano, se **elige** una
librería real (Phosphor, MIT) y su geometría generada viaja como una dependency más.

Lo que **no** cambió, y era el corazón de la decisión:

- **Salirse del set sigue siendo opt-in.** Lucide y Material son `peerDependencies` opcionales: no se
  empaquetan hasta que se los importa y se enlaza `<IconSetProvider set={…}>`. "No se empaquetan
  todos por defecto", solo uno.
- **Core sigue sin nombrar inquilinos ni tener dependencies.** El default vive en el paquete de React,
  no en core; core sigue publicando solo el vocabulario, el pattern, el renderer y `IconData`.
- **`data` no lee ningún set.** La geometría del proyecto sigue siendo portable sin binding.

El único trade-off que se acepta a cambio del zero-config: Phosphor, y solo Phosphor, viaja en el
bundle de todo consumidor de React, incluso si enlaza otro set por encima. Es el mismo trato que la
marca default, girado a iconos: un default que casi todos quieren, y que quien no lo quiere paga una
vez en bytes, no en configuración.

## Revisión (2026-07): vanilla enlaza el set con `mountIcons`

La decisión cerraba con **"la capa vanilla no envía nada para iconos"**, y la razón era doble: un
enhancer no renderiza markup ni escribe una clase, y un icono no tiene comportamiento que hidratar. Lo
que dejaba en la mano del consumidor de vanilla era escribir el `<svg>` entero:

```html
<svg class="sk-icon" data-icon="arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
```

El [test de borrado](/decisiones/0006-css-puro-sin-build) decía que eso "es markup, no reaparece
complejidad". En la práctica sí reaparece: ese bloque **inyecta la geometría de un set**, viewBox,
paths, la intención de trazo, dentro del HTML del consumidor, acoplado a un dibujo concreto y sin
forma de cambiarlo por nombre. Es exactamente el acoplamiento que el vocabulario estable existe para
romper, y el mismo que en React resuelve `<Icon name="arrow-up" />` en vez de un `<svg>` pegado. La
asimetría de ADR-14 dejaba a vanilla sin la contraparte.

Se revisó. `@skryensya/vanilla/icon` ahora envía **`mountIcons(root, set)`**: el autor escribe un
placeholder con el nombre del rol y el enlazador lo reemplaza por el mismo `<svg class="sk-icon">`.

```html
<span data-sk-icon="arrow-up"></span>
```
```ts
import { mountIcons } from "@skryensya/vanilla/icon";
import { lucideIcons } from "@skryensya/icons-lucide";
mountIcons(document, lucideIcons);
```

**Por qué no contradice el corazón de la decisión.** De los tres argumentos que sostenían "vanilla no
envía nada", el más fuerte, los custom elements traen shadow DOM y el shadow DOM corta la cascada, se
conserva entero: `mountIcons` produce `<svg>` en light DOM, así que `.hero .sk-icon { --sk-icon-size:
… }` sigue alcanzando. Y no es un renderer de UI: no compone estructura que difiera por consumidor, el
icono es *el* pattern cuya caja es idéntica en todos lados (ADR-8), así que no hay markup autorado que
"preservar", sino un **enlazador de marca**, que inyecta la geometría del set igual que el `<Icon>`
de React inyecta `icon.body`. Un set de iconos es una marca; ocupar su rol en un placeholder es
enlazarla, no renderizar.

**Lo que sí se acepta como excepción acotada:** para el icono, y sólo para él, un enhancer escribe la
clase `sk-icon` y el `body` del set. Es lo que cuesta la paridad con React, y cae del mismo lado que
`<Icon>`: geometría confiable por contrato de `IconData`, nunca de un usuario ni de una API.

**Lo que no cambió:**

- **El set es siempre explícito.** No hay default de módulo en vanilla, se pasa el set en cada
  llamada. Para dos sets en una página se hidrata cada subárbol con el suyo (el primero en correr gana
  el nodo). El default por contexto es de React, donde los componentes fundacionales consumen roles
  adentro; en vanilla el consumidor tiene el set a mano y pasarlo es explícito, no drilling.
- **`initComponents()` no toca iconos.** Enlazar un set es una decisión de marca, no un enhancer de
  comportamiento; vive en su propia llamada, como `applyIconSet` en el sitio.
- **La geometría del proyecto se sigue escribiendo a mano.** `mountIcons` sólo cubre roles del
  vocabulario estable; un `data-sk-icon` que el set no tiene se deja intacto y se avisa. Un icono de
  producto se escribe como `<svg>` propio, que es el único opt-in que sigue habiendo.
