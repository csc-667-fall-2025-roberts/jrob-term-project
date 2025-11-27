/**
 * DOM update functions for game state changes
 */

import type { Card } from "./types";

const handElement = document.querySelector(".player-hand")!;
const cardTemplate = document.querySelector<HTMLTemplateElement>("#card-template")!;

/**
 * Update the deck count display
 */
export function updateDeckCount(count: number) {
  const deckCount = document.querySelector(".deck-count");
  if (deckCount) {
    deckCount.textContent = `${count} cards remaining`;
  }
}

/**
 * Re-render the player's hand with new cards
 */
export function updatePlayerHand(cards: Card[]) {
  handElement.innerHTML = "";
  cards.forEach((card) => {
    const cardEl = cardTemplate.content.cloneNode(true) as DocumentFragment;
    const div = cardEl.querySelector(".playing-card") as HTMLElement;
    div.classList.add(`suit-${card.suit}`, `rank-${card.rank}`);
    div.dataset.rank = card.rank;
    div.dataset.suit = card.suit;
    handElement.appendChild(cardEl);
  });
}

/**
 * Highlight whose turn it is
 */
export function updateTurnIndicator(isMyTurn: boolean, currentTurnUserId: number | null) {
  // Clear all turn indicators
  document.querySelectorAll(".active-turn").forEach((el) => el.classList.remove("active-turn"));

  if (isMyTurn) {
    document.querySelector(".player-area")?.classList.add("active-turn");
  } else if (currentTurnUserId) {
    const opponent = document.querySelector(`.opponent-card[data-user-id="${currentTurnUserId}"]`);
    opponent?.classList.add("active-turn");
  }
}
