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
import { fetchRatingHistory } from '../services/api';

interface EloHistoryPoint {
  game: number;
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
        const ratingData = await fetchRatingHistory();

        if (!ratingData) {
          // Fallback to showing a simple message if API not available
          console.log('Rating history API not available yet - backend needs rebuild');
          setLoading(false);
          return;
        }

        // Transform the data for the chart
        const history: EloHistoryPoint[] = ratingData.history.map(point => ({
          game: point.match_number,
          ...Object.fromEntries(
            Object.entries(point).filter(([key]) => key !== 'match_number')
          )
        }));

        setPlayers(ratingData.players);
        setEloHistory(history);
      } catch (error) {
        console.error('Error loading ELO data - backend may need rebuild:', error);
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
                dataKey="game"
                tick={{ fill: theme.palette.text.primary, fontSize: isMobile ? 10 : 12 }}
                axisLine={{ stroke: theme.palette.divider }}
                label={!isMobile ? {
                  value: 'Games Played',
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
                labelFormatter={(label) => `After Game ${label}`}
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