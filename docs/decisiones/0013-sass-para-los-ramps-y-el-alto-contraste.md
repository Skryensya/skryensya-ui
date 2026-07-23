---
num: 13
title: SCSS para los tokens fuente
short: "SCSS para tokens"
summary: >-
  Los entrypoints de tokens se consumen como Sass, no como CSS generado y commiteado: el consumidor compila
  `tokens.scss`, `primitives.scss`, `semantic.scss`, `brands/*.scss` y `modes/*.scss` en su pipeline. SCSS
  no reimplementa el runtime, light-dark(), cadenas de var(), oklch() literal; solo organiza la fuente y
  pliega una duplicación de autoría donde CSS no tiene macro. Dos usos la justifican: el mixin `hc-tokens`
  (34 tokens de alto contraste, un cuerpo incluido dos veces) y la división de la fuente en parciales. Los
  ramps NO usan mixin: cada marca escribe sus `oklch()` a mano, con su propia curva, porque un perfil L/C
  compartido haría que dos marcas tengan la misma curva y el validador necesita literales para medir contraste.
---

Los entrypoints de tokens son Sass. `modes/hc.scss` pliega el bloque de alto contraste; `semantic.scss`
divide los grupos semánticos en parciales por dominio; `brands/*.scss` y `primitives.scss` declaran los
ramps. Los tier-3 `components/*` y `patterns/*` siguen siendo CSS escrito a mano. Es el mismo principio que
[el CSS puro](/decisiones/0006-css-puro-sin-build): Sass no reimplementa el runtime, solo organiza la
autoría, así que entra donde pliega duplicación real y en ningún otro lado.

## Por qué esto no rompe el principio de ADR-6

El principio de ADR-6 no es "sin build". Es **no reimplementar el runtime de la plataforma**, con un
corolario que es el que trabaja:

> Bórrese la capa. ¿Reaparece la complejidad en los llamadores? Si no reaparece, no estaba haciendo nada.

Un emisor de tokens clásico, Style Dictionary, viola el principio porque *genera* `light-dark()`,
`calc()`/`round()` y las cadenas de `var()`: reimplementa en build lo que el navegador ya hace. SCSS aquí
no genera nada de eso. El `light-dark()` del alto contraste, la cadena `var(--ramp-…)`, el `oklch()`
literal del ramp, todo eso se escribe tal cual y sale tal cual. SCSS solo toca la **autoría**, no la
semántica.

Y pasa el test del corolario. El caso que lo justifica es el **alto contraste**: `modes/hc.scss` declara
los mismos 34 tokens dos veces, una por `[data-contrast="high"]`, otra por `@media (prefers-contrast: more)`, 
porque *"CSS no tiene macro"*. El mixin `hc-tokens` **es** la macro: un cuerpo, incluido dos veces. Bórralo
y vuelven los dos bloques copiados a mano, con su riesgo de divergencia. El validador tenía una regla
"mode-complete: los dos bloques no divergen", que existía solo para vigilar esa copia; ahora vigila al
compilador, y no puede fallar.

Los ramps son el caso opuesto y por eso **no usan mixin** (ver abajo): ahí plegar la repetición esconde una
pérdida de diseño, no boilerplate. Lo mismo confirma `button.css`, donde cada variante afina sus hooks a
mano, y `patterns/state-layer.css`, que depende de orden y comentarios load-bearing: repetición con
sentido, que un mixin solo escondería. Sass entra *donde tiene sentido*, no en todas partes.

## Quién paga el build

`css/` ya no duplica los entrypoints Sass como CSS generado. Los consumidores importan
`@skryensya/core/tokens.scss`, una marca explícita como `@skryensya/core/brands/default.scss`, y opcionalmente
`@skryensya/core/modes/hc.scss`; su bundler compila la salida CSS final. La cubre el mismo
[validador](/decisiones/0007-el-validador): `lint` compila Sass en memoria antes de aplicar las reglas,
así que valida el runtime que recibirá el browser sin escribir artefactos intermedios.

## Lo que sí se rechazó

- *SCSS en todo el paquete.* Renombrar cada `.css` a `.scss` habría metido un compilador entre el autor y
  archivos sin una sola feature de SCSS. El costo de build se paga en los token entrypoints, no en tier 3.
- *SCSS para la estructura de tier 3 en el paquete.* `patterns/state-layer.css` tiene su escalera de
  prioridad repetitiva, pero los comentarios son load-bearing y el orden es el mecanismo; un mixin ahí
  arriesga más de lo que ahorra. El paquete de tokens no envía estructura de todos modos (ADR-8): esa es
  CSS del consumidor.
- *Committear el CSS generado.* Duplicaba fuente y artefacto, y podía quedar stale. El paquete ahora
  publica la fuente Sass para los entrypoints que la necesitan.

## Los ramps se escriben a mano

Un mixin que compusiera cada marca desde un perfil `(lightness, chroma)` compartido más un hue parecería
plegar duplicación, pero esos mapas compartidos SON el problema: dos marcas sobre el mismo perfil tendrían
una curva L/C **idéntica** y solo cambiaría el hue, con lo que la "personalidad" de una marca sería una
rotación de matiz, no una identidad. Ese ahorro de autoría escondería una pérdida de diseño, así que no se
hace.

Cada `brands/*.scss` declara sus ramps como `oklch()` **literal**, escrito a mano, con su propia curva:
neutrales cálidos o fríos, contraste nítido o suave, chroma vívido o apagado. `ember` es cálido y punzante;
`ink` es frío y crispado; `sand` no tiene blanco puro; `plum` es el más vívido. Ninguna comparte curva con
otra.

Lo que garantiza la seguridad de contraste no es un mixin sino el **[validador](/decisiones/0007-el-validador)**:
resuelve cada stop a su `oklch()` literal y mide el ratio WCAG por marca y por modo. Un hue en `var()`
haría que el chequeo pase en silencio a 21:1, así que los valores son literales por obligación, no por
estilo. La accesibilidad es una compuerta, no una esperanza.
