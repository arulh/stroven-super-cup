import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import { SportsKabaddi } from '@mui/icons-material';
import { Rivalry } from '../types';

const RivalriesChart: React.FC = () => {
  const [rivalries, setRivalries] = useState<Rivalry[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockRivalries: Rivalry[] = [
      {
        player1: 'alice',
        player2: 'bob',
        player1Wins: 3,
        player2Wins: 1,
        draws: 1,
        totalMatches: 5,
        avgGoalDifference: 1.2,
      },
      {
        player1: 'charlie',
        player2: 'alice',
        player1Wins: 2,
        player2Wins: 2,
        draws: 1,
        totalMatches: 5,
        avgGoalDifference: 0.2,
      },
      {
        player1: 'bob',
        player2: 'charlie',
        player1Wins: 1,
        player2Wins: 3,
        draws: 0,
        totalMatches: 4,
        avgGoalDifference: -1.5,
      },
    ];

    setTimeout(() => {
      setRivalries(mockRivalries);
      setLoading(false);
    }, 1000);
  }, []);

  const generateAvatarUrl = (handle: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}&backgroundColor=003399`;
  };

  const getRivalryIntensity = (totalMatches: number, avgGoalDiff: number) => {
    const intensity = totalMatches * (2 - Math.abs(avgGoalDiff));
    if (intensity >= 8) return { label: 'LEGENDARY', color: '#FFD700' };
    if (intensity >= 6) return { label: 'INTENSE', color: '#FF6B35' };
    if (intensity >= 4) return { label: 'HEATED', color: '#F7931E' };
    return { label: 'DEVELOPING', color: '#4ECDC4' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading rivalries...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <SportsKabaddi sx={{ mr: 2, fontSize: '2rem', color: theme.palette.secondary.main }} />
          <Typography variant="h4" component="h3">
            Epic Rivalries
          </Typography>
        </Box>

        <Box>
          {rivalries.map((rivalry, index) => {
            const player1WinPerc = (rivalry.player1Wins / rivalry.totalMatches) * 100;
            const player2WinPerc = (rivalry.player2Wins / rivalry.totalMatches) * 100;
            const drawPerc = (rivalry.draws / rivalry.totalMatches) * 100;
            const intensity = getRivalryIntensity(rivalry.totalMatches, rivalry.avgGoalDifference);

            return (
              <Box
                key={`${rivalry.player1}-${rivalry.player2}`}
                sx={{
                  mb: 3,
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  backgroundColor: 'rgba(0, 51, 153, 0.05)',
                }}
              >
                {/* Rivalry Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      src={generateAvatarUrl(rivalry.player1)}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {rivalry.player1}
                    </Typography>
                    <Typography variant="h6" sx={{ mx: 2, color: theme.palette.secondary.main }}>
                      VS
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {rivalry.player2}
                    </Typography>
                    <Avatar
                      src={generateAvatarUrl(rivalry.player2)}
                      sx={{ width: 32, height: 32, ml: 1 }}
                    />
                  </Box>
                  <Chip
                    label={intensity.label}
                    size="small"
                    sx={{
                      backgroundColor: intensity.color,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {/* Win Distribution Bar */}
                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ minWidth: 100 }}>
                      Head-to-Head:
                    </Typography>
                    <Box flex={1} sx={{ mx: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={player1WinPerc}
                        sx={{
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: theme.palette.error.main,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.success.main,
                            borderRadius: 10,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'right' }}>
                      {rivalry.player1Wins}-{rivalry.player2Wins}
                    </Typography>
                  </Box>

                  {rivalry.draws > 0 && (
                    <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                      <Typography variant="body2" color="textSecondary">
                        Draws: {rivalry.draws} ({drawPerc.toFixed(1)}%)
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Stats */}
                <Box display="flex" justifyContent="space-between">
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                      Total Matches
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {rivalry.totalMatches}
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                      Avg Goal Diff
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: rivalry.avgGoalDifference > 0 ? theme.palette.success.main :
                               rivalry.avgGoalDifference < 0 ? theme.palette.error.main :
                               theme.palette.warning.main,
                      }}
                    >
                      {rivalry.avgGoalDifference > 0 ? '+' : ''}{rivalry.avgGoalDifference.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                      Competitiveness
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: intensity.color }}>
                      {Math.abs(player1WinPerc - player2WinPerc) < 20 ? 'EVEN' : 'DOMINANT'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RivalriesChart;