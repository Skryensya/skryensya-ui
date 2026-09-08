---
num: 8
title: El sidebar se contrae a un riel, así que no es un disclosure
short: "El sidebar se contrae"
summary: >-
  La decisión 8 manda los disclosures al <details> nativo, y un sidebar colapsable parece uno. No lo es:
  un <details> cerrado esconde su contenido, y un sidebar contraído lo sigue mostrando como iconos. Como
  la plataforma no envía nada que se angoste sin esconder, un enhancer chico se gana su lugar sin
  reimplementar nada. Los dos anchos son dos valores de un solo styling hook, contraído es un state que
  escribe la máquina, y los labels se desvanecen pero no se quitan del DOM: contraído, el label es lo
  único que nombra al icono.
---

[La decisión 8](./0002-what-tier-3-ships.md) tiene una tabla que corta por componente: si la
plataforma lo envía, es solo CSS y no hay máquina. El disclosure está en esa tabla, con
`<details>` / `<summary>` al lado. Un sidebar colapsable **parece** un disclosure: hay un toggle, hay
algo que se abre y se cierra, hay un `aria-expanded`. Aplicar la regla de memoria manda a exigir un
`<details>` y cerrar el tema.

Es la conclusión equivocada, y vale la pena decir por qué, porque la regla está bien.

## Esconder y angostar no son lo mismo

Un `<details>` cerrado **esconde su contenido**: queda el `<summary>` y nada más. Eso es lo que es un
disclosure, y para eso el elemento nativo es perfecto.

Un sidebar contraído **no esconde nada**. Se angosta a un riel y los links siguen ahí, visibles como
iconos, clickeables, en el orden de tabulación y en el árbol de accesibilidad. Lo que cambia es el
**ancho**, no la presencia. Un `<details>` no puede expresar eso a ningún precio: su estado cerrado es
justamente el que borra lo que el riel tiene que seguir mostrando.

Así que la plataforma no envía nada para esto, y la otra mitad de la tabla de la decisión 8 aplica: una
máquina se gana su lugar. El enhancer es chico, un booleano, `aria-expanded`, `aria-controls` y un
`data-state`, y **no reimplementa nada**, porque no hay nada nativo que reimplementar. La objeción de
[CSS puro](./0019-public-palettes-and-constant-semantics.md) no tiene de dónde agarrarse, igual que no la tenía con
el combobox.

**La regla no falló: la premisa era falsa.** Un sidebar colapsable nunca fue un disclosure.

## Los grupos de adentro sí son disclosures

El corte no es "sidebar sí, plataforma no". Un grupo de navegación anidado que colapsa **sí** esconde
sus items, así que sí es un disclosure, y va en `<details>` / `<summary>` como dice la decisión 8. El
mismo componente usa el elemento nativo donde corresponde y una máquina donde no hay elemento. El
principio es uno y cae distinto en cada lugar porque la plataforma es distinta en cada lugar.

## Un ancho, dos valores, un solo hook

Los dos anchos no son dos propiedades. `--sk-sidebar-inline-size` arranca en
`--sk-sidebar-expanded-inline-size`, y `[data-state="collapsed"]` lo **re-declara** en
`--sk-sidebar-collapsed-inline-size`. El consumidor escribe `inline-size: var(--sk-sidebar-inline-size)`
una vez y no vuelve a tocar el tema: no hay una segunda regla que mantener sincronizada, que es
exactamente lo que dice el contrato de styling hooks, una variante re-declara el hook que cambia en vez
de agregar uno nuevo.

Contraído es un **state**: lo escribe la máquina como `data-state` en la raíz, nunca a mano y nunca como
modificador BEM.

La duración sale de los tokens de intención de expand/collapse
([decisión 10](./0004-motion-through-intent-tokens.md)), que ya se achican solos bajo
`prefers-reduced-motion`, por eso el CSS del sidebar no tiene ni un bloque de media query para eso.

## El label se desvanece, no se va

Contraído, la opacidad del label va a 0, `--sk-nav-list-label-opacity`, un hook del pattern de la lista
que el shell re-declara al contraerse ([decisión 17](./0019-public-palettes-and-constant-semantics.md)), 
y el riel recorta lo que sobra. El label **sigue en el DOM**, y eso no es una simplificación: es lo único
que le pone nombre al icono para un lector de pantalla. Un usuario vidente ve un riel de dibujos; un
usuario de lector de pantalla escucha "Reportes" porque el texto nunca se fue.

Por lo mismo el sidebar **no tiene un part de icono**. El icono es un
[pattern](./0019-public-palettes-and-constant-semantics.md) y trae su propia caja; el color
lo saca de `currentColor`, que el link ya fija. Un `sk-sidebar__icon` sería el sidebar re-declarando lo
que `sk-icon` ya envía, la duplicación que un pattern existe para prevenir.

## Lo que se rechazó

- *Exigir `<details>`.* Aplica la regla de la decisión 8 a una premisa falsa. El estado cerrado esconde
  los links, así que el riel, el punto entero del componente, deja de existir. El componente que
  quedaría es un menú que se abre y se cierra, no un sidebar.
- *`display: none` o `visibility: hidden` en los labels.* Renderiza igual de bien y saca los nombres del
  árbol de accesibilidad: el riel queda como una fila de iconos anónimos. El navegador no avisa y ningún
  test de layout falla.
- *Un `visually-hidden` en los labels al contraer.* Conserva la accesibilidad pero mata la transición:
  el ancho anima y el texto desaparece de golpe en el primer frame.
- *Dos hooks de ancho, uno por estado.* Obliga al consumidor a escribir dos reglas y a saber cuál
  aplica cuándo. El estado ya sabe cuál es; el hook es uno.
- *Persistir la preferencia adentro del enhancer.* `localStorage` es una decisión de la app, no del
  design system, con qué clave, por usuario o por dispositivo, y si sincroniza. El enhancer emite
  `sk-collapsed-change` y React llama `onCollapsedChange`; guardar eso es del consumidor.

## Costo

El trigger necesita un nombre accesible que el consumidor escribe, porque el enhancer parchea atributos
y nunca contenido. El trigger mide un icono de ancho, así que ese nombre va en un `aria-label` o en
texto visualmente oculto, un label visible adentro sería texto adentro de un cuadrado del ancho de un
icono. Un trigger sin nombre queda anónimo, y el sistema no puede detectarlo por él.

Y el riel apuesta a que los iconos se entienden. Un sidebar contraído es utilizable en la medida en que
sus iconos signifiquen algo sin su label, lo cual es cierto para "inicio" y falso para casi cualquier
sección con nombre propio. El componente permite arrancar contraído; que eso sea buena idea es del
consumidor, y para la mayoría de las apps la respuesta es no.
