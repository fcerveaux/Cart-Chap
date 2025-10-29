import { downloadJSON, uploadJSONFile, randomCode, toHashURL, compressToBase64Gzip, makeQRCanvas } from './app-common.js';
li.innerHTML = `
<label>Titre carte <input data-k="title" data-i="${idx}" value="${c.title||''}"></label>
<label>Énoncé <textarea data-k="prompt" data-i="${idx}">${c.prompt||''}</textarea></label>
<label>Réponse attendue (optionnel) <input data-k="answer" data-i="${idx}" value="${c.answer||''}"></label>
<label>Média auto‑hébergé (URL interne) <input data-k="media" data-i="${idx}" value="${c.media||''}" placeholder="https://serveur-academie/..."></label>
<div style="display:flex;gap:.5rem;margin-top:.5rem">
<button data-act="up" data-i="${idx}" class="cc-btn ghost">↑</button>
<button data-act="down" data-i="${idx}" class="cc-btn ghost">↓</button>
<button data-act="del" data-i="${idx}" class="cc-btn danger">Supprimer</button>
</div>
`;
cards.appendChild(li);
});
}


function bind(){
title.oninput = ()=>{ game.title = title.value; markDirty(); };
subject.oninput = ()=>{ game.subject = subject.value; markDirty(); };
duration.oninput = ()=>{ game.duration = parseInt(duration.value||'0',10)||null; markDirty(); };


cards.addEventListener('input', (e)=>{
const t = e.target; const i = +t.dataset.i; const k = t.dataset.k;
if(Number.isFinite(i) && k){ game.cards[i][k] = t.value; markDirty(); }
});
cards.addEventListener('click', (e)=>{
const t = e.target; const i = +t.dataset.i; const act = t.dataset.act;
if(!Number.isFinite(i) || !act) return;
if(act==='del'){ game.cards.splice(i,1); }
if(act==='up' && i>0){ [game.cards[i-1], game.cards[i]] = [game.cards[i], game.cards[i-1]]; }
if(act==='down' && i<game.cards.length-1){ [game.cards[i+1], game.cards[i]] = [game.cards[i], game.cards[i+1]]; }
markDirty(); render();
});


addCard.onclick = ()=>{ game.cards.push({title:'',prompt:'',answer:'',media:''}); markDirty(); render(); };


importBtn.onclick = ()=> fileInput.click();
fileInput.onchange = async ()=>{
const file = fileInput.files[0]; if(!file) return;
try{ game = await uploadJSONFile(file); dirty=false; render(); alert('Jeu importé.'); }
catch(e){ alert('Fichier invalide'); }
finally{ fileInput.value=''; }
};


downloadBtn.onclick = ()=>{ downloadJSON(game); dirty=false; };


shareHashBtn.onclick = async ()=>{
const url = await toHashURL(game); shareOut.hidden=false; shareLink.value = url;
};
copyLink.onclick = ()=>{ shareLink.select(); document.execCommand('copy'); };


exportLoaderBtn.onclick = async ()=>{
// Charge le template et remplace %%PAYLOAD%% par le JSON compressé base64 (gzip)
const tpl = await fetch('share-loader-template.html').then(r=>r.text());
const payload = await compressToBase64Gzip(JSON.stringify(game));
const html = tpl.replace('%%PAYLOAD%%', payload);
const code = randomCode();
const blob = new Blob([html], {type:'text/html'});
const a = document.createElement('a');
a.href = URL.createObjectURL(blob); a.download = code + '.html'; a.click();
setTimeout(()=> URL.revokeObjectURL(a.href), 0);
alert('Loader exporté : ' + code + '.html\nDépose ce fichier sur le serveur de l’établissement (ou dans le repo), puis donne ce lien aux élèves.');
};


qrBtn.onclick = ()=>{
const url = shareLink.value.trim(); if(!url){ alert('Génère d’abord un lien.'); return; }
qrDiv.innerHTML=''; qrDiv.appendChild(makeQRCanvas(url));
};


// Avertissement de fermeture si non téléchargé
let wantToLeave = false;
window.addEventListener('beforeunload', (e)=>{
if(dirty && !wantToLeave){ e.preventDefault(); e.returnValue=''; return ''; }
});
stayBtn.onclick = ()=> leaveWarn.close();
leaveBtn.onclick = ()=>{ wantToLeave = true; leaveWarn.close(); window.close(); };
// Si l’utilisateur tente de fermer via raccourci, on laisse beforeunload faire le job.
}


render();
bind();
