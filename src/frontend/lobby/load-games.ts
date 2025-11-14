import { Game } from "../../backend/types/types";

const listingDiv = document.querySelector<HTMLDivElement>("#game-list")!;
const gameTemplate = document.querySelector<HTMLTemplateElement>("#game-listing-template")!;

const appendGame = (game: Game) => {
  const container = gameTemplate.content.cloneNode(true) as HTMLDivElement;

  container.querySelector<HTMLSpanElement>(".game-id")!.innerText = `${game.id}`;
  container.querySelector<HTMLSpanElement>(".game-name")!.innerText = game.name ?? `Game ${game.id}`;
  container.querySelector<HTMLSpanElement>(".game-created-by")!.innerText =
    `user ${game.created_by}`;
  container.querySelector<HTMLSpanElement>(".game-state")!.innerText = game.state;
  container.querySelector<HTMLSpanElement>(".game-max-players")!.innerText = `${game.max_players}`;
  container.querySelector<HTMLSpanElement>(".game-created-at")!.innerText = new Date(
    game.created_at,
  ).toLocaleDateString();

  listingDiv.appendChild(container);
};

export const loadGames = async () => {
  const response = await fetch("/games").then((result) => result.json());

  listingDiv.innerHTML = "";

  response.games.forEach((game: Game) => {
    appendGame(game);
  });
};
