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

## Nivel 1 - hecho ✅ (2026-09-12): la CRITICAL de astro esta resuelta

`astro` quedo en `~7.2.8` (resuelve 7.2.10) y el gate de `pre-push` pasa: **cero advisories de nivel
high o superior**. Se fueron las cuatro que bloqueaban, la CRITICAL de astro (RCE por optimizacion
de imagenes AVIF) y las tres HIGH de `sharp`, `svgo` y `smol-toml`.

Lo que faltaba entender del intento del 2026-09-09 quedo claro, y es lo unico que valia la pena
averiguar: **la exclusion si funciona, pero hay que listar los binarios nativos uno por uno.** pnpm
omite una dependencia OPCIONAL en silencio cuando la cuarentena la bloquea, asi que el install queda
"bien" y despues `astro check` muere con `Cannot find native binding`. Los nueve
`@bruits/satteri-*` estan ahora en `minimumReleaseAgeExclude`, los nueve y no solo el de esta
maquina, para que un clon en Linux o Windows resuelva el mismo arbol.

Verificado: `astro check` da 0 errores sobre 687 archivos, `pnpm check` 24 de 24, y `pnpm audit:gate`
sale limpio. Con eso desbloqueado, el audit gate se agrego tambien a CI: vivia solo en `pre-push`, que
corre en la maquina del autor, asi que un PR desde un fork, que es justo para lo que existe el
workflow, no recibia ninguna vigilancia de CVEs.

Las entradas de `minimumReleaseAgeExclude` se borran cuando astro 7.2.x cumpla 30 dias.

## Nivel 1 - bloqueador conocido: sin Tests tab

Señal: `apps/docs/src/components/pages/*Page.astro` con `contractId` real (no una página de
survey/índice) y sin prop `tests={...}`. Verificado en vivo el 2026-09-03. Completar un ítem es:
escribir la suite en la capa que le falte (`packages/{core,react,vanilla}/src/*.test.ts(x)`),
sumarla a `scripts/build-test-report.ts` / `artifacts/test-results.json`, agregar `tests` +
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
  `scripts/build-test-report.ts`, se corrió el script (9/9 passed) y se verificó en vivo contra
  `:4173` - las dos tablas del tab Tests muestran los 9 checks en verde, cero fallidos/pendientes.
- [x] **Footer** (`/componentes/footer`) - hecho ✅ (2026-09-03): no había ninguna suite (el
  binding React vive en `layout.tsx`, junto a Box/Stack/Grid/etc., y su test file
  `packages/react/src/components/layout.test.tsx` no tenía ningún `it()` para `Footer`). Se
  agregaron 2 tests ahí mismo (mismo archivo/`describe` que Box/Stack/Wrapper): defaults
  documentados (landmark `contentinfo`, `data-surface="sunken"`, `data-padding="lg"`,
  `data-divider=""`) y overrides + `as` dropeando el landmark. Wireado a `FooterPage.astro`
  (`sourceFiles` + `tests={[...]}`), 2 claves `footer.testN` (es/en) en `ui.ts` - `layout.test.tsx`
  ya estaba en `TARGETS`, no hizo falta tocar `build-test-report.ts`. Corrido (7/7 en
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
  `build-test-report.ts`. Corridas aisladas primero (7/7 y 14/14) para no chocar de nuevo con el
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
- [x] **Popup** (`/componentes/popup`) - hecho ✅ (2026-09-19), pero no escribiendo la suite: el
  ítem se disolvio. La premisa ("reusa el contrato de `popover`") era en realidad el problema, no un
  detalle: Popup no era un componente, era `Popover.bare`, la misma familia una signature mas abajo,
  con pagina propia. Dos paginas para un contrato obligaban al lector a elegir entre las dos antes
  de saber que eran lo mismo, y el catalogo contaba la familia dos veces. La seccion se fusiono
  dentro de la pagina de Popover bajo `<h3 id="popup">` (demo vivo + diagrama de anatomia + su nota
  de a11y), `/componentes/popup` y `/components/popup` quedaron como 301 a esa ancla (mismo patron
  que `components/details.astro`), las palabras de busqueda de Popup pasaron a los `aliases` de
  Popover para que el nombre siga encontrando la pagina, y los demos viven en `demos/popover.ts`.
  La cobertura que el item pedia ya existia: `popover.test.tsx` tiene 12 tests y cuatro de ellos son
  especificamente del modo bare (`testReact4`, `testReact10`, y los de placement/arrow que usan la
  signature). Con eso Popup deja de ser un item del Nivel 2: no hay componente que despejar.
  Al pasar: los dos redirects de `details` apuntaban mal (el ingles a `#native-details`, un fragmento
  que ningun elemento tiene, y el español a `/componentes/...` sin el prefijo `/es` que ADR-0021
  dejo). Corregidos los dos.
- [ ] **Toolbar** (`/componentes/toolbar`) - roving tabindex real, la más involucrada del lote:
  navegación por flechas, wrap, orientación.

### Las tres hojas sin contrato: drawer resuelto ✅ (2026-09-12), las otras dos son correctas

**drawer, hecho**: `components/drawer.css` se fusiono en `patterns/vaul.css`. Era una sola clase, 15
hooks y cero estructura, y ya declaraba en su propio encabezado que requeria la hoja de Vaul. Los 7
hooks `--sk-drawer-*` quedan declarados por el contrato de `vaul` y el gate los verifica. Los cinco
importadores reales ya importaban `vaul.css`, asi que la fusion no dejo a nadie sin estilos.

Lo que costo, anotado tambien en el comentario de `vaul.css`: la regla `component-ships-hooks` de
`scripts/checks.ts` se escribio **para** `drawer.css`, y ahora se queda sin instancia real; le queda
solo el fixture sintetico de `checks.test.ts`. Y quien importe `vaul.css` ahora carga tambien las
reglas de `.sk-drawer`, inertes salvo que se use la clase.

**copy-button y theme-toggle, correctas como estan**: `core/src/copy-button.ts` lo dice en su propio
docstring, *"No contract lives here any more (decision 33, reversed)"*. El contrato se saco a
proposito; un consumidor compone `IconStateButton` a mano. theme-toggle es el mismo caso: sin binding
en ninguna de las dos capas, y la hoja la consume solo el chrome del sitio de doc. Publicarles
contrato seria re-litigar una decision documentada.

**El modelo, resuelto ✅ (2026-09-12)**: `ComponentContract.hookSheets` deja que un contrato nombre
las otras hojas donde vive su estilo, y `hooks` se reconcilia contra la union. Son **9 contratos**,
por tres motivos distintos y ninguno accidental: un archivo que sirve varias firmas que son
componentes aparte (`selection.ts` -> checkbox, radio-group, switch; `layout.ts` -> box, wrapper), y
un componente que compone a otro y hereda sus partes (Accordion usa las clases de Tile, Toast las de
Callout, table-pager las de Pagination).

Lo que gana, medido: Accordion declaraba 6 hooks y las clases que usa se pintan desde `tile.css`, que
declara 18. Ahora borrar `--sk-tile-shadow` de `tile.css` falla **tambien** por Accordion, no solo
por Tile. Dos contratos pueden nombrar la misma hoja y los dos declaran sus hooks: esa duplicacion es
a proposito, porque que Checkbox y Switch compartan superficie es un hecho del sistema, no un error
de contabilidad.

### FileUpload: el boton de limpiar, hecho ✅ (2026-09-12)

**La nota anterior estaba mal**: decia que React no lo implementaba. Si lo implementa, en
`file-upload.tsx:152-159`, con `api.getClearTriggerProps()` y una prop `clearLabel`. El hallazgo de
"drift entre bindings" fue un falso negativo de mi propio grep: busque `\bclear\b`, que no matchea
`clearLabel`.

Lo que faltaba era solo la declaracion. Resuelto sumando al contrato el slot `clearLabel`, el
atributo `clear` en `fileUploadAttrs` y el nodo de template correspondiente, **opt-in via
`whenGiven`**: sin `clearLabel` no se emite boton, asi que todo arbol ya escrito emite markup
byte-identico. Lo mismo que paso con `group` en Menu: las dos bindings ya lo tenian y el contrato era
lo unico que no podia decirlo.

### Menu: `group` en los items de radio, hecho ✅ (2026-09-12)

Resuelto en `2be7e48` publicando `group` como opcion de item (`attr: "data-group"`) en
`menuItemShape`, y restaurandolo en `menuCompactItems`. **No era API nueva**: el tipo `MenuItem` de
Core ya lo declaraba y las dos bindings ya lo usaban para la exclusion mutua de radios
(`menu.tsx`: `candidate.group === changedItem.group`; `Menu.svelte`: `node.dataset.group`). Lo unico
que faltaba era la declaracion en el contrato, que es lo que hacia que `validateUsageTree` rechazara
una composicion que las bindings resolvian bien. Entrada de changelog en `menu` y en `menubar`, las
dos, porque Menubar comparte `menuItemShape` tal cual.

---

## Nivel 1 - hecho ✅ (2026-09-15): el Tooltip que se volteaba no era de React, era de tiempo

Señal, verificable en un build (`pnpm --filter @skryensya/docs build`, servir `dist`, abrir
`/anchoring`, pasar al binding React y hacer hover en el trigger `block-end`): la caja sale ARRIBA del
trigger con 138px de lugar sin usar abajo. La misma composicion en Vanilla, en el mismo escenario,
sale bien.

Medido el 2026-09-15, en el orden en que se descarto cada cosa:

- No es el placement pedido. Al re-etiquetar ese mismo elemento a `block-start`, se dibuja
  block-end: **queda invertido pida lo que pida**. Sus tres hermanos (`block-start`, `inline-start`,
  `inline-end`) se comportan bien, y un hermano re-etiquetado a `block-end` tambien.
- No es el portal. Mover el positioner de Vanilla al `<body>` ANTES de abrirlo (que es donde React lo
  monta) no lo hace voltear.
- No es el escenario del preview: ni `max-inline-size: 100%` de la hoja del stage, ni
  `position-visibility`, ni `justify-self: anchor-center`, ni el `display: flex` del frame body, ni la
  flecha, ni el `inset`. Se probo cada uno por separado sobre el build.
- No es una evaluacion vieja: forzar relayout no lo corrige, y el estado es estable.
- Es `position-try`. Con `position-try-fallbacks: none` inline, la caja cae en `block-end` (top=214,
  el trigger termina en 206), o sea que el area base es correcta y lo que decide mal es el fallback.

Queda `--sk-anchored-position-try: none` en el demo de `/anchoring` y `/es/anclaje` (es lo correcto
ahi por otra razon: esa pagina tiene que mostrar el placement que nombra, no el fallback), asi que la
pagina ya no miente. De paso salio un bug real del patron, ya arreglado: la flecha tenia
`flip-block`/`flip-inline` escritos a mano mientras la caja leia `--sk-anchored-position-try`, asi que
apagar el volteo movia una sola de las dos y la flecha quedaba colgada del otro lado del trigger.
Ahora las dos leen el mismo hook (`patterns/anchored.css`).

**Lo que faltaba entender, medido el 2026-09-15 sobre el build servido desde `dist`:** el volteo se
decide UNA vez, contra el lugar que habia en ese instante, y no se rehace cuando el lugar vuelve.
Secuencia, reproducida en los DOS bindings: abrir el `block-end` con 161px libres abajo (sale abajo,
bien), encoger el bloque contenedor hasta dejar 3px (se voltea arriba, bien), y devolverle la altura
original con la caja todavia abierta: se queda arriba, con esos 161px otra vez libres debajo, y un
evento `resize` disparado a mano tampoco la reevalua. Eso explica las dos cosas que no cerraban: por
que quedaba "invertido pida lo que pida" (el estado ya estaba elegido) y por que forzar relayout no
lo corregia.

**Y por que parecia de React:** el frame auto-fit de la preview monta a la altura de su contenido y
crece despues. Medido con un rAF por cuadro al cambiar de binding: `0 -> 151px -> 368px` en cuatro
milisegundos. Lo que se evalue en esa ventana queda del lado equivocado. Vanilla no lo pisa porque
renderiza con el documento, no despues: nunca fue el portal ni el binding, era el momento.

Queda escrito donde vive el codigo (`patterns/anchored.css`, sobre `position-try-fallbacks`), con la
salida para un consumidor: no abrir una caja anclada dentro de algo que todavia esta creciendo, o
cerrarla y reabrirla cuando el layout se asiente. Rehacer `position-try` es del motor, no hay
propiedad que lo pida. Lo unico que queda abierto, y es de la app y no del kit, es que la preview de
React reserve su altura final antes de montar en vez de crecer despues.

## Nivel 1 - what the catalogue is missing (inventory taken 2026-09-20)

The catalogue is 84 published families (`artifacts/ai-manifest.json` -> `contracts`, 84 keys, one per
file in `contracts/semantic/`). The WAI-ARIA APG side is closed: `docs/aria-apg-audit.md` is 31 of 31
rows covered and reviewed, so **no gap below comes from the APG**. These come from the other two
sources: machines we already pay for and never shipped, and markup the repo writes by hand because
the kit has nothing to offer. Ascending effort, as this level requires.

- [~] **`@zag-js/pin-input` is a paid-for dependency with zero importers.** IN PROGRESS elsewhere:
  a concurrent session is building `otp-input` over that machine (its contract, sheet, binding and
  canonical tree were in the working tree on 2026-09-20). Do not take this one; verify it is closed
  when that work lands.

  What it was, verifiable in one pass when this was written:
  it is declared in `packages/core/package.json`, and the only file in `packages/` or `apps/` that
  mentions the string is that same `package.json` - it is absent from `core/src/machines.ts`, where
  the other 17 machines are re-exported. Every other Zag dependency has at least one binding behind
  it. Two ways to close it and both are small: build the PIN / OTP field (the machine is already
  installed and `form-field` + `input` already give it its label, hint and error), or drop the line
  from `package.json`. Decide which, do not leave it declared and unused.
- [x] **No publishable Separator** - hecho ✅ (2026-09-20). Published as the `separator` family with
  two signatures: `Separator` (the `<hr>`) and `LabelledSeparator` (the one with a word in the
  middle). The default MEANS something - an `<hr>` is a thematic break with the `separator` role -
  and `decorative` is the opt-out that takes it out of the accessibility tree, which is the half the
  private ones never had. `orientation` writes `data-orientation` and `aria-orientation` from one
  option, so the paint and the announcement cannot drift. The labelled one takes its name from its
  own label through `aria-labelledby`, because `separator` is not a name-from-content role: without
  the wiring a screen reader says "separator", which is the word the visible label replaces. The
  line is a `background`, not a `border`, so the hairline is not half the element and half the
  browser's idea of a groove. 8 React tests, page at `/components/separator`, and the four private
  separators (Toolbar, Sidebar, `menu.css`, `patterns/footer.css`) were LEFT ALONE: each is sized to
  its own anatomy, and replacing them was not the gap.
- [x] **Typography has no Quote and no DescriptionList** - hecho ✅ (2026-09-20), as two families
  rather than as typography signatures: both have anatomy and hooks of their own, which `typography.css`
  does not carry for anything.
  **Quote** (`/components/quote`) puts the caption OUTSIDE the `<blockquote>`, which is HTML's own
  rule and not a layout preference, so the root is a `<figure>`. Its two caption fields are the point:
  `attribution` is who said it and `source` is the work, and only the second is the `<cite>` - a
  person's name in a `<cite>` is the mistake the split makes hard to fall into. The caption is a flex
  row for a measured reason: a bare text run next to a `<cite>` renders one collapsed space in the
  emitted markup that React does not, and that divergence is written in whitespace. 7 React tests.
  **DescriptionList** (`/components/description-list`) wraps each pair in the `<div>` HTML allows
  inside `<dl>`, which is what makes a row addressable by a divider or a two-column layout. `columns`
  is drawn per row rather than on one shared grid, so the name column is a length and not
  `max-content`: a shared grid needs `display: contents` on each pair, which takes that same element
  back out of the box tree. 6 React tests.
- [ ] **No search field.** Deferred by the user on 2026-09-20, deliberately last of this group:
  take it after the four above, which are done.
  `input`'s `type` is a free string, so `type="search"` renders, but the
  *pattern* - the leading icon, the clear button, the submit affordance, the suggestion list wiring -
  has no contract. `combobox` is not it: an autocomplete that must resolve to one of its options is a
  different control from a search box whose value is whatever was typed. This one has an external
  vote: the team's production kit (`~/dev/sgd/kitdigital-gob-cl`) ships `searchbar` as its own
  component with its own token map, and this POC has no answer for it.
- [x] **No tags input** - hecho ✅ (2026-09-20). Published as `tags-input`, over
  `@zag-js/tags-input` (installed for it; the estimate that it was the largest of the five held).
  Both bindings, 11 tests each, mirrored assertion for assertion. Three things worth keeping:
  **the chip IS a Tag** (`sk-tag` classes composed through the contract's `compose`, and the delete
  control is the same `Button` Tag uses), so the field did not add a second chip drawing to the
  system; **the tags are authored as markup**, one element each, so the field reads before its
  JavaScript arrives, and the enhancer takes that list as its seed and swaps it whole for the live
  one - the same exception FileUpload already carries, because the list is the VALUE and not
  structure a person wrote; and **two behaviours are the machine's, not ours**, both now written
  down in the contract and on the page: past `max` a tag is refused IN SILENCE with the text left in
  the entry, and with `allowDuplicates` off a repeat is dropped without a word. The first draft of
  the contract published a `valueInvalid` event for both of those. Measured against the machine, it
  could not fire for either: `onValueInvalid` is Zag's channel for a `validate` predicate this kit
  does not expose, so the event was deleted rather than shipped as a channel nothing dispatches.
  Marked `Beta` in the catalogue, which is the honest label for a machine-backed family on its first
  day.

### And a decision, not a component: three primitives the catalogue cannot see

`hotkey`, `splitter` and `anchored` each have code in all three layers and their own docs page
(`/hotkey`, `/splitter`, `/anchoring`), and none of the three is one of the 84 families: no
`contracts/semantic/*.yaml`, no changelog, so `get_catalog` / `get_contract` / `validate_ui` cannot
reach them. An agent composing through the MCP cannot discover that this system has a keyboard-shortcut
primitive at all.

That may well be correct - they are behaviours, not markup, and `splitter.ts`'s own banner comment
describes the three-way split as the shape a *primitive* takes here. The gap is that nothing records
the decision. `copy-button` is the precedent for doing it right: its docstring says *"No contract
lives here any more (decision 33, reversed)"*, so a future reader stops re-litigating it. The item is
to write the same sentence into `hotkey.ts`, `splitter.ts` and `anchored.ts` - or, if the answer is
the other one, to publish the three contracts. Not to leave it unsaid.

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
- [ ] **Pipeline de consumo por IA (F6/F7)** - `docs/ai-ui-platform.md`, secciones "F6 · El sitio
  y las pantallas" y "F7 · Evals", ambas "en curso" a la fecha de ese documento (2026-08-24). **Ese
  documento es la fuente de verdad de este ítem, no este archivo**: verificado el 2026-09-03 que su
  propia lista de "familias sin publicar" ya está desactualizada (`calendar`, `combobox`,
  `popover`, `select`, `dialog`, `vaul`, `toc`, `tooltip` ya están publicadas; el manifest pasó de
  69 a 74 familias). Antes de tocar algo de F6/F7, releer ese documento entero, no asumir que la
  lista de bloqueados sigue vigente.
- [ ] **English migration** ([ADR-0021](decisions/0021-english-is-the-repository-language-and-spanish-is-a-product-locale.md)
  is the rule; this is the remaining work). Done as of 2026-09-08: code comments (1,687 lines across
  246 files), the templated headers of all 79 changelog and 78 semantic files, and
  `package.json`'s `pnpm.comment-overrides`. Items below are written in English because ADR-0021 now
  requires it, which is why this file reads mixed until its own row is taken.
  - [ ] `contracts/semantic/*.yaml` `useWhen`/`avoidWhen` (81 files). **Take this first.** It is the
    only Spanish with no counterpart at all
    (zero `en:` keys, against 14 in `contracts/changelog/button.yaml`), and it is not inert: it reaches
    agents through `get_catalog`/`get_contract` and renders on component pages, which now sit on the
    English base routes. Translate the prose only; `id`, signature names and option keys are
    identifiers and do not move. Do not machine-translate: these sentences are why one signature is
    chosen over its neighbour.
  - [ ] Spanish prose docs (~2,846 lines, 8 files): `docs/aria-apg-audit.md`,
    `docs/ai-ui-platform.md`, `TELEMETRY_PLAN.md`, `docs/writing-guide.md`, `docs/pending-tasks.md`
    (this file), `docs/prune-tokens.md`, `contracts/README.md`, `packages/mcp/README.md`.
    `docs/writing-guide.md` needs correcting as well as translating: its "Qué idioma en qué lugar"
    table still says component pages and decision records are Spanish and that comments may be either.
  - [ ] `evals/cases/*.ts` prompt fixtures (~692 lines, 12 files). **Decide before translating**: the
    run transcripts come in `.es.md`/`.en.md` pairs, so Spanish prompts may be deliberate coverage of a
    Spanish-speaking user rather than an oversight. If they are coverage, say so in a comment in the
    file and close this item; the gap is that nothing currently records which it is.
  - [ ] Do **not** translate `apps/docs/src/pages/es/**`, `apps/docs/src/i18n/messages/**`,
    `apps/docs/src/lib/component-catalog.ts` or the `es:` halves of `contracts/changelog/*.yaml`
    (~9,400 lines). That is the Spanish product, not a backlog. Listed here so the next person who
    greps for Spanish does not "finish the job" by deleting the Spanish site.
