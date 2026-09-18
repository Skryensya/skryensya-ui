import { describe, expect, it } from "vitest";
import { getContract } from "@skryensya/core/registry";
import { contractSurface, optionSurface, surfaceHash } from "./surface.js";
import { vocabulary } from "./vocabulary.js";

const button = () => getContract("button")!;
const accordion = () => getContract("accordion")!;
const pagination = () => getContract("pagination")!;
const tag = () => getContract("tag")!;

describe("contractSurface: public promise, not realization", () => {
  it("publishes the surface vocabulary entry", () => {
    expect(vocabulary).toHaveProperty("contractSurface");
    expect(vocabulary.contractSurface).toMatch(/machineInput/);
    expect(vocabulary.contractSurface).toMatch(/template/);
  });

  it("includes options, slots, events, eventDetails, compose, forward, hitTesting, systemOwned, mounts, requires, a11y", () => {
    const surface = contractSurface(button()) as Record<string, unknown>;
    expect(surface).toMatchObject({
      css: expect.any(String),
      parts: expect.any(Object),
      options: expect.any(Object),
    });

    const action = (surface.signatures as Record<string, Record<string, unknown>>)["Button.action"];
    expect(action.options).toEqual(expect.arrayContaining(["variant", "disabled"]));
    expect(action.slots).toBeDefined();
    expect(action.mount).toBe("data-sk-button");
    expect(action.forward).toEqual(expect.arrayContaining(["form", "name"]));

    const nav = (surface.signatures as Record<string, Record<string, unknown>>)["Button.navigation"];
    expect(nav.requires).toEqual(expect.arrayContaining(["href"]));
    expect(nav.forbids).toEqual(expect.arrayContaining(["disabled", "pressed"]));

    const calendar = contractSurface(getContract("calendar")!) as Record<string, unknown>;
    expect(calendar.systemOwned).toEqual(expect.arrayContaining(["cell"]));

    const badge = contractSurface(getContract("badge")!) as {
      signatures: Record<string, { hitTesting?: unknown }>;
    };
    expect(badge.signatures.BadgeHolder.hitTesting).toBeDefined();

    const dialog = contractSurface(getContract("dialog")!) as {
      signatures: Record<string, { compose?: unknown }>;
    };
    expect(dialog.signatures.Dialog.compose).toEqual(
      expect.arrayContaining([expect.objectContaining({ of: "button" })]),
    );

    const named = contractSurface(getContract("popover")!) as { a11y?: unknown };
    expect(named.a11y).toBeDefined();

    const withEvents = contractSurface(getContract("accordion")!) as {
      events: Record<string, string>;
      eventDetails: Record<string, unknown>;
    };
    expect(withEvents.events.valueChange).toMatch(/^sk:/);
    expect(withEvents.eventDetails.valueChange).toBeDefined();
  });

  it("excludes template also-class dumps and ephemeral Button attr dumps", () => {
    const before = surfaceHash(tag());
    const retemplated = {
      ...tag(),
      signatures: {
        ...tag().signatures,
        Tag: {
          ...tag().signatures.Tag,
          template: {
            element: "span",
            part: "root",
            host: true as const,
            /* Realization noise: borrowed Button look attrs + also classes on system-owned chrome. */
            also: ["sk-button", "sk-interactive", "sk-noise"],
            attrs: {
              "data-variant": "ghost",
              "data-size": "sm",
              "data-icon-only": "",
              type: "button",
            },
            children: [{ slot: "children" }],
          },
        },
      },
    };
    expect(surfaceHash(retemplated)).toBe(before);
  });

  it("excludes option.machineInput (binding bookkeeping) from the hash", () => {
    const before = surfaceHash(accordion());
    const flipped = {
      ...accordion(),
      options: {
        ...accordion().options,
        collapsible: { ...accordion().options.collapsible, machineInput: undefined },
      },
    };
    /* Dropping the flag must not move the gate: UsageTree authors still see the same option. */
    expect(optionSurface(accordion().options.collapsible)).not.toHaveProperty("machineInput");
    expect(surfaceHash(flipped)).toBe(before);
  });

  it("still moves when computedInput flips (emit writes or omits the attr)", () => {
    const before = surfaceHash(pagination());
    const flipped = {
      ...pagination(),
      options: {
        ...pagination().options,
        page: { ...pagination().options.page, computedInput: undefined },
      },
    };
    expect(optionSurface(pagination().options.page)).toHaveProperty("computedInput", true);
    expect(surfaceHash(flipped)).not.toBe(before);
  });

  it("moves when eventDetails change", () => {
    const before = surfaceHash(accordion());
    const flipped = {
      ...accordion(),
      eventDetails: {
        ...accordion().eventDetails,
        valueChange: {
          ...accordion().eventDetails!.valueChange,
          reactProp: "onSomethingElse",
        },
      },
    };
    expect(surfaceHash(flipped)).not.toBe(before);
  });

  it("moves when a default flips", () => {
    const before = surfaceHash(accordion());
    const flipped = {
      ...accordion(),
      options: {
        ...accordion().options,
        collapsible: { ...accordion().options.collapsible, default: false },
      },
    };
    expect(surfaceHash(flipped)).not.toBe(before);
  });
});
