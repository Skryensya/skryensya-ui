import { test, devices } from "@playwright/test";

test.use({ ...devices["Pixel 7"] });

test("live site: mobile collapse behaves", async ({ page, context }) => {
  await page.goto("/componentes/switch/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  const info1 = await page.evaluate(() => ({
    support: CSS.supports("(animation-timeline: scroll())"),
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    jsFlag: document.documentElement.hasAttribute("data-sk-fx-collapse-js"),
    heroExists: !!document.querySelector(".sk-fx-collapse-header"),
    shellExists: !!document.querySelector(".docs-component-shell"),
    position: document.querySelector(".docs-component-hero") ? getComputedStyle(document.querySelector(".docs-component-hero")!).position : null,
    titleFontSize: document.querySelector(".docs-component-hero h1") ? getComputedStyle(document.querySelector(".docs-component-hero h1")!).fontSize : null,
  }));
  console.log("INITIAL STATE", JSON.stringify(info1, null, 2));

  const client = await context.newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 200, y: 600 }] });
  for (const y of [560, 500, 420, 340, 260, 180, 100]) {
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 200, y }] });
    await page.waitForTimeout(40);
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(400);

  const info2 = await page.evaluate(() => ({
    scrollY: window.scrollY,
    jsFlag: document.documentElement.hasAttribute("data-sk-fx-collapse-js"),
    progress: document.querySelector(".docs-component-hero") ? getComputedStyle(document.querySelector(".docs-component-hero")!).getPropertyValue("--sk-fx-collapse-progress") : null,
    titleFontSize: document.querySelector(".docs-component-hero h1") ? getComputedStyle(document.querySelector(".docs-component-hero h1")!).fontSize : null,
  }));
  console.log("AFTER SCROLL", JSON.stringify(info2, null, 2));

  await page.screenshot({ path: "probe/live-collapsed.png" });
});
