# Plan: documentación versionada

Versionar la documentación sin perder historial, sin crear una versión por cada edición y sin
reescribir páginas que no cambian. Este plan asume la estructura **actual** de `apps/docs` (Astro
estático, EN en rutas bare y ES bajo `/es/`, demos + shards i18n, contratos vía `ai-manifest`). No
reorganiza el monorepo.

Relacionado: ADR-0006 (el sitio consume el package por el path que enseña), ADR-0013 (el contrato
vive en core), ADR-0014 (usage tree), ADR-0021 (inglés es el idioma del repositorio),
`contracts/changelog/releases.yaml` (historia de **API**, que no es la historia de **docs**).

---

## 0. Veredicto: qué cambia respecto del borrador anterior

El borrador proponía un **store de entries con herencia hacia atrás**: contenido por `document id`,
un entry solo cuando cambia, y un resolver que camina `V, V-1, V-2...` hasta encontrar contenido.
El modelo es correcto en abstracto y es el que usan las herramientas de contenido. En **este** sitio
resuelve un problema que no tenemos y crea tres que sí tendríamos.

Cambios estructurales que propone esta versión del plan:

| # | Cambio | Motivo corto |
| --- | --- | --- |
| 1 | **Congelar = build inmutable archivado, no store de entries.** La herencia la hace git, no un resolver. | Las páginas no son prosa: son código que compone demos, artefactos y contratos. Ver §3. |
| 2 | **La unidad versionada es la superficie (tab), no la página.** | De 7 superficies de una página de componente, solo 2 son prosa; 5 son derivadas de artefactos. Ver §2. |
| 3 | **Cero archivos de estado nuevos.** Ni ledger de docs, ni registro de ids. Todo se deriva de tags, del archive y del deploy. | El borrador creaba dos tablas escritas a mano para contestar cosas que el repositorio ya sabe. Ver §0.1 y §5. |
| 4 | **`document id` ya existe: `canonicalPath()`.** Lo que falta no es el mapa, es la **estabilidad** frente a renombres. | `src/i18n/index.ts` ya normaliza cualquier ruta a su forma canónica en inglés. Ver §4. |
| 5 | **Gate de activación explícito.** Nada de esto se construye hasta que se cumplan tres condiciones medibles. | Hoy `releases: []`: cero versiones publicadas, cero consumidores anclados. Ver §9. |
| 6 | **SEO, prefetch, search y gates entran al plan como superficies de primera clase.** | Duplicar ~190 rutas por versión y por locale rompe cosas que hoy funcionan por accidente. Ver §7 y §8. |
| 7 | **La versión no vive en el router de la docs viva.** Latest = URLs bare. Los archives se montan en el host/CDN bajo `/v<version>/`, no como páginas duplicadas en `src/pages/`. | Es cómo lo hacen Docusaurus, Next.js y la mayoría de docs de frameworks. Ver §3.3 y §7.1. |

Lo que **sobrevive** del borrador: el vocabulario, el corte a mano alineado a major, la idea de
tombstone (que aquí es un redirect), el switcher, la regla "locale y versión son ejes
independientes", y la recomendación final de no prometer demos históricos antes de tiempo.

Lo que **este plan rechaza explícitamente** (y que un prototipo de 2026-09-13 exploró): copiar el
árbol de rutas bajo `apps/docs/src/pages/v0.0.1-dev/**` y enseñar dos filas `v0.0.1-dev` en el
switcher. Esa forma mete la versión en el router de la app live, duplica ~190 rutas en source y
confunde "current" con "archive" cuando aún no hay un corte real distinto.

### 0.1 Principio rector: nada de estado nuevo por si acaso

Versionar documentación invita a inventar tablas: un registro de ids, un ledger de versiones, un
mapa de equivalencias, un índice de archives. Cada una es una base de datos escrita a mano, y una
base de datos escrita a mano solo tiene dos estados: al día, o mintiendo. Este repositorio ya tomó
partido en esto. `hasTranslation()` no consulta una lista de páginas traducidas: hace glob sobre
`src/pages/**` y su propio comentario dice por qué, "lo que significa que la respuesta no puede
quedar obsoleta". `releases.yaml` no pone un campo `version:` en cada entrada de changelog por la
misma razón: "no hay nada que olvidar, porque no hay nada que repetir".

De ahí tres reglas que gobiernan el resto del plan:

1. **Derivar antes que registrar.** Si el dato se puede leer del sistema de archivos, de los tags de
   git o de un artefacto ya construido, se lee. No se copia a un archivo nuevo.
2. **El archivo nace del evento, no de la previsión.** Ningún archivo de estado se crea vacío
   esperando su primer uso. El primer corte crea lo que el primer corte necesita; el primer
   renombre crea lo que el primer renombre necesita. Un archivo vacío es una invitación a
   mantenerlo.
3. **Registrar solo lo que no es derivable, y que sea un bit.** Queda exactamente uno en todo el
   plan: si una versión está `deprecated`. Es una decisión editorial, no un hecho del repositorio,
   y por eso no se puede derivar de nada.

El snapshot (§3) es lo que hace esto posible: **el archive construido es el registro**. La lista de
documentos que existían en v1 está dentro de v1; no hace falta una tabla que lo afirme aparte.

---

## 1. Vocabulario

- **Docs version**: el número del release del que se cortó, escrito **igual** que en
  `contracts/changelog/releases.yaml` (`0.0.1-dev`, luego `0.0.1`, `0.2.0`, ...). No es una
  numeración propia, y por eso no existe la pregunta "¿qué docs version corresponde al release
  1.2?": es la misma cadena, y es también el nombre del directorio en la URL **del archive**.
  En el chrome, el switcher y el header muestran solo el **major** (`v0`); el tip completo vive
  en el footer y como subtítulo de cada fila del selector.- **Current / latest**: la versión editable. Es el árbol de trabajo tal como existe hoy, servido en
  las URLs **bare** de siempre (`/components/button`). No lleva prefijo de versión en el path.
- **Frozen version**: corte ya publicado. Inmutable salvo hotfix explícito con runbook (§10.2).
  Se sirve bajo `/v<version>/…` en el deploy, no como rutas Astro en el source de `current`.
- **Document id**: identidad estable de una página, independiente del locale y de la versión.
- **Surface**: cada panel versionable de una página (`usage`, `install`, `contract`, `style`, `a11y`,
  `tests`, `changes`). Es la unidad real de política, ver §2.
- **Cut**: la operación que convierte `current` en una frozen version y abre la siguiente.
- **Archive**: el output construido de una frozen version, almacenado como artefacto de release y
  montado en el host bajo `/v<version>/`.

---

## 2. El encuadre que faltaba: la unidad no es la página

`ComponentPageShell.astro` genera **siete** superficies sobre un `<h1>`, y solo dos las escribe una
persona:

| Superficie | Origen hoy | ¿Es prosa? | Si se congela sin pin |
| --- | --- | --- | --- |
| `usage` | slot de la página + claves i18n | Sí | Coherente |
| `install` | slot de la página + claves i18n | Sí | Coherente |
| `contract` (Referencia) | `artifacts/ai-manifest.json` (1.1 MB) vía `contract-reference.ts` | No | **Miente**: enseña la API de hoy bajo una URL de ayer |
| `style` | contrato + `styleGroups` | No | Miente |
| `a11y` | contrato | No | Miente |
| `tests` | `artifacts/test-results.json` (82 kB), keyed por título verbatim de `it()` | No | **Se rompe**: los títulos de hoy no existen en el árbol de ayer |
| `changes` | `contracts/changelog/*.yaml` + `releases.yaml` | No | Coherente por construcción (el changelog ya es histórico) |

Consecuencia directa: un modelo que versiona "la página" tiene que contestar siete preguntas
distintas y hoy contesta una. Un modelo que versiona "la prosa" congela 2 de 7 superficies y deja
las otras 5 mintiendo con cara de verdad, que es exactamente el fallo que este repositorio evita en
todas partes (ADR-0015: la evidencia se renderiza en ambos bindings, no se afirma).

Por eso la política se declara **por superficie** (§6), en código y no en prosa.

---

## 3. Modelo propuesto: congelar es construir, no copiar contenido

### 3.1 La decisión

> **Una frozen version es el output construido del árbol en el momento del corte, archivado y
> servido bajo `/v<version>/` en el deploy. `current` sigue siendo exactamente lo que es hoy, en
> URLs bare. La herencia entre versiones la provee git, no un resolver en runtime. La versión no
> existe como árbol de rutas en el source de la docs viva.**

Operativamente: cortar `0.0.1` es un tag (`docs-v0.0.1`), un build, un pase de rebase de URLs sobre
`dist`, y el archivo del output montado en el CDN en `/v0.0.1/`.
`https://ui…/v0.0.1/components/button` es HTML tal como se veía ese día. `https://ui…/components/button`
sigue siendo latest. El source de `apps/docs` no gana un directorio `pages/v0.0.1/`.

### 3.2 Por qué, contra el store de entries

Lo que se midió en este repositorio:

| Hecho medido | Cómo | Implicación |
| --- | --- | --- |
| 95 `*Page.astro`, 84 módulos de demos, ~7.9k entradas de mensaje en 112 shards i18n | conteo en `apps/docs/src` | La "prosa" no es un campo: está entretejida con `tree={buttonMatrixTree(t)}`, strings de código y títulos de tests dentro del mismo archivo. |
| `ButtonPage.astro`: 149 líneas, de las cuales la prosa son ~20 llamadas `t(...)` intercaladas entre 11 `<ComponentPreview>` y 3 `<CodeBlock>` | lectura directa | Extraer "solo la prosa" a un store deja fuera la **estructura** (qué h3 existe, qué demo va debajo), que es lo que de verdad cambia entre majors. |
| El dist actual pesa 140 MB, de los cuales 111 MB son HTML en 149 páginas; mediana 466 kB por página, máxima 5.7 MB (`comment-thread`) | `du`, `find -printf` sobre `apps/docs/dist` | Duplicar el árbol cuesta ~110 MB por versión. Es caro, pero es **almacenamiento de CDN**, no complejidad de código. |
| `_astro` (JS/CSS compartido) son solo 4.5 MB de esos 140 | `du -sh _astro` | El peso está en el HTML inline de los srcdoc, no en assets: deduplicar assets entre versiones apenas ayuda. Asumir el coste o no versionar. |
| Los previews son iframes `srcdoc` que copian el `<head>` de **su** página | `component-preview-frame.ts`, comentario en `ButtonPage.astro` | En el modelo snapshot esto sale gratis y correcto. En el modelo store habría que resolver, por versión, qué CSS copia cada frame: es el punto donde el store se vuelve insostenible. |

El store de entries paga complejidad permanente (resolver, tombstones, `since`, matriz
versión x locale, tests de herencia) para ahorrar espacio en disco. El snapshot paga disco para
ahorrar complejidad. En un sitio de 190 rutas con demos ejecutables, el disco es el recurso barato.

### 3.3 La versión no vive en el router de `current`

Las docs serias (Docusaurus, Next.js, Vue, la mayoría de design systems) hacen lo mismo:

| | Latest | Archive histórico |
| --- | --- | --- |
| URL | bare (`/docs/...`, `/components/...`) | prefijo (`/docs/14/...`, `/v1/...`) o a veces nada |
| Source | el árbol editable | un **build** montado en el host, no un segundo árbol en el repo |

Consecuencia para este plan:

1. **`apps/docs/src/pages/` no contiene `v*/`.** Ningún stub, ninguna página hand-frozen bajo un
   prefijo. El source es solo `current`.
2. **`/v<version>/` aparece en el CDN** cuando un cut publica un archive y el deploy lo monta.
   Hasta entonces el switcher muestra **una** versión (la de `releases.yaml` / `working`) y apunta
   a las URLs bare.
3. **No hay dos filas `v0.0.1-dev`.** Si working y el único archive se llamarían igual, no hay
   archive que listar: latest **es** esa versión.
4. Un prototipo que duplicó rutas bajo `pages/v0.0.1-dev/**` queda **fuera del plan**; se retira del
   source en la misma limpieza que alinea el código con este documento.

### 3.4 Lo que el snapshot compra gratis

- Fidelidad histórica **completa**: las 7 superficies son verdaderas entre sí, no solo la prosa.
- Cero cambios al modelo de escritura. Nadie aprende un formato nuevo.
- Cero resolver, cero tombstone en runtime, cero matriz versión x locale en código.
- Cero contaminación del router de `current` con prefijos de versión.
- La pregunta "¿qué decían las docs el día del release 1.0?" se contesta con un artefacto, no con
  una reconstrucción.

### 3.5 Lo que el snapshot cuesta, y su mitigación

| Coste | Mitigación |
| --- | --- |
| ~110 MB por versión frozen | Archivar como artefacto de release (no commitear al repo). Política de retención: §5.3. |
| El chrome queda viejo (sidebar, search, switcher de la era del corte) | Aceptado y señalizado: banner permanente inyectado en el cut (§8.1). Es lo mismo que hacen los sitios de versiones serios. |
| El tag viejo podría no construir en 2028 (toolchain rot) | **El archivo es la fuente, no el tag.** Se construye una vez, en el corte, y se guarda el output. El tag queda como respaldo para hotfix. |
| El switcher de v1 no conoce v3 | El switcher de una frozen version es estático y solo apunta a `latest` ("ver la versión actual de esta página"). La lista completa de versiones vive solo en `current`. |
| `/v<version>/...` puede quedar con enlaces a rutas que ya no existen en latest | El enlace del banner se resuelve contra el mapa forward de ids (§4.3), y cae a la home de latest si el id fue retirado. |

---

## 4. Identidad de documento

### 4.1 Ya existe

`src/i18n/index.ts` expone `canonicalPath(pathname)`, que normaliza cualquier ruta de cualquier
locale a su forma canónica en inglés (`/es/componentes/button` a `/components/button`). Eso **es**
el document id. La Fase 0 del borrador ("definir el mapa de document id") no es trabajo nuevo: es
adoptar lo que hay y añadirle lo que le falta.

### 4.2 Lo que le falta: estabilidad frente a renombres

`canonicalPath` deriva el id **de la ruta**. Si en v2 se renombra `/components/tile` a
`/components/card-tile`, el id cambia y v1 queda huérfana en silencio: el banner de v1 apuntará a un
404 y el switcher no encontrará la contraparte. Esto no es hipotético en un sistema de diseño, donde
renombrar un componente es un evento normal de major.

La tentación aquí es un registro `path -> docId estable` con `aliases`, mantenido a mano. Es
justamente la tabla que el principio 0.1 prohíbe: 190 filas que hay que recordar actualizar, para
cubrir un evento que ocurre dos o tres veces por major.

Mitigación sin tabla:

1. **El id se sigue derivando.** `canonicalPath()` sobre el glob de `src/pages/**` da el conjunto
   vigente, igual que `pagesByCanonical` ya hace para los locales. Cero archivos nuevos.
2. **El conjunto histórico se deriva del archive.** Qué documentos existían en v1 lo dice v1: el
   archive tiene sus rutas. No hace falta declararlo por adelantado.
3. **El renombre escribe una línea, el día que ocurre.** Un renombre ya obliga hoy a un redirect
   301 de la ruta vieja a la nueva, exista o no el versionado. Ese redirect **es** el alias: el
   mapa forward (§4.3) lo lee en el corte y ya sabe dónde mandar al lector de v1. Un solo lugar,
   que además se necesita igualmente.
4. **El tombstone también nace del evento.** Retirar un documento en un major se declara en ese
   mismo mapa de redirects, con destino explícito (el reemplazo) o sin destino (retirado sin
   sucesor, el banner cae a la home de latest).

El único test que este modelo necesita: cruzar las rutas del archive de la última frozen version
contra las rutas vigentes más los redirects, y fallar si alguna queda sin destino. No corre hasta
que existe una frozen version, porque antes no hay nada que cruzar.

### 4.3 Mapa forward

El único mapa que el sistema necesita en runtime es **hacia adelante**: `docId de una frozen version
-> URL en latest`. Se calcula en el corte y se hornea en el snapshot. No hay búsqueda hacia atrás,
no hay cadena `V-1, V-2`.

---

## 5. Cero ledgers nuevos

### 5.1 El problema del borrador

`contracts/changelog/releases.yaml` ya existe y ya contesta "qué versiones hay", con una regla
explícita: cada entrada pertenece al release más antiguo cuya fecha la alcanza, `working` es la que
se está escribiendo, y **cortar una versión es una línea en ese archivo**. Hoy dice
`working: "0.0.1"` y `releases: []`.

Añadir `apps/docs/versions.yaml` con numeración propia crea dos respuestas a la misma pregunta y una
tercera pregunta nueva ("¿qué docs version corresponde al release 1.2?"). Es la clase de duplicación
que este repositorio ya evitó a propósito en el ledger de contratos.

La versión anterior de este plan resolvía eso con un segundo archivo, `docs-versions.yaml`, que
referenciaba a `releases.yaml` por clave foránea. Menos malo que dos numeradores, pero sigue siendo
una tabla nueva que nace vacía y que hay que mantener sincronizada con la realidad del deploy. El
principio 0.1 la elimina.

### 5.2 Cada campo, y de dónde sale sin escribirlo

| Dato | Cómo se obtiene | Archivo nuevo |
| --- | --- | --- |
| Qué versiones frozen existen | `git tag --list 'docs-v*'` | No |
| Su número | El propio nombre del tag, que es también el segmento de la URL (`docs-v0.0.1` -> `/v0.0.1/`) | No |
| Qué release le corresponde | **Es** el release: el archive se llama como él, así que no hay correspondencia que declarar | No |
| Fecha del corte | La fecha del tag | No |
| Dónde vive el archive | Convención: el artefacto adjunto a ese release | No |
| Qué `ai-manifest` describía esa versión | Ya está horneado dentro del snapshot (`sourceHash`) | No |
| Qué documentos tenía | Están en el archive, son sus rutas | No |
| Qué versiones se sirven | Lo que el deploy tiene montado bajo `/v0.0.1/`, `/v0.2.0/`, ... | No |
| **Si una versión está `deprecated`** | **No es derivable: es una decisión editorial** | El único bit |

Ese bit vive donde se usa y en ninguna parte más: una constante en el módulo que pinta el banner y
el switcher, con la forma `const DEPRECATED = { "1": { since: "2027-02-01" } }`. Nace vacía el día
que se deprecia la primera versión, no antes. Si un día son muchas versiones y el objeto se vuelve
incómodo, ese es el momento de darle un archivo, no ahora.

Reglas que quedan:

- Editar prosa cambia el árbol de `current`. No toca nada más.
- Cortar una versión es **un tag** y **una línea en `releases.yaml`** (la que ese ledger ya pedía).
- El build de `current` lee los tags para pintar el switcher. En CI esto exige `fetch-depth: 0`
  o `git fetch --tags`; es la única fricción que paga este diseño, y es una línea de workflow.

### 5.3 Retención

Sin política de retención, esto crece 110 MB por major para siempre. La política no necesita un
archivo: `eol` es, literalmente, "el deploy ya no lo monta y hay un 301 en su lugar". El estado de
una versión es el estado del deploy, no una fila que lo describe.

| `status` | Se sirve | Se indexa | Retención del archive |
| --- | --- | --- | --- |
| `supported` | Sí | No (§7.2) | Indefinida |
| `deprecated` | Sí, con banner de advertencia | No | Indefinida |
| `eol` | No: `/v<version>/*` redirige 301 a latest | No | El artefacto se conserva en el release de GitHub, no en el CDN |

Regla simple para empezar: se sirven las **dos** últimas majors frozen. El resto pasa a `eol`.

---

## 6. Política por superficie

Esto reemplaza la "Decisión pendiente" del borrador. No es una decisión global: es un campo por
superficie, declarado en `apps/docs/src/lib/version-policy.ts` y verificado por test.

| Superficie | En `current` | En frozen (modelo snapshot) | Nota |
| --- | --- | --- | --- |
| `usage` / `install` | Árbol vivo | Horneado en el snapshot | Nada que hacer. |
| Demos (`ComponentPreview`, islas React, srcdoc) | Workspace vivo | Horneados, con el CSS y el JS de su era | Es la ventaja central del modelo: los demos frozen son honestos sin trabajo extra. |
| `contract` (Referencia) | `ai-manifest` vivo | Horneado del manifest de su era, con su `sourceHash` dentro del propio snapshot | Auditable sin ledger: el hash viaja con la página que describe. |
| `style`, `a11y` | Contrato vivo | Horneados | Igual. |
| `tests` | `test-results.json` vivo | Horneado | Un resultado de test es una afirmación con fecha; congelarlo con fecha visible es correcto, mostrarlo como "estado actual" no. **Añadir la fecha del corte al panel** en el snapshot. |
| `changes` | changelog vivo | Horneado, **truncado en el release de esa versión** | Un lector en v1 no debería ver entradas de 2.0 que no puede usar. El truncado se hace en el cut, no en runtime. |
| Search (`/search-index.json`) | Índice de `current` | Índice **propio** de esa versión, apuntando a `/v<version>/...` | Ver §7.3. Sin esto el ⌘K teletransporta al lector fuera de su versión sin avisar. |
| Catálogo MCP / `ai-index.json` | Vivo | **No se versiona** (no-objetivo declarado) | Ver §11.1: es la incoherencia conocida y aceptada del MVP. |
| `/f/[...path]` (fullscreen preview) | Vivo | Horneado dentro del snapshot | Verificar en el cut que las rutas fullscreen quedan dentro de `base`. |

---

## 7. URLs, SEO e i18n

El borrador trata las URLs como un detalle de UX. Con ~190 rutas por locale, duplicarlas por versión
es un problema de SEO de primer orden antes que de UX.

### 7.1 Forma de las URLs

- **`current` / latest: las URLs de hoy, sin prefijo.** `/components/button`, `/es/componentes/button`.
  **No cambia nada para nadie.** La versión actual **no** se escribe en el path del router de
  `apps/docs`.
- **Frozen: solo en el deploy**, bajo `/v<version>/…`, montando el archive del cut.
  - Ejemplo: `/v0.0.1/components/button` y `/v0.0.1/es/componentes/button`.
  - Decisión: **la versión va antes del locale**. Un archive es un build completo rebaseado a
    `/v0.0.1`, y meter el locale por delante (`/es/v0.0.1/...`) obligaría a dos bases por versión o
    a reescribir rutas en el CDN. `/v0.0.1/es/...` cae solo del rebase.
  - **Un solo segmento, `v0.0.1`, no `v/0.0.1`.** El prefijo es el nombre de un archive, no una
    colección con miembros.
  - **No hay rutas `pages/v*/` en el source.** El prefijo no se declara en Astro; lo declara el
    deploy al montar el tarball.
- `/vlatest/...` o `/v/latest/...` **no existe**. Un alias que se mueve es un enlace que miente con
  el tiempo.
- Mientras `releases: []` y no hay archive montado, el sitio tiene **una** versión visible (la de
  `working`) y el switcher no ofrece un segundo destino con el mismo número.

### 7.2 Reglas de indexación (obligatorias, no opcionales)

Sin esto se publican ~380 páginas duplicadas por versión y se canibaliza el ranking de latest.

1. `<link rel="canonical">` de toda página frozen apunta a su equivalente en latest (mapa forward
   §4.3). Si el documento fue retirado, canonical al propio `/v<version>/...` y `noindex`.
2. `<meta name="robots" content="noindex, follow">` en todo `/v<version>/`. `follow` para no cortar el flujo
   de enlaces internos.
3. `sitemap.xml` incluye **solo** latest.
4. `robots.txt` no bloquea `/v<version>/` ni sus hermanos: bloquearlo impediría a los crawlers ver el `canonical` y el
   `noindex`, que es justo lo que se les quiere comunicar.
5. Los `hreflang` alternates de `Base.astro` (hoy absolutos contra `site: https://ui.skryensya.dev`)
   deben quedarse **dentro de la misma versión**. Un `hreflang` de `/v0.0.1/components/button` a
   `/es/componentes/button` mezcla eras y es un error difícil de ver.

### 7.3 Search

`buildSearchIndex()` deriva de `navigation.ts`, así que el índice horneado en un snapshot describe
el catálogo de su era: correcto por construcción. Falta solo que los `href` lleven el `base`, lo
cual Astro no hace automáticamente porque son strings construidos a mano en `navigation.ts` y
`localizePath`. **Riesgo concreto de Fase 2**: el ⌘K de `/v0.0.1/` navegando a URLs de latest.
Mitigación: un helper `versionedPath()` en el punto donde hoy se llama `localizePath`, y un gate que
falle si algún `href` del índice de un snapshot no empieza por su base.

### 7.4 Prefetch

`astro.config.ts` activa `prefetch: { prefetchAll: true, defaultStrategy: "hover" }` en producción.
Sobre un sitio cuya mediana de página es 466 kB, un snapshot frozen con prefetch activo hace que
pasar el cursor por la sidebar descargue megabytes de documentación histórica. **En el cut se
desactiva el prefetch del snapshot** (o se baja a `viewport: false` / `tap`). Es una línea, y no
hacerla es una factura de CDN.

### 7.5 404 y locale

Se mantiene la política actual: `hasTranslation()` decide, y un locale ausente es 404. La versión no
rellena traducciones que no existen. En el snapshot esto ya es así porque el build es el mismo.

Nota de mantenimiento detectada al revisar: el comentario del bloque `i18n` en `astro.config.ts`
dice que el español es el default y que el inglés vive en `src/pages/en/**`. El código dice
`defaultLocale: "en"` y los archivos están en `src/pages/es/**`. El comentario está obsoleto y
conviene corregirlo antes de que alguien planifique la matriz versión x locale leyéndolo.

---

## 8. El chrome de una versión congelada

### 8.1 Banner de versión

Inyectado en el cut, presente en **todas** las páginas del snapshot, no descartable:

- `supported`: "Estás viendo la documentación de la versión 1.x. [Ver esta página en la versión
  actual]".
- `deprecated`: mismo texto con tono de advertencia y la fecha de EOL.

El enlace se resuelve con el mapa forward (§4.3). Si el `docId` tiene tombstone, el enlace va al
documento indicado por `supersededBy`, y si no hay ninguno, a la home de latest.

### 8.2 Switcher

- En latest: lista **majors** (no cada minor). Cada fila muestra el major (`v0`) y, debajo, el
  **último tip** de ese major (`0.0.1-dev`, luego `0.2.0`, …). El trigger del header muestra solo el
  major actual. El tip completo sigue en el footer.
- La docs se corta por major: un minor/patch no abre fila nueva en el switcher.
- Destinos: el major actual → URLs bare. Majors anteriores → archive montado en el CDN cuando
  exista; si no hay mount, la fila queda deshabilitada.
- **No listar dos veces el mismo major.** Un solo tip por major (el más nuevo del ledger).
- En frozen: **no es una lista**. Es un solo enlace a latest. Un switcher completo en un snapshot
  quedaría congelado y desactualizado el día que se corte la siguiente versión.

### 8.3 Deep links y anclas

Los `id` de heading los genera `document-index.ts` en build. Renombrar un h3 en `current` rompe los
enlaces profundos que alguien haya compartido. Las URLs versionadas **no** resuelven esto para
latest; solo garantizan que el ancla viejo siga vivo en `/v<version>/`. Vale la pena decirlo en el plan
para no vender una promesa que el modelo no cumple.

---

## 9. Gate de activación: cuándo se construye esto

Hoy `releases: []`. Cero versiones publicadas, cero consumidores anclados a una versión vieja, un
solo autor. Construir ahora el cut, el switcher, el archive y las reglas de SEO significa mantener
maquinaria que aún no tiene lector, y estrenarla en frío el día que de verdad importe.

**Las Fases 2 en adelante no empiezan hasta que se cumplan las tres:**

1. Existe al menos un release en `contracts/changelog/releases.yaml` (el primer corte real).
2. Hay un **segundo** major en vuelo con un cambio incompatible ya escrito en algún changelog.
3. Existe un consumidor identificable anclado al major anterior (un repo, un equipo, o el propio
   `kitdigital` consumiendo una versión fija).

Hasta entonces se hace **solo la Fase 0 y la Fase 1**, que son baratas y que además valen por sí
mismas aunque el versionado nunca se construya.

---

## 10. Runbook

### 10.1 Cortar una versión (`pnpm docs:cut`)

El script no corre en CI por defecto. Pasos, en orden, cada uno con su verificación:

| # | Paso | Verificación |
| --- | --- | --- |
| 1 | `pnpm check` verde y árbol limpio | El script aborta si `git status` no está limpio |
| 2 | Regenerar artefactos derivados (`build-test-report`, `preview-heights`, `ai-manifest`) | Diff vacío tras regenerar, es decir, los artefactos commiteados están al día |
| 3 | Truncar `changes` al release que se corta | Test: ninguna entrada del snapshot tiene fecha posterior al release |
| 4 | Inyectar banner, desactivar prefetch, fijar el switcher a enlace único | Gate de snapshot (§12) |
| 5 | `astro build` normal, y después un pase de *rebase* sobre `dist` que prefija las URLs root-relative con `/v<version>` (atributos, URLs escapadas en props de islas, y el `src` del search index; ver Fase 1) | El build termina y produce ~190 rutas, no menos; el pase reporta cuántas URLs tocó |
| 6 | Verificar el snapshot: cero URLs root-relative sin prefijar en todo el archive, canonical y `noindex` presentes en todas las páginas | Script de verificación, es el gate principal, y es la contraparte del paso 5: uno reescribe, el otro no confía |
| 7 | Empaquetar y publicar el archive (`site.tar.zst`) como artefacto de release | El checksum lo emite y lo guarda la propia release de GitHub |
| 8 | Tag `docs-vN` y la línea en `releases.yaml` | El script aborta si el número del tag no existe como release |
| 9 | Desplegar: el CDN monta el archive en `/v<version>/` | Smoke test de 5 URLs, incluida una ES y una fullscreen `/f/` |

El paso 6 es el que evita el fallo clásico: un snapshot que se ve bien en el índice y está roto tres
clicks adentro.

### 10.2 Hotfix a una versión frozen

Excepción, no default. Solo para: un error factual peligroso (seguridad, pérdida de datos), un
enlace roto masivo, o un problema legal.

1. Issue que justifique el hotfix, con la categoría de arriba.
2. `git checkout docs-v0.0.1`, arreglar, commit en una rama `docs-v0.0.1-hotfix`.
3. Rebuild con `base: /v0.0.1` y reemplazo del archive. El tag original no se mueve: el hotfix es su
   propio tag (`docs-v0.0.1-patch1`), que es a la vez el registro de que ocurrió y su fecha.
4. Nota visible en la página corregida indicando que ese contenido se corrigió después del corte.

Si el tag ya no construye (toolchain rot), la alternativa aceptada es editar el HTML del archive
para ese caso puntual, publicándolo como un archive nuevo bajo su propio tag de parche. Feo,
honesto y acotado.

---

## 11. No-objetivos, explícitos

1. Versionar automáticamente cada commit.
2. Igualar la docs version al `version` de cada package npm.
3. Reescribir el modelo i18n o la política de 404 por locale ausente.
4. Demos de una versión frozen ejecutándose contra el workspace de hoy. Se prohíbe, no se pospone:
   es lo que rompe "verified by construction".

### 11.1 El agujero conocido: el MCP y el catálogo para agentes

`artifacts/ai-index.json`, `ai-manifest.json` y el servidor MCP publican **una** versión del
catálogo: la actual. Un lector humano en `/v0.0.1/` y un agente consultando el MCP en la misma sesión
recibirán respuestas de eras distintas, y el agente no tiene forma de saberlo.

En un repositorio cuya tesis es que el catálogo cabe en el contexto (ADR-0016) y que el usage tree
es la moneda única (ADR-0014), esto no es un detalle menor: es la siguiente pieza del problema.

Decisión para el MVP: **queda fuera, y se declara**. La mitigación mínima es que `ai-manifest.json`
gane un campo `docsVersion` y que el MCP lo devuelva en su respuesta, para que un agente pueda al
menos detectar el desajuste. Lo demás (un MCP que sirva catálogos por versión) se estudia cuando
exista el transporte HTTP, no antes.

---

## 12. Fases

### Fase 0: identidad, barata y útil por sí sola

Sin archivos nuevos y, siendo estrictos con el principio 0.1, **sin código nuevo**. Un mapa de
redirects creado vacío hoy sería exactamente el archivo que nace de la previsión y no del evento.

Lo único que se hace ahora es dejar escrita la regla, para que el primer renombre la cumpla:

- [x] Regla en CONTRIBUTING (sección "Renaming or retiring a page"): renombrar o retirar una ruta exige una entrada en `redirects` de
      `astro.config.ts` (Astro ya lo soporta nativo, no hay nada que construir). Ese redirect es a
      la vez la respuesta HTTP que el renombre ya exigía y el alias que el corte leerá después.
- [ ] El test que cruza rutas del archive contra rutas vigentes más redirects nace con el primer
      corte, no antes: hasta que exista una frozen version no hay nada que cruzar.
- [x] Corregir el comentario obsoleto de `i18n` en `astro.config.ts` (§7.4).

Valor independiente, sin relación con el versionado: hoy renombrar una página rompe todo enlace
externo hacia ella y nadie se entera. La regla cuesta cero y paga sola.

### Fase 1: hacer el corte *posible*, sin construirlo

- [x] ADR que registre la decisión de §3 (snapshot, no store):
      `docs/decisions/0022-frozen-documentation-is-a-built-archive.md`. El número estaba libre.
- [x] Auditar qué impide hoy montar el sitio bajo un prefijo. **Hecho, y el resultado cambió el
      enfoque**: ver el recuadro de abajo. No hay nada que corregir en el código fuente.
- [ ] Nada más en esta fase. El reescritor de URLs que reemplaza a la corrección del fuente es
      parte del cut, y el cut está detrás del gate de §9.

#### Resultado del audit de `base`: el fuente no se toca

El plan anterior pedía volver el sitio *base-agnóstico* en el fuente. Medido, eso es inviable y
además innecesario:

| Medición | Valor |
| --- | --- |
| Enlaces root-relative que resuelven a rutas reales | **950**, repartidos en **186 archivos** |
| Dónde vive la mayor parte | Dentro de strings de i18n, como HTML literal (`<a href="/foundations">`) en las dos traducciones |
| Usos de `import.meta.env.BASE_URL` hoy | **0** (no hay nada que desenredar, tampoco riesgo de doble prefijo) |
| Atributos root-relative en una página construida (`/components/button`) | 234, más 30 escapados (`&quot;/...&quot;`) dentro de props de islas |
| `url(/...)` en el CSS construido | 0 |
| `srcdoc=` en el HTML construido | 0: los frames se arman en el cliente copiando el `<head>` del padre, así que **heredan** cualquier reescritura de la página |

Volver base-aware una cadena de i18n exige convertir la prosa en plantilla, en dos idiomas, 950
veces. El seam correcto no es el fuente sino la **salida**: un solo pase sobre el archive reescribe
las cinco formas de la tabla de arriba y termina. Eso es lo que hace el paso 5 del runbook.

Consecuencia práctica: **Fase 1 no deja código**. Deja el ADR, esta medición, y la certeza de que el
cut es un problema de post-proceso de 5 formas conocidas y no una refactorización de 186 archivos.

### Fase 2: el cut (solo tras el gate de §9)

> **Estado real del árbol (2026-09-13, actualizado).** Existió un PROTOTIPO que metía archives en el
> **source** (`pages/v0.0.1-dev/**`, switcher con eje de versión en i18n, stubs que reexportaban
> páginas live). Ese enfoque **queda descartado** por §3.3: la versión no pertenece al router de
> `current`. La limpieza alineada a este plan es:
>
> - retirar `apps/docs/src/pages/v*/**` y las páginas hand-frozen bajo
>   `components/pages/frozen/` del camino crítico de `current` (o dejarlas solo como material de
>   laboratorio hasta borrarlas);
> - dejar el badge/switcher mostrando **una** versión (la de `working`) contra URLs bare;
> - no volver a generar stubs de archive en source.
>
> Lo que el gate de §9 sigue bloqueando es el cut real (script, tarball, mount en CDN). El prototipo
> de source-routes **no** cuenta como Fase 2 hecha.

- [ ] Retirar del source el árbol `pages/v*/` y el chrome que asume archives en-repo (§3.3).
- [ ] `scripts/docs-cut.ts` con los 9 pasos del runbook.
- [ ] Gate de snapshot: enlaces, canonical, `noindex`, search dentro de base, banner presente.
- [ ] Banner y switcher (latest con lista de archives **montados**; frozen con enlace único a latest).
- [ ] Truncado de `changes` y sello de fecha en `tests`.

### Fase 3: servir

- [ ] Montaje del archive en el CDN bajo `/v<version>/`, con la regla de retención de §5.3.
- [ ] Redirect 301 de `eol` a latest.
- [ ] Smoke test post-deploy.

### Fase 4 (opcional, probablemente nunca)

- [ ] Store de entries con herencia, **si y solo si** el coste de almacenamiento se vuelve real
      (más de 5 versiones vivas) o si aparece la necesidad de editar prosa histórica de forma
      rutinaria, que es la única cosa que el modelo snapshot hace mal.

---

## 13. Criterios de aceptación, medibles

1. Editar Button en `current` no crea una docs version. No hay archivo que tocar: solo un tag lo haría.
2. `apps/docs/src/pages/` no contiene ningún árbol `v*/`. Latest se sirve solo en URLs bare.
3. Tras el corte de v1, `/v0.0.1/components/button` muestra la prosa, los demos, la Referencia y los
   tests del día del corte, y el `sourceHash` del manifest horneado en esa página coincide con el
   del commit que lleva el tag `docs-v0.0.1`.
4. Ninguna página bajo `/v0.0.1/`, `/v0.2.0/`, ... aparece en `sitemap.xml`; todas llevan `noindex, follow` y un
   `canonical` que resuelve con 200 en latest o apunta a sí misma si hay tombstone.
5. El ⌘K dentro de `/v0.0.1/` no produce ni una sola navegación fuera de `/v0.0.1/`.
6. Un locale ausente sigue siendo 404 dentro de la versión. La versión no rellena traducción.
7. El build de `current` no se hace más lento: el corte es un proceso aparte y el CI de PR
   (`check.yml`) no construye snapshots. Umbral: delta de tiempo de `pnpm check` menor al 5%.
8. Los gates de navegador (`@skryensya/ai-gates`, ~14.5 min en frío) siguen recorriendo **solo**
   `current`. Un gate que empiece a crawlear los prefijos de versión se detecta porque su tiempo se duplica.
9. `artifacts/preview-heights.json` no crece con rutas versionadas.

---

## 14. Registro de riesgos

| # | Riesgo | Cómo se detecta | Mitigación | Fase |
| --- | --- | --- | --- | --- |
| R1 | El snapshot queda roto tres clicks adentro (URLs sin prefijar) | Gate del paso 6, que recorre el archive entero y falla ante una sola URL root-relative | Pase de rebase sobre la salida (Fase 1), no sobre el fuente | 2 |
| R2 | Duplicate content: ~380 páginas nuevas por versión compiten con latest | Search Console, o un test que cuente URLs indexables | `noindex` + canonical + sitemap solo latest (§7.2) | 2 |
| R3 | `prefetchAll` sobre snapshots dispara la factura de CDN | Bytes servidos por los prefijos `/v<version>/` | Desactivar prefetch en el cut (§7.4) | 2 |
| R4 | Los gates y los crawls de artefactos empiezan a recorrer rutas versionadas | Tiempo de suite, y el hecho ya conocido de que `build-preview-heights.mjs` deja de registrar previews pasado el índice 79 de 186 | Excluir los prefijos `/v<version>/` por configuración explícita, no por suerte, y afirmarlo en un test | 2 |
| R5 | Renombre de ruta en un major orfana la versión anterior | Cruce de rutas del archive contra rutas vigentes más redirects, en el corte | El redirect 301 que el renombre ya exige hace de alias (§4.2) | 0 |
| R6 | Un ledger de docs diverge de la realidad del deploy | No aplica: no existe | Cero ledgers nuevos; todo se deriva de tags, archive y deploy (§5) | 1 |
| R7 | Agente e humano leen eras distintas (MCP vs `/v<version>/`) | Ninguna hoy: es silencioso | Campo `docsVersion` en el manifest y en la respuesta MCP (§11.1) | 1 |
| R8 | El tag viejo no construye cuando hace falta un hotfix | Intentar el hotfix | El archive es la fuente; el tag es respaldo. Edición directa del archive como último recurso, registrada | 2 |
| R9 | Se corta una versión con artefactos desactualizados (tests o manifest viejos horneados como "del corte") | Paso 2 del runbook: regenerar y exigir diff vacío | El corte aborta | 2 |
| R10 | Se construye toda la maquinaria y nadie la usa | El gate de §9 no se cumple nunca | Fases 0 y 1 valen por sí solas; 2 y 3 esperan | 9 |
| R11 | El chrome viejo desorienta (sidebar de v1 con componentes que ya no existen) | Feedback, analytics de rebote en `/v<version>/` | Banner permanente no descartable con enlace a latest (§8.1) | 2 |
| R12 | Crecimiento de almacenamiento sin techo | Tamaño del bucket | Política de retención y `eol` (§5.3) | 3 |
| R13 | El switcher depende de los tags y CI clona en shallow, así que la lista sale vacía | Un test de build que exija al menos un tag cuando existe una frozen version | `fetch-depth: 0` en el workflow, afirmado en el propio test | 2 |

---

## 15. Decisiones a cerrar

| # | Decisión | Recomendación | Cerrar antes de |
| --- | --- | --- | --- |
| D1 | Snapshot inmutable, o store de entries con herencia | **Snapshot** (§3). Es la decisión que hace que las otras sean pequeñas. | Fase 1 (es el ADR) |
| D2 | Orden de los segmentos: `/v0.0.1/es/...` o `/es/v0.0.1/...` | **`/v0.0.1/es/...`**: sale del rebase del archive, sin reescrituras raras en el CDN (§7.1) | Fase 1 |
| D1b | ¿Base-agnóstico en el fuente, o rebase de la salida? | **Rebase de la salida** (Fase 1). 950 enlaces en 186 archivos, la mayoría dentro de prosa traducida, contra un pase de 5 formas conocidas | Cerrada, ADR-0022 |
| D2b | ¿Hace falta un archivo que liste las versiones? | **No** (§0.1, §5). Tags para la lista, deploy para el estado, y una constante de una línea para el único bit editorial | Fase 2 |
| D2c | ¿La versión vive en el router de `apps/docs` (`pages/v*/`)? | **No** (§3.3). Latest = bare. Archives = mount en CDN. El prototipo source-routes se retira | Fase 2 (limpieza) |
| D3 | Dónde vive el archive | Artefacto de GitHub Release, **no** commiteado. ~110 MB por versión no van al repo | Fase 2 |
| D4 | Cuántas versiones se sirven | Las dos últimas frozen; el resto `eol` con 301 | Fase 3 |
| D5 | ¿Se versiona el catálogo MCP? | **No en el MVP**, con el campo `docsVersion` como mitigación mínima (§11.1) | Fase 1 |
| D6 | ¿Existe un alias `latest` en la URL? | **No.** Un alias móvil es un enlace que envejece mal | Fase 2 |

La decisión pendiente del borrador ("¿demos interactivos pinneados o prosa y Reference estático?")
queda **disuelta** por D1: en el modelo snapshot los demos frozen son honestos sin coste adicional,
porque se hornean con el CSS y el JS de su propia era.
