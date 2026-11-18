/* =====================================================================
   DÉIA SKULLGAMES · script.js
   Índice
   1. CONFIGURAÇÃO (é só aqui que a cliente edita jogos, playlists e links)
   2. Utilidades e ícones
   3. Jogos
   4. Playlists
   5. Comunidade
   6. Live (player da Twitch)
   7. Tema
   9. Animação de entrada e rodapé
   10. Início
   ===================================================================== */

document.documentElement.classList.add('js');


/* =====================================================================
   1. CONFIGURAÇÃO
   Troque os textos de exemplo pelos reais. Não precisa mexer no resto.
   ===================================================================== */
const CONFIG = {
  // Nome do canal na Twitch (só o nome, sem https). Deixe "" para esconder a seção AO VIVO.
  // Exemplo: twitchChannel: "deiaskullgames"
  twitchChannel: "",

  // Para onde vai o botão "Assistir live" do topo. Se vazio, rola até as playlists.
  // Exemplo: liveUrl: "https://www.twitch.tv/deiaskullgames"
  liveUrl: "",

  // Jogos. "id" é uma palavra única sem espaço. "image" é opcional (ex.: "assets/jogo1.jpg").
  
games: [
  {
    id: "littlenigthmares",
    name: "littlenigthmares",
    genre: "terror",
    image: "assets/jogos/littlenigthmares.jpg"
  },
  {
    id: "halo",
    name: "halo",
    genre: "FPS",
    image: "assets/jogos/halo.jpg"
  },
  {
    id: "tombraider",
    name: "tombraider",
    genre: "Simulação",
    image: "assets/jogos/tombraider.jpg"
  },
  {
    id: "elderscrolls",
    name: "elderscrolls",
    genre: "rpg",
    image: "assets/jogos/elderscrolls.jpg"
  },
  {
    id: "cuphead",
    name: "cuphead",
    genre: "ação",
    image: "assets/jogos/cuphead.jpg"
  }
],


  // Playlists. "gameId" tem que ser igual ao "id" de um jogo acima.
  playlists: [
    { title: "Primeiras horas",       gameId: "jogo-1", platform: "YouTube", url: "#" },
    { title: "Campanha completa",     gameId: "jogo-2", platform: "YouTube", url: "#" },
    { title: "Guia para iniciantes",  gameId: "jogo-3", platform: "YouTube", url: "#" },
    { title: "Lives com o chat",      gameId: "jogo-1", platform: "Twitch",  url: "#" },
    { title: "Jogando com a galera",  gameId: "jogo-5", platform: "YouTube", url: "#" },
    { title: "Achados do mês",        gameId: "jogo-4", platform: "YouTube", url: "#" }
  ],

  // Comunidades. "icon" pode ser: pad, skull, play, heart, spark.
  community: [
    { name: "Discord",   description: "Converse com a galera e marque os horários de jogo.", url: "#", icon: "pad" },
    { name: "Twitch",    description: "Lives ao vivo, com o chat mandando no clima.",        url: "#", icon: "skull" },
    { name: "YouTube",   description: "Gameplays, guias e dicas para ver quando quiser.",    url: "#", icon: "play" },
    { name: "Instagram", description: "Bastidores, avisos de live e arte do canal.",         url: "#", icon: "heart" },
    { name: "TikTok",    description: "Cortes curtos dos melhores momentos.",                url: "#", icon: "spark" }
  ]
};


/* =====================================================================
   2. UTILIDADES E ÍCONES
   ===================================================================== */

// Ícones em pixel art (cada ícone é um desenho feito de quadradinhos).
const ICONS = {
  skull: { vb: "0 0 8 7", d: "M2 0h4v1h-4z M1 1h6v1h-6z M0 2h2v2h-2z M3 2h2v2h-2z M6 2h2v2h-2z M1 4h6v1h-6z M2 5h4v1h-4z M2 6h1v1h-1z M5 6h1v1h-1z" },
  heart: { vb: "0 0 7 6", d: "M1 0h2v1h-2z M4 0h2v1h-2z M0 1h7v2h-7z M1 3h5v1h-5z M2 4h3v1h-3z M3 5h1v1h-1z" },
  pad:   { vb: "0 0 9 6", d: "M1 0h7v1h-7z M0 1h9v1h-9z M0 2h2v1h-2z M3 2h3v1h-3z M7 2h2v1h-2z M0 3h9v1h-9z M0 4h3v1h-3z M6 4h3v1h-3z M0 5h2v1h-2z M7 5h2v1h-2z" },
  play:  { vb: "0 0 7 7", d: "M0 0h1v1h-1z M0 1h3v1h-3z M0 2h5v1h-5z M0 3h7v1h-7z M0 4h5v1h-5z M0 5h3v1h-3z M0 6h1v1h-1z" },
  spark: { vb: "0 0 5 5", d: "M2 0h1v5h-1z M0 2h5v1h-5z" }
};

function iconSvg(name) {
  const icon = ICONS[name] || ICONS.spark;
  return '<svg viewBox="' + icon.vb + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
         '<path fill="currentColor" d="' + icon.d + '"/></svg>';
}

// Cria um elemento com classe e texto (sempre como texto, nunca como HTML).
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Cria uma fileira de botões de filtro.
function buildChips(container, options, current, onChange) {
  container.replaceChildren();
  options.forEach(function (option) {
    const chip = el('button', 'chip', option.label);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(option.value === current));
    chip.addEventListener('click', function () { onChange(option.value); });
    container.appendChild(chip);
  });
}

function findGame(id) {
  return CONFIG.games.find(function (game) { return game.id === id; });
}

// Estado atual dos filtros
const state = { genre: 'all', game: 'all' };


/* =====================================================================
   3. JOGOS
   ===================================================================== */
function renderGames() {
  const grid = document.getElementById('games-grid');
  const status = document.getElementById('games-status');

  // Filtros por estilo (gerados a partir dos jogos cadastrados)
  const genres = Array.from(new Set(CONFIG.games.map(function (g) { return g.genre; })));
  const options = [{ value: 'all', label: 'TODOS' }].concat(
    genres.map(function (genre) { return { value: genre, label: genre.toUpperCase() }; })
  );
  buildChips(document.getElementById('games-filters'), options, state.genre, function (value) {
    state.genre = value;
    renderGames();
  });

  const list = CONFIG.games.filter(function (g) { return state.genre === 'all' || g.genre === state.genre; });
  grid.replaceChildren();

  list.forEach(function (game, index) {
    const card = el('article', 'card');

    const art = el('div', 'card__art art-' + (index % 6));
    if (game.image) {
      art.style.backgroundImage = 'url("' + game.image + '")';
    } else {
      const icon = el('span', 'icon');
      icon.innerHTML = iconSvg('pad');
      art.appendChild(icon);
    }

    const body = el('div', 'card__body');
    body.appendChild(el('h3', 'card__title', game.name));
    body.appendChild(el('span', 'tag', game.genre.toUpperCase()));

    const button = el('button', 'btn btn--primary', 'VER LIVES');
    button.type = 'button';
    button.addEventListener('click', function () { showLivesOf(game.id); });
    body.appendChild(button);

    card.appendChild(art);
    card.appendChild(body);
    grid.appendChild(card);
  });

  status.textContent = list.length === 1 ? '1 jogo' : list.length + ' jogos';
}

// Botão "Ver lives" de um jogo: filtra as playlists e rola até elas.
function showLivesOf(gameId) {
  state.game = gameId;
  renderPlaylists();
  document.getElementById('lives').scrollIntoView();
}


/* =====================================================================
   4. PLAYLISTS
   ===================================================================== */
function renderPlaylists() {
  const grid = document.getElementById('playlist-grid');
  const status = document.getElementById('playlist-status');

  // Filtros por jogo
  const options = [{ value: 'all', label: 'TODOS' }].concat(
    CONFIG.games.map(function (game) { return { value: game.id, label: game.name.toUpperCase() }; })
  );
  buildChips(document.getElementById('playlist-filters'), options, state.game, function (value) {
    state.game = value;
    renderPlaylists();
  });

  const list = CONFIG.playlists.filter(function (p) { return state.game === 'all' || p.gameId === state.game; });
  grid.replaceChildren();

  list.forEach(function (playlist, index) {
    const game = findGame(playlist.gameId);

    const card = el('a', 'card card--link');
    card.href = playlist.url || '#';
    if (playlist.url && playlist.url !== '#') {
      card.target = '_blank';
      card.rel = 'noopener';
    }

    const art = el('div', 'card__art art-' + ((index + 3) % 6));
    if (playlist.thumb) art.style.backgroundImage = 'url("' + playlist.thumb + '")';
    else {
      const icon = el('span', 'icon');
      icon.innerHTML = iconSvg('play');
      art.appendChild(icon);
    }

    const body = el('div', 'card__body');
    body.appendChild(el('h3', 'card__title', playlist.title));
    body.appendChild(el('p', 'card__meta', game ? game.name : 'Vários jogos'));
    body.appendChild(el('span', 'tag tag--signal', (playlist.platform || 'Vídeo').toUpperCase()));

    card.appendChild(art);
    card.appendChild(body);
    grid.appendChild(card);
  });

  if (list.length === 0) {
    status.textContent = 'Ainda não há playlists para este jogo. Volte em breve!';
  } else {
    status.textContent = list.length === 1 ? '1 playlist' : list.length + ' playlists';
  }
}


/* =====================================================================
   5. COMUNIDADE
   ===================================================================== */
function renderCommunity() {
  const grid = document.getElementById('community-grid');
  grid.replaceChildren();

  CONFIG.community.forEach(function (item) {
    const card = el('a', 'card card--link');
    card.href = item.url || '#';
    if (item.url && item.url !== '#') {
      card.target = '_blank';
      card.rel = 'noopener';
    }

    const body = el('div', 'card__body');
    const icon = el('span', 'icon');
    icon.style.cssText = 'width:40px;height:40px;display:inline-flex;color:var(--icon)';
    icon.innerHTML = iconSvg(item.icon);
    icon.firstChild.style.cssText = 'width:100%;height:100%';

    body.appendChild(icon);
    body.appendChild(el('h3', 'card__title', item.name.toUpperCase()));
    body.appendChild(el('p', 'card__meta', item.description));

    card.appendChild(body);
    grid.appendChild(card);
  });
}


/* =====================================================================
   6. LIVE (player da Twitch)
   Só aparece se CONFIG.twitchChannel estiver preenchido.
   O player da Twitch só funciona com o site publicado (não em arquivo local).
   ===================================================================== */
function setupLive() {
  const section = document.getElementById('ao-vivo');
  const heroButton = document.getElementById('live-link');
  const channel = (CONFIG.twitchChannel || '').trim();

  // Botão "Assistir live" do topo
  if (CONFIG.liveUrl) {
    heroButton.href = CONFIG.liveUrl;
    heroButton.target = '_blank';
    heroButton.rel = 'noopener';
  } else if (channel) {
    heroButton.href = '#ao-vivo';
  }

  if (!channel) return;
  section.hidden = false;

  document.getElementById('live-open').href = 'https://www.twitch.tv/' + encodeURIComponent(channel);

  const box = document.getElementById('live-player');
  document.getElementById('live-load').addEventListener('click', function () {
    if (!location.hostname) {
      box.querySelector('.live-player__text').textContent =
        'O player só funciona com o site publicado. Use o botão abaixo para abrir na Twitch.';
      return;
    }
    const frame = document.createElement('iframe');
    frame.src = 'https://player.twitch.tv/?channel=' + encodeURIComponent(channel) +
                '&parent=' + encodeURIComponent(location.hostname) + '&muted=true';
    frame.title = 'Live da Twitch';
    frame.allowFullscreen = true;
    box.replaceChildren(frame);
  });
}


/* =====================================================================
   7. TEMA
   Para travar numa direção: apague o bloco .theme-switch do HTML
   e deixe só o data-theme desejado na tag <html>.
   ===================================================================== */
function setupTheme() {
  const buttons = document.querySelectorAll('[data-theme-set]');
  const colors = { noir: '#08050F', kawaii: '#F6F0FF', zine: '#0E0A12' };

  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.themeSet === theme));
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && colors[theme]) meta.setAttribute('content', colors[theme]);
  }

  let saved = null;
  try { saved = localStorage.getItem('deia-theme'); } catch (e) { /* sem armazenamento */ }
  if (saved && colors[saved]) apply(saved);

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      apply(btn.dataset.themeSet);
      try { localStorage.setItem('deia-theme', btn.dataset.themeSet); } catch (e) { /* ignora */ }
    });
  });
}


/* =====================================================================
   9. ANIMAÇÃO DE ENTRADA E RODAPÉ
   ===================================================================== */
function setupReveal() {
  const targets = document.querySelectorAll('.section > .container');
  if (!('IntersectionObserver' in window)) return;

  targets.forEach(function (node) { node.classList.add('reveal'); });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(function (node) { observer.observe(node); });
}

function setupFooter() {
  document.getElementById('year').textContent = String(new Date().getFullYear());
}

// Troca os ícones marcados com data-icon="nome" no HTML (ex.: o logo).
function setupStaticIcons() {
  document.querySelectorAll('[data-icon]').forEach(function (node) {
    node.innerHTML = iconSvg(node.dataset.icon);
  });
}


/* =====================================================================
   10. INÍCIO
   ===================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  setupStaticIcons();
  setupTheme();
  renderGames();
  renderPlaylists();
  renderCommunity();
  setupLive();
  setupReveal();
  setupFooter();
});
