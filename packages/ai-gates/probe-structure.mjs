import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
await page.goto("http://localhost:4173/componentes/menu", { waitUntil: "networkidle" });
const info = await page.evaluate(() => {
  const previews = Array.from(document.querySelectorAll("[data-sk-component-preview]"));
  return previews.map((p) => ({
    id: p.id,
    label: p.querySelector("[data-sk-component-preview-label], figcaption")?.textContent?.trim().slice(0, 50),
    frames: Array.from(p.querySelectorAll("iframe")).map((f) => ({
      binding: f.dataset.skComponentPreviewBinding,
      title: f.title.slice(0, 60),
    })),
    options: Array.from(p.querySelectorAll("[data-sk-component-preview-binding-option]")).map(
      (o) => o.dataset.value ?? o.textContent.trim(),
    ),
    nested: p.querySelectorAll("[data-sk-component-preview]").length,
  }));
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
