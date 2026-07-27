type AttrValue = string | number | boolean | null | undefined;

type Attrs = Record<string, AttrValue>;
type Events = Record<string, EventListener>;

export function applyAttrs(element: Element, attrs: Attrs): void {
  for (const [name, value] of Object.entries(attrs)) {
    if (value === false || value == null) {
      element.removeAttribute(name);
    } else if (value === true) {
      element.setAttribute(name, "");
    } else {
      element.setAttribute(name, String(value));
    }
  }
}

export function bindEvents(element: Element, events: Events): () => void {
  const cleanups: Array<() => void> = [];

  for (const [name, listener] of Object.entries(events)) {
    element.addEventListener(name, listener);
    cleanups.push(() => element.removeEventListener(name, listener));
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

/*
 * ── El modo Zag/Svelte: parchear props de `connect` sobre markup autorado ──────────────────────────
 *
 * Los `connect` de Zag devuelven objetos de props tipados como atributos del framework (sin index
 * signature): mezclan atributos, handlers `onX` y `style`. Estas dos funciones son el "patch-in-place"
 * del progressive enhancement, en vez de renderizar markup nuevo, sincronizan esas props sobre el HTML
 * autorado, preservando su contenido y sus clases BEM (nunca tocan `class`). Es la contraparte vanilla
 * de lo que hace `spreadProps` en el DOM del framework, y vive acá para que cada `.svelte` la reuse.
 */

// Los `connect` de Zag entregan props sin index signature; para iterarlas genéricamente las tratamos
// como registro.
export type DomProps = Record<string, unknown>;

const isEventKey = (key: string) => /^on[A-Za-z]/.test(key);

// Atributos que el navegador trata como booleanos: presencia = true.
const BOOLEAN_ATTRS = new Set([
  "hidden",
  "disabled",
  "readonly",
  "required",
  "checked",
  "selected",
  "open",
  "inert",
]);

/*
 * Qué declaraciones inline puso ESTE runtime sobre cada nodo. El markup autorado también trae inline
 * styles (`style="--sk-carousel-slide-size: 26rem"`); sobrescribir el atributo entero los borraría, así
 * que parcheamos declaración por declaración y sólo removemos las que nosotros mismos habíamos puesto y
 * ya no vienen.
 */
const appliedStyleProps = new WeakMap<HTMLElement, Set<string>>();

/*
 * Qué atributos puso ESTE runtime sobre cada nodo en el patch anterior. Igual que con los estilos:
 * Zag OMITE una prop de estado cuando pasa a falsa (`getItemProps` deja de incluir `data-highlighted`
 * en cuanto el ítem deja de estar resaltado, en vez de mandarlo en `false`), así que un patch que sólo
 * recorre las props presentes nunca ve el atributo viejo y no lo borra. Sin esto, `data-highlighted` /
 * `data-state` se ACUMULAN: al bajar con el teclado por una lista, cada fila que se resalta conserva la
 * marca y terminan varias resaltadas a la vez. Recordamos lo que escribimos y quitamos lo que ya no
 * vuelve, que es lo mismo que hace `spreadProps` de Zag (lo usa Select) y por lo que aquél no tiene el bug.
 */
const appliedAttrs = new WeakMap<Element, Set<string>>();

/** `"display:grid;gap:8px"` → `[["display","grid"],["gap","8px"]]`. */
function parseStyleString(value: string): Array<[string, string]> {
  return value
    .split(";")
    .map((declaration) => {
      const separator = declaration.indexOf(":");
      if (separator < 0) return null;
      const prop = declaration.slice(0, separator).trim();
      const raw = declaration.slice(separator + 1).trim();
      return prop ? ([prop, raw] as [string, string]) : null;
    })
    .filter((entry): entry is [string, string] => entry !== null);
}

/** camelCase de las props de Zag a la propiedad CSS real; las custom properties se dejan intactas. */
const cssProp = (key: string) =>
  key.startsWith("--")
    ? key
    : key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

function applyStyle(node: HTMLElement, value: unknown): void {
  if (value == null) return;

  const entries: Array<[string, string]> =
    typeof value === "string"
      ? parseStyleString(value)
      : typeof value === "object"
        ? Object.entries(value as Record<string, unknown>)
            .filter(([, raw]) => raw != null)
            .map(([prop, raw]) => [cssProp(prop), String(raw)])
        : [];

  const previous = appliedStyleProps.get(node);
  const applied = new Set<string>();

  for (const [prop, raw] of entries) {
    node.style.setProperty(prop, raw);
    applied.add(prop);
  }

  if (previous) {
    for (const prop of previous) {
      if (!applied.has(prop)) node.style.removeProperty(prop);
    }
  }
  appliedStyleProps.set(node, applied);
}

export type ApplyOptions = {
  /**
   * Si escribir el `style` de las props. Por defecto sí.
   *
   * Ponelo en `false` cuando la MÁQUINA también escriba estilos a mano sobre el mismo nodo. El
   * `style` que devuelve `connect` es configuración estática (derivada de props que no cambian),
   * pero un `$effect` lo re-aplica en CADA cambio de estado, y ahí le gana a lo que la máquina
   * acaba de escribir imperativamente.
   *
   * El caso que lo destapó: el carrusel pone `scroll-snap-type: none` mientras arrastrás, para
   * poder mover el track a mano. El effect lo devolvía a `x mandatory` en el mismo frame, así que
   * cada píxel de arrastre lo re-snapeaba, y mover el mouse 10px saltaba un slide entero. La
   * configuración se aplica UNA vez; el estado es de la máquina.
   */
  style?: boolean;
};

/**
 * Sincroniza un objeto de props de Zag sobre `node`. Ignora los handlers de eventos (se cablean con
 * {@link bindZagEvents}) y nunca pisa `class`, las clases BEM las autora el consumidor.
 */
export function applyZagProps(
  node: HTMLElement,
  props: DomProps,
  options: ApplyOptions = {},
): void {
  const writeStyle = options.style !== false;
  // Atributos que este patch deja PRESENTES sobre el nodo; al final quitamos los que pusimos antes
  // y ya no vuelven (el estado que Zag omite en vez de mandar en falso).
  const owned = new Set<string>();
  const previous = appliedAttrs.get(node);

  for (const key in props) {
    const value = props[key];

    if (key === "class" || key === "className") continue;
    if (typeof value === "function") continue; // handlers y demás

    if (key === "style") {
      if (writeStyle) applyStyle(node, value);
      continue;
    }

    if (value === false || value === undefined || value === null) {
      // aria-* booleanos necesitan el string "false" (siguen presentes); el resto se quita.
      if (value === false && key.startsWith("aria-")) {
        node.setAttribute(key, "false");
        owned.add(key);
      } else if (value === false || previous?.has(key)) {
        /*
         * `false` es una opinión: la máquina dice que ese estado está apagado, y se quita.
         *
         * `undefined` / `null` NO lo son: son la prop que la máquina no llena porque nadie se la
         * pasó, y en markup autorado ese nombre puede ser del AUTOR. `getTriggerProps` de Zag
         * tooltip devuelve `"data-value": undefined` cuando no se le da un `value`; borrarlo le
         * arrancaba el `data-value` a cada `<button data-sk-segmented-option>` que además es
         * trigger de un Tooltip, y Segmented se quedaba sin poder resolver en qué opción se hizo
         * clic (los presets de pantalla del preview: Libre/Tablet/Móvil dejaban de responder).
         * Sólo se borra lo que ESTE runtime había escrito antes.
         */
        node.removeAttribute(key);
      }
      continue;
    }

    if (value === true) {
      if (key.startsWith("aria-")) node.setAttribute(key, "true");
      else if (BOOLEAN_ATTRS.has(key)) node.setAttribute(key, "");
      else node.setAttribute(key, "true");
      owned.add(key);
      continue;
    }

    node.setAttribute(key, String(value));
    owned.add(key);
  }

  // Barrido de lo obsoleto: un atributo que ESTE runtime escribió en el patch anterior y que las props
  // de ahora ya no traen es un estado que se apagó (p. ej. `data-highlighted` de la fila que se dejó de
  // resaltar). Nunca toca atributos autorados: sólo salen los que nosotros mismos pusimos.
  if (previous)
    for (const key of previous) if (!owned.has(key)) node.removeAttribute(key);
  appliedAttrs.set(node, owned);
}

/** Nombre de evento DOM a partir de keys Svelte (`onclick`) o Vanilla (`onPointerDown`). */
const eventName = (key: string) => key.slice(2).toLowerCase();

/**
 * Cablea los handlers de eventos de un objeto de props de Zag sobre `node`. `getProps` se re-lee en
 * cada disparo para usar siempre el handler vigente (la máquina cambia de estado y con ella el closure
 * de Zag). Devuelve una función que remueve todos los listeners agregados.
 */
export function bindZagEvents(
  node: HTMLElement,
  getProps: () => DomProps,
): () => void {
  const initial = getProps();
  const handlers: Array<[string, EventListener]> = [];

  for (const key in initial) {
    if (!isEventKey(key) || typeof initial[key] !== "function") continue;
    const type = eventName(key);
    const listener: EventListener = (event) => {
      const fn = getProps()[key];
      if (typeof fn === "function") (fn as (e: Event) => void)(event);
    };
    node.addEventListener(type, listener);
    handlers.push([type, listener]);
  }

  return () => {
    for (const [type, listener] of handlers)
      node.removeEventListener(type, listener);
  };
}
