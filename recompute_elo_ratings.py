#!/usr/bin/env python3
"""
Recalculate all ELO ratings from scratch based on match history.
Run this after modifying matches or players in the database.
"""

import sqlite3
from datetime import datetime

DB_PATH = "./data/rpi_09182025.sqlite"
ELO_K = 32  # K-factor for ELO calculation
INITIAL_ELO = 1000.0

def calculate_expected_score(rating_a, rating_b):
    """Calculate expected score for player A against player B."""
    return 1.0 / (1.0 + 10 ** ((rating_b - rating_a) / 400.0))

def update_elo(elo_a, elo_b, score_a, score_b, k=ELO_K):
    """
    Update ELO ratings based on match result with score margin adjustment.
    Returns (new_elo_a, new_elo_b)
    """
    expected_a = calculate_expected_score(elo_a, elo_b)
    expected_b = 1.0 - expected_a

    # Actual score (1 for win, 0.5 for draw, 0 for loss)
    if score_a > score_b:
        actual_a = 1.0
        actual_b = 0.0
    elif score_a < score_b:
        actual_a = 0.0
        actual_b = 1.0
    else:
        actual_a = 0.5
        actual_b = 0.5

    # Score margin adjustment factor (diminishing returns)
    margin = abs(score_a - score_b)
    multiplier = (margin + 1) ** 0.5  # square-root scale to moderate impact

    new_elo_a = elo_a + k * multiplier * (actual_a - expected_a)
    new_elo_b = elo_b + k * multiplier * (actual_b - expected_b)

    return new_elo_a, new_elo_b

def recalculate_all_ratings():
    """Recalculate all ELO ratings from scratch."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("🔄 Recalculating all ELO ratings from scratch...")

    # Step 1: Clear old rating history
    print("\n1️⃣ Clearing old rating history...")
    cursor.execute("DELETE FROM rating_history")
    deleted_history = cursor.rowcount
    print(f"   Deleted {deleted_history} old rating history entries")

    # Step 2: Reset all player stats
    print("\n2️⃣ Resetting all player stats to initial values...")
    cursor.execute("""
        UPDATE players
        SET current_elo = ?,
            matches_played = 0,
            wins = 0,
            losses = 0
    """, (INITIAL_ELO,))
    reset_players = cursor.rowcount
    print(f"   Reset {reset_players} players to ELO {INITIAL_ELO}")

    # Step 3: Get all players
    cursor.execute("SELECT id, handle FROM players")
    players = {row['id']: {'handle': row['handle'], 'elo': INITIAL_ELO} for row in cursor.fetchall()}
    player_stats = {pid: {'played': 0, 'wins': 0, 'losses': 0} for pid in players.keys()}

    print(f"   Found {len(players)} players: {', '.join([p['handle'] for p in players.values()])}")

    # Step 4: Get all matches in chronological order
    print("\n3️⃣ Replaying all matches in chronological order...")
    cursor.execute("""
        SELECT id, p1_id, p2_id, p1_score, p2_score, played_at
        FROM matches
        ORDER BY played_at ASC, id ASC
    """)
    matches = cursor.fetchall()

    print(f"   Processing {len(matches)} matches...")

    processed = 0
    for match in matches:
        match_id = match['id']
        p1_id = match['p1_id']
        p2_id = match['p2_id']
        p1_score = match['p1_score']
        p2_score = match['p2_score']

        # Skip if players don't exist (shouldn't happen after cleanup)
        if p1_id not in players or p2_id not in players:
            print(f"   ⚠️  Warning: Match {match_id} references non-existent players, skipping")
            continue

        # Get current ELOs
        p1_elo = players[p1_id]['elo']
        p2_elo = players[p2_id]['elo']

        # Calculate new ELOs
        new_p1_elo, new_p2_elo = update_elo(p1_elo, p2_elo, p1_score, p2_score)

        # Insert rating history
        cursor.execute("""
            INSERT INTO rating_history (player_id, match_id, pre_elo, post_elo)
            VALUES (?, ?, ?, ?)
        """, (p1_id, match_id, p1_elo, new_p1_elo))

        cursor.execute("""
            INSERT INTO rating_history (player_id, match_id, pre_elo, post_elo)
            VALUES (?, ?, ?, ?)
        """, (p2_id, match_id, p2_elo, new_p2_elo))

        # Update player ELOs in memory
        players[p1_id]['elo'] = new_p1_elo
        players[p2_id]['elo'] = new_p2_elo

        # Update player stats
        player_stats[p1_id]['played'] += 1
        player_stats[p2_id]['played'] += 1

        if p1_score > p2_score:
            player_stats[p1_id]['wins'] += 1
            player_stats[p2_id]['losses'] += 1
        elif p2_score > p1_score:
            player_stats[p2_id]['wins'] += 1
            player_stats[p1_id]['losses'] += 1
        # Draws don't count as wins or losses

        processed += 1
        if processed % 50 == 0:
            print(f"   Processed {processed}/{len(matches)} matches...")

    print(f"   ✅ Processed {processed} matches")

    # Step 5: Update player final stats
    print("\n4️⃣ Updating player final stats...")
    for player_id, stats in player_stats.items():
        cursor.execute("""
            UPDATE players
            SET current_elo = ?,
                matches_played = ?,
                wins = ?,
                losses = ?
            WHERE id = ?
        """, (
            players[player_id]['elo'],
            stats['played'],
            stats['wins'],
            stats['losses'],
            player_id
        ))

    # Step 6: Display results
    print("\n5️⃣ Final player standings:")
    cursor.execute("""
        SELECT handle, current_elo, matches_played, wins, losses
        FROM players
        ORDER BY current_elo DESC
    """)

    print(f"\n{'Player':<15} {'ELO':<10} {'Played':<8} {'W-L':<10}")
    print("-" * 50)
    for row in cursor.fetchall():
        handle = row['handle']
        elo = row['current_elo']
        played = row['matches_played']
        wins = row['wins']
        losses = row['losses']
        print(f"{handle:<15} {elo:<10.1f} {played:<8} {wins}-{losses}")

    # Commit changes
    conn.commit()
    conn.close()

    print("\n✅ Rating recalculation complete!")
    print(f"   - Created {processed * 2} new rating history entries")
    print(f"   - Updated stats for {len(players)} players")
    print("\n⚠️  Remember to restart Docker: docker compose restart")

if __name__ == "__main__":
    recalculate_all_ratings()
