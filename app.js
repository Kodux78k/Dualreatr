import React from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";

function App(){
  return (
    React.createElement('main',{className:'p-4 space-y-4'},
      React.createElement('section',{className:'flex items-center gap-3'},
        React.createElement('span',{className:'hub1-ico ico-uno lg'}),
        React.createElement('span',{className:'hub1-ico ico-dual lg'}),
        React.createElement('span',{className:'hub1-ico ico-trinity lg'}),
      ),
      React.createElement('div',{className:'text-sm opacity-70'},
        'Este é o loader modular (ESM) chamando React por CDN. '
      )
    )
  );
}

createRoot(document.getElementById('root')).render(React.createElement(App));