import { createTheme } from '@mui/material/styles';

// Minimalist theme with subtle elegance
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1e40af', // Deep blue
      light: '#3b82f6',
      dark: '#1e3a8a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#60a5fa', // Sky blue
      light: '#93bbfc',
      dark: '#2563eb',
      contrastText: '#000000',
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
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
      color: '#cbd5e1',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#f1f5f9',
    },
    body1: {
      fontSize: '0.95rem',
      color: '#94a3b8',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
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
          backgroundColor: '#3b82f6',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#2563eb',
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: 'transparent',
          color: '#94a3b8',
          fontWeight: 500,
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        },
        body: {
          fontSize: '0.95rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
        },
      },
    },
  },
});