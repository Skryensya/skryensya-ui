---
num: 1
title: La densidad es un multiplicador con el piso de WCAG adentro
short: "La densidad"
summary: >-
  La densidad es un multiplicador en runtime (--sk-density), no un segundo set de valores que pueda
  derivar de los base. Los tamaños interactivos llevan el piso de 24px de WCAG dentro del propio token,
  así que ningún equipo puede multiplicar por debajo del mínimo accesible, pongan lo que pongan. Tipografía,
  radio y anillo de foco quedan deliberadamente invariantes a la densidad.
---

La densidad (cómoda/compacta/densa) es una dimensión de espaciado. La implementación obvia, escribir
un segundo set completo de valores para "compacta", duplica la superficie a mantener y deja que las dos
escalas deriven.

Y hay algo peor: cualquier mecanismo de densidad puede violar la accesibilidad en silencio. Si se encoge
un control lo suficiente, se cruza el tamaño mínimo de target de WCAG 2.2 SC 2.5.8 (24px), algo que
ninguna revisión de código detecta de forma confiable.

## Un solo número

`--sk-density` (1 = cómoda). Los tokens de espaciado emiten:

```css
round(calc(<base> * var(--sk-density)), 2px)
```

Los tamaños interactivos además le ponen piso al resultado:

```css
max(round(calc(<base> * var(--sk-density)), 2px), 24px)
```

**El piso está dentro del token.** Ningún equipo de producto puede multiplicar por debajo, sin importar
lo que asignen a `--sk-density`. Es inalcanzable por construcción, no por documentación.

## Por qué `round(…, 2px)`

`calc(4px * 0.6)` = 2.4px se cae de la grilla base; unos cuantos de esos juntos hacen temblar una UI
compacta. `round()` los engancha a una sub-grilla de 2px, un no-op a densidad 1 (cada primitivo ya es
múltiplo de 4) y un estabilizador en el resto. Es el único lugar donde la capa de tokens hace aritmética
que el diseñador no escribió, y está justificado.

## Qué es deliberadamente invariante a la densidad

- **Tipografía**, escalar font-size sin corregir line-height se lee peor. La densidad es un problema de
  espaciado, no de tipo.
- **Radio de esquina**, es redondez, no espacio; tiene su propia dimensión
  ([decisión 18](./0019-public-palettes-and-constant-semantics.md)) y por eso la densidad no lo toca.
- **Ancho del anillo de foco**, un anillo que se encoge desaparece.
- **Área de impacto táctil**, un target puede pintarse chico y responder grande: el área invisible se
  queda en 44px.

## La contra, y su trampa

Los valores emitidos son expresiones `calc`/`round`/`max`, no números. Leerlos de vuelta desde JS
requiere el navegador.

Y ahí hay una trampa que cuesta caro: `getComputedStyle().getPropertyValue('--x')` **no resuelve** una
custom property. Devuelve el valor especificado con los `var()` sustituidos, 
`round(calc(16px * 1), 2px)`, nunca `16px`. Las custom properties solo se evalúan cuando se **usan** en
una propiedad real. Para leer el valor usado hay que asignar el token a una propiedad de un elemento y
leer *esa* propiedad.
