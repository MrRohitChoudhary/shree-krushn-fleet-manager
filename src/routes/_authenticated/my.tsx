import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAttendance, useFuelEntries, useSalaries } from "@/lib/queries";
import { formatDate, inr, monthEndISO, monthLabel, monthStartISO, num } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/my")({
  head: () => ({
    meta: [
      { title: "My Records | Shree Krushna Enterprises" },
      {
        name: "description",
        content: "Driver view of personal attendance, fuel entries and salary records.",
      },
      { property: "og:title", content: "My Records | Shree Krushna Enterprises" },
      { property: "og:description", content: "Your attendance, fuel and salary records." },
    ],
  }),
  component: MyPage,
});

function MyPage() {
  const from = monthStartISO();
  const to = monthEndISO();

  const me = useQuery({
    queryKey: ["my-driver"],
    queryFn: async () => {
      const { data, error } = await supabase.from("drivers").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const attendance = useAttendance(from, to);
  const fuel = useFuelEntries({ from, to });
  const salaries = useSalaries(from);

  const summary = useMemo(() => {
    const a = attendance.data ?? [];
    const present =
      a.filter((x) => x.status === "Present").length +
      a.filter((x) => x.status === "Half Day").length * 0.5;
    const s = salaries.data?.[0];
    return {
      present,
      absent: a.filter((x) => x.status === "Absent").length,
      fuelCost: (fuel.data ?? []).reduce((t, e) => t + Number(e.fuel_cost), 0),
      paid: Number(s?.salary_paid ?? 0),
      advance: Number(s?.advance_given ?? 0),
      monthly: Number(s?.monthly_salary ?? me.data?.monthly_salary ?? 0),
    };
  }, [attendance.data, fuel.data, salaries.data, me.data]);

  return (
    <div>
      <PageHeader
        title={me.data?.full_name ? `Hello, ${me.data.full_name}` : "My Records"}
        description={`Your records for ${monthLabel(from)}`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ["Present days", String(summary.present)],
          ["Absent days", String(summary.absent)],
          ["Fuel cost", inr(summary.fuelCost)],
          ["Advance taken", inr(summary.advance)],
          ["Salary paid", inr(summary.paid)],
        ].map(([label, value]) => (
          <Card key={label} className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">My fuel entries</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(fuel.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No fuel entries this month.
                  </TableCell>
                </TableRow>
              )}
              {(fuel.data ?? []).map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{formatDate(e.entry_date)}</TableCell>
                  <TableCell>{e.fuel_type}</TableCell>
                  <TableCell className="text-right">
                    {num(Number(e.cng_quantity) + Number(e.petrol_quantity))}
                  </TableCell>
                  <TableCell className="text-right">{inr(e.fuel_cost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
