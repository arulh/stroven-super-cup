import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import { Whatshot, TrendingUp, TrendingDown } from '@mui/icons-material';
import { StreakData } from '../types';
import { fetchPlayers, fetchAllMatches } from '../services/api';
import { getPlayerImage } from '../utils/playerImages';
import { MIN_RANKED_MATCHES } from '../constants';

interface StreakChartProps {
  showProvisional?: boolean;
}

const StreakChart: React.FC<StreakChartProps> = ({ showProvisional = false }) => {
  const [streakData, setStreakData] = useState<StreakData[]>([]);
  const [playerPlayedCounts, setPlayerPlayedCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const loadStreakData = async () => {
      try {
        const players = await fetchPlayers();
        setPlayerPlayedCounts(
          Object.fromEntries(players.map((p) => [p.handle, p.played]))
        );
        const allMatches = await fetchAllMatches();

        const streakDataResults = players.map((player) => {
          // Filter matches for this player
          const playerMatches = allMatches
            .filter(m => m.p1 === player.handle || m.p2 === player.handle)
            .sort((a, b) => {
              const timeDiff = new Date(a.played_at).getTime() - new Date(b.played_at).getTime();
              if (timeDiff !== 0) return timeDiff;
              // Tiebreaker: use created_at (insertion order) for matches on the same day
              return new Date(a.created_at || a.played_at).getTime() - new Date(b.created_at || b.played_at).getTime();
            });

          if (playerMatches.length === 0) return null;

          // Calculate current streak
          let currentStreak = 0;
          let streakType: 'win' | 'loss' | 'draw' = 'draw';
          let bestWinStreak = 0;
          let worstLossStreak = 0;
          let currentWinStreak = 0;
          let currentLossStreak = 0;
          let currentDrawStreak = 0;

          // Process all matches to determine streaks (oldest to newest)
          for (const match of playerMatches) {
            const [p1Score, p2Score] = match.score.split('-').map(Number);
            const isP1 = match.p1 === player.handle;
            const playerScore = isP1 ? p1Score : p2Score;
            const opponentScore = isP1 ? p2Score : p1Score;

            if (playerScore > opponentScore) {
              currentWinStreak++;
              currentLossStreak = 0;
              currentDrawStreak = 0;
              if (currentWinStreak > bestWinStreak) {
                bestWinStreak = currentWinStreak;
              }
            } else if (playerScore < opponentScore) {
              currentLossStreak++;
              currentWinStreak = 0;
              currentDrawStreak = 0;
              if (currentLossStreak > worstLossStreak) {
                worstLossStreak = currentLossStreak;
              }
            } else {
              currentDrawStreak++;
              currentWinStreak = 0;
              currentLossStreak = 0;
            }
          }

          // Current streak is whichever counter is non-zero at the end
          if (currentWinStreak > 0) {
            streakType = 'win';
            currentStreak = currentWinStreak;
          } else if (currentLossStreak > 0) {
            streakType = 'loss';
            currentStreak = currentLossStreak;
          } else {
            streakType = 'draw';
            currentStreak = currentDrawStreak;
          }

          return {
            player: player.handle,
            currentStreak,
            streakType,
            bestWinStreak,
            worstLossStreak,
          };
        });

        const results = streakDataResults.filter(Boolean) as StreakData[];
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

  const displayedStreakData = showProvisional
    ? streakData
    : streakData.filter((s) => (playerPlayedCounts[s.player] || 0) >= MIN_RANKED_MATCHES);

  // Don't show if no data
  if (displayedStreakData.length === 0) {
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
        {displayedStreakData
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
                mb: 1.5,
                p: 1.5,
                border: `1px solid ${getStreakColor(player.streakType)}40`,
                borderRadius: 2,
                backgroundColor: `${getStreakColor(player.streakType)}08`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Player Info */}
              <Box display="flex" alignItems="center">
                <Avatar
                  src={getPlayerImage(player.player)}
                  sx={{
                    width: 40,
                    height: 40,
                    mr: 1.5,
                    border: `2px solid ${getStreakColor(player.streakType)}`,
                  }}
                />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {player.player}
                </Typography>
              </Box>

              {/* Streak Info */}
              <Box display="flex" alignItems="center" gap={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    Current
                  </Typography>
                  <Chip
                    icon={getStreakIcon(player.streakType)}
                    label={`${player.currentStreak}${player.streakType.charAt(0).toUpperCase()}`}
                    size="small"
                    sx={{
                      backgroundColor: `${getStreakColor(player.streakType)}20`,
                      color: getStreakColor(player.streakType),
                      fontWeight: 600,
                    }}
                  />
                </Box>
                {player.bestWinStreak > 0 && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      Best
                    </Typography>
                    <Chip
                      icon={<TrendingUp />}
                      label={`${player.bestWinStreak}W`}
                      size="small"
                      sx={{
                        backgroundColor: `${theme.palette.success.main}20`,
                        color: theme.palette.success.main,
                      }}
                    />
                  </Box>
                )}
                {player.worstLossStreak > 0 && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      Worst
                    </Typography>
                    <Chip
                      icon={<TrendingDown />}
                      label={`${player.worstLossStreak}L`}
                      size="small"
                      sx={{
                        backgroundColor: `${theme.palette.error.main}20`,
                        color: theme.palette.error.main,
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          ))}
      </CardContent>
    </Card>
  );
};

export default StreakChart;