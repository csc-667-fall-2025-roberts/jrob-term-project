export const CREATE_GAME = `
INSERT INTO games (created_by, name, max_players)
VALUES ($1, $2, $3)
RETURNING *
`;

export const JOIN_GAME = `
INSERT INTO game_players (game_id, user_id)
VALUES ($1, $2)
`;

export const LIST_GAMES = `
SELECT 
  g.*,
  COUNT(gp.id) AS player_count,
  COALESCE(
    json_agg(
      json_build_object(
        'user_id', gp.user_id,
        'username', u.username,
        'email', u.email
      )
    ) FILTER (WHERE gp.id IS NOT NULL),
    '[]'
  ) AS players
FROM games g
LEFT JOIN game_players gp ON g.id=gp.game_id
LEFT JOIN users u ON u.id=gp.user_id
WHERE g.state=$1
GROUP BY g.id
ORDER BY g.created_at DESC
LIMIT $2
`;

export const GAMES_BY_USER = `
SELECT games.* FROM game_players, games
WHERE game_players.game_id=games.id AND user_id=$1
`;

export const GAME_BY_ID = `
  SELECT * FROM games WHERE id=$1
`;
