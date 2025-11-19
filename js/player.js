// js/player.js
// Joueur Cart'chap — lit un jeu depuis le hash ou un JSON collé

const pasteEl = document.getElementById("paste");
const startBtn = document.getElementById("startBtn");
const gameSec = document.getElementById("game");
const titleElP = document.getElementById("gTitle");
const stageEl = document.getElementById("stage");

async function tryLoadFromHashGame() {
  const j = await fromHashURL(); // fonction globale de app-common.js
  if (!j) return null;
  try {
    return JSON.parse(j);
  } catch {
    return null;
  }
}

function mediaElement(url) {
  const u = new URL(url, window.location.href);
  const path = u.pathname.toLowerCase();

  if (path.match(/\.(mp4|webm|ogg)$/)) {
    return `<video src="${u}" controls playsinline></video>`;
  }
  if (path.match(/\.(mp3|wav|ogg)$/)) {
    return `<audio src="${u}" controls></audio>`;
  }
  if (path.match(/\.(png|jpe?g|gif|svg|webp)$/)) {
    return `<img src="${u}" alt="">`;
  }

  // Lien externe (non embed) avec avertissement
  return `<p><a href="${u}" target="_blank" rel="noopener noreferrer" class="cc-link-ext">Ouvrir le site externe</a></p>`;
}

function renderGame(g) {
  titleElP.textContent = g.title || "Jeu";
  stageEl.innerHTML = "";
  let idx = 0;

  function renderCard() {
    const c = g.cards[idx];
    if (!c) {
      stageEl.innerHTML = "<p>Terminé. Bravo !</p>";
      return;
    }

    const el = document.createElement("div");
    el.className = "cc-card";
    el.innerHTML = `
  <div class="cc-card-title">
    <h3>${c.title || "Étape " + (idx + 1)}</h3>
    ${c.badge ? `<span class="cc-badge">${c.badge}</span>` : ""}
  </div>
  <p>${(c.prompt || "").replace(/\n/g, "<br>")}</p>
  ${c.illustration ? `<pre class="cc-art">${c.illustration}</pre>` : ""}
  ${c.media ? `<div class="media">${mediaElement(c.media)}</div>` : ""}
  <div class="ans">
    <input id="answer" placeholder="Réponse (optionnel)">
    <button id="validate" class="cc-btn">Valider</button>
  </div>
`;
    stageEl.innerHTML = "";
    stageEl.appendChild(el);

    const validateBtn = el.querySelector("#validate");
    const ansInput = el.querySelector("#answer");

    validateBtn.onclick = () => {
      const val = ansInput.value.trim();
      if ((c.answer || "") && val.toLowerCase() !== c.answer.toLowerCase()) {
        alert("Essaie encore !");
        return;
      }
      idx++;
      renderCard();
    };

    // Gérer les liens externes avec avertissement
    el.querySelectorAll("a.cc-link-ext").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        externalLinkWithWarning(a); // fonction globale de app-common.js
      });
    });
  }

  renderCard();
}

startBtn.onclick = async () => {
  let g = await tryLoadFromHashGame();

  if (!g && pasteEl.value.trim()) {
    try {
      g = JSON.parse(pasteEl.value);
    } catch (e) {
      alert("JSON invalide");
      return;
    }
  }

  if (!g) {
    alert("Aucun jeu fourni. Utiliser un lien avec #g= ou coller un JSON.");
    return;
  }

  gameSec.hidden = false;
  renderGame(g);
};
