import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:4173/componentes/badge", { waitUntil: "networkidle" });

const card = await page.locator(".sk-component-preview").first().boundingBox();
await page.locator("[data-sk-menu-trigger]").first().click();
await page.waitForTimeout(200);
const content = await page.locator("[data-sk-menu-content]").first().boundingBox();
const trigger = await page.locator("[data-sk-menu-trigger]").first().boundingBox();

console.log("card:", card, "right edge:", card.x + card.width);
console.log("trigger:", trigger, "right edge:", trigger.x + trigger.width);
console.log("menu content:", content, "right edge:", content.x + content.width);

// browser support check
const supportsAnchor = await page.evaluate(() => CSS.supports("anchor-name: --a"));
console.log("supports native anchor positioning:", supportsAnchor);

await page.screenshot({ path: "/private/tmp/claude-501/-Users-allisonpena-dev-allison-design-system-poc/bde22689-326a-4406-9277-debd4734fab6/scratchpad/menu-pos-check.png", clip: { x: 700, y: 540, width: 500, height: 150 } });

await browser.close();
