import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSelector } from 'react-redux';
import { useThemeContext } from '../../context/ThemeContext';
import logoImg from '../../assets/images/health.png';
import NotificationPanel from '../notifications/NotificationPanel';
import OfflineIndicator from './OfflineIndicator';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
`;

// ─── Header Shell ─────────────────────────────────────────────────────────────

const HeaderContainer = styled.header`
  height: 52px;
  background-color: ${(p) => p.theme.colors.surface};
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  z-index: 10;

  @media (max-width: 1024px) {
    padding: 0 18px;
  }

  @media (max-width: 760px) {
    padding: 0 12px;
  }
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const LogoPlaceholder = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
  background-color: ${(p) => p.theme.colors.primary}22;
`;

const BrandText = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: ${(p) => p.theme.colors.text};
  letter-spacing: -0.5px;

  @media (max-width: 760px) {
    font-size: 16px;
  }

  @media (max-width: 620px) {
    display: none;
  }
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 0;
`;

const ThemeSelect = styled.select`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${(p) => p.theme.colors.border};
  background-color: ${(p) => p.theme.colors.background};
  color: ${(p) => p.theme.colors.text};
  font-size: 13px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${(p) => p.theme.colors.primary};
  }

  @media (max-width: 760px) {
    padding: 6px 8px;
    max-width: 110px;
  }
`;

const UserProfile = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${(p) => p.theme.colors.text};
`;

const UserMeta = styled.div`
  text-align: right;

  @media (max-width: 760px) {
    display: none;
  }
`;

const UserRole = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: ${(p) => p.theme.colors.text};
`;

const UserStatus = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textSecondary || '#7f8c8d'};
`;

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(p) => p.$bg || p.theme.colors.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
  box-shadow: ${(p) => (p.$open ? `0 0 0 3px ${p.theme.colors.primary}44` : 'none')};

  &:hover {
    opacity: 0.85;
    transform: scale(1.06);
  }
`;

// ─── Dropdown ─────────────────────────────────────────────────────────────────

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 292px;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  z-index: 999;
  animation: ${fadeSlideIn} 0.18s ease;
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${(p) => p.theme.colors.background};
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const DropdownAvatarLarge = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(p) => p.$bg};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const DropdownName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
  line-height: 1.2;
`;

const RoleBadge = styled.div`
  display: inline-flex;
  align-items: center;
  margin-top: 4px;
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.22);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: ${(p) => p.theme.colors.border};
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const InfoCell = styled.div`
  background: ${(p) => p.theme.colors.surface};
  padding: 10px 14px;
`;

const InfoLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${(p) => p.theme.colors.textSecondary || '#64748b'};
  margin-bottom: 3px;
`;

const InfoValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.$green ? '#10b981' : p.theme.colors.text)};
  text-transform: ${(p) => (p.$capitalize ? 'capitalize' : 'none')};
`;

// ─── Role colors ──────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  admin:        'linear-gradient(135deg,#f59e0b,#fbbf24)',
  provider:     'linear-gradient(135deg,#3b82f6,#60a5fa)',
  nurse:        'linear-gradient(135deg,#ec4899,#f472b6)',
  pharmacist:   'linear-gradient(135deg,#10b981,#34d399)',
  receptionist: 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
};

// ─── Component ────────────────────────────────────────────────────────────────

const Header = () => {
  const user = useSelector((state) => state.auth.user);
  const { themeName, setThemeName } = useThemeContext();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'User';

  const avatarGradient =
    ROLE_COLORS[user?.role?.toLowerCase()] ||
    'linear-gradient(135deg,#0ea5e9,#6366f1)';

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, []);

  return (
    <HeaderContainer>
      <BrandContainer>
        <LogoPlaceholder src={logoImg} alt="NexaCare Logo" />
        <BrandText>NexaCare</BrandText>
      </BrandContainer>

      <RightControls>
        <ThemeSelect
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
        >
          <option value="default">Light Theme</option>
          <option value="dark">Dark Theme</option>
          <option value="warm">Warm Theme</option>
          <option value="crimson">Crimson Theme</option>
          <option value="green">Healthcare Green</option>
        </ThemeSelect>

        <OfflineIndicator />
        <NotificationPanel />

        <UserProfile ref={dropdownRef}>
          <UserMeta>
            <UserRole>{displayRole}</UserRole>
            <UserStatus>Active Session</UserStatus>
          </UserMeta>

          <Avatar
            $bg={avatarGradient}
            $open={open}
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
          >
            {displayRole.charAt(0)}
          </Avatar>

          {open && (
            <Dropdown role="menu">
              {/* ── Header row ── */}
              <DropdownHeader>
                <DropdownAvatarLarge $bg={avatarGradient}>
                  {displayRole.charAt(0)}
                </DropdownAvatarLarge>
                <div>
                  <DropdownName>{displayRole}</DropdownName>
                  <RoleBadge>{user?.role || 'user'}</RoleBadge>
                </div>
              </DropdownHeader>

              {/* ── Info grid ── */}
              <InfoGrid>
                <InfoCell>
                  <InfoLabel>User ID</InfoLabel>
                  <InfoValue>#{user?.id || '—'}</InfoValue>
                </InfoCell>
                <InfoCell>
                  <InfoLabel>Tenant ID</InfoLabel>
                  <InfoValue>#{user?.tenant_id || '—'}</InfoValue>
                </InfoCell>
                <InfoCell>
                  <InfoLabel>Role</InfoLabel>
                  <InfoValue $capitalize>{user?.role || '—'}</InfoValue>
                </InfoCell>
                <InfoCell>
                  <InfoLabel>Session</InfoLabel>
                  <InfoValue $green>● Active</InfoValue>
                </InfoCell>
              </InfoGrid>
            </Dropdown>
          )}
        </UserProfile>
      </RightControls>
    </HeaderContainer>
  );
};

export default Header;
