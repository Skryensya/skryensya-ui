---
num: 7
title: Core, Vanilla y React
short: "Core, Vanilla, React"
summary: >-
  El sistema tiene dos bindings que comparten un contrato, así que un paquete compartido separa lo común
  de lo específico de framework. `@skryensya/core` concentra los tokens, los parts BEM y los tipos
  compartidos; las máquinas y cualquier lógica DOM viven en cada binding. `@skryensya/vanilla` hidrata HTML
  autorado sin renderizar markup ni clases; React renderiza el mismo contrato como componentes
  declarativos. El CSS de cada componente vive dentro de core para seguir dentro del validador.
---

El sistema tiene dos bindings que comparten un contrato: una capa vanilla y una capa React. Con más de un
framework en juego, un paquete compartido separa lo común de lo específico de cada uno, sin él, las dos
capas duplicarían tokens, parts y tipos. (Con un solo framework no hacía falta, y por eso
[ADR-2](./0002-what-tier-3-ships.md) deja el corte en la capa vanilla.)

## El paquete `core`

`@skryensya/core` tiene una responsabilidad angosta:

- publica los tokens CSS y los styling hooks validados;
- publica los parts BEM permanentes que forman el markup contract (`sk-tabs`, `sk-tabs__list`, etc.);
- comparte tipos de opciones y helpers que no pertenecen a ningún framework.

No es un runtime común, no renderiza DOM y no transforma clases. Tampoco reexporta máquinas de Zag: cada
binding importa y adapta su máquina.

## La capa vanilla

`@skryensya/vanilla` es la implementación de progressive enhancement de ADR-2:

- `runtime/svelte-hydrate.ts` monta enhancers sobre raíces `[data-sk-*]` de forma idempotente;
- `runtime/apply.ts` parchea atributos y eventos sobre HTML existente;
- `runtime/registry.ts` relaciona cada selector con un `import()` dinámico;
- `auto.ts` exporta `initComponents()`, que escanea primero y sólo descarga los tipos presentes.

Los enhancers no renderizan markup y nunca escriben clases. El consumidor autoriza HTML, importa CSS y
hace `await initComponents()`. CodePreview y ComponentPreview quedan fuera del registry: son superficies
de documentación opt-in montadas desde sus subpaths explícitos. Shiki resuelve el resaltado de
CodePreview en build/SSR; ninguno de los dos introduce ese trabajo en el runtime del navegador.

En las docs, cada demo se ejecuta en un `iframe srcdoc` estático: no exige una ruta de preview, pero
sí crea un `Document`, viewport y top layer propios. El entry del frame corre `initComponents()` dentro
de ese realm; CSS, dimensiones e icon set siguen siendo decisiones explícitas del consumidor.

## React no hidrata: renderiza

`@skryensya/react` es una librería de componentes React convencional. Consume `@skryensya/core` y `@zag-js/react`,
renderiza la anatomía documentada y deja que el consumidor componga contenido con props y children.

Esto no contradice la capa vanilla. Cada binding usa el idioma natural de su ecosistema:

- vanilla: preservar markup autorado y añadir comportamiento;
- React: renderizar componentes declarativos.

La garantía compartida es que ambos producen el mismo contrato de parts. La máquina de estado es detalle
de implementación de cada binding.

## El CSS vive en core

Los hooks de estilo de cada componente viven en `packages/core/css/components/`. Moverlos junto al binding
sacaría ese CSS del validador de tiers, modes y contraste descrito en [ADR-19](./0019-public-palettes-and-constant-semantics.md).
El contrato queda partido a propósito:

- tokens, styling hooks, parts y tipos compartidos: `@skryensya/core`;
- comportamiento: bindings (`@skryensya/vanilla`, `@skryensya/react`).

## Slice vertical

El primer corte completo es `tabs`: core descriptor, enhancer vanilla, componente React y
`components/tabs.css`. Es suficientemente real para probar máquinas, parts, CSS y documentación sin
multiplicar trabajo por todos los componentes antes de validar la arquitectura.
