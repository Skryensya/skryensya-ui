import { calloutWithRetryCase } from "./cases/callout-with-retry.js";
import { checkboxNoForIdCase } from "./cases/checkbox-no-for-id.js";
import { confirmationDialogCase } from "./cases/confirmation-dialog.js";
import { formFieldWithHintCase } from "./cases/form-field-with-hint.js";
import { iconOnlyButtonLabelledCase } from "./cases/icon-only-button-labelled.js";
import { paginatedDataTableCase } from "./cases/paginated-data-table.js";
import { progressInLayoutCase } from "./cases/progress-in-layout.js";
import { radioGroupValueAtGroupCase } from "./cases/radio-group-value-at-group.js";
import { settingsToggleRowCase } from "./cases/settings-toggle-row.js";
import { switchImmediateSettingCase } from "./cases/switch-immediate-setting.js";
import { tableCaptionOrderCase } from "./cases/table-caption-order.js";
import { tooltipAnchoredPublishedCase } from "./cases/tooltip-anchored-published.js";
import type { EvalCase } from "./case.js";

/*
 * Every case, regressions first (each one guards a documented historical bug from
 * plataforma-ai-ui.md), then breadth (common product intents with no incident behind them, added
 * so the corpus is not only a museum of past failures).
 */
export const evalCases: readonly EvalCase[] = [
  radioGroupValueAtGroupCase,
  checkboxNoForIdCase,
  switchImmediateSettingCase,
  iconOnlyButtonLabelledCase,
  tableCaptionOrderCase,
  progressInLayoutCase,
  tooltipAnchoredPublishedCase,
  confirmationDialogCase,
  paginatedDataTableCase,
  formFieldWithHintCase,
  calloutWithRetryCase,
  settingsToggleRowCase,
];

export type { EvalCase } from "./case.js";
