import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });

// Dialog: modal elevation.
await page.goto("http://localhost:4173/componentes/dialog", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const dialogPreview = page.locator(".sk-component-preview").first();
await dialogPreview.scrollIntoViewIfNeeded();
const dialogFrame = await dialogPreview.locator("iframe.sk-component-preview__stage:not([hidden])").first().elementHandle();
const dFrame = await dialogFrame.contentFrame();
const trigger = dFrame.locator("button").first();
await trigger.click();
await page.waitForTimeout(500);
await page.screenshot({
  path: "/private/tmp/claude-501/-Users-allisonpena-dev-allison-design-system-poc/369a3fb3-7a35-43f5-8176-e9ed4380caaa/scratchpad/spot-dialog.png",
});

// Box: raised surface.
await page.goto("http://localhost:4173/componentes/box", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const boxPreview = page.locator(".sk-component-preview").first();
await boxPreview.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await boxPreview.screenshot({
  path: "/private/tmp/claude-501/-Users-allisonpena-dev-allison-design-system-poc/369a3fb3-7a35-43f5-8176-e9ed4380caaa/scratchpad/spot-box.png",
});

await browser.close();
