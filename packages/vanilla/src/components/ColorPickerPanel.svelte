<script lang="ts">
  import { colorPickerPanelParts } from "@skryensya/core/color-picker";
  import { colorPicker } from "@skryensya/core/machines";
  import { buttonParts } from "@skryensya/core/button";
  import { oklchToRgb, rgbToOklch, type RgbColor } from "@skryensya/core/color";
  import type { PropTypes } from "@zag-js/svelte";

  type ColorPickerApi = ReturnType<typeof colorPicker.connect<PropTypes>>;
  type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

  const COLOR_FORMATS: readonly { id: ColorFormat; label: string }[] = [
    { id: "hex", label: "Hex" },
    { id: "rgb", label: "RGB" },
    { id: "hsl", label: "HSL" },
    { id: "oklch", label: "OKLCH" },
  ];


  /*
   * THE PANEL BODY: area, hue/alpha rails, channel-input rows, presets, eyedropper. Entirely
   * derived from `api` — nothing here is authored markup — same role `CalendarView` plays inside
   * DatePicker. `anatomy` gates which rows draw: "compact" stops after the area, hue rail and
   * presets; "full" adds the alpha rail, every channel-input row and the eyedropper.
   */
  const { api, anatomy, swatches = [] }: { api: ColorPickerApi; anatomy: "compact" | "full"; swatches?: string[] } =
    $props();

  const P = colorPickerPanelParts;

  let format = $state<ColorFormat>("hex");
  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  const rgbOf = (): RgbColor => {
    const rgba = api.value.toFormat("rgba");
    return {
      r: rgba.getChannelValue("red"),
      g: rgba.getChannelValue("green"),
      b: rgba.getChannelValue("blue"),
      alpha: rgba.getChannelValue("alpha"),
    };
  };

  // OKLCH is not one of Zag's own formats (see `color.ts`'s own doc): this row reads the machine's
  // real color through our conversion on every render, and writes back through the SAME `api.value`
  // Zag already exposes, `setValue` on a color parsed from the resulting RGB — never a parallel
  // OKLCH-typed piece of state the two could drift out of.
  const oklch = $derived(rgbToOklch(rgbOf()));

  function commitOklchChannel(channel: "l" | "c" | "h", raw: string) {
    const parsed = Number.parseFloat(raw);
    if (Number.isNaN(parsed)) return;
    const next = { ...oklch, [channel]: channel === "l" ? parsed / 100 : parsed };
    const rgb = oklchToRgb(next);
    api.setValue(colorPicker.parse(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.alpha ?? 1})`));
  }
</script>

<div {...api.getAreaProps()} class={P.area}>
  <div {...api.getAreaBackgroundProps()} class={P.areaBackground}></div>
  <div {...api.getAreaThumbProps()} class={P.areaThumb}></div>
</div>

<div class={P.hueSlider} {...api.getChannelSliderProps({ channel: "hue" })}>
  <div class={P.hueTrack} {...api.getChannelSliderTrackProps({ channel: "hue" })}>
    <div class={P.hueThumb} {...api.getChannelSliderThumbProps({ channel: "hue" })}></div>
  </div>
</div>

{#if anatomy === "full"}
  <div class={P.alphaSlider} {...api.getChannelSliderProps({ channel: "alpha" })}>
    <div {...api.getTransparencyGridProps({ size: "8px" })}></div>
    <div class={P.alphaTrack} {...api.getChannelSliderTrackProps({ channel: "alpha" })}>
      <div class={P.alphaThumb} {...api.getChannelSliderThumbProps({ channel: "alpha" })}></div>
    </div>
  </div>

  <div class={P.formatSwitch} role="group" aria-label="Color format">
    {#each COLOR_FORMATS as item (item.id)}
      <button
        class={P.formatOption}
        data-state={format === item.id ? "checked" : undefined}
        type="button"
        onclick={() => {
          format = item.id;
        }}
      >
        {item.label}
      </button>
    {/each}
  </div>

  <div class={P.channels}>
    {#if format === "hex"}
      <div class={P.channelRow} style="--sk-color-picker-channel-count: 1">
        <span class={P.channelLabel}>Hex</span>
        <input class={P.channelInput} {...api.getChannelInputProps({ channel: "hex" })} />
      </div>
    {/if}
    {#if format === "rgb"}
      <div class={P.channelRow} style="--sk-color-picker-channel-count: 3">
        <span class={P.channelLabel}>RGB</span>
        <input class={P.channelInput} {...api.getChannelInputProps({ channel: "red" })} />
        <input class={P.channelInput} {...api.getChannelInputProps({ channel: "green" })} />
        <input class={P.channelInput} {...api.getChannelInputProps({ channel: "blue" })} />
      </div>
    {/if}
    {#if format === "hsl"}
      <div class={P.channelRow} style="--sk-color-picker-channel-count: 3">
        <span class={P.channelLabel}>HSL</span>
        <input class={P.channelInput} {...api.getChannelInputProps({ channel: "hue" })} />
        <input class={P.channelInput} {...api.getChannelInputProps({ channel: "saturation" })} />
        <input class={P.channelInput} {...api.getChannelInputProps({ channel: "lightness" })} />
      </div>
    {/if}
    {#if format === "oklch"}
      <div class={P.channelRow} style="--sk-color-picker-channel-count: 3">
        <span class={P.channelLabel}>OKLCH</span>
        <input
          class={P.channelInput}
          type="number"
          aria-label="oklch lightness"
          value={Math.round(oklch.l * 1000) / 10}
          onchange={(event) => commitOklchChannel("l", event.currentTarget.value)}
        />
        <input
          class={P.channelInput}
          type="number"
          step="0.001"
          aria-label="oklch chroma"
          value={Math.round(oklch.c * 1000) / 1000}
          onchange={(event) => commitOklchChannel("c", event.currentTarget.value)}
        />
        <input
          class={P.channelInput}
          type="number"
          aria-label="oklch hue"
          value={Math.round(oklch.h)}
          onchange={(event) => commitOklchChannel("h", event.currentTarget.value)}
        />
      </div>
    {/if}
  </div>
{/if}

{#if swatches.length > 0}
  <div class={P.swatchGroup} {...api.getSwatchGroupProps()}>
    {#each swatches as swatch (swatch)}
      <button class={P.swatchTrigger} {...api.getSwatchTriggerProps({ value: swatch })}>
        <span class={P.swatchSwatch} {...api.getSwatchProps({ value: swatch })}></span>
      </button>
    {/each}
  </div>
{/if}

{#if anatomy === "full" && hasEyeDropper}
  <button
    class="{P.eyedropper} {buttonParts.root} {buttonParts.interactive}"
    data-size="sm"
    data-variant="ghost"
    data-icon-only=""
    {...api.getEyeDropperTriggerProps()}
  >
    <!-- Un cuentagotas no está entre los roles estables del set de iconos (`icon.ts`); es la
         única afordancia de este componente, así que se dibuja acá en vez de sumar un rol nuevo
         al vocabulario compartido por un solo consumidor. -->
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="m2 22 1-4 9.5-9.5" />
      <path d="M12.5 8.5 16 5" />
      <path d="M14.5 3.5 20.5 9.5 17.5 12.5 11.5 6.5Z" />
    </svg>
  </button>
{/if}
