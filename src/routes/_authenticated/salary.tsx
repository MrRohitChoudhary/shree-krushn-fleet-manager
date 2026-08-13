import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ReportBrandHeader } from "@/components/brand";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAttendance, useDrivers, useSalaries } from "@/lib/queries";
import { exportToExcel } from "@/lib/excel";
import { daysInMonth, inr, monthLabel } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/salary")({
  head: () => ({
    meta: [
      { title: "Salary | Shree Krushna Enterprises" },
      {
        name: "description",
        content: "Monthly driver salary computation with advances, payments and pending balance.",
      },
      { property: "og:title", content: "Salary | Shree Krushna Enterprises" },
      { property: "og:description", content: "Driver salary computation and payment tracking." },
    ],
  }),
  component: SalaryPage,
});

function SalaryPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [year, mon] = month.split("-").map(Number);
  const total = daysInMonth(year!, mon! - 1);
  const from = `${month}-01`;
  const to = `${month}-${String(total).padStart(2, "0")}`;
  const drivers = useDrivers();
  const attendance = useAttendance(from, to);
  const salaries = useSalaries(from);
  const qc = useQueryClient();

  const rows = useMemo(() => {
    return (drivers.data ?? []).map((d) => {
      const recs = (attendance.data ?? []).filter((a) => a.driver_id === d.id);
      const present =
        recs.filter((a) => a.status === "Present").length +
        recs.filter((a) => a.status === "Half Day").length * 0.5;
      const row = (salaries.data ?? []).find((s) => s.driver_id === d.id);
      const monthly = Number(row?.monthly_salary ?? d.monthly_salary ?? 0);
      const perDay = d.daily_salary ? Number(d.daily_salary) : monthly / total;
      const earned = Math.round(perDay * present);
      const advance = Number(row?.advance_given ?? 0);
      const paid = Number(row?.salary_paid ?? 0);
      return {
        driver: d,
        present,
        monthly,
        earned,
        advance,
        paid,
        pending: Math.max(earned - advance - paid, 0),
      };
    });
  }, [drivers.data, attendance.data, salaries.data, total]);

  const upsert = useMutation({
    mutationFn: async (p: {
      driver_id: string;
      monthly_salary: number;
      advance_given: number;
      salary_paid: number;
    }) => {
      const { error } = await supabase
        .from("salary")
        .upsert({ ...p, salary_month: from }, { onConflict: "driver_id,salary_month" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["salary"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Salary" description={`Computed from attendance for ${monthLabel(from)}`}>
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="mr-1 h-4 w-4" /> Print
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            exportToExcel(
              rows.map((r) => ({
                Driver: r.driver.full_name,
                "Present Days": r.present,
                "Monthly Salary": r.monthly,
                Earned: r.earned,
                Advance: r.advance,
                Paid: r.paid,
                Pending: r.pending,
              })),
              "Salary",
              `salary-${month}`,
            )
          }
        >
          <Download className="mr-1 h-4 w-4" /> Excel
        </Button>
      </PageHeader>

      <ReportBrandHeader title={`Salary Statement — ${monthLabel(from)}`} />

      <Card className="rounded-2xl">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead className="text-right">Present days</TableHead>
                <TableHead className="text-right">Monthly salary</TableHead>
                <TableHead className="text-right">Earned</TableHead>
                <TableHead className="text-right">Advance</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Pending</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    Add drivers to compute salary.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.driver.id}>
                  <TableCell className="font-medium">{r.driver.full_name}</TableCell>
                  <TableCell className="text-right">{r.present}</TableCell>
                  <TableCell className="text-right">{inr(r.monthly)}</TableCell>
                  <TableCell className="text-right">{inr(r.earned)}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="ml-auto h-8 w-28 text-right no-print"
                      defaultValue={r.advance}
                      onBlur={(e) =>
                        upsert.mutate({
                          driver_id: r.driver.id,
                          monthly_salary: r.monthly,
                          advance_given: Number(e.target.value || 0),
                          salary_paid: r.paid,
                        })
                      }
                    />
                    <span className="hidden print:inline">{inr(r.advance)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="ml-auto h-8 w-28 text-right no-print"
                      defaultValue={r.paid}
                      onBlur={(e) =>
                        upsert.mutate({
                          driver_id: r.driver.id,
                          monthly_salary: r.monthly,
                          advance_given: r.advance,
                          salary_paid: Number(e.target.value || 0),
                        })
                      }
                    />
                    <span className="hidden print:inline">{inr(r.paid)}</span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{inr(r.pending)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
