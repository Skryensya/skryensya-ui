---
num: 24
title: La capa vanilla usa Svelte como implementación interna, y las machines viven en core
short: "Svelte interno y machines en core"
summary: >-
  Un componente con estado tenía su máquina dos veces: React la tomaba de Zag y la capa vanilla la
  reimplementaba a mano, pineadas sólo por los `*Parts` const y un fixture golden que pasaba ambas
  aunque ambas estuvieran mal. Esta decisión unifica: las machines de Zag se re-exportan desde
  `@skryensya/core/machines` y las consumen los DOS bindings, React con `@zag-js/react`, la capa vanilla
  con `@zag-js/svelte` dentro de componentes `.svelte` que hidratan el markup autorado en light DOM.
  Svelte es implementación interna, no contrato del consumidor. Revierte ADR-14/15 (la capa vanilla no
  renderiza / no usa Svelte) y la invariante "core sin dependencies", con los costos dichos.
---

Un componente con estado, tabs, accordion, un disclosure, un checkbox de tile, tiene UNA máquina de
estados, no dos. Hasta acá vivía duplicada: React la tomaba de Zag (`@zag-js/tabs`, `/collapsible`,
`/checkbox`, `/radio-group`), y la capa vanilla la reimplementaba a mano en un FSM propio. Las dos
copias quedaban pineadas sólo por los `*Parts` const de core, y el único pin de comportamiento
`tile-contracts.ts`, era un fixture golden compartido por los tests de ambos bindings: un bug que
las dos compartían pasaba las dos suites. Es el defecto que el review de arquitectura marcó como el
"through-line".

## Una machine, dos adapters

Las machines de Zag son framework-agnósticas, que es exactamente lo que core publica. Así que core las
re-exporta en **`@skryensya/core/machines`**, y las consumen los dos bindings:

- **React** las adapta con `@zag-js/react` (`useMachine` + `connect`), como ya lo hacía, sólo cambia de
  dónde importa la máquina: de `@zag-js/tabs` a `@skryensya/core/machines`.
- **La capa vanilla** las adapta con **`@zag-js/svelte`** dentro de componentes `.svelte`, que se montan
  sobre el markup `[data-sk-*]` que el consumidor ya escribió y **parchean los atributos** que devuelve
  `connect` sobre ese DOM (`applyZagProps`), sin renderizar estructura propia.

El comportamiento tiene un solo dueño; el contrato de parts se verifica contra la máquina en vez de
duplicarse en un fixture.

## Svelte es implementación interna, en light DOM

Esto **revierte ADR-14 y ADR-15**, que decían que la capa vanilla no renderiza y no usa Svelte. Lo que
NO cambia es lo que esas decisiones protegían: la capa **sigue hidratando markup autorado**, y lo hace
en **light DOM**, `mount()` sobre la raíz existente, nada de custom elements ni shadow DOM, así que
`.hero .sk-tabs { … }` sigue alcanzando el elemento y el modelo de styling hooks queda intacto. Svelte
es el motor interno, reemplazable, nunca un contrato para el consumidor: se autora HTML con clases y
`data-sk-*`, se llama `initComponents()`, y no se escribe una línea de Svelte. El sitio
([ADR-12](/decisiones/0012-monorepo-y-el-sitio)) compila esos `.svelte` con `@sveltejs/vite-plugin-svelte`
y no renderiza ni una UI de Svelte.

Los enhancers SIN máquina de Zag, button, segmented, sidebar, slider, toast, vaul (gesto puro), los
factories de tile-link/tile-button, siguen siendo parcheo de atributos a mano y conviven con los
Svelte en el mismo `initComponents()`.

## Core tiene dependencies, y está bien

Centralizar las machines hace que `@skryensya/core` tenga `dependencies`, las de `@zag-js/*`, lo que
**revierte** la invariante "core sin deps" de [ADR-15](/decisiones/0015-el-icono-es-un-pattern-y-el-set-es-una-marca)
/ [ADR-12](/decisiones/0012-monorepo-y-el-sitio). Se acepta porque una machine **no es un inquilino**:
no nombra una marca ni un proveedor, es comportamiento agnóstico de plataforma, que es lo que core
publica. La distinción con los iconos se mantiene: la geometría de un set sí es de un inquilino y sigue
sin poder vivir en core; una máquina, no. El repo de referencia (kitdigital) hace exactamente esto.

## Costos, dichos

- **La animación del accordion queda pendiente.** React compone su accordion con un `collapsible` por
  item, que aporta `--height` y anima. La capa vanilla usa `@zag-js/accordion` (una sola máquina,
  single/multiple, teclado), que no expone `--height`, así que el alto no anima suave todavía. Es
  funcionalmente correcto; igualar la animación pide cambiar a `collapsible`-por-item como React.
- **El markup del checkbox/radio de tile cambió.** El modelo de Zag oculta el input nativo detrás de un
  control visual (`getHiddenInputProps` + un `[data-part=indicator]` autorado), igual que React. Un
  consumidor que autoró el checkbox con input visible tiene que agregar el indicador. Es un cambio de
  contrato, no sólo un detalle interno, y se elige a cambio de alinear vanilla con React.
- **Tests: la fidelidad de jsdom.** El `flush` de `@zag-js/svelte` es `flushSync(() => queueMicrotask(fn))`
  y Zag difiere el foco con `raf()`; los navegadores drenan microtasks entre callbacks de `raf` y jsdom
  no, así que la selección-al-enfocar con flechas y la restauración en `form.reset()` se prueban en el
  navegador (revisión visual del sitio), no en jsdom. En jsdom se prueba la interacción determinística
  (click, estado, eventos), que es el grueso del contrato.
- **Un `CSS.escape` de polyfill** en el setup de tests, porque Zag escapa ids generados (que llevan `:`)
  y jsdom no trae `CSS`.
