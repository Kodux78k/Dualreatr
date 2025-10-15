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
