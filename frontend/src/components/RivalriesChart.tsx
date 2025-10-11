import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import { SportsKabaddi } from "@mui/icons-material";
import { Rivalry } from "../types";
import { fetchAllMatches } from "../services/api";
import { getPlayerColor } from "../utils/playerColors";
import { getPlayerImage } from "../utils/playerImages";

const RivalriesChart: React.FC = () => {
  const [rivalries, setRivalries] = useState<Rivalry[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const loadRivalries = async () => {
      try {
        const matches = await fetchAllMatches();

        // Build rivalry data from matches
        const rivalryMap = new Map<string, Rivalry>();

        matches.forEach((match) => {
          const [p1Score, p2Score] = match.score.split("-").map(Number);
          const key = [match.p1, match.p2].sort().join("-");

          if (!rivalryMap.has(key)) {
            rivalryMap.set(key, {
              player1: match.p1 < match.p2 ? match.p1 : match.p2,
              player2: match.p1 < match.p2 ? match.p2 : match.p1,
              player1Wins: 0,
              player2Wins: 0,
              draws: 0,
              totalMatches: 0,
              avgGoalDifference: 0,
              player1BiggestWin: undefined,
              player2BiggestWin: undefined,
            });
          }

          const rivalry = rivalryMap.get(key)!;
          rivalry.totalMatches++;

          // Determine winner and scores from rivalry perspective
          let player1Score: number, player2Score: number;

          if (match.p1 === rivalry.player1) {
            player1Score = p1Score;
            player2Score = p2Score;
          } else {
            player1Score = p2Score;
            player2Score = p1Score;
          }

          const goalDiff = player1Score - player2Score;

          if (player1Score > player2Score) {
            // Player1 won
            rivalry.player1Wins++;
            rivalry.avgGoalDifference += goalDiff;
            if (
              !rivalry.player1BiggestWin ||
              goalDiff > rivalry.player1BiggestWin.goalDifference
            ) {
              rivalry.player1BiggestWin = {
                score: `${player1Score}-${player2Score}`,
                goalDifference: goalDiff,
              };
            }
          } else if (player2Score > player1Score) {
            // Player2 won
            rivalry.player2Wins++;
            rivalry.avgGoalDifference += goalDiff; // goalDiff is negative here
            if (
              !rivalry.player2BiggestWin ||
              -goalDiff > rivalry.player2BiggestWin.goalDifference
            ) {
              rivalry.player2BiggestWin = {
                score: `${player2Score}-${player1Score}`,
                goalDifference: -goalDiff, // Make it positive
              };
            }
          } else {
            // Draw
            rivalry.draws++;
          }
        });

        // Calculate average goal difference
        rivalryMap.forEach((rivalry) => {
          if (rivalry.totalMatches > 0) {
            rivalry.avgGoalDifference =
              rivalry.avgGoalDifference / rivalry.totalMatches;
          }
        });

        const rivalriesArray = Array.from(rivalryMap.values())
          .filter((r) => r.totalMatches >= 3) // Only show rivalries with 3+ matches
          .sort((a, b) => b.totalMatches - a.totalMatches);

        setRivalries(rivalriesArray);
      } catch (error) {
        console.error("Error loading rivalries:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRivalries();
  }, []);

  const getIntensityColor = (totalMatches: number) => {
    if (totalMatches >= 10) return theme.palette.error.main;
    if (totalMatches >= 7) return theme.palette.warning.main;
    if (totalMatches >= 5) return theme.palette.secondary.main;
    return theme.palette.primary.main;
  };

  const getIntensityLabel = (totalMatches: number) => {
    if (totalMatches >= 35) return "LEGENDARY";
    if (totalMatches >= 20) return "INTENSE";
    if (totalMatches >= 10) return "HEATED";
    return "DEVELOPING";
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading rivalries...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Don't show if no rivalries
  if (rivalries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <SportsKabaddi
            sx={{
              mr: 2,
              fontSize: "2rem",
              color: theme.palette.secondary.main,
            }}
          />
          <Typography variant="h4" component="h3">
            Head-to-Head Rivalries
          </Typography>
        </Box>

        {/* Top Rivalries */}
        {rivalries.map((rivalry) => {
          const player1Percentage =
            (rivalry.player1Wins / rivalry.totalMatches) * 100;
          const player2Percentage =
            (rivalry.player2Wins / rivalry.totalMatches) * 100;
          const drawPercentage = (rivalry.draws / rivalry.totalMatches) * 100;

          return (
            <Box
              key={`${rivalry.player1}-${rivalry.player2}`}
              sx={{
                mb: 3,
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                backgroundColor: "rgba(30, 64, 175, 0.02)",
              }}
            >
              {/* Players */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Box display="flex" alignItems="center" flex={1}>
                  <Avatar
                    src={getPlayerImage(rivalry.player1)}
                    sx={{ width: 40, height: 40, mr: 1 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {rivalry.player1}
                  </Typography>
                </Box>

                <Box mx={2}>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.7, textAlign: "center" }}
                  >
                    VS
                  </Typography>
                  <Chip
                    label={getIntensityLabel(rivalry.totalMatches)}
                    size="small"
                    sx={{
                      backgroundColor: `${getIntensityColor(
                        rivalry.totalMatches
                      )}20`,
                      color: getIntensityColor(rivalry.totalMatches),
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  flex={1}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {rivalry.player2}
                  </Typography>
                  <Avatar
                    src={getPlayerImage(rivalry.player2)}
                    sx={{ width: 40, height: 40, ml: 1 }}
                  />
                </Box>
              </Box>

              {/* Win/Loss/Draw Bar */}
              <Box mb={2}>
                <Box
                  display="flex"
                  height={32}
                  borderRadius={1}
                  overflow="hidden"
                >
                  {player1Percentage > 0 && (
                    <Box
                      sx={{
                        flex: player1Percentage,
                        backgroundColor: getPlayerColor(rivalry.player1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {rivalry.player1Wins}W
                    </Box>
                  )}
                  {drawPercentage > 0 && (
                    <Box
                      sx={{
                        flex: drawPercentage,
                        backgroundColor: theme.palette.grey[600],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {rivalry.draws}D
                    </Box>
                  )}
                  {player2Percentage > 0 && (
                    <Box
                      sx={{
                        flex: player2Percentage,
                        backgroundColor: getPlayerColor(rivalry.player2),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {rivalry.player2Wins}W
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Stats */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Win Rate
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: theme.palette.success.main }}
                  >
                    {player1Percentage.toFixed(1)}%
                  </Typography>
                </Box>

                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary">
                    Total Matches
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {rivalry.totalMatches}
                  </Typography>
                </Box>

                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary">
                    Avg Goal Diff
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color:
                        rivalry.avgGoalDifference > 0
                          ? theme.palette.success.main
                          : rivalry.avgGoalDifference < 0
                          ? theme.palette.error.main
                          : theme.palette.text.primary,
                    }}
                  >
                    {rivalry.avgGoalDifference > 0 && "+"}
                    {rivalry.avgGoalDifference.toFixed(1)}
                  </Typography>
                </Box>

                <Box textAlign="right">
                  <Typography variant="body2" color="textSecondary">
                    Win Rate
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: theme.palette.error.main }}
                  >
                    {player2Percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              {/* Biggest Wins */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Biggest Win
                  </Typography>
                  {rivalry.player1BiggestWin ? (
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          color: getPlayerColor(rivalry.player1),
                        }}
                      >
                        {rivalry.player1BiggestWin.score}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        (+{rivalry.player1BiggestWin.goalDifference} GD)
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No wins yet
                    </Typography>
                  )}
                </Box>

                <Box flex={1} textAlign="right">
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Biggest Win
                  </Typography>
                  {rivalry.player2BiggestWin ? (
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          color: getPlayerColor(rivalry.player2),
                        }}
                      >
                        {rivalry.player2BiggestWin.score}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        (+{rivalry.player2BiggestWin.goalDifference} GD)
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No wins yet
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RivalriesChart;
