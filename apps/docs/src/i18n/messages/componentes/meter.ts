export const meterMessages = {
  es: {

    "meterPage.description":
      "Meter: una medición dentro de un rango conocido, nunca el avance de una tarea.",
    "meterPage.lede":
      'Un valor medido ahora, no una tarea en curso: el rol WAI-ARIA <code>meter</code>, distinto de <code>progressbar</code>. Úsalo para uso de disco, nivel de batería, una calificación sobre una escala. Para el avance de una tarea con inicio y fin, usa <a href="/componentes/progress">Progress</a>.',
    "meterPage.body":
      "A diferencia de Progress, <code>min</code> es un parámetro real y con frecuencia distinto de cero: una calificación de 1 a 5, una temperatura. El relleno se calcula con <code>meterFraction(value, min, max)</code>, no con <code>value / max</code>.",
    "meterPage.test1": "Aplica role=meter con los tres atributos aria-value obligatorios.",
    "meterPage.test2":
      "Respeta un min distinto de cero al pintar el relleno, a diferencia de Progress.",
    "meterPage.a11yBody":
      'El rol <code>meter</code> lleva <code>aria-valuenow</code>/<code>aria-valuemin</code>/<code>aria-valuemax</code> siempre presentes, y <code>aria-valuetext</code> opcional para cuando el número solo no alcanza ("50% (6 horas) restantes"). Sin interacción de teclado: es una medición, no un control.',

    "demo.meter.rating": "Calificación",
    "demo.meter.ratingText": "4 de 5 estrellas",
    "demo.meter.disk": "Uso de disco",
    "demo.meter.diskText": "92% usado",
    "demo.meter.battery": "Batería",
    "demo.meter.batteryText": "68% restante",
  },
  en: {

    "meterPage.description":
      "Meter: a measurement within a known range, never a task's completion.",
    "meterPage.lede":
      'A value measured right now, not a task in progress: the WAI-ARIA <code>meter</code> role, distinct from <code>progressbar</code>. Use it for disk usage, battery level, a rating on a scale. For a task\'s progress with a start and an end, use <a href="/en/components/progress">Progress</a>.',
    "meterPage.body":
      "Unlike Progress, <code>min</code> is a real parameter and often non-zero: a 1-to-5 rating, a temperature. The fill is computed with <code>meterFraction(value, min, max)</code>, not <code>value / max</code>.",
    "meterPage.test1": "Sets role=meter with the three required aria-value attributes.",
    "meterPage.test2": "Honors a non-zero min when painting the fill, unlike Progress.",
    "meterPage.a11yBody":
      'The <code>meter</code> role carries <code>aria-valuenow</code>/<code>aria-valuemin</code>/<code>aria-valuemax</code> always present, and an optional <code>aria-valuetext</code> for when the raw number alone is not enough ("50% (6 hours) remaining"). No keyboard interaction: it is a measurement, not a control.',

    "demo.meter.rating": "Rating",
    "demo.meter.ratingText": "4 out of 5 stars",
    "demo.meter.disk": "Disk usage",
    "demo.meter.diskText": "92% used",
    "demo.meter.battery": "Battery",
    "demo.meter.batteryText": "68% remaining",
  },
} as const;
