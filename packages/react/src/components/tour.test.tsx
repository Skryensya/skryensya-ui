import { tourAttrs, tourParts, type TourStep } from "@skryensya/core/tour";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tour, useTourState, type TourHandle } from "./tour.js";

/*
 * The React half of Tour. The behaviour is the shared controller's and is proved over authored markup
 * in the Vanilla suite; what is proved here is what a React consumer sees: the steps as a prop, every
 * way in (a trigger, the ref) running the same lifecycle, the callbacks, the trigger's second label,
 * and that nothing starts on mount.
 */

const steps: TourStep[] = [
  { target: "#search", title: "Search", description: "Find any project by name." },
  { target: "#filters", title: "Filters", description: "Narrow the list by status.", placement: "inline-end" },
  { target: "#new", title: "New project", description: "Start from scratch or a template." },
  { target: "#help", title: "Help", description: "Come back to this tour any time.", placement: "block-start" },
];

function Page({ tourSteps = steps, onStatusChange = () => {}, onReady }: {
  tourSteps?: TourStep[];
  onStatusChange?: (status: string) => void;
  onReady?: (handle: TourHandle | null) => void;
}) {
  /* The handle in state, the way a consumer that renders from it holds one: it is stable, so this sets once. */
  const [handle, setHandle] = useState<TourHandle | null>(null);
  const state = useTourState(handle);
  return (
    <>
      <Tour.Trigger label="Take the tour" opens="product" restartLabel="Repeat tour" />
      <input aria-label="Search projects" id="search" />
      <div id="filters">
        <button type="button">Owner</button>
      </div>
      <button id="new" type="button">
        New
      </button>
      <a href="#help" id="help">
        Help
      </a>
      <output data-testid="status">{state.status}</output>
      <Tour
        closeLabel="Close tour"
        id="product"
        onStatusChange={onStatusChange}
        ref={(next) => {
          setHandle(next);
          onReady?.(next);
        }}
        steps={tourSteps}
      />
    </>
  );
}

const popover = () => document.querySelector<HTMLElement>(`.${tourParts.popover}`)!;
const title = () => document.querySelector<HTMLElement>(`.${tourParts.title}`)!;
const action = (name: string) => document.querySelector<HTMLButtonElement>(`[${tourAttrs.action}="${name}"]`)!;
const trigger = () => document.querySelector<HTMLButtonElement>(`.${tourParts.trigger}`)!;

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    top: 100, left: 100, width: 120, height: 40, x: 100, y: 100, right: 220, bottom: 140, toJSON() {},
  } as DOMRect);
});
afterEach(() => vi.restoreAllMocks());

describe("Tour (React)", () => {
  it("renders the steps as the hidden list and starts nothing on mount", () => {
    render(<Page />);
    const items = document.querySelectorAll(`.${tourParts.step}`);
    expect(items).toHaveLength(4);
    expect(items[1]!.getAttribute(tourAttrs.target)).toBe("#filters");
    expect(items[1]!.getAttribute(tourAttrs.placement)).toBe("inline-end");
    expect(items[0]!.getAttribute(tourAttrs.placement)).toBe("block-end");
    expect(popover().hidden).toBe(true);
  });

  it("starts from its trigger, walks with Continue and Previous, and finishes", () => {
    const onStatusChange = vi.fn();
    render(<Page onStatusChange={onStatusChange} />);
    trigger().focus();
    fireEvent.click(trigger());
    expect(title().textContent).toBe("Search");
    expect(document.activeElement).toBe(action("next"));
    expect(screen.getByTestId("status").textContent).toBe("running");
    fireEvent.click(action("next"));
    expect(title().textContent).toBe("Filters");
    fireEvent.click(action("previous"));
    expect(title().textContent).toBe("Search");
    for (let i = 0; i < 4; i += 1) fireEvent.click(action("next"));
    expect(onStatusChange).toHaveBeenLastCalledWith("completed");
    expect(document.activeElement).toBe(trigger());
  });

  it("says Repeat tour once the tour has ended, and restarts from step one", () => {
    render(<Page />);
    fireEvent.click(trigger());
    fireEvent.click(action("skip"));
    expect(trigger().getAttribute(tourAttrs.status)).toBe("skipped");
    expect(trigger().querySelector(`.${tourParts.triggerRestart}`)?.textContent).toBe("Repeat tour");
    fireEvent.click(trigger());
    expect(title().textContent).toBe("Search");
  });

  it("exposes start, close and restart on its ref", () => {
    let handle: TourHandle | null = null;
    render(<Page onReady={(h) => (handle = h)} />);
    act(() => handle!.start());
    expect(handle!.getState()).toMatchObject({ status: "running", index: 0 });
    act(() => handle!.next());
    act(() => handle!.restart());
    expect(handle!.getState().index).toBe(0);
    act(() => handle!.close());
    expect(handle!.getState().status).toBe("dismissed");
    expect(popover().hidden).toBe(true);
  });

  it("skips a step whose target is not rendered", () => {
    render(<Page tourSteps={[steps[0]!, { target: "#absent", title: "Ghost", description: "Nope." }, steps[2]!]} />);
    fireEvent.click(trigger());
    fireEvent.click(action("next"));
    expect(title().textContent).toBe("New project");
    expect(document.querySelector(`.${tourParts.progress}`)?.textContent).toBe("Step 2 of 2");
  });

  it("closes with Escape and survives StrictMode's double effects", () => {
    render(
      <StrictMode>
        <Page />
      </StrictMode>,
    );
    fireEvent.click(trigger());
    expect(popover().hidden).toBe(false);
    fireEvent.keyDown(action("next"), { key: "Escape" });
    expect(popover().hidden).toBe(true);
    expect(document.activeElement).toBe(trigger());
  });
});
