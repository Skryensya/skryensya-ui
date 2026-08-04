# @skryensya/mcp

El servidor MCP de skryensya/ui. Tres tools sobre un manifest compilado.

```jsonc
// .mcp.json
{ "mcpServers": { "skryensya-ui": { "command": "node", "args": ["packages/mcp/dist/index.js"] } } }
```

## El flujo

```
get_catalog()                 →  todas las familias y firmas, con useWhen y avoidWhen
get_contract({ id })          →  el contrato de una familia: options, template, constraints, a11y
validate_ui({ tree })         →  válido → el markup Y el TSX emitidos, más el CSS a importar
                                 inválido → los problemas, y NADA emitido
```

Lo que cierra el agujero del servidor anterior: el agente propone la composición **como dato** y
recibe el código de vuelta. No tipea markup del kit, así que lo que validó y lo que escribió no
pueden separarse.

## El árbol tiene tres campos y no son lo mismo

```jsonc
{
  "contract": "nav-list",
  "signature": "NavListLink",
  "options": { "href": "/", "current": true },   // lo que el contrato mapea a un atributo
  "attrs":   { "id": "inicio" },                 // lo que va al host tal cual
  "slots":   { "trailing": "12" },               // dónde cae el contenido
  "children": "Inicio"                           // azúcar para slots.children
}
```

Una opción que la firma no declara se **rechaza**, no se ignora; el mensaje nombra la firma
hermana que sí la toma, porque el error casi siempre es haber elegido la firma equivocada.

## Por qué no hay búsqueda

El catálogo se lee entero (ADR-31). El ranker que esto reemplaza documentaba su propio fracaso: sus
instrucciones le decían al cliente que listara todo cuando el ranking fallaba.

## Por qué está bundleado

Es el único paquete de este repo que es un **ejecutable**. Los demás exportan TypeScript y dejan
compilar a quien los consuma; a este lo arranca `node` desde `.mcp.json`, y `node` no carga un `.ts`
ni sigue un link de workspace. `tsc` solo no alcanzaba: sus imports resuelven a
`@skryensya/ai-compiler/src/*.ts` y de ahí a `@skryensya/core/src/*.ts`. El bundle colapsa esa cadena
en un archivo. El SDK de MCP queda externo porque es una dependencia npm de verdad.

## Requiere el manifest compilado

```bash
pnpm --filter @skryensya/ai-compiler build   # emite artifacts/ai-{index,manifest}.json
```

El servidor lee ese artefacto y **nunca** recorre un directorio de archivos escritos a mano; esa es
la diferencia entera con el servidor v1 (tag `ai-v1`). Toda respuesta lleva `sourceHash`, así que un
reporte se puede reproducir contra el mismo artefacto.

`SK_ARTIFACTS` cambia dónde los busca.
