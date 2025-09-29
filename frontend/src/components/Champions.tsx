import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

interface Champion {
  name: string;
  wins: number;
  color: string;
}

const Champions: React.FC = () => {
  const theme = useTheme();

  const champions: Champion[] = [
    { name: 'Niko', wins: 4, color: '#ffd700' },
    { name: 'Joel', wins: 1, color: '#c0c0c0' },
    { name: 'Arul', wins: 1, color: '#cd7f32' },
  ];

  const sortedChampions = [...champions].sort((a, b) => b.wins - a.wins);

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <EmojiEvents sx={{ mr: 2, fontSize: '2rem', color: '#ffd700' }} />
          <Typography variant="h4" component="h3">
            Stroven Super Cup Champions
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {sortedChampions.map((champion, index) => (
            <Box
              key={champion.name}
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                border: `1px solid ${champion.color}40`,
                backgroundColor: `${champion.color}08`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Trophy Icon */}
              <Box
                sx={{
                  fontSize: index === 0 ? '2.5rem' : '1.75rem',
                  mb: 0.5,
                }}
              >
                <EmojiEvents
                  sx={{
                    color: champion.color,
                    filter: `drop-shadow(0 2px 4px ${champion.color}40)`,
                  }}
                  fontSize="inherit"
                />
              </Box>

              {/* Rank Badge */}
              {index === 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: champion.color,
                    color: '#0f172a',
                    px: 1,
                    py: 0.5,
                    borderBottomLeftRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  LEADER
                </Box>
              )}

              {/* Champion Name */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  color: theme.palette.text.primary,
                }}
              >
                {champion.name}
              </Typography>

              {/* Win Count */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: champion.color,
                  mb: 0.25,
                }}
              >
                {champion.wins}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.75rem',
                }}
              >
                {champion.wins === 1 ? 'Championship' : 'Championships'}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Trophy Progress Bar */}
        <Box mt={3}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Championship Distribution
          </Typography>
          <Box
            sx={{
              display: 'flex',
              height: 8,
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
            }}
          >
            {sortedChampions.map((champion) => (
              <Box
                key={champion.name}
                sx={{
                  flex: champion.wins,
                  backgroundColor: champion.color,
                  opacity: 0.8,
                }}
              />
            ))}
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 1,
            }}
          >
            {sortedChampions.map((champion) => (
              <Typography
                key={champion.name}
                variant="caption"
                sx={{
                  color: champion.color,
                  fontWeight: 500,
                }}
              >
                {champion.name}: {Math.round((champion.wins / 6) * 100)}%
              </Typography>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Champions;