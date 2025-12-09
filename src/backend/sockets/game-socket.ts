// Game socket handlers - rooms group connections by game
import { Server, Socket } from "socket.io";

import * as Games from "@backend/db/games";
import logger from "@backend/lib/logger";
import { AskResult } from "@backend/services/game-service";
import { ASK_RESULT, GAME_STARTED, PLAYER_JOINED } from "@shared/keys";

// Room name for a game (e.g., "game:123")
export function gameRoom(gameId: number): string {
  return `game:${gameId}`;
}

// Join socket to game room after verifying membership
export async function initGameSocket(socket: Socket, gameId: number, userId: number) {
  const playerIds = await Games.getPlayerIds(gameId);
  if (!playerIds.includes(userId)) {
    logger.warn(`User ${userId} tried to join game ${gameId} socket without being a player`);
    return;
  }

  socket.join(gameRoom(gameId));
  logger.info(`User ${userId} joined game ${gameId} socket room`);
}

// Broadcast when a player joins
export function broadcastJoin(io: Server, gameId: number) {
  io.to(gameRoom(gameId)).emit(PLAYER_JOINED);
}

/** NEW: Broadcast when game starts */
export function broadcastGameStarted(io: Server, gameId: number, firstPlayerId: number) {
  io.to(gameRoom(gameId)).emit(GAME_STARTED, { firstPlayerId });
}

// Broadcast ask result to all players
export function broadcastAskResult(
  io: Server,
  gameId: number,
  askerId: number,
  targetId: number,
  rank: string,
  result: AskResult,
) {
  io.to(gameRoom(gameId)).emit(ASK_RESULT, { askerId, targetId, rank, ...result });
}
/** END NEW */
