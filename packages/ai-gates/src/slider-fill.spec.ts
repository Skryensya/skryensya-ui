import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const sliderCss = readFileSync(
  fileURLToPath(new URL("../../core/css/components/slider.css", import.meta.url)),
  "utf8",
);

const TRACK_WIDTH = 300;
const THUMB_HIT = 32;
const KNOB_SIZE = 16;
const PAD = 24;
const PROBE_GAP = 4;

const TRACK_COLOR = { css: "#000000", rgb: [0, 0, 0] };
const FILL_COLOR = { css: "#009933", rgb: [0, 153, 51] };
const KNOB_COLOR = { css: "#ff00ff", rgb: [255, 0, 255] };
const RING_COLOR = { css: "#ffffff", rgb: [255, 255, 255] };

function fixtureHtml(value: number): string {
  return `<!doctype html><html><head><style>
    :root {
      --size-control-sm: ${THUMB_HIT}px;
      --size-icon-sm: ${KNOB_SIZE}px;
      --space-inset-xs: 4px;
      --focus-ring-color: #0066ff;
      --focus-ring-width: 2px;
      --radius-pill: 999px;
    }
    ${sliderCss}
    html, body { margin: 0; background: #ffffff; }
    body { padding: ${PAD}px; }
    .sk-slider {
      display: block;
      inline-size: ${TRACK_WIDTH}px;
      --sk-slider-track: ${TRACK_COLOR.css};
      --sk-slider-fill-color: ${FILL_COLOR.css};
      --sk-slider-thumb: ${KNOB_COLOR.css};
      --color-border-default: ${KNOB_COLOR.css};
      --sk-slider-thumb-ring: ${RING_COLOR.css};
    }
  </style></head><body>
    <div class="sk-slider" data-sk-slider style="--slider-thumb-offset-0: ${value}%; --slider-thumb-transform: translateX(-50%); --slider-range-start: 0%; --slider-range-end: ${100 - value}%">
      <div class="sk-slider__control" data-sk-slider-control>
        <div class="sk-slider__track" data-sk-slider-track>
          <div class="sk-slider__range" data-sk-slider-range-part style="left: var(--slider-range-start); right: var(--slider-range-end)"></div>
        </div>
        <div class="sk-slider__thumb" data-sk-slider-thumb tabindex="0" style="inset-inline-start: var(--slider-thumb-offset-0); transform: var(--slider-thumb-transform)"></div>
      </div>
    </div>
  </body></html>`;
}

async function centerRow(page: Page): Promise<Array<[number, number, number]>> {
  const input = page.locator(".sk-slider");
  const box = (await input.boundingBox())!;
  const clip = { x: box.x - PAD, y: box.y - PAD, width: box.width + PAD * 2, height: box.height + PAD * 2 };
  const png = (await page.screenshot({ clip })).toString("base64");

  return page.evaluate(
    async ({ png, width, height }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${png}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, Math.round(height / 2), width, 1);
      const row: Array<[number, number, number]> = [];
      for (let x = 0; x < width; x++) row.push([data[x * 4]!, data[x * 4 + 1]!, data[x * 4 + 2]!]);
      return row;
    },
    { png, width: Math.round(clip.width), height: Math.round(clip.height) },
  );
}

const isColor = (px: [number, number, number], target: readonly number[]) =>
  Math.abs(px[0] - target[0]!) < 24 && Math.abs(px[1] - target[1]!) < 24 && Math.abs(px[2] - target[2]!) < 24;

test("the track, fill and thumb are real inspectable elements", async ({ page }) => {
  await page.setContent(fixtureHtml(60));
  await expect(page.locator(".sk-slider__track")).toHaveCount(1);
  await expect(page.locator(".sk-slider__range")).toHaveCount(1);
  await expect(page.locator(".sk-slider__thumb")).toHaveCount(1);
});

test("the unselected track has contrast in dark mode without turning white", async ({ page }) => {
  await page.setContent(`<!doctype html><html><head><style>
    :root {
      color-scheme: dark;
      --size-control-sm: ${THUMB_HIT}px;
      --size-icon-sm: ${KNOB_SIZE}px;
      --space-inset-xs: 4px;
      --radius-pill: 999px;
      --color-bg-surface: #000000;
      --color-bg-surface-sunken: #000000;
      --color-text-primary: #ffffff;
      --color-action-accent: #3399ff;
      --color-border-default: #666666;
    }
    ${sliderCss}
    .sk-slider { inline-size: ${TRACK_WIDTH}px; }
  </style></head><body>
    <div class="sk-slider"><div class="sk-slider__control"><div class="sk-slider__track"></div></div></div>
  </body></html>`);

  const trackColor = await page.locator(".sk-slider__track").evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(trackColor, "dark unselected track must no longer collapse into the black surface").not.toBe("rgb(0, 0, 0)");
  expect(trackColor, "dark unselected track should stay below white").not.toBe("rgb(255, 255, 255)");
});

test("the fill reaches the visual line end at the maximum value", async ({ page }) => {
  await page.setContent(fixtureHtml(100));
  const trackBox = (await page.locator(".sk-slider__track").boundingBox())!;
  const rangeBox = (await page.locator(".sk-slider__range").boundingBox())!;

  expect(rangeBox.x + rangeBox.width, "the fill must end at the track's visual end").toBeCloseTo(
    trackBox.x + trackBox.width,
    0,
  );
});

test("the thumb can reach the full visual end of the line", async ({ page }) => {
  await page.setContent(fixtureHtml(100));
  const row = await centerRow(page);

  let last = -1;
  row.forEach((px, x) => {
    if (isColor(px, KNOB_COLOR.rgb)) last = x;
  });
  expect(last, "the recoloured knob must be findable on the centre row").toBeGreaterThan(-1);

  const trackEnd = PAD + TRACK_WIDTH;
  expect(
    last,
    "at 100%, the visible knob must extend past the track end instead of stopping inside it",
  ).toBeGreaterThan(trackEnd);
});

test("the thumb has a surface-coloured separator ring over the filled track", async ({ page }) => {
  await page.setContent(fixtureHtml(60));
  const background = await page.locator(".sk-slider__thumb").evaluate((el) => getComputedStyle(el).backgroundImage);

  expect(background, "the thumb gradient must include the surface-coloured separator ring").toContain("rgb(255, 255, 255)");
  expect(background, "the separator ring must sit outside the visible knob").toContain("11px");
});

test("the focus ring is separated from the thumb by the surface ring", async ({ page }) => {
  await page.setContent(fixtureHtml(60));
  await page.locator(".sk-slider__thumb").focus();
  const background = await page.locator(".sk-slider__thumb").evaluate((el) => getComputedStyle(el).backgroundImage);

  expect(background, "focus ring must not replace the thumb's ordinary border").toContain("rgb(255, 0, 255) 7px, rgb(255, 0, 255) 8px");
  expect(background, "surface separator must sit between thumb and focus").toContain("rgb(255, 255, 255) 8px, rgb(255, 255, 255) 11px");
  expect(background, "focus colour must start outside the separator").toContain("rgb(0, 102, 255) 11px");
});

test("SliderRange's fill div uses the full line percentages Zag publishes", async ({ page }) => {
  const fillStart = 0.2;
  const fillEnd = 0.8;

  await page.setContent(`<!doctype html><html><head><style>
    :root { --size-control-sm: ${THUMB_HIT}px; --size-icon-sm: ${KNOB_SIZE}px; --space-inset-xs: 4px; --radius-pill: 999px; }
    ${sliderCss}
    .sk-slider-range { inline-size: ${TRACK_WIDTH}px; --slider-range-start: ${fillStart * 100}%; --slider-range-end: ${100 - fillEnd * 100}%; }
  </style></head><body>
    <div class="sk-slider-range">
      <div class="sk-slider-range__control">
        <div class="sk-slider-range__track" aria-hidden="true">
          <div class="sk-slider-range__fill" aria-hidden="true" style="left: var(--slider-range-start); right: var(--slider-range-end)"></div>
        </div>
      </div>
    </div>
  </body></html>`);

  const rangeBox = (await page.locator(".sk-slider-range").boundingBox())!;
  const fillBox = (await page.locator(".sk-slider-range__fill").boundingBox())!;

  expect(fillBox.x - rangeBox.x, "the fill starts at the published low percentage").toBeCloseTo(
    fillStart * TRACK_WIDTH,
    0,
  );
  expect(fillBox.width, "the fill width spans the published low→high percentages").toBeCloseTo(
    (fillEnd - fillStart) * TRACK_WIDTH,
    0,
  );
});
