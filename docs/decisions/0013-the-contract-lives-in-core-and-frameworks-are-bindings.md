---
num: 13
title: El contrato vive en core y los frameworks son bindings
short: "Core es el contrato"
summary: >-
  El kit se consume por dos rutas (React y markup autoreado) y hasta ahora ninguna autoridad las
  cubría a las dos: core exportaba las clases pero casi ninguna opción, React redeclaraba sus props
  y `docs/ai/schemas/*.json` transcribía todo a mano por tercera vez. Esta decisión hace de core la
  única autoría del contrato de un componente (firmas, opciones, parts, el mapeo de opción a
  atributo y la accesibilidad debida) y convierte a React y a Vanilla en bindings que lo *realizan*.
  Una opción que un binding redeclara deja de ser una opción: es drift, y rompe el build.
---

## El problema

Un componente de este sistema se consume de dos maneras. Un consumidor React escribe
`<Button variant="accent">`; un consumidor de la capa vanilla escribe
`<button class="sk-button sk-interactive" data-sk-button data-variant="accent">`. Son la misma
cosa dicha dos veces, y hasta hoy nada lo garantizaba.

Lo que había, medido:

- **56 de 62** módulos de core exportan `*Parts`: las clases, o sea el esqueleto del markup contract.
- **14 de 62** exportan `*Options`, y React las importa en **8** componentes.
- `packages/react/src/components/button.tsx` **redeclara** `variant`, `size` e `iconOnly` en su propio
  `ButtonAppearanceProps` en vez de usar `ButtonOptions`, que existe en
  [`packages/core/src/button.ts`](../../packages/core/src/button.ts) tres archivos más allá.
- `docs/ai/schemas/button.json` volvía a escribir los mismos cuatro variants, los mismos tres sizes y
  los mismos import paths, a mano, por tercera vez.

Tres transcripciones del mismo hecho y ningún punto donde compararlas. El Gate 1 que existía escaneaba
con regex y tenía una lista manual de excepciones de atributos nativos: acusaba el síntoma sin poder
nombrar la causa.

## La decisión

**Core exporta un contract por familia, y es su única autoría.** Un contract declara:

- **Signatures**: la identidad lógica separada del nombre exportado, el host HTML al que aterriza y el
  valor que la discrimina. `Button.action` y `Button.navigation` son dos firmas del mismo export,
  discriminadas por `href`, con host `<button>` y `<a>`.
- **Options**: los tipos que hoy viven sueltos en `*Options`, más **el atributo sobre el que cada una
  se escribe**. `variant` no es solo `ButtonVariant`: es `ButtonVariant` que aterriza en
  `data-variant`. Ese mapeo es lo que hacía falta para que las dos rutas sean comparables.
- **Parts y part template**: las clases que ya exportaba `*Parts`, más el subárbol que cada firma
  posee y dónde caen sus hijos. `navListParts` tiene ocho parts y React expone tres surfaces: el
  template es lo que hace que esas dos cosas sean *la misma estructura* y no dos.
- **Constraints y ARIA**: `requires`, `forbids`, `exactlyOneOf`, padres válidos, cardinalidad, y el
  nombre accesible que una firma debe cobrar (`iconOnly` exige `aria-label`). Estructurado, nunca en
  prosa: la regla de composición de `nav-list` (un link siempre dentro de un group, o el markup queda
  inválido) era un párrafo en un JSON y pasa a ser `parents: [NavListGroup]`.

**React y Vanilla son bindings.** Un binding realiza el contract y no lo repite. `ButtonProps` deja de
declarar `variant?: ButtonVariant` y pasa a derivarse de `ButtonOptions`. Redeclarar una opción no es
un atajo: es una segunda verdad, y es exactamente lo que produjo el drift que veníamos parchando.

## Quién lo prueba

Dos gates, porque son dos afirmaciones distintas:

1. **Conformidad del binding (G1).** La TypeScript Compiler API prueba que las props públicas del
   binding React son asignables a las options del contract. Su trabajo se reduce a esta única
   afirmación, que es lo único que solo ella puede probar. No extrae el catálogo: el contract ya es
   un valor, se importa y se serializa.
2. **Simetría (G2).** Se renderizan las dos rutas desde el mismo usage tree y se comparan los árboles
   DOM normalizados: parts, atributos mapeados, árbol ARIA. Si difieren, rompe. Este gate no existía
   de ninguna forma y es el que hace que "dos bindings" signifique algo verificable.

## Lo que se rechazó

**TypeScript como autoridad única**, que es lo que proponía el documento de arquitectura. Los tipos no
pueden expresar el anidamiento de parts ni una regla de ARIA condicional sin codificaciones de tipos
que nadie va a leer. El markup es dato, no tipo.

**El contrato en `contracts/*.yaml`, fuera de core.** No tocaba el kit y mantenía a core sin build
(decisión 6), pero volvía a partir la verdad: core seguiría exportando `*Parts` por su lado y nadie
garantizaría que el YAML lo siga. La misma enfermedad con otro formato.

**Declarar el mapeo a mano en el overlay semántico**, `{variant: {react: "variant", markup: "data-variant"}}`.
Es copiar props a mano, que es el hábito que esta decisión existe para terminar.

**Reconciliar dos extracciones en el compilador**, adivinando que `variant` se corresponde con
`data-variant` por regla de nombre. Habría funcionado hasta el primer caso irregular, y después la
tabla de excepciones habría sido la verdad real.

## Costo

Aproximadamente 48 módulos de core que hoy solo exportan `*Parts` necesitan contract completo, y unos
50 componentes React tienen que dejar de redeclarar sus props. Es mecánico y el typecheck actual lo
verifica paso a paso, pero es la fase más larga de la reconstrucción y no produce nada visible
mientras dura. Se acepta porque la alternativa, seguir manteniendo tres copias, ya demostró su costo
en cada bug de drift que este repo arrastró.
