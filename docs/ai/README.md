# Guías de composición para IA

Estas guías enseñan a una IA a **elegir, importar y componer** componentes existentes. No describen
cómo construirlos ni exponen hooks, selectores o CSS interno.

> Si existe una binding para el stack actual, se importa y se usa. No se recrea su host nativo.

La IA carga sólo las instancias necesarias, por ejemplo `schemas/button.json`. `_meta.json`,
`_invariants.json` y los fuentes del componente no forman parte normal de su contexto.

## Catálogo actual

| Guide | Qué ayuda a elegir |
|---|---|
| `button.json` | `Button` para acciones y `ButtonLink` para navegación con la misma apariencia. |
| `link.json` | Enlace inline, siempre subrayado, con énfasis opcional. |
| `input.json` | `Input` vs `Textarea` y composición con `Field`. |
| `tabs.json` | Tabs por datos, orientación y modo de activación. |
| `tile.json` | Acción, navegación, checkbox, radio group o disclosure sobre una superficie completa. |
| `alert.json` | Mensaje de estado persistente e inline, con tono y presentación. |
| `badge.json` | Etiqueta de estado estática, no removible. |
| `avatar.json` | Identidad de usuario, con imagen o iniciales, y agrupación con overflow. |
| `tag.json` | Clasificación o faceta de filtro, opcionalmente removible. |
| `progress.json` | Barra de progreso determinada, con tono. |
| `loader.json` | Indicador de trabajo indeterminado. |
| `placeholder.json` | Geometría decorativa de esqueleto de carga. |
| `empty-state.json` | Mensaje de estado vacío o sin resultados. |
| `checkbox.json` | Selección independiente, no exclusiva. |
| `radio-group.json` | Selección exclusiva entre opciones. |
| `switch.json` | Preferencia que aplica de inmediato, sin envío de formulario. |
| `select.json` | Selección desde una lista desplegable con disparador propio. |
| `select-native.json` | Selección nativa del navegador, sin binding vanilla. |
| `combobox.json` | Selección con filtro por texto y opción múltiple. |
| `number-field.json` | Entrada numérica con incrementos. |
| `time-field.json` | Entrada de hora segmentada. |
| `slider.json` | Selección de un valor dentro de un rango. |
| `navbar.json` | Barra de navegación superior, con marca y acciones. |
| `sidebar.json` | Navegación lateral persistente, con secciones. |
| `nav-list.json` | Lista de enlaces de navegación agrupables. |
| `breadcrumb.json` | Ruta jerárquica de navegación. |
| `toolbar.json` | Agrupación de controles de acción. |
| `tree-view.json` | Navegación jerárquica expandible. |
| `accordion.json` | Pila de disclosures mutuamente enmarcados. |
| `steps.json` | Progreso a través de una secuencia de pasos. |
| `process-list.json` | Lista de pasos de un proceso con estado. |
| `pagination.json` | Navegación entre páginas de resultados. |
| `menu.json` | Lista de acciones o navegación anclada a un disparador. |
| `popover.json` | `Popover` con título propio o `Popup` para contenido anclado a medida. |
| `tooltip.json` | Descripción breve anclada al pasar el foco o el mouse. |
| `toast.json` | Notificación transitoria fuera de flujo. |
| `split-button.json` | Acción primaria con acciones secundarias en menú. |
| `file-upload.json` | Selección y carga de archivos. |
| `theme-toggle.json` | Alternancia entre modos de tema. |
| `table.json` | Datos tabulares. |
| `list.json` | Lista de contenido genérico. |
| `carousel.json` | Contenido desplazable en un eje, con navegación. |
| `stat.json` | Métrica destacada con etiqueta. |
| `calendar.json` | Grilla de fechas autónoma. |
| `date-picker.json` | Selección de fecha con campo y calendario anclado. |

Estas cinco guías ejercitan una superficie simple, defaults omitidos, CSS múltiple, props
específicas de una superficie, composición y familias semánticas. Las guías de feedback/estado
añaden ejemplos de props sin sentido enumerable (React puro) y de familias con dos componentes
hermanos no mutuamente excluyentes (`Avatar` + `AvatarGroup`).

## Una apariencia puede tener varias superficies

Button es una familia visual con dos interfaces semánticas hermanas:

| Intención | Superficie | Host | Contrato propio |
|---|---|---|---|
| Ejecutar una acción | `Button` | `<button>` | No acepta `href`. |
| Navegar | `ButtonLink` | `<a>` | Exige `href`; no acepta `disabled`. |

Ambas consumen `button.css` y comparten `variant`, `size`, `iconOnly`, contenido y apariencia. La
semántica decide primero cuál importar; la variante sólo decide énfasis visual.

```tsx
import { Button, ButtonLink } from "@skryensya/react/button";
import "@skryensya/core/components/button.css";

<Button variant="primary" onClick={save}>
  Guardar
</Button>

<ButtonLink variant="primary" href="/docs">
  Documentación
</ButtonLink>
```

No se usa `as="a"`: una prop polimórfica mezclaría atributos incompatibles como `href`, `disabled` y
participación en formularios. Tampoco se usa `variant="link"`: `variant` expresa énfasis, por lo que
un `ButtonLink` todavía puede ser `primary`, `danger`, `neutral` o `ghost`.

Un enlace no se “deshabilita”. Si el destino no está disponible, se renderiza contenido no enlazado o
se omite la acción. `aria-disabled` por sí solo no detiene navegación.

## Forma del schema

```json
{
  "id": "button",
  "consume": {
    "css": "@skryensya/core/components/button.css",
    "prefer": "react"
  },
  "surfaces": {
    "Button": {
      "use": "action",
      "element": "button",
      "react": {
        "from": "@skryensya/react/button",
        "name": "Button"
      },
      "forbids": ["href"]
    },
    "ButtonLink": {
      "use": "navigation",
      "element": "a",
      "react": {
        "from": "@skryensya/react/button",
        "name": "ButtonLink"
      },
      "requires": ["href"],
      "forbids": ["disabled"]
    }
  }
}
```

| Campo | Decisión para la IA |
|---|---|
| `id` | Familia visual buscable. |
| `consume` | Uno o varios CSS, binding preferida y fallback vanilla opcional. |
| `surfaces` | Interfaces hermanas, elegidas por intención semántica. |
| `use` | Intención que selecciona una superficie. Debe ser única en la familia. |
| `element` | Semántica nativa que la binding preserva. |
| `requires` / `forbids` | Diferencias de atributos entre superficies. |
| `props` | Opciones compartidas; `surfaces.*.props` contiene opciones exclusivas de una superficie. |
| `meanings` | Cuándo elegir cada valor visual. |
| `children` / `composes` | Componentes hijos permitidos y sus imports. |
| `rules` | Alternativas para combinaciones prohibidas y reglas de accesibilidad. |
| `examples` | Ejemplos separados por superficie. |

En cualquier lista de props, el primer valor es el default. Un primer valor `null` significa que el
default es **omitir la prop**: `tone: [null, "primary"]` expresa exactamente el `tone?: "primary"` de
Link sin inventar un valor como `inherit`. `consume.css` es un string cuando basta una hoja y una
lista cuando la composición exige varias, como `Field + Input`.

No se enumeran props nativas heredadas como `onClick`, `target`, `rel`, `download`, `aria-*` o
`className`. Los tipos de `ButtonProps` y `ButtonLinkProps` siguen siendo la autoridad completa.

## Algoritmo de composición

Para “guardar cambios”:

1. La intención es `action` → elegir `Button`.
2. Importar su binding y el CSS común.
3. Elegir el énfasis por `meanings`.
4. Aplicar las reglas y componer children.

Para “ir a documentación”:

1. La intención es `navigation` → elegir `ButtonLink`.
2. Proveer el `href` requerido.
3. Elegir la misma escala de énfasis visual.
4. Mantener atributos de enlace como `target`, `rel` o `download` en la superficie correcta.

La elección nunca parte de “quiero algo que se vea como botón”. Parte de lo que ocurrirá al activarlo.

## Fallback vanilla

Sin binding de framework, ambas superficies comparten:

- `sk-button sk-interactive`;
- `data-sk-button`;
- `@skryensya/core/components/button.css`; y
- `initComponents` desde `@skryensya/vanilla/auto`.

La diferencia sigue siendo el host:

```html
<button class="sk-button sk-interactive" data-sk-button>
  Guardar
</button>

<a class="sk-button sk-interactive" data-sk-button href="/docs">
  Documentación
</a>
```

El enhancer exige `href` al host `<a>` y rechaza un enlace marcado como disabled.

## Qué queda fuera

| Fuera de la guía | Autoridad |
|---|---|
| Hooks, selectores, parts y valores CSS | implementación del componente |
| Machines y estados internos | paquetes del design system |
| Props nativas y exports completos | TypeScript/package exports |
| Tests, gaps e invariantes de tier | suites, issue tracker y `_invariants.json` |
| Rationale histórico | `docs/decisiones/` |

## Validación

```bash
node docs/ai/validate.mjs            # catálogo completo
node docs/ai/validate.mjs button     # una guía
node --test docs/ai/checks.test.mjs
```

El validator comprueba que:

- cada intención elige una sola superficie;
- cada superficie importa una binding existente en el formato;
- `requires` y `forbids` no se contradicen;
- toda prohibición explica la alternativa;
- cada superficie tiene ejemplos propios;
- `ButtonLink` siempre muestra `href` y nunca `disabled`;
- `Button` no muestra `href`;
- los ejemplos consumen la binding, nunca el host nativo cuando React está disponible; y
- ninguna guía filtra clases, hooks o fuentes internos fuera del fallback vanilla.
