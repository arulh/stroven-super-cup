SELECT MAX(rating_history.post_elo), players.name from rating_history
INNER JOIN players ON rating_history.player_id == players.id
GROUP BY players.name;