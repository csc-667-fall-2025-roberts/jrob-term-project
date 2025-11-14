## Issues We Hit During Live Coding (and Fixes)

Hey everyone! Here are the four main issues we encountered during today's session and how we fixed them:

### 1️⃣ Start Script Path Wrong
**The Bug:** Render couldn't find the compiled server file
```
Error: Cannot find module '/opt/render/project/src/dist/server.js'
```

**The Fix:** TypeScript preserves directory structure when compiling, so `src/backend/server.ts` becomes `dist/backend/server.js`, not `dist/server.js`
```diff
- "start": "node dist/server.js"
+ "start": "node dist/backend/server.js"
```
**Lesson:** Check where your build output actually goes! TypeScript's `outDir` + your source structure determines the path.

---

### 2️⃣ Migration Scripts Failing on Render
**The Bug:** Typo in `package.json` - wrote `NODE_OPTION` instead of `NODE_OPTIONS`
```diff
- "migrate:up": "NODE_OPTION='--import tsx' node-pg-migrate up"
+ "migrate:up": "NODE_OPTIONS='--import tsx' node-pg-migrate up"
```
**Lesson:** Environment variable names matter! The extra 'S' is required.

---

### 3️⃣ Game Listing Race Condition
**The Bug:** We were calling `loadGames()` immediately on page load, but the Socket.IO connection wasn't ready yet. I worked around this with `setTimeout(..., 5)` which is **bad practice** - never rely on timing!

**The Fix:** Wait for Socket.IO's `"connect"` event:
```javascript
// ❌ BAD - relies on timing
loadGames();

// ✅ GOOD - waits for actual connection
socket.on("connect", () => {
  loadGames();
});
```

**Lesson:** Use events, not timeouts. Socket.IO tells you when it's ready - listen for it!

---

### 4️⃣ Why Do We Need `type="module"` in Script Tags?
**The Question:** Shouldn't Vite transpile everything to "normal" JavaScript?

**The Answer:** It does! But "normal" JavaScript in 2025 means **ES Modules** - the modern standard.

```html
<script type="module" src="/js/lobby.js" defer></script>
```

**Why this is correct:**
- ✅ Supported by 95%+ of browsers (Chrome 61+, Firefox 60+, Safari 11+)
- ✅ Smaller bundles (better tree-shaking)
- ✅ Proper dependency management
- ✅ The modern web standard

**Lesson:** `type="module"` isn't a workaround - it's the **right way** to do modern JavaScript. We're not transpiling to old-style JavaScript because we don't need to support ancient browsers.

---

All fixes are committed to `main`. See `FIXES.md` for detailed explanations and alternative approaches we could have taken.

Questions? Drop them in the thread 👇
