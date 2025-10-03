import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import { theme } from './theme';
import Leaderboard from './components/Leaderboard';
import Champions from './components/Champions';
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
          background: '#0f172a',
          position: 'relative',
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={6}>
            <Typography variant="h1" component="h1" gutterBottom>
              STROVEN SUPER CUP
            </Typography>
            <Typography variant="h4" component="h2" sx={{ opacity: 0.7 }}>
              FIFA Championship Analytics
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
              {randomMessage}
            </Typography>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Champions - Full Width */}
            <Box>
              <Champions />
            </Box>

            {/* Leaderboard - Full Width */}
            <Box>
              <Leaderboard />
            </Box>

            {/* Charts Grid - Full Width */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* ELO Trend Chart - Full width */}
              <EloTrendChart />

              {/* Form Chart - Full width */}
              <FormChart />

              {/* Rivalries Chart - Full width */}
              <RivalriesChart />

              {/* Two column row */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: 4
              }}>
                <PerformanceRadar />
                <StreakChart />
              </Box>

              {/* Full width if data available */}
              <MatchFrequencyChart />
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
