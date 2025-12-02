// Game service - business logic layer (Routes → Services → DB)
import * as GameCards from "@backend/db/game-cards";
import * as Games from "@backend/db/games";

const CARDS_PER_PLAYER = 7;

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function startGame(gameId: number): Promise<{ firstPlayerId: number }> {
  // Get players and validate minimum count
  const playerIds = await Games.getPlayerIds(gameId);
  if (playerIds.length < 2) {
    throw new Error("At least 2 players are required to start the game");
  }

  // Create shuffled deck
  await GameCards.createDeck(gameId);

  // Shuffle players for turn order
  const shuffledPlayers = shuffle(playerIds);

  // Deal cards round-robin style
  const totalCards = CARDS_PER_PLAYER * shuffledPlayers.length;
  const deckCards = await GameCards.getCardsFromDeck(gameId, totalCards);

  for (let i = 0; i < shuffledPlayers.length; i++) {
    const playerId = shuffledPlayers[i];
    const playerCards = deckCards
      .slice(i * CARDS_PER_PLAYER, (i + 1) * CARDS_PER_PLAYER)
      .map((c) => c.id);
    await GameCards.dealCards(playerCards, playerId);
    await Games.setPlayerPosition(gameId, playerId, i + 1);
  }

  // Start game with first player's turn
  await Games.start(gameId, shuffledPlayers[0]);

  return { firstPlayerId: shuffledPlayers[0] };
}

/** NEW: Ask for cards - Go Fish game action */
export type AskResult = {
  success: boolean;
  cardsReceived: number;
  drewCard: boolean;
};

export async function askForCards(
  gameId: number,
  askerId: number,
  targetId: number,
  rank: string,
): Promise<AskResult> {
  // Check if target has cards of that rank
  const cardIds = await GameCards.getCardsByOwnerAndRank(gameId, targetId, rank);

  if (cardIds.length > 0) {
    // Transfer cards to asker
    await GameCards.transferCards(cardIds, askerId);
    return { success: true, cardsReceived: cardIds.length, drewCard: false };
  } else {
    // Go Fish - draw from deck
    const drawnId = await GameCards.drawCard(gameId, askerId);
    return { success: false, cardsReceived: 0, drewCard: drawnId !== null };
  }
}
/** END NEW */
