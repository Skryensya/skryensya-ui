import { comboboxParts } from "@skryensya/core/combobox";
import { selectAttrs, selectParts, selectPositioning } from "@skryensya/core/select";
import { select } from "@skryensya/core/machines";
import { userSelectAttrs, userSelectSearchKey } from "@skryensya/core/user-select";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useId, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { useAnchored } from "./anchored.js";
import { Avatar, AvatarGroup } from "./avatar.js";
import { Button } from "./button.js";
import { Icon } from "./icon.js";
import { Input } from "./input.js";
import { Inline } from "./layout.js";
import { Loader } from "./loader.js";
import { Text } from "./typography.js";

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export type UserSelectUser = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  disabled?: boolean;
};

export type UserSelectProps = {
  id?: string;
  /** Submitted under this name by the hidden native `<select multiple>`, same role as Select's own. */
  name?: string;
  users: readonly UserSelectUser[];
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Caps the trigger's avatar stack; the rest collapse into `GroupedAvatar`'s own "+N". */
  maxAvatars?: number;
  className?: string;
  /** Where the floating listbox is portalled. See `Select`'s own prop of the same name. */
  container?: RefObject<HTMLElement>;
};

export function UserSelect({
  className,
  container,
  disabled,
  id,
  loading,
  maxAvatars = 3,
  name,
  onValueChange,
  placeholder = "Select users",
  searchPlaceholder = "Search users...",
  users,
  value,
}: UserSelectProps) {
  const generatedId = useId();
  const machineId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const selectedUsers = useMemo(
    () => value.map((userId) => usersById.get(userId)).filter((user): user is UserSelectUser => user != null),
    [value, usersById],
  );

  // Folded once per user list, not once per row per keystroke, same precedent as Combobox's own
  // `searchKeys`. Name and email searched together so "mar" and an email-local-part both match.
  const searchKeys = useMemo(
    () => users.map((user) => userSelectSearchKey(`${user.name} ${user.email ?? ""}`)),
    [users],
  );
  const filteredUsers = useMemo(() => {
    const needle = userSelectSearchKey(query.trim());
    if (!needle) return users;
    return users.filter((_, index) => searchKeys[index]!.includes(needle));
  }, [users, query, searchKeys]);

  const collection = useMemo(
    () =>
      select.collection<UserSelectUser>({
        items: [...filteredUsers],
        itemToString: (user) => user.name,
        itemToValue: (user) => user.id,
        isItemDisabled: (user) => Boolean(user.disabled),
      }),
    [filteredUsers],
  );

  const service = useMachine(select.machine, {
    id: machineId,
    collection,
    name,
    multiple: true,
    // The listbox is a `role="dialog"` wrapper around OUR search field plus a nested
    // `role="listbox"` (`getListProps`), not a listbox directly holding the field: `composite: true`
    // (the default) puts the listbox role and `aria-activedescendant` on the same element Select
    // itself focuses, which has no room for a text input as a child. `false` is what Zag ships this
    // split for.
    composite: false,
    // Multiple selection defaults this to `false` already (`select.machine.js`), stated explicitly
    // because "does not close on select" is the one behavior this whole component depends on.
    closeOnSelect: false,
    disabled,
    value: [...value],
    positioning: selectPositioning,
    onValueChange(details: { value: string[] }) {
      onValueChange([...details.value]);
    },
    // The search is the user's work-in-progress the same way Combobox's typed query is; closing
    // clears it so the next open starts from the full roster, never a stale filtered view.
    onOpenChange(details: { open: boolean }) {
      if (!details.open) setQuery("");
    },
  });
  const api = select.connect(service, normalizeProps);
  const anchor = useAnchored(machineId);

  const selectionLabel =
    selectedUsers.length === 0
      ? placeholder
      : selectedUsers.length === 1
        ? `${placeholder}, ${selectedUsers[0]!.name} selected`
        : `${placeholder}, ${selectedUsers.length} users selected`;

  const triggerProps = api.getTriggerProps();

  // Content's own `onKeyDown` (bubbled up from the search input below) maps Space to "toggle the
  // highlighted user", same as Enter: correct for a bare listbox, wrong for a live text field where
  // a person types "Jane Cooper". Stopping it here before it reaches that handler is the one place
  // this component's search behavior has to diverge from a plain reused listbox, and only for that
  // one key; Enter, the arrows, Home and End all still reach it and drive the list untouched.
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " ") event.stopPropagation();
  };

  const resultsStatus = !api.open
    ? null
    : loading
      ? "Loading users"
      : `${filteredUsers.length} ${filteredUsers.length === 1 ? "result" : "results"} available`;

  return (
    <div
      className={cx(selectParts.root, className)}
      ref={rootRef}
      {...{ [selectAttrs.root]: "", [userSelectAttrs.root]: "" }}
    >
      <select {...api.getHiddenSelectProps()} {...{ [selectAttrs.hidden]: "" }}>
        {users.map((user) => (
          <option disabled={user.disabled} key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <div className={selectParts.control} {...{ [selectAttrs.control]: "" }}>
        <button
          {...triggerProps}
          {...anchor.anchor(`${selectParts.trigger} sk-interactive`)}
          {...{ [selectAttrs.trigger]: "" }}
          aria-label={selectionLabel}
          aria-labelledby={undefined}
          type="button"
        >
          {/* Decorative: the button's own `aria-label` above is the one textual representation a
              screen reader gets, so it never has to parse a name next to a stack of avatar images. */}
          {selectedUsers.length === 0 ? (
            <span
              {...api.getValueTextProps()}
              aria-hidden="true"
              className={selectParts.value}
              {...{ [selectAttrs.value]: "" }}
            >
              {placeholder}
            </span>
          ) : (
            <Inline
              {...api.getValueTextProps()}
              align="center"
              aria-hidden="true"
              as="span"
              className={selectParts.value}
              gap="sm"
              wrap={false}
              {...{ [selectAttrs.value]: "" }}
            >
              {selectedUsers.length === 1 ? (
                <Avatar name={selectedUsers[0]!.name} size="sm" src={selectedUsers[0]!.avatarUrl} />
              ) : (
                <AvatarGroup max={maxAvatars}>
                  {selectedUsers.map((user) => (
                    <Avatar key={user.id} name={user.name} size="sm" src={user.avatarUrl} />
                  ))}
                </AvatarGroup>
              )}
              <span className={selectParts.value}>
                {selectedUsers.length === 1 ? selectedUsers[0]!.name : `${selectedUsers.length} users`}
              </span>
            </Inline>
          )}
          <span
            {...api.getIndicatorProps()}
            aria-hidden="true"
            className={selectParts.indicator}
            {...{ [selectAttrs.indicator]: "" }}
          >
            <span data-state="closed">
              <Icon name="chevron-down" />
            </span>
            <span data-state="open">
              <Icon name="chevron-up" />
            </span>
          </span>
        </button>
      </div>
      <Portal container={container}>
        <div
          {...anchor.positioner(api.getPositionerProps(), selectParts.positioner)}
          {...{ [selectAttrs.positioner]: "" }}
        >
          <div {...api.getContentProps()} className={selectParts.content} {...{ [selectAttrs.content]: "" }}>
            <Input
              aria-label={searchPlaceholder}
              controlSize="sm"
              disabled={disabled}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              type="search"
              value={query}
            />
            <div aria-atomic="true" className={cx(comboboxParts.status, "sk-visually-hidden")} role="status">
              {resultsStatus}
            </div>
            {loading ? (
              <div className={comboboxParts.empty} role="presentation">
                <Loader size="sm" /> Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className={comboboxParts.empty} role="presentation">
                No users available
              </div>
            ) : (
              // `tabIndex={-1}`: `getListProps()` defaults it to 0 for a STANDALONE listbox
              // (`composite: false`'s other use case), but here the search input is the one real tab
              // stop; the list is reached through it via `aria-activedescendant`, never by Tab.
              <div {...api.getListProps()} tabIndex={-1}>
                {filteredUsers.map((user) => (
                  <div
                    {...api.getItemProps({ item: user })}
                    className={cx(selectParts.item, "sk-interactive")}
                    key={user.id}
                  >
                    <Inline align="center" as="span" gap="sm" wrap={false}>
                      <Avatar aria-hidden="true" name={user.name} size="sm" src={user.avatarUrl} />
                      <span className={comboboxParts.itemCopy}>
                        <span {...api.getItemTextProps({ item: user })} className={selectParts.itemText}>
                          {user.name}
                        </span>
                        {user.email ? (
                          <span className={cx(selectParts.itemText, comboboxParts.itemDescription)}>
                            {user.email}
                          </span>
                        ) : null}
                      </span>
                    </Inline>
                    <span {...api.getItemIndicatorProps({ item: user })} className={selectParts.itemIndicator}>
                      <Icon name="check" />
                    </span>
                  </div>
                ))}
                {filteredUsers.length === 0 ? (
                  <div className={comboboxParts.empty} role="presentation">
                    {`No users found for "${query}"`}
                  </div>
                ) : null}
              </div>
            )}
            {value.length > 0 ? (
              <Inline align="center" as="span" gap="sm" justify="between">
                <Text as="span" size="caption" tone="secondary">
                  {value.length} selected
                </Text>
                <Button onClick={() => api.clearValue()} size="sm" variant="ghost">
                  Clear all
                </Button>
              </Inline>
            ) : null}
          </div>
        </div>
      </Portal>
    </div>
  );
}
