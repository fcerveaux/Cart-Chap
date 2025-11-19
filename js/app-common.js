// js/app-common.js
// Utilitaires communs SANS import/export, tout en global

async function compressToBase64Gzip(text) {
  const enc = new TextEncoder().encode(text);
  if ('CompressionStream' in window) {
    const cs = new CompressionStream('gzip');
    const compressed = await new Response(
      new Response(enc).body.pipeThrough(cs)
    ).arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(compressed)));
  }
  // Fallback sans compression
  return btoa(String.fromCharCode(...enc));
}

async function decompressFromBase64Gzip(b64) {
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  if ('DecompressionStream' in window) {
    const ds = new DecompressionStream('gzip');
    const decompressed = await new Response(
      new Response(bin).body.pipeThrough(ds)
    ).arrayBuffer();
    return new TextDecoder().decode(decompressed);
  }
  return new TextDecoder().decode(bin);
}

function downloadJSON(obj, filename = "mon-jeu.escape.json") {
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 0);
}

async function uploadJSONFile(file) {
  const text = await file.text();
  return JSON.parse(text);
}

function randomCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

// Construit une URL player.html#g=... avec le jeu dedans (base64+gzip)
async function toHashURL(game) {
  const s = JSON.stringify(game);
  const b64 = await compressToBase64Gzip(s);
  const url = new URL("player.html", window.location.origin + window.location.pathname.replace(/[^/]*$/, ""));
  url.hash = "#g=" + encodeURIComponent(b64);
  return url.toString();
}

// Récupère le jeu depuis location.hash
async function fromHashURL() {
  const m = window.location.hash.match(/#g=(.+)$/);
  if (!m) return null;
  const b64 = decodeURIComponent(m[1]);
  try {
    const json = await decompressFromBase64Gzip(b64);
    return json;
  } catch (e) {
    // fallback base64 brut
    return atob(b64);
  }
}

// QR factice (placeholder)
function makeQRCanvas(text) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#000";
  ctx.fillRect(16, 16, 224, 224);
  ctx.fillStyle = "#fff";
  ctx.fillRect(32, 32, 192, 192);
  ctx.fillStyle = "#000";
  ctx.fillRect(48, 48, 32, 32);
  ctx.fillRect(176, 48, 32, 32);
  ctx.fillRect(48, 176, 32, 32);
  ctx.fillStyle = "#000";
  ctx.font = "12px monospace";
  ctx.fillText("QR à remplacer", 70, 240);
  return c;
}

// Avertissement pour liens externes (utilise un <dialog> avec id extWarn)
function externalLinkWithWarning(anchor) {
  const dlg = document.getElementById("extWarn");
  if (!dlg) {
    // Pas de dialog : on ouvre directement
    window.open(anchor.href, "_blank", "noopener,noreferrer");
    return;
  }
  const btnC = dlg.querySelector("#extContinue");
  const btnX = dlg.querySelector("#extCancel");
  btnX.onclick = () => dlg.close();
  btnC.onclick = () => {
    window.open(anchor.href, "_blank", "noopener,noreferrer");
    dlg.close();
  };
  dlg.showModal();
}
