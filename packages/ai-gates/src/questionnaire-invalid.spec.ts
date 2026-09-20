import type { Locator } from "@playwright/test";
import { expect, test } from "./fixtures.js";

/*
 * THE INVALID QUESTION, WHICH G2 RENDERS BUT NEVER REACHES.
 *
 * Questionnaire's error state carries three ARIA relationships, and both bindings write all three:
 * `aria-invalid="true"` on the fieldset, `role="alert"` on the message so it is announced when it
 * lands, and the message's id appended to the fieldset's `aria-describedby`.
 *
 * None of it is in the contract's `wiring`, and it cannot be: `wiring` resolves at EMIT time, from
 * the tree the author wrote. FormField declares these same two attributes and is right to, because
 * there the error is an authored SLOT. Here the message is the machine's, written the moment a
 * required question is left unanswered, and "is this question invalid" is state no tree carries.
 *
 * So the relationship is gated instead of declared, which is what this file is. G2 already compares
 * the accessibility tree of both bindings for every canonical tree, and would catch a divergence
 * here for free  -  except it compares the stage as MOUNTED, and nothing on it ever drives a
 * questionnaire into failing. The relationships existed in both bindings and were simply never
 * looked at. Same reason `button-pressed.spec.ts` is its own file: the thing that can drift is only
 * visible after an interaction.
 *
 * Ids are compared as RELATIONSHIPS, never as values, for the reason symmetry.spec.ts spells out:
 * React generates them with `useId` and the emitter slugs the label, so the two sides legitimately
 * disagree about the string while owing the same pointer.
 */

const CASE = "questionnaire/survey";

/** What the error state looks like from the accessibility tree, for one binding. */
async function errorStateOf(block: Locator, binding: "vanilla" | "react") {
  const root = block.locator(`[data-binding="${binding}"]`);
  const form = root.locator(".sk-questionnaire").first();

  // The first canonical question is `required`, so Next with nothing chosen is the failing path.
  await form.locator(".sk-questionnaire__next").click();

  const item = form.locator(".sk-questionnaire__item[data-active]").first();
  const error = item.locator(".sk-questionnaire__error").first();

  const [invalid, role, describedBy, errorId, text] = await Promise.all([
    item.getAttribute("aria-invalid"),
    error.getAttribute("role"),
    item.getAttribute("aria-describedby"),
    error.getAttribute("id"),
    error.textContent(),
  ]);

  return {
    invalid,
    role,
    /* The pointer, not the string: does describedby actually reach the message? */
    describesTheError: Boolean(errorId && describedBy?.split(/\s+/).includes(errorId)),
    announces: (text ?? "").trim().length > 0,
  };
}

test("a question that fails carries the same error wiring in both bindings", async ({ stagePage: page }) => {
  const block = page.locator(`[data-case="${CASE}"]`);

  const vanilla = await errorStateOf(block, "vanilla");
  const react = await errorStateOf(block, "react");

  /* Stated outright rather than only compared, so two bindings that are wrong the same way fail. */
  for (const [binding, state] of [["vanilla", vanilla], ["react", react]] as const) {
    expect(state.invalid, `${binding}: the failing question is aria-invalid`).toBe("true");
    expect(state.role, `${binding}: the message announces itself`).toBe("alert");
    expect(state.describesTheError, `${binding}: aria-describedby reaches the message`).toBe(true);
    expect(state.announces, `${binding}: the message has text to announce`).toBe(true);
  }

  expect(vanilla).toEqual(react);
});
