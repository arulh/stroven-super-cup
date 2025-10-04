import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { EmojiEvents, TrendingUp, TrendingDown } from '@mui/icons-material';
import { Player } from '../types';
import { fetchLeaderboard, fetchAllMatches, fetchPlayerStats, fetchPlayerDetail } from '../services/api';
import { getPlayerImage } from '../utils/playerImages';

interface EnhancedPlayer extends Player {
  allTimeHigh?: number;
  recentForm?: ('W' | 'L' | 'D')[];
}

const Leaderboard: React.FC = () => {
  const [players, setPlayers] = useState<EnhancedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await fetchLeaderboard();
        const allMatches = await fetchAllMatches();
        const playerStats = await fetchPlayerStats();

        // Create a map of player stats for easy lookup
        const statsMap = new Map(playerStats.map(p => [p.handle, p]));

        // Calculate actual stats from matches
        const enhancedPlayers = await Promise.all(
          data.map(async (player) => {
            // Fetch player detail to get properly ordered recent matches
            const playerDetail = await fetchPlayerDetail(player.handle);

            // Get recent form from player detail (last 5 matches)
            const recentForm: ('W' | 'L' | 'D')[] = [];

            if (playerDetail && playerDetail.recent && playerDetail.recent.length > 0) {
              // Take the first 5 matches (already sorted by most recent first)
              const last5 = playerDetail.recent.slice(0, 5);

              last5.forEach(match => {
                const [p1Score, p2Score] = match.score.split('-').map(Number);
                const isP1 = match.p1 === player.handle;
                const playerScore = isP1 ? p1Score : p2Score;
                const opponentScore = isP1 ? p2Score : p1Score;

                if (playerScore > opponentScore) recentForm.push('W');
                else if (playerScore < opponentScore) recentForm.push('L');
                else recentForm.push('D');
              });
            }

            // Calculate stats from all matches for totals
            const playerMatches = allMatches.filter(
              m => m.p1 === player.handle || m.p2 === player.handle
            );

            let wins = 0;
            let losses = 0;
            let draws = 0;

            playerMatches.forEach(match => {
              const [p1Score, p2Score] = match.score.split('-').map(Number);
              const isP1 = match.p1 === player.handle;
              const playerScore = isP1 ? p1Score : p2Score;
              const opponentScore = isP1 ? p2Score : p1Score;

              if (playerScore > opponentScore) wins++;
              else if (playerScore < opponentScore) losses++;
              else draws++;
            });

            const totalPlayed = wins + losses + draws;
            const winPct = totalPlayed > 0 ? (wins / totalPlayed) * 100 : 0;

            // Get the actual all-time high from player stats
            const playerStat = statsMap.get(player.handle);
            const allTimeHigh = playerStat?.all_time_high || player.elo;

            return {
              ...player,
              played: totalPlayed,
              wins,
              losses,
              win_pct: winPct,
              allTimeHigh,
              recentForm,
            };
          })
        );

        // Sort by ELO
        enhancedPlayers.sort((a, b) => b.elo - a.elo);
        setPlayers(enhancedPlayers);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getPositionIcon = (position: number) => {
    if (position === 1) return <EmojiEvents sx={{ color: '#FFD700' }} />;
    if (position === 2) return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
    if (position === 3) return <EmojiEvents sx={{ color: '#CD7F32' }} />;
    return null;
  };

  const getEloColor = (elo: number) => {
    if (elo >= 1200) return theme.palette.success.main;
    if (elo >= 1100) return theme.palette.warning.main;
    if (elo >= 1000) return theme.palette.secondary.main;
    return theme.palette.error.main;
  };


  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading leaderboard...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <EmojiEvents sx={{ mr: 2, fontSize: '2rem', color: theme.palette.secondary.main }} />
          <Typography variant="h3" component="h2">
            Championship Leaderboard
          </Typography>
        </Box>

        <TableContainer>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Current ELO</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>All-Time High</TableCell>
                {!isMobile && (
                  <>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Matches</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Record</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Win Rate</TableCell>
                  </>
                )}
                <TableCell align="center" sx={{ fontWeight: 600 }}>Form</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((player, index) => {
                const position = index + 1;
                const winRate = player.win_pct;
                const totalGames = player.played;

                return (
                  <TableRow
                    key={player.handle}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(30, 64, 175, 0.05)',
                      },
                      ...(position <= 3 && {
                        backgroundColor: 'rgba(96, 165, 250, 0.05)',
                      }),
                    }}
                  >
                    {/* Position */}
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        {getPositionIcon(position)}
                        {!isMobile && (
                          <Typography
                            variant="h6"
                            sx={{
                              ml: getPositionIcon(position) ? 1 : 0,
                              fontWeight: position <= 3 ? 700 : 400,
                              color: position <= 3 ? theme.palette.secondary.main : 'inherit',
                            }}
                          >
                            #{position}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Player */}
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={getPlayerImage(player.handle)}
                          sx={{
                            width: isMobile ? 32 : 48,
                            height: isMobile ? 32 : 48,
                            mr: isMobile ? 1 : 2,
                            border: `2px solid ${theme.palette.secondary.main}40`,
                          }}
                        />
                        <Box>
                          <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600 }}>
                            {player.name}
                          </Typography>
                          {!isMobile && (
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              @{player.handle}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Current ELO */}
                    <TableCell align="center">
                      <Typography
                        variant={isMobile ? "h6" : "h5"}
                        sx={{
                          fontWeight: 700,
                          color: getEloColor(player.elo),
                        }}
                      >
                        {Math.round(player.elo)}
                      </Typography>
                    </TableCell>

                    {/* All-Time High */}
                    <TableCell align="center">
                      <Box>
                        <Typography
                          variant={isMobile ? "body1" : "h6"}
                          sx={{
                            fontWeight: 600,
                            color: player.allTimeHigh && player.allTimeHigh > player.elo
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                          }}
                        >
                          {player.allTimeHigh ? Math.round(player.allTimeHigh) : '-'}
                        </Typography>
                        {player.allTimeHigh && player.allTimeHigh !== player.elo && !isMobile && (
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {player.allTimeHigh > player.elo ? (
                              <span style={{ color: theme.palette.error.main }}>
                                -{Math.round(player.allTimeHigh - player.elo)}
                              </span>
                            ) : (
                              <span style={{ color: theme.palette.success.main }}>
                                NEW
                              </span>
                            )}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Matches Played */}
                    {!isMobile && (
                      <TableCell align="center">
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {totalGames}
                        </Typography>
                      </TableCell>
                    )}

                    {/* Record */}
                    {!isMobile && (
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {player.wins}W - {player.losses}L
                          </Typography>
                          {totalGames - player.wins - player.losses > 0 && (
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              {totalGames - player.wins - player.losses}D
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    )}

                    {/* Win Rate */}
                    {!isMobile && (
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: winRate >= 60 ? theme.palette.success.main :
                                     winRate >= 40 ? theme.palette.warning.main :
                                     theme.palette.error.main,
                            }}
                          >
                            {winRate.toFixed(1)}%
                          </Typography>
                          {winRate >= 50 ? (
                            <TrendingUp sx={{ ml: 0.5, color: theme.palette.success.main, fontSize: 20 }} />
                          ) : (
                            <TrendingDown sx={{ ml: 0.5, color: theme.palette.error.main, fontSize: 20 }} />
                          )}
                        </Box>
                      </TableCell>
                    )}

                    {/* Form */}
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.25}>
                        {player.recentForm && player.recentForm.length > 0 ? (
                          [...player.recentForm].reverse().map((result, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: isMobile ? 20 : 24,
                                height: isMobile ? 20 : 24,
                                borderRadius: '4px',
                                backgroundColor:
                                  result === 'W' ? theme.palette.success.main :
                                  result === 'L' ? theme.palette.error.main :
                                  theme.palette.grey[600],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: isMobile ? '0.65rem' : '0.75rem',
                                fontWeight: 600,
                                color: 'white',
                              }}
                            >
                              {result}
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ opacity: 0.5 }}>
                            No matches
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;