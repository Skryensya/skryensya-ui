---
num: 20
title: Los efectos son CSS opt-in sobre tokens de motion, no un contrato
short: "Efectos, no contratos"
summary: >-
  Un cuarto tier de CSS, `@skryensya/core/effects/*`, para motion decorativo que no es un componente:
  scroll reveal, un header que colapsa al hacer scroll, un pulso de énfasis. Una clase que se aplica
  sobre cualquier elemento o raíz de componente, construida solo con tokens de intención de motion
  (ADR-4), progresiva y sin JavaScript. No es un Contract: no tiene signature, no lo compila el
  ai-compiler, no aparece en el manifiesto ni en la MCP.
---

El sistema tenía motion de dos formas: tokens de intención (ADR-4, `--motion-*`) que cada componente
consume para su propia transición, y un caso hecho a mano dentro de `apps/docs`, el header de una
página de componente colapsando en un bar fijo mientras se hace scroll. Ese segundo caso mezclaba dos
cosas en un mismo archivo: el MECANISMO (una property registrada que camina 0→1 con
`animation-timeline: scroll()`, un spacer cuya altura ES el rango de la animación) y la PINTURA
específica del sitio de docs (el acento, la placa de respaldo, el pin del tab strip). Nada de eso era
reutilizable, y no había ningún lugar para documentar "así se hace un reveal al hacer scroll" para
quien construye un producto sobre el kit.

## La pregunta que este ADR resuelve

¿Un efecto de scroll/entrada es un Contract (con signature, opciones tipadas, compilado por
`ai-compiler`, con bindings React y Vanilla) o es CSS que se aplica encima de lo que ya existe?

**No es un Contract.** Un Contract nombra una pieza de UI con una anatomía propia: partes, opciones,
un `template`. Un efecto no tiene anatomía: es una clase que un consumidor agrega a UN ELEMENTO QUE YA
EXISTE, sea un `<div>` autorado a mano o la raíz de un `Card` que el kit ya publica. Forzarlo a
Contract pediría una signature con una sola opción (`children`) envolviendo lo que el consumidor ya
tenía, una capa nueva sin anatomía propia que envolver.

## Qué es un efecto

Un cuarto tier de CSS junto a Patterns y Components, en `packages/core/css/effects/*.css`, publicado
como `@skryensya/core/effects/*`. Tres reglas, las mismas en cada archivo del directorio:

1. **Solo tokens de intención.** Nunca un `--scale-*` primitivo ni un literal (`4px`, `200ms`) suelto
   en la hoja: la distancia y el timing salen de `--motion-*` (ADR-4). Retunear el sistema mueve el
   efecto con él, y `_reduced-motion.scss` ya sabe qué hacer con esos tokens sin que el efecto declare
   nada.
2. **Progresivo.** Todo lo scroll-driven vive detrás de `@supports (animation-timeline: …)` y
   `@media (prefers-reduced-motion: no-preference)`. Sin soporte, el elemento queda en su estado de
   reposo (visible, sin pin), nunca oculto: no hay una regla base separada que sincronizar a mano.
3. **Solo GPU.** `transform`, `opacity`, `translate`, `blur` corto. Nada que dispare layout.

Y un límite editorial, no técnico: la carpeta se mantiene chica a propósito. Un catálogo de veinte
efectos es una tentación a decorar cada esquina; ver `/efectos` (`--motion-emphasize-*`: "atención
sobre un cambio real, con moderación") es el mismo argumento aplicado al índice completo, no solo a un
token.

## v1: tres efectos

- **`sk-fx-reveal`** (`effects/reveal.css`). Fade + rise la primera vez que un elemento cruza el
  viewport, `animation-timeline: view()`. Reemplaza el `IntersectionObserver` + clase a mano que un
  producto sobre el kit habría escrito por su cuenta.
- **`sk-fx-collapse-header`** (`effects/collapse-header.css`). El mecanismo generalizado del header de
  `/componentes/*`: una property registrada (`--sk-fx-collapse-progress`), un par de clases
  (`sk-fx-collapse-header`, `sk-fx-collapse-header__spacer`) y tres hooks que el consumidor declara
  (`--sk-fx-collapse-range`, `--sk-fx-collapse-bar-height`, `--sk-fx-collapse-top`). El sitio de docs
  es su primer y, por ahora, único consumidor (`ComponentPageShell.astro`); lo que antes vivía
  hardcodeado en `apps/docs/src/styles/site.css` ahora es la pintura de un consumidor sobre un
  mecanismo publicado.
- **`sk-fx-pulse`** (`effects/pulse.css`). Un `scale` de ida y vuelta, dos veces, sobre
  `--motion-emphasize-*`. La property de ese intent ya dice "atención sobre un cambio real. Usar con
  moderación"; este archivo es esa property hecha clase.

## Qué se rechazó

- *Un Contract `Reveal`/`Pulse` con signature propia.* Ver la sección de arriba: no hay anatomía que
  nombrar, solo una clase sobre algo que ya existe.
- *JavaScript (`IntersectionObserver`, un `ScrollTrigger`-like).* Los tres efectos de v1 son
  expresables enteros en CSS con `animation-timeline`; una dependencia de runtime para lo que el
  navegador ya resuelve es peso sin motivo, el mismo argumento que ya corrió Anclaje (ADR-11) contra
  un popper en JS.
- *Un catálogo grande desde el día uno.* Tres efectos, elegidos porque cada uno prueba una forma
  distinta del mecanismo (`view()`, `scroll()` con property registrada, sin timeline en absoluto). Uno
  nuevo entra cuando un producto real lo necesita, no por completar una lista.
