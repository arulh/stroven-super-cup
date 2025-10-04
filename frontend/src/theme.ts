import { createTheme } from '@mui/material/styles';

// Minimalist theme with subtle elegance
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3562A6', // Medium blue
      light: '#6594C0',
      dark: '#0E1E5B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6594C0', // Light blue
      light: '#8bb4d9',
      dark: '#3562A6',
      contrastText: '#000000',
    },
    background: {
      default: '#091442', // Dark blue
      paper: '#0E1E5B', // Deep blue
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#6594C0',
    },
    success: {
      main: '#6594C0',
    },
    warning: {
      main: '#3562A6',
    },
    error: {
      main: '#ef4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      color: '#f1f5f9',
      textAlign: 'center',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      color: '#f1f5f9',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#6594C0',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#f1f5f9',
    },
    body1: {
      fontSize: '0.95rem',
      color: '#6594C0',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#0E1E5B',
          border: '1px solid rgba(101, 148, 192, 0.2)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          backgroundColor: '#3562A6',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#6594C0',
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: 'transparent',
          color: '#6594C0',
          fontWeight: 500,
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: '1px solid rgba(101, 148, 192, 0.2)',
        },
        body: {
          fontSize: '0.95rem',
          borderBottom: '1px solid rgba(101, 148, 192, 0.1)',
        },
      },
    },
  },
});