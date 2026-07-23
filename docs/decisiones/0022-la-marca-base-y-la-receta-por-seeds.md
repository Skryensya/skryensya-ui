---
num: 22
title: La marca base y la receta por seeds
short: "Marca base + receta"
summary: >-
  Además de las marcas de personalidad, cada ramp escrito a mano en oklch() literal (ADR-13), el kit
  ofrece una segunda vía para consumirlo rápido: una marca `base` sobria, zero-config, que NO lista sus
  ramps sino que los DERIVA de dos seeds (accent + neutral) con color-mix(in oklab). Esto no reintroduce
  el perfil compartido que ADR-13 rechazó, no es cómo se hace el set de marcas enviado, ni debilita la
  accesibilidad: el validador ahora EVALÚA color-mix en oklab y mide el ratio WCAG real por marca, así que
  una marca derivada es una compuerta igual que una literal. Y para el consumidor sin toolchain se genera
  un bundle único `dist/skryensya.css` (no commiteado, ADR-6) enlazable con un solo `<link>`.
---

Hay dos formas de dar identidad a una marca, y el sistema ahora soporta ambas explícitamente.

La primera, la de siempre ([ADR-13](/decisiones/0013-sass-para-los-ramps-y-el-alto-contraste)): un
`brands/*.scss` escribe **cada stop del ramp como `oklch()` literal**, con su propia curva. Así se hacen
`default`, `dusk`, `ember`, …, el set de marcas de **personalidad** que envía el kit. Esa decisión no
cambia.

La segunda es esta: una marca **derivada**. El consumidor declara un puñado de **seeds** y una receta
(`brands/_recipe.scss`) genera los ~60 stops con `color-mix(in oklab, …)`. El mínimo son **dos seeds**, 
`--seed-accent` y `--seed-neutral`; `danger`/`success`/`warning` caen a hues sobrios del sistema y
cualquiera de los cinco se puede sobreescribir. La marca `base` es la instancia sobria de esa receta, y es
**zero-config**: aplica en `:root:not([data-brand])`, así que enlazar el kit ya da una marca calma y
accesible sin elegir archivo.

## Por qué esto no reabre lo que ADR-13 cerró

ADR-13 rechazó un mixin que compusiera **todas** las marcas desde un perfil `(lightness, chroma)`
compartido, por una razón de diseño: dos marcas sobre el mismo perfil tienen una curva idéntica y solo
cambia el hue, con lo que la "personalidad" es una rotación de matiz, no una identidad. Ese argumento es
sobre el **set** de marcas enviado, y sigue en pie: `base` no lo toca. Las marcas de personalidad se
siguen escribiendo a mano, cada una con su curva.

La receta resuelve un problema distinto, **consumir el kit rápido, o tematizar un solo producto**. Ahí el
perfil compartido no es un defecto: una app que deriva su marca desde su color de acento no compite con un
catálogo de marcas hermanas de las que tendría que distinguirse. La objeción de ADR-13 no aplica porque no
hay set del cual verse igual.

## Por qué esto no debilita la accesibilidad

El otro motivo por el que ADR-13 exigía literales era el validador: *"un hue en `var()` haría que el
chequeo pase en silencio a 21:1"*. `parseOklch` no entendía `color-mix`, devolvía `null`, y el contraste
pasaba sin medirse. Esa era una limitación del validador, no una ley de la naturaleza.

Así que se **extendió el validador** en vez de prohibir la técnica. `scripts/parse.mjs` ahora evalúa
`color-mix(in oklab|oklch, A p%, B q%)`, anidado, con `var()` y sus fallbacks, y los colores nombrados
`white`/`black`, hasta un `oklch()` concreto, exactamente como lo haría el navegador. El chequeo de
contraste corre sobre `base` como sobre cualquier marca literal (está en `BRANDS`), y un seed mal puesto
un accent demasiado claro para texto blanco, **falla el lint**. La accesibilidad sigue siendo una
compuerta, no una esperanza; ahora cubre una forma de valor más.

Un detalle del validador acompaña: `refs-resolve` ahora tolera `var(--x, fallback)` cuando `--x` no está
declarado, porque eso resuelve en CSS por el fallback. Es lo que hace real la promesa de "dos seeds": los
seeds opcionales viven en el fallback de la receta y no son referencias colgantes.

## Colocación de un seed en el ramp

- **accent / danger / success / warning** → el seed **es** el rung 600 (el fill primario). Los stops
  claros mezclan seed→`white`, los oscuros seed→`black`, con porcentajes calibrados contra la curva de
  `default`.
- **neutral** → el seed es solo el **undertone** (hue + un susurro de chroma). La curva de lightness de los
  grises la fija el sistema, porque un gris no implica trece bien espaciados: cada neutral es un
  `color-mix` anidado, blanco↔negro para la claridad (donde vive el contraste), luego una pizca de seed
  para el tinte.

## Consumir el kit sin toolchain

La vía Sass ([ADR-13](/decisiones/0013-sass-para-los-ramps-y-el-alto-contraste)) sigue siendo la superficie
de autoría: quien tiene bundler compila la fuente y elige sus piezas. Pero eso exige un pipeline. Para
quien solo quiere un `<link>`, `scripts/build-css.mjs` genera **`dist/skryensya.css`**: los tres tiers + la
marca `base` + las dimensiones opcionales + todos los componentes y patterns, en el orden de `@layer`
correcto, en un archivo autocontenido.

Se **genera, no se commitea**, `dist/` está en `.gitignore` ([ADR-6](/decisiones/0006-css-puro-sin-build)
rechazó committear CSS generado, para que no quede stale contra la fuente), y se envía en el tarball
publicado vía `package.json` `files`. Los tiers de tokens se compilan con `compileString`, sin agregar un
archivo agregador bajo `css/`, así que ni el validador ni la referencia de tokens de la doc ven un bundle
gordo que parsear.

Pasa el test del corolario de ADR-6: borra el bundle y la complejidad reaparece en el llamador sin
toolchain, una página HTML plana no puede `@use` Sass ni importar 30 componentes a mano, así que la capa
hacía algo que la vía Sass no podía. Es una conveniencia para un consumidor que la vía Sass no atiende, no
un reemplazo de ella.

## Lo que sí se rechazó

- *Derivar también las marcas de personalidad.* Sería exactamente el perfil compartido de ADR-13:
  `default` y `dusk` dejarían de tener curva propia. La receta es aditiva, no un reemplazo.
- *Dejar que las marcas derivadas se salten el validador.* Era la opción fácil (marcar `base` como "no
  chequeada"). Se descartó: renunciar a la compuerta de contraste por comodidad es perder lo único que
  hace del sistema algo más que tres carpetas ([ADR-7](/decisiones/0007-el-validador)).
- *Committear `dist/skryensya.css`.* Duplica fuente y artefacto y queda stale, lo mismo que rechazaron
  ADR-6 y ADR-13. Se genera en build/publish.
