// Consistent player colors across the entire app
const PLAYER_COLORS = [
  '#10b981', // emerald-500 (green)
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#a855f7', // purple-500
  '#0ea5e9', // sky-500
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