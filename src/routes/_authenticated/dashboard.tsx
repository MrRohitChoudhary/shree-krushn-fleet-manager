import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  Users,
  UserCheck,
  Car,
  CarFront,
  Fuel,
  IndianRupee,
  CalendarCheck,
  Wallet,
  Plus,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/use-auth";
import { useAttendance, useDrivers, useFuelEntries, useSalaries, useVehicles } from "@/lib/queries";
import { inr, monthStartISO, monthEndISO, num, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Shree Krushna Enterprises" },
      {
        name: "description",
        content:
          "Live view of drivers, vehicles, daily and monthly fuel expenses, attendance and salary for Shree Krushna Enterprises.",
      },
      { property: "og:title", content: "Dashboard | Shree Krushna Enterprises" },
      {
        property: "og:description",
        content: "Fleet, fuel, attendance and salary overview for Shree Krushna Enterprises.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone?: "default" | "gold" | "navy";
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            tone === "gold"
              ? "bg-accent/20 text-accent-foreground"
              : tone === "navy"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="truncate text-xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { isOwner, isLoading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isOwner) navigate({ to: "/my", replace: true });
  }, [isLoading, isOwner, navigate]);

  const today = todayISO();
  const from = monthStartISO();
  const to = monthEndISO();

  const drivers = useDrivers();
  const vehicles = useVehicles();
  const monthFuel = useFuelEntries({ from, to });
  const attendance = useAttendance(today, today);
  const salaries = useSalaries(from);

  const stats = useMemo(() => {
    const d = drivers.data ?? [];
    const v = vehicles.data ?? [];
    const f = monthFuel.data ?? [];
    const a = attendance.data ?? [];
    const s = salaries.data ?? [];
    const todays = f.filter((e) => e.entry_date === today);
    const paid = s.reduce((t, r) => t + Number(r.salary_paid), 0);
    const pending = s.reduce(
      (t, r) => t + Math.max(Number(r.monthly_salary) - Number(r.advance_given) - Number(r.salary_paid), 0),
      0,
    );
    return {
      totalDrivers: d.length,
      activeDrivers: d.filter((x) => x.status === "Active").length,
      totalVehicles: v.length,
      activeVehicles: v.filter((x) => x.status === "Active").length,
      fuelAddedToday: todays.reduce((t, e) => t + Number(e.cng_quantity) + Number(e.petrol_quantity), 0),
      fuelExpenseToday: todays.reduce((t, e) => t + Number(e.fuel_cost), 0),
      fuelExpenseMonth: f.reduce((t, e) => t + Number(e.fuel_cost), 0),
      present: a.filter((x) => x.status === "Present" || x.status === "Half Day").length,
      absent: a.filter((x) => x.status === "Absent" || x.status === "Leave").length,
      salaryPaid: paid,
      salaryPending: pending,
    };
  }, [drivers.data, vehicles.data, monthFuel.data, attendance.data, salaries.data, today]);

  const dailyChart = useMemo(() => {
    const map = new Map<string, number>();
    (monthFuel.data ?? []).forEach((e) => {
      map.set(e.entry_date, (map.get(e.entry_date) ?? 0) + Number(e.fuel_cost));
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, cost]) => ({ day: date.slice(8), cost }));
  }, [monthFuel.data]);

  const vehicleChart = useMemo(() => {
    const map = new Map<string, number>();
    (monthFuel.data ?? []).forEach((e) => {
      const v = (vehicles.data ?? []).find((x) => x.id === e.vehicle_id);
      const key = v?.vehicle_number ?? "Unassigned";
      map.set(key, (map.get(key) ?? 0) + Number(e.fuel_cost));
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [monthFuel.data, vehicles.data]);

  const pieColors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ];

  const actions = [
    { to: "/drivers", label: "Add Driver" },
    { to: "/vehicles", label: "Add Vehicle" },
    { to: "/fuel", label: "Add Fuel Entry" },
    { to: "/attendance", label: "Attendance" },
    { to: "/salary", label: "Salary" },
    { to: "/reports", label: "Reports" },
  ] as const;

  return (
    <div>
      <PageHeader title="Dashboard" description="Today's operations at a glance" />

      <div className="mb-6 flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button key={a.to} asChild variant={a.label.startsWith("Add") ? "default" : "secondary"} size="sm">
            <Link to={a.to}>
              {a.label.startsWith("Add") && <Plus className="mr-1 h-4 w-4" />}
              {a.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Drivers" value={String(stats.totalDrivers)} icon={Users} tone="navy" />
        <StatCard label="Active Drivers" value={String(stats.activeDrivers)} icon={UserCheck} />
        <StatCard label="Total Vehicles" value={String(stats.totalVehicles)} icon={Car} tone="navy" />
        <StatCard label="Active Vehicles" value={String(stats.activeVehicles)} icon={CarFront} />
        <StatCard label="Fuel Added Today" value={`${num(stats.fuelAddedToday)} units`} icon={Fuel} tone="gold" />
        <StatCard label="Fuel Expense Today" value={inr(stats.fuelExpenseToday)} icon={IndianRupee} tone="gold" />
        <StatCard label="Fuel Expense This Month" value={inr(stats.fuelExpenseMonth)} icon={IndianRupee} tone="gold" />
        <StatCard label="Present Today" value={String(stats.present)} icon={CalendarCheck} />
        <StatCard label="Absent Today" value={String(stats.absent)} icon={CalendarCheck} />
        <StatCard label="Salary Paid (month)" value={inr(stats.salaryPaid)} icon={Wallet} />
        <StatCard label="Pending Salary (month)" value={inr(stats.salaryPending)} icon={Wallet} tone="navy" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Daily fuel expense this month</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(v: number) => inr(v)} />
                <Bar dataKey="cost" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Vehicle-wise share</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vehicleChart} dataKey="value" nameKey="name" outerRadius={90} label>
                  {vehicleChart.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => inr(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
