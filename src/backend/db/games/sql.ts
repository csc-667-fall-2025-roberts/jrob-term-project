export const CREATE_GAME = `
INSERT INTO games (created_by, name, max_players)
VALUE ($1, $2, $3)
RETURNING *
`;

export const JOIN_GAME = `
INSERT INTO game_players (game_id, user_id)
VALUES ($1, $2)
`;

export const LIST_GAMES = `
  SELECT
    g.*,                                      -- All columns from games table
    COUNT(gp.id) AS player_count,             -- Count how many players in this game
    -- Build a JSON array of players for this game
    COALESCE(                                 -- COALESCE returns first non-null value
      json_agg(                               -- json_agg aggregates rows into JSON array
        json_build_object(                    -- json_build_object creates JSON object
          'user_id', gp.user_id,
          'username', u.username
        )
      ) FILTER (WHERE gp.id IS NOT NULL),    -- FILTER excludes rows where condition is false
      '[]'                                   -- Default to empty array if no players
    ) AS players
  FROM games g
  LEFT JOIN game_players gp ON g.id = gp.game_id  -- LEFT JOIN includes games with 0 players
  LEFT JOIN users u ON gp.user_id = u.id          -- Get username for each player
  WHERE g.state = $1                              -- Only games in specified state (e.g., 'lobby')
  GROUP BY g.id                                   -- Group rows by game (needed because of COUNT and json_agg)
  ORDER BY g.created_at DESC                      -- Newest games first
  LIMIT $2
`;

export const GAMES_BY_USER = `
SELECT game_id FROM game_players
WHERE user_id=$1
`;
