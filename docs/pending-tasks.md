# Tareas pendientes

Backlog vivo, no un archivo de una sola vez. Se agregan ítems cuando aparecen (una sesión encuentra
un gap real, lo anota acá en vez de arreglarlo de pasada sin dejar rastro), se toman de a uno
empezando por el de más arriba de cada nivel, y se marcan `hecho ✅ (fecha)` en el lugar donde
estaban, nunca se borran ni se reordenan retroactivamente: el orden en que algo se completó es
información.

## Cómo se usa

1. Ir al **Nivel 1**. Tomar el ítem sin marcar más arriba.
2. Resolverlo. Si al hacerlo aparece un tercer hallazgo (un componente que en realidad también le
   falta X), se agrega como ítem nuevo acá mismo, no se resuelve de pasada sin anotar.
3. Marcar `hecho ✅ (fecha)`, con una línea de qué se hizo y dónde (el mismo formato que
   `docs/aria-apg-audit.md` ya usa para sus notas de revisión).
4. Si un ítem termina bloqueado por algo externo (una decisión del usuario, un paquete de terceros),
   se marca `bloqueado ⏸️` con la razón, no se deja sin estado.
5. Recién cuando el Nivel 1 está vacío se pasa al Nivel 2. El Nivel 3 son proyectos grandes con su
   propio tracking; este archivo solo apunta a ellos, no duplica su detalle (that always rots).

## Metodología de ranking

- **Nivel 1**: tiene un bloqueador **mecánicamente verificable ahora mismo** (un grep, un build, una
  página que devuelve un estado concreto). Cero ambigüedad sobre qué falta.
- **Nivel 2**: son los 21 componentes marcados `Beta` en el catálogo. Todos comparten el mismo
  síntoma (`trailing: "Beta"` en `navigation.ts`), pero **la razón de cada uno no está documentada**
  en ningún lado: para 7 de ellos coincide con "no tiene Tests tab" (ya están en Nivel 1); para los
  otros 14 nadie dejó escrito qué falta para que dejen de ser Beta. El trabajo de cada ítem del
  Nivel 2 es primero **decidir el bloqueador real** (¿API inestable? ¿falta revisión de a11y
  puntual? ¿ya está listo y nadie sacó el badge?), después resolverlo o dejar la razón escrita.
- **Nivel 3**: iniciativas con alcance de semanas, ya trackeadas en su propio documento. Acá solo el
  estado a la fecha y el link.

Dentro de cada nivel, el orden es **esfuerzo estimado ascendente**: lo más chico primero, para que
haya progreso visible seguido en vez de quedar atascado en el ítem más grande del nivel.

---

## Nivel 1 - bloqueador conocido: sin Tests tab

Señal: `apps/docs/src/components/pages/*Page.astro` con `contractId` real (no una página de
survey/índice) y sin prop `tests={...}`. Verificado en vivo el 2026-09-03. Completar un ítem es:
escribir la suite en la capa que le falte (`packages/{core,react,vanilla}/src/*.test.ts(x)`),
sumarla a `scripts/build-test-report.mjs` / `artifacts/test-results.json`, agregar `tests` +
`TARGETS` + claves i18n en la página (`feedback-wire-tests-into-docs-tab` en la memoria del
agente tiene el checklist completo), y correr `turbo check`.

- [ ] **FadeEdge** (`/componentes/fade-edge`) - bloqueado ⏸️ (2026-09-03): la premisa original
  ("efecto CSS puro, sin máquina: la suite más chica de este lote") estaba mal planteada. No es que
  la suite sea chica - es que **no hay archivo `.ts`/`.tsx` en `core`/`react`/`vanilla` al que
  atarla** (`grep -rln "fade-edge|fadeEdge|FadeEdge" packages/{core,react,vanilla}/src` vacío):
  FadeEdge es 100% CSS (`data-fade`, `data-direction`, `--sk-fade-edge-size`,
  `--sk-fade-edge-color`), sin contrato ni binding. Se verificó que no hay precedente en el repo
  para esto: los otros patrones CSS-only (`visually-hidden`, `transparency`, `scroll-lock`,
  `scrollbar`) ni siquiera tienen `*Page.astro` propia, y `packages/ai-gates` tampoco tiene ningún
  check sobre `fade-edge`. Escribir un `.test.ts` acá sería inventar un archivo fuente que no
  existe solo para llenar la pestaña. Queda bloqueado hasta que el usuario decida entre: (a) dejar
  la página sin Tests tab permanentemente (es CSS puro, no aplica), o (b) definir una convención
  nueva para patrones CSS-only (p. ej. un check visual/computed-style vía `ai-gates`). No tomar de
  nuevo sin esa decisión.
- [x] **Breadcrumb** (`/componentes/breadcrumb`) - hecho ✅ (2026-09-03): las suites YA existían en
  ambos bindings (`packages/react/src/components/breadcrumb.test.tsx`, 4 tests;
  `packages/vanilla/src/components/breadcrumb.test.ts`, 5 tests) - el gap era solo de wiring, no de
  cobertura. Se agregaron a `sourceFiles` + prop `tests={[...]}` en `BreadcrumbPage.astro`, las 9
  claves `breadcrumb.testN` (es/en) en `ui.ts`, las 2 entradas a `TARGETS` en
  `scripts/build-test-report.mjs`, se corrió el script (9/9 passed) y se verificó en vivo contra
  `:4173` - las dos tablas del tab Tests muestran los 9 checks en verde, cero fallidos/pendientes.
- [x] **Footer** (`/componentes/footer`) - hecho ✅ (2026-09-03): no había ninguna suite (el
  binding React vive en `layout.tsx`, junto a Box/Stack/Grid/etc., y su test file
  `packages/react/src/components/layout.test.tsx` no tenía ningún `it()` para `Footer`). Se
  agregaron 2 tests ahí mismo (mismo archivo/`describe` que Box/Stack/Wrapper): defaults
  documentados (landmark `contentinfo`, `data-surface="sunken"`, `data-padding="lg"`,
  `data-divider=""`) y overrides + `as` dropeando el landmark. Wireado a `FooterPage.astro`
  (`sourceFiles` + `tests={[...]}`), 2 claves `footer.testN` (es/en) en `ui.ts` - `layout.test.tsx`
  ya estaba en `TARGETS`, no hizo falta tocar `build-test-report.mjs`. Corrido (7/7 en
  `layout.test.tsx`, los 2 nuevos incluidos) y verificado en vivo contra `:4173`: ambos checks en
  verde. Nota al pasar: el primer intento de regenerar `test-results.json` chocó con un flake
  preexistente y no relacionado en `packages/react/src/components/menu.test.tsx` (el mismo timing
  de Escape/outside-press que ya documenta `menu-test-suite-dismissable-timing` en la memoria del
  agente) - confirmado flake real (3/3 en aislado, luego pasó también dentro del run completo), no
  una regresión de este cambio; no se tocó nada de Menu.
- [x] **Hero** (`/componentes/hero`) - hecho ✅ (2026-09-03): mismo caso que Footer, mismo
  archivo (`layout.test.tsx`, ningún `it()` para `Hero` todavía). 2 tests agregados: defaults
  (`div` plano, `data-align="start"`, `data-padding="xl"`, `data-surface="surface"`) y overrides +
  `as="section"` con landmark propio. Wireado a `HeroPage.astro`, 2 claves `hero.testN` (es/en),
  `layout.test.tsx` ya en `TARGETS`. Corrido y verificado en vivo (9/9 en `layout.test.tsx`, los 2
  nuevos incluidos). Nota: la regeneración de `test-results.json` volvió a chocar con el mismo
  flake de `menu.test.tsx` visto en el ítem de Footer - ver el nuevo ítem que se agrega abajo por
  esto mismo.
- [x] **`menu.test.tsx` (React) flakea de verdad** - hecho ✅ (2026-09-03). El test `"opens on
  trigger click and closes on Escape, returning focus to the trigger"` usaba `fireUntil` (re-dispara
  Escape en cada poll de `waitFor` hasta que cierra). Ese re-disparo es la causa: cuando Escape
  vuelve a dispararse *después* de que el cierre ya arrancó, `@zag-js/dismissable` re-corre su
  restauración de foco tomando como target el elemento que ahora tiene el foco (el `<div
  role="menu">`), y el foco vuelve al menú en vez del trigger → el `waitFor(() =>
  expect(document.activeElement).toBe(trigger))` timeouteaba. El mismo patrón que el comentario de
  `select.test.tsx:50` ya describía para su propio caso. Fix: disparar Escape **una sola vez**,
  después de `await raf(); await raf()` (el listener de Escape de dismissable se engancha tras un
  solo `requestAnimationFrame`, sin la deferral extra de interact-outside). Verificado: 14 corridas
  seguidas sin fallar (antes ~1 de cada 3 fallaba). La guía de la memoria
  `menu-test-suite-dismissable-timing` decía "re-fire on every poll" para el flip de
  `aria-expanded` - sigue valiendo para outside-press, pero NO para la aserción de foco: ahí el
  re-disparo la rompe. Memoria actualizada con esta excepción.
- [x] **BackToTop** (`/componentes/back-to-top`) - hecho ✅ (2026-09-03): las dos suites YA
  existían (`packages/react/src/components/back-to-top.test.tsx`, 7 tests;
  `packages/vanilla/src/components/back-to-top.test.ts`, 14 tests - 6 de comportamiento puro en
  Core + 8 del enhancer), el gap era solo de wiring. Se agregaron a `sourceFiles` + prop
  `tests={[...]}` en `BackToTopPage.astro` (21 entradas, mapeadas 1:1 contra los `it()` verbatim),
  21 claves `backToTop.testN` (es/en) en `ui.ts`, las 2 entradas a `TARGETS` en
  `build-test-report.mjs`. Corridas aisladas primero (7/7 y 14/14) para no chocar de nuevo con el
  flake de `menu.test.tsx`, después el script completo (21/21, sin colisión esta vez) y verificado
  en vivo contra `:4173`: 21 checks en verde en las dos tablas, cero fallidos/pendientes.
- [x] **Nav list** (`/nav-list`, `contractId="nav-list"`) - hecho ✅ (2026-09-03). Las dos suites
  ya existían (`packages/react/src/components/nav-list.test.tsx`, 7 tests;
  `packages/vanilla/src/components/nav-list.test.ts`, 8 tests) - la vanilla incluso ya estaba en
  `TARGETS`, pero `NavListPage.astro` no tenía ni `sourceFiles` ni `tests={...}`. Se agregaron
  ambos (7 sourceFiles, incluidos los 2 test files; prop `tests` con las 15 entradas mapeadas 1:1
  contra los `it()` verbatim), 15 claves `navListPage.testN` (es/en) en `ui.ts`, la entrada del
  react a `TARGETS`. Corridas aisladas (7/7, 8/8) y verificado.
  **Decisión sobre `trailing: "Beta"`: NO.** Nav list es infraestructura de carga - es el patrón
  que arma el propio sidebar de la doc, tiene contrato maduro (grupos colapsables + enlaces
  anidados + variante horizontal), 15 tests entre las dos capas y está en producción desde hace
  rato. Es lo opuesto a experimental; marcarlo Beta sería incorrecto. Sí sigue faltándole:
  aparece en `componentItems` (buscador) pero ruteado en `/nav-list`, no bajo `/componentes/` -
  eso es a propósito (vive bajo "patrones compartidos" en el sidebar), no un bug.
- [ ] **Popup** (`/componentes/popup`) - reusa el contrato de `popover`; la suite tiene que probar
  la composición propia (ancla + superficie sin chrome), no repetir la de Popover.
- [ ] **Toolbar** (`/componentes/toolbar`) - roving tabindex real, la más involucrada del lote:
  navegación por flechas, wrap, orientación.

---

## Nivel 2 - Beta sin bloqueador documentado

Los 14 que **ya tienen** Tests tab pero siguen marcados Beta. Nadie dejó escrito por qué; el primer
paso de cada ítem es abrir la página + el contrato y decidir. Orden alfabético, no de prioridad real
(no hay señal objetiva para rankearlos todavía - es lo primero que este nivel tiene que producir).

- [ ] **Avatar** (`/componentes/avatar`)
- [ ] **Calendar** (`/componentes/calendar`)
- [ ] **Callout** (`/componentes/callout`)
- [ ] **Carousel** (`/componentes/carousel`)
- [ ] **Changelog** (`/componentes/changelog`)
- [ ] **Charts** (`/componentes/charts`)
- [ ] **ColorPicker** (`/componentes/color-picker`)
- [ ] **Combobox** (`/componentes/combobox`)
- [ ] **Data Grid** (`/componentes/data-grid`)
- [ ] **Drawer** (`/componentes/drawer`)
- [ ] **EmptyState** (`/componentes/empty-state`)
- [ ] **Grid** (`/componentes/grid`)
- [ ] **Treegrid** (`/componentes/treegrid`)
- [ ] **TreeView** (`/componentes/tree-view`)

---

## Nivel 3 - iniciativas grandes (tracking propio)

- [ ] **Migración Vanilla → Svelte + Zag** (`vanilla-svelte-zag-migration` en la memoria del agente).
  Tabs/Tile/Splitter migrados. Pendiente: `select-menu`, marcado explícitamente como **bajo valor**
  por el usuario - no tomar antes que cualquier ítem de Nivel 1 o 2 sin preguntar primero.
- [ ] **Transporte HTTP para el MCP** (`mcp-http-transport-goal` en la memoria del agente). El
  usuario lo quiere eventualmente; **no programado**. `packages/mcp` hoy es stdio-only; mantener
  las asunciones de transporte sueltas en cualquier cambio a ese paquete, no bloquear en esto.
- [ ] **Pipeline de consumo por IA (F6/F7)** - `docs/plataforma-ai-ui.md`, secciones "F6 · El sitio
  y los recipes" y "F7 · Evals", ambas "en curso" a la fecha de ese documento (2026-08-24). **Ese
  documento es la fuente de verdad de este ítem, no este archivo**: verificado el 2026-09-03 que su
  propia lista de "familias sin publicar" ya está desactualizada (`calendar`, `combobox`,
  `popover`, `select`, `dialog`, `vaul`, `toc`, `tooltip` ya están publicadas; el manifest pasó de
  69 a 74 familias). Antes de tocar algo de F6/F7, releer ese documento entero, no asumir que la
  lista de bloqueados sigue vigente.
