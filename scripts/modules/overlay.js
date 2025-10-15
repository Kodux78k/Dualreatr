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