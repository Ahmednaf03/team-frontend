// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import useAuth from '../../modules/auth/hooks/useAuth'; 
import { LayoutDashboard, Users, Calendar, LogOut, Menu, NotebookIcon, ReceiptCentIcon, ReceiptIcon } from 'lucide-react';

// --- Styled Components ---

const SidebarContainer = styled.nav`
  /* Note the $ before collapsed */
  width: ${(props) => (props.$collapsed ? '64px' : '250px')};
  background-color: ${(props) => props.theme.colors.sidebarBg};
  color: ${(props) => props.theme.colors.sidebarText};
  padding: ${(props) => (props.$collapsed ? '20px 8px' : '20px 12px')};
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: all 0.3s ease; 
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'space-between')};
  margin-bottom: 20px;
  padding: 0 10px;
`;

const Brand = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  display: ${(props) => (props.$collapsed ? 'none' : 'block')};
  white-space: nowrap;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.sidebarText};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  
  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const NavItem = styled(NavLink)`
  color: ${(props) => props.theme.colors.sidebarText};
  text-decoration: none;
  font-size: 16px;
  padding: ${(props) => (props.$collapsed ? '10px' : '12px')};
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.2s ease;
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'flex-start')};

  &:hover {
    background-color: ${(props) => props.theme.colors.sidebarHover};
  }

  &.active {
    background-color: ${(props) => props.theme.colors.primary}; 
    color: #ffffff;
    font-weight: 600;
  }
`;

const NavLabel = styled.span`
  display: ${(props) => (props.$collapsed ? 'none' : 'block')};
  white-space: nowrap;
`;

const LogoutButton = styled.button`
  margin-top: auto; 
  padding: ${(props) => (props.$collapsed ? '10px' : '12px')};
  background-color: ${(props) => props.theme.colors.danger};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'flex-start')};

  &:hover {
    opacity: 0.9; 
  }
`;

// --- Component ---
const Sidebar = () => {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // We pass $collapsed instead of collapsed
  return (
    <SidebarContainer $collapsed={isCollapsed}>
      
      <HeaderRow $collapsed={isCollapsed}>
        <Brand $collapsed={isCollapsed}>Workspace</Brand>
        <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
          <Menu size={24} />
        </ToggleButton>
      </HeaderRow>

      {/* Nav Links */}
      <NavItem to="/dashboard" $collapsed={isCollapsed}>
        <LayoutDashboard size={20} />
        <NavLabel $collapsed={isCollapsed}>Dashboard</NavLabel>
      </NavItem>

      <NavItem to="/patients" $collapsed={isCollapsed}>
        <Users size={20} />
        <NavLabel $collapsed={isCollapsed}>Patients</NavLabel>
      </NavItem>

      <NavItem to="/appointments" $collapsed={isCollapsed}>
        <Calendar size={20} />
        <NavLabel $collapsed={isCollapsed}>Appointments</NavLabel>
      </NavItem>
        <NavItem to="/prescriptions" $collapsed={isCollapsed}>
        <NotebookIcon size={20} />
        <NavLabel $collapsed={isCollapsed}>Prescriptions</NavLabel>
      </NavItem>

        <NavItem to="/billing" $collapsed={isCollapsed}>
        <ReceiptIcon size={20} />
        <NavLabel $collapsed={isCollapsed}>Billing</NavLabel>
      </NavItem>

      
      
      {/* Logout */}
      <LogoutButton onClick={logout} $collapsed={isCollapsed}>
        <LogOut size={20} />
        <NavLabel $collapsed={isCollapsed}>Logout</NavLabel>
      </LogoutButton>

    </SidebarContainer>
  );
};

export default Sidebar;