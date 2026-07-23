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

const isEventKey = (key: string) => /^on[a-z]/.test(key);

// Atributos que el navegador trata como booleanos: presencia = true.
const BOOLEAN_ATTRS = new Set(["hidden", "disabled", "readonly", "required", "checked", "selected", "open", "inert"]);

function applyStyle(node: HTMLElement, value: unknown): void {
  if (value == null) return;
  if (typeof value === "string") {
    node.setAttribute("style", value);
    return;
  }
  if (typeof value === "object") {
    for (const [prop, raw] of Object.entries(value as Record<string, unknown>)) {
      if (raw == null) node.style.removeProperty(prop);
      else node.style.setProperty(prop, String(raw));
    }
  }
}

/**
 * Sincroniza un objeto de props de Zag sobre `node`. Ignora los handlers de eventos (se cablean con
 * {@link bindZagEvents}) y nunca pisa `class`, las clases BEM las autora el consumidor.
 */
export function applyZagProps(node: HTMLElement, props: DomProps): void {
  for (const key in props) {
    const value = props[key];

    if (key === "class" || key === "className") continue;
    if (typeof value === "function") continue; // handlers y demás

    if (key === "style") {
      applyStyle(node, value);
      continue;
    }

    if (value === false || value === undefined || value === null) {
      // aria-* booleanos necesitan el string "false"; el resto se quita.
      if (value === false && key.startsWith("aria-")) node.setAttribute(key, "false");
      else node.removeAttribute(key);
      continue;
    }

    if (value === true) {
      if (key.startsWith("aria-")) node.setAttribute(key, "true");
      else if (BOOLEAN_ATTRS.has(key)) node.setAttribute(key, "");
      else node.setAttribute(key, "true");
      continue;
    }

    node.setAttribute(key, String(value));
  }
}

/** Nombre de evento DOM ("click") a partir de la key normalizada de Svelte/Zag ("onclick"). */
const eventName = (key: string) => key.slice(2);

/**
 * Cablea los handlers de eventos de un objeto de props de Zag sobre `node`. `getProps` se re-lee en
 * cada disparo para usar siempre el handler vigente (la máquina cambia de estado y con ella el closure
 * de Zag). Devuelve una función que remueve todos los listeners agregados.
 */
export function bindZagEvents(node: HTMLElement, getProps: () => DomProps): () => void {
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
    for (const [type, listener] of handlers) node.removeEventListener(type, listener);
  };
}
