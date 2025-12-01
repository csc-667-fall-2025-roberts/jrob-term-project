// ============ User Types ============
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

export interface SecureUser extends User {
  password: string;
}

// ============ Chat Types ============
export interface DbChatMessage {
  id: number;
  user_id: number;
  message: string;
  created_at: Date;
}

export interface ChatMessage extends DbChatMessage {
  username: string;
  email: string;
}

// ============ Game Types ============
export enum GameState {
  LOBBY = "lobby",
  ACTIVE = "active",
  COMPLETED = "completed",
}

export type Game = {
  id: number;
  name?: string;
  created_by: number;
  state: GameState;
  max_players: number;
  created_at: Date;
  current_turn_user_id?: number;
  player_count?: number;
  players?: GamePlayer[];
};

export type GamePlayer = {
  user_id: number;
  username: string;
  email: string;
};
