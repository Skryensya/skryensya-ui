import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarGroup } from "./avatar.js";

describe("Avatar", () => {
  it("derives initials from the name when there is no image", () => {
    const ui = render(<Avatar name="Ada Lovelace" />);
    const avatar = ui.getByLabelText("Ada Lovelace");
    expect(avatar.textContent).toBe("AL");
  });

  it("uses the first two characters of a single-word username", () => {
    const ui = render(<Avatar name="alice" />);
    expect(ui.getByLabelText("alice").textContent).toBe("al");
  });

  it("renders the image inside ImageFrame when src is given", () => {
    const ui = render(<Avatar name="Ada Lovelace" src="/ada.png" />);
    const img = ui.getByRole("img", { name: "Ada Lovelace" }) as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toBe("/ada.png");
    expect(img.className).toContain("sk-image-frame__media");
    expect(img.closest(".sk-image-frame")).toBeTruthy();
    expect(img.closest(".sk-avatar")).toBeTruthy();
  });

  it("serializes the xl size onto the same attribute both structures use", () => {
    const initials = render(<Avatar name="Ada Lovelace" size="xl" />);

    expect(initials.getByLabelText("Ada Lovelace").getAttribute("data-size")).toBe("xl");

    /*
     * The photo branch is a genuinely different tree (an ImageFrame nested inside the disc), so
     * asserting it separately is not the same assertion twice: `data-size` has to stay on the DISC,
     * which is the element avatar.css sizes, and not drift onto the frame that merely fills it.
     */
    const photo = render(<Avatar name="Grace Hopper" size="xl" src="/grace.png" />);
    const disc = photo.getByRole("img", { name: "Grace Hopper" }).closest(".sk-avatar");

    expect(disc?.getAttribute("data-size")).toBe("xl");
  });
});

describe("AvatarGroup", () => {
  it("caps visible avatars and collapses the rest into a +N counter", () => {
    const ui = render(
      <AvatarGroup max={2}>
        <Avatar name="A A" />
        <Avatar name="B B" />
        <Avatar name="C C" />
        <Avatar name="D D" />
      </AvatarGroup>,
    );
    expect(ui.getAllByRole("img")).toHaveLength(2);
    expect(ui.getByText("+2")).toBeTruthy();
  });

  it("exposes itself as a named group when a label is given", () => {
    const ui = render(
      <AvatarGroup label="Reviewers">
        <Avatar name="A A" />
      </AvatarGroup>,
    );
    expect(ui.getByRole("group", { name: "Reviewers" })).toBeTruthy();
  });

  it("is still a group without a label", () => {
    const ui = render(
      <AvatarGroup>
        <Avatar name="A A" />
      </AvatarGroup>,
    );
    expect(ui.getByRole("group")).toBeTruthy();
  });
});
