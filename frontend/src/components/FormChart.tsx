import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Analytics } from "@mui/icons-material";
import { FormData } from "../types";
import { fetchPlayers, fetchPlayerDetail } from "../services/api";
import { getPlayerColor } from "../utils/playerColors";
import { getPlayerImage } from "../utils/playerImages";

const FormChart: React.FC = () => {
  const [formData, setFormData] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const players = await fetchPlayers();
        const formDataPromises = players
          .filter((p) => p.played >= 5) // Only show players with at least 5 matches
          .map(async (player) => {
            const detail = await fetchPlayerDetail(player.handle);
            if (!detail || !detail.recent || detail.recent.length < 5)
              return null;

            // Take the most recent 5 matches
            const last5 = detail.recent.slice(0, 5);
            const last5Results = last5.map((match) => {
              const [p1Score, p2Score] = match.score.split("-").map(Number);
              const isP1 = match.p1 === player.handle;
              const playerScore = isP1 ? p1Score : p2Score;
              const opponentScore = isP1 ? p2Score : p1Score;

              if (playerScore > opponentScore) return "W";
              if (playerScore < opponentScore) return "L";
              return "D";
            }) as ("W" | "L" | "D")[];

            // Calculate form percentage correctly
            const wins = last5Results.filter((r) => r === "W").length;
            const draws = last5Results.filter((r) => r === "D").length;
            const losses = last5Results.filter((r) => r === "L").length;

            // Form calculation: Wins = 20 points, Draws = 10 points, Loss = 0 points
            // Maximum possible = 100 points (5 wins)
            const form = wins * 20 + draws * 10;

            return {
              player: player.handle,
              last5Matches: last5Results,
              form,
            };
          });

        const results = (await Promise.all(formDataPromises)).filter(
          Boolean
        ) as FormData[];
        setFormData(results);
      } catch (error) {
        console.error("Error loading form data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, []);

  const getFormColor = (form: number) => {
    if (form >= 80) return "#10b981";
    if (form >= 60) return "#22c55e";
    if (form >= 40) return "#f59e0b";
    if (form >= 20) return "#f87171";
    return "#ef4444";
  };

  const getFormLabel = (form: number) => {
    if (form >= 80) return "EXCELLENT";
    if (form >= 60) return "GOOD";
    if (form >= 40) return "AVERAGE";
    if (form >= 20) return "POOR";
    return "STRUGGLING";
  };

  const chartData = formData.map((player) => ({
    name: player.player,
    form: player.form,
    color: getPlayerColor(player.player),
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

  // Don't show the component if there's not enough data
  if (formData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <Analytics
            sx={{
              mr: 2,
              fontSize: "2rem",
              color: theme.palette.secondary.main,
            }}
          />
          <Typography variant="h4" component="h3">
            Recent Form Analysis
          </Typography>
        </Box>

        {/* Explanation */}
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Based on last 5 matches: Win = 20pts, Draw = 10pts, Loss = 0pts
        </Typography>

        {/* Chart */}
        <Box mb={3} height={180}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
              />
              <XAxis
                dataKey="name"
                tick={{
                  fill: theme.palette.text.primary,
                  fontSize: isMobile ? 10 : 12,
                }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{
                  fill: theme.palette.text.primary,
                  fontSize: isMobile ? 10 : 12,
                }}
                axisLine={{ stroke: theme.palette.divider }}
                label={{
                  value: "Form Points",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: theme.palette.text.secondary, fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  color: theme.palette.text.primary,
                }}
                formatter={(value: any) => [`${value} pts`, "Form"]}
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
            .map((player) => {
              const wins = player.last5Matches.filter((r) => r === "W").length;
              const draws = player.last5Matches.filter((r) => r === "D").length;
              const losses = player.last5Matches.filter(
                (r) => r === "L"
              ).length;

              const playerColor = getPlayerColor(player.player);
              return (
                <Box
                  key={player.player}
                  sx={{
                    mb: 2,
                    p: isMobile ? 1.5 : 2,
                    border: `1px solid ${playerColor}40`,
                    borderRadius: 2,
                    backgroundColor: `${playerColor}08`,
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexDirection={isMobile ? "column" : "row"}
                    gap={isMobile ? 1 : 0}
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={getPlayerImage(player.player)}
                        sx={{
                          width: isMobile ? 32 : 40,
                          height: isMobile ? 32 : 40,
                          mr: isMobile ? 1 : 2,
                          border: `2px solid ${playerColor}40`,
                        }}
                      />
                      <Box>
                        <Typography
                          variant={isMobile ? "body1" : "h6"}
                          sx={{ fontWeight: 600 }}
                        >
                          {player.player}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: getFormColor(player.form),
                            fontWeight: 600,
                            fontSize: isMobile ? "0.75rem" : "0.875rem",
                          }}
                        >
                          {getFormLabel(player.form)} • {wins}W {draws}D{" "}
                          {losses}L
                        </Typography>
                      </Box>
                    </Box>

                    {/* Last 5 Matches */}
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={isMobile ? 0.5 : 1}
                    >
                      {!isMobile && (
                        <Typography
                          variant="body2"
                          sx={{ mr: 1, opacity: 0.7 }}
                        >
                          Last 5:
                        </Typography>
                      )}
                      <Box display="flex" gap={0.25}>
                        {[...player.last5Matches]
                          .reverse()
                          .map((result, index) => (
                            <Box
                              key={index}
                              sx={{
                                width: isMobile ? 24 : 28,
                                height: isMobile ? 24 : 28,
                                borderRadius: "4px",
                                backgroundColor:
                                  result === "W"
                                    ? "#288e6c"
                                    : result === "L"
                                    ? "#ef4444"
                                    : "#6b7280",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: isMobile ? "0.7rem" : "0.8rem",
                                fontWeight: 600,
                                color: "white",
                              }}
                            >
                              {result}
                            </Box>
                          ))}
                      </Box>
                    </Box>

                    {/* Form Score */}
                    <Box textAlign="center">
                      <Typography
                        variant={isMobile ? "h6" : "h5"}
                        sx={{
                          fontWeight: 700,
                          color: playerColor,
                        }}
                      >
                        {player.form}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: isMobile ? "0.65rem" : "0.75rem",
                        }}
                      >
                        pts
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FormChart;
