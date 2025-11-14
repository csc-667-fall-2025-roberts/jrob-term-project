# Bug Fixes - Deployment and Socket Issues

This document explains the four main issues encountered during live coding and their solutions.

---

## Issue 1: Start Script Path Incorrect ❌ → ✅

### Problem
Render deployment failing with: `Error: Cannot find module '/opt/render/project/src/dist/server.js'`

### Root Cause
The TypeScript compiler preserves directory structure when compiling. Since `src/backend/server.ts` is the entry point, it compiles to `dist/backend/server.js`, not `dist/server.js`.

### Fix
**File:** `package.json` (line 9)

```diff
- "start": "node dist/server.js",
+ "start": "node dist/backend/server.js",
```

### Explanation
TypeScript's `outDir` option (`./dist`) combined with the source structure (`src/backend/`) means the compiled output preserves the directory hierarchy:
- `src/backend/server.ts` → `dist/backend/server.js`
- `src/shared/types.ts` → `dist/shared/types.js`

The start command must match the actual compiled file location.

---

## Issue 2: Migration Scripts Not Working ❌ → ✅

### Problem
Migrations were failing with the error: `NODE_OPTION: command not found`

### Root Cause
Typo in `package.json` scripts - used `NODE_OPTION` instead of `NODE_OPTIONS`

### Fix
**File:** `package.json` (lines 15-16)

```diff
- "migrate:up": "NODE_OPTION='--import tsx' node-pg-migrate up",
- "migrate:down": "NODE_OPTION='--import tsx' node-pg-migrate down"
+ "migrate:up": "NODE_OPTIONS='--import tsx' node-pg-migrate up",
+ "migrate:down": "NODE_OPTIONS='--import tsx' node-pg-migrate down"
```

### Explanation
`NODE_OPTIONS` is the correct environment variable for passing Node.js runtime options. The extra 'S' matters! This variable tells Node.js to preload the `tsx` module, which allows running TypeScript files directly.

---

## Issue 3: Socket Race Condition with Game Listing ❌ → ✅

### Problem
Game listing via WebSocket wasn't working reliably. Adding a `setTimeout` delay fixed it temporarily, indicating a race condition.

### Root Cause
The frontend was making an HTTP request to `/games` immediately on page load (line 20 in `lobby.ts`), but the Socket.IO connection might not have been established yet. The backend tries to respond via `io.to(sessionId).emit(GAME_LISTING, games)`, but if the socket isn't connected, the message is lost.

**The Issue:**
```typescript
// lobby.ts
const socket = socketIo();  // Connection starts but isn't instant

socket.on(EVENTS.GAME_LISTING, (games) => { /* handler registered */ });

loadGames();  // ❌ Immediately calls fetch("/games")
              // Socket might not be connected yet!
```

**The Workaround (Hacky):**
```typescript
// load-games.ts
export const loadGames = () => {
  setTimeout(() => fetch("/games", { credentials: "include" }), 5);
  // ❌ Relying on timing - not reliable!
};
```

### Fix

**File:** `src/frontend/lobby.ts` (lines 20-24)

```diff
- loadGames();
+ // Wait for socket connection before loading games to avoid race condition
+ socket.on("connect", () => {
+   console.log("Socket connected, loading games...");
+   loadGames();
+ });
```

**File:** `src/frontend/lobby/load-games.ts` (line 7)

```diff
  export const loadGames = () => {
-   setTimeout(() => fetch("/games", { credentials: "include" }), 5);
+   fetch("/games", { credentials: "include" });
  };
```

### Explanation
Socket.IO emits a `"connect"` event when the connection is successfully established. By listening for this event and only calling `loadGames()` after connection, we guarantee the socket is ready to receive messages from the server.

**Flow:**
1. Page loads → Socket.IO starts connecting
2. Socket connects → `"connect"` event fires
3. `loadGames()` is called → HTTP request to `/games`
4. Server emits `GAME_LISTING` event → Socket receives it ✅

This is the **proper** Socket.IO pattern - no arbitrary delays, just event-driven logic.

### Alternative Architectures (For Discussion)

**Option A: Pure REST** (Simpler)
```typescript
// Backend - just return JSON
router.get("/", async (req, res) => {
  const games = await Games.list();
  res.json({ games });
});

// Frontend - no socket needed
const response = await fetch("/games");
const { games } = await response.json();
renderGames(games);
```

**Option B: Pure Socket** (More real-time)
```typescript
// Frontend - emit request
socket.emit("games:list");

// Backend - listen and respond
socket.on("games:list", async () => {
  const games = await Games.list();
  socket.emit(GAME_LISTING, games);
});
```

**Current Hybrid Approach** uses HTTP request + Socket response, which is unusual but works if timed correctly.

---

## Issue 4: Vite Requiring `type="module"` in Script Tags

### Problem
Vite was emitting `import` statements in the generated JavaScript, requiring `type="module"` in script tags to work. The question was: shouldn't Vite transpile this to regular JavaScript?

### Answer
**This is actually correct behavior!** Here's why:

### Why `type="module"` is CORRECT

Vite outputs **ES Modules (ESM)** by default, which is the modern JavaScript standard. This is intentional and recommended.

**Benefits of ES Modules:**
- ✅ Native browser support (all modern browsers)
- ✅ Better tree-shaking (smaller bundles)
- ✅ Proper dependency management
- ✅ Parallel loading and execution
- ✅ Strict mode by default

**The Build Output:**
```javascript
// dist/backend/public/js/lobby.js (excerpt)
import { io } from "./assets/keys-g5P_hOXI.js";
// ... rest of code
```

This requires `type="module"` in the HTML:
```html
<script type="module" src="/js/lobby.js" defer></script>
```

### Why NOT transpile to old-style JavaScript?

**Old approach (IIFE format):**
- Tried configuring `format: "iife"` in `vite.config.ts`
- **Failed** because IIFE doesn't support multiple entry points well
- Error: `"multiple inputs are not supported when 'output.inlineDynamicImports' is true"`

**Multiple entry points:**
```javascript
// vite.config.ts
input: {
  main: path.resolve(__dirname, "src/frontend/entrypoint.ts"),
  chat: path.resolve(__dirname, "src/frontend/chat.ts"),
  lobby: path.resolve(__dirname, "src/frontend/lobby.ts"),
}
```

With multiple entries, ES modules are the correct choice.

### Browser Support

`type="module"` is supported by:
- ✅ Chrome 61+ (2017)
- ✅ Firefox 60+ (2018)
- ✅ Safari 11+ (2017)
- ✅ Edge 79+ (2020)

**Coverage:** 95%+ of global users (source: caniuse.com)

### Final Configuration

**File:** `vite.config.ts` (lines 22-25)

```typescript
output: {
  // Output as ES modules (requires type="module" in script tags)
  // This is the modern approach and allows for multiple entry points
  format: "es",
  // ...
}
```

**File:** `src/backend/views/lobby/lobby.ejs` (lines 9-10)

```html
<script type="module" src="/js/chat.js" defer></script>
<script type="module" src="/js/lobby.js" defer></script>
```

### Teaching Moment

This is a great opportunity to discuss:
- Modern JavaScript standards (ES6+ modules)
- Browser support and progressive enhancement
- Build tool design decisions
- Why some "old ways" persist (IE11 support, etc.)

**The Modern Web:** ES modules are the standard. Build tools like Vite embrace this rather than transpiling everything to old formats. This results in smaller bundles and faster load times for 95%+ of users.

---

## Deployment Configuration Checklist

Ensure these are configured on Render:

### Environment Variables
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NODE_ENV=production` - Enables production optimizations
- ✅ `SESSION_SECRET` - Secret for session encryption

### Build Command
```bash
npm install && npm run build && npm run migrate:up
```

### Start Command
```bash
npm start
```

### Dependencies
Since Render doesn't install devDependencies by default, TypeScript and build tools must be in `dependencies`:

```json
{
  "dependencies": {
    "typescript": "^5.9.3",
    "vite": "^7.1.12",
    "tsx": "^4.20.6",
    "@types/*": "..."
  }
}
```

**Note:** This isn't ideal architecture (build tools should be dev deps), but it's a pragmatic solution for Render's default build process. Alternatives include:
- Custom build scripts
- Docker containers
- Pre-building locally and committing dist/

---

## Summary

| Issue | Root Cause | Fix | Status |
|-------|-----------|-----|--------|
| Start script path | TypeScript preserves src/ structure | Update to `dist/backend/server.js` | ✅ Fixed |
| Migrations failing | Typo: `NODE_OPTION` vs `NODE_OPTIONS` | Fixed typo in package.json | ✅ Fixed |
| Socket race condition | loadGames() called before socket connected | Wait for socket `"connect"` event | ✅ Fixed |
| `type="module"` required | Vite correctly outputs ES modules | Keep type="module" (it's correct!) | ✅ Explained |

All issues resolved. The application should now build and deploy successfully to Render.

---

## Testing

1. **Local build:**
   ```bash
   npm run build
   ```
   Should complete without errors.

2. **Local migrations:**
   ```bash
   npm run migrate:up
   ```
   Should run without "command not found" errors.

3. **Local dev server:**
   ```bash
   npm run dev
   ```
   Game listing should load immediately without delays.

4. **Render deployment:**
   Push to main branch, verify build succeeds and app runs.
