import { onDestroy } from "svelte";
import {
  applyZagProps,
  bindZagEvents,
  ensureClasses,
  type DomProps,
} from "./apply.js";

/*
 * BINDING A PART: one entry, not four lines in two lifecycle hooks.
 *
 * Every machine-backed enhancer patches the same way, and until now it said so twice per part:
 *
 *     $effect(() => { applyZagProps(trigger, api.getTriggerProps() as DomProps); });
 *     onMount(() => { cleanups.push(bindZagEvents(trigger, () => api.getTriggerProps() as DomProps)); });
 *     onDestroy(() => { for (const c of cleanups) c(); });
 *
 * The same `getTriggerProps` named twice, in two hooks that run at different moments, with two casts,
 * and a teardown array each file re-declares. Measured across the 24 `.svelte` enhancers: 107
 * `applyZagProps` calls, 44 `bindZagEvents` calls, 161 `as DomProps` casts, 19 copies of the cleanup
 * triad, 28 inline null-guards.
 *
 * WHAT THAT SHAPE COSTS, and why this module exists rather than a tidier convention: the two
 * statements could disagree, and they did. `NumberField.svelte` guarded the patch on five parts and
 * the wiring on three, so a root with an input and both buttons but no label got LIVE LISTENERS AND
 * ZERO ATTRIBUTES - the click ran the machine and nothing was written back. One entry per part makes
 * that state unrepresentable: a part gets its attributes and its listeners, or it gets neither.
 *
 * `apply.ts` IS NOT TOUCHED, and that is the point. The stale-attribute sweep, the per-declaration
 * style patching, the `false`-versus-`undefined` rule and the re-read-on-fire handler indirection are
 * incident reports, each written the day something broke. This module becomes their only caller; it
 * does not re-derive any of them.
 */

/**
 * The props a part is patched with.
 *
 * `object` rather than `DomProps`, and that is the whole reason the casts disappear: a Zag `connect()`
 * types its props against a framework's own attribute interfaces (`@zag-js/menu` hands back Svelte's
 * `HTMLButtonAttributes`), which are closed and carry no index signature. `object` accepts every one
 * of them with no assertion. The single conversion happens once, below.
 */
export type PartProps = object;

/** How a part's `style` is written. */
export type StylePolicy =
  /** Every patch. The default. */
  | "always"
  /**
   * The first patch only.
   *
   * For a node whose machine ALSO writes style by hand: the `style` `connect` returns is static
   * configuration, and re-asserting it on every state change beats what the machine just wrote. The
   * carousel is the case that found it - it sets `scroll-snap-type: none` while you drag, the effect
   * restored `x mandatory` in the same frame, and 10px of drag jumped a whole slide.
   */
  | "once"
  /** Never. */
  | "never";

export type PartBinding = {
  /**
   * The part's name (`"trigger"`, `"root"`, `"item"`). Nothing is looked up by it: it is what an
   * error message says, so a failure names a part instead of an anonymous node.
   */
  readonly part: string;

  /**
   * The node, re-read on every patch.
   *
   * A thunk and never a value, for one reason: a node held by `bind:this` is `undefined` during
   * initialisation, and a node the enhancer renders itself does not exist yet. Returning null or
   * undefined means "this part is not in the markup right now" - nothing is patched, nothing is
   * wired, nothing throws. That is the documented silence the enhancers hand-wrote 28 times.
   */
  readonly node: () => HTMLElement | null | undefined;

  /**
   * The props to patch, re-called on every patch AND on every event firing, so the handler that runs
   * is always the machine's current closure.
   *
   * MUST be cheap, and its identity MUST be stable: it is captured once, at initialisation, and never
   * re-read. That is structural rather than advisory - a fresh props function per patch is what makes
   * Zag's `prop()` reads grow a chain instead of staying O(1).
   *
   * Returning `null` skips this part for this round without unbinding anything, which is how an
   * enhancer keeps an incremental dirty-diff instead of re-patching every authored row on every
   * keystroke.
   */
  readonly props: () => PartProps | null;

  /**
   * Wire the props' `on*` handlers onto this node. Off by default.
   *
   * Bound exactly once per node, the first time `node()` and `props()` are both non-null, and
   * released when the enhancer is destroyed. A re-render that produces a new node wires the new one;
   * the old one's listeners die with it.
   */
  readonly events?: boolean;

  /** Default `"always"`. */
  readonly style?: StylePolicy;

  /**
   * Classes guaranteed present even if the author omitted them (`sk-interactive`).
   *
   * `applyZagProps` never writes `class` - the consumer authors the BEM parts. This is the same single
   * named exception `ensureClasses` already is, reachable from the entry so the reason sits with the
   * part rather than being re-explained per file.
   */
  readonly classes?: readonly string[];

  /** Runs immediately after this part is patched. Cross-part work goes in `then`, not here. */
  readonly after?: (node: HTMLElement) => void;
};

export type BindPartsOptions = {
  /**
   * Cross-part work, inside the SAME effect and AFTER every part has been patched.
   *
   * This is where a correction that reads one part and writes another belongs: Tabs' `aria-controls`
   * fix reads the panel's id and writes it onto the trigger, and it cannot run until both have been
   * patched. Without a home here, every such enhancer keeps a second hand-written `$effect` and the
   * ordering between the two is declaration order, which nobody can see.
   */
  readonly then?: () => void;
};

/**
 * Nodes whose listeners are already wired, and how to release them.
 *
 * A `WeakMap` rather than a per-call array so the answer to "is this node already wired" survives a
 * node being replaced: the entry dies with the node it keys.
 */
const wired = new WeakMap<HTMLElement, () => void>();

/** Nodes that have had their `style` written under the `"once"` policy. */
const styled = new WeakSet<HTMLElement>();

/**
 * Binds every part of one enhancer's anatomy: patches attributes reactively, wires events once, and
 * releases everything on destroy.
 *
 * MUST be called during component initialisation - the top level of a `<script>` - because it
 * registers `$effect` and `onDestroy`, which share that precondition. It must also be called AFTER
 * `useMachine(...)`: `@zag-js/svelte` starts the machine in its own `onMount`, and hooks run in
 * declaration order, so binding first leaves the first patch reading a machine that has not started.
 *
 * ONE EFFECT, whatever the part count. Every part reads the same `api`, and `connect()` rebuilds the
 * whole api on each call, so an effect per part would make the patch quadratic in the number of parts.
 * Stating it here makes it true of every enhancer instead of being a comment in the one file that
 * measured it.
 *
 * ATTRIBUTES BEFORE EVENTS, across all parts: the effect patches every part, then wires every
 * not-yet-wired part, then runs `then`. Today that order is inherited from where the two blocks happen
 * to sit in each file.
 */
export function bindParts(
  bindings: readonly PartBinding[],
  options: BindPartsOptions = {},
): void {
  const release: Array<() => void> = [];

  $effect(() => {
    /* The props each present part was patched with, carried so the wiring below starts from a real
     * value rather than re-reading `props()` a second time in the same round. */
    const patched: Array<[PartBinding, HTMLElement, PartProps]> = [];

    for (const binding of bindings) {
      const node = binding.node();
      if (!node) continue;

      const props = binding.props();
      if (props === null) continue;

      if (binding.classes?.length) ensureClasses(node, ...binding.classes);

      /*
       * THE ONE CONVERSION. Every call site used to write `as DomProps` because `connect()`'s return
       * type is a closed interface; here it happens once, at the only boundary that needs it.
       */
      const policy = binding.style ?? "always";
      const writeStyle =
        policy === "always" || (policy === "once" && !styled.has(node));

      applyZagProps(node, props as DomProps, { style: writeStyle });
      if (writeStyle && policy === "once") styled.add(node);

      patched.push([binding, node, props]);
    }

    for (const [binding, node, seen] of patched) {
      if (!binding.events || wired.has(node)) continue;

      /*
       * THE HANDLER LOOKUP FALLS BACK TO THE LAST PROPS WE SAW, and it has to.
       *
       * `bindZagEvents` re-reads the props on every firing so the handler is always the machine's
       * current closure. But `props()` may legitimately return `null` - that is how a part says "not
       * dirty, skip me this round" - and a round being skipped must not disarm a listener that is
       * still wired. Passing the `null` straight through crashed the listener rather than the patch,
       * which is a worse failure than the one `null` exists to avoid: the click reached the DOM,
       * found no handler shape, and threw out of an event callback where nothing could catch it.
       *
       * Caching the last non-null props keeps the two meanings apart: `null` suppresses the PATCH,
       * never the wiring.
       */
      let lastProps: PartProps = seen;
      const off = bindZagEvents(node, () => {
        lastProps = binding.props() ?? lastProps;
        return lastProps as DomProps;
      });

      wired.set(node, off);
      release.push(() => {
        off();
        wired.delete(node);
      });
    }

    for (const [binding, node] of patched) binding.after?.(node);

    options.then?.();
  });

  onDestroy(() => {
    for (const off of release) off();
    release.length = 0;
  });
}
