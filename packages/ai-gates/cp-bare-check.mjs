import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:4173/componentes/component-preview", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const section = page.locator("#bare").locator("xpath=following-sibling::*[1]");
await section.scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(300);

await page.screenshot({
  path: "/private/tmp/claude-501/-Users-allisonpena-dev-allison-design-system-poc/96939687-8e51-4570-aa59-c026fe0d2d07/scratchpad/cp-bare-full.png",
  fullPage: true,
});

console.log("page errors:", errors);
await browser.close();
