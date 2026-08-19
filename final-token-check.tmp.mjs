import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
await page.goto("http://localhost:4173/componentes/time-field", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const frames = page.frames().filter((f) => f.url() === "about:srcdoc");

const customToken = await frames[0].evaluate(() => {
  const btn = document.querySelector(".sk-time-field__options-trigger");
  return getComputedStyle(btn).getPropertyValue("--sk-button-fg");
});
console.log("custom trigger --sk-button-fg:", customToken.trim());

const nativeToken = await frames[4].evaluate(() => {
  const input = document.querySelector('input[type="time"]');
  return getComputedStyle(input).getPropertyValue("--color-text-accent");
});
console.log("native input --color-text-accent:", nativeToken.trim());
console.log("MATCH:", customToken.trim() === nativeToken.trim());

await browser.close();
