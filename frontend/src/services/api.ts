import { Player, Match, PlayerDetail } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const fetchLeaderboard = async (): Promise<Player[]> => {
  try {
    const response = await fetch(`${API_URL}/api/leaderboard`);
    const data = await response.json();
    return data.players;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

export const fetchPlayers = async (): Promise<Player[]> => {
  try {
    const response = await fetch(`${API_URL}/api/players`);
    const data = await response.json();
    return data.players;
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
};

export const fetchPlayerDetail = async (handle: string): Promise<PlayerDetail | null> => {
  try {
    const response = await fetch(`${API_URL}/api/player/${handle}`);
    const data = await response.json();
    return {
      ...data.player,
      recent: data.recent,
    };
  } catch (error) {
    console.error('Error fetching player detail:', error);
    return null;
  }
};

export const fetchAllMatches = async (): Promise<Match[]> => {
  // Since there's no direct matches endpoint, we'll fetch from all players
  try {
    const players = await fetchPlayers();
    const allMatches: Match[] = [];

    for (const player of players) {
      const detail = await fetchPlayerDetail(player.handle);
      if (detail && detail.recent) {
        allMatches.push(...detail.recent);
      }
    }

    // Remove duplicates and sort by date
    const uniqueMatches = Array.from(
      new Map(allMatches.map(m => [`${m.played_at}-${m.p1}-${m.p2}-${m.score}`, m])).values()
    );

    return uniqueMatches.sort((a, b) =>
      new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};