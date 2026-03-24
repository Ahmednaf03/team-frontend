import styled from 'styled-components';

// ── Page wrapper ──────────────────────────────────────────────────────────────
export const PageWrapper = styled.div`
  padding: ${({ $compact }) => ($compact ? '0' : '24px')};
  background: ${({ theme }) => theme.colors.background};
  min-height: 100%;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

export const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ── Toolbar row (view switcher + doctor filter) ───────────────────────────────
export const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
`;

export const ToolbarLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

// ── Main layout ───────────────────────────────────────────────────────────────
export const CalendarLayout = styled.div`
  display: block;
`;

// ── Calendar card ─────────────────────────────────────────────────────────────
export const CalendarCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;

  .ant-picker-calendar {
    background: transparent;
  }

  .ant-picker-calendar-header {
    padding: 14px 18px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surface};
  }

  .ant-picker-panel {
    background: transparent;
  }

  .ant-picker-content th {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    font-weight: 500;
  }

  .ant-picker-cell-in-view .ant-picker-calendar-date-value {
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-picker-cell-selected .ant-picker-calendar-date {
    background: ${({ theme }) => theme.colors.primary}18;
    border-radius: 8px;
  }

  .ant-picker-cell-today .ant-picker-calendar-date-value {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`;

// ── Event pill inside calendar cell ──────────────────────────────────────────
const statusPillColors = {
  scheduled: { bg: '#1a73c118', text: '#1a73c1', border: '#1a73c1' },
  completed: { bg: '#1e7e3418', text: '#1e7e34', border: '#1e7e34' },
  cancelled: { bg: '#c0392b18', text: '#c0392b', border: '#c0392b' },
};

export const EventPill = styled.div`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: grab;
  transition: opacity 0.15s, transform 0.15s;
  background: ${({ status }) => statusPillColors[status]?.bg ?? '#88888818'};
  color: ${({ status }) => statusPillColors[status]?.text ?? '#555'};
  border-left: 2px solid ${({ status }) => statusPillColors[status]?.border ?? '#888'};
  opacity: ${({ isoptimistic }) => (isoptimistic === 'true' ? 0.5 : 1)};

  &:hover {
    opacity: 0.75;
    transform: scale(1.02);
  }

  &:active {
    cursor: grabbing;
  }
`;

export const MorePill = styled.div`
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
`;

// ── Drop zone highlight ───────────────────────────────────────────────────────
export const DropZone = styled.div`
  min-height: 20px;
  border-radius: 4px;
  transition: background 0.2s;
  background: ${({ $isover }) =>
    $isover === 'true' ? 'rgba(52, 152, 219, 0.12)' : 'transparent'};
`;

// ── Error banner ──────────────────────────────────────────────────────────────
export const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.danger}18;
  border: 1px solid ${({ theme }) => theme.colors.danger}44;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
`;

// ── Reschedule overlay spinner ────────────────────────────────────────────────
export const ReschedulingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
`;

export const CalendarWrapper = styled.div`
  position: relative;
`;

export const DetailModalBody = styled.div`
  display: grid;
  gap: 16px;
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const DetailItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background};
  padding: 12px 14px;

  .label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 6px;
  }

  .value {
    display: block;
    font-size: 14px;
    line-height: 1.45;
    color: ${({ theme }) => theme.colors.text};
    word-break: break-word;
  }
`;

export const DetailNote = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background};
  padding: 12px 14px;

  .label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 6px;
  }

  .value {
    display: block;
    font-size: 14px;
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.text};
    white-space: pre-wrap;
  }
`;
