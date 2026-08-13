# Shree Krushna Enterprises — Fleet Fuel & Driver Management

A private, mobile-friendly web app for managing drivers, vehicles, fuel expenses, attendance and salary, branded with the company logo and phone numbers 7721803390 / 7756803390.

## One note on the stack

This project runs on React + TanStack Start (the Lovable stack); plain HTML/CSS/JS pages are not supported here. Everything requested is still delivered — same features, same look, same free hosting — with the backend on Lovable Cloud (Supabase Postgres + Auth + Storage). No external accounts or manual SQL setup needed; publishing is one click.

## Design

- White base, deep navy (#0E2A47-family) panels, gold accents — taken from the logo.
- Responsive sidebar (collapses to bottom/hamburger nav on phones), rounded cards, clean tables, subtle animations.
- Logo + company name in sidebar, login screen, and report headers; phone numbers in footer and reports.

## Roles

- **Owner** — full access to everything.
- **Driver** — read-only view of own profile, assigned vehicle, attendance, salary and that vehicle's fuel history.
- Driver accounts are created by the owner (email + temporary password) from the driver form; the driver logs in and sees only their own data.

## Screens

1. **Login** — branded, email/password.
2. **Owner dashboard** — total/active drivers, total/active vehicles, fuel added today, fuel expense today, this month, present/absent today, salary paid vs pending, plus a monthly fuel trend chart and vehicle-wise breakdown. Quick actions: Add Driver, Add Vehicle, Add Fuel Entry, Attendance, Salary, Reports.
3. **Drivers** — list with search (name, driver ID, mobile), add/edit/delete, optional photo upload, auto driver ID, mobile, address, Aadhaar, licence, joining date, monthly + daily salary, assigned vehicle, active/inactive.
4. **Vehicles** — list + search by number, add/edit/delete, number, brand, model, fuel type (CNG/Petrol/Diesel/Electric), status (Active / Under Maintenance / Inactive), assigned driver, purchase date, remarks.
5. **Fuel entries** — date, vehicle, driver, fuel type, CNG qty, petrol qty, cost, odometer, station, remarks; filters by date range/vehicle/driver with running totals (today, week, month).
6. **Attendance** — monthly calendar grid, mark Present / Absent / Half Day / Leave per driver per day, remarks, editable history.
7. **Salary** — per driver per month: monthly salary, advance, paid, pending auto-computed as salary − advance − paid; editable.
8. **Reports** — monthly fuel, vehicle-wise, driver-wise, attendance, salary, pending salary. Export to Excel (.xlsx) and print-friendly layout with branding.
9. **Driver portal** — profile, assigned vehicle, attendance calendar, salary summary, fuel history of assigned vehicle, monthly summary, logout.

## Data model (Lovable Cloud)

- `profiles` — one row per auth user (name, linked driver).
- `user_roles` — separate roles table (`owner` / `driver`) with a security-definer `has_role()` check.
- `drivers` — profile fields, salary fields, status, optional `user_id` link, photo URL.
- `vehicles` — details, fuel type, status, assigned driver.
- `fuel_entries` — date, vehicle, driver, quantities, cost, odometer, station, remarks.
- `attendance` — driver, date, status, remarks (unique per driver/date).
- `salary` — driver, month, monthly salary, advance, paid; pending computed.
- Row-level security: owners read/write everything; drivers read only rows tied to their own driver record. Driver photos in a storage bucket.

## Technical notes

- Data access through TanStack Start server functions with Supabase auth middleware; protected routes under an authenticated layout.
- Excel export via SheetJS on the client; print via a dedicated print stylesheet.
- Schema and code kept modular so future GPS tracking, QR attendance, WhatsApp alerts, maintenance/insurance/PUC reminders and analytics can be added without rework — none of those are built now.

## Build order

1. Enable Lovable Cloud, create schema + RLS, seed the owner role.
2. Branding, layout shell, login, auth guards.
3. Drivers and vehicles CRUD.
4. Fuel entries + dashboard metrics/charts.
5. Attendance calendar and salary.
6. Reports with Excel export and print.
7. Driver portal, responsive polish.
