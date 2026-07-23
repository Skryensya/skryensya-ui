import { flushSync, getContext, mount, unmount, type Component } from "svelte";
import Imperative from "../components/Imperative.svelte";

/*
 * Hidratación con Svelte 5, el motor de los enhancers machine-backed.
 *
 * Un enhancer machine-backed corre una máquina de Zag. En vez de reimplementar esa máquina a mano (lo
 * que hacían los FSM viejos, duplicando lo que React ya tenía de Zag), lo monta un componente `.svelte`
 * que consume la MISMA máquina desde `@skryensya/core/machines` vía `@zag-js/svelte`. Svelte es
 * implementación interna, nunca contrato del consumidor: el `.svelte` se monta en LIGHT DOM sobre la
 * raíz `[data-ds-*]` que el consumidor ya escribió, nada de custom elements ni shadow DOM, así que
 * `.hero .ds-tabs { … }` sigue alcanzando el elemento y el modelo de styling hooks queda intacto.
 *
 * El componente lee su raíz por CONTEXTO (`getRoot()`), la escanea, corre la máquina y parchea los
 * atributos sobre el markup existente con `applyZagProps`, no renderiza estructura propia. El contrato
 * de ciclo de vida (`data-ds-<key>-mounting`/`-ready`) hace el montaje idempotente, igual que el
 * `createEnhancer` de attr-patch que siguen usando los enhancers sin máquina.
 */

let counter = 0;
export const uniqueId = (prefix: string): string => `${prefix}-${(counter += 1)}`;

// La raíz se pasa por CONTEXT y no por props: `getContext` devuelve un valor no reactivo, así el
// componente lo lee en una línea con `getRoot()`, sin el aviso `state_referenced_locally` ni el
// boilerplate de `$props()`.
const ROOT_CONTEXT = Symbol("ds-root");

export const getRoot = (): HTMLElement => {
  const root = getContext<HTMLElement | undefined>(ROOT_CONTEXT);
  if (!(root instanceof HTMLElement)) {
    throw new Error("[ds] getRoot() se llamó fuera del contexto del enhancer; monta con createSvelteEnhancer().");
  }
  return root;
};

/** La función imperativa que corre un enhancer sin máquina, pasada por contexto a Imperative.svelte. */
export type Connect = (root: HTMLElement) => () => void;
const CONNECT_CONTEXT = Symbol("ds-connect");

// Raíz → cómo desmontarla. Lo llena `createConnectMount` al montar; `destroyMount` lo consume. Conserva
// el nombre público del runtime viejo, para el único caso que lo necesita: re-montar un enhancer con otro
// valor (el playground del sitio re-apunta un Select).
const mountedApps = new WeakMap<HTMLElement, () => void>();

/** Desmonta el enhancer imperativo montado sobre `root` (corre su cleanup) y libera el marcador ready. */
export function destroyMount(root: HTMLElement): void {
  const destroy = mountedApps.get(root);
  if (destroy) {
    destroy();
    mountedApps.delete(root);
  }
}
/** Alias con el nombre público del runtime viejo. */
export const destroyEnhancer = destroyMount;
export const getConnect = (): Connect => {
  const connect = getContext<Connect | undefined>(CONNECT_CONTEXT);
  if (typeof connect !== "function") {
    throw new Error("[ds] getConnect() se llamó fuera del contexto de un enhancer imperativo; monta con createConnectMount().");
  }
  return connect;
};

export type EnhancerController = { root: HTMLElement; destroy: () => void };

export type Enhancer = {
  key: string;
  rootSelector: string;
  pendingSelector: string;
  mountAll: (target: Document | Element) => EnhancerController[];
};

export type SvelteEnhancerOptions = {
  key: string;
  rootSelector: string;
  Component: Component<Record<string, never>>;
};

/** Public mount shape shared by every Vanilla enhancer. */
export type Mount = (target?: Document | Element) => number;

export function createSvelteEnhancer(options: SvelteEnhancerOptions): Enhancer {
  const { key, rootSelector, Component } = options;
  const readyAttr = `data-ds-${key}-ready`;
  const mountingAttr = `data-ds-${key}-mounting`;
  const pendingSelector = `${rootSelector}:not([${readyAttr}]):not([${mountingAttr}])`;

  const create = (target: Element): EnhancerController | null => {
    if (!(target instanceof HTMLElement) || !target.matches(pendingSelector)) return null;

    target.setAttribute(mountingAttr, "true");
    const app = mount(Component, { target, context: new Map([[ROOT_CONTEXT, target]]) });
    // El montaje deja el markup hidratado de forma SÍNCRONA: `flushSync` corre el `$effect` inicial
    // (el que parchea los atributos) antes de devolver, así el enhancer es idempotente y testeable sin
    // esperar un microtask. Los cambios de estado posteriores también se pueden forzar con `flushSync`.
    flushSync();
    target.removeAttribute(mountingAttr);
    target.setAttribute(readyAttr, "true");

    return {
      root: target,
      destroy: () => {
        void unmount(app);
        target.removeAttribute(readyAttr);
      },
    };
  };

  const mountAll = (target: Document | Element = document): EnhancerController[] => {
    if (typeof document === "undefined") return [];
    const roots: HTMLElement[] = [];
    if (target instanceof HTMLElement && target.matches(pendingSelector)) roots.push(target);
    roots.push(...Array.from(target.querySelectorAll<HTMLElement>(pendingSelector)));
    return roots.map(create).filter((controller): controller is EnhancerController => controller !== null);
  };

  return { key, rootSelector, pendingSelector, mountAll };
}

/**
 * Turns one private Svelte implementation into the same small mount interface as the DOM-only
 * enhancers. The caller gets only a count, not controllers or the implementation's state machine.
 */
export function createSvelteMount(options: SvelteEnhancerOptions): Mount {
  const enhancer = createSvelteEnhancer(options);

  return (target) => {
    if (!target && typeof document === "undefined") return 0;
    return enhancer.mountAll(target ?? document).length;
  };
}

/**
 * Same small `Mount` interface for an enhancer that has NO Zag machine, the ones the platform gives
 * natively and the enhancer only syncs (button, slider, sidebar, toast, segmented, vaul). It mounts the
 * generic Imperative.svelte, which runs the imperative `connect` in its Svelte lifecycle, so there is a
 * SINGLE mount path (no legacy `createEnhancer`). The `connect` is passed by context, not props.
 */
export function createConnectMount(options: { key: string; rootSelector: string; connect: Connect }): Mount {
  const { rootSelector, connect } = options;
  // Los enhancers imperativos comparten el marcador de ciclo de vida `data-ds-ready`/`-mounting` (como
  // el viejo createEnhancer), no uno por-key: sus selectores son disjuntos, así que una raíz la enhancea
  // exactamente un enhancer. El montaje sigue siendo Svelte (Imperative.svelte), no createEnhancer.
  const readyAttr = "data-ds-ready";
  const mountingAttr = "data-ds-mounting";
  // Comma-safe: the guard has to attach to EACH selector (Vaul is `[data-ds-vaul], [data-ds-dialog-vaul]`).
  const pendingSelector = rootSelector
    .split(",")
    .map((part) => `${part.trim()}:not([${readyAttr}]):not([${mountingAttr}])`)
    .join(", ");

  const create = (target: Element): boolean => {
    if (!(target instanceof HTMLElement) || !target.matches(pendingSelector)) return false;
    target.setAttribute(mountingAttr, "true");
    const app = mount(Imperative, {
      target,
      context: new Map<symbol, unknown>([
        [ROOT_CONTEXT, target],
        [CONNECT_CONTEXT, connect],
      ]),
    });
    // Mismo montaje síncrono que createSvelteEnhancer: el onMount (que corre `connect`) queda aplicado
    // antes de devolver, así el enhancer es idempotente y testeable sin esperar un microtask.
    flushSync();
    target.removeAttribute(mountingAttr);
    target.setAttribute(readyAttr, "true");
    // Desmontar corre onDestroy → el cleanup del connect, y libera el marcador para poder re-montar.
    mountedApps.set(target, () => {
      void unmount(app);
      target.removeAttribute(readyAttr);
    });
    return true;
  };

  return (target = document) => {
    if (typeof document === "undefined") return 0;
    const roots: HTMLElement[] = [];
    if (target instanceof HTMLElement && target.matches(pendingSelector)) roots.push(target);
    roots.push(...Array.from(target.querySelectorAll<HTMLElement>(pendingSelector)));
    return roots.filter(create).length;
  };
}
