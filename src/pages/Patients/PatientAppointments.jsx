import React, { useEffect, useState, useMemo, useCallback } from 'react';
import styled, { keyframes, useTheme, css } from 'styled-components';
import { Tag, Calendar, Spin, Tooltip, Modal, message } from 'antd';
import dayjs from 'dayjs';
import {
  CalendarDays, List, RefreshCw, Plus,
  Clock, CheckCircle2, XCircle, Stethoscope, Hash,
  FileText, CalendarClock,
} from 'lucide-react';
import axiosClient from '../../services/axiosClient';
import PatientAppointmentFormModal from './PatientAppointmentFormModal';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

/* ─── Page wrapper ───────────────────────────────────────────────────────── */
const PageWrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  animation: ${fadeUp} 0.4s ease both;
  font-family: 'DM Sans', sans-serif;
`;

/* ─── Header ─────────────────────────────────────────────────────────────── */
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

/* ─── Toggle button ──────────────────────────────────────────────────────── */
const ToggleGroup = styled.div`
  display: flex;
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 10px;
  overflow: hidden;
`;

const ToggleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.$active ? p.theme.colors.primary + '15' : p.theme.colors.surface)};
  color: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary)};
`;

/* ─── Action button ──────────────────────────────────────────────────────── */
const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid ${(p) => p.theme.colors.border};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.$primary
    ? `linear-gradient(135deg, ${p.theme.colors.primary} 0%, #7c3aed 100%)`
    : p.theme.colors.surface)};
  color: ${(p) => (p.$primary ? '#fff' : p.theme.colors.textSecondary)};
  border-color: ${(p) => (p.$primary ? 'transparent' : p.theme.colors.border)};

  &:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }
`;

/* ─── Card-based list ────────────────────────────────────────────────────── */
const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Card = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  padding: 16px 20px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }
`;

const CardRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
`;

const CardSub = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textSecondary};
  margin-top: 2px;
`;

const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const MetaChip = styled.span`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

/* ─── Empty state ────────────────────────────────────────────────────────── */
const EmptyBox = styled.div`
  text-align: center;
  padding: 48px 20px;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  color: ${(p) => p.theme.colors.textSecondary};
  font-size: 14px;
`;

/* ─── Calendar styles ────────────────────────────────────────────────────── */
const CalendarCard = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);

  .ant-picker-calendar {
    background: transparent;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Header row ── */
  .ant-picker-calendar-header {
    padding: 16px 22px;
    border-bottom: 1px solid ${(p) => p.theme.colors.border};
    background: linear-gradient(
      135deg,
      ${(p) => p.theme.colors.primary}08 0%,
      ${(p) => p.theme.colors.surface} 100%
    );
  }

  .ant-picker-panel {
    background: transparent;
  }

  /* ── Day-of-week header ── */
  .ant-picker-content th {
    color: ${(p) => p.theme.colors.textSecondary};
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding-bottom: 10px;
  }

  /* ── Date cells ── */
  .ant-picker-cell {
    transition: background 0.15s;
  }

  .ant-picker-cell .ant-picker-calendar-date {
    border-radius: 10px;
    margin: 2px 3px;
    padding: 4px 6px 0;
    transition: all 0.15s ease;
    border: 1.5px solid transparent;
  }

  .ant-picker-cell:hover .ant-picker-calendar-date {
    background: ${(p) => p.theme.colors.primary}08;
  }

  .ant-picker-cell-in-view .ant-picker-calendar-date-value {
    color: ${(p) => p.theme.colors.text};
    font-weight: 500;
    font-size: 13px;
  }

  /* ── Today cell ── */
  .ant-picker-cell-today .ant-picker-calendar-date {
    background: ${(p) => p.theme.colors.primary}0a;
    border-color: ${(p) => p.theme.colors.primary}40;
  }

  .ant-picker-cell-today .ant-picker-calendar-date-value {
    color: ${(p) => p.theme.colors.primary};
    font-weight: 700;
  }

  /* ── Selected cell ── */
  .ant-picker-cell-selected .ant-picker-calendar-date {
    background: ${(p) => p.theme.colors.primary}14;
    border-color: ${(p) => p.theme.colors.primary}50;
    border-radius: 10px;
  }

  .ant-picker-cell-selected .ant-picker-calendar-date-value {
    color: ${(p) => p.theme.colors.primary};
    font-weight: 700;
  }

  /* ── Out-of-month cells ── */
  .ant-picker-cell:not(.ant-picker-cell-in-view) .ant-picker-calendar-date-value {
    color: ${(p) => p.theme.colors.textSecondary};
    opacity: 0.35;
  }

  /* ── Grid lines ── */
  .ant-picker-content td,
  .ant-picker-content th {
    border-top: 1px solid ${(p) => p.theme.colors.border};
  }

  .ant-picker-content td {
    border-right: 1px solid ${(p) => p.theme.colors.border}88;
  }

  .ant-picker-content td:last-child {
    border-right: none;
  }

  /* ── Content area of each cell ── */
  .ant-picker-calendar-date-content {
    height: auto !important;
    min-height: 50px;
    overflow: hidden !important;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const EventPill = styled.div`
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 6px;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: all 0.15s ease;
  letter-spacing: 0.01em;

  ${({ $status }) => $status === 'scheduled' && css`
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
    color: #1d4ed8;
    border-left: 3px solid #3b82f6;
  `}
  ${({ $status }) => $status === 'completed' && css`
    background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
    color: #15803d;
    border-left: 3px solid #22c55e;
  `}
  ${({ $status }) => $status === 'cancelled' && css`
    background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
    color: #b91c1c;
    border-left: 3px solid #ef4444;
  `}
  ${({ $status }) => !['scheduled', 'completed', 'cancelled'].includes($status) && css`
    background: #f3f4f6;
    color: #555;
    border-left: 3px solid #9ca3af;
  `}

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const MorePill = styled.div`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: ${(p) => p.theme.colors.primary}12;
  color: ${(p) => p.theme.colors.primary};
  cursor: pointer;
  display: inline-block;
  margin-top: 1px;
  transition: background 0.15s;

  &:hover {
    background: ${(p) => p.theme.colors.primary}22;
  }
`;

/* ─── Detail Modal ───────────────────────────────────────────────────────── */

const ModalHero = styled.div`
  background: linear-gradient(135deg, ${(p) => p.theme.colors.primary} 0%, #7c3aed 100%);
  margin: 0 0 20px;
  padding: 22px 24px;
  border-radius: 14px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ModalHeroIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ModalHeroText = styled.div`
  h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  p {
    margin: 3px 0 0;
    font-size: 12.5px;
    opacity: 0.8;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  background: ${(p) => p.theme.colors.background};
  padding: 14px 16px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: ${(p) => p.theme.colors.primary}40;
    box-shadow: 0 2px 10px ${(p) => p.theme.colors.primary}08;
  }
`;

const DetailItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
`;

const DetailItemIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${(p) => p.$color || p.theme.colors.primary}14;
  color: ${(p) => p.$color || p.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DetailLabel = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const DetailValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  color: ${(p) => p.theme.colors.text};
  word-break: break-word;
`;

const DetailNote = styled.div`
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  background: ${(p) => p.theme.colors.background};
  padding: 14px 16px;
  margin-top: 12px;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${(p) => p.theme.colors.primary}40;
  }
`;

const DetailNoteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
`;

const DetailNoteText = styled.div`
  font-size: 13.5px;
  line-height: 1.6;
  color: ${(p) => p.theme.colors.text};
  white-space: pre-wrap;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.02em;

  ${({ $status }) => $status === 'scheduled' && css`
    background: linear-gradient(135deg, #dbeafe, #eff6ff);
    color: #1d4ed8;
  `}
  ${({ $status }) => $status === 'completed' && css`
    background: linear-gradient(135deg, #dcfce7, #f0fdf4);
    color: #15803d;
  `}
  ${({ $status }) => $status === 'cancelled' && css`
    background: linear-gradient(135deg, #fee2e2, #fef2f2);
    color: #b91c1c;
  `}
`;

/* ─── Loading spinner ────────────────────────────────────────────────────── */
const spin = keyframes`to { transform: rotate(360deg); }`;

const SpinnerWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid ${(p) => p.theme.colors.border};
  border-top-color: ${(p) => p.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

/* ─── Status helpers ─────────────────────────────────────────────────────── */
const statusConfig = {
  scheduled: { color: 'blue', icon: <Clock size={13} /> },
  completed: { color: 'green', icon: <CheckCircle2 size={13} /> },
  cancelled: { color: 'red', icon: <XCircle size={13} /> },
};

const statusIcons = {
  scheduled: <Clock size={14} />,
  completed: <CheckCircle2 size={14} />,
  cancelled: <XCircle size={14} />,
};

const fmtDateTime = (val) =>
  val
    ? dayjs(val).format('DD MMM YYYY, hh:mm A')
    : '—';

/* ─── API helper — extract array from response ───────────────────────────── */
const extractList = (resData) => {
  const d = resData?.data ?? resData;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Component                                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function PatientAppointments() {
  const theme = useTheme();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [detailAppt, setDetailAppt] = useState(null);

  // ── Fetch patient's own appointments ────────────────────────────────────
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/appointments', {
        withCredentials: true,
      });
      setAppointments(extractList(res.data));
    } catch (err) {
      message.error(
        err.response?.data?.message || 'Failed to load appointments.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // ── Callback after booking succeeds ─────────────────────────────────────
  const handleBookingSuccess = useCallback(() => {
    setBookingOpen(false);
    loadAppointments();
  }, [loadAppointments]);

  // ── Calendar data ─────────────────────────────────────────────────────
  const appointmentsByDate = useMemo(() => {
    const map = {};
    appointments.forEach((appt) => {
      if (!appt.scheduled_at) return;
      const key = dayjs(appt.scheduled_at).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(appt);
    });
    return map;
  }, [appointments]);

  const dateCellRender = useCallback(
    (value) => {
      const dateKey = value.format('YYYY-MM-DD');
      const dayAppts = appointmentsByDate[dateKey] ?? [];

      return (
        <div style={{ minHeight: 24 }}>
          {dayAppts.slice(0, 2).map((appt) => (
            <Tooltip
              key={appt.id}
              title={`${appt.doctor_name || 'Doctor'} — ${dayjs(appt.scheduled_at).format('hh:mm A')}`}
            >
              <EventPill
                $status={appt.status}
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailAppt(appt);
                }}
              >
                {dayjs(appt.scheduled_at).format('hh:mm A')} {appt.doctor_name || ''}
              </EventPill>
            </Tooltip>
          ))}
          {dayAppts.length > 2 && (
            <MorePill>+{dayAppts.length - 2} more</MorePill>
          )}
        </div>
      );
    },
    [appointmentsByDate]
  );

  // ── Loading state ─────────────────────────────────────────────────────
  if (loading && appointments.length === 0) {
    return (
      <PageWrapper>
        <SpinnerWrap><Spinner /></SpinnerWrap>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* ── Header ── */}
      <Header>
        <Title>
          <CalendarDays size={22} color={theme.colors.primary} />
          My Appointments
        </Title>
        <Actions>
          <ToggleGroup>
            <ToggleBtn
              $active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <List size={14} /> List
            </ToggleBtn>
            <ToggleBtn
              $active={viewMode === 'calendar'}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays size={14} /> Calendar
            </ToggleBtn>
          </ToggleGroup>

          <ActionBtn onClick={loadAppointments}>
            <RefreshCw size={14} /> Refresh
          </ActionBtn>

          <ActionBtn $primary onClick={() => setBookingOpen(true)}>
            <Plus size={14} /> Book Appointment
          </ActionBtn>
        </Actions>
      </Header>

      {/* ── List view ── */}
      {viewMode === 'list' && (
        <>
          {appointments.length === 0 ? (
            <EmptyBox>
              <CalendarDays size={36} color={theme.colors.textSecondary} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div>You don't have any appointments yet.</div>
              <div style={{ marginTop: 8, fontSize: 13 }}>
                Click <strong>Book Appointment</strong> to schedule your first visit.
              </div>
            </EmptyBox>
          ) : (
            <CardList>
              {appointments.map((appt) => {
                const cfg = statusConfig[appt.status] ?? statusConfig.scheduled;
                return (
                  <Card key={appt.id}>
                    <CardRow>
                      <div>
                        <CardTitle>{fmtDateTime(appt.scheduled_at)}</CardTitle>
                        <CardSub>{appt.doctor_name || 'Doctor not assigned'}</CardSub>
                      </div>
                      <Tag
                        color={cfg.color}
                        icon={cfg.icon}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </Tag>
                    </CardRow>
                    {appt.notes && (
                      <CardMeta>
                        <MetaChip>{appt.notes}</MetaChip>
                      </CardMeta>
                    )}
                  </Card>
                );
              })}
            </CardList>
          )}
        </>
      )}

      {/* ── Calendar view ── */}
      {viewMode === 'calendar' && (
        <CalendarCard>
          <Spin spinning={loading}>
            <Calendar cellRender={dateCellRender} />
          </Spin>
        </CalendarCard>
      )}

      {/* ── Booking modal ── */}
      <PatientAppointmentFormModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* ── Read-only detail modal ── */}
      <Modal
        open={!!detailAppt}
        onCancel={() => setDetailAppt(null)}
        footer={null}
        centered
        width={540}
        closable
        closeIcon={
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.colors.textSecondary, fontSize: 15, fontWeight: 700, lineHeight: 1,
          }}>✕</div>
        }
        styles={{
          content: {
            background: theme.colors.surface,
            borderRadius: 18,
            overflow: 'hidden',
            padding: '0',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
          },
          header: { display: 'none' },
          body: { padding: '20px 24px 24px' },
          close: {
            position: 'absolute', top: 14, right: 14, zIndex: 10,
          },
        }}
      >
        {detailAppt && (
          <>
            {/* ── Gradient hero banner ── */}
            <ModalHero>
              <ModalHeroIcon>
                <CalendarClock size={22} color="#fff" />
              </ModalHeroIcon>
              <ModalHeroText>
                <h3>Appointment Details</h3>
                <p>Appointment #{detailAppt.id} · {fmtDateTime(detailAppt.scheduled_at)}</p>
              </ModalHeroText>
            </ModalHero>

            {/* ── Detail cards ── */}
            <DetailGrid>
              <DetailItem>
                <DetailItemHeader>
                  <DetailItemIcon $color="#7c3aed">
                    <Stethoscope size={13} />
                  </DetailItemIcon>
                  <DetailLabel>Doctor</DetailLabel>
                </DetailItemHeader>
                <DetailValue>{detailAppt.doctor_name ?? '—'}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailItemHeader>
                  <DetailItemIcon $color="#2563eb">
                    <CalendarClock size={13} />
                  </DetailItemIcon>
                  <DetailLabel>Scheduled</DetailLabel>
                </DetailItemHeader>
                <DetailValue>{fmtDateTime(detailAppt.scheduled_at)}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailItemHeader>
                  <DetailItemIcon $color={
                    detailAppt.status === 'completed' ? '#16a34a' :
                    detailAppt.status === 'cancelled' ? '#dc2626' : '#2563eb'
                  }>
                    {statusIcons[detailAppt.status] ?? <Clock size={13} />}
                  </DetailItemIcon>
                  <DetailLabel>Status</DetailLabel>
                </DetailItemHeader>
                <StatusBadge $status={detailAppt.status}>
                  {statusIcons[detailAppt.status]}
                  {detailAppt.status?.charAt(0).toUpperCase() + detailAppt.status?.slice(1)}
                </StatusBadge>
              </DetailItem>

              <DetailItem>
                <DetailItemHeader>
                  <DetailItemIcon $color="#f59e0b">
                    <Hash size={13} />
                  </DetailItemIcon>
                  <DetailLabel>Appointment ID</DetailLabel>
                </DetailItemHeader>
                <DetailValue>#{detailAppt.id}</DetailValue>
              </DetailItem>
            </DetailGrid>

            {/* ── Notes ── */}
            <DetailNote>
              <DetailNoteHeader>
                <DetailItemIcon $color="#6b7280">
                  <FileText size={13} />
                </DetailItemIcon>
                <DetailLabel>Notes</DetailLabel>
              </DetailNoteHeader>
              <DetailNoteText>
                {detailAppt.notes?.trim() || 'No notes added.'}
              </DetailNoteText>
            </DetailNote>
          </>
        )}
      </Modal>
    </PageWrapper>
  );
}
