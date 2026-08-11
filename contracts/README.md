# contracts/

Lo que rodea a un contrato y no vive en `packages/core`: por qué se elige, qué cambió, y las
composiciones que se publican como ejemplo.

| carpeta | qué es | quién lo lee |
| --- | --- | --- |
| `semantic/` | cuándo usar cada signature y cuándo no. Se reescribe libremente: describe el contrato **como es hoy**, no tiene historia. | un agente eligiendo qué componer |
| `changelog/` | qué cambió en cada contrato, fechado y en los dos idiomas. **Sólo se agrega, nunca se reescribe.** | quien ya lo estaba usando |
| `recipes/` | pantallas enteras como árboles de uso, validadas en cada build | quien arranca algo nuevo |

La estructura no está acá: vive en `packages/core/src/<componente>.ts`, que es su único autor.

## Si cambiás un componente, escribí su entrada

**La regla:** cualquier cambio que un consumidor pueda notar va al changelog de ese contrato, en el
mismo cambio que lo produce. No al final, no en el release: ahí es donde se olvida.

No depende de que alguien se acuerde. Cada `changelog/<id>.yaml` guarda el hash de la **superficie**
del contrato — opciones, defaults, qué acepta cada slot, qué signatures existen y qué requieren — y
el compilador **no emite nada** si ese hash dejó de coincidir:

```
button.yaml: the contract's surface is fe56b80f1df6c751 and `surface` says a3d1…
Something a consumer can depend on changed. Add an entry and set `surface: "fe56b80f1df6c751"`.
```

El mensaje trae el hash nuevo para pegar, así el gate no se vuelve un trámite.

**Lo que el gate NO ve**, y por lo tanto te toca a vos:

- Un cambio de comportamiento con la misma superficie: un default que se calcula distinto, un
  enhancer que ahora escucha otro evento, un fix que cambia lo que alguien veía.
- Un cambio en lo que el emisor **escribe**: el snippet que alguien copia de la página puede cambiar
  sin que se mueva ninguna opción.
- Cómo queda redactada la entrada. El gate compra el momento, no la calidad.

## La forma de una entrada

```yaml
surface: "fe56b80f1df6c751"
entries:
  - date: 2026-08-11        # cuándo se escribió, no cuándo se publica
    kind: feature           # breaking | feature | bugfix | rework | chore
    target: variant         # opcional: la opción, parte o signature exacta
    es:
      title: …              # texto plano: es la línea que alguien escanea
      body: >-              # admite HTML; acá va el porqué
        …
    en:
      title: …
      body: >-
        …
```

`breaking` es para lo que obliga a actuar, incluido quitar algo publicado. El default es `chore`:
una entrada a la que se le olvidó el tipo debe leerse como "no es para vos", nunca como una novedad
que nadie anunció.

## Versiones

Una entrada **no** dice su versión. `changelog/releases.yaml` es el único lugar que decide eso: una
entrada cae en el release más viejo cuya fecha la alcanza, y lo que quedó después del último release
se muestra bajo la versión de trabajo (hoy `0.1.0-dev`).

Cortar una versión es una línea ahí. Por eso el ledger existe en vez de un campo `version:` por
entrada: con el campo habría que abrir los 65 changelogs y sellar a mano cada entrada suelta, que es
un trabajo que nadie hace dos veces y que ningún gate puede exigir.
