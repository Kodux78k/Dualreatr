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