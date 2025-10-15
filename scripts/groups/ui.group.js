/* MODULE: orb.js */
(function(global){
  const { $ } = global.UNO;
  function init(){
    const c1 = $('#orb'), c2 = $('#dust'); if(!c1||!c2) return;
    const dpr=Math.max(1,devicePixelRatio||1); let W=0,H=0;
    function resize(){const r=c1.getBoundingClientRect(); W=r.width|0; H=r.height|0; [c1,c2].forEach(c=>{c.width=(W*dpr)|0; c.height=(H*dpr)|0; c.style.width=W+'px'; c.style.height=H+'px'})}
    resize(); addEventListener('resize',resize);
    const x1=c1.getContext('2d'), x2=c2.getContext('2d');
    const dots=Array.from({length:18},()=>({a:Math.random()*Math.PI*2,r:.22+Math.random()*.34,s:(.25+Math.random()*.55)*(Math.random()<.5?1:-1),h:180+Math.random()*140}));
    let t=0; (function loop(){t+=1; x1.setTransform(dpr,0,0,dpr,0,0); x2.setTransform(dpr,0,0,dpr,0,0); x1.clearRect(0,0,W,H); x2.clearRect(0,0,W,H);
      const cx=W/2, cy=H/2, m=Math.min(W,H), pulse=Math.sin(t*0.02)*0.03+1;
      const g=x1.createRadialGradient(cx,cy,m*0.05,cx,cy,m*0.55); g.addColorStop(0,'rgba(122,91,255,0.35)'); g.addColorStop(1,'rgba(0,0,0,0)'); x1.fillStyle=g; x1.beginPath(); x1.arc(cx,cy,m*0.55,0,Math.PI*2); x1.fill();
      x1.shadowBlur=18; x1.shadowColor='#39ffb688'; x1.fillStyle='#7a5bff'; x1.beginPath(); x1.arc(cx,cy,m*0.06*pulse,0,Math.PI*2); x1.fill(); x1.shadowBlur=0;
      x1.strokeStyle='#39ffb6cc'; x1.lineWidth=1.6; x1.beginPath(); x1.arc(cx,cy,m*0.28*pulse,0,Math.PI*2); x1.stroke();
      dots.forEach(p=>{p.a+=p.s*0.005; const rr=m*(0.16+p.r*0.40), x=cx+Math.cos(p.a)*rr, y=cy+Math.sin(p.a)*rr*0.86; const gd=x2.createRadialGradient(x,y,0,x,y,7); gd.addColorStop(0,`hsla(${p.h},90%,70%,.95)`); gd.addColorStop(.3,`hsla(${p.h},90%,70%,.45)`); gd.addColorStop(1,'rgba(0,0,0,0)'); x2.fillStyle=gd; x2.beginPath(); x2.arc(x,y,7,0,Math.PI*2); x2.fill();});
      requestAnimationFrame(loop);
    })();
  }
  document.addEventListener('DOMContentLoaded', init);
})(window);

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