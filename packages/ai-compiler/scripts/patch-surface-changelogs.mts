/**
 * Coordinated surface bump after public-surface hash refinement (2026-09-17).
 *
 * Rewrites `surface:` on every changelog whose live hash moved, and prepends a bilingual chore
 * (or feature, for Tag/Checkbox/Switch forward) explaining why. Does not invent contract edits.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { getContract, contractIds } from "@skryensya/core/registry";
import { surfaceHash } from "../src/surface.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const cdir = join(root, "contracts/changelog");

const forwardFamilies = new Set(["tag", "checkbox", "switch"]);

const choreEs = {
  title: "El hash de superficie mide la promesa pública",
  body:
    "El hash de superficie ahora proyecta opciones por lista blanca (sin <code>machineInput</code>), incluye <code>eventDetails</code>, y sigue excluyendo la plantilla (<code>also</code>, attrs efímeros). Este contrato no cambió su API; sólo cambió lo que el hash mide.",
};
const choreEn = {
  title: "Surface hash measures the public promise",
  body:
    "The surface hash now projects options through a whitelist (no <code>machineInput</code>), includes <code>eventDetails</code>, and still excludes the template (<code>also</code>, ephemeral attrs). This contract's API did not change; only what the hash measures did.",
};

const forwardMeta: Record<string, { esTitle: string; esBody: string; enTitle: string; enBody: string; target?: string }> = {
  tag: {
    esTitle: "Tag declara forward para id, enlace y aria-*",
    esBody:
      "<code>Tag</code> publica <code>id</code>/<code>aria-*</code>; <code>Tag.link</code> añade <code>target</code>/<code>rel</code>/<code>download</code>. Un attr fuera de la lista es <code>unknown-attr</code>.",
    enTitle: "Tag declares forward for id, link, and aria-*",
    enBody:
      "<code>Tag</code> publishes <code>id</code>/<code>aria-*</code>; <code>Tag.link</code> adds <code>target</code>/<code>rel</code>/<code>download</code>. An attr outside the list is <code>unknown-attr</code>.",
  },
  checkbox: {
    target: "Checkbox",
    esTitle: "Checkbox declara forward para form e id",
    esBody:
      "Publica <code>forward</code> con <code>id</code>/<code>form</code>/<code>aria-*</code> en el host nativo. Un attr fuera de la lista es <code>unknown-attr</code>.",
    enTitle: "Checkbox declares forward for form and id",
    enBody:
      "Publishes <code>forward</code> with <code>id</code>/<code>form</code>/<code>aria-*</code> on the native host. An attr outside the list is <code>unknown-attr</code>.",
  },
  switch: {
    target: "Switch",
    esTitle: "Switch declara forward para form e id",
    esBody:
      "Publica <code>forward</code> con <code>id</code>/<code>form</code>/<code>aria-*</code> en el host nativo. Un attr fuera de la lista es <code>unknown-attr</code>.",
    enTitle: "Switch declares forward for form and id",
    enBody:
      "Publishes <code>forward</code> with <code>id</code>/<code>form</code>/<code>aria-*</code> on the native host. An attr outside the list is <code>unknown-attr</code>.",
  },
};

function entryYaml(kind: "chore" | "feature", meta: {
  esTitle: string;
  esBody: string;
  enTitle: string;
  enBody: string;
  target?: string;
}): string {
  const target = meta.target ? `    target: ${meta.target}\n` : "";
  return (
    `  - date: 2026-09-17\n` +
    `    kind: ${kind}\n` +
    target +
    `    es:\n` +
    `      title: ${meta.esTitle}\n` +
    `      body: >-\n` +
    `        ${meta.esBody}\n` +
    `    en:\n` +
    `      title: ${meta.enTitle}\n` +
    `      body: >-\n` +
    `        ${meta.enBody}\n`
  );
}

let updated = 0;
for (const id of contractIds()) {
  const contract = getContract(id);
  if (!contract) continue;
  const path = join(cdir, `${id}.yaml`);
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^surface:\s*"?([a-f0-9]+)"?\s*$/m);
  if (!match) throw new Error(`${id}: no surface line`);
  const live = surfaceHash(contract);
  if (match[1] === live) continue;

  let next = raw.replace(/^surface:\s*"?[a-f0-9]+"?\s*$/m, `surface: "${live}"`);
  const entriesIdx = next.indexOf("\nentries:\n");
  if (entriesIdx < 0) throw new Error(`${id}: no entries`);

  let block = "";
  if (forwardFamilies.has(id)) {
    const meta = forwardMeta[id]!;
    block += entryYaml("feature", meta);
  }
  block += entryYaml("chore", {
    esTitle: choreEs.title,
    esBody: choreEs.body,
    enTitle: choreEn.title,
    enBody: choreEn.body,
  });

  next = next.slice(0, entriesIdx + "\nentries:\n".length) + block + next.slice(entriesIdx + "\nentries:\n".length);
  writeFileSync(path, next);
  updated++;
  console.log(`  ${id} → ${live}`);
}

console.log(`updated ${updated} changelog(s)`);
