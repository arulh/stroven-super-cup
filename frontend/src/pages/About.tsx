import React from "react";
import { Container, Box, Typography, Card, CardContent } from "@mui/material";
import Navigation from "../components/Navigation";
import { EmojiEvents, Sports, TrendingUp } from "@mui/icons-material";

function About() {
  return (
    <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: 4 }}>
      <Navigation />

      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
            fontWeight: 900,
            background:
              "linear-gradient(135deg, #6594C0 0%, #3562A6 50%, #6594C0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.02em",
          }}
        >
          ABOUT THE CUP
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.7, mt: 2 }}>
          The ultimate FIFA championship experience
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 600, color: "#6594C0" }}
            >
              What is the Stroven Super Cup?
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ opacity: 0.9, lineHeight: 1.8 }}
            >
              The Stroven Super Cup is an elite international FIFA tournament
              where the best players compete for glory and eternal fame. Each
              tournament consists of a group-stage with round-robin matches
              followed by knockout rounds and a final as well as a game for 3rd
              place.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
              The winner of the Stroven Super Cup is crowned the reigning SSC
              Champion.
            </Typography>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
            mb: 4,
          }}
        >
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <EmojiEvents sx={{ fontSize: 48, color: "#6594C0", mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Championships
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Invitational tournaments are hosted with typically 4 teams but
                exceptional bigger tournaments are seen more often as we
                progress.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Sports sx={{ fontSize: 48, color: "#6594C0", mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Competitors
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                7+ elite players have already thrown their hat into the ring to
                have an attempt at glory.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Only 3 winners have ever held the honor of being a SSC Champion.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <TrendingUp sx={{ fontSize: 48, color: "#6594C0", mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                ELO Tracking
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Every single match is recorded for ELO calculations. The highest
                elo ever has been recorded by Niko, during the biggest ever SSC
                competition on October 3rd, 2025.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 600, color: "#6594C0" }}
            >
              The Journey
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
              From humble beginnings to legendary status, the Stroven Super Cup
              has evolved into the premier FIFA competition. Across the years,
              we have hosted computer scientists, physiscists, statisticians, as
              well as flying in competitors from Europe and the USA to compete.
              We are incredibly excited to see new records set and competitors
              being crowned as we move into the next SSC tournaments.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default About;
