import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * STICKER, IN A REAL BROWSER: the claims no DOM or accessibility comparison can see.
 *
 * G2 already proves both bindings emit the same anatomy for the canonical trees. What it cannot
 * prove is the paint: that the die-cut edge follows the artwork's alpha rather than its box, that a
 * change of `data-state` actually travels (and stops travelling under reduced motion), and that the
 * logical peel corner turns with the writing direction. Each probe is authored markup injected into
 * the stage, which has every stylesheet loaded, and removed afterwards.
 */

const PROBE = "sticker-probe";

/** Draw artwork on a canvas and hand back a transparent PNG: raster alpha, no vector to lean on. */
async function mountRaster(page: Page, shape: "circle" | "star", extra = ""): Promise<void> {
  await page.evaluate(
    async ({ shape, extra, id }) => {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const g = canvas.getContext("2d")!;
      g.fillStyle = "rgb(220, 30, 30)";
      g.beginPath();
      if (shape === "circle") g.arc(50, 50, 40, 0, Math.PI * 2);
      else
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? 18 : 48;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          g.lineTo(50 + r * Math.cos(a), 52 + r * Math.sin(a));
        }
      g.fill();
      const src = canvas.toDataURL("image/png");

      document.getElementById(id)?.remove();
      const host = document.createElement("div");
      host.id = id;
      /* Flat black ground, no tilt, applied: the edge is the only thing that can be white. */
      host.style.cssText = "position:fixed;inset-block-start:0;inset-inline-start:0;padding:40px;background:#000;z-index:9";
      host.innerHTML = `
        <span class="sk-sticker" data-state="applied" style="--sk-sticker-rotate:0deg;--sk-sticker-edge-width:6px" ${extra}>
          <span class="sk-sticker__art"><img src="${src}" alt="" width="100" height="100"></span>
          <span class="sk-sticker__flap" aria-hidden="true"><span class="sk-sticker__art"><img src="${src}" alt=""></span></span>
        </span>`;
      document.body.append(host);
      await Promise.all([...host.querySelectorAll("img")].map((img) => img.decode()));
    },
    { shape, extra, id: PROBE },
  );
}

/** Pixel colours at points relative to the artwork's own box, read back from a real screenshot. */
async function sample(page: Page, points: readonly [number, number][]): Promise<[number, number, number][]> {
  const art = page.locator(`#${PROBE} .sk-sticker > .sk-sticker__art`);
  const box = (await art.boundingBox())!;
  const shot = await page.screenshot({ clip: { x: box.x - 20, y: box.y - 20, width: box.width + 40, height: box.height + 40 } });
  return page.evaluate(
    async ({ data, points }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const g = canvas.getContext("2d")!;
      g.drawImage(img, 0, 0);
      return points.map(([x, y]) => {
        const [r, gr, b] = g.getImageData(Math.round(x + 20), Math.round(y + 20), 1, 1).data;
        return [r!, gr!, b!] as [number, number, number];
      });
    },
    { data: shot.toString("base64"), points },
  );
}

const isBlack = ([r, g, b]: [number, number, number]) => r < 40 && g < 40 && b < 40;
const isWhite = ([r, g, b]: [number, number, number]) => r > 215 && g > 215 && b > 215;
const isRed = ([r, g, b]: [number, number, number]) => r > 180 && g < 80 && b < 80;

test.describe("sticker", () => {
  test.beforeEach(async ({ page }) => {
    await waitForStage(page);
  });

  test("a transparent circle gets an edge around the circle, not around its box", async ({ page }) => {
    await mountRaster(page, "circle");
    /* The circle has radius 40 centred in a 100px box; the edge is 6px. */
    const [center, justOutside, boxCorner, edgeOfBox] = await sample(page, [
      [50, 50], // inside the artwork
      [50 + 43, 50], // 3px past the circle: inside the edge
      [4, 4], // the box's corner: transparent in the image, so outside the sticker
      [50 + 48.5, 50 + 48.5], // on the box's own diagonal corner, far from the circle
    ]);
    expect(isRed(center!), `center ${center}`).toBe(true);
    expect(isWhite(justOutside!), `just outside the circle ${justOutside}`).toBe(true);
    expect(isBlack(boxCorner!), `box corner ${boxCorner}: a rectangular border would be white here`).toBe(true);
    expect(isBlack(edgeOfBox!), `far box corner ${edgeOfBox}`).toBe(true);
  });

  test("a star keeps its concave notches: the edge follows each arm", async ({ page }) => {
    await mountRaster(page, "star");
    /* Between the two upper arms, well inside the bounding box but far from any material. */
    const [between, armTip, beyondTip] = await sample(page, [
      [64, 10], // 12px from either arm, so past the 6px edge on both sides
      [50, 20], // inside the top arm
      [50, 1], // 3px past the top point, which sits at y=4: the edge
    ]);
    expect(isBlack(between!), `the notch between arms ${between}`).toBe(true);
    expect(isRed(armTip!), `the arm ${armTip}`).toBe(true);
    expect(isWhite(beyondTip!), `just past the top point ${beyondTip}`).toBe(true);
  });

  test("changing data-state travels to the new state without replacing the artwork", async ({ page }) => {
    await mountRaster(page, "circle", 'data-peel-origin="block-end-inline-end"');
    const sticker = page.locator(`#${PROBE} .sk-sticker`);
    await sticker.evaluate((el) => {
      (window as unknown as { stickerImg: Element }).stickerImg = el.querySelector("img")!;
    });

    const peel = () => sticker.evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--sticker-peel")));
    expect(await peel()).toBe(0);

    await sticker.evaluate((el) => el.setAttribute("data-state", "peeled"));
    /* It has somewhere to go and gets there: 1 once the drag-intent transition has run. */
    await expect.poll(peel, { timeout: 2000 }).toBe(1);
    const turned = await sticker.evaluate(
      (el) => getComputedStyle(el.querySelector(".sk-sticker__flap > .sk-sticker__art")!).transform,
    );
    expect(turned).not.toBe("none");
    expect(turned).toMatch(/^matrix3d/);

    await sticker.evaluate((el) => el.setAttribute("data-state", "applied"));
    await expect.poll(peel, { timeout: 2000 }).toBe(0);

    const same = await sticker.evaluate(
      (el) => el.querySelector("img") === (window as unknown as { stickerImg: Element }).stickerImg,
    );
    expect(same, "the image was replaced; a state change must only change an attribute").toBe(true);
  });

  test("applied comes to rest: flat, full size, and nothing left running", async ({ page }) => {
    await mountRaster(page, "circle");
    const sticker = page.locator(`#${PROBE} .sk-sticker`);
    await sticker.evaluate((el) => el.setAttribute("data-state", "peeled"));
    await page.waitForTimeout(400);
    await sticker.evaluate((el) => el.setAttribute("data-state", "applied"));

    /* Mid-transition something IS running; that is the press being played, not a static swap. */
    expect(await sticker.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);

    await expect.poll(() => sticker.evaluate((el) => el.getAnimations().length), { timeout: 3000 }).toBe(0);
    const rest = await sticker.evaluate((el) => ({
      scale: getComputedStyle(el).scale,
      contact: getComputedStyle(el).getPropertyValue("--sticker-contact").trim(),
      lift: getComputedStyle(el).getPropertyValue("--sticker-lift").trim(),
    }));
    expect(rest).toEqual({ scale: "1", contact: "1", lift: "0" });
  });

  test("under reduced motion the state still changes, at once, with no travel", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mountRaster(page, "circle");
    const sticker = page.locator(`#${PROBE} .sk-sticker`);
    const peel = await sticker.evaluate((el) => {
      el.setAttribute("data-state", "peeled");
      return {
        value: getComputedStyle(el).getPropertyValue("--sticker-peel").trim(),
        running: el.getAnimations().length,
      };
    });
    expect(peel).toEqual({ value: "1", running: 0 });
    const turned = await sticker.evaluate(
      (el) => getComputedStyle(el.querySelector(".sk-sticker__flap > .sk-sticker__art")!).transform,
    );
    expect(turned, "the peeled state itself must survive reduced motion").toMatch(/^matrix3d/);
    await page.emulateMedia({ reducedMotion: null });
  });

  test("the logical corner turns with the writing direction", async ({ page }) => {
    await mountRaster(page, "circle", 'data-state="peeled" data-peel-origin="block-end-inline-end"');
    const originX = () =>
      page.evaluate((id) => {
        const flap = document.querySelector(`#${id} .sk-sticker__flap > .sk-sticker__art`) as HTMLElement;
        return parseFloat(getComputedStyle(flap).transformOrigin) / flap.offsetWidth;
      }, PROBE);

    const ltr = await originX();
    await page.evaluate((id) => document.getElementById(id)!.setAttribute("dir", "rtl"), PROBE);
    const rtl = await originX();
    /* The pivot sits on the inline-end half in LTR and on the other half in RTL. */
    expect(ltr).toBeGreaterThan(0.5);
    expect(rtl).toBeLessThan(0.5);
  });
});
