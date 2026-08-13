import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ReportBrandHeader } from "@/components/brand";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDrivers, useFuelEntries, useVehicles } from "@/lib/queries";
import { exportToExcel } from "@/lib/excel";
import { formatDate, inr, monthEndISO, monthStartISO, num } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports | Shree Krushna Enterprises" },
      {
        name: "description",
        content: "Fuel and fleet reports with Excel export and print-ready statements.",
      },
      { property: "og:title", content: "Reports | Shree Krushna Enterprises" },
      { property: "og:description", content: "Exportable fuel and fleet reports." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(monthEndISO());
  const entries = useFuelEntries({ from, to });
  const vehicles = useVehicles();
  const drivers = useDrivers();

  const rows = useMemo(
    () =>
      (entries.data ?? []).map((e) => ({
        Date: e.entry_date,
        Vehicle: vehicles.data?.find((v) => v.id === e.vehicle_id)?.vehicle_number ?? "-",
        Driver: drivers.data?.find((d) => d.id === e.driver_id)?.full_name ?? "-",
        Type: e.fuel_type,
        Quantity: Number(e.cng_quantity) + Number(e.petrol_quantity),
        Cost: Number(e.fuel_cost),
      })),
    [entries.data, vehicles.data, drivers.data],
  );

  const totalCost = rows.reduce((t, r) => t + r.Cost, 0);

  return (
    <div>
      <PageHeader title="Reports" description="Fuel expense report for the selected period">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="mr-1 h-4 w-4" /> Print
        </Button>
        <Button variant="secondary" onClick={() => exportToExcel(rows, "Report", `fuel-report-${from}`)}>
          <Download className="mr-1 h-4 w-4" /> Excel
        </Button>
      </PageHeader>

      <ReportBrandHeader
        title="Fuel Expense Report"
        subtitle={`${formatDate(from)} to ${formatDate(to)}`}
      />

      <Card className="rounded-2xl">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No data for this period.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{formatDate(r.Date)}</TableCell>
                  <TableCell>{r.Vehicle}</TableCell>
                  <TableCell>{r.Driver}</TableCell>
                  <TableCell>{r.Type}</TableCell>
                  <TableCell className="text-right">{num(r.Quantity)}</TableCell>
                  <TableCell className="text-right">{inr(r.Cost)}</TableCell>
                </TableRow>
              ))}
              {rows.length > 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold">{inr(totalCost)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
