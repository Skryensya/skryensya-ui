import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
await page.goto("http://localhost:4173/componentes/menu", { waitUntil: "networkidle" });

const preview = page.locator("[data-sk-component-preview]").last();
await preview.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

const iframeEl = preview.locator('iframe[data-sk-component-preview-binding="vanilla"]').first();
const fl = preview.frameLocator('iframe[data-sk-component-preview-binding="vanilla"]');
const frameBox = await iframeEl.boundingBox();

// Real Frame object (for evaluate) — match by element handle.
const handle = await iframeEl.elementHandle();
const frame = await handle.contentFrame();

const center = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

const trigger = fl.locator("button.sk-menu__trigger").first();
const tp = center(await trigger.boundingBox());
await page.mouse.move(tp.x, tp.y);
await page.mouse.click(tp.x, tp.y);
await page.waitForTimeout(400);

const dump = async (tag) => {
  const info = await frame.evaluate(() => {
    const badge = document.querySelector(".sk-menu__intent-badge");
    const poly = document.querySelector(".sk-menu__intent-polygon");
    const contents = Array.from(document.querySelectorAll("[data-sk-menu-content]")).map((el) => ({
      st: el.dataset.state,
    }));
    const highlighted = Array.from(document.querySelectorAll("[data-highlighted]")).map((el) =>
      el.textContent?.trim(),
    );
    return {
      badge: badge ? { text: badge.textContent, locked: badge.dataset.locked } : null,
      poly: poly ? poly.getAttribute("points") : null,
      contents,
      highlighted,
    };
  });
  console.log(tag, JSON.stringify(info));
};

await dump("after open ");

const share = fl.locator("button.sk-menu__item", { hasText: "Compartir" });
const sb = await share.boundingBox();
const sp = center(sb);
await page.mouse.move(sp.x, sp.y);
await page.waitForTimeout(500);
await dump("hover Compartir ");

const subBox = await frame.evaluate(() => {
  const el = document.querySelector("[data-sk-submenu] [data-sk-menu-content]");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});
console.log("submenu content box (frame coords)", subBox, "share box(page)", sb, "frameBox", frameBox);

if (!subBox) {
  console.log("NO SUBMENU");
  await browser.close();
  process.exit(0);
}

// frame coords -> page coords
const target = {
  x: frameBox.x + subBox.x + subBox.width * 0.6,
  y: frameBox.y + subBox.y + subBox.height - 8,
};
console.log("target (page)", target, "from", sp);

const steps = 14;
for (let i = 1; i <= steps; i++) {
  const x = sp.x + ((target.x - sp.x) * i) / steps;
  const y = sp.y + ((target.y - sp.y) * i) / steps;
  await page.mouse.move(x, y);
  await page.waitForTimeout(70);
  await dump(`  step ${String(i).padStart(2)} (${Math.round(x)},${Math.round(y)})`);
}

await page.screenshot({
  path: "/private/tmp/claude-501/-Users-allisonpena-dev-allison-design-system-poc/551e843f-ac9e-4813-90db-9925059f5d78/scratchpad/safety-walk.png",
});

await browser.close();
