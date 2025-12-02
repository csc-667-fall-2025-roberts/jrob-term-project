import { Game, GameState } from "@shared/types";

import db from "../connection";
import {
  CREATE_GAME,
  GAME_BY_ID,
  GAMES_BY_USER,
  GET_PLAYER_IDS,
  GET_PLAYERS_WITH_STATS,
  JOIN_GAME,
  LIST_GAMES,
  SET_PLAYER_POSITION,
  START_GAME,
} from "./sql";

const create = async (user_id: number, name?: string, maxPlayers: number = 4) =>
  await db.one<Game>(CREATE_GAME, [user_id, name, maxPlayers]);

const join = async (game_id: number, user_id: number) =>
  await db.none(JOIN_GAME, [game_id, user_id]);

const list = async (state: GameState = GameState.LOBBY, limit: number = 50) =>
  await db.manyOrNone<Game>(LIST_GAMES, [state, limit]);

const getByUser = async (user_id: number) => await db.manyOrNone<Game>(GAMES_BY_USER, [user_id]);

const get = async (game_id: number) => await db.one<Game>(GAME_BY_ID, [game_id]);

// Start game functions
const getPlayerIds = async (gameId: number): Promise<number[]> => {
  const rows = await db.manyOrNone<{ user_id: number }>(GET_PLAYER_IDS, [gameId]);
  return rows.map((r) => r.user_id);
};

const setPlayerPosition = async (gameId: number, userId: number, position: number) =>
  await db.none(SET_PLAYER_POSITION, [gameId, userId, position]);

const start = async (gameId: number, firstPlayerId: number) =>
  await db.none(START_GAME, [gameId, firstPlayerId]);

// Player stats type and query
export type PlayerWithStats = {
  user_id: number;
  username: string;
  email: string;
  position?: number;
  card_count: number;
  book_count: number;
};

const getPlayersWithStats = async (gameId: number): Promise<PlayerWithStats[]> => {
  const rows = await db.manyOrNone<PlayerWithStats & { card_count: string; book_count: string }>(
    GET_PLAYERS_WITH_STATS,
    [gameId],
  );
  return rows.map((r) => ({
    ...r,
    card_count: parseInt(r.card_count as unknown as string),
    book_count: parseInt(r.book_count as unknown as string),
  }));
};

export { create, get, getByUser, getPlayerIds, getPlayersWithStats, join, list, setPlayerPosition, start };
