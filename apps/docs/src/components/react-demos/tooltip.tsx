/*
 * Live React demo for /components/tooltip. Three triggers, wrapped in `sk-inline` to lay out the
 * same way the vanilla markup does (the page's `html` string got the same wrapper).
 */
import { Icon } from "@skryensya/react/icon";
import { Tooltip } from "@skryensya/react/tooltip";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const TooltipDemo = framed(function TooltipDemo() {
  return (
    <div className="sk-inline" data-gap="md" data-align="center">
      {/* 1. An icon-only control. The name lives in aria-label; the tooltip expands it. */}
      <Tooltip content="Download the visible period in CSV" placement="block-end" arrow>
        <button aria-label="Exportar" type="button">
          <Icon name="download" />
        </button>
      </Tooltip>

      {/* 2. Explain a piece of information that is already on the screen. */}
      <span className="sk-inline" data-gap="xs">
        Ingresos $48.2k
        <Tooltip content="Amount invoiced for the period, without taxes or refunds" arrow>
          <button aria-label="How Income is Calculated" type="button">
            <Icon name="info" />
          </button>
        </Tooltip>
      </span>

      {/* 3. Return what the width cut off. tabIndex makes truncated text reachable. */}
      <Tooltip content="Billing pipeline migration" placement="inline-end" arrow>
        <span className="sk-truncate" tabIndex={0}>
          Billing pipeline migration
        </span>
      </Tooltip>
    </div>
  );
}, {viewport: "menu"});
