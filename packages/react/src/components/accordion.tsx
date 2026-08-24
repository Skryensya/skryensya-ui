import {
  accordionDataParts,
  accordionParts,
  accordionScope,
  type AccordionOptions,
  type AccordionType,
  type AccordionValue,
  type AccordionValueChangeDetails,
} from "@skryensya/core/accordion";
import { ExpandableTile, ExpandableTileContent, ExpandableTileTrigger } from "./tile.js";
import {
  createContext,
  forwardRef,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type ForwardRefExoticComponent,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

type AccordionContextValue = {
  disabled: boolean;
  values: string[];
  toggle: (value: string) => void;
};


const AccordionContext = createContext<AccordionContextValue | null>(null);

function normalizeValue(value: AccordionValue | undefined, type: AccordionType): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const unique = [...new Set(values)];
  return type === "single" ? unique.slice(0, 1) : unique;
}


export type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & AccordionOptions & {
  children?: ReactNode;
};

export type AccordionItemProps = Omit<HTMLAttributes<HTMLElement>, "onChange"> & {
  as?: "article" | "div" | "section";
  children?: ReactNode;
  disabled?: boolean;
  value: string;
};

export type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  /**
   * The page-outline heading level this section announces itself at, on a `role="heading"`
   * wrapper around the button rather than the button itself. A control cannot also claim the
   * heading role its own interactive one already fills. Defaults to 3, the level every demo in
   * this codebase already uses for the same sections rendered as `<details>`.
   */
  headingLevel?: number;
};

export type AccordionContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

type AccordionComponent = ForwardRefExoticComponent<AccordionProps & { ref?: Ref<HTMLDivElement> }> & {
  Content: typeof AccordionContent;
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
};

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { children, className, collapsible = true, defaultValue, disabled = false, onValueChange, type = "single", value, ...props },
  ref,
) {
  const [uncontrolledValue, setUncontrolledValue] = useState(() => normalizeValue(defaultValue, type));
  const isControlled = value !== undefined;
  const values = isControlled ? normalizeValue(value, type) : uncontrolledValue;

  const toggle = (itemValue: string) => {
    const isOpen = values.includes(itemValue);
    let next: string[];
    if (isOpen) next = type === "multiple" || collapsible ? values.filter((entry) => entry !== itemValue) : values;
    else next = type === "single" ? [itemValue] : [...values, itemValue];

    if (!isControlled) setUncontrolledValue(next);
    const details: AccordionValueChangeDetails = { value: type === "single" ? (next[0] ?? null) : next };
    onValueChange?.(details);
  };

  return (
    <AccordionContext.Provider value={{ disabled, values, toggle }}>
      <div
        {...props}
        className={[accordionParts.root, className].filter(Boolean).join(" ")}
        data-part={accordionDataParts.root}
        data-scope={accordionScope}
        data-type={type}
        ref={ref}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

const AccordionItem = forwardRef<HTMLElement, AccordionItemProps>(function AccordionItem(
  { as, children, className, disabled = false, value, ...props },
  ref,
) {
  const accordion = useContext(AccordionContext);
  if (!accordion) throw new Error("Accordion.Item must be rendered inside Accordion.");

  const open = accordion.values.includes(value);
  const isDisabled = accordion.disabled || disabled;

  return (
    <ExpandableTile
      {...props}
      as={as}
      className={className}
      data-part={accordionDataParts.item}
      data-value={value}
      disabled={isDisabled}
      onOpenChange={({ open: nextOpen }) => {
        if (nextOpen !== open) accordion.toggle(value);
      }}
      open={open}
      ref={ref}
    >
      {children}
    </ExpandableTile>
  );
});

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(function AccordionTrigger(
  { children, headingLevel = 3, ...props },
  ref,
) {
  return (
    <div aria-level={headingLevel} className={accordionParts.triggerHeading} data-part={accordionDataParts.triggerHeading} role="heading">
      <ExpandableTileTrigger {...props} data-part={accordionDataParts.trigger} ref={ref}>
        {children}
      </ExpandableTileTrigger>
    </div>
  );
});

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(function AccordionContent(
  { children, ...props },
  ref,
) {
  return <ExpandableTileContent {...props} data-part={accordionDataParts.content} ref={ref}>{children}</ExpandableTileContent>;
});

export const Accordion = AccordionRoot as AccordionComponent;
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
