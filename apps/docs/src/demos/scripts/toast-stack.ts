const stack = document.querySelector("[data-stack-region]");

document.querySelector("[data-stack-add]")?.addEventListener("click", async () => {
  const toast = stack?.lastElementChild?.cloneNode(true);
  if (!stack || !(toast instanceof Element)) return;

  stack.append(toast);
  await window.skMount?.(toast);
});
