# @skryensya/mcp

An MCP (Model Context Protocol) server that lets an AI **discover, compose and
validate** `@skryensya/ui` components by intent. It reads the same guides a
human author would — `docs/ai/schemas/*.json` and the algorithm documented in
`docs/ai/README.md` — and exposes them as three tools. It never authors a new
component or exposes implementation detail (hooks, machines, CSS internals):
that stays out of scope, same as the guides it wraps.

## Tools

| Tool | Purpose | Cost |
|---|---|---|
| `find_component` | Ranks surfaces against a free-text intent ("navigate to another page"); omit `intent` to list the full catalog instead. | Cheap — index only, no props/examples/rules. |
| `get_component` | Full composition guide for one `id`: surfaces, props, meanings, rules, examples. | One schema file. |
| `check_usage` | Validates a `usages` array against each surface's `requires`/`forbids`/prop enums, one call for the whole page. | One schema file per usage, no I/O beyond that. |

This mirrors the discovery pattern recommended for MCP servers: a cheap
listing/search step, then a single detailed fetch for the one thing you
picked — rather than dumping the whole catalog into context on every call.
`find_component` alone covers both the search AND the full-listing case (an
empty `intent` is not a different tool, it's the same cheap index with no
ranking applied), which is why there are three tools here, not four.

Typical flow for "I need a destructive action":

1. `find_component({ intent: "destructive action" })` → `{ id: "button", surface: "Button" }`
2. `get_component({ id: "button" })` → full guide, including the `variant: "danger"` meaning and a worked example.
3. `check_usage({ usages: [{ id: "button", surface: "Button", props: { variant: "danger", disabled: true } }] })` before writing an unusual combination — catching a `forbids` violation here is cheaper than a review round-trip. If the page composes several surfaces, put every one of them in the same `usages` array in one call, not one call each — see "Why check_usage batches" below.
4. Import exactly what the guide says (`@skryensya/react/button`, `@skryensya/core/components/button.css`) — nothing invented.

`check_usage` only enforces what the schema itself declares (`requires`,
`forbids`, and any prop with a listed enum) — it does not invent rules the
guide doesn't state. A clean result is not a full correctness guarantee
beyond that: read `rules` in `get_component`'s output for anything not
structurally checkable (e.g. "an icon-only surface needs an accessible
name").

### Why `check_usage` batches

It used to take one `{id, surface, props}` per call. Composing a real page
touching 6+ components meant 6+ calls, and in practice the ones that "felt
obviously fine" got skipped under time pressure — the exact combinations most
likely to hide a real `forbids` violation. `check_usage` now takes a `usages`
array so validating everything a page composes costs the same one call as
validating half of it, removing the incentive to skip any.

### `find_component` is keyword overlap, not semantic search

Word choice in `intent` matters more than it would with an embedding search.
Prefer words close to the component's own name or its short `use` string
("navigation list", "popover") over generic phrasing ("a widget for links at
the top"). A miss is not proof the component doesn't exist — call
`find_component` again with no `intent` to read the full catalog rather than
guessing an id from memory. And the ranker can put a related-but-wrong
surface at #1 when it shares more literal words with the query; the right
match is often still in the top 5, so skim past #1 if it doesn't quite fit.
This same guidance ships as the server's MCP `instructions`, sent to the
client at `initialize`, so a client that surfaces that field gets it without
reading this file.

### These three tools cover component composition, not the whole app

`find_component`/`get_component`/`check_usage` are scoped to one thing: which
surface to use and whether its props are shaped correctly. Two real failure
modes sit entirely outside that scope, and both ship as guidance in
`instructions` because they have no natural home in a per-component tool:

- **Root contract** — what a NEW consuming app must set up once, before
  composing any component, that no single component's guide would ever
  mention: importing `@skryensya/core/tokens.scss`, and knowing that Core
  names a default type-face (`--scale-font-family-sans: Inter, ...`) but
  ships no font file — the same contract as a brand ramp (ADR-23): Core
  exposes the tier-1 hook, a consumer supplies the asset from their own
  unlayered stylesheet if they want it rendered, and the system-ui fallback
  is a legitimate choice, not a bug. This explicitly rules out silently
  reaching for a Google Fonts (or any) CDN link as a shortcut — that's a real
  dependency and a real request, not this server's call to make. A
  color-mode flash-prevention script is the third item, and only applies
  once the app persists a mode preference (e.g. composes a `ThemeToggle`).
- **Rendered result** — `check_usage` proves a usage matches its schema; it
  has no visibility into whether the page that usage produces actually looks
  right. A component can pass every check and still render broken — an
  `ImageFrame` with neither `src` nor `children` is schema-valid and renders
  as an empty box. Nothing in this server catches that; only actually
  rendering the page and looking at it does.

Neither of these got a new tool. A tool here would need the design-system
server to know things it structurally cannot — which font a consumer wants,
whether their app persists a preference, what their dev server's URL even
is — none of which lives in `docs/ai/schemas/`. The server has no runtime
visibility into any consuming app; documenting the responsibility in
`instructions` is the honest fit, not inventing a tool that can't actually
act on it.

## Develop

```bash
pnpm --filter @skryensya/mcp build   # tsc -> dist/
pnpm --filter @skryensya/mcp check   # tsc --noEmit + vitest
pnpm --filter @skryensya/mcp dev     # tsx watch, for local iteration
pnpm --filter @skryensya/mcp inspector  # MCP Inspector UI against dist/index.js
```

The catalog is read live from `docs/ai/schemas/` at request time (no build
step required to pick up a new/edited schema) — only `dist/index.js` needs a
rebuild when the server's own code changes.

## Use from an MCP client (stdio)

Build once, then point any stdio-based MCP client at the compiled entry
point. For Claude Code / Claude Desktop, add to the client's MCP config:

```json
{
  "mcpServers": {
    "skryensya-ui": {
      "command": "node",
      "args": ["/absolute/path/to/design-system-poc/packages/mcp/dist/index.js"]
    }
  }
}
```

Or, once published, via the bin entry:

```json
{
  "mcpServers": {
    "skryensya-ui": {
      "command": "npx",
      "args": ["-y", "@skryensya/mcp"]
    }
  }
}
```

## What's out of scope

Same boundary as `docs/ai/README.md`: no hooks, selectors, parts, machine
states, native prop enumeration, test/invariant detail, or historical
rationale. `get_component` returns exactly what's authored in the schema
file — if something is missing there, it's missing here too; fix the schema,
not this server.
