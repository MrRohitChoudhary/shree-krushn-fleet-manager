// Server-only helpers for mirroring app data into the company Google Sheet.
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

export const SPREADSHEET_ID = "1wJf1zh-aoW970qmRe63dxlyqpQ1k3lxgldgSp1oB2LM";

export const SHEET_TABS = ["Drivers", "Vehicles", "Fuel", "Attendance", "Salary"] as const;
export type SheetTab = (typeof SHEET_TABS)[number];

function headers() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_SHEETS_API_KEY"];
  if (!lovableKey || !connectionKey) {
    throw new Error("Google Sheets connection is not configured for this project.");
  }
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connectionKey,
    "Content-Type": "application/json",
  };
}

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${GATEWAY_URL}${path}`, { ...init, headers: headers() });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[Sheets] request failed [${res.status}]: ${body}`);
    throw new Error(`Google Sheets request failed [${res.status}]: ${body}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

type SheetMeta = { properties?: { title?: string; sheetId?: number } };

export async function ensureTabs(tabs: readonly string[]) {
  const meta = (await request(`/spreadsheets/${SPREADSHEET_ID}`)) as { sheets?: SheetMeta[] };
  const existing = new Set((meta.sheets ?? []).map((s) => s.properties?.title ?? ""));
  const missing = tabs.filter((t) => !existing.has(t));
  if (missing.length === 0) return;
  await request(`/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      requests: missing.map((title) => ({ addSheet: { properties: { title } } })),
    }),
  });
}

export type CellValue = string | number;

export async function writeTab(tab: string, rows: CellValue[][]) {
  // Clear the tab first so deleted records disappear from the sheet too.
  await request(`/spreadsheets/${SPREADSHEET_ID}/values/${tab}!A1:ZZ100000:clear`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (rows.length === 0) return;
  const width = Math.max(...rows.map((r) => r.length));
  await request(
    `/spreadsheets/${SPREADSHEET_ID}/values/${tab}!A1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({
        range: `${tab}!A1`,
        majorDimension: "ROWS",
        values: rows.map((r) => [...r, ...Array(width - r.length).fill("")]),
      }),
    },
  );
}

export async function readTab(tab: string): Promise<CellValue[][]> {
  const data = (await request(`/spreadsheets/${SPREADSHEET_ID}/values/${tab}!A1:ZZ100000`)) as {
    values?: CellValue[][];
  };
  return data.values ?? [];
}
