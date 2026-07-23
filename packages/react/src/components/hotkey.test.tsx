import { act, render } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { useHotkey } from "./hotkey.js";

function Palette({ mac = true }: { mac?: boolean }) {
  const [open, setOpen] = useState(false);
  useHotkey("mod+k", () => setOpen((v) => !v), { mac });
  return <div data-testid="state">{open ? "open" : "closed"}</div>;
}

const press = (init: KeyboardEventInit) =>
  window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));

describe("useHotkey", () => {
  it("runs the handler on a matching chord", () => {
    const ui = render(<Palette />);
    expect(ui.getByTestId("state").textContent).toBe("closed");
    // the event originates outside React's synthetic system, so flush the state update it triggers
    act(() => press({ key: "k", metaKey: true }));
    expect(ui.getByTestId("state").textContent).toBe("open");
  });

  it("unbinds on unmount", () => {
    const handler = vi.fn();
    function Bound() {
      useHotkey("mod+k", handler, { mac: true });
      return null;
    }
    const ui = render(<Bound />);
    ui.unmount();
    press({ key: "k", metaKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not re-bind when the handler identity changes each render", () => {
    const add = vi.fn();
    const remove = vi.fn();
    const realAdd = window.addEventListener;
    const realRemove = window.removeEventListener;
    window.addEventListener = ((...args: Parameters<typeof realAdd>) => {
      if (args[0] === "keydown") add();
      return realAdd.apply(window, args);
    }) as typeof window.addEventListener;
    window.removeEventListener = ((...args: Parameters<typeof realRemove>) => {
      if (args[0] === "keydown") remove();
      return realRemove.apply(window, args);
    }) as typeof window.removeEventListener;

    try {
      function Bound() {
        const [, setN] = useState(0);
        // a fresh closure every render; the ref inside useHotkey should absorb it
        useHotkey("mod+k", () => setN((n) => n + 1), { mac: true });
        return <button onClick={() => setN((n) => n + 1)}>bump</button>;
      }
      const ui = render(<Bound />);
      ui.getByText("bump").click();
      ui.getByText("bump").click();
      expect(add).toHaveBeenCalledTimes(1); // bound once, never re-bound on re-render
    } finally {
      window.addEventListener = realAdd;
      window.removeEventListener = realRemove;
    }
  });
});
