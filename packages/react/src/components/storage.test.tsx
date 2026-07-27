import { definePreference, oneOf, STORAGE_KEY } from "@skryensya/core/storage";
import { act, fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useStoredPreference } from "./storage.js";

const mode = definePreference<"system" | "light" | "dark">({
  slot: "scheme",
  fallback: "system",
  parse: oneOf(["system", "light", "dark"]),
});

function Probe({ testId = "value" }: { testId?: string }) {
  const [value, setValue, clear] = useStoredPreference(mode);
  return (
    <div>
      <span data-testid={testId}>{value}</span>
      <button onClick={() => setValue("dark")} type="button">
        dark
      </button>
      <button onClick={clear} type="button">
        clear
      </button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("useStoredPreference", () => {
  it("starts at the fallback and persists what it is given", () => {
    const ui = render(<Probe />);
    expect(ui.getByTestId("value").textContent).toBe("system");

    fireEvent.click(ui.getByRole("button", { name: "dark" }));

    expect(ui.getByTestId("value").textContent).toBe("dark");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ scheme: "dark" });
  });

  it("reads an already-stored value on mount", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ scheme: "light" }));
    const ui = render(<Probe />);
    expect(ui.getByTestId("value").textContent).toBe("light");
  });

  it("falls back on a stored value the parser rejects", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ scheme: "chartreuse" }));
    const ui = render(<Probe />);
    expect(ui.getByTestId("value").textContent).toBe("system");
  });

  it("keeps two components on the same preference in sync", () => {
    const ui = render(
      <>
        <Probe testId="a" />
        <Probe testId="b" />
      </>,
    );

    fireEvent.click(ui.getAllByRole("button", { name: "dark" })[0]);

    expect(ui.getByTestId("a").textContent).toBe("dark");
    expect(ui.getByTestId("b").textContent).toBe("dark");
  });

  it("follows another tab's write", () => {
    const ui = render(<Probe />);

    act(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ scheme: "dark" }));
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    });

    expect(ui.getByTestId("value").textContent).toBe("dark");
  });

  it("clears the slot rather than storing the current default", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ scheme: "dark", other: "keep" }));
    const ui = render(<Probe />);

    fireEvent.click(ui.getByRole("button", { name: "clear" }));

    expect(ui.getByTestId("value").textContent).toBe("system");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ other: "keep" });
  });
});
