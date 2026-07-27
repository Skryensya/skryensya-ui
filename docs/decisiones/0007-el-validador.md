---
num: 7
title: El validador es la capa de enforcement, y corre sobre todas las marcas
short: "El validador"
summary: >-
  Ninguna disciplina del sistema vale nada si es solo una convención: el validador la hace cumplir. Corre
  antes de cada build y sobre todas las marcas, con reglas para dirección de tiers, mode-completeness,
  forma de los nombres y contraste. El contrato de contraste es data, contrast-pairs.json, que rompe el
  build, y ya rechazó valores que un diseñador elegiría primero. El parser se comparte con la referencia
  de tokens del sitio a propósito, para que ambos lean el mismo CSS.
---

Toda disciplina de este sistema, las referencias apuntan hacia abajo, los modos están completos, no hay
valores crudos, el contraste se sostiene, no vale nada si es solo una convención que se le pide a la
gente seguir. Tres carpetas llamadas primitive/semantic/component no hacen un sistema de tres tiers; lo
hace la dirección *impuesta* de las referencias.

`scripts/lint.mjs` corre antes de cada build y sobre **todas las marcas**, porque una regla que solo se
cumple en la paleta por defecto no es una regla.

## Las reglas

1. **refs-resolve**, cada `var(--x)` apunta a una propiedad declarada.
2. **tier-direction**, las referencias apuntan hacia abajo o de costado; un styling hook nunca alcanza
   una rampa.
3. **mode-complete**, el set de tokens `light-dark()` base es igual al set de overrides de alto
   contraste; cada `light-dark()` tiene exactamente dos colores; los dos bloques de hc no derivaron.
4. **contrast**, cada par de `contrast-pairs.json` supera su ratio WCAG en su modo, en cada marca.
5. **name-shape**, kebab minúscula.
6. **name-tenancy**, ningún nombre de tier 2 contiene una palabra-artefacto
   ([por qué](/decisiones/0002-nombrar-por-rol-nunca-por-inquilino)).

## El contrato de contraste es data

El contraste se verifica normalmente a simple vista, con tests de screenshot por componente, o
directamente no se verifica, caro, frágil o inexistente, y nada de eso sobrevive a un swap de marca sin
que un humano vuelva a verificar.

Así que el contrato es data: `contrast-pairs.json` lista cada par frente-sobre-fondo, el ratio que debe
superar (`4.5` texto normal, `3` no-texto/grande, `7` AAA) y los modos que aplican. El validador lo
verifica contra cada marca y **rompe el build**.

**Omisiones deliberadas.** Los pares de texto deshabilitado están ausentes, no olvidados: WCAG 1.4.3
exime a los controles deshabilitados, así que lintearlos sería *incorrecto*, no laxo. Los bordes
decorativos (`border-subtle`) están ausentes por 1.4.11, que exime a los elementos sin significado.

## Evidencia de que funciona

La verificación de contraste rechazó `border-default` a 1.44:1 y `text-tertiary` a 3.74:1, los dos son
valores que un diseñador elegiría primero, los dos incorrectos según los requisitos que los propios
tokens declaran. Los valores corregidos llevan una nota diciendo que la decisión la tomó el validador.

Un test negativo deliberado, apuntar `--sk-button-bg` directo a `--ramp-accent-600`, confirma que la
regla de tier-skip rompe el build.

## La brecha conocida

El archivo de pares hay que mantenerlo: agregar un color semántico nuevo sin agregar su par significa
que queda sin verificar. **No hay todavía una regla que exija que todo token de texto/fondo aparezca en
algún par**, y agregarla es el próximo endurecimiento obvio.

Esa brecha tiene fecha de vencimiento: [el sitio](/decisiones/0012-monorepo-y-el-sitio) es la fuente de
componentes nuevos, y el syntax highlighting sería la familia de color más grande del sistema, el primer
cambio lo bastante grande como para que duela.

## El parser es compartido, a propósito

`scripts/parse.mjs` lee el CSS y lo usan dos cosas: el validador, para verificar las reglas, y la
referencia de tokens del sitio, para generarse. Una referencia generada desde una lectura distinta del
CSS que aquella contra la que se verifican las reglas describiría un sistema que nadie valida.
