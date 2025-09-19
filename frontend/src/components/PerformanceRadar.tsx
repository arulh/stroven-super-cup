import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Psychology } from '@mui/icons-material';

interface PerformanceMetric {
  metric: string;
  alice: number;
  bob: number;
  charlie: number;
  fullMark: number;
}

const PerformanceRadar: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // Mock data - in real app, calculate from match data
    const mockPerformanceData: PerformanceMetric[] = [
      {
        metric: 'Win Rate',
        alice: 85,
        bob: 25,
        charlie: 60,
        fullMark: 100,
      },
      {
        metric: 'Goal Efficiency',
        alice: 75,
        bob: 45,
        charlie: 80,
        fullMark: 100,
      },
      {
        metric: 'Consistency',
        alice: 90,
        bob: 40,
        charlie: 70,
        fullMark: 100,
      },
      {
        metric: 'Clutch Factor',
        alice: 80,
        bob: 30,
        charlie: 85,
        fullMark: 100,
      },
      {
        metric: 'Defensive Play',
        alice: 70,
        bob: 60,
        charlie: 75,
        fullMark: 100,
      },
      {
        metric: 'Aggressive Play',
        alice: 65,
        bob: 85,
        charlie: 90,
        fullMark: 100,
      },
    ];

    setTimeout(() => {
      setPerformanceData(mockPerformanceData);
      setLoading(false);
    }, 1000);
  }, []);

  const playerColors = {
    alice: '#00ff88',
    bob: '#ef4444',
    charlie: '#00ccff',
  };

  const getDisplayData = () => {
    if (selectedPlayer === 'all') {
      return performanceData;
    }

    return performanceData.map(item => ({
      ...item,
      [selectedPlayer]: item[selectedPlayer as keyof PerformanceMetric] as number,
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

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
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
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="alice">Alice</ToggleButton>
            <ToggleButton value="bob">Bob</ToggleButton>
            <ToggleButton value="charlie">Charlie</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box height={400}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getDisplayData()}>
              <PolarGrid stroke={theme.palette.divider} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{
                  fill: theme.palette.text.primary,
                  fontSize: 12,
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{
                  fill: theme.palette.text.secondary,
                  fontSize: 10,
                }}
              />

              {selectedPlayer === 'all' ? (
                Object.entries(playerColors).map(([player, color]) => (
                  <Radar
                    key={player}
                    name={player.charAt(0).toUpperCase() + player.slice(1)}
                    dataKey={player}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.1}
                    strokeWidth={2}
                    dot={{ fill: color, strokeWidth: 2, r: 4 }}
                  />
                ))
              ) : (
                <Radar
                  name={selectedPlayer.charAt(0).toUpperCase() + selectedPlayer.slice(1)}
                  dataKey={selectedPlayer}
                  stroke={playerColors[selectedPlayer as keyof typeof playerColors]}
                  fill={playerColors[selectedPlayer as keyof typeof playerColors]}
                  fillOpacity={0.2}
                  strokeWidth={3}
                  dot={{
                    fill: playerColors[selectedPlayer as keyof typeof playerColors],
                    strokeWidth: 2,
                    r: 6,
                  }}
                />
              )}

              <Legend
                wrapperStyle={{
                  color: theme.palette.text.primary,
                  fontSize: '14px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        {/* Performance Summary */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Key Insights
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {performanceData.map((metric) => {
              const entries = Object.entries(metric)
                .filter(([key]) => key !== 'metric' && key !== 'fullMark');

              const leader = entries.reduce((max, [player, value]) => {
                if (max === null || (value as number) > (max.value as number)) {
                  return { player, value: value as number };
                }
                return max;
              }, null as { player: string; value: number } | null);

              if (!leader) return null;

              return (
                <Box
                  key={metric.metric}
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 51, 153, 0.05)',
                    minWidth: 140,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {metric.metric}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: playerColors[leader.player as keyof typeof playerColors],
                    }}
                  >
                    {leader.player.charAt(0).toUpperCase() + leader.player.slice(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {leader.value}%
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

export default PerformanceRadar;