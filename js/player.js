// js/player.js
// Joueur Cart'chap — affiche les cartes, illustration, badge, médias et liens externes

const pasteEl = document.getElementById("paste");
const startBtn = document.getElementById("startBtn");
const gameSec = document.getElementById("game");
const titleElP = document.getElementById("gTitle");
const stageEl = document.getElementById("stage");

// Essaie de récupérer un jeu depuis le hash #g=...
async function tryLoadFromHashGame() {
  if (!window.location.hash.includes("#g=")) return null;
  const jsonString = await fromHashURL(); // fonction globale définie dans app-common.js
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("JSON invalide dans le hash", e);
    return null;
  }
}

// Choisit le bon type d'élément pour une ressource média
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

  // Lien externe, ouvert dans un nouvel onglet après avertissement
  return `<p><a href="${u}" target="_blank" rel="noopener noreferrer" class="cc-link-ext">Ouvrir le site externe</a></p>`;
}

// Affiche le jeu
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

    const card = {
      title: c.title || "",
      prompt: c.prompt || "",
      answer: c.answer || "",
      media: c.media || "",
      illustration: c.illustration || "",
      badge: c.badge || ""
    };

    const el = document.createElement("div");
    el.className = "cc-card";
    el.innerHTML = `
      <div class="cc-card-title">
        <h3>${card.title || "Étape " + (idx + 1)}</h3>
        ${card.badge ? `<span class="cc-badge">${card.badge}</span>` : ""}
      </div>
      <p>${(card.prompt || "").replace(/\n/g, "<br>")}</p>
      ${card.illustration ? `<pre class="cc-art">${card.illustration}</pre>` : ""}
      ${card.media ? `<div class="media">${mediaElement(card.media)}</div>` : ""}
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
      if (card.answer && val.toLowerCase() !== card.answer.toLowerCase()) {
        alert("Essaie encore !");
        return;
      }
      idx++;
      renderCard();
    };

    // Lien(s) externe(s) avec pop-up d'avertissement cookies/traceurs
    el.querySelectorAll("a.cc-link-ext").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        externalLinkWithWarning(a); // fonction globale de app-common.js
      });
    });
  }

  renderCard();
}

// Bouton "Démarrer"
startBtn.onclick = async () => {
  let game = await tryLoadFromHashGame();

  if (!game && pasteEl.value.trim()) {
    try {
      game = JSON.parse(pasteEl.value);
    } catch (e) {
      alert("JSON invalide");
      return;
    }
  }

  if (!game) {
    alert("Aucun jeu fourni. Utilise un lien avec #g= ou colle un JSON dans la zone prévue.");
    return;
  }

  if (!Array.isArray(game.cards)) {
    alert("Format de jeu invalide (pas de cartes).");
    return;
  }

  gameSec.hidden = false;
  renderGame(game);
};
