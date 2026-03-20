import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Calendar,
  Button,
  Select,
  Tooltip,
  Tag,
  Spin,
  Empty,
  message,
  Radio,
} from 'antd';
import {
  CalendarOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useCalendar from '../../modules/calendar/hooks/useCalendar';
import { DOCTOR_MAP } from '../../utils/appointmentMapping';
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
  SidePanel,
  SidePanelHeader,
  SidePanelBody,
  DetailCard,
  DetailRow,
  UpcomingItem,
  DropZone,
  ErrorBanner,
  ReschedulingOverlay,
} from './AppointmentCalendar.styles';

const { Option } = Select;

const AppointmentCalendar = () => {
  const {
    appointments,
    selectedDate,
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

  // ── Group appointments by date ────────────────────────────────────────────
  const appointmentsByDate = React.useMemo(() => {
    const map = {};
    appointments.forEach((appt) => {
      if (!appt.scheduled_at) return;
      const key = dayjs(appt.scheduled_at).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(appt);
    });
    return map;
  }, [appointments]);

  // ── Upcoming appointments (next 7 days) ───────────────────────────────────
  const upcoming = React.useMemo(() => {
    const now = dayjs();
    return appointments
      .filter(
        (a) =>
          a.status === 'scheduled' &&
          dayjs(a.scheduled_at).isAfter(now) &&
          dayjs(a.scheduled_at).isBefore(now.add(7, 'day'))
      )
      .sort((a, b) => dayjs(a.scheduled_at).unix() - dayjs(b.scheduled_at).unix())
      .slice(0, 8);
  }, [appointments]);

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

  // ── Doctor filter options ─────────────────────────────────────────────────
  const doctorOptions = Object.entries(DOCTOR_MAP).map(([id, name]) => (
    <Option key={id} value={Number(id)}>{name}</Option>
  ));

  // ── Side panel content ────────────────────────────────────────────────────
  const renderSidePanel = () => {
    if (selectedAppointment) {
      return (
        <SidePanel>
          <SidePanelHeader>
            Appointment details
            <Button
              type="text"
              size="small"
              icon={<CloseCircleOutlined />}
              style={{ float: 'right', marginTop: -2 }}
              onClick={() => setSelectedAppointment(null)}
            />
          </SidePanelHeader>
          <DetailCard>
            <DetailRow>
              <span className="label">Patient</span>
              <span className="value">{selectedAppointment.patient_name ?? '—'}</span>
            </DetailRow>
            <DetailRow>
              <span className="label">Doctor</span>
              <span className="value">{selectedAppointment.doctor_name ?? '—'}</span>
            </DetailRow>
            <DetailRow>
              <span className="label">Scheduled</span>
              <span className="value">
                {dayjs(selectedAppointment.scheduled_at).format('DD MMM YYYY, hh:mm A')}
              </span>
            </DetailRow>
            <DetailRow>
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
                  {selectedAppointment.status}
                </Tag>
              </span>
            </DetailRow>
            {selectedAppointment.notes && (
              <DetailRow>
                <span className="label">Notes</span>
                <span className="value">{selectedAppointment.notes}</span>
              </DetailRow>
            )}
            {selectedAppointment.status === 'scheduled' && (
              <div style={{ marginTop: 12, fontSize: 11, color: '#8c8c8c' }}>
                Drag this appointment to another date to reschedule.
              </div>
            )}
          </DetailCard>
        </SidePanel>
      );
    }

    return (
      <SidePanel>
        <SidePanelHeader>Upcoming (next 7 days)</SidePanelHeader>
        <SidePanelBody>
          {loading ? (
            <Spin size="small" />
          ) : upcoming.length === 0 ? (
            <Empty
              description="No upcoming appointments"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            upcoming.map((appt) => (
              <UpcomingItem
                key={appt.id}
                onClick={() => setSelectedAppointment(appt)}
              >
                <div className="name">{appt.patient_name ?? '—'}</div>
                <div className="meta">
                  {dayjs(appt.scheduled_at).format('DD MMM, hh:mm A')} ·{' '}
                  {appt.doctor_name ?? '—'}
                </div>
              </UpcomingItem>
            ))
          )}
        </SidePanelBody>
      </SidePanel>
    );
  };

  return (
    <PageWrapper>
      {/* ── Header ── */}
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
          {doctorOptions}
        </Select>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {rescheduling && (
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              <Spin size="small" style={{ marginRight: 6 }} />
              Rescheduling...
            </span>
          )}
        </div>
      </ToolbarRow>

      {/* ── Calendar + side panel ── */}
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

        {renderSidePanel()}
      </CalendarLayout>
    </PageWrapper>
  );
};

export default AppointmentCalendar;
