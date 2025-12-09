import express from "express";
import { Server } from "socket.io";

import * as GameCards from "@backend/db/game-cards";
import * as Games from "@backend/db/games";
import * as PlayerBooks from "@backend/db/player-books";
import { generateGameName } from "@backend/lib/game-names";
import logger from "@backend/lib/logger";
import { askForCards, startGame } from "@backend/services/game-service";
import {
  broadcastAskResult,
  broadcastGameStarted,
  broadcastJoin,
} from "@backend/sockets/game-socket"; /** NEW: added broadcastGameStarted, broadcastAskResult */
import { GAME_CREATE, GAME_LISTING } from "@shared/keys";

const router = express.Router();

router.get("/", async (request, response) => {
  const sessionId = request.session.id;
  const userId = request.session.user!.id;

  response.status(202).send();

  const allGames = await Games.list();
  const userGames = await Games.getByUser(userId);

  // Separate games into user's games and available games
  const userGameIds = new Set(userGames.map((g) => g.id));
  const myGames = allGames.filter((g) => userGameIds.has(g.id));
  const availableGames = allGames.filter((g) => !userGameIds.has(g.id));

  const io = request.app.get("io") as Server;

  io.to(sessionId).emit(GAME_LISTING, { myGames, availableGames });
});

router.post("/", async (request, response) => {
  try {
    const { id } = request.session.user!;
    const { max_players } = request.body;
    // Generate random name if not provided (e.g., "brave-green-dolphin")
    const name = request.body.name?.trim() || generateGameName();

    logger.info(`Create game request ${name}, ${max_players} by ${id}`);
    const game = await Games.create(id, name, max_players);

    // Add creator as first player
    await Games.join(game.id, id);
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
  const gameId = parseInt(request.params.id);
  const user = request.session.user!;

  const game = await Games.get(gameId);

  // Fetch player's cards
  const myCards = await GameCards.getCardsByOwner(gameId, user.id);
  const cards = myCards.map((c) => ({ rank: c.rank, suit: c.suit }));

  // Fetch game state - deck count, players, books
  const deckCount = await GameCards.countByOwner(gameId, 0);
  const players = await Games.getPlayersWithStats(gameId);
  const allBooks = await PlayerBooks.getByGame(gameId);

  response.render("games/game", {
    ...game,
    currentUserId: user.id,
    currentUsername: user.username,
    cards,
    deckCount,
    players,
    allBooks,
  });
});

// Join route with broadcast
router.post("/:game_id/join", async (request, response) => {
  const { id } = request.session.user!;
  const { game_id } = request.params;
  const gameId = parseInt(game_id);

  await Games.join(gameId, id);

  const io = request.app.get("io") as Server;
  broadcastJoin(io, gameId);

  response.redirect(`/games/${game_id}`);
});

/** NEW: Start game route with broadcast */
router.post("/:id/start", async (request, response) => {
  try {
    const gameId = parseInt(request.params.id);
    const { firstPlayerId } = await startGame(gameId);

    const io = request.app.get("io") as Server;
    broadcastGameStarted(io, gameId, firstPlayerId);

    response.redirect(`/games/${gameId}`);
  } catch (error: any) {
    logger.error("Error starting game:", error);
    response.redirect(`/games/${request.params.id}`);
  }
});

// Ask for cards route with broadcast
router.post("/:id/ask", async (request, response) => {
  try {
    const gameId = parseInt(request.params.id);
    const askerId = request.session.user!.id;
    const { targetUserId, rank } = request.body;

    const result = await askForCards(gameId, askerId, targetUserId, rank);

    const io = request.app.get("io") as Server;
    broadcastAskResult(io, gameId, askerId, targetUserId, rank, result);

    response.json(result);
  } catch (error: any) {
    logger.error("Error asking for cards:", error);
    response.status(500).json({ error: error.message });
  }
});
/** END NEW */

export default router;
