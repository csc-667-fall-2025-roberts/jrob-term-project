import { Game } from "@shared/types";

const myGameListing = document.querySelector<HTMLDivElement>("#my-game-list")!;
const availableGameListing = document.querySelector<HTMLDivElement>("#available-game-list")!;
const gameItemTemplate = document.querySelector<HTMLTemplateElement>("#game-listing-template")!;

export const loadGames = () => {
  fetch("/games", { credentials: "include" });
};

const createGameElement = (game: Game, isMyGame: boolean = false) => {
  const gameItem = gameItemTemplate.content.cloneNode(true) as DocumentFragment;

  gameItem.querySelector(".game-name")!.textContent = game.name ?? `Game ${game.id}`;

  // Add data attribute for color coding
  const stateElement = gameItem.querySelector(".game-state") as HTMLElement;
  stateElement.textContent = game.state;
  stateElement.dataset.state = game.state;

  // Show player count / max players
  const playerCount = game.player_count ?? 0;
  gameItem.querySelector(".max-players")!.textContent =
    `${playerCount}/${game.max_players} players`;

  // Update form action, method, and button text
  const form = gameItem.querySelector("form")!;
  const button = gameItem.querySelector("button")!;

  if (isMyGame) {
    form.method = "get";
    form.action = `/games/${game.id}`;
    button.textContent = "Rejoin";
  } else {
    form.method = "post";
    form.action = `/games/${game.id}/join`;
    button.textContent = "Join";
  }

  return gameItem;
};

export const renderGames = (data: { myGames: Game[]; availableGames: Game[] }) => {
  // Render user's games
  if (data.myGames.length === 0) {
    myGameListing.innerHTML = '<p class="empty-state">No games yet. Create one to get started!</p>';
  } else {
    myGameListing.replaceChildren(...data.myGames.map((g) => createGameElement(g, true)));
  }

  // Render available games
  if (data.availableGames.length === 0) {
    availableGameListing.innerHTML = '<p class="empty-state">No available games to join.</p>';
  } else {
    availableGameListing.replaceChildren(
      ...data.availableGames.map((g) => createGameElement(g, false)),
    );
  }
};

export const appendGame = (game: Game) => {
  // New games are always available (not joined yet)
  availableGameListing.appendChild(createGameElement(game, false));
};
