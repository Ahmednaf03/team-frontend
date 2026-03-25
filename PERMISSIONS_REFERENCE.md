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
| Prescriptions page | Yes | Yes | Yes | No | Yes |
| Billing page | Yes | Yes | No | No | No |
| Staff page | Yes | No | No | No | No |
| Settings page | Yes | No | No | No | No |

## Frontend Appointment UI Actions

Source: `src/pages/Appointments/appointmentPermissions.js`

| Appointment Action | Admin | Provider | Nurse | Receptionist |
|---|---|---|---|---|
| View appointments UI | Yes | Yes | Yes | Yes |
| Create appointment | Yes | Yes | No | Yes |
| Update or reschedule | Yes | Yes | No | No |
| Cancel appointment | Yes | Yes | No | No |
| Delete appointment | Yes | No | No | No |
| Read patients for dropdown | Yes | Yes | No | Yes |
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
| `GET /api/patients` | `admin`, `provider`, `receptionist` |
| `GET /api/patients/{id}` | `admin`, `provider`, `receptionist` |
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
| `GET /api/prescriptions` | `provider`, `admin`, `pharmacist` |
| `POST /api/prescriptions` | `provider`, `admin` |
| `POST /api/prescriptions/items` | `provider`, `admin` |
| `PATCH /api/prescriptions/verify/{id}` | `pharmacist`, `admin` |
| `PATCH /api/prescriptions/dispense/{id}` | `pharmacist`, `admin` |

### Billing

Source: `C:\wamp64\www\team-backend\src\routes\billing.php`

| Endpoint | Allowed Roles |
|---|---|
| `GET /api/billing` | `admin` |
| `GET /api/billing/summary` | `admin` |
| `POST /api/billing/{prescriptionId}` | `admin`, `pharmacist` |
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
| `GET /api/notifications` | `admin`, `provider`, `pharmacist`, `receptionist`, `staff`, `patient` |
| `PATCH /api/notifications/read/{id}` | `admin`, `provider`, `pharmacist`, `receptionist`, `staff`, `patient` |
| `PATCH /api/notifications/read-all` | `admin`, `provider`, `pharmacist`, `receptionist`, `staff`, `patient` |
| `DELETE /api/notifications` | `admin`, `provider`, `pharmacist`, `staff`, `patient` |

## Known Frontend vs Backend Mismatches

- frontend allows nurse on prescriptions page, but backend prescription routes do not
- frontend allows provider on billing page, but backend billing list and summary are admin-only
- frontend allows nurse on patients page, but backend `GET /api/patients` is limited to `admin` and `provider`
- backend allows nurse to create appointments, but frontend blocks it because nurses cannot currently fetch patient dropdown data
- `/api/appointments/upcoming` currently crashes in the backend for receptionist probe testing despite route access being allowed

## Recommended Working Reference

If the team needs one practical rule set for the current app behavior, use this:

| Role | Can view patients | Can manage patients | Can view appointments | Can create appointments | Can update or cancel appointments | Can delete appointments | Can use prescriptions | Can use billing | Can manage staff and settings |
|---|---|---|---|---|---|---|---|---|---|
| Admin | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Provider | Yes | No | Yes | Yes | Yes | No | Yes | Frontend yes, backend billing read no | No |
| Nurse | Frontend yes, backend no | No | Yes | No in frontend, yes in backend | No | No | Frontend yes, backend no | No | No |
| Pharmacist | No | No | No | No | No | No | Yes | Partial | No |
| Receptionist | Yes | No | Yes | Yes | No | No | No | No | No |
