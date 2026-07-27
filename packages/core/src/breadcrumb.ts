export type BreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
};

export const breadcrumbParts = {
  root: "sk-breadcrumb",
  list: "sk-breadcrumb__list",
  item: "sk-breadcrumb__item",
  link: "sk-breadcrumb__link",
  current: "sk-breadcrumb__current",
  separator: "sk-breadcrumb__separator",
} as const;
