import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Download, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createDriverLogin } from "@/lib/admin.functions";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DRIVER_STATUS, useDrivers, useVehicles, type Driver } from "@/lib/queries";
import { exportToExcel } from "@/lib/excel";
import { formatDate, inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/drivers")({
  head: () => ({
    meta: [
      { title: "Drivers | Shree Krushna Enterprises" },
      {
        name: "description",
        content:
          "Manage driver profiles, salaries, vehicle assignment and login accounts for Shree Krushna Enterprises.",
      },
      { property: "og:title", content: "Drivers | Shree Krushna Enterprises" },
      { property: "og:description", content: "Driver records and login management." },
    ],
  }),
  component: DriversPage,
});

type FormState = {
  driver_code: string;
  full_name: string;
  mobile: string;
  address: string;
  aadhaar_number: string;
  license_number: string;
  joining_date: string;
  monthly_salary: string;
  daily_salary: string;
  assigned_vehicle_id: string;
  status: string;
};

const empty: FormState = {
  driver_code: "",
  full_name: "",
  mobile: "",
  address: "",
  aadhaar_number: "",
  license_number: "",
  joining_date: "",
  monthly_salary: "",
  daily_salary: "",
  assigned_vehicle_id: "none",
  status: "Active",
};

function DriversPage() {
  const drivers = useDrivers();
  const vehicles = useVehicles();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [loginFor, setLoginFor] = useState<Driver | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const vehicleLabel = (id: string | null) =>
    vehicles.data?.find((v) => v.id === id)?.vehicle_number ?? "-";

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (drivers.data ?? []).filter(
      (d) =>
        !q ||
        d.full_name.toLowerCase().includes(q) ||
        d.driver_code.toLowerCase().includes(q) ||
        (d.mobile ?? "").includes(q),
    );
  }, [drivers.data, search]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        driver_code: form.driver_code.trim(),
        full_name: form.full_name.trim(),
        mobile: form.mobile.trim() || null,
        address: form.address.trim() || null,
        aadhaar_number: form.aadhaar_number.trim() || null,
        license_number: form.license_number.trim() || null,
        joining_date: form.joining_date || null,
        monthly_salary: Number(form.monthly_salary || 0),
        daily_salary: form.daily_salary ? Number(form.daily_salary) : null,
        assigned_vehicle_id: form.assigned_vehicle_id === "none" ? null : form.assigned_vehicle_id,
        status: form.status,
      };
      if (editing) {
        const { error } = await supabase.from("drivers").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("drivers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Driver updated" : "Driver added");
      qc.invalidateQueries({ queryKey: ["drivers"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drivers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Driver deleted");
      qc.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createLogin = useMutation({
    mutationFn: async () => {
      if (!loginFor) return;
      await createDriverLogin({
        data: {
          driverId: loginFor.id,
          email: loginEmail.trim(),
          password: loginPassword,
        },
      });
    },
    onSuccess: () => {
      toast.success("Driver login created");
      qc.invalidateQueries({ queryKey: ["drivers"] });
      setLoginFor(null);
      setLoginEmail("");
      setLoginPassword("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setEditing(null);
    const next = (drivers.data?.length ?? 0) + 1;
    setForm({ ...empty, driver_code: `DRV${String(next).padStart(3, "0")}` });
    setOpen(true);
  }

  function openEdit(d: Driver) {
    setEditing(d);
    setForm({
      driver_code: d.driver_code,
      full_name: d.full_name,
      mobile: d.mobile ?? "",
      address: d.address ?? "",
      aadhaar_number: d.aadhaar_number ?? "",
      license_number: d.license_number ?? "",
      joining_date: d.joining_date ?? "",
      monthly_salary: String(d.monthly_salary ?? ""),
      daily_salary: d.daily_salary != null ? String(d.daily_salary) : "",
      assigned_vehicle_id: d.assigned_vehicle_id ?? "none",
      status: d.status,
    });
    setOpen(true);
  }

  function exportRows() {
    exportToExcel(
      rows.map((d) => ({
        Code: d.driver_code,
        Name: d.full_name,
        Mobile: d.mobile ?? "",
        Licence: d.license_number ?? "",
        Aadhaar: d.aadhaar_number ?? "",
        Joining: d.joining_date ?? "",
        "Monthly Salary": Number(d.monthly_salary),
        Vehicle: vehicleLabel(d.assigned_vehicle_id),
        Status: d.status,
      })),
      "Drivers",
      "drivers",
    );
  }

  return (
    <div>
      <PageHeader title="Drivers" description="Driver profiles, salaries and logins">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drivers"
            className="w-52 pl-8"
          />
        </div>
        <Button variant="secondary" onClick={exportRows}>
          <Download className="mr-1 h-4 w-4" /> Excel
        </Button>
        <Button onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> Add Driver
        </Button>
      </PageHeader>

      <Card className="rounded-2xl">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Joining</TableHead>
                <TableHead className="text-right">Monthly Salary</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    No drivers yet. Click "Add Driver" to create the first one.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.driver_code}</TableCell>
                  <TableCell>{d.full_name}</TableCell>
                  <TableCell>{d.mobile ?? "-"}</TableCell>
                  <TableCell>{vehicleLabel(d.assigned_vehicle_id)}</TableCell>
                  <TableCell>{formatDate(d.joining_date)}</TableCell>
                  <TableCell className="text-right">{inr(d.monthly_salary)}</TableCell>
                  <TableCell>
                    {d.user_id ? (
                      <Badge variant="secondary">Created</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setLoginFor(d);
                          setLoginEmail("");
                          setLoginPassword("");
                        }}
                      >
                        <KeyRound className="mr-1 h-3.5 w-3.5" /> Create
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.status === "Active" ? "default" : "outline"}>{d.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(d)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete driver ${d.full_name}?`)) remove.mutate(d.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit driver" : "Add driver"}</DialogTitle>
            <DialogDescription>Driver profile and salary details.</DialogDescription>
          </DialogHeader>
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Driver code</Label>
              <Input
                required
                value={form.driver_code}
                onChange={(e) => setForm({ ...form, driver_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input
                value={form.mobile}
                maxLength={15}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Licence number</Label>
              <Input
                value={form.license_number}
                onChange={(e) => setForm({ ...form, license_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Aadhaar number</Label>
              <Input
                value={form.aadhaar_number}
                onChange={(e) => setForm({ ...form, aadhaar_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Joining date</Label>
              <Input
                type="date"
                value={form.joining_date}
                onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly salary (₹)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.monthly_salary}
                onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Daily salary (₹)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.daily_salary}
                onChange={(e) => setForm({ ...form, daily_salary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned vehicle</Label>
              <Select
                value={form.assigned_vehicle_id}
                onValueChange={(v) => setForm({ ...form, assigned_vehicle_id: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not assigned</SelectItem>
                  {(vehicles.data ?? []).map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vehicle_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DRIVER_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save driver"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!loginFor} onOpenChange={(o) => !o && setLoginFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create login for {loginFor?.full_name}</DialogTitle>
            <DialogDescription>
              The driver will use these credentials to view only their own records.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              createLogin.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="text"
                required
                minLength={6}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createLogin.isPending}>
                {createLogin.isPending ? "Creating…" : "Create login"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
