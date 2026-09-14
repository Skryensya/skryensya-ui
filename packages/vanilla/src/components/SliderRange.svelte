<script lang="ts">
  import { slider } from "@skryensya/core/machines";
  import { clampSliderRange } from "@skryensya/core/slider";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  const root = getRoot();

  const selector = {
    control: "[data-sk-slider-range-control]",
    track: "[data-sk-slider-range-track]",
    fill: "[data-sk-slider-range-fill]",
    low: "[data-sk-slider-range-low]",
    high: "[data-sk-slider-range-high]",
    lowInput: "[data-sk-slider-range-low-input]",
    highInput: "[data-sk-slider-range-high-input]",
  } as const;

  const numberAttr = (name: string, fallback: number): number => {
    const raw = root.getAttribute(name);
    const value = Number(raw);
    return raw == null || !Number.isFinite(value) ? fallback : value;
  };

  const control = root.querySelector<HTMLElement>(selector.control);
  const track = root.querySelector<HTMLElement>(selector.track);
  const fill = root.querySelector<HTMLElement>(selector.fill);
  const lowThumb = root.querySelector<HTMLElement>(selector.low);
  const highThumb = root.querySelector<HTMLElement>(selector.high);
  const lowInput = root.querySelector<HTMLElement>(selector.lowInput);
  const highInput = root.querySelector<HTMLElement>(selector.highInput);

  if (!control) throw new Error("SliderRange requires a [data-sk-slider-range-control] element.");
  if (!track) throw new Error("SliderRange requires a [data-sk-slider-range-track] element.");
  if (!fill) throw new Error("SliderRange requires a [data-sk-slider-range-fill] element.");
  if (!lowThumb) throw new Error("SliderRange requires a [data-sk-slider-range-low] element.");
  if (!highThumb) throw new Error("SliderRange requires a [data-sk-slider-range-high] element.");

  const min = numberAttr("data-min", 0);
  const max = numberAttr("data-max", 100);
  const step = root.hasAttribute("data-step") ? numberAttr("data-step", 1) : undefined;
  const { low, high } = clampSliderRange(numberAttr("data-low-value", min), numberAttr("data-high-value", max));
  const sliderId = root.id || uniqueId("sk-slider-range");
  const lowLabel = lowThumb.getAttribute("aria-label") ?? root.getAttribute("data-low-label") ?? "Minimum";
  const highLabel = highThumb.getAttribute("aria-label") ?? root.getAttribute("data-high-label") ?? "Maximum";
  const lowName = root.getAttribute("data-low-name") ?? undefined;
  const highName = root.getAttribute("data-high-name") ?? undefined;

  const service = useMachine(slider.machine, () => ({
    id: sliderId,
    "aria-label": [lowLabel, highLabel],
    defaultValue: [low, high],
    disabled: root.hasAttribute("data-disabled"),
    max,
    min,
    onValueChange(details: { value: number[] }) {
      root.setAttribute("data-low-value", String(details.value[0] ?? min));
      root.setAttribute("data-high-value", String(details.value[1] ?? max));
      root.dispatchEvent(
        new CustomEvent("sk-value-change", {
          bubbles: true,
          detail: { low: details.value[0] ?? min, high: details.value[1] ?? max },
        }),
      );
    },
    step,
    thumbAlignment: "center" as const,
    thumbSize: { width: 32, height: 32 },
  }));

  const api = $derived(slider.connect(service, normalizeProps));

  const bindings: PartBinding[] = [
    { part: "root", node: () => root, props: () => api.getRootProps() },
    { part: "control", node: () => control, props: () => api.getControlProps(), events: true },
    { part: "track", node: () => track, props: () => api.getTrackProps() },
    { part: "range", node: () => fill, props: () => api.getRangeProps() },
    {
      part: "thumb-low",
      node: () => lowThumb,
      props: () => api.getThumbProps({ index: 0, name: lowName }),
      events: true,
    },
    {
      part: "thumb-high",
      node: () => highThumb,
      props: () => api.getThumbProps({ index: 1, name: highName }),
      events: true,
    },
    // Both absent when the slider is not in a form.
    {
      part: "input-low",
      node: () => lowInput,
      props: () => api.getHiddenInputProps({ index: 0, name: lowName }),
    },
    {
      part: "input-high",
      node: () => highInput,
      props: () => api.getHiddenInputProps({ index: 1, name: highName }),
    },
  ];

  bindParts(bindings);
</script>
