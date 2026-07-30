/*
 * The one live React demo /components/table still needs: a table whose paging is REACT STATE.
 *
 * The other three demos on that page are usage trees now, shared by both languages, and the React
 * components they used to need went with them. This one cannot follow: which rows are visible and
 * how many fit on a page are state, and a tree carries composition, not interaction.
 *
 * What it CAN share is the words, and it now does — every string below reads the same `demo.table.*`
 * keys the trees read. The alternative had already failed in the most visible way available: on the
 * SPANISH page, this stage said "Recent deployments", "Status", "When", "Successful" and "Rows per
 * page" while the stage beside it, of the same component, said "Despliegues recientes", "Estado",
 * "Cuándo", "Exitoso" and "Filas por página". Two bindings of one component, in two languages, side
 * by side. It had drifted into ITSELF too: "Servicio" and "Entorno" stayed Spanish inside the
 * English half.
 */
import { useMemo, useState } from "react";
import { Icon } from "@skryensya/react/icon";
import { Pagination } from "@skryensya/react/pagination";
import { Select } from "@skryensya/react/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@skryensya/react/table";
type Locale = "es" | "en";
type Translate = (k: string, v?: Record<string,string>) => string;
const useTranslations = (l: Locale): Translate => (k) => k;
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const PAGE_SIZES = ["5", "10", "25"] as const;

/*
 * The rows.
 *
 * Service names and environments are NOT translated, and that is a decision rather than an omission:
 * they are identifiers a team types into a terminal, and a `prod` rendered as "producción" would be
 * a word nobody uses standing where a value belongs.
 */
const services = ["API", "Worker", "Gateway", "Billing", "Auth", "Search"] as const;
const envs = ["prod", "staging", "dev"] as const;

const buildRows = (t: Translate) => {
  const statuses = [t("demo.table.succeeded"), t("demo.table.running"), t("demo.table.failed")];
  return Array.from({ length: 28 }, (_, index) => {
    const n = index + 1;
    return {
      id: `dep-${1040 + n}`,
      service: services[index % services.length]!,
      env: envs[index % envs.length]!,
      status: statuses[index % statuses.length]!,
      when:
        n < 10
          ? t("demo.table.minutesAgo", { n: String(n * 3) })
          : t("demo.table.hoursAgo", { n: String(n) }),
    };
  });
};

export const TablePagerDemo = framed(function TablePagerDemo({ lang = "es" }: { lang?: Locale }) {
  const t = useTranslations(lang);
  const rows = useMemo(() => buildRows(t), [t]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>("5");

  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pageCount);
  const slice = useMemo(
    () => rows.slice((current - 1) * size, (current - 1) * size + size),
    [rows, current, size],
  );

  const start = (current - 1) * size + 1;
  const end = Math.min(current * size, rows.length);

  return (
    <div className="sk-table-pager">
      <TableScroll aria-label={t("demo.table.deployments")} role="region" stickyColumn tabIndex={0}>
        <Table data-layout="fixed">
          <TableCaption>{t("demo.table.deployments")}</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>{t("demo.table.service")}</TableHeader>
              <TableHeader>{t("demo.table.environment")}</TableHeader>
              <TableHeader>{t("demo.table.status")}</TableHeader>
              <TableHeader>{t("demo.table.when")}</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {slice.map((row) => (
              <TableRow key={row.id}>
                <TableHeader scope="row">{row.id}</TableHeader>
                <TableCell>{row.service}</TableCell>
                <TableCell>{row.env}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.when}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScroll>

      <div className="sk-table-pager__bar">
        <div className="sk-table-pager__size">
          <Select
            label={t("demo.table.rowsPerPage")}
            defaultValue={["5"]}
            indicator={<Icon name="chevron-down" />}
            openIndicator={<Icon name="chevron-up" />}
            itemIndicator={<Icon name="check" />}
            options={PAGE_SIZES.map((n) => ({ value: n, label: n }))}
            onValueChange={(details) => {
              const next = details.value[0];
              if (next === "5" || next === "10" || next === "25") {
                setPageSize(next);
                // Back to the first page: the one you were on may not exist at the new size.
                setPage(1);
              }
            }}
          />
        </div>
        <div className="sk-table-pager__end">
          <div className="sk-table-pager__status">
            {t("demo.table.range", {
              start: String(start),
              end: String(end),
              total: String(rows.length),
            })}
          </div>
          <Pagination
            page={current}
            total={pageCount}
            onPageChange={setPage}
            label={t("demo.table.pagination")}
            previousLabel={t("demo.table.previousPage")}
            nextLabel={t("demo.table.nextPage")}
          />
        </div>
      </div>
    </div>
  );
});
