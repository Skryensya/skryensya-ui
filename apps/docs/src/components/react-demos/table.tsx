/*
 * Live React demos for /components/table.
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@skryensya/react/table";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const TableBasicDemo = framed(function TableBasicDemo() {
  return (
    <TableScroll>
      <Table>
        <TableCaption>Available plans</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Plan</TableHeader>
            <TableHeader>Uso</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableHeader scope="row">Starter</TableHeader>
            <TableCell>Small teams</TableCell>
            <TableCell>Activo</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Prices do not include taxes.</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableScroll>
  );
});

const metrics = [
  ["API principal", "Madrid", "142 ms", "0,08%", "8,4 M", "v3.18.2"],
  ["Checkout", "Dublin", "218 ms", "0,21%", "3,1 M", "v2.9.0"],
  ["Identidad", "Frankfurt", "97 ms", "0,04%", "6,9 M", "v1.44.0"],
] as const;

export const TableStickyColumnDemo = framed(function TableStickyColumnDemo() {
  return (
    <TableScroll aria-labelledby="service-metrics-react" role="region" stickyColumn tabIndex={0}>
      <Table>
        <TableCaption id="service-metrics-react">Performance by region</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Servicio</TableHeader>
            <TableHeader>Region</TableHeader>
            <TableHeader>Latencia p95</TableHeader>
            <TableHeader>Error</TableHeader>
            <TableHeader>Solicitudes</TableHeader>
            <TableHeader>Version</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics.map(([service, region, latency, error, requests, version]) => (
            <TableRow key={service}>
              <TableHeader scope="row">{service}</TableHeader>
              <TableCell>{region}</TableCell>
              <TableCell>{latency}</TableCell>
              <TableCell>{error}</TableCell>
              <TableCell>{requests}</TableCell>
              <TableCell>{version}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
});

const deployments = [
  ["DEP-1082", "API", "Successful", "2 min ago"],
  ["DEP-1081", "Worker", "In progress", "6 min ago"],
  ["DEP-1080", "Gateway", "Successful", "18 min ago"],
  ["DEP-1079", "Billing", "Failed", "31 min ago"],
  ["DEP-1078", "Auth", "Successful", "48 min ago"],
] as const;

export const TableStickyHeaderDemo = framed(function TableStickyHeaderDemo() {
  return (
    <TableScroll
      aria-labelledby="deployment-history-react"
      role="region"
      stickyHeader
      style={{ maxBlockSize: "14rem" }}
      tabIndex={0}
    >
      <Table>
        <TableCaption id="deployment-history-react">Deployment history</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>ID</TableHeader>
            <TableHeader>Servicio</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Actualizado</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {deployments.map(([id, service, status, updated]) => (
            <TableRow key={id}>
              <TableHeader scope="row">{id}</TableHeader>
              <TableCell>{service}</TableCell>
              <TableCell>{status}</TableCell>
              <TableCell>{updated}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
});

type Deployment = { id: string; service: string; env: string; status: string; when: string };

const services = ["API", "Worker", "Gateway", "Billing", "Auth", "Search"] as const;
const envs = ["prod", "staging", "dev"] as const;
const statuses = ["Successful", "In progress", "Failed"] as const;

const pagerRows: Deployment[] = Array.from({ length: 28 }, (_, index) => {
  const n = index + 1;
  return {
    id: `dep-${1040 + n}`,
    service: services[index % services.length],
    env: envs[index % envs.length],
    status: statuses[index % statuses.length],
    when: n === 1 ? "2 min ago" : n < 10 ? `${n * 3} min ago` : `${n} h ago`,
  };
});

const PAGE_SIZES = ["5", "10", "25"] as const;

export const TablePagerDemo = framed(function TablePagerDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>("5");

  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(pagerRows.length / size));
  const current = Math.min(page, pageCount);
  const slice = useMemo(() => {
    const start = (current - 1) * size;
    return pagerRows.slice(start, start + size);
  }, [current, size]);

  const start = (current - 1) * size + 1;
  const end = Math.min(current * size, pagerRows.length);

  return (
    <div className="sk-table-pager">
      <TableScroll aria-label="Recent deployments" role="region" stickyColumn tabIndex={0}>
        <Table data-layout="fixed">
          <TableCaption>Recent deployments</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Servicio</TableHeader>
              <TableHeader>Entorno</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>When</TableHeader>
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
            label="Rows per page"
            defaultValue={["5"]}
            indicator={<Icon name="chevron-down" />}
            openIndicator={<Icon name="chevron-up" />}
            itemIndicator={<Icon name="check" />}
            options={PAGE_SIZES.map((n) => ({ value: n, label: n }))}
            onValueChange={(details) => {
              const next = details.value[0];
              if (next === "5" || next === "10" || next === "25") {
                setPageSize(next);
                setPage(1);
              }
            }}
          />
        </div>
        <div className="sk-table-pager__end">
          <div className="sk-table-pager__status">
            {start}–{end} de {pagerRows.length}
          </div>
          <Pagination
            page={current}
            total={pageCount}
            onPageChange={setPage}
            label="Pagination"
            previousLabel="Previous page"
            nextLabel="Next page"
          />
        </div>
      </div>
    </div>
  );
});
