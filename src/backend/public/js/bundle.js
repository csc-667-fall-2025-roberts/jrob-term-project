"use strict";
(() => {
  // src/frontend/entrypoint.ts
  var button = document.querySelector("#test-button");
  button?.addEventListener("click", (event) => {
    event.preventDefault();
    setTimeout(() => {
      alert("you clicked around 1 seconds ago");
    }, 1e3);
  });
})();
//# sourceMappingURL=bundle.js.map
