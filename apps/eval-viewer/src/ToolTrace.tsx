import { CodePreview } from "@skryensya/react/code-preview";
import { Stack } from "@skryensya/react/layout";
import { Text } from "@skryensya/react/typography";
import type { ToolCallRecord } from "./data";

/*
 * Shared by `CaseDetailPage`'s stacked-run cards (wrapped in a `DetailsGroup`/`Details` there, since
 * a compact card wants the trace collapsed by default) and `ExecutionDetailPage`'s own "trace" tab
 * (no further collapsing needed  -  `Tabs` is already the disclosure boundary there). One tool call,
 * one `CodePreview`: `label` is the call's own name, `children` is its args then its result-or-error,
 * still plain `<pre>`  -  `Code` (typography) is for an inline fragment in a sentence, not a multi-line
 * JSON block, so it is the wrong signature for this despite sitting right next to it in the catalogue.
 */
function ToolCallPreview({ call }: { call: ToolCallRecord }) {
  return (
    <CodePreview label={call.name} collapsible previewLines={6}>
      <pre>{JSON.stringify(call.args, undefined, 2)}</pre>
      {call.error ? (
        <pre className="tool-error">{call.error}</pre>
      ) : (
        <pre>{JSON.stringify(call.result, undefined, 2)}</pre>
      )}
    </CodePreview>
  );
}

export function ToolTraceList({ calls }: { calls: readonly ToolCallRecord[] }) {
  if (calls.length === 0) return <Text tone="secondary">No MCP calls recorded.</Text>;

  return (
    <Stack gap="sm">
      {calls.map((call, index) => (
        <ToolCallPreview key={index} call={call} />
      ))}
    </Stack>
  );
}
