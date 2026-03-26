import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, useTheme } from 'styled-components';
import { User, Eye, EyeOff, HeartPulse, ServerCrash, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import axiosClient from '../../services/axiosClient';
import logoImg from '../../assets/images/health.png';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/* ─── Layout ─────────────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.theme.colors.background};
  font-family: 'DM Sans', sans-serif;
  padding: 2rem;
`;

const Card = styled.div`
  width: 100%;
  max-width: 440px;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 20px;
  padding: 2.5rem 2.5rem 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06);
  animation: ${fadeUp} 0.5s ease both;
`;

/* ─── Back link ──────────────────────────────────────────────────────────── */
const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSecondary};
  cursor: pointer;
  margin-bottom: 2rem;
  transition: color 0.2s;
  &:hover { color: ${(p) => p.theme.colors.primary}; }
`;

/* ─── Brand ──────────────────────────────────────────────────────────────── */
const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2rem;
`;
const Logo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 7px;
  object-fit: contain;
  background: ${(p) => p.theme.colors.primary}22;
`;
const BrandText = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: ${(p) => p.theme.colors.text};
  letter-spacing: -0.5px;
`;

/* ─── Badge ──────────────────────────────────────────────────────────────── */
const PatientBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${(p) => p.theme.colors.primary}15;
  color: ${(p) => p.theme.colors.primary};
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 5px 12px;
  border-radius: 999px;
  margin-bottom: 1.25rem;
`;

const FormTitle = styled.h1`
  font-size: 26px;
  font-weight: bold;
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 6px;
`;
const FormSubtitle = styled.p`
  font-size: 14px;
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0 0 2rem;
  line-height: 1.5;
`;

/* ─── Form ───────────────────────────────────────────────────────────────── */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;
const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
`;
const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.06em;
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
const InputIcon = styled.button`
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
const SubmitBtn = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 8px;
  border: none;
  background: ${(p) => p.theme.colors.primary};
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.disabled ? 0.7 : 1)};
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 6px;
  &:hover:not(:disabled) { opacity: 0.9; }
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

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function PatientLoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const theme     = useTheme();

  // Pre-fill email if the user came from the staff login page
  const [email, setEmail]               = useState(location.state?.prefillEmail ?? '');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const emailRef = useRef(null);

  useEffect(() => { emailRef.current?.focus(); }, []);
  useEffect(() => { if (error) setError(null); }, [email, password]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email.trim() || !password || loading) return;
 
  setLoading(true);
  setError(null);
 
  try {
    const res = await axiosClient.post(
      '/patient-login',
      { email: email.trim().toLowerCase(), password },
      { withCredentials: true }
    );
 
    const { access_token, csrf_token } = res.data.data ?? res.data;
 
    localStorage.setItem('access_token', access_token);
    if (csrf_token) localStorage.setItem('csrf_token', csrf_token);
 
    // ↓ was '/patient-dashboard' — now points to the real profile page
    navigate('/patient-profile', { replace: true });
 
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error   ||
      'Invalid email or password.';
    setError(message);
  } finally {
    setLoading(false);
  }
};

  const isDisabled = loading || !email.trim() || !password;

  return (
    <Page>
      <Card>

        {/* Back to staff login */}
        <BackBtn type="button" onClick={() => navigate('/login')}>
          <ArrowLeft size={15} />
          Back to Staff Login
        </BackBtn>

        {/* Brand */}
        <BrandContainer>
          <Logo src={logoImg} alt="NexaCare" />
          <BrandText>NexaCare</BrandText>
        </BrandContainer>

        {/* Patient badge */}
        <PatientBadge>
          <HeartPulse size={13} />
          Patient Portal
        </PatientBadge>

        <FormTitle>Welcome, Patient</FormTitle>
        <FormSubtitle>Sign in to view your health records and appointments.</FormSubtitle>

        <Form onSubmit={handleSubmit} noValidate>

          {error && (
            <ErrorAlert role="alert">
              <ServerCrash size={20} color={theme.colors.danger} />
              <span>{error}</span>
            </ErrorAlert>
          )}

          {/* Email */}
          <div>
            <LabelRow><Label htmlFor="p-email">Email</Label></LabelRow>
            <InputWrap>
              <Input
                ref={emailRef}
                id="p-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                $hasError={!!error}
              />
              <InputIcon type="button" disabled><User size={18} /></InputIcon>
            </InputWrap>
          </div>

          {/* Password */}
          <div>
            <LabelRow><Label htmlFor="p-password">Password</Label></LabelRow>
            <InputWrap>
              <Input
                id="p-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                $hasError={!!error}
              />
              <InputIcon
                type="button"
                $clickable
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </InputIcon>
            </InputWrap>
          </div>

          <SubmitBtn type="submit" disabled={isDisabled}>
            {loading ? <><Spinner /> Signing in...</> : 'Access Patient Portal'}
          </SubmitBtn>

        </Form>
      </Card>
    </Page>
  );
}
