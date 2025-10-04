import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import Navigation from '../components/Navigation';

function PlayerInfo() {
  const { playerId } = useParams<{ playerId: string }>();

  return (
    <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
      <Navigation />

      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h1" component="h1" gutterBottom>
          {playerId}
        </Typography>
        <Typography variant="h4" component="h2" sx={{ opacity: 0.7 }}>
          Player Statistics
        </Typography>
      </Box>

      {/* Placeholder content */}
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ opacity: 0.6 }}>
          Player info page - coming soon
        </Typography>
        <Typography sx={{ mt: 2, opacity: 0.5 }}>
          This page will show detailed statistics for {playerId}
        </Typography>
      </Box>
    </Container>
  );
}

export default PlayerInfo;
