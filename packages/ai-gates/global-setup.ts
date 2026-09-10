import { chromium, type FullConfig } from "@playwright/test";
import { waitForStage } from "./src/fixtures.js";

/*
 * WARM THE STAGE ONCE, before any worker starts its clock.
 *
 * The harness is a Vite dev server, so the first request for the stage is the one that transforms
 * the whole module graph: every contract, both bindings, every component and pattern stylesheet the
 * glob in `harness/main.tsx` pulls in. That first navigation is minutes of compiling; every one
 * after it renders in about 6.5s, because the transforms are cached in the server already running.
 *
 * Without this, four workers each paid a share of that cold cost inside their own first test, which
 * is how a green suite reported twenty failures in `accessibility.spec.ts` (the alphabetically first
 * cases: `button/action` through `tag/link`) that had nothing to do with accessibility, and hid the
 * cases that were actually being checked behind a wall of timeouts. Paying it here means it lands in
 * setup, where being slow is not a failure, and no test's budget is a stopwatch on the compiler.
 *
 * The generous local timeouts are the point of the file: this call is ALLOWED to take minutes.
 */
export default async function warmTheStage(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL;
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ baseURL });
    page.setDefaultNavigationTimeout(600_000);
    page.setDefaultTimeout(600_000);
    await waitForStage(page);
  } finally {
    await browser.close();
  }
}
