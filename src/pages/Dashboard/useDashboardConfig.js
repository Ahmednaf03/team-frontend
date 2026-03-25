import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../services/axiosClient';
import { dashboardRoleMap } from './dashboardMockData';

const withCredentialsConfig = {
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
};

const fetchWrapped = async (url, params = {}) => {
  const response = await axiosClient.get(url, {
    ...withCredentialsConfig,
    params,
  });
  return response.data?.data ?? response.data;
};

const fetchWrappedWithDebug = async (url, params = {}, debugLabel = url) => {
  try {
    const data = await fetchWrapped(url, params);
    console.log(`Dashboard debug success: ${debugLabel}`, data);
    return data;
  } catch (error) {
    console.error(`Dashboard debug failure: ${debugLabel}`, {
      status: error?.response?.status,
      data: error?.response?.data,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Unknown dashboard error',
    });
    throw error;
  }
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const notificationItemsFromData = (notifications = []) =>
  normalizeArray(notifications).map((item) => ({
    id: item.id,
    title: item.title || item.type || 'Notification',
    meta: item.message || 'No details available',
    badge: item.is_read ? 'Read' : 'Unread',
  }));

const appointmentTrendItemsFromStats = (stats = {}) => [
  { label: 'Total', value: Number(stats.total || 0) },
  { label: 'Scheduled', value: Number(stats.scheduled || 0) },
  { label: 'Cancelled', value: Number(stats.cancelled || 0) },
  { label: 'Completed', value: Number(stats.completed || 0) },
];

const buildAdminDashboardConfig = ({
  patientsCount,
  appointmentStats,
  prescriptionSummary,
  staff,
  invoices,
  notifications,
}) => {
  const notificationItems = notificationItemsFromData(notifications);
  const appointmentTrendItems = appointmentTrendItemsFromStats(appointmentStats);

  return {
    hero: {
      kicker: 'Admin overview',
      title: 'Keep operations balanced across patients, staff, billing, and activity.',
      description:
        'The admin board surfaces the broadest operational signals first: growth, scheduling pressure, pharmacy volume, staffing mix, and recent notifications.',
      highlights: [
        { label: 'Patients', value: patientsCount },
        { label: 'Appointments', value: appointmentStats.total },
        { label: 'Prescriptions', value: prescriptionSummary.total_prescriptions },
      ],
    },
    topStats: [
      {
        label: 'Staff members',
        value: staff.length,
        hint: 'Providers, nurses, and pharmacists currently active',
      },
      {
        label: 'Pending invoices',
        value: invoices.filter((item) => item.status === 'PENDING').length,
        hint: 'Outstanding collections needing follow-up',
      },
    ],
    tiles: [
      {
        id: 'admin-patient-metric',
        type: 'metric',
        title: 'Patient volume',
        subtitle: 'Quick pulse on current patient footprint.',
        icon: 'patients',
        value: patientsCount,
        caption: 'Total registered patients',
        cols: 3,
        minHeight: 220,
      },
      {
        id: 'admin-appointments',
        type: 'metric',
        title: 'Appointment throughput',
        subtitle: 'Snapshot from the appointment stats endpoint.',
        icon: 'appointments',
        value: appointmentStats.total,
        caption: 'Total appointment records',
        stats: [
          { label: 'Scheduled', value: appointmentStats.scheduled },
          { label: 'Cancelled', value: appointmentStats.cancelled },
          { label: 'Completed', value: appointmentStats.completed },
          {
            label: 'Open rate',
            value:
              appointmentStats.total > 0
                ? `${Math.round((appointmentStats.scheduled / appointmentStats.total) * 100)}%`
                : '0%',
          },
        ],
        cols: 5,
        minHeight: 260,
      },
      {
        id: 'admin-prescription-summary',
        type: 'metric',
        title: 'Prescription summary',
        subtitle: 'Total medication workload from clinical teams.',
        icon: 'prescriptions',
        value: prescriptionSummary.total_prescriptions,
        caption: 'Prescriptions issued so far',
        cols: 4,
        minHeight: 220,
      },
      {
        id: 'admin-staff',
        type: 'staff',
        title: 'Staff mix',
        subtitle: 'Who is currently powering care delivery.',
        icon: 'staff',
        items: staff,
        cols: 7,
        minHeight: 380,
      },
      {
        id: 'admin-billing',
        type: 'revenue',
        title: 'Billing health',
        subtitle: 'Revenue realized versus pending collection.',
        icon: 'billing',
        items: invoices,
        cols: 5,
        minHeight: 380,
      },
      {
        id: 'admin-notifications',
        type: 'list',
        title: 'Recent notifications',
        subtitle: 'Unread activity delivered to the signed-in user.',
        icon: 'notifications',
        items: notificationItems,
        cols: 6,
        minHeight: 280,
      },
      {
        id: 'admin-appointment-trend',
        type: 'trend',
        title: 'Appointment composition',
        subtitle: 'How the current schedule stack breaks down.',
        icon: 'activity',
        items: appointmentTrendItems,
        cols: 6,
        minHeight: 280,
      },
    ],
  };
};

const buildProviderDashboardConfig = ({
  patientsCount,
  appointmentStats,
  prescriptionSummary,
  prescriptions,
  notifications,
}) => {
  const pendingPrescriptions = prescriptions.filter((item) => item.status === 'PENDING');
  const notificationItems = notificationItemsFromData(notifications);
  const appointmentTrendItems = appointmentTrendItemsFromStats(appointmentStats);
  const providerQueueItems = [
    {
      id: 'pv-1',
      title: 'Prescription backlog',
      meta: `${pendingPrescriptions.length} prescriptions are pending review for active patients`,
      badge: 'Pending',
    },
    {
      id: 'pv-2',
      title: 'Follow-up queue',
      meta: `${appointmentStats.scheduled} scheduled appointments need clinical prep before the session`,
      badge: 'Scheduled',
    },
    {
      id: 'pv-3',
      title: 'Unread alerts',
      meta: `${notifications.filter((item) => !item.is_read).length} appointment notifications still need acknowledgement`,
      badge: 'Unread',
    },
  ];

  return {
    hero: {
      kicker: 'Provider workspace',
      title: 'Focus on patient load, visits in motion, and medication follow-through.',
      description:
        'For clinicians, the board emphasizes what affects care today: patient volume, appointment activity, prescriptions that still need action, and important alerts.',
      highlights: [
        { label: 'Patients', value: patientsCount },
        { label: 'Scheduled visits', value: appointmentStats.scheduled },
        { label: 'Pending scripts', value: pendingPrescriptions.length },
      ],
    },
    topStats: [
      {
        label: 'Unread alerts',
        value: notifications.filter((item) => !item.is_read).length,
        hint: 'New appointments and updates awaiting review',
      },
      {
        label: 'Completed visits',
        value: appointmentStats.completed,
        hint: 'Visits completed in the current snapshot',
      },
    ],
    tiles: [
      {
        id: 'provider-queue',
        type: 'list',
        title: 'Care priorities',
        subtitle: 'What the provider should act on first.',
        icon: 'provider',
        items: providerQueueItems,
        cols: 4,
        minHeight: 320,
      },
      {
        id: 'provider-appointments',
        type: 'trend',
        title: 'Appointment load',
        subtitle: 'Distribution of visit status across the current board.',
        icon: 'appointments',
        items: appointmentTrendItems,
        cols: 4,
        minHeight: 320,
      },
      {
        id: 'provider-prescriptions',
        type: 'prescriptions',
        title: 'Prescription board',
        subtitle: 'Medication workstream needing review and completion.',
        icon: 'prescriptions',
        items: prescriptions,
        cols: 4,
        minHeight: 320,
      },
      {
        id: 'provider-notifications',
        type: 'list',
        title: 'Clinical alerts',
        subtitle: 'Recent notices for the logged-in provider.',
        icon: 'notifications',
        items: notificationItems,
        cols: 6,
        minHeight: 260,
      },
      {
        id: 'provider-patient-summary',
        type: 'segments',
        title: 'Patient summary',
        subtitle: 'Simple top-line view of patient and visit context.',
        icon: 'patients',
        items: [
          { label: 'Patients count', value: patientsCount },
          { label: 'Appointments total', value: appointmentStats.total },
          { label: 'Prescription total', value: prescriptionSummary.total_prescriptions },
        ],
        cols: 6,
        minHeight: 260,
      },
    ],
  };
};

const buildNurseDashboardConfig = ({
  patientsCount,
  appointmentStats,
  prescriptionSummary,
  appointments,
}) => {
  const scheduledAppointments = appointments.filter((item) => item.status === 'scheduled');
  const nurseQueueItems = [
    {
      id: 'nr-1',
      title: 'Vitals round',
      meta: `${appointmentStats.scheduled} scheduled patients will need intake and triage support`,
      badge: 'Scheduled',
    },
    {
      id: 'nr-2',
      title: 'Medication handoff',
      meta: `${prescriptionSummary.total_prescriptions} prescriptions are in the current clinical snapshot`,
      badge: 'Pending',
    },
    {
      id: 'nr-3',
      title: 'Schedule watch',
      meta: `${appointmentStats.cancelled} cancelled visits may require shift rebalancing and room changes`,
      badge: appointmentStats.cancelled > 0 ? 'Cancelled' : 'Clear',
    },
  ];

  const upcomingAppointmentItems = scheduledAppointments
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      title: `Appointment #${item.id}`,
      meta: `${item.patient_name || `Patient #${item.patient_id}`} • ${
        item.scheduled_at || 'Schedule pending'
      }`,
      badge: item.status || 'Scheduled',
    }));

  return {
    hero: {
      kicker: 'Nurse station',
      title: 'Stay ahead of scheduled visits, patient prep, and shift coordination.',
      description:
        'The nurse board centers on intake pressure, shift readiness, appointment flow, and the operational context that supports providers and patients throughout the day.',
      highlights: [
        { label: 'Scheduled today', value: appointmentStats.scheduled },
        { label: 'Patients', value: patientsCount },
        { label: 'Appointments', value: appointmentStats.total },
      ],
    },
    topStats: [
      {
        label: 'Scheduled visits',
        value: appointmentStats.scheduled,
        hint: 'Active visits that may require intake and triage',
      },
      {
        label: 'Cancelled visits',
        value: appointmentStats.cancelled,
        hint: 'Slots likely to affect rounds and prep',
      },
    ],
    tiles: [
      {
        id: 'nurse-queue',
        type: 'list',
        title: 'Shift focus',
        subtitle: 'Tasks that matter most during the current shift.',
        icon: 'clock',
        items: nurseQueueItems,
        cols: 4,
        minHeight: 320,
      },
      {
        id: 'nurse-appointments',
        type: 'metric',
        title: 'Visit prep board',
        subtitle: 'Patient flow signals tied to appointments.',
        icon: 'appointments',
        value: appointmentStats.scheduled,
        caption: 'Scheduled patients needing intake support',
        stats: [
          { label: 'Total', value: appointmentStats.total },
          { label: 'Cancelled', value: appointmentStats.cancelled },
          { label: 'Completed', value: appointmentStats.completed },
          { label: 'Patients', value: patientsCount },
        ],
        cols: 4,
        minHeight: 320,
      },
      {
        id: 'nurse-appointment-mix',
        type: 'trend',
        title: 'Appointment mix',
        subtitle: 'How the current appointment load breaks down for shift planning.',
        icon: 'notifications',
        items: appointmentTrendItemsFromStats(appointmentStats),
        cols: 4,
        minHeight: 320,
      },
      {
        id: 'nurse-upcoming-appointments',
        type: 'list',
        title: 'Upcoming appointments',
        subtitle: 'Quick glance at the nearest scheduled visits.',
        icon: 'activity',
        items:
          upcomingAppointmentItems.length > 0
            ? upcomingAppointmentItems
            : [
                {
                  id: 'nurse-empty-appts',
                  title: 'No scheduled appointments',
                  meta: 'There are no scheduled appointments available right now.',
                  badge: 'Clear',
                },
              ],
        cols: 6,
        minHeight: 240,
      },
      {
        id: 'nurse-patient-snapshot',
        type: 'segments',
        title: 'Patient snapshot',
        subtitle: 'Context for coordinating vitals, triage, and handoffs.',
        icon: 'user',
        items: [
          { label: 'Patients', value: patientsCount },
          { label: 'Completed visits', value: appointmentStats.completed },
          { label: 'Scheduled visits', value: appointmentStats.scheduled },
        ],
        cols: 6,
        minHeight: 240,
      },
    ],
  };
};

const buildPharmacistDashboardConfig = ({
  prescriptions,
  notifications,
  staff,
}) => {
  const pendingPrescriptions = prescriptions.filter((item) => item.status === 'PENDING');
  const dispensedPrescriptions = prescriptions.filter((item) => item.status === 'DISPENSED');
  const providerAndPharmacyStaff = staff.filter((item) =>
    ['provider', 'pharmacist'].includes(String(item.role || '').toLowerCase())
  );
  const notificationItems = notificationItemsFromData(notifications);

  return {
    hero: {
      kicker: 'Pharmacy bench',
      title: 'Track incoming prescriptions, dispense status, and the provider pipeline behind medication flow.',
      description:
        'The pharmacist board prioritizes medication workload first, with supporting visibility into alerts and the clinicians currently driving prescription volume.',
      highlights: [
        { label: 'Prescriptions', value: prescriptions.length },
        { label: 'Pending', value: pendingPrescriptions.length },
        { label: 'Dispensed', value: dispensedPrescriptions.length },
      ],
    },
    topStats: [
      {
        label: 'Providers active',
        value: providerAndPharmacyStaff.filter((item) => item.role === 'provider').length,
        hint: 'Clinicians generating medication orders',
      },
      {
        label: 'Unread alerts',
        value: notifications.filter((item) => !item.is_read).length,
        hint: 'New notices affecting pharmacy work',
      },
    ],
    tiles: [
      {
        id: 'pharmacist-prescriptions',
        type: 'prescriptions',
        title: 'Prescription pipeline',
        subtitle: 'Primary medication queue for verification and dispensing.',
        icon: 'prescriptions',
        items: prescriptions,
        cols: 6,
        minHeight: 360,
      },
      {
        id: 'pharmacist-breakdown',
        type: 'segments',
        title: 'Dispense breakdown',
        subtitle: 'Fast read on medication movement through the queue.',
        icon: 'activity',
        items: [
          { label: 'Total prescriptions', value: prescriptions.length },
          { label: 'Pending', value: pendingPrescriptions.length },
          { label: 'Dispensed', value: dispensedPrescriptions.length },
        ],
        cols: 3,
        minHeight: 260,
      },
      {
        id: 'pharmacist-provider-summary',
        type: 'segments',
        title: 'Ordering clinicians',
        subtitle: 'Live view of providers and pharmacy staff supporting medication flow.',
        icon: 'provider',
        items: [
          {
            label: 'Providers',
            value: providerAndPharmacyStaff.filter((item) => item.role === 'provider').length,
          },
          {
            label: 'Pharmacists',
            value: providerAndPharmacyStaff.filter((item) => item.role === 'pharmacist').length,
          },
          {
            label: 'Unread alerts',
            value: notifications.filter((item) => !item.is_read).length,
          },
        ],
        cols: 3,
        minHeight: 260,
      },
      {
        id: 'pharmacist-staff',
        type: 'staff',
        title: 'Clinical roster',
        subtitle: 'Provider and pharmacy roster influencing medication volume.',
        icon: 'staff',
        items: providerAndPharmacyStaff,
        cols: 6,
        minHeight: 280,
      },
      {
        id: 'pharmacist-notifications',
        type: 'list',
        title: 'Pharmacy alerts',
        subtitle: 'Recent messages tied to appointment and medication flow.',
        icon: 'notifications',
        items: notificationItems,
        cols: 6,
        minHeight: 260,
      },
      {
        id: 'pharmacist-worklist',
        type: 'list',
        title: 'Priority worklist',
        subtitle: 'What needs attention next on the pharmacy side.',
        icon: 'clock',
        items: [
          {
            id: 'ph-work-1',
            title: 'Pending verification',
            meta: `${pendingPrescriptions.length} prescriptions are waiting to move forward.`,
            badge: pendingPrescriptions.length > 0 ? 'Pending' : 'Clear',
          },
          {
            id: 'ph-work-2',
            title: 'Dispense throughput',
            meta: `${dispensedPrescriptions.length} prescriptions are already marked dispensed.`,
            badge: 'Dispensed',
          },
          {
            id: 'ph-work-3',
            title: 'Provider coordination',
            meta: `${providerAndPharmacyStaff.filter((item) => item.role === 'provider').length} providers are active in the staff roster.`,
            badge: 'Active',
          },
        ],
        cols: 6,
        minHeight: 260,
      },
    ],
  };
};

const buildReceptionistDashboardConfig = ({
  appointments,
  patients,
  notifications,
}) => {
  const scheduledAppointments = appointments.filter((item) => item.status === 'scheduled');
  const unreadNotifications = notifications.filter((item) => !item.is_read);
  const frontDeskQueueItems = [
    {
      id: 'rc-1',
      title: 'Scheduled check-ins',
      meta: `${scheduledAppointments.length} scheduled appointments are ready for front-desk coordination.`,
      badge: scheduledAppointments.length > 0 ? 'Scheduled' : 'Clear',
    },
    {
      id: 'rc-2',
      title: 'Patient lookup volume',
      meta: `${patients.length} patient records are available for scheduling and arrival support.`,
      badge: 'Patients',
    },
    {
      id: 'rc-3',
      title: 'Unread desk alerts',
      meta: `${unreadNotifications.length} notifications still need acknowledgement at the desk.`,
      badge: unreadNotifications.length > 0 ? 'Unread' : 'Clear',
    },
  ];

  const appointmentItems = scheduledAppointments.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.patient_name || `Patient #${item.patient_id}`,
    meta: `${item.doctor_name || `Doctor #${item.doctor_id}`} • ${item.scheduled_at || 'Schedule pending'}`,
    badge: item.status || 'Scheduled',
  }));

  return {
    hero: {
      kicker: 'Front desk',
      title: 'Keep arrivals, scheduling, and patient lookup moving without exposing back-office controls.',
      description:
        'The receptionist board stays intentionally lightweight: appointment visibility, patient lookup context, and desk notifications only.',
      highlights: [
        { label: 'Appointments', value: appointments.length },
        { label: 'Scheduled', value: scheduledAppointments.length },
        { label: 'Patients', value: patients.length },
      ],
    },
    topStats: [
      {
        label: 'Unread alerts',
        value: unreadNotifications.length,
        hint: 'Desk notices waiting to be reviewed',
      },
      {
        label: 'Patient records',
        value: patients.length,
        hint: 'Available for scheduling lookup',
      },
    ],
    tiles: [
      {
        id: 'receptionist-queue',
        type: 'list',
        title: 'Desk priorities',
        subtitle: 'What the receptionist should focus on first.',
        icon: 'clock',
        items: frontDeskQueueItems,
        cols: 4,
        minHeight: 300,
      },
      {
        id: 'receptionist-appointments',
        type: 'metric',
        title: 'Appointment board',
        subtitle: 'Current appointment volume available to the front desk.',
        icon: 'appointments',
        value: appointments.length,
        caption: 'Appointments available in the current tenant',
        stats: [
          { label: 'Scheduled', value: scheduledAppointments.length },
          { label: 'Patients', value: patients.length },
          { label: 'Unread alerts', value: unreadNotifications.length },
        ],
        cols: 4,
        minHeight: 300,
      },
      {
        id: 'receptionist-patients',
        type: 'segments',
        title: 'Patient lookup',
        subtitle: 'Patient records the receptionist can use during scheduling.',
        icon: 'patients',
        items: [
          { label: 'Patients', value: patients.length },
          { label: 'Appointments', value: appointments.length },
          { label: 'Scheduled', value: scheduledAppointments.length },
        ],
        cols: 4,
        minHeight: 300,
      },
      {
        id: 'receptionist-upcoming',
        type: 'list',
        title: 'Scheduled visits',
        subtitle: 'Quick view of appointments requiring front-desk coordination.',
        icon: 'activity',
        items:
          appointmentItems.length > 0
            ? appointmentItems
            : [
                {
                  id: 'receptionist-empty',
                  title: 'No scheduled visits',
                  meta: 'There are no scheduled appointments to coordinate right now.',
                  badge: 'Clear',
                },
              ],
        cols: 6,
        minHeight: 240,
      },
      {
        id: 'receptionist-notifications',
        type: 'list',
        title: 'Desk notifications',
        subtitle: 'Notifications that can be read and acknowledged by reception.',
        icon: 'notifications',
        items:
          notificationItemsFromData(notifications).length > 0
            ? notificationItemsFromData(notifications)
            : [
                {
                  id: 'receptionist-notifications-empty',
                  title: 'No notifications',
                  meta: 'There are no front-desk notifications at the moment.',
                  badge: 'Clear',
                },
              ],
        cols: 6,
        minHeight: 240,
      },
    ],
  };
};

const fallbackConfigForRole = (role) =>
  dashboardRoleMap[String(role || '').toLowerCase()]?.config ?? null;

export default function useDashboardConfig(role) {
  const normalizedRole = String(role || '').toLowerCase();
  const fallbackConfig = useMemo(() => fallbackConfigForRole(normalizedRole), [normalizedRole]);
  const [state, setState] = useState({
    loading:
      normalizedRole === 'admin' ||
      normalizedRole === 'provider' ||
      normalizedRole === 'nurse' ||
      normalizedRole === 'pharmacist' ||
      normalizedRole === 'receptionist',
    error: null,
    config:
      normalizedRole === 'admin' ||
      normalizedRole === 'provider' ||
      normalizedRole === 'nurse' ||
      normalizedRole === 'pharmacist' ||
      normalizedRole === 'receptionist'
        ? null
        : fallbackConfig,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (
        normalizedRole !== 'admin' &&
        normalizedRole !== 'provider' &&
        normalizedRole !== 'nurse' &&
        normalizedRole !== 'pharmacist' &&
        normalizedRole !== 'receptionist'
      ) {
        setState({ loading: false, error: null, config: fallbackConfig });
        return;
      }

      setState({ loading: true, error: null, config: null });

      try {
        if (normalizedRole === 'admin') {
          const [
            patientsCount,
            appointmentStats,
            prescriptionSummary,
            staff,
            invoices,
            notifications,
          ] = await Promise.all([
            fetchWrapped('/dashboard/patients-count'),
            fetchWrapped('/dashboard/appointments-stats'),
            fetchWrapped('/dashboard/prescription-summary'),
            fetchWrapped('/staff'),
            fetchWrapped('/billing'),
            fetchWrapped('/notifications'),
          ]);

          if (cancelled) return;

          setState({
            loading: false,
            error: null,
            config: buildAdminDashboardConfig({
              patientsCount: Number(patientsCount?.total_patients || 0),
              appointmentStats: {
                total: Number(appointmentStats?.total || 0),
                scheduled: Number(appointmentStats?.scheduled || 0),
                cancelled: Number(appointmentStats?.cancelled || 0),
                completed: Number(appointmentStats?.completed || 0),
              },
              prescriptionSummary: {
                total_prescriptions: Number(prescriptionSummary?.total_prescriptions || 0),
              },
              staff: normalizeArray(staff),
              invoices: normalizeArray(invoices),
              notifications: normalizeArray(notifications),
            }),
          });
          return;
        }

        if (normalizedRole === 'provider') {
          const [
            patientsCount,
            appointmentStats,
            prescriptionSummary,
            prescriptions,
            notifications,
          ] = await Promise.all([
            fetchWrapped('/dashboard/patients-count'),
            fetchWrapped('/dashboard/appointments-stats'),
            fetchWrapped('/dashboard/prescription-summary'),
            fetchWrapped('/prescriptions'),
            fetchWrapped('/notifications'),
          ]);

          if (cancelled) return;

          setState({
            loading: false,
            error: null,
            config: buildProviderDashboardConfig({
              patientsCount: Number(patientsCount?.total_patients || 0),
              appointmentStats: {
                total: Number(appointmentStats?.total || 0),
                scheduled: Number(appointmentStats?.scheduled || 0),
                cancelled: Number(appointmentStats?.cancelled || 0),
                completed: Number(appointmentStats?.completed || 0),
              },
              prescriptionSummary: {
                total_prescriptions: Number(prescriptionSummary?.total_prescriptions || 0),
              },
              prescriptions: normalizeArray(prescriptions),
              notifications: normalizeArray(notifications),
            }),
          });
          return;
        }

        if (normalizedRole === 'pharmacist') {
          const [prescriptions, notifications, staff] = await Promise.all([
            fetchWrappedWithDebug('/prescriptions', {}, 'pharmacist:/prescriptions'),
            fetchWrappedWithDebug('/notifications', {}, 'pharmacist:/notifications'),
            fetchWrappedWithDebug('/staff', {}, 'pharmacist:/staff'),
          ]);

          if (cancelled) return;

          setState({
            loading: false,
            error: null,
            config: buildPharmacistDashboardConfig({
              prescriptions: normalizeArray(prescriptions),
              notifications: normalizeArray(notifications),
              staff: normalizeArray(staff),
            }),
          });
          return;
        }

        if (normalizedRole === 'receptionist') {
          const [appointments, patients, notifications] = await Promise.all([
            fetchWrapped('/appointments'),
            fetchWrapped('/patients'),
            fetchWrapped('/notifications'),
          ]);

          if (cancelled) return;

          setState({
            loading: false,
            error: null,
            config: buildReceptionistDashboardConfig({
              appointments: normalizeArray(appointments),
              patients: normalizeArray(patients),
              notifications: normalizeArray(notifications),
            }),
          });
          return;
        }

        const [
          patientsCount,
          appointmentStats,
          prescriptionSummary,
          appointments,
        ] = await Promise.all([
          fetchWrapped('/dashboard/patients-count'),
          fetchWrapped('/dashboard/appointments-stats'),
          fetchWrapped('/dashboard/prescription-summary'),
          fetchWrapped('/appointments', { per_page: 10 }),
        ]);

        if (cancelled) return;

        setState({
          loading: false,
          error: null,
          config: buildNurseDashboardConfig({
            patientsCount: Number(patientsCount?.total_patients || 0),
            appointmentStats: {
              total: Number(appointmentStats?.total || 0),
              scheduled: Number(appointmentStats?.scheduled || 0),
              cancelled: Number(appointmentStats?.cancelled || 0),
              completed: Number(appointmentStats?.completed || 0),
            },
            prescriptionSummary: {
              total_prescriptions: Number(prescriptionSummary?.total_prescriptions || 0),
            },
            appointments: normalizeArray(appointments),
          }),
        });
      } catch (error) {
        if (cancelled) return;

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Unknown dashboard error';

        setState({
          loading: false,
          error: message,
          config: fallbackConfig,
        });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fallbackConfig, normalizedRole]);

  return {
    config: state.config,
    loading: state.loading,
    error: state.error,
  };
}
