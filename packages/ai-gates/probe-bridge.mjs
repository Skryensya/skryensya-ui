import { chromium } from "@playwright/test";

const html = `<!doctype html><html><body style="margin:0">
<div id="panel" style="position:fixed;left:50px;top:50px;width:200px;height:200px;overflow:auto;background:#eee">
  <div class="row" id="r1" style="height:44px;background:#ddd">one</div>
  <button id="trigger" style="display:block;width:100%;height:44px;position:relative">two (trigger)
    <span id="bridge" style="position:fixed;left:250px;top:94px;width:120px;height:120px;background:rgba(255,0,0,.25)"></span>
  </button>
  <div class="row" id="r3" style="height:44px;background:#ddd">three</div>
</div>
<div id="submenu" style="position:fixed;left:370px;top:94px;width:150px;height:120px;background:#cfc">submenu</div>
<pre id="log" style="position:fixed;left:600px;top:0;font:12px monospace"></pre>
<script>
const log = [];
const push = (s) => { log.push(s); document.getElementById("log").textContent = log.join("\\n"); };
for (const id of ["trigger","r3","submenu","bridge"]) {
  const el = document.getElementById(id);
  el.addEventListener("pointerenter", () => push("enter " + id));
  el.addEventListener("pointerleave", () => push("leave " + id));
  el.addEventListener("pointermove", (e) => { if (id === "trigger") push("move->trigger from " + (e.target.id || e.target.tagName)); });
}
window.__log = log;
</script>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.setContent(html);

const at = async (x, y, tag) => {
  await page.mouse.move(x, y);
  await page.waitForTimeout(40);
  const top = await page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.id || el.tagName : null;
  }, [x, y]);
  console.log(`${tag} (${x},${y}) topmost=${top}`);
};

await at(150, 116, "on trigger      ");
await at(300, 130, "on bridge       "); // inside the fixed child, far outside the clipping panel
await at(300, 180, "bridge lower    ");
await at(440, 150, "on submenu      ");
await at(150, 116, "back on trigger ");
await at(150, 160, "on row three    ");

console.log("--- event log ---");
console.log((await page.evaluate(() => window.__log)).join("\n"));

// Does the bridge escape overflow:auto clipping?
const visible = await page.evaluate(() => {
  const b = document.getElementById("bridge").getBoundingClientRect();
  return { x: b.x, y: b.y, w: b.width, h: b.height };
});
console.log("bridge rect", visible);

await browser.close();
