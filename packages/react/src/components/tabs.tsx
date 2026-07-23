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
};

export function Tabs({ id, items, ...options }: TabsProps) {
  const generatedId = useId();
  const service = useMachine(tabs.machine, { id: id ?? generatedId, ...options });
  const api = tabs.connect(service, normalizeProps);

  return (
    <div {...api.getRootProps()} className={tabsParts.root} data-ds-tabs="">
      <div {...api.getListProps()} className={tabsParts.list} data-ds-tabs-list="">
        {items.map((item) => (
          <button
            {...api.getTriggerProps({ value: item.value, disabled: item.disabled })}
            className={tabsParts.trigger}
            data-ds-tabs-trigger=""
            key={item.value}
          >
            {item.label}
          </button>
        ))}
        <div {...api.getIndicatorProps()} className={tabsParts.indicator} data-ds-tabs-indicator="" />
      </div>
      {items.map((item) => (
        <div
          {...api.getContentProps({ value: item.value })}
          className={tabsParts.content}
          data-ds-tabs-content=""
          key={item.value}
        >
          {item.children}
        </div>
      ))}
    </div>
  );
}
