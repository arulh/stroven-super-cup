import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Calculate } from '@mui/icons-material';
import { fetchLeaderboard } from '../services/api';
import { Player } from '../types';
import { calculateElo, EloResult } from '../utils/eloCalculator';

const CUSTOM = '__custom__';

const EloCalculator: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [player1Handle, setPlayer1Handle] = useState<string>(CUSTOM);
  const [player2Handle, setPlayer2Handle] = useState<string>(CUSTOM);
  const [elo1, setElo1] = useState<string>('1000');
  const [elo2, setElo2] = useState<string>('1000');
  const [score1, setScore1] = useState<string>('');
  const [score2, setScore2] = useState<string>('');
  const [result, setResult] = useState<EloResult | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await fetchLeaderboard();
        setPlayers(data);
      } catch (error) {
        console.error('Error loading players:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, []);

  const handlePlayer1Change = (handle: string) => {
    setPlayer1Handle(handle);
    setResult(null);
    if (handle === CUSTOM) {
      setElo1('1000');
    } else {
      const player = players.find((p) => p.handle === handle);
      if (player) setElo1(String(Math.round(player.elo)));
    }
  };

  const handlePlayer2Change = (handle: string) => {
    setPlayer2Handle(handle);
    setResult(null);
    if (handle === CUSTOM) {
      setElo2('1000');
    } else {
      const player = players.find((p) => p.handle === handle);
      if (player) setElo2(String(Math.round(player.elo)));
    }
  };

  const isValid = () => {
    const e1 = Number(elo1);
    const e2 = Number(elo2);
    const s1 = Number(score1);
    const s2 = Number(score2);
    return (
      elo1 !== '' &&
      elo2 !== '' &&
      score1 !== '' &&
      score2 !== '' &&
      !isNaN(e1) &&
      !isNaN(e2) &&
      !isNaN(s1) &&
      !isNaN(s2) &&
      s1 >= 0 &&
      s2 >= 0 &&
      Number.isInteger(s1) &&
      Number.isInteger(s2)
    );
  };

  const handleCalculate = () => {
    if (!isValid()) return;
    const res = calculateElo(Number(elo1), Number(elo2), Number(score1), Number(score2));
    setResult(res);
  };

  const formatChange = (change: number) => {
    const rounded = Math.round(change * 10) / 10;
    return rounded > 0 ? `+${rounded}` : String(rounded);
  };

  const playerLabel = (handle: string) => {
    if (handle === CUSTOM) return 'Custom';
    return handle.charAt(0).toUpperCase() + handle.slice(1);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <Calculate
            sx={{
              mr: 2,
              fontSize: '2rem',
              color: theme.palette.secondary.main,
            }}
          />
          <Typography variant="h4" component="h3">
            ELO Calculator
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 3,
          }}
        >
          {/* Player 1 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Player 1
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Player</InputLabel>
              <Select
                value={player1Handle}
                label="Player"
                onChange={(e) => handlePlayer1Change(e.target.value)}
              >
                <MenuItem value={CUSTOM}>Custom</MenuItem>
                {players.map((p) => (
                  <MenuItem key={p.handle} value={p.handle}>
                    {playerLabel(p.handle)} ({Math.round(p.elo)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="ELO Rating"
              type="number"
              size="small"
              fullWidth
              value={elo1}
              onChange={(e) => setElo1(e.target.value)}
            />
            <TextField
              label="Score"
              type="number"
              size="small"
              fullWidth
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              inputProps={{ min: 0, step: 1 }}
            />
          </Box>

          {/* Player 2 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Player 2
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Player</InputLabel>
              <Select
                value={player2Handle}
                label="Player"
                onChange={(e) => handlePlayer2Change(e.target.value)}
              >
                <MenuItem value={CUSTOM}>Custom</MenuItem>
                {players.map((p) => (
                  <MenuItem key={p.handle} value={p.handle}>
                    {playerLabel(p.handle)} ({Math.round(p.elo)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="ELO Rating"
              type="number"
              size="small"
              fullWidth
              value={elo2}
              onChange={(e) => setElo2(e.target.value)}
            />
            <TextField
              label="Score"
              type="number"
              size="small"
              fullWidth
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              inputProps={{ min: 0, step: 1 }}
            />
          </Box>
        </Box>

        {/* Calculate Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleCalculate}
            disabled={!isValid() || loading}
            sx={{ px: 4, py: 1 }}
          >
            Calculate
          </Button>
        </Box>

        {/* Results */}
        {result && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 3,
            }}
          >
            {/* P1 Result */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                {playerLabel(player1Handle)}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {Math.round(result.newRating1)}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color:
                    result.change1 > 0
                      ? theme.palette.success.main
                      : result.change1 < 0
                      ? theme.palette.error.main
                      : theme.palette.text.secondary,
                }}
              >
                {formatChange(result.change1)}
              </Typography>
            </Box>

            {/* P2 Result */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                {playerLabel(player2Handle)}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {Math.round(result.newRating2)}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color:
                    result.change2 > 0
                      ? theme.palette.success.main
                      : result.change2 < 0
                      ? theme.palette.error.main
                      : theme.palette.text.secondary,
                }}
              >
                {formatChange(result.change2)}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EloCalculator;
