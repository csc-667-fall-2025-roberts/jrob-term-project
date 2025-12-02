import { GameCard } from "@shared/types";

import db from "../connection";
import {
  COUNT_BY_OWNER,
  CREATE_DECK,
  DEAL_CARDS,
  DRAW_CARD,
  GET_CARDS_BY_OWNER,
  GET_CARDS_BY_OWNER_AND_RANK,
  GET_CARDS_FROM_DECK,
  TRANSFER_CARDS,
} from "./sql";

export const createDeck = async (gameId: number) => await db.none(CREATE_DECK, [gameId]);

export const getCardsFromDeck = async (gameId: number, count: number) =>
  await db.manyOrNone<{ id: number }>(GET_CARDS_FROM_DECK, [gameId, count]);

export const dealCards = async (cardIds: number[], ownerId: number) =>
  await db.none(DEAL_CARDS, [cardIds, ownerId]);

export const getCardsByOwner = async (gameId: number, ownerId: number) =>
  await db.manyOrNone<GameCard>(GET_CARDS_BY_OWNER, [gameId, ownerId]);

export const countByOwner = async (gameId: number, ownerId: number): Promise<number> => {
  const result = await db.one<{ count: string }>(COUNT_BY_OWNER, [gameId, ownerId]);
  return parseInt(result.count);
};

/** NEW: Ask for cards functions */
export const getCardsByOwnerAndRank = async (gameId: number, ownerId: number, rank: string) => {
  const rows = await db.manyOrNone<{ id: number }>(GET_CARDS_BY_OWNER_AND_RANK, [
    gameId,
    ownerId,
    rank,
  ]);
  return rows.map((r) => r.id);
};

export const transferCards = async (cardIds: number[], newOwnerId: number) =>
  await db.none(TRANSFER_CARDS, [cardIds, newOwnerId]);

export const drawCard = async (gameId: number, playerId: number): Promise<number | null> => {
  const result = await db.oneOrNone<{ id: number }>(DRAW_CARD, [gameId, playerId]);
  return result?.id ?? null;
};
/** END NEW */
