import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from '@mui/icons-material';
import { fetchPlayers } from '../services/api';

interface EloHistoryPoint {
  match: number;
  [key: string]: number;
}

const EloTrendChart: React.FC = () => {
  const [eloHistory, setEloHistory] = useState<EloHistoryPoint[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadEloData = async () => {
      try {
        const playersData = await fetchPlayers();
        const playerNames = playersData.map(p => p.handle);
        setPlayers(playerNames);

        // Mock historical data for now - in production, this would come from rating_history
        // Starting everyone at 1500 ELO
        const history: EloHistoryPoint[] = [
          { match: 0, ...Object.fromEntries(playerNames.map(name => [name, 1500])) },
        ];

        // Simulate some matches with ELO changes
        const mockChanges = [
          { match: 1, niko: 1516, arul: 1484, joel: 1500, daniel: 1500 },
          { match: 2, niko: 1532, arul: 1484, joel: 1484, daniel: 1500 },
          { match: 3, niko: 1548, arul: 1468, joel: 1484, daniel: 1500 },
          { match: 4, niko: 1548, arul: 1452, joel: 1500, daniel: 1500 },
          { match: 5, niko: 1564, arul: 1452, joel: 1484, daniel: 1484 },
        ];

        // Use actual player ELOs for the current state
        const currentElos = Object.fromEntries(
          playersData.map(p => [p.handle, p.elo])
        );

        if (mockChanges.length > 0) {
          history.push(...mockChanges.slice(0, Math.min(5, mockChanges.length)));
        }

        // Add current state
        history.push({
          match: history.length,
          ...currentElos,
        });

        setEloHistory(history);
      } catch (error) {
        console.error('Error loading ELO data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEloData();
  }, []);

  const playerColors: { [key: string]: string } = {
    niko: '#10b981',
    arul: '#ef4444',
    joel: '#60a5fa',
    daniel: '#f59e0b',
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading ELO trends...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Don't show if no data
  if (eloHistory.length < 2) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <TrendingUp sx={{ mr: 2, fontSize: '2rem', color: theme.palette.secondary.main }} />
          <Typography variant="h4" component="h3">
            ELO Rating Progression
          </Typography>
        </Box>

        <Box height={isMobile ? 200 : 250}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={eloHistory}
              margin={{
                top: 20,
                right: isMobile ? 10 : 30,
                left: isMobile ? 0 : 20,
                bottom: isMobile ? 40 : 20
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="match"
                tick={{ fill: theme.palette.text.primary, fontSize: isMobile ? 10 : 12 }}
                axisLine={{ stroke: theme.palette.divider }}
                label={!isMobile ? {
                  value: 'Match Number',
                  position: 'insideBottom',
                  offset: -10,
                  style: { textAnchor: 'middle', fill: theme.palette.text.secondary }
                } : undefined}
              />
              <YAxis
                domain={['dataMin - 20', 'dataMax + 20']}
                tick={{ fill: theme.palette.text.primary, fontSize: isMobile ? 10 : 12 }}
                axisLine={{ stroke: theme.palette.divider }}
                label={!isMobile ? {
                  value: 'ELO Rating',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: theme.palette.text.secondary }
                } : undefined}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  color: theme.palette.text.primary,
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                }}
                formatter={(value: any, name: string) => [
                  Math.round(value),
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                labelFormatter={(label) => `After Match ${label}`}
              />
              <Legend
                wrapperStyle={{
                  color: theme.palette.text.primary,
                  fontSize: isMobile ? '12px' : '14px',
                }}
                iconSize={isMobile ? 12 : 18}
              />

              {players.map((player) => (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  stroke={playerColors[player] || '#94a3b8'}
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{
                    fill: playerColors[player] || '#94a3b8',
                    strokeWidth: 2,
                    stroke: theme.palette.background.paper,
                    r: isMobile ? 3 : 5,
                  }}
                  activeDot={{
                    r: isMobile ? 5 : 7,
                    stroke: playerColors[player] || '#94a3b8',
                    strokeWidth: 2,
                    fill: theme.palette.background.paper,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Current Standings */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Current ELO Rankings
          </Typography>
          <Box
            display="flex"
            justifyContent="space-around"
            flexWrap="wrap"
            gap={isMobile ? 1 : 2}
          >
            {players.map((player) => {
              const currentElo = eloHistory[eloHistory.length - 1]?.[player] as number;
              const previousElo = eloHistory[Math.max(0, eloHistory.length - 2)]?.[player] as number;
              const change = currentElo - previousElo;

              return (
                <Box key={player} textAlign="center" sx={{ minWidth: isMobile ? 80 : 120, mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    {player.charAt(0).toUpperCase() + player.slice(1)}
                  </Typography>
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    sx={{ fontWeight: 700, color: playerColors[player] || '#94a3b8' }}
                  >
                    {Math.round(currentElo)}
                  </Typography>
                  {change !== 0 && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: change > 0 ? theme.palette.success.main :
                               change < 0 ? theme.palette.error.main :
                               theme.palette.text.secondary,
                        fontWeight: 600,
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                      }}
                    >
                      {change > 0 ? '+' : ''}{Math.round(change)}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EloTrendChart;