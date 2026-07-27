---
num: 1
title: Tres tiers, y la dirección de las referencias
short: "Tres tiers"
summary: >-
  Un tier no se define por la carpeta donde vive, sino por qué puede referenciar: los primitivos no
  referencian nada, los semánticos referencian primitivos, y los componentes solo semánticos. Las
  referencias apuntan hacia abajo o de costado, nunca hacia arriba, y tier 3 no puede saltar a tier 1,
  porque ese salto deja a un componente sin modo oscuro. El prefijo del nombre marca el tier, el borde
  entre tiers es una cascade layer, y el sistema envía la clase junto con sus styling hooks.
---

Un tier no se define por la carpeta donde vive, sino por **qué puede referenciar**. Tres carpetas
llamadas primitive/semantic/component no hacen un sistema de tres tiers; lo hace la dirección obligada
de las referencias.

| Tier | Responde | Puede referenciar |
|---|---|---|
| **1 primitive** | qué valores existen | nada, es el fondo |
| **2 semantic** | qué significa un valor | primitivos, y de costado otros semánticos |
| **3 component** | dónde se usa un valor | solo semánticos, **nunca** primitivos |

## La regla

Las referencias apuntan hacia abajo o de costado, nunca hacia arriba, y **tier 3 no puede saltar a
tier 1**.

Ese salto es el que parece inofensivo y no lo es. Un styling hook que toma `--ramp-accent-600`
directamente se saltea la capa donde vive `light-dark()`, así que ese componente, y solo ese, deja de
tener modo oscuro. El defecto no se ve hasta que alguien mira la página en oscuro.

No es una convención: [el validador](/decisiones/0007-el-validador) la hace cumplir.

## Tier 3 es opt-in y vive en el elemento

`components/button.css` se scopea a `.sk-button`, nunca a `:root`. Un consumidor que no envía botones
no descarga ni un byte.

La alternativa era el modelo de Adobe Spectrum: emitir cada component token a `:root`. Es auditable en
un solo lugar, pero cada componente sin usar es peso muerto en el CSS de todos. Se rechazó por costo de
bundle. La otra alternativa era saltear tier 3 entero, lo que hace la mayoría de los sistemas, y lo
correcto salvo que haya multimarca. El sistema es multimarca, así que tier 3 se gana su lugar: es
exactamente el caso que lo justifica, y se busca `--sk-button-bg` como contrato público.

## El prefijo marca el tier

Un primitivo se lee `--ramp-accent-600`; un semántico, `--color-action-primary`. El prefijo distinto es
intencional: ver un `--ramp-*` dentro del CSS de un componente es la señal visible, a simple vista, de
que alguien se saltó un tier. Aplanar a `--accent-600` pierde esa señal.

## Los styling hooks pierden el segmento del grupo

Un componente tiene un look base más variantes (`primary`, `danger`) y tamaños (`sm`, `lg`). La
codificación ingenua le da a cada uno su propia variable, `--sk-button-primary-bg`,
`--sk-button-danger-bg`, que es una explosión combinatoria entre la que el CSS del consumidor luego
tiene que ramificar con `if`/`else`.

En vez de eso, la base y todas las variantes declaran el **mismo** styling hook. La variante lo
re-declara en un selector más específico y **gana por especificidad**:

```css
.sk-button                         { --sk-button-bg: var(--color-action-neutral); }
.sk-button[data-variant="primary"] { --sk-button-bg: var(--color-action-primary); }
```

El consumidor escribe `background: var(--sk-button-bg)` una vez y nunca ramifica.

Eso también hace el override externo trivial y total: `.hero .sk-button { --sk-button-bg: rebeccapurple }`
reestiliza todas las variantes de ese scope con una línea, porque todas leen el mismo hook.

Las variantes se ganan por especificidad de selector. Un consumidor que invente un selector más
específico puede pisar una variante sin querer.

## El borde del tier es una cascade layer

```css
@layer primitives, semantic, components, overrides;
```

La precedencia entre tiers no depende del orden de los `@import`: está en la cascada. Una layer
posterior gana, así que las overrides de marca y contraste le ganan a los semánticos base, sin importar
el orden de importación. Y como **cualquier regla sin layer le gana a todas las layers**, la app pisa un
hook sin pelear especificidad.

Eso mueve la ortogonalidad de [las dimensiones](/decisiones/0003-cuatro-dimensiones-que-componen) de
ser disciplina de orden de imports a estar en la cascada misma.

## Qué envía el sistema

**La clase y sus styling hooks.** Importar `components/button.css` te da un botón que se ve como un
botón; los hooks son cómo lo cambiás sin tocar un selector.

Esto es una **corrección**. Durante mucho tiempo esta decisión decía lo contrario, styling hooks y
nada más, con la app consumidora escribiendo el CSS estructural, y ese modelo no sobrevivió al
contacto con el uso. Los detalles de cómo se rompió, y qué distinción sí sigue en pie, están en
[qué envía tier 3](/decisiones/0008-que-envia-tier-3).
