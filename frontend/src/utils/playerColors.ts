// Consistent player colors across the entire app
const PLAYER_COLORS = [
  '#ef4444', // red
  '#10b981', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#a855f7', // purple
  '#0ea5e9', // sky
];

// Cache for consistent color assignment
const playerColorCache: { [key: string]: string } = {};
let nextColorIndex = 0;

export const getPlayerColor = (handle: string): string => {
  // Return cached color if exists
  if (playerColorCache[handle]) {
    return playerColorCache[handle];
  }

  // Assign new color
  const color = PLAYER_COLORS[nextColorIndex % PLAYER_COLORS.length];
  playerColorCache[handle] = color;
  nextColorIndex++;

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

// Reset color cache (useful for testing or reinitialization)
export const resetPlayerColors = () => {
  Object.keys(playerColorCache).forEach(key => delete playerColorCache[key]);
  nextColorIndex = 0;
};