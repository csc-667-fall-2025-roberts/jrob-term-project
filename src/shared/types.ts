export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

export interface SecureUser extends User {
  password: string;
}

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
};

export type GamePlayer = {
  id: number;
  game_id: number;
  user_id: number;
};
