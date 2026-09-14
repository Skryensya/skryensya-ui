/*
 * The shared jsdom floor plus the one thing that is this binding's own.
 *
 * Everything this file used to declare - `CSS.escape`, `ResizeObserver`, `matchMedia`, `scrollTo` and
 * the `<dialog>` shim - now lives in `@skryensya/core/jsdom-floor`, which Vanilla reads too. It was a
 * 38-line copy of that same floor, and the copy was already the weaker one: its `CSS.escape` was a
 * regex approximation where the shared version is the spec algorithm.
 */
import "@skryensya/core/jsdom-floor";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/* `@testing-library/react`'s, so it belongs to this binding and not to the floor. */
afterEach(cleanup);
