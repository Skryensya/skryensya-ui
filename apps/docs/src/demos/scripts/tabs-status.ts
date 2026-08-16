const root = document.querySelector("[data-tabs-advanced]");
const status = root?.querySelector<HTMLElement>("[data-tabs-status]");

root?.addEventListener("click", (event) => {
  // `event.target` is an EventTarget, and only an Element has `closest`: the version of this demo
  // written in JavaScript called it unconditionally.
  const target = event.target instanceof Element ? event.target : null;
  const trigger = target?.closest<HTMLElement>("[data-sk-tabs-trigger]");
  if (!trigger || !status) return;

  const label = (status.textContent ?? "").split(":")[0];
  status.textContent = `${label}: ${trigger.textContent?.trim() ?? ""}`;
});
