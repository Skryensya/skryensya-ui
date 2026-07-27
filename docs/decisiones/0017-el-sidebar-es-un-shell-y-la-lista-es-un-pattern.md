---
num: 17
title: El sidebar es un shell, y la lista que hospeda es un pattern
short: "Sidebar: shell + lista"
summary: >-
  El sidebar tenía un sk-sidebar__link, y el navbar tenía el suyo: las mismas reglas escritas dos veces,
  libres de divergir. La lista de destinos nunca fue de ninguno de los dos, estaba de invitada, así que
  nombrarla por su anfitrión era nombrar a un inquilino. Sale a un pattern, nav-list, porque la pregunta
  de la decisión 8 aquí no se responde con una predicción: dos componentes del repo comparten la
  estructura exacta hoy. El sidebar queda como shell: header, un medio que scrollea, footer y el
  colapso.
---

El sidebar enviaba `sk-sidebar__list`, `sk-sidebar__item` y `sk-sidebar__link`. El navbar enviaba
`sk-navbar__list`, `sk-navbar__item` y `sk-navbar__link`. Las dos listas eran la misma idea escrita
dos veces: un `<ul>` sin viñetas, un `<li>`, un `<a>` en fila con un icono, un label y un radio.

Dos copias de una estructura no son un detalle de prolijidad. Son dos cosas que pueden divergir, y
que van a divergir, porque nada las obliga a moverse juntas.

## La lista nunca fue del sidebar

[La decisión 2](/decisiones/0002-nombrar-por-rol-nunca-por-inquilino) dice que un nombre dice el rol y
nunca al inquilino. `sk-sidebar__link` nombra al inquilino: describe *dónde está parada* la lista, no
*qué es*. Y es la misma clase de error que un ramp llamado `blue`, se lee bien hasta el día en que
un drawer, un command palette o el navbar necesitan la misma lista, y entonces el nombre miente.

La lista de destinos está **de invitada** en el sidebar. Ese es el corte: una cosa es el sidebar, y
otra es su contenido.

## Por qué es un pattern y no un componente

[La regla de la decisión 8](/decisiones/0008-que-envia-tier-3) es una sola pregunta: *¿muchos
componentes comparten esta estructura exacta?* Si sí, es un pattern y envía estructura; si no, es un
componente y envía sólo hooks.

Esa decisión también dice que la pregunta se responde **con previsión**, y que ante duda genuina hay
que preferir `component`, porque promover después es aditivo y degradar rompe a todos.

Aquí no hay previsión ni duda: **el navbar y el sidebar comparten la estructura hoy, en este repo**.
La respuesta no es una predicción sobre un consumidor hipotético, es un hecho verificable, había dos
copias. Eso es exactamente la evidencia que la regla pide, así que `nav-list` envía **hooks y
estructura**, y es opt-in como el [icono](/decisiones/0015-el-icono-es-un-pattern-y-el-set-es-una-marca):
una app puede no tener navegación.

La orientación no es una segunda estructura. Es una variante: el mismo markup, con
`data-orientation="horizontal"` re-declarando los hooks que cambian.

## No es un menu

`role="menu"` es un menú de aplicación con `menuitem` adentro, y esto es una lista de links: el markup
se queda en `<nav><ul><li><a>`, que es lo que un lector de pantalla tiene que escuchar. Llamarlo
`menu` habría invitado a poner ese rol, que es una trampa de accesibilidad. `nav-list` dice lo que es.

## Cómo el shell ajusta a su invitada sin tocarla

Contraído, el sidebar necesita que los labels se apaguen y que el icono quede centrado en el riel. La
tentación es que el pattern sepa del sidebar:

```css
/* NO: el pattern pasa a conocer a su anfitrión, tenancy, al revés */
.sk-sidebar[data-state="collapsed"] .sk-nav-list__label { opacity: 0 }
```

Lo correcto es al revés: el shell **re-declara los hooks del pattern**, y la cascada los baja.

```css
.sk-sidebar[data-state="collapsed"] {
  --sk-nav-list-label-opacity: 0;
  --sk-nav-list-link-padding-x: calc((var(--size-control-sm) - var(--size-icon-md)) / 2);
}
```

Para eso existe un styling hook: es la superficie pública de override. El sidebar nunca toca el markup
de la lista, y un sidebar que hospede otra cosa simplemente no setea nada. El mismo mecanismo le presta
su intención de motion (`--sk-nav-list-duration`), así los labels se desvanecen en el mismo tiempo en
que se mueve el ancho, sin que el pattern sepa por qué.

El padding del riel se **calcula** en vez de adivinarse, porque un `6px` a mano deja de centrar en
cuanto cambia la densidad o una marca toca la escala de iconos.

## Lo que se rechazó

- *Dejar la lista adentro del sidebar, y que el navbar copie.* Es lo que había. Dos copias que nadie
  obliga a moverse juntas: el día que el link del sidebar cambia de radio, el del navbar no se entera.
- *Prefijar todo con el anfitrión, como hace shadcn* (`SidebarMenu`, `SidebarMenuButton`). Es coherente
  y es cómodo de leer, pero deja la lista siendo propiedad del sidebar, y entonces el navbar necesita
  la suya. Es la decisión 2 al revés.
- *Llamarlo `menu`.* Más corto y más cerca de shadcn, pero invita a `role="menu"`, que es otra cosa.
- *Un part de icono en la lista.* El icono es un pattern y trae su propia caja (decisión 15). Un slot
  aquí sería la lista re-declarando lo que `sk-icon` ya envía.
- *Un label visible adentro del trigger del sidebar.* Es lo que había, y era un bug: el trigger mide un
  icono de ancho, así que el texto se le salía por el costado. El nombre accesible va en un
  `aria-label` o en texto visualmente oculto.

## Costo

Un pattern es un compromiso más duro que un componente: ahora hay estructura enviada que los
consumidores heredan, y degradarla rompe a todos. La decisión 8 avisa de eso y por eso pide evidencia
antes de promover, aquí la evidencia estaba, pero el riesgo real es que un tercer consumidor aparezca
con una lista que se parece un 90% y termine peleándose con la estructura en vez de escribir la suya.
Si eso pasa, la respuesta no es agregarle variantes al pattern hasta que entren todos: es aceptar que
esa lista era otra cosa.

Y hay una migración: `sk-sidebar__link` y `sk-navbar__link` ya no existen. No hay alias y no hay
deprecación, porque el sistema todavía no tiene consumidores fuera de este repo, el día que los tenga,
este cambio ya no se puede hacer así.
