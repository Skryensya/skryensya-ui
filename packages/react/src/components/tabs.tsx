import { tabsParts, type TabsOptions } from "@skryensya/core/tabs";
import { tabs } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, type ReactNode } from "react";

export type TabsItem = {
  value: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
};

export type TabsProps = TabsOptions & {
  items: readonly TabsItem[];
  /**
   * Names the tab list. It lands on the element that IS the tablist, not on the box around it, so a
   * page with two sets of tabs can tell them apart.
   *
   * It exists because authored markup could always put it there and this binding could not — the two
   * paths were not equivalent, which the symmetry gate is what surfaced.
   */
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export function Tabs({
  id,
  items,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...options
}: TabsProps) {
  const generatedId = useId();
  const service = useMachine(tabs.machine, { id: id ?? generatedId, ...options });
  const api = tabs.connect(service, normalizeProps);

  return (
    <div {...api.getRootProps()} className={tabsParts.root} data-sk-tabs="">
      <div
        {...api.getListProps()}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={tabsParts.list}
        data-sk-tabs-list=""
      >
        {items.map((item) => (
          <button
            {...api.getTriggerProps({ value: item.value, disabled: item.disabled })}
            // `sk-interactive` is the state layer, and it was missing here while authored markup had
            // it — the React path simply did not paint hover or press. The symmetry gate is what saw it.
            className={`${tabsParts.trigger} sk-interactive`}
            data-sk-tabs-trigger=""
            key={item.value}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          {...api.getContentProps({ value: item.value })}
          className={tabsParts.content}
          data-sk-tabs-content=""
          key={item.value}
        >
          {item.children}
        </div>
      ))}
    </div>
  );
}
