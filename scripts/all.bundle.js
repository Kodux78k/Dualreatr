/* MODULE: core.js */
(function(global){
  const UNO = global.UNO = global.UNO || {};
  UNO.$ = (q,r=document)=>r.querySelector(q);
  UNO.$$ = (q,r=document)=>Array.from(r.querySelectorAll(q));
  UNO.nav = (key)=>{
    ['home','apps','chat'].forEach(k=>{
      UNO.$('#v-'+k)?.classList.toggle('active',k===key);
      document.querySelector('.tab[data-nav="'+k+'"]')?.classList.toggle('active',k===key);
    });
    try{localStorage.setItem('uno:lastTab',key)}catch{}
  };
  // Boot basic nav
  document.addEventListener('DOMContentLoaded',()=>{
    UNO.$$('.tab').forEach(b=>b.addEventListener('click',()=>UNO.nav(b.dataset.nav||'home')));
    UNO.nav(localStorage.getItem('uno:lastTab')||'home');
  });
})(window);

/* MODULE: overlay.js */
(function(global){
  const { $, $$ } = global.UNO;
  const UNO = global.UNO;
  const RGB = {atlas:[64,158,255],nova:[255,82,177],vitalis:[72,218,168],pulse:[0,191,255],artemis:[186,130,219],serena:[140,190,255],kaos:[255,77,109],genus:[87,207,112],lumine:[255,213,79],rhea:[0,209,178],solus:[100,149,237],aion:[255,159,67]};
  UNO.overlayAlphaFromLS = ()=>{
    const v = parseInt(localStorage.getItem('uno:overlayLevel')||'22',10);
    return Math.min(30,Math.max(0,isNaN(v)?22:v))/100;
  };
  UNO.overlayColor = (name,a)=>{
    const rgb = RGB[name]||[64,158,255];
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
  };
  UNO.applyOverlayAlpha = (name)=>{
    const a = UNO.overlayAlphaFromLS();
    document.documentElement.style.setProperty('--arch-overlay', UNO.overlayColor(name||'atlas', a));
  };
  // Theme toggle quick button
  document.addEventListener('DOMContentLoaded',()=>{
    const btn = $('#btnTheme'); if(!btn) return;
    btn.onclick = ()=>{
      const t = (document.body.dataset.theme==='blue1')?'default':'blue1';
      document.body.dataset.theme = (t==='blue1')?'blue1':'';
      localStorage.setItem('uno:theme',t);
      // reapply overlay alpha on theme switch
      const sel=$('#arch-select'); const name=(sel && sel.options[sel.selectedIndex])?sel.options[sel.selectedIndex].textContent:'atlas';
      UNO.applyOverlayAlpha(name);
    };
    // initial theme
    const theme = localStorage.getItem('uno:theme')||'default';
    document.body.dataset.theme = (theme==='blue1')?'blue1':'';
  });
})(window);

/* MODULE: panel.js  (Alias Panel for loader modes) */
(function(global){
  const { $, $$ } = global.UNO;
  const UNO = global.UNO;

  function ensurePanel(){
    if($('#aliasPanel')) return $('#aliasPanel');
    const wrap = document.createElement('div');
    wrap.id = 'aliasPanel';
    wrap.style.cssText = 'display:none;position:fixed;left:12px;top:calc(var(--hdrH) + 8px);z-index:220;width:min(92vw,420px);max-height:70vh;overflow:auto;background:rgba(15,17,32,.92);border:var(--bd);border-radius:16px;box-shadow:0 12px 34px rgba(0,0,0,.55);padding:12px';
    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong>Loader / Alias Panel</strong>
        <div style="display:flex;gap:8px">
          <button id="aliasClose" class="btn">Fechar</button>
          <button id="aliasApply" class="btn">Aplicar</button>
        </div>
      </div>
      <div class="mut" style="margin-bottom:8px">Escolha o modo de carregamento e quais módulos deseja habilitar.</div>
      <div style="display:grid;gap:10px">
        <div><label><input type="radio" name="mode" value="all"> Bundle único (all.bundle.js)</label></div>
        <div><label><input type="radio" name="mode" value="groups"> 3 Grupos (core/ui/ai)</label></div>
        <div><label><input type="radio" name="mode" value="modules"> Por módulo (checkbox)</label></div>
        <div id="aliasModules" style="display:grid;grid-template-columns:repeat(2,minmax(140px,1fr));gap:6px;margin-top:4px">
          ${['core','overlay','panel','orb','apps','chat13','sw-register'].map(m=>`<label><input type="checkbox" data-mod="${m}"> ${m}.js</label>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  function readState(){
    const mode = localStorage.getItem('uno:loader:mode') || 'all';
    let mods = {};
    try{mods = JSON.parse(localStorage.getItem('uno:modules:enabled')||'{}')}catch{mods={}};
    if(!Object.keys(mods).length){
      ['core','overlay','panel','orb','apps','chat13','sw-register'].forEach(k=>mods[k]=true);
    }
    return {mode, mods};
  }

  function mountState(panel, state){
    const radios = panel.querySelectorAll('input[name="mode"]');
    radios.forEach(r=> r.checked = (r.value===state.mode));
    panel.querySelectorAll('[data-mod]').forEach(cb=>{
      cb.checked = !!state.mods[cb.dataset.mod];
    });
    panel.querySelector('#aliasModules').style.display = (state.mode==='modules')?'grid':'none';
    radios.forEach(r=> r.addEventListener('change', ()=>{
      panel.querySelector('#aliasModules').style.display = (r.value==='modules' && r.checked)?'grid':'none';
    }));
  }

  function openPanel(){
    const p = ensurePanel();
    const state = readState();
    mountState(p, state);
    p.style.display='block';
    $('#aliasClose').onclick = ()=> p.style.display='none';
    $('#aliasApply').onclick = ()=>{
      const sel = p.querySelector('input[name="mode"]:checked');
      const mode = sel ? sel.value : 'all';
      const mods = {};
      p.querySelectorAll('[data-mod]').forEach(cb=> mods[cb.dataset.mod] = !!cb.checked);
      localStorage.setItem('uno:loader:mode', mode);
      localStorage.setItem('uno:modules:enabled', JSON.stringify(mods));
      location.reload();
    };
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const btn = $('#aliasPanelBtn'); if(!btn) return;
    btn.onclick = openPanel;
  });
})(window);

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

/* MODULE: chat13.js */
(function(global){
  const { $ } = global.UNO;
  const feed = $('#chatFeed'), input=$('#chatInput'), send=$('#chatSend');
  function sanitize(md){const esc=s=>s.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); md=md.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`([^`]+?)`/g,'<code>$1</code>').replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>'); return md.split('\n').map(ln=>'<p>'+esc(ln)+'</p>').join('');}
  function push(role,title,html){const el=document.createElement('div'); el.className=`msg role-${role}`; el.innerHTML=(title?`<h5>${title}</h5>`:'')+(html||''); feed.appendChild(el); el.scrollIntoView({behavior:'smooth',block:'end'});}
  function pushBlock(title){const el=document.createElement('div'); el.className='msg role-assistant'; el.innerHTML=`<h5>${title}</h5><div class="mut">…</div>`; feed.appendChild(el); el.scrollIntoView({behavior:'smooth',block:'end'}); return el;}
  const BLOCKS=[["Sinal","Contextualize a intenção do usuário em 1 frase objetiva."],["Mapa","3-5 pontos-chave."],["Hipóteses","3 hipóteses testáveis."],["Dados","Dados mínimos a coletar."],["Ações 10min","Micro-ação em 10 minutos."],["Riscos","2 riscos/armadilhas."],["Recursos","3 recursos úteis."],["Sequência","4 passos ótimos."],["Expansão","2 variações criativas."],["Métrica","1 métrica simples."],["Checkpoint","Revisar em 24h."],["Compromisso","Compromisso curto."],["Fecho","Frase que mantenha o pulso."]];
  async function callOpenRouter(messages){const key=localStorage.getItem('dual.keys.openrouter')||''; const model=localStorage.getItem('dual.openrouter.model')||'openai/gpt-4o-mini'; if(!key) throw new Error('Chave OpenRouter ausente (defina em localStorage: dual.keys.openrouter)'); const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`,'HTTP-Referer':location.origin,'X-Title':'HUB UNO Chat13'},body:JSON.stringify({model, messages, temperature:0.7})}); if(!r.ok) throw new Error('OpenRouter HTTP '+r.status); const j=await r.json(); return j.choices?.[0]?.message?.content||'';}
  async function callLocal(messages){let ctx=messages.map(m=>(m.role+': '+m.content)).join('\n'); return `**Modo Offline (Local)**\nContexto:\n<code>${ctx.slice(-800)}</code>`;}
  async function pipeline(userText){const base=[{role:'system',content:'Você é o Chat13 do HUB UNO. Clareza e ação.'},{role:'user',content:userText}]; for(const [title,instr] of BLOCKS){const dom=pushBlock(title); try{const content=await callOpenRouter([...base,{role:'user',content:`Bloco: ${title}. Instrução: ${instr}. Curto, focado, com listas se útil.`}]).catch(async _=>await callLocal([...base,{role:'user',content:`[OFFLINE] ${title}: ${instr}`}]) ); dom.innerHTML=`<h5>${title}</h5>${sanitize(content)}`;}catch(e){dom.innerHTML=`<h5>${title}</h5><p class="mut">[erro: ${e.message}]</p>`;}}}
  send?.addEventListener('click', async ()=>{const text=(input.value||'').trim(); if(!text) return; push('user','Você',sanitize(text)); input.value=''; input.focus(); try{await pipeline(text);}catch(e){push('assistant','Erro',`<p class="mut">${e.message}</p>`);}});
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send.click();}});
  if(feed){push('assistant','Pronto','<p>Chat ativo. Escreva sua intenção.</p>');}
})(window);

/* MODULE: sw-register.js */
(function(){
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
  }
})();


/* MODULE: settings.panel.js  (Tema + Overlay + Apps Import/Export) */
(function(global){
  const UNO = global.UNO = global.UNO || {};
  const $ = (q,r=document)=>r.querySelector(q);

  function overlayAlphaFromLS(){
    const v = parseInt(localStorage.getItem('uno:overlayLevel')||'22',10);
    return Math.min(30,Math.max(0,isNaN(v)?22:v))/100;
  }
  function overlayColor(name, a){
    // Fallback RGB table
    const RGB={atlas:[64,158,255],nova:[255,82,177],vitalis:[72,218,168],pulse:[0,191,255],artemis:[186,130,219],serena:[140,190,255],kaos:[255,77,109],genus:[87,207,112],lumine:[255,213,79],rhea:[0,209,178],solus:[100,149,237],aion:[255,159,67]};
    const rgb=(UNO.overlayColor && UNO.overlayColor('atlas',1))?null:(RGB[name]||[64,158,255]);
    if(rgb) return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
    // if overlayColor exists in UNO, defer to it
    return UNO.overlayColor(name,a);
  }
  function applyOverlayAlpha(name){
    const a = overlayAlphaFromLS();
    const color = overlayColor(name||'atlas', a);
    document.documentElement.style.setProperty('--arch-overlay', color);
    const pct = Math.round(a*100);
    const el = document.getElementById('overlayNow'); if(el) el.textContent = String(pct);
    const range = document.getElementById('overlayRange'); if(range) range.value = String(pct);
  }

  function ensureButton(){
    if ($('#btnSettings')) return;
    const hdr = document.querySelector('header.mast');
    if(!hdr) return;
    const b = document.createElement('button');
    b.className='ib'; b.id='btnSettings'; b.title='Configurações'; b.textContent='⚙️';
    hdr.appendChild(b);
  }

  function ensurePanel(){
    if($('#panel')) return $('#panel');
    const wrap = document.createElement('div');
    wrap.id = 'panel';
    wrap.style.cssText = 'display:none;position:fixed;right:12px;top:calc(var(--hdrH) + 8px);z-index:220;width:min(92vw,380px);max-height:70vh;overflow:auto;background:rgba(15,17,32,.92);border:var(--bd);border-radius:16px;box-shadow:0 12px 34px rgba(0,0,0,.55);padding:12px';
    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong>Painel</strong>
        <div style="display:flex;gap:8px">
          <button id="panelClose" class="btn">Fechar</button>
          <button id="panelSave" class="btn">Salvar</button>
        </div>
      </div>
      <div style="display:grid;gap:10px">
        <label class="mut">Tema</label>
        <select id="themeSelect" class="btn">
          <option value="default">Nébula (padrão)</option>
          <option value="blue1">Blue-1</option>
        </select>
        <label class="mut">Intensidade do Overlay (0–30%)</label>
        <input type="range" id="overlayRange" min="0" max="30" step="1"/>
        <div class="mut">Atual: <span id="overlayNow">—</span>%</div>
        <div class="mut">Apps</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="appsImportBtn" class="btn">📡 Importar apps.json</button>
          <input id="appsImportFile" type="file" accept="application/json" hidden>
          <button id="appsExportBtn" class="btn">Exportar apps.json</button>
          <button id="appsClearBtn" class="btn">Limpar apps locais</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    return wrap;
  }

  function mountPanel(){
    const theme = localStorage.getItem('uno:theme') || 'default';
    const r = document.getElementById('overlayRange');
    document.getElementById('themeSelect').value = theme;
    r.value = String(Math.round(overlayAlphaFromLS()*100));
    const on = document.getElementById('overlayNow'); if(on) on.textContent = r.value;
  }

  function openPanel(){
    const p = ensurePanel();
    mountPanel();
    p.style.display='block';
  }

  function closePanel(){
    const p = document.getElementById('panel');
    if(p) p.style.display='none';
  }

  function savePanel(){
    const t = document.getElementById('themeSelect').value;
    localStorage.setItem('uno:theme', t);
    document.body.dataset.theme = (t==='blue1') ? 'blue1' : '';
    const lvl = Math.min(30, Math.max(0, parseInt(document.getElementById('overlayRange').value||'22',10)));
    localStorage.setItem('uno:overlayLevel', String(lvl));
    const sel = document.getElementById('arch-select');
    const name = (sel && sel.options[sel.selectedIndex]) ? sel.options[sel.selectedIndex].textContent : 'atlas';
    applyOverlayAlpha(name);
    closePanel();
  }

  function appsIOBind(){
    const btn = document.getElementById('appsImportBtn');
    const file= document.getElementById('appsImportFile');
    const exp = document.getElementById('appsExportBtn');
    const clr = document.getElementById('appsClearBtn');
    if(btn && file){
      btn.onclick = ()=> file.click();
      file.onchange = (ev)=>{
        const f = ev.target.files && ev.target.files[0];
        if(!f) return;
        const fr = new FileReader();
        fr.onload = ()=>{
          try{
            const obj = JSON.parse(fr.result);
            localStorage.setItem('uno:apps', JSON.stringify(obj));
            alert('apps.json importado!'); location.reload();
          }catch(e){ alert('JSON inválido: '+e.message); }
        };
        fr.readAsText(f);
      };
    }
    if(exp){
      exp.onclick = ()=>{
        const raw = localStorage.getItem('uno:apps') || '[]';
        const a=document.createElement('a');
        a.href = URL.createObjectURL(new Blob([raw],{type:'application/json'}));
        a.download = 'apps.json'; a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href),500);
      };
    }
    if(clr){
      clr.onclick = ()=>{ localStorage.removeItem('uno:apps'); alert('Apps locais limpos.'); location.reload(); };
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    ensureButton();
    const p = ensurePanel();
    document.getElementById('btnSettings').onclick = openPanel;
    document.getElementById('panelClose').onclick = closePanel;
    document.getElementById('panelSave').onclick = savePanel;
    document.getElementById('overlayRange').addEventListener('input', (e)=>{
      const val = Math.min(30, Math.max(0, parseInt(e.target.value||'22',10)));
      const sel = document.getElementById('arch-select');
      const name = (sel && sel.options[sel.selectedIndex]) ? sel.options[sel.selectedIndex].textContent : 'atlas';
      document.documentElement.style.setProperty('--arch-overlay', overlayColor(name, val/100));
      const on = document.getElementById('overlayNow'); if(on) on.textContent = String(val);
    });
    appsIOBind();
  });
})(window);
