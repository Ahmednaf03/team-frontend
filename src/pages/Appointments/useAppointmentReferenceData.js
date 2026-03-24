import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../../services/axiosClient';
import { buildLookupMap, extractCollection } from '../../utils/appointmentMapping';
import { selectUserRole } from '../../modules/auth/selectors';
import { getAppointmentRoleCapabilities } from './appointmentPermissions';

const getDisplayName = (record) => {
  if (!record) return '';

  const firstName = record.first_name || record.firstName || '';
  const lastName = record.last_name || record.lastName || '';
  const combinedName = `${firstName} ${lastName}`.trim();

  return (
    record.full_name ||
    record.fullName ||
    record.display_name ||
    record.displayName ||
    record.name ||
    combinedName ||
    record.email ||
    ''
  );
};

const mapToOption = (record) => {
  const value = Number(record?.id ?? record?.value);
  const label = getDisplayName(record);

  if (!Number.isFinite(value) || !label) {
    return null;
  }

  return {
    value,
    label,
    raw: record,
  };
};

const fetchReferenceList = async (url, params = {}) => {
  const response = await axiosClient.get(url, {
    params,
    withCredentials: true,
  });
  return extractCollection(response.data);
};

const normalizeDoctorRecords = (records) => {
  if (!Array.isArray(records)) return [];

  const filtered = records.filter((record) => {
    const roleValue = `${record?.role || record?.staff_role || record?.designation || ''}`.toLowerCase();
    const statusValue = `${record?.status || ''}`.toLowerCase();

    const isActive = !statusValue || statusValue === 'active';
    const isDoctorRole =
      roleValue === 'provider' ||
      roleValue.includes('doctor') ||
      roleValue.includes('physician');

    return isActive && isDoctorRole;
  });

  return filtered
    .map(mapToOption)
    .filter(Boolean)
    .sort((a, b) => a.label.localeCompare(b.label));
};

const normalizePatientRecords = (records) =>
  (Array.isArray(records) ? records : [])
    .filter((record) => `${record?.status || 'active'}`.toLowerCase() === 'active')
    .map(mapToOption)
    .filter(Boolean)
    .sort((a, b) => a.label.localeCompare(b.label));

export default function useAppointmentReferenceData() {
  const userRole = useSelector(selectUserRole);
  const capabilities = useMemo(
    () => getAppointmentRoleCapabilities(userRole),
    [userRole]
  );
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadReferenceData = async () => {
      setLoading(true);

      try {
        const patientPromise = capabilities.canReadPatients
          ? fetchReferenceList('/patients', { per_page: 500 }).catch(() => [])
          : Promise.resolve([]);

        const doctorPromise = capabilities.canReadDoctors
          ? fetchReferenceList('/staff', { per_page: 500 }).catch(async () => {
              try {
                return await fetchReferenceList('/users', { per_page: 500 });
              } catch {
                return [];
              }
            })
          : Promise.resolve([]);

        const [patientRecords, doctorRecords] = await Promise.all([
          patientPromise,
          doctorPromise,
        ]);

        if (!isMounted) return;

        setPatients(normalizePatientRecords(patientRecords));
        setDoctors(normalizeDoctorRecords(doctorRecords));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReferenceData();

    return () => {
      isMounted = false;
    };
  }, [capabilities.canReadDoctors, capabilities.canReadPatients]);

  const patientLookup = useMemo(
    () => buildLookupMap(patients.map((item) => ({ id: item.value, name: item.label }))),
    [patients]
  );

  const doctorLookup = useMemo(
    () => buildLookupMap(doctors.map((item) => ({ id: item.value, name: item.label }))),
    [doctors]
  );

  return {
    patients,
    doctors,
    patientLookup,
    doctorLookup,
    loading,
    capabilities,
  };
}
