/*
 * Live React demo for /components/process-list. Self-contained island (no function props crossing
 * the Astro boundary), mounted directly from the page with `<ProcessListDemo client:load />`.
 */
import { Badge } from "@skryensya/react/badge";
import { Inline, Stack } from "@skryensya/react/layout";
import { Link } from "@skryensya/react/link";
import { ProcessList, ProcessListItem } from "@skryensya/react/process-list";
import { Text } from "@skryensya/react/text";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const ProcessListDemo = framed(function ProcessListDemo() {
  return (
    <ProcessList aria-label="Install @skryensya">
      <ProcessListItem title="Install the library">
        <Stack gap="sm">
          <Text tone="secondary">Add the React core and binding to the project.</Text>
          {/*
            * CLASS ONLY, no `data-sk-code-preview`. That attribute is the VANILLA enhancer's
            * selector, and `Base.astro` runs `initComponents()` over the whole document — so
            * authoring it here invites the enhancer inside a subtree React owns, where it mutates
            * DOM that React is about to hydrate. The result was a hydration mismatch (React #418,
            * "HTML") that self-healed, so the page looked fine while re-rendering the island on
            * every load. The styling never needed it: `sk-code-preview` is the class the CSS keys on.
            */}
          <div className="sk-code-preview">
            <div className="sk-code-preview__label">
              <span className="sk-code-preview__meta">
                <span>terminal</span>
              </span>
            </div>
            <div className="sk-code-preview__preview">
              <div className="sk-code-preview__viewport">
                {/*
                  * ONE string child, not text + {"\n"} + text. Three children make React emit
                  * `<!-- -->` separators between them, and inside `<pre>` — where the parser keeps
                  * whitespace and treats a newline specially — server and client stopped agreeing on
                  * the resulting node list, which is the hydration mismatch (React #418, "HTML")
                  * this page used to log. A single literal has no boundaries to disagree about.
                  */}
                <pre>
                  <code>{"pnpm add @skryensya/core \\\n  @skryensya/react"}</code>
                </pre>
              </div>
            </div>
          </div>
        </Stack>
      </ProcessListItem>
      <ProcessListItem title="Importa ProcessList">
        <Stack gap="sm">
          <Text tone="secondary">Load the CSS and then import the components.</Text>
          <ul>
            <li>
              <code>@import "@skryensya/core/components/code-preview.css";</code>
            </li>
            <li>
              <code>@import "@skryensya/core/components/process-list.css";</code>
            </li>
            <li>
              <code>import {"{"} ProcessList, ProcessListItem {"}"} from "@skryensya/react/process-list";</code>
            </li>
          </ul>
        </Stack>
      </ProcessListItem>
      <ProcessListItem title="Render instructions">
        <Stack gap="sm">
          <Text tone="secondary">The counter retains numbering without additional state.</Text>
          <code>{"<ProcessList>…</ProcessList>"}</code>
          <Inline gap="sm">
            <Badge tone="success">Installation lista</Badge>
            <Link href="/en/components/process-list">Open documentation</Link>
          </Inline>
        </Stack>
      </ProcessListItem>
    </ProcessList>
  );
});
