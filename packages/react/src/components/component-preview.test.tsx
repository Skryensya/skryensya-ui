import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComponentPreviewBare } from "./component-preview.js";

describe("ComponentPreviewBare (React)", () => {
  it("renders the title, stage and code in order", () => {
    const ui = render(
      <ComponentPreviewBare
        title="Button"
        stage={<button>Click me</button>}
        code={<pre>const x = 1;</pre>}
      />,
    );

    expect(ui.getByText("Button")).toBeTruthy();
    expect(ui.getByRole("button", { name: "Click me" })).toBeTruthy();
    expect(ui.getByText("const x = 1;")).toBeTruthy();
  });

  it("renders a note beside the title when given", () => {
    const ui = render(
      <ComponentPreviewBare title="Button" note="disabled" stage={<span />} code={<span />} />,
    );
    expect(ui.getByText("disabled")).toBeTruthy();
  });

  it("omits the header entirely when there is neither a title nor a note", () => {
    const ui = render(<ComponentPreviewBare title={undefined} stage={<span />} code={<span />} />);
    expect(ui.container.querySelector(".sk-component-preview__header")).toBeNull();
  });

  it("keeps the header when only a note is given, with no title text", () => {
    const ui = render(
      <ComponentPreviewBare title={undefined} note="Beta" stage={<span />} code={<span />} />,
    );
    expect(ui.container.querySelector(".sk-component-preview__header")).not.toBeNull();
    expect(ui.getByText("Beta")).toBeTruthy();
  });
});
