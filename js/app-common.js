// Utilitaires communs (compression, hash, fichier, QR minimal)
export async function decompressFromBase64Gzip(b64){
const bin = Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
if ('DecompressionStream' in window){
const ds = new DecompressionStream('gzip');
const buf = await new Response(new Response(bin).body.pipeThrough(ds)).arrayBuffer();
return new TextDecoder().decode(buf);
}
return new TextDecoder().decode(bin);
}


export function downloadJSON(obj, filename="mon-jeu.escape.json"){
const blob = new Blob([JSON.stringify(obj)], {type:"application/json"});
const a = document.createElement('a');
a.href = URL.createObjectURL(blob); a.download = filename; a.click();
setTimeout(()=> URL.revokeObjectURL(a.href), 0);
}


export async function uploadJSONFile(file){
const text = await file.text();
return JSON.parse(text);
}


export function randomCode(len=6){
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let out=''; for(let i=0;i<len;i++){ out += alphabet[Math.floor(Math.random()*alphabet.length)]; }
return out; // pour nommer le loader: ABC123.html
}


export function toHashURL(game){
const s = JSON.stringify(game);
// On tente gzip pour raccourcir, sinon brut
return compressToBase64Gzip(s).then(b64=>{
const url = new URL('./player.html', location.origin + location.pathname);
url.hash = '#g=' + encodeURIComponent(b64);
return url.toString();
});
}


export function fromHashURL(){
const m = location.hash.match(/#g=(.+)$/);
if(!m) return null;
const b64 = decodeURIComponent(m[1]);
return decompressFromBase64Gzip(b64).catch(()=> atob(b64));
}


export function makeQRCanvas(text){
// QR minimal via API Canvas (non optimal). Pour production, tu peux remplacer par une lib locale.
const c = document.createElement('canvas');
c.width = c.height = 256;
const ctx = c.getContext('2d');
ctx.fillStyle = '#fff'; ctx.fillRect(0,0,256,256);
ctx.fillStyle = '#000';
// Placeholder simple: on dessine un motif + texte (à remplacer par vraie QR lib si souhaité)
ctx.fillRect(16,16,224,224);
ctx.fillStyle = '#fff'; ctx.fillRect(32,32,192,192);
ctx.fillStyle = '#000'; ctx.fillRect(48,48,32,32); ctx.fillRect(176,48,32,32); ctx.fillRect(48,176,32,32);
ctx.fillStyle = '#000'; ctx.font = '12px monospace'; ctx.fillText('QR à remplacer', 70, 240);
return c; // NOTE: placeholder. Pour un vrai QR, intégrer une lib locale ultérieurement.
}


export function externalLinkWithWarning(anchor){
const dlg = document.getElementById('extWarn') || document.getElementById('extWarning');
if(!dlg){ window.open(anchor.href, '_blank','noopener'); return; }
const cont = dlg.querySelector('#extContinue');
const cancel = dlg.querySelector('#extCancel');
const handler = (e)=>{ e.preventDefault(); };
cancel.onclick = ()=> dlg.close();
cont.onclick = ()=>{ window.open(anchor.href, '_blank','noopener,noreferrer'); dlg.close(); };
dlg.showModal();
}
