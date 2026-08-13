import * as XLSX from "xlsx";

export function exportToExcel(
  rows: Record<string, unknown>[],
  fileName: string,
  sheetName = "Report",
) {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Info: "No data" }]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 30));
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export async function readExcel(file: File): Promise<Record<string, unknown>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const first = wb.SheetNames[0];
  if (!first) return [];
  const sheet = wb.Sheets[first];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
}
