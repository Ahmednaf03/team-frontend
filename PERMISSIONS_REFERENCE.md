# Permissions Reference

This document summarizes the current role access rules based on both:

- frontend route guards in `src/routes/AppRouter.jsx`
- backend route middleware in `C:\wamp64\www\team-backend\src\routes\*.php`

## Defined Roles

Frontend roles currently referenced:

- `Admin`
- `Provider`
- `Nurse`
- `Receptionist`
- `Pharmacist`

Backend roles currently defined in schema/token flow:

- `admin`
- `provider`
- `nurse`
- `pharmacist`
- `receptionist`

Important mismatch:

- frontend and backend now both recognize `receptionist`, but receptionist permissions are intentionally minimal

## Frontend Page Access

Source: `src/routes/AppRouter.jsx`

| Area | Admin | Provider | Nurse | Receptionist | Pharmacist |
|---|---|---|---|---|---|
| Dashboard | Yes | Yes | Yes | Yes | Yes |
| Patients page | Yes | Yes | Yes | Yes | No |
| Appointments page | Yes | Yes | Yes | Yes | No |
| Prescriptions page | No | Yes | Yes | No | Yes |
| Billing page | Yes | Yes | No | No | Yes |
| Staff page | Yes | No | No | No | No |
| Settings page | Yes | Yes | Yes | Yes | Yes |

## Frontend Appointment UI Actions

Source: `src/pages/Appointments/appointmentPermissions.js`

| Appointment Action | Admin | Provider | Nurse | Receptionist |
|---|---|---|---|---|
| View appointments UI | Yes | Yes | Yes | Yes |
| Create appointment | Yes | Yes | Yes | Yes |
| Update or reschedule | Yes | Yes | No | No |
| Cancel appointment | Yes | Yes | No | No |
| Mark appointment completed | Yes | Yes | No | No |
| Delete appointment | Yes | No | No | No |
| Read patients for dropdown | Yes | Yes | Yes | Yes |
| Read doctors for dropdown | Yes | Yes | Yes | Yes |

## Backend Route Permissions

### Appointments

Source: `C:\wamp64\www\team-backend\src\routes\appointments.php`

| Endpoint | Allowed Roles |
|---|---|
| `GET /api/appointments` | `provider`, `nurse`, `admin`, `receptionist` |
| `GET /api/appointments/upcoming` | `provider`, `nurse`, `admin`, `receptionist` |
| `POST /api/appointments` | `provider`, `nurse`, `admin`, `receptionist` |
| `PUT /api/appointments/{id}` | `provider`, `admin` |
| `PATCH /api/appointments/{id}` cancel | `provider`, `admin` |
| `DELETE /api/appointments/{id}` | `admin` |

### Patients

Source: `C:\wamp64\www\team-backend\src\routes\patients.php`

| Endpoint | Allowed Roles |
|---|---|
| `GET /api/patients` | `admin`, `provider`, `nurse`, `receptionist` |
| `GET /api/patients/{id}` | `admin`, `provider`, `nurse`, `receptionist` |
| `POST /api/patients` | `admin` |
| `PUT /api/patients/{id}` | `admin` |
| `DELETE /api/patients/{id}` | `admin` |

### Staff

Source: `C:\wamp64\www\team-backend\src\routes\staff.php`

| Endpoint | Allowed Roles |
|---|---|
| `GET /api/staff` | Authenticated tenant user; no explicit role middleware in route file |
| `GET /api/staff/{id}` | Authenticated tenant user; no explicit role middleware in route file |
| `POST /api/staff` | `admin` |
| `PUT /api/staff/{id}` | `admin` |
| `DELETE /api/staff/{id}` | `admin` |

### Prescriptions

Source: `C:\wamp64\www\team-backend\src\routes\prescriptions.php`

| Endpoint | Allowed Roles |
|---|---|
| `GET /api/prescriptions` | `provider`, `admin`, `pharmacist`, `nurse` |
| `POST /api/prescriptions` | `provider`, `admin` |
| `POST /api/prescriptions/items` | `provider`, `admin` |
| `PATCH /api/prescriptions/verify/{id}` | `pharmacist`, `admin` |
| `PATCH /api/prescriptions/dispense/{id}` | `pharmacist`, `admin` |

### Billing

Source: `C:\wamp64\www\team-backend\src\routes\billing.php`

| Endpoint | Allowed Roles |
|---|---|
| `GET /api/billing` | `admin`, `provider` |
| `GET /api/billing/summary` | `admin`, `provider` |
| `POST /api/billing/{prescriptionId}` | `admin`, `provider`, `pharmacist` |
| `PATCH /api/billing/{invoiceId}` | `admin` |

### Dashboard API

Source: `C:\wamp64\www\team-backend\src\routes\dashboard.php`

| Endpoint | Allowed Roles |
|---|---|
| `GET /api/dashboard/patients-count` | `provider`, `nurse`, `admin` |
| `GET /api/dashboard/appointments-stats` | `provider`, `nurse`, `admin` |
| `GET /api/dashboard/prescription-summary` | `provider`, `nurse`, `admin` |
| `GET /api/dashboard/tenant-analytics` | `admin` |

### Notifications API

Source: `C:\wamp64\www\team-backend\src\routes\notifications.php`

| Endpoint | Allowed Roles |
|---|---|
| `GET /api/notifications` | `admin`, `provider`, `nurse`, `pharmacist`, `receptionist`, `staff`, `patient` |
| `PATCH /api/notifications/read/{id}` | `admin`, `provider`, `nurse`, `pharmacist`, `receptionist`, `staff`, `patient` |
| `PATCH /api/notifications/read-all` | `admin`, `provider`, `nurse`, `pharmacist`, `receptionist`, `staff`, `patient` |
| `DELETE /api/notifications` | `admin`, `provider`, `nurse`, `pharmacist`, `staff`, `patient` |

### Settings / Security

Source: `src/routes/AppRouter.jsx`

| Frontend Route | Allowed Roles |
|---|---|
| `/settings/users` | `Admin` |
| `/settings/security` | `Admin`, `Provider`, `Nurse`, `Receptionist`, `Pharmacist` |

## Known Frontend vs Backend Mismatches

- frontend now allows pharmacist to open Billing, but backend billing read routes in this reference still show `GET /api/billing` and `GET /api/billing/summary` as `admin`, `provider` only
- `/api/appointments/upcoming` currently crashes in the backend for receptionist probe testing despite route access being allowed

## Recommended Working Reference

If the team needs one practical rule set for the current app behavior, use this:

| Role | Can view patients | Can manage patients | Can view appointments | Can create appointments | Can update or cancel appointments | Can delete appointments | Can use prescriptions | Can use billing | Can manage staff and settings |
|---|---|---|---|---|---|---|---|---|---|
| Admin | Yes | Yes | Yes | Yes | Yes | Yes | No | Yes | Yes |
| Provider | Yes | No | Yes, own appointments/notifications only | Yes | Yes | No | Yes | Yes | Security settings only |
| Nurse | Yes | Add only in frontend; backend POST must allow it to work | Yes | Yes | No | No | Yes | No | Security settings only |
| Pharmacist | No | No | No | No | No | No | Yes | Yes in frontend, backend read access must match | Security settings only |
| Receptionist | Yes | Add only in frontend; backend POST must allow it to work | Yes | Yes | No | No | No | No | Security settings only |
