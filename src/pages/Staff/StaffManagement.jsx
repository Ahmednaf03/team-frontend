import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Modal, Tooltip, Popconfirm, Tag } from 'antd';
import { toast } from 'react-hot-toast';
import useStaff from '../../modules/staff/hooks/useStaff';
import useAuth from '../../modules/auth/hooks/useAuth';

// ─── Animations ──────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

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
  background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
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
  background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
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
  box-shadow: 0 2px 8px rgba(14,165,233,0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(14,165,233,0.35);
  }
  &:active { transform: translateY(0); }

  ${({ disabled }) => disabled && css`
    opacity: 0.6; cursor: not-allowed;
    &:hover { transform: none; box-shadow: 0 2px 8px rgba(14,165,233,0.25); }
  `}
`;

// ─── Toolbar ─────────────────────────────────────────────────────────────────

const Toolbar = styled.div`
  padding: 16px 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const SearchWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 220px;
  max-width: 360px;
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
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
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

const FilterSelect = styled.select`
  height: 40px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 0 32px 0 12px;
  font-size: 13px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.2s;

  &:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.12); }
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

  span { color: #0ea5e9; font-weight: 700; }
`;

// ─── Table Card ───────────────────────────────────────────────────────────────

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

// ─── Staff Avatar ─────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  admin:       { bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)', tag: 'gold' },
  provider:    { bg: 'linear-gradient(135deg,#3b82f6,#60a5fa)', tag: 'blue' },
  nurse:       { bg: 'linear-gradient(135deg,#ec4899,#f472b6)', tag: 'pink' },
  pharmacist:  { bg: 'linear-gradient(135deg,#10b981,#34d399)', tag: 'green' },
  receptionist:{ bg: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', tag: 'purple' },
};

const getRoleStyle = (role) => ROLE_COLORS[role?.toLowerCase()] || { bg: 'linear-gradient(135deg,#94a3b8,#cbd5e1)', tag: 'default' };

const AvatarCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $role }) => getRoleStyle($role).bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
`;

const StaffName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`;

const StaffId = styled.div`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatusDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? '#10b981' : '#94a3b8')};

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $active }) => ($active ? '#10b981' : '#94a3b8')};
    display: inline-block;
  }
`;

// ─── Action Buttons ───────────────────────────────────────────────────────────

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
    $variant === 'view'   ? '#e0e7ff' :
    $variant === 'edit'   ? '#fef3c7' :
    $variant === 'toggle' ? '#d1fae5' :
    '#fee2e2'};
  background: ${({ $variant }) =>
    $variant === 'view'   ? '#eef2ff' :
    $variant === 'edit'   ? '#fffbeb' :
    $variant === 'toggle' ? '#f0fdf4' :
    '#fef2f2'};
  color: ${({ $variant }) =>
    $variant === 'view'   ? '#6366f1' :
    $variant === 'edit'   ? '#d97706' :
    $variant === 'toggle' ? '#10b981' :
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
      $variant === 'view'   ? '#6366f1' :
      $variant === 'edit'   ? '#d97706' :
      $variant === 'toggle' ? '#10b981' :
      '#ef4444'};
  }
`;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCell = styled.div`
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  width: ${({ $w }) => $w || '80%'};
`;

const SkeletonRow = ({ idx }) => (
  <Tr $idx={idx} style={{ cursor: 'default' }}>
    <Td><SkeletonCell $w="160px" /></Td>
    <Td><SkeletonCell $w="140px" /></Td>
    <Td><SkeletonCell $w="80px" /></Td>
    <Td><SkeletonCell $w="70px" /></Td>
    <Td><SkeletonCell $w="90px" /></Td>
  </Tr>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`font-size: 48px; margin-bottom: 12px;`;
const EmptyTitle = styled.p`font-size: 16px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary}; margin: 0 0 6px;`;
const EmptyDesc = styled.p`font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary}; margin: 0;`;

// ─── Pagination ───────────────────────────────────────────────────────────────

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

const PaginationBtns = styled.div`display: flex; gap: 8px; align-items: center;`;

const PageBtn = styled.button`
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1.5px solid ${({ $active }) => ($active ? '#0ea5e9' : 'var(--border-color, #e2e8f0)')};
  background: ${({ $active }) => ($active ? '#0ea5e9' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : '#64748b')};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) { border-color: #0ea5e9; color: ${({ $active }) => ($active ? '#fff' : '#0ea5e9')}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
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
`;

// ─── Modal Form ───────────────────────────────────────────────────────────────

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
  span.req { color: #ef4444; }
`;

const FormInput = styled.input`
  height: 38px;
  border: 1.5px solid ${({ $error }) => ($error ? '#ef4444' : 'var(--border-color, #e2e8f0)')};
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
    border-color: ${({ $error }) => ($error ? '#ef4444' : '#0ea5e9')};
    box-shadow: 0 0 0 3px ${({ $error }) => ($error ? 'rgba(239,68,68,0.12)' : 'rgba(14,165,233,0.12)')};
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

  &:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.12); }
`;

const FieldError = styled.span`font-size: 11.5px; color: #ef4444;`;

const PasswordNote = styled.p`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: -6px 0 0;
  font-style: italic;
`;

// ─── View Modal ───────────────────────────────────────────────────────────────

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
  background: ${({ $role }) => getRoleStyle($role).bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  margin: 0 auto 12px;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const ROLES = ['provider', 'nurse', 'pharmacist', 'admin', 'receptionist'];

const ROLE_LABELS = {
  admin:        'Admin',
  provider:     'Doctor / Provider',
  nurse:        'Nurse',
  pharmacist:   'Pharmacist',
  receptionist: 'Receptionist',
};

const EMPTY_FORM = {
  name: '', email: '', password: '', role: '', status: 'active',
};

const validateCreate = (data) => {
  const errors = {};
  if (!data.name?.trim())     errors.name     = 'Name is required';
  if (!data.email?.trim())    errors.email    = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Enter a valid email';
  if (!data.password?.trim()) errors.password = 'Password is required';
  else if (data.password.length < 6) errors.password = 'Minimum 6 characters';
  if (!data.role)             errors.role     = 'Role is required';
  return errors;
};

const validateEdit = (data) => {
  const errors = {};
  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!data.role)         errors.role = 'Role is required';
  return errors;
};

// ─── Component ────────────────────────────────────────────────────────────────

const StaffManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    staff, total, loading, submitting, error,
    searchQuery, roleFilter, statusFilter,
    page, pageSize, totalPages, hasNext, hasPrev,
    fetchStaff, createStaff, updateStaff, deleteStaff,
    searchStaff, filterByRole, filterByStatus,
    goNext, goPrev, dismissError,
  } = useStaff();

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view'
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const debounceRef = useRef(null);

  // Fetch on mount
  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  // Error toast
  useEffect(() => {
    if (error) {
      toast.error(error, { id: 'staff-error' });
      dismissError();
    }
  }, [error, dismissError]);

  // ── Search debounce ─────────────────────────────────────────────────────────
  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchStaff(val), 250);
  }, [searchStaff]);

  // ── Open Modals ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setSelectedMember(null);
    setModalMode('create');
  };

  const openEdit = (e, member) => {
    e.stopPropagation();
    setFormData({
      name:     member.name   || '',
      email:    member.email  || '',
      password: '',
      role:     member.role   || '',
      status:   member.status || 'active',
    });
    setFormErrors({});
    setSelectedMember(member);
    setModalMode('edit');
  };

  const openView = (member) => {
    setSelectedMember(member);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedMember(null);
    setFormErrors({});
  };

  // ── Form Change ─────────────────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // ── Toggle Status ───────────────────────────────────────────────────────────
  const handleToggleStatus = (e, member) => {
    e.stopPropagation();
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    updateStaff(member.id, { name: member.name, status: newStatus }, () => {
      toast.success(
        `${member.name} marked as ${newStatus}.`,
        { id: 'staff-toggle' }
      );
    });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = modalMode === 'create'
      ? validateCreate(formData)
      : validateEdit(formData);
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    if (modalMode === 'create') {
      createStaff(formData, () => {
        toast.success('Staff member added successfully! 🎉');
        closeModal();
      });
    } else {
      // On edit, only send non-empty fields. Omit password if blank.
      const payload = { name: formData.name, role: formData.role, status: formData.status };
      updateStaff(selectedMember.id, payload, () => {
        toast.success('Staff member updated successfully! ✅');
        closeModal();
      });
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = (e, id) => {
    e?.stopPropagation();
    deleteStaff(id, () => {
      toast.success('Staff member removed.');
      if (modalMode === 'view') closeModal();
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const startIdx = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endIdx   = Math.min(page * pageSize, total);

  return (
    <Page>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <PageHeader>
        <HeaderLeft>
          <PageIcon>👥</PageIcon>
          <div>
            <PageTitle>Staff Management</PageTitle>
            <PageSubtitle>Manage doctors, nurses, and clinic staff</PageSubtitle>
          </div>
        </HeaderLeft>
        {isAdmin && (
          <AddButton onClick={openCreate} disabled={submitting}>
            <span>＋</span> Add Staff
          </AddButton>
        )}
      </PageHeader>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <Toolbar>
        <SearchWrap>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            placeholder="Search by name, email or role…"
            defaultValue={searchQuery}
            onChange={handleSearch}
          />
        </SearchWrap>

        <FilterSelect
          value={roleFilter}
          onChange={(e) => filterByRole(e.target.value)}
        >
          <option value="all">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={statusFilter}
          onChange={(e) => filterByStatus(e.target.value)}
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>

        <StatBadge>
          Total: <span>{total}</span> staff
        </StatBadge>
      </Toolbar>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <TableCard>
        <Table>
          <Thead>
            <tr>
              <Th>Staff Member</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} idx={i} />)
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState>
                    <EmptyIcon>👤</EmptyIcon>
                    <EmptyTitle>
                      {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                        ? 'No staff match your filters'
                        : 'No staff members yet'}
                    </EmptyTitle>
                    <EmptyDesc>
                      {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters.'
                        : isAdmin
                        ? 'Click "Add Staff" to register the first team member.'
                        : 'No staff have been added yet.'}
                    </EmptyDesc>
                  </EmptyState>
                </td>
              </tr>
            ) : (
              staff.map((member, idx) => (
                <Tr
                  key={member.id}
                  $idx={idx}
                  onClick={() => openView(member)}
                >
                  <Td>
                    <AvatarCell>
                      <Avatar $role={member.role}>
                        {initials(member.name)}
                      </Avatar>
                      <div>
                        <StaffName>{member.name}</StaffName>
                        <StaffId>#{member.id}</StaffId>
                      </div>
                    </AvatarCell>
                  </Td>
                  <Td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {member.email || '—'}
                  </Td>
                  <Td>
                    <Tag color={getRoleStyle(member.role).tag}>
                      {ROLE_LABELS[member.role] || member.role || '—'}
                    </Tag>
                  </Td>
                  <Td>
                    <StatusDot $active={member.status === 'active'}>
                      {member.status === 'active' ? 'Active' : 'Inactive'}
                    </StatusDot>
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Actions>
                      <Tooltip title="View details" placement="top">
                        <ActionBtn $variant="view" onClick={() => openView(member)}>
                          👁
                        </ActionBtn>
                      </Tooltip>
                      {isAdmin && (
                        <>
                          <Tooltip title="Edit member" placement="top">
                            <ActionBtn $variant="edit" onClick={(e) => openEdit(e, member)}>
                              ✏️
                            </ActionBtn>
                          </Tooltip>
                          <Tooltip
                            title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                            placement="top"
                          >
                            <ActionBtn
                              $variant="toggle"
                              onClick={(e) => handleToggleStatus(e, member)}
                              style={
                                member.status !== 'active'
                                  ? { borderColor: '#fed7aa', background: '#fff7ed', color: '#f97316' }
                                  : {}
                              }
                            >
                              {member.status === 'active' ? '🔒' : '🔓'}
                            </ActionBtn>
                          </Tooltip>
                          <Popconfirm
                            title="Remove this staff member?"
                            description="This will soft-delete the record. They will lose access immediately."
                            onConfirm={(e) => handleDelete(e, member.id)}
                            okText="Remove"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                          >
                            <ActionBtn $variant="delete" onClick={(e) => e.stopPropagation()}>
                              🗑️
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

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {!loading && staff.length > 0 && (
          <PaginationBar>
            <PageInfo>
              Showing {startIdx}–{endIdx} of {total} staff
            </PageInfo>
            <PaginationBtns>
              <PageBtn onClick={goPrev} disabled={!hasPrev}>← Prev</PageBtn>
              <CurrentPage>{page} / {totalPages}</CurrentPage>
              <PageBtn onClick={goNext} disabled={!hasNext}>Next →</PageBtn>
            </PaginationBtns>
          </PaginationBar>
        )}
      </TableCard>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <Modal
        open={modalMode === 'create' || modalMode === 'edit'}
        onCancel={closeModal}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            {modalMode === 'create' ? '🆕 Add Staff Member' : '✏️ Edit Staff Member'}
          </div>
        }
        footer={null}
        width={560}
        destroyOnClose
      >
        <ModalForm onSubmit={handleSubmit} noValidate>
          <FormRow>
            <FormGroup>
              <FormLabel>Full Name <span className="req">*</span></FormLabel>
              <FormInput
                $error={!!formErrors.name}
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="e.g. Dr. Sarah Ahmed"
              />
              {formErrors.name && <FieldError>{formErrors.name}</FieldError>}
            </FormGroup>
            <FormGroup>
              <FormLabel>
                Role <span className="req">*</span>
              </FormLabel>
              <FormSelect value={formData.role} onChange={handleChange('role')}>
                <option value="">Select role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </FormSelect>
              {formErrors.role && <FieldError>{formErrors.role}</FieldError>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <FormLabel>
              Email <span className="req">*</span>
            </FormLabel>
            <FormInput
              type="email"
              $error={!!formErrors.email}
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="e.g. doctor@clinic.com"
              disabled={modalMode === 'edit'}
              style={modalMode === 'edit' ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
            {modalMode === 'edit' && (
              <PasswordNote>Email cannot be changed after creation.</PasswordNote>
            )}
            {formErrors.email && <FieldError>{formErrors.email}</FieldError>}
          </FormGroup>

          {modalMode === 'create' && (
            <FormGroup>
              <FormLabel>
                Password <span className="req">*</span>
              </FormLabel>
              <FormInput
                type="password"
                $error={!!formErrors.password}
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />
              {formErrors.password && <FieldError>{formErrors.password}</FieldError>}
            </FormGroup>
          )}

          {modalMode === 'edit' && (
            <FormGroup>
              <FormLabel>Status</FormLabel>
              <FormSelect value={formData.status} onChange={handleChange('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </FormSelect>
            </FormGroup>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                padding: '9px 18px', borderRadius: 8,
                border: '1.5px solid #e2e8f0', background: '#fff',
                color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 22px', borderRadius: 8, border: 'none',
                background: submitting ? '#94a3b8' : 'linear-gradient(135deg,#0ea5e9,#6366f1)',
                color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: 13, minWidth: 110,
                display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
              }}
            >
              {submitting ? (
                <><PulsingSpan>⏳</PulsingSpan> Saving…</>
              ) : (
                modalMode === 'create' ? '＋ Add Staff' : '✅ Save Changes'
              )}
            </button>
          </div>
        </ModalForm>
      </Modal>

      {/* ── View Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={modalMode === 'view'}
        onCancel={closeModal}
        title={
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            👤 Staff Details
          </div>
        }
        footer={
          isAdmin && selectedMember ? (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={(e) => openEdit(e, selectedMember)}
                style={{
                  padding: '8px 18px', borderRadius: 8,
                  border: '1.5px solid #fbbf24', background: '#fffbeb',
                  color: '#d97706', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                }}
              >
                ✏️ Edit
              </button>
              <Popconfirm
                title="Remove this staff member?"
                onConfirm={(e) => handleDelete(e, selectedMember.id)}
                okText="Remove"
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
                  🗑️ Remove
                </button>
              </Popconfirm>
            </div>
          ) : null
        }
        width={500}
        destroyOnClose
      >
        {selectedMember && (
          <div>
            <ViewAvatar $role={selectedMember.role}>
              {initials(selectedMember.name)}
            </ViewAvatar>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {selectedMember.name}
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                Staff ID #{selectedMember.id}
              </div>
            </div>
            <ViewGrid>
              <ViewField>
                <ViewLabel>Role</ViewLabel>
                <ViewValue>
                  <Tag color={getRoleStyle(selectedMember.role).tag}>
                    {ROLE_LABELS[selectedMember.role] || selectedMember.role || '—'}
                  </Tag>
                </ViewValue>
              </ViewField>
              <ViewField>
                <ViewLabel>Status</ViewLabel>
                <ViewValue>
                  <StatusDot $active={selectedMember.status === 'active'}>
                    {selectedMember.status === 'active' ? 'Active' : 'Inactive'}
                  </StatusDot>
                </ViewValue>
              </ViewField>
              <ViewField className="full">
                <ViewLabel>Email</ViewLabel>
                <ViewValue>{selectedMember.email || '—'}</ViewValue>
              </ViewField>
            </ViewGrid>
          </div>
        )}
      </Modal>
    </Page>
  );
};

export default StaffManagement;
