/**
 * Game page entry point
 * Handles socket connection and coordinates game modules
 */

import socketIo from "socket.io-client";

import {
  deselectCard,
  initializeCardSelection,
  initializeOpponentInteraction,
} from "./game/card-selection";
import type { GameStateUpdate } from "./game/types";
import { updateDeckCount, updatePlayerHand, updateTurnIndicator } from "./game/ui-updates";

// Get game ID from server-rendered data attribute
const gameId = document.body.dataset.gameId || "";

// Connect with gameId so server joins us to the game room
const socket = socketIo({ query: { gameId } });

// Refresh when another player joins
socket.on("player:joined", () => {
  window.location.reload();
});

// Handle game state updates from server
socket.on("game:state", (newState: GameStateUpdate) => {
  console.log("Game state update:", newState);
  updateDeckCount(newState.deckCount);
  updatePlayerHand(newState.myCards);
  updateTurnIndicator(newState.isMyTurn, newState.currentTurnUserId);
});

/**
 * Ask an opponent for cards of a specific rank
 */
async function askForCards(targetUserId: number, rank: string) {
  try {
    const response = await fetch(`/games/${gameId}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, rank }),
    });

    const result = await response.json();
    console.log("Ask result:", result);

    // Clear selection after asking
    deselectCard();
  } catch (error) {
    console.error("Error asking for cards:", error);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeCardSelection();
  initializeOpponentInteraction(askForCards);
});
