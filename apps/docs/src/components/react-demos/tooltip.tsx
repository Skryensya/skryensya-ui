/*
 * Live React demo for /componentes/tooltip. Three triggers, wrapped in `sk-inline` to lay out the
 * same way the vanilla markup does (the page's `html` string got the same wrapper).
 *
 * THE WORDS COME FROM THE PAGE, as `demo.tooltip.*` keys. One island serves both locales, and while
 * it carried its own literals the Spanish page rendered an English React stage beside a Spanish HTML
 * one: the exact drift the usage-tree work exists to remove, in the one demo that cannot yet BE a
 * tree (see `src/demos/tooltip.ts` for which three lines of the contract are missing).
 */
import { Icon } from "@skryensya/react/icon";
import { Tooltip } from "@skryensya/react/tooltip";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn("tooltip");

export interface TooltipDemoProps {
  /** Plain data, because props are serialised into the frame as JSON. */
  strings: {
    exportLabel: string;
    exportContent: string;
    metricValue: string;
    metricLabel: string;
    metricContent: string;
    truncated: string;
  };
}

export const TooltipDemo = framed(function TooltipDemo({ strings }: TooltipDemoProps) {
  return (
    <div className="sk-inline" data-gap="md" data-align="center">
      {/* 1. An icon-only control. The name lives in aria-label; the tooltip expands it. */}
      <Tooltip content={strings.exportContent} placement="block-end" arrow>
        <button aria-label={strings.exportLabel} type="button">
          <Icon name="download" />
        </button>
      </Tooltip>

      {/* 2. Explain a piece of information that is already on the screen. */}
      <span className="sk-inline" data-gap="xs">
        {strings.metricValue}
        <Tooltip content={strings.metricContent} arrow>
          <button aria-label={strings.metricLabel} type="button">
            <Icon name="info" />
          </button>
        </Tooltip>
      </span>

      {/* 3. Return what the width cut off. tabIndex makes truncated text reachable. */}
      <Tooltip content={strings.truncated} placement="inline-end" arrow>
        <span className="sk-truncate" tabIndex={0}>
          {strings.truncated}
        </span>
      </Tooltip>
    </div>
  );
}, {viewport: "menu"});
