import {
  accordionDataParts,
  accordionEvents,
  accordionParts,
  accordionScope,
  type AccordionOptions,
  type AccordionType,
  type AccordionValue,
  type AccordionValueChangeDetails,
  accordionContract,
} from "@skryensya/core/accordion";
import { ExpandableTile, ExpandableTileContent, ExpandableTileTrigger } from "./tile.js";

/* Derived, never restated: the default lives in the contract. */
const {
  collapsible: collapsibleOption,
  disabled: disabledOption,
  type: typeOption,
  headingLevel: headingLevelOption,
  defaultOpen: defaultOpenOption,
} = accordionContract.options;
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
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
  /**
   * Markup channel: when the root has no `defaultValue`/`value`, an item with `defaultOpen`
   * contributes its value once (vanilla reads `data-default-open` the same way).
   */
  contributeDefaultOpen: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function normalizeValue(value: AccordionValue | undefined, type: AccordionType): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const unique = [...new Set(values)];
  return type === "single" ? unique.slice(0, 1) : unique;
}

/** `aria-level` is only meaningful in 1..6; out-of-range values are clamped, not authored raw. */
function clampHeadingLevel(level: number): number {
  const fallback = headingLevelOption.default;
  const n = Number.isFinite(level) ? Math.round(level) : fallback;
  return Math.min(6, Math.max(1, n));
}

export type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & AccordionOptions & {
  children?: ReactNode;
};

export type AccordionItemProps = Omit<HTMLAttributes<HTMLElement>, "onChange"> & {
  children?: ReactNode;
  disabled?: boolean;
  value: string;
  /** Starts open when the root did not set `defaultValue` / `value`. Same as contract `defaultOpen`. */
  defaultOpen?: boolean;
};

export type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  /**
   * The page-outline heading level this section announces itself at, on a `role="heading"`
   * wrapper around the button rather than the button itself. Clamped to 1..6. Defaults to 3.
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
  {
    children,
    className,
    collapsible = collapsibleOption.default,
    defaultValue,
    disabled = disabledOption.default,
    onValueChange,
    type = typeOption.default,
    value,
    ...props
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isControlled = value !== undefined;
  const hasRootDefault = defaultValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    hasRootDefault ? normalizeValue(defaultValue, type) : [],
  );
  const values = isControlled ? normalizeValue(value, type) : uncontrolledValue;
  // With `type="multiple"`, every open section can close on its own; `collapsible` only gates single.
  const canCollapse = type === "multiple" || collapsible;

  const contributeDefaultOpen = useCallback(
    (itemValue: string) => {
      if (isControlled || hasRootDefault) return;
      setUncontrolledValue((prev) => {
        if (prev.includes(itemValue)) return prev;
        return type === "single" ? (prev.length === 0 ? [itemValue] : prev) : [...prev, itemValue];
      });
    },
    [hasRootDefault, isControlled, type],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      const isOpen = values.includes(itemValue);
      let next: string[];
      if (isOpen) next = canCollapse ? values.filter((entry) => entry !== itemValue) : values;
      else next = type === "single" ? [itemValue] : [...values, itemValue];

      if (!isControlled) setUncontrolledValue(next);
      const details: AccordionValueChangeDetails = {
        value: type === "single" ? (next[0] ?? null) : next,
      };
      onValueChange?.(details);
      // Same event vanilla dispatches: agents and markup listeners share one name.
      rootRef.current?.dispatchEvent(
        new CustomEvent(accordionEvents.valueChange, { bubbles: true, detail: details }),
      );
    },
    [canCollapse, isControlled, onValueChange, type, values],
  );

  const context = useMemo(
    () => ({ disabled, values, toggle, contributeDefaultOpen }),
    [contributeDefaultOpen, disabled, toggle, values],
  );

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <AccordionContext.Provider value={context}>
      <div
        {...props}
        className={[accordionParts.root, className].filter(Boolean).join(" ")}
        data-part={accordionDataParts.root}
        data-scope={accordionScope}
        data-sk-accordion=""
        data-type={type}
        ref={setRefs}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

const AccordionItem = forwardRef<HTMLElement, AccordionItemProps>(function AccordionItem(
  {
    children,
    className,
    defaultOpen = defaultOpenOption.default,
    disabled = disabledOption.default,
    value,
    ...props
  },
  ref,
) {
  const accordion = useContext(AccordionContext);
  if (!accordion) throw new Error("Accordion.Item must be rendered inside Accordion.");

  const { contributeDefaultOpen, disabled: rootDisabled, toggle, values } = accordion;

  useLayoutEffect(() => {
    if (defaultOpen) contributeDefaultOpen(value);
  }, [contributeDefaultOpen, defaultOpen, value]);

  const open = values.includes(value);
  const isDisabled = rootDisabled || disabled;

  return (
    <ExpandableTile
      {...props}
      className={className}
      data-part={accordionDataParts.item}
      data-value={value}
      disabled={isDisabled}
      onOpenChange={({ open: nextOpen }) => {
        if (nextOpen !== open) toggle(value);
      }}
      open={open}
      ref={ref}
    >
      {children}
    </ExpandableTile>
  );
});

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(function AccordionTrigger(
  { children, headingLevel = headingLevelOption.default, ...props },
  ref,
) {
  const level = clampHeadingLevel(headingLevel);
  return (
    <div
      aria-level={level}
      className={accordionParts.triggerHeading}
      data-part={accordionDataParts.triggerHeading}
      role="heading"
    >
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
  return (
    <ExpandableTileContent {...props} data-part={accordionDataParts.content} ref={ref}>
      {children}
    </ExpandableTileContent>
  );
});

export const Accordion = AccordionRoot as AccordionComponent;
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
