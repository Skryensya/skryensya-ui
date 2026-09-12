export const numberFieldMessages = {
  es: {
    "demo.numberField.label": "Cantidad",
    "demo.numberField.decrement": "Disminuir",
    "demo.numberField.increment": "Aumentar",

    "numberFieldPage.description": "Entrada numérica localizada con límites, pasos y controles de incremento.",
    "numberFieldPage.anatomyBody":
      "Este diagrama nombra la etiqueta, el control y ambos steppers. El espécimen está congelado; el NumberField vivo empieza abajo.",
    "numberFieldPage.anatomyLabel": "Anatomía de NumberField",
    "numberFieldPage.anatomyPreviewLabel": "NumberField, parte por parte",
    "numberFieldPage.contractBody": "El valor público conserva string y valueAsNumber. Intl.NumberFormat controla la presentación.",
    "numberFieldPage.a11yBody": "Los triggers tienen nombres propios y el input anuncia min, max, valor actual y estado inválido.",

    "numberFieldPage.testVanilla1":
      'Los triggers montan con el <code class="sk-code">aria-label</code> escrito a mano en el markup.',
    "numberFieldPage.testVanilla2":
      'Cada trigger suma o resta un <code class="sk-code">step</code> y emite <code class="sk-code">sk-value-change</code>.',
    "numberFieldPage.testVanilla3":
      "El trigger de incrementar se deshabilita en el máximo, el de disminuir en el mínimo.",
    "numberFieldPage.testVanilla4": "Presionar un trigger deshabilitado en el límite no hace nada.",
    "numberFieldPage.testVanilla5":
      'Escribir un valor y salir del campo lo confirma y emite <code class="sk-code">sk-value-change</code>.',
    "numberFieldPage.testVanilla6":
      "Un valor tipeado por encima del máximo se recorta al límite al salir del campo.",
    "numberFieldPage.testVanilla7":
      "El input y ambos triggers quedan deshabilitados cuando el input escrito a mano lo está.",
    "numberFieldPage.testVanilla8":
      'Monta <code class="sk-code">role="spinbutton"</code> con <code class="sk-code">aria-valuemin</code>/<code class="sk-code">aria-valuemax</code>/<code class="sk-code">aria-valuenow</code>.',
    "numberFieldPage.testVanilla9":
      "Flecha arriba/abajo suman o restan desde el teclado; Home/End saltan a los límites.",

    "numberFieldPage.testReact1":
      'Los triggers montan con el nombre accesible de <code class="sk-code">decrementLabel</code>/<code class="sk-code">incrementLabel</code>.',
    "numberFieldPage.testReact2":
      'Cada trigger suma o resta un <code class="sk-code">step</code> y llama a <code class="sk-code">onValueChange</code>.',
    "numberFieldPage.testReact3":
      "El trigger de incrementar se deshabilita en el máximo, el de disminuir en el mínimo.",
    "numberFieldPage.testReact4": "Presionar un trigger deshabilitado en el límite no hace nada.",
    "numberFieldPage.testReact5":
      'Escribir un valor y salir del campo lo confirma y llama a <code class="sk-code">onValueChange</code>.',
    "numberFieldPage.testReact6":
      "Un valor tipeado por encima del máximo se recorta al límite al salir del campo.",
    "numberFieldPage.testReact7": "El input y ambos triggers quedan deshabilitados con disabled.",
    "numberFieldPage.testReact8":
      'Monta <code class="sk-code">aria-valuemin</code>/<code class="sk-code">aria-valuemax</code>/<code class="sk-code">aria-valuenow</code>.',
    "numberFieldPage.testReact9":
      "Flecha arriba/abajo suman o restan desde el teclado; Home/End saltan a los límites.",
  },
  en: {
    "demo.numberField.label": "Quantity",
    "demo.numberField.decrement": "Decrease",
    "demo.numberField.increment": "Increase",

    "numberFieldPage.description": "Localized numeric entry with limits, steps, and increment controls.",
    "numberFieldPage.anatomyBody":
      "This diagram names the label, the control, and both steppers. The specimen is frozen; the live NumberField starts below.",
    "numberFieldPage.anatomyLabel": "NumberField anatomy",
    "numberFieldPage.anatomyPreviewLabel": "NumberField, part by part",
    "numberFieldPage.contractBody": "The public value keeps both string and valueAsNumber. Intl.NumberFormat controls the presentation.",
    "numberFieldPage.a11yBody": "The triggers carry their own names, and the input announces min, max, current value, and invalid state.",

    "numberFieldPage.testVanilla1":
      'The triggers mount with the authored <code class="sk-code">aria-label</code> from the markup.',
    "numberFieldPage.testVanilla2":
      'Each trigger adds or subtracts one <code class="sk-code">step</code> and emits <code class="sk-code">sk-value-change</code>.',
    "numberFieldPage.testVanilla3":
      "The increment trigger disables at the max, the decrement trigger disables at the min.",
    "numberFieldPage.testVanilla4": "Pressing a disabled trigger at the bound does nothing.",
    "numberFieldPage.testVanilla5":
      'Typing a value and leaving the field commits it and emits <code class="sk-code">sk-value-change</code>.',
    "numberFieldPage.testVanilla6":
      "A typed value past the max clamps down to the bound when the field is left.",
    "numberFieldPage.testVanilla7":
      "The input and both triggers disable when the authored input is disabled.",
    "numberFieldPage.testVanilla8":
      'Mounts <code class="sk-code">role="spinbutton"</code> with <code class="sk-code">aria-valuemin</code>/<code class="sk-code">aria-valuemax</code>/<code class="sk-code">aria-valuenow</code>.',
    "numberFieldPage.testVanilla9":
      "ArrowUp/ArrowDown step from the keyboard; Home/End jump to the bounds.",

    "numberFieldPage.testReact1":
      'The triggers mount with the accessible name from <code class="sk-code">decrementLabel</code>/<code class="sk-code">incrementLabel</code>.',
    "numberFieldPage.testReact2":
      'Each trigger adds or subtracts one <code class="sk-code">step</code> and calls <code class="sk-code">onValueChange</code>.',
    "numberFieldPage.testReact3":
      "The increment trigger disables at the max, the decrement trigger disables at the min.",
    "numberFieldPage.testReact4": "Pressing a disabled trigger at the bound does nothing.",
    "numberFieldPage.testReact5":
      'Typing a value and leaving the field commits it and calls <code class="sk-code">onValueChange</code>.',
    "numberFieldPage.testReact6":
      "A typed value past the max clamps down to the bound when the field is left.",
    "numberFieldPage.testReact7": "The input and both triggers disable with disabled.",
    "numberFieldPage.testReact8":
      'Mounts <code class="sk-code">aria-valuemin</code>/<code class="sk-code">aria-valuemax</code>/<code class="sk-code">aria-valuenow</code>.',
    "numberFieldPage.testReact9":
      "ArrowUp/ArrowDown step from the keyboard; Home/End jump to the bounds.",
  },
} as const;
