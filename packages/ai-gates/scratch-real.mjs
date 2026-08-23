import { chromium } from "@playwright/test";
const OUT = "/private/tmp/claude-501/-Users-allisonpena-dev-allison-design-system-poc/fbd1bf64-a95f-4649-9f29-715c129d53da/scratchpad";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
await page.goto("http://localhost:4173/componentes/button", { waitUntil: "networkidle" });
await page.screenshot({ path: `${OUT}/real-page-wide.png` });

const main = page.locator("main[data-document-layout]").first();
const mainBox = await main.boundingBox();
const toc = page.locator(".sk-toc").first();
const tocBox = await toc.boundingBox();
console.log("main", mainBox);
console.log("toc", tocBox);
console.log("gap main-right to toc-left", tocBox.x - (mainBox.x+mainBox.width));
const viewport = page.viewportSize();
console.log("viewport", viewport);
console.log("right margin from toc to viewport edge", viewport.width - (tocBox.x+tocBox.width));
console.log("left margin from viewport to main", mainBox.x);

await browser.close();
