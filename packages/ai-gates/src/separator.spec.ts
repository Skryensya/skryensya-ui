import { expect, test } from "@playwright/test";
import { readComponentCss } from "./fixtures.js";

const separatorCss = readComponentCss("separator", import.meta.url);
const RULE_COLOR = "rgb(136, 136, 136)";

function fixtureHtml(): string {
  return `<!doctype html><html><head><style>
    :root {
      --color-border-default: ${RULE_COLOR};
      --color-border-subtle: rgb(96, 96, 96);
      --color-border-strong: rgb(184, 184, 184);
      --space-stack-md: 16px;
      --space-stack-sm: 8px;
      --space-stack-lg: 24px;
      --space-inline-sm: 8px;
      --color-text-tertiary: rgb(160, 160, 160);
      --font-size-body-sm: 14px;
      --font-line-height-body-sm: 20px;
    }
    ${separatorCss}
    html, body { margin: 0; background: rgb(28, 28, 26); }
    body { padding: 24px; }
  </style></head><body>
    <hr class="sk-separator" data-orientation="horizontal" data-tone="default" data-spacing="md">
  </body></html>`;
}

test("the horizontal separator paints its configured border color", async ({ page }) => {
  await page.setContent(fixtureHtml());

  const rule = page.locator("hr.sk-separator[data-orientation=horizontal]");
  await expect(rule).toHaveCSS("border-top-color", RULE_COLOR);

  const box = (await rule.boundingBox())!;
  const png = (await page.screenshot({ clip: box })).toString("base64");
  const pixel = await page.evaluate(
    async ({ png, width, height }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${png}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      return [...context.getImageData(Math.floor(width / 2), Math.floor(height / 2), 1, 1).data];
    },
    { png, width: Math.round(box.width), height: Math.round(box.height) },
  );

  expect(pixel).toEqual([136, 136, 136, 255]);
});
