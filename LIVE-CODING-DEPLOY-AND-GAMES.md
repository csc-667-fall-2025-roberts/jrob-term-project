# Live Coding Guide: Deployment & Game Lobby

This guide walks through deploying a TypeScript/Express application to Render and implementing a game lobby feature with Socket.IO.

**Format:** Small, discrete changes to make live coding easier to follow while answering questions.

**Teaching Moments:** Highlighted in callout boxes - scroll past if needed to keep moving.

---

## Part 1: Project Reorganization

### Step 1.1: Move Types to Shared Directory

**Why:** Types used by both frontend and backend should live in `src/shared/` for cleaner imports.

Move the types file:
```bash
mkdir -p src/shared
mv src/backend/types/types.ts src/shared/types.ts
```

> **💡 Teaching Moment:** Shared code between frontend and backend should live in `src/shared/`. This makes the dependency graph clearer and avoids importing from "backend" in frontend code.

Update imports in `src/frontend/lobby.ts`:
```typescript
import type { Game } from "../shared/types";
```

Update imports in `src/frontend/lobby/load-games.ts`:
```typescript
import { Game } from "../../shared/types";
```

Update imports in `src/frontend/chat.ts`:
```typescript
import type { ChatMessage } from "../shared/types";
```

Update imports in `src/backend/sockets/init.ts`:
```typescript
import { User } from "../../shared/types";
```

Update imports in `src/backend/db/chat/index.ts`:
```typescript
import { ChatMessage } from "../../../shared/types";
```

Update imports in `src/backend/db/auth/index.ts`:
```typescript
import type { SecureUser, User } from "../../../shared/types";
```

Update imports in `src/backend/db/games/index.ts`:
```typescript
import { Game, GameState } from "../../../shared/types";
```

**Test:** `npm run build` should succeed.

### Step 1.2: Reorganize CSS Files

**Why:** Better organization for styles, separating concerns and making the codebase easier to navigate.

Create CSS directory structure:
```bash
mkdir -p src/frontend/styles/components
```

Create base styles file `src/frontend/styles/base.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base HTML elements */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  color: #1a1a1a;
  background: #f5f5f5;
}
```

Create component styles file `src/frontend/styles/components/forms.css`:
```css
/* Form components */
input[type="text"],
input[type="email"],
input[type="password"],
textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus,
textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

button {
  padding: 0.5rem 1rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #357abd;
}

button:active {
  transform: translateY(1px);
}
```

Create main styles entry point `src/frontend/styles/main.css`:
```css
/* Import order matters: base -> components -> utilities */
@import './base.css';
@import './components/forms.css';
```

> **💡 Teaching Moment:** Using `@import` in CSS allows modular organization. Modern build tools (Vite, webpack) resolve these at build time into a single file. Import order matters: base styles first, then components, then utilities.

Update `src/frontend/entrypoint.ts`:
```typescript
import "./styles/main.css";
```

Delete old file:
```bash
rm src/frontend/styles.css
```

**Test:** `npm run build:frontend` should succeed and generate CSS.

---

## Part 2: Render Deployment Setup

### Step 2.1: Configure TypeScript for Node Resolution

**Why:** Node.js module resolution helps TypeScript find packages in `node_modules` correctly.

Update `tsconfig.json` - add `moduleResolution`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "migrations"]
}
```

> **💡 Teaching Moment:** `moduleResolution: "node"` tells TypeScript to resolve modules the same way Node.js does - checking `node_modules`, following `package.json` exports, etc. Without this, TypeScript might not find installed packages correctly.

### Step 2.2: Move Build Dependencies to Production

**Why:** Render doesn't install devDependencies by default. We need TypeScript, types, and build tools available during the build phase.

Edit `package.json` - move these from `devDependencies` to `dependencies`:
```json
{
  "dependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/connect-livereload": "^0.6.5",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/express-session": "^1.18.0",
    "@types/livereload": "^0.9.5",
    "@types/morgan": "^1.9.9",
    "@types/node": "^22.10.2",
    "@types/pg": "^8.11.10",
    "typescript": "^5.7.2",
    "vite": "^6.0.7",
    "tsx": "^4.19.2",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "postcss-nesting": "^13.0.1"
  }
}
```

Run `npm install` to update `package-lock.json`.

> **⚠️ Note:** This isn't ideal architecture - normally build tools should be devDependencies. However, Render's default build process requires them in dependencies. Alternative approaches: Docker, pre-building, or custom build scripts. For this course, we'll accept this tradeoff.

### Step 2.3: Configure TypeScript Migration Runner

**Why:** Our migration files are `.ts` but node-pg-migrate needs to know how to execute TypeScript files.

Create `.pgmigraterc.json`:
```json
{
  "migrations-dir": "migrations",
  "migration-file-language": "ts",
  "tsconfig": "tsconfig.json",
  "migration-file-extension": ".ts",
  "ts-node": "tsx"
}
```

> **💡 Teaching Moment:**
> - `migrations-dir`: Where migration files live
> - `migration-file-language`: Source language (TypeScript)
> - `tsconfig`: Which TypeScript config to use
> - `ts-node`: Which runtime to use (`tsx` is a fast TypeScript executor)

Update migration scripts in `package.json`:
```json
{
  "scripts": {
    "migrate:up": "NODE_OPTIONS='--import tsx' node-pg-migrate up",
    "migrate:down": "NODE_OPTIONS='--import tsx' node-pg-migrate down",
    "migrate:create": "node-pg-migrate create"
  }
}
```

> **💡 Teaching Moment:** `NODE_OPTIONS='--import tsx'` tells Node.js to preload the `tsx` module, which registers TypeScript file handling. This allows node-pg-migrate to execute `.ts` migration files directly.

### Step 2.4: Fix View Copy Script

**Why:** In development, views are in `src/backend/views/`. In production, they need to be in `dist/backend/views/` to match the compiled JavaScript structure.

Update `scripts/copy-views.js`:
```javascript
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'backend', 'views');
const dest = path.join(__dirname, '..', 'dist', 'backend', 'views');

// Create destination directory
fs.mkdirSync(dest, { recursive: true });

// Copy views directory
fs.cpSync(src, dest, { recursive: true });

console.log('✓ Views copied successfully');
```

> **💡 Teaching Moment:** When TypeScript compiles `src/backend/server.ts` → `dist/backend/server.js`, the `__dirname` in the compiled code will be `dist/backend/`. So the views path `path.join(__dirname, "views")` becomes `dist/backend/views/`, not `dist/views/`.

**Test:** Run `npm run build` and verify `dist/backend/views/` contains EJS files.

### Step 2.5: Configure Vite Output Paths

**Why:** In development, we output to `src/backend/public/` for live reload. In production, we output to `dist/backend/public/` to match the deployment structure.

Update `vite.config.ts`:
```typescript
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development";
  const outputDir = isDev ? "src/backend/public" : "dist/backend/public";

  return {
    publicDir: "public",
    build: {
      outDir: outputDir,
      emptyOutDir: isDev,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "src/frontend/entrypoint.ts"),
          chat: path.resolve(__dirname, "src/frontend/chat.ts"),
          lobby: path.resolve(__dirname, "src/frontend/lobby.ts"),
        },
        output: {
          entryFileNames: "[name].js",
          dir: `${outputDir}/js`,
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "bundle.css";
            }
            return "assets/[name]-[hash][extname]";
          },
          manualChunks: undefined,
        },
      },
      sourcemap: true,
      target: "es2020",
    },
  };
});
```

> **💡 Teaching Moment:** Vite can use different modes via `--mode` flag. The `mode` parameter lets us conditionally configure paths: development uses source directory for live reload, production uses dist directory for deployment.

### Step 2.6: Trust Proxy for Secure Cookies

**Why:** Render uses a reverse proxy. Express needs to trust the `X-Forwarded-Proto` header to properly handle secure cookies over HTTPS.

Update `src/backend/server.ts` - add after `const app = express();`:
```typescript
// Trust Render's proxy for secure cookies
app.set("trust proxy", 1);
```

> **💡 Teaching Moment:** When behind a reverse proxy (nginx, Render, Heroku), the app sees HTTP locally but users connect via HTTPS. The proxy sets `X-Forwarded-Proto: https` to indicate the original protocol. `trust proxy` tells Express to trust this header for `req.protocol`, enabling secure cookies.

---

## Part 3: Database Schema for Games

### Step 3.1: Create Games Table Migration

Create migration for games table:
```bash
npm run migrate:create create-games-table
```

Edit the new migration file `migrations/XXXXXX_create-games-table.ts`:
```typescript
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('games', {
    id: 'id',
    name: {
      type: 'varchar(255)',
      notNull: false
    },
    created_by: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE'
    },
    state: {
      type: 'varchar(50)',
      notNull: true,
      default: 'lobby'
    },
    max_players: {
      type: 'integer',
      notNull: true,
      default: 4
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  pgm.createIndex('games', 'created_by');
  pgm.createIndex('games', 'state');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('games');
}
```

> **💡 Teaching Moment:** This creates a `games` table with:
> - `id`: Auto-incrementing primary key (using shorthand 'id')
> - `name`: Optional game name
> - `created_by`: Foreign key to users table
> - `state`: Game status (lobby, active, completed)
> - `max_players`: Maximum number of players allowed
> - `created_at`: Timestamp of creation

### Step 3.2: Create Game Players Junction Table Migration

Create migration for many-to-many relationship:
```bash
npm run migrate:create create-game-players-table
```

Edit the new migration file `migrations/XXXXXX_create-game-players-table.ts`:
```typescript
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('game_players', {
    game_id: {
      type: 'integer',
      notNull: true,
      references: 'games',
      onDelete: 'CASCADE'
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE'
    },
    joined_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  pgm.addConstraint('game_players', 'game_players_pkey', {
    primaryKey: ['game_id', 'user_id']
  });

  pgm.createIndex('game_players', 'game_id');
  pgm.createIndex('game_players', 'user_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('game_players');
}
```

> **💡 Teaching Moment:** This is a **junction table** for a many-to-many relationship:
> - A game can have many players
> - A user can be in many games
> - Composite primary key (game_id, user_id) prevents duplicate entries
> - Foreign keys with CASCADE delete cleanup when games or users are deleted

**Test migrations locally:**
```bash
npm run migrate:up
```

---

## Part 4: Game Type Definitions

### Step 4.1: Add Game Types

Edit `src/shared/types.ts` - add game-related types:
```typescript
export enum GameState {
  LOBBY = "lobby",
  ACTIVE = "active",
  COMPLETED = "completed",
}

export type Game = {
  id: number;
  name?: string;
  created_by: number;
  state: GameState;
  max_players: number;
  created_at: Date;
};

export type GamePlayer = {
  game_id: number;
  user_id: number;
  joined_at: Date;
};
```

> **💡 Teaching Moment:** TypeScript enums compile to JavaScript objects, unlike type aliases which are compile-time only. That's why we need the actual `.ts` file (not `.d.ts`) - the enum needs to exist at runtime.

---

## Part 5: Database Functions for Games

### Step 5.1: Create SQL Queries File

Create `src/backend/db/games/sql.ts`:
```typescript
export const CREATE_GAME = `
  WITH new_game AS (
    INSERT INTO games (created_by, name, max_players)
    VALUES ($1, $2, $3)
    RETURNING *
  )
  INSERT INTO game_players (game_id, user_id)
  SELECT id, created_by FROM new_game
  RETURNING (SELECT row_to_json(new_game.*) FROM new_game) as game;
`;

export const JOIN_GAME = `
  INSERT INTO game_players (game_id, user_id)
  VALUES ($1, $2)
  ON CONFLICT (game_id, user_id) DO NOTHING;
`;

export const LIST_GAMES = `
  SELECT
    g.*,
    COUNT(gp.user_id) as player_count
  FROM games g
  LEFT JOIN game_players gp ON g.id = gp.game_id
  WHERE g.state = $1
  GROUP BY g.id
  ORDER BY g.created_at DESC
  LIMIT $2;
`;

export const GAMES_BY_USER = `
  SELECT game_id
  FROM game_players
  WHERE user_id = $1;
`;
```

> **💡 Teaching Moment:**
> - `CREATE_GAME` uses a CTE (Common Table Expression) with `WITH` to insert a game and automatically add the creator as a player
> - `JOIN_GAME` uses `ON CONFLICT ... DO NOTHING` to handle duplicate join attempts gracefully
> - `LIST_GAMES` uses `LEFT JOIN` and `COUNT` to show player count alongside game data

### Step 5.2: Create Database Functions

Create `src/backend/db/games/index.ts`:
```typescript
import { Game, GameState } from "../../../shared/types";
import db from "../connection";
import { CREATE_GAME, GAMES_BY_USER, JOIN_GAME, LIST_GAMES } from "./sql";

const create = async (user_id: number, name?: string, maxPlayers: number = 4) =>
  await db.one<Game>(CREATE_GAME, [user_id, name, maxPlayers]);

const join = async (game_id: number, user_id: number) =>
  await db.none(JOIN_GAME, [game_id, user_id]);

const list = async (state: GameState = GameState.LOBBY, limit: number = 50) =>
  await db.manyOrNone(LIST_GAMES, [state, limit]);

const getByUser = async (user_id: number) =>
  await db.manyOrNone<{ game_id: number }>(GAMES_BY_USER, [user_id]);

export { create, getByUser, join, list };
```

### Step 5.3: Export from DB Index

Update `src/backend/db/index.ts`:
```typescript
import * as Auth from "./auth";
import * as Chat from "./chat";
import * as Games from "./games";

export { Auth, Chat, Games };
```

---

## Part 6: Game Routes

### Step 6.1: Create Game Creation Route

Create `src/backend/routes/games.ts`:
```typescript
import { Router } from "express";
import { Games } from "../db";
import logger from "../lib/logger";

const router = Router();

router.post("/", async (req, res) => {
  const { name, maxPlayers } = req.body;
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const game = await Games.create(user.id, name, maxPlayers);

    logger.info(`User ${user.id} created game ${game.id}`);

    res.status(201).json({ game });
  } catch (error) {
    logger.error("Failed to create game", error);
    res.status(500).json({ error: "Failed to create game" });
  }
});

export default router;
```

### Step 6.2: Create Game List Route

Add to `src/backend/routes/games.ts`:
```typescript
router.get("/", async (req, res) => {
  try {
    const games = await Games.list();
    res.json({ games });
  } catch (error) {
    logger.error("Failed to list games", error);
    res.status(500).json({ error: "Failed to list games" });
  }
});
```

### Step 6.3: Create Game Join Route

Add to `src/backend/routes/games.ts`:
```typescript
router.post("/:id/join", async (req, res) => {
  const gameId = parseInt(req.params.id);
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    await Games.join(gameId, user.id);

    logger.info(`User ${user.id} joined game ${gameId}`);

    res.json({ success: true });
  } catch (error) {
    logger.error(`Failed to join game ${gameId}`, error);
    res.status(500).json({ error: "Failed to join game" });
  }
});
```

### Step 6.4: Register Game Routes

Update `src/backend/server.ts` - add game routes:
```typescript
import gamesRouter from "./routes/games";

// ... other routes ...

app.use("/games", gamesRouter);
```

---

## Part 7: Socket.IO Game Rooms

### Step 7.1: Add Game Room Joining to Socket Init

Update `src/backend/sockets/init.ts`:
```typescript
import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import { GLOBAL_ROOM } from "../../shared/keys";
import { sessionMiddleware } from "../config/session";
import { Games } from "../db";
import logger from "../lib/logger";
import { User } from "../../shared/types";

export const initSockets = (httpServer: HTTPServer) => {
  const io = new Server(httpServer);

  io.engine.use(sessionMiddleware);

  io.on("connection", async (socket) => {
    // @ts-ignore
    const session = socket.request.session as { id: string; user: User };

    logger.info(`socket for user ${session.user.username} established`);

    socket.join(session.id);
    socket.join(GLOBAL_ROOM);

    try {
      const games = await Games.getByUser(session.user.id);

      games.forEach(({ game_id }) => {
        socket.join(`game:${game_id}`);
        logger.info(`user ${session.user.id} added to room game:${game_id}`);
      });
    } catch (error: unknown) {
      logger.error(`Error joining game rooms for user ${session.user.id}`);
    }

    socket.on("close", () => {
      logger.info(`socket for user ${session.user.username} closed`);
    });
  });

  return io;
};
```

> **💡 Teaching Moment:** When a user connects via Socket.IO:
> 1. Join their session room (for private messages)
> 2. Join the global room (for broadcasts to all users)
> 3. Query database for all games they're part of
> 4. Join each game's room (`game:${game_id}`) for game-specific events
>
> This allows targeted broadcasting: `io.to("game:123").emit("turn", data)` will only reach players in game 123.

---

## Part 8: Game Lobby View

### Step 8.1: Create Lobby View

Create `src/backend/views/lobby.ejs`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Lobby</title>
  <link rel="stylesheet" href="/js/bundle.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>Game Lobby</h1>
      <p>Welcome, <%= user.username %>!</p>
    </header>

    <section class="create-game">
      <h2>Create New Game</h2>
      <form id="create-game-form">
        <div class="form-group">
          <label for="game-name">Game Name (optional)</label>
          <input type="text" id="game-name" name="name" placeholder="Enter game name">
        </div>
        <div class="form-group">
          <label for="max-players">Max Players</label>
          <input type="number" id="max-players" name="maxPlayers" value="4" min="2" max="8">
        </div>
        <button type="submit">Create Game</button>
      </form>
    </section>

    <section class="game-list">
      <h2>Available Games</h2>
      <div id="games-listing">
        <!-- Games will be loaded here -->
      </div>
    </section>
  </div>

  <template id="template-game-item">
    <div class="game-item">
      <div class="game-info">
        <h3 class="game-name"></h3>
        <p class="game-players"></p>
      </div>
      <button class="join-button">Join</button>
    </div>
  </template>

  <script type="module" src="/js/lobby.js"></script>
</body>
</html>
```

### Step 8.2: Create Lobby Route

Create `src/backend/routes/lobby.ts`:
```typescript
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.render("lobby", { user: req.session.user });
});

export default router;
```

Register in `src/backend/server.ts`:
```typescript
import lobbyRouter from "./routes/lobby";

// ... other routes ...

app.use("/lobby", lobbyRouter);
```

---

## Part 9: Lobby Frontend Logic

### Step 9.1: Create Game List Loader

Create `src/frontend/lobby/load-games.ts`:
```typescript
import { Game } from "../../shared/types";

export const loadGames = async (): Promise<Game[]> => {
  try {
    const response = await fetch("/games", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load games");
    }

    const data = await response.json();
    return data.games || [];
  } catch (error) {
    console.error("Error loading games:", error);
    return [];
  }
};
```

### Step 9.2: Create Lobby Main Script

Create `src/frontend/lobby.ts`:
```typescript
import type { Game } from "../shared/types";
import { loadGames } from "./lobby/load-games";

const gamesListing = document.querySelector<HTMLDivElement>("#games-listing")!;
const createGameForm = document.querySelector<HTMLFormElement>("#create-game-form")!;
const gameTemplate = document.querySelector<HTMLTemplateElement>("#template-game-item")!;

const renderGame = (game: Game) => {
  const clone = gameTemplate.content.cloneNode(true) as DocumentFragment;

  const nameElement = clone.querySelector(".game-name")!;
  nameElement.textContent = game.name || `Game #${game.id}`;

  const playersElement = clone.querySelector(".game-players")!;
  playersElement.textContent = `Players: ${(game as any).player_count || 0} / ${game.max_players}`;

  const joinButton = clone.querySelector<HTMLButtonElement>(".join-button")!;
  joinButton.dataset.gameId = game.id.toString();

  joinButton.addEventListener("click", async () => {
    try {
      const response = await fetch(`/games/${game.id}/join`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log(`Joined game ${game.id}`);
        // Reload games to update player count
        await refreshGameList();
      }
    } catch (error) {
      console.error("Failed to join game:", error);
    }
  });

  gamesListing.appendChild(clone);
};

const refreshGameList = async () => {
  gamesListing.innerHTML = "";
  const games = await loadGames();
  games.forEach(renderGame);
};

// Create game form handler
createGameForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(createGameForm);
  const name = formData.get("name") as string;
  const maxPlayers = parseInt(formData.get("maxPlayers") as string);

  try {
    const response = await fetch("/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: name || undefined, maxPlayers }),
    });

    if (response.ok) {
      createGameForm.reset();
      await refreshGameList();
    }
  } catch (error) {
    console.error("Failed to create game:", error);
  }
});

// Load initial games
refreshGameList();
```

---

## Part 10: Deploy to Render

### Step 10.1: Commit Changes

```bash
git add -A
git commit -m "feat: add game lobby with deployment configuration

- Move types to src/shared/ for better organization
- Reorganize CSS files into styles/ directory structure
- Configure Render deployment (TypeScript in prod deps)
- Add games and game_players tables with migrations
- Implement game creation, joining, and listing
- Add Socket.IO game room joining for targeted broadcasts
- Create lobby view and frontend logic
- Fix trust proxy for secure cookies behind Render proxy

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 10.2: Push to Render

```bash
git push origin main
```

### Step 10.3: Run Migrations on Render

In Render dashboard, open shell and run:
```bash
npm run migrate:up
```

---

## Part 11: CSS Styling Approaches

Now let's compare two modern approaches to styling: Modern CSS with nesting vs Tailwind CSS.

### CSS Display Types Quick Reference

Before we dive into styling, let's understand the main CSS `display` properties you'll see:

**`display: block`** (default for `<div>`, `<p>`, `<h1>`, etc.)
- Takes full width available
- Stacks vertically
- Respects width/height properties
- Example: Normal document flow

**`display: inline`** (default for `<span>`, `<a>`, etc.)
- Only takes up as much width as content needs
- Flows horizontally with text
- Ignores width/height properties
- Example: Text within a paragraph

**`display: inline-block`**
- Flows horizontally like inline
- Respects width/height like block
- Example: Buttons in a row

**`display: flex`** ⭐ Modern layout tool
- One-dimensional layout (row OR column)
- Great for alignment and distribution
- Children can grow/shrink to fill space
- Use for: navigation bars, card layouts, centering items

```css
.game-item {
  display: flex;                    /* Enable flexbox */
  justify-content: space-between;   /* Horizontal alignment */
  align-items: center;              /* Vertical alignment */
  gap: 1rem;                        /* Space between children */
}
```

**`display: grid`** ⭐ Modern layout tool
- Two-dimensional layout (rows AND columns)
- Precise control over rows and columns
- Responsive layouts with `auto-fill` and `minmax`
- Use for: page layouts, image galleries, card grids

```css
#games-listing {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
/* This creates a responsive grid:
   - Columns are at least 300px wide
   - As many columns as will fit
   - Remaining space distributed equally (1fr = 1 fraction)
*/
```

**`display: none`**
- Element completely removed from layout
- Takes up no space
- Use for: hiding elements, modals, conditional rendering

> **💡 When to use which:**
> - **Flex:** One direction, items need to align/distribute (navbar, button groups)
> - **Grid:** Two directions, need precise row/column control (page layouts, galleries)
> - **Block:** Default stacking behavior is fine
> - **Inline/Inline-block:** Text-flow behavior needed

### Approach A: Modern CSS with Nesting

Update `src/frontend/styles/components/lobby.css`:
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  & header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e0e0e0;

    & h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    & p {
      color: #666;
      font-size: 1rem;
    }
  }

  & section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    & h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #333;
    }
  }
}

.create-game {
  .form-group {
    margin-bottom: 1rem;

    & label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #444;
    }
  }
}

.game-list {
  #games-listing {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .game-item {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;

    &:hover {
      border-color: #4a90e2;
      box-shadow: 0 2px 8px rgba(74, 144, 226, 0.15);
    }

    .game-info {
      flex: 1;

      .game-name {
        font-size: 1.125rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
      }

      .game-players {
        font-size: 0.875rem;
        color: #666;
      }
    }

    .join-button {
      padding: 0.5rem 1.25rem;
      background: #4a90e2;

      &:hover {
        background: #357abd;
      }
    }
  }
}
```

Update `src/frontend/styles/main.css`:
```css
@import './base.css';
@import './components/forms.css';
@import './components/lobby.css';
```

**Build process:**
```json
{
  "devDependencies": {
    "postcss": "^8.4.49",
    "postcss-nesting": "^13.0.1"
  }
}
```

Create `postcss.config.js`:
```javascript
export default {
  plugins: {
    'postcss-nesting': {},
    'autoprefixer': {}
  }
}
```

> **💡 Pros of Modern CSS:**
> - Familiar CSS syntax
> - Full control over styling
> - Easy to customize
> - Smaller bundle size (only what you write)
> - Works with standard CSS tooling
>
> **💡 Cons:**
> - More code to write
> - Need to manage class naming
> - Requires PostCSS build step for nesting

### Approach B: Tailwind CSS

Update `src/backend/views/lobby.ejs` with Tailwind classes:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Lobby</title>
  <link rel="stylesheet" href="/js/bundle.css">
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <header class="mb-8 pb-4 border-b-2 border-gray-200">
      <h1 class="text-3xl font-semibold mb-2">Game Lobby</h1>
      <p class="text-gray-600">Welcome, <%= user.username %>!</p>
    </header>

    <section class="mb-8 p-6 bg-white rounded-lg shadow-sm">
      <h2 class="text-2xl mb-4 text-gray-800">Create New Game</h2>
      <form id="create-game-form">
        <div class="mb-4">
          <label for="game-name" class="block mb-2 font-medium text-gray-700">
            Game Name (optional)
          </label>
          <input
            type="text"
            id="game-name"
            name="name"
            placeholder="Enter game name"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
        <div class="mb-4">
          <label for="max-players" class="block mb-2 font-medium text-gray-700">
            Max Players
          </label>
          <input
            type="number"
            id="max-players"
            name="maxPlayers"
            value="4"
            min="2"
            max="8"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Create Game
        </button>
      </form>
    </section>

    <section class="p-6 bg-white rounded-lg shadow-sm">
      <h2 class="text-2xl mb-4 text-gray-800">Available Games</h2>
      <div id="games-listing" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Games will be loaded here -->
      </div>
    </section>
  </div>

  <template id="template-game-item">
    <div class="p-4 border border-gray-300 rounded-md flex justify-between items-center hover:border-blue-500 hover:shadow-md transition-all">
      <div class="flex-1">
        <h3 class="game-name text-lg font-medium mb-1"></h3>
        <p class="game-players text-sm text-gray-600"></p>
      </div>
      <button class="join-button px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
        Join
      </button>
    </div>
  </template>

  <script type="module" src="/js/lobby.js"></script>
</body>
</html>
```

Simplify `src/frontend/styles/base.css` for Tailwind:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Configure Tailwind in `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/frontend/**/*.{ts,js}",
    "./src/backend/views/**/*.ejs",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

> **💡 Pros of Tailwind:**
> - Very fast development (no context switching)
> - Consistent design system out of the box
> - Smaller final CSS bundle (unused classes purged)
> - Mobile-first responsive design built-in
> - No naming conflicts
>
> **💡 Cons:**
> - HTML can look cluttered
> - Learning curve for utility names
> - Harder to share styles between elements
> - Need build process with PurgeCSS

### Comparison Summary

**Modern CSS with Nesting:**
```css
.game-item {
  padding: 1rem;

  &:hover {
    border-color: #4a90e2;
  }

  .game-name {
    font-size: 1.125rem;
  }
}
```

**Tailwind CSS:**
```html
<div class="p-4 hover:border-blue-500">
  <h3 class="game-name text-lg"></h3>
</div>
```

**Choose Modern CSS when:**
- You want full creative control
- You prefer separation of concerns (CSS files separate from HTML)
- You're working on a unique design that doesn't fit a framework

**Choose Tailwind when:**
- You want rapid prototyping
- You're building with a team and want consistency
- You want a battle-tested responsive design system
- You prefer utility-first approach

---

## Testing Checklist

- [ ] `npm run build` succeeds
- [ ] Views copied to `dist/backend/views/`
- [ ] CSS bundled to `dist/backend/public/js/bundle.css`
- [ ] JS bundled to `dist/backend/public/js/*.js`
- [ ] Migrations run successfully
- [ ] Can create a game
- [ ] Can join a game
- [ ] Game list updates after creation/join
- [ ] Socket connects and joins game rooms
- [ ] Deployment to Render succeeds
- [ ] Production app loads and functions

---

## Common Issues

**Issue:** "Cannot find module '../../shared/types'"
**Fix:** Ensure types file moved to `src/shared/types.ts` and imports updated

**Issue:** "Failed to lookup view"
**Fix:** Check `scripts/copy-views.js` outputs to `dist/backend/views/`

**Issue:** CSS not loading
**Fix:** Check vite.config.ts `assetFileNames` returns `"bundle.css"` not `"js/bundle.css"`

**Issue:** Session not persisting on Render
**Fix:** Ensure `app.set("trust proxy", 1)` in server.ts

**Issue:** Migrations fail on Render
**Fix:** Check `.pgmigraterc.json` exists and `tsx` is in dependencies

---

## Next Steps

After completing this guide, you'll have:
- ✅ A deployed TypeScript/Express app on Render
- ✅ Game lobby with create/join functionality
- ✅ Socket.IO real-time connections with game rooms
- ✅ Clean code organization with shared types
- ✅ Understanding of both Modern CSS and Tailwind approaches

**Future enhancements:**
- Real-time game list updates via Socket.IO
- Game state management (starting, playing, completing)
- Player presence indicators
- Game chat functionality
- Turn-based game logic
