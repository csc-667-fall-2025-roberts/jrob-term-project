import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import { GLOBAL_ROOM } from "../../shared/keys";
import { sessionMiddleware } from "../config/session";
import { Games } from "../db";
import logger from "../lib/logger";
import { User } from "../types/types";

export const initSockets = (httpServer: HTTPServer) => {
  const io = new Server(httpServer);

  io.engine.use(sessionMiddleware);

  io.on("connection", async (socket) => {
    // @ts-ignore
    const session = socket.request.session as { id: string; user: User };

    logger.info(`socket for user ${session.user.username} established`);

    socket.join(session.id);
    socket.join(GLOBAL_ROOM);

    try {
      const games = await Games.getByUser(session.user.id);

      games.forEach(({ game_id }) => {
        socket.join(`game:${game_id}`);
        logger.info(`user ${session.user.id} added to room game:${game_id}`);
      });
    } catch (error: unknown) {
      logger.error(`Error joining game rooms for user ${session.user.id}`);
    }

    socket.on("close", () => {
      logger.info(`socket for user ${session.user.username} closed`);
    });
  });

  return io;
};
