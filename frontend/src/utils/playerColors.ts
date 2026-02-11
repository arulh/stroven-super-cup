import playerData from "../data/playerData.json";

// Fallback palette for players not in playerData.json
const FALLBACK_COLORS = [
  '#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#a855f7', '#0ea5e9',
];

// Build a case-insensitive lookup from playerData.json
const playerColorMap: { [handle: string]: string } = {};
for (const player of playerData.players) {
  if (player.color) {
    playerColorMap[player.handle.toLowerCase()] = player.color;
  }
}

// Track colors already taken so fallback picks don't collide
const usedColors = new Set(Object.values(playerColorMap));
const fallbackCache: { [handle: string]: string } = {};
let fallbackIndex = 0;

export const getPlayerColor = (handle: string): string => {
  const key = handle.toLowerCase();

  // Check playerData.json first
  if (playerColorMap[key]) {
    return playerColorMap[key];
  }

  // Return cached fallback if already assigned
  if (fallbackCache[key]) {
    return fallbackCache[key];
  }

  // Pick the next fallback color that isn't already used
  let color: string;
  do {
    color = FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
    fallbackIndex++;
  } while (usedColors.has(color) && fallbackIndex <= FALLBACK_COLORS.length * 2);

  usedColors.add(color);
  fallbackCache[key] = color;
  return color;
};

// Get all player colors for a list of players
export const getPlayerColors = (handles: string[]): { [key: string]: string } => {
  const colors: { [key: string]: string } = {};
  handles.forEach((handle) => {
    colors[handle] = getPlayerColor(handle);
  });
  return colors;
};
