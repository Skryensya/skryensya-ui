import { Badge } from "@skryensya/react/badge";
import { Details, DetailsGroup } from "@skryensya/react/details";
import { Box, Inline, Stack } from "@skryensya/react/layout";
import { Code, Heading, Text } from "@skryensya/react/typography";
import { findCaseGroup, loadExecutions, type CaseRun } from "../data";
import { formatRelativeTime, parseRunId } from "../relative-time";
import { Preview } from "../Preview";
import { ToolTraceList } from "../ToolTrace";

/*
 * ONE CASE, every render STACKED — the reason this page and `CaseListPage` are two different
 * components rather than one with an optional prop (that was tried; see the commit this replaces):
 * the list is "which prompts exist, how many times has each run" — a scan. This is "how did every
 * attempt at ONE prompt actually turn out" — a comparison, and a comparison wants every render on
 * screen at once, not a table of links a reader has to open one at a time to see anything.
 *
 * REAL KIT COMPONENTS throughout, not hand-rolled markup with a local CSS class per element — `Box`
 * for the card surface, `Stack`/`Inline` for every layout seam, `Heading`/`Text`/`Code` for type,
 * `Badge` for the verdict and the MCP-step rail, `DetailsGroup`/`Details`/`CodePreview` for the
 * collapsed tool trace. Every composition below was round-tripped through `validate_ui` before being
 * written here — `DetailsGroup` wrapping a single `Details`, specifically, because `Details`'s own
 * contract declares `parents: ["DetailsGroup"]`: a standalone `<details>` is not a signature this kit
 * publishes, even for what reads like one disclosure on its own.
 */

const MCP_STEPS = ["get_catalog", "get_contract", "validate_ui"] as const;

function verdictLabel(execution: CaseRun): string {
  if (!execution.valid) return "FAIL";
  return execution.matchesReferenceMarkup === false ? "PASS (differs)" : "PASS";
}

function progressTone(execution: CaseRun, step: string): "success" | "danger" | "neutral" {
  const calls = execution.calls.filter((call) => call.name === step);
  if (calls.length === 0) return "neutral";
  if (execution.valid) return "success";
  return calls[calls.length - 1]?.error ? "danger" : "success";
}

function ProgressRail({ execution }: { execution: CaseRun }) {
  return (
    <Inline gap="sm" aria-label={`MCP generation progress for ${execution.caseId}`}>
      {MCP_STEPS.map((step) => {
        const count = execution.calls.filter((call) => call.name === step).length;
        const label = count === 0 ? "pending" : count === 1 ? "1 call" : `${count} calls`;
        return (
          <Badge key={step} tone={progressTone(execution, step)}>
            {step} · {label}
          </Badge>
        );
      })}
    </Inline>
  );
}

function ToolTrace({ execution }: { execution: CaseRun }) {
  if (execution.calls.length === 0) return <Text tone="secondary">No MCP calls recorded.</Text>;

  return (
    <DetailsGroup>
      <Details>
        <Details.Summary>{execution.calls.length} MCP calls</Details.Summary>
        <Details.Content>
          <ToolTraceList calls={execution.calls} />
        </Details.Content>
      </Details>
    </DetailsGroup>
  );
}

function RunCard({ execution }: { execution: CaseRun }) {
  const runDate = parseRunId(execution.runId);

  return (
    <Box padding="md" surface="surface" border="subtle">
      <Stack gap="sm">
        <Inline justify="between" align="start">
          <Stack gap="xs">
            <Heading size="h3" flush>
              {execution.model} <small>({execution.provider})</small>
            </Heading>
            <Text tone="secondary" size="sm">
              {execution.lang} ·{" "}
              <time dateTime={runDate.toISOString()} title={runDate.toLocaleString()}>
                {formatRelativeTime(runDate)}
              </time>
            </Text>
          </Stack>
          <Badge tone={execution.valid ? "success" : "danger"}>{verdictLabel(execution)}</Badge>
        </Inline>

        <Text tone="secondary" className="prompt">
          {execution.prompt}
        </Text>
        {!execution.valid && execution.reason ? <Text tone="danger">{execution.reason}</Text> : null}
        <ProgressRail execution={execution} />
        <Preview caseRun={execution} lazy />
        <ToolTrace execution={execution} />
      </Stack>
    </Box>
  );
}

export function CaseDetailPage({ caseId }: { caseId: string }) {
  const group = findCaseGroup(caseId);
  const executions = loadExecutions().filter((execution) => execution.caseId === caseId);

  if (!group) {
    return <Text tone="danger">Unknown case: {caseId}</Text>;
  }

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Heading size="h2" flush>
          {group.caseId}
        </Heading>
        <Text tone="secondary" className="prompt">
          {group.promptEs}
        </Text>
        <Text tone="secondary" className="prompt">
          {group.promptEn}
        </Text>
      </Stack>

      {executions.length === 0 ? (
        <Text tone="secondary">
          No runs yet. Run <Code>pnpm --filter @skryensya/evals agent --case {group.caseId}</Code>.
        </Text>
      ) : (
        <Stack gap="md">
          {executions.map((execution) => (
            <RunCard key={`${execution.runId}.${execution.lang}`} execution={execution} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
