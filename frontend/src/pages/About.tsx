import React from 'react';
import { Container, Box, Typography, Card, CardContent } from '@mui/material';
import Navigation from '../components/Navigation';
import { EmojiEvents, Sports, TrendingUp } from '@mui/icons-material';

function About() {
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
          ABOUT THE CUP
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.7, mt: 2 }}>
          The ultimate FIFA championship experience
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#6594C0' }}>
              What is the Stroven Super Cup?
            </Typography>
            <Typography variant="body1" paragraph sx={{ opacity: 0.9, lineHeight: 1.8 }}>
              The Stroven Super Cup is an elite FIFA tournament where the best players compete for glory,
              bragging rights, and eternal fame. Each match is a battle of skill, strategy, and sheer determination.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
              With an advanced ELO rating system tracking every victory and defeat, competitors rise and fall
              through the ranks in pursuit of championship gold.
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <EmojiEvents sx={{ fontSize: 48, color: '#6594C0', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Championships
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                7 tournaments completed with fierce competition
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Sports sx={{ fontSize: 48, color: '#6594C0', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Competitors
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                3 elite players battling for supremacy
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <TrendingUp sx={{ fontSize: 48, color: '#6594C0', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                ELO Tracking
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Advanced analytics tracking every match
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#6594C0' }}>
              The Journey
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
              From humble beginnings to legendary status, the Stroven Super Cup has evolved into
              the premier FIFA competition. Each season brings new rivalries, spectacular goals,
              and unforgettable moments. The data tells the story, but the glory lives forever.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default About;
