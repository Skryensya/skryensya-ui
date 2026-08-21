import { tabsContract, tabsParts, type TabsOptions, type TabsSize } from "@skryensya/core/tabs";
import { tabs } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, type ReactNode } from "react";

const { size: sizeOption } = tabsContract.options;

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
   * It exists because authored markup could always put it there and this binding could not: the two
   * paths were not equivalent, which the symmetry gate is what surfaced.
   */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Paint size for the trigger row. CSS-only, so it is not one of `TabsOptions` — the Zag machine
   * never sees it, it lands straight on `data-size`. */
  size?: TabsSize;
};

export function Tabs({
  id,
  items,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  size = sizeOption.default,
  ...options
}: TabsProps) {
  const generatedId = useId();
  const service = useMachine(tabs.machine, { id: id ?? generatedId, ...options });
  const api = tabs.connect(service, normalizeProps);

  return (
    <div
      {...api.getRootProps()}
      className={tabsParts.root}
      data-activation-mode={options.activationMode ?? "automatic"}
      data-sk-tabs=""
      data-size={size}
      data-value={api.value}
    >
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
            // Zag only writes `aria-controls` on the SELECTED trigger (confirmed reading
            // tabs.connect.js) — the WAI-ARIA Tabs pattern is explicit that EVERY tab has it
            // ("Each element with role tab has the property aria-controls referring to its
            // associated tabpanel element"), selected or not. `getContentProps` already computes
            // each panel's real id regardless of selection, so this overrides with the real one
            // rather than leaving it unset on every unselected tab.
            aria-controls={api.getContentProps({ value: item.value }).id}
            // `sk-interactive` is the state layer, and it was missing here while authored markup had
            // it: the React path simply did not paint hover or press. The symmetry gate is what saw it.
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
