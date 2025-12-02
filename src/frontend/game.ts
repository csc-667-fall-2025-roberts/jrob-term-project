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

// Get game ID from server-rendered data attribute
const gameId = document.body.dataset.gameId || "";

// Connect with gameId so server joins us to the game room
const socket = socketIo({ query: { gameId } });

// Reload page when game state changes (dumb frontend pattern)
socket.on("player:joined", () => window.location.reload());
socket.on("game:started", () => window.location.reload());
socket.on("game:ask-result", () => window.location.reload());

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
