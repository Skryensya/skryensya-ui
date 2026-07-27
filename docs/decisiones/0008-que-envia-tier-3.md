---
num: 8
title: Qué envía tier 3, styling hooks, patterns, y la capa vanilla
short: "Qué envía tier 3"
summary: >-
  Tier 3 envía la CLASE y sus styling hooks: importar button.css te da un botón. La regla vieja
  ("componente = solo hooks, la app escribe la estructura") se revirtió porque no sobrevivió al uso:
  22 de 36 hojas ya enviaban estructura, nada lo verificaba, y el único consumidor terminó escribiendo
  17 skins y duplicando una. La distinción componente/pattern sobrevive, pero ahora decide DE QUIÉN es
  una estructura, no si se envía. El comportamiento que la plataforma no da lo aporta una capa vanilla
  de enhancers, nunca como contrato de framework.
---

## La regla vieja, y por qué se cayó

Esta decisión decía:

> ¿Muchos componentes comparten esta estructura exacta? **Sí → pattern**, envía hooks y estructura.
> **No → componente**, envía solo styling hooks, porque el markup y el layout de cada consumidor
> difieren.

El argumento era razonable y la predicción era falsable: *"no hay dos apps que maqueten un botón
igual"*. Se midió, y falló en las tres formas en que una regla puede fallar.

**No se cumplía.** De 36 hojas en `css/components/`, 22 ya enviaban estructura, hasta 163
declaraciones en `select.css`, 117 en `tile.css`, 85 en `details.css`. Catorce no enviaban ninguna.
El sistema no tenía una regla con excepciones: tenía dos sistemas, y en qué mitad caía un componente
dependía de qué día se escribió.

**Nada la verificaba.** [El validador](/decisiones/0007-el-validador) chequeaba direcciones de
referencia, completitud de modos, contraste y forma de nombres. Ninguna regla miraba si un componente
enviaba estructura, así que el corpus derivó en silencio, componente por componente, sin que nadie
tomara la decisión de revertirla.

**La predicción se pudo medir, y salió mal.** El único consumidor que existe, este sitio, tuvo que
escribir 17 skins en `apps/docs/src/examples/`. Una de ellas, `.sk-badge`, terminó duplicada en
`site.css` y las dos copias **divergieron**: una perdió el `border`. Eso es una sola app duplicándose
a sí misma. La premisa era que apps distintas maquetarían distinto; lo que pasó es que la misma app no
pudo mantener sincronizada una copia consigo misma.

Y el costo real estaba en la puerta de entrada: importar `button.css` no daba un botón, daba
variables. Un sistema de diseño cuyo primer paso es "ahora escribí vos el CSS" no está enviando un
botón, está enviando la tarea de hacer uno.

## La regla

> **Un componente envía la clase y sus styling hooks.**

Importar `components/button.css` te da un botón que se ve como un botón. Los hooks siguen siendo el
contrato público, y siguen siendo cómo lo cambiás: `--sk-button-bg` se re-declara desde fuera sin
pelear especificidad, porque la estructura vive en `@layer components` y cualquier regla sin layer le
gana ([decisión 1](/decisiones/0001-tres-tiers-y-la-direccion-de-las-referencias)). Enviar la
estructura no cierra la puerta que los hooks abrían; la deja abierta con algo adentro.

Esto lo hace cumplir el validador con la regla `component-ships-structure`: una hoja de
`components/` que declare hooks y ninguna propiedad real falla. La regla nueva es el inverso exacto de
la vieja, y existe porque la ausencia de una regla fue lo que dejó derivar a la anterior.

## Qué sigue siendo un pattern

La distinción componente/pattern **no desapareció**: cambió de pregunta. Antes decidía *si* se enviaba
estructura. Ahora decide **de quién es** una estructura.

> **¿Muchos componentes comparten esta estructura exacta?** Si es sí, vive en `patterns/` y la
> escribe una sola vez.

`state-layer` es un pattern: button, tile, menu-item y tab necesitan todos el `::before` idéntico, con
su `pointer-events`, su `z-index`, su `isolation` y su `border-radius: inherit`. Escribirlo en cada
componente es exactamente la duplicación que el pattern existe para prevenir.

Y sigue habiendo un caso en el que un componente no escribe estructura propia: cuando **compone** un
pattern. `drawer.css` no declara panel, borde, slide ni backdrop; re-declara `--sk-vaul-*` desde
`--sk-drawer-*` y ya está. No es "no envío nada", es "esto es un Vaul, afinado", y todo lo estructural
que un drawer podría escribir es estructura que un bottom sheet necesita idéntica. El validador exime
ese caso, y sólo ese: una hoja que re-declara los hooks de OTRO componente o pattern.

## Invariante no es lo mismo que compartida

Esta parte del argumento viejo sobrevive intacta, sólo que ahora justifica dónde vive una estructura,
no si se envía.

La anatomía de un combobox **es invariante**: la máquina dicta root → control → input + trigger,
positioner → content → items, y desviarse lo rompe. Es tentador concluir que entonces es un pattern.

No. La invarianza es **necesaria pero no suficiente** para promover algo a `patterns/`. Lo que
justifica un pattern es que la estructura esté **compartida**, ahí hay duplicación real que prevenir.
La anatomía del combobox la usa exactamente un componente: el combobox. No hay nada que compartir, así
que vive en `components/combobox.css`, que es donde se escribe una sola vez de todos modos.

## La plataforma decide, componente por componente

El principio de [CSS puro](/decisiones/0006-css-puro-sin-build), no reimplementar el runtime del
navegador, corta para los dos lados, y el corte es por componente:

| La plataforma lo envía | → solo CSS, sin máquina |
|---|---|
| dialog | `<dialog>` + `showModal()` |
| popover | Popover API |
| disclosure | `<details>` / `<summary>` |

| La plataforma no envía nada | → una máquina se gana su lugar |
|---|---|
| combobox, tabs, menu, tree, toast, date-picker, slider | no existe equivalente nativo |

Un combobox con máquina no reimplementa **nada**, porque no hay combobox nativo, así que la objeción
no tiene de dónde agarrarse. Un dialog con máquina reimplementa `showModal()`, así que
[el dialog es nativo](/decisiones/0011-el-dialog-exige-el-elemento-nativo). No es un punto medio entre
dos posiciones: es el mismo principio aplicado dos veces, cayendo distinto porque la plataforma es
distinta.

## La capa vanilla

El comportamiento que no envía la plataforma lo aporta una **capa vanilla**: el consumidor escribe el
HTML, enlaza el CSS, y hace `await initComponents()`. **No necesita framework.**

Cada unidad es un **enhancer**: encuentra un root autorado, corre la máquina, y parchea atributos sobre
elementos que ya existen. **No renderiza markup y nunca escribe una clase**, las dos cosas son del
consumidor. Montar es idempotente.

**Vanilla es el contrato.** El consumidor no escribe, no importa y no configura un framework. La capa
existe para hidratar markup autorado: encuentra raíces, corre comportamiento y parchea atributos sobre
elementos que ya existen.

El **markup contract**, los parts, en el anidado correcto, se **documenta, nunca se envía**. El
sistema describe el markup y el consumidor lo escribe. Esa es la distinción que hay que no confundir
con la regla de arriba: enviar la **clase** es enviar CSS, no HTML. `components/tabs.css` te dice cómo
se ve un `.sk-tabs__list`; el `<div class="sk-tabs__list">` lo escribís vos.

Los **parts** se nombran en BEM (`.sk-tabs__list`) y son propios y permanentes: sobreviven si la
máquina de abajo se reemplaza. El **state** (selected, expanded, disabled) lo escribe la máquina como
atributo de data, nunca como modificador BEM y nunca a mano. Los parts son propios; el state es de la
máquina.

Un enhancer **parchea atributos sobre markup autorado y nunca escribe una clase**. La excepción es el
chrome que se deriva del contenido y que el autor por lo tanto no puede escribir: el carrusel dibuja
sus controles porque cuántos dots hay sale de MEDIR la pista, no de contar slides
([decisión 24](/decisiones/0024-la-capa-vanilla-usa-svelte-y-las-machines-viven-en-core)). Sigue sin
inventar contenido; dibuja lo que sólo la máquina sabe.

**Un framework nunca es el contrato.** Vanilla es la superficie que el sistema promete; React es una
binding documentada, una de varias posibles, no la puerta de entrada
([decisión 14](/decisiones/0014-core-vanilla-y-react)). Atar el design system a un framework que otro
consumidor no tendría por qué usar es exactamente lo que la capa vanilla evita.

## El paquete compartido no guarda máquinas

`core` existe, pero como paquete de **tokens + parts + opciones compartidas**
([decisión 14](/decisiones/0014-core-vanilla-y-react)), lo que toda binding necesita ver igual. Las
máquinas de estado no viven ahí: ya son paquetes standalone agnósticos de framework, y un paquete que solo
las re-exportara falla [el test de borrado](/decisiones/0006-css-puro-sin-build), bórralo, importa la
máquina directo, y no reaparece complejidad en los llamadores. Un enhancer las importa donde las usa.

## El CSS se queda en `packages/core`

`components/combobox.css` vive con todas las demás hojas de estilo. La razón es enforcement, no
orden: el corpus del [validador](/decisiones/0007-el-validador) es `packages/core/css/**`, así
que CSS que migrara a otro paquete quedaría fuera de las reglas de tier, de mode-completeness y del
contraste cross-marca, exento en silencio de cada garantía que el validador existe para dar.

## Ante la duda

La pregunta que queda ("¿muchos componentes comparten esto?") sigue siendo una **predicción**, y una
predicción equivocada promueve a `patterns/` una estructura que nadie reusa. Ante duda genuina,
preferir `component`: promover después es aditivo, mientras que degradar un pattern rompe a todos sus
consumidores.

Pero la lección más cara de esta decisión no es sobre esa pregunta, es sobre las predicciones en
general. La regla vieja se apoyaba en una ("no hay dos apps que maqueten un botón igual"), nadie la
midió durante meses, y el corpus la fue contradiciendo hoja por hoja sin que eso disparara nada. Una
regla que el validador no puede chequear no es una regla: es una intención, y el código deriva de ella
en silencio. Por eso la regla nueva llegó junto con su check, y no antes ni después.
