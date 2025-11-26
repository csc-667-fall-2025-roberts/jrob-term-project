/**
 * Game page interaction logic
 * Handles card selection and asking opponents for cards
 */

// Track the currently selected card rank
let selectedRank: string | null = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeCardSelection();
  initializeOpponentInteraction();
});

/**
 * Set up click handlers for player's cards
 */
function initializeCardSelection() {
  const playerCards = document.querySelectorAll('.player-hand .playing-card');

  playerCards.forEach((card) => {
    card.addEventListener('click', () => {
      const rank = card.getAttribute('data-rank');

      if (!rank) return;

      // Toggle selection
      if (selectedRank === rank && card.classList.contains('selected')) {
        // Deselect
        deselectCard();
      } else {
        // Select this card, deselect others
        selectCard(card as HTMLElement, rank);
      }
    });
  });
}

/**
 * Select a card and update UI state
 */
function selectCard(cardElement: HTMLElement, rank: string) {
  // Remove selection from all cards
  const allCards = document.querySelectorAll('.player-hand .playing-card');
  allCards.forEach(card => card.classList.remove('selected'));

  // Select this card
  cardElement.classList.add('selected');
  selectedRank = rank;

  // Make opponent cards clickable
  const opponentCards = document.querySelectorAll('.opponent-card');
  opponentCards.forEach(card => card.classList.add('clickable'));
}

/**
 * Deselect the current card and update UI state
 */
function deselectCard() {
  // Remove selection from all cards
  const allCards = document.querySelectorAll('.player-hand .playing-card');
  allCards.forEach(card => card.classList.remove('selected'));

  selectedRank = null;

  // Remove clickable state from opponent cards
  const opponentCards = document.querySelectorAll('.opponent-card');
  opponentCards.forEach(card => card.classList.remove('clickable'));
}

/**
 * Set up click handlers for opponent cards
 */
function initializeOpponentInteraction() {
  const opponentCards = document.querySelectorAll('.opponent-card');

  opponentCards.forEach((opponentCard) => {
    opponentCard.addEventListener('click', () => {
      // Only handle clicks if a card is selected
      if (!selectedRank || !opponentCard.classList.contains('clickable')) {
        return;
      }

      // Get opponent player number from the badge class
      const badge = opponentCard.querySelector('.book-badge');
      const playerClasses = badge?.className.match(/player-(\d+)/);
      const opponentPlayer = playerClasses ? playerClasses[1] : null;

      if (opponentPlayer) {
        handleAskForCards(opponentPlayer, selectedRank);
      }
    });
  });
}

/**
 * Handle the "ask for cards" action
 * TODO: Replace with actual API call when backend is ready
 */
function handleAskForCards(opponentPlayer: string, rank: string) {
  console.log(`Asking Player ${opponentPlayer} for ${rank}s`);

  // TODO: Make API call to backend
  // For now, just show a temporary message
  alert(`Asking Player ${opponentPlayer} for ${rank}s\n\n(This will be replaced with actual game logic)`);

  // Clear selection
  deselectCard();
}
