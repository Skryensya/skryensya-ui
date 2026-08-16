import { checkboxGroupEvents, type CheckedState } from "@skryensya/core/selection";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * The tri-state parent, and the one enhancer with no Zag machine to borrow.
 *
 * There is nothing here for a state machine to own: `checked` and `indeterminate` are flags the
 * platform already keeps on every input, and the group's whole job is one derivation over them plus
 * one assignment back. Reaching for a machine would mean holding a second copy of state the DOM is
 * already holding, and the two would disagree the first time a form reset moved the inputs without
 * telling anyone — which is exactly the bug the `reset` listener below exists to not have.
 */

const ALL = "[data-sk-checkbox-group-all]";
const ITEM = "[data-sk-checkbox-group-item]";

/**
 * Children of THIS group only.
 *
 * `querySelectorAll` reaches through nested groups, and a group inside a group is not hypothetical:
 * a permissions tree is the obvious next thing an author builds out of this. A child claimed by a
 * closer group belongs to that one, so its own parent — not this one — is what it counts toward.
 */
function ownItems(root: HTMLElement): HTMLInputElement[] {
  return Array.from(root.querySelectorAll<HTMLInputElement>(ITEM)).filter(
    (item) => item.closest("[data-sk-checkbox-group]") === root,
  );
}

/** All / none / some, ignoring disabled children: a box nobody can reach is not a vote. */
function readState(items: readonly HTMLInputElement[]): CheckedState {
  const eligible = items.filter((item) => !item.disabled);
  if (eligible.length === 0) return false;
  if (eligible.every((item) => item.checked)) return true;
  if (eligible.some((item) => item.checked)) return "indeterminate";
  return false;
}

let uid = 0;

/*
 * `aria-controls` on the parent, naming which children it speaks for — the WAI-ARIA mixed-checkbox
 * pattern's own relationship attribute, the same idea `aria-describedby` is for FormField's hint and
 * error. It is set here rather than in the contract because there is nothing THERE that could know
 * it: the ids are assigned at runtime, exactly like `indeterminate` two lines up, which has no
 * templated representation either. An item's own authored `id` survives untouched; only a
 * missing one gets a generated placeholder, so an id some other part of the page already points at
 * (a `<label for>`, an `aria-describedby`) is never silently replaced out from under it.
 */
function ensureIds(items: readonly HTMLInputElement[]): string[] {
  return items.map((item) => {
    if (!item.id) item.id = `sk-checkbox-group-item-${++uid}`;
    return item.id;
  });
}

function connect(root: HTMLElement): () => void {
  const parent = root.querySelector<HTMLInputElement>(ALL);
  if (!parent) return () => {};

  parent.setAttribute("aria-controls", ensureIds(ownItems(root)).join(" "));

  const sync = () => {
    const state = readState(ownItems(root));
    parent.checked = state === true;
    parent.indeterminate = state === "indeterminate";
    return state;
  };

  const announce = (checked: CheckedState) => {
    root.dispatchEvent(
      new CustomEvent(checkboxGroupEvents.valueChange, {
        bubbles: true,
        detail: {
          checked,
          value: ownItems(root)
            .filter((item) => item.checked)
            .map((item) => item.value),
        },
      }),
    );
  };

  const onChange = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (target === parent) {
      /*
       * A click always lands on `checked`, never on `indeterminate`: the browser clears that flag
       * on interaction, so "some are checked" resolves to "check them all" on the first click and
       * "uncheck them all" on the next. That is the behaviour every native-feeling select-all has,
       * and it falls out of the platform rather than being coded as a third case.
       */
      const next = parent.checked;
      for (const item of ownItems(root)) {
        if (item.disabled) continue;
        item.checked = next;
      }
      parent.indeterminate = false;
      announce(next);
      return;
    }

    // A child of a NESTED group: that group's own enhancer already handled it, and its parent's
    // resulting state is what this group counts. Re-deriving here is correct either way, since
    // `ownItems` never saw the nested child; the guard is only about not announcing twice.
    if (!ownItems(root).includes(target)) return;
    announce(sync());
  };

  /*
   * Reset moves the inputs back to their `checked` attributes WITHOUT firing change on any of them,
   * and it does so after this event, not before. Without the deferral the parent would be derived
   * from the values the form is about to discard, and the group would sit visibly disagreeing with
   * its own children until the next click.
   */
  const onReset = () => {
    queueMicrotask(sync);
  };

  root.addEventListener("change", onChange);
  root.ownerDocument.addEventListener("reset", onReset);
  sync();

  return () => {
    root.removeEventListener("change", onChange);
    root.ownerDocument.removeEventListener("reset", onReset);
  };
}

/** Mounts only authored CheckboxGroup roots; it never scans or imports another enhancer. */
export const mountCheckboxGroup = createConnectMount({
  key: "checkbox-group",
  rootSelector: "[data-sk-checkbox-group]",
  connect,
});
