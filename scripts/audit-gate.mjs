/*
 * `pnpm audit`, pero con un criterio de fallo que se puede poner en un hook sin volverse insoportable.
 *
 * POR QUÉ EXISTE, y no alcanza con correr `pnpm audit` a mano: `minimumReleaseAge` (30 días, en
 * pnpm-workspace.yaml) demora TODA versión nueva, parches de seguridad incluidos. Eso es seguro
 * solamente si alguien se entera de que hay un CVE y decide saltear la espera para ese paquete. Si
 * nadie mira, el cooldown deja de ser una cuarentena y pasa a ser un retraso silencioso. Este script
 * es la mitad que avisa: sin él, la otra mitad es una mala idea.
 *
 * TRES DECISIONES QUE LO HACEN VIVIBLE EN UN HOOK:
 *
 * 1. SIN RED, PASA. `pnpm audit` consulta el registry. Un hook que falla en un avión, en un tren o
 *    con el wifi del café enseña a usar `--no-verify`, y un hook que se saltea por costumbre no
 *    protege de nada. Un fallo de red no es un hallazgo: se avisa y se sigue.
 *
 * 2. UMBRAL EXPLÍCITO. Falla en `high` y `critical`; `moderate`/`low` se listan pero no bloquean.
 *    No es que no importen: es que bloquear el trabajo por un ReDoS en una dependencia de desarrollo
 *    lleva al mismo `--no-verify` del punto anterior. Se ajusta con --level.
 *
 * 3. DICE QUÉ HACER. Un gate que sólo dice "no" hace que el siguiente paso sea saltearlo. Cuando
 *    encuentra algo imprime las dos salidas reales: el override, o la excepción al cooldown cuando
 *    el parche existe pero es más nuevo que la cuarentena.
 *
 * Uso:  node scripts/audit-gate.mjs [--level=high|moderate|low]
 */

import { spawn } from "node:child_process";

const ORDER = ["low", "moderate", "high", "critical"];

const levelArg = process.argv.find((a) => a.startsWith("--level="));
const level = levelArg ? levelArg.slice("--level=".length) : "high";
if (!ORDER.includes(level)) {
  console.error(`audit-gate: --level tiene que ser uno de: ${ORDER.join(", ")}. Recibido: "${level}".`);
  process.exit(2);
}
const floor = ORDER.indexOf(level);

/*
 * `pnpm audit --json` sale con código != 0 cuando ENCUENTRA algo, que es su trabajo, así que el
 * código de salida no distingue "hay vulnerabilidades" de "no pude consultar". Lo que sí distingue
 * es si lo que escribió parsea como el JSON esperado: eso sólo pasa cuando la consulta funcionó.
 */
function runAudit() {
  return new Promise((resolve) => {
    const child = spawn("pnpm", ["audit", "--json"], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", () => resolve({ ok: false, reason: "no se pudo ejecutar pnpm" }));
    child.on("close", () => {
      try {
        const parsed = JSON.parse(out);
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
  // Punto 1: sin red no se bloquea. Se dice fuerte para que no pase por sano.
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
  // La ruta dice si es una dependencia directa (se sube en su package.json) o transitiva (sólo se
  // alcanza con un override), que es la primera decisión de quien va a arreglarlo.
  const path = a.findings?.[0]?.paths?.[0];
  if (path) console.error(`    vía: ${path}`);
  console.error("");
}

// Punto 3: las dos salidas reales, no "actualizá las dependencias".
console.error("Cómo se arregla:");
console.error("  · Transitiva (la ruta de arriba pasa por otro paquete): agregá el rango parcheado");
console.error("    a `pnpm.overrides` en el package.json raíz. Usá ^ para quedarte en el major que");
console.error("    el árbol ya usa, y confirmá antes que no haya dos majors del paquete en el lockfile.");
console.error("  · Directa: subí el rango en el package.json que la declara.");
console.error("  · Si el parche existe pero es más nuevo que `minimumReleaseAge` (30 días), la espera");
console.error("    es lo que está bloqueando: agregá ese paquete a `minimumReleaseAgeExclude` en");
console.error("    pnpm-workspace.yaml, con la fecha en que deja de hacer falta.");
process.exit(1);
