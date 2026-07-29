#!/usr/bin/env node
/*
 * The AI UI platform is under greenfield reconstruction (docs/plataforma-ai-ui.md). Until its gates
 * exist, this package must FAIL rather than pass, so that "no tests yet" can never read as green.
 * Delete this script the moment the real check runs.
 */
const phase = process.env.AI_PHASE ?? "F2 — compilador y emisor";

console.error(
  [
    "",
    "  @skryensya/ai-compiler — NOT BUILT",
    "",
    `  Fase pendiente: ${phase}`,
    "  Plan:           docs/plataforma-ai-ui.md",
    "  Decisiones:     docs/decisiones/0028..0031",
    "",
    "  El sistema v1 fue demolido (tag ai-v1). Este paquete falla a propósito hasta que",
    "  el compilador emita un manifest y los gates G0-G3 corran de verdad.",
    "",
  ].join("\n"),
);

process.exit(1);
