import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSelector } from 'react-redux';
import {
  Receipt,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  FilePlus,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BadgeDollarSign,
  FileText,
} from 'lucide-react';
import useBilling from '../../modules/billing/hooks/useBilling';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────

const Page = styled.div`
  padding: 28px 32px;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  animation: ${fadeIn} 0.3s ease;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
`;

const TitleGroup = styled.div``;

const PageTitle = styled.h1`
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PageSubtitle = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ─── Summary Cards ─────────────────────────────────────────────────────────────

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  animation: ${fadeIn} 0.4s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
`;

const SummaryIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SummaryInfo = styled.div``;

const SummaryLabel = styled.p`
  margin: 0 0 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SummaryValue = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const SkeletonCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  height: 84px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surface} 25%,
    ${({ theme }) => theme.colors.border} 50%,
    ${({ theme }) => theme.colors.surface} 75%
  );
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite;
`;

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 220px;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 16px;
  height: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 38px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const FilterBtn = styled.button`
  padding: 9px 16px;
  border-radius: 8px;
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text)};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.primary)};
  }
`;

const GenerateBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ─── Table ────────────────────────────────────────────────────────────────────

const TableWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: ${({ theme }) => theme.colors.background};
`;

const Th = styled.th`
  padding: 13px 18px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background 0.15s;

  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.background}; }
`;

const Td = styled.td`
  padding: 14px 18px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  vertical-align: middle;
`;

const InvoiceId = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $status }) =>
    $status === 'PAID' ? '#d1fae5' : '#fef3c7'};
  color: ${({ $status }) =>
    $status === 'PAID' ? '#065f46' : '#92400e'};
`;

const Amount = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionBtn = styled.button`
  padding: 7px 14px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// ─── Empty & Error States ──────────────────────────────────────────────────────

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.4;
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fee2e2;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;

  button {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: #991b1b;
    display: flex;
    align-items: center;
  }
`;

// ─── Pagination ────────────────────────────────────────────────────────────────

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const PagBtn = styled.button`
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primary}; color: #fff; border-color: ${({ theme }) => theme.colors.primary}; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
`;

const PagInfo = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ─── Generate Invoice Modal ────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 28px;
  width: 100%;
  max-width: 420px;
  animation: ${fadeIn} 0.25s ease;
`;

const ModalTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
`;

const ModalSubtitle = styled.p`
  margin: 0 0 20px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 24px;
  justify-content: flex-end;
`;

const CancelBtn = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.background}; }
`;

const SubmitBtn = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    parseFloat(amount) || 0
  );

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ─── Component ────────────────────────────────────────────────────────────────

const InvoicePage = () => {
  const userRole = useSelector((state) => state.auth.user?.role);
  const canMarkPaid = userRole === 'admin' || userRole === 'Admin';
  const {
    invoices,
    summary,
    loading,
    summaryLoading,
    submitting,
    error,
    statusFilter,
    searchQuery,
    fetchInvoices,
    fetchSummary,
    generateInvoice,
    markAsPaid,
    filterByStatus,
    searchInvoices,
    dismissError,
  } = useBilling();

  const [showModal, setShowModal] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
  }, []);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const totalPages = Math.ceil(invoices.length / PAGE_SIZE) || 1;
  const paginated = invoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleGenerate = () => {
    if (!prescriptionId.trim()) return;
    generateInvoice(prescriptionId.trim(), () => {
      setShowModal(false);
      setPrescriptionId('');
    });
  };

  const handleMarkPaid = (invoiceId) => {
    markAsPaid(invoiceId);
  };

  return (
    <Page>
      {/* Header */}
      <PageHeader>
        <TitleGroup>
          <PageTitle>
            <Receipt size={22} />
            Billing & Invoices
          </PageTitle>
          <PageSubtitle>Manage patient invoices and payment status</PageSubtitle>
        </TitleGroup>
        <GenerateBtn onClick={() => setShowModal(true)} disabled={submitting}>
          <FilePlus size={16} />
          Generate Invoice
        </GenerateBtn>
      </PageHeader>

      {/* Error Banner */}
      {error && (
        <ErrorBanner>
          <AlertCircle size={16} />
          {error}
          <button onClick={dismissError}><X size={16} /></button>
        </ErrorBanner>
      )}

      {/* Summary Cards */}
      <SummaryGrid>
        {summaryLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <SummaryCard $delay="0s">
              <SummaryIcon $bg="#eff6ff">
                <FileText size={22} color="#3b82f6" />
              </SummaryIcon>
              <SummaryInfo>
                <SummaryLabel>Total Invoices</SummaryLabel>
                <SummaryValue>{summary.total_invoices ?? 0}</SummaryValue>
              </SummaryInfo>
            </SummaryCard>
            <SummaryCard $delay="0.08s">
              <SummaryIcon $bg="#f0fdf4">
                <CheckCircle size={22} color="#22c55e" />
              </SummaryIcon>
              <SummaryInfo>
                <SummaryLabel>Total Paid</SummaryLabel>
                <SummaryValue>{formatCurrency(summary.total_paid)}</SummaryValue>
              </SummaryInfo>
            </SummaryCard>
            <SummaryCard $delay="0.16s">
              <SummaryIcon $bg="#fffbeb">
                <Clock size={22} color="#f59e0b" />
              </SummaryIcon>
              <SummaryInfo>
                <SummaryLabel>Total Pending</SummaryLabel>
                <SummaryValue>{formatCurrency(summary.total_pending)}</SummaryValue>
              </SummaryInfo>
            </SummaryCard>
          </>
        )}
      </SummaryGrid>

      {/* Toolbar */}
      <Toolbar>
        <SearchWrapper>
          <SearchIcon />
          <SearchInput
            placeholder="Search by invoice ID or patient name…"
            value={searchQuery}
            onChange={(e) => searchInvoices(e.target.value)}
          />
        </SearchWrapper>
        <FilterGroup>
          {['ALL', 'PENDING', 'PAID'].map((s) => (
            <FilterBtn
              key={s}
              $active={statusFilter === s}
              onClick={() => filterByStatus(s)}
            >
              {s}
            </FilterBtn>
          ))}
        </FilterGroup>
      </Toolbar>

      {/* Table */}
      <TableWrapper>
        <Table>
          <Thead>
            <tr>
              <Th>Invoice #</Th>
              <Th>Patient</Th>
              <Th>Prescription ID</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th>Paid On</Th>
              <Th>Action</Th>
            </tr>
          </Thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <Td key={j}>
                      <div
                        style={{
                          height: 14,
                          borderRadius: 4,
                          background: 'var(--shimmer, #e2e8f0)',
                          width: j === 0 ? 60 : j === 3 ? 90 : 100,
                        }}
                      />
                    </Td>
                  ))}
                </Tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState>
                    <EmptyIcon>
                      <BadgeDollarSign size={48} strokeWidth={1} />
                    </EmptyIcon>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>No invoices found</p>
                    <p style={{ fontSize: 13 }}>
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'Try adjusting your search or filter.'
                        : 'Generate your first invoice from a dispensed prescription.'}
                    </p>
                  </EmptyState>
                </td>
              </tr>
            ) : (
              paginated.map((inv) => (
                <Tr key={inv.id}>
                  <Td><InvoiceId>#{inv.id}</InvoiceId></Td>
                  <Td>{inv.patient_name || `Patient #${inv.patient_id}`}</Td>
                  <Td><InvoiceId>RX-{inv.prescription_id}</InvoiceId></Td>
                  <Td><Amount>{formatCurrency(inv.total_amount)}</Amount></Td>
                  <Td>
                    <StatusBadge $status={inv.status}>
                      {inv.status === 'PAID' ? (
                        <CheckCircle size={11} />
                      ) : (
                        <Clock size={11} />
                      )}
                      {inv.status}
                    </StatusBadge>
                  </Td>
                  <Td>{formatDate(inv.created_at)}</Td>
                  <Td>{formatDate(inv.paid_at)}</Td>
                  <Td>
                    {inv.status === 'PENDING' && canMarkPaid ? (
                      <ActionBtn
                        onClick={() => handleMarkPaid(inv.id)}
                        disabled={submitting}
                      >
                        Mark Paid
                      </ActionBtn>
                    ) : inv.status === 'PENDING' ? (
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                        Pending
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>
                        ✓ Paid
                      </span>
                    )}
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        {!loading && invoices.length > PAGE_SIZE && (
          <Pagination>
            <PagBtn
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </PagBtn>
            <PagInfo>
              Page {page} of {totalPages}
            </PagInfo>
            <PagBtn
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={16} />
            </PagBtn>
          </Pagination>
        )}
      </TableWrapper>

      {/* Generate Invoice Modal */}
      {showModal && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalBox>
            <ModalTitle>Generate Invoice</ModalTitle>
            <ModalSubtitle>
              Enter the Prescription ID for the dispensed prescription to create an invoice.
            </ModalSubtitle>
            <Label>Prescription ID</Label>
            <Input
              type="number"
              placeholder="e.g. 12"
              value={prescriptionId}
              onChange={(e) => setPrescriptionId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              autoFocus
            />
            <ModalActions>
              <CancelBtn onClick={() => { setShowModal(false); setPrescriptionId(''); }}>
                Cancel
              </CancelBtn>
              <SubmitBtn
                onClick={handleGenerate}
                disabled={submitting || !prescriptionId.trim()}
              >
                {submitting ? 'Generating…' : 'Generate'}
              </SubmitBtn>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}
    </Page>
  );
};

export default InvoicePage;
