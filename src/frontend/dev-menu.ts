/**
 * Development Menu for Game Page
 * Provides UI controls and keyboard shortcuts for testing different game states
 *
 * ⚠️ DEV ONLY - Remove before production
 */

let isOpen = false;
let confettiCount = 0;

// Initialize dev menu
document.addEventListener('DOMContentLoaded', () => {
  createDevMenu();
  setupKeyboardShortcuts();
});

function createDevMenu() {
  const menu = document.createElement('div');
  menu.id = 'dev-menu';
  menu.className = 'dev-menu collapsed';

  menu.innerHTML = `
    <div class="dev-menu-header">
      <span>🛠️ DEV MENU</span>
      <button id="dev-menu-toggle" class="dev-menu-toggle">▼</button>
    </div>
    <div class="dev-menu-content">
      <div class="dev-menu-section">
        <h4>Turn States</h4>
        <button data-action="turn-player">Your Turn</button>
        <button data-action="turn-p2">Player 2 Turn</button>
        <button data-action="turn-p3">Player 3 Turn</button>
        <button data-action="turn-none">Clear Turns</button>
      </div>

      <div class="dev-menu-section">
        <h4>Card Selection</h4>
        <button data-action="select-card">Select Random Card</button>
        <button data-action="make-clickable">Make Opponents Clickable</button>
        <button data-action="clear-selection">Clear Selection</button>
      </div>

      <div class="dev-menu-section">
        <h4>Card Animations</h4>
        <button data-action="anim-deal">Deal Cards</button>
        <button data-action="anim-transfer">Transfer Card</button>
        <button data-action="anim-draw">Draw from Deck</button>
        <button data-action="anim-success">Success Wiggle</button>
        <button data-action="anim-gofish">Go Fish Shake</button>
      </div>

      <div class="dev-menu-section">
        <h4>Book Events</h4>
        <button data-action="complete-book">Complete Book 🎉</button>
        <button data-action="confetti">Confetti Burst 🎊</button>
      </div>

      <div class="dev-menu-section">
        <h4>Keyboard Shortcuts</h4>
        <div class="dev-menu-help">
          <kbd>\`</kbd> Toggle menu<br>
          <kbd>T</kbd> Toggle turn<br>
          <kbd>S</kbd> Select card<br>
          <kbd>D</kbd> Deal animation<br>
          <kbd>C</kbd> Confetti<br>
          <kbd>B</kbd> Complete book
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(menu);

  // Toggle button handler
  document.getElementById('dev-menu-toggle')?.addEventListener('click', toggleMenu);

  // Action buttons
  menu.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = (e.target as HTMLElement).dataset.action;
      if (action) handleAction(action);
    });
  });
}

function toggleMenu() {
  const menu = document.getElementById('dev-menu');
  const toggle = document.getElementById('dev-menu-toggle');
  if (!menu || !toggle) return;

  isOpen = !isOpen;
  menu.classList.toggle('collapsed');
  toggle.textContent = isOpen ? '▲' : '▼';
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    switch(e.key) {
      case '`':
        toggleMenu();
        e.preventDefault();
        break;
      case 't':
      case 'T':
        handleAction('turn-player');
        break;
      case 's':
      case 'S':
        handleAction('select-card');
        break;
      case 'd':
      case 'D':
        handleAction('anim-deal');
        break;
      case 'c':
      case 'C':
        handleAction('confetti');
        break;
      case 'b':
      case 'B':
        handleAction('complete-book');
        break;
    }
  });
}

function handleAction(action: string) {
  console.log(`[DEV] Action: ${action}`);

  switch(action) {
    // Turn states
    case 'turn-player':
      clearAllTurns();
      document.querySelector('.player-area')?.classList.add('active-turn');
      break;
    case 'turn-p2':
      clearAllTurns();
      document.querySelectorAll('.opponent-card')[0]?.classList.add('active-turn');
      break;
    case 'turn-p3':
      clearAllTurns();
      document.querySelectorAll('.opponent-card')[1]?.classList.add('active-turn');
      break;
    case 'turn-none':
      clearAllTurns();
      break;

    // Card selection
    case 'select-card':
      const cards = document.querySelectorAll('.player-hand .playing-card');
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      randomCard?.classList.add('selected');
      break;
    case 'make-clickable':
      document.querySelectorAll('.opponent-card').forEach(opp =>
        opp.classList.add('clickable')
      );
      break;
    case 'clear-selection':
      document.querySelectorAll('.playing-card').forEach(card =>
        card.classList.remove('selected')
      );
      document.querySelectorAll('.opponent-card').forEach(opp =>
        opp.classList.remove('clickable')
      );
      break;

    // Animations
    case 'anim-deal':
      animatePlayerCards('dealing', 800);
      break;
    case 'anim-transfer':
      animateRandomCard('transferring', 600);
      break;
    case 'anim-draw':
      animateRandomCard('drawing', 500);
      break;
    case 'anim-success':
      animateRandomCard('success', 600);
      break;
    case 'anim-gofish':
      animateRandomCard('go-fish', 500);
      break;

    // Book events
    case 'complete-book':
      completeRandomBook();
      break;
    case 'confetti':
      createConfetti();
      break;
  }
}

function clearAllTurns() {
  document.querySelectorAll('.active-turn').forEach(el =>
    el.classList.remove('active-turn')
  );
}

function animatePlayerCards(className: string, duration: number) {
  const cards = document.querySelectorAll('.player-hand .playing-card');
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add(className);
      setTimeout(() => card.classList.remove(className), duration);
    }, i * 100);
  });
}

function animateRandomCard(className: string, duration: number) {
  const cards = document.querySelectorAll('.player-hand .playing-card');
  const randomCard = cards[Math.floor(Math.random() * cards.length)];
  if (randomCard) {
    randomCard.classList.add(className);
    setTimeout(() => randomCard.classList.remove(className), duration);
  }
}

function completeRandomBook() {
  const placeholders = document.querySelectorAll('.book-badge.placeholder');
  if (placeholders.length === 0) {
    console.log('[DEV] No more placeholder books!');
    return;
  }

  const randomBook = placeholders[Math.floor(Math.random() * placeholders.length)] as HTMLElement;
  randomBook.classList.remove('placeholder');
  randomBook.classList.add('completed', 'celebrating', 'flash', 'player-1');

  // Remove animation classes after completion
  setTimeout(() => {
    randomBook.classList.remove('celebrating', 'flash');
  }, 2000);

  // Trigger confetti
  createConfetti();
}

function createConfetti() {
  const colors = ['#fbbf24', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];
  const count = 50;

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    confetti.style.animationDuration = `${2 + Math.random()}s`;

    document.body.appendChild(confetti);

    // Remove after animation
    setTimeout(() => confetti.remove(), 3000);
  }

  confettiCount++;
  console.log(`[DEV] Confetti burst #${confettiCount}! 🎉`);
}
