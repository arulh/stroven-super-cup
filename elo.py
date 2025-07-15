from tabulate import tabulate


def compute_elo(player1_rating, player2_rating, score1, score2, k=32):
    """
    Computes new Elo ratings based on a score-adjusted match outcome.

    Args:
        player1_rating (float): Elo of player 1 before match.
        player2_rating (float): Elo of player 2 before match.
        score1 (int): Points scored by player 1.
        score2 (int): Points scored by player 2.
        k (float): K-factor (adjusts magnitude of rating changes).

    Returns:
        (new_rating1, new_rating2): Tuple of updated Elo ratings.
    """

    # Calculate expected scores
    expected1 = 1 / (1 + 10 ** ((player2_rating - player1_rating) / 400))
    expected2 = 1 - expected1

    # Compute actual score result
    if score1 == score2:
        actual1 = actual2 = 0.5
    else:
        actual1 = 1.0 if score1 > score2 else 0.0
        actual2 = 1.0 - actual1

    # Score margin adjustment factor (diminishing returns)
    margin = abs(score1 - score2)
    multiplier = (margin + 1) ** 0.5  # square-root scale to moderate impact

    # Update ratings
    new_rating1 = player1_rating + k * multiplier * (actual1 - expected1)
    new_rating2 = player2_rating + k * multiplier * (actual2 - expected2)

    return new_rating1,new_rating2


if __name__ == "__main__":
	elo_rating = {"arul": 1000, "daniel": 1000, "joel": 1000, "niko": 1000}
	games = [
			(("niko", "daniel"), (6, 2)),
			(("arul", "joel"), (5, 3)),
			(("niko", "joel"), (5, 2)),
			(("arul", "daniel"), (2, 0)),
			(("joel", "daniel"), (8, 5)),
			(("arul", "niko"), (3, 5)),
			(("joel", "niko"), (6, 5)),
			(("arul", "daniel"), (4, 0)),
			(("arul", "joel"), (3, 2)),
			(("niko", "daniel"), (2, 3)),
			(("arul", "niko"), (5, 4)),
			(("joel", "daniel"), (5, 2)),
			(("joel", "niko"), (4, 3)),
			(("arul", "daniel"), (3, 2)),
			(("niko", "daniel"), (5, 2)),
			(("arul", "joel"), (4, 1)),
            (("niko", "daniel"), (1, 2)),
            (("arul", "joel"), (6, 2)),
            (("niko", "daniel"), (3, 0)),
            (("arul", "daniel"), (6, 1)),
            (("arul", "niko"), (6, 5)),
            (("joel", "daniel"), (1, 1)),
            (("arul", "daniel"), (2, 3)),
            (("joel", "niko"), (2, 8)),
            (("arul", "joel"), (5, 5)),
            (("niko", "daniel"), (5, 3)),
            (("arul", "niko"), (0, 11)),
            (("joel", "daniel"), (5, 0)),
            (("arul", "daniel"), (3, 2)),
            (("joel", "niko"), (3, 5)),
            (("arul", "niko"), (1, 7)),
            (("joel", "daniel"), (2, 3)),
            (("niko", "arul"), (6, 6)),
            (("niko", "arul"), (5, 3)),
            (("niko", "arul"), (1, 4)),
            (("niko", "arul"), (9, 4)),
            (("niko", "arul"), (7, 3)),
            (("niko", "arul"), (1, 3)),
            (("niko", "arul"), (9, 4)),
            (("niko", "arul"), (2, 3)),
            (("niko", "arul"), (7, 3)),
            (("niko", "arul"), (7, 8)),
            (("niko", "arul"), (0, 3)),
            (("niko", "arul"), (5, 7)),
            (("niko", "arul"), (2, 5)),
            (("niko", "arul"), (2, 7)),
            (("niko", "arul"), (3, 6)),
            (("niko", "arul"), (5, 5)),
            (("niko", "arul"), (1, 1)),
            (("niko", "arul"), (4, 3)),
            (("niko", "arul"), (3, 2)),
		]
	
	for game in games:
		(p1, p2), (p1_score, p2_score) = game
		elo_rating[p1], elo_rating[p2] = compute_elo(elo_rating[p1], elo_rating[p2], p1_score, p2_score)

	elo = list(zip(elo_rating.keys(), elo_rating.values()))
	print(tabulate(elo, headers=["player", "elo"], tablefmt="github"))
