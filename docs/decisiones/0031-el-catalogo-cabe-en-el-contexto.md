---
num: 31
title: El catálogo cabe en el contexto
short: "Sin ranker"
summary: >-
  El plan de reconstrucción pedía un ranker léxico ponderado, un corpus versionado y thresholds de
  Recall@1, Recall@3 y MRR para un catálogo de 52 familias. Esta decisión elimina el ranking: el
  índice completo (id, firmas, intent, avoidWhen, deprecaciones) cabe entero en el contexto del
  modelo, y el modelo elige mejor que la superposición léxica. Los evals dejan de medir la posición
  de un resultado y miden lo único que decide algo: si la composición final fue correcta.
---

## El problema

`packages/mcp/src/search.ts` rankea por superposición literal de palabras sobre `{id, surface, use}`.
No funciona bien, y las instrucciones del propio servidor lo admiten por escrito:

> A miss does not mean the component doesn't exist. If your first query returns nothing relevant […]
> call find_component again with NO intent to read the full catalog directly rather than guessing.
>
> The ranker can rank a related-but-wrong surface above the one you want […] skim past the #1 result.

Un ranker cuya documentación le enseña al cliente a ignorarlo y listar todo es un ranker que ya
perdió. La respuesta del plan era construir uno mejor: BM25 ponderado por campos, fuzzy limitado,
penalización de deprecados, un corpus bilingüe versionado y thresholds acordados.

Para 52 entradas.

## La decisión

**No hay ranker.** Una tool devuelve el índice completo y compacto, por familia: id, firmas con su
intent y su host, `useWhen`, `avoidWhen`, alternativas y deprecaciones, y el modelo elige. El problema
que BM25 resuelve no existe a esta escala, y un modelo resuelve "necesito que el usuario elija una
fecha" sin que nadie le tokenice nada.

**Y no hay aliases bilingües**, que el plan original pedía. Existían para alimentar al ranker léxico:
un modelo lee español e inglés sin que nadie le enumere sinónimos. Eliminarlos sacó el 33% del índice
(5166 → 3474 bytes para las dos primeras familias) y quitó una obligación de autoría por firma.

> **Costo medido, no estimado**
>
> El índice pesa ~700 bytes por firma ya emitido. Las 52 familias del catálogo, con unas 130 firmas,
> dan del orden de 90 KB, cerca de 23k tokens: mucho menos que construir y calibrar un ranker, y
> bastante más que los "pocos miles de tokens" que este documento afirmaba antes de que existiera el
> emisor. Si esa cifra empieza a doler antes de que el catálogo crezca, lo primero es emitir el índice
> en forma compacta, no reintroducir el ranking.

**Los evals miden la elección final, no la posición.** Un caso de eval no es *"esta query debe traer
`date-picker` en el top 3"*: es *"esta intención de producto debe terminar en una composición que
pasa los gates"*. Recall@k medía la calidad de un intermediario que ya no existe. Lo que se mide es el
resultado, con las regresiones históricas del repo como casos permanentes: la contradicción
Button/ButtonLink, el link de nav fuera de su group, el ImageFrame sin contenido.

**El umbral para revisar esto está declarado, no es intuición:** cuando el índice completo deje de
caber cómodamente (del orden de varios cientos de familias, o cuando el índice pase a dominar el
presupuesto de contexto de una tarea típica) vuelve a hacer falta un intermediario, y entonces se
construye contra los evals que para ese momento ya existen.

## Lo que se rechazó

**BM25 bilingüe con corpus y thresholds**, tal como lo especifica el documento de arquitectura.
Escala si el catálogo crece mucho y hace explicable cada resultado, al precio de construir, calibrar y
mantener un ranker para un catálogo que entra entero en un prompt.

**Un híbrido: índice completo primario, ranking como conveniencia.** Cubre las dos escalas sin
comprometerse, y por eso mismo deja código de ranking que casi nunca decide nada y dos rutas de
descubrimiento que hay que evaluar por separado.

**Embeddings semánticos.** Resolverían de una las consultas bilingües y el lenguaje de producto no
técnico, pero el propio documento los condiciona a ganar contra un baseline, y agregan un modelo y un
índice a un servidor que hoy no tiene ninguno.

## Costo

El índice completo viaja en cada sesión que use el kit, y crece con el catálogo. A cambio desaparecen
el ranker, su índice generado, su corpus de queries, sus thresholds y la calibración periódica de
todo eso.
