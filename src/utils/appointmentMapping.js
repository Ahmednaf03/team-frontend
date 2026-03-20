/**
 * appointmentMapping.js
 * 
 * Centralized mapping for Patient and Doctor IDs to names.
 * Used for data enrichment when the backend doesn't return name fields.
 */

export const PATIENT_MAP = {
  1: 'John Doe',
  2: 'Jane Smith',
  3: 'Robert Kumar',
  4: 'Meena Iyer',
  5: 'Amit Sharma',
};

export const DOCTOR_MAP = {
  1:  'Dr. James Wilson',
  2:  'Dr. Emily Chen',
  3:  'Dr. Michael Brown',
  4:  'Dr. Sarah Davis',
  5:  'Dr. David Lee',
  6:  'Dr. Lisa Park',
  7:  'Dr. Ryan Clark',
  8:  'Dr. Karen White',
  9:  'Dr. Paul Harris',
  10: 'Dr. Priya Nair',
  11: 'Dr. Arjun Mehta',
  12: 'Dr. Sara Thomas',
};

export const getPatientName = (id) => PATIENT_MAP[id] || `Patient #${id}`;
export const getDoctorName  = (id) => DOCTOR_MAP[id]  || `Doctor #${id}`;

export const enrichAppointment = (appt) => ({
  ...appt,
  patient_name: appt.patient_name || getPatientName(appt.patient_id),
  doctor_name:  appt.doctor_name  || getDoctorName(appt.doctor_id),
});
