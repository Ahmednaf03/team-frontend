import React, { useEffect } from 'react';
import { Table, Button, Select, DatePicker, Input, Popconfirm, Tooltip, message, Pagination, Radio } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  StopOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useAppointments from '../../modules/appointments/hooks/useAppointments';
import AppointmentFormModal from './AppointmentFormModal';
import AppointmentCalendar from './AppointmentCalendar';
import {
  PageWrapper,
  PageHeader,
  PageTitle,
  FilterBar,
  FilterLabel,
  TableCard,
  StatusBadge,
  PaginationWrapper,
  EmptyState,
} from './AppointmentList.styles';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const AppointmentList = () => {
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
    deleteAppointment,
    selectAppointment,
    applyFilters,
    resetFilters,
    goToPage,
    dismissMessages,
  } = useAppointments();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingAppointment, setEditingAppointment] = React.useState(null);
  const [viewMode, setViewMode] = React.useState('list'); // 'list' | 'calendar'

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
    setEditingAppointment(null);
    selectAppointment(null);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingAppointment(record);
    selectAppointment(record);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAppointment(null);
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

  // Local filtering fallback in case backend only paginates without filtering
  const filteredAppointments = React.useMemo(() => {
    return appointments.filter((appt) => {
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
  }, [appointments, filters]);

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
      render: (status) => <StatusBadge status={status}>{status}</StatusBadge>,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes) => notes ?? <span style={{ color: '#ccc' }}>—</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Edit / Reschedule */}
          <Tooltip title="Reschedule">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              disabled={record.status === 'cancelled'}
            />
          </Tooltip>

          {/* Cancel */}
          {record.status === 'scheduled' && (
            <Tooltip title="Cancel">
              <Popconfirm
                title="Cancel this appointment?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => cancelAppointment(record.id)}
              >
                <Button size="small" icon={<StopOutlined />} danger loading={actionLoading} />
              </Popconfirm>
            </Tooltip>
          )}

          {/* Delete */}
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
        </div>
      ),
    },
  ];

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
            <>
              <Button icon={<ReloadOutlined />} onClick={fetchAppointments} loading={loading}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                New Appointment
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      {/* ── Calendar view ── */}
      {viewMode === 'calendar' && <AppointmentCalendar />}

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
              pagination={false}
              locale={{
                emptyText: <EmptyState>No appointments found.</EmptyState>,
              }}
              scroll={{ x: 800 }}
            />

            {pagination.totalPages > 1 && (
              <PaginationWrapper>
                <Pagination
                  current={pagination.currentPage}
                  total={pagination.totalRecords}
                  pageSize={pagination.perPage}
                  onChange={goToPage}
                  showSizeChanger={false}
                  showTotal={(total) => `${total} appointments`}
                />
              </PaginationWrapper>
            )}
          </TableCard>
        </>
      )}

      {/* ── Create / Edit modal ── */}
      <AppointmentFormModal
        open={modalOpen}
        onClose={closeModal}
        editingAppointment={editingAppointment}
      />
    </PageWrapper>
  );
};

export default AppointmentList;
