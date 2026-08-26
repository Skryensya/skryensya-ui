import { Badge } from "@skryensya/react/badge";
import { CodePreview } from "@skryensya/react/code-preview";
import { Stack } from "@skryensya/react/layout";
import { Tabs } from "@skryensya/react/tabs";
import { Heading, Text } from "@skryensya/react/typography";
import { findExecution } from "../data";
import { Preview } from "../Preview";
import { ToolTraceList } from "../ToolTrace";

function verdictLabel(valid: boolean, matchesReferenceMarkup: boolean | undefined): string {
  if (!valid) return "FAIL";
  return matchesReferenceMarkup === false ? "PASS (differs)" : "PASS";
}

/*
 * `Breadcrumb` and `Tabs`, both validated via `validate_ui` before being written here. `Tabs` is
 * UNCONTROLLED (`defaultValue`, no `onValueChange` in its contract options) — that's enough here: the
 * whole page remounts on navigation anyway (a new `caseId`/`runId`/`lang` triple is a new URL, not a
 * state transition this component needs to preserve across), so there is nothing an uncontrolled tab
 * selection loses. `CodePreview` wraps a `<pre>` child, one per tab pane that isn't the live preview;
 * `ToolTraceList` (shared with `CaseDetailPage`'s own stacked cards) is the same shape once more.
 */
export function ExecutionDetailPage({
  caseId,
  runId,
  lang,
}: {
  caseId: string;
  runId: string;
  lang: "es" | "en";
}) {
  const execution = findExecution(caseId, runId, lang);

  if (!execution) {
    return (
      <Text tone="danger">
        Unknown execution: {caseId} / {runId} / {lang}
      </Text>
    );
  }

  const verdict = verdictLabel(execution.valid, execution.matchesReferenceMarkup);

  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Heading size="h2" flush>
          {execution.model} <small>({execution.provider})</small>
        </Heading>
        <Badge tone={execution.valid ? "success" : "danger"}>{verdict}</Badge>
        {!execution.valid && execution.reason ? <Text tone="danger">{execution.reason}</Text> : null}
        <Text tone="secondary" className="prompt">
          {execution.prompt}
        </Text>
      </Stack>

      <Tabs
        aria-label={`${caseId} views`}
        defaultValue="preview"
        items={[
          { value: "preview", label: "preview", children: <Preview caseRun={execution} /> },
          {
            value: "tree",
            label: "tree",
            children: (
              <CodePreview label="Final usage tree">
                <pre>{JSON.stringify(execution.finalTree, undefined, 2)}</pre>
              </CodePreview>
            ),
          },
          {
            value: "vanilla",
            label: "vanilla",
            children: (
              <CodePreview label="Emitted vanilla markup">
                <pre>{execution.emitted?.vanilla ?? "(no emitted markup)"}</pre>
              </CodePreview>
            ),
          },
          {
            value: "react",
            label: "react",
            children: (
              <CodePreview label="Emitted React">
                <pre>{execution.emitted?.react ?? "(no emitted react)"}</pre>
              </CodePreview>
            ),
          },
          { value: "trace", label: "trace", children: <ToolTraceList calls={execution.calls} /> },
        ]}
      />
    </Stack>
  );
}
