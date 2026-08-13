import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
await page.goto("http://localhost:4173/componentes/menu", { waitUntil: "networkidle" });

const preview = page.locator("[data-sk-component-preview]").last();
await preview.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

for (const binding of ["vanilla", "react"]) {
  if (binding === "react") {
    await preview.locator('[data-sk-component-preview-binding-option][data-value="react"]').click();
    await page.waitForTimeout(600);
  }
  const sel = binding === "vanilla" ? 'iframe[data-sk-component-preview-binding="vanilla"]' : 'iframe[title*="(React)"]';
  const iframeEl = preview.locator(sel).first();
  if ((await iframeEl.count()) === 0) {
    console.log(binding, "-> no iframe");
    continue;
  }
  const fl = preview.frameLocator(sel);
  const handle = await iframeEl.elementHandle();
  const frame = await handle.contentFrame();
  const box = await iframeEl.boundingBox();
  const center = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

  const trigger = fl.locator("button.sk-menu__trigger").first();
  const tp = center(await trigger.boundingBox());
  await page.mouse.click(tp.x, tp.y);
  await page.waitForTimeout(300);
  const share = fl.locator("button.sk-menu__item", { hasText: "Compartir" });
  const sp = center(await share.boundingBox());
  await page.mouse.move(sp.x, sp.y);
  await page.waitForTimeout(500);

  const report = await frame.evaluate(() => {
    const trig = Array.from(document.querySelectorAll("button.sk-menu__item")).find((el) =>
      el.textContent.includes("Compartir"),
    );
    if (!trig) return { error: "no submenu trigger" };
    const chain = [];
    let el = trig;
    while (el && el !== document.documentElement) {
      const cs = getComputedStyle(el);
      chain.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 60),
        pos: cs.position,
        transform: cs.transform,
        filter: cs.filter,
        willChange: cs.willChange,
        contain: cs.contain,
        overflow: cs.overflow,
        zIndex: cs.zIndex,
        inlineStyle: el.getAttribute("style")?.slice(0, 120),
      });
      el = el.parentElement;
    }

    // Probe: does a fixed child of the trigger land where we ask?
    const probe = document.createElement("span");
    probe.style.cssText = "position:fixed;left:10px;top:10px;width:20px;height:20px";
    trig.appendChild(probe);
    const r = probe.getBoundingClientRect();
    probe.remove();

    const sub = document.querySelector('[data-sk-submenu] [data-sk-menu-content]');
    const subPos = sub ? getComputedStyle(sub.parentElement) : null;
    return {
      chain,
      fixedProbe: { x: r.x, y: r.y },
      submenuPositioner: subPos
        ? { pos: subPos.position, z: subPos.zIndex, transform: subPos.transform }
        : null,
      triggerRect: trig.getBoundingClientRect().toJSON(),
      submenuRect: sub ? sub.getBoundingClientRect().toJSON() : null,
    };
  });
  console.log("=====", binding, "=====");
  console.log(JSON.stringify(report, null, 1));
}

await browser.close();
