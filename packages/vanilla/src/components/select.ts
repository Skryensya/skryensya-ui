import {
  anchorNameFor,
  bindAnchor,
  stripPositioningStyle,
  supportsAnchorPositioning,
} from "@skryensya/core/anchored";
import { selectEvents, type SelectOption, type SelectValueChangeDetails } from "@skryensya/core/select";
import * as select from "@zag-js/select";
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = "[data-sk-select]";
const hiddenSelector = "[data-sk-select-hidden]";
const labelSelector = "[data-sk-select-label]";
const controlSelector = "[data-sk-select-control]";
const triggerSelector = "[data-sk-select-trigger]";
const valueSelector = "[data-sk-select-value]";
const indicatorSelector = "[data-sk-select-indicator]";
const positionerSelector = "[data-sk-select-positioner]";
const contentSelector = "[data-sk-select-content]";
const itemSelector = "[data-sk-select-item]";
const itemTextSelector = "[data-sk-select-item-text]";
const itemIndicatorSelector = "[data-sk-select-item-indicator]";

type Cleanup = () => void;

export type SelectEnhancerOptions = {
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  defaultValue?: string[];
  placeholder?: string;
  onValueChange?: (details: SelectValueChangeDetails) => void;
};

/*
 * The non-native select, without a framework.
 *
 * There IS no native equivalent for a listbox with typeahead, highlight and controlled positioning
 * (decision 8), so a machine earns its place, the same Zag machine React's Select drives. Each
 * binding imports and adapts its own machine (decision 14); what the two share is the parts, not the
 * runtime.
 *
 * The consumer authors the whole anatomy and this patches it: the markup contract is documented,
 * never shipped. The authored items ARE the collection, the DOM is the source of truth here, the
 * same way the tabs enhancer reads its authored triggers.
 */
export function connectSelect(root: HTMLElement, options: SelectEnhancerOptions = {}): Cleanup {
  const trigger = root.querySelector<HTMLElement>(triggerSelector);
  const valueEl = root.querySelector<HTMLElement>(valueSelector);
  const content = root.querySelector<HTMLElement>(contentSelector);
  const positioner = root.querySelector<HTMLElement>(positionerSelector);
  const itemEls = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));

  if (!trigger) throw new Error("Select requires a [data-sk-select-trigger] element.");
  if (!content) throw new Error("Select requires a [data-sk-select-content] element.");
  if (itemEls.length === 0) throw new Error("Select requires at least one [data-sk-select-item].");

  const items = itemEls.map(readItem);
  const hidden = root.querySelector<HTMLSelectElement>(hiddenSelector);
  if (hidden) assertHiddenSelectMatches(hidden, items);

  const collection = select.collection<SelectOption>({
    items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    isItemDisabled: (item) => Boolean(item.disabled),
  });

  const placeholder = options.placeholder ?? root.dataset.placeholder ?? "";
  const selectId = options.id ?? (root.id || `sk-select-${Math.random().toString(36).slice(2)}`);

  // PROGRESSIVE ENHANCEMENT, when the browser has the CSS Anchor Positioning API, the placement
  // lives in select.css (behind the same @supports gate); all that can't live in shared CSS is the
  // anchor↔popup RELATIONSHIP: a name unique to this instance tying THIS trigger to THIS listbox.
  // Where the API is absent, `anchorName` is null and Zag's JS positioning (configured below) is
  // the sole placement, the fallback, not a lesser path.
  const anchorName = supportsAnchorPositioning() ? anchorNameFor(selectId) : null;
  let unbindAnchor: (() => void) | undefined;

  const machine = new VanillaMachine(select.machine, {
    id: selectId,
    /* Authored ids win. Left to itself the machine derives its own (`select:brand`) and spreads them
     * over whatever the consumer wrote, so an id they authored, and target from their own CSS or
     * script, would silently change the moment this mounts. It only ever writes these ids out; it
     * never looks an element up by one. */
    ids: authoredIds(root, { hidden, trigger, content }),
    collection,
    name: options.name ?? hidden?.name ?? root.dataset.name,
    disabled: options.disabled ?? root.hasAttribute("data-disabled"),
    required: options.required ?? root.hasAttribute("data-required"),
    defaultValue: options.defaultValue ?? readDefaultValue(root),
    // Placement (the JS fallback, see the CSS anchor-positioning path in select.css for browsers
    // that have the API). `bottom-start` opens below the trigger, left edges aligned; `flip` sends
    // it to whichever side has room when the default would overflow. `sameWidth` matches the
    // trigger's width so the edges line up instead of floating at content width.
    //
    // A dialog is a clipping ancestor but not the visual boundary of a menu: constraining the
    // listbox to it flips selections near the lower edge over the dialog's own heading. Measure
    // against the viewport (documentElement) instead while the popup stays in the dialog's top layer.
    positioning: {
      placement: "bottom-start",
      sameWidth: true,
      gutter: 8, // matches the CSS anchor path's --space-stack-xs gutter
      flip: true,
      boundary: root.closest("dialog") ? document.documentElement : undefined,
    },
    /* Narrowed to the documented shape on purpose. Zag hands over its own details object, with the
     * resolved items alongside the value; forwarding it verbatim would publish the machine's shape
     * as this event's contract, and the machine is each binding's own business (decision 14). */
    onValueChange({ value }: { value: string[] }) {
      const details: SelectValueChangeDetails = { value };
      options.onValueChange?.(details);
      root.dispatchEvent(
        new CustomEvent<SelectValueChangeDetails>(selectEvents.valueChange, { bubbles: true, detail: details }),
      );
    },
  });

  /* One live cleanup per node: spreadProps diffs against its own previous call, so re-spreading is
   * how it is meant to be driven, only the last teardown is the one that must run at destroy. */
  const cleanups = new Map<Element, Cleanup>();
  const spread = (node: Element | null, props: Record<string, unknown>) => {
    if (!node) return;
    cleanups.set(node, spreadProps(node, stripOwnedByConsumer(props)));
  };

  const render = () => {
    const api = select.connect(machine.service, normalizeProps);

    spread(root, api.getRootProps());
    spread(hidden, api.getHiddenSelectProps());
    spread(root.querySelector(labelSelector), api.getLabelProps());
    spread(root.querySelector(controlSelector), api.getControlProps());
    spread(trigger, api.getTriggerProps());
    spread(valueEl, api.getValueTextProps());
    spread(root.querySelector(indicatorSelector), api.getIndicatorProps());
    // On the anchor path, CSS owns placement (select.css), so drop Zag's inline positioning styles
    // entirely, leaving them would fight the browser's positioner and, being inline, would force
    // the CSS to `!important`, which `position-try` can't flip. Everything else (id, dir) stays.
    const positionerProps = api.getPositionerProps();
    spread(positioner, anchorName ? stripPositioningStyle(positionerProps) : positionerProps);
    spread(content, api.getContentProps());

    itemEls.forEach((el, index) => {
      const item = items[index];
      spread(el, api.getItemProps({ item }));
      spread(el.querySelector(itemTextSelector), api.getItemTextProps({ item }));
      spread(el.querySelector(itemIndicatorSelector), api.getItemIndicatorProps({ item }));
    });

    /* The one place this writes CONTENT rather than attributes. The displayed value is the machine's
     * it changes on every selection, so leaving it to the consumer would leave it stale. The
     * placeholder is still theirs: it is only read, never invented. */
    if (valueEl) valueEl.textContent = api.valueAsString || placeholder;

    /* Re-assert the anchor wiring HERE, not once at mount: `spread(positioner, …)` above rewrites the
     * positioner's inline style each render, dropping the hook we set earlier. Stamping after the
     * spread keeps it stable across every open/close. Idempotent, so it's free to repeat. */
    if (anchorName) unbindAnchor = bindAnchor(trigger, positioner, anchorName);
  };

  const unsubscribe = machine.subscribe(render);
  machine.start();
  render();

  return () => {
    unsubscribe();
    machine.stop();
    for (const cleanup of cleanups.values()) cleanup();
    unbindAnchor?.();
  };
}

/*
 * `spreadProps` assigns `class` straight onto className and `children` straight into innerHTML. An
 * enhancer does neither: the consumer owns their classes and their markup. Zag does not currently
 * emit either key for these parts, this is the guard that keeps that true if it ever does.
 */
function stripOwnedByConsumer(props: Record<string, unknown>): Record<string, unknown> {
  const { class: _class, className: _className, children: _children, ...rest } = props;
  return rest;
}

/* Only the parts the consumer actually gave an id to; anything absent stays the machine's to name. */
function authoredIds(
  root: HTMLElement,
  parts: { hidden: HTMLElement | null; trigger: HTMLElement; content: HTMLElement },
): Record<string, string> {
  const ids: Record<string, string> = {};
  const claim = (key: string, el: HTMLElement | null) => {
    if (el?.id) ids[key] = el.id;
  };

  claim("root", root);
  claim("trigger", parts.trigger);
  claim("content", parts.content);
  claim("hiddenSelect", parts.hidden);
  claim("control", root.querySelector(controlSelector));
  claim("label", root.querySelector(labelSelector));
  claim("positioner", root.querySelector(positionerSelector));

  return ids;
}

function readItem(el: HTMLElement): SelectOption {
  const value = el.dataset.value;
  if (!value) throw new Error("Every [data-sk-select-item] needs a non-empty data-value.");

  const text = el.querySelector<HTMLElement>(itemTextSelector) ?? el;

  return {
    value,
    label: text.textContent?.trim() || value,
    disabled: el.hasAttribute("data-disabled"),
  };
}

function readDefaultValue(root: HTMLElement): string[] | undefined {
  const value = root.dataset.value;
  return value ? [value] : undefined;
}

/*
 * The hidden select is optional, it is what makes the menu submit inside a form, and what a no-JS
 * visitor is left with. When it is there it must agree with the items, because two authored lists
 * that drift render a menu that submits a different value than it shows.
 */
function assertHiddenSelectMatches(hidden: HTMLSelectElement, items: readonly SelectOption[]): void {
  const authored = Array.from(hidden.options).map((option) => option.value);
  const expected = items.map((item) => item.value);

  if (authored.join(" ") !== expected.join(" ")) {
    throw new Error(
      `Select hidden select drifted from its items: [${authored.join(", ")}] vs [${expected.join(", ")}].`,
    );
  }
}

export const mountSelect = createConnectMount({ key: "select", rootSelector, connect: (root) => connectSelect(root) });
