/*
 * `pnpm audit`, but with a failure criterion you can put in a hook without it becoming unbearable.
 *
 * WHY IT EXISTS, and why running `pnpm audit` by hand is not enough: `minimumReleaseAge` (30 days, in
 * pnpm-workspace.yaml) delays EVERY new version, security patches included. That is only safe if
 * somebody finds out there is a CVE and decides to skip the wait for that package. If nobody looks, the
 * cooldown stops being a quarantine and becomes a silent delay. This script is the half that warns:
 * without it, the other half is a bad idea.
 *
 * THREE DECISIONS THAT MAKE IT LIVABLE IN A HOOK:
 *
 * 1. NO NETWORK, IT PASSES. `pnpm audit` queries the registry. A hook that fails on a plane, on a train
 *    or on café wifi teaches people to use `--no-verify`, and a hook that gets skipped out of habit
 *    protects nothing. A network failure is not a finding: it warns and moves on.
 *
 * 2. EXPLICIT THRESHOLD. It fails on `high` and `critical`; `moderate`/`low` are listed but do not
 *    block. Not because they do not matter: because blocking work over a ReDoS in a dev dependency
 *    leads to the same `--no-verify` as the previous point. Tune it with --level.
 *
 * 3. IT SAYS WHAT TO DO. A gate that only says "no" makes the next step be skipping it. When it finds
 *    something it prints the two real exits: the override, or the cooldown exception when the patch
 *    exists but is newer than the quarantine.
 *
 * Usage:  node scripts/audit-gate.ts [--level=high|moderate|low]
 */

import { spawn } from "node:child_process";

const ORDER = ["low", "moderate", "high", "critical"] as const;
type Severity = (typeof ORDER)[number];

interface Advisory {
  severity: Severity;
  module_name: string;
  title: string;
  vulnerable_versions: string;
  patched_versions: string;
  findings?: { paths?: string[] }[];
}

interface AuditReport {
  metadata: unknown;
  advisories?: Record<string, Advisory>;
}

const levelArg = process.argv.find((a) => a.startsWith("--level="));
const level = (levelArg ? levelArg.slice("--level=".length) : "high") as Severity;
if (!(ORDER as readonly string[]).includes(level)) {
  console.error(`audit-gate: --level tiene que ser uno de: ${ORDER.join(", ")}. Recibido: "${level}".`);
  process.exit(2);
}
const floor = ORDER.indexOf(level);

/*
 * `pnpm audit --json` exits with a non-zero code when it FINDS something, which is its job, so the exit
 * code does not distinguish "there are vulnerabilities" from "I could not query". What does distinguish
 * them is whether what it wrote parses as the expected JSON: that only happens when the query worked.
 */
function runAudit(): Promise<{ ok: true; report: AuditReport } | { ok: false; reason: string }> {
  return new Promise((resolve) => {
    const child = spawn("pnpm", ["audit", "--json"], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (d: Buffer) => (out += d));
    child.stderr.on("data", (d: Buffer) => (err += d));
    child.on("error", () => resolve({ ok: false, reason: "no se pudo ejecutar pnpm" }));
    child.on("close", () => {
      try {
        const parsed = JSON.parse(out) as AuditReport;
        if (!parsed || typeof parsed !== "object" || !parsed.metadata) {
          return resolve({ ok: false, reason: "respuesta inesperada del registry" });
        }
        resolve({ ok: true, report: parsed });
      } catch {
        resolve({ ok: false, reason: (err.trim().split("\n")[0] || "sin respuesta del registry") });
      }
    });
  });
}

const result = await runAudit();

if (!result.ok) {
  // Point 1: no network does not block. Said loudly so it does not pass for healthy.
  console.warn(`audit-gate: no se pudo consultar el registry (${result.reason}).`);
  console.warn("           NO se revisaron las dependencias en esta corrida. Corré `pnpm audit` con red.");
  process.exit(0);
}

const advisories = Object.values(result.report.advisories ?? {});
const blocking = advisories.filter((a) => ORDER.indexOf(a.severity) >= floor);
const below = advisories.filter((a) => ORDER.indexOf(a.severity) < floor);

if (below.length > 0) {
  console.log(`audit-gate: ${below.length} advisory(s) por debajo de "${level}", no bloquean:`);
  for (const a of below) console.log(`  · ${a.severity} ${a.module_name}: ${a.title}`);
}

if (blocking.length === 0) {
  console.log(`audit-gate: sin advisories de nivel "${level}" o mayor.`);
  process.exit(0);
}

console.error(`\naudit-gate: ${blocking.length} advisory(s) de nivel "${level}" o mayor.\n`);
for (const a of blocking) {
  console.error(`  ${a.severity.toUpperCase()}  ${a.module_name}  ${a.vulnerable_versions}`);
  console.error(`    ${a.title}`);
  console.error(`    parcheado en: ${a.patched_versions}`);
  // The path says whether it is a direct dependency (bumped in its package.json) or a transitive one
  // (only reachable with an override), which is the first decision for whoever is going to fix it.
  const path = a.findings?.[0]?.paths?.[0];
  if (path) console.error(`    vía: ${path}`);
  console.error("");
}

// Point 3: the two real exits, not "update your dependencies".
console.error("Cómo se arregla:");
console.error("  · Transitiva (la ruta de arriba pasa por otro paquete): agregá el rango parcheado");
console.error("    a `pnpm.overrides` en el package.json raíz. Usá ^ para quedarte en el major que");
console.error("    el árbol ya usa, y confirmá antes que no haya dos majors del paquete en el lockfile.");
console.error("  · Directa: subí el rango en el package.json que la declara.");
console.error("  · Si el parche existe pero es más nuevo que `minimumReleaseAge` (30 días), la espera");
console.error("    es lo que está bloqueando: agregá ese paquete a `minimumReleaseAgeExclude` en");
console.error("    pnpm-workspace.yaml, con la fecha en que deja de hacer falta.");
process.exit(1);
