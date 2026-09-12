import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { contractIds, getContract } from "@skryensya/core/registry";
import { surfaceHash } from "./surface.js";

/*
 * `seed`. Writes a changelog file for any published contract that has none.
 *
 * Only ever CREATES. A contract that already has one is left alone, hash and all: rewriting it here
 * would be the tool silently agreeing that a contract changed, which is the one thing the gate
 * exists to refuse. Use it when a new contract joins the catalogue; it is also how the whole
 * catalogue was brought under the gate in the first place.
 */

const root = process.argv[2] ?? process.cwd();
const dir = join(root, "contracts", "changelog");

mkdirSync(dir, { recursive: true });

const seeded: string[] = [];

for (const id of contractIds()) {
  const contract = getContract(id);
  if (!contract) continue;

  const path = join(dir, `${id}.yaml`);
  if (existsSync(path)) continue;

  writeFileSync(
    path,
    `# Qué cambió en ${id}, en las palabras que lee quien lo usa. Sólo se agrega, nunca se reescribe.\n` +
      `#\n` +
      `# \`surface\` es la forma del contrato la última vez que alguien la revisó. Si el compilador dice\n` +
      `# que no coincide, algo de lo que un consumidor depende se movió: escribí la entrada y pegá el\n` +
      `# hash nuevo.\n` +
      `surface: "${surfaceHash(contract)}"\n` +
      `entries: []\n`,
  );
  seeded.push(id);
}

console.log(`  seeded ${seeded.length} changelog(s)${seeded.length ? `: ${seeded.join(", ")}` : ""}`);
