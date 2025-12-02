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

// Start game queries
export const GET_PLAYER_IDS = `
SELECT user_id FROM game_players WHERE game_id = $1
`;

export const SET_PLAYER_POSITION = `
UPDATE game_players SET position = $3
WHERE game_id = $1 AND user_id = $2
`;

export const START_GAME = `
UPDATE games SET state = 'active', current_turn_user_id = $2
WHERE id = $1
`;

/** NEW: Get players with stats - COUNT(DISTINCT) prevents double-counting from JOINs */
export const GET_PLAYERS_WITH_STATS = `
SELECT
  u.id as user_id, u.username, u.email, gp.position,
  COUNT(DISTINCT gc.id) as card_count,
  COUNT(DISTINCT pb.id) as book_count
FROM game_players gp
JOIN users u ON gp.user_id = u.id
LEFT JOIN game_cards gc ON gc.game_id = gp.game_id AND gc.owner_id = u.id
LEFT JOIN player_books pb ON pb.game_id = gp.game_id AND pb.user_id = u.id
WHERE gp.game_id = $1
GROUP BY u.id, u.username, u.email, gp.position
ORDER BY gp.position NULLS LAST
`;
/** END NEW */
