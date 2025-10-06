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

export const fetchPlayerStats = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/api/player-stats`);
    const data = await response.json();
    return data.players;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return [];
  }
};

export const fetchRatingHistory = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/api/rating-history`);
    const data = await response.json();
    return data.history;
  } catch (error) {
    console.error('Error fetching rating history:', error);
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
  try {
    const response = await fetch(`${API_URL}/api/matches`);
    const data = await response.json();
    return data.matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};