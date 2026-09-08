---
num: 17
title: Meter pinta su etiqueta y su valor; Progress no
short: "El header de Meter"
summary: >-
  Meter y Progress compartían track y fill al pixel: mismo `border-radius`, mismo alto, mismo hook de
  tono. La distinción entre los dos (una medición ya sucedida contra el avance de una tarea) vivía
  solo en el `role` ARIA y en `aria-label`/`aria-valuetext`, invisibles los dos. Un lector que mirara
  la página no tenía manera de distinguirlos. Esta decisión le da a Meter una fila visible de
  etiqueta + valor sobre la barra, tomada del mismo precedente que ya justifica su `role="meter"`
  propio (el meter de Adobe Spectrum), y deja a Progress exactamente como estaba.
---

## El problema

`meter.css` decía, literalmente, "deliberadamente idéntico en forma a Progress". Y lo era: mismo
track sunken, mismo fill con `border-radius: var(--radius-pill)`, mismo hook `--sk-*-color` por tono.
Lo único que los distinguía era semántico y estaba fuera de la vista:

- El `role` (`meter` contra `progressbar`).
- `aria-label`/`aria-valuetext`, que un lector sin lector de pantalla nunca oye.

Eso deja el mismo problema que motivó separar los dos contratos en primer lugar (ver el banner de
`meter.ts`): la distinción "medición ya sucedida" contra "avance de una tarea" es real y vale la pena,
pero solo llegaba a quien usa un lector de pantalla. Un lector visual viendo dos barras azules idénticas
en dos páginas de la documentación no tenía ninguna pista.

## La decisión

Meter gana una fila de header, pintada arriba del track:

- `label` (ya existía como opción, ya alimentaba `aria-label`) ahora TAMBIÉN se pinta como texto
  visible, vía `textFromOption` en un `<span>` propio.
- `valueText` (ya existía, opcional, ya alimentaba `aria-valuetext`) TAMBIÉN se pinta, solo cuando el
  autor lo da. WAI la lista como recomendada, no requerida, y un número desnudo ("68%") junto a una
  barra sin etiqueta es menos legible que ningún número.
- Ninguno de los dos deja de ser un atributo ARIA real en el track: `textFromOption` agrega una
  SEGUNDA lectura visible de la misma cadena, no reemplaza la primera. La lectura de un lector de
  pantalla nunca depende de si el layout visual decidió mostrar algo.

El precedente es Adobe Spectrum: es el sibling más cercano a este contrato (el mismo split ARIA
`meter` contra `progressbar` que ya seguíamos), y su `<sp-meter>` pinta por defecto "a label that
describes what is being measured... and a percentage value showing the numeric progress". El track y
el fill de Spectrum son casi idénticos entre meter y progress-bar. La forma no es donde el ecosistema
distingue los dos, la etiqueta sí.

`Progress` no cambia. Sigue siendo una barra desnuda: su lugar de uso típico (una tabla, una toolbar,
una card) rara vez tiene espacio ni necesidad de una etiqueta permanente junto a la barra, y su propio
`aria-label` ya cubre el caso con lector de pantalla.

## El costo, dicho

El árbol del componente creció un nivel: `.sk-meter` (el track, `role="meter"`) dejó de ser el nodo
raíz y pasó a ser un hijo de un nuevo `.sk-meter-group`, junto a `.sk-meter-group__header`. Todo lo que
apuntaba a `.sk-meter` como hijo directo de un layout (el caso de `component-preview.css` que fuerza
`flex: 1 1 100%` en el stage) tuvo que reapuntar a `.sk-meter-group`. El binding React ya no puede
pasar `className`/props sueltos a "el elemento raíz" sin decidir cuál de los dos raíces recibe qué:
`className` va al grupo, el resto de `HTMLAttributes` va al track.

## Lo que no se hizo

No se agregó coloreado automático por zona (lo que hace `<meter>` nativo: verde/amarillo/rojo según
`low`/`high`/`optimum`). Es el otro precedente real que arrojó la investigación, pero cambia la API del
contrato (opciones nuevas, un cómputo de zona que hoy el autor hace a mano eligiendo `tone`) en vez de
solo el CSS. Si se pide después, el hook `tone` ya está. Solo faltaría quién lo calcule.
