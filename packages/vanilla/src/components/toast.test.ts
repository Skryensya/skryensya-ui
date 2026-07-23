import { fireEvent, getByRole } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { connectToast, mountToast } from "./toast.js";

function mount(html: string) {
  document.body.innerHTML = html;
  const root = document.querySelector<HTMLElement>("[data-ds-toast]");
  if (!root) throw new Error("Expected toast root.");
  return root;
}

function markup(timeout?: number) {
  return `<div class="ds-toast-region"><div class="ds-alert" data-ds-toast data-tone="danger"${timeout ? ` data-timeout="${timeout}"` : ""}>
    <div class="ds-alert__content">
      <div class="ds-alert__description">Deployment failed.</div>
    </div>
    <div class="ds-alert__actions">
      <button class="ds-alert__dismiss" aria-label="Dismiss notification">×</button>
    </div>
  </div></div>`;
}

describe("Toast Vanilla contracts", () => {
  it("applies the shared live-region semantics and reports native button dismissal", () => {
    const root = mount(markup());
    const reasons: string[] = [];
    root.addEventListener("ds-dismiss", (event) => reasons.push((event as CustomEvent<{ reason: string }>).detail.reason));
    const cleanup = connectToast(root);

    expect(root.getAttribute("role")).toBe("alert");
    expect(root.getAttribute("aria-live")).toBe("assertive");
    expect(root.parentElement?.getAttribute("aria-live")).toBe("polite");
    const dismiss = getByRole(root, "button", { name: "Dismiss notification" });
    expect(dismiss.getAttribute("type")).toBe("button");

    fireEvent.click(dismiss);
    expect(reasons).toEqual(["dismiss"]);
    fireEvent.click(dismiss);
    expect(reasons).toEqual(["dismiss"]);

    cleanup();
  });

  it("only schedules authored timeouts and clears them during cleanup", () => {
    vi.useFakeTimers();
    const persistent = mount(markup());
    const timed = mount(markup(1_000));
    const persistentReasons: string[] = [];
    const timedReasons: string[] = [];
    persistent.addEventListener("ds-dismiss", (event) => persistentReasons.push((event as CustomEvent<{ reason: string }>).detail.reason));
    timed.addEventListener("ds-dismiss", (event) => timedReasons.push((event as CustomEvent<{ reason: string }>).detail.reason));

    const persistentCleanup = connectToast(persistent);
    expect(mountToast(timed)).toBe(1);
    vi.advanceTimersByTime(1_000);
    expect(persistentReasons).toEqual([]);
    expect(timedReasons).toEqual(["timeout"]);

    const cleaned = mount(markup());
    const cleanedReasons: string[] = [];
    cleaned.addEventListener("ds-dismiss", (event) => cleanedReasons.push((event as CustomEvent<{ reason: string }>).detail.reason));
    const cleanup = connectToast(cleaned, { timeout: 1_000 });
    cleanup();
    vi.advanceTimersByTime(1_000);
    expect(cleanedReasons).toEqual([]);

    persistentCleanup();
    vi.useRealTimers();
  });

  it("mounts authored toast markup through the registry enhancer", () => {
    const root = mount(markup()); // no timeout: nothing to schedule or leak past the test

    expect(mountToast(document)).toBe(1);
    expect(mountToast(document)).toBe(0);
    expect(root.getAttribute("role")).toBe("alert");
  });
});
