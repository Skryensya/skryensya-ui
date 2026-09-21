import { act, fireEvent, render, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { accordionEvents } from "@skryensya/core/accordion";
import { Accordion } from "./accordion.js";

/*
 * The React half of Accordion. Every assertion here has a twin in
 * `packages/vanilla/src/components/accordion.svelte.test.ts`, in this order: the two bindings drive
 * the SAME per-item `@zag-js/collapsible` machine over the same coordination rule, so a suite that
 * checked only one would let the pair drift exactly where the contract promises it cannot.
 *
 * Three tests have no twin, and each says so where it stands: a controlled `value` and the
 * `headingLevel` clamp are binding-only by the contract's own split, and the vanilla file's own
 * extras (mount idempotency, and which node the enhancer picks out of authored markup) are
 * questions JSX cannot ask.
 */
const items = (
  <>
    <Accordion.Item value="runtime"><Accordion.Trigger>Runtime</Accordion.Trigger><Accordion.Content>Node 24</Accordion.Content></Accordion.Item>
    <Accordion.Item value="rollout"><Accordion.Trigger>Rollout</Accordion.Trigger><Accordion.Content>10%, then 100%</Accordion.Content></Accordion.Item>
  </>
);

/*
 * A REAL WAIT, for the two tests whose claim is that nothing happened.
 *
 * Zag's collapsible defers its exit behind rafs, so `waitFor` is the wrong tool there: it passes on
 * its first poll, which runs before the change it is supposed to rule out could even have arrived.
 * Both of those tests were written with `waitFor` first and passed with the rule they test deleted.
 */
const settle = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 30)); });

/** The panel a trigger actually drives, reached the way a screen reader reaches it. */
const panelOf = (trigger: HTMLElement) =>
  document.getElementById(trigger.getAttribute("aria-controls") ?? "");

describe("Accordion React contracts", () => {
  it("renders the contract's anatomy, and pairs each trigger with its own panel", () => {
    const ui = render(<Accordion defaultValue="runtime">{items}</Accordion>);
    const root = ui.container.firstElementChild!;
    const trigger = ui.getByRole("button", { name: "Runtime" });
    const item = trigger.closest(".sk-tile")!;

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

    expect(trigger.classList).toContain("sk-tile__trigger");
    expect(trigger.classList).toContain("sk-tile--interactive");
    expect(trigger.classList).toContain("sk-interactive");
    expect(trigger.getAttribute("data-scope")).toBe("tile");
    expect(trigger.getAttribute("data-part")).toBe("trigger");
    expect(trigger.getAttribute("type")).toBe("button");

    /* The pairing is the section's whole claim on a screen reader: without it the button announces
       a state that belongs to no region. Asserted through `aria-controls` rather than by querying
       for the class, so a panel bound to the WRONG node would fail here rather than pass. */
    const panel = panelOf(trigger)!;
    expect(panel.classList).toContain("sk-tile__expandable-content");
    expect(panel.getAttribute("data-scope")).toBe("tile");
    expect(panel.getAttribute("data-part")).toBe("content");
    expect(panel.textContent).toBe("Node 24");
    expect(item.contains(panel)).toBe(true);
  });

  it("wraps each trigger in a heading so it is reachable by heading navigation", () => {
    const ui = render(
      <Accordion defaultValue="runtime">
        <Accordion.Item value="runtime">
          <Accordion.Trigger>Runtime</Accordion.Trigger>
          <Accordion.Content>Node 24</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="rollout">
          <Accordion.Trigger headingLevel={4}>Rollout</Accordion.Trigger>
          <Accordion.Content>10%, then 100%</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    const trigger = ui.getByRole("button", { name: "Runtime" });
    const heading = ui.getByRole("heading", { name: "Runtime" });
    // Defaults to 3, the level the same sections use rendered as `<details>` elsewhere in the docs.
    expect(heading.getAttribute("aria-level")).toBe("3");
    expect(heading.classList).toContain("sk-accordion__trigger-heading");
    // The heading wraps the button; it does not replace it, and the button keeps its own role.
    expect(heading.contains(trigger)).toBe(true);
    expect(heading.tagName).not.toBe("BUTTON");

    expect(ui.getByRole("heading", { name: "Rollout" }).getAttribute("aria-level")).toBe("4");
  });

  /*
   * NO VANILLA TWIN, and the contract is why: `aria-level` is authored straight into the markup
   * there, and the range is enforced before it is written (`headingLevel` declares `min: 1, max: 6`,
   * which `checkBounds` refuses a tree for). React takes a live number from a caller no validator
   * ever sees, so the clamp has to exist at runtime and be tested here.
   */
  it("clamps headingLevel to the 1..6 range aria-level means", () => {
    const ui = render(
      <Accordion>
        <Accordion.Item value="low">
          <Accordion.Trigger headingLevel={0}>Low</Accordion.Trigger>
          <Accordion.Content>a</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="high">
          <Accordion.Trigger headingLevel={9}>High</Accordion.Trigger>
          <Accordion.Content>b</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    expect(ui.getByRole("heading", { name: "Low" }).getAttribute("aria-level")).toBe("1");
    expect(ui.getByRole("heading", { name: "High" }).getAttribute("aria-level")).toBe("6");
  });

  it("keeps exactly one item open in single mode", async () => {
    const onValueChange = vi.fn();
    const ui = render(<Accordion defaultValue="runtime" onValueChange={onValueChange}>{items}</Accordion>);
    const runtime = ui.getByRole("button", { name: "Runtime" });
    const rollout = ui.getByRole("button", { name: "Rollout" });

    expect(runtime.getAttribute("aria-expanded")).toBe("true");
    expect(rollout.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(rollout);

    await waitFor(() => {
      expect(runtime.getAttribute("aria-expanded")).toBe("false");
      expect(rollout.getAttribute("aria-expanded")).toBe("true");
      expect(onValueChange).toHaveBeenCalledWith({ value: "rollout" });
    });
  });

  it("allows independent open items in multiple mode", async () => {
    const ui = render(<Accordion type="multiple" defaultValue={["runtime"]}>{items}</Accordion>);
    const runtime = ui.getByRole("button", { name: "Runtime" });
    const rollout = ui.getByRole("button", { name: "Rollout" });

    fireEvent.click(rollout);

    await waitFor(() => {
      expect(runtime.getAttribute("aria-expanded")).toBe("true");
      expect(rollout.getAttribute("aria-expanded")).toBe("true");
    });

    // And closing one leaves the other alone: `multiple` means every section can close on its own,
    // which is also why `collapsible` does not gate it.
    fireEvent.click(runtime);
    await waitFor(() => expect(runtime.getAttribute("aria-expanded")).toBe("false"));
    expect(rollout.getAttribute("aria-expanded")).toBe("true");
  });

  it("opens every value a multiple defaultValue names", () => {
    const ui = render(<Accordion type="multiple" defaultValue={["runtime", "rollout"]}>{items}</Accordion>);

    expect(ui.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("true");
    expect(ui.getByRole("button", { name: "Rollout" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("refuses to close the last open section when collapsible is false", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <Accordion collapsible={false} defaultValue="runtime" onValueChange={onValueChange}>{items}</Accordion>,
    );
    const runtime = ui.getByRole("button", { name: "Runtime" });
    const rollout = ui.getByRole("button", { name: "Rollout" });

    fireEvent.click(runtime);
    await settle();
    /* THE DECISIVE ASSERTION: the open set did not MOVE, so the notification carries the value it
       already had rather than the `null` a real close sends. `aria-expanded` alone cannot say that,
       because it reads "true" both when the rule held and before a close it failed to prevent. */
    expect(onValueChange).toHaveBeenCalledWith({ value: "runtime" });
    expect(runtime.getAttribute("aria-expanded")).toBe("true");
    expect(panelOf(runtime)!.hasAttribute("hidden")).toBe(false);

    /* Not inert: the same machine still MOVES when the click is a real move, so the assertions
       above are the rule holding rather than the accordion being dead. */
    fireEvent.click(rollout);
    await waitFor(() => {
      expect(rollout.getAttribute("aria-expanded")).toBe("true");
      expect(runtime.getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("hides the closed section's panel instead of leaving it in the accessibility tree", async () => {
    const ui = render(<Accordion defaultValue="runtime">{items}</Accordion>);
    const runtime = ui.getByRole("button", { name: "Runtime" });
    const rollout = ui.getByRole("button", { name: "Rollout" });

    /* The point of the whole component: `aria-expanded` is a promise, and `hidden` on the panel is
       the thing that keeps it. A closed section whose answer is still readable announces twice. */
    expect(panelOf(runtime)!.hasAttribute("hidden")).toBe(false);
    expect(panelOf(rollout)!.hasAttribute("hidden")).toBe(true);

    fireEvent.click(rollout);
    await waitFor(() => {
      expect(panelOf(rollout)!.hasAttribute("hidden")).toBe(false);
      expect(panelOf(runtime)!.hasAttribute("hidden")).toBe(true);
    });
  });

  it("seeds open state from item defaultOpen when the root has no defaultValue", async () => {
    const ui = render(
      <Accordion>
        <Accordion.Item value="runtime">
          <Accordion.Trigger>Runtime</Accordion.Trigger>
          <Accordion.Content>Node 24</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item defaultOpen value="rollout">
          <Accordion.Trigger>Rollout</Accordion.Trigger>
          <Accordion.Content>10%</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    await waitFor(() => {
      expect(ui.getByRole("button", { name: "Rollout" }).getAttribute("aria-expanded")).toBe("true");
    });
    expect(ui.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("lets root defaultValue win over item defaultOpen", async () => {
    const seeded = (type: "single" | "multiple") => (
      <Accordion defaultValue={type === "single" ? "runtime" : ["runtime"]} type={type}>
        <Accordion.Item value="runtime">
          <Accordion.Trigger>Runtime</Accordion.Trigger>
          <Accordion.Content>Node 24</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item defaultOpen value="rollout">
          <Accordion.Trigger>Rollout</Accordion.Trigger>
          <Accordion.Content>10%</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    /* SETTLED FIRST, in both legs. `defaultOpen` reaches the open set from a layout effect and the
       machine publishes `aria-expanded` a tick later, so reading it straight after `render` reports
       "false" whether the rule held or an ignored item was about to open. */
    const single = within(render(seeded("single")).container);
    await settle();
    expect(single.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("true");
    expect(single.getByRole("button", { name: "Rollout" }).getAttribute("aria-expanded")).toBe("false");

    /* BOTH MODES, because only one of them can actually fail. In `single` an item that contributes
       a default is already refused for holding a second value, so the precedence rule itself only
       shows in `multiple`, where nothing else stands between `defaultOpen` and the open set. */
    const multiple = within(render(seeded("multiple")).container);
    await settle();
    expect(multiple.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("true");
    expect(multiple.getByRole("button", { name: "Rollout" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("ignores a click on a disabled section, whether the root or the item disabled it", async () => {
    /* Two accordions in one test, so the queries are scoped: RTL binds its own to `document.body`,
       where a second render makes every name ambiguous. */
    const fromRootChange = vi.fn();
    const fromRoot = within(
      render(<Accordion disabled defaultValue="runtime" onValueChange={fromRootChange}>{items}</Accordion>).container,
    );
    const rootDisabled = fromRoot.getByRole("button", { name: "Rollout" });
    expect(rootDisabled.getAttribute("data-disabled")).toBe("");
    fireEvent.click(rootDisabled);
    await settle();
    /* The machine never reports a change at all, and that is the assertion that bites: this section
       is closed to begin with, so watching `aria-expanded` alone would pass whether the click was
       ignored or honoured. */
    expect(fromRootChange).not.toHaveBeenCalled();
    expect(rootDisabled.getAttribute("aria-expanded")).toBe("false");

    const fromItemChange = vi.fn();
    const fromItem = within(render(
      <Accordion defaultValue="runtime" onValueChange={fromItemChange}>
        <Accordion.Item value="runtime">
          <Accordion.Trigger>Runtime</Accordion.Trigger>
          <Accordion.Content>Node 24</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item disabled value="rollout">
          <Accordion.Trigger>Rollout</Accordion.Trigger>
          <Accordion.Content>10%</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    ).container);
    const itemDisabled = fromItem.getByRole("button", { name: "Rollout" });
    expect(itemDisabled.getAttribute("data-disabled")).toBe("");
    fireEvent.click(itemDisabled);
    await settle();
    expect(fromItemChange).not.toHaveBeenCalled();
    expect(itemDisabled.getAttribute("aria-expanded")).toBe("false");
    // The section its neighbour left open is untouched: a disabled item is inert, not a reset.
    expect(fromItem.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("dispatches the contract valueChange event on the root, carrying the shape its type promises", async () => {
    const single = vi.fn();
    const ui = render(<Accordion defaultValue="runtime">{items}</Accordion>);
    ui.container.firstElementChild?.addEventListener(accordionEvents.valueChange, single);

    fireEvent.click(ui.getByRole("button", { name: "Rollout" }));
    await waitFor(() => {
      expect(single).toHaveBeenCalledOnce();
      expect(single.mock.calls[0]![0]).toMatchObject({
        type: accordionEvents.valueChange,
        detail: { value: "rollout" },
      });
    });

    // Closing the only open section in single mode is the `null` half of `string | null`.
    fireEvent.click(ui.getByRole("button", { name: "Rollout" }));
    await waitFor(() => expect(single.mock.calls[1]![0]).toMatchObject({ detail: { value: null } }));

    /* `single` carries a string or null, `multiple` an array. Both halves of that promise are here
       because a listener written against one shape breaks silently on the other. */
    const many = vi.fn();
    const second = render(<Accordion type="multiple" defaultValue={["runtime"]}>{items}</Accordion>).container;
    const multiple = within(second);
    second.firstElementChild?.addEventListener(accordionEvents.valueChange, many);

    fireEvent.click(multiple.getByRole("button", { name: "Rollout" }));
    await waitFor(() =>
      expect(many.mock.calls[0]![0]).toMatchObject({ detail: { value: ["runtime", "rollout"] } }),
    );

    fireEvent.click(multiple.getByRole("button", { name: "Runtime" }));
    await waitFor(() =>
      expect(many.mock.calls[1]![0]).toMatchObject({ detail: { value: ["rollout"] } }),
    );
  });

  /*
   * NO VANILLA TWIN: `AccordionOptions` puts controlled `value` on the binding, not in the
   * contract, because authored markup has no channel to hand state back down. Vanilla's open set is
   * always its own.
   */
  it("honours a controlled value without inventing local open state", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <Accordion value="runtime" onValueChange={onValueChange}>
        {items}
      </Accordion>,
    );
    const rollout = ui.getByRole("button", { name: "Rollout" });
    expect(ui.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(rollout);
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith({ value: "rollout" });
    });
    // Still controlled by the prop: without a re-render from the parent, Runtime stays open.
    expect(ui.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("true");
    expect(rollout.getAttribute("aria-expanded")).toBe("false");
  });
});
