import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { List, ListItem, ListItemButton, ListItemLink } from "./list.js";

describe("List", () => {
  it("renders a semantic list with static, link and button rows", () => {
    const ui = render(
      <List aria-label="Ajustes">
        <ListItem leading={<span aria-hidden="true">◷</span>} title="Zona horaria" description="GMT−3" />
        <ListItemLink href="/perfil" title="Perfil" trailing={<span>3</span>} />
        <ListItemButton title="Cerrar sesión" />
      </List>,
    );

    // native <ul> semantics, with three <li> rows
    const list = ui.getByRole("list", { name: "Ajustes" });
    expect(list.tagName).toBe("UL");
    expect(ui.getAllByRole("listitem")).toHaveLength(3);

    // the link row navigates and keeps the shared interaction hooks
    const link = ui.getByRole("link", { name: /Perfil/ });
    expect(link.getAttribute("href")).toBe("/perfil");
    expect(link.className).toContain("sk-interactive");

    // the button row is a real button that defaults to type="button"
    const button = ui.getByRole("button", { name: "Cerrar sesión" });
    expect(button.getAttribute("type")).toBe("button");
  });

  it("renders an ordered list when order is meaningful", () => {
    const ui = render(
      <List ordered>
        <ListItem title="Uno" />
        <ListItem title="Dos" />
      </List>,
    );

    expect(ui.getByRole("list").tagName).toBe("OL");
  });

  it("turns dividers off and densifies rows when asked", () => {
    const ui = render(
      <List density="compact" dividers={false} aria-label="Inbox">
        <ListItem title="Uno" />
        <ListItemButton title="Actuar" />
      </List>,
    );

    const list = ui.getByRole("list", { name: "Inbox" });
    expect(list.getAttribute("data-density")).toBe("compact");
    expect(list.getAttribute("data-dividers")).toBe("none");
    expect(ui.getByRole("button", { name: "Actuar" }).className).toContain("sk-list__action");
  });

  it("disables ListItemButton with native disabled and aria-disabled", () => {
    const ui = render(
      <List aria-label="Acciones">
        <ListItemButton disabled title="Cerrar sesión" />
      </List>,
    );

    const button = ui.getByRole("button", { name: "Cerrar sesión" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-disabled")).toBe("true");
  });
});
