---
num: 8
title: Qué envía tier 3, styling hooks, patterns, y la capa vanilla
short: "Qué envía tier 3"
summary: >-
  ¿Qué envía tier 3? La regla: ¿muchos componentes comparten esta estructura exacta? Si es sí, es un
  pattern y envía estructura; si es no, es un componente y envía solo styling hooks. Invariante no es lo
  mismo que compartida, la anatomía de un combobox es invariante pero la usa un solo componente, así que
  no se envía. El comportamiento que la plataforma no da lo aporta una capa vanilla de enhancers,
  nunca como contrato de framework.
---

[La primera decisión](/decisiones/0001-tres-tiers-y-la-direccion-de-las-referencias) dice que el sistema
envía styling hooks, no componentes: la app consumidora escribe el CSS estructural. Pero
`patterns/state-layer.css` define un `::before`, `pointer-events`, `z-index`, `isolation` y
`border-radius: inherit`. Eso es estructura. Y los componentes con máquina (un combobox, tabs) tienen
una anatomía fija que romperla los rompe.

La pregunta "¿qué envía tier 3?" tiene tres respuestas candidatas. Hace falta **una** regla que las
decida sin excepciones.

## La regla

> **¿Muchos componentes comparten esta estructura exacta?**

- **Sí → es un pattern.** Envía styling hooks *y* estructura. La estructura compartida es todo el
  punto; duplicarla por componente es lo que el pattern existe para prevenir.
- **No → es un componente.** Envía solo styling hooks, porque el markup y el layout de cada consumidor
  difieren.

`state-layer` es un pattern: button, tile, menu-item y tab necesitan todos el `::before` idéntico.
`button` es un componente: no hay dos apps que lo maqueten igual.

## Invariante no es lo mismo que compartida

Aquí es donde la regla demuestra su valor, porque hay una generalización tentadora que está mal.

La anatomía de un combobox **es invariante**: la máquina dicta root → control → input + trigger,
positioner → content → items, y desviarse lo rompe. Es tentador concluir que entonces hay que enviarla.

No. La invarianza es **necesaria pero no suficiente**. Lo que justifica enviar estructura es que esté
**compartida**, ahí hay duplicación real que prevenir. La anatomía del combobox la usa exactamente un
componente: el combobox. No hay nada que compartir. Es markup que el consumidor escribe una vez, en su
propia app, con sus clases y su contenido.

Un pattern se envía porque, si no, diez componentes escriben lo mismo. Un combobox no se envía porque
lo escribe un solo componente, una sola vez.

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
HTML, enlaza el CSS, y llama `initComponents()`. **No necesita framework.**

Cada unidad es un **enhancer**: encuentra un root autorado, corre la máquina, y parchea atributos sobre
elementos que ya existen. **No renderiza markup y nunca escribe una clase**, las dos cosas son del
consumidor. Montar es idempotente.

**Vanilla es el contrato.** El consumidor no escribe, no importa y no configura un framework. La capa
existe para hidratar markup autorado: encuentra raíces, corre comportamiento y parchea atributos sobre
elementos que ya existen.

El **markup contract**, los parts, en el anidado correcto, se **documenta, nunca se envía**. El
sistema describe el markup y el consumidor lo escribe. Los **parts** se nombran en BEM
(`.ds-tabs__list`) y son propios y permanentes: sobreviven si la máquina de abajo se reemplaza. El
**state** (selected, expanded, disabled) lo escribe la máquina como atributo de data, nunca como
modificador BEM y nunca a mano. Los parts son propios; el state es de la máquina.

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

El test se responde con **previsión**: "¿muchos componentes comparten esto?" es una predicción, y una
predicción equivocada envía estructura que nadie reusa, o deja duplicando a todos. Ante duda genuina,
preferir `component`: promover la estructura de un componente a pattern después es aditivo, mientras que
degradar un pattern rompe a todos sus consumidores.
