/* MODULE: apps.js */
(function(global){
  const { $, $$ } = global.UNO;
  async function loadApps(){
    const grid = $('#v-apps')?.querySelector('.grid');
    if(!grid) return;
    let list=[]; const local=localStorage.getItem('uno:apps'); if(local){ try{list=JSON.parse(local)||[];}catch{} }
    if(!list.length){ try{const r=await fetch('./apps/apps.json',{cache:'no-store'}); if(r.ok) list=await r.json();}catch{} }
    const card=document.createElement('div'); card.className='card'; card.style.display='grid'; card.style.gap='10px';
    if(!list.length){card.innerHTML='<div class="mut">Adicione apps via painel (📡 Importar apps.json) ou coloque /apps/apps.json.</div>'; grid.innerHTML=''; grid.appendChild(card); return;}
    list.forEach((app,i)=>{
      const gid='g'+i+Math.random().toString(36).slice(2,6);
      const svg=`<svg width="28" height="28" viewBox="0 0 24 24" style="flex:0 0 28px">
        <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff52e5"/><stop offset="100%" stop-color="#00c5e5"/></linearGradient></defs>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#${gid})"/>
        <path d="M6 6h5v5H6zM13 6h5v5h-5zM6 13h5v5H6zM13 13h5v5h-5z" fill="rgba(255,255,255,.85)"/>
      </svg>`;
      const row=document.createElement('div'); row.style.display='flex'; row.style.alignItems='center'; row.style.gap='10px';
      row.innerHTML=`${svg}<div style="flex:1"><div style="font-weight:800">${app.title||'App'}</div><div class="mut">${app.desc||''}</div></div><a class="btn" href="${app.url||'#'}" target="_self">Abrir</a>`;
      card.appendChild(row);
    });
    grid.innerHTML=''; grid.appendChild(card);
  }
  // IO buttons are provided by panel.js; optional extra mounting is left to consumer
  document.addEventListener('DOMContentLoaded', loadApps);
})(window);