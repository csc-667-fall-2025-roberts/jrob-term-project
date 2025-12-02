/** NEW: Player books module */
import db from "../connection";
import { CREATE_BOOK, GET_BOOKS_BY_GAME } from "./sql";

export type PlayerBook = {
  id: number;
  game_id: number;
  user_id: number;
  rank: string;
  username: string;
  created_at: Date;
};

export const getByGame = async (gameId: number) =>
  await db.manyOrNone<PlayerBook>(GET_BOOKS_BY_GAME, [gameId]);

export const create = async (gameId: number, userId: number, rank: string) =>
  await db.one<PlayerBook>(CREATE_BOOK, [gameId, userId, rank]);
/** END NEW */
