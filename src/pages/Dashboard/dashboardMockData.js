const notifications = [
  {
    id: 4,
    type: 'appointment',
    title: 'New Appointment',
    message: 'New appointment with Leah on 2026-03-09 10:00:00',
    is_read: 0,
    reference_id: 15,
    created_at: '2026-03-24 01:00:35',
  },
  {
    id: 2,
    type: 'appointment',
    title: 'New Appointment',
    message: 'New appointment with Leah on 2026-03-05 10:00:00',
    is_read: 0,
    reference_id: 14,
    created_at: '2026-03-24 01:00:19',
  },
];

const staff = [
  {
    id: 10,
    name: 'doctor2',
    email: 'doctor2@gmail.com',
    role: 'provider',
    status: 'active',
    created_at: '2026-02-21 00:49:25',
  },
  {
    id: 9,
    name: 'doctor1',
    email: 'doctor1@gmail.com',
    role: 'provider',
    status: 'active',
    created_at: '2026-02-21 00:49:16',
  },
  {
    id: 6,
    name: 'Big Pharma',
    email: 'bigpharma@gmail.com',
    role: 'pharmacist',
    status: 'active',
    created_at: '2026-02-20 23:12:45',
  },
  {
    id: 4,
    name: 'Pharma John',
    email: 'pharma@gmail.com',
    role: 'pharmacist',
    status: 'active',
    created_at: '2026-02-20 23:05:29',
  },
  {
    id: 3,
    name: 'Nurse Amy',
    email: 'nurse@gmail.com',
    role: 'nurse',
    status: 'active',
    created_at: '2026-02-20 23:04:29',
  },
  {
    id: 1,
    name: 'Doctor One',
    email: 'doc@gmail.com',
    role: 'provider',
    status: 'active',
    created_at: '2026-02-20 17:45:48',
  },
];

const prescriptions = [
  {
    id: 8,
    patient_id: 1,
    doctor_id: 9,
    appointment_id: 1,
    status: 'PENDING',
    prescription_date: '2026-03-24 01:03:03',
  },
  {
    id: 7,
    patient_id: 1,
    doctor_id: 1,
    appointment_id: 1,
    status: 'DISPENSED',
    prescription_date: '2026-03-23 14:15:28',
  },
  {
    id: 6,
    patient_id: 1,
    doctor_id: 1,
    appointment_id: 1,
    status: 'DISPENSED',
    prescription_date: '2026-03-23 14:00:42',
  },
  {
    id: 5,
    patient_id: 1,
    doctor_id: 1,
    appointment_id: 1,
    status: 'PENDING',
    prescription_date: '2026-03-23 13:59:29',
  },
  {
    id: 4,
    patient_id: 1,
    doctor_id: 1,
    appointment_id: 1,
    status: 'PENDING',
    prescription_date: '2026-03-23 13:29:49',
  },
  {
    id: 3,
    patient_id: 1,
    doctor_id: 1,
    appointment_id: 1,
    status: 'PENDING',
    prescription_date: '2026-03-23 13:27:13',
  },
  {
    id: 2,
    patient_id: 1,
    doctor_id: 1,
    appointment_id: 1,
    status: 'DISPENSED',
    prescription_date: '2026-02-23 15:01:52',
  },
  {
    id: 1,
    patient_id: 1,
    doctor_id: 1,
    appointment_id: 1,
    status: 'DISPENSED',
    prescription_date: '2026-02-20 17:55:14',
  },
];

const invoices = [
  {
    id: 3,
    prescription_id: 7,
    patient_id: 1,
    total_amount: '50.00',
    status: 'PAID',
    paid_at: '2026-03-23 14:18:01',
  },
  {
    id: 2,
    prescription_id: 6,
    patient_id: 1,
    total_amount: '50.00',
    status: 'PENDING',
    paid_at: null,
  },
  {
    id: 1,
    prescription_id: 1,
    patient_id: 1,
    total_amount: '100.00',
    status: 'PAID',
    paid_at: '2026-02-20 20:20:17',
  },
];

const dashboardMetrics = {
  patientsCount: 2,
  appointmentStats: {
    total: 8,
    completed: 0,
    scheduled: 7,
    cancelled: 1,
  },
  prescriptionSummary: {
    total_prescriptions: 7,
  },
};

const appointmentTrendItems = [
  { label: 'Total', value: dashboardMetrics.appointmentStats.total },
  { label: 'Scheduled', value: dashboardMetrics.appointmentStats.scheduled },
  { label: 'Cancelled', value: dashboardMetrics.appointmentStats.cancelled },
  { label: 'Completed', value: dashboardMetrics.appointmentStats.completed },
];

const notificationItems = notifications.map((item) => ({
  id: item.id,
  title: item.title,
  meta: item.message,
  badge: item.is_read ? 'Read' : 'Unread',
}));

const providerQueueItems = [
  { id: 'pv-1', title: 'Prescription backlog', meta: '4 prescriptions are pending review for active patients', badge: 'Pending' },
  { id: 'pv-2', title: 'Follow-up queue', meta: '7 scheduled appointments need clinical prep before the session', badge: 'Scheduled' },
  { id: 'pv-3', title: 'Unread alerts', meta: '2 appointment notifications still need acknowledgement', badge: 'Unread' },
];

const receptionistQueueItems = [
  { id: 'rc-1', title: 'Front desk workload', meta: '7 scheduled appointments require confirmation calls today', badge: 'Scheduled' },
  { id: 'rc-2', title: 'Collections to follow', meta: '1 invoice is still pending payment', badge: 'Pending' },
  { id: 'rc-3', title: 'Registration pressure', meta: '2 active patients in the system with room to grow', badge: 'Active' },
];

const nurseQueueItems = [
  { id: 'nr-1', title: 'Vitals round', meta: '7 scheduled patients will need intake and triage support', badge: 'Scheduled' },
  { id: 'nr-2', title: 'Medication handoff', meta: '4 prescriptions are pending and may require bedside coordination', badge: 'Pending' },
  { id: 'nr-3', title: 'Unread notices', meta: '2 patient-facing updates are waiting in the inbox', badge: 'Unread' },
];

const adminConfig = {
  hero: {
    kicker: 'Admin overview',
    title: 'Keep operations balanced across patients, staff, billing, and activity.',
    description: 'The admin board surfaces the broadest operational signals first: growth, scheduling pressure, pharmacy volume, staffing mix, and recent notifications.',
    highlights: [
      { label: 'Patients', value: dashboardMetrics.patientsCount },
      { label: 'Appointments', value: dashboardMetrics.appointmentStats.total },
      { label: 'Prescriptions', value: dashboardMetrics.prescriptionSummary.total_prescriptions },
    ],
  },
  topStats: [
    { label: 'Staff members', value: staff.length, hint: 'Providers, nurses, and pharmacists currently active' },
    { label: 'Pending invoices', value: invoices.filter((item) => item.status === 'PENDING').length, hint: 'Outstanding collections needing follow-up' },
  ],
  tiles: [
    {
      id: 'admin-patient-metric',
      type: 'metric',
      title: 'Patient volume',
      subtitle: 'Quick pulse on current patient footprint.',
      icon: 'patients',
      value: dashboardMetrics.patientsCount,
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
      value: dashboardMetrics.appointmentStats.total,
      caption: 'Total appointment records',
      stats: [
        { label: 'Scheduled', value: dashboardMetrics.appointmentStats.scheduled },
        { label: 'Cancelled', value: dashboardMetrics.appointmentStats.cancelled },
        { label: 'Completed', value: dashboardMetrics.appointmentStats.completed },
        { label: 'Open rate', value: '88%' },
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
      value: dashboardMetrics.prescriptionSummary.total_prescriptions,
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

const providerConfig = {
  hero: {
    kicker: 'Provider workspace',
    title: 'Focus on patient load, visits in motion, and medication follow-through.',
    description: 'For clinicians, the board emphasizes what affects care today: patient volume, appointment activity, prescriptions that still need action, and important alerts.',
    highlights: [
      { label: 'Patients', value: dashboardMetrics.patientsCount },
      { label: 'Scheduled visits', value: dashboardMetrics.appointmentStats.scheduled },
      { label: 'Pending scripts', value: prescriptions.filter((item) => item.status === 'PENDING').length },
    ],
  },
  topStats: [
    { label: 'Unread alerts', value: notifications.filter((item) => !item.is_read).length, hint: 'New appointments and updates awaiting review' },
    { label: 'Completed visits', value: dashboardMetrics.appointmentStats.completed, hint: 'Visits completed in the current snapshot' },
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
        { label: 'Patients count', value: dashboardMetrics.patientsCount },
        { label: 'Appointments total', value: dashboardMetrics.appointmentStats.total },
        { label: 'Prescription total', value: dashboardMetrics.prescriptionSummary.total_prescriptions },
      ],
      cols: 6,
      minHeight: 260,
    },
  ],
};

const nurseConfig = {
  hero: {
    kicker: 'Nurse station',
    title: 'Stay ahead of scheduled visits, patient prep, and medication coordination.',
    description: 'The nurse board centers on intake pressure, shift coordination, and the practical tasks that support providers and patients throughout the day.',
    highlights: [
      { label: 'Scheduled today', value: dashboardMetrics.appointmentStats.scheduled },
      { label: 'Patients', value: dashboardMetrics.patientsCount },
      { label: 'Pending scripts', value: prescriptions.filter((item) => item.status === 'PENDING').length },
    ],
  },
  topStats: [
    { label: 'Notifications', value: notifications.length, hint: 'Fresh updates relevant to shift activity' },
    { label: 'Cancelled visits', value: dashboardMetrics.appointmentStats.cancelled, hint: 'Slots likely to affect rounds and prep' },
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
      value: dashboardMetrics.appointmentStats.scheduled,
      caption: 'Scheduled patients needing intake support',
      stats: [
        { label: 'Total', value: dashboardMetrics.appointmentStats.total },
        { label: 'Cancelled', value: dashboardMetrics.appointmentStats.cancelled },
        { label: 'Completed', value: dashboardMetrics.appointmentStats.completed },
        { label: 'Patients', value: dashboardMetrics.patientsCount },
      ],
      cols: 4,
      minHeight: 320,
    },
    {
      id: 'nurse-notifications',
      type: 'list',
      title: 'Care notifications',
      subtitle: 'Messages most likely to affect intake and patient readiness.',
      icon: 'notifications',
      items: notificationItems,
      cols: 4,
      minHeight: 320,
    },
    {
      id: 'nurse-medication',
      type: 'segments',
      title: 'Medication handoff',
      subtitle: 'Prescription workload that can affect bedside coordination.',
      icon: 'prescriptions',
      items: [
        { label: 'Total prescriptions', value: prescriptions.length },
        { label: 'Pending', value: prescriptions.filter((item) => item.status === 'PENDING').length },
        { label: 'Dispensed', value: prescriptions.filter((item) => item.status === 'DISPENSED').length },
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
        { label: 'Patients', value: dashboardMetrics.patientsCount },
        { label: 'Unread alerts', value: notifications.filter((item) => !item.is_read).length },
        { label: 'Scheduled visits', value: dashboardMetrics.appointmentStats.scheduled },
      ],
      cols: 6,
      minHeight: 240,
    },
  ],
};

const receptionistConfig = {
  hero: {
    kicker: 'Reception desk',
    title: 'Manage scheduling flow, patient intake, and payment follow-ups from one board.',
    description: 'The receptionist dashboard keeps the front desk focused on appointments, notifications, patient growth, and invoices that still need attention.',
    highlights: [
      { label: 'Appointments', value: dashboardMetrics.appointmentStats.total },
      { label: 'Scheduled', value: dashboardMetrics.appointmentStats.scheduled },
      { label: 'Pending invoices', value: invoices.filter((item) => item.status === 'PENDING').length },
    ],
  },
  topStats: [
    { label: 'Patients count', value: dashboardMetrics.patientsCount, hint: 'Registered patients currently in the system' },
    { label: 'Unread alerts', value: notifications.filter((item) => !item.is_read).length, hint: 'Messages that may affect desk coordination' },
  ],
  tiles: [
    {
      id: 'receptionist-queue',
      type: 'list',
      title: 'Front desk queue',
      subtitle: 'What the desk team should move through next.',
      icon: 'clock',
      items: receptionistQueueItems,
      cols: 4,
      minHeight: 320,
    },
    {
      id: 'receptionist-appointments',
      type: 'trend',
      title: 'Schedule mix',
      subtitle: 'At-a-glance appointment breakdown for call and counter work.',
      icon: 'appointments',
      items: appointmentTrendItems,
      cols: 4,
      minHeight: 320,
    },
    {
      id: 'receptionist-billing',
      type: 'revenue',
      title: 'Invoice follow-up',
      subtitle: 'Collections status relevant to patient checkout.',
      icon: 'billing',
      items: invoices,
      cols: 4,
      minHeight: 320,
    },
    {
      id: 'receptionist-patient-growth',
      type: 'segments',
      title: 'Patient and visit summary',
      subtitle: 'Simple volume indicators for registration and scheduling.',
      icon: 'patients',
      items: [
        { label: 'Patients count', value: dashboardMetrics.patientsCount },
        { label: 'Appointments total', value: dashboardMetrics.appointmentStats.total },
        { label: 'Cancelled', value: dashboardMetrics.appointmentStats.cancelled },
      ],
      cols: 6,
      minHeight: 240,
    },
    {
      id: 'receptionist-notifications',
      type: 'list',
      title: 'Desk notifications',
      subtitle: 'Recent messages that may affect booking or follow-up.',
      icon: 'notifications',
      items: notificationItems,
      cols: 6,
      minHeight: 240,
    },
  ],
};

const pharmacistConfig = {
  hero: {
    kicker: 'Pharmacy bench',
    title: 'Track incoming prescriptions, dispense status, and billing tied to medication flow.',
    description: 'The pharmacist board prioritizes medication workload first, with supporting visibility into notifications, invoices, and providers currently issuing scripts.',
    highlights: [
      { label: 'Prescriptions', value: prescriptions.length },
      { label: 'Pending', value: prescriptions.filter((item) => item.status === 'PENDING').length },
      { label: 'Paid invoices', value: invoices.filter((item) => item.status === 'PAID').length },
    ],
  },
  topStats: [
    { label: 'Providers active', value: staff.filter((item) => item.role === 'provider').length, hint: 'Clinicians generating medication orders' },
    { label: 'Unread alerts', value: notifications.filter((item) => !item.is_read).length, hint: 'New notices affecting pharmacy work' },
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
      id: 'pharmacist-billing',
      type: 'revenue',
      title: 'Medication billing',
      subtitle: 'Invoices connected to prescription fulfillment.',
      icon: 'billing',
      items: invoices,
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
        { label: 'Pending', value: prescriptions.filter((item) => item.status === 'PENDING').length },
        { label: 'Dispensed', value: prescriptions.filter((item) => item.status === 'DISPENSED').length },
      ],
      cols: 4,
      minHeight: 240,
    },
    {
      id: 'pharmacist-staff',
      type: 'staff',
      title: 'Ordering clinicians',
      subtitle: 'Provider roster that may influence medication volume.',
      icon: 'provider',
      items: staff.filter((item) => ['provider', 'pharmacist'].includes(item.role)),
      cols: 4,
      minHeight: 240,
    },
    {
      id: 'pharmacist-notifications',
      type: 'list',
      title: 'Pharmacy alerts',
      subtitle: 'Recent messages tied to appointment and medication flow.',
      icon: 'notifications',
      items: notificationItems,
      cols: 4,
      minHeight: 240,
    },
  ],
};

export const dashboardRoleMap = {
  admin: {
    rationale: 'Admin should see the broadest operational picture: patients, appointments, prescriptions, staff, billing, and notifications.',
    config: adminConfig,
  },
  provider: {
    rationale: 'Provider should focus on patient load, appointment pressure, prescription status, and direct alerts.',
    config: providerConfig,
  },
  nurse: {
    rationale: 'Nurse should see visit preparation, patient support workload, medication coordination, and inbox activity.',
    config: nurseConfig,
  },
  receptionist: {
    rationale: 'Receptionist should see scheduling, intake, notifications, and invoice follow-up that affects front-desk flow.',
    config: receptionistConfig,
  },
  pharmacist: {
    rationale: 'Pharmacist should prioritize prescription pipeline, medication-linked billing, provider activity, and notifications.',
    config: pharmacistConfig,
  },
};
