import {
  tileParts,
  type ExpandableTileOptions,
  type TileCheckboxOptions,
  type TileRadioGroupOptions,
  type TileSwitchOptions,
} from "@skryensya/core/tile";
import { selectionParts } from "@skryensya/core/selection";
import { checkbox, collapsible, radioGroup as radio } from "@skryensya/core/machines";
import type { Space } from "@skryensya/core/layout";
type CollapsibleApi = collapsible.Api;

import { normalizeProps, useMachine } from "@zag-js/react";
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ForwardRefExoticComponent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { CheckboxIndicators } from "./selection.js";
import { Icon } from "./icon.js";


function tileRootClasses(className: string | undefined, ...parts: readonly string[]) {
  return [tileParts.root, ...parts, className].filter(Boolean).join(" ");
}

export type TileLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  padding?: Space;
};

export const TileLink = forwardRef<HTMLAnchorElement, TileLinkProps>(function TileLink({ className, children, padding, ...props }, ref) {
  const classes = tileRootClasses(className, tileParts.interactive, "sk-interactive");

  return (
    <a {...props} className={classes} data-padding={padding} data-part="root" data-scope="tile" ref={ref}>
      {children}
    </a>
  );
});

export type TileButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  padding?: Space;
};

export const TileButton = forwardRef<HTMLButtonElement, TileButtonProps>(function TileButton(
  { className, children, disabled, padding, type = "button", ...props },
  ref,
) {
  const classes = tileRootClasses(className, tileParts.interactive, "sk-interactive");

  return (
    <button
      {...props}
      className={classes}
      data-disabled={disabled ? "" : undefined}
      data-padding={padding}
      data-part="root"
      data-scope="tile"
      disabled={disabled}
      ref={ref}
      type={type}
    >
      {children}
    </button>
  );
});

export type TileContentProps = HTMLAttributes<HTMLSpanElement> & {
  title: ReactNode;
  description?: ReactNode;
};

export const TileContent = forwardRef<HTMLSpanElement, TileContentProps>(function TileContent(
  { className, description, title, ...props },
  ref,
) {
  return (
    <span {...props} className={className ? `${tileParts.content} ${className}` : tileParts.content} data-part="content" ref={ref}>
      <span className={tileParts.title}>{title}</span>
      {description != null ? <span className={tileParts.description}>{description}</span> : null}
    </span>
  );
});

export type TileChevronProps = HTMLAttributes<HTMLSpanElement>;

/**
 * The disclosure mark on an expandable tile. Both children are always rendered and the stylesheet
 * shows one, off the trigger's `data-state`: on the authored path there is no runtime to swap an
 * icon with. Decorative on purpose: the trigger's `aria-expanded` already announces the state.
 */
export const TileChevron = forwardRef<HTMLSpanElement, TileChevronProps>(function TileChevron(
  { className, ...props },
  ref,
) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={className ? `${tileParts.chevron} ${className}` : tileParts.chevron}
      data-part="chevron"
      ref={ref}
    >
      <span data-state="closed">
        <Icon name="chevron-down" />
      </span>
      <span data-state="open">
        <Icon name="chevron-up" />
      </span>
    </span>
  );
});

export type TileCheckboxProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, "onChange"> &
  TileCheckboxOptions & {
    children?: ReactNode;
    inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "checked" | "defaultChecked" | "disabled" | "name" | "required" | "type" | "value">;
  };

export const TileCheckbox = forwardRef<HTMLLabelElement, TileCheckboxProps>(function TileCheckbox(
  { id, className, children, inputProps, onCheck, indeterminate, padding, ...options },
  ref,
) {
  const generatedId = useId();
  const checked = options.checked ?? (indeterminate ? "indeterminate" : undefined);
  const defaultChecked = options.defaultChecked ?? (indeterminate ? "indeterminate" : undefined);
  const service = useMachine(checkbox.machine, {
    id: id ?? generatedId,
    checked,
    defaultChecked,
    name: options.name,
    value: options.value,
    disabled: options.disabled,
    required: options.required,
    onCheckedChange: onCheck,
  });
  const api = checkbox.connect(service, normalizeProps);
  const classes = tileRootClasses(className, tileParts.interactive, "sk-interactive");

  return (
    <label {...api.getRootProps()} className={classes} data-padding={padding} data-scope="tile" ref={ref}>
      <input {...api.getHiddenInputProps()} {...inputProps} data-part="input" />
      <span className={tileParts.content} data-part="content">
        {children}
      </span>
      <span aria-hidden="true" className={`${selectionParts.checkboxControl} sk-interactive`} data-part="indicator">
        <CheckboxIndicators />
      </span>
    </label>
  );
});

export type TileSwitchProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, "onChange"> &
  TileSwitchOptions & {
    children?: ReactNode;
    inputProps?: Omit<
      InputHTMLAttributes<HTMLInputElement>,
      "checked" | "defaultChecked" | "disabled" | "name" | "required" | "role" | "type" | "value"
    >;
  };

export const TileSwitch = forwardRef<HTMLLabelElement, TileSwitchProps>(function TileSwitch(
  { id, className, children, inputProps, onCheck, padding, ...options },
  ref,
) {
  const generatedId = useId();
  const service = useMachine(checkbox.machine, {
    id: id ?? generatedId,
    checked: options.checked,
    defaultChecked: options.defaultChecked,
    name: options.name,
    value: options.value,
    disabled: options.disabled,
    required: options.required,
    onCheckedChange: (details) => onCheck?.({ checked: details.checked === true }),
  });
  const api = checkbox.connect(service, normalizeProps);
  const classes = tileRootClasses(className, tileParts.interactive, "sk-interactive");

  return (
    <label {...api.getRootProps()} className={classes} data-padding={padding} data-scope="tile" ref={ref}>
      <input {...api.getHiddenInputProps()} {...inputProps} data-part="input" role="switch" />
      <span className={tileParts.content} data-part="content">
        {children}
      </span>
      <span aria-hidden="true" className={selectionParts.switchControl} data-part="indicator">
        <span className={selectionParts.switchThumb} />
      </span>
    </label>
  );
});

export type TileRadioItem = {
  value: string;
  children: ReactNode;
  disabled?: boolean;
};

export type TileRadioGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> &
  TileRadioGroupOptions & {
    items: readonly TileRadioItem[];
  };

export const TileRadioGroup = forwardRef<HTMLDivElement, TileRadioGroupProps>(function TileRadioGroup(
  { id, className, items, name, value, defaultValue, disabled, padding, required, orientation, onValueChange, ...props },
  ref,
) {
  const generatedId = useId();
  const service = useMachine(radio.machine, {
    id: id ?? generatedId,
    name,
    value,
    defaultValue,
    disabled,
    required,
    orientation,
    onValueChange,
  });
  const api = radio.connect(service, normalizeProps);

  return (
    <div {...api.getRootProps()} {...props} className={className} data-scope="tile" ref={ref}>
      {items.map((item) => {
        const props = { value: item.value, disabled: item.disabled };
        return (
          <label
            {...api.getItemProps(props)}
            className={tileRootClasses(undefined, tileParts.interactive, "sk-interactive")}
            data-part="item"
            data-padding={padding}
            data-scope="tile"
            key={item.value}
          >
            <input {...api.getItemHiddenInputProps(props)} data-part="input" />
            <span {...api.getItemTextProps(props)} className={tileParts.content} data-part="content">
              {item.children}
            </span>
            <span {...api.getItemControlProps(props)} aria-hidden="true" className={tileParts.selectionIndicator} data-part="indicator" />
          </label>
        );
      })}
    </div>
  );
});

type ExpandableTileContextValue = CollapsibleApi;
const ExpandableTileContext = createContext<ExpandableTileContextValue | null>(null);

export type ExpandableTileProps = Omit<HTMLAttributes<HTMLElement>, "onChange"> &
  ExpandableTileOptions & {
    as?: "section" | "article" | "div";
    children?: ReactNode;
  };

type ExpandableTileComponent = ForwardRefExoticComponent<ExpandableTileProps & { ref?: Ref<HTMLElement> }> & {
  Trigger: typeof ExpandableTileTrigger;
  Content: typeof ExpandableTileContent;
};

const ExpandableTileRoot = forwardRef<HTMLElement, ExpandableTileProps>(function ExpandableTile(
  { id, as, className, children, open, defaultOpen, disabled, padding, onOpenChange, ...props },
  ref,
) {
  const generatedId = useId();
  const service = useMachine(collapsible.machine, { id: id ?? generatedId, open, defaultOpen, disabled, onOpenChange });
  const api = collapsible.connect(service, normalizeProps);
  const Component = (as ?? "section") as ElementType;
  // `sk-interactive` lives on the trigger (below), not the section: the section is a container,
  // not the control, and painting the state layer behind it made hovering the revealed content
  // tint too (see the contract note in `@skryensya/core/tile`).
  const classes = tileRootClasses(className, tileParts.expandable);

  return (
    <ExpandableTileContext.Provider value={api}>
      <Component {...api.getRootProps()} {...props} className={classes} data-padding={padding} data-scope="tile" ref={ref}>
        {children}
      </Component>
    </ExpandableTileContext.Provider>
  );
});

export type ExpandableTileTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

export const ExpandableTileTrigger = forwardRef<HTMLButtonElement, ExpandableTileTriggerProps>(function ExpandableTileTrigger(
  { className, children, type = "button", ...props },
  ref,
) {
  const api = useContext(ExpandableTileContext);
  if (!api) throw new Error("ExpandableTile.Trigger must be rendered inside ExpandableTile.");
  // Not `tileRootClasses`: that helper always prepends `sk-tile` (the SECTION's class), which does
  // not belong on this button.
  const classes = [tileParts.trigger, tileParts.interactive, "sk-interactive", className].filter(Boolean).join(" ");

  return (
    <button {...api.getTriggerProps()} {...props} className={classes} data-scope="tile" ref={ref} type={type}>
      {children}
    </button>
  );
});

export type ExpandableTileContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export const ExpandableTileContent = forwardRef<HTMLDivElement, ExpandableTileContentProps>(function ExpandableTileContent(
  { className, children, ...props },
  ref,
) {
  const api = useContext(ExpandableTileContext);
  if (!api) throw new Error("ExpandableTile.Content must be rendered inside ExpandableTile.");
  const classes = className ? `${tileParts.expandableContent} ${className}` : tileParts.expandableContent;

  return (
    <div {...api.getContentProps()} {...props} className={classes} data-scope="tile" ref={ref}>
      {children}
    </div>
  );
});

export const ExpandableTile = ExpandableTileRoot as ExpandableTileComponent;
ExpandableTile.Trigger = ExpandableTileTrigger;
ExpandableTile.Content = ExpandableTileContent;
