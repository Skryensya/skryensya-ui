---
num: 21
title: Vaul es un pattern, y el drag es lo único que cuesta JS
short: "Vaul y el drag"
summary: >-
  Vaul es un panel modal anclado a un borde del viewport. Es un pattern y no un componente porque
  un drawer necesita su estructura exacta en el borde inline. Dialog permanece un dialog centrado;
  Dialog Vaul es una composición explícita que le da un Vaul block-end en móvil. El patrón exige
  <dialog> nativo. Zag no se usa: no tiene máquina de Vaul y la plataforma ya resuelve la modalidad.
  Drag-to-dismiss es el único JavaScript, es opt-in y usa el intent release.
---

Un **Vaul** es un panel modal anclado a un **borde** del viewport: llega desde ese borde, deja la
página inerte detrás de un backdrop, y se va por donde vino. El borde es la idea entera, un Vaul se
nombra por *de dónde viene*, nunca por la forma que hace al llegar. Evitamos `vault`, `sheet` y
`bottom sheet`: son nombres de forma, no del patrón.

## Por qué es un pattern y no un componente

La regla de la [decisión 8](/decisiones/0008-que-envia-tier-3) pregunta: *¿podría un segundo
componente necesitar esta estructura exacta?* Sí: **Drawer** (`sk-drawer`) es un Vaul en el borde
inline, a lo alto de la pantalla. Por eso `components/drawer.css` sólo reasigna los hooks
`--sk-vaul-*` desde `--sk-drawer-*`; no vuelve a implementar panel, borde, slide ni backdrop.

**Dialog no es un Vaul.** Es una caja centrada nativa a cualquier ancho. Cuando una tarea necesita una
hoja block-end en móvil, opta por el pattern **Dialog Vaul** con `data-sk-dialog-vaul`; esa
composición conserva el contrato `sk-dialog` y sólo le entrega geometría, motion y drag de Vaul en el
breakpoint compacto. No hay una variante implícita de Dialog ni una clase `sk-vaul` sobre él.

## Exige el `<dialog>` nativo

Por cada razón de la [decisión 11](/decisiones/0011-el-dialog-exige-el-elemento-nativo): focus trap,
ESC, fondo inerte, restauración del foco, top layer y `::backdrop` real pertenecen a la plataforma. Un
Vaul sobre un div los reimplementa en JavaScript, y `:modal` no está disponible para un div.

Los hooks pueden ser agnósticos al elemento; la maquinaria no. Esa separación es una decisión de la
plataforma, no una política local.

## Zag no se usa aquí

No existe una máquina de Vaul en Zag. `@zag-js/dialog` reimplementaría modalidad sobre un
`<div role="dialog">`; `@zag-js/presence` duplica `@starting-style` y `allow-discrete`. Ninguno aporta
coordinación de estado que justifique su runtime.

## El drag es lo único que cuesta JS, y es opt-in

`@skryensya/vanilla/vaul` mejora el markup ya escrito. Usa `data-sk-vaul` para un Vaul y
`data-sk-dialog-vaul` para la composición Dialog Vaul; abre con el atributo homónimo `-open` y cierra
con `-close`. No renderiza markup ni escribe clases.

Sin enhancer, Vaul sigue teniendo panel, slide, backdrop, ESC y click afuera. Con enhancer, debajo de
`52rem`, suma drag-to-dismiss. El CSS mantiene `--sk-vaul-drag-offset` y cada borde decide su dirección;
el enhancer sólo lee geometría y escribe offset/progreso. Se cierra por distancia o velocidad; un flick
hacia atrás gana a la distancia.

## Soltar es una intención propia

Un panel soltado no está *saliendo*: termina el impulso de la mano. Por eso consume `release`, no
`enter` ni `exit`. La curva y duración de release cubren tanto volver a casa como salir por completo.

Tirar para el lado incorrecto resiste con un tope de ~12px en vez de trabarse. El backdrop sigue
`--sk-vaul-drag-progress`, de modo que la página vuelve a medida que el panel sale.

## En desktop no se arrastra

El handle es táctil y desaparece arriba de `52rem`; CSS y enhancer leen el mismo breakpoint. El resto
del documento no se transforma: la modalidad la expresa el backdrop nativo, no una reducción del DOM
de fondo.
