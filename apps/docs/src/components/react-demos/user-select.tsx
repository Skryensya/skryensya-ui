/*
 * Live React demo for /components/user-select. Self-contained island (no function props crossing
 * the Astro boundary): `UserSelect` is fully controlled, so `value` lives here as `useState`, same
 * shape any real consumer's would.
 */
import { UserSelect, type UserSelectUser } from "@skryensya/react/user-select";
import { useState } from "react";
import { userSelectRoster } from "../../demos/data/user-select";
import { framedIn } from "./framed";

const framed = framedIn("user-select");

const users: UserSelectUser[] = userSelectRoster.map(({ id, name, email, disabled }) => ({
  id,
  name,
  email,
  disabled,
}));

type DemoProps = { lang?: "es" | "en" };

export const UserSelectBasicDemo = framed(function UserSelectBasicDemo({ lang = "es" }: DemoProps) {
  const [value, setValue] = useState<string[]>(["jane"]);
  const es = lang === "es";

  return (
    <UserSelect
      onValueChange={setValue}
      placeholder={es ? "Seleccionar personas" : "Select users"}
      searchPlaceholder={es ? "Buscar personas..." : "Search users..."}
      users={users}
      value={value}
    />
  );
}, { viewport: "menu" });

/** The loading branch: no `useState` needed, `loading` is a static prop here. */
export const UserSelectLoadingDemo = framed(function UserSelectLoadingDemo({ lang = "es" }: DemoProps) {
  const es = lang === "es";
  return (
    <UserSelect
      loading
      onValueChange={() => {}}
      placeholder={es ? "Seleccionar personas" : "Select users"}
      users={users}
      value={[]}
    />
  );
}, { viewport: "menu" });
