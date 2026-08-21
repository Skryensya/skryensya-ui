---
num: 6
title: El monorepo, y el sitio que consume el paquete por el camino que enseña
short: "Monorepo y sitio"
summary: >-
  El repo separa el artefacto publicable (packages/core, sin dependencias runtime) de su consumidor
  (apps/docs), en un Turborepo con pnpm. El sitio consume por el exports map, el camino Sass que documenta
  como canónico, así que si el exports map o la compilación Sass se rompe, el sitio deja de compilar: la
  documentación se verifica por construcción.
---

Dos cosas viven en este repo y no son la misma: `@skryensya/core` es un artefacto publicable con **cero
dependencias de runtime**, y el sitio de documentación es un **consumidor** de ese artefacto. Un repo
plano las mezcla, y deja que el consumidor llegue al CSS por una ruta relativa `../css/…`, el atajo que
un consumidor real no puede tomar, así que no prueba nada.

## La estructura

Turborepo con pnpm workspaces:

- **`packages/core`**, tokens, styling hooks y contrato compartido de componentes. Cero dependencias de
  runtime, publicable; la carpeta `css/` es el [artefacto](/decisiones/0019-paletas-publicas-y-semanticos-constantes),
  `src/` publica parts/tipos compartidos y `scripts/lint.mjs` es el
  [validador](/decisiones/0019-paletas-publicas-y-semanticos-constantes). El tooling del monorepo (turbo, pnpm) vive en la raíz y en
  devDependencies; nunca entra al runtime del paquete.
- **`apps/docs`**, el sitio, una app de Astro. Declara `"@skryensya/core": "workspace:*"`; pnpm lo
  symlinkea dentro de `node_modules`, y el sitio lo importa como paquete real.
- **`turbo.json`**, un pipeline `lint`/`check`/`dev`. `lint` cachea sobre el fuente de tokens, así que
  las corridas sin cambios se replayean en milisegundos.

pnpm es el default de Turborepo y da symlinks directos de workspace. npm/yarn workspaces también
servirían; se eligió pnpm por idioma, no por necesidad.

## El sitio toma el camino que enseña

Un paquete de tokens se consume por un **especificador desnudo** resuelto por el `exports` map
(`@skryensya/core/tokens.scss`), que requiere un bundler con Sass. La antigua ruta cruda por
`node_modules/@skryensya/core/css/...` esquivaba el `exports` map; ya no es el camino canónico porque el
entrypoint público es Sass y debe pasar por el pipeline del consumidor.

El sitio no puede esquivar la elección, porque tiene que *decirle a los consumidores qué camino tomar*.
Documentar un camino mientras se practica el otro es el mismo fracaso que mató al repo plano: un consumidor
que llega al CSS por una ruta que los consumidores reales no pueden tomar no prueba nada.

**`apps/docs` consume por el `exports` map, documenta ese camino como canónico, y por lo tanto toma el
camino que enseña.** Si el `exports` map se rompe, el sitio deja de compilar, la documentación se
verifica por construcción, no por revisión.

Esto encontró un bug apenas se armó: hacer del `exports` map el contrato expuso que `patterns/*` nunca
había sido exportado. El CSS se enviaba y [el state layer](/decisiones/0003-el-state-layer) lo trata como
API pública, pero ningún consumidor con bundler podía importarlo. Una demo por ruta cruda nunca lo habría
destapado, porque la ruta cruda no consulta `exports`. El primer consumidor honesto lo encontró en
minutos.

## El contrato exige Sass

Antes existía una `apps/demo` que consumía por ruta cruda. Se borró; su contenido se mudó al sitio. El
costo cambió con ADR-19: **el contrato público ahora exige un bundler con Sass**. Eso es deliberado, el
paquete publica la fuente que evita duplicar CSS generado, y el sitio lo prueba por el mismo camino que
enseña: especificadores desnudos vía `exports`.

## El sitio es la fuente de componentes nuevos

El sitio es el primer consumidor a cualquier escala: necesita navegación, bloques de código, tablas y
callouts donde `button` era el catálogo entero. Eso lo convierte en la **fuente de componentes nuevos**,
lo que invierte el consejo de [la primera decisión](/decisiones/0019-paletas-publicas-y-semanticos-constantes) de
diseñar solo con evidencia de reuso: con un solo consumidor no existe tal evidencia, y esperar a un
segundo en un POC significa no crecer nunca.

El syntax highlighting es su punto delicado. Sería la familia de color más grande del sistema, y cada
token tiene que superar la puerta de contraste del [validador](/decisiones/0019-paletas-publicas-y-semanticos-constantes) sobre dos
marcas y cuatro modos, el primer cambio lo bastante grande como para que la
[brecha conocida](/decisiones/0019-paletas-publicas-y-semanticos-constantes) golpee.

## Lo que se rechazó

- *Quedarse plano.* No puede demostrar consumo real del paquete, y mezcla el artefacto publicable con
  sus consumidores.
- *Un SSG de estantería (Starlight, Docusaurus).* La navegación y los bloques de código llegan resueltos,
  pero el sitio llega **con la cara del SSG**. Para un design system, que el sitio se vea como el design
  system no es decoración: es el argumento. Astro sin Starlight no envía CSS propio, así que cada píxel
  sale de los tokens.
- *Conservar `apps/demo` como testigo del camino sin build.* Un segundo consumidor mantenido solo para
  probar una frase se degrada; el costo de no tenerlo se dice arriba en vez de esconderse.
