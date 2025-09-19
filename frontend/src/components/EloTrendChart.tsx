import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from '@mui/icons-material';

interface EloHistoryPoint {
  match: number;
  alice?: number;
  bob?: number;
  charlie?: number;
}

const EloTrendChart: React.FC = () => {
  const [eloHistory, setEloHistory] = useState<EloHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // Mock data - in real app, fetch from rating_history table
    const mockEloHistory: EloHistoryPoint[] = [
      { match: 0, alice: 1000, bob: 1000, charlie: 1000 },
      { match: 1, alice: 1016, bob: 984, charlie: 1000 },
      { match: 2, alice: 1026, bob: 984, charlie: 990 },
      { match: 3, alice: 1026, bob: 968, charlie: 1006 },
      { match: 4, alice: 1010, bob: 968, charlie: 1022 },
      { match: 5, alice: 1026, bob: 943, charlie: 1031 },
    ];

    setTimeout(() => {
      setEloHistory(mockEloHistory);
      setLoading(false);
    }, 1000);
  }, []);

  const playerColors = {
    alice: '#00ff88',
    bob: '#ef4444',
    charlie: '#00ccff',
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

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <TrendingUp sx={{ mr: 2, fontSize: '2rem', color: theme.palette.secondary.main }} />
          <Typography variant="h4" component="h3">
            ELO Rating Progression
          </Typography>
        </Box>

        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={eloHistory}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="match"
                tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
                label={{
                  value: 'Match Number',
                  position: 'insideBottom',
                  offset: -10,
                  style: { textAnchor: 'middle', fill: theme.palette.text.secondary }
                }}
              />
              <YAxis
                domain={['dataMin - 20', 'dataMax + 20']}
                tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
                label={{
                  value: 'ELO Rating',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: theme.palette.text.secondary }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  color: theme.palette.text.primary,
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
                  fontSize: '14px',
                }}
              />

              {Object.entries(playerColors).map(([player, color]) => (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  stroke={color}
                  strokeWidth={3}
                  dot={{
                    fill: color,
                    strokeWidth: 2,
                    stroke: theme.palette.background.paper,
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                    stroke: color,
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
          <Box display="flex" justifyContent="space-around" flexWrap="wrap">
            {Object.entries(playerColors).map(([player, color]) => {
              const currentElo = eloHistory[eloHistory.length - 1]?.[player as keyof EloHistoryPoint] as number;
              const previousElo = eloHistory[eloHistory.length - 2]?.[player as keyof EloHistoryPoint] as number;
              const change = currentElo - previousElo;

              return (
                <Box key={player} textAlign="center" sx={{ minWidth: 120, mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    {player.charAt(0).toUpperCase() + player.slice(1)}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color }}
                  >
                    {Math.round(currentElo)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: change > 0 ? theme.palette.success.main :
                             change < 0 ? theme.palette.error.main :
                             theme.palette.text.secondary,
                      fontWeight: 600,
                    }}
                  >
                    {change > 0 ? '+' : ''}{Math.round(change)}
                  </Typography>
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