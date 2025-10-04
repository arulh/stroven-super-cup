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
import { fetchPlayers, fetchPlayerDetail } from '../services/api';
import { getPlayerImage } from '../utils/playerImages';

const StreakChart: React.FC = () => {
  const [streakData, setStreakData] = useState<StreakData[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const loadStreakData = async () => {
      try {
        const players = await fetchPlayers();
        const streakPromises = players.map(async (player) => {
          const detail = await fetchPlayerDetail(player.handle);
          if (!detail || !detail.recent || detail.recent.length === 0) return null;

          // Calculate current streak
          let currentStreak = 0;
          let streakType: 'win' | 'loss' | 'draw' = 'draw';
          let bestWinStreak = 0;
          let worstLossStreak = 0;
          let currentWinStreak = 0;
          let currentLossStreak = 0;

          // Process recent matches to determine streaks (reverse order - oldest to newest)
          const reversedMatches = [...detail.recent].reverse();
          for (const match of reversedMatches) {
            const [p1Score, p2Score] = match.score.split('-').map(Number);
            const isP1 = match.p1 === player.handle;
            const playerScore = isP1 ? p1Score : p2Score;
            const opponentScore = isP1 ? p2Score : p1Score;

            if (playerScore > opponentScore) {
              // Win
              currentWinStreak++;
              currentLossStreak = 0;
              if (currentWinStreak > bestWinStreak) {
                bestWinStreak = currentWinStreak;
              }
            } else if (playerScore < opponentScore) {
              // Loss
              currentLossStreak++;
              currentWinStreak = 0;
              if (currentLossStreak > worstLossStreak) {
                worstLossStreak = currentLossStreak;
              }
            } else {
              // Draw
              currentWinStreak = 0;
              currentLossStreak = 0;
            }
          }

          // Determine current streak
          if (detail.recent.length > 0) {
            const lastMatch = detail.recent[0];
            const [p1Score, p2Score] = lastMatch.score.split('-').map(Number);
            const isP1 = lastMatch.p1 === player.handle;
            const playerScore = isP1 ? p1Score : p2Score;
            const opponentScore = isP1 ? p2Score : p1Score;

            if (playerScore > opponentScore) {
              streakType = 'win';
              currentStreak = currentWinStreak;
            } else if (playerScore < opponentScore) {
              streakType = 'loss';
              currentStreak = currentLossStreak;
            } else {
              streakType = 'draw';
              currentStreak = 1;
            }
          }

          return {
            player: player.handle,
            currentStreak,
            streakType,
            bestWinStreak,
            worstLossStreak,
          };
        });

        const results = (await Promise.all(streakPromises)).filter(Boolean) as StreakData[];
        setStreakData(results);
      } catch (error) {
        console.error('Error loading streak data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStreakData();
  }, []);


  const getStreakIcon = (type: 'win' | 'loss' | 'draw') => {
    if (type === 'win') return <TrendingUp sx={{ color: theme.palette.success.main }} />;
    if (type === 'loss') return <TrendingDown sx={{ color: theme.palette.error.main }} />;
    return <Whatshot sx={{ color: theme.palette.warning.main }} />;
  };

  const getStreakColor = (type: 'win' | 'loss' | 'draw') => {
    if (type === 'win') return theme.palette.success.main;
    if (type === 'loss') return theme.palette.error.main;
    return theme.palette.warning.main;
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

  // Don't show if no data
  if (streakData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <Whatshot sx={{ mr: 2, fontSize: '2rem', color: theme.palette.secondary.main }} />
          <Typography variant="h4" component="h3">
            Current Streaks
          </Typography>
        </Box>

        {/* Streak Rankings */}
        {streakData
          .sort((a, b) => {
            // Sort by win streaks first, then by lowest loss streaks
            if (a.streakType === 'win' && b.streakType !== 'win') return -1;
            if (a.streakType !== 'win' && b.streakType === 'win') return 1;
            return b.currentStreak - a.currentStreak;
          })
          .map((player) => (
            <Box
              key={player.player}
              sx={{
                mb: 3,
                p: 2,
                border: `1px solid ${getStreakColor(player.streakType)}40`,
                borderRadius: 2,
                backgroundColor: `${getStreakColor(player.streakType)}08`,
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                {/* Player Info */}
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={getPlayerImage(player.player)}
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      border: `2px solid ${getStreakColor(player.streakType)}`,
                    }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {player.player}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {getStreakIcon(player.streakType)}
                      <Typography
                        variant="body2"
                        sx={{
                          ml: 1,
                          color: getStreakColor(player.streakType),
                          fontWeight: 600,
                        }}
                      >
                        {player.currentStreak} {player.streakType === 'draw' ? 'Draw' : `Game ${player.streakType.charAt(0).toUpperCase() + player.streakType.slice(1)} Streak`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Streak Badges */}
                <Box display="flex" gap={1}>
                  {player.bestWinStreak > 0 && (
                    <Chip
                      icon={<TrendingUp />}
                      label={`Best: ${player.bestWinStreak}W`}
                      size="small"
                      sx={{
                        backgroundColor: `${theme.palette.success.main}20`,
                        color: theme.palette.success.main,
                      }}
                    />
                  )}
                  {player.worstLossStreak > 0 && (
                    <Chip
                      icon={<TrendingDown />}
                      label={`Worst: ${player.worstLossStreak}L`}
                      size="small"
                      sx={{
                        backgroundColor: `${theme.palette.error.main}20`,
                        color: theme.palette.error.main,
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Streak Progress Bar */}
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" color="textSecondary">
                    Streak Progress
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {player.currentStreak} / {Math.max(player.bestWinStreak, 5)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((player.currentStreak / Math.max(player.bestWinStreak, 5)) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: `${getStreakColor(player.streakType)}20`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getStreakColor(player.streakType),
                    },
                  }}
                />
              </Box>
            </Box>
          ))}
      </CardContent>
    </Card>
  );
};

export default StreakChart;