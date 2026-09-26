import {
  windowContract,
  windowDefaultSize,
  windowEvents,
  windowParts,
  windowResizeAxes,
  windowStageIcons,
  withoutStackZIndex,
  type WindowOpenChangeDetails,
  type WindowStage,
  type WindowStageChangeDetails,
} from "@skryensya/core/window";
import { floatingPanel } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useId, useRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { Icon } from "./icon.js";

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

const {
  closeLabel: closeLabelOption,
  closeOnEscape: closeOnEscapeOption,
  defaultOpen: defaultOpenOption,
  draggable: draggableOption,
  maximizeLabel: maximizeLabelOption,
  minimizeLabel: minimizeLabelOption,
  persistRect: persistRectOption,
  resizable: resizableOption,
  restoreLabel: restoreLabelOption,
  triggerIconOnly: triggerIconOnlyOption,
  triggerSize: triggerSizeOption,
  triggerTone: triggerToneOption,
  triggerVariant: triggerVariantOption,
} = windowContract.options;

export type { WindowOpenChangeDetails, WindowStage, WindowStageChangeDetails };

export type WindowProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & {
  /** What opens it. Carries its own accessible name, or pass `triggerLabel` when icon-only. */
  trigger: ReactNode;
  /** The window's name: shown in the title bar and announced as the dialog's label. */
  title: string;
  children: ReactNode;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: WindowOpenChangeDetails) => void;
  onStageChange?: (details: WindowStageChangeDetails) => void;
  draggable?: boolean;
  /** Resizing and the minimize/maximize controls. Off hides both. */
  resizable?: boolean;
  closeOnEscape?: boolean;
  /** Reopen where it was left instead of re-centred. */
  persistRect?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  closeLabel?: string;
  minimizeLabel?: string;
  maximizeLabel?: string;
  restoreLabel?: string;
  triggerLabel?: string;
  triggerVariant?: string;
  triggerTone?: string;
  triggerSize?: string;
  triggerIconOnly?: boolean;
  triggerClassName?: string;
  /**
   * Where the window is portalled. `document.body` by default, so no transformed or clipping
   * ancestor can trap a `position: fixed` box. Pass a ref to keep it inside a subtree instead.
   */
  container?: RefObject<HTMLElement>;
};

const stageLabelKey = {
  minimized: "minimize",
  maximized: "maximize",
  default: "restore",
} as const satisfies Record<WindowStage, string>;

export function Window({
  children,
  className,
  closeLabel = closeLabelOption.default,
  closeOnEscape = closeOnEscapeOption.default,
  container,
  defaultHeight,
  defaultOpen = defaultOpenOption.default,
  defaultWidth,
  draggable = draggableOption.default,
  id,
  maximizeLabel = maximizeLabelOption.default,
  minHeight,
  minimizeLabel = minimizeLabelOption.default,
  minWidth,
  onOpenChange,
  onStageChange,
  open,
  persistRect = persistRectOption.default,
  resizable = resizableOption.default,
  restoreLabel = restoreLabelOption.default,
  title,
  trigger,
  triggerClassName,
  triggerIconOnly = triggerIconOnlyOption.default,
  triggerLabel,
  triggerSize,
  triggerTone,
  triggerVariant,
  ...props
}: WindowProps) {
  const generatedId = useId();
  const machineId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const onStageChangeRef = useRef(onStageChange);
  onStageChangeRef.current = onStageChange;

  const translations = { minimize: minimizeLabel, maximize: maximizeLabel, restore: restoreLabel };

  const service = useMachine(floatingPanel.machine, {
    id: machineId,
    open,
    defaultOpen,
    draggable,
    resizable,
    closeOnEscape,
    persistRect,
    defaultSize: {
      width: defaultWidth ?? windowDefaultSize.width,
      height: defaultHeight ?? windowDefaultSize.height,
    },
    minSize: minWidth || minHeight ? { width: minWidth ?? 0, height: minHeight ?? 0 } : undefined,
    translations,
    onOpenChange: (details) => {
      onOpenChangeRef.current?.(details);
      rootRef.current?.dispatchEvent(
        new CustomEvent(windowEvents.openChange, { bubbles: true, detail: { open: details.open } }),
      );
    },
    onStageChange: (details) => {
      onStageChangeRef.current?.(details);
      rootRef.current?.dispatchEvent(
        new CustomEvent(windowEvents.stageChange, { bubbles: true, detail: { stage: details.stage } }),
      );
    },
  });
  const api = floatingPanel.connect(service, normalizeProps);

  const stageControl = (stage: WindowStage) => {
    const stageProps = api.getStageTriggerProps({ stage });
    return (
      <button
        {...stageProps}
        aria-label={translations[stageLabelKey[stage]]}
        className={cx(windowParts.stage, "sk-button", "sk-interactive")}
        data-icon-only=""
        data-size="sm"
        data-variant="ghost"
        // The machine refuses every stage change on a window it cannot resize; see the contract.
        hidden={!resizable || stageProps.hidden}
      >
        <Icon name={windowStageIcons[stage]} size="sm" />
      </button>
    );
  };

  return (
    <div {...props} className={cx(windowParts.root, className)} id={machineId} ref={rootRef}>
      <button
        {...api.getTriggerProps()}
        aria-label={triggerLabel}
        className={cx(windowParts.trigger, "sk-button", "sk-interactive", triggerClassName)}
        {...{
          [triggerVariantOption.attr]: triggerVariant,
          [triggerToneOption.attr]: triggerTone,
          [triggerSizeOption.attr]: triggerSize,
          [triggerIconOnlyOption.attr]: triggerIconOnly ? "" : undefined,
        }}
      >
        {trigger}
      </button>
      <Portal container={container}>
        <div {...withoutStackZIndex(api.getPositionerProps())} className={windowParts.positioner}>
          <div {...api.getContentProps()} className={windowParts.content}>
            <div {...api.getDragTriggerProps()} className={windowParts.drag}>
              <div {...api.getHeaderProps()} className={windowParts.header}>
                <h2 {...api.getTitleProps()} className={windowParts.title}>
                  {title}
                </h2>
                <div {...api.getControlProps()} className={windowParts.controls}>
                  {stageControl("minimized")}
                  {stageControl("maximized")}
                  {stageControl("default")}
                  <button
                    {...api.getCloseTriggerProps()}
                    // Over Zag's hardcoded English "Close Window".
                    aria-label={closeLabel}
                    className={cx(windowParts.close, "sk-button", "sk-interactive")}
                    data-icon-only=""
                    data-size="sm"
                    data-variant="ghost"
                  >
                    <Icon name="close" size="sm" />
                  </button>
                </div>
              </div>
            </div>
            <div {...api.getBodyProps()} className={windowParts.body}>
              {children}
            </div>
            {windowResizeAxes.map((axis) => (
              <div key={axis} {...api.getResizeTriggerProps({ axis })} className={windowParts.resize} />
            ))}
          </div>
        </div>
      </Portal>
    </div>
  );
}
