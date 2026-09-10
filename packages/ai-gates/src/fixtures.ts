import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";

/*
 * Every gate in this suite reads the same static stage: ninety canonical trees, both bindings,
 * rendered once and never mutated by any test that shares it. Re-navigating per test bought
 * isolation nothing here was exercising, and cost a full render of the whole stage per assertion:
 * 360+ full navigations where one per worker says the same thing.
 *
 * `stagePage`/`axePage` are worker-scoped: one context, one navigation, reused by every test the
 * worker runs. Playwright instruments `browser.newContext()` for `trace: "retain-on-failure"`
 * regardless of which fixture calls it, so the config's tracing still lands per test; nothing
 * extra to wire up here.
 *
 * Tests that MUTATE the page (rendered.spec.ts's empty-frame check and its screenshot baseline)
 * stay on Playwright's own per-test `page`: sharing is only sound for pure readers.
 */

/*
 * `waitForStage`: the ONE idiom "navigate to the stage and wait for it" ever needs, shared by every
 * spec that reads `body[data-ready]`, not only the worker-scoped `stagePage` below.
 *
 * PRESENCE IS NOT READY. `harness/main.tsx` sets `data-ready` to `"true"` on success and to
 * `"error"` when the stage throws (`window.gateError` carries why) - the attribute EXISTS in both
 * cases, so `waitForSelector("body[data-ready]")` alone (what `focus-ring.spec.ts` used to do on
 * its own, before this helper) passes on a broken stage exactly as it does on a working one, and
 * whatever ran next failed with a confusing locator timeout instead of the real reason. Waiting for
 * the VALUE (`body[data-ready="true"]`, what `rendered.spec.ts`'s three call sites already got
 * right independently) and checking it explicitly is what turns a broken stage into the one clear
 * error message below, everywhere this helper is used instead of copied.
 */
export async function waitForStage(page: Page): Promise<void> {
  await page.goto("/");
  await page.waitForSelector('body[data-ready="true"], body[data-ready="error"]');

  const state = await page.getAttribute("body", "data-ready");
  if (state !== "true") {
    const reason = await page.evaluate(() => window.gateError);
    throw new Error(`The stage never became ready: ${reason ?? "unknown"}`);
  }
}

/*
 * `readComponentCss`: the other idiom four spec files each wrote out by hand
 * (`readFileSync(fileURLToPath(new URL("../../core/css/components/x.css", import.meta.url)),
 * "utf8")`) to isolate one component's stylesheet in a bare `page.setContent` fixture, CSS custom
 * properties overridden by hand, no live stage. `importMetaUrl` is the CALLER's `import.meta.url`,
 * never this file's: the relative path from `ai-gates/src/` to `core/css/components/` is the same
 * for every caller today, but hard-coding it here instead of asking for it would silently break the
 * day a caller moves, the same way four independent copies of the literal path already could.
 */
export function readComponentCss(name: string, importMetaUrl: string): string {
  return readFileSync(fileURLToPath(new URL(`../../core/css/components/${name}.css`, importMetaUrl)), "utf8");
}

type WorkerFixtures = {
  stageContext: BrowserContext;
  stagePage: Page;
  axePage: Page;
};

export const test = base.extend<{}, WorkerFixtures>({
  stageContext: [
    async ({ browser }, use, workerInfo) => {
      const context = await browser.newContext({
        baseURL: workerInfo.project.use.baseURL,
      });
      await use(context);
      await context.close();
    },
    { scope: "worker" },
  ],

  /*
   * ITS OWN CLOCK. Rendering the stage is 175 canonical trees in both bindings: ~6.5s warm, and the
   * first one after the server starts is the cold module graph (`global-setup.ts` pays that once).
   * A fixture that slow sharing the test budget reports "test timeout" on whichever test the worker
   * happened to start with, which reads as a defect in that component and is really a stopwatch on
   * the harness. Separating them means a slow stage says so as a slow FIXTURE, and the test budget
   * stays a budget for assertions.
   */
  stagePage: [
    async ({ stageContext }, use) => {
      const page = await stageContext.newPage();

      const failures: string[] = [];
      page.on("pageerror", (error) => failures.push(error.message));

      await waitForStage(page);

      if (failures.length > 0) {
        throw new Error(`the page must render both bindings without throwing: ${failures.join("; ")}`);
      }

      await use(page);
    },
    { scope: "worker", timeout: 300_000 },
  ],

  axePage: [
    async ({ stagePage }, use) => {
      const require = createRequire(import.meta.url);
      const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
      await stagePage.addScriptTag({ content: axeSource });
      await use(stagePage);
    },
    /* It builds on `stagePage`, so it waits for that render before it injects anything: the same
     * clock, for the same reason. */
    { scope: "worker", timeout: 300_000 },
  ],
});

export { expect };
