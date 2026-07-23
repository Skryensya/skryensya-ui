---
num: 6
title: CSS puro, sin build
short: "CSS puro, sin build"
summary: >-
  Los tres tiers son stylesheets bajo css/, sin JSON ni emisor de tokens. La mayoría es CSS escrito a mano;
  los entrypoints de tokens se escriben en Sass donde CSS no tiene macro (decisión 13). Un emisor de tokens produciría exactamente lo que se escribe
  a mano, light-dark(), calc()/round(), cadenas de var(), así que reimplementarlo en build es reimplementar
  el runtime del navegador. El principio que queda: no reimplementar el runtime de la plataforma; si borrar
  una capa no hace reaparecer complejidad, no hacía nada.
---

Los tres tiers **son** stylesheets bajo `css/`: `primitives.scss`, `semantic.scss`, `brands/*`,
`modes/hc.scss`, `components/*`, `patterns/*`. Sin JSON, sin emisor de tokens, sin Style Dictionary. La
mayoría se escribe a mano; los entrypoints de tokens se compilan desde Sass por el consumidor donde CSS no
tiene macro ([decisión 13](/decisiones/0013-sass-para-los-ramps-y-el-alto-contraste)). No hay un pipeline
que *genere* la semántica del sistema.

## Por qué no hay una capa de build

Todo lo que un emisor de tokens produciría, `light-dark()`, las expresiones `calc()`/`round()` de
densidad, las cadenas de alias `var()`, el scoping por componente, es exactamente lo que se escribiría a
mano en CSS. Un pipeline que genera eso está reimplementando el runtime del propio navegador, en build
time, para un sistema que solo corre en navegadores.

Las custom properties + `light-dark()` + `calc()`/`round()` **son** ese runtime. Escribir el CSS a mano
no es renunciar a nada: es dejar de duplicarlo.

El único argumento real para un build era la exportación multiplataforma a iOS/Android. Este es un
sistema web-only. Nunca se usó.

## El principio, para cuando aparezca la próxima capa

**No reimplementar el runtime de la plataforma.** Y su corolario, que es el que hace trabajo:

> Bórrese la capa. ¿Reaparece la complejidad en los llamadores? Si no reaparece, no estaba haciendo nada.

Ese test decide cosas concretas en otros documentos: es lo que mantiene al
[dialog en CSS puro](/decisiones/0011-el-dialog-exige-el-elemento-nativo) y lo que descartó un paquete
intermedio de máquinas en [qué envía tier 3](/decisiones/0008-que-envia-tier-3).

## Quién paga el build

El CSS puro **no da error en build** ante un `var()` que no resuelve: falla en silencio en runtime,
cayendo al fallback. Eso es lo único que un pipeline daba y el CSS no.

Es exactamente la brecha que [el validador](/decisiones/0007-el-validador) cubre. La apuesta es que ~250
líneas de validador sin dependencias son más baratas de mantener que un pipeline entero. Para un sistema
web-only, lo son.

## Lo que sí se rechazó

- *Escribir el CSS a mano sin validador.* El enforcement es lo que hace que esto sea un sistema y no
  tres carpetas. No tener build no obliga a no tener verificaciones.
- *Stylelint en vez de un validador propio.* Puede expresar custom-property-desconocida y un plugin de
  contraste, pero no las reglas específicas del sistema: dirección de tiers, mode-completeness,
  contraste cross-marca.
