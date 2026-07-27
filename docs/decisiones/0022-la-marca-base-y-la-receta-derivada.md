---
num: 22
title: La receta de rampas derivadas (sustituida)
short: "Receta sustituida"
summary: >-
  Decisión histórica: Core generaba sus rampas en runtime desde un pequeño conjunto de colores raíz.
  ADR-23 la sustituye: Core publica rampas explícitas y la generación pertenece a herramientas externas.
---

> **Sustituida por [ADR-23](/decisiones/0023-una-marca-raiz-configurable).**

Esta decisión introdujo una receta común con `color-mix(in oklab, …)` para derivar las posiciones de
accent, neutral y feedback desde colores raíz. Resolvía dos necesidades reales: una configuración inicial
sin archivos de marca y un bundle completo para consumidores sin toolchain.

## Qué conserva el sistema

La infraestructura que hizo segura esa receta sigue vigente:

- El validador evalúa `color-mix(in oklab|oklch, …)`, mezclas anidadas, colores nombrados y fallbacks de
  `var()` hasta obtener un color concreto.
- `refs-resolve` acepta una referencia sin declaración cuando el mismo `var()` incluye un fallback válido.
- `dist/skryensya.css` se genera para quien consume con un solo `<link>`; no se commitea.

## Por qué se sustituyó

Una receta dentro de Core mezclaba dos responsabilidades: el contrato tier 1 y la política que lo genera.
También hacía que un cambio pequeño alterase muchas declaraciones implícitas en runtime. El contrato actual
es más verboso y más verificable: Core declara su set por defecto y la herramienta de marca exporta rampas
completas como CSS ordinario. El navegador recibe exactamente los valores que se revisan y validan.

La generación no queda prohibida. Se mueve fuera de Core: una herramienta puede usar esta u otra curva,
pero su salida siempre es el conjunto explícito `--ramp-{role}-{position}`.
