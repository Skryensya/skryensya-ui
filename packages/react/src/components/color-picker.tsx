import { colorPickerParts, colorPickerPanelParts } from "@skryensya/core/color-picker";
import { oklchToRgb, rgbToOklch, type RgbColor } from "@skryensya/core/color";
import { colorPicker } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine, type PropTypes } from "@zag-js/react";
import { useId, useState, type ReactNode, type RefObject } from "react";
import { useAnchored } from "./anchored.js";

// Sin depender de `@zag-js/color-picker` directamente (react no lo trae como dependencia propia,
// sólo core la reexporta vía `machines.ts`): el tipo del `api` sale de la misma función `connect`,
// igual que hace `DatePicker` con la suya.
type ColorPickerApi = ReturnType<typeof colorPicker.connect<PropTypes>>;

export type ColorPickerProps = {
  /** Where the popover is portalled. Absent it goes to the body: see `ComboboxProps.container`. */
  container?: RefObject<HTMLElement>;
  id?: string;
  name?: string;
  label?: ReactNode;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  triggerLabel?: string;
  /*
   * Preset swatches for the panel's presets row. The contract's own option is one plain STRING,
   * space-separated (see `color-picker.ts`'s own comment)  -  there is no array/list option type
   * in this system, so that is the only shape the compiler can emit as valid JSX. An array is
   * accepted too, the more ergonomic shape for hand-authored React, same precedent as
   * `DatePickerProps.value` taking `readonly (DateValue | string)[] | string`.
   */
  swatches?: readonly string[] | string;
  onValueChange?: (details: { value: string }) => void;
};

const asSwatches = (input: ColorPickerProps["swatches"]): readonly string[] =>
  typeof input === "string" ? input.split(/\s+/).filter(Boolean) : (input ?? []);

/*
 * COLOR PICKER: the editable field (label, trigger with its swatch) plus a popover. The panel
 * inside is `ColorPickerPanelBody`, shared verbatim between `ColorPicker` and `CompactColorPicker`
 * (only `anatomy` differs), so full and compact never fork into two independent implementations  - 
 * same discipline `CalendarBody` gives DatePicker and Calendar.
 */
function useColorPicker({
  defaultValue = "#000000",
  disabled,
  id,
  invalid,
  name,
  onValueChange,
  readOnly,
  required,
  value,
}: Pick<
  ColorPickerProps,
  "defaultValue" | "disabled" | "id" | "invalid" | "name" | "onValueChange" | "readOnly" | "required" | "value"
>) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const service = useMachine(colorPicker.machine, {
    id: resolvedId,
    name,
    value: value !== undefined ? colorPicker.parse(value) : undefined,
    defaultValue: colorPicker.parse(defaultValue),
    disabled,
    readOnly,
    required,
    invalid,
    onValueChange(details) {
      onValueChange?.({ value: details.valueAsString });
    },
  });
  return { api: colorPicker.connect(service, normalizeProps), resolvedId };
}

function ColorPickerField({
  anatomy,
  api,
  container,
  label,
  resolvedId,
  swatches,
  triggerLabel,
}: {
  anatomy: "full" | "compact";
  api: ColorPickerApi;
  container?: ColorPickerProps["container"];
  label?: ReactNode;
  resolvedId: string;
  swatches?: readonly string[];
  triggerLabel?: string;
}) {
  const anchor = useAnchored(resolvedId);

  return (
    <div {...api.getRootProps()} className={colorPickerParts.root} data-anatomy={anatomy}>
      {label ? (
        <label {...api.getLabelProps()} className={colorPickerParts.label}>
          {label}
        </label>
      ) : null}
      {/* So `name` reaches a form submission, same reasoning as Select's own hidden `<select>`:
          the trigger is a button, not a form control. */}
      <input {...api.getHiddenInputProps()} className={colorPickerParts.hiddenInput} />
      <div {...api.getControlProps()} {...anchor.anchor(colorPickerParts.control)}>
        {/*
         * Zag SIEMPRE manda `aria-labelledby` (apuntando al label del campo) además de su propio
         * `aria-label` ("select color. current color is ..."); `aria-labelledby` le gana a
         * `aria-label` en el algoritmo de nombre accesible, así que se omite acá para que
         * `triggerLabel`  -  el mecanismo de nombrado de ESTE contrato, con default "Elegir color"  - 
         * sea el que manda, igual que hace el binding Vanilla.
         */}
        <button
          {...api.getTriggerProps()}
          aria-label={triggerLabel ?? "Elegir color"}
          aria-labelledby={undefined}
          className={`${colorPickerParts.trigger} sk-button sk-interactive`}
          data-icon-only=""
          type="button"
        >
          <span className={colorPickerParts.swatch} />
        </button>
      </div>
      <Portal container={container}>
        <div {...anchor.positioner(api.getPositionerProps(), colorPickerParts.positioner)}>
          <div {...api.getContentProps()} className={colorPickerParts.content}>
            <ColorPickerPanelBody api={api} anatomy={anatomy} swatches={swatches} />
          </div>
        </div>
      </Portal>
    </div>
  );
}

export function ColorPicker(props: ColorPickerProps) {
  const { api, resolvedId } = useColorPicker(props);
  return (
    <ColorPickerField
      anatomy="full"
      api={api}
      resolvedId={resolvedId}
      {...props}
      swatches={asSwatches(props.swatches)}
    />
  );
}

export function CompactColorPicker(props: ColorPickerProps) {
  const { api, resolvedId } = useColorPicker(props);
  return (
    <ColorPickerField
      anatomy="compact"
      api={api}
      resolvedId={resolvedId}
      {...props}
      swatches={asSwatches(props.swatches)}
    />
  );
}

const P = colorPickerPanelParts;

type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

const COLOR_FORMATS: readonly { id: ColorFormat; label: string }[] = [
  { id: "hex", label: "Hex" },
  { id: "rgb", label: "RGB" },
  { id: "hsl", label: "HSL" },
  { id: "oklch", label: "OKLCH" },
];

/*
 * THE PANEL BODY: area, hue/alpha rails, channel-input rows, presets, eyedropper. Entirely
 * derived from `api`, same role `CalendarBody` plays for DatePicker's calendar. `anatomy` gates
 * which rows render: "compact" stops after the area, hue rail and presets.
 */
function ColorPickerPanelBody({
  api,
  anatomy,
  swatches = [],
}: {
  api: ColorPickerApi;
  anatomy: "full" | "compact";
  swatches?: readonly string[];
}) {
  const [format, setFormat] = useState<ColorFormat>("hex");
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

  // OKLCH is not one of Zag's own formats (see `@skryensya/core/color`'s own doc): this row reads
  // the machine's real color through our conversion on every render, and writes back through the
  // SAME `api.value` Zag already exposes, never a parallel OKLCH-typed piece of state.
  const oklch = rgbToOklch(rgbOf());

  function commitOklchChannel(channel: "l" | "c" | "h", raw: string) {
    const parsed = Number.parseFloat(raw);
    if (Number.isNaN(parsed)) return;
    const next = { ...oklch, [channel]: channel === "l" ? parsed / 100 : parsed };
    const rgb = oklchToRgb(next);
    api.setValue(colorPicker.parse(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.alpha ?? 1})`));
  }

  return (
    <>
      <div {...api.getAreaProps()} className={P.area}>
        <div {...api.getAreaBackgroundProps()} className={P.areaBackground} />
        <div {...api.getAreaThumbProps()} className={P.areaThumb} />
      </div>

      <div className={P.hueSlider} {...api.getChannelSliderProps({ channel: "hue" })}>
        <div className={P.hueTrack} {...api.getChannelSliderTrackProps({ channel: "hue" })}>
          <div className={P.hueThumb} {...api.getChannelSliderThumbProps({ channel: "hue" })} />
        </div>
      </div>

      {anatomy === "full" ? (
        <>
          <div className={P.alphaSlider} {...api.getChannelSliderProps({ channel: "alpha" })}>
            <div {...api.getTransparencyGridProps({ size: "8px" })} />
            <div className={P.alphaTrack} {...api.getChannelSliderTrackProps({ channel: "alpha" })}>
              <div className={P.alphaThumb} {...api.getChannelSliderThumbProps({ channel: "alpha" })} />
            </div>
          </div>

          <div className={P.formatSwitch} role="group" aria-label="Color format">
            {COLOR_FORMATS.map((item) => (
              <button
                className={P.formatOption}
                data-state={format === item.id ? "checked" : undefined}
                key={item.id}
                onClick={() => setFormat(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={P.channels}>
            {format === "hex" ? (
              <div className={P.channelRow} style={{ "--sk-color-picker-channel-count": 1 } as React.CSSProperties}>
                <span className={P.channelLabel}>Hex</span>
                <input className={P.channelInput} {...api.getChannelInputProps({ channel: "hex" })} />
              </div>
            ) : null}
            {format === "rgb" ? (
              <div className={P.channelRow} style={{ "--sk-color-picker-channel-count": 3 } as React.CSSProperties}>
                <span className={P.channelLabel}>RGB</span>
                <input className={P.channelInput} {...api.getChannelInputProps({ channel: "red" })} />
                <input className={P.channelInput} {...api.getChannelInputProps({ channel: "green" })} />
                <input className={P.channelInput} {...api.getChannelInputProps({ channel: "blue" })} />
              </div>
            ) : null}
            {format === "hsl" ? (
              <div className={P.channelRow} style={{ "--sk-color-picker-channel-count": 3 } as React.CSSProperties}>
                <span className={P.channelLabel}>HSL</span>
                <input className={P.channelInput} {...api.getChannelInputProps({ channel: "hue" })} />
                <input className={P.channelInput} {...api.getChannelInputProps({ channel: "saturation" })} />
                <input className={P.channelInput} {...api.getChannelInputProps({ channel: "lightness" })} />
              </div>
            ) : null}
            {format === "oklch" ? (
              <div className={P.channelRow} style={{ "--sk-color-picker-channel-count": 3 } as React.CSSProperties}>
                <span className={P.channelLabel}>OKLCH</span>
                <input
                  className={P.channelInput}
                  type="number"
                  aria-label="oklch lightness"
                  defaultValue={Math.round(oklch.l * 1000) / 10}
                  onChange={(event) => commitOklchChannel("l", event.currentTarget.value)}
                />
                <input
                  className={P.channelInput}
                  type="number"
                  step="0.001"
                  aria-label="oklch chroma"
                  defaultValue={Math.round(oklch.c * 1000) / 1000}
                  onChange={(event) => commitOklchChannel("c", event.currentTarget.value)}
                />
                <input
                  className={P.channelInput}
                  type="number"
                  aria-label="oklch hue"
                  defaultValue={Math.round(oklch.h)}
                  onChange={(event) => commitOklchChannel("h", event.currentTarget.value)}
                />
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {swatches.length > 0 ? (
        <div className={P.swatchGroup} {...api.getSwatchGroupProps()}>
          {swatches.map((swatch) => (
            <button
              className={P.swatchTrigger}
              key={swatch}
              {...api.getSwatchTriggerProps({ value: swatch })}
            >
              <span className={P.swatchSwatch} {...api.getSwatchProps({ value: swatch })} />
            </button>
          ))}
        </div>
      ) : null}

      {anatomy === "full" && hasEyeDropper ? (
        <button
          {...api.getEyeDropperTriggerProps()}
          className={`${P.eyedropper} sk-button sk-interactive`}
          data-size="sm"
          data-variant="ghost"
        >
          {/* Un cuentagotas no está entre los roles estables del set de iconos (`icon.ts`); es la
              única afordancia de este componente, así que se dibuja acá en vez de sumar un rol
              nuevo al vocabulario compartido por un solo consumidor. */}
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16"
          >
            <path d="m2 22 1-4 9.5-9.5" />
            <path d="M12.5 8.5 16 5" />
            <path d="M14.5 3.5 20.5 9.5 17.5 12.5 11.5 6.5Z" />
          </svg>
        </button>
      ) : null}
    </>
  );
}

export type NativeColorPickerProps = {
  label: ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  id?: string;
};

/*
 * THE NATIVE COLOR FIELD: the layer that works with no script at all.
 *
 * A real `<input type="color">` inside the same field chrome, so the enhanced control and this
 * one read as the SAME field rather than two designs. Its own signature rather than an option on
 * `ColorPicker`, for the reason `Select.native`/`NativeDatePicker` are one: choosing between them
 * is choosing who owns the behaviour, and no flag should be able to stand in for that decision.
 */
export function NativeColorPicker({ defaultValue, id, label, name, value }: NativeColorPickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={colorPickerParts.root}>
      {/* Named through `aria-labelledby` rather than `for`/`id`: same reason `NativeDatePicker`
          gives  -  the two bindings render into one document in the symmetry gate, and a literal
          id would collide across them. */}
      <label className={colorPickerParts.label} id={`${inputId}-label`}>
        {label}
      </label>
      <div className={colorPickerParts.control}>
        <input
          aria-labelledby={`${inputId}-label`}
          className={colorPickerParts.trigger}
          defaultValue={value === undefined ? defaultValue : undefined}
          name={name}
          type="color"
          value={value}
        />
      </div>
    </div>
  );
}
