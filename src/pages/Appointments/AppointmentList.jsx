import React, { useEffect } from 'react';
import { Table, Button, Select, DatePicker, Input, Popconfirm, Tooltip, message, Pagination, Radio, Modal, Spin, Empty, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  PlusOutlined,
  EditOutlined,
  StopOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useAppointments from '../../modules/appointments/hooks/useAppointments';
import AppointmentFormModal from './AppointmentFormModal';
import AppointmentCalendar from './AppointmentCalendar';
import useAppointmentReferenceData from './useAppointmentReferenceData';
import { enrichAppointment } from '../../utils/appointmentMapping';
import { selectUser, selectUserRole } from '../../modules/auth/selectors';
import { getAppointmentRoleCapabilities } from './appointmentPermissions';
import {
  clearChatMessages,
  clearChatState,
  fetchChatThreadRequest,
  sendChatMessageRequest,
  updateChatMessageRequest,
} from '../../modules/chat/chatSlice';
import {
  PageWrapper,
  PageHeader,
  PageTitle,
  FilterBar,
  FilterLabel,
  TableCard,
  StatusBadge,
  EmptyState,
} from './AppointmentList.styles';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { TextArea } = Input;

const glyphStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ChatGlyph = () => (
  <span style={glyphStyle} aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 18.5H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-8l-4 3v-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 10h7M8.5 14h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

const SendGlyph = () => (
  <span style={glyphStyle} aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 3 10 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m21 3-7 18-4-7-7-4 18-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const roleLabel = (role) => {
  const normalized = String(role || '').toLowerCase();
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

function AppointmentChatInlineModal({
  open,
  onClose,
  appointment,
  staffMembers,
  currentUser,
  chatState,
  dispatch,
}) {
  const [draft, setDraft] = React.useState('');
  const [editingMessageId, setEditingMessageId] = React.useState(null);
  const [editingText, setEditingText] = React.useState('');

  const senderLookup = React.useMemo(
    () =>
      new Map(
        (Array.isArray(staffMembers) ? staffMembers : [])
          .filter((item) => item?.id)
          .map((item) => [
            Number(item.id),
            {
              name: item.name || item.email || `User #${item.id}`,
              role: item.role || '',
            },
          ])
      ),
    [staffMembers]
  );

  React.useEffect(() => {
    if (open && appointment?.id) {
      dispatch(fetchChatThreadRequest(appointment.id));
    }
    if (!open) {
      setDraft('');
      setEditingMessageId(null);
      setEditingText('');
      dispatch(clearChatState());
    }
  }, [appointment?.id, dispatch, open]);

  React.useEffect(() => {
    if (chatState.success) {
      message.success(chatState.success);
      dispatch(clearChatMessages());
      setDraft('');
      setEditingMessageId(null);
      setEditingText('');
    }
  }, [chatState.success, dispatch]);

  React.useEffect(() => {
    if (chatState.error) {
      message.error(chatState.error);
      dispatch(clearChatMessages());
    }
  }, [chatState.error, dispatch]);

  const resolvedMessages = React.useMemo(
    () =>
      (Array.isArray(chatState.messages) ? chatState.messages : []).map((item) => {
        const senderId = Number(item.sender_id);
        const isCurrentUser = Number(currentUser?.id) === senderId;
        const sender = senderLookup.get(senderId);

        return {
          ...item,
          senderName: isCurrentUser ? 'You' : sender?.name || `User #${senderId}`,
          senderRole: isCurrentUser ? roleLabel(currentUser?.role) : roleLabel(sender?.role),
          isCurrentUser,
        };
      }),
    [chatState.messages, currentUser?.id, currentUser?.role, senderLookup]
  );

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || !appointment?.id) return;
    setDraft('');
    dispatch(sendChatMessageRequest({ appointmentId: appointment.id, message: trimmed }));
  };

  const startEditing = (item) => {
    setEditingMessageId(item.id);
    setEditingText(item.message || '');
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleUpdate = () => {
    const trimmed = editingText.trim();
    if (!trimmed || !appointment?.id || !editingMessageId) return;
    dispatch(
      updateChatMessageRequest({
        appointmentId: appointment.id,
        messageId: editingMessageId,
        message: trimmed,
      })
    );
  };

  return (
    <Modal
      title="Appointment Communication"
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      destroyOnHidden
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'grid',
            gap: 8,
            padding: '14px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            background: '#fff',
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
            <strong>{appointment?.patient_name || 'Unknown patient'}</strong>
            <span>with</span>
            <strong>{appointment?.doctor_name || 'Unknown doctor'}</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', color: '#667085', fontSize: 13 }}>
            <span>Scheduled:</span>
            <strong style={{ color: '#111827' }}>
              {appointment?.scheduled_at
                ? dayjs(appointment.scheduled_at).format('DD MMM YYYY, hh:mm A')
                : 'Schedule pending'}
            </strong>
          </div>
        </div>

        {chatState.loading ? (
          <div style={{ display: 'grid', placeItems: 'center', minHeight: 280 }}>
            <Spin size="large" />
          </div>
        ) : (
          <div
            style={{
              minHeight: 360,
              maxHeight: '48vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: '4px 2px',
            }}
          >
            {resolvedMessages.length > 0 ? (
              resolvedMessages.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: item.isCurrentUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '78%',
                      borderRadius: 18,
                      padding: '12px 14px',
                      background: item.isCurrentUser ? '#1a73c1' : '#fff',
                      color: item.isCurrentUser ? '#fff' : 'inherit',
                      border: item.isCurrentUser ? '1px solid transparent' : '1px solid #e5e7eb',
                      boxShadow: item.isCurrentUser ? '0 10px 20px rgba(26, 115, 193, 0.18)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        marginBottom: 6,
                        fontSize: 12,
                        opacity: 0.82,
                      }}
                    >
                      <strong>{item.senderName}</strong>
                      {item.senderRole ? <span>{item.senderRole}</span> : null}
                      <span>{dayjs(item.created_at).format('DD MMM, hh:mm A')}</span>
                      {item.isCurrentUser ? (
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          style={{
                            marginLeft: 'auto',
                            background: 'transparent',
                            border: 'none',
                            color: item.isCurrentUser ? '#fff' : '#1a73c1',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label="Edit message"
                          title="Edit message"
                        >
                          <EditOutlined />
                        </button>
                      ) : null}
                    </div>
                    {editingMessageId === item.id ? (
                      <div style={{ display: 'grid', gap: 8 }}>
                        <TextArea
                          value={editingText}
                          onChange={(event) => setEditingText(event.target.value)}
                          rows={3}
                          maxLength={1000}
                          disabled={chatState.updating}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <Button size="small" onClick={cancelEditing} disabled={chatState.updating}>
                            Cancel
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            onClick={handleUpdate}
                            loading={chatState.updating}
                            disabled={!editingText.trim()}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: 14 }}>
                        {item.message}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No communication yet for this appointment."
              />
            )}
          </div>
        )}

        <div style={{ display: 'grid', gap: 10, paddingTop: 8 }}>
          <TextArea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            placeholder="Add an internal note for this appointment..."
            maxLength={1000}
            disabled={chatState.sending}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: '#8c8c8c', fontSize: 12 }}>
              Doctor and nurse notes remain visible as chat history for this appointment.
            </span>
            <Button
              type="primary"
              onClick={handleSend}
              loading={chatState.sending}
              disabled={!draft.trim()}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <SendGlyph />
                <span>Send</span>
              </span>
            </Button>
          </div>
          {chatState.error ? (
            <Alert
              type="error"
              title="Unable to update communication."
              description={chatState.error}
              showIcon
            />
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

const AppointmentList = () => {
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);
  const currentUser = useSelector(selectUser);
  const chatState = useSelector((state) => state.chat);
  const permissions = getAppointmentRoleCapabilities(userRole);
  const {
    appointments,
    pagination,
    filters,
    loading,
    actionLoading,
    error,
    success,
    fetchAppointments,
    cancelAppointment,
    updateAppointment,
    deleteAppointment,
    selectAppointment,
    applyFilters,
    resetFilters,
    goToPage,
    dismissMessages,
  } = useAppointments();
  const { patientLookup, doctorLookup, staffMembers } = useAppointmentReferenceData();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingAppointment, setEditingAppointment] = React.useState(null);
  const [viewMode, setViewMode] = React.useState('list'); // 'list' | 'calendar'
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatAppointment, setChatAppointment] = React.useState(null);
  const [expandedStatusActionsId, setExpandedStatusActionsId] = React.useState(null);
  const canUseInternalChat = ['provider', 'nurse'].includes(String(userRole || '').toLowerCase());

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ── Toast on success / error ──────────────────────────────────────────────
  useEffect(() => {
    if (success) {
      message.success(success);
      dismissMessages();
    }
  }, [success, dismissMessages]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dismissMessages();
    }
  }, [error, dismissMessages]);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openCreateModal = () => {
    if (!permissions.canCreateAppointments) return;
    setEditingAppointment(null);
    selectAppointment(null);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    if (!permissions.canUpdateAppointments) return;
    setEditingAppointment(record);
    selectAppointment(record);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAppointment(null);
  };

  const openChatModal = (record) => {
    if (!canUseInternalChat) return;
    setChatAppointment(record);
    setChatOpen(true);
  };

  const closeChatModal = () => {
    setChatOpen(false);
    setChatAppointment(null);
  };

  const toggleStatusActions = (appointmentId) => {
    setExpandedStatusActionsId((current) =>
      current === appointmentId ? null : appointmentId
    );
  };

  const handleMarkCompleted = (record) => {
    if (!permissions.canCompleteAppointments) return;
    updateAppointment({
      id: record.id,
      patient_id: record.patient_id,
      doctor_id: record.doctor_id,
      scheduled_at: record.scheduled_at,
      notes: record.notes ?? '',
      status: 'completed',
    });
    setExpandedStatusActionsId(null);
  };

  // ── Filter handlers ───────────────────────────────────────────────────────
  const handleStatusChange = (value) => applyFilters({ status: value ?? '' });

  const handleDateRangeChange = (dates) => {
    applyFilters({
      dateFrom: dates ? dates[0].format('YYYY-MM-DD') : '',
      dateTo: dates ? dates[1].format('YYYY-MM-DD') : '',
    });
  };

  const handleSearchChange = (value) => {
    applyFilters({ search: value });
  };

  const displayAppointments = React.useMemo(
    () =>
      appointments.map((appointment) =>
        enrichAppointment(appointment, {
          patients: patientLookup,
          doctors: doctorLookup,
        })
      ),
    [appointments, patientLookup, doctorLookup]
  );

  // Local filtering fallback in case backend only paginates without filtering
  const filteredAppointments = React.useMemo(() => {
    return displayAppointments.filter((appt) => {
      let match = true;
      if (filters.status) {
        match = match && appt.status === filters.status;
      }
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const pName = appt.patient_name?.toLowerCase() || '';
        const dName = appt.doctor_name?.toLowerCase() || '';
        match = match && (pName.includes(term) || dName.includes(term));
      }
      if (filters.dateFrom && filters.dateTo) {
         const apptDate = dayjs(appt.scheduled_at);
         const from = dayjs(filters.dateFrom).startOf('day');
         const to = dayjs(filters.dateTo).endOf('day');
         match = match && (apptDate.isAfter(from) || apptDate.isSame(from)) && (apptDate.isBefore(to) || apptDate.isSame(to));
      }
      return match;
    });
  }, [displayAppointments, filters]);

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (id) => <span style={{ color: '#8c8c8c', fontSize: 12 }}>#{id}</span>,
    },
    {
      title: 'Patient',
      dataIndex: 'patient_name',
      key: 'patient_name',
      render: (name) => <span style={{ fontWeight: 500 }}>{name ?? '—'}</span>,
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
    },
    {
      title: 'Scheduled At',
      dataIndex: 'scheduled_at',
      key: 'scheduled_at',
      render: (val) => val ? dayjs(val).format('DD MMM YYYY, hh:mm A') : '—',
      sorter: (a, b) => dayjs(a.scheduled_at).unix() - dayjs(b.scheduled_at).unix(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge $status={status}>{status}</StatusBadge>,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes) => notes ?? <span style={{ color: '#ccc' }}>—</span>,
    },
    canUseInternalChat ||
    permissions.canUpdateAppointments ||
    permissions.canCancelAppointments ||
    permissions.canCompleteAppointments ||
    permissions.canDeleteAppointments
      ? {
      title: 'Actions',
      key: 'actions',
      width: 190,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {canUseInternalChat && (
            <Tooltip title="Internal communication">
              <Button
                size="small"
                onClick={() => openChatModal(record)}
              >
                <ChatGlyph />
              </Button>
            </Tooltip>
          )}

          {permissions.canUpdateAppointments && (
            <Tooltip title="Reschedule">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
                disabled={record.status === 'cancelled'}
              />
            </Tooltip>
          )}

          {(permissions.canCancelAppointments || permissions.canCompleteAppointments) &&
          record.status === 'scheduled' ? (
            expandedStatusActionsId === record.id ? (
              <>
                {permissions.canCompleteAppointments && (
                  <Tooltip title="Mark completed">
                    <Popconfirm
                      title="Mark this appointment as completed?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => handleMarkCompleted(record)}
                    >
                      <Button
                        size="small"
                        icon={<CheckOutlined />}
                        loading={actionLoading}
                      />
                    </Popconfirm>
                  </Tooltip>
                )}

                {permissions.canCancelAppointments && (
                  <Tooltip title="Cancel">
                    <Popconfirm
                      title="Cancel this appointment?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => {
                        cancelAppointment(record.id);
                        setExpandedStatusActionsId(null);
                      }}
                    >
                      <Button size="small" icon={<StopOutlined />} danger loading={actionLoading} />
                    </Popconfirm>
                  </Tooltip>
                )}
              </>
            ) : (
              <Tooltip title="Status actions">
                <Button
                  size="small"
                  icon={<MoreOutlined />}
                  onClick={() => toggleStatusActions(record.id)}
                />
              </Tooltip>
            )
          ) : null}

          {permissions.canDeleteAppointments && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Permanently delete this appointment?"
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="No"
                onConfirm={() => deleteAppointment(record.id)}
              >
                <Button size="small" icon={<DeleteOutlined />} loading={actionLoading} />
              </Popconfirm>
            </Tooltip>
          )}
        </div>
      ),
    }
      : null,
  ].filter(Boolean);

  return (
    <PageWrapper>
      {/* ── Header ── */}
      <PageHeader>
        <PageTitle>Appointments</PageTitle>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* List / Calendar toggle */}
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="list">
              <UnorderedListOutlined /> List
            </Radio.Button>
            <Radio.Button value="calendar">
              <CalendarOutlined /> Calendar
            </Radio.Button>
          </Radio.Group>

          {viewMode === 'list' && (
            <Button icon={<ReloadOutlined />} onClick={fetchAppointments} loading={loading}>
              Refresh
            </Button>
          )}

          {permissions.canCreateAppointments && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              New Appointment
            </Button>
          )}
        </div>
      </PageHeader>

      {/* ── Calendar view ── */}
      {viewMode === 'calendar' && <AppointmentCalendar showHeader={false} />}

      {/* ── List view ── */}
      {viewMode === 'list' && (
        <>
          {/* Filter bar */}
          <FilterBar>
            <FilterLabel>Filter:</FilterLabel>

            <Select
              placeholder="Status"
              allowClear
              style={{ width: 140 }}
              value={filters.status || undefined}
              onChange={handleStatusChange}
            >
              <Option value="scheduled">Scheduled</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>

            <RangePicker
              style={{ width: 240 }}
              value={
                filters.dateFrom && filters.dateTo
                  ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
                  : null
              }
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
            />

            <Search
              placeholder="Search patient / doctor..."
              style={{ width: 220 }}
              defaultValue={filters.search}
              onSearch={handleSearchChange}
              allowClear
            />

            <Button onClick={resetFilters}>Clear</Button>
          </FilterBar>

          {/* Table */}
          <TableCard>
            <Table
              dataSource={filteredAppointments}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showTotal: (total) => `${total} appointments`,
                itemRender: (current, type, originalElement) => {
                  if (type === 'prev') {
                    return <Button type="text" size="small">Prev</Button>;
                  }
                  if (type === 'next') {
                    return <Button type="text" size="small">Next</Button>;
                  }
                  return originalElement;
                },
              }}
              locale={{
                emptyText: <EmptyState>No appointments found.</EmptyState>,
              }}
              scroll={{ x: 800 }}
            />
          </TableCard>
        </>
      )}

      {/* ── Create / Edit modal ── */}
      <AppointmentFormModal
        open={modalOpen}
        onClose={closeModal}
        editingAppointment={editingAppointment}
      />
      <AppointmentChatInlineModal
        open={chatOpen}
        onClose={closeChatModal}
        appointment={chatAppointment}
        staffMembers={staffMembers}
        currentUser={currentUser}
        chatState={chatState}
        dispatch={dispatch}
      />
    </PageWrapper>
  );
};

export default AppointmentList;