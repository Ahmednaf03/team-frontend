export const APPOINTMENT_ROLE_CAPABILITIES = {
  admin: {
    canViewAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointments: true,
    canCancelAppointments: true,
    canCompleteAppointments: true,
    canDeleteAppointments: true,
    canReadPatients: true,
    canReadDoctors: true,
  },
  provider: {
    canViewAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointments: true,
    canCancelAppointments: true,
    canCompleteAppointments: true,
    canDeleteAppointments: false,
    canReadPatients: true,
    canReadDoctors: true,
  },
  nurse: {
    canViewAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointments: false,
    canCancelAppointments: false,
    canCompleteAppointments: true,
    canDeleteAppointments: false,
    canReadPatients: true,
    canReadDoctors: true,
  },
  receptionist: {
    canViewAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointments: false,
    canCancelAppointments: false,
    canCompleteAppointments: false,
    canDeleteAppointments: false,
    canReadPatients: true,
    canReadDoctors: true,
  },
  pharmacist: {
    canViewAppointments: false,
    canCreateAppointments: false,
    canUpdateAppointments: false,
    canCancelAppointments: false,
    canCompleteAppointments: false,
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
      canCompleteAppointments: false,
      canDeleteAppointments: false,
      canReadPatients: false,
      canReadDoctors: false,
    }
  );
};
