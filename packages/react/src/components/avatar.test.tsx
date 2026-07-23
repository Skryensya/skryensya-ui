import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarGroup } from "./avatar.js";

describe("Avatar", () => {
  it("derives initials from the name when there is no image", () => {
    const ui = render(<Avatar name="Ada Lovelace" />);
    const avatar = ui.getByLabelText("Ada Lovelace");
    expect(avatar.textContent).toBe("AL");
  });

  it("renders the image with the name as alt text when src is given", () => {
    const ui = render(<Avatar name="Ada Lovelace" src="/ada.png" />);
    const img = ui.getByRole("img", { name: "Ada Lovelace" }) as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toBe("/ada.png");
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
});
