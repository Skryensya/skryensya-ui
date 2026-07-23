---
num: 2
title: Nombrar por rol, nunca por inquilino
short: "Nombrar por rol"
summary: >-
  Un nombre que dice quién usa algo se vuelve mentira cuando un segundo algo lo necesita; un nombre que
  dice qué es sobrevive. Por eso las rampas se nombran por rol (accent, danger) y no por hue (blue, red)
lo que permite que una marca sea un swap de tier 1, y la elevación nombra una altura, no un
  componente. El validador lo hace cumplir con una lista curada de palabras-artefacto: se demuestra que
  derivarla de los componentes condena buenos nombres y bendice al defecto conocido.
---

Un nombre que dice **quién** usa algo se convierte en mentira en el momento en que un segundo algo lo
necesita. Un nombre que dice **qué es** sobrevive. Es un solo principio, y el sistema lo aplica en dos
tiers.

## Tier 1: las rampas se nombran por rol, no por hue

Una **ramp** es una secuencia ordenada de tonos para un rol (`accent`, `neutral`, `danger`, `success`,
`warning`), recorrida por posición (`50`…`950`). Nunca por hue (`blue`, `gray`, `red`).

Esa indirección es el mecanismo *entero* que hace que una marca sea un swap de tier 1: `default` pone azul
balanceado en `accent`, `ember` pone naranja vivo, y `accent-600` sigue significando "el tono pleno,
apenas oscurecido" en las dos. Si la rampa se llamara `ramp-blue`, `ember` tendría una rampa llamada
"blue" llena de naranja, una mentira en el nombre, y la capa semántica tendría que cambiar
por marca, lo que rompería [la ortogonalidad](/decisiones/0003-cuatro-dimensiones-que-componen).

**Por qué `ramp` y no las alternativas:**

- `palette` implica un *conjunto sin orden*; pierde que `500 → 700` es un movimiento direccional sobre
  una pendiente de luminosidad, que es la operación de la que dependen el modo oscuro y los hovers.
- `shades` (Tailwind) implica *solo más oscuro*, pero los pasos `50`–`400` son tintes. Falso para media
  rampa.
- `scale` es la palabra más precisa para "secuencia ordenada", pero ya está tomada por los primitivos
  que no son color (`scale-space`, `scale-radius`).
- `tones` (Material) es correcta pero más vaga.

**Debilidad aceptada:** `ramp` es jerga de especialistas. `color` sería más legible para alguien
externo. Se tolera porque marca el tier en el nombre. Se revisa solo si la audiencia principal de los
nombres pasa a ser diseñadores o consumidores externos.

## Tier 2: la elevación nombra una altura, no a un inquilino

Mismo argumento, un tier más arriba. Tier 2 llegó a tener `--elevation-overlay` y `--elevation-modal`
nombres de componentes filtrados hacia arriba. Un drawer no-modal necesita la misma sombra, toma
`--elevation-modal`, y ahora un token llamado *modal* describe algo explícitamente **no modal**: un
estado real y distinto en la plataforma (`show()` vs `showModal()`).

Una elevación nombra una **altura sobre la página**, verdadera para cualquier inquilino:

| Token | Significa |
|---|---|
| `--elevation-flat` | sobre la página |
| `--elevation-raised` | levantado, todavía adherido (una card) |
| `--elevation-floating` | despegado, sobre el contenido (un menú) |
| `--elevation-top` | en el top layer (un dialog) |

`top` nombra un concepto real de la plataforma en vez de una metáfora, lo que le da un término a la
escala: nada puede estar por encima del top layer. No es un predicado preciso, la API de popover
también mete menús ahí, así que `floating` vs `top` sigue siendo una separación de *profundidad
visual*, pero nunca es una mentira. `lifted` se rechazó como escalón superior porque es sinónimo de
`raised`, y dos escalones contiguos que significan lo mismo son un defecto peor que el que se corrige.

## El enforcement, y por qué la versión obvia está mal

Este principio fue una *convención* durante un tiempo, y se degradó hasta convertirse en un defecto
enviado, que es exactamente lo que [el validador](/decisiones/0007-el-validador) predice de toda
disciplina sin enforcement. Así que es una regla: un `tenant-words.json` curado lista palabras-artefacto
(`modal`, `dialog`, `drawer`, `sheet`, `toast`, `tooltip`, `popover`, `menu`, `card`…) que nunca pueden
aparecer como segmento en un nombre de tier 2.

**La implementación rechazada es la parte más valiosa de este documento.** El diseño obvio, derivar las
palabras prohibidas de los stems de `components/*.css`, para que la lista se mantenga sola, se probó
contra el corpus real y **falla dos veces**:

1. **Da falsos positivos sobre vocabulario legítimo.** Los nombres de tier 2 ya contienen `text`,
   `surface`, `label` y `control`. Al enviar `components/text.css`, la regla condena a
   `--color-text-primary`. Palabras como `text` y `border` nombran *roles que preceden a cualquier
   componente*; `modal` y `drawer` nombran *artefactos*. Ningún test mecánico las separa, eso es un
   juicio, y los juicios no se derivan de un listado de directorio.
2. **Se pierde el defecto que la motivó.** Agregar `components/dialog.css` deriva el stem `dialog`. El
   defecto se llamaba `--elevation-modal`. Palabra distinta. Pasa.

Una regla que condena buenos nombres y bendice al malo conocido es peor que no tener regla. **No debe
reconstruirse.**

El límite honesto de la lista curada es que detecta solo las palabras que alguien pensó en listar;
`--elevation-lightbox` pasa de largo hasta que alguien agregue `lightbox`. No puede detectar la *primera*
instancia de un error nuevo, solo cada repetición, que es el mismo trinquete que
[los pares de contraste](/decisiones/0007-el-validador), y vale diez líneas.
