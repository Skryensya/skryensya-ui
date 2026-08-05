/*
 * Live React demo for /components/date-picker. Self-contained island (no function props crossing
 * the Astro boundary), mounted directly from the page with a bare `<DatePickerCustomDemo client:load />`.
 */
import { DatePicker } from "@skryensya/react/date-picker";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const DatePickerCustomDemo = framed(function DatePickerCustomDemo() {
  return (
    <DatePicker
      label="Reserva"
      locale="es-DO"
      name="checkin"
      placeholder="dd/mm/aaaa"
      selectionMode="single"
      timeZone="America/Santo_Domingo"
    />
  );
}, {viewport: "overlay"});

export const DatePickerDisabledDemo = framed(function DatePickerDisabledDemo() {
  return <DatePicker label="Reserva" locale="es-DO" placeholder="dd/mm/aaaa" disabled />;
});
