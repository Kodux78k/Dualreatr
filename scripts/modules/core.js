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