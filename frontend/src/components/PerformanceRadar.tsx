import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
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
          let clutchWins = 0; // Wins by exactly 1 goal
          const goalDifferences: number[] = []; // Track GD for each match for volatility

          playerMatches.forEach(match => {
            const [p1Score, p2Score] = match.score.split('-').map(Number);
            const isP1 = match.p1 === player.handle;
            const playerScore = isP1 ? p1Score : p2Score;
            const opponentScore = isP1 ? p2Score : p1Score;

            goalsScored += playerScore;
            goalsConceded += opponentScore;

            const goalDiff = playerScore - opponentScore;
            goalDifferences.push(goalDiff);

            if (playerScore > opponentScore) {
              wins++;
              if (goalDiff === 1) clutchWins++; // Exactly 1 goal difference
            }
          });

          const matchCount = playerMatches.length || 1;

          // Calculate average goal difference
          const avgGoalDiff = matchCount > 0
            ? goalDifferences.reduce((sum, gd) => sum + gd, 0) / matchCount
            : 0;

          // Calculate volatility (standard deviation of goal differences)
          const meanGD = avgGoalDiff;
          const variance = matchCount > 0
            ? goalDifferences.reduce((sum, gd) => sum + Math.pow(gd - meanGD, 2), 0) / matchCount
            : 0;
          const volatility = Math.sqrt(variance);

          // Calculate actual percentages and scores
          playerStats[player.handle] = {
            winRate: matchCount > 0 ? (wins / matchCount) * 100 : 0,
            avgGoalsScored: matchCount > 0 ? goalsScored / matchCount : 0,
            avgGoalsConceded: matchCount > 0 ? goalsConceded / matchCount : 0,
            avgGoalDiff: avgGoalDiff,
            clutchFactor: wins > 0 ? (clutchWins / wins) * 100 : 0, // % of wins by exactly 1 goal
            volatility: volatility,
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
            metric: 'Avg Goal Diff',
            ...Object.fromEntries(
              playerNames.map(name => {
                // Normalize: +3 GD = 100%, 0 = 50%, -3 = 0%
                const avgGD = playerStats[name]?.avgGoalDiff || 0;
                const percentage = Math.max(0, Math.min(100, 50 + (avgGD / 3) * 50));
                return [name, Math.round(percentage)];
              })
            ),
            fullMark: 100,
          },
          {
            metric: 'Goals For',
            ...Object.fromEntries(
              playerNames.map(name => {
                // 5+ goals average = 100%
                const avgGoals = playerStats[name]?.avgGoalsScored || 0;
                const percentage = Math.min(100, (avgGoals / 5) * 100);
                return [name, Math.round(percentage)];
              })
            ),
            fullMark: 100,
          },
          {
            metric: 'Defense',
            ...Object.fromEntries(
              playerNames.map(name => {
                // Inverted: 0 conceded = 100%, 5+ conceded = 0%
                const avgConceded = playerStats[name]?.avgGoalsConceded || 0;
                const percentage = Math.max(0, 100 - (avgConceded / 5) * 100);
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
            metric: 'Consistency',
            ...Object.fromEntries(
              playerNames.map(name => {
                // Inverted volatility: lower stddev = higher score
                // 0 stddev = 100%, 3+ stddev = 0%
                const vol = playerStats[name]?.volatility || 0;
                const percentage = Math.max(0, 100 - (vol / 3) * 100);
                return [name, Math.round(percentage)];
              })
            ),
            fullMark: 100,
          },
        ];

        // Calculate average stats across all players for each metric
        const averageMetrics = performanceMetrics.map(metric => {
          const playerValues = playerNames.map(name => metric[name] as number);
          const average = playerValues.reduce((sum, val) => sum + val, 0) / playerValues.length;
          return {
            ...metric,
            average: Math.round(average),
          };
        });

        setPerformanceData(averageMetrics);
      } catch (error) {
        console.error('Error loading performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, []);


  const getDisplayData = () => {
    // Use hoveredPlayer if hovering, otherwise use selectedPlayer
    const activePlayer = hoveredPlayer || selectedPlayer;

    if (activePlayer === 'all') {
      return performanceData;
    }

    return performanceData.map(item => ({
      metric: item.metric,
      fullMark: item.fullMark,
      [activePlayer]: item[activePlayer] as number,
      average: item.average, // Always include average for gray overlay
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

          <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: 150 }}>
            <InputLabel id="player-select-label">Player</InputLabel>
            <Select
              labelId="player-select-label"
              value={selectedPlayer}
              label="Player"
              onChange={(e) => setSelectedPlayer(e.target.value)}
              sx={{
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              }}
            >
              <MenuItem
                value="all"
                onMouseEnter={() => setHoveredPlayer('all')}
                onMouseLeave={() => setHoveredPlayer(null)}
              >
                All Players
              </MenuItem>
              {players.map(player => (
                <MenuItem
                  key={player}
                  value={player}
                  onMouseEnter={() => setHoveredPlayer(player)}
                  onMouseLeave={() => setHoveredPlayer(null)}
                >
                  {player.charAt(0).toUpperCase() + player.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

              {/* Always show average as gray overlay */}
              <Radar
                name="Average"
                dataKey="average"
                stroke="#9ca3af"
                fill="#9ca3af"
                fillOpacity={0.05}
                strokeWidth={isMobile ? 1.5 : 2}
                strokeDasharray="5 5"
                dot={{ fill: "#9ca3af", strokeWidth: 1, r: isMobile ? 2 : 3 }}
              />

              {(hoveredPlayer || selectedPlayer) === 'all' ? (
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
                  name={(hoveredPlayer || selectedPlayer).charAt(0).toUpperCase() + (hoveredPlayer || selectedPlayer).slice(1)}
                  dataKey={hoveredPlayer || selectedPlayer}
                  stroke={getPlayerColor(hoveredPlayer || selectedPlayer)}
                  fill={getPlayerColor(hoveredPlayer || selectedPlayer)}
                  fillOpacity={0.2}
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{
                    fill: getPlayerColor(hoveredPlayer || selectedPlayer),
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
                  Avg Goal Diff
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Mean GF - GA (+3 = 100%, 0 = 50%, -3 = 0%)
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Goals For
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Mean goals scored per match (5+ = 100%)
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Defense
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Mean goals against (0 = 100%, 5+ = 0%)
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Clutch
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  % of wins by exactly 1 goal
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Consistency
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Inverse of volatility (lower σ(GD) = higher score)
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