
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
