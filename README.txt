HUB-UNO — Mono PWA + Alias Loader + Painel
==========================================
- index.html (CSS inline), alias loader (🧩), painel (⚙️), PWA (manifest + sw.js)
- scripts/ em três formatos: all.bundle, groups (core/ui/ai), modules/*.js

Como escolher o modo
--------------------
- Botão 🧩 no header → escolha: "Bundle único", "3 Grupos", "Por Módulo".
- Salva em localStorage:
  uno:loader:mode = "all" | "groups" | "modules"
  uno:modules:enabled = {"core":true,"apps":true,...}  (usado só em "modules")

Painel (⚙️)
-----------
- Tema Nebula/Blue-1 (salva em uno:theme)
- Overlay 0–30% (salva em uno:overlayLevel)
- 📡 Importar / Exportar / Limpar apps.json (usa uno:apps como prioridade)

PWA / Instalação
----------------
1) Sirva via http(s) ou localhost (ex: `python -m http.server 8080`)
2) Acesse / e use "Instalar aplicativo" no navegador (ou A2HS no iOS)
3) O sw.js cacheia index, manifest e ícones

Dica
----
- Se quiser forçar Blue-1 de cara: `localStorage.setItem('uno:theme','blue1')` e recarregue.