import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAttendance, useDrivers } from "@/lib/queries";
import { exportToExcel } from "@/lib/excel";
import { daysInMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance | Shree Krushna Enterprises" },
      {
        name: "description",
        content: "Monthly driver attendance calendar with present, absent, half day and leave marking.",
      },
      { property: "og:title", content: "Attendance | Shree Krushna Enterprises" },
      { property: "og:description", content: "Monthly driver attendance tracking." },
    ],
  }),
  component: AttendancePage,
});

const CYCLE = ["Present", "Absent", "Half Day", "Leave"] as const;
const SHORT: Record<string, string> = { Present: "P", Absent: "A", "Half Day": "H", Leave: "L" };

function AttendancePage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [year, mon] = month.split("-").map(Number);
  const total = daysInMonth(year!, mon! - 1);
  const from = `${month}-01`;
  const to = `${month}-${String(total).padStart(2, "0")}`;
  const drivers = useDrivers();
  const attendance = useAttendance(from, to);
  const qc = useQueryClient();

  const map = useMemo(() => {
    const m = new Map<string, string>();
    (attendance.data ?? []).forEach((a) => m.set(`${a.driver_id}|${a.attendance_date}`, a.status));
    return m;
  }, [attendance.data]);

  const mark = useMutation({
    mutationFn: async (p: { driver_id: string; attendance_date: string; status: string }) => {
      const { error } = await supabase
        .from("attendance")
        .upsert(p, { onConflict: "driver_id,attendance_date" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const days = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div>
      <PageHeader title="Attendance" description="Click a cell to cycle P → A → H → L">
        <Input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-44"
        />
        <Button
          variant="secondary"
          onClick={() =>
            exportToExcel(
              (drivers.data ?? []).map((d) => {
                const row: Record<string, string | number> = { Driver: d.full_name };
                let present = 0;
                days.forEach((day) => {
                  const date = `${month}-${String(day).padStart(2, "0")}`;
                  const s = map.get(`${d.id}|${date}`) ?? "";
                  row[String(day)] = s ? SHORT[s]! : "";
                  if (s === "Present") present += 1;
                  if (s === "Half Day") present += 0.5;
                });
                row["Present Days"] = present;
                return row;
              }),
              "Attendance",
              `attendance-${month}`,
            )
          }
        >
          <Download className="mr-1 h-4 w-4" /> Excel
        </Button>
      </PageHeader>

      <Card className="rounded-2xl">
        <CardContent className="overflow-x-auto p-3">
          <table className="w-full border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card px-2 text-left">Driver</th>
                {days.map((d) => (
                  <th key={d} className="w-7 text-center font-medium text-muted-foreground">
                    {d}
                  </th>
                ))}
                <th className="px-2 text-center">Days</th>
              </tr>
            </thead>
            <tbody>
              {(drivers.data ?? []).map((dr) => {
                let present = 0;
                return (
                  <tr key={dr.id}>
                    <td className="sticky left-0 whitespace-nowrap bg-card px-2 font-medium">
                      {dr.full_name}
                    </td>
                    {days.map((day) => {
                      const date = `${month}-${String(day).padStart(2, "0")}`;
                      const status = map.get(`${dr.id}|${date}`);
                      if (status === "Present") present += 1;
                      if (status === "Half Day") present += 0.5;
                      return (
                        <td key={day}>
                          <button
                            onClick={() => {
                              const idx = status ? CYCLE.indexOf(status as (typeof CYCLE)[number]) : -1;
                              const next = CYCLE[(idx + 1) % CYCLE.length]!;
                              mark.mutate({
                                driver_id: dr.id,
                                attendance_date: date,
                                status: next,
                              });
                            }}
                            className={cn(
                              "h-7 w-7 rounded-md border text-[11px] font-semibold transition-colors",
                              status === "Present" && "border-transparent bg-chart-2 text-white",
                              status === "Absent" && "border-transparent bg-destructive text-white",
                              status === "Half Day" && "border-transparent bg-accent text-accent-foreground",
                              status === "Leave" && "border-transparent bg-muted-foreground text-white",
                              !status && "border-border bg-background hover:bg-secondary",
                            )}
                          >
                            {status ? SHORT[status] : ""}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-2 text-center font-semibold">{present}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(drivers.data ?? []).length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Add drivers first.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
