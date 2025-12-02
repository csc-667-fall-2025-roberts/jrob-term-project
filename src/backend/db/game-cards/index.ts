import { GameCard } from "@shared/types";

import db from "../connection";
import { CREATE_DECK, DEAL_CARDS, GET_CARDS_BY_OWNER, GET_CARDS_FROM_DECK } from "./sql";

export const createDeck = async (gameId: number) => await db.none(CREATE_DECK, [gameId]);

export const getCardsFromDeck = async (gameId: number, count: number) =>
  await db.manyOrNone<{ id: number }>(GET_CARDS_FROM_DECK, [gameId, count]);

export const dealCards = async (cardIds: number[], ownerId: number) =>
  await db.none(DEAL_CARDS, [cardIds, ownerId]);

/** NEW: Get cards by owner with rank/suit */
export const getCardsByOwner = async (gameId: number, ownerId: number) =>
  await db.manyOrNone<GameCard>(GET_CARDS_BY_OWNER, [gameId, ownerId]);
/** END NEW */
