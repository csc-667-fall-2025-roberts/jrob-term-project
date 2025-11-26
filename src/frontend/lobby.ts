import socketIo from "socket.io-client";
import * as EVENTS from "../shared/keys";
import type { Game } from "../types/types";
import { appendGame, loadGames, renderGames } from "./lobby/load-games";

const socket = socketIo();

socket.on(EVENTS.GAME_LISTING, (data: { myGames: Game[]; availableGames: Game[] }) => {
  renderGames(data);
});

socket.on(EVENTS.GAME_CREATE, (game: Game) => {
  appendGame(game);
});

// Wait for socket connection before loading games to avoid race condition
socket.on("connect", () => {
  console.log("Socket connected, loading games...");
  loadGames();
});
