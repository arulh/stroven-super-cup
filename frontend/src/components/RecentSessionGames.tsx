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
import { History } from "@mui/icons-material";
import { fetchAllMatches } from "../services/api";
import { getPlayerImage } from "../utils/playerImages";

interface SessionMatch {
  played_at: string;
  created_at: string;
  p1: string;
  p2: string;
  score: string;
  p1_score: number;
  p2_score: number;
  p1_pre_elo?: number;
  p1_post_elo?: number;
  p1_elo_change?: number;
  p2_pre_elo?: number;
  p2_post_elo?: number;
  p2_elo_change?: number;
}

const RecentSessionGames: React.FC = () => {
  const [sessionGames, setSessionGames] = useState<SessionMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const loadSessionGames = async () => {
      try {
        const allMatches = await fetchAllMatches();

        if (allMatches && allMatches.length > 0) {
          // Parse scores and convert to SessionMatch format
          // Also ensure UTC timestamps by adding 'Z' if not present
          const parsedMatches: SessionMatch[] = allMatches.map((match) => {
            const [p1Score, p2Score] = match.score.split("-").map(Number);
            const utcPlayedAt = match.played_at.endsWith('Z')
              ? match.played_at
              : match.played_at + 'Z';
            const utcCreatedAt = match.created_at
              ? (match.created_at.endsWith('Z') ? match.created_at : match.created_at + 'Z')
              : utcPlayedAt; // Fallback to played_at if created_at not available
            return {
              ...match,
              played_at: utcPlayedAt,
              created_at: utcCreatedAt,
              p1_score: p1Score,
              p2_score: p2Score,
              p1_pre_elo: match.p1_pre_elo,
              p1_post_elo: match.p1_post_elo,
              p1_elo_change: match.p1_elo_change,
              p2_pre_elo: match.p2_pre_elo,
              p2_post_elo: match.p2_post_elo,
              p2_elo_change: match.p2_elo_change,
            };
          });

          // Sort matches by created_at (most recent first)
          const sortedMatches = [...parsedMatches].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          // Get the most recent match based on created_at
          const mostRecentMatch = sortedMatches[0];
          const mostRecentTime = new Date(mostRecentMatch.created_at).getTime();

          // Filter matches within the last 12 hours of the most recent match (based on created_at)
          const twelveHoursInMs = 12 * 60 * 60 * 1000;
          const recentSession = sortedMatches.filter((match) => {
            const matchTime = new Date(match.created_at).getTime();
            return mostRecentTime - matchTime <= twelveHoursInMs;
          });

          setSessionGames(recentSession);
        }
      } catch (error) {
        console.error("Error loading session games:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSessionGames();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading recent session...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Don't show if no games
  if (sessionGames.length === 0) {
    return null;
  }

  // Format the date of the most recent session based on created_at (already has 'Z' from parsing)
  const sessionDate = new Date(sessionGames[0].created_at).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <History
            sx={{
              mr: 2,
              fontSize: "2rem",
              color: theme.palette.secondary.main,
            }}
          />
          <Box>
            <Typography variant="h4" component="h3">
              Recent Session Recap
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Last played: {sessionDate}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            maxHeight: isMobile ? 400 : 500,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme.palette.background.default,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.primary.main,
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          }}
        >
          {sessionGames.map((match, index) => {
            const p1IsWinner = match.p1_score > match.p2_score;
            const p2IsWinner = match.p2_score > match.p1_score;

            return (
              <Box
                key={index}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  mb: 2,
                  p: isMobile ? 2 : 3,
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: `0 4px 12px rgba(30, 64, 175, 0.15)`,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Player 1 Section */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? 1 : 2,
                      flex: 1,
                    }}
                  >
                    <Avatar
                      src={getPlayerImage(match.p1)}
                      sx={{
                        width: isMobile ? 40 : 50,
                        height: isMobile ? 40 : 50,
                      }}
                    />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography
                        variant={isMobile ? "body1" : "h6"}
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {match.p1.charAt(0).toUpperCase() + match.p1.slice(1)}
                      </Typography>
                      {match.p1_post_elo !== undefined && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.disabled,
                            fontSize: isMobile ? "0.65rem" : "0.75rem",
                          }}
                        >
                          {Math.round(match.p1_post_elo)} ELO
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* ELO Change P1 */}
                  {match.p1_elo_change !== undefined && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        mr: isMobile ? 1 : 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color:
                            match.p1_elo_change > 0
                              ? theme.palette.success.main
                              : match.p1_elo_change < 0
                              ? theme.palette.error.main
                              : theme.palette.text.secondary,
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                        }}
                      >
                        {match.p1_elo_change > 0 ? "+" : ""}
                        {Math.round(match.p1_elo_change)}
                      </Typography>
                    </Box>
                  )}

                  {/* Score Section */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? 0.5 : 1,
                      px: isMobile ? 1 : 2,
                    }}
                  >
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{
                        fontWeight: 700,
                        color: p1IsWinner
                          ? theme.palette.common.white
                          : theme.palette.error.main,
                        minWidth: isMobile ? 30 : 40,
                        textAlign: "center",
                      }}
                    >
                      {match.p1_score}
                    </Typography>
                    <Typography
                      variant={isMobile ? "body1" : "h5"}
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      -
                    </Typography>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{
                        fontWeight: 700,
                        color: p2IsWinner
                          ? theme.palette.common.white
                          : theme.palette.error.main,
                        minWidth: isMobile ? 30 : 40,
                        textAlign: "center",
                      }}
                    >
                      {match.p2_score}
                    </Typography>
                  </Box>

                  {/* ELO Change P2 */}
                  {match.p2_elo_change !== undefined && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        ml: isMobile ? 1 : 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color:
                            match.p2_elo_change > 0
                              ? theme.palette.success.main
                              : match.p2_elo_change < 0
                              ? theme.palette.error.main
                              : theme.palette.text.secondary,
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                        }}
                      >
                        {match.p2_elo_change > 0 ? "+" : ""}
                        {Math.round(match.p2_elo_change)}
                      </Typography>
                    </Box>
                  )}

                  {/* Player 2 Section */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? 1 : 2,
                      flex: 1,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        alignItems: "flex-end",
                      }}
                    >
                      <Typography
                        variant={isMobile ? "body1" : "h6"}
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {match.p2.charAt(0).toUpperCase() + match.p2.slice(1)}
                      </Typography>
                      {match.p2_post_elo !== undefined && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.disabled,
                            fontSize: isMobile ? "0.65rem" : "0.75rem",
                          }}
                        >
                          {Math.round(match.p2_post_elo)} ELO
                        </Typography>
                      )}
                    </Box>
                    <Avatar
                      src={getPlayerImage(match.p2)}
                      sx={{
                        width: isMobile ? 40 : 50,
                        height: isMobile ? 40 : 50,
                      }}
                    />
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

export default RecentSessionGames;
