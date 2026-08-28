/*
 * THE PERIOD SELECTOR'S own behavior: a Segmented control swaps which series the Chart below it
 * draws. The data for every period is already IN the markup (`data-chart-periods`, written by
 * `chartPeriodCardTree` in `demos/charts.ts`), so switching never fetches anything - it rebuilds the
 * chart's own series list from JSON that was already there, the same list `chart.ts`'s own template
 * repeats for every kind.
 *
 * Listens for `sk-value-change`, the event Segmented's own enhancer already dispatches on itself
 * (`packages/vanilla/src/components/segmented.ts`) - no bespoke wiring, the same event
 * `ComponentPreview`'s own binding toggle listens for.
 */
const chart = document.querySelector<HTMLElement>("[data-sk-chart][data-chart-periods]");
const control = document.querySelector<HTMLElement>("[data-sk-segmented]");

if (chart && control) {
  const periods = JSON.parse(chart.getAttribute("data-chart-periods") ?? "{}") as Record<
    string,
    { label: string; value: number }[]
  >;
  // The word comes from the markup, not from this file: it is a translation, and translations live
  // in the tree (same rule `placeholder-swap.ts` follows for its own status word).
  const labelPrefix = chart.getAttribute("data-chart-label-prefix") ?? "";
  const list = chart.querySelector(".sk-chart__series");
  const caption = chart.querySelector(".sk-chart__caption");

  const render = (period: string) => {
    const points = periods[period];
    if (!points || !list) return;

    const max = Math.max(1, ...points.map((point) => point.value));
    chart.style.setProperty("--sk-chart-max", String(max));

    list.replaceChildren(
      ...points.map((point) => {
        const item = document.createElement("li");
        item.className = "sk-chart__point";
        item.dataset.value = String(point.value);
        item.style.setProperty("--sk-chart-value", String(point.value));

        const bar = document.createElement("span");
        bar.className = "sk-chart__bar";
        bar.setAttribute("aria-hidden", "true");

        const label = document.createElement("span");
        label.className = "sk-chart__label";
        label.textContent = point.label;

        const value = document.createElement("span");
        value.className = "sk-chart__value";
        value.textContent = point.value.toLocaleString();

        item.append(bar, label, value);
        return item;
      }),
    );

    const name = `${labelPrefix} ${period}`.trim();
    chart.setAttribute("aria-label", name);
    if (caption) caption.textContent = name;
  };

  control.addEventListener("sk-value-change", (event) => {
    const value = (event as CustomEvent<{ value?: string }>).detail?.value;
    if (value) render(value);
  });
}
