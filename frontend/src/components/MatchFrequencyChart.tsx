import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Schedule } from '@mui/icons-material';
import { fetchAllMatches } from '../services/api';

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
  const [hasData, setHasData] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadMatchData = async () => {
      try {
        const matches = await fetchAllMatches();

        if (matches.length < 10) {
          // Not enough data to show meaningful patterns
          setHasData(false);
          setLoading(false);
          return;
        }

        // Process time data (using date only, not time since we're changing to dates only)
        const hourCounts: { [key: string]: number } = {};
        const dayCounts: { [key: string]: number } = {
          'Monday': 0,
          'Tuesday': 0,
          'Wednesday': 0,
          'Thursday': 0,
          'Friday': 0,
          'Saturday': 0,
          'Sunday': 0,
        };

        matches.forEach(match => {
          const date = new Date(match.played_at);
          const hour = date.getHours();
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

          // Group by hour
          const hourKey = `${hour}:00`;
          hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;

          // Count by day
          if (dayName in dayCounts) {
            dayCounts[dayName]++;
          }
        });

        // Convert to array format for charts
        const timeDataArray: TimeData[] = Object.entries(hourCounts)
          .map(([hour, count]) => ({
            hour: hour.replace(':00', hour.includes('12') ? 'PM' : Number(hour.split(':')[0]) >= 12 ? 'PM' : 'AM'),
            matches: count,
          }))
          .sort((a, b) => {
            const aHour = parseInt(a.hour);
            const bHour = parseInt(b.hour);
            return aHour - bHour;
          });

        const dayDataArray: DayData[] = [
          { day: 'Monday', matches: dayCounts['Monday'], color: '#ef4444' },
          { day: 'Tuesday', matches: dayCounts['Tuesday'], color: '#f97316' },
          { day: 'Wednesday', matches: dayCounts['Wednesday'], color: '#eab308' },
          { day: 'Thursday', matches: dayCounts['Thursday'], color: '#22c55e' },
          { day: 'Friday', matches: dayCounts['Friday'], color: '#60a5fa' },
          { day: 'Saturday', matches: dayCounts['Saturday'], color: '#8b5cf6' },
          { day: 'Sunday', matches: dayCounts['Sunday'], color: '#ec4899' },
        ];

        setTimeData(timeDataArray);
        setDayData(dayDataArray);
        setHasData(true);
      } catch (error) {
        console.error('Error loading match frequency data:', error);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };

    loadMatchData();
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

  // Don't show if insufficient data
  if (!hasData || totalMatches < 10) {
    return null;
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

        {/* Time of Day Chart - Hide on mobile if not enough data */}
        {timeData.length > 3 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Peak Gaming Hours
            </Typography>
            <Box height={isMobile ? 150 : 200}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeData}
                  margin={{
                    top: 20,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 0 : 20,
                    bottom: 5
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: theme.palette.text.primary, fontSize: isMobile ? 9 : 11 }}
                    axisLine={{ stroke: theme.palette.divider }}
                    interval={isMobile ? 2 : 0}
                  />
                  <YAxis
                    tick={{ fill: theme.palette.text.primary, fontSize: isMobile ? 9 : 11 }}
                    axisLine={{ stroke: theme.palette.divider }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      color: theme.palette.text.primary,
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
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
        )}

        {/* Day of Week Distribution */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Weekly Match Distribution
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            height={isMobile ? 200 : 250}
            flexDirection={isMobile ? 'column' : 'row'}
          >
            {/* Pie Chart */}
            <Box flex={1} height="100%">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dayData.filter(d => d.matches > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 30 : 40}
                    outerRadius={isMobile ? 60 : 80}
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
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
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
            {!isMobile && (
              <Box flex={1} pl={2}>
                {dayData.filter(d => d.matches > 0).map((day) => {
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
                        border: `1px solid ${day.color}40`,
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
            )}
          </Box>
        </Box>

        {/* Quick Stats */}
        <Box
          mt={3}
          display="flex"
          justifyContent="space-around"
          flexWrap="wrap"
          gap={isMobile ? 1 : 0}
        >
          <Box textAlign="center" sx={{ minWidth: isMobile ? 70 : 100 }}>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
              Peak Day
            </Typography>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600, color: '#8b5cf6' }}>
              {dayData.reduce((max, day) => day.matches > max.matches ? day : max).day}
            </Typography>
          </Box>
          <Box textAlign="center" sx={{ minWidth: isMobile ? 70 : 100 }}>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
              Total Matches
            </Typography>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600, color: theme.palette.success.main }}>
              {totalMatches}
            </Typography>
          </Box>
          <Box textAlign="center" sx={{ minWidth: isMobile ? 70 : 100 }}>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
              Avg/Day
            </Typography>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
              {(totalMatches / 7).toFixed(1)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MatchFrequencyChart;