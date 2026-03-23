import React from 'react';
import styled from 'styled-components';
import { ShieldCheck, Calendar, Activity, HeartPulse } from 'lucide-react';
import logoImg from '../../assets/images/health.png';

const LandingRoot = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
`;

const PageHeader = styled.header`
  width: 100%;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.surface};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
`;

const HeaderInner = styled.div`
  width: 100%;
  max-width: 1140px;
  display: flex;
  align-items: center;
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BrandLogo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: contain;
  background-color: ${(props) => props.theme.colors.primary}22;
`;

const BrandText = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  letter-spacing: -0.02em;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
`;

const Hero = styled.section`
  max-width: 1140px;
  width: 100%;
  text-align: center;
  margin-bottom: 3.25rem;
`;

const HeroHeading = styled.h1`
  font-size: clamp(2rem, 5vw, 3.2rem);
  margin: 0;
  color: ${(props) => props.theme.colors.primary};
  line-height: 1.15;
`;

const HeroSub = styled.p`
  max-width: 700px;
  margin: 1rem auto 0;
  font-size: 1.05rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const FeatureSection = styled.section`
  width: 100%;
  max-width: 1140px;
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 1.5rem;

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 14px;
  padding: 1.35rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${(props) => props.theme.colors.primary}22;
  color: ${(props) => props.theme.colors.primary};
  display: grid;
  place-items: center;
  margin-top: 0.1rem;
`;

const FeatureInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FeatureTitle = styled.h3`
  margin: 0;
  color: ${(props) => props.theme.colors.text};
  font-size: 1.1rem;
`;

const FeatureText = styled.p`
  margin: 0;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.95rem;
  line-height: 1.4;
`;

const CTAButton = styled.a`
  margin-top: 1.5rem;
  padding: 0.86rem 1.4rem;
  border-radius: 999px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  color: white;
  background: ${(props) => props.theme.colors.primary};
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  transition: transform 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }
`;

const PageFooter = styled.footer`
  width: 100%;
  padding: 1rem 1.5rem 1.4rem;
  border-top: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.surface};
`;

const FooterInner = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  text-align: center;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.92rem;
`;

export default function LandingPage() {
  const [subdomain, setSubdomain] = React.useState('');
  const [error, setError] = React.useState('');

  const handleRedirect = () => {
    const candidate = subdomain.trim().toLowerCase();
    if (!candidate) {
      setError('Please enter your hospital subdomain e.g. demo-hospital');
      return;
    }
    setError('');

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';

    let target;
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      const baseDomain = hostname === 'localhost' ? 'localhost' : hostname.split('.').slice(1).join('.');
      target = `${protocol}//${candidate}.${baseDomain}${port}/login`;
    } else {
      const parts = hostname.split('.');
      const baseDomain = parts.length > 1 ? parts.slice(1).join('.') : hostname;
      target = `${protocol}//${candidate}.${baseDomain}${port}/login`;
    }

    window.location.href = target;
  };

  return (
    <LandingRoot>
      <PageHeader>
        <HeaderInner>
          <BrandContainer>
            <BrandLogo src={logoImg} alt="NexaCare logo" />
            <BrandText>NexaCare</BrandText>
          </BrandContainer>
        </HeaderInner>
      </PageHeader>

      <MainContent>
        <Hero>
          <HeroHeading>Start your hospital journey with confidence</HeroHeading>
          <HeroSub>
            NexaCare enables hospitals to run EHR, compliance, billing, scheduling, and analytics in one secure platform.
          </HeroSub>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1.4rem' }}>
            <input
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="Enter hospital subdomain, e.g. demo-hospital"
              style={{
                width: '100%',
                maxWidth: '400px',
                height: '48px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                padding: '0 12px',
                fontSize: '15px',
                color: '#2c3e50',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleRedirect(); } }}
            />
            <CTAButton as="button" type="button" onClick={handleRedirect}>
              Go to my workspace
            </CTAButton>
            {error && <p style={{ color: '#e74c3c', fontSize: '0.9rem', margin: 0 }}>{error}</p>}
          </div>
        </Hero>

        <FeatureSection>
          <FeatureCard>
            <FeatureIcon><ShieldCheck size={20} /></FeatureIcon>
            <FeatureInfo>
              <FeatureTitle>Secure by Design</FeatureTitle>
              <FeatureText>Role-based access, AES-256 and HIPAA-compliant controls for every user.</FeatureText>
            </FeatureInfo>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon><Calendar size={20} /></FeatureIcon>
            <FeatureInfo>
              <FeatureTitle>Smart Scheduling</FeatureTitle>
              <FeatureText>Automated appointments, resource booking, and no-show prevention workflows.</FeatureText>
            </FeatureInfo>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon><HeartPulse size={20} /></FeatureIcon>
            <FeatureInfo>
              <FeatureTitle>Clinical Workflows</FeatureTitle>
              <FeatureText>Shared EHR notes, prescriptions, care plans, and triage tracking in one place.</FeatureText>
            </FeatureInfo>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon><Activity size={20} /></FeatureIcon>
            <FeatureInfo>
              <FeatureTitle>Real-Time Insights</FeatureTitle>
              <FeatureText>Turn data into decisions with bed capacity, laboratory status, and KPI dashboards.</FeatureText>
            </FeatureInfo>
          </FeatureCard>
        </FeatureSection>
      </MainContent>

      <PageFooter>
        <FooterInner>© 2026 NexaCare. Smarter healthcare operations for modern hospitals.</FooterInner>
      </PageFooter>
    </LandingRoot>
  );
}
