---
num: 14
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
[ADR-8](/decisiones/0008-que-envia-tier-3) deja el corte en la capa vanilla.)

## El paquete `core`

`@skryensya/core` tiene una responsabilidad angosta:

- publica los tokens CSS y los styling hooks validados;
- publica los parts BEM permanentes que forman el markup contract (`ds-tabs`, `ds-tabs__list`, etc.);
- comparte tipos de opciones y helpers que no pertenecen a ningún framework.

No es un runtime común, no renderiza DOM y no transforma clases. Tampoco reexporta máquinas de Zag: cada
binding importa y adapta su máquina.

## La capa vanilla

`@skryensya/vanilla` es la implementación de progressive enhancement de ADR-8:

- `runtime/hydrate.ts` monta enhancers sobre raíces `[data-ds-*]` de forma idempotente;
- `runtime/apply.ts` parchea atributos y eventos sobre HTML existente;
- `runtime/registry.ts` registra componentes;
- `auto.ts` exporta `initComponents()`.

Los enhancers no renderizan markup y nunca escriben clases. El consumidor autoriza HTML, importa CSS y
llama `initComponents()`.

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
sacaría ese CSS del validador de tiers, modes y contraste descrito en [ADR-7](/decisiones/0007-el-validador).
El contrato queda partido a propósito:

- tokens, styling hooks, parts y tipos compartidos: `@skryensya/core`;
- comportamiento: bindings (`@skryensya/vanilla`, `@skryensya/react`).

## Slice vertical

El primer corte completo es `tabs`: core descriptor, enhancer vanilla, componente React y
`components/tabs.css`. Es suficientemente real para probar máquinas, parts, CSS y documentación sin
multiplicar trabajo por todos los componentes antes de validar la arquitectura.
