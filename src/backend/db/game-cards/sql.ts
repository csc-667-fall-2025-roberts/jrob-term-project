// Create shuffled deck - ROW_NUMBER() OVER (ORDER BY RANDOM()) assigns random positions
export const CREATE_DECK = `
INSERT INTO game_cards (game_id, card_id, owner_id, position)
SELECT $1, id, 0, ROW_NUMBER() OVER (ORDER BY RANDOM())
FROM cards
`;

// Fetch N cards from deck (for dealing)
export const GET_CARDS_FROM_DECK = `
SELECT id FROM game_cards
WHERE game_id = $1 AND owner_id = 0
ORDER BY position
LIMIT $2
`;

// Assign cards to a player - ANY($1) accepts array of IDs
export const DEAL_CARDS = `
UPDATE game_cards SET owner_id = $2, position = NULL
WHERE id = ANY($1)
`;

/** NEW: Get player's cards with rank/suit (joins cards reference table) */
export const GET_CARDS_BY_OWNER = `
SELECT gc.id, gc.game_id, gc.card_id, gc.owner_id, c.rank, c.suit
FROM game_cards gc
JOIN cards c ON gc.card_id = c.id
WHERE gc.game_id = $1 AND gc.owner_id = $2
ORDER BY c.sort_order
`;
/** END NEW */
