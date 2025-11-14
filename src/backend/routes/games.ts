import express from "express";
import { Server } from "socket.io";
import { GAME_CREATE, GAME_LISTING } from "../../shared/keys";
import { Games } from "../db";
import logger from "../lib/logger";

const router = express.Router();

router.get("/", async (request, response) => {
  const sessionId = request.session.id;

  response.status(202).send();

  const games = await Games.list();
  const io = request.app.get("io") as Server;

  io.to(sessionId).emit(GAME_LISTING, games);
});

router.post("/", async (request, response) => {
  try {
    const { id } = request.session.user!;
    const { name, max_players } = request.body;

    logger.info(`Create game request ${name}, ${max_players} by ${id}`);
    const game = await Games.create(id, name, max_players);
    logger.info(`Game created: ${game.id}`);

    const io = request.app.get("io") as Server;
    io.emit(GAME_CREATE, { ...game });

    response.redirect(`/games/${game.id}`);
  } catch (error: any) {
    logger.error("Error creating game:", error);
    response.redirect("/lobby");
  }
});

router.get("/:id", async (request, response) => {
  const { id } = request.params;
  const game = await Games.get(parseInt(id));

  response.render("games/game", { ...game });
});

router.post("/:game_id/join", async (request, response) => {
  const { id } = request.session.user!;
  const { game_id } = request.params;

  await Games.join(parseInt(game_id), id);

  response.redirect(`/games/${id}`);
});

export default router;
