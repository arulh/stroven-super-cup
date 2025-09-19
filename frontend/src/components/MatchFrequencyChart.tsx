import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Schedule } from '@mui/icons-material';

interface TimeData {
  hour: string;
  matches: number;
}

interface DayData {
  day: string;
  matches: number;
  color: string;
  [key: string]: string | number;
}

const MatchFrequencyChart: React.FC = () => {
  const [timeData, setTimeData] = useState<TimeData[]>([]);
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // Mock data - in real app, aggregate from matches table by time/day
    const mockTimeData: TimeData[] = [
      { hour: '9AM', matches: 2 },
      { hour: '10AM', matches: 1 },
      { hour: '11AM', matches: 3 },
      { hour: '12PM', matches: 4 },
      { hour: '1PM', matches: 8 },
      { hour: '2PM', matches: 12 },
      { hour: '3PM', matches: 15 },
      { hour: '4PM', matches: 10 },
      { hour: '5PM', matches: 8 },
      { hour: '6PM', matches: 6 },
      { hour: '7PM', matches: 9 },
      { hour: '8PM', matches: 11 },
      { hour: '9PM', matches: 7 },
      { hour: '10PM', matches: 3 },
    ];

    const mockDayData: DayData[] = [
      { day: 'Monday', matches: 8, color: '#ef4444' },
      { day: 'Tuesday', matches: 12, color: '#f97316' },
      { day: 'Wednesday', matches: 15, color: '#eab308' },
      { day: 'Thursday', matches: 18, color: '#22c55e' },
      { day: 'Friday', matches: 25, color: '#00ccff' },
      { day: 'Saturday', matches: 35, color: '#8b5cf6' },
      { day: 'Sunday', matches: 30, color: '#ec4899' },
    ];

    setTimeout(() => {
      setTimeData(mockTimeData);
      setDayData(mockDayData);
      setLoading(false);
    }, 1000);
  }, []);

  const totalMatches = dayData.reduce((sum, day) => sum + day.matches, 0);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading match frequency data...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <Schedule sx={{ mr: 2, fontSize: '2rem', color: theme.palette.secondary.main }} />
          <Typography variant="h4" component="h3">
            Match Activity Patterns
          </Typography>
        </Box>

        {/* Time of Day Chart */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Peak Gaming Hours
          </Typography>
          <Box height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: theme.palette.text.primary, fontSize: 11 }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis
                  tick={{ fill: theme.palette.text.primary, fontSize: 11 }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                    color: theme.palette.text.primary,
                  }}
                  formatter={(value: any) => [value, 'Matches']}
                />
                <Area
                  type="monotone"
                  dataKey="matches"
                  stroke={theme.palette.secondary.main}
                  fill={`url(#colorGradient)`}
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Day of Week Distribution */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Weekly Match Distribution
          </Typography>
          <Box display="flex" alignItems="center" height={250}>
            {/* Pie Chart */}
            <Box flex={1} height="100%">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dayData as any}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="matches"
                    stroke="none"
                  >
                    {dayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      color: theme.palette.text.primary,
                    }}
                    formatter={(value: any, name: string) => [
                      `${value} matches (${((value / totalMatches) * 100).toFixed(1)}%)`,
                      'Matches'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Legend */}
            <Box flex={1} pl={2}>
              {dayData.map((day) => {
                const percentage = ((day.matches / totalMatches) * 100);
                return (
                  <Box
                    key={day.day}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                    p={1}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: `${day.color}15`,
                      border: `1px solid ${day.color}`,
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: day.color,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {day.day}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {day.matches}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Box mt={3} display="flex" justifyContent="space-around" flexWrap="wrap">
          <Box textAlign="center" sx={{ minWidth: 100 }}>
            <Typography variant="body2" color="textSecondary">
              Peak Day
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#8b5cf6' }}>
              Saturday
            </Typography>
          </Box>
          <Box textAlign="center" sx={{ minWidth: 100 }}>
            <Typography variant="body2" color="textSecondary">
              Peak Hour
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
              3PM
            </Typography>
          </Box>
          <Box textAlign="center" sx={{ minWidth: 100 }}>
            <Typography variant="body2" color="textSecondary">
              Total Matches
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
              {totalMatches}
            </Typography>
          </Box>
          <Box textAlign="center" sx={{ minWidth: 100 }}>
            <Typography variant="body2" color="textSecondary">
              Avg/Day
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
              {(totalMatches / 7).toFixed(1)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MatchFrequencyChart;