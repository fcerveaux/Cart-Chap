import { fromHashURL } from './app-common.js';


const paste = document.getElementById('paste');
const startBtn = document.getElementById('startBtn');
const gameSec = document.getElementById('game');
const title = document.getElementById('gTitle');
const stage = document.getElementById('stage');


async function tryLoadFromHash(){
const j = await fromHashURL();
if(!j) return null;
try{ return JSON.parse(j); } catch{ return null; }
}


function renderGame(g){
title.textContent = g.title || 'Jeu';
stage.innerHTML = '';
let idx = 0;
const renderCard = ()=>{
const c = g.cards[idx]; if(!c){ stage.innerHTML = '<p>Terminé. Bravo !</p>'; return; }
const el = document.createElement('div'); el.className='cc-card';
el.innerHTML = `
<h3>${c.title||'Étape '+(idx+1)}</h3>
<p>${(c.prompt||'').replace(/\n/g,'<br>')}</p>
${c.media? `<div class="media">${mediaElement(c.media)}</div>`:''}
<div class="ans">
<input id="answer" placeholder="Réponse (optionnel)">
<button id="validate" class="cc-btn">Valider</button>
</div>`;
stage.appendChild(el);
el.querySelector('#validate').onclick = ()=>{
const val = el.querySelector('#answer').value.trim();
if((c.answer||'') && val.toLowerCase() !== c.answer.toLowerCase()){
alert('Essaie encore !'); return;
}
idx++; renderCard();
};
// Activer l'avertissement pour liens externes
el.querySelectorAll('a[target=_blank]').forEach(a=>{
a.addEventListener('click', (e)=>{ e.preventDefault(); externalLinkWarning(a); });
});
};
renderCard();
}


function mediaElement(url){
const u = new URL(url, location.href);
if(/\.(mp4|webm|ogg)$/i.test(u.pathname)){
return `<video src="${u}" controls playsinline></video>`;
}
if(/\.(mp3|wav|ogg)$/i.test(u.pathname)){
return `<audio src="${u}" controls></audio>`;
}
if(/\.(png|jpe?g|gif|svg|webp)$/i.test(u.pathname)){
return `<img src="${u}" alt="">`;
}
// lien externe (non embed)
return `<p><a href="${u}" target="_blank" rel="noopener noreferrer" class="cc-link-ext">Ouvrir le site externe</a></p>`;
}


function externalLinkWarning(anchor){
const dlg = document.getElementById('extWarn');
const btnC = document.getElementById('extContinue');
const btnX = document.getElementById('extCancel');
btnX.onclick = ()=> dlg.close();
btnC.onclick = ()=>{ window.open(anchor.href,'_blank','noopener,noreferrer'); dlg.close(); };
dlg.showModal();
}


startBtn.onclick = async ()=>{
let g = await tryLoadFromHash();
if(!g){
if(paste.value.trim()){ try{ g = JSON.parse(paste.value); } catch{ alert('JSON invalide'); return; } }
}
if(!g){ alert('Aucun jeu fourni. Coller un JSON ou utiliser un lien avec #g='); return; }
gameSec.hidden = false; renderGame(g);
};
