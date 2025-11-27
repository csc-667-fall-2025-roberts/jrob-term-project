/**
 * Shared types for game frontend modules
 */

export interface Card {
  rank: string;
  suit: string;
}

export interface Player {
  user_id: number;
  username: string;
  card_count: number;
  book_count: number;
}

export interface Book {
  rank: string;
  user_id: number;
  username: string;
}

export interface GameStateUpdate {
  deckCount: number;
  players: Player[];
  myCards: Card[];
  allBooks: Book[];
  isMyTurn: boolean;
  currentTurnUserId: number | null;
}
