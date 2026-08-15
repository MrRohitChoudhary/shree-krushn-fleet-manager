# Shree Krushn Fleet Manager

Project Name

Shree Krushn Enterprises Fleet Fuel & Driver Management System

Act as a Senior Full-Stack Software Engineer, Product Designer, UI/UX Designer, Fleet Management Software Architect, Database Engineer, and Supabase Expert.

Develop a modern, lightweight, responsive web application exclusively for Shree Krushn Enterprises.

This application is specifically designed to manage the company's drivers, vehicles, fuel expenses, attendance, and salary records. Do not build a generic fleet management ERP. Keep the application clean, professional, and easy to use for daily business operations.

Use the uploaded Shree Krushn Enterprises logo, company name, and company contact details throughout the application for branding.

The application must work perfectly on desktops, laptops, tablets, and smartphones.

Primary Objective

The application should help the company manage:

 Drivers

 Vehicles

 Daily CNG/Petrol expenses

 Driver Attendance

 Driver Salary

 Monthly Fuel Reports

The owner should always know:

 Which driver drove which vehicle

 How much fuel was added

 Daily fuel expenses

 Monthly fuel expenses

 Driver salary

 Attendance

 Active and inactive vehicles

Technology Stack

Frontend

 HTML

 CSS

 JavaScript

Backend

 Supabase

Authentication

 Supabase Authentication

Database

 Supabase PostgreSQL

Deployment

 Vercel (Frontend)

 Supabase (Backend)

The complete application should be deployable for free.

Branding

Use throughout the application:

Company Name

Shree Krushn Enterprises

Use:

 Company Logo

 Company Name

 Contact Details

Branding should appear on:

 Login Screen

 Dashboard

 Navigation Bar

 Footer

 Reports

User Roles

1. Owner

Complete Access

Can:

 Add Driver

 Edit Driver

 Delete Driver

 Add Vehicle

 Edit Vehicle

 Delete Vehicle

 Update Fuel Entries

 Mark Attendance

 Edit Attendance

 Manage Salary

 View Reports

 View Dashboard

2. Driver

Limited Access

Can:

 Login

 View Attendance

 View Salary

 View Assigned Vehicle

 View Fuel History of Assigned Vehicle

 View Monthly Summary

 Logout

Drivers must never be able to edit company records.

Dashboard

The Owner Dashboard should display:

 Total Drivers

 Active Drivers

 Total Vehicles

 Active Vehicles

 Fuel Added Today

 Fuel Expense Today

 Fuel Expense This Month

 Present Drivers

 Absent Drivers

 Salary Paid

 Pending Salary

Quick Action Buttons:

 Add Driver

 Add Vehicle

 Add Fuel Entry

 Attendance

 Salary

 Reports

Driver Management

The owner should be able to:

Add Driver

Edit Driver

Delete Driver

Each driver profile should include:

 Driver Name

 Driver Photo (Optional)

 Driver ID (Auto Generated)

 Mobile Number

 Address

 Aadhaar Number (Optional)

 Driving License Number (Optional)

 Joining Date

 Monthly Salary

 Daily Salary (Optional)

 Assigned Vehicle

 Driver Status

Status:

 Active

 Inactive

Vehicle Management

Owner can:

Add Vehicle

Edit Vehicle

Delete Vehicle

Vehicle Details:

 Vehicle Number

 Vehicle Model

 Vehicle Brand

 Fuel Type

Options:

 CNG

 Petrol

 Diesel

 Electric

Vehicle Status

 Active

 Under Maintenance

 Inactive

Assigned Driver

Purchase Date (Optional)

Remarks

Daily Fuel Management

The owner should easily record fuel expenses.

Every fuel entry should store:

 Date

 Vehicle Number

 Driver Name

 Fuel Type

 CNG Quantity

 Petrol Quantity

 Fuel Cost

 Odometer Reading (Optional)

 Fuel Station Name (Optional)

 Remarks

The system should automatically calculate:

Today's Fuel Expense

Weekly Fuel Expense

Monthly Fuel Expense

Vehicle-wise Expense

Driver-wise Expense

Attendance Module

Attendance should use a monthly calendar.

Owner can mark:

Present

Absent

Half Day

Leave

Every record stores:

Date

Driver Name

Attendance Status

Remarks

Attendance history should always be available.

Salary Module

For every driver store:

Monthly Salary

Advance Given

Salary Paid

Pending Salary

Automatically calculate:

Pending Salary = Monthly Salary - Advance - Salary Paid

Owner can edit at any time.

Driver Dashboard

After login, every driver should see only:

My Profile

Assigned Vehicle

Attendance Calendar

Salary Details

Salary Paid

Pending Salary

Fuel History of Assigned Vehicle

Monthly Summary

Logout

No editing permission.

Reports

Generate:

Monthly Fuel Report

Vehicle-wise Fuel Report

Driver-wise Fuel Report

Attendance Report

Salary Report

Pending Salary Report

Allow:

Export to Excel

Print Report

Search

Search using:

Driver Name

Driver ID

Vehicle Number

Mobile Number

Database

Use Supabase.

Create only the necessary tables.

drivers

vehicles

fuel_entries

attendance

salary

users

Avoid unnecessary tables.

Implement proper relationships between drivers, vehicles, attendance, salary, and fuel entries.

UI Design

Modern SaaS Dashboard

Professional

Minimal

Responsive

Fast

Easy to use

Color Theme

White

Dark Blue

Gold Accent

Rounded Cards

Professional Tables

Modern Icons

Responsive Sidebar

Beautiful Dashboard Charts

Interactive Calendar

Smooth Animations

Future Ready

Write scalable code so future features can be added without major changes, including:

 GPS Vehicle Tracking

 QR Attendance

 WhatsApp Notifications

 Vehicle Maintenance Scheduler

 Insurance Renewal Reminder

 Pollution Certificate Reminder

 Service History

 Expense Analytics

 Fuel Efficiency Reports

 Mobile App

Do not implement these features now.

Deployment

The completed application must:

 Work in any web browser

 Work on Android smartphones

 Work on iPhones

 Work on laptops and desktops

 Be responsive

 Use Supabase Cloud Database

 Support secure login

 Be deployable free using Vercel and Supabase

Deliverables

Generate:

 Complete HTML, CSS, and JavaScript code (no React, Vue, or Angular).

 Supabase database schema.

 SQL scripts for all required tables.

 Authentication setup using Supabase.

 Clean project folder structure.

 Deployment guide for Vercel + Supabase.

 Step-by-step setup instructions.

 Import and Export to Excel functionality.

 Responsive UI optimized for desktop and mobile.

The final application should feel like a professional fleet management tool built exclusively for Shree Krushn Enterprises, with its primary focus on driver management, vehicle management, fuel expense tracking, attendance, and salary management. It should be simple enough for daily use by the owner while providing drivers with a secure view of their own attendance, salary, assigned vehicle, and fuel records.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
