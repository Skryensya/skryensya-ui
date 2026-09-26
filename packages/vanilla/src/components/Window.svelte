<script lang="ts">
  import { floatingPanel } from "@skryensya/core/machines";
  import {
    windowAttrs,
    windowContract,
    windowDefaultSize,
    windowEvents,
    windowStages,
    withoutStackZIndex,
    type WindowResizeAxis,
    type WindowStage,
  } from "@skryensya/core/window";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * WINDOW, a machine-backed enhancer over `@zag-js/floating-panel` (the SAME machine React uses,
   * via @skryensya/core/machines). It renders no structure: it scans the authored parts and patches
   * onto them the attributes `connect` returns. Which stage a control is and which edge a handle
   * resizes are read from `data-stage` / `data-axis`, the attributes the machine writes back.
   */
  const root = getRoot();
  const find = (attr: string) => root.querySelector<HTMLElement>(`[${attr}]`);

  const trigger = find(windowAttrs.trigger);
  const positioner = find(windowAttrs.positioner);
  const content = find(windowAttrs.content);
  const drag = find(windowAttrs.drag);
  const header = find(windowAttrs.header);
  const title = find(windowAttrs.title);
  const controls = find(windowAttrs.controls);
  const close = find(windowAttrs.close);
  const body = find(windowAttrs.body);

  const stageControls = [...root.querySelectorAll<HTMLElement>(`[${windowAttrs.stage}]`)].filter(
    (node): node is HTMLElement & { dataset: { stage: WindowStage } } =>
      windowStages.includes(node.dataset.stage as WindowStage),
  );
  const resizeHandles = [...root.querySelectorAll<HTMLElement>(`[${windowAttrs.resize}]`)].filter(
    (node) => Boolean(node.dataset.axis),
  );

  if (!root.id) root.id = uniqueId("sk-window");

  const { options } = windowContract;

  const numberAttr = (name: string): number | undefined => {
    const raw = root.getAttribute(name);
    if (raw === null) return undefined;
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };
  // Default-true booleans are turned off only by the literal "false" the contract writes.
  const onUnlessFalse = (name: string) => root.getAttribute(name) !== "false";

  const resizable = onUnlessFalse(options.resizable.attr);
  const minWidth = numberAttr(options.minWidth.attr);
  const minHeight = numberAttr(options.minHeight.attr);

  /*
   * The labels are authored on the controls themselves (each option's `attr` is `aria-label`), so
   * that is where they are read from. They go to the machine as its translations AND are written
   * back over its props: Zag's close label is hardcoded English and ignores translations entirely.
   */
  const labelOf = (node: HTMLElement | null | undefined, fallback: string) =>
    node?.getAttribute("aria-label") || fallback;
  const stageNode = (stage: WindowStage) => stageControls.find((node) => node.dataset.stage === stage);
  const translations = {
    minimize: labelOf(stageNode("minimized"), options.minimizeLabel.default),
    maximize: labelOf(stageNode("maximized"), options.maximizeLabel.default),
    restore: labelOf(stageNode("default"), options.restoreLabel.default),
  };
  const stageLabel: Record<WindowStage, string> = {
    minimized: translations.minimize,
    maximized: translations.maximize,
    default: translations.restore,
  };
  const closeLabel = labelOf(close, options.closeLabel.default);

  const service = useMachine(floatingPanel.machine, () => ({
    id: root.id,
    defaultOpen: root.hasAttribute(options.defaultOpen.attr),
    draggable: onUnlessFalse(options.draggable.attr),
    resizable,
    closeOnEscape: onUnlessFalse(options.closeOnEscape.attr),
    persistRect: root.hasAttribute(options.persistRect.attr),
    defaultSize: {
      width: numberAttr(options.defaultWidth.attr) ?? windowDefaultSize.width,
      height: numberAttr(options.defaultHeight.attr) ?? windowDefaultSize.height,
    },
    minSize: minWidth || minHeight ? { width: minWidth ?? 0, height: minHeight ?? 0 } : undefined,
    translations,
    onOpenChange(details: { open: boolean }) {
      root.dispatchEvent(
        new CustomEvent(windowEvents.openChange, { bubbles: true, detail: { open: details.open } }),
      );
    },
    onStageChange(details: { stage: WindowStage }) {
      root.dispatchEvent(
        new CustomEvent(windowEvents.stageChange, { bubbles: true, detail: { stage: details.stage } }),
      );
    },
  }));

  const api = $derived(floatingPanel.connect(service, normalizeProps));

  const bindings: PartBinding[] = [
    { part: "trigger", node: () => trigger, props: () => api.getTriggerProps(), events: true },
    {
      part: "positioner",
      node: () => positioner,
      props: () => withoutStackZIndex(api.getPositionerProps()),
    },
    { part: "content", node: () => content, props: () => api.getContentProps(), events: true },
    { part: "drag", node: () => drag, props: () => api.getDragTriggerProps(), events: true },
    { part: "header", node: () => header, props: () => api.getHeaderProps() },
    { part: "title", node: () => title, props: () => api.getTitleProps() },
    { part: "controls", node: () => controls, props: () => api.getControlProps() },
    ...stageControls.map(
      (node): PartBinding => ({
        part: "stage",
        node: () => node,
        props: () => {
          const stage = node.dataset.stage;
          const props = api.getStageTriggerProps({ stage });
          return {
            ...props,
            "aria-label": stageLabel[stage],
            // The machine refuses every stage change on a window it cannot resize; see the contract.
            hidden: !resizable || props.hidden,
          };
        },
        events: true,
      }),
    ),
    {
      part: "close",
      node: () => close,
      props: () => ({ ...api.getCloseTriggerProps(), "aria-label": closeLabel }),
      events: true,
    },
    { part: "body", node: () => body, props: () => api.getBodyProps() },
    ...resizeHandles.map(
      (node): PartBinding => ({
        part: "resize",
        node: () => node,
        props: () => api.getResizeTriggerProps({ axis: node.dataset.axis as WindowResizeAxis }),
        events: true,
      }),
    ),
  ];

  bindParts(bindings);
</script>
