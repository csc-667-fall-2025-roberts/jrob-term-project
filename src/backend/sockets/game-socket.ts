/** NEW: Game socket handlers - rooms group connections by game */
import { Server, Socket } from "socket.io";

import * as Games from "@backend/db/games";
import logger from "@backend/lib/logger";
import { PLAYER_JOINED } from "@shared/keys";

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
/** END NEW */
