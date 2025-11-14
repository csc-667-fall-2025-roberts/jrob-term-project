import socketIo from "socket.io-client";
import type { Game } from "../backend/types/types";
import * as EVENTS from "../shared/keys";
import { loadGames } from "./lobby/load-games";

// set up socket for receiving game:created events
const socket = socketIo();

socket.on(EVENTS.GAME_CREATE, (payload: Game) => {
  loadGames();
});

// fetch available games and render
loadGames();
