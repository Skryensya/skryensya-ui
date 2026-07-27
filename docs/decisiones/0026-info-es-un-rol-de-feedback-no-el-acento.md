---
num: 26
title: Info es un rol de feedback, no el acento
short: "El ramp info"
summary: >-
  El tono `info` existía en Alert y Toast desde el principio, pero no tenía color propio: leía el rol
  ACCENT. Eso ataba el significado "esto es algo que deberías saber" a la identidad del inquilino, así
  que una marca magenta pintaba de magenta cada aviso informativo. Esta decisión le da a info su propia
  rampa tier 1, sus tres tokens semánticos y su override de alto contraste, exactamente la misma ruta
  que danger, success y warning. El costo aceptado es que info
  (233) puede chocar de hue con un acento azul, que es el default; se acepta porque una marca que se
  lee "informativa" no es una falsa alarma, y una que se lee "error" sí.
---

## El problema

`AlertTone` incluye `info` desde que existe Alert, y Toast comparte su receta de tonos. Pero en tier 3
el tono se resolvía así:

```css
.sk-alert[data-tone="info"] {
  --sk-alert-bg: var(--color-bg-accent-subtle);
  --sk-alert-fg: var(--color-text-accent);
  --sk-alert-accent: var(--color-border-accent);
}
```

Es decir: el sistema tenía el **nombre** del rol sin tener el **rol**. Y accent no es un rol de
feedback, es la identidad del consumidor ([ADR-23](/decisiones/0023-una-marca-raiz-configurable)). De
ahí salen dos problemas que no son de gusto:

1. **El significado viajaba con la marca.** Cambiar la rampa accent a magenta convertía cada aviso
   informativo en magenta. Un rol de feedback dice qué pasó; no puede depender de quién lo mira.
2. **Nadie podía afinar info sin mover la marca.** El acento está tuneado para un fill primario y para
   el anillo de foco; el aviso informativo tiene otras restricciones (fondo sutil, texto a 4.5:1 sobre
   ese fondo) y no tenía dónde expresarlas.

## La decisión

Info es un rol de feedback y se enruta como tal, de punta a punta:

- **Tier 1**: una rampa `--ramp-info-*` completa, con un default azul sobrio y el mismo contrato explícito
  que los demás roles ([ADR-23](/decisiones/0023-una-marca-raiz-configurable)).
- **Tier 2**: `--color-bg-info-subtle`, `--color-text-info`, `--color-border-info`, en los mismos rungs
  que success y danger (50/950, 700/300, 600/500), con su bloque de alto contraste obligatorio.
- **Validador**: cinco pares nuevos en `contrast-pairs.json`. `--color-text-info` despeja AA sobre
  canvas, surface, surface-raised, surface-sunken y sobre su propio fill sutil, en los cuatro modos.
  El peor caso medido es 4.81:1 (claro, sobre sunken).
- **Tier 3**: Alert lee los tres tokens de info; Toast lo hereda por ser un Alert.
- **Marca**: info es un control independiente en el configurador, con opciones hacia el cian y el teal
  para quien quiera separarlo de un acento azul.

## El costo, dicho

Los presets de acento se eligieron "a ≥15° de hue de los roles de feedback" para que un fill de marca
nunca se lea como un error. **Info rompe esa regla a propósito**: la mitad de los presets de acento
caen a menos de 15° de 233, empezando por el azul default. La asimetría es deliberada, no un descuido:
confundir la marca con "informativo" no le miente a nadie sobre el estado del sistema, y confundirla con
"error" sí. Quien necesite separarlos elige otra rampa info.

El cambio además **repinta** todo lo que ya usaba `data-tone="info"`, incluidos los callouts de este
sitio. Eso no es un efecto secundario: es la decisión hecha visible.

## Lo que no se hizo

Badge, Tag y Progress no reciben un tono `info`. Badge y Tag tienen un tono `accent`, que significa
"énfasis de marca" y no "informativo"; agregarles info es ampliar su API pública, no enrutar este rol.
Progress en info no significa nada. Si alguno lo pide después, los tokens ya están.
