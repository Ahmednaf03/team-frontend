import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Receipt,
  Search,
  CheckCircle,
  Clock,
  FilePlus,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BadgeDollarSign,
  FileText,
  Download,
  Wallet,
  Building2,
} from 'lucide-react';
import useBilling from '../../modules/billing/hooks/useBilling';
import useAppointmentReferenceData from '../Appointments/useAppointmentReferenceData';

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

const PreviewFrame = styled.iframe`
  width: 100%;
  min-height: 62vh;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: #fff;
`;

const SelectInput = styled.select`
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

const PaymentInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
`;

const PaymentInfoCard = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const PaymentInfoLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PaymentInfoValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionStack = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const DownloadBtn = styled(ActionBtn)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PAYMENT_META_STORAGE_KEY = 'ehr_invoice_payment_meta';

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

const titleCase = (value = '') =>
  value
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getHospitalNameFromSubdomain = () => {
  if (typeof window === 'undefined') return 'Hospital Workspace';

  const hostname = window.location.hostname || '';
  const subdomain = hostname.split('.')[0] || '';
  const baseName = titleCase(subdomain);

  if (!baseName || baseName.toLowerCase() === 'localhost') {
    return 'Hospital Workspace';
  }

  if (/(hospital|clinic|care|health)/i.test(baseName)) {
    return baseName;
  }

  return `${baseName} Hospital`;
};

const generatePaymentReference = () =>
  `PAY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

const loadPaymentMetadata = () => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(PAYMENT_META_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
};

const persistPaymentMetadata = (data) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(PAYMENT_META_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Ignore localStorage write failures.
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const InvoicePage = () => {
  const userRole = useSelector((state) => state.auth.user?.role);
  const theme = useTheme();
  const canMarkPaid = userRole === 'pharmacist';
  const { patientLookup } = useAppointmentReferenceData();
  const {
    invoices,
    summary,
    loading,
    summaryLoading,
    submitting,
    error,
    success,
    statusFilter,
    searchQuery,
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    fetchInvoices,
    fetchSummary,
    generateInvoice,
    markAsPaid,
    filterByStatus,
    searchInvoices,
    goNext,
    goPrev,
    dismissError,
    dismissSuccess,
  } = useBilling();

  const [showModal, setShowModal] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    paymentMode: 'Cash',
    paymentRef: generatePaymentReference(),
  });
  const [paymentMetadata, setPaymentMetadata] = useState(() => loadPaymentMetadata());
  const pendingPaymentRef = useRef(null);
  const hospitalName = useMemo(() => getHospitalNameFromSubdomain(), []);

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
  }, [fetchInvoices, fetchSummary]);

  useEffect(() => {
    if (!success?.type) {
      return;
    }

    if (success.type === 'generateInvoice') {
      toast.success('Invoice generated successfully.');
      setShowModal(false);
      setPrescriptionId('');
    }

    if (success.type === 'markPaid') {
      if (
        pendingPaymentRef.current &&
        Number(pendingPaymentRef.current.invoiceId) === Number(success.invoiceId)
      ) {
        const committedRecord = pendingPaymentRef.current;
        setPaymentMetadata((prev) => {
          const next = {
            ...prev,
            [String(success.invoiceId)]: committedRecord,
          };
          persistPaymentMetadata(next);
          return next;
        });

        setPreviewInvoice((prevInvoice) =>
          prevInvoice && Number(prevInvoice.id) === Number(success.invoiceId)
            ? { ...prevInvoice, status: 'PAID', paid_at: committedRecord.paidAt }
            : prevInvoice
        );
      }

      toast.success('Invoice marked as paid.');
      pendingPaymentRef.current = null;
      setShowPaymentModal(false);
      setSelectedInvoice(null);
    }

    dismissSuccess();
  }, [dismissSuccess, success]);

  const handleGenerate = () => {
    if (!prescriptionId.trim()) return;
    generateInvoice(prescriptionId.trim());
  };

  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      paymentMode: 'Cash',
      paymentRef: generatePaymentReference(),
    });
    setShowPaymentModal(true);
  };

  const handleMarkPaid = () => {
    if (!selectedInvoice) return;

    pendingPaymentRef.current = {
      invoiceId: selectedInvoice.id,
      paymentMode: paymentForm.paymentMode,
      paymentRef: paymentForm.paymentRef,
      hospitalName,
      totalAmount: selectedInvoice.total_amount,
      paidAt: new Date().toISOString(),
    };

    markAsPaid(selectedInvoice.id);
  };

  const resolvePatientName = (invoice) =>
    invoice.patient_name ||
    patientLookup?.[invoice.patient_id] ||
    `Patient #${invoice.patient_id ?? '—'}`;

  const getInvoicePaymentRecord = (invoice) => {
    const stored = paymentMetadata[String(invoice.id)];
    const pendingForInvoice =
      pendingPaymentRef.current &&
      Number(pendingPaymentRef.current.invoiceId) === Number(invoice.id)
        ? pendingPaymentRef.current
        : null;

    if (pendingForInvoice) {
      return pendingForInvoice;
    }

    if (stored) {
      return stored;
    }

    return {
      invoiceId: invoice.id,
      paymentMode: invoice.payment_mode || (invoice.status === 'PAID' ? 'Recorded Payment' : 'Pending'),
      paymentRef: invoice.payment_ref || `PAY-${String(invoice.id).padStart(4, '0')}`,
      hospitalName,
      totalAmount: invoice.total_amount,
      paidAt: invoice.paid_at || null,
    };
  };

  const buildInvoiceHtml = (invoice) => {
    const paymentRecord = getInvoicePaymentRecord(invoice);
    const patientName = resolvePatientName(invoice);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.id}</title>
  <style>
    body { font-family: Arial, sans-serif; background: ${theme.colors.background}; color: ${theme.colors.text}; padding: 32px; }
    .sheet { max-width: 760px; margin: 0 auto; background: ${theme.colors.surface}; border: 1px solid ${theme.colors.border}; border-radius: 16px; padding: 28px; }
    .title { font-size: 28px; font-weight: 700; margin-bottom: 6px; color: ${theme.colors.primary}; }
    .sub { color: ${theme.colors.textSecondary}; margin-bottom: 22px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
    .card { border: 1px solid ${theme.colors.border}; border-radius: 12px; padding: 14px; background: ${theme.colors.background}; }
    .label { font-size: 12px; color: ${theme.colors.textSecondary}; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
    .value { font-size: 16px; font-weight: 600; color: ${theme.colors.text}; }
    .hero { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 22px; }
    .amount { font-size: 30px; font-weight: 800; color: ${theme.colors.text}; }
    .status { display:inline-block; padding: 6px 12px; border-radius: 999px; background: ${invoice.status === 'PAID' ? '#d1fae5' : '#fef3c7'}; color: ${invoice.status === 'PAID' ? '#065f46' : '#92400e'}; font-weight: 700; font-size: 12px; }
    .footer { margin-top: 24px; color: ${theme.colors.textSecondary}; font-size: 13px; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="hero">
      <div>
        <div class="title">${paymentRecord.hospitalName}</div>
        <div class="sub">Patient billing invoice</div>
      </div>
      <div>
        <div class="status">${invoice.status}</div>
      </div>
    </div>
    <div class="grid">
      <div class="card"><div class="label">Invoice ID</div><div class="value">${invoice.id}</div></div>
      <div class="card"><div class="label">Prescription</div><div class="value">RX-${invoice.prescription_id}</div></div>
      <div class="card"><div class="label">Patient</div><div class="value">${patientName}</div></div>
      <div class="card"><div class="label">Amount</div><div class="value">${formatCurrency(invoice.total_amount)}</div></div>
      <div class="card"><div class="label">Payment Mode</div><div class="value">${paymentRecord.paymentMode}</div></div>
      <div class="card"><div class="label">Payment Ref ID</div><div class="value">${paymentRecord.paymentRef}</div></div>
      <div class="card"><div class="label">Created On</div><div class="value">${formatDate(invoice.created_at)}</div></div>
      <div class="card"><div class="label">Paid On</div><div class="value">${formatDate(paymentRecord.paidAt || invoice.paid_at)}</div></div>
    </div>
    <div class="amount">${formatCurrency(invoice.total_amount)}</div>
    <div class="footer">Generated for ${patientName} by ${paymentRecord.hospitalName}.</div>
  </div>
</body>
</html>`;
  };

  const handleDownloadInvoice = (invoice) => {
    setPreviewInvoice(invoice);
    setPreviewHtml(buildInvoiceHtml(invoice));
  };

  const handlePrintPreview = () => {
    const iframe = document.getElementById('billing-invoice-preview-frame');
    iframe?.contentWindow?.focus();
    iframe?.contentWindow?.print();
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
              <Th>Invoice</Th>
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
            ) : invoices.length === 0 ? (
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
              invoices.map((inv) => (
                <Tr key={inv.id}>
                  <Td><InvoiceId>{inv.id}</InvoiceId></Td>
                  <Td>{resolvePatientName(inv)}</Td>
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
                      <ActionStack>
                        <ActionBtn
                          onClick={() => handleOpenPaymentModal(inv)}
                          disabled={submitting}
                        >
                          Mark Paid
                        </ActionBtn>
                      </ActionStack>
                    ) : inv.status === 'PENDING' ? (
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                        Pending
                      </span>
                    ) : (
                      <ActionStack>
                        <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>
                          ✓ Paid
                        </span>
                        <DownloadBtn onClick={() => handleDownloadInvoice(inv)}>
                          <Download size={14} />
                          Download
                        </DownloadBtn>
                      </ActionStack>
                    )}
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination>
            <PagBtn
              onClick={goPrev}
              disabled={!hasPrev}
            >
              <ChevronLeft size={16} />
            </PagBtn>
            <PagInfo>
              Page {page} of {totalPages}
            </PagInfo>
            <PagBtn
              onClick={goNext}
              disabled={!hasNext}
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

      {showPaymentModal && selectedInvoice && (
        <ModalOverlay
          onClick={(e) =>
            e.target === e.currentTarget && !submitting && setShowPaymentModal(false)
          }
        >
          <ModalBox>
            <ModalTitle>Mark Invoice Paid</ModalTitle>
            <ModalSubtitle>
              Confirm payment details before updating the invoice status.
            </ModalSubtitle>

            <PaymentInfoGrid>
              <PaymentInfoCard>
                <PaymentInfoLabel>
                  <Receipt size={14} />
                  Invoice ID
                </PaymentInfoLabel>
                <PaymentInfoValue>{selectedInvoice.id}</PaymentInfoValue>
              </PaymentInfoCard>
              <PaymentInfoCard>
                <PaymentInfoLabel>
                  <Building2 size={14} />
                  Hospital
                </PaymentInfoLabel>
                <PaymentInfoValue>{hospitalName}</PaymentInfoValue>
              </PaymentInfoCard>
              <PaymentInfoCard>
                <PaymentInfoLabel>
                  <Wallet size={14} />
                  Total Amount
                </PaymentInfoLabel>
                <PaymentInfoValue>{formatCurrency(selectedInvoice.total_amount)}</PaymentInfoValue>
              </PaymentInfoCard>
              <PaymentInfoCard>
                <PaymentInfoLabel>
                  <FileText size={14} />
                  Patient
                </PaymentInfoLabel>
                <PaymentInfoValue>{resolvePatientName(selectedInvoice)}</PaymentInfoValue>
              </PaymentInfoCard>
            </PaymentInfoGrid>

            <Label>Payment Mode</Label>
            <SelectInput
              value={paymentForm.paymentMode}
              onChange={(e) =>
                setPaymentForm((prev) => ({ ...prev, paymentMode: e.target.value }))
              }
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </SelectInput>

            <div style={{ marginTop: 14 }}>
              <Label>Payment Reference ID</Label>
              <Input
                value={paymentForm.paymentRef}
                onChange={(e) =>
                  setPaymentForm((prev) => ({ ...prev, paymentRef: e.target.value }))
                }
                placeholder="Payment reference"
              />
            </div>

            <ModalActions>
              <CancelBtn
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                }}
                disabled={submitting}
              >
                Cancel
              </CancelBtn>
              <SubmitBtn
                onClick={handleMarkPaid}
                disabled={submitting || !paymentForm.paymentRef.trim()}
              >
                {submitting ? 'Updating…' : 'Confirm Payment'}
              </SubmitBtn>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}

      {previewInvoice && previewHtml && (
        <ModalOverlay
          onClick={(e) => e.target === e.currentTarget && setPreviewInvoice(null)}
        >
          <ModalBox style={{ maxWidth: 980 }}>
            <ModalTitle>Invoice Preview</ModalTitle>
            <ModalSubtitle>
              Preview the invoice before saving it as PDF.
            </ModalSubtitle>
            <PreviewFrame
              id="billing-invoice-preview-frame"
              title={`Invoice ${previewInvoice.id}`}
              srcDoc={previewHtml}
            />
            <ModalActions>
              <CancelBtn
                onClick={() => {
                  setPreviewInvoice(null);
                  setPreviewHtml('');
                }}
              >
                Close
              </CancelBtn>
              <SubmitBtn onClick={handlePrintPreview}>
                Save as PDF
              </SubmitBtn>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}
    </Page>
  );
};

export default InvoicePage;
