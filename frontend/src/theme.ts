import { createTheme } from '@mui/material/styles';

// Champions League inspired theme with deep blues
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#003399', // UEFA Champions League deep blue
      light: '#1a4da6',
      dark: '#002266',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00ccff', // Bright blue accent
      light: '#33d4ff',
      dark: '#0099cc',
      contrastText: '#000000',
    },
    background: {
      default: '#0a1128', // Very dark blue
      paper: '#1a2847', // Dark blue-gray
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3c4e6',
    },
    success: {
      main: '#00ff88',
    },
    warning: {
      main: '#ffaa00',
    },
    error: {
      main: '#ff4444',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      background: 'linear-gradient(45deg, #003399, #00ccff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: 'center',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#ffffff',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#00ccff',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#ffffff',
    },
    body1: {
      fontSize: '1rem',
      color: '#b3c4e6',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a2847',
          border: '1px solid #334155',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 51, 153, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(45deg, #003399, #0066cc)',
          '&:hover': {
            background: 'linear-gradient(45deg, #002266, #0044aa)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#003399',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1.1rem',
        },
        body: {
          fontSize: '1rem',
          borderBottom: '1px solid #334155',
        },
      },
    },
  },
});