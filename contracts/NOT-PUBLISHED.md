# Las páginas de componentes que deliberadamente no tienen contrato

Un contrato acá significa una cosa concreta: **las dos capas derivan de él**. Core lo declara, el
emisor produce markup autorado desde su template, React expone la signature que nombra, G1 verifica
que ese export exista y G2 compara los dos resultados. Con un solo binding no hay contrato — hay un
script con parts.

Por eso "esta página no tiene contrato" no es automáticamente un hueco. A veces la respuesta correcta
es que nunca debería tenerlo. Esta lista existe para que esa decisión esté tomada una vez y no se
vuelva a discutir cada vez que alguien cuenta contratos contra páginas.

## No son componentes del sistema

**`component-preview`** y **`toc`** son chrome de este sitio de documentación. `component-preview`
es literalmente el marco que renderiza los previews de las demás páginas; `toc` es el índice lateral.
Los dos tienen CSS y uno tiene enhancer, y ninguno de los dos es algo que un consumidor del design
system componga en su producto. Publicarlos pondría infraestructura de docs en el catálogo que un
agente lee para elegir qué usar.

Vale nombrar la tensión en vez de taparla: la hoja de `component-preview` vive en `css/components/`,
que por la regla de abajo diría que lleva contrato. Gana el criterio de para quién es. Si algún día
se decide que sí es del sistema, lo que corresponde es MOVER la hoja y publicarlo — no publicarlo
dejándolo donde está y que la ubicación siga diciendo otra cosa.

**`card`** no tiene archivo en core, ni hoja propia, ni binding. Sus doce previews importan datos y
fuentes locales de la página (`examples/card-data`, `examples/card-sources`) y se construyen con
signatures que ya existen — Tile, Content, tipografía. Eso es una **receta**, no un componente: la
forma correcta de publicarlo es en `packages/recipes`, donde el gate ya verifica que sus estados sean
estados distintos.

**`drawer`** no es un componente aparte. La propia página lo dice en su primera línea: *"un drawer ES
un Vaul"*. Es el patrón `vaul` más una hoja que lo ancla a un borde.

Acá corrijo algo que este mismo archivo afirmaba antes: dije que "lo que puede faltar es el contrato
de vaul". No falta. **`vaul` es un PATRÓN**, no un componente — su hoja vive en `css/patterns/`, no
en `css/components/`, igual que `anchored`. Y ningún patrón tiene contrato en este sistema, por una
razón: un contrato fija una ANATOMÍA que las dos capas emiten, y un patrón no tiene anatomía propia
— es un puñado de clases y custom properties que otros componentes componen. `anchored` es el caso
que lo deja claro: lo usan tooltip, menu, select, combobox, date-picker y popover, y ninguno de ellos
"contiene un anchored".

La regla queda escrita, entonces: **`css/components/*` lleva contrato, `css/patterns/*` no.**

**`popup`** tampoco es un componente aparte, y su propia página lo dice: *"superficie flotante mínima
para composiciones que no necesitan chrome de Popover"*, y más abajo *"si el patrón tiene título y
acciones de cierre, usá Popover"*. No tiene archivo en core ni hoja propia — importa `popover.css`.
Es el mismo componente con menos anatomía.

Lo que corresponde, si algún día se quiere emitible, **no es un contrato propio sino una segunda
signature de `popover`** — algo como `Popover.bare`: raíz, trigger y superficie, sin título, sin
descripción y sin control de cierre. Eso pide que el binding de React haga opcional el botón de
cerrar, que hoy dibuja siempre. Es trabajo chico y está sin hacer a propósito: publicar un contrato
separado duplicaría parts que ya existen y dejaría a un agente eligiendo entre dos nombres para una
sola cosa.

## Los que faltaban, y ya no

Seis páginas llegaron acá sin contrato y salieron con uno. Ninguna estaba bloqueada por el contrato:
cuatro necesitaban una CAPA que nunca se había escrito, una necesitaba dejar de acoplarse, y una
parecía trabada en un patrón y no lo estaba.

- **`copy-button`**, **`dialog`**, **`command-palette`** y **`code-preview`** — tenían enhancer
  vanilla y ningún binding de React. Un contrato nombra un export de React, G1 verifica que exista y
  G2 compara las dos capas; con una sola no hay contrato, hay un script con parts. Escribir la mitad
  faltante fue lo que los hizo publicables, no al revés.
- **`split-button`** — las dos capas existían. Lo que estorbaba era que su React construía el menú
  desde un prop plano y le pasaba una clase que un Menu compuesto no puede recibir, porque esa clase
  pertenece a quien dibuja ese botón. La hoja lo alcanza por estructura y la composición quedó
  posible.
- **`popover`** — parecía bloqueado por el patrón Anclaje: nadie escribe el nombre de ancla cuando
  no hay JS, y un template no puede generar uno único por instancia. La salida fue dejar de generar
  nombres: `anchor-scope` acota uno estático al subárbol.

Los tres publicados por la vía "faltaba la capa" comparten una regla que conviene repetir: el
binding nuevo COPIA el comportamiento del enhancer, incluidos sus estados vacíos y de error, en vez
de mejorarlo. Los dos tienen que describir un componente, no dos parecidos.

## Cómo se cuenta

Contra las 66 páginas de `componentes/`, el estado es: **todas las que deben tener contrato lo
tienen**, publicado, con árbol canónico y con sus dos capas comparadas por G2. De las que no, dos son
chrome de este sitio (`component-preview`, `toc`), una es una receta (`card`), una es un alias
(`drawer`) y una es el mismo componente con menos anatomía (`popup`).

De las páginas que tienen previews, **52 están completamente armadas con el árbol**. Las que no
están, no están por alguna de las razones de este archivo — no por falta de trabajo. Si alguien
vuelve a contar y el número no cierra, la diferencia debería aparecer acá o es un hueco de verdad.

No queda nada de esta lista esperando un contrato. `vaul` tampoco: es un patrón, y los patrones no
llevan uno — ver arriba.

Dicho de otro modo, y es la forma en que conviene volver a contarlo: **todo archivo de
`packages/core/src` que exporta parts y cuya hoja vive en `css/components/` tiene contrato**. Los
únicos que exportan parts y no lo tienen son `anchored` y `vaul`, que son patrones, y
`component-preview`, que es chrome de este sitio.

## Demos que se quedan autorados aunque el contrato exista

Un árbol es una composición ESTÁTICA. Cuando lo que la demo enseña es una interacción que sólo
existe en el tiempo — abrir, cerrar, elegir — el árbol puede emitir el componente pero no la lección.
En esos casos la página se queda autorada a propósito, y el contrato igual está publicado y
comparado por G2 con su propio árbol canónico.

- **`dialog`** — su demo es un botón que abre el diálogo y un `previewScript` que llama a
  `showModal()`. El contrato expone `open`, que es la parte de "está mostrándose" que el markup
  autorado SÍ puede decir, pero `showModal()` es una llamada y no markup: emitir el árbol dejaría un
  diálogo abierto y sin el botón que lo abre, que es justo lo que la página enseña.
- **`command-palette`** — misma forma que `dialog`, y más marcada. Su demo es un botón que abre la
  paleta más un `<script type="application/json">` con el índice que el enhancer lee. El contrato
  emite el diálogo y nada más, así que el árbol dejaría un preview EN BLANCO: un diálogo cerrado, sin
  el control que lo abre ni los datos que lo llenan.
- **`date-picker`**, el preview nativo — un `<input type="date">` dentro del chrome compartido de
  campo. Es la capa sin JS, no una composición de este componente.
- **`accordion`**, el preview de `<details>` — otro componente, con su propia anatomía.
- **`process-list`** y **`wrapper`** — acá el árbol es válido y aun así degrada la página, por una
  razón que conviene tener escrita: **el stage no es el componente**. El preview de `wrapper` enseña
  el diagrama de una columna de página y el de `process-list` una lista dentro de su contexto; el
  árbol REEMPLAZA ese slot, así que emitirlo cambia el preview por el componente suelto y se pierde
  justo lo que la página explica. Los árboles llegaron a escribirse para los dos y se borraron.

La regla no es "esta página es difícil". Es que el árbol REEMPLAZA el slot del preview, así que
cuando la demo necesita más de lo que el contrato emite, convertirla degrada la página. La
alternativa correcta no es forzar el árbol: es que el contrato crezca hasta cubrir lo que falta, o
que la demo se quede donde está y lo diga.
