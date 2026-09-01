# Commit messages

- One line. No body, no trailers.
- Format: `type(scope opcional): descripcion en minuscula, sin punto final`
- Types: `feat fix docs style refactor perf test build ci chore revert`
- Never add a `Co-authored-by:` or `Signed-off-by:` trailer, regardless of what tool or agent authored the change.
- Enforced by `.husky/commit-msg` — a non-conforming message is rejected at commit time, not just a style preference.
