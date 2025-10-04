import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Slider,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "@mui/icons-material";
import { fetchPlayers } from "../services/api";
import { getPlayerColors } from "../utils/playerColors";

interface EloHistoryPoint {
  match: number;
  [key: string]: number;
}

const RecentEloTrendChart: React.FC = () => {
  const [eloHistory, setEloHistory] = useState<EloHistoryPoint[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchCount, setMatchCount] = useState(15);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const loadEloData = async () => {
      try {
        // Fetch actual rating history from the backend
        const response = await fetch(
          "http://localhost:8000/api/rating-history"
        );
        const data = await response.json();
        const history = data.history;

        if (history && history.length > 0) {
          // Get player names from the history data
          const playerNames = Object.keys(history[0]).filter(
            (key) => key !== "match"
          );
          setPlayers(playerNames);
          setEloHistory(history);
        } else {
          // Fallback if no history
          const playersData = await fetchPlayers();
          const playerNames = playersData.map((p) => p.handle);
          setPlayers(playerNames);
          setEloHistory([]);
        }
      } catch (error) {
        console.error("Error loading ELO data:", error);
        // Fallback to simple data
        try {
          const playersData = await fetchPlayers();
          const playerNames = playersData.map((p) => p.handle);
          setPlayers(playerNames);

          const history: EloHistoryPoint[] = [
            {
              match: 0,
              ...Object.fromEntries(playerNames.map((name) => [name, 1000])),
            },
            {
              match: 1,
              ...Object.fromEntries(playersData.map((p) => [p.handle, p.elo])),
            },
          ];
          setEloHistory(history);
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadEloData();
  }, []);

  // Get consistent colors for all players
  const playerColors = getPlayerColors(players);

  // Filter to show only recent matches
  const recentHistory =
    eloHistory.length > matchCount ? eloHistory.slice(-matchCount) : eloHistory;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading recent ELO trends...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Don't show if no data
  if (eloHistory.length < 2) {
    return null;
  }

  const marks = [
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 15, label: "15" },
    { value: 20, label: "20" },
    { value: 25, label: "25" },
    { value: 30, label: "30" },
  ];

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <TrendingUp
            sx={{
              mr: 2,
              fontSize: "2rem",
              color: theme.palette.secondary.main,
            }}
          />
          <Typography variant="h4" component="h3">
            Recent ELO Rating Progression
          </Typography>
        </Box>

        {/* Match Count Slider */}
        <Box mb={3} px={isMobile ? 1 : 2}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Number of recent matches to display: {matchCount}
          </Typography>
          <Slider
            value={matchCount}
            onChange={(_, value) => setMatchCount(value as number)}
            min={5}
            max={30}
            step={5}
            marks={marks}
            valueLabelDisplay="auto"
            sx={{
              color: theme.palette.secondary.main,
              "& .MuiSlider-markLabel": {
                color: theme.palette.text.secondary,
                fontSize: isMobile ? "0.65rem" : "0.75rem",
              },
            }}
          />
        </Box>

        <Box height={isMobile ? 250 : 400}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={recentHistory}
              margin={{
                top: 20,
                right: isMobile ? 10 : 30,
                left: isMobile ? 0 : 20,
                bottom: isMobile ? 40 : 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
              />
              <XAxis
                dataKey="match"
                tick={{
                  fill: theme.palette.text.primary,
                  fontSize: isMobile ? 10 : 12,
                }}
                axisLine={{ stroke: theme.palette.divider }}
                label={
                  !isMobile
                    ? {
                        value: "Match Number",
                        position: "insideBottom",
                        offset: -10,
                        style: {
                          textAnchor: "middle",
                          fill: theme.palette.text.secondary,
                        },
                      }
                    : undefined
                }
              />
              <YAxis
                domain={["dataMin - 20", "dataMax + 20"]}
                tick={{
                  fill: theme.palette.text.primary,
                  fontSize: isMobile ? 10 : 12,
                }}
                tickFormatter={(value) => Math.round(value).toString()}
                axisLine={{ stroke: theme.palette.divider }}
                label={
                  !isMobile
                    ? {
                        value: "ELO Rating",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: theme.palette.text.secondary,
                        },
                      }
                    : undefined
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  color: theme.palette.text.primary,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                }}
                formatter={(value: any, name: string) => [
                  Math.round(value),
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
                labelFormatter={(label) => `After Match ${label}`}
              />
              <Legend
                wrapperStyle={{
                  color: theme.palette.text.primary,
                  fontSize: isMobile ? "12px" : "14px",
                }}
                iconSize={isMobile ? 12 : 18}
              />

              {players.map((player) => (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  stroke={playerColors[player] || "#94a3b8"}
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{ r: 2 }} // Small dots to show data points
                  activeDot={{
                    r: isMobile ? 5 : 7,
                    stroke: playerColors[player] || "#94a3b8",
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
              const currentElo = eloHistory[eloHistory.length - 1]?.[
                player
              ] as number;
              // Calculate actual last game change from the rating history
              let lastChange = 0;

              if (eloHistory.length >= 2) {
                const previousElo = eloHistory[eloHistory.length - 2]?.[
                  player
                ] as number;
                if (previousElo !== undefined && currentElo !== undefined) {
                  lastChange = currentElo - previousElo;
                }
              }

              return (
                <Box
                  key={player}
                  textAlign="center"
                  sx={{ minWidth: isMobile ? 80 : 120, mb: 2 }}
                >
                  <Typography variant="body2" color="textSecondary">
                    {player.charAt(0).toUpperCase() + player.slice(1)}
                  </Typography>
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    sx={{
                      fontWeight: 700,
                      color: playerColors[player] || "#94a3b8",
                    }}
                  >
                    {Math.round(currentElo)}
                  </Typography>
                  {lastChange !== 0 && (
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          lastChange > 0
                            ? theme.palette.success.main
                            : lastChange < 0
                            ? theme.palette.error.main
                            : theme.palette.text.secondary,
                        fontWeight: 600,
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                      }}
                    >
                      {lastChange > 0 ? "+" : ""}
                      {Math.round(lastChange)}
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

export default RecentEloTrendChart;
