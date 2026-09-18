/**
 * Surface bump after residual schema pass: eventDetails source/trigger, portals.container,
 * and forward on form peers (2026-09-17).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { getContract, contractIds } from "@skryensya/core/registry";
import { surfaceHash } from "../src/surface.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const cdir = join(root, "contracts/changelog");

const forwardFamilies = new Set([
  "radio-group",
  "number-field",
  "select",
  "file-upload",
  "slider",
]);

const eventFamilies = new Set([
  "accordion",
  "tabs",
  "tooltip",
  "tag",
  "segmented",
  "carousel",
  "select",
  "combobox",
  "color-picker",
  "date-picker",
  "time-field",
  "number-field",
  "file-upload",
  "pagination",
  "table-pager",
  "slider",
  "calendar",
  "menu",
  "megamenu",
  "tile",
  "vaul",
  "sidebar",
  "treegrid",
  "tree-view",
  "content",
  "checkbox",
  "editor",
  "comment-thread",
  "component-preview",
]);

const portalFamilies = new Set([
  "tooltip",
  "combobox",
  "color-picker",
  "date-picker",
  "select",
  "menu",
  "menubar",
  "megamenu",
  "time-field",
]);

function entryYaml(
  kind: "chore" | "feature",
  meta: { esTitle: string; esBody: string; enTitle: string; enBody: string; target?: string },
): string {
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

const eventEntry = entryYaml("feature", {
  esTitle: "eventDetails nombra source y trigger",
  esBody:
    "<code>eventDetails</code> declara <code>source</code> (parte que despacha el CustomEvent) y, cuando es claro, <code>trigger</code> (parte que el usuario activa). Un agente sabe dónde escuchar y qué control provoca el evento.",
  enTitle: "eventDetails names source and trigger",
  enBody:
    "<code>eventDetails</code> declares <code>source</code> (part that dispatches the CustomEvent) and, when clear, <code>trigger</code> (part the user activates). An agent knows where to listen and which control causes the event.",
});

const portalEntry = entryYaml("feature", {
  esTitle: "portals declara container de React",
  esBody:
    "<code>portals: { container: true }</code> documenta el ref React-only que acota el portal (por defecto <code>document.body</code>). El markup sigue anclado en el subárbol.",
  enTitle: "portals declares the React container",
  enBody:
    "<code>portals: { container: true }</code> documents the React-only ref that scopes the portal (default <code>document.body</code>). Markup stays in the subtree.",
});

const forwardMeta: Record<string, { esTitle: string; esBody: string; enTitle: string; enBody: string; target?: string }> = {
  "radio-group": {
    target: "RadioGroup",
    esTitle: "RadioGroup declara forward para id y aria-*",
    esBody:
      "Publica <code>forward</code> con <code>id</code>/<code>aria-*</code> en el host del radiogroup. Un attr fuera de la lista es <code>unknown-attr</code>.",
    enTitle: "RadioGroup declares forward for id and aria-*",
    enBody:
      "Publishes <code>forward</code> with <code>id</code>/<code>aria-*</code> on the radiogroup host. An attr outside the list is <code>unknown-attr</code>.",
  },
  "number-field": {
    target: "NumberField",
    esTitle: "NumberField declara forward para id y aria-*",
    esBody:
      "Publica <code>forward</code> con <code>id</code>/<code>aria-*</code> en el host. Un attr fuera de la lista es <code>unknown-attr</code>.",
    enTitle: "NumberField declares forward for id and aria-*",
    enBody:
      "Publishes <code>forward</code> with <code>id</code>/<code>aria-*</code> on the host. An attr outside the list is <code>unknown-attr</code>.",
  },
  select: {
    target: "Select",
    esTitle: "Select declara forward para id y aria-*",
    esBody:
      "La firma enhanced publica <code>forward</code> con <code>id</code>/<code>aria-*</code> (además de Select.native). Un attr fuera de la lista es <code>unknown-attr</code>.",
    enTitle: "Select declares forward for id and aria-*",
    enBody:
      "The enhanced signature publishes <code>forward</code> with <code>id</code>/<code>aria-*</code> (alongside Select.native). An attr outside the list is <code>unknown-attr</code>.",
  },
  "file-upload": {
    target: "FileUpload",
    esTitle: "FileUpload declara forward para id y aria-*",
    esBody:
      "Publica <code>forward</code> con <code>id</code>/<code>aria-*</code> en el host. Un attr fuera de la lista es <code>unknown-attr</code>.",
    enTitle: "FileUpload declares forward for id and aria-*",
    enBody:
      "Publishes <code>forward</code> with <code>id</code>/<code>aria-*</code> on the host. An attr outside the list is <code>unknown-attr</code>.",
  },
  slider: {
    esTitle: "Slider declara forward para id y aria-*",
    esBody:
      "Slider y SliderRange publican <code>forward</code> con <code>id</code>/<code>aria-*</code>. Un attr fuera de la lista es <code>unknown-attr</code>.",
    enTitle: "Slider declares forward for id and aria-*",
    enBody:
      "Slider and SliderRange publish <code>forward</code> with <code>id</code>/<code>aria-*</code>. An attr outside the list is <code>unknown-attr</code>.",
  },
};

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
  if (forwardFamilies.has(id) && forwardMeta[id]) {
    block += entryYaml("feature", forwardMeta[id]!);
  }
  if (portalFamilies.has(id)) block += portalEntry;
  if (eventFamilies.has(id)) block += eventEntry;

  if (!block) {
    /* Hash moved for another reason - still bump surface with a thin chore. */
    block += entryYaml("chore", {
      esTitle: "Hash de superficie tras residual schema",
      esBody: "El hash de superficie se actualiza tras el pase de residual schema (eventDetails / portals / forward).",
      enTitle: "Surface hash after residual schema",
      enBody: "Surface hash updates after the residual schema pass (eventDetails / portals / forward).",
    });
  }

  next = next.slice(0, entriesIdx + "\nentries:\n".length) + block + next.slice(entriesIdx + "\nentries:\n".length);
  writeFileSync(path, next);
  updated++;
  console.log(`  ${id} → ${live}`);
}

console.log(`updated ${updated} changelog(s)`);
