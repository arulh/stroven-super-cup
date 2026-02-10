export interface EloResult {
  newRating1: number;
  newRating2: number;
  change1: number;
  change2: number;
}

export function calculateElo(
  player1Rating: number,
  player2Rating: number,
  score1: number,
  score2: number,
  k: number = 32
): EloResult {
  // Calculate expected scores
  const expected1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));
  const expected2 = 1 - expected1;

  // Compute actual score result
  let actual1: number;
  let actual2: number;
  if (score1 === score2) {
    actual1 = 0.5;
    actual2 = 0.5;
  } else {
    actual1 = score1 > score2 ? 1.0 : 0.0;
    actual2 = 1.0 - actual1;
  }

  // Score margin adjustment factor (diminishing returns)
  const margin = Math.abs(score1 - score2);
  const multiplier = Math.sqrt(margin + 1);

  // Update ratings
  const newRating1 = player1Rating + k * multiplier * (actual1 - expected1);
  const newRating2 = player2Rating + k * multiplier * (actual2 - expected2);

  return {
    newRating1,
    newRating2,
    change1: newRating1 - player1Rating,
    change2: newRating2 - player2Rating,
  };
}
