import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { UserRound, CalendarDays } from 'lucide-react';

/* ─── Styled components ──────────────────────────────────────────────────── */
const SidebarContainer = styled.nav`
  width: 220px;
  min-height: 100%;
  background: ${(p) => p.theme.colors.surface};
  border-right: 1px solid ${(p) => p.theme.colors.border};
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 60px;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.textSecondary};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${(p) => p.theme.colors.primary}0d;
    color: ${(p) => p.theme.colors.text};
  }

  &.active {
    background: ${(p) => p.theme.colors.primary}15;
    color: ${(p) => p.theme.colors.primary};
    font-weight: 600;
  }

  @media (max-width: 768px) {
    padding: 10px;
    margin: 0 6px;
    justify-content: center;

    span {
      display: none;
    }
  }
`;

const NavIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${(p) => p.theme.colors.textSecondary};
  padding: 8px 20px 6px;
  opacity: 0.6;

  @media (max-width: 768px) {
    display: none;
  }
`;

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function PatientSidebar() {
  return (
    <SidebarContainer>
      <SectionLabel>Portal</SectionLabel>
      <NavItem to="/patient-profile" end>
        <NavIcon><UserRound size={16} /></NavIcon>
        <span>Profile</span>
      </NavItem>
      <NavItem to="/patient-appointments">
        <NavIcon><CalendarDays size={16} /></NavIcon>
        <span>Appointments</span>
      </NavItem>
    </SidebarContainer>
  );
}
