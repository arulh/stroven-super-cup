import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Card, CardContent, Avatar, Chip } from '@mui/material';
import Navigation from '../components/Navigation';
import { EmojiEvents, SportsEsports } from '@mui/icons-material';
import { fetchPlayers } from '../services/api';
import { Player } from '../types';
import { getPlayerImage, getPlayerData } from '../utils/playerImages';
import { getPlayerColor } from '../utils/playerColors';

interface EnhancedCompetitor extends Player {
  imagePath: string;
  description: string;
  sscWins: number;
  height: string;
  nationality: string;
  playingStyle: string;
  color: string;
}

function Competitors() {
  const [competitors, setCompetitors] = useState<EnhancedCompetitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompetitors = async () => {
      try {
        const players = await fetchPlayers();

        const enhanced = players.map(player => {
          const playerData = getPlayerData(player.handle);
          return {
            ...player,
            imagePath: getPlayerImage(player.handle),
            description: playerData?.description || 'Stroven Super Cup competitor',
            sscWins: playerData?.sscWins || 0,
            height: playerData?.height || 'N/A',
            nationality: playerData?.nationality || '🌍',
            playingStyle: playerData?.playingStyle || 'Adaptive',
            color: getPlayerColor(player.handle),
          };
        });

        setCompetitors(enhanced);
      } catch (error) {
        console.error('Error loading competitors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompetitors();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
      <Navigation />

      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
            fontWeight: 900,
            background: 'linear-gradient(135deg, #6594C0 0%, #3562A6 50%, #6594C0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.02em',
          }}
        >
          COMPETITORS
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.7, mt: 2 }}>
          Meet the warriors of the Stroven Super Cup
        </Typography>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box textAlign="center" py={8}>
          <Typography>Loading competitors...</Typography>
        </Box>
      )}

      {/* Competitors Grid */}
      {!loading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {competitors.map((competitor) => (
            <Box key={competitor.handle}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(14, 30, 91, 0.6)',
                  border: `2px solid ${competitor.color}40`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    border: `2px solid ${competitor.color}`,
                    boxShadow: `0 10px 40px ${competitor.color}40`,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  {/* Player Image */}
                  <Avatar
                    src={competitor.imagePath}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 3,
                      border: `4px solid ${competitor.color}40`,
                    }}
                  />

                  {/* Name */}
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: competitor.color,
                      mb: 1,
                    }}
                  >
                    {competitor.handle}
                  </Typography>

                  {/* Nationality & Height */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {competitor.nationality}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {competitor.height}
                    </Typography>
                  </Box>

                  {/* Championships */}
                  {competitor.sscWins > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                      <EmojiEvents sx={{ color: competitor.color, fontSize: '1.2rem' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {competitor.sscWins} SSC {competitor.sscWins === 1 ? 'Win' : 'Wins'}
                      </Typography>
                    </Box>
                  )}

                  {/* Playing Style */}
                  <Chip
                    icon={<SportsEsports />}
                    label={competitor.playingStyle}
                    size="small"
                    sx={{
                      backgroundColor: `${competitor.color}20`,
                      color: competitor.color,
                      fontWeight: 600,
                      mb: 2,
                    }}
                  />

                  {/* Description */}
                  <Typography variant="body2" sx={{ mt: 2, opacity: 0.7, fontStyle: 'italic' }}>
                    {competitor.description}
                  </Typography>

                  {/* Stats Summary */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3, pt: 2, borderTop: `1px solid ${competitor.color}20` }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: competitor.color }}>{competitor.wins}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>Wins</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ color: competitor.color }}>{competitor.losses}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>Losses</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ color: competitor.color }}>{Math.round(competitor.elo)}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>ELO</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default Competitors;
