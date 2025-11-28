/**
 * Card selection and opponent interaction logic
 */

// Track the currently selected card rank
let selectedRank: string | null = null;

/**
 * Get the currently selected rank
 */
export function getSelectedRank(): string | null {
  return selectedRank;
}

/**
 * Select a card and update UI state
 */
export function selectCard(cardElement: HTMLElement, rank: string) {
  // Remove selection from all cards
  const allCards = document.querySelectorAll(".player-hand .playing-card");
  allCards.forEach((card) => card.classList.remove("selected"));

  // Select this card
  cardElement.classList.add("selected");
  selectedRank = rank;

  // Make opponent cards clickable
  const opponentCards = document.querySelectorAll(".opponent-card");
  opponentCards.forEach((card) => card.classList.add("clickable"));
}

/**
 * Deselect the current card and update UI state
 */
export function deselectCard() {
  // Remove selection from all cards
  const allCards = document.querySelectorAll(".player-hand .playing-card");
  allCards.forEach((card) => card.classList.remove("selected"));

  selectedRank = null;

  // Remove clickable state from opponent cards
  const opponentCards = document.querySelectorAll(".opponent-card");
  opponentCards.forEach((card) => card.classList.remove("clickable"));
}

/**
 * Set up click handlers for player's cards
 */
export function initializeCardSelection() {
  const playerHand = document.querySelector(".player-hand");
  if (!playerHand) return;

  // Use event delegation for dynamically rendered cards
  playerHand.addEventListener("click", (event) => {
    const card = (event.target as HTMLElement).closest(".playing-card");
    if (!card) return;

    const rank = card.getAttribute("data-rank");
    if (!rank) return;

    // Toggle selection
    if (selectedRank === rank && card.classList.contains("selected")) {
      deselectCard();
    } else {
      selectCard(card as HTMLElement, rank);
    }
  });
}

/**
 * Set up click handlers for opponent cards
 */
export function initializeOpponentInteraction(
  onAskForCards: (targetUserId: number, rank: string) => void,
) {
  const opponentCards = document.querySelectorAll(".opponent-card");

  opponentCards.forEach((opponentCard) => {
    opponentCard.addEventListener("click", () => {
      // Only handle clicks if a card is selected
      if (!selectedRank || !opponentCard.classList.contains("clickable")) {
        return;
      }

      const targetUserId = opponentCard.getAttribute("data-user-id");
      if (targetUserId) {
        onAskForCards(parseInt(targetUserId), selectedRank);
      }
    });
  });
}
