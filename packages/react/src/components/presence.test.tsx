import { act, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Presence } from "./presence.js";

/* jsdom resolves no transition at all, so the exit length is whatever the test says the sheet has. */
function stubExit(duration: string) {
  /* Only the four timings `presenceExitMs` reads; a real declaration refuses to be extended. */
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    transitionDuration: duration,
    transitionDelay: "0s",
    animationDuration: "0s",
    animationDelay: "0s",
  } as CSSStyleDeclaration);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const host = (container: HTMLElement) => container.querySelector(".sk-presence") as HTMLElement;

describe("Presence", () => {
  it("writes the contract's open state by default", () => {
    const ui = render(<Presence>Hola</Presence>);
    expect(host(ui.container).getAttribute("data-state")).toBe("open");
    expect(host(ui.container).hidden).toBe(false);
  });

  it("closes to hidden and data-state=closed in the same commit, for the CSS to animate", () => {
    const ui = render(<Presence present={false}>Hola</Presence>);
    expect(host(ui.container).getAttribute("data-state")).toBe("closed");
    expect(host(ui.container).hidden).toBe(true);
    expect(host(ui.container).textContent).toBe("Hola");
  });

  /*
   * The case the component exists for: the children must still be there while the exit paints,
   * and gone once it has, where `{open && <X />}` would have removed them on the first frame.
   */
  it("keeps the children through the exit and drops them after it with unmountOnExit", () => {
    vi.useFakeTimers();
    stubExit("0.15s");
    const onExitComplete = vi.fn();
    const ui = render(
      <Presence onExitComplete={onExitComplete} present unmountOnExit>
        Hola
      </Presence>,
    );

    ui.rerender(
      <Presence onExitComplete={onExitComplete} present={false} unmountOnExit>
        Hola
      </Presence>,
    );
    expect(host(ui.container).textContent).toBe("Hola");
    expect(onExitComplete).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(150));
    expect(host(ui.container).textContent).toBe("");
    expect(onExitComplete).toHaveBeenCalledTimes(1);
  });

  it("cancels a pending exit when reopened before it finishes", () => {
    vi.useFakeTimers();
    stubExit("0.15s");
    const onExitComplete = vi.fn();
    const ui = render(<Presence onExitComplete={onExitComplete} unmountOnExit>Hola</Presence>);

    ui.rerender(<Presence onExitComplete={onExitComplete} present={false} unmountOnExit>Hola</Presence>);
    act(() => vi.advanceTimersByTime(100));
    ui.rerender(<Presence onExitComplete={onExitComplete} present unmountOnExit>Hola</Presence>);
    act(() => vi.advanceTimersByTime(500));

    expect(host(ui.container).textContent).toBe("Hola");
    expect(onExitComplete).not.toHaveBeenCalled();
  });

  it("settles at once when the sheet has no exit to wait for", () => {
    const onExitComplete = vi.fn();
    const ui = render(<Presence onExitComplete={onExitComplete} unmountOnExit>Hola</Presence>);
    ui.rerender(<Presence onExitComplete={onExitComplete} present={false} unmountOnExit>Hola</Presence>);
    expect(host(ui.container).textContent).toBe("");
    expect(onExitComplete).toHaveBeenCalledTimes(1);
  });

  it("keeps hidden children in the DOM without unmountOnExit", () => {
    const ui = render(<Presence>Hola</Presence>);
    ui.rerender(<Presence present={false}>Hola</Presence>);
    expect(host(ui.container).hidden).toBe(true);
    expect(host(ui.container).textContent).toBe("Hola");
  });

  it("renders nothing inside until first shown with lazyMount, then keeps it", () => {
    const ui = render(<Presence lazyMount present={false}>Hola</Presence>);
    expect(host(ui.container).textContent).toBe("");
    ui.rerender(<Presence lazyMount present>Hola</Presence>);
    expect(host(ui.container).textContent).toBe("Hola");
    ui.rerender(<Presence lazyMount present={false}>Hola</Presence>);
    expect(host(ui.container).textContent).toBe("Hola");
  });

  it("does not report an exit for content that started closed, even under StrictMode", () => {
    const onExitComplete = vi.fn();
    render(
      <StrictMode>
        <Presence onExitComplete={onExitComplete} present={false}>
          Hola
        </Presence>
      </StrictMode>,
    );
    expect(onExitComplete).not.toHaveBeenCalled();
  });
});
