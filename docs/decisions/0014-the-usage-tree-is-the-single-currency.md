---
num: 14
title: The usage tree is the single currency
short: "One tree, four uses"
summary: >-
  An example was written three times (the JSON schema's snippet, the docs page's `html` string and the
  component in `react-demos/`) and none of the three was the one the agent ended up writing. This decision
  defines the **usage tree**: a composition written as data (signature, options, children) authored once
  and rendered by both bindings. The same tree is the example, the snippet, the plan the agent proposes
  and the case the gates run; and `validate_ui` returns the emitted code when the tree is valid, so the
  agent never writes markup by hand.
---

## The problem

`check_usage` validated `{id, surface, props}` and returned "valid". Then the agent wrote the JSX, which
is a different artifact, and nobody compared one against the other. The hole was not validation: it was
that what was validated and what was written were different things.

At the same time, every example existed in triplicate:

- the snippet in `docs/ai/schemas/*.json`, a string that compiled nothing;
- the `html` string in `apps/docs/src/pages/componentes/*.astro`, written by hand;
- the component in `apps/docs/src/components/react-demos/*`, written by hand again.

Three authorings of the same example, with no mechanism forcing them to agree. A `variant` that gets
renamed breaks them one at a time and silently.

## The decision

**An example is a usage tree**: `{contract, signature, options, children}`, serializable, authored once.
It is written in **signatures**, not in parts, because choosing meaning is the author's job and expanding
it into structure is the part template's job (decision 28).

Four things come out of that single tree that used to be four artifacts:

| Consumer | What it gets |
|---|---|
| The vanilla binding | The emitted markup: template parts, options written as attributes |
| The React binding | The elements, with the options as props |
| The docs site | Both live stages and the code shown, which **is** the emitted code |
| The gates | The case that is rendered twice and compared (G2) |

**The emitter lives in the compiler, never in the vanilla layer.** An enhancer does not render markup or
write a class (that is what an enhancer *is* in this system), so emitting HTML from a tree is build-time
codegen. The consumer still owns the markup they write, exactly as when they copy it from the
documentation.

**`validate_ui` returns the emitted code when the tree passes the constraints.** That is not a
convenience: it is what closes the hole. If the agent does not type the markup, it cannot write something
different from what it validated. The response carries both bindings; the agent pastes the one matching
its app.

## What was rejected

**A tree of parts**, faithful to the markup level by level. It would have made all expansion unnecessary,
but it would force the agent to author `<li class="sk-nav-list__item">` to get a `<NavListLink>`, which
is the opposite of how the kit is used.

**A fourth tool, `emit_code(tree, binding)`.** More honest in its name and more readable in logs, but it
adds a tool per workflow need. Emitting is the natural result of validating and travels in the same
response.

**Pre-emitted snippets per signature in `get_artifact`.** Cheap and cacheable, but they cover no new
composition, which is exactly where the agent gets it wrong.

**An MCP that only returns contracts and verdicts.** It leaves the model free to compose idiomatically,
at the price of what is validated and what is written being two artifacts again, with nobody guaranteeing
they match. That was the previous state.

## Cost

Every signature needs a correct part template before its emitter is worth anything, and compositions with
slots are where that gets hard. An example the emitter cannot produce is a signal, not an exception: it
means the contract does not describe the structure yet, and that signature is not published until it
does.
