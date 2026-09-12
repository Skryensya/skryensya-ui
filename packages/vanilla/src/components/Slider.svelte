<script lang="ts">
  import { slider } from "@skryensya/core/machines";
import { sliderAttrs } from "@skryensya/core/slider";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import { selectorsFor } from "@skryensya/core/selectors";

  const root = getRoot();

  /* Derived from the contract's own mount attributes; see `selectorsFor`. */

  const selector = selectorsFor(sliderAttrs);

  const numberAttr = (name: string, fallback: number): number => {
    const raw = root.getAttribute(name);
    const value = Number(raw);
    return raw == null || !Number.isFinite(value) ? fallback : value;
  };

  const control = root.querySelector<HTMLElement>(selector.control);
  const track = root.querySelector<HTMLElement>(selector.track);
  const range = root.querySelector<HTMLElement>(selector.range);
  const thumb = root.querySelector<HTMLElement>(selector.thumb);
  const input = root.querySelector<HTMLElement>(selector.input);

  if (!control) throw new Error("Slider requires a [data-sk-slider-control] element.");
  if (!track) throw new Error("Slider requires a [data-sk-slider-track] element.");
  if (!range) throw new Error("Slider requires a [data-sk-slider-range-part] element.");
  if (!thumb) throw new Error("Slider requires a [data-sk-slider-thumb] element.");

  const min = numberAttr("data-min", 0);
  const max = numberAttr("data-max", 100);
  const step = root.hasAttribute("data-step") ? numberAttr("data-step", 1) : undefined;
  const defaultValue = numberAttr("data-value", min);
  const sliderId = root.id || uniqueId("sk-slider");
  const name = root.getAttribute("data-name") ?? undefined;
  const ariaLabel = root.getAttribute("aria-label") ?? undefined;
  const ariaLabelledBy = root.getAttribute("aria-labelledby") ?? undefined;

  const service = useMachine(slider.machine, () => ({
    id: sliderId,
    "aria-label": ariaLabel ? [ariaLabel] : undefined,
    "aria-labelledby": ariaLabelledBy ? [ariaLabelledBy] : undefined,
    defaultValue: [defaultValue],
    disabled: root.hasAttribute("data-disabled"),
    max,
    min,
    name,
    onValueChange(details: { value: number[] }) {
      root.setAttribute("data-value", String(details.value[0] ?? min));
      root.dispatchEvent(new CustomEvent("sk-value-change", { bubbles: true, detail: { value: details.value[0] ?? min } }));
    },
    step,
    thumbAlignment: "center" as const,
    thumbSize: { width: 32, height: 32 },
  }));

  const api = $derived(slider.connect(service, normalizeProps));

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(control, api.getControlProps() as DomProps);
    applyZagProps(track, api.getTrackProps() as DomProps);
    applyZagProps(range, api.getRangeProps() as DomProps);
    applyZagProps(thumb, api.getThumbProps({ index: 0 }) as DomProps);
    if (input) applyZagProps(input, api.getHiddenInputProps({ index: 0, name }) as DomProps);
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    cleanups.push(bindZagEvents(control, () => api.getControlProps() as DomProps));
    cleanups.push(bindZagEvents(thumb, () => api.getThumbProps({ index: 0 }) as DomProps));
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
