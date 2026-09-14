# Plan: playground versionado

Servir el playground de cada major publicado sin mantener un segundo modelo de versionado, sin
reconstruir builds viejos y sin que cortar una versión sea una tarde de trabajo manual. Este plan
asume la estructura **actual** de `apps/playground` (Astro estático, catálogo emitido en build,
bundles del kit precompilados para Sandpack) y los **dos hosts** que ya existen:
`ui.skryensya.dev` para la documentación y `playground.skryensya.dev` para la herramienta.

Relacionado: `VERSIONED_DOCS_PLAN.md` (del que este plan es la continuación, no una variante),
`contracts/changelog/releases.yaml` (el ledger de versiones publicadas), ADR-0006 (el sitio consume
el package por el path que enseña).

---

## 0. Veredicto

> **Un playground versionado es el build del árbol en el momento del corte, publicado como imagen
> inmutable y montado bajo `/v<major>/` en su propio host. El switcher no lee una lista compilada
> dentro del bundle: lee un `versions.json` generado desde `releases.yaml`, porque un archive no
> puede conocer las versiones que se publicaron después de él.**

Es el mismo modelo snapshot que `VERSIONED_DOCS_PLAN.md` §3 elige para la documentación, por las
mismas razones y con un argumento de costo todavía más fuerte (§2). Lo único que este plan agrega
sobre aquel es lo que imponen los dos hosts: URLs absolutas por build, y un switcher que no puede
resolverse en tiempo de build.

### 0.1 Qué hereda de VERSIONED_DOCS_PLAN.md

Sin cambios: derivar antes que registrar (§0.1 de aquel plan), el archivo nace del evento, la
versión no vive en el router de `current`, y el gate de activación (§9). Este plan no introduce
estado nuevo: el único archivo que aparece (`versions.json`) es **generado** desde el ledger que ya
existe, igual que el manifest se genera desde los contratos.

---

## 1. Qué es, exactamente, la versión de un playground

El app no es lo versionado. Lo son dos artefactos que el build produce del árbol en el que corre:

| Artefacto | Qué es | Por qué es la versión |
| --- | --- | --- |
| `public/sandbox/*` | `@skryensya/react` y `@skryensya/vanilla` compilados (`scripts/build-sandbox-bundles.mjs`) | Es el kit que el sandbox **ejecuta**. Un ejemplo de v0 corriendo sobre el kit de v2 no es v0. |
| `playground-catalogue-*.json` | Los ejemplos, emitidos por el compilador de esa versión desde los demos de esa versión | El código que se lee y se edita sale del emisor y de los contratos del corte. |

De ahí que un snapshot sea fiel por construcción: los dos salen del mismo `pnpm build`, sobre el
mismo commit, sin que nadie tenga que acordarse de nada.

---

## 2. Por qué snapshot y no un switch en runtime

Medido en este repositorio (`apps/playground/dist`, 2026-09-14):

| Hecho medido | Valor |
| --- | --- |
| Build completo del playground | **8.3 MB** |
| De eso, catálogo (`playground-catalogue-*.json`, 166 archivos) | 3.5 MB |
| De eso, kit compilado para el sandbox | 3.3 MB |
| De eso, JS/CSS del app (`_astro`) | 1.4 MB |
| Build completo de la documentación (referencia, §3.2 del otro plan) | ~140 MB |

Un archive de playground cuesta **el 6%** de uno de documentación, sobre un costo de disco que ese
plan ya aceptó pagar.

La alternativa tentadora (un solo playground con un selector que cambia el kit en caliente) no
ahorra el trabajo que parece ahorrar: el código de cada ejemplo sale del emisor y de los contratos
**viejos**, así que igual hay que construir cada versión desde su tag para tener su catálogo y sus
bundles. Encima de eso agrega: un segmento de versión en cada asset, cache keys por versión, un
`key` en el provider de Sandpack para que el cambio desmonte el sandbox, y una matriz
versión x binding x locale para probar. Compra una sola cosa que dos pestañas no den ya: comparar
el mismo ejemplo lado a lado entre majors. No se construye hasta que alguien pida esa comparación.

---

## 3. Topología con dos hosts

```
playground.skryensya.dev/            latest (editable, URLs bare)
playground.skryensya.dev/v0/         archive del corte v0
ui.skryensya.dev/components/button         docs latest
ui.skryensya.dev/v0/components/button      docs archive v0
```

Cada archive es un build completo con su propio catálogo y su propio `sandbox/`. Nada resuelve entre
versiones en runtime.

El playground vive en la RAÍZ de su host, no en `/playground`: el host existe para esta herramienta,
así que la dirección que alguien escribe (`playground.skryensya.dev`) tiene que ser la herramienta y
no un redirect hacia la única ruta que existía. El path viejo queda como 301 en
`nginx.playground.conf` para los enlaces que ya estén circulando.

### 3.1 Lo que los dos hosts obligan a cambiar

`PUBLIC_DOCS_URL` y `PUBLIC_PLAYGROUND_URL` se inlinean en build (Astro estático), así que son
**por build** y ahora tienen que ser absolutas:

| Build | `PUBLIC_DOCS_URL` | `PUBLIC_PLAYGROUND_URL` |
| --- | --- | --- |
| playground latest | `https://ui.skryensya.dev` | (no aplica) |
| playground v0 | `https://ui.skryensya.dev/v0` | (no aplica) |
| docs latest | (no aplica) | `https://playground.skryensya.dev` |
| docs v0 | (no aplica) | `https://playground.skryensya.dev/v0` |

`docsHref` concatena, así que un sufijo de path en la variable funciona sin tocar código.

### 3.2 Lo que NO hay que tocar

El handoff entre los dos apps ya es cross-origin por diseño y ya es correcto por versión:
`openInPlayground` (`packages/vanilla/src/components/component-preview.ts`) apunta al `origin` del
destino explícitamente y manda como dirección de vuelta el `location.href` de la página de docs que
lo abrió. Una página archivada abre el playground archivado y vuelve a sí misma, sin que ninguno de
los dos lados sepa que existen versiones.

---

## 4. El switcher

### 4.1 Por qué la lista no puede compilarse

Un build hecho el día del corte de v0 no puede conocer v1 ni v2. Si la lista se compila dentro del
bundle, el playground de v0 ofrece para siempre una sola fila, que es exactamente lo contrario de un
switcher. La lista tiene que llegar en runtime.

### 4.2 `versions.json`, generado y no escrito

El deploy publica `versions.json` en la raíz de `playground.skryensya.dev`, **generado desde
`contracts/changelog/releases.yaml`**, que ya es el registro de versiones publicadas de este
repositorio. No hay lista nueva que mantener ni que se pueda desincronizar: si una versión está en
el ledger, está en el switcher.

```json
{
  "latest": { "version": "0.2.0", "href": "/" },
  "archives": [{ "major": "v0", "version": "0.1.0", "href": "/v0/", "deprecated": false }]
}
```

`deprecated` es el único bit editorial del plan, igual que en §0.1 del plan de docs.

Mismo origen que el app, así que no hay CORS. Si el fetch falla, el switcher muestra solo la versión
en la que se está: un control que no puede leer la lista no inventa filas.

### 4.3 Forma del control

Se renderiza en la isla y se portalea al chrome con `ChromeSlot`, que es el patrón que ya usan el
buscador, el switch de binding y la barra del preview. Va junto al idioma y al tema, porque es una
preferencia de "qué estoy mirando" y no una acción sobre el ejemplo.

La selección ya vive en el query string, así que cambiar de versión conserva el lugar:
`/v0/?component=button&example=variants&binding=react`. Un ejemplo que no existía en esa
versión cae al primero del componente, que es lo que el app ya hace hoy cuando el id no resuelve.

---

## 5. El prefijo de base

Un archive se construye con `base: "/v0"` en `astro.config.mjs`. Astro prefija lo que él emite;
**no** prefija las rutas absolutas escritas a mano, que hoy son siete:

| Archivo | Ruta |
| --- | --- |
| `src/components/react-demos/Playground.tsx:307` | `/sandbox/foundation.css` |
| `src/components/react-demos/Playground.tsx:312` | `/sandbox/react-modules.json` |
| `src/components/react-demos/Playground.tsx:313` | `/sandbox/skryensya-vanilla.js` |
| `src/components/react-demos/Playground.tsx:317` | `/sandbox/css-manifest.json` |
| `src/components/react-demos/Playground.tsx:321` | `/sandbox/css/` |
| `src/pages/index.astro:89` | `/playground-catalogue-${locale}.json` |
| `src/layouts/Tool.astro:56` y `src/pages/404.astro:26` | `/`, `/${locale}/` |

Cada una pasa a leer `import.meta.env.BASE_URL`. Es inerte con `base: "/"`, así que se puede hacer
hoy: hacerlo antes del primer corte convierte el primer archive en un flag de build en vez de en una
sesión de depuración.

---

## 6. Hands-off: cortar es un tag

El objetivo operativo es que publicar una versión no tenga pasos en el servidor. La forma:

### 6.1 Lo que hace una persona

```bash
vim contracts/changelog/releases.yaml     # una línea: version + date
git commit -am "chore: cut 0.1.0"
git tag v0.1.0 && git push --tags
```

Nada más. El ledger ya estaba diseñado para que cortar sea una línea (ver su propio encabezado); el
tag es lo único que este plan agrega.

### 6.2 Lo que hace CI (`.github/workflows/release.yml`, on tag)

1. **Construye el archive** de los dos apps en ese commit, con el `base` y las variables de §3.1, y
   lo publica como imagen inmutable: `ghcr.io/skryensya/playground-archive:v0`,
   `ghcr.io/skryensya/docs-archive:v0`.
2. **Reconstruye las imágenes vivas** componiendo todos los archives publicados:
   ```dockerfile
   FROM ghcr.io/skryensya/playground-archive:v0 AS v0
   COPY --from=v0 /usr/share/nginx/html /usr/share/nginx/html/v0
   ```
   Las líneas se generan desde `releases.yaml`, y `versions.json` se genera en el mismo paso desde
   el mismo archivo: una sola fuente para las dos cosas.
3. **Publica las imágenes vivas** y llama al webhook de deploy de Dokploy de cada app.

**Un archive se construye una vez y nunca más.** Dentro de un año la imagen de v0 sigue existiendo
como bytes; nadie vuelve a correr un build viejo con un toolchain que ya se movió, que es el modo de
falla que pudre los archives mantenidos a mano.

### 6.3 Lo que cambia en Dokploy

Las dos apps pasan de *Build from Dockerfile* a *Deploy image* (`ghcr.io/skryensya/docs:latest`,
`ghcr.io/skryensya/playground:latest`), y el webhook de deploy de cada una se guarda como secret del
repositorio. Es además la recomendación de la propia documentación de Dokploy para producción, y
saca del servidor un build de monorepo que hoy pide 4 GB de heap mientras sirve tráfico.

### 6.4 Qué se archiva

**Solo majors.** El playground son 8.3 MB por versión, pero la documentación son ~140 MB: archivar
cada patch pone gigabytes en el registry para versiones que nadie pide. El switcher ya muestra
majors (`v0`); la cadena completa del ledger vive en el footer, como describe el plan de docs.

---

## 7. Gate de activación

Se hereda el de `VERSIONED_DOCS_PLAN.md` §9 sin cambios, y hoy no se cumple: `releases: []`, ningún
segundo major en vuelo, ningún consumidor anclado.

| Cuándo | Qué se hace |
| --- | --- |
| Ahora | §5 (el pase de `BASE_URL`) y §4 (el switcher leyendo `versions.json`, con fallback de una fila). Los dos son inertes mientras no exista un archive, y los dos son baratos. |
| En el primer corte | §6: el workflow de release y el cambio de source en Dokploy. |

Escribir el workflow antes de que exista una versión significa depurarlo un año después, en el único
momento en que importa. Escribir el pase de `BASE_URL` después significa depurarlo con un archive ya
roto en producción. Por eso el corte entre las dos filas cae donde cae.

---

## 8. Riesgos y qué los contiene

| Riesgo | Contención |
| --- | --- |
| El registry crece sin techo | Solo majors (§6.4). Un major de los dos apps son ~150 MB. |
| Un archive viejo no vuelve a compilar | No se recompila nunca: es una imagen publicada (§6.2). |
| El switcher miente sobre qué hay montado | Se genera del ledger en el mismo paso que monta los archives, no en otro momento ni en otro archivo (§4.2). |
| Una URL absoluta baked apunta al host equivocado | Las cuatro combinaciones están en una tabla (§3.1) y las pone CI, no una persona. |
| El `?component=` de un archive apunta a un ejemplo que esa versión no tenía | Ya resuelve al primero del componente; es el comportamiento actual del app, no algo que este plan agregue. |
