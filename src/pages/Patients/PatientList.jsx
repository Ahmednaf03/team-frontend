import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Modal, Tooltip, Popconfirm, Tag, Badge } from 'antd';
import { toast } from 'react-hot-toast';
import usePatients from '../../modules/patients/hooks/usePatients';
import useAuth from '../../modules/auth/hooks/useAuth';
import {
  Building2,
  Plus,
  Search,
  Stethoscope,
  Eye,
  Pencil,
  Trash2,
  UserRound,
  LoaderCircle,
  Save,
} from 'lucide-react';

// ─── Animations ─────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

// keyframe must be used inside a styled component, not a plain JS template string
const PulsingSpan = styled.span`
  animation: ${pulse} 1s infinite;
`;

// ─── Page Shell ──────────────────────────────────────────────────────────────

const Page = styled.div`
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
`;

const PageHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
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

const AddButton = styled.button`
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(37,99,235,0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
  }
  &:active { transform: translateY(0); }

  ${({ disabled }) => disabled && css`
    opacity: 0.6; cursor: not-allowed;
    &:hover { transform: none; box-shadow: 0 2px 8px rgba(37,99,235,0.25); }
  `}
`;

// ─── Toolbar ────────────────────────────────────────────────────────────────

const Toolbar = styled.div`
  padding: 16px 0 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 240px;
  max-width: 420px;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 40px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 0 14px 0 40px;
  font-size: 14px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &::placeholder { color: ${({ theme }) => theme.colors.textSecondary}; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
  font-size: 15px;
`;

const InlineIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const StatBadge = styled.div`
  margin-left: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  white-space: nowrap;
  
  span {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;
  }
`;

// ─── Table Card ──────────────────────────────────────────────────────────────

const TableCard = styled.div`
  margin: 16px 0 0;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  animation: ${fadeUp} 0.35s ease both;
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
  padding: 13px 16px;
  text-align: left;
  font-size: 11.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
`;

const Tbody = styled.tbody``;

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
  padding: 14px 16px;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.text};
  vertical-align: middle;
`;

// ─── Patient Avatar ──────────────────────────────────────────────────────────

const AvatarCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $gender }) =>
    $gender === 'Female'
      ? 'linear-gradient(135deg, #ec4899, #f472b6)'
      : $gender === 'Male'
      ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
      : 'linear-gradient(135deg, #8b5cf6, #a78bfa)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
`;

const PatientName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`;

const PatientId = styled.div`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ─── Action Buttons ──────────────────────────────────────────────────────────

const Actions = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const ActionBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid ${({ $variant }) =>
    $variant === 'view' ? '#e0e7ff' :
    $variant === 'edit' ? '#fef3c7' :
    '#fee2e2'};
  background: ${({ $variant }) =>
    $variant === 'view' ? '#eef2ff' :
    $variant === 'edit' ? '#fffbeb' :
    '#fef2f2'};
  color: ${({ $variant }) =>
    $variant === 'view' ? '#6366f1' :
    $variant === 'edit' ? '#d97706' :
    '#ef4444'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.15s;

  &:hover {
    transform: scale(1.1);
    border-color: ${({ $variant }) =>
      $variant === 'view' ? '#6366f1' :
      $variant === 'edit' ? '#d97706' :
      '#ef4444'};
  }
`;

// ─── Skeleton ────────────────────────────────────────────────────────────────

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
    <Td><SkeletonCell $w="160px" /></Td>
    <Td><SkeletonCell $w="40px" /></Td>
    <Td><SkeletonCell $w="60px" /></Td>
    <Td><SkeletonCell $w="110px" /></Td>
    <Td><SkeletonCell $w="100px" /></Td>
    <Td><SkeletonCell $w="80px" /></Td>
    <Td><SkeletonCell $w="90px" /></Td>
  </Tr>
);

// ─── Empty State ─────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`;

const EmptyTitle = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 6px;
`;

const EmptyDesc = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

// ─── Pagination ──────────────────────────────────────────────────────────────

const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
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
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1.5px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.textSecondary)};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.primary)};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const CurrentPage = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 0 12px;
  height: 34px;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  gap: 4px;
`;

// ─── Modal Form ──────────────────────────────────────────────────────────────

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 0;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  display: flex;
  align-items: center;
  gap: 4px;

  span.req { color: #ef4444; }
`;

const FormInput = styled.input`
  height: 38px;
  border: 1.5px solid ${({ $error, theme }) => ($error ? '#ef4444' : theme.colors.border)};
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13.5px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &::placeholder { color: ${({ theme }) => theme.colors.textSecondary}; }
  &:focus {
    border-color: ${({ $error, theme }) => ($error ? '#ef4444' : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ $error }) =>
      $error ? 'rgba(239,68,68,0.12)' : 'rgba(37,99,235,0.12)'};
  }
`;

const FormSelect = styled.select`
  height: 38px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13.5px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;

  &:focus { border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
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

  &::placeholder { color: ${({ theme }) => theme.colors.textSecondary}; }
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
`;

const FieldError = styled.span`
  font-size: 11.5px;
  color: #ef4444;
`;

// ─── View Drawer ─────────────────────────────────────────────────────────────

const ViewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
`;

const ViewField = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 10px 14px;
  &.full { grid-column: 1 / -1; }
`;

const ViewLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const ViewValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const ViewAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ $gender }) =>
    $gender === 'Female'
      ? 'linear-gradient(135deg, #ec4899, #f472b6)'
      : $gender === 'Male'
      ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
      : 'linear-gradient(135deg, #8b5cf6, #a78bfa)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  margin: 0 auto 12px;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const genderColor = (gender) =>
  gender === 'Female' ? 'pink' : gender === 'Male' ? 'blue' : 'purple';

const diagnosisColor = (d) => {
  if (!d) return 'default';
  const l = d.toLowerCase();
  if (l.includes('fever') || l.includes('infect')) return 'orange';
  if (l.includes('diabetes') || l.includes('sugar')) return 'gold';
  if (l.includes('hyper') || l.includes('pressure')) return 'red';
  if (l.includes('asthma') || l.includes('breath')) return 'cyan';
  return 'geekblue';
};

const EMPTY_FORM = {
  name: '', age: '', gender: '', phone: '', address: '', diagnosis: '',
};

const validateForm = (data) => {
  const errors = {};
  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!data.age || isNaN(Number(data.age)) || Number(data.age) <= 0)
    errors.age = 'Valid age required';
  if (!data.gender) errors.gender = 'Gender is required';
  if (!data.phone?.trim()) errors.phone = 'Phone is required';
  return errors;
};

// ─── Component ───────────────────────────────────────────────────────────────

const PatientList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    patients, total, loading, submitting, error,
    searchQuery, page, totalPages, hasNext, hasPrev,
    fetchPatients, createPatient, updatePatient, deletePatient,
    searchPatients, goNext, goPrev, dismissError,
  } = usePatients();

  // Modal state
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Error toast
  useEffect(() => {
    if (error) {
      toast.error(error, { id: 'patient-error' });
      dismissError();
    }
  }, [error, dismissError]);

  // ── Search debounce ──────────────────────────────────────────────────────
  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPatients(val), 250);
  }, [searchPatients]);

  // ── Open Modals ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setSelectedPatient(null);
    setModalMode('create');
  };

  const openEdit = (e, patient) => {
    e.stopPropagation();
    setFormData({
      name: patient.name || '',
      age: String(patient.age || ''),
      gender: patient.gender || '',
      phone: patient.phone || '',
      address: patient.address || '',
      diagnosis: patient.diagnosis || '',
    });
    setFormErrors({});
    setSelectedPatient(patient);
    setModalMode('edit');
  };

  const openView = (patient) => {
    setSelectedPatient(patient);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedPatient(null);
    setFormErrors({});
  };

  // ── Form Change ──────────────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    const payload = { ...formData, age: Number(formData.age) };

    if (modalMode === 'create') {
      createPatient(payload, () => {
        toast.success('Patient created successfully! 🎉');
        closeModal();
      });
    } else {
      updatePatient(selectedPatient.id, payload, () => {
        toast.success('Patient updated successfully! ✅');
        closeModal();
      });
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = (e, id) => {
    e.stopPropagation();
    deletePatient(id, () => {
      toast.success('Patient removed successfully.');
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const startIdx = (page - 1) * (total > 0 ? Math.ceil(total / totalPages) : 8) + 1;
  const endIdx = Math.min(page * 8, total);

  return (
    <Page>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <PageHeader>
        <HeaderLeft>
          <PageIcon><Building2 size={20} /></PageIcon>
          <div>
            <PageTitle>Patient Management</PageTitle>
            <PageSubtitle>Manage all registered patients</PageSubtitle>
          </div>
        </HeaderLeft>
        {isAdmin && (
          <AddButton onClick={openCreate} disabled={submitting}>
            <Plus size={16} /> Add Patient
          </AddButton>
        )}
      </PageHeader>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <Toolbar>
        <SearchWrap>
          <SearchIcon><Search size={15} /></SearchIcon>
          <SearchInput
            ref={searchRef}
            placeholder="Search by name, phone, diagnosis, gender…"
            defaultValue={searchQuery}
            onChange={handleSearch}
          />
        </SearchWrap>
        <StatBadge>
          Total: <span>{total}</span> patients
        </StatBadge>
      </Toolbar>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <TableCard>
        <Table>
          <Thead>
            <tr>
              <Th>Patient</Th>
              <Th>Age</Th>
              <Th>Gender</Th>
              <Th>Phone</Th>
              <Th>Address</Th>
              <Th>Diagnosis</Th>
              <Th>Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} idx={i} />)
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState>
                    <EmptyIcon><Stethoscope size={48} /></EmptyIcon>
                    <EmptyTitle>
                      {searchQuery ? 'No patients match your search' : 'No patients yet'}
                    </EmptyTitle>
                    <EmptyDesc>
                      {searchQuery
                        ? 'Try a different name, phone, or diagnosis.'
                        : isAdmin
                        ? 'Click "Add Patient" to register the first patient.'
                        : 'No patients have been registered yet.'}
                    </EmptyDesc>
                  </EmptyState>
                </td>
              </tr>
            ) : (
              patients.map((patient, idx) => (
                <Tr
                  key={patient.id}
                  $idx={idx}
                  onClick={() => openView(patient)}
                >
                  <Td>
                    <AvatarCell>
                      <Avatar $gender={patient.gender}>
                        {initials(patient.name)}
                      </Avatar>
                      <div>
                        <PatientName>{patient.name}</PatientName>
                        <PatientId>#{patient.id}</PatientId>
                      </div>
                    </AvatarCell>
                  </Td>
                  <Td>{patient.age}</Td>
                  <Td>
                    <Tag color={genderColor(patient.gender)}>
                      {patient.gender || '—'}
                    </Tag>
                  </Td>
                  <Td>{patient.phone || '—'}</Td>
                  <Td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {patient.address || '—'}
                  </Td>
                  <Td>
                    <Tag color={diagnosisColor(patient.diagnosis)}>
                      {patient.diagnosis || '—'}
                    </Tag>
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Actions>
                      <Tooltip title="View details" placement="top">
                        <ActionBtn $variant="view" onClick={() => openView(patient)}>
                          <Eye size={15} />
                        </ActionBtn>
                      </Tooltip>
                      {isAdmin && (
                        <>
                          <Tooltip title="Edit patient" placement="top">
                            <ActionBtn $variant="edit" onClick={(e) => openEdit(e, patient)}>
                              <Pencil size={15} />
                            </ActionBtn>
                          </Tooltip>
                          <Popconfirm
                            title="Delete this patient?"
                            description="This will soft-delete the record. This action can't be undone easily."
                            onConfirm={(e) => handleDelete(e, patient.id)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                          >
                            <ActionBtn $variant="delete" onClick={(e) => e.stopPropagation()}>
                              <Trash2 size={15} />
                            </ActionBtn>
                          </Popconfirm>
                        </>
                      )}
                    </Actions>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {!loading && patients.length > 0 && (
          <PaginationBar>
            <PageInfo>
              Showing {startIdx}–{endIdx} of {total} patients
            </PageInfo>
            <PaginationBtns>
              <PageBtn onClick={goPrev} disabled={!hasPrev}>
                ← Prev
              </PageBtn>
              <CurrentPage>
                {page} / {totalPages}
              </CurrentPage>
              <PageBtn onClick={goNext} disabled={!hasNext}>
                Next →
              </PageBtn>
            </PaginationBtns>
          </PaginationBar>
        )}
      </TableCard>

      {/* ── Create / Edit Modal ──────────────────────────────────────── */}
      <Modal
        open={modalMode === 'create' || modalMode === 'edit'}
        onCancel={closeModal}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <InlineIcon>
              {modalMode === 'create' ? <Plus size={16} /> : <Pencil size={16} />}
            </InlineIcon>
            <span>{modalMode === 'create' ? 'Add New Patient' : 'Edit Patient'}</span>
          </div>
        }
        footer={null}
        width={560}
        destroyOnClose
      >
        <ModalForm onSubmit={handleSubmit} noValidate>
          <FormRow>
            <FormGroup>
              <FormLabel>
                Full Name <span className="req">*</span>
              </FormLabel>
              <FormInput
                $error={!!formErrors.name}
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="e.g. John Doe"
              />
              {formErrors.name && <FieldError>{formErrors.name}</FieldError>}
            </FormGroup>
            <FormGroup>
              <FormLabel>
                Age <span className="req">*</span>
              </FormLabel>
              <FormInput
                type="number"
                $error={!!formErrors.age}
                value={formData.age}
                onChange={handleChange('age')}
                placeholder="e.g. 32"
                min={1}
                max={120}
              />
              {formErrors.age && <FieldError>{formErrors.age}</FieldError>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <FormLabel>
                Gender <span className="req">*</span>
              </FormLabel>
              <FormSelect
                value={formData.gender}
                onChange={handleChange('gender')}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </FormSelect>
              {formErrors.gender && <FieldError>{formErrors.gender}</FieldError>}
            </FormGroup>
            <FormGroup>
              <FormLabel>
                Phone <span className="req">*</span>
              </FormLabel>
              <FormInput
                $error={!!formErrors.phone}
                value={formData.phone}
                onChange={handleChange('phone')}
                placeholder="e.g. 9999999999"
              />
              {formErrors.phone && <FieldError>{formErrors.phone}</FieldError>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <FormLabel>Address</FormLabel>
            <FormInput
              value={formData.address}
              onChange={handleChange('address')}
              placeholder="e.g. 12 Main St, Chennai"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Diagnosis / Notes</FormLabel>
            <FormTextarea
              value={formData.diagnosis}
              onChange={handleChange('diagnosis')}
              placeholder="e.g. Type 2 Diabetes, Hypertension…"
              rows={3}
            />
          </FormGroup>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 22px', borderRadius: 8, border: 'none',
                background: submitting ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: 13, minWidth: 110,
                display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
              }}
            >
              {submitting ? (
                <><PulsingSpan><LoaderCircle size={14} /></PulsingSpan> Saving…</>
              ) : (
                <>
                  {modalMode === 'create' ? <Plus size={14} /> : <Save size={14} />}
                  {modalMode === 'create' ? 'Add Patient' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </ModalForm>
      </Modal>

      {/* ── View Modal ───────────────────────────────────────────────── */}
      <Modal
        open={modalMode === 'view'}
        onCancel={closeModal}
        title={
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserRound size={16} />
            <span>Patient Details</span>
          </div>
        }
        footer={
          isAdmin && selectedPatient ? (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={(e) => openEdit(e, selectedPatient)}
                style={{
                  padding: '8px 18px', borderRadius: 8,
                  border: '1.5px solid #fbbf24', background: '#fffbeb',
                  color: '#d97706', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Pencil size={14} />
                  <span>Edit</span>
                </span>
              </button>
              <Popconfirm
                title="Delete this patient?"
                onConfirm={(e) => { handleDelete(e, selectedPatient.id); closeModal(); }}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <button
                  style={{
                    padding: '8px 18px', borderRadius: 8,
                    border: '1.5px solid #fca5a5', background: '#fef2f2',
                    color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </span>
                </button>
              </Popconfirm>
            </div>
          ) : null
        }
        width={500}
        destroyOnClose
      >
        {selectedPatient && (
          <div>
            <ViewAvatar $gender={selectedPatient.gender}>
              {initials(selectedPatient.name)}
            </ViewAvatar>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                {selectedPatient.name}
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                Patient ID #{selectedPatient.id}
              </div>
            </div>
            <ViewGrid>
              <ViewField>
                <ViewLabel>Age</ViewLabel>
                <ViewValue>{selectedPatient.age} years</ViewValue>
              </ViewField>
              <ViewField>
                <ViewLabel>Gender</ViewLabel>
                <ViewValue>
                  <Tag color={genderColor(selectedPatient.gender)}>
                    {selectedPatient.gender || '—'}
                  </Tag>
                </ViewValue>
              </ViewField>
              <ViewField>
                <ViewLabel>Phone</ViewLabel>
                <ViewValue>{selectedPatient.phone || '—'}</ViewValue>
              </ViewField>
              <ViewField>
                <ViewLabel>Diagnosis</ViewLabel>
                <ViewValue>
                  <Tag color={diagnosisColor(selectedPatient.diagnosis)}>
                    {selectedPatient.diagnosis || '—'}
                  </Tag>
                </ViewValue>
              </ViewField>
              <ViewField className="full">
                <ViewLabel>Address</ViewLabel>
                <ViewValue>{selectedPatient.address || '—'}</ViewValue>
              </ViewField>
            </ViewGrid>
          </div>
        )}
      </Modal>
    </Page>
  );
};

export default PatientList;
