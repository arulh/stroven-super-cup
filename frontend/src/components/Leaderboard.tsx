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
  Chip,
  useTheme,
} from '@mui/material';
import { EmojiEvents, TrendingUp, TrendingDown } from '@mui/icons-material';
import { Player } from '../types';

const Leaderboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/leaderboard');
      const data = await response.json();
      setPlayers(data.players || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getEloRank = (elo: number) => {
    if (elo >= 1300) return 'LEGEND';
    if (elo >= 1200) return 'MASTER';
    if (elo >= 1100) return 'EXPERT';
    if (elo >= 1000) return 'ADVANCED';
    if (elo >= 900) return 'INTERMEDIATE';
    return 'ROOKIE';
  };

  const generateAvatarUrl = (handle: string) => {
    // Generate consistent avatar based on handle
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}&backgroundColor=003399`;
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Rank</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align="center">ELO Rating</TableCell>
                <TableCell align="center">Rank</TableCell>
                <TableCell align="center">Matches</TableCell>
                <TableCell align="center">Record</TableCell>
                <TableCell align="center">Win Rate</TableCell>
                <TableCell align="center">Form</TableCell>
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
                        backgroundColor: 'rgba(0, 51, 153, 0.1)',
                      },
                      ...(position <= 3 && {
                        backgroundColor: 'rgba(0, 204, 255, 0.05)',
                        border: `1px solid ${theme.palette.secondary.main}`,
                      }),
                    }}
                  >
                    {/* Rank */}
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        {getPositionIcon(position)}
                        <Typography
                          variant="h6"
                          sx={{
                            ml: 1,
                            fontWeight: position <= 3 ? 700 : 400,
                            color: position <= 3 ? theme.palette.secondary.main : 'inherit',
                          }}
                        >
                          #{position}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Player */}
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={player.profilePhoto || generateAvatarUrl(player.handle)}
                          sx={{
                            width: 48,
                            height: 48,
                            mr: 2,
                            border: `2px solid ${theme.palette.secondary.main}`,
                          }}
                        />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {player.name}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            @{player.handle}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* ELO Rating */}
                    <TableCell align="center">
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: getEloColor(player.elo),
                        }}
                      >
                        {Math.round(player.elo)}
                      </Typography>
                    </TableCell>

                    {/* Rank Badge */}
                    <TableCell align="center">
                      <Chip
                        label={getEloRank(player.elo)}
                        size="small"
                        sx={{
                          backgroundColor: getEloColor(player.elo),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>

                    {/* Matches Played */}
                    <TableCell align="center">
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {totalGames}
                      </Typography>
                    </TableCell>

                    {/* Record */}
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

                    {/* Win Rate */}
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
                          <TrendingUp sx={{ ml: 0.5, color: theme.palette.success.main }} />
                        ) : (
                          <TrendingDown sx={{ ml: 0.5, color: theme.palette.error.main }} />
                        )}
                      </Box>
                    </TableCell>

                    {/* Form */}
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center">
                        {/* Mock form indicators - last 5 matches */}
                        {['W', 'L', 'W', 'W', 'D'].slice(0, Math.min(5, totalGames)).map((result, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor:
                                result === 'W' ? theme.palette.success.main :
                                result === 'L' ? theme.palette.error.main :
                                theme.palette.grey[500],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 0.25,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'white',
                            }}
                          >
                            {result}
                          </Box>
                        ))}
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