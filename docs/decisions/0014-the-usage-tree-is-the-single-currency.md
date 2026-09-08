---
num: 14
title: El usage tree es la moneda única
short: "Un árbol, cuatro usos"
summary: >-
  Un ejemplo se escribía tres veces (el snippet del schema JSON, el string `html` de la página de
  docs y el componente en `react-demos/`) y ninguna de las tres era la que el agente terminaba
  escribiendo. Esta decisión define el **usage tree**: una composición escrita como dato
  (firma, opciones, hijos) que se autorea una vez y que ambos bindings renderizan. El mismo árbol es
  el ejemplo, el snippet, el plan que el agente propone y el caso que corren los gates; y
  `validate_ui` devuelve el código emitido cuando el árbol es válido, para que el agente nunca
  escriba markup a mano.
---

## El problema

`check_usage` validaba `{id, surface, props}` y devolvía "válido". Después el agente escribía el JSX,
que es otro artefacto, y nadie comparaba uno con otro. El agujero no era la validación: era que lo
validado y lo escrito eran cosas distintas.

Al mismo tiempo, cada ejemplo existía por triplicado:

- el snippet en `docs/ai/schemas/*.json`, un string que no compilaba nada;
- el string `html` en `apps/docs/src/pages/componentes/*.astro`, escrito a mano;
- el componente en `apps/docs/src/components/react-demos/*`, escrito a mano otra vez.

Tres autorías del mismo ejemplo, sin ningún mecanismo que las obligue a coincidir. Un `variant` que
cambia de nombre las rompe de a una y en silencio.

## La decisión

**Un ejemplo es un usage tree**: `{contract, signature, options, children}`, serializable, autoreado
una sola vez. Se escribe en **firmas**, no en parts, porque elegir significado es trabajo del autor y
expandirlo a estructura es trabajo del part template (decisión 28).

De ese único árbol salen cuatro cosas que antes eran cuatro artefactos:

| Consumidor | Qué obtiene |
|---|---|
| El binding vanilla | El markup emitido: parts del template, opciones escritas como atributos |
| El binding React | Los elementos, con las options como props |
| El sitio de docs | Las dos etapas vivas y el código mostrado, que **es** el emitido |
| Los gates | El caso que se renderiza dos veces y se compara (G2) |

**El emisor vive en el compilador, nunca en la capa vanilla.** Un enhancer no renderiza markup ni
escribe una clase (eso es lo que un enhancer *es* en este sistema), así que emitir HTML desde un árbol
es codegen de build-time. El consumidor sigue siendo dueño del markup que escribe, exactamente como
cuando lo copia de la documentación.

**`validate_ui` devuelve el código emitido cuando el árbol pasa las constraints.** No es una comodidad:
es lo que cierra el agujero. Si el agente no teclea el markup, no puede escribir algo distinto de lo
que validó. La respuesta trae ambos bindings; el agente pega el que corresponde a su app.

## Lo que se rechazó

**Un árbol de parts**, fiel al markup nivel por nivel. Habría hecho innecesaria toda expansión, pero
obligaría al agente a autorear `<li class="sk-nav-list__item">` para obtener un `<NavListLink>`, que es
al revés de cómo se usa el kit.

**Una cuarta tool, `emit_code(tree, binding)`.** Más honesta en el nombre y más legible en los logs,
pero es añadir una tool por cada necesidad de workflow. Emitir es el resultado natural de validar y
viaja en la misma respuesta.

**Snippets pre-emitidos por firma en `get_artifact`.** Baratos y cacheables, pero no cubren ninguna
composición nueva, que es justo donde el agente se equivoca.

**Un MCP que solo devuelve contratos y veredictos.** Deja al modelo componer con libertad idiomática,
al precio de que lo validado y lo escrito vuelvan a ser dos artefactos y nadie garantice que coincidan.
Ese era el estado anterior.

## Costo

Cada firma necesita un part template correcto antes de que su emisor sirva de algo, y las
composiciones con slots son donde eso se pone difícil. Un ejemplo que el emisor no puede producir es
una señal, no una excepción: significa que el contract todavía no describe la estructura, y esa firma
no se publica hasta que lo haga.
