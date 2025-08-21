def expected_score(r_a: float, r_b: float) -> float:
    return 1.0 / (1.0 + 10 ** ((r_b - r_a) / 400.0))

def result_from_scores(s1: int, s2: int) -> float:
    if s1 > s2:
        return 1.0
    if s1 < s2:
        return 0.0
    return 0.5  # draw

def update_elo(r_a: float, r_b: float, s1: int, s2: int, k: float = 32.0):
    ea = expected_score(r_a, r_b)
    ra = result_from_scores(s1, s2)
    rb = 1.0 - ra
    new_a = r_a + k * (ra - ea)
    new_b = r_b + k * (rb - (1.0 - ea))
    return new_a, new_b