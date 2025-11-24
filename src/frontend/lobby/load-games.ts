import { Game } from "../../types/types";

const gameListing = document.querySelector<HTMLDivElement>("#game-list")!;
const gameItemTemplate = document.querySelector<HTMLTemplateElement>("#game-listing-template")!;

export const loadGames = () => {
  fetch("/games", { credentials: "include" });
};

const createGameElement = (game: Game) => {
  const gameItem = gameItemTemplate.content.cloneNode(true) as DocumentFragment;

  gameItem.querySelector(".game-name")!.textContent = game.name ?? `Game ${game.id}`;

  // Add data attribute for color coding
  const stateElement = gameItem.querySelector(".game-state") as HTMLElement;
  stateElement.textContent = game.state;
  stateElement.dataset.state = game.state;

  gameItem.querySelector(".max-players")!.textContent = `${game.max_players} players`;
  gameItem.querySelector("form")!.action = `/games/${game.id}/join`;

  return gameItem;
};

export const renderGames = (games: Game[]) => {
  gameListing.replaceChildren(...games.map(createGameElement));
};

export const appendGame = (game: Game) => {
  gameListing.appendChild(createGameElement(game));
};
