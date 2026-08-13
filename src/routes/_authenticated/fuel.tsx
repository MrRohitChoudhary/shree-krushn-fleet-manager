import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { FUEL_TYPES, useDrivers, useFuelEntries, useVehicles } from "@/lib/queries";
import { exportToExcel } from "@/lib/excel";
import { formatDate, inr, monthEndISO, monthStartISO, num, todayISO } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/fuel")({
  head: () => ({
    meta: [
      { title: "Fuel Entries | Shree Krushna Enterprises" },
      {
        name: "description",
        content:
          "Record CNG and petrol refills with automatic daily, weekly and monthly fuel expense totals.",
      },
      { property: "og:title", content: "Fuel Entries | Shree Krushna Enterprises" },
      { property: "og:description", content: "Fuel recording and automated expense totals." },
    ],
  }),
  component: FuelPage,
});

function FuelPage() {
  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(monthEndISO());
  const entries = useFuelEntries({ from, to });
  const vehicles = useVehicles();
  const drivers = useDrivers();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    entry_date: todayISO(),
    vehicle_id: "none",
    driver_id: "none",
    fuel_type: "CNG",
    cng_quantity: "",
    petrol_quantity: "",
    fuel_cost: "",
    odometer: "",
    station_name: "",
  });

  const vName = (id: string | null) =>
    vehicles.data?.find((v) => v.id === id)?.vehicle_number ?? "-";
  const dName = (id: string | null) => drivers.data?.find((d) => d.id === id)?.full_name ?? "-";

  const totals = useMemo(() => {
    const list = entries.data ?? [];
    const today = todayISO();
    return {
      cost: list.reduce((t, e) => t + Number(e.fuel_cost), 0),
      cng: list.reduce((t, e) => t + Number(e.cng_quantity), 0),
      petrol: list.reduce((t, e) => t + Number(e.petrol_quantity), 0),
      today: list.filter((e) => e.entry_date === today).reduce((t, e) => t + Number(e.fuel_cost), 0),
    };
  }, [entries.data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("fuel_entries").insert({
        entry_date: form.entry_date,
        vehicle_id: form.vehicle_id === "none" ? null : form.vehicle_id,
        driver_id: form.driver_id === "none" ? null : form.driver_id,
        fuel_type: form.fuel_type,
        cng_quantity: Number(form.cng_quantity || 0),
        petrol_quantity: Number(form.petrol_quantity || 0),
        fuel_cost: Number(form.fuel_cost || 0),
        odometer: form.odometer ? Number(form.odometer) : null,
        station_name: form.station_name.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fuel entry added");
      qc.invalidateQueries({ queryKey: ["fuel"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fuel_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entry deleted");
      qc.invalidateQueries({ queryKey: ["fuel"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Fuel Entries" description="CNG / petrol refills and expenses">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        <Button
          variant="secondary"
          onClick={() =>
            exportToExcel(
              (entries.data ?? []).map((e) => ({
                Date: e.entry_date,
                Vehicle: vName(e.vehicle_id),
                Driver: dName(e.driver_id),
                "Fuel Type": e.fuel_type,
                "CNG (kg)": Number(e.cng_quantity),
                "Petrol (L)": Number(e.petrol_quantity),
                "Cost (₹)": Number(e.fuel_cost),
                Odometer: e.odometer ?? "",
                Station: e.station_name ?? "",
              })),
              "Fuel",
              "fuel-entries",
            )
          }
        >
          <Download className="mr-1 h-4 w-4" /> Excel
        </Button>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add Entry
        </Button>
      </PageHeader>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total cost (range)", inr(totals.cost)],
          ["Today's cost", inr(totals.today)],
          ["CNG filled", `${num(totals.cng)} kg`],
          ["Petrol filled", `${num(totals.petrol)} L`],
        ].map(([label, value]) => (
          <Card key={label} className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">CNG (kg)</TableHead>
                <TableHead className="text-right">Petrol (L)</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(entries.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No fuel entries in this range.
                  </TableCell>
                </TableRow>
              )}
              {(entries.data ?? []).map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{formatDate(e.entry_date)}</TableCell>
                  <TableCell>{vName(e.vehicle_id)}</TableCell>
                  <TableCell>{dName(e.driver_id)}</TableCell>
                  <TableCell>{e.fuel_type}</TableCell>
                  <TableCell className="text-right">{num(e.cng_quantity)}</TableCell>
                  <TableCell className="text-right">{num(e.petrol_quantity)}</TableCell>
                  <TableCell className="text-right font-medium">{inr(e.fuel_cost)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove.mutate(e.id)}>
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
            <DialogTitle>Add fuel entry</DialogTitle>
          </DialogHeader>
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                required
                value={form.entry_date}
                onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
              />
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
              <Label>Vehicle</Label>
              <Select value={form.vehicle_id} onValueChange={(v) => setForm({ ...form, vehicle_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not selected</SelectItem>
                  {(vehicles.data ?? []).map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vehicle_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Driver</Label>
              <Select value={form.driver_id} onValueChange={(v) => setForm({ ...form, driver_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not selected</SelectItem>
                  {(drivers.data ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CNG quantity (kg)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.cng_quantity}
                onChange={(e) => setForm({ ...form, cng_quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Petrol quantity (L)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.petrol_quantity}
                onChange={(e) => setForm({ ...form, petrol_quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fuel cost (₹)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.fuel_cost}
                onChange={(e) => setForm({ ...form, fuel_cost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Odometer (km)</Label>
              <Input
                type="number"
                min="0"
                value={form.odometer}
                onChange={(e) => setForm({ ...form, odometer: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Station name</Label>
              <Input
                value={form.station_name}
                onChange={(e) => setForm({ ...form, station_name: e.target.value })}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
