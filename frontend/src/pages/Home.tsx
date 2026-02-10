import React, { useState, useEffect } from "react";
import { Container, Box, Typography, Switch, FormControlLabel } from "@mui/material";
import Navigation from "../components/Navigation";
import Leaderboard from "../components/Leaderboard";
import Champions from "../components/Champions";
import RivalriesChart from "../components/RivalriesChart";
import StreakChart from "../components/StreakChart";
import FormChart from "../components/FormChart";
import RecentEloTrendChart from "../components/RecentEloTrendChart";
import RecentSessionGames from "../components/RecentSessionGames";
import EloTrendChart from "../components/EloTrendChart";
import PerformanceRadar from "../components/PerformanceRadar";
import EloCalculator from "../components/EloCalculator";
import introMessages from "../intro-messages.json";

function Home() {
  const [randomMessage, setRandomMessage] = useState("");
  const [showProvisional, setShowProvisional] = useState(false);

  useEffect(() => {
    const messages = introMessages.messages;
    const randomIndex = Math.floor(Math.random() * messages.length);
    setRandomMessage(messages[randomIndex]);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: 4 }}>
      <Navigation />

      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: "3rem", sm: "4rem", md: "5rem", lg: "6rem" },
            fontWeight: 900,
            background:
              "linear-gradient(135deg, #6594C0 0%, #3562A6 50%, #6594C0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 40px rgba(101, 148, 192, 0.4)",
            letterSpacing: "0.02em",
          }}
        >
          STROVEN SUPER CUP
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mt: 3,
            maxWidth: 700,
            mx: "auto",
            fontStyle: "italic",
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
            fontWeight: 500,
            letterSpacing: "0.05em",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            lineHeight: 1.6,
          }}
        >
          "{randomMessage}"
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Champions - Full Width */}
        <Box>
          <Champions />
        </Box>

        {/* Leaderboard - Full Width */}
        <Box>
          <Leaderboard />
        </Box>

        {/* Provisional Player Toggle */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={showProvisional}
                onChange={(e) => setShowProvisional(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Show provisional players (&lt;10 matches)
              </Typography>
            }
          />
        </Box>

        {/* Charts Grid - Full Width */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* All-Time ELO Trend Chart - Full width */}
          <EloTrendChart showProvisional={showProvisional} />

          {/* Recent ELO Trend Chart - Full width */}
          {/* <RecentEloTrendChart /> */}

          {/* Recent Session Games - Full width */}
          <RecentSessionGames />

          {/* Form Chart - Full width */}
          <FormChart showProvisional={showProvisional} />

          {/* Rivalries Chart - Full width */}
          <RivalriesChart showProvisional={showProvisional} />

          {/* Two column row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 4,
            }}
          >
            <PerformanceRadar showProvisional={showProvisional} />
            <StreakChart showProvisional={showProvisional} />
          </Box>

          {/* ELO Calculator */}
          <EloCalculator />
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
