import { fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toast, ToastRegion } from "./content.js";

describe("content component contracts", () => {
  it("defaults to a neutral toast and announces danger assertively", () => {
    const plain = render(<Toast>Copied.</Toast>);
    expect(within(plain.container).getByRole("status").getAttribute("data-tone")).toBe("neutral");
    plain.unmount();

    const onDismiss = vi.fn();
    const ui = render(
      <ToastRegion>
        <Toast onDismiss={onDismiss} tone="danger">
          Deployment failed.
        </Toast>
      </ToastRegion>,
    );

    const screen = within(ui.container);
    expect(ui.container.querySelector(".sk-toast-region")?.getAttribute("aria-live")).toBe("polite");
    const toast = screen.getByRole("alert");
    expect(toast.classList.contains("sk-callout")).toBe(true);
    expect(toast.getAttribute("aria-live")).toBe("assertive");
    expect(toast.getAttribute("data-tone")).toBe("danger");
    expect(toast.querySelector(".sk-callout__description")?.textContent).toBe("Deployment failed.");

    expect(screen.getByRole("button", { name: "Dismiss notification" }).getAttribute("type")).toBe("button");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(onDismiss).toHaveBeenCalledWith({ reason: "dismiss" });
  });

  it("renders callout anatomy for title, icon and actions", () => {
    const ui = render(
      <Toast actions={<a href="/logs">View logs</a>} icon="!" title="Deploy failed" tone="danger">
        Check the pipeline.
      </Toast>,
    );

    const toast = within(ui.container).getByRole("alert");
    expect(toast.querySelector(".sk-callout__icon")).not.toBeNull();
    expect(toast.querySelector(".sk-callout__title")?.textContent).toBe("Deploy failed");
    expect(toast.querySelector(".sk-callout__actions")?.textContent).toContain("View logs");
  });

  it("requests timeout dismissal only when configured and clears it on unmount", () => {
    vi.useFakeTimers();
    const withoutTimeout = vi.fn();
    const withTimeout = vi.fn();
    const persistent = render(<Toast onDismiss={withoutTimeout}>Saved.</Toast>);
    const timed = render(
      <Toast onDismiss={withTimeout} timeout={1_000}>
        Saved.
      </Toast>,
    );

    vi.advanceTimersByTime(1_000);
    expect(withoutTimeout).not.toHaveBeenCalled();
    expect(withTimeout).toHaveBeenCalledWith({ reason: "timeout" });

    const afterUnmount = vi.fn();
    const cleanup = render(
      <Toast onDismiss={afterUnmount} timeout={1_000}>
        Saved.
      </Toast>,
    );
    cleanup.unmount();
    vi.advanceTimersByTime(1_000);
    expect(afterUnmount).not.toHaveBeenCalled();

    const manuallyDismissed = vi.fn();
    const manual = render(
      <Toast onDismiss={manuallyDismissed} timeout={1_000}>
        Saved.
      </Toast>,
    );
    fireEvent.click(within(manual.container).getByRole("button", { name: "Dismiss notification" }));
    vi.advanceTimersByTime(1_000);
    expect(manuallyDismissed).toHaveBeenCalledTimes(1);
    expect(manuallyDismissed).toHaveBeenCalledWith({ reason: "dismiss" });
    manual.unmount();

    persistent.unmount();
    timed.unmount();
    vi.useRealTimers();
  });
});
