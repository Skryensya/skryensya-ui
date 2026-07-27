<script lang="ts">
  import { tabs } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TABS, enhancer machine-backed sobre `@zag-js/tabs` (la MISMA máquina que usa React, vía
   * @skryensya/core/machines). No renderiza estructura: escanea su markup autorado
   * (`[data-sk-tabs-list]` / `[data-sk-tabs-trigger]` / `[data-sk-tabs-content]`, cada uno con
   * `data-value`) y parchea los atributos que devuelve `connect` sobre esos nodos. Preserva el
   * contrato viejo: espeja `api.value` en `data-value` del root y emite `sk-value-change`.
   */
  const root = getRoot();

  type Item = { value: string; trigger: HTMLElement; content: HTMLElement; disabled: boolean };

  const valueOf = (el: Element): string => el.getAttribute("data-value") ?? "";
  const disabledOf = (el: Element): boolean =>
    el.hasAttribute("data-disabled") || el.getAttribute("aria-disabled") === "true";

  const list = root.querySelector<HTMLElement>("[data-sk-tabs-list]");
  const contents = Array.from(root.querySelectorAll<HTMLElement>("[data-sk-tabs-content]"));

  const items: Item[] = (list ? Array.from(list.querySelectorAll<HTMLElement>("[data-sk-tabs-trigger]")) : [])
    .map((trigger): Item | null => {
      const value = valueOf(trigger);
      if (!value) return null;
      const content = contents.find((candidate) => valueOf(candidate) === value);
      if (!content) return null;
      return { value, trigger, content, disabled: disabledOf(trigger) };
    })
    .filter((item): item is Item => item !== null);

  if (!root.id) root.id = uniqueId("sk-tabs");
  if (list && !list.id) list.id = uniqueId("sk-tabs-list");

  const orientation: "horizontal" | "vertical" =
    root.getAttribute("data-orientation") === "vertical" ? "vertical" : "horizontal";
  const activationMode: "automatic" | "manual" =
    root.getAttribute("data-activation-mode") === "manual" ? "manual" : "automatic";

  // El valor inicial: el `data-value` autorado si apunta a un tab habilitado, si no el primer habilitado.
  const enabled = items.filter((item) => !item.disabled);
  const authored = root.getAttribute("data-value");
  const defaultValue = (authored && enabled.some((i) => i.value === authored) ? authored : enabled[0]?.value) ?? null;

  const service = useMachine(tabs.machine, () => ({
    id: root.id,
    ids: { root: root.id, list: list?.id ?? root.id },
    orientation,
    activationMode,
    defaultValue,
    onValueChange(details: { value: string }) {
      root.dispatchEvent(new CustomEvent("sk-value-change", { bubbles: true, detail: { value: details.value } }));
    },
  }));

  const api = $derived(tabs.connect(service, normalizeProps));

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    // Espeja el valor seleccionado en `data-value`, como hacía el enhancer viejo (algún CSS/consumidor
    // lo lee). Zag no lo pone en el root por su cuenta.
    root.setAttribute("data-value", api.value ?? "");
    if (list) applyZagProps(list, api.getListProps() as DomProps);
    for (const item of items) {
      applyZagProps(item.trigger, api.getTriggerProps({ value: item.value, disabled: item.disabled }) as DomProps);
      applyZagProps(item.content, api.getContentProps({ value: item.value }) as DomProps);
    }
  });

  // Los handlers de Zag (onClick/onKeyDown/onFocus) se cablean una vez y se re-leen en cada disparo:
  // la máquina cambia de estado y con ella el closure.
  const cleanups: Array<() => void> = [];
  onMount(() => {
    if (list) {
      cleanups.push(bindZagEvents(list, () => api.getListProps() as DomProps));
    }
    for (const item of items) {
      cleanups.push(
        bindZagEvents(
          item.trigger,
          () =>
            api.getTriggerProps({
              value: item.value,
              disabled: item.disabled,
            }) as DomProps,
        ),
      );
    }
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
