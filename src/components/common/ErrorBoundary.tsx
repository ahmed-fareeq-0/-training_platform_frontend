import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// ==========================================
// ERROR BOUNDARY — Catches React render errors
// ==========================================

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught render error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              gap: 2,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', opacity: 0.7 }} />
            <Typography variant="h4" fontWeight={700}>
              حدث خطأ غير متوقع
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400 }}>
              {process.env.NODE_ENV === 'development' && this.state.error?.message}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={this.handleReload}
              sx={{ mt: 3, px: 5, borderRadius: 3 }}
            >
              العودة للرئيسية / Go Home
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
