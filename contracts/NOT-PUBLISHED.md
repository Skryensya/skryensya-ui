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

**`card`** no tiene archivo en core, ni hoja propia, ni binding. Sus doce previews importan datos y
fuentes locales de la página (`examples/card-data`, `examples/card-sources`) y se construyen con
signatures que ya existen — Tile, Content, tipografía. Eso es una **receta**, no un componente: la
forma correcta de publicarlo es en `packages/recipes`, donde el gate ya verifica que sus estados sean
estados distintos.

**`drawer`** no es un componente aparte. La propia página lo dice en su primera línea: *"un drawer ES
un Vaul"*. Es el patrón `vaul` más una hoja que lo ancla a un borde. Lo que puede faltar acá es el
contrato de **vaul**, no uno de drawer.

## Los que faltaban, y ya no

Cinco páginas llegaron acá sin contrato y salieron con uno. Ninguna estaba bloqueada por el
contrato: cuatro de las cinco necesitaban una CAPA que nunca se había escrito, y la quinta necesitaba
dejar de acoplarse.

- **`copy-button`**, **`dialog`** y **`command-palette`** — tenían enhancer vanilla y ningún
  binding de React. Un contrato nombra un export de React, G1 verifica que exista y G2 compara las
  dos capas; con una sola no hay contrato, hay un script con parts. Escribir la mitad faltante fue lo
  que los hizo publicables, no al revés.
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

Contra las 66 páginas de `componentes/`, el estado es: las que tienen contrato lo tienen publicado y
con árbol canónico, y sus dos capas están comparadas por G2. De las que no, tres no deberían tenerlo
(arriba), una es una receta, una es un alias, y **dos** son trabajo pendiente de verdad —
`command-palette` y `popover`.

`dialog` y `split-button` estaban en esa lista y ya no, y salieron por caminos distintos que vale
distinguir. `dialog` se publicó escribiéndole la mitad de React que faltaba, igual que
`copy-button`: ahí el contrato no era lo que faltaba, era la capa que nunca se escribió.
`split-button` no necesitaba binding nuevo — necesitaba dejar de acoplarse. Su React construía el
menú desde un prop plano y le pasaba una clase que un Menu compuesto no puede recibir, porque esa
clase pertenece a quien dibuja ese botón, y eso es Menu. La hoja lo alcanza por estructura y la
composición quedó posible.

## Demos que se quedan autorados aunque el contrato exista

Un árbol es una composición ESTÁTICA. Cuando lo que la demo enseña es una interacción que sólo
existe en el tiempo — abrir, cerrar, elegir — el árbol puede emitir el componente pero no la lección.
En esos casos la página se queda autorada a propósito, y el contrato igual está publicado y
comparado por G2 con su propio árbol canónico.

- **`dialog`** — su demo es un botón que abre el diálogo y un `previewScript` que llama a
  `showModal()`. El contrato expone `open`, que es la parte de "está mostrándose" que el markup
  autorado SÍ puede decir, pero `showModal()` es una llamada y no markup: emitir el árbol dejaría un
  diálogo abierto y sin el botón que lo abre, que es justo lo que la página enseña.
- **`date-picker`**, el preview nativo — un `<input type="date">` dentro del chrome compartido de
  campo. Es la capa sin JS, no una composición de este componente.
- **`accordion`**, el preview de `<details>` — otro componente, con su propia anatomía.

La regla no es "esta página es difícil". Es que el árbol REEMPLAZA el slot del preview, así que
cuando la demo necesita más de lo que el contrato emite, convertirla degrada la página. La
alternativa correcta no es forzar el árbol: es que el contrato crezca hasta cubrir lo que falta, o
que la demo se quede donde está y lo diga.
