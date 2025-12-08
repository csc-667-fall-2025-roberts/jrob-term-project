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

/**
 * TODO: Replace these reloads with proper DOM updates.
 *
 * Using window.location.reload() is PLACEHOLDER logic while we finalize
 * the backend and game logic. This is NOT the correct approach for a
 * real-time application!
 *
 * The proper unidirectional data flow pattern:
 * 1. Server broadcasts new state (e.g., updated player list, cards, turn info)
 * 2. Frontend receives broadcast and updates DOM directly - NO reload
 *
 * Example of correct approach:
 *   socket.on("game:started", ({ currentTurnUserId }) => {
 *     document.getElementById("lobby-overlay")?.classList.add("hidden");
 *     updateTurnIndicator(currentTurnUserId);
 *   });
 */
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
