import playerData from '../data/playerData.json';

export interface PlayerData {
  handle: string;
  imagePath: string;
  description: string;
  sscWins: number;
  height: string;
  nationality: string;
  playingStyle: string;
}

// Get player image path
export const getPlayerImage = (handle: string): string => {
  const player = playerData.players.find(
    p => p.handle.toLowerCase() === handle.toLowerCase()
  );

  return player?.imagePath || playerData.defaultImage;
};

// Get full player data
export const getPlayerData = (handle: string): PlayerData | undefined => {
  return playerData.players.find(
    p => p.handle.toLowerCase() === handle.toLowerCase()
  );
};

// Get all player data
export const getAllPlayerData = (): PlayerData[] => {
  return playerData.players;
};

// Get championship count
export const getChampionshipCount = (handle: string): number => {
  const player = getPlayerData(handle);
  return player?.sscWins || 0;
};
