import { STORAGE_KEY } from "@skryensya/core/storage";
import { tourAttrs, tourParts } from "@skryensya/core/tour";
import { getTourStatus, tourEvents } from "@skryensya/core/tour-controller";
import { fireEvent } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTour, mountTour } from "./tour.js";

/*
 * The Vanilla half of Tour, on authored markup, and the suite that proves the controller: both
 * bindings run the same `connectTour`, so navigation, the endings, the memory, missing targets,
 * Escape's priority and every focus move are proved here once, over the markup the contract emits.
 * jsdom lays nothing out, so geometry is stated where a test needs it and placement itself is the
 * pure half's, tested in core.
 */

const step = (target: string, title: string, body: string, placement = "block-end") =>
  `<li class="sk-tour__step" data-tour-target="${target}" data-placement="${placement}"><p class="sk-tour__step-title">${title}</p><p class="sk-tour__step-description">${body}</p></li>`;

const button = (action: string, attrs: string, inner: string) =>
  `<button type="button" class="sk-tour__control sk-button sk-interactive" data-tour-action="${action}" ${attrs}>${inner}</button>`;

function tour(steps: string, attrs = ""): string {
  return `
    <div class="sk-tour" id="onboarding" data-sk-tour data-progress-label="Paso {index} de {count}" ${attrs}>
      <ol class="sk-tour__steps" hidden>${steps}</ol>
      <div class="sk-tour__ring" aria-hidden="true" popover="manual" hidden></div>
      <p class="sk-tour__live sk-visually-hidden" aria-live="polite" aria-atomic="true"></p>
      <div class="sk-tour__popover" role="dialog" popover="manual" hidden>
        <div class="sk-tour__arrow" aria-hidden="true"></div>
        <div class="sk-tour__content">
          <div class="sk-tour__header">
            <p class="sk-tour__progress"></p>
            ${button("close", 'aria-label="Cerrar tour" data-variant="ghost" data-size="xs" data-icon-only', '<span data-sk-icon="close"></span>')}
          </div>
          <h2 class="sk-tour__title"></h2>
          <p class="sk-tour__description"></p>
          <div class="sk-tour__footer">
            ${button("skip", 'data-variant="ghost" data-size="sm"', "<span>Omitir tour</span>")}
            <div class="sk-tour__nav">
              ${button("previous", 'data-variant="soft" data-size="sm"', "<span>Anterior</span>")}
              ${button("next", 'data-size="sm"', '<span class="sk-tour__next-label">Continuar</span><span class="sk-tour__finish-label">Finalizar</span>')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

const fourSteps = [
  step("#search", "Búsqueda", "Encuentra cualquier proyecto por nombre."),
  step("#filters", "Filtros", "Acota la lista por estado o por dueño.", "inline-end"),
  step("#new", "Nuevo proyecto", "Crea un proyecto desde cero o desde una plantilla."),
  step("#help", "Ayuda", "Vuelve a este recorrido cuando quieras.", "block-start"),
].join("");

const page = `
  <button type="button" class="sk-tour__trigger sk-button" data-sk-tour-open="onboarding" id="start">
    <span class="sk-tour__trigger-start">Iniciar tour</span><span class="sk-tour__trigger-restart">Repetir tour</span>
  </button>
  <input id="search" aria-label="Buscar proyectos">
  <div id="filters"><button type="button" id="filter-owner">Dueño</button></div>
  <button type="button" id="new">Nuevo</button>
  <a id="help" href="#help">Ayuda</a>
  <button type="button" id="elsewhere">Otra cosa</button>`;

const popover = () => document.querySelector<HTMLElement>(`.${tourParts.popover}`)!;
const ring = () => document.querySelector<HTMLElement>(`.${tourParts.ring}`)!;
const title = () => document.querySelector<HTMLElement>(`.${tourParts.title}`)!;
const live = () => document.querySelector<HTMLElement>(`.${tourParts.live}`)!.textContent;
const progress = () => document.querySelector<HTMLElement>(`.${tourParts.progress}`)!.textContent;
const action = (name: string) => document.querySelector<HTMLButtonElement>(`[${tourAttrs.action}="${name}"]`)!;
const trigger = () => document.getElementById("start") as HTMLButtonElement;
const controller = () => getTour("onboarding")!;
const state = () => controller().getState();

let destroy: (() => void) | undefined;
function mount(markup = page + tour(fourSteps)) {
  document.body.innerHTML = markup;
  destroy = mountTour(document.querySelector<HTMLElement>("[data-sk-tour]")!) as unknown as () => void;
}

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const box = { top: 100, left: 100, width: 120, height: 40 };
    return { ...box, x: box.left, y: box.top, right: box.left + box.width, bottom: box.top + box.height, toJSON() {} } as DOMRect;
  });
});

afterEach(() => {
  controller()?.destroy();
  if (typeof destroy === "function") destroy();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("Tour: starting", () => {
  it("does nothing until the reader asks: nothing is shown on mount, even on a first visit", () => {
    mount();
    expect(popover().hidden).toBe(true);
    expect(ring().hidden).toBe(true);
    expect(state().status).toBe("idle");
  });

  it("starts from a trigger on step one, with Continue focused and the progress in words", () => {
    mount();
    trigger().focus();
    fireEvent.click(trigger());
    expect(popover().hidden).toBe(false);
    expect(ring().hidden).toBe(false);
    expect(title().textContent).toBe("Búsqueda");
    expect(progress()).toBe("Paso 1 de 4");
    expect(document.activeElement).toBe(action("next"));
    expect(state()).toMatchObject({ status: "running", index: 0, position: 1, count: 4 });
  });

  it("is a non-modal dialog named by its title and described by its progress and body", () => {
    mount();
    controller().start();
    const box = popover();
    expect(box.getAttribute("role")).toBe("dialog");
    expect(box.hasAttribute("aria-modal")).toBe(false);
    expect(document.getElementById(box.getAttribute("aria-labelledby")!)).toBe(title());
    const described = box.getAttribute("aria-describedby")!.split(" ").map((id) => document.getElementById(id)?.textContent);
    expect(described).toEqual(["Paso 1 de 4", "Encuentra cualquier proyecto por nombre."]);
  });

  it("leaves the page alone: no inert, no aria-hidden, no modal attributes outside its own parts", () => {
    mount();
    controller().start();
    const outside = Array.from(document.body.querySelectorAll("*")).filter((element) => !element.closest(".sk-tour"));
    expect(outside.some((element) => element.hasAttribute("inert") || element.hasAttribute("aria-hidden"))).toBe(false);
    expect(ring().getAttribute("aria-hidden")).toBe("true");
  });
});

describe("Tour: announcements", () => {
  it("says nothing extra on the first step: entering the dialog already says its name and description", () => {
    mount();
    controller().start();
    expect(live()).toBe("");
  });

  it("says each later step once, in full, because focus stays on Continue and says nothing new", () => {
    mount();
    controller().start();
    fireEvent.click(action("next"));
    expect(live()).toBe("Paso 2 de 4. Filtros. Acota la lista por estado o por dueño.");
    fireEvent.click(action("previous"));
    expect(live()).toBe("Paso 1 de 4. Búsqueda. Encuentra cualquier proyecto por nombre.");
  });

  it("goes quiet when the tour ends", () => {
    mount();
    controller().start();
    controller().next();
    controller().close();
    expect(live()).toBe("");
  });
});

describe("Tour: navigation", () => {
  it("Continue walks forward, and Previous appears from the second step", () => {
    mount();
    controller().start();
    expect(action("previous").hidden).toBe(true);
    fireEvent.click(action("next"));
    expect(title().textContent).toBe("Filtros");
    expect(progress()).toBe("Paso 2 de 4");
    expect(action("previous").hidden).toBe(false);
    expect(document.activeElement).toBe(action("next"));
    fireEvent.click(action("previous"));
    expect(title().textContent).toBe("Búsqueda");
    expect(document.activeElement).toBe(action("next"));
  });

  it("offers Skip tour on the first step only", () => {
    mount();
    controller().start();
    expect(action("skip").hidden).toBe(false);
    fireEvent.click(action("next"));
    expect(action("skip").hidden).toBe(true);
    fireEvent.click(action("previous"));
    expect(action("skip").hidden).toBe(false);
  });

  it("marks the last step, so its one button reads Finish, and Finish completes the tour", () => {
    mount();
    controller().start();
    for (let i = 0; i < 3; i += 1) fireEvent.click(action("next"));
    expect(title().textContent).toBe("Ayuda");
    expect(popover().hasAttribute(tourAttrs.last)).toBe(true);
    fireEvent.click(action("next"));
    expect(state().status).toBe("completed");
    expect(popover().hidden).toBe(true);
    expect(ring().hidden).toBe(true);
  });

  it("works from the keyboard alone: Enter and Space on a button are the button's own click", () => {
    mount();
    trigger().focus();
    fireEvent.click(trigger());
    /* A native button turns Enter and Space into `click`; that conversion is the browser's, so what is
       proved here is that the tour listens to nothing else. */
    const next = action("next");
    next.focus();
    fireEvent.keyDown(next, { key: "Enter" });
    expect(state().index).toBe(0);
    fireEvent.click(next);
    expect(state().index).toBe(1);
  });

  it("never advances on its own", () => {
    vi.useFakeTimers();
    mount();
    controller().start();
    vi.advanceTimersByTime(60_000);
    expect(state().index).toBe(0);
    vi.useRealTimers();
  });

  it("reports each step and each status change, as callbacks and as events on the root", () => {
    mount();
    const root = document.getElementById("onboarding")!;
    const steps: number[] = [];
    const statuses: string[] = [];
    root.addEventListener(tourEvents.stepChange, (event) => steps.push((event as CustomEvent).detail.index));
    root.addEventListener(tourEvents.statusChange, (event) => statuses.push((event as CustomEvent).detail.status));
    const onStepChange = vi.fn();
    controller().configure({ onStepChange });
    controller().start();
    controller().next();
    controller().close();
    expect(steps).toEqual([0, 1]);
    expect(onStepChange).toHaveBeenLastCalledWith(1, expect.objectContaining({ title: "Filtros", placement: "inline-end" }));
    expect(statuses).toEqual(["running", "dismissed"]);
  });
});

describe("Tour: closing", () => {
  it("Close ends it as dismissed and returns focus to the trigger", () => {
    mount();
    trigger().focus();
    fireEvent.click(trigger());
    fireEvent.click(action("next"));
    fireEvent.click(action("close"));
    expect(state().status).toBe("dismissed");
    expect(popover().hidden).toBe(true);
    expect(document.activeElement).toBe(trigger());
  });

  it("Escape closes it from inside the box, and from the highlighted target", () => {
    mount();
    trigger().focus();
    fireEvent.click(trigger());
    fireEvent.keyDown(action("next"), { key: "Escape" });
    expect(state().status).toBe("dismissed");
    expect(document.activeElement).toBe(trigger());

    fireEvent.click(trigger());
    document.getElementById("search")!.focus();
    fireEvent.keyDown(document.getElementById("search")!, { key: "Escape" });
    expect(state().status).toBe("dismissed");
    expect(document.activeElement).toBe(trigger());
  });

  it("yields Escape to a widget that already handled it, and to an expanded popup", () => {
    mount(page + tour(fourSteps) + `<button type="button" id="menu" aria-expanded="true">Menú</button>`);
    controller().start();
    const handled = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    handled.preventDefault();
    document.body.dispatchEvent(handled);
    expect(state().status).toBe("running");

    document.getElementById("menu")!.focus();
    fireEvent.keyDown(document.getElementById("menu")!, { key: "Escape" });
    expect(state().status).toBe("running");
  });

  it("yields Escape to a text field that has something to clear", () => {
    mount();
    controller().start();
    const search = document.getElementById("search") as HTMLInputElement;
    search.value = "informe";
    search.focus();
    fireEvent.keyDown(search, { key: "Escape" });
    expect(state().status).toBe("running");
  });

  it("does not pull focus back from someone working elsewhere on the page", () => {
    mount();
    trigger().focus();
    fireEvent.click(trigger());
    document.getElementById("elsewhere")!.focus();
    fireEvent.keyDown(document.getElementById("elsewhere")!, { key: "Escape" });
    expect(state().status).toBe("dismissed");
    expect(document.activeElement).toBe(document.getElementById("elsewhere"));
  });

  it("a click outside neither advances nor closes it", () => {
    mount();
    controller().start();
    fireEvent.pointerDown(document.getElementById("elsewhere")!);
    fireEvent.click(document.getElementById("elsewhere")!);
    fireEvent.click(document.body);
    expect(state()).toMatchObject({ status: "running", index: 0 });
  });

  it("returns focus to a logical place when the trigger is gone", () => {
    mount(page + tour(fourSteps) + `<button type="button" class="sk-tour__trigger" data-sk-tour-open="onboarding" id="second">Tour</button>`);
    trigger().focus();
    fireEvent.click(trigger());
    trigger().remove();
    fireEvent.click(action("close"));
    expect(document.activeElement).toBe(document.getElementById("second"));
  });

  it("uses the consumer's fallback before any other trigger", () => {
    mount();
    const fallback = document.getElementById("new")!;
    controller().configure({ fallbackFocus: () => fallback });
    controller().start({ returnFocus: null });
    controller().close();
    expect(document.activeElement).toBe(fallback);
  });
});

describe("Tour: skipping and repeating", () => {
  it("Skip tour ends it as skipped and remembers that", () => {
    mount();
    controller().start();
    fireEvent.click(action("skip"));
    expect(state()).toMatchObject({ status: "skipped", remembered: "skipped" });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ "tour:onboarding": "skipped" });
  });

  it("repeats from step one after it was skipped, and after it was completed", () => {
    mount();
    controller().start();
    fireEvent.click(action("skip"));
    fireEvent.click(trigger());
    expect(state()).toMatchObject({ status: "running", index: 0 });
    for (let i = 0; i < 4; i += 1) fireEvent.click(action("next"));
    expect(state().status).toBe("completed");
    fireEvent.click(trigger());
    expect(state()).toMatchObject({ status: "running", index: 0 });
    expect(title().textContent).toBe("Búsqueda");
  });

  it("restart() goes back to step one while running; start() while running changes nothing", () => {
    mount();
    controller().start();
    controller().next();
    controller().next();
    controller().start();
    expect(state().index).toBe(2);
    controller().restart();
    expect(state()).toMatchObject({ status: "running", index: 0 });
    expect(document.activeElement).toBe(action("next"));
  });

  it("switches its triggers to their restart label once it has ended, and keeps it on a second run", () => {
    mount();
    expect(trigger().getAttribute(tourAttrs.status)).toBe("idle");
    controller().start();
    expect(trigger().getAttribute(tourAttrs.status)).toBe("idle");
    controller().skip();
    expect(trigger().getAttribute(tourAttrs.status)).toBe("skipped");
    controller().restart();
    expect(trigger().getAttribute(tourAttrs.status)).toBe("skipped");
    expect(getTourStatus("onboarding")).toBe("skipped");
  });

  it("remembers across visits without ever starting itself", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ "tour:onboarding": "completed", scheme: "dark" }));
    mount();
    expect(state()).toMatchObject({ status: "idle", remembered: "completed" });
    expect(popover().hidden).toBe(true);
    expect(trigger().getAttribute(tourAttrs.status)).toBe("completed");
    controller().forget();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ scheme: "dark" });
    expect(trigger().getAttribute(tourAttrs.status)).toBe("idle");
  });

  it("with remember off, writes nothing", () => {
    mount(page + tour(fourSteps, 'data-remember="false"'));
    controller().start();
    controller().skip();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("Tour: missing and hidden targets", () => {
  it("skips a step whose target is not on the page, and counts without it", () => {
    mount(page.replace('<div id="filters">', '<div id="gone">') + tour(fourSteps));
    controller().start();
    fireEvent.click(action("next"));
    expect(title().textContent).toBe("Nuevo proyecto");
    expect(progress()).toBe("Paso 2 de 3");
  });

  it("skips a step whose target is hidden, or whose selector is not a selector", () => {
    const steps = [step("#search", "A", "a"), step("[[", "Roto", "b"), step("#new", "C", "c")].join("");
    mount(page.replace('<input id="search"', '<input hidden id="search"') + tour(steps));
    controller().start();
    expect(title().textContent).toBe("C");
    expect(progress()).toBe("Paso 1 de 1");
    expect(popover().hasAttribute(tourAttrs.last)).toBe(true);
  });

  it("does not open at all when no step has a target: never a box pointing at nothing", () => {
    mount(tour([step("#nope", "A", "a"), step("#none", "B", "b")].join("")));
    controller().start();
    expect(state().status).toBe("idle");
    expect(popover().hidden).toBe(true);
  });

  it("moves on when the current target disappears, keeping focus in the box if it was there", async () => {
    mount();
    controller().start();
    document.getElementById("search")!.remove();
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(title().textContent).toBe("Filtros");
    expect(document.activeElement).toBe(action("next"));
  });

  it("ends quietly when the last remaining target disappears", async () => {
    mount(page + tour(step("#new", "Nuevo", "n")));
    controller().start();
    document.getElementById("new")!.remove();
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(state().status).toBe("idle");
    expect(popover().hidden).toBe(true);
    expect(ring().hidden).toBe(true);
  });
});

describe("Tour: focus is never trapped", () => {
  it("Tab past the box's last control lands on the target the step is about", () => {
    mount();
    controller().start();
    controller().next();
    action("next").focus();
    fireEvent.keyDown(action("next"), { key: "Tab" });
    expect(document.activeElement).toBe(document.getElementById("filter-owner"));
  });

  it("Shift+Tab and Tab from anywhere else are the page's own", () => {
    mount();
    controller().start();
    action("next").focus();
    const back = fireEvent.keyDown(action("next"), { key: "Tab", shiftKey: true });
    expect(back).toBe(true);
    action("close").focus();
    expect(fireEvent.keyDown(action("close"), { key: "Tab" })).toBe(true);
  });

  it("a step change caused by the page does not steal focus from it", async () => {
    mount();
    controller().start();
    const elsewhere = document.getElementById("elsewhere")!;
    elsewhere.focus();
    document.getElementById("search")!.remove();
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(title().textContent).toBe("Filtros");
    expect(document.activeElement).toBe(elsewhere);
  });
});

describe("Tour: placement", () => {
  it("draws the ring around the target with the offset, and copies its corner radius", () => {
    mount();
    /* The longhand: jsdom does not expand `border-radius` into its corners in computed style; browsers do. */
    document.getElementById("search")!.style.borderTopLeftRadius = "8px";
    controller().start();
    expect(ring().style.top).toBe("94px");
    expect(ring().style.width).toBe("132px");
    expect(ring().style.borderTopLeftRadius).toBe("14px");
  });

  it("places the box and says which side it landed on", () => {
    mount();
    controller().start();
    expect(popover().style.top).not.toBe("");
    expect(popover().getAttribute(tourAttrs.side)).toMatch(/^(block-end|block-start|inline-end|inline-start|docked)$/);
  });

  it("points its arrow at the target from the edge facing it", () => {
    mount();
    controller().start();
    /* Target at 100,100 120x40 in a 1024x768 jsdom viewport; the box measures the same mocked rect. */
    expect(popover().getAttribute(tourAttrs.arrow)).toBe("top");
    expect(popover().style.getPropertyValue("--sk-tour-arrow-offset")).toMatch(/px$/);
  });

  it("stops listening and restores its parts on destroy", () => {
    mount();
    controller().start();
    controller().destroy();
    expect(popover().hidden).toBe(true);
    expect(getTour("onboarding")).toBeNull();
  });
});
