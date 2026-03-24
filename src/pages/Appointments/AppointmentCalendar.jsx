import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Calendar,
  Button,
  Select,
  Tooltip,
  Tag,
  Spin,
  message,
  Modal,
} from 'antd';
import {
  CalendarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTheme } from 'styled-components';
import useCalendar from '../../modules/calendar/hooks/useCalendar';
import { enrichAppointment } from '../../utils/appointmentMapping';
import useAppointmentReferenceData from './useAppointmentReferenceData';
import {
  PageWrapper,
  PageHeader,
  PageTitle,
  ToolbarRow,
  ToolbarLabel,
  CalendarLayout,
  CalendarCard,
  CalendarWrapper,
  EventPill,
  MorePill,
  DropZone,
  ErrorBanner,
  ReschedulingOverlay,
  DetailModalBody,
  DetailGrid,
  DetailItem,
  DetailNote,
} from './AppointmentCalendar.styles';

const { Option } = Select;

const AppointmentCalendar = ({ showHeader = true }) => {
  const {
    appointments,
    selectedDoctor,
    loading,
    rescheduling,
    error,
    success,
    fetchCalendarData,
    rescheduleAppointment,
    changeDate,
    changeDoctor,
    dismissMessages,
  } = useCalendar();
  const theme = useTheme();
  const {
    doctors: doctorOptions,
    patientLookup,
    doctorLookup,
  } = useAppointmentReferenceData();

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const dragRef = useRef(null); // stores { id, originalDate, originalTime }

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // ── Toast messages ────────────────────────────────────────────────────────
  useEffect(() => {
    if (success) { message.success(success); dismissMessages(); }
  }, [success, dismissMessages]);

  useEffect(() => {
    if (error) { message.error(error); dismissMessages(); }
  }, [error, dismissMessages]);

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

  // ── Group appointments by date ────────────────────────────────────────────
  const appointmentsByDate = React.useMemo(() => {
    const map = {};
    displayAppointments.forEach((appt) => {
      if (!appt.scheduled_at) return;
      const key = dayjs(appt.scheduled_at).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(appt);
    });
    return map;
  }, [displayAppointments]);

  // ── Drag & Drop handlers ──────────────────────────────────────────────────
  const handleDragStart = useCallback((e, appt) => {
    dragRef.current = {
      id: appt.id,
      originalDate: dayjs(appt.scheduled_at).format('YYYY-MM-DD'),
      originalTime: dayjs(appt.scheduled_at).format('HH:mm:ss'),
    };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(appt.id));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e, targetDate) => {
      e.preventDefault();
      if (!dragRef.current) return;
      const { id, originalDate, originalTime } = dragRef.current;

      if (targetDate === originalDate) return; // same date — no change

      rescheduleAppointment({
        id,
        newDate: targetDate,
        newTime: originalTime,
      });

      dragRef.current = null;
    },
    [rescheduleAppointment]
  );

  // ── Calendar cell renderer ────────────────────────────────────────────────
  const dateCellRender = useCallback(
    (value) => {
      const dateKey = value.format('YYYY-MM-DD');
      const dayAppts = appointmentsByDate[dateKey] ?? [];

      return (
        <DropZone
          $isover="false"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, dateKey)}
          onDragEnter={(e) => e.currentTarget.setAttribute('data-over', 'true')}
          onDragLeave={(e) => e.currentTarget.setAttribute('data-over', 'false')}
        >
          {dayAppts.slice(0, 2).map((appt) => (
            <Tooltip
              key={appt.id}
              title={`${appt.patient_name || 'Patient'} — ${dayjs(appt.scheduled_at).format('hh:mm A')} — ${appt.doctor_name || 'Doctor'}`}
            >
              <EventPill
                status={appt.status}
                isoptimistic={String(!!appt._optimistic)}
                draggable={appt.status === 'scheduled'}
                onDragStart={(e) => handleDragStart(e, appt)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAppointment(appt);
                }}
              >
                {dayjs(appt.scheduled_at).format('hh:mm A')} {appt.patient_name || 'Patient'}
              </EventPill>
            </Tooltip>
          ))}
          {dayAppts.length > 2 && (
            <MorePill onClick={(e) => { e.stopPropagation(); changeDate(dateKey); }}>
              +{dayAppts.length - 2} more
            </MorePill>
          )}
        </DropZone>
      );
    },
    [appointmentsByDate, handleDragStart, handleDragOver, handleDrop, changeDate]
  );

  return (
    <PageWrapper $compact={!showHeader}>
      {showHeader && (
        <PageHeader>
          <PageTitle>
            <CalendarOutlined />
            Appointment Calendar
          </PageTitle>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchCalendarData}
            loading={loading}
          >
            Refresh
          </Button>
        </PageHeader>
      )}

      {/* ── Error banner with retry ── */}
      {error && (
        <ErrorBanner>
          <span>{error}</span>
          <Button size="small" onClick={fetchCalendarData}>
            Retry
          </Button>
        </ErrorBanner>
      )}

      {/* ── Toolbar ── */}
      <ToolbarRow>
        <ToolbarLabel>Doctor:</ToolbarLabel>
        <Select
          placeholder="All doctors"
          allowClear
          style={{ width: 180 }}
          value={selectedDoctor ?? undefined}
          onChange={(val) => changeDoctor(val ?? null)}
        >
          {doctorOptions.map(({ value, label }) => (
            <Option key={value} value={value}>{label}</Option>
          ))}
        </Select>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {rescheduling && (
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              <Spin size="small" style={{ marginRight: 6 }} />
              Rescheduling...
            </span>
          )}
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchCalendarData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </ToolbarRow>

      <CalendarLayout>
        <CalendarWrapper>
          {rescheduling && (
            <ReschedulingOverlay>
              <Spin tip="Updating..." />
            </ReschedulingOverlay>
          )}
          <CalendarCard>
            <Spin spinning={loading}>
              <Calendar
                cellRender={dateCellRender}
                onSelect={(date) => changeDate(date.format('YYYY-MM-DD'))}
              />
            </Spin>
          </CalendarCard>
        </CalendarWrapper>
      </CalendarLayout>

      <Modal
        open={!!selectedAppointment}
        onCancel={() => setSelectedAppointment(null)}
        footer={null}
        centered
        width={520}
        title="Appointment details"
        styles={{
          content: {
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)',
          },
          header: {
            background: theme.colors.surface,
            borderBottom: `1px solid ${theme.colors.border}`,
            marginBottom: 0,
            paddingBottom: 14,
          },
          body: {
            paddingTop: 18,
          },
        }}
      >
        {selectedAppointment && (
          <DetailModalBody>
            <DetailGrid>
              <DetailItem>
                <span className="label">Patient</span>
                <span className="value">{selectedAppointment.patient_name ?? '—'}</span>
              </DetailItem>

              <DetailItem>
                <span className="label">Doctor</span>
                <span className="value">{selectedAppointment.doctor_name ?? '—'}</span>
              </DetailItem>

              <DetailItem>
                <span className="label">Scheduled</span>
                <span className="value">
                  {selectedAppointment.scheduled_at
                    ? dayjs(selectedAppointment.scheduled_at).format('DD MMM YYYY, hh:mm A')
                    : '—'}
                </span>
              </DetailItem>

              <DetailItem>
                <span className="label">Status</span>
                <span className="value">
                  <Tag
                    color={
                      selectedAppointment.status === 'scheduled'
                        ? 'blue'
                        : selectedAppointment.status === 'completed'
                        ? 'green'
                        : 'red'
                    }
                  >
                    {selectedAppointment.status ?? '—'}
                  </Tag>
                </span>
              </DetailItem>
            </DetailGrid>

            <DetailNote>
              <span className="label">Notes</span>
              <span className="value">{selectedAppointment.notes?.trim() || 'No notes added.'}</span>
            </DetailNote>

            {selectedAppointment.status === 'scheduled' && (
              <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Drag this appointment to another date in the calendar to reschedule it.
              </div>
            )}
          </DetailModalBody>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default AppointmentCalendar;
