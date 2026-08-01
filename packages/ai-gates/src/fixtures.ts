import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";

/*
 * Every gate in this suite reads the same static stage: ninety canonical trees, both bindings,
 * rendered once and never mutated by any test that shares it. Re-navigating per test bought
 * isolation nothing here was exercising, and cost a full render of the whole stage per assertion —
 * 360+ full navigations where one per worker says the same thing.
 *
 * `stagePage`/`axePage` are worker-scoped: one context, one navigation, reused by every test the
 * worker runs. Playwright instruments `browser.newContext()` for `trace: "retain-on-failure"`
 * regardless of which fixture calls it, so the config's tracing still lands per test — nothing
 * extra to wire up here.
 *
 * Tests that MUTATE the page (rendered.spec.ts's empty-frame check and its screenshot baseline)
 * stay on Playwright's own per-test `page` — sharing is only sound for pure readers.
 */

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

  stagePage: [
    async ({ stageContext }, use) => {
      const page = await stageContext.newPage();

      const failures: string[] = [];
      page.on("pageerror", (error) => failures.push(error.message));

      await page.goto("/");
      await page.waitForSelector("body[data-ready]");

      const state = await page.getAttribute("body", "data-ready");
      if (state !== "true") {
        const reason = await page.evaluate(() => window.gateError);
        throw new Error(`The stage never became ready: ${reason ?? "unknown"}`);
      }
      if (failures.length > 0) {
        throw new Error(`the page must render both bindings without throwing: ${failures.join("; ")}`);
      }

      await use(page);
    },
    { scope: "worker" },
  ],

  axePage: [
    async ({ stagePage }, use) => {
      const require = createRequire(import.meta.url);
      const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
      await stagePage.addScriptTag({ content: axeSource });
      await use(stagePage);
    },
    { scope: "worker" },
  ],
});

export { expect };
