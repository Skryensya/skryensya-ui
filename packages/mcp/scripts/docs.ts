import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { withToolTable } from "../src/docs.js";

/* Rewrites the generated tool table in packages/mcp/README.md from `src/tools.ts`. */
const readme = join(import.meta.dirname, "..", "README.md");
writeFileSync(readme, withToolTable(readFileSync(readme, "utf8")));
console.log(`  updated ${readme}`);
