import React, { useEffect, useMemo, useRef, useState } from 'react';

const SCREENS = ['UNO','DUAL','TRINITY'];

export default function App(){
  const [screen, setScreen] = useState('UNO');
  const [assets, setAssets] = useState([]); // {id,name,type,dataURL}
  const [htmlApps, setHtmlApps] = useState([]); // {id,name,blobURL}
  const [reactApps, setReactApps] = useState([]); // {id,name,kind:'esm'|'jsx', blobURL?, code?}
  const [bg, setBg] = useState('');
  const [previewHtml, setPreviewHtml] = useState(null); // blobURL
  const [mountedReact, setMountedReact] = useState(null); // {name, unmount:fn}

  // persist
  useEffect(()=>{
    try{
      const s = JSON.parse(localStorage.getItem('hub1.state')||'{}');
      if(s.assets) setAssets(s.assets);
      if(s.bg) setBg(s.bg);
      if(s.htmlApps) setHtmlApps(s.htmlApps);
      if(s.reactApps) setReactApps(s.reactApps);
    }catch{}
  },[]);
  useEffect(()=>{
    localStorage.setItem('hub1.state', JSON.stringify({assets,bg,htmlApps,reactApps}));
  },[assets,bg,htmlApps,reactApps]);

  // 369
  const step = ()=> {
    const i = SCREENS.indexOf(screen);
    setScreen(SCREENS[(i+1)%SCREENS.length]);
  };

  // uploads
  const fileInputImg = useRef();
  const fileInputHtml = useRef();
  const fileInputReact = useRef();

  const onUploadImages = async (files)=>{
    const list = await Promise.all([...files].map(readAsDataURL));
    setAssets(prev=>[...list, ...prev]);
  };
  const onUploadHTML = async (files)=>{
    const list = await Promise.all([...files].map(async f=>{
      const blobURL = URL.createObjectURL(new Blob([await f.text()], {type:'text/html'}));
      return { id:id(), name:f.name, blobURL };
    }));
    setHtmlApps(prev=>[...list,...prev]);
  };
  const onUploadReact = async (files)=>{
    const list = await Promise.all([...files].map(async f=>{
      const name = f.name.toLowerCase();
      if(name.endsWith('.js')){
        const blobURL = URL.createObjectURL(new Blob([await f.text()], {type:'text/javascript'}));
        return { id:id(), name:f.name, kind:'esm', blobURL };
      }else{ // .jsx
        const code = await f.text();
        return { id:id(), name:f.name, kind:'jsx', code };
      }
    }));
    setReactApps(prev=>[...list,...prev]);
  };

  const mountReactApp = async (app)=>{
    // unmount anterior
    if(mountedReact?.unmount){ try{ mountedReact.unmount(); }catch{} }
    // container
    const node = document.getElementById('external-react-root');
    node.replaceChildren(); // limpa
    // rota ESM
    if(app.kind==='esm'){
      const mod = await import(/* @vite-ignore */ app.blobURL);
      const ReactDOM = await import('react-dom/client');
      const root = ReactDOM.createRoot(node);
      root.render(React.createElement(mod.default || mod.App || (()=>React.createElement('div',null,'(sem default export)'))));
      setMountedReact({name:app.name, unmount:()=>root.unmount()});
    }else{ // JSX cru → Babel Standalone
      if(!window.Babel){ alert('Babel não carregado (ver index.html).'); return; }
      const transpiled = window.Babel.transform(
        `
          const { useState, useEffect } = React;
          ${app.code}
          export default (typeof App!=='undefined'?App:(typeof Component!=='undefined'?Component:() => React.createElement('div',null,'(defina App ou Component)')));
        `,
        { presets: ['react'] }
      ).code;
      const blobURL = URL.createObjectURL(new Blob([transpiled], {type:'text/javascript'}));
      const mod = await import(/* @vite-ignore */ blobURL);
      const ReactDOM = await import('react-dom/client');
      const root = ReactDOM.createRoot(node);
      root.render(React.createElement(mod.default));
      setMountedReact({name:app.name, unmount:()=>root.unmount()});
    }
  };

  // helpers
  const setBgFromAsset = (a)=> setBg(a.dataURL);

  return (
    <div className="min-h-screen">
      {/* header */}
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl md:text-2xl font-semibold">HUB1 — {screen}</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-xl bg-white/10" onClick={()=>setScreen('UNO')}>UNO</button>
          <button className="px-3 py-2 rounded-xl bg-white/10" onClick={()=>setScreen('DUAL')}>DUAL</button>
          <button className="px-3 py-2 rounded-xl bg-white/10" onClick={()=>setScreen('TRINITY')}>TRINITY</button>
          <button className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-[#031316]" onClick={step}>369</button>
        </div>
      </header>

      {/* stage */}
      <main className="px-4 pb-24">
        <div className="rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden"
             style={{
               minHeight:'40vh',
               backgroundImage: bg?`url(${bg})`: 'linear-gradient(135deg, rgba(0,216,216,.07), rgba(216,0,216,.07))',
               backgroundSize:'cover', backgroundPosition:'center'
             }}>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Uploads */}
            <section className="rounded-2xl bg-white/5 p-3">
              <h3 className="font-semibold mb-2">Uploads</h3>
              <div className="grid gap-2">
                <button className="px-3 py-2 rounded-xl bg-white/10" onClick={()=>fileInputImg.current.click()}>Upload Imagens/Vídeos (bg)</button>
                <button className="px-3 py-2 rounded-xl bg-white/10" onClick={()=>fileInputHtml.current.click()}>Upload HTML</button>
                <button className="px-3 py-2 rounded-xl bg-white/10" onClick={()=>fileInputReact.current.click()}>Upload React (.jsx/.js)</button>
                <input ref={fileInputImg} className="hidden" type="file" multiple accept="image/*,video/*" onChange={(e)=>onUploadImages(e.target.files)}/>
                <input ref={fileInputHtml} className="hidden" type="file" multiple accept=".html,.htm,text/html" onChange={(e)=>onUploadHTML(e.target.files)}/>
                <input ref={fileInputReact} className="hidden" type="file" multiple accept=".jsx,.js" onChange={(e)=>onUploadReact(e.target.files)}/>
              </div>
            </section>

            {/* Gallery / Background picker */}
            <section className="rounded-2xl bg-white/5 p-3">
              <h3 className="font-semibold mb-2">Backgrounds</h3>
              {assets.length===0 && <div className="text-sm opacity-70">Sem assets — faça upload.</div>}
              <div className="grid grid-cols-3 gap-2">
                {assets.filter(a=>a.type!=='video').map((a)=>(
                  <button key={a.id} className="rounded-xl overflow-hidden" title={a.name} onClick={()=>setBgFromAsset(a)}>
                    <img src={a.dataURL} className="w-full h-20 object-cover"/>
                  </button>
                ))}
              </div>
            </section>

            {/* Apps */}
            <section className="rounded-2xl bg-white/5 p-3">
              <h3 className="font-semibold mb-2">Apps</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs opacity-70 mb-1">HTML</div>
                  {htmlApps.map(app=>(
                    <button key={app.id} className="px-3 py-2 mr-2 mb-2 rounded-xl bg-white/10" onClick={()=>setPreviewHtml(app.blobURL)}>{app.name}</button>
                  ))}
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">React</div>
                  {reactApps.map(app=>(
                    <button key={app.id} className="px-3 py-2 mr-2 mb-2 rounded-xl bg-white/10" onClick={()=>mountReactApp(app)}>{app.name}</button>
                  ))}
                </div>
              </div>
            </section>

            {/* Preview columns */}
            <section className="md:col-span-3 grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/30 p-2">
                <div className="text-sm opacity-70 mb-2">HTML (sandbox)</div>
                <div className="rounded-xl overflow-hidden bg-black/30 min-h-[240px]">
                  {previewHtml ? (
                    <iframe src={previewHtml}
                            className="w-full h-[300px]"
                            sandbox="allow-scripts allow-same-origin"
                            title="html-preview"/>
                  ) : (
                    <div className="p-3 text-sm opacity-60">Selecione um HTML</div>
                  )}
                </div>
              </div>
              <div className="rounded-2xl bg-black/30 p-2">
                <div className="text-sm opacity-70 mb-2">React (mount)</div>
                <div id="external-react-root" className="rounded-xl min-h-[300px] grid place-items-center">
                  <div className="opacity-60 text-sm">Selecione um React (.jsx/.js)</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// utils
function id(){ return `${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }
function readAsDataURL(file){
  return new Promise((res)=>{
    const fr = new FileReader();
    fr.onload = ()=> res({ id: id(), name:file.name, type: guessType(file.name), dataURL: fr.result });
    fr.readAsDataURL(file);
  });
}
function guessType(name){
  const n = name.toLowerCase();
  if(n.endsWith('.mp4')||n.endsWith('.webm')) return 'video';
  if(n.endsWith('.svg')) return 'svg';
  return 'image';
}