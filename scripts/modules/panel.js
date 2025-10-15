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