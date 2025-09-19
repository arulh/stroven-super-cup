import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import { theme } from './theme';
import Leaderboard from './components/Leaderboard';
import RivalriesChart from './components/RivalriesChart';
import StreakChart from './components/StreakChart';
import FormChart from './components/FormChart';
import EloTrendChart from './components/EloTrendChart';
import PerformanceRadar from './components/PerformanceRadar';
import MatchFrequencyChart from './components/MatchFrequencyChart';
import introMessages from './intro-messages.json';

function App() {
  const [randomMessage, setRandomMessage] = useState('');

  useEffect(() => {
    const messages = introMessages.messages;
    const randomIndex = Math.floor(Math.random() * messages.length);
    setRandomMessage(messages[randomIndex]);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a1128 0%, #1a2847 50%, #2a3f66 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(0, 51, 153, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(0, 204, 255, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(0, 51, 153, 0.1) 0%, transparent 70%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={6}>
            <Typography variant="h1" component="h1" gutterBottom>
              AI STROVEN
            </Typography>
            <Typography variant="h4" component="h2" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
              Ultimate FIFA Championship Analytics
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
              {randomMessage}
            </Typography>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Leaderboard - Full Width */}
            <Box>
              <Leaderboard />
            </Box>

            {/* Charts Grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 4
            }}>
              <RivalriesChart />
              <StreakChart />
              <FormChart />
              <EloTrendChart />
              <PerformanceRadar />
              <MatchFrequencyChart />
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
