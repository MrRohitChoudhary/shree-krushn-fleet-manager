import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
import { FUEL_TYPES, VEHICLE_STATUS, useDrivers, useVehicles, type Vehicle } from "@/lib/queries";
import { exportToExcel } from "@/lib/excel";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/vehicles")({
  head: () => ({
    meta: [
      { title: "Vehicles | Shree Krushna Enterprises" },
      {
        name: "description",
        content:
          "Vehicle register with fuel type, status and assigned driver for the Shree Krushna Enterprises fleet.",
      },
      { property: "og:title", content: "Vehicles | Shree Krushna Enterprises" },
      { property: "og:description", content: "Fleet vehicle register and status tracking." },
    ],
  }),
  component: VehiclesPage,
});

type FormState = {
  vehicle_number: string;
  brand: string;
  model: string;
  fuel_type: string;
  status: string;
  purchase_date: string;
  remarks: string;
};

const empty: FormState = {
  vehicle_number: "",
  brand: "",
  model: "",
  fuel_type: "CNG",
  status: "Active",
  purchase_date: "",
  remarks: "",
};

function VehiclesPage() {
  const vehicles = useVehicles();
  const drivers = useDrivers();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const driverFor = (vehicleId: string) =>
    (drivers.data ?? []).find((d) => d.assigned_vehicle_id === vehicleId)?.full_name ?? "-";

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (vehicles.data ?? []).filter(
      (v) =>
        !q ||
        v.vehicle_number.toLowerCase().includes(q) ||
        (v.brand ?? "").toLowerCase().includes(q) ||
        (v.model ?? "").toLowerCase().includes(q),
    );
  }, [vehicles.data, search]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        vehicle_number: form.vehicle_number.trim().toUpperCase(),
        brand: form.brand.trim() || null,
        model: form.model.trim() || null,
        fuel_type: form.fuel_type,
        status: form.status,
        purchase_date: form.purchase_date || null,
        remarks: form.remarks.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("vehicles").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vehicles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Vehicle updated" : "Vehicle added");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vehicle deleted");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Vehicles" description="Fleet register and status">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicles"
            className="w-52 pl-8"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            exportToExcel(
              rows.map((v) => ({
                Vehicle: v.vehicle_number,
                Brand: v.brand ?? "",
                Model: v.model ?? "",
                "Fuel Type": v.fuel_type,
                Driver: driverFor(v.id),
                Purchased: v.purchase_date ?? "",
                Status: v.status,
              })),
              "Vehicles",
              "vehicles",
            )
          }
        >
          <Download className="mr-1 h-4 w-4" /> Excel
        </Button>
        <Button
          onClick={() => {
            setEditing(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> Add Vehicle
        </Button>
      </PageHeader>

      <Card className="rounded-2xl">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle No.</TableHead>
                <TableHead>Brand / Model</TableHead>
                <TableHead>Fuel</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Purchased</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No vehicles yet.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.vehicle_number}</TableCell>
                  <TableCell>{[v.brand, v.model].filter(Boolean).join(" ") || "-"}</TableCell>
                  <TableCell>{v.fuel_type}</TableCell>
                  <TableCell>{driverFor(v.id)}</TableCell>
                  <TableCell>{formatDate(v.purchase_date)}</TableCell>
                  <TableCell>
                    <Badge variant={v.status === "Active" ? "default" : "outline"}>{v.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(v);
                        setForm({
                          vehicle_number: v.vehicle_number,
                          brand: v.brand ?? "",
                          model: v.model ?? "",
                          fuel_type: v.fuel_type,
                          status: v.status,
                          purchase_date: v.purchase_date ?? "",
                          remarks: v.remarks ?? "",
                        });
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete vehicle ${v.vehicle_number}?`)) remove.mutate(v.id);
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
            <DialogDescription>Vehicle details and running status.</DialogDescription>
          </DialogHeader>
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label>Vehicle number</Label>
              <Input
                required
                placeholder="MH 12 AB 1234"
                value={form.vehicle_number}
                onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Fuel type</Label>
              <Select value={form.fuel_type} onValueChange={(v) => setForm({ ...form, fuel_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
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
                  {VEHICLE_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Purchase date</Label>
              <Input
                type="date"
                value={form.purchase_date}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Remarks</Label>
              <Textarea
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
