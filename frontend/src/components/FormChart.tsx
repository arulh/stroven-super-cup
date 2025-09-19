import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  useTheme,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Analytics } from '@mui/icons-material';
import { FormData } from '../types';

const FormChart: React.FC = () => {
  const [formData, setFormData] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // Mock data - in real app, fetch from API and calculate from recent matches
    const mockFormData: FormData[] = [
      {
        player: 'alice',
        last5Matches: ['W', 'W', 'L', 'W', 'W'],
        form: 80, // 4/5 wins
      },
      {
        player: 'charlie',
        last5Matches: ['W', 'D', 'W', 'L', 'D'],
        form: 60, // 2 wins, 2 draws, 1 loss
      },
      {
        player: 'bob',
        last5Matches: ['L', 'L', 'W', 'L', 'L'],
        form: 20, // 1/5 wins
      },
    ];

    setTimeout(() => {
      setFormData(mockFormData);
      setLoading(false);
    }, 1000);
  }, []);

  const generateAvatarUrl = (handle: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}&backgroundColor=003399`;
  };

  const getFormColor = (form: number) => {
    if (form >= 80) return '#00ff88';
    if (form >= 60) return '#4ade80';
    if (form >= 40) return '#fbbf24';
    if (form >= 20) return '#f87171';
    return '#ef4444';
  };

  const getFormLabel = (form: number) => {
    if (form >= 80) return 'EXCELLENT';
    if (form >= 60) return 'GOOD';
    if (form >= 40) return 'AVERAGE';
    if (form >= 20) return 'POOR';
    return 'TERRIBLE';
  };

  const chartData = formData.map(player => ({
    name: player.player,
    form: player.form,
    color: getFormColor(player.form),
  }));

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading form data...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <Analytics sx={{ mr: 2, fontSize: '2rem', color: theme.palette.secondary.main }} />
          <Typography variant="h4" component="h3">
            Recent Form Analysis
          </Typography>
        </Box>

        {/* Chart */}
        <Box mb={3} height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="name"
                tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  color: theme.palette.text.primary,
                }}
                formatter={(value: any) => [`${value}%`, 'Form Rating']}
              />
              <Bar dataKey="form" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Detailed Form */}
        <Box>
          {formData
            .sort((a, b) => b.form - a.form)
            .map((player) => (
              <Box
                key={player.player}
                sx={{
                  mb: 2,
                  p: 2,
                  border: `1px solid ${getFormColor(player.form)}`,
                  borderRadius: 2,
                  backgroundColor: `${getFormColor(player.form)}15`,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <Avatar
                      src={generateAvatarUrl(player.player)}
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        border: `2px solid ${getFormColor(player.form)}`,
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {player.player}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: getFormColor(player.form),
                          fontWeight: 600,
                        }}
                      >
                        {getFormLabel(player.form)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Last 5 Matches */}
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 2, opacity: 0.7 }}>
                      Last 5:
                    </Typography>
                    <Box display="flex">
                      {player.last5Matches.map((result, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor:
                              result === 'W' ? '#00ff88' :
                              result === 'L' ? '#ef4444' :
                              '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 0.25,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: 'white',
                          }}
                        >
                          {result}
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Form Percentage */}
                  <Box textAlign="center">
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: getFormColor(player.form),
                      }}
                    >
                      {player.form}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FormChart;