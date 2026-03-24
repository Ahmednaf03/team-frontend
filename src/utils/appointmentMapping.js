const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const extractCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!isPlainObject(payload)) return [];

  const candidates = [
    payload.data,
    payload.items,
    payload.rows,
    payload.results,
    payload.records,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (isPlainObject(candidate) && Array.isArray(candidate.data)) {
      return candidate.data;
    }
  }

  return [];
};

export const unwrapAppointment = (payload) => {
  if (!isPlainObject(payload)) return payload;

  if (isPlainObject(payload.data) && !Array.isArray(payload.data)) {
    return unwrapAppointment(payload.data);
  }

  if (isPlainObject(payload.appointment)) {
    return unwrapAppointment(payload.appointment);
  }

  if (isPlainObject(payload.record)) {
    return unwrapAppointment(payload.record);
  }

  return payload;
};

const getDisplayName = (entity) => {
  if (!entity) return '';
  if (typeof entity === 'string') return entity;

  const firstName = entity.first_name || entity.firstName || '';
  const lastName = entity.last_name || entity.lastName || '';
  const combinedName = `${firstName} ${lastName}`.trim();

  return (
    entity.full_name ||
    entity.fullName ||
    entity.display_name ||
    entity.displayName ||
    entity.name ||
    entity.username ||
    entity.email ||
    combinedName ||
    ''
  );
};

const getFallbackPatientName = (id) =>
  id ? `Patient #${id}` : '';

const getFallbackDoctorName = (id) =>
  id ? `Doctor #${id}` : '';

const isGenericPatientName = (name, patientId) => {
  if (!name) return true;

  const normalized = String(name).trim().toLowerCase();

  return (
    normalized === 'patient' ||
    normalized === `patient #${patientId}` ||
    normalized === 'john doe' ||
    normalized === 'jane smith' ||
    normalized === 'robert kumar' ||
    normalized === 'meena iyer' ||
    normalized === 'amit sharma'
  );
};

const isGenericDoctorName = (name, doctorId) => {
  if (!name) return true;

  const normalized = String(name).trim().toLowerCase();

  return (
    normalized === 'doctor' ||
    normalized === `doctor #${doctorId}` ||
    normalized === 'dr. james wilson' ||
    normalized === 'dr. emily chen' ||
    normalized === 'dr. michael brown' ||
    normalized === 'dr. sarah davis' ||
    normalized === 'dr. david lee' ||
    normalized === 'dr. lisa park' ||
    normalized === 'dr. ryan clark' ||
    normalized === 'dr. karen white' ||
    normalized === 'dr. paul harris' ||
    normalized === 'dr. priya nair' ||
    normalized === 'dr. arjun mehta' ||
    normalized === 'dr. sara thomas'
  );
};

export const buildLookupMap = (records = []) =>
  records.reduce((acc, record) => {
    if (!record) return acc;

    const key = Number(record.id ?? record.value);
    const label = getDisplayName(record);

    if (Number.isFinite(key) && label) {
      acc[key] = label;
    }

    return acc;
  }, {});

export const enrichAppointment = (rawAppointment, lookups = {}) => {
  const appt = unwrapAppointment(rawAppointment) || {};
  const patientId = Number(appt.patient_id ?? appt.patient?.id ?? appt.patientId);
  const doctorId = Number(
    appt.doctor_id ??
      appt.doctor?.id ??
      appt.staff?.id ??
      appt.provider?.id ??
      appt.doctorId
  );

  const patientLookupName = lookups.patients?.[patientId];
  const doctorLookupName = lookups.doctors?.[doctorId];

  const rawPatientName =
    appt.patient_name ||
    appt.patientName ||
    getDisplayName(appt.patient);

  const rawDoctorName =
    appt.doctor_name ||
    appt.doctorName ||
    getDisplayName(appt.doctor) ||
    getDisplayName(appt.staff) ||
    getDisplayName(appt.provider);

  const patientName =
    (!isGenericPatientName(rawPatientName, patientId) && rawPatientName) ||
    patientLookupName ||
    rawPatientName ||
    getFallbackPatientName(patientId);

  const doctorName =
    (!isGenericDoctorName(rawDoctorName, doctorId) && rawDoctorName) ||
    doctorLookupName ||
    rawDoctorName ||
    getFallbackDoctorName(doctorId);

  return {
    ...appt,
    patient_id: Number.isFinite(patientId) ? patientId : appt.patient_id,
    doctor_id: Number.isFinite(doctorId) ? doctorId : appt.doctor_id,
    patient_name: patientName || '—',
    doctor_name: doctorName || '—',
    scheduled_at:
      appt.scheduled_at ||
      appt.scheduledAt ||
      appt.appointment_date ||
      appt.date_time ||
      null,
  };
};
