// src/pages/Prescriptions/Prescriptions.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled, { keyframes, css, useTheme } from 'styled-components';
import {
  Modal, Tag, Tooltip, Popconfirm, Badge, Empty, Spin,
  Select, Divider, Steps
} from 'antd';
import { toast } from 'react-hot-toast';
import usePrescriptions from '../../modules/prescriptions/hooks/usePrescriptions';
import useAuth from '../../modules/auth/hooks/useAuth';

const { Option } = Select;

// ── Animations ────────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

// ── Layout ────────────────────────────────────────────────────────────────────
const Page = styled.div`
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  animation: ${fadeUp} 0.3s ease both;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  flex-shrink: 0;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  letter-spacing: -0.3px;
`;

const PageSubtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const PrimaryBtn = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, #8b5cf6 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(37,99,235,0.25);

  &:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,235,0.35); }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

// ── Toolbar ───────────────────────────────────────────────────────────────────
const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 220px;
  max-width: 380px;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 38px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 0 14px 0 38px;
  font-size: 14px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &::placeholder { color: ${({ theme }) => theme.colors.textSecondary}; opacity: 0.7; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}22;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
  font-size: 15px;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active }) => $active ? '#fff' : 'inherit'};
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.primary};
  }
`;

const TotalBadge = styled.div`
  margin-left: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  white-space: nowrap;
  span { color: ${({ theme }) => theme.colors.primary}; font-weight: 700; }
`;

// ── Table ─────────────────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 11.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background 0.15s;
  cursor: pointer;
  animation: ${fadeUp} 0.3s ease both;
  animation-delay: ${({ $idx }) => `${$idx * 0.04}s`};

  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.background}; }
`;

const Td = styled.td`
  padding: 13px 16px;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.text};
  vertical-align: middle;
`;

// Skeleton
const SkeletonCell = styled.div`
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  width: ${({ $w }) => $w || '80%'};
`;

const SkeletonRow = ({ idx }) => (
  <Tr $idx={idx}>
    <Td><SkeletonCell $w="50px" /></Td>
    <Td><SkeletonCell $w="70px" /></Td>
    <Td><SkeletonCell $w="70px" /></Td>
    <Td><SkeletonCell $w="90px" /></Td>
    <Td><SkeletonCell $w="80px" /></Td>
    <Td><SkeletonCell $w="100px" /></Td>
  </Tr>
);

// Pagination
const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const PageInfo = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const PaginationBtns = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PageBtn = styled.button`
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active }) => $active ? '#fff' : 'inherit'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
  font-family: inherit;

  &:hover:not(:disabled) { border-color: ${({ theme }) => theme.colors.primary}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const CurrentPage = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 0 10px;
  height: 32px;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

// ── Action Buttons ────────────────────────────────────────────────────────────
const Actions = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const ActionBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1.5px solid ${({ $variant }) =>
    $variant === 'view'    ? '#e0e7ff' :
    $variant === 'verify'  ? '#d1fae5' :
    $variant === 'dispense'? '#fef3c7' : '#fee2e2'};
  background: ${({ $variant }) =>
    $variant === 'view'    ? '#eef2ff' :
    $variant === 'verify'  ? '#ecfdf5' :
    $variant === 'dispense'? '#fffbeb' : '#fef2f2'};
  color: ${({ $variant }) =>
    $variant === 'view'    ? '#6366f1' :
    $variant === 'verify'  ? '#059669' :
    $variant === 'dispense'? '#d97706' : '#ef4444'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover { transform: scale(1.1); }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   { color: 'orange', icon: '⏳', label: 'Pending' },
  VERIFIED:  { color: 'blue',   icon: '✅', label: 'Verified' },
  DISPENSED: { color: 'green',  icon: '💊', label: 'Dispensed' },
  CANCELLED: { color: 'red',    icon: '❌', label: 'Cancelled' },
};

const StatusTag = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: 'default', icon: '?', label: status };
  return <Tag color={cfg.color}>{cfg.icon} {cfg.label}</Tag>;
};

const STATUSES = ['ALL', 'PENDING', 'VERIFIED', 'DISPENSED', 'CANCELLED'];

// ── Detail Modal ──────────────────────────────────────────────────────────────
const DetailSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const InfoField = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 10px 14px;
  &.full { grid-column: 1 / -1; }
`;

const InfoLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 3px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const ITh = styled.th`
  padding: 9px 12px;
  background: ${({ theme }) => theme.colors.background};
  text-align: left;
  font-size: 11.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ITd = styled.td`
  padding: 9px 12px;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
`;

const ItemsCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  overflow: hidden;
`;

// ── Create Modal Form ─────────────────────────────────────────────────────────
const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $cols }) => $cols || '1fr 1fr'};
  gap: 12px;

  @media (max-width: 520px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FormLabel = styled.label`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  span.req { color: #ef4444; margin-left: 2px; }
`;

const FormInput = styled.input`
  height: 38px;
  border: 1.5px solid ${({ $error, theme }) => $error ? '#ef4444' : theme.colors.border};
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13.5px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: ${({ $error, theme }) => $error ? '#ef4444' : theme.colors.primary}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const FormTextarea = styled.textarea`
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13.5px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  outline: none;
  resize: vertical;
  min-height: 72px;
  transition: border-color 0.2s;

  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const FieldError = styled.span`
  font-size: 11.5px;
  color: #ef4444;
`;

const ModalFooterBtns = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 6px;
`;

const CancelBtn = styled.button`
  padding: 9px 18px;
  border-radius: 8px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const SubmitBtn = styled.button`
  padding: 9px 22px;
  border-radius: 8px;
  border: none;
  background: ${({ disabled }) => disabled ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#7c3aed)'};
  color: #fff;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover:not(:disabled) { opacity: 0.9; }
`;

// Add-item step banner
const StepBanner = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const PillBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 20px;
  padding: 2px 10px;
  flex-shrink: 0;
`;

// ── Modal antd customization helper ──────────────────────────────────────────
const modalStyles = (theme) => ({
  content: { background: theme.colors.surface, color: theme.colors.text },
  header: { background: theme.colors.surface, borderBottom: `1px solid ${theme.colors.border}` },
  footer: { background: theme.colors.surface },
});

// ── Validate helpers ──────────────────────────────────────────────────────────
const validateCreate = (d) => {
  const e = {};
  if (!d.patient_id || isNaN(Number(d.patient_id))) e.patient_id = 'Required';
  if (!d.doctor_id  || isNaN(Number(d.doctor_id)))  e.doctor_id  = 'Required';
  if (!d.appointment_id || isNaN(Number(d.appointment_id))) e.appointment_id = 'Required';
  if (!d.notes?.trim()) e.notes = 'Required';
  return e;
};

const validateItem = (d) => {
  const e = {};
  if (!d.medicine_id)                    e.medicine_id  = 'Required';
  if (!d.dosage?.trim())                 e.dosage       = 'Required';
  if (!d.frequency?.trim())              e.frequency    = 'Required';
  if (!d.duration_days || Number(d.duration_days) < 1) e.duration_days = 'Must be ≥ 1';
  if (!d.quantity      || Number(d.quantity)      < 1) e.quantity      = 'Must be ≥ 1';
  return e;
};

const EMPTY_CREATE = { patient_id: '', doctor_id: '', appointment_id: '', notes: '' };
const EMPTY_ITEM   = { medicine_id: '', dosage: '', frequency: '', duration_days: '', quantity: '', instructions: '' };

const FREQUENCY_OPTIONS = [
  'Once daily', 'Twice daily', 'Three times daily',
  'Four times daily', 'Every 6 hours', 'Every 8 hours',
  'Every 12 hours', 'As needed', 'Before meals', 'After meals'
];

// ── Main Component ────────────────────────────────────────────────────────────
const Prescriptions = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  const canCreate  = ['admin', 'provider'].includes(role);
  const canVerify  = role === 'pharmacist';
  const canDispense = role === 'pharmacist';

  const {
    prescriptions, currentPrescription, loading, detailLoading, submitting,
    error, searchQuery, statusFilter, page, totalPages, total, hasNext, hasPrev,
    fetchPrescriptions, openPrescription, closePrescription,
    createPrescription, addItem, verify, dispense,
    searchPrescriptions, filterByStatus,
    goNext, goPrev, dismissError,
  } = usePrescriptions();

  // ── modal states ──────────────────────────────────────────────────────────
  // 'create' → step 1: create prescription header
  // 'addItem' → step 2: add medicines to a prescription (after creation or from detail)
  // 'detail' → view detail + items
  const [modal, setModal] = useState(null); // null | 'create' | 'addItem' | 'detail'
  const [newPrescriptionId, setNewPrescriptionId] = useState(null); // after step 1

  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [createErrors, setCreateErrors] = useState({});

  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [itemErrors, setItemErrors] = useState({});

  const debounceRef = useRef(null);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

  useEffect(() => {
    if (error) {
      toast.error(error, { id: 'rx-error' });
      dismissError();
    }
  }, [error, dismissError]);

  // search debounce
  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPrescriptions(val), 250);
  }, [searchPrescriptions]);

  // ── open / close modals ────────────────────────────────────────────────
  const openCreate = () => {
    setCreateForm(EMPTY_CREATE);
    setCreateErrors({});
    setModal('create');
  };

  const openDetail = (rx) => {
    openPrescription(rx.id);
    setModal('detail');
  };

  const openAddItem = (prescriptionId) => {
    setNewPrescriptionId(prescriptionId);
    setItemForm(EMPTY_ITEM);
    setItemErrors({});
    setModal('addItem');
  };

  const closeModal = () => {
    setModal(null);
    setNewPrescriptionId(null);
    closePrescription();
  };

  // ── Create step 1 submit ───────────────────────────────────────────────
  const handleCreateSubmit = () => {
    const errors = validateCreate(createForm);
    if (Object.keys(errors).length) { setCreateErrors(errors); return; }

    const data = {
      patient_id:     Number(createForm.patient_id),
      doctor_id:      Number(createForm.doctor_id),
      appointment_id: Number(createForm.appointment_id),
      notes:          createForm.notes.trim(),
    };

    createPrescription(data, (responseData) => {
      const rxId = responseData?.prescription_id;
      toast.success('Prescription created! Now add medicines. 💊');
      setNewPrescriptionId(rxId);
      setItemForm(EMPTY_ITEM);
      setItemErrors({});
      setModal('addItem');
      fetchPrescriptions(); // refresh list
    });
  };

  // ── Add item submit ────────────────────────────────────────────────────
  const handleItemSubmit = () => {
    const errors = validateItem(itemForm);
    if (Object.keys(errors).length) { setItemErrors(errors); return; }

    const data = {
      prescription_id: Number(newPrescriptionId),
      medicine_id:     Number(itemForm.medicine_id),
      dosage:          itemForm.dosage.trim(),
      frequency:       itemForm.frequency,
      duration_days:   Number(itemForm.duration_days),
      quantity:        Number(itemForm.quantity),
      instructions:    itemForm.instructions?.trim() || '',
    };

    addItem(data, newPrescriptionId, () => {
      toast.success('Medicine added! ✅');
      setItemForm(EMPTY_ITEM);
      setItemErrors({});
    });
  };

  // ── Verify ────────────────────────────────────────────────────────────
  const handleVerify = (id, e) => {
    e?.stopPropagation();
    verify(id, () => { toast.success('Prescription verified ✅'); });
  };

  // ── Dispense ──────────────────────────────────────────────────────────
  const handleDispense = (id, e) => {
    e?.stopPropagation();
    dispense(id, () => { toast.success('Prescription dispensed 💊 Stock updated!'); });
  };

  const pStart = (page - 1) * 8 + 1;
  const pEnd = Math.min(page * 8, total);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Page>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <PageHeader>
        <HeaderLeft>
          <PageIcon>💊</PageIcon>
          <div>
            <PageTitle>Prescriptions</PageTitle>
            <PageSubtitle>Manage patient prescriptions &amp; dispensing</PageSubtitle>
          </div>
        </HeaderLeft>
        {canCreate && (
          <PrimaryBtn onClick={openCreate} disabled={submitting}>
            <span>＋</span> New Prescription
          </PrimaryBtn>
        )}
      </PageHeader>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <Toolbar>
        <SearchWrap>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            placeholder="Search by ID, patient, doctor…"
            defaultValue={searchQuery}
            onChange={handleSearch}
          />
        </SearchWrap>

        <FilterGroup>
          {STATUSES.map((s) => (
            <FilterBtn
              key={s}
              $active={statusFilter === s}
              onClick={() => filterByStatus(s)}
            >
              {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.icon + ' ' + STATUS_CONFIG[s]?.label || s}
            </FilterBtn>
          ))}
        </FilterGroup>

        <TotalBadge>
          Total: <span>{total}</span>
        </TotalBadge>
      </Toolbar>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <TableCard>
        <Table>
          <Thead>
            <tr>
              <Th>#ID</Th>
              <Th>Patient ID</Th>
              <Th>Doctor ID</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </Thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} idx={i} />)
            ) : prescriptions.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={searchQuery || statusFilter !== 'ALL'
                      ? 'No prescriptions match your filter'
                      : 'No prescriptions yet'}
                    style={{ padding: '40px 0' }}
                  />
                </td>
              </tr>
            ) : (
              prescriptions.map((rx, idx) => (
                <Tr key={rx.id} $idx={idx} onClick={() => openDetail(rx)}>
                  <Td>
                    <span style={{ fontWeight: 700, color: theme.colors.primary }}>
                      #{rx.id}
                    </span>
                  </Td>
                  <Td>
                    <span style={{
                      background: theme.colors.background,
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 13
                    }}>
                      P-{rx.patient_id}
                    </span>
                  </Td>
                  <Td>
                    <span style={{
                      background: theme.colors.background,
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 13
                    }}>
                      D-{rx.doctor_id}
                    </span>
                  </Td>
                  <Td style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                    {rx.prescription_date
                      ? new Date(rx.prescription_date).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })
                      : '—'}
                  </Td>
                  <Td>
                    <StatusTag status={rx.status} />
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Actions>
                      <Tooltip title="View details">
                        <ActionBtn $variant="view" onClick={() => openDetail(rx)}>👁</ActionBtn>
                      </Tooltip>

                      {/* Add items button — provider/admin only, for PENDING */}
                      {canCreate && rx.status === 'PENDING' && (
                        <Tooltip title="Add medicines">
                          <ActionBtn
                            $variant="verify"
                            onClick={(e) => { e.stopPropagation(); openAddItem(rx.id); }}
                          >💊</ActionBtn>
                        </Tooltip>
                      )}

                      {/* Verify — pharmacist, PENDING only */}
                      {canVerify && rx.status === 'PENDING' && (
                        <Popconfirm
                          title="Verify this prescription?"
                          onConfirm={(e) => handleVerify(rx.id, e)}
                          okText="Verify"
                          cancelText="Cancel"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip title="Verify prescription">
                            <ActionBtn $variant="verify" disabled={submitting}>✅</ActionBtn>
                          </Tooltip>
                        </Popconfirm>
                      )}

                      {/* Dispense — pharmacist, VERIFIED only */}
                      {canDispense && rx.status === 'VERIFIED' && (
                        <Popconfirm
                          title="Dispense this prescription? Stock will be reduced."
                          onConfirm={(e) => handleDispense(rx.id, e)}
                          okText="Dispense"
                          cancelText="Cancel"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip title="Dispense medicines">
                            <ActionBtn $variant="dispense" disabled={submitting}>📦</ActionBtn>
                          </Tooltip>
                        </Popconfirm>
                      )}
                    </Actions>
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>

        {!loading && prescriptions.length > 0 && (
          <PaginationBar>
            <PageInfo>Showing {pStart}–{pEnd} of {total}</PageInfo>
            <PaginationBtns>
              <PageBtn onClick={goPrev} disabled={!hasPrev}>← Prev</PageBtn>
              <CurrentPage>{page} / {totalPages}</CurrentPage>
              <PageBtn onClick={goNext} disabled={!hasNext}>Next →</PageBtn>
            </PaginationBtns>
          </PaginationBar>
        )}
      </TableCard>

      {/* ────────────────────────────────────────────────────────────────────
          MODAL 1: Create Prescription (Step 1)
      ──────────────────────────────────────────────────────────────────── */}
      <Modal
        open={modal === 'create'}
        onCancel={closeModal}
        title={<span style={{ fontWeight: 700 }}>📋 New Prescription — Step 1 of 2</span>}
        footer={null}
        width={520}
        destroyOnClose
        styles={modalStyles(theme)}
      >
        <div style={{ marginBottom: 16 }}>
          <Steps
            size="small"
            current={0}
            items={[
              { title: 'Prescription Info', description: 'Patient & doctor' },
              { title: 'Add Medicines', description: 'Dosage & quantity' },
            ]}
          />
        </div>

        <ModalForm>
          <FormRow>
            <FormGroup>
              <FormLabel>Patient ID <span className="req">*</span></FormLabel>
              <FormInput
                type="number"
                placeholder="e.g. 12"
                value={createForm.patient_id}
                $error={!!createErrors.patient_id}
                onChange={(e) => {
                  setCreateForm(p => ({ ...p, patient_id: e.target.value }));
                  if (createErrors.patient_id) setCreateErrors(p => ({ ...p, patient_id: '' }));
                }}
              />
              {createErrors.patient_id && <FieldError>{createErrors.patient_id}</FieldError>}
            </FormGroup>

            <FormGroup>
              <FormLabel>Doctor ID <span className="req">*</span></FormLabel>
              <FormInput
                type="number"
                placeholder="e.g. 3"
                value={createForm.doctor_id}
                $error={!!createErrors.doctor_id}
                onChange={(e) => {
                  setCreateForm(p => ({ ...p, doctor_id: e.target.value }));
                  if (createErrors.doctor_id) setCreateErrors(p => ({ ...p, doctor_id: '' }));
                }}
              />
              {createErrors.doctor_id && <FieldError>{createErrors.doctor_id}</FieldError>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <FormLabel>Appointment ID <span className="req">*</span></FormLabel>
            <FormInput
              type="number"
              placeholder="e.g. 7"
              value={createForm.appointment_id}
              $error={!!createErrors.appointment_id}
              onChange={(e) => {
                setCreateForm(p => ({ ...p, appointment_id: e.target.value }));
                if (createErrors.appointment_id) setCreateErrors(p => ({ ...p, appointment_id: '' }));
              }}
            />
            {createErrors.appointment_id && <FieldError>{createErrors.appointment_id}</FieldError>}
          </FormGroup>

          <FormGroup>
            <FormLabel>Doctor Notes / Diagnosis <span className="req">*</span></FormLabel>
            <FormTextarea
              placeholder="e.g. Patient has viral fever. Prescribing paracetamol and rest."
              rows={3}
              value={createForm.notes}
              onChange={(e) => {
                setCreateForm(p => ({ ...p, notes: e.target.value }));
                if (createErrors.notes) setCreateErrors(p => ({ ...p, notes: '' }));
              }}
            />
            {createErrors.notes && <FieldError>{createErrors.notes}</FieldError>}
          </FormGroup>

          <ModalFooterBtns>
            <CancelBtn onClick={closeModal}>Cancel</CancelBtn>
            <SubmitBtn onClick={handleCreateSubmit} disabled={submitting}>
              {submitting ? '⏳ Creating…' : 'Next: Add Medicines →'}
            </SubmitBtn>
          </ModalFooterBtns>
        </ModalForm>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────
          MODAL 2: Add Medicine Items (Step 2)
      ──────────────────────────────────────────────────────────────────── */}
      <Modal
        open={modal === 'addItem'}
        onCancel={closeModal}
        title={<span style={{ fontWeight: 700 }}>💊 Add Medicine — Step 2 of 2</span>}
        footer={null}
        width={560}
        destroyOnClose
        styles={modalStyles(theme)}
      >
        <StepBanner>
          <span>📋</span>
          <span>Prescription <PillBadge>#{newPrescriptionId}</PillBadge> created. Add medicines below. You can add multiple.</span>
        </StepBanner>

        <div style={{ marginBottom: 16 }}>
          <Steps
            size="small"
            current={1}
            items={[
              { title: 'Prescription Info' },
              { title: 'Add Medicines' },
            ]}
          />
        </div>

        <ModalForm>
          <FormGroup>
            <FormLabel>Medicine ID <span className="req">*</span></FormLabel>
            <FormInput
              type="number"
              placeholder="e.g. 5"
              value={itemForm.medicine_id}
              $error={!!itemErrors.medicine_id}
              onChange={(e) => {
                setItemForm(p => ({ ...p, medicine_id: e.target.value }));
                if (itemErrors.medicine_id) setItemErrors(p => ({ ...p, medicine_id: '' }));
              }}
            />
            {itemErrors.medicine_id && <FieldError>{itemErrors.medicine_id}</FieldError>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <FormLabel>Dosage <span className="req">*</span></FormLabel>
              <FormInput
                placeholder="e.g. 500mg"
                value={itemForm.dosage}
                $error={!!itemErrors.dosage}
                onChange={(e) => {
                  setItemForm(p => ({ ...p, dosage: e.target.value }));
                  if (itemErrors.dosage) setItemErrors(p => ({ ...p, dosage: '' }));
                }}
              />
              {itemErrors.dosage && <FieldError>{itemErrors.dosage}</FieldError>}
            </FormGroup>

            <FormGroup>
              <FormLabel>Frequency <span className="req">*</span></FormLabel>
              <Select
                placeholder="Select frequency"
                value={itemForm.frequency || undefined}
                onChange={(val) => {
                  setItemForm(p => ({ ...p, frequency: val }));
                  if (itemErrors.frequency) setItemErrors(p => ({ ...p, frequency: '' }));
                }}
                style={{ height: 38 }}
                status={itemErrors.frequency ? 'error' : undefined}
              >
                {FREQUENCY_OPTIONS.map((f) => (
                  <Option key={f} value={f}>{f}</Option>
                ))}
              </Select>
              {itemErrors.frequency && <FieldError>{itemErrors.frequency}</FieldError>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <FormLabel>Duration (days) <span className="req">*</span></FormLabel>
              <FormInput
                type="number"
                min="1"
                placeholder="e.g. 5"
                value={itemForm.duration_days}
                $error={!!itemErrors.duration_days}
                onChange={(e) => {
                  setItemForm(p => ({ ...p, duration_days: e.target.value }));
                  if (itemErrors.duration_days) setItemErrors(p => ({ ...p, duration_days: '' }));
                }}
              />
              {itemErrors.duration_days && <FieldError>{itemErrors.duration_days}</FieldError>}
            </FormGroup>

            <FormGroup>
              <FormLabel>Quantity <span className="req">*</span></FormLabel>
              <FormInput
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={itemForm.quantity}
                $error={!!itemErrors.quantity}
                onChange={(e) => {
                  setItemForm(p => ({ ...p, quantity: e.target.value }));
                  if (itemErrors.quantity) setItemErrors(p => ({ ...p, quantity: '' }));
                }}
              />
              {itemErrors.quantity && <FieldError>{itemErrors.quantity}</FieldError>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <FormLabel>Instructions <span style={{ fontSize: 11, color: theme.colors.textSecondary }}>(optional)</span></FormLabel>
            <FormTextarea
              placeholder="e.g. Take after meals with warm water"
              rows={2}
              value={itemForm.instructions}
              onChange={(e) => setItemForm(p => ({ ...p, instructions: e.target.value }))}
            />
          </FormGroup>

          <ModalFooterBtns>
            <CancelBtn onClick={closeModal}>Done (Close)</CancelBtn>
            <SubmitBtn onClick={handleItemSubmit} disabled={submitting}>
              {submitting ? '⏳ Adding…' : '＋ Add Medicine'}
            </SubmitBtn>
          </ModalFooterBtns>
        </ModalForm>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────
          MODAL 3: Prescription Detail View
      ──────────────────────────────────────────────────────────────────── */}
      <Modal
        open={modal === 'detail'}
        onCancel={closeModal}
        title={
          <span style={{ fontWeight: 700 }}>
            📋 Prescription Details
            {currentPrescription && (
              <span style={{ marginLeft: 10 }}>
                <StatusTag status={currentPrescription.status} />
              </span>
            )}
          </span>
        }
        footer={
          currentPrescription ? (
            <ModalFooterBtns>
              {/* Add more medicines — provider/admin, PENDING only */}
              {canCreate && currentPrescription.status === 'PENDING' && (
                <PrimaryBtn
                  style={{ fontSize: 13, padding: '8px 16px' }}
                  onClick={() => {
                    setModal(null);
                    openAddItem(currentPrescription.id);
                  }}
                >
                  💊 Add Medicine
                </PrimaryBtn>
              )}

              {/* Verify — pharmacist, PENDING only */}
              {canVerify && currentPrescription.status === 'PENDING' && (
                <Popconfirm
                  title="Verify this prescription?"
                  onConfirm={() => handleVerify(currentPrescription.id)}
                  okText="Verify"
                  cancelText="Cancel"
                >
                  <SubmitBtn style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                    ✅ Verify
                  </SubmitBtn>
                </Popconfirm>
              )}

              {/* Dispense — pharmacist, VERIFIED only */}
              {canDispense && currentPrescription.status === 'VERIFIED' && (
                <Popconfirm
                  title="Dispense? This will reduce medicine stock."
                  onConfirm={() => handleDispense(currentPrescription.id)}
                  okText="Dispense"
                  cancelText="Cancel"
                >
                  <SubmitBtn style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
                    📦 Dispense
                  </SubmitBtn>
                </Popconfirm>
              )}

              <CancelBtn onClick={closeModal}>Close</CancelBtn>
            </ModalFooterBtns>
          ) : null
        }
        width={640}
        destroyOnClose
        styles={modalStyles(theme)}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 12, color: theme.colors.textSecondary }}>Loading prescription…</p>
          </div>
        ) : currentPrescription ? (
          <>
            <DetailSection>
              <SectionTitle>📌 Prescription Info</SectionTitle>
              <InfoGrid>
                <InfoField>
                  <InfoLabel>Prescription ID</InfoLabel>
                  <InfoValue style={{ color: theme.colors.primary, fontWeight: 700 }}>
                    #{currentPrescription.id}
                  </InfoValue>
                </InfoField>
                <InfoField>
                  <InfoLabel>Status</InfoLabel>
                  <InfoValue><StatusTag status={currentPrescription.status} /></InfoValue>
                </InfoField>
                <InfoField>
                  <InfoLabel>Patient ID</InfoLabel>
                  <InfoValue>P-{currentPrescription.patient_id}</InfoValue>
                </InfoField>
                <InfoField>
                  <InfoLabel>Doctor ID</InfoLabel>
                  <InfoValue>D-{currentPrescription.doctor_id}</InfoValue>
                </InfoField>
                <InfoField>
                  <InfoLabel>Appointment ID</InfoLabel>
                  <InfoValue>A-{currentPrescription.appointment_id}</InfoValue>
                </InfoField>
                <InfoField>
                  <InfoLabel>Date</InfoLabel>
                  <InfoValue>
                    {currentPrescription.prescription_date
                      ? new Date(currentPrescription.prescription_date).toLocaleString('en-IN')
                      : '—'}
                  </InfoValue>
                </InfoField>
                {currentPrescription.dispensed_by && (
                  <InfoField>
                    <InfoLabel>Dispensed By</InfoLabel>
                    <InfoValue>Staff #{currentPrescription.dispensed_by}</InfoValue>
                  </InfoField>
                )}
                {currentPrescription.dispensed_at && (
                  <InfoField>
                    <InfoLabel>Dispensed At</InfoLabel>
                    <InfoValue>
                      {new Date(currentPrescription.dispensed_at).toLocaleString('en-IN')}
                    </InfoValue>
                  </InfoField>
                )}
                <InfoField className="full">
                  <InfoLabel>Doctor Notes</InfoLabel>
                  <InfoValue style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {currentPrescription.notes || '—'}
                  </InfoValue>
                </InfoField>
              </InfoGrid>
            </DetailSection>

            <Divider style={{ margin: '8px 0 16px' }} />

            <DetailSection>
              <SectionTitle>
                💊 Medicines
                {currentPrescription.items?.length > 0 && (
                  <PillBadge>{currentPrescription.items.length}</PillBadge>
                )}
              </SectionTitle>

              {!currentPrescription.items?.length ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No medicines added yet"
                  style={{ padding: '20px 0' }}
                />
              ) : (
                <ItemsCard>
                  <ItemsTable>
                    <thead>
                      <tr>
                        <ITh>Medicine</ITh>
                        <ITh>Dosage</ITh>
                        <ITh>Frequency</ITh>
                        <ITh>Days</ITh>
                        <ITh>Qty</ITh>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPrescription.items.map((item) => (
                        <tr key={item.id}>
                          <ITd>
                            <div style={{ fontWeight: 600 }}>{item.medicine || `Med #${item.medicine_id}`}</div>
                            {item.instructions && (
                              <div style={{ fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 2 }}>
                                📝 {item.instructions}
                              </div>
                            )}
                          </ITd>
                          <ITd>
                            <Tag color="blue">{item.dosage}</Tag>
                          </ITd>
                          <ITd style={{ fontSize: 12.5 }}>{item.frequency}</ITd>
                          <ITd>
                            <Tag color="geekblue">{item.duration_days}d</Tag>
                          </ITd>
                          <ITd>
                            <span style={{ fontWeight: 700, color: theme.colors.primary }}>
                              {item.quantity}
                            </span>
                          </ITd>
                        </tr>
                      ))}
                    </tbody>
                  </ItemsTable>
                </ItemsCard>
              )}
            </DetailSection>
          </>
        ) : null}
      </Modal>
    </Page>
  );
};

export default Prescriptions;