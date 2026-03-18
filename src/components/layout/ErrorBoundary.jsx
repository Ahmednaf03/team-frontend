// src/components/common/ErrorBoundary.jsx
import React from 'react';
import styled from 'styled-components';
import oopsImage from '../../assets/images/computer.png';
// --- Styled Fallback UI ---
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 60vh;
  padding: 40px;
  text-align: center;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: ${(props) => props.theme.colors.danger};
`;

const ErrorTitle = styled.h2`
  margin-bottom: 10px;
`;

const ErrorDetails = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 30px;
  max-width: 500px;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

// --- The Class Component ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // 1. Update state so the next render shows the fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // 2. Log the error to an error reporting service
  componentDidCatch(error, errorInfo) {
    console.error("UI Crashed:", error, errorInfo);
    // In the future, you can add Sentry or Datadog logging here:
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorContainer>
          <ErrorIcon><img src={oopsImage} alt="" height={40} width={40}/></ErrorIcon>
          <ErrorTitle>Oops! Something went wrong.</ErrorTitle>
          <ErrorDetails>
            We encountered an unexpected error loading this section. check the log for more details
          </ErrorDetails>
          <RetryButton onClick={() => window.location.reload()}>
            Try again
          </RetryButton>
        </ErrorContainer>
      );
    }

    // If there is no error, just render the child components normally
    return this.props.children;
  }
}

export default ErrorBoundary;