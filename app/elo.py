def update_elo(player1_rating, player2_rating, score1, score2, k=32):
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