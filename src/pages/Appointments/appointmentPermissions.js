export const APPOINTMENT_ROLE_CAPABILITIES = {
  admin: {
    canViewAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointments: true,
    canCancelAppointments: true,
    canDeleteAppointments: true,
    canReadPatients: true,
    canReadDoctors: true,
  },
  provider: {
    canViewAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointments: true,
    canCancelAppointments: true,
    canDeleteAppointments: false,
    canReadPatients: true,
    canReadDoctors: true,
  },
  nurse: {
    canViewAppointments: true,
    canCreateAppointments: false,
    canUpdateAppointments: false,
    canCancelAppointments: false,
    canDeleteAppointments: false,
    canReadPatients: false,
    canReadDoctors: true,
  },
  receptionist: {
    canViewAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointments: false,
    canCancelAppointments: false,
    canDeleteAppointments: false,
    canReadPatients: true,
    canReadDoctors: true,
  },
};

export const getAppointmentRoleCapabilities = (role) => {
  const normalizedRole = String(role || '').toLowerCase();
  return (
    APPOINTMENT_ROLE_CAPABILITIES[normalizedRole] || {
      canViewAppointments: false,
      canCreateAppointments: false,
      canUpdateAppointments: false,
      canCancelAppointments: false,
      canDeleteAppointments: false,
      canReadPatients: false,
      canReadDoctors: false,
    }
  );
};
