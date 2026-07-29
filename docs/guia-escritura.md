# Guía de escritura

Esta guía describe **cómo** se escribe: registro, persona gramatical, puntuación, y qué cambia entre
español e inglés. No es el glosario, [`CONTEXT.md`](../CONTEXT.md) decide **qué palabra** nombra cada
concepto, con sus propias listas `_Avoid_`, y sigue siendo la única autoridad sobre terminología. Esta
guía nunca redefine un término; si un ejemplo de acá contradice a `CONTEXT.md`, `CONTEXT.md` gana o
cambia, pero los dos nunca conviven, la misma regla que `CONTEXT.md` aplica sobre sí mismo.

Cada regla de acá viene de un archivo real, citado, no de una convención inventada. Donde la práctica
actual es inconsistente, se dice explícitamente.

## Qué idioma en qué lugar

`CONTEXT.md` ya fija el eje principal: documentación de cara al usuario y registros de decisión van en
español; código, identificadores y metadata de repositorio van en inglés. La tabla extiende esa regla a
los géneros que `CONTEXT.md` no cubre:

| Contenido | Idioma | Ejemplo |
|---|---|---|
| Páginas de componentes (`componentes/*.astro`) | Español | `componentes/button.astro` |
| Traducción de una página de componente | Inglés, archivo propio | `en/components/avatar.astro` |
| Registros de decisión (`docs/decisiones/`) | Español | `0002-nombrar-por-rol-nunca-por-inquilino.md` |
| `CONTEXT.md`, `README.md`, metadata de paquete | Inglés | este repo |
| Comentarios en código fuente | Cualquiera, **localmente consistente** | ver [Comentarios de código](#comentarios-de-código) |
| Mensajes de commit | Inglés | ver [Mensajes de commit](#mensajes-de-commit) |
| Copy dentro de una demo (labels, `aria-label`) | El idioma de la página que lo muestra | `Guardar` en `componentes/`, la traducción en `en/` |

Una página traducida es **un archivo real con contenido propio**, nunca una interpolación de la
versión española parametrizada por locale. Lo dice el propio comentario de
[`en/components/avatar.astro`](../apps/docs/src/pages/en/components/avatar.astro): el demo markup, el
código React y la prosa son el contenido de la página, y el contenido se traduce, no se interpola. Lo
que sí comparten las dos versiones es toda la capa estructural: layout, chrome, rail. Eso nunca se
duplica por idioma.

## Voz compartida

Esto no cambia con el idioma:

- **Sin relleno.** Nada de "en este artículo vamos a ver", "es importante notar que", cierres
  motivacionales. Cada oración aporta una decisión o un hecho.
- **Nombra el mecanismo, no solo la conclusión.** No "esto es más seguro", sino *por qué*: qué falla
  sin la regla y qué lo previene. Ver cualquier ADR en `docs/decisiones/` para el patrón completo.
- **Un concepto, un nombre.** Si `CONTEXT.md` ya nombró algo, ese nombre es el único que se usa; nunca
  un sinónimo "para variar la prosa". Variar el nombre de un concepto fijo es el error que
  `CONTEXT.md` existe para prevenir.
- **Ejemplos reales, nunca `foo`/`bar`.** Los ejemplos de este repo guardan, cancelan, borran,
  descargan, configuran: acciones que existen en la interfaz real. Un ejemplo inventado no prueba que
  el patrón funcione en un caso real.

## Registro según el género

La persona gramatical no es una preferencia de quien escribe, depende de qué tipo de documento es:

- **Tutorial o página de componente** → se dirige al lector directamente (segunda persona). Enseña a
  alguien a hacer algo, paso a paso: "Si activa una acción, usa Button. Si navega, pasale `href` y
  Button se renderiza como `<a>`" (`componentes/button.astro`).
- **Referencia o regla** (`CONTEXT.md`, ADRs, `docs/plataforma-ai-ui.md`) → impersonal, con "se". Describe
  un sistema, no acompaña a nadie: "no se usa `as="a"`", "el icono queda decorativo" (`docs/ai/README.md`,
  archivado en el tag `ai-v1`).
  Esta misma guía es referencia, por eso está escrita así y no como "vos vas a aprender a escribir…".

Confundir los dos registros dentro de un mismo documento es el error a evitar: una página de componente
que de golpe cae en impersonal, o un ADR que se dirige al lector, rompe la señal de qué tipo de
documento está leyendo.

## Español

### Persona: tú, nunca vos ni usted

Cuando un documento se dirige al lector, la forma es **tú** (`necesitas` en `accordion.astro` y
`dialog.astro`, `quieres` en `flyout.astro`, `usas` en `kbd.astro`, `usa Button` en `button.astro`).
Nunca **usted** (registro distante, no encaja con el tono directo del resto) ni **vos**
(regionalismo rioplatense: existen dos slips reales hoy, `tenés` y `necesitás` en páginas de
`componentes/`, que son inconsistencias a corregir, no un segundo registro válido).

### Code-switching: qué se traduce y qué no

Un párrafo en español puede nombrar conceptos en inglés en la misma oración sin marcarlos como cita
("Button es un componente estático", `componentes/button.astro`). La regla para decidir qué se
traduce:

**Nunca se traduce** (son identificadores, o nombres propios fijados por `CONTEXT.md`):

- Nombres de componente o patrón: `Button`, `TileButton`, `Vaul`, `Avatar`.
- Nombres de prop, clase, atributo o archivo: `data-icon-only`, `sk-interactive`, `button.css`.
- Términos ya fijados por `CONTEXT.md`: `styling hook`, `state layer`, `enhancer`, `machine`, `ramp`.
  Esta guía no repite esa lista, ver `CONTEXT.md` para la lista completa y sus `_Avoid_`.

**Siempre se traduce** (es contenido, no identificador):

- El copy visible de una demo: `Guardar`/`Save`, `Cancelar`/`Cancel`, `Borrar`/`Delete`.
- El texto accesible: `aria-label="Configuración"` en una página en español,
  `aria-label="Settings"` en su traducción. El nombre accesible sigue el idioma de la página que lo
  muestra, no el idioma del código que lo implementa.
- La prosa, los conectores, las explicaciones: todo lo que no sea un identificador.

### Puntuación de listas

Una lista con viñetas sigue una de dos formas, y cuál depende de si los ítems son una sola oración
partida o varias oraciones independientes:

- **Enumeración de una sola oración** → cada ítem termina en punto y coma, el anteúltimo agrega
  `; y` antes del último, que cierra con punto. Ejemplo real, `docs/ai/README.md` (tag `ai-v1`):

  ```
  - `sk-button sk-interactive`;
  - `data-sk-button`;
  - `@skryensya/core/components/button.css`; y
  - `initComponents` desde `@skryensya/vanilla/auto`.
  ```

- **Lista de afirmaciones independientes** → cada ítem es su propia oración completa, con su propio
  punto final, sin `y` de cierre. Ejemplo real, la lista de alternativas rechazadas en
  `docs/decisiones/0002-nombrar-por-rol-nunca-por-inquilino.md`:

  ```
  - `palette` implica un *conjunto sin orden*; pierde que...
  - `shades` (Tailwind) implica *solo más oscuro*, pero los pasos...
  - `scale` es la palabra más precisa para..., pero ya está tomada...
  ```

  Un punto y coma *dentro* de un ítem sigue siendo válido acá, solo une las dos cláusulas de esa
  afirmación puntual, no encadena con el ítem siguiente.

El error a evitar es mezclar los dos: una lista de afirmaciones independientes que de repente agrega
"; y" al final imita una enumeración que no es tal.

### Comillas y énfasis

Comillas curvas (`“…”`), nunca rectas (`"…"`), para citar una palabra como mención más que como uso.
`docs/ai/README.md` (tag `ai-v1`) escribe `no se “deshabilita”`, con curvas, no `no se "deshabilita"`. Negrita en la
primera mención de un término que el párrafo va a explicar (`**ImageFrame**`, `**AvatarGroup**` en
`en/components/avatar.astro`); cursiva para la palabra que se está definiendo dentro de una
explicación (`un *conjunto sin orden*`, ADR 0002).

## English

### Direct address, same restraint

The English pages mirror the Spanish tutorial register: direct, second person where the genre calls
for it, no filler, no marketing adjectives. `en/components/avatar.astro` states what a thing is and
moves on: "Avatar is the visual token of a person or entity." No contractions have shown up in the
English corpus so far (a small sample, one translated page); keep that until a larger body of English
content says otherwise.

### Component names are proper nouns

A component or pattern name is never translated and never lowercased mid-sentence: `Avatar`,
`ImageFrame`, `AvatarGroup`, bolded on first mention in a paragraph, plain after. Same rule as the
Spanish pages, same names, because the identifier is the identifier in either language.

### Punctuation

Curly quotes (`“+N”`, `en/components/avatar.astro`), not straight ones. Otherwise, standard
American punctuation: period inside a closing quote, serial comma in a list of three or more.

## Terminología

`CONTEXT.md` es la única fuente de verdad sobre qué palabra nombra qué concepto. Esta guía no repite
su contenido, solo el patrón de cómo leerlo: cada entrada define un término por lo que **es**, nunca
por cómo se construye, y cierra con una línea `_Avoid_` que lista los sinónimos prohibidos y por qué
cada uno miente. Antes de nombrar algo nuevo en cualquier documento, se busca primero en `CONTEXT.md`;
si el concepto ya tiene nombre, ese nombre es el único correcto en español, en inglés, en código y en
comentarios. Si el concepto es nuevo, la entrada se agrega a `CONTEXT.md` antes de usarse en prosa,
nunca al revés.

## Estructura de una página de componente

Esto no es sobre voz, es sobre el orden de las piezas. La evidencia viene de comparar varias páginas de
`componentes/*.astro` (`button.astro`, `tabs.astro`, `accordion.astro`, `dialog.astro`, `select.astro`,
`alert.astro`): el orden exacto de secciones varía de una página a otra, pero estas cosas no.

**Forma general:**

1. **Lede**: qué es el componente, en una o dos oraciones. Si la página va a mostrar una progresión de
   ejemplos, la lede la anticipa ahí mismo. `tabs.astro` lo hace explícito: "Empieza con dos vistas,
   añade estados e iconos y termina con una navegación vertical controlada. La anatomía no cambia al
   crecer." El lector sabe, antes del primer ejemplo, qué arco va a recorrer y qué se mantiene fijo.
2. **Ejemplos**, de más simple a más complejo (ver regla completa abajo).
3. **Variantes nativas o alternativas avanzadas**, después del camino principal y marcadas como tal,
   nunca intercaladas con los ejemplos centrales.
4. **Bloque mecánico**: Instalar, CSS, Inicializar vanilla, Contrato, React. Siempre después de todos
   los ejemplos, nunca antes: el lector ve primero qué hace el componente, después cómo instalarlo.
5. **`StylingHooks`**, al final del todo, en toda página que lo usa.

### Los ejemplos van de más simple a más complejo, pero la complejidad se gana, no se agrega

La regla no es "empezar fácil y terminar difícil" por convención de tutorial. Es que **cada ejemplo más
complejo que el anterior existe porque demuestra una capacidad que un uso real necesita**, nunca porque
agrega variedad o cubre props por completitud.

El modelo es `tabs.astro`, con tres ejemplos numerados:

- **`1. Básico`**: dos triggers, dos paneles, sin nada más. El caso mínimo real: "Resumen" y
  "Actividad".
- **`2. Estados e iconos`**: agrega iconos y un tab deshabilitado, pero no porque "hay que mostrar
  `disabled`": el ejemplo es una revisión con "Detalles", "Validación" y "Ajustes", y Ajustes está
  deshabilitado porque el texto lo explica — "Los ajustes estarán disponibles después de aprobar la
  solicitud". El prop nuevo tiene una razón de producto, no solo una razón de API.
- **`3. Orientación y estado`**: agrega orientación vertical y activación manual, otra vez atado a un
  escenario real (ajustes de un workspace) donde mover el foco con flechas no debe disparar el cambio de
  panel pesado; Enter o Espacio confirma. El ejemplo también conecta `sk-value-change` a una región viva
  visible, mostrando el evento en uso, no solo declarado.

**La prueba antes de agregar un ejemplo más complejo**: si no se puede nombrar, en una oración, qué
escenario real necesita el prop o la variante nueva, ese ejemplo no gana su lugar todavía en la
secuencia. "Para mostrar que existe" no es un escenario.

**Numerar encabezados** (`1.`, `2.`, `3.`, como en `tabs.astro`) quiere decir que la página cuenta una
sola historia continua, cada paso construye sobre el anterior. Cuando las secciones son facetas
independientes del componente en vez de una progresión — `button.astro` no numera `Variantes`,
`Tamaños`, `Con icono`, `Solo icono`, `Como enlace`, `TileButton`, porque cada una es una variante
distinta, no un paso sobre la anterior — no se numera, pero el orden todavía va de lo más común a lo
más especializado.

**Alternativas avanzadas u opcionales se marcan como tal, explicando qué agregan.** `dialog.astro`
presenta `Confirm` (el caso común) y recién después `Opción: Dialog Vaul`, con su propia sección "Qué
añade" que explica la ganancia concreta en vez de asumir que el lector la infiere. Una variante nativa
sigue el mismo principio y además el que ya fija [`CONTEXT.md`](../CONTEXT.md) para `Native
alternative`: "documented separately and secondarily when an enhanced module has a larger interaction
contract". `accordion.astro` hace esto con `Details nativo`, `select.astro` con `Select nativo`, los
dos después del camino enhanced, nunca antes.

## Labels de los bloques de código

El `label` de un `CodeBlock` o `Showcase` nombra el lenguaje o el artefacto del ejemplo (`CSS`,
`JavaScript`, `HTML`, `terminal`), nunca con la posesión "tu"/"tu propio". Nada de `tu CSS`, `tu JS`,
`tu JavaScript`: sobrio y profesional es `CSS`, `JavaScript`. Cuando el lenguaje tiene nombre completo
y abreviatura (`JavaScript`/`JS`, `TypeScript`/`TS`), el label usa el nombre completo, nunca la sigla.

Esto no es una preferencia sin costo: hasta este mismo cambio, el patrón `tu X` estaba en 86 labels
reales de 44 archivos en todo `apps/docs/src` (no solo en páginas de `componentes/`), así que si
aparece de nuevo es una regresión, no una segunda convención vigente.

**El label no es solo texto: alimenta la detección de lenguaje.** `CodeBlock.astro` infiere el
lenguaje del resaltado a partir del label cuando no se pasa `lang` explícito
(`label?.includes("JavaScript")`, `"TypeScript"`, `"CSS"`, `"React"`). Ninguno de los nombres
completos contiene la sigla vieja como substring (`"JavaScript".includes("JS")` es `false`), así que
el cambio de `tu JS` a `JavaScript` no es un simple find-and-replace de prosa: la lógica de detección
en `CodeBlock.astro` tuvo que ampliarse para reconocer los nombres completos, o el resaltado cae en
el fallback `html` para cualquier ejemplo cuyo código no arranque con `import` o `const`. Un label
nuevo que no sea uno de los nombres reconocidos necesita `lang` explícito.

Esto no prohíbe un label descriptivo cuando el ejemplo lo pide (`una instancia`, `cambiar el set por
defecto`, `components/button.css`): la regla es contra la posesión y la sigla, no contra describir qué
hace ese bloque puntual en vez de solo nombrar su lenguaje.

**No confundir con un `aria-label` de la interfaz.** La regla de arriba es solo para el label del
bloque de código. Un `aria-label` real dentro de un ejemplo (`aria-label="Tu email"` en un formulario
de newsletter de demo) sigue las reglas de [Code-switching](#code-switching-qué-se-traduce-y-qué-no):
es contenido de interfaz, se traduce, y "tu" ahí es simplemente el posesivo correcto en español, no el
patrón que esta sección corrige.

## Registros de decisión (`docs/decisiones/`)

Un ADR no es un post de blog justificando una idea, es el registro de por qué el sistema tiene la forma
que tiene, incluyendo lo que se descartó. La forma es fija:

- **Archivo**: `NNNN-slug-en-español.md`, número de cuatro dígitos seguido del principio en kebab-case.
- **Frontmatter**: `num`, `title`, `short` (versión corta del título, para navegación), `summary`
  (el argumento completo en un párrafo, es lo que se muestra sin abrir el documento).
- **Apertura**: el principio en una o dos oraciones, con las palabras clave en negrita, antes de
  cualquier detalle técnico. ADR 0002 abre con "Un nombre que dice **quién** usa algo se convierte en
  mentira…", no con contexto histórico.
- **Alternativas rechazadas, con razón de cada rechazo**: nunca "se consideraron otras opciones", sino
  una lista de las opciones puntuales y qué se pierde con cada una.
- **Debilidad aceptada**: la sección que nombra el costo real de la decisión tomada, no solo sus
  ventajas. ADR 0002 lo hace explícito: "`ramp` es jerga de especialistas… Se tolera porque marca el
  tier en el nombre." Un ADR sin esta sección suena a que la decisión no tuvo costo, lo cual nunca es
  cierto.
- **Enforcement**: cómo se hace cumplir la regla (validador, convención, nada), y si la implementación
  obvia se probó y falló, eso se documenta con la misma prioridad que la decisión final. ADR 0002
  dedica media página a la versión de enforcement que se descartó y por qué.
- **Referencias cruzadas**: a otra decisión se la nombra por número y se enlaza con ruta relativa,
  `[decisión 12](docs/decisiones/0012-monorepo-y-el-sitio.md)`, nunca solo por título.

## README y metadata de repositorio

`README.md`, `package.json`, y cualquier archivo que describa el repositorio para tooling o para
quien lo clona por primera vez, van en inglés, terso, sin adjetivos de marketing: "A Turborepo for the
`skryensya/ui` design system", no "a powerful, flexible design system". Mismo principio que "voz
compartida" arriba, aplicado en el idioma que le toca a este género.

## Comentarios de código

`CONTEXT.md` ya lo permite: "Comments may use either language when locally consistent." La práctica
real lo confirma en ambos sentidos, en el mismo paquete: `packages/vanilla/src/icon.ts` está comentado
enteramente en español, `packages/vanilla/src/storage.ts` enteramente en inglés. Ninguno de los dos
está mal, lo que estaría mal es mezclar los dos idiomas dentro de un mismo archivo.

Regla práctica al escribir:

- **Editando un archivo existente** → seguir el idioma que ese archivo ya usa. No se traduce un
  comentario preexistente solo para uniformar con otro archivo.
- **Creando un archivo nuevo** → cualquiera de los dos, pero una vez elegido, ese archivo no cambia de
  idioma en un comentario posterior.

## Mensajes de commit

En inglés, breves, forma `Categoría: qué cambia`, sin prefijo de tipo estilo Conventional Commits
(`feat:`, `fix:`). Ejemplo real del historial: `Docs: monorepo READMEs + ADR-15; bump tokens 0.3.0`,
`Turborepo: base styles in packages/tokens, demo app consumes them`. Un punto y coma encadena dos
cambios relacionados dentro del mismo commit en vez de forzar dos oraciones separadas.

## Checklist rápida

- ¿El término ya existe en `CONTEXT.md`? Úsalo tal cual, no inventes un sinónimo.
- ¿Es una página de componente/tutorial, o una referencia/regla? Elige segunda persona o impersonal
  según corresponda, nunca mezclado.
- ¿Página de componente con varios ejemplos? Ordénalos de más simple a más complejo, y para cada uno
  más complejo que el anterior nombra en una oración qué uso real lo necesita.
- ¿Una variante nativa o una alternativa avanzada? Va después del camino principal, marcada como tal,
  con una frase que explique qué agrega.
- ¿Label de un `CodeBlock`/`Showcase`? Sin "tu", nombre completo del lenguaje (`JavaScript`, no `JS`).
  Si el label no es uno de los nombres reconocidos, pasa `lang` explícito.
- ¿Español? Tú, nunca usted ni vos.
- ¿Un nombre de componente, prop, clase o archivo? No se traduce en ningún idioma.
- ¿Copy de demo o `aria-label`? Se traduce, sigue el idioma de la página.
- ¿Lista con viñetas? Define primero si es una oración partida (`; y` final) o afirmaciones
  independientes (punto en cada ítem), no mezcles las dos formas.
- ¿ADR? Necesita alternativas rechazadas, debilidad aceptada, y enforcement, no solo la decisión final.
- ¿Comentario de código? Sigue el idioma del archivo que estás editando.
- ¿Commit? Inglés, `Categoría: qué cambia`.
