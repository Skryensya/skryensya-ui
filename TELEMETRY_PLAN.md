# MVP de telemetría del Design System

Telemetría del **uso del software**, no de personas. Todo vive en este Turborepo. `apps/docs` es el primer consumidor real (ADR-0006).

Este plan asume la estructura **actual** del repo. No reorganiza workspaces. Core no es un runtime (ADR-0007 / 0013): la observación vive en los Bindings y en un package de telemetría, nunca en el Contract.

Vocabulario de dominio: `CONTEXT.md` (**Usage observation**, **Sample decision**, **Usage batch**, **Ingest**). No sustituir esos nombres por “evento”, “sesión de usuario” o “API de Umami”.

---

## Diagnóstico del repo (ya inspeccionado)

| Hecho | Implicación |
| --- | --- |
| pnpm workspaces: `packages/*`, `apps/*`. Scope `@skryensya/*`. Versión DS `0.1.0`, tooling `0.0.0`. Sin Changesets. | Package nuevo: `@skryensya/telemetry` (runtime) y `@skryensya/telemetry-ingest` (Ingest). Naming alineado a `@skryensya/mcp`. |
| Core exporta contratos y CSS; **cero runtime DOM**. React y Vanilla son Bindings. | Telemetría **no** entra en `@skryensya/core`. Variants allowlisted salen de las opciones del Contract; el registro ocurre en el Binding. |
| Docs es Astro **`output: "static"`**, nginx. No hay `pages/api`. | Ingest **no** vive en docs. Servicio Node propio, precedente: `packages/mcp/src/http.ts` + `Dockerfile.mcp`. **No** extender MCP. |
| React en docs: islas en el Document del chrome. Vanilla: `iframe` srcdoc con Document propio (ADR-0007). | Una Sample decision **por Document**. Chrome y preview no comparten `sessionStorage`. |
| Button vanilla: `createConnectMount`. Input/Dialog vanilla: **Native alternative** (Dialog: ADR-0005). No hay `mountInput` / `mountDialog`. | El trío Button/Input/Dialog **no** es simétrico entre Bindings. |
| No hay `VERSION` runtime en los packages. | `libraryVersion` se configura una vez, no se pasa en cada observación. |
| No hay Umami, Compose ni Postgres en el repo. Env precedent: `PORT`, `HOST`, `MCP_HTTP_TOKEN`. Cliente: `import.meta.env.DEV` / `PROD`. | Ingest + Umami self-hosted son greenfield. Override local: env / configure, no cambiar el default 5%. |
| Usage trees + `ai-compiler` (ADR-0014). | **No** instrumentar demos ni trees. |

Packages a tocar: `@skryensya/telemetry` (nuevo), `@skryensya/telemetry-ingest` (nuevo), `@skryensya/react`, `@skryensya/vanilla`, `@skryensya/docs`. Core: solo lectura de options del Contract. Infra nueva: `Dockerfile.telemetry` (o equivalente Dokploy), stack Umami + Postgres **fuera** de docs/MCP.

---

## Qué debe poder responder el MVP

- hostname
- versión del Design System (`libraryVersion`)
- qué Contracts se observaron (id de componente)
- cuántas Usage observations por Contract
- variants públicos allowlisted
- cuándo se envió el Usage batch (`timestamp`)
- Sample rate aplicado

Habilitada por defecto en **producción**. Sample rate **0,05** por Sample decision. Fail-safe: la telemetría nunca rompe al consumidor; el try/catch vive **dentro** del runtime, no en cada Binding.

### No recopilar

pathname, query, referrer, user IDs, session IDs persistentes, DOM/text, input values, props arbitrarias. Solo campos allowlisted. El cliente no es de confianza: Ingest revalida.

---

## Arquitectura: dos modules profundos, no un pipeline

Callers (docs y apps futuras) usan Bindings. Los Bindings no conocen Umami, ni flush, ni sampling.

```text
Binding (React | Vanilla)
        │  Usage observation en el seam de montaje
        ▼
┌─────────────────────────────────────┐
│  @skryensya/telemetry               │  interface: configure + observe
│  implementation: sample decision,   │
│  buffer, payload v1, flush,         │
│  fail-safe, SSR guards              │
└─────────────────────────────────────┘
        │  Usage batch  POST
        ▼
┌─────────────────────────────────────┐
│  Ingest  POST /v1/usage             │  interface: el POST
│  implementation: size, schema,      │
│  unexpected fields, expand batch    │
│  internal seam: sink adapter        │
│    prod: Umami · test: recorder     │
└─────────────────────────────────────┘
        ▼
     Umami
```

**Deletion test.** Sampling, aggregation, allowlist y flush **no** son packages. Borrar un `sampling.ts` público solo movería complejidad. UmamiAdapter **no** es un package público el día uno: un adapter sería un seam hipotético; el recorder de tests es el segundo adapter que justifica el seam **interno** del sink.

**No** llamar `umami.track` desde un componente.

Preferencia de host de Ingest: `telemetry.ui.allison.sh/v1/usage` (adaptar a Dokploy existente).

---

## Interface del runtime (pequeño)

Tres hechos que un Binding debe conocer: el id del Contract, el variant allowlisted (si aplica), y que `observe` es fail-safe.

```ts
configureTelemetry({
  enabled?: boolean;
  sampleRate?: number;
  endpoint?: string;
  libraryVersion: string;
});

observeUsage({
  component: string;
  variant?: string;
});
```

Nombres adaptables a convenciones del repo; la forma no: **no** pasar `version` / `host` / `sampleRate` en cada `observe`. Eso es implementation (`window.location.hostname` en el flush; `libraryVersion` de `configure`; sample rate de la Sample decision).

`configureTelemetry` es análogo al **Root contract**: el consumidor lo hace una vez al arrancar. En docs: `docs-page-lifecycle.ts` (chrome) y, si se quiere telemetría de previews vanilla, el boot de `component-preview-frame.ts` (otro Document).

SSR / sin `window`: importar el package no debe tirar. APIs de browser protegidas. Sin `window`, `observe` es no-op.

---

## Implementation del runtime (no es el interface)

### Sample decision

En el cliente, **antes** de acumular o enviar. Default producción: `sampleRate = 0.05`. Una vez por Document, `sessionStorage` con `"0"` o `"1"`. Sin localStorage, cookies, fingerprints, user IDs, ni identificador de sesión.

Si no hay decisión: `Math.random() < sampleRate`, persistir `0`/`1`. Si `0`, el runtime es no-op.

**Invariant:** la Sample decision es por Document, no “por visita a docs”. Un iframe de preview es otro Document y otra decisión, salvo que docs **inyecte** `configureTelemetry` en el frame con la misma decisión ya tomada (sin crear un session id para unirlos).

Override local/test: `TELEMETRY_SAMPLE_RATE=1` (o equivalente en configure). Default de producción inmutable. Debe poder desactivarse por completo.

### Buffer

No una request por observación. Solo agregados: counts y variants. Sin nodos DOM ni referencias React.

### Payload versionado (Usage batch)

```text
schemaVersion
host
libraryVersion
sampleRate
timestamp
components   // Record<id, { count, variants? }>
```

Sin pathname, URL completa, query, referrer.

### Flush

Cada ~30s y en `pagehide`. Preferir `navigator.sendBeacon`; `fetch(..., { keepalive: true })` donde toque. Best-effort, no exactly-once. Tras envío aceptado, rotar el buffer. No bloquear navegación ni render.

---

## Seam de montaje del Binding

Una Usage observation es **una instancia viva**, no un render.

### Dónde (leverage)

| Binding | Seam | No hacer |
| --- | --- | --- |
| React | Un hook module (`observe` una vez por mount, Strict Mode consciente). Los componentes del MVP **llaman ese hook**, no reimplementan sampling/flush. | `observe` suelto en el cuerpo de render |
| Vanilla | `createConnectMount` / `createSvelteMount` en `svelte-hydrate.ts`, cuando la raíz queda ready. | Copiar `observe` en cada `packages/vanilla/src/components/*.ts` |
| Core | Nada | Dependencia a telemetry |
| Usage tree / demos | Nada | Instrumentar el compiler o `apps/docs/src/demos` |

Producción: telemetría activa en `import.meta.env.PROD` (mismo patrón que docs). Development / tests / Storybook: no-op salvo override explícito.

### Qué instrumentar en el MVP

Cubrir **los dos Bindings de verdad**, no fingir simetría:

1. **Button** — React mount + Vanilla enhancer (`mountButton`).
2. **Input** — React mount. Vanilla es Native alternative: **no** hay instancia de enhancer; no inventar MutationObserver.
3. **Dialog** — React mount. Vanilla es `<dialog>` nativo (ADR-0005). Un Dialog Vaul cuenta como Pattern **Vaul** si el enhancer Vaul ya está en el seam de hydrate; no crear `mountDialog`.

Así docs produce telemetría real: islas React (Input/Dialog/Button) en el chrome, Button vanilla dentro de iframes **si** el frame configura el runtime.

### Variants

Solo options públicas del Contract (p. ej. `variant: "primary"`). Nunca `observe(props)`. Nada de texto libre, IDs, URLs. El Binding traduce prop/attr → valor allowlisted **antes** de `observe`.

---

## Ingest

Público. CORS no es autenticación. No confiar en el cliente.

Interface: `POST /v1/usage`. Un module: validar content-type, tamaño, schema, campos inesperados, límites (hostname, component name, nº de components, variants por component), normalizar, responder rápido, reenviar al sink.

Logs de servidor (mínimos): recibido / rechazado / schema inválido / fallo del sink. No volcar el body entero por defecto.

Sink interno:

- producción: transformar Usage batch → eventos Umami (`ds-component-usage` + host, component, libraryVersion, variant, count, sampleRate). Un batch con N components/variants se expande **en servidor**.
- tests: recorder in-memory.

El schema público del cliente no es el schema de Umami. Cambiar Umami más adelante es cambiar el sink, no el runtime ni el Binding.

Self-hosted: Umami + PostgreSQL. Reutilizar Postgres de infra solo si no arriesga otros servicios. No ClickHouse, Kafka, Redis, NATS, OTel Collector en este MVP.

Dashboard: Umami primero. Si las preguntas del MVP no se contestan, ajustar el sink **antes** de un dashboard propio.

---

## Docs como primer consumidor

```text
docs.ui.allison.sh  (chrome Document)
  React islands → observe en mount
  configureTelemetry en docs-page-lifecycle

preview iframe (otro Document)
  vanilla enhancers → observe en hydrate ready
  configure explícito en el boot del frame, o no hay telemetría vanilla
```

Validar: host de docs, Button / Input / Dialog según Binding, `libraryVersion`, variants, counts, sampleRate. Un Usage batch, no una request por instancia.

---

## Tests (superficie = interface)

### Runtime (`observe` / `configure`)

- Sample decision una vez; reutiliza sessionStorage de **ese** Document
- `sampleRate` 0 → false; 1 → true
- varias observaciones incrementan count; variants se agregan; Contracts distintos no se mezclan
- payload sin pathname, query, referrer, userId, sessionId, DOM
- import sin `window` no rompe
- `observe` no lanza hacia el caller

No tests que aserten el buffer interno una vez exista el interface.

### Ingest (`POST`)

- payload correcto
- schema incorrecto
- demasiado grande
- component name inválido
- demasiados components

### Bindings

- React: una observación por mount, no por render (y comportamiento acordado bajo Strict Mode en prod)
- Vanilla: una observación cuando el enhancer queda ready, no por `initComponents()` a ciegas

---

## Documentación (técnica, no legal)

Qué sí / qué no (listas de arriba). Sample decision: 5% de Documents, estable hasta fin de sesión de **ese** Document. Cómo disable / override. Sin claims “GDPR compliant” / “anónimo por definición”.

---

## Definición de terminado

1. Deployar/ejecutar docs
2. Forzar sample rate 1
3. Abrir docs
4. Montar Button (React y, si el frame está configurado, vanilla), Input React, Dialog React
5. El runtime agrega observaciones
6. Un Usage batch, no requests por instancia
7. Ingest recibe, valida, envía al sink
8. En Umami: hostname docs, versión, Button/Input/Dialog, variants, counts
9. Sin pathname ni identidad
10. Devolver sample rate a 0,05 en producción

---

## No hacer todavía

Clicks, interactions, funnels, journeys, replay, performance, CWV, errors, pathname/route/query, unique users, persistent IDs, dashboard custom, ClickHouse, colas, OpenTelemetry, fingerprinting, remote config, streaming, exactly-once, MutationObserver para Native alternatives, meter Ingest en Astro o en MCP, instrumentar usage trees, `observe` con el objeto `props` completo.

---

## Principios (orden)

1. privacidad
2. desacoplamiento (Bindings ↔ runtime ↔ Ingest ↔ sink)
3. simplicidad (dos modules profundos)
4. estabilidad del protocolo (Usage batch v1)
5. bajo overhead para consumidores
6. Umami reemplazable en el sink interno
7. extensibilidad futura

---

## Orden de ejecución

No instrumentar Bindings, docs ni Umami antes de que el runtime exista. Ingest con recorder basta para el camino local; Umami es el último eslabón.

### Cómo marcar los checkboxes

- `- [ ]` = no hecho. `- [x]` = hecho. No hay estado “a medias”: si el paso está empezado, el checkbox sigue vacío.
- Marca **solo al verificar**, no al escribir el primer archivo. “Verificar” = el test o la comprobación que nombra el propio paso (o el de tests del mismo bloque) pasa.
- Marca **en orden dentro de cada bloque**. No taches el 10 si el 5 aún está vacío: el 10 asume Sample decision y buffer.
- **No abras el bloque siguiente** hasta que el último checkbox del bloque anterior esté en `[x]`. Excepción: el bloque 2 (Ingest) puede arrancar en paralelo al 3 (Binding) **después** de que el bloque 1 esté completo; docs (4) necesita 1 **y** 2; Umami (5) necesita 2 **y** 4 (tiene que haber un batch real); cierre (6) al final.
- Un checkbox de “comprobar” (26–28, 31) no se marca porque “debería funcionar”: se marca cuando lo viste (red, recorder o Umami).
- El 25: márcalo `[x]` si configuraste el iframe **o** si documentaste que los previews vanilla no envían telemetría. Las dos son decisiones cerradas.
- El 32: márcalo `[x]` si Umami ya responde las preguntas del MVP **sin** tocar runtime/Binding, **o** si ajustaste el sink y volviste a pasar el 31. Si el 31 pasa a la primera, márcalo igual (no había nada que ajustar).
- No desmarques pasos de atrás para “reabrir alcance”. Si hay que rehacer, desmarca **desde el paso que se rompió** hacia abajo en ese bloque, no todo el plan.
- El MVP no está cerrado hasta que 1–35 estén `[x]` (el 32 incluido, con la regla de arriba).

Convenciones al implementar: `exports` source-first, Turbo `check`/`build`, Docker estilo MCP. Coste fijo: hook + hydrate. Coste variable: los tres componentes del MVP.

### 1. Runtime (`@skryensya/telemetry`)

- [ ] 1. Crear el package (workspace, `exports` source-first, Turbo `check`).
- [ ] 2. Interface: `configureTelemetry` + `observeUsage` (sin version/host/sampleRate en cada `observe`).
- [ ] 3. Guards SSR: import sin `window` no tira; `observe` es no-op fuera del browser.
- [ ] 4. Fail-safe encapsulado: `observe` no lanza al caller.
- [ ] 5. Sample decision: una vez por Document, `sessionStorage` `"0"`/`"1"`, default `0.05`.
- [ ] 6. No-op si la decisión es `0`; override `TELEMETRY_SAMPLE_RATE` / configure; poder desactivar.
- [ ] 7. Buffer en memoria: counts + variants allowlisted; sin DOM ni refs React.
- [ ] 8. Usage batch v1: `schemaVersion`, `host`, `libraryVersion`, `sampleRate`, `timestamp`, `components`.
- [ ] 9. Flush ~30s + `pagehide` (`sendBeacon` / `fetch` keepalive); rotar buffer tras envío aceptado.
- [ ] 10. Tests del runtime contra `configure` / `observe` (sampling, agregación, privacy del payload, SSR, no-throw).

### 2. Ingest (`@skryensya/telemetry-ingest`)

- [ ] 11. Package Node aparte (precedente MCP HTTP). No meter Ingest en Astro ni en MCP.
- [ ] 12. `POST /v1/usage`: content-type, tamaño, schema, campos inesperados, límites.
- [ ] 13. Sink interno **recorder** (tests / local). Responder rápido.
- [ ] 14. Tests del POST (ok, schema inválido, demasiado grande, nombre inválido, demasiados components).
- [ ] 15. Logs mínimos: recibido / rechazado / schema / fallo del sink. Sin dump del body por defecto.

### 3. Seam de Binding

- [ ] 16. React: un hook module (una observación por mount, Strict Mode; prod vía `import.meta.env.PROD`).
- [ ] 17. Vanilla: `observe` en `createConnectMount` / `createSvelteMount` cuando la raíz queda ready. No copiar en cada enhancer.
- [ ] 18. Button React: variant allowlisted → `observe`.
- [ ] 19. Input React: igual.
- [ ] 20. Dialog React: igual. No `mountDialog`.
- [ ] 21. Button vanilla: cae en hydrate; no tocar `button.ts` salvo que el seam no vea el variant.
- [ ] 22. Tests de Binding: una observación por mount/ready, no por render ni por `initComponents()` a ciegas.

### 4. Docs (primer consumidor)

- [ ] 23. Dependencia a `@skryensya/telemetry`; `libraryVersion` en `configure` (no hay `VERSION` runtime hoy).
- [ ] 24. `configureTelemetry` en `docs-page-lifecycle` (Document del chrome). Sample 1 en local.
- [ ] 25. Boot del iframe (`component-preview-frame`): `configure` explícito, o no hay telemetría vanilla en previews.
- [ ] 26. Comprobar islas React: Button, Input, Dialog en el chrome.
- [ ] 27. Comprobar Button vanilla en preview si el frame está configurado.
- [ ] 28. Un Usage batch hacia Ingest; no una request por instancia.

### 5. Umami (sink de producción)

- [ ] 29. Umami + PostgreSQL self-hosted (Dokploy / Docker). No ClickHouse ni colas.
- [ ] 30. Adapter Umami detrás de Ingest: expandir batch → `ds-component-usage`.
- [ ] 31. Validar en Umami: host docs, versión, Button/Input/Dialog, variants, counts.
- [ ] 32. Si esas preguntas no se contestan, ajustar el sink, no el runtime ni el Binding.

### 6. Cierre

- [ ] 33. Documentar qué sí / qué no, Sample decision por Document, disable, override. Sin claims legales.
- [ ] 34. Sample rate de producción otra vez a `0.05`.
- [ ] 35. Entregar: arquitectura final, archivos, cómo correr local, cómo forzar sample 100%, cómo ver el batch, cómo ver Umami, tradeoffs, fase 2 (heredar decisión padre→iframe; Input/Dialog vanilla si algún día hay enhancer).
