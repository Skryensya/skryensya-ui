import { Badge } from "@skryensya/react/badge";
import { List, ListItemLink } from "@skryensya/react/list";
import { loadCaseGroups } from "../data";
import { casePath } from "../router";

/*
 * `List` + `ListItemLink`, validated via `validate_ui` before being written here (a row that
 * navigates, title + description + trailing  -  exactly `ListItemLink`'s own `useWhen`: "la fila
 * entera navega, y el objetivo de foco y de clic es la fila"). ONE ROW PER PROMPT  -  not per run: the
 * stacked gallery of every render (`CaseDetailPage`) is a different page, reached by clicking in.
 * Splitting the two apart is deliberate: a reviewer scanning "what prompts exist and how many times
 * has each been tried" does not want every one of a case's renders paged in at once, and a reviewer
 * comparing one case's renders side by side does not want the other twelve cases' cards between
 * scrolls.
 */
export function CaseListPage() {
  const groups = loadCaseGroups();

  return (
    <List>
      {groups.map((group) => (
        <ListItemLink
          key={group.caseId}
          href={casePath(group.caseId)}
          title={group.caseId}
          description={group.promptEs}
          trailing={
            group.executions.length > 0 ? (
              <Badge tone="neutral">{group.executions.length} runs</Badge>
            ) : (
              <Badge tone="warning">no runs yet</Badge>
            )
          }
        />
      ))}
    </List>
  );
}
