---
num: 12
title: El Toolbar trata cada widget compuesto como una parada
short: "Segmented dentro de Toolbar"
summary: >-
  El enhancer de Toolbar recorría con flechas TODO botón enfocable dentro de la raíz, sin distinguir
  entre un botón suelto y una opción de un widget compuesto (Segmented, Tabs) que ya trae su propio
  roving tabindex. Anidar un Segmented dentro de un Toolbar producía un salto doble: la opción movía
  el foco una posición y el Toolbar, al ver el mismo evento burbujeado, lo movía una segunda vez. Esta
  decisión hace que el Toolbar sólo visite la parada con `tabindex="0"` de cada hijo y respete
  `event.defaultPrevented`, para que un widget compuesto cuente como una parada, no como N.
---

## El problema

El component preview de este sitio agrupa dos controles relacionados en su header: el selector de
tamaño de pantalla y el toggle Vanilla/React. Ambos son Segmented: cada uno su propio `radiogroup`
con roving tabindex ([`connectSegmented`](/../../packages/vanilla/src/components/segmented.ts): sólo
la opción seleccionada tiene `tabindex="0"`, el resto `-1`). Agruparlos visualmente como una sola
barra de controles es exactamente lo que Toolbar existe para hacer.

Pero el enhancer de Toolbar no sabía nada de esto:

```ts
const controls = Array.from(root.querySelectorAll<HTMLElement>(controlsSelector));
```

`controlsSelector` es `button:not([disabled]), a[href], ...`: recoge TODOS los botones dentro de la
raíz, sin filtrar por tabindex. Anidar un Segmented de 3 opciones dentro de un Toolbar significaba que
el Toolbar veía 3 paradas donde debía ver 1. Peor: Segmented ya maneja sus propias flechas
(`onOptionKeydown`, con `event.preventDefault()` y `next.focus()`), así que al presionar
`ArrowRight` con el foco en una opción, dos handlers reaccionaban al mismo evento:

1. El keydown del option de Segmented movía el foco a la siguiente opción y llamaba `preventDefault()`.
2. El evento burbujeaba hasta la raíz del Toolbar, cuyo propio `onKeyDown` no comprobaba
   `defaultPrevented`: encontraba el `document.activeElement` ya actualizado por el paso 1, y lo
   volvía a mover una posición más.

Una sola flecha saltaba dos paradas.

## La decisión

Dos cambios en [`packages/vanilla/src/components/toolbar.ts`](/../../packages/vanilla/src/components/toolbar.ts):

1. **Filtrar por parada, no por foco posible.** `controls` ahora excluye cualquier elemento con
   `tabindex="-1"`. Un widget compuesto que expone su propio roving tabindex (Segmented, y cualquier
   futuro widget que siga el mismo contrato) pasa a contar como una sola parada para el Toolbar, sin
   que el Toolbar tenga que conocer su tipo.
2. **Respetar `event.defaultPrevented`.** Si el hijo ya manejó la tecla (Segmented, Tabs), el
   `onKeyDown` del Toolbar no vuelve a moverse. Esto no es específico de Segmented: es el contrato
   general "quien ya consumió el evento no lo vuelve a procesar el padre".

Con esto, un Segmented anidado se comporta como el patrón de la ARIA APG para "toolbar con widgets
compuestos": Home/End y las flechas del Toolbar navegan ENTRE widgets (o botones sueltos); una vez el
foco entra a un widget compuesto, sus propias flechas navegan DENTRO de él y no escapan al siguiente
grupo del Toolbar.

## Dónde se usa

El propio header del component preview (`apps/docs/src/components/ComponentPreview.astro`) es el caso real,
no un ejemplo de laboratorio: el selector de tamaño de pantalla y el toggle Vanilla/React son ahora
un `sk-toolbar` con dos `sk-toolbar__group`, cada uno conteniendo un Segmented, separados por un
`sk-toolbar__separator`. Está documentado como patrón en
[`/componentes/toolbar`](/componentes/toolbar), sección "Toolbar con widgets compuestos".

## Lo que no se hizo

No se le pidió a Segmented (ni a Tabs) que supiera que puede vivir dentro de un Toolbar. El contrato
sigue siendo unidireccional: cualquier widget que ya implemente roving tabindex correctamente
(una parada en `tabindex="0"`) funciona anidado sin cambios propios, porque es el Toolbar quien se
adapta a ese contrato, no al revés.
