# Prune de tokens

Cómo una app consumidora deja de enviar los tokens que no usa, sin tocar la arquitectura de
tres capas ni perder el theming en runtime.

## El hallazgo primero

Las tres capas de tokens (primitivas → semántica → componente) **no son el problema de peso**. La
indirección es referencia en runtime, no duplicación: cuando un componente lee `var(--color-bg-surface)`
apunta a **una** custom property, sin importar cuántas capas haya detrás. La capa semántica entera, el
tier que existe *solo* por el diseño de tres niveles, pesa **~1.7 KB gz**, y gzipea casi a nada porque
son patrones repetidos (`light-dark(var(--palette-*-50), var(--palette-*-950))`).

El peso real del token layer tiene dos multiplicadores, y ninguno es la indirección:

1. **Tokens sin usar que no se pueden tree-shakear.** Las custom properties no tienen dead-code
   elimination: un `:root` con 276 tokens los envía los 276 aunque la app toque 40.
2. **La matriz brand × mode.** 8 brands + alto contraste re-emiten sus capas.

Este doc ataca el punto 1. El punto 2 se resuelve enviando menos brands (una app de producción usa uno,
no ocho) y es independiente de esto.

## El tool: `packages/core/scripts/prune-tokens.mjs`

Reutiliza `scripts/parse.mjs`, el mismo parser que corren el validador y la referencia de la docs
([decisión sobre el parser compartido](/decisiones)), así que lee el grafo de tokens de una sola fuente.

Es **report-first**: por defecto solo reporta. El `--emit` es opt-in. Nunca reescribe de forma
destructiva, por la razón del safelist más abajo.

```bash
# Reportar contra un set de componentes (lo que la app realmente importa)
node scripts/prune-tokens.mjs --used button,tile,input,typography --brand default

# Emitir el CSS de tokens podado
node scripts/prune-tokens.mjs --used button,tile,input,typography --brand default --emit tokens.pruned.css

# Ver qué tokens se podarían
node scripts/prune-tokens.mjs --used button,tile --brand default --verbose

# Proteger tokens que la app usa dinámicamente (ver "El safelist" abajo)
node scripts/prune-tokens.mjs --used button --safelist --color-accent-500,--z-sticky
```

## Cómo decide qué se queda

### La demanda son las referencias reales

La demanda es todo `var(--x)` que aparece en el CSS que la app envía: los componentes que importa, tanto
en las declaraciones de hooks `--sk-*` como en los cuerpos de reglas (`background: var(--x)`), más el CSS
propio de la app, más el safelist.

### El closure es transitivo sobre los valores

Un componente lee `--color-bg-surface`, cuyo valor es `light-dark(var(--palette-white),
var(--palette-stone-900))`. Entonces **las dos paletas también son alcanzables**, y no se pueden borrar,
aunque ningún componente nombre una paleta directa (el validador prohíbe justamente eso). El tool camina el
grafo desde las raíces de demanda siguiendo los `var()` de cada valor.

### La unidad de poda es el nombre, no la declaración

`--color-bg-canvas` se declara muchas veces, la semántica base, el ramp de cada brand, el bloque de alto
contraste. **Conservar el nombre conserva todas sus copias**, porque cuál gana es una decisión de
*runtime* (atributo de brand, `prefers-contrast`). Podar una sola copia rompería un modo en silencio para
ese token. Por eso el theming en runtime sobrevive intacto al prune.

### El safelist es responsabilidad de quien poda

El escaneo es estático: **no ve** los tokens que un componente lee por JS, inline style,
`getComputedStyle`, una clase que se prende en runtime. Esos se pasan por `--safelist`, o se podan. Por
eso el default es reportar, nunca reescribir.

## Los números medidos

Baseline: bundle de tokens de **1 brand** (`default` + alto contraste + dimensión de radio), compilado
`compressed`. 276 tokens, 20.8 KB raw / 3.16 KB gz.

| Escenario | Tokens que quedan | Token CSS raw | Token CSS gz |
|---|---|---|---|
| Worst case (los 30 componentes del sistema) | 201 / 276 | 20.8 → 16.5 KB (−21%) | 3.16 → 2.54 KB (−20%) |
| Worst case (los 30 componentes del sistema) | 201 / 276 | 20.8 → 16.5 KB (−21%) | 3.16 → 2.54 KB (−20%) |

Incluso importando **todos** los componentes sobran 75 tokens (−20% gz) que ningún componente referencia.
Muchos son API pública intencional (`--z-sticky`, `--space-section`, `--shadow-md`, rungs de ramp que la
semántica no mapea): una app *puede* usarlos en su propio CSS, así que se protegen con el safelist, no se
borran del sistema.

### Validación

El prune se probó sólido, no asumido:

- **0 referencias colgando** dentro del CSS podado (ningún token conservado apunta a uno borrado).
- Cada `var()` semántico/primitivo que leen los componentes de la app **sigue declarado** tras la poda.

Por construcción del closure esto siempre se cumple: si un nombre se conserva, todos sus `var()` están en
el conjunto alcanzable.

## El patrón para un consumidor real

El prune es **por app**, no al momento de publicar el sistema. El sistema envía completo; cada app poda su
bundle:

1. En vez de `@import` de los tiers SCSS, la app compila su bundle de tokens una vez y linkea un
   `tokens.pruned.css` generado.
2. La demanda se arma de los componentes que la app importa + un escaneo del CSS propio de la app.
3. Los tokens dinámicos (los que toca el JS) van al safelist.
4. Corre en el `prebuild` de la app; el resultado es el `:root` sin los tokens muertos.

## Por qué la docs es la excepción

La app de la documentación **no** poda, y es correcto que no lo haga. Su página de referencia
(`referencia.astro` → `TokenTable`) renderiza `corpus.tokens`, los 276, y `used-values.ts` prueba cada uno
en runtime asignándole `var(--nombre)` a un probe. Su propósito literal es mostrarlos todos, vivos, en
cualquier brand y modo. Ahí la demanda **es** todo el sistema, y el prune correctamente conserva todo.

No es una falla del tool: es el tool reportando la verdad de que docs usa todo. Es exactamente la app que
lo ejercita entero, y por eso el peor caso posible para podar.
