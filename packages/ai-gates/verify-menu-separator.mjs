import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:4173/componentes/menu", { waitUntil: "networkidle" });

// The context-menu demo section: find both the vanilla iframe and the react iframe.
const frames = page.frames();
console.log("frame urls:", frames.map((f) => f.url()));

for (const frame of frames) {
  const area = frame.locator("[data-sk-menu-context-trigger], .menu-context-demo__area");
  const count = await area.count();
  if (count === 0) continue;
  console.log("found context area in frame:", frame.url());
  await area.first().click({ button: "right" });
  await frame.page().waitForTimeout(200);
  const separators = await frame.locator(".sk-menu__separator").count();
  console.log("  separators visible:", separators);
  const items = await frame.locator("[data-sk-menu-item], [role=menuitem]").allTextContents();
  console.log("  items:", items);
}

await page.screenshot({ path: "/private/tmp/claude-501/-Users-allisonpena-dev-allison-design-system-poc/7a8fc070-af99-409a-825a-b25cea2d398c/scratchpad/menu-page.png", fullPage: true });
await browser.close();
