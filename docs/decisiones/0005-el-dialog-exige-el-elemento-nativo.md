---
num: 5
title: El dialog exige el elemento `<dialog>` nativo
short: "El dialog nativo"
summary: >-
  El dialog es el primer componente que necesita comportamiento, focus trap, ESC, fondo inerte, así que
  se exige el elemento nativo <dialog> con showModal(): la plataforma provee cada comportamiento, y un
  dialog basado en div reimplementaría el runtime del navegador. Envía cuatro archivos: un componente de
  styling hooks y tres patterns (top layer, backdrop, scroll lock). El borde siempre encendido no es
  estético: en alto contraste el panel y la página son el mismo color, y suavizarlo lo haría invisible sin
  que ningún test falle.
---

El dialog es el primer componente que necesita **comportamiento**, focus trap, ESC, fondo inerte,
restauración del foco, donde `button` no necesitaba ninguno.

**Se exige `<dialog>` + `showModal()`.** La plataforma provee cada uno de esos comportamientos, más el
top layer y un `::backdrop` real. Un dialog basado en div reimplementa el runtime del navegador en JS
que habría que enviar, exactamente lo que [no se hace](/decisiones/0019-paletas-publicas-y-semanticos-constantes). Exigir
el nativo es lo que mantiene al sistema enviando solo CSS para un componente que necesita
comportamiento.

## La agnosticidad de elemento no es una política: es evidente

"Solo nativo vs tolerante a div" parece una elección, y se disuelve en dos, cada una respondida por la
plataforma:

- **Los styling hooks son agnósticos al elemento gratis.** `--sk-dialog-bg` es una custom property; a
  las custom properties no les importa qué elemento las lleva. `components/dialog.css` funciona sobre un
  `<div role="dialog">` a costo cero.
- **Los patterns son solo-nativo por naturaleza.** `patterns/top-layer.css` y
  `patterns/scroll-lock.css` dependen del top layer y de `:modal`, que ningún div puede tener a ningún
  precio.

Así que un div se lleva el aspecto y nada de la maquinaria, y eso no es un compromiso diseñado, es lo
que la plataforma ya decidió.

## Cuatro archivos

Según [la regla de qué envía tier 3](/decisiones/0002-que-envia-tier-3): `components/dialog.css`
(styling hooks, el layout de header/body/footer es asunto de la app),
`patterns/top-layer.css` y `patterns/backdrop.css` y `patterns/scroll-lock.css` (patterns, un drawer,
un sheet y un popover los necesitan carácter por carácter).

Top-layer y backdrop se mantienen **separados** aunque se muevan en sincronía: un menú entra al top
layer sin scrim, así que fusionarlos enviaría CSS de backdrop a cada popover. No pueden desincronizarse
porque los dos consumen los mismos [tokens de intención](/decisiones/0004-motion-por-tokens-de-intencion)
`--motion-enter-*`.

**El scroll lock es su propio import** porque `html:has(dialog:modal) { overflow: hidden }` es la primera
regla del sistema que estiliza el **root del documento** desde un archivo opt-in, donde todo lo demás se
scopea a su propio elemento. El import separado *es* el consentimiento. Y muchas apps corren su propio
scroll lock; uno silencioso se aplicaría doble. (`scrollbar-gutter: stable` no es decoración:
`overflow: hidden` saca la scrollbar y la página salta ~15px al abrir.)

## Tres trampas silenciosas que el pattern existe para absorber

Animar un elemento del top layer requiere:

1. `@starting-style`, la única forma de animar *desde* `display: none`.
2. `transition-behavior: allow-discrete` declarado **después** del shorthand, que lo resetea a `normal`
   en silencio.
3. `overlay` dentro de la transición, **sin el cual el elemento sale del top layer al instante y la
   animación de salida se reproduce invisible**, sin ningún error, en un componente que se ve perfecto
   al entrar.

Que el consumidor se equivoque en las tres es la razón por la que estos son patterns y no hooks.

## La trampa de alto contraste, no "arreglar" este borde

En `modes/hc.scss`, `--color-bg-surface` y `--color-bg-canvas` son idénticos byte a byte. Correcto para
alto contraste, y fatal para un dialog: el panel y la página detrás son **el mismo color**, así que el
único separador que queda es `--elevation-top`, una sombra, para los usuarios menos capaces de percibir
una.

Por eso el dialog lleva un borde siempre encendido,
`--sk-dialog-border-color: var(--color-border-default)`, que el alto contraste ya promueve gratis a un
borde negro o blanco duro.

**No debe suavizarse a `border-subtle` por estética.** Subtle se queda gris medio en alto contraste, y
[el validador](/decisiones/0019-paletas-publicas-y-semanticos-constantes) lo exime de las verificaciones de contraste por decorativo
una exención que aquí es nula, porque un borde que es el único separador es un elemento no-texto
*significativo* bajo WCAG 1.4.11. Ese cambio de una palabra hace invisible al dialog en alto contraste y
**ningún test falla**.

## Lo que se rechazó

- *Tolerante a div por política.* Acumulaba brechas silenciosas: sin backdrop, sin motion de top layer,
  sin scroll lock, sin focus trap, sin ESC, sin inert, sin restauración de foco. Cada uno renderiza
  perfecto y no atrapa nada. Un dialog que se ve bien y se comporta mal es peor que uno que no renderiza.
- *Una máquina para el dialog.* Reimplementa `showModal()`, el focus trap, el `inert` y el top layer en
  JS. El argumento a favor era real, el `<dialog>` nativo es **imperativo**, `showModal()` hay que
  llamarlo sobre una ref porque el atributo `open` solo no entra al top layer ni renderiza `::backdrop`
pero eso es una molestia de ergonomía, no una razón para reimplementar el navegador.

## Costo

Un requisito duro sobre los consumidores (`<dialog>` nativo, sin excepciones) y una dependencia del
baseline más nuevo del sistema: que `::backdrop` herede de su elemento de origen llegó en Chrome 122,
Firefox 120 y Safari 17.4, ~un año más joven que el soporte de
[`oklch()`](/decisiones/0019-paletas-publicas-y-semanticos-constantes). La página de `::backdrop` en
MDN todavía documenta el comportamiento viejo; está desactualizada, no es una contradicción.
