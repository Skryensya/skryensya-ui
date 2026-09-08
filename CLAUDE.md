# Commit messages

- Format: `type(scope opcional): descripcion`
- Types: `feat fix docs style refactor perf test build ci chore revert`
- The subject is capped at **100 characters**. Anything longer belongs in the body.
- The description is free text: it may start uppercase and may end with a period.
- A body is allowed for detail, but it must be separated from the subject by a blank line.
- Never add a `Co-authored-by:` or `Signed-off-by:` trailer, regardless of what tool or agent authored the change.
- Enforced by `.husky/commit-msg` - a non-conforming message is rejected at commit time, not just a style preference.
