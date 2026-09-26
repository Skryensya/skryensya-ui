import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

const VARIANTS = ["solid", "soft", "ghost", "translucent"] as const;
const TONES = ["neutral", "accent", "danger"] as const;

function firstShadowYOffset(shadow: string): number {
  const firstLayer = shadow.match(/\)\s+([^,]+?)(?:,|$)/)?.[1] ?? shadow;
  const lengths = [...firstLayer.matchAll(/-?\d+(?:\.\d+)?px/g)].map((m) => Number.parseFloat(m[0]!));
  if (lengths.length < 2) throw new Error(`Could not parse box-shadow: ${shadow}`);
  return lengths[1]!;
}

function translateY(translate: string): number {
  if (translate === "none") return 0;
  const parts = translate.split(/\s+/);
  return Number.parseFloat(parts[1] ?? parts[0] ?? "0");
}

test("tactile button compresses depth as physical travel increases", async ({ page }) => {
  await waitForStage(page);
  await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "tactile-probe-host";
    host.style.cssText = "position:fixed;inset:0 auto auto 0;padding:40px;display:flex;gap:16px;align-items:start";
    host.innerHTML = `
      <span id="before">before</span>
      <button id="probe" class="sk-button sk-interactive" type="button" data-appearance="tactile" data-variant="solid" data-tone="accent">Continue</button>
      <span id="after">after</span>
    `;
    document.body.append(host);
  });

  const probe = page.locator("#probe");
  const after = page.locator("#after");
  const afterBefore = await after.boundingBox();

  const read = async () => {
    return await probe.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { shadow: cs.boxShadow, translate: cs.translate };
    });
  };

  const rest = await read();
  await probe.hover();
  await page.waitForTimeout(250);
  const hover = await read();
  await page.mouse.down();
  await page.waitForTimeout(80);
  const active = await read();
  const afterActive = await after.boundingBox();
  await page.mouse.up();

  const restDepth = firstShadowYOffset(rest.shadow);
  const hoverDepth = firstShadowYOffset(hover.shadow);
  const activeDepth = firstShadowYOffset(active.shadow);
  const restTravel = translateY(rest.translate);
  const hoverTravel = translateY(hover.translate);
  const activeTravel = translateY(active.translate);

  expect(restDepth).toBeGreaterThan(hoverDepth);
  expect(hoverDepth).toBeGreaterThan(activeDepth);
  expect(restDepth - hoverDepth).toBeLessThan(hoverDepth - activeDepth);
  expect(restTravel).toBeLessThan(hoverTravel);
  expect(hoverTravel).toBeLessThan(activeTravel);
  expect(hoverTravel - restTravel).toBeLessThan(activeTravel - hoverTravel);
  expect(afterActive?.x).toBe(afterBefore?.x);
  expect(afterActive?.y).toBe(afterBefore?.y);
});

test("disabled tactile buttons do not physically respond to hover or active", async ({ page }) => {
  await waitForStage(page);
  await page.evaluate(() => {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;inset:0 auto auto 0;padding:40px";
    host.innerHTML = '<button id="disabled-tactile" class="sk-button sk-interactive" type="button" data-appearance="tactile" disabled>Disabled</button>';
    document.body.append(host);
  });

  const button = page.locator("#disabled-tactile");
  const read = async () => button.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { shadow: cs.boxShadow, translate: cs.translate };
  });

  const rest = await read();
  await button.hover({ force: true });
  await page.waitForTimeout(100);
  const hover = await read();
  await page.mouse.down();
  await page.waitForTimeout(80);
  const active = await read();
  await page.mouse.up();

  expect(hover).toEqual(rest);
  expect(active).toEqual(rest);
});

test("tactile appearance preserves the existing variant and tone matrix", async ({ page }) => {
  await waitForStage(page);

  const rows = await page.evaluate(
    ({ variants, tones }) => {
      const host = document.createElement("div");
      host.style.cssText = "position:fixed;inset:0 auto auto 0;display:flex;gap:8px;flex-wrap:wrap;padding:20px";
      host.innerHTML = [
        '<button class="sk-button sk-interactive" type="button" data-variant="solid" data-tone="accent">default accent</button>',
        '<button class="sk-button sk-interactive" type="button" data-appearance="tactile" data-variant="solid" data-tone="accent">tactile accent</button>',
        ...variants.map((variant) => `<button class="sk-button sk-interactive" type="button" data-appearance="tactile" data-variant="${variant}">${variant}</button>`),
        ...tones.map((tone) => `<button class="sk-button sk-interactive" type="button" data-appearance="tactile" data-tone="${tone}">${tone}</button>`),
        '<button class="sk-button sk-interactive" type="button" data-appearance="tactile" disabled>disabled</button>',
        '<button class="sk-button sk-interactive" type="button" data-appearance="tactile" aria-pressed="true">pressed</button>',
        '<a class="sk-button sk-interactive" data-appearance="tactile" href="/docs">navigation</a>',
      ].join("");
      document.body.append(host);

      const out = [...host.querySelectorAll<HTMLElement>(".sk-button")].map((el) => {
        const cs = getComputedStyle(el);
        return {
          text: el.textContent ?? "",
          appearance: el.getAttribute("data-appearance") ?? "default",
          bg: cs.backgroundColor,
          fg: cs.color,
          shadow: cs.boxShadow,
          pressed: el.getAttribute("aria-pressed"),
          disabled: el.matches(":disabled,[aria-disabled='true']"),
          href: el.getAttribute("href"),
        };
      });
      host.remove();
      return out;
    },
    { variants: VARIANTS, tones: TONES },
  );

  expect(rows.find((r) => r.text === "default accent")?.appearance).toBe("default");
  expect(rows.find((r) => r.text === "tactile accent")?.appearance).toBe("tactile");
  for (const variant of VARIANTS) expect(rows.find((r) => r.text === variant)?.appearance).toBe("tactile");
  for (const tone of TONES) expect(rows.find((r) => r.text === tone)?.appearance).toBe("tactile");
  expect(rows.find((r) => r.text === "disabled")?.disabled).toBe(true);
  expect(rows.find((r) => r.text === "pressed")?.pressed).toBe("true");
  expect(rows.find((r) => r.text === "navigation")?.href).toBe("/docs");
});
