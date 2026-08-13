import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Driver = {
  id: string;
  driver_code: string;
  user_id: string | null;
  full_name: string;
  photo_url: string | null;
  mobile: string | null;
  address: string | null;
  aadhaar_number: string | null;
  license_number: string | null;
  joining_date: string | null;
  monthly_salary: number;
  daily_salary: number | null;
  assigned_vehicle_id: string | null;
  status: string;
};

export type Vehicle = {
  id: string;
  vehicle_number: string;
  brand: string | null;
  model: string | null;
  fuel_type: string;
  status: string;
  purchase_date: string | null;
  remarks: string | null;
};

export type FuelEntry = {
  id: string;
  entry_date: string;
  vehicle_id: string | null;
  driver_id: string | null;
  fuel_type: string;
  cng_quantity: number;
  petrol_quantity: number;
  fuel_cost: number;
  odometer: number | null;
  station_name: string | null;
  remarks: string | null;
};

export type Attendance = {
  id: string;
  driver_id: string;
  attendance_date: string;
  status: string;
  remarks: string | null;
};

export type SalaryRow = {
  id: string;
  driver_id: string;
  salary_month: string;
  monthly_salary: number;
  advance_given: number;
  salary_paid: number;
  remarks: string | null;
};

export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Driver[];
    },
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("vehicle_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Vehicle[];
    },
  });
}

export function useFuelEntries(filters?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["fuel", filters?.from, filters?.to],
    queryFn: async () => {
      let q = supabase.from("fuel_entries").select("*").order("entry_date", { ascending: false });
      if (filters?.from) q = q.gte("entry_date", filters.from);
      if (filters?.to) q = q.lte("entry_date", filters.to);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as FuelEntry[];
    },
  });
}

export function useAttendance(from: string, to: string) {
  return useQuery({
    queryKey: ["attendance", from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .gte("attendance_date", from)
        .lte("attendance_date", to);
      if (error) throw error;
      return (data ?? []) as Attendance[];
    },
  });
}

export function useSalaries(month?: string) {
  return useQuery({
    queryKey: ["salary", month],
    queryFn: async () => {
      let q = supabase.from("salary").select("*").order("salary_month", { ascending: false });
      if (month) q = q.eq("salary_month", month);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as SalaryRow[];
    },
  });
}

export const FUEL_TYPES = ["CNG", "Petrol", "Diesel", "Electric"] as const;
export const VEHICLE_STATUS = ["Active", "Under Maintenance", "Inactive"] as const;
export const DRIVER_STATUS = ["Active", "Inactive"] as const;
export const ATTENDANCE_STATUS = ["Present", "Absent", "Half Day", "Leave"] as const;
