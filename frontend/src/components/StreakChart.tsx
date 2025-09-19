import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { Whatshot, TrendingUp, TrendingDown } from '@mui/icons-material';
import { StreakData } from '../types';

const StreakChart: React.FC = () => {
  const [streakData, setStreakData] = useState<StreakData[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockStreakData: StreakData[] = [
      {
        player: 'alice',
        currentStreak: 3,
        streakType: 'win',
        bestWinStreak: 5,
        worstLossStreak: 2,
      },
      {
        player: 'charlie',
        currentStreak: 1,
        streakType: 'win',
        bestWinStreak: 3,
        worstLossStreak: 1,
      },
      {
        player: 'bob',
        currentStreak: 2,
        streakType: 'loss',
        bestWinStreak: 2,
        worstLossStreak: 3,
      },
    ];

    setTimeout(() => {
      setStreakData(mockStreakData);
      setLoading(false);
    }, 1000);
  }, []);

  const generateAvatarUrl = (handle: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}&backgroundColor=003399`;
  };

  const getStreakColor = (streakType: 'win' | 'loss' | 'draw', streak: number) => {
    if (streakType === 'win') {
      if (streak >= 5) return '#00ff88';
      if (streak >= 3) return '#4ade80';
      return '#22c55e';
    }
    if (streakType === 'loss') {
      if (streak >= 3) return '#ef4444';
      return '#f87171';
    }
    return '#6b7280';
  };

  const getStreakIcon = (streakType: 'win' | 'loss' | 'draw') => {
    if (streakType === 'win') return <TrendingUp />;
    if (streakType === 'loss') return <TrendingDown />;
    return <Whatshot />;
  };

  const getStreakIntensity = (streak: number, type: 'win' | 'loss' | 'draw') => {
    if (type === 'win' && streak >= 5) return 'ON FIRE! 🔥';
    if (type === 'win' && streak >= 3) return 'HOT STREAK';
    if (type === 'loss' && streak >= 3) return 'COLD SPELL';
    if (streak >= 2) return 'BUILDING MOMENTUM';
    return 'GETTING STARTED';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading streak data...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <Whatshot sx={{ mr: 2, fontSize: '2rem', color: theme.palette.secondary.main }} />
          <Typography variant="h4" component="h3">
            Current Form & Streaks
          </Typography>
        </Box>

        <Box>
          {streakData
            .sort((a, b) => {
              // Sort by current streak (wins first, then by streak length)
              if (a.streakType === 'win' && b.streakType !== 'win') return -1;
              if (b.streakType === 'win' && a.streakType !== 'win') return 1;
              return b.currentStreak - a.currentStreak;
            })
            .map((player, index) => (
              <Box
                key={player.player}
                sx={{
                  mb: 2,
                  p: 3,
                  border: `1px solid ${getStreakColor(player.streakType, player.currentStreak)}`,
                  borderRadius: 2,
                  backgroundColor: `${getStreakColor(player.streakType, player.currentStreak)}15`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background streak effect */}
                {player.currentStreak >= 3 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(45deg, ${getStreakColor(player.streakType, player.currentStreak)}05, transparent)`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Player Info */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      src={generateAvatarUrl(player.player)}
                      sx={{
                        width: 48,
                        height: 48,
                        mr: 2,
                        border: `2px solid ${getStreakColor(player.streakType, player.currentStreak)}`,
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {player.player}
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Chip
                          icon={getStreakIcon(player.streakType)}
                          label={getStreakIntensity(player.currentStreak, player.streakType)}
                          size="small"
                          sx={{
                            backgroundColor: getStreakColor(player.streakType, player.currentStreak),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Current Streak */}
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                      Current Streak
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: getStreakColor(player.streakType, player.currentStreak),
                      }}
                    >
                      {player.currentStreak}
                      <Typography
                        component="span"
                        variant="h6"
                        sx={{
                          ml: 0.5,
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                      >
                        {player.streakType === 'win' ? 'W' : player.streakType === 'loss' ? 'L' : 'D'}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>

                {/* Streak Records */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box flex={1}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Best Win Streak
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 150,
                          mr: 2,
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={(player.bestWinStreak / 10) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#22c55e',
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#22c55e' }}>
                        {player.bestWinStreak}
                      </Typography>
                    </Box>
                  </Box>

                  <Box flex={1} sx={{ ml: 3 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Worst Loss Streak
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 150,
                          mr: 2,
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={(player.worstLossStreak / 5) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#ef4444',
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#ef4444' }}>
                        {player.worstLossStreak}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StreakChart;