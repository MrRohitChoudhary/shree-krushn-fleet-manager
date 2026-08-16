import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { ensureTabs, readTab, writeTab, SHEET_TABS, type CellValue } from "./sheets.server";

type DB = SupabaseClient<Database>;

export const HEADERS = {
  Drivers: [
    "ID",
    "Driver Code",
    "Full Name",
    "Mobile",
    "Address",
    "Aadhaar",
    "License",
    "Joining Date",
    "Monthly Salary",
    "Daily Salary",
    "Vehicle Number",
    "Status",
  ],
  Vehicles: ["ID", "Vehicle Number", "Brand", "Model", "Fuel Type", "Status", "Purchase Date", "Remarks"],
  Fuel: [
    "ID",
    "Date",
    "Vehicle Number",
    "Driver Name",
    "Fuel Type",
    "CNG Qty",
    "Petrol Qty",
    "Fuel Cost",
    "Odometer",
    "Station",
    "Remarks",
  ],
  Attendance: ["ID", "Date", "Driver Name", "Status", "Remarks"],
  Salary: ["ID", "Month", "Driver Name", "Monthly Salary", "Advance Given", "Salary Paid", "Remarks"],
} as const;

const txt = (v: unknown): CellValue => (v === null || v === undefined ? "" : String(v));
const num = (v: unknown): CellValue => (v === null || v === undefined || v === "" ? "" : Number(v));

async function loadAll(db: DB) {
  const [drivers, vehicles, fuel, attendance, salary] = await Promise.all([
    db.from("drivers").select("*").order("full_name"),
    db.from("vehicles").select("*").order("vehicle_number"),
    db.from("fuel_entries").select("*").order("entry_date", { ascending: false }),
    db.from("attendance").select("*").order("attendance_date", { ascending: false }),
    db.from("salary").select("*").order("salary_month", { ascending: false }),
  ]);
  for (const r of [drivers, vehicles, fuel, attendance, salary]) {
    if (r.error) throw new Error(r.error.message);
  }
  return {
    drivers: drivers.data ?? [],
    vehicles: vehicles.data ?? [],
    fuel: fuel.data ?? [],
    attendance: attendance.data ?? [],
    salary: salary.data ?? [],
  };
}

export async function pushAllToSheet(db: DB) {
  const { drivers, vehicles, fuel, attendance, salary } = await loadAll(db);
  const vehicleNumber = new Map(vehicles.map((v) => [v.id, v.vehicle_number]));
  const driverName = new Map(drivers.map((d) => [d.id, d.full_name]));

  await ensureTabs(SHEET_TABS);

  await writeTab("Drivers", [
    [...HEADERS.Drivers],
    ...drivers.map((d) => [
      txt(d.id),
      txt(d.driver_code),
      txt(d.full_name),
      txt(d.mobile),
      txt(d.address),
      txt(d.aadhaar_number),
      txt(d.license_number),
      txt(d.joining_date),
      num(d.monthly_salary),
      num(d.daily_salary),
      txt(d.assigned_vehicle_id ? vehicleNumber.get(d.assigned_vehicle_id) : ""),
      txt(d.status),
    ]),
  ]);

  await writeTab("Vehicles", [
    [...HEADERS.Vehicles],
    ...vehicles.map((v) => [
      txt(v.id),
      txt(v.vehicle_number),
      txt(v.brand),
      txt(v.model),
      txt(v.fuel_type),
      txt(v.status),
      txt(v.purchase_date),
      txt(v.remarks),
    ]),
  ]);

  await writeTab("Fuel", [
    [...HEADERS.Fuel],
    ...fuel.map((f) => [
      txt(f.id),
      txt(f.entry_date),
      txt(f.vehicle_id ? vehicleNumber.get(f.vehicle_id) : ""),
      txt(f.driver_id ? driverName.get(f.driver_id) : ""),
      txt(f.fuel_type),
      num(f.cng_quantity),
      num(f.petrol_quantity),
      num(f.fuel_cost),
      num(f.odometer),
      txt(f.station_name),
      txt(f.remarks),
    ]),
  ]);

  await writeTab("Attendance", [
    [...HEADERS.Attendance],
    ...attendance.map((a) => [
      txt(a.id),
      txt(a.attendance_date),
      txt(driverName.get(a.driver_id)),
      txt(a.status),
      txt(a.remarks),
    ]),
  ]);

  await writeTab("Salary", [
    [...HEADERS.Salary],
    ...salary.map((s) => [
      txt(s.id),
      txt(s.salary_month),
      txt(driverName.get(s.driver_id)),
      num(s.monthly_salary),
      num(s.advance_given),
      num(s.salary_paid),
      txt(s.remarks),
    ]),
  ]);

  return {
    drivers: drivers.length,
    vehicles: vehicles.length,
    fuel: fuel.length,
    attendance: attendance.length,
    salary: salary.length,
  };
}

const cell = (row: CellValue[], i: number) => String(row[i] ?? "").trim();
const numOrNull = (row: CellValue[], i: number) => {
  const v = cell(row, i);
  return v === "" ? null : Number(v);
};
const strOrNull = (row: CellValue[], i: number) => {
  const v = cell(row, i);
  return v === "" ? null : v;
};

export async function pullFromSheet(db: DB) {
  const { drivers, vehicles } = await loadAll(db);
  const vehicleByNumber = new Map(vehicles.map((v) => [v.vehicle_number.toUpperCase(), v.id]));
  const driverByName = new Map(drivers.map((d) => [d.full_name.trim().toLowerCase(), d.id]));
  const counts = { vehicles: 0, drivers: 0, fuel: 0, attendance: 0, salary: 0 };

  const vehicleRows = (await readTab("Vehicles")).slice(1).filter((r) => cell(r, 1));
  for (const r of vehicleRows) {
    const payload = {
      vehicle_number: cell(r, 1),
      brand: strOrNull(r, 2),
      model: strOrNull(r, 3),
      fuel_type: cell(r, 4) || "CNG",
      status: cell(r, 5) || "Active",
      purchase_date: strOrNull(r, 6),
      remarks: strOrNull(r, 7),
    };
    const id = cell(r, 0);
    const res = id
      ? await db.from("vehicles").update(payload).eq("id", id)
      : await db.from("vehicles").insert(payload);
    if (res.error) throw new Error(`Vehicles: ${res.error.message}`);
    counts.vehicles += 1;
  }

  const driverRows = (await readTab("Drivers")).slice(1).filter((r) => cell(r, 2));
  for (const r of driverRows) {
    const payload = {
      full_name: cell(r, 2),
      mobile: strOrNull(r, 3),
      address: strOrNull(r, 4),
      aadhaar_number: strOrNull(r, 5),
      license_number: strOrNull(r, 6),
      joining_date: strOrNull(r, 7),
      monthly_salary: numOrNull(r, 8) ?? 0,
      daily_salary: numOrNull(r, 9),
      assigned_vehicle_id: vehicleByNumber.get(cell(r, 10).toUpperCase()) ?? null,
      status: cell(r, 11) || "Active",
    };
    const id = cell(r, 0);
    const res = id
      ? await db.from("drivers").update(payload).eq("id", id)
      : await db.from("drivers").insert(payload);
    if (res.error) throw new Error(`Drivers: ${res.error.message}`);
    counts.drivers += 1;
  }

  const fuelRows = (await readTab("Fuel")).slice(1).filter((r) => cell(r, 1));
  for (const r of fuelRows) {
    const payload = {
      entry_date: cell(r, 1),
      vehicle_id: vehicleByNumber.get(cell(r, 2).toUpperCase()) ?? null,
      driver_id: driverByName.get(cell(r, 3).toLowerCase()) ?? null,
      fuel_type: cell(r, 4) || "CNG",
      cng_quantity: numOrNull(r, 5) ?? 0,
      petrol_quantity: numOrNull(r, 6) ?? 0,
      fuel_cost: numOrNull(r, 7) ?? 0,
      odometer: numOrNull(r, 8),
      station_name: strOrNull(r, 9),
      remarks: strOrNull(r, 10),
    };
    const id = cell(r, 0);
    const res = id
      ? await db.from("fuel_entries").update(payload).eq("id", id)
      : await db.from("fuel_entries").insert(payload);
    if (res.error) throw new Error(`Fuel: ${res.error.message}`);
    counts.fuel += 1;
  }

  const attRows = (await readTab("Attendance")).slice(1).filter((r) => cell(r, 1) && cell(r, 2));
  for (const r of attRows) {
    const driverId = driverByName.get(cell(r, 2).toLowerCase());
    if (!driverId) continue;
    const res = await db.from("attendance").upsert(
      {
        driver_id: driverId,
        attendance_date: cell(r, 1),
        status: cell(r, 3) || "Present",
        remarks: strOrNull(r, 4),
      },
      { onConflict: "driver_id,attendance_date" },
    );
    if (res.error) throw new Error(`Attendance: ${res.error.message}`);
    counts.attendance += 1;
  }

  const salRows = (await readTab("Salary")).slice(1).filter((r) => cell(r, 1) && cell(r, 2));
  for (const r of salRows) {
    const driverId = driverByName.get(cell(r, 2).toLowerCase());
    if (!driverId) continue;
    const res = await db.from("salary").upsert(
      {
        driver_id: driverId,
        salary_month: cell(r, 1),
        monthly_salary: numOrNull(r, 3) ?? 0,
        advance_given: numOrNull(r, 4) ?? 0,
        salary_paid: numOrNull(r, 5) ?? 0,
        remarks: strOrNull(r, 6),
      },
      { onConflict: "driver_id,salary_month" },
    );
    if (res.error) throw new Error(`Salary: ${res.error.message}`);
    counts.salary += 1;
  }

  return counts;
}
