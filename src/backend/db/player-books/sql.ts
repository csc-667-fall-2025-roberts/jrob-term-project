// Player books queries
export const GET_BOOKS_BY_GAME = `
SELECT pb.*, u.username
FROM player_books pb
JOIN users u ON pb.user_id = u.id
WHERE pb.game_id = $1
ORDER BY pb.created_at
`;

export const CREATE_BOOK = `
INSERT INTO player_books (game_id, user_id, rank)
VALUES ($1, $2, $3)
RETURNING *
`;
