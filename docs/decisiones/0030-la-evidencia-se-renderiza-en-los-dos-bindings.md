---
num: 30
title: La evidencia se renderiza en los dos bindings
short: "El sitio es el catálogo ejecutable"
summary: >-
  El catálogo ejecutable que exigía el plan de reconstrucción ya existe: `apps/docs` renderiza los
  dos bindings lado a lado —vanilla en un iframe `srcdoc`, React como island `client:load`— en 57 de
  sus 67 páginas. Esta decisión lo declara el catálogo ejecutable del sistema, hace que su `ComponentPreview`
  reciba usage trees en vez de strings, y adopta Playwright para correr los cuatro gates de runtime:
  simetría por DOM-diff, interacción, accesibilidad y visual. Storybook no vuelve.
---

## El problema

El plan de reconstrucción pedía un catálogo ejecutable y nombraba Storybook para todo: CSF como unidad
de ejemplo, play tests para interacción, baselines visuales, y el Storybook MCP como la manera en que
el agente vería el resultado.

Storybook se construyó en este repo —dos, uno para vanilla con `@storybook/html-vite` y otro para
React— y se borró el 2026-07-17. No fue un accidente ni una limitación técnica: se rechazó a
propósito y se pidió volver a los previews del sitio.

Y mientras tanto el sitio hacía ya lo que Storybook iba a hacer. `ComponentPreview.astro` monta la demo
vanilla en un iframe `srcdoc` con su propio DOM, viewport y top layer, y la demo React como island
`@astrojs/react` real —no un string de código— en el mismo documento, con un segmented para alternar.
**57 de 67 páginas ya tienen las dos etapas vivas.** Un segundo catálogo en paralelo no habría
agregado una sola capacidad; habría agregado una segunda cosa que mantener sincronizada.

## La decisión

**`apps/docs` es el catálogo ejecutable.** No un reflejo de él: el mismo artefacto. `ComponentPreview` deja de
recibir `html` y `react` como strings y recibe un usage tree, que renderiza con el mismo emisor que
usa el MCP (decisión 29). El código que la página muestra es el emitido, no una transcripción. Una
regresión en el contract se ve en la página.

Las páginas siguen siendo humanas donde deben serlo: el orden, las secciones, la explicación de cuándo
usar cada cosa. Lo que deja de escribirse a mano es la evidencia.

**Playwright corre los gates de runtime**, los cuatro:

| Gate | Qué prueba |
|---|---|
| Simetría | Los dos bindings del mismo árbol producen el mismo DOM normalizado: parts, atributos mapeados, árbol ARIA |
| Interacción | La firma hace lo que declara, en un navegador real |
| Accesibilidad | `@axe-core/playwright` sobre cada etapa, y el ARIA snapshot como contrato |
| Visual | Baselines aprobados por estado canónico |

Se instala Playwright aunque el repo no lo tuviera. Manejar Chrome por CDP a mano fue un workaround
por no tenerlo, nunca una preferencia: escribir a mano la inyección de axe, el diffing de imágenes y
la captura de trazas es exactamente la rueda que no hay que reinventar. Y Playwright MCP es lo que el
agente maneja para verificar la app consumidora.

## Lo que se rechazó

**Reintroducir Storybook**, que es lo que los documentos de origen especifican literalmente en G2, G4,
G5 y en su fase de integración. Trae a11y y visual resueltos, pero ya se rechazó una vez con
conocimiento de causa, y duplicaría un catálogo que existe y funciona.

**Formalizar el harness CDP propio.** Cero dependencias nuevas y control total del protocolo, a cambio
de mantener el runner, los baselines y la captura de evidencia a mano.

**jsdom para la mitad estructural y navegador solo para lo visual.** Los gates baratos correrían en
cada commit, pero jsdom ya demostró en este repo que miente con Zag —`raf`, microtasks, `CSS.escape`
ausente— justo en los componentes cuya interacción importa. Un gate que miente rápido no es barato.

**Que el sitio sea además el runner de CI**, exponiendo sus árboles en una ruta machine-readable. Un
solo lugar donde las cosas se renderizan, al precio de acoplar los gates al build del sitio y a que el
dev server esté sano.

## Costo

`ComponentPreview.astro` y las 67 páginas se tocan una vez para pasar de strings a árboles, y las 10 páginas
que hoy no tienen demo React necesitan uno o quedan fuera del gate de simetría. Playwright suma una
dependencia grande y un navegador a CI.
