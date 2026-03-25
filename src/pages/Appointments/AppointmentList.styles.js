import styled from 'styled-components';

// ── Page wrapper ──────────────────────────────────────────────────────────────
export const PageWrapper = styled.div`
  padding: 24px;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100%;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

export const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

// ── Filter bar ────────────────────────────────────────────────────────────────
export const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
`;

export const FilterLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

// ── Table card wrapper ────────────────────────────────────────────────────────
export const TableCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
`;

// ── Status badge ──────────────────────────────────────────────────────────────
const statusColorMap = {
  scheduled: { bg: '#e8f4fd', text: '#1a73c1' },
  completed: { bg: '#e6f4ea', text: '#1e7e34' },
  cancelled: { bg: '#fdecea', text: '#c0392b' },
};

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${({ $status }) => statusColorMap[$status]?.bg ?? '#f0f0f0'};
  color: ${({ $status }) => statusColorMap[$status]?.text ?? '#555'};
`;

// ── Pagination wrapper ────────────────────────────────────────────────────────
export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

// ── Empty / error state ───────────────────────────────────────────────────────
export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;
