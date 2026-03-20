// src/pages/Dashboard/DashboardPage.jsx
import React from 'react';
import styled from 'styled-components';

// 1. You don't need a background color here, Layout handles the background!
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// 2. Main titles use the primary text color
const PageTitle = styled.h1`
  font-size: 24px;
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 10px 0;
`;

// 3. Grids are great for dashboards
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

// 4. Cards use the 'surface' color so they pop off the 'background' color
const StatCard = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardValue = styled.span`
  font-size: 32px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`;

const DashboardPage = () => {
  const brokenBackendData = null;
  return (
    <PageContainer>
      <PageTitle>Overview</PageTitle>
      <StatsGrid>
        
        <StatCard>
          <CardLabel>Total Patients </CardLabel>
          <CardValue>1,284</CardValue>
        </StatCard>

        <StatCard>
          <CardLabel>Today's Appointments</CardLabel>
          <CardValue>42</CardValue>
        </StatCard>

        <StatCard>
          <CardLabel>Pending Invoices</CardLabel>
          <CardValue>18</CardValue>
        </StatCard>

      </StatsGrid>
      
    </PageContainer>
  );
};

export default DashboardPage;