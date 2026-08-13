export function inr(value: number | null | undefined) {
  const n = Number(value ?? 0);
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function num(value: number | null | undefined, digits = 2) {
  const n = Number(value ?? 0);
  return n.toLocaleString("en-IN", { maximumFractionDigits: digits });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthStartISO(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export function monthEndISO(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}

export function weekStartISO(d = new Date()) {
  const day = (d.getDay() + 6) % 7;
  const s = new Date(d);
  s.setDate(d.getDate() - day);
  return s.toISOString().slice(0, 10);
}

export function monthLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "-";
  const d = new Date(iso.length > 10 ? iso : iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
