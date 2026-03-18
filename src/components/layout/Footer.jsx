// src/components/layout/Footer.jsx
import React from 'react';
import styled from 'styled-components';

// src/components/layout/Footer.jsx

const FooterContainer = styled.footer`
  height: 32px; 
  background-color: ${(props) => props.theme.colors.surface};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 12px; 
`;

const Footer = () => {
  return (
    <FooterContainer>
      © 2026 Healthcare SaaS Workspace. All rights reserved.
    </FooterContainer>
  );
};

export default Footer;