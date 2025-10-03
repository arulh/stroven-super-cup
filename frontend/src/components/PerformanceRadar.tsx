import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Psychology } from '@mui/icons-material';
import { fetchPlayers, fetchAllMatches } from '../services/api';
import { getPlayerColor } from '../utils/playerColors';

interface PerformanceMetric {
  metric: string;
  [key: string]: string | number;
  fullMark: number;
}

const PerformanceRadar: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        const playersData = await fetchPlayers();
        const playerNames = playersData.map(p => p.handle);
        setPlayers(playerNames);

        // Get all matches for detailed statistics
        const allMatches = await fetchAllMatches();

        // Calculate detailed metrics for each player
        const playerStats: { [key: string]: any } = {};

        for (const player of playersData) {
          const playerMatches = allMatches.filter(
            m => m.p1 === player.handle || m.p2 === player.handle
          );

          let goalsScored = 0;
          let goalsConceded = 0;
          let wins = 0;
          let closeWins = 0; // Wins by 1-2 goals
          let dominantWins = 0; // Wins by 3+ goals
          let cleanSheets = 0; // Games where opponent scored 0 AND player won
          let highScoringGames = 0; // Games where player scored 5+ goals

          playerMatches.forEach(match => {
            const [p1Score, p2Score] = match.score.split('-').map(Number);
            const isP1 = match.p1 === player.handle;
            const playerScore = isP1 ? p1Score : p2Score;
            const opponentScore = isP1 ? p2Score : p1Score;

            goalsScored += playerScore;
            goalsConceded += opponentScore;

            if (playerScore > opponentScore) {
              wins++;
              const diff = playerScore - opponentScore;
              if (diff <= 2) closeWins++;
              if (diff >= 3) dominantWins++;
              if (opponentScore === 0) cleanSheets++;
            }

            if (playerScore >= 5) {
              highScoringGames++;
            }
          });

          const matchCount = playerMatches.length || 1;

          // Calculate actual percentages and scores
          playerStats[player.handle] = {
            winRate: matchCount > 0 ? (wins / matchCount) * 100 : 0,
            avgGoalsScored: matchCount > 0 ? goalsScored / matchCount : 0,
            avgGoalsConceded: matchCount > 0 ? goalsConceded / matchCount : 0,
            clutchFactor: wins > 0 ? (closeWins / wins) * 100 : 0,
            domination: matchCount > 0 ? (dominantWins / matchCount) * 100 : 0,
            cleanSheetRate: wins > 0 ? (cleanSheets / wins) * 100 : 0, // % of wins that were clean sheets
            highScoringRate: matchCount > 0 ? (highScoringGames / matchCount) * 100 : 0,
          };

        }

        const performanceMetrics: PerformanceMetric[] = [
          {
            metric: 'Win Rate',
            ...Object.fromEntries(
              playerNames.map(name => [
                name,
                Math.round(playerStats[name]?.winRate || 0)
              ])
            ),
            fullMark: 100,
          },
          {
            metric: 'Goal Scoring',
            ...Object.fromEntries(
              playerNames.map(name => {
                // Convert average goals to percentage (0-8 goals mapped to 0-100%)
                const avgGoals = playerStats[name]?.avgGoalsScored || 0;
                const percentage = Math.min(100, (avgGoals / 5) * 100); // 5+ goals average = 100%
                return [name, Math.round(percentage)];
              })
            ),
            fullMark: 100,
          },
          {
            metric: 'Defensive',
            ...Object.fromEntries(
              playerNames.map(name => {
                // Lower goals conceded is better (0-5 goals conceded mapped to 100-0%)
                const avgConceded = playerStats[name]?.avgGoalsConceded || 0;
                const percentage = Math.max(0, 100 - (avgConceded * 20)); // 0 conceded = 100%, 5+ conceded = 0%
                return [name, Math.round(percentage)];
              })
            ),
            fullMark: 100,
          },
          {
            metric: 'Clutch',
            ...Object.fromEntries(
              playerNames.map(name => [
                name,
                Math.round(playerStats[name]?.clutchFactor || 0)
              ])
            ),
            fullMark: 100,
          },
          {
            metric: 'Domination',
            ...Object.fromEntries(
              playerNames.map(name => [
                name,
                Math.round(playerStats[name]?.domination || 0)
              ])
            ),
            fullMark: 100,
          },
          {
            metric: 'Clean Sheets',
            ...Object.fromEntries(
              playerNames.map(name => [
                name,
                Math.round(playerStats[name]?.cleanSheetRate || 0)
              ])
            ),
            fullMark: 100,
          },
        ];

        setPerformanceData(performanceMetrics);
      } catch (error) {
        console.error('Error loading performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, []);


  const getDisplayData = () => {
    if (selectedPlayer === 'all') {
      return performanceData;
    }

    return performanceData.map(item => ({
      metric: item.metric,
      fullMark: item.fullMark,
      [selectedPlayer]: item[selectedPlayer] as number,
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading performance data...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Don't show if insufficient data
  if (players.length < 2) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          flexDirection={isMobile ? 'column' : 'row'}
          gap={isMobile ? 2 : 0}
        >
          <Box display="flex" alignItems="center">
            <Psychology sx={{ mr: 2, fontSize: '2rem', color: theme.palette.secondary.main }} />
            <Typography variant="h4" component="h3">
              Performance Analysis
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={selectedPlayer}
            exclusive
            onChange={(_, value) => value && setSelectedPlayer(value)}
            size={isMobile ? "small" : "medium"}
            sx={{
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              '& .MuiToggleButton-root': {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                padding: isMobile ? '4px 8px' : '6px 12px',
              }
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            {players.map(player => (
              <ToggleButton key={player} value={player}>
                {player.charAt(0).toUpperCase() + player.slice(1)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box height={isMobile ? 250 : 320}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "70%" : "80%"} data={getDisplayData()}>
              <PolarGrid stroke={theme.palette.divider} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{
                  fill: theme.palette.text.primary,
                  fontSize: isMobile ? 10 : 12,
                }}
                className={isMobile ? 'mobile-tick' : ''}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{
                  fill: theme.palette.text.secondary,
                  fontSize: isMobile ? 8 : 10,
                }}
              />

              {selectedPlayer === 'all' ? (
                players.map((player) => (
                  <Radar
                    key={player}
                    name={player.charAt(0).toUpperCase() + player.slice(1)}
                    dataKey={player}
                    stroke={getPlayerColor(player)}
                    fill={getPlayerColor(player)}
                    fillOpacity={0.1}
                    strokeWidth={isMobile ? 1.5 : 2}
                    dot={{ fill: getPlayerColor(player), strokeWidth: 2, r: isMobile ? 2 : 4 }}
                  />
                ))
              ) : (
                <Radar
                  name={selectedPlayer.charAt(0).toUpperCase() + selectedPlayer.slice(1)}
                  dataKey={selectedPlayer}
                  stroke={getPlayerColor(selectedPlayer)}
                  fill={getPlayerColor(selectedPlayer)}
                  fillOpacity={0.2}
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{
                    fill: getPlayerColor(selectedPlayer),
                    strokeWidth: 2,
                    r: isMobile ? 4 : 6,
                  }}
                />
              )}

              <Legend
                wrapperStyle={{
                  color: theme.palette.text.primary,
                  fontSize: isMobile ? '12px' : '14px',
                }}
                iconSize={isMobile ? 12 : 18}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        {/* Performance Summary with Explanations */}
        {!isMobile && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Metric Explanations
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
              <Box sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Win Rate
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  % of matches won
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Goal Scoring
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Avg goals/match (5+ = 100%)
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Defensive
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Fewer goals conceded (0 = 100%)
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Clutch
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  % of wins by 1-2 goals
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Domination
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  % of matches won by 3+ goals
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Clean Sheets
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  % of wins without conceding
                </Typography>
              </Box>
            </Box>

          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceRadar;