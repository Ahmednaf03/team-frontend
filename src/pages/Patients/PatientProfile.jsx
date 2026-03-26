import React, { useEffect, useState } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { Tag } from 'antd';
import axios from 'axios';
import axiosClient from '../../services/axiosClient';
import {
  UserRound, HeartPulse, CalendarDays, FlaskConical,
  ReceiptText, LogOut, Phone, MapPin, ShieldCheck,
  Clock, CheckCircle2, XCircle, AlertCircle, Pill,
} from 'lucide-react';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`to { transform: rotate(360deg); }`;

/* ─── Shell ──────────────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: 100vh;
  background: ${(p) => p.theme.colors.background};
  font-family: 'DM Sans', sans-serif;
`;

const TopBar = styled.header`
  background: ${(p) => p.theme.colors.surface};
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1.5px solid ${(p) => p.theme.colors.border};
  border-radius: 8px;
  padding: 7px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: #ef4444; color: #ef4444; }
`;

const Body = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  animation: ${fadeUp} 0.4s ease both;
`;

/* ─── Hero card ──────────────────────────────────────────────────────────── */
const HeroCard = styled.div`
  background: linear-gradient(135deg, ${(p) => p.theme.colors.primary} 0%, #7c3aed 100%);
  border-radius: 18px;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 28px;
  color: #fff;
`;

const HeroAvatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  flex-shrink: 0;
  letter-spacing: -1px;
`;

const HeroName = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
`;

const HeroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 13px;
  opacity: 0.85;
  margin-top: 6px;
`;

const HeroMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

/* ─── Info strip ─────────────────────────────────────────────────────────── */
const InfoStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
`;

const InfoCard = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InfoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: ${(p) => p.theme.colors.primary}15;
  color: ${(p) => p.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const InfoValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  margin-top: 2px;
`;

/* ─── Section ────────────────────────────────────────────────────────────── */
const Section = styled.section`
  margin-bottom: 28px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
  margin: 0;
`;

const SectionIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${(p) => p.$color || p.theme.colors.primary}18;
  color: ${(p) => p.$color || p.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SectionCount = styled.span`
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSecondary};
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 999px;
  padding: 2px 10px;
`;

/* ─── Cards ──────────────────────────────────────────────────────────────── */
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

/* ─── Prescription items table ───────────────────────────────────────────── */
const MedTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  font-size: 12.5px;
`;

const MedTh = styled.th`
  text-align: left;
  padding: 6px 10px;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(p) => p.theme.colors.textSecondary};
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const MedTd = styled.td`
  padding: 8px 10px;
  color: ${(p) => p.theme.colors.text};
  border-bottom: 1px solid ${(p) => p.theme.colors.border}66;
  &:last-child { border-bottom: none; }
`;

/* ─── Invoice amount ─────────────────────────────────────────────────────── */
const Amount = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${(p) => (p.$paid ? '#16a34a' : p.theme.colors.text)};
`;

/* ─── Empty / Loader ─────────────────────────────────────────────────────── */
const EmptyBox = styled.div`
  text-align: center;
  padding: 32px 20px;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  color: ${(p) => p.theme.colors.textSecondary};
  font-size: 13px;
`;

const SpinnerWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid ${(p) => p.theme.colors.border};
  border-top-color: ${(p) => p.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const fmtDate = (val) =>
  val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (val) =>
  val ? new Date(val).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const appointmentStatusConfig = {
  scheduled:  { color: 'blue',   icon: <Clock size={13} /> },
  completed:  { color: 'green',  icon: <CheckCircle2 size={13} /> },
  cancelled:  { color: 'red',    icon: <XCircle size={13} /> },
};

const rxStatusConfig = {
  PENDING:    { color: 'orange', icon: <AlertCircle size={13} /> },
  VERIFIED:   { color: 'blue',   icon: <ShieldCheck size={13} /> },
  DISPENSED:  { color: 'green',  icon: <CheckCircle2 size={13} /> },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function PatientProfile() {
  const theme = useTheme();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res   = await axiosClient.get('/patient/profile', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        // Backend wraps in { data: {...}, message: '...' } via Response::json
        setProfile(res.data.data ?? res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('csrf_token');
    window.location.href = '/patient-login';
  };

  if (loading) return (
    <Page>
      <SpinnerWrap><Spinner /></SpinnerWrap>
    </Page>
  );

  if (error) return (
    <Page>
      <SpinnerWrap>
        <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
          <XCircle size={40} color="#ef4444" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600 }}>{error}</div>
        </div>
      </SpinnerWrap>
    </Page>
  );

  const { appointments = [], prescriptions = [], invoices = [] } = profile;

  return (
    <Page>

      {/* ── Top bar ── */}
      <TopBar>
        <Brand>
          <HeartPulse size={22} color={theme.colors.primary} />
          NexaCare — Patient Portal
        </Brand>
        <LogoutBtn onClick={handleLogout}>
          <LogOut size={14} /> Sign Out
        </LogoutBtn>
      </TopBar>

      <Body>

        {/* ── Hero ── */}
        <HeroCard>
          <HeroAvatar>{initials(profile.name)}</HeroAvatar>
          <div>
            <HeroName>{profile.name}</HeroName>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Patient ID #{profile.id}</div>
            <HeroMeta>
              <HeroMetaItem><UserRound size={13} /> {profile.gender || '—'}, {profile.age} yrs</HeroMetaItem>
              <HeroMetaItem><HeartPulse size={13} /> {profile.diagnosis || 'No diagnosis noted'}</HeroMetaItem>
            </HeroMeta>
          </div>
        </HeroCard>

        {/* ── Info strip ── */}
        <InfoStrip>
          <InfoCard>
            <InfoIcon><Phone size={16} /></InfoIcon>
            <div>
              <InfoLabel>Phone</InfoLabel>
              <InfoValue>{profile.phone || '—'}</InfoValue>
            </div>
          </InfoCard>
          <InfoCard>
            <InfoIcon><MapPin size={16} /></InfoIcon>
            <div>
              <InfoLabel>Address</InfoLabel>
              <InfoValue style={{ fontSize: 13 }}>{profile.address || '—'}</InfoValue>
            </div>
          </InfoCard>
          <InfoCard>
            <InfoIcon><CalendarDays size={16} /></InfoIcon>
            <div>
              <InfoLabel>Registered</InfoLabel>
              <InfoValue>{fmtDate(profile.created_at)}</InfoValue>
            </div>
          </InfoCard>
          <InfoCard>
            <InfoIcon><ShieldCheck size={16} /></InfoIcon>
            <div>
              <InfoLabel>Status</InfoLabel>
              <InfoValue style={{ color: '#16a34a' }}>Active</InfoValue>
            </div>
          </InfoCard>
        </InfoStrip>

        {/* ── Appointments ── */}
        <Section>
          <SectionHeader>
            <SectionIcon $color="#2563eb"><CalendarDays size={16} /></SectionIcon>
            <SectionTitle>Appointments</SectionTitle>
            <SectionCount>{appointments.length}</SectionCount>
          </SectionHeader>

          {appointments.length === 0 ? (
            <EmptyBox>No appointments on record yet.</EmptyBox>
          ) : (
            <CardList>
              {appointments.map((appt) => {
                const cfg = appointmentStatusConfig[appt.status] ?? appointmentStatusConfig.scheduled;
                return (
                  <Card key={appt.id}>
                    <CardRow>
                      <div>
                        <CardTitle>{fmtDateTime(appt.scheduled_at)}</CardTitle>
                        <CardSub>Dr. {appt.doctor_name || 'Unknown'}</CardSub>
                      </div>
                      <Tag color={cfg.color} icon={cfg.icon} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
        </Section>

        {/* ── Prescriptions ── */}
        <Section>
          <SectionHeader>
            <SectionIcon $color="#7c3aed"><FlaskConical size={16} /></SectionIcon>
            <SectionTitle>Prescriptions</SectionTitle>
            <SectionCount>{prescriptions.length}</SectionCount>
          </SectionHeader>

          {prescriptions.length === 0 ? (
            <EmptyBox>No prescriptions on record yet.</EmptyBox>
          ) : (
            <CardList>
              {prescriptions.map((rx) => {
                const cfg = rxStatusConfig[rx.status] ?? rxStatusConfig.PENDING;
                return (
                  <Card key={rx.id}>
                    <CardRow>
                      <div>
                        <CardTitle>Prescription #{rx.id}</CardTitle>
                        <CardSub>Dr. {rx.doctor_name || 'Unknown'} · {fmtDate(rx.prescription_date)}</CardSub>
                      </div>
                      <Tag color={cfg.color} icon={cfg.icon} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {rx.status}
                      </Tag>
                    </CardRow>

                    {rx.notes && (
                      <CardMeta>
                        <MetaChip><AlertCircle size={12} /> {rx.notes}</MetaChip>
                      </CardMeta>
                    )}

                    {rx.items && rx.items.length > 0 && (
                      <MedTable>
                        <thead>
                          <tr>
                            <MedTh>Medicine</MedTh>
                            <MedTh>Dosage</MedTh>
                            <MedTh>Frequency</MedTh>
                            <MedTh>Duration</MedTh>
                            <MedTh>Qty</MedTh>
                          </tr>
                        </thead>
                        <tbody>
                          {rx.items.map((item) => (
                            <tr key={item.id}>
                              <MedTd>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <Pill size={12} color={theme.colors.primary} />
                                  {item.medicine_name}
                                </span>
                              </MedTd>
                              <MedTd>{item.dosage || '—'}</MedTd>
                              <MedTd>{item.frequency || '—'}</MedTd>
                              <MedTd>{item.duration_days ? `${item.duration_days}d` : '—'}</MedTd>
                              <MedTd>{item.quantity}</MedTd>
                            </tr>
                          ))}
                        </tbody>
                      </MedTable>
                    )}

                    {rx.dispensed_at && (
                      <CardMeta style={{ marginTop: 8 }}>
                        <MetaChip><CheckCircle2 size={12} color="#16a34a" /> Dispensed on {fmtDate(rx.dispensed_at)}</MetaChip>
                      </CardMeta>
                    )}
                  </Card>
                );
              })}
            </CardList>
          )}
        </Section>

        {/* ── Invoices ── */}
        <Section>
          <SectionHeader>
            <SectionIcon $color="#16a34a"><ReceiptText size={16} /></SectionIcon>
            <SectionTitle>Billing & Invoices</SectionTitle>
            <SectionCount>{invoices.length}</SectionCount>
          </SectionHeader>

          {invoices.length === 0 ? (
            <EmptyBox>No invoices on record yet.</EmptyBox>
          ) : (
            <CardList>
              {invoices.map((inv) => {
                const isPaid = inv.status === 'PAID';
                return (
                  <Card key={inv.id}>
                    <CardRow>
                      <div>
                        <CardTitle>Invoice #{inv.id}</CardTitle>
                        <CardSub>Prescription #{inv.prescription_id} · {fmtDate(inv.created_at)}</CardSub>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Amount $paid={isPaid}>₹{Number(inv.total_amount).toFixed(2)}</Amount>
                        <div style={{ marginTop: 4 }}>
                          <Tag color={isPaid ? 'green' : 'orange'}>
                            {inv.status}
                          </Tag>
                        </div>
                      </div>
                    </CardRow>
                    {isPaid && inv.paid_at && (
                      <CardMeta>
                        <MetaChip><CheckCircle2 size={12} color="#16a34a" /> Paid on {fmtDate(inv.paid_at)}</MetaChip>
                      </CardMeta>
                    )}
                  </Card>
                );
              })}
            </CardList>
          )}
        </Section>

      </Body>
    </Page>
  );
}