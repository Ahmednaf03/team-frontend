import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../modules/auth/hooks/useAuth';
import styled, { keyframes, useTheme } from 'styled-components';
import { 
  User, Lock, Eye, EyeOff, Activity, 
  ShieldCheck, HeartPulse, Calendar, ServerCrash,
  UserRound   // ← new icon for the patient button
} from 'lucide-react';
import logoImg from '../../assets/images/health.png';

const formatTenantSlug = (value) => {
  if (!value || typeof value !== 'string') return null;
  return value
    .split(/[-_.]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const resolveTenantDisplayName = (tenantConfig) => {
  if (!tenantConfig) return null;
  const candidates = [
    tenantConfig?.data?.name,
    tenantConfig?.data?.tenant_name,
    tenantConfig?.data?.hospital_name,
    tenantConfig?.name,
    tenantConfig?.tenant_name,
    tenantConfig?.hospital_name,
    tenantConfig?.tenant?.name,
    tenantConfig?.tenant?.tenant_name,
    tenantConfig?.tenant?.hospital_name,
    formatTenantSlug(tenantConfig?.slug),
    formatTenantSlug(tenantConfig?.tenant_slug),
  ];
  const directMatch = candidates.find(
    (c) => typeof c === 'string' && c.trim()
  );
  if (directMatch) return directMatch.trim();
  if (typeof window !== 'undefined') {
    const [subdomain] = window.location.hostname.split('.');
    return formatTenantSlug(subdomain);
  }
  return null;
};

/* ─── Animations ─────────────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const float = keyframes`
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/* ─── Page Layout ─────────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: ${(p) => p.theme.colors.background};
  font-family: 'DM Sans', sans-serif;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

/* ─── Left Form Area ──────────────────────────────────────────────────────── */
const FormArea = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: ${(p) => p.theme.colors.surface};
  border-right: 1px solid ${(p) => p.theme.colors.border};
`;
const FormCard = styled.div`
  width: 100%;
  max-width: 420px;
  animation: ${fadeUp} 0.55s ease both;
`;

/* ─── Brand & Header ─────────────────────────────────────────────────────── */
const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 3rem;
`;
const LogoPlaceholder = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: contain;
  background-color: ${(p) => p.theme.colors.primary}22;
`;
const BrandText = styled.span`
  font-size: 20px;
  font-weight: bold;
  color: ${(p) => p.theme.colors.text};
  letter-spacing: -0.5px;
`;
const FormHeader = styled.div`
  margin-bottom: 2.5rem;
`;
const FormTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 8px;
`;
const FormSubtitle = styled.p`
  font-size: 15px;
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

/* ─── Form Elements ───────────────────────────────────────────────────────── */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;
const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
const ForgotBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primary};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.8; text-decoration: underline; }
`;
const InputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;
const Input = styled.input`
  width: 100%;
  height: 48px;
  border: 1px solid ${(p) => (p.$hasError ? p.theme.colors.danger : p.theme.colors.border)};
  border-radius: 8px;
  padding: 0 46px 0 16px;
  font-family: inherit;
  font-size: 15px;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.background};
  outline: none;
  transition: all 0.2s;
  &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; opacity: 0.5; }
  &:focus {
    border-color: ${(p) => p.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(p) => p.theme.colors.primary}33;
  }
`;
const InputIconWrap = styled.button`
  position: absolute;
  right: 14px;
  color: ${(p) => p.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: ${(p) => (p.$clickable ? 'pointer' : 'default')};
  padding: 0;
  &:hover { color: ${(p) => (p.$clickable ? p.theme.colors.primary : p.theme.colors.textSecondary)}; }
`;
const SubmitButton = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 8px;
  border: none;
  background: ${(p) => p.theme.colors.primary};
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.disabled ? 0.7 : 1)};
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  &:hover:not(:disabled) { opacity: 0.9; }
`;

/* ─── NEW: Patient Portal Button ─────────────────────────────────────────── */
const PatientPortalBtn = styled.button`
  width: 100%;
  height: 46px;
  border-radius: 8px;
  border: 1.5px solid ${(p) => p.theme.colors.border};
  background: transparent;
  color: ${(p) => p.theme.colors.text};
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    border-color: ${(p) => p.theme.colors.primary};
    color: ${(p) => p.theme.colors.primary};
    background: ${(p) => p.theme.colors.primary}0d;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${(p) => p.theme.colors.textSecondary};
  font-size: 12px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${(p) => p.theme.colors.border};
  }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
const ErrorAlert = styled.div`
  background: ${(p) => p.theme.colors.danger}15;
  border-left: 4px solid ${(p) => p.theme.colors.danger};
  padding: 12px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${(p) => p.theme.colors.text};
  font-size: 14px;
`;

/* ─── Right Hero Panel ────────────────────────────────────────────────────── */
const HeroPanel = styled.aside`
  background-color: ${(p) => p.theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;
  @media (max-width: 860px) { display: none; }
`;
const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 500px;
  z-index: 2;
`;
const FeatureCard = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  padding: 24px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  animation: ${float} 6s ease-in-out infinite;
  &:nth-child(2) { animation-delay: 1.5s; }
  &:nth-child(3) { animation-delay: 3s; }
  &:nth-child(4) { animation-delay: 4.5s; }
`;
const IconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(p) => p.theme.colors.primary}15;
  color: ${(p) => p.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;
const FeatureTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: ${(p) => p.theme.colors.text};
`;
const FeatureDesc = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${(p) => p.theme.colors.textSecondary};
  line-height: 1.5;
`;

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function LoginPage({ tenantConfig }) {
  const navigate = useNavigate();
  const { login, loading, error, isLoggedIn, dismissError } = useAuth();
  const theme = useTheme();

  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const usernameRef = useRef(null);
  const tenantDisplayName = resolveTenantDisplayName(tenantConfig);
  const formSubtitle = tenantDisplayName
    ? `Sign in to continue to ${tenantDisplayName}.`
    : 'Sign in to your hospital workspace.';

  useEffect(() => { if (isLoggedIn) navigate('/dashboard', { replace: true }); }, [isLoggedIn, navigate]);
  useEffect(() => { usernameRef.current?.focus(); }, []);
  useEffect(() => { if (error) dismissError(); }, [username, password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password || loading) return;
    login(username.trim(), password);
  };

  // ── Patient Portal redirect ──────────────────────────────────────────────
  const handlePatientPortal = () => {
    // Pass any pre-filled values to the patient login page via state,
    // so the user doesn't have to retype if they just filled the form.
    navigate('/patient-login', {
      state: { prefillEmail: username.trim() },
    });
  };

  const isDisabled = loading || !username.trim() || !password;

  return (
    <Page>
      {/* ── LEFT FORM AREA ── */}
      <FormArea>
        <FormCard>

          <BrandContainer>
            <LogoPlaceholder src={logoImg} alt="App Logo" />
            <BrandText>NexaCare</BrandText>
          </BrandContainer>

          <FormHeader>
            <FormTitle>Welcome Back</FormTitle>
            <FormSubtitle>{formSubtitle}</FormSubtitle>
          </FormHeader>

          <Form onSubmit={handleSubmit} noValidate>

            {error && (
              <ErrorAlert role="alert">
                <ServerCrash size={20} color={theme.colors.danger} />
                <span>{error}</span>
              </ErrorAlert>
            )}

            <div>
              <LabelRow><Label htmlFor="username">Email</Label></LabelRow>
              <InputWrap>
                <Input
                  ref={usernameRef}
                  id="username"
                  type="text"
                  placeholder="e.g. dr.smith"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  $hasError={!!error}
                />
                <InputIconWrap type="button" disabled><User size={18} /></InputIconWrap>
              </InputWrap>
            </div>

            <div>
              <LabelRow>
                <Label htmlFor="password">Password</Label>
                <ForgotBtn type="button" onClick={() => console.log('Navigate to forgot password')}>
                  Forgot password?
                </ForgotBtn>
              </LabelRow>
              <InputWrap>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  $hasError={!!error}
                />
                <InputIconWrap type="button" $clickable onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </InputIconWrap>
              </InputWrap>
            </div>

            <SubmitButton type="submit" disabled={isDisabled}>
              {loading ? <><Spinner /> Authenticating...</> : 'Access Workspace'}
            </SubmitButton>

            {/* ── Divider ── */}
            <Divider>or</Divider>

            {/* ── Patient Portal Button ── */}
            <PatientPortalBtn type="button" onClick={handlePatientPortal}>
              <UserRound size={17} />
              Patient Portal
            </PatientPortalBtn>

            <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '13px', color: 'gray' }}>
              <Lock size={12} style={{ display: 'inline', marginRight: '5px' }} />
              Secure AES-256 Encrypted Connection
            </div>

          </Form>
        </FormCard>
      </FormArea>

      {/* ── RIGHT HERO PANEL ── */}
      <HeroPanel>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <Activity size={48} color={theme.colors.primary} style={{ marginBottom: '10px' }} />
          <h2 style={{ fontSize: '28px', margin: 0, color: theme.colors.text }}>Healthcare, Unified.</h2>
          <p style={{ color: theme.colors.textSecondary, marginTop: '10px' }}>Everything you need to manage your practice.</p>
        </div>
        <FeatureGrid>
          <FeatureCard>
            <IconBox><HeartPulse size={24} /></IconBox>
            <FeatureTitle>Patient Care</FeatureTitle>
            <FeatureDesc>Comprehensive EHR and vitals tracking in real-time.</FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <IconBox><ShieldCheck size={24} /></IconBox>
            <FeatureTitle>HIPAA Compliant</FeatureTitle>
            <FeatureDesc>Security practice that adheres to HIPAA regulations.</FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <IconBox><Calendar size={24} /></IconBox>
            <FeatureTitle>Smart Scheduling</FeatureTitle>
            <FeatureDesc>Effortlessly manage patient appointments and staff availability.</FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <IconBox><Activity size={24} /></IconBox>
            <FeatureTitle>Live Analytics</FeatureTitle>
            <FeatureDesc>Monitor hospital capacity and staff performance.</FeatureDesc>
          </FeatureCard>
        </FeatureGrid>
      </HeroPanel>

    </Page>
  );
}