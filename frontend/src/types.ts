export interface Player {
  handle: string;
  name: string;
  elo: number;
  played: number;
  wins: number;
  losses: number;
  win_pct: number;
  profilePhoto?: string;
  description?: string;
  currentStreak?: number;
  bestStreak?: number;
  worstStreak?: number;
}

export interface Match {
  id: number;
  played_at: string;
  p1: string;
  p2: string;
  score: string;
  p1_score: number;
  p2_score: number;
}

export interface PlayerDetail extends Player {
  recent: Match[];
}

export interface Rivalry {
  player1: string;
  player2: string;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  totalMatches: number;
  avgGoalDifference: number;
}

export interface StreakData {
  player: string;
  currentStreak: number;
  streakType: 'win' | 'loss' | 'draw';
  bestWinStreak: number;
  worstLossStreak: number;
}

export interface FormData {
  player: string;
  last5Matches: ('W' | 'L' | 'D')[];
  form: number; // percentage
}