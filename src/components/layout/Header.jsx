// src/components/layout/Header.jsx
import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useThemeContext } from '../../context/ThemeContext'; 
import logoImg from '../../assets/images/health.png';
const HeaderContainer = styled.header`
  height: 52px; 
  background-color: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  align-items: center;
  /* 1. Changed from flex-end to space-between to split left/right! */
  justify-content: space-between; 
  padding: 0 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  z-index: 10;
`;

/* --- New Brand Styles for the Header --- */
const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoPlaceholder = styled.img`
  width: 28px; /* Slightly smaller here so it fits the 52px header nicely */
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
  background-color: ${(props) => props.theme.colors.primary}22; 
`;

const BrandText = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
  letter-spacing: -0.5px;
`;

/* --- Wrapper for the right-side controls --- */
const RightControls = styled.div`
  display: flex;
  align-items: center;
`;

const ThemeSelect = styled.select`
  padding: 6px 12px;
  margin-right: 20px; 
  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  font-size: 13px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${(props) => props.theme.colors.text};
`;

const Avatar = styled.div`
  width: 32px; 
  height: 32px; 
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.primary};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const Header = () => {
  const user = useSelector((state) => state.auth.user);
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  const { themeName, setThemeName } = useThemeContext();

  return (
    <HeaderContainer>
      
      {/* --- LEFT SIDE: Brand & Logo --- */}
      <BrandContainer>
        {/* Set your logo path here! */}
        <LogoPlaceholder src={logoImg} alt="CareOS Logo" />
        <BrandText>NexaCare</BrandText>
      </BrandContainer>

      {/* --- RIGHT SIDE: Theme & Profile --- */}
      <RightControls>
        <ThemeSelect 
          value={themeName} 
          onChange={(e) => setThemeName(e.target.value)}
        >
          <option value="default">Light Theme</option>
          <option value="dark">Dark Theme</option>
          <option value="warm">Warm Theme</option>
        </ThemeSelect>

        <UserProfile>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>{displayRole}</div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Active Session</div>
          </div>
          <Avatar>{displayRole.charAt(0)}</Avatar>
        </UserProfile>
      </RightControls>

    </HeaderContainer>
  );
};

export default Header;