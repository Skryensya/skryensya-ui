import { fireEvent, getByRole } from "@testing-library/dom";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { mountAccordion } from "./accordion.js";

/*
 * The vanilla half of Accordion. Every assertion here has a twin in
 * `packages/react/src/components/accordion.test.tsx`, in the same order: the two bindings drive the
 * SAME per-item `@zag-js/collapsible` machine over the same coordination rule, so a suite that
 * checked only one would let the pair drift exactly where the contract promises it cannot.
 *
 * WHAT HAS NO TWIN, either way. React owns a controlled `value` and the `headingLevel` clamp, both
 * binding-only by the contract's own split (`AccordionOptions`), so they are tested only there. The
 * last two tests here are the mirror of that: mounting, and WHICH authored node the enhancer binds,
 * are questions JSX cannot ask, because JSX composes the anatomy instead of finding it.
 *
 * The markup is what `emitMarkup` produces for the equivalent usage tree, not markup invented here:
 * a fixture that drifts from the emitter tests an accordion nobody ships.
 */
type Section = { value: string; label: string; defaultOpen?: boolean; disabled?: boolean; headingLevel?: number };

function section({ value, label, defaultOpen, disabled, headingLevel = 3 }: Section): string {
  return `<section class="sk-tile sk-tile--expandable"${disabled ? " data-disabled" : ""} data-value="${value}"${
    defaultOpen ? " data-default-open" : ""
  } data-scope="tile" data-part="item">
    <div class="sk-accordion__trigger-heading" aria-level="${headingLevel}" role="heading" data-part="trigger-heading">
      <button class="sk-tile__trigger sk-tile--interactive sk-interactive" type="button" data-scope="tile" data-part="trigger">${label}</button>
    </div>
    <div class="sk-tile__expandable-content" data-scope="tile" data-part="content">${label} body</div>
  </section>`;
}

const deployment: readonly Section[] = [
  { value: "runtime", label: "Runtime" },
  { value: "rollout", label: "Rollout" },
];

function mount(
  options: {
    type?: "single" | "multiple";
    defaultValue?: string;
    collapsible?: boolean;
    disabled?: boolean;
    sections?: readonly Section[];
  } = {},
): HTMLElement {
  const { type = "single", defaultValue, collapsible = true, disabled = false, sections = deployment } = options;
  document.body.innerHTML = `<div class="sk-accordion" data-sk-accordion data-type="${type}"${
    collapsible ? " data-collapsible" : ' data-collapsible="false"'
  }${disabled ? " data-disabled" : ""}${
    defaultValue === undefined ? "" : ` data-default-value="${defaultValue}"`
  } data-scope="accordion" data-part="root">${sections.map(section).join("")}</div>`;

  const root = document.body.firstElementChild as HTMLElement;
  expect(mountAccordion(document)).toBe(1);
  flushSync();
  return root;
}

const trigger = (root: HTMLElement, name: string) => getByRole(root, "button", { name });

/*
 * A REAL WAIT, for the two tests whose claim is that nothing happened.
 *
 * Zag's collapsible defers its exit behind rafs, so `vi.waitFor` is the wrong tool there: it passes
 * on its first poll, which runs before the change it is supposed to rule out could even have
 * arrived. Both of those tests were written with `waitFor` first and passed with the rule they test
 * deleted.
 */
const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve, 30));
  flushSync();
};

/** Records every `valueChange` the root dispatches, which is how a no-op is told from a move. */
function changes(root: HTMLElement) {
  const seen: unknown[] = [];
  root.addEventListener("sk:accordionvaluechange", (event) => seen.push((event as CustomEvent).detail));
  return seen;
}

/** The panel a trigger actually drives, reached the way a screen reader reaches it. */
const panelOf = (trigger: HTMLElement) =>
  document.getElementById(trigger.getAttribute("aria-controls") ?? "");

describe("Accordion (collapsible-per-item) contracts", () => {
  it("renders the contract's anatomy, and pairs each trigger with its own panel", () => {
    const root = mount({ defaultValue: "runtime" });
    const runtime = trigger(root, "Runtime");
    const item = runtime.closest(".sk-tile") as HTMLElement;

    expect(root.classList).toContain("sk-accordion");
    expect(root.hasAttribute("data-sk-accordion")).toBe(true);
    expect(root.getAttribute("data-scope")).toBe("accordion");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-type")).toBe("single");

    expect(item.classList).toContain("sk-tile--expandable");
    expect(item.getAttribute("data-scope")).toBe("tile");
    expect(item.getAttribute("data-part")).toBe("item");
    expect(item.getAttribute("data-value")).toBe("runtime");
    // The state layer lives on the trigger, not the section: hovering the revealed content must
    // not tint it too.
    expect(item.classList).not.toContain("sk-tile--interactive");

    expect(runtime.classList).toContain("sk-tile__trigger");
    expect(runtime.classList).toContain("sk-tile--interactive");
    expect(runtime.classList).toContain("sk-interactive");
    expect(runtime.getAttribute("data-scope")).toBe("tile");
    expect(runtime.getAttribute("data-part")).toBe("trigger");
    expect(runtime.getAttribute("type")).toBe("button");

    /* The pairing is the section's whole claim on a screen reader: without it the button announces
       a state that belongs to no region. Asserted through `aria-controls` rather than by querying
       for the class, so a panel bound to the WRONG node would fail here rather than pass. */
    const panel = panelOf(runtime)!;
    expect(panel.classList).toContain("sk-tile__expandable-content");
    expect(panel.getAttribute("data-scope")).toBe("tile");
    expect(panel.getAttribute("data-part")).toBe("content");
    expect(panel.textContent).toBe("Runtime body");
    expect(item.contains(panel)).toBe(true);
  });

  it("keeps the authored heading wrapper, and binds the button inside it", () => {
    const root = mount({
      defaultValue: "runtime",
      sections: [deployment[0]!, { ...deployment[1]!, headingLevel: 4 }],
    });
    const runtime = trigger(root, "Runtime");
    const heading = getByRole(root, "heading", { name: "Runtime" });

    /* The wrapper is AUTHORED here, not created by the enhancer the way React's binding creates it:
       what this layer must not do is bind it, clobber it, or leave the button's own role behind. */
    expect(heading.getAttribute("aria-level")).toBe("3");
    expect(heading.classList).toContain("sk-accordion__trigger-heading");
    expect(heading.contains(runtime)).toBe(true);
    expect(heading.tagName).not.toBe("BUTTON");
    // The machine's props landed on the button, never on the heading that wraps it.
    expect(runtime.hasAttribute("aria-expanded")).toBe(true);
    expect(heading.hasAttribute("aria-expanded")).toBe(false);

    expect(getByRole(root, "heading", { name: "Rollout" }).getAttribute("aria-level")).toBe("4");
  });

  it("keeps exactly one item open in single mode", async () => {
    const root = mount({ defaultValue: "runtime" });
    const runtime = trigger(root, "Runtime");
    const rollout = trigger(root, "Rollout");

    expect(runtime.getAttribute("aria-expanded")).toBe("true");
    expect(rollout.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(rollout);
    flushSync();

    /* Rollout opens immediately; Runtime closes ANIMATED (collapsible keeps it visible until the
       exit animation finishes; in jsdom there is no computed animation, so it resolves within one
       raf). The React twin waits for the same reason, through `waitFor`. */
    expect(rollout.getAttribute("aria-expanded")).toBe("true");
    await vi.waitFor(() => expect(runtime.getAttribute("aria-expanded")).toBe("false"));
  });

  it("allows independent open items in multiple mode", async () => {
    const root = mount({ type: "multiple", defaultValue: "runtime" });
    const runtime = trigger(root, "Runtime");
    const rollout = trigger(root, "Rollout");

    fireEvent.click(rollout);
    flushSync();

    expect(runtime.getAttribute("aria-expanded")).toBe("true");
    expect(rollout.getAttribute("aria-expanded")).toBe("true");

    // And closing one leaves the other alone: `multiple` means every section can close on its own,
    // which is also why `collapsible` does not gate it.
    fireEvent.click(runtime);
    flushSync();
    await vi.waitFor(() => expect(runtime.getAttribute("aria-expanded")).toBe("false"));
    expect(rollout.getAttribute("aria-expanded")).toBe("true");
  });

  it("opens every value a multiple defaultValue names", () => {
    /* The markup channel for a set: ONE comma-separated attribute, because an attribute cannot hold
       the array React's `defaultValue` takes. This is the seam where the two spellings meet. */
    const root = mount({ type: "multiple", defaultValue: "runtime,rollout" });

    expect(trigger(root, "Runtime").getAttribute("aria-expanded")).toBe("true");
    expect(trigger(root, "Rollout").getAttribute("aria-expanded")).toBe("true");
  });

  it("refuses to close the last open section when collapsible is false", async () => {
    const root = mount({ collapsible: false, defaultValue: "runtime" });
    const seen = changes(root);
    const runtime = trigger(root, "Runtime");
    const rollout = trigger(root, "Rollout");

    fireEvent.click(runtime);
    flushSync();
    await settle();
    /* THE DECISIVE ASSERTION: the open set did not MOVE, so the notification carries the value it
       already had rather than the `null` a real close sends. `aria-expanded` alone cannot say that,
       because it reads "true" both when the rule held and before a close it failed to prevent. */
    expect(seen).toEqual([{ value: "runtime" }]);
    expect(runtime.getAttribute("aria-expanded")).toBe("true");
    expect(panelOf(runtime)!.hasAttribute("hidden")).toBe(false);

    /* Not inert: the same machine still MOVES when the click is a real move, so the assertions
       above are the rule holding rather than the accordion being dead. */
    fireEvent.click(rollout);
    flushSync();
    expect(rollout.getAttribute("aria-expanded")).toBe("true");
    await vi.waitFor(() => expect(runtime.getAttribute("aria-expanded")).toBe("false"));
  });

  it("hides the closed section's panel instead of leaving it in the accessibility tree", async () => {
    const root = mount({ defaultValue: "runtime" });
    const runtime = trigger(root, "Runtime");
    const rollout = trigger(root, "Rollout");

    /* The point of the whole component: `aria-expanded` is a promise, and `hidden` on the panel is
       the thing that keeps it. A closed section whose answer is still readable announces twice. */
    expect(panelOf(runtime)!.hasAttribute("hidden")).toBe(false);
    expect(panelOf(rollout)!.hasAttribute("hidden")).toBe(true);

    fireEvent.click(rollout);
    flushSync();
    expect(panelOf(rollout)!.hasAttribute("hidden")).toBe(false);
    await vi.waitFor(() => expect(panelOf(runtime)!.hasAttribute("hidden")).toBe(true));
  });

  it("seeds open state from item defaultOpen when the root has no defaultValue", () => {
    const root = mount({ sections: [deployment[0]!, { ...deployment[1]!, defaultOpen: true }] });

    expect(trigger(root, "Rollout").getAttribute("aria-expanded")).toBe("true");
    expect(trigger(root, "Runtime").getAttribute("aria-expanded")).toBe("false");
  });

  it("lets root defaultValue win over item defaultOpen", () => {
    const sections = [deployment[0]!, { ...deployment[1]!, defaultOpen: true }];

    const single = mount({ defaultValue: "runtime", sections });
    expect(trigger(single, "Runtime").getAttribute("aria-expanded")).toBe("true");
    expect(trigger(single, "Rollout").getAttribute("aria-expanded")).toBe("false");

    /* BOTH MODES, because only one of them can actually fail. In `single` an item that contributes
       a default is already refused for holding a second value, so the precedence rule itself only
       shows in `multiple`, where nothing else stands between `data-default-open` and the open set. */
    const multiple = mount({ type: "multiple", defaultValue: "runtime", sections });
    expect(trigger(multiple, "Runtime").getAttribute("aria-expanded")).toBe("true");
    expect(trigger(multiple, "Rollout").getAttribute("aria-expanded")).toBe("false");
  });

  it("ignores a click on a disabled section, whether the root or the item disabled it", async () => {
    const fromRoot = mount({ disabled: true, defaultValue: "runtime" });
    const fromRootSeen = changes(fromRoot);
    const rootDisabled = trigger(fromRoot, "Rollout");
    expect(rootDisabled.getAttribute("data-disabled")).toBe("");
    fireEvent.click(rootDisabled);
    flushSync();
    await settle();
    /* The machine never reports a change at all, and that is the assertion that bites: this section
       is closed to begin with, so watching `aria-expanded` alone would pass whether the click was
       ignored or honoured. */
    expect(fromRootSeen).toEqual([]);
    expect(rootDisabled.getAttribute("aria-expanded")).toBe("false");

    const fromItem = mount({
      defaultValue: "runtime",
      sections: [deployment[0]!, { ...deployment[1]!, disabled: true }],
    });
    const fromItemSeen = changes(fromItem);
    const itemDisabled = trigger(fromItem, "Rollout");
    expect(itemDisabled.getAttribute("data-disabled")).toBe("");
    fireEvent.click(itemDisabled);
    flushSync();
    await settle();
    expect(fromItemSeen).toEqual([]);
    expect(itemDisabled.getAttribute("aria-expanded")).toBe("false");
    // The section its neighbour left open is untouched: a disabled item is inert, not a reset.
    expect(trigger(fromItem, "Runtime").getAttribute("aria-expanded")).toBe("true");
  });

  it("dispatches the contract valueChange event on the root, carrying the shape its type promises", async () => {
    const root = mount({ defaultValue: "runtime" });
    const single = vi.fn();
    root.addEventListener("sk:accordionvaluechange", single);

    fireEvent.click(trigger(root, "Rollout"));
    flushSync();
    expect(single).toHaveBeenCalledOnce();
    expect(single.mock.calls[0]![0]).toMatchObject({
      type: "sk:accordionvaluechange",
      detail: { value: "rollout" },
    });

    // Closing the only open section in single mode is the `null` half of `string | null`.
    fireEvent.click(trigger(root, "Rollout"));
    flushSync();
    expect(single.mock.calls[1]![0]).toMatchObject({ detail: { value: null } });

    /* `single` carries a string or null, `multiple` an array. Both halves of that promise are here
       because a listener written against one shape breaks silently on the other. */
    const many = vi.fn();
    const multiple = mount({ type: "multiple", defaultValue: "runtime" });
    multiple.addEventListener("sk:accordionvaluechange", many);

    fireEvent.click(trigger(multiple, "Rollout"));
    flushSync();
    expect(many.mock.calls[0]![0]).toMatchObject({ detail: { value: ["runtime", "rollout"] } });

    fireEvent.click(trigger(multiple, "Runtime"));
    flushSync();
    expect(many.mock.calls[1]![0]).toMatchObject({ detail: { value: ["rollout"] } });
  });

  /*
   * NO REACT TWIN: enhancing is this layer's own job. A root enhanced twice would run two machines
   * over one set of nodes, and the second would win every patch.
   */
  it("enhances an authored root, once", () => {
    mount({ defaultValue: "runtime" });
    expect(mountAccordion(document)).toBe(0);
  });

  /*
   * NO REACT TWIN, and this is the bug that earned the `:scope >` in Accordion.svelte.
   *
   * `data-part="content"` names two different things in this component's vocabulary: the collapsible
   * PANEL, and the title-and-description block a Tile puts inside its TRIGGER. A descendant query
   * finds whichever comes first in the DOM, which is the one inside the button, so a section built
   * out of TileContent bound the wrong node as its panel: the answer never collapsed and stayed
   * exposed to a screen reader. JSX cannot reproduce it, because there the panel is passed in.
   */
  it("binds the section's own panel, not the TileContent inside its trigger", async () => {
    document.body.innerHTML = `<div class="sk-accordion" data-sk-accordion data-type="single" data-collapsible data-default-value="runtime" data-scope="accordion" data-part="root">
      <section class="sk-tile sk-tile--expandable" data-value="runtime" data-scope="tile" data-part="item">
        <div class="sk-accordion__trigger-heading" aria-level="3" role="heading" data-part="trigger-heading">
          <button class="sk-tile__trigger sk-tile--interactive sk-interactive" type="button" data-scope="tile" data-part="trigger">
            <span class="sk-tile__content" data-part="content"><span class="sk-tile__title">Runtime</span></span>
          </button>
        </div>
        <div class="sk-tile__expandable-content" data-scope="tile" data-part="content">Node 24</div>
      </section>
    </div>`;
    const root = document.body.firstElementChild as HTMLElement;
    expect(mountAccordion(document)).toBe(1);
    flushSync();

    const runtime = trigger(root, "Runtime");
    const panel = panelOf(runtime)!;
    expect(panel.classList).toContain("sk-tile__expandable-content");
    expect(runtime.contains(panel)).toBe(false);

    // And it really is the panel: closing the section hides THAT node, not the label in the button.
    fireEvent.click(runtime);
    flushSync();
    await vi.waitFor(() => expect(panel.hasAttribute("hidden")).toBe(true));
    expect(runtime.querySelector(".sk-tile__content")!.hasAttribute("hidden")).toBe(false);
  });
});
