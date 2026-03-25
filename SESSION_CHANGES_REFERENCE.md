# Session Changes Reference

This file summarizes the key changes made in this session across the frontend and backend.

## Frontend changes

### Landing page
- Updated `src/pages/Auth/LandingPage.jsx`
- Added a simple branded header using the same `NexaCare` name and `health.png` logo style as the shared header
- Added a simple footer
- Kept the existing hero, subdomain input, and feature cards intact

### Role dashboards
- Added reusable bento mock dashboard UI in `src/pages/Dashboard/BentoDashboard.jsx`
- Added role-based mock data/config in `src/pages/Dashboard/dashboardMockData.js`
- Replaced placeholder dashboards with role-specific mock boards:
  - `src/pages/Dashboard/AdminDashboard.jsx`
  - `src/pages/Dashboard/ProviderDashboard.jsx`
  - `src/pages/Dashboard/NurseDashboard.jsx`
  - `src/pages/Dashboard/ReceptionistDashboard.jsx`
  - `src/pages/Dashboard/PharmacistDashboard.jsx`

### Dashboard content mapping used
- `admin`: patients, appointments, prescription summary, staff mix, billing health, notifications
- `provider`: patient load, appointments, prescriptions, alerts
- `nurse`: shift focus, visit prep, medication coordination, alerts
- `receptionist`: scheduling, patient lookup context, front-desk notifications, invoice follow-up mockup
- `pharmacist`: prescription pipeline, medication billing, provider/pharmacy alerts

## Backend changes

Backend files were updated in `C:\wamp64\www\team-backend`.

### Receptionist role support
- Added `receptionist` as a real backend role in `src/schema/sass.sql`
- Added `receptionist` to backend staff-role allowlists in `src/Models/Staff.php`
- Updated notification staff mapping in `src/Controllers/NotificationController.php` so receptionist is treated as `staff`

### Receptionist permissions added
- Can log in as `receptionist`
- Can appear in staff records
- Can read appointments
- Can create appointments
- Can read patients for scheduling
- Can read notifications
- Can mark single notification read
- Can mark all notifications read

### Receptionist permissions intentionally not added
- Cannot delete appointments
- Cannot create/update/delete patients
- Cannot manage staff/settings
- Cannot read billing
- Cannot access prescriptions
- Cannot reschedule appointments
- Cannot cancel appointments
- Cannot clear all notifications

### Backend routes updated for receptionist
- `src/routes/appointments.php`
  - allowed on `GET /api/appointments`
  - allowed on `GET /api/appointments/upcoming`
  - allowed on `POST /api/appointments`
- `src/routes/patients.php`
  - allowed on `GET /api/patients`
  - allowed on `GET /api/patients/{id}` through the current combined route
- `src/routes/notifications.php`
  - allowed on `GET /api/notifications`
  - allowed on `PATCH /api/notifications/read/{id}`
  - allowed on `PATCH /api/notifications/read-all`

## Important backend bug fix

### Staff login hashing fix
- Fixed `src/Models/Staff.php`
- Staff creation was storing `email_hash` with plain SHA-256
- Login uses `Encryption::blindIndex(...)`
- Updated staff creation to also use `Encryption::blindIndex(...)`
- Result: newly created staff users now match the login lookup path correctly

Note:
- Previously created receptionist/staff records with the old bad hash will still fail login
- Recreate those records after the fix

## Communication message self-edit support

### Updated behavior
- Updated `src/routes/communication.php`
- Updated `src/Controllers/CommunicationController.php`

### Final edit rules
- Roles allowed to edit messages:
  - `provider`
  - `nurse`
  - `admin`
- `provider` and `nurse` can edit only their own messages
- `admin` currently has override and can edit any message
- Delete rules were not changed

### Response behavior
- Success: normal update success response
- If message does not exist: `404 Message not found`
- If user is not allowed to edit that message: `403 Forbidden`

## Operational notes

- I did not run `npm` commands after you asked me not to; future runtime checks are left to you unless you ask otherwise
- Backend schema change in `sass.sql` does not automatically update an already-existing live DB enum
- If needed in MySQL, the live DB still needs:

```sql
ALTER TABLE users
MODIFY role ENUM('admin','provider','nurse','pharmacist','receptionist') NOT NULL;
```

## Quick current state

- Landing page has branded header/footer
- Dashboards use reusable mock bento layouts by role
- Receptionist is now a supported backend role with minimal front-desk permissions
- New receptionist/staff users can log in correctly if created after the hashing fix
- Provider/nurse self-edit for communication messages is now enforced on the backend
