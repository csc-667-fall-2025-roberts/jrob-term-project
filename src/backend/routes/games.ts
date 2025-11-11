import express from "express";
import { Server } from "socket.io";
import { GAME_CREATE } from "../../shared/keys";
import { Games } from "../db";
import logger from "../lib/logger";

const router = express.Router();

// POST create a game
// POST join a game

router.get("/", async (request, response) => {
  const games = await Games.list();

  response.json({ games });
});

router.post("/", async (request, response) => {
  try {
    const { id } = request.session.user!;
    const { name, max_players } = request.body;

    const game = await Games.create(id, name, max_players);
    logger.info(
      `User ${id} created game ${game.id} (name: ${game.name}, max_players: ${game.max_players})`,
    );

    const io = request.app.get("io") as Server;
    io.emit(GAME_CREATE, { ...game });

    response.redirect(`/games/${game.id}`);
  } catch (error: unknown) {
    logger.error("Error creating game:", error);
    response.redirect("/");
  }
});

router.get("/:id", async (request, response) => {
  const { id } = request.params;

  response.render("games/game", { id });
});

router.post("/:game_id/join", async (request, response) => {
  const { id } = request.session.user!;
  const { game_id } = request.params;

  await Games.join(parseInt(game_id), id);

  response.redirect(`/games/${game_id}`);
});

export default router;
