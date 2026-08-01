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

## Son componentes, y les falta una capa

Estos sí son huecos reales, y cada uno está bloqueado en escribir un binding, no en escribir un
contrato:

- **`command-palette`** — parts en core y enhancer vanilla completo (scoring difuso, navegación por
  teclado, control del `<dialog>`). No hay binding de React. Misma forma que tenía `copy-button`
  antes de publicarse: hay que escribir la mitad faltante primero.
- **`split-button`** — es composición pura: un `div`, un botón primario y un Menu, sin comportamiento
  propio, así que no necesita enhancer. El bloqueo está del otro lado: el `SplitButton` de React
  construye su menú desde un prop plano `menuItems` en vez de aceptar un Menu compuesto, así que un
  template fiel tendría que duplicar el template entero de `menu`. Lo que corresponde es que el
  binding de React acepte composición.
- **`dialog`** y **`popover`** — el comportamiento es de la plataforma (`<dialog>` + `showModal()`,
  Popover API). Su "enhancer" puede ser legítimamente nada, igual que `Select.native` no tiene uno:
  el contrato fija el elemento anfitrión y las parts, y el navegador se encarga del resto.

## Cómo se cuenta

Contra las 66 páginas de `componentes/`, el estado es: las que tienen contrato lo tienen publicado y
con árbol canónico, y sus dos capas están comparadas por G2. De las que no, tres no deberían tenerlo
(arriba), una es una receta, una es un alias, y **tres** son trabajo pendiente de verdad —
`command-palette`, `split-button` y `popover`.

`dialog` estaba en esa lista y ya no: se publicó escribiéndole la mitad de React que faltaba, igual
que `copy-button`. Los dos siguen el mismo patrón y vale como receta para los que quedan — el
contrato no es lo que falta, es la capa que nunca se escribió.

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
