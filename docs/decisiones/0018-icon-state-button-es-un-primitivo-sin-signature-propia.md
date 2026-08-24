---
num: 18
title: Icon State Button es un primitivo, sin signature propia
short: "Icon State Button: anatomía y paint, no un tercer componente"
summary: >-
  CopyButton y ThemeToggle son los dos "botón ícono con estados, un ícono por estado" que existen.
  Los dos ya componían el pattern Icon Toggle para el cross-fade, pero cada uno escribía sus propias
  N caras a mano (dos veces cada una, una en el contrato declarativo y otra en JSX) y su propia
  función de "escribir el estado + el aria-label". Esta decisión saca esas dos piezas a
  `@skryensya/core/icon-state-button`, un primitivo sin `signature` propia: no se registra, no tiene
  export de React con su propio nombre, no aparece como un componente nuevo. CopyButton y ThemeToggle
  siguen siendo dos signatures distintas, cada una dueña de su propio disparador de transición y de
  su propio CSS.
---

## Lo que había

Icon Toggle (`icon-toggle.ts` + `patterns/icon-toggle.css`) ya resolvía el cross-fade entre caras
apiladas para cualquier cantidad de estados. Eso ya era genérico. Lo que no era genérico era todo
lo que queda alrededor:

- Cada componente escribía sus propias N caras `<span data-face>` **dos veces**: una vez en
  `template.children` del contrato (lo que consume el binding autorado/vanilla), y otra vez a mano
  en JSX del binding React, sincronizadas solo por disciplina y por el gate G2 de simetría.
- Cada binding vanilla tenía su propia función `paint()`/`paintToggle()` para escribir el atributo de
  estado del root y el `aria-label`, casi idénticas entre sí.
- El binding React de CopyButton redeclaraba `FEEDBACK_DURATION = 1800` por su cuenta. Un comentario
  en el archivo admite que se copió a mano de la versión vanilla, "hasta la ventana de 1800ms".

## La decisión: un primitivo, no un tercer componente

`icon-state-button.ts` (core) exporta `buildIconStateFaces` (arma las N caras del contrato a partir
de una lista `{ name, icon }`) y `setIconState`/`getIconState` (escriben o leen el atributo de estado
del root, más el `aria-label` opcional). `icon-state-button.tsx` (react) exporta el equivalente para
JSX, `renderIconStateFaces`.

**Alcance deliberadamente angosto**: solo anatomía y lectura/escritura genérica del atributo. El
primitivo NO decide cuándo cambia el estado. CopyButton se revierte solo con un timer, ThemeToggle
cicla para siempre y avisa a sus hermanos por evento. Son dos formas de comportamiento genuinamente
distintas; forzar una sola sobre las dos hubiera sido una abstracción falsa. Ese disparador sigue
siendo de cada componente.

**Y no tiene signature.** `CopyButton` y `ThemeToggle` siguen siendo dos entradas distintas en
`signatures`, cada una con su propio `id`, su propio export de React (`@skryensya/react/copy-button`,
`@skryensya/react/theme-toggle`) y su propia página de docs. `icon-state-button.ts` no se agrega al
registro de `packages/ai-compiler/src/registry.ts`. Mismo trato que el propio Icon Toggle, que
tampoco está registrado. Es la misma razón de la decisión 8: un primitivo se publica cuando un
segundo consumidor ya lo necesita, y "un segundo consumidor" significa que dos componentes existentes
lo comparten, no que nazca un componente nuevo para justificarlo.

## El CSS no se tocó

Cada componente sigue escribiendo a mano sus propios selectores que mapean el valor de su atributo de
estado a la cara visible (`data-sk-copy-button-state` en copy-button.css, `data-scheme` en
theme-toggle.css). CSS no tiene manera de decir "activa la cara cuyo nombre coincide con el valor de
mi propio atributo" sin enumerar cada valor a mano. La única alternativa real es pasarse al mecanismo
`data-active` que ya trae Icon Toggle, y eso solo lo puede escribir JS. Eso hubiera costado el paint
sin JS que hoy tienen los dos: el fallback `prefers-color-scheme` de ThemeToggle y el "atributo
ausente = idle" de CopyButton. Generar el markup valía la pena; generar el CSS, con ese costo, no.

## El costo, dicho

- `IconStateFace.icon` está tipado contra `StableIconName` (core), así que un nombre de ícono que no
  existe en el vocabulario estable falla en build. Antes cada componente escribía el string suelto.
- El helper de contrato (`buildIconStateFaces`) devuelve un tipo de retorno escrito a mano
  (`readonly ContractTemplate[]`) en vez de inferido: el contrato que lo embebe queda
  `as const satisfies ComponentContract`, y `as const` no vuelve a narrowear lo que devuelve una
  llamada a función.
- `FEEDBACK_DURATION` de CopyButton y el ciclo/broadcast de ThemeToggle siguen sin compartir código.
  Es una duplicación real que queda. Deliberadamente fuera de alcance de esta decisión, no una que se
  haya pasado por alto.
