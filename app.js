/* Platafarm v1 — protótipo navegável. Telas por rota (#/...). Dados de exemplo em dados.js */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const I = (n, c = '') => `<i data-lucide="${n}" class="ico ${c}"></i>`;
  const img = n => `img/${n}.jpg`;
  const F = id => PF.fazendas.find(f => f.id === id);
  const C = id => PF.corretores.find(c => c.id === id);

  // ---------- formatação ----------
  const mi = v => v >= 1e6 ? 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi' : 'R$ ' + Math.round(v / 1e3).toLocaleString('pt-BR') + ' mil';
  const milha = v => v >= 1e3 ? 'R$ ' + (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil/ha' : 'R$ ' + v + '/ha';
  const reais = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  const ha = v => v.toLocaleString('pt-BR') + ' ha';
  const porHa = f => f.preco / f.ha;
  const difRegiao = f => Math.round((porHa(f) / f.precoRegiao - 1) * 100);

  // ---------- estado (favoritos e buscas ficam no aparelho) ----------
  const guarda = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('pf_' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('pf_' + k, JSON.stringify(v)); } catch {} }
  };
  let favs = guarda.get('favs', ['f2', 'f4']);
  let ultimas = guarda.get('ultimas', ['Soja no MT acima de 1.000 ha', 'Pecuária no Triângulo Mineiro', 'Café no Sul de Minas']);
  const filtro = { tipo: 'Fazenda', uf: '', cultura: '', aptidao: '', haMin: 0, haMax: 0, valorMax: 0, texto: '' };

  function toast(msg, ic = 'check-circle-2') {
    $$('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = I(ic) + msg;
    $('.aparelho').appendChild(t); lucide.createIcons(); setTimeout(() => t.remove(), 2600);
  }
  function folha(html) {
    const f = document.createElement('div'); f.className = 'folha';
    f.innerHTML = `<div><div class="grab"></div>${html}</div>`;
    f.addEventListener('click', e => { if (e.target === f || e.target.closest('[data-fecha]')) f.remove(); });
    $('.aparelho').appendChild(f); lucide.createIcons(); return f;
  }

  // ---------- peças ----------
  const tab = (atual, escura) => `<nav class="tab ${escura ? 'escura' : ''}">
    <a href="#/" class="${atual === 'inicio' ? 'on' : ''}">${I('house')}Início</a>
    <a href="#/mapa" class="${atual === 'mapa' ? 'on' : ''}">${I('map')}Busca</a>
    <a href="#/chat" class="${atual === 'chat' ? 'on' : ''}">${I('message-circle')}Chat</a>
    <a href="#/meu" class="${atual === 'meu' ? 'on' : ''}">${I('user')}Meu imóvel</a></nav>`;
  const topo = (titulo, volta = 'javascript:history.back()', extra = '') =>
    `<div class="topo"><a class="vol" href="${volta}" aria-label="Voltar">${I('arrow-left')}</a><h2>${titulo}</h2>${extra}</div>`;
  const selos = f => [
    f.selo === 'certificada' ? `<span class="selo cert">${I('badge-check')}Certificada</span>` : '',
    f.sigilosa ? `<span class="selo sig">${I('lock')}Sigilosa</span>` : '',
    f.urgente ? `<span class="selo urg">Urgente</span>` : '',
    difRegiao(f) <= -8 ? `<span class="selo verde">${-difRegiao(f)}% abaixo</span>` : ''
  ].join('');
  const card = f => `<a class="card" href="#/f/${f.id}" style="background-image:url(${f.sigilosa ? img('cerrado') : img(f.fotos[0])})">
    <div class="selos">${selos(f)}</div>
    <button class="fav ${favs.includes(f.id) ? 'on' : ''}" data-fav="${f.id}" aria-label="Favoritar">${I('heart')}</button>
    <div class="inf"><small>${f.cidade} · ${f.uf} · ${f.tipo}</small><strong>${f.sigilosa ? 'Sob consulta' : mi(f.preco)}</strong><small>${ha(f.ha)}${f.sigilosa ? '' : ' · ' + milha(Math.round(porHa(f)))}</small></div></a>`;
  const item = f => `<a class="item" href="#/f/${f.id}"><div class="ft" style="background-image:url(${f.sigilosa ? img('cerrado') : img(f.fotos[0])})">${f.selo ? '<span class="selo cert">Certificada</span>' : f.sigilosa ? '<span class="selo sig">Sigilosa</span>' : ''}</div>
    <div class="tx"><small>${f.cidade} · ${f.uf}</small><span class="nm">${f.titulo}</span><strong>${f.sigilosa ? 'Sob consulta' : mi(f.preco)}</strong><small>${ha(f.ha)} · ${f.aptidao}</small>
    ${!f.sigilosa && difRegiao(f) <= -8 ? `<span class="selo verde" style="align-self:flex-start;margin-top:4px">${-difRegiao(f)}% abaixo da região</span>` : ''}</div></a>`;

  // ---------- TELAS ----------
  const T = {};

  T.inicio = () => {
    const cert = PF.fazendas.filter(f => f.selo === 'certificada');
    const oport = PF.fazendas.filter(f => !f.sigilosa && (difRegiao(f) <= -8 || f.urgente));
    return `<div class="tela fade" style="background:var(--mata-e)">
    <section class="hero"><div class="hd"><img src="img/logo-completo-branco.svg" alt="Platafarm"><button aria-label="Avisos" data-acao="avisos">${I('bell')}<span class="dot"></span></button></div>
      <h1>O novo jeito de negociar <span>terra</span>.</h1>
      <form class="busca" data-busca><span>${I('sparkles')}</span><input name="q" placeholder="Ex.: 500 ha de soja no MT até 30 mi" aria-label="Buscar"><button class="go" aria-label="Procurar">${I('arrow-right')}</button></form></section>
    <div class="inicio">
      <div class="trilho" style="padding-top:14px">${['Fazenda', 'Sítio', 'Chácara', 'Rancho', 'Reserva', 'Expansão urbana'].map((t, i) => `<a class="chip ${i === 0 ? 'on' : ''}" href="#/comprar" data-tipo="${t}">${t === 'Expansão urbana' ? t : t + 's'}</a>`).join('')}</div>
      <div class="mods">
        <a href="#/comprar"><span class="ic">${I('search')}</span>Quero comprar</a>
        <a href="#/vender"><span class="ic">${I('tag')}</span>Quero vender</a>
        <a href="#/arrendar"><span class="ic">${I('handshake')}</span>Quero arrendar</a>
        <a href="#/avaliacao"><span class="ic">${I('gauge')}</span>Avaliação</a>
        <a href="#/gado"><span class="ic">${I('beef')}</span>Compra e venda de gado</a>
        <a href="#/regularizacao"><span class="ic">${I('file-check-2')}</span>Regularização</a>
        <a href="#/financeiro"><span class="ic">${I('landmark')}</span>Projetos financeiros</a>
        <a href="#/oportunidades"><span class="ic">${I('flame')}</span>Oportunidades</a>
      </div>
      <div class="sec"><h3>Certificadas</h3><a href="#/comprar">Ver todas</a></div>
      <div class="trilho">${cert.map(card).join('')}</div>
      <a class="ia-faixa" href="#/breve"><div><span class="selo cert">Em breve</span><h4>Raio-X da fazenda com IA</h4><p>Solo, chuva, saúde da lavoura e relevo em 3D, direto do satélite.</p></div></a>
      <div class="sec"><h3>Oportunidades</h3><a href="#/oportunidades">Ver todas</a></div>
      <div class="trilho">${oport.map(card).join('')}</div>
      <div class="sec"><h3>Últimas buscas</h3></div>
      <div class="ultimas">${ultimas.map(u => `<a href="#/comprar" data-q="${u}">${I('history')}${u}</a>`).join('')}</div>
      <div class="patro"><span class="av" style="background:var(--lima);color:var(--on-lima)">${I('sprout')}</span><div><small>Patrocinado · exemplo</small><b>Espaço para parceiro do agro</b><p>Sementes, máquinas, bancos e cooperativas anunciam aqui.</p></div></div>
      <div style="height:28px"></div>
    </div></div>${tab('inicio', true)}`;
  };

  // --- busca por conversa: lê o texto e vira filtro ---
  function lerBusca(q) {
    const t = q.toLowerCase(); const f = { ...filtro, texto: q };
    const mHa = t.match(/(\d[\d.]*)\s*(ha|hectares?)/); if (mHa) { const n = +mHa[1].replace(/\./g, ''); f.haMin = Math.round(n * .6); f.haMax = Math.round(n * 1.8); }
    const mAcima = t.match(/acima de\s*(\d[\d.]*)/); if (mAcima) { f.haMin = +mAcima[1].replace(/\./g, ''); f.haMax = 0; }
    const mVal = t.match(/at[ée]\s*(r\$\s*)?(\d+[\d,]*)\s*(mi|milh)/); if (mVal) f.valorMax = parseFloat(mVal[2].replace(',', '.')) * 1e6;
    const ufs = { mt: 'MT', mg: 'MG', go: 'GO', ms: 'MS', ba: 'BA', to: 'TO', sp: 'SP', 'mato grosso': 'MT', minas: 'MG', 'goiás': 'GO', goias: 'GO', bahia: 'BA', tocantins: 'TO', 'triângulo': 'MG', triangulo: 'MG' };
    f.uf = ''; for (const k in ufs) if (new RegExp('(^|\\s)' + k + '(\\s|$|,)').test(t)) f.uf = ufs[k];
    const cult = ['soja', 'milho', 'café', 'cafe', 'algodão', 'eucalipto', 'pecuária', 'pecuaria', 'gado', 'pasto'];
    f.cultura = ''; for (const c of cult) if (t.includes(c)) f.cultura = c.replace('cafe', 'café').replace('pecuaria', 'pecuária').replace('gado', 'pecuária').replace('pasto', 'pecuária');
    f.tipo = /s[ií]tio/.test(t) ? 'Sítio' : /ch[aá]cara/.test(t) ? 'Chácara' : /reserva/.test(t) ? 'Reserva' : /urbana|loteamento/.test(t) ? 'Expansão urbana' : '';
    return f;
  }
  function filtrar(f) {
    return PF.fazendas.filter(x =>
      (!f.tipo || x.tipo === f.tipo) && (!f.uf || x.uf === f.uf) &&
      (!f.cultura || (x.cultura + ' ' + x.aptidao).toLowerCase().includes(f.cultura === 'pecuária' ? 'pec' : f.cultura)) &&
      (!f.aptidao || x.aptidao === f.aptidao) && (!f.haMin || x.ha >= f.haMin) && (!f.haMax || x.ha <= f.haMax) && (!f.valorMax || x.preco <= f.valorMax));
  }
  const resumoFiltro = f => [f.tipo, f.uf, f.cultura, f.haMin ? 'a partir de ' + ha(f.haMin) : '', f.haMax ? 'até ' + ha(f.haMax) : '', f.valorMax ? 'até ' + mi(f.valorMax) : ''].filter(Boolean);

  T.comprar = () => {
    const res = filtrar(filtro); const r = resumoFiltro(filtro);
    return `<div class="tela fade">${topo('Quero comprar', '#/', `<a class="vol" href="#/mapa" aria-label="Ver no mapa">${I('map')}</a>`)}
      <form class="pad" data-busca style="margin-bottom:12px"><div class="busca" style="position:relative;left:0;right:0;bottom:0;box-shadow:none;border:1px solid var(--line)">${I('sparkles')}<input name="q" value="${filtro.texto || ''}" placeholder="Diga o que procura, do seu jeito"><button class="go">${I('arrow-right')}</button></div></form>
      ${filtro.texto ? `<div class="pad" style="margin-bottom:12px"><div class="cartao" style="background:var(--verde-soft);border-color:transparent;font-size:13.5px"><b>Entendi assim:</b> ${r.length ? r.join(' · ') : 'qualquer imóvel'}. <a class="link" href="#/comprar" data-limpa>Limpar</a></div></div>` : ''}
      <div class="trilho" style="margin-bottom:12px">${['', 'Fazenda', 'Sítio', 'Chácara', 'Rancho', 'Reserva', 'Expansão urbana'].map(t => `<button class="chip ${filtro.tipo === t ? 'on' : ''}" data-tipo="${t}">${t || 'Todos'}</button>`).join('')}</div>
      <div class="pad" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span class="mut peq">${res.length} ${res.length === 1 ? 'anúncio' : 'anúncios'}</span><button class="link" data-acao="filtros" style="display:flex;gap:6px;align-items:center">${I('sliders-horizontal')}Filtrar</button></div>
      <div class="lista">${res.length ? res.map(item).join('') : `<div class="vazio">${I('search-x')}<p>Nada com esses filtros ainda.<br>Crie um alerta e avisamos no WhatsApp quando entrar.</p><button class="btn pri" style="margin-top:14px" data-acao="alerta">Criar alerta</button></div>`}</div>
    </div>${tab('mapa')}`;
  };

  function abrirFiltros() {
    const ufs = [...new Set(PF.fazendas.map(f => f.uf))].sort();
    const f = folha(`<h3 style="margin-bottom:16px">Filtrar</h3>
      <div class="duas"><div class="campo"><label for="fuf">Estado</label><select id="fuf"><option value="">Todos</option>${ufs.map(u => `<option ${filtro.uf === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
      <div class="campo"><label for="fapt">Aptidão</label><select id="fapt"><option value="">Todas</option>${['Agricultura', 'Pecuária', 'Silvicultura', 'Lazer', 'Reserva legal', 'Loteamento'].map(a => `<option ${filtro.aptidao === a ? 'selected' : ''}>${a}</option>`).join('')}</select></div></div>
      <div class="campo"><label for="fcult">Cultura</label><select id="fcult"><option value="">Todas</option>${['soja', 'milho', 'café', 'algodão', 'eucalipto', 'pecuária'].map(c => `<option value="${c}" ${filtro.cultura === c ? 'selected' : ''}>${c[0].toUpperCase() + c.slice(1)}</option>`).join('')}</select></div>
      <div class="duas"><div class="campo"><label for="fmin">Tamanho mínimo (ha)</label><input id="fmin" type="number" inputmode="numeric" value="${filtro.haMin || ''}" placeholder="0"></div>
      <div class="campo"><label for="fmax">Tamanho máximo (ha)</label><input id="fmax" type="number" inputmode="numeric" value="${filtro.haMax || ''}" placeholder="Sem limite"></div></div>
      <div class="duas"><div class="campo"><label for="falt">Altitude mínima (m)</label><input id="falt" type="number" placeholder="Qualquer"></div>
      <div class="campo"><label for="fval">Valor até (R$ mi)</label><input id="fval" type="number" inputmode="decimal" value="${filtro.valorMax ? filtro.valorMax / 1e6 : ''}" placeholder="Sem limite"></div></div>
      <div style="display:flex;gap:10px;margin-top:6px"><button class="btn cont" data-limpar style="flex:1">Limpar</button><button class="btn pri" data-ver style="flex:2">Ver anúncios</button></div>`);
    $('[data-ver]', f).onclick = () => {
      Object.assign(filtro, { uf: $('#fuf').value, aptidao: $('#fapt').value, cultura: $('#fcult').value, haMin: +$('#fmin').value || 0, haMax: +$('#fmax').value || 0, valorMax: (+$('#fval').value || 0) * 1e6 });
      f.remove(); render();
    };
    $('[data-limpar]', f).onclick = () => { Object.assign(filtro, { uf: '', aptidao: '', cultura: '', haMin: 0, haMax: 0, valorMax: 0, texto: '' }); f.remove(); render(); };
  }

  // --- polígono da fazenda (formato irregular gerado a partir da área) ---
  function poligono(f) {
    const r = Math.sqrt(f.ha * 1e4 / Math.PI); let s = f.id.split('').reduce((a, c) => a + c.charCodeAt(0), 7);
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280; const pts = [];
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, k = .75 + rnd() * .45; pts.push([f.lng + Math.cos(a) * r * k / (111320 * Math.cos(f.lat * Math.PI / 180)), f.lat + Math.sin(a) * r * k / 110540]); }
    pts.push(pts[0]); return pts;
  }
  const estiloSat = {
    version: 8,
    sources: {
      sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 18, attribution: 'Imagens © Esri, Maxar, Earthstar' },
      dem: { type: 'raster-dem', tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'], tileSize: 256, encoding: 'terrarium', maxzoom: 14 }
    },
    layers: [{ id: 'sat', type: 'raster', source: 'sat' }]
  };
  let mapas = [];
  function limparMapas() { mapas.forEach(m => { try { m.remove(); } catch {} }); mapas = []; }

  function mapaFazenda(el, f) {
    if (!window.maplibregl) { el.innerHTML = '<div class="vazio">Mapa indisponível sem internet.</div>'; return; }
    const r = Math.sqrt(f.ha * 1e4 / Math.PI), w = el.clientWidth || 358;
    const zoom = Math.min(16, Math.log2(156543 * Math.cos(f.lat * Math.PI / 180) * w / (7 * r)));
    const m = new maplibregl.Map({ container: el, style: estiloSat, center: [f.lng, f.lat], zoom, pitch: 0, attributionControl: { compact: true }, cooperativeGestures: false });
    mapas.push(m);
    m.on('load', () => {
      m.addSource('area', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [poligono(f)] } } });
      m.addLayer({ id: 'area-f', type: 'fill', source: 'area', paint: { 'fill-color': '#b5d334', 'fill-opacity': .18 } });
      m.addLayer({ id: 'area-l', type: 'line', source: 'area', paint: { 'line-color': '#b5d334', 'line-width': 3 } });
    });
    return m;
  }
  function modo3D(m, liga) {
    if (!m) return;
    if (liga) {
      m.setTerrain({ source: 'dem', exaggeration: 1.5 });
      clearInterval(m._gira); clearTimeout(m._espera);
      m.easeTo({ pitch: 58, bearing: -30, zoom: m.getZoom() - .5, duration: 1600 });
      m._espera = setTimeout(() => { let b = m.getBearing(); m._gira = setInterval(() => { b += .2; m.setBearing(b); }, 40); }, 1700);
      const para = () => { clearInterval(m._gira); clearTimeout(m._espera); };
      m.once('mousedown', para); m.once('touchstart', para); m.once('wheel', para);
    } else { clearInterval(m._gira); clearTimeout(m._espera); m.setTerrain(null); m.easeTo({ pitch: 0, bearing: 0, zoom: m.getZoom() + .5, duration: 900 }); }
  }

  T.mapa = () => `<div class="tela sem-tab" style="padding:0"><div class="mapa-cheio" id="mapaGeral"></div>
    <div class="sobre-mapa"><a class="vol" href="#/" style="width:46px;height:46px;border-radius:14px;background:#fff;display:grid;place-items:center;box-shadow:var(--sh)">${I('arrow-left')}</a>
    <form data-busca style="flex:1"><div class="busca" style="position:relative;left:0;right:0;bottom:0;height:46px;padding:4px 4px 4px 14px">${I('search')}<input name="q" placeholder="Buscar no mapa"><button class="go" style="width:38px;height:38px">${I('arrow-right')}</button></div></form></div>
    <div class="cartao-mapa" id="cartaoMapa"></div></div>${tab('mapa')}`;
  function montarMapaGeral() {
    const el = $('#mapaGeral'); if (!el || !window.maplibregl) return;
    const m = new maplibregl.Map({ container: el, style: estiloSat, center: [-50.5, -15.5], zoom: 3.7, attributionControl: { compact: true } });
    mapas.push(m);
    const mostra = f => { $('#cartaoMapa').innerHTML = item(f); lucide.createIcons(); };
    PF.fazendas.forEach(f => {
      const w = document.createElement('div'); const d = document.createElement('div'); w.appendChild(d);
      d.className = 'marcador' + (f.selo ? ' cert' : ''); d.textContent = f.sigilosa ? 'Sigilosa' : mi(f.preco);
      w.onclick = () => { mostra(f); m.flyTo({ center: [f.lng, f.lat], zoom: 9, duration: 1400 }); };
      new maplibregl.Marker({ element: w, anchor: 'bottom' }).setLngLat([f.lng, f.lat]).addTo(m);
    });
    mostra(PF.fazendas[0]);
  }

  T.fazenda = id => {
    const f = F(id); if (!f) return T.inicio();
    const c = C(f.corretor); const d = difRegiao(f);
    const pos = Math.max(4, Math.min(96, 50 + d * 1.6));
    const fotos = f.sigilosa ? ['cerrado'] : f.fotos;
    const docTxt = { ok: ['ok', 'Em dia'], vencendo: ['venc', 'Vence em 30 dias'], faltando: ['falt', 'Faltando'] };
    return `<div class="tela sem-tab fade" style="padding-bottom:0">
    <div class="galeria"><div class="trilho" id="galeria">${fotos.map(p => `<div style="background-image:url(${img(p)})${f.sigilosa ? ';filter:blur(6px) brightness(.7)' : ''}"></div>`).join('')}</div>
      <div class="bts"><a href="javascript:history.back()" aria-label="Voltar">${I('arrow-left')}</a><div style="display:flex;gap:8px"><button data-acao="compartilhar" aria-label="Compartilhar">${I('share-2')}</button><button data-fav="${f.id}" class="${favs.includes(f.id) ? 'favon' : ''}" aria-label="Favoritar" style="${favs.includes(f.id) ? 'color:var(--lar-f)' : ''}">${I('heart')}</button></div></div>
      <span class="cont">${fotos.length} ${fotos.length > 1 ? 'fotos' : 'foto'} · exemplo</span></div>
    <div class="anuncio">
      <div style="display:flex;gap:6px;flex-wrap:wrap">${selos(f)}</div>
      <h1>${f.titulo}</h1><p class="mut">${f.tipo} à venda em ${f.cidade} · ${f.uf}</p>
      ${f.sigilosa ? `<div class="sigilo">${I('lock')}<b style="font-family:var(--fd);font-size:17px">Venda sigilosa</b><p>O dono pediu sigilo. Fotos, valor e localização exata aparecem só para comprador verificado, depois que o corretor aprova.</p><button class="btn pri" data-acao="verificar">Quero ver os detalhes</button></div>
      <div class="fichas"><div><small>Área total</small><b>${ha(f.ha)}</b></div><div><small>Aptidão</small><b>${f.aptidao}</b></div><div><small>Bioma</small><b>${f.bioma}</b></div></div>` : `
      <div class="preco"><div><small>Valor de venda</small><strong>${mi(f.preco)}</strong></div><div class="dir"><small>Valor por hectare</small><b>${milha(Math.round(porHa(f)))}</b></div></div>
      <div class="comp"><b style="font-size:14px">${d < 0 ? `${-d}% abaixo` : d > 0 ? `${d}% acima` : 'Na média'} do preço da região</b><p class="peq mut">Média de ${f.cidade} e vizinhas: ${milha(f.precoRegiao)} (exemplo)</p>
        <div class="barra"><i style="left:calc(${pos}% - 8px);background:${d <= 0 ? 'var(--verde)' : 'var(--lar)'}"></i><i style="left:calc(50% - 8px);background:var(--mata);width:4px;border:0;border-radius:2px;top:-4px;height:16px;box-shadow:none"></i></div>
        <div class="eixo"><span>Mais barato</span><span>Média</span><span>Mais caro</span></div></div>
      <div class="fichas"><div><small>Área total</small><b>${ha(f.ha)}</b></div><div><small>Área aberta</small><b>${ha(f.abertaHa)}</b></div><div><small>Reserva</small><b>${ha(f.reservaHa)}</b></div>
        <div><small>Aptidão</small><b>${f.aptidao}</b></div><div><small>Altitude</small><b>${f.altitude} m</b></div><div><small>Cidade</small><b>${f.cidadeKm} km</b></div></div>
      <div class="bloco"><h3>Descrição</h3><p>${f.desc}</p></div>
      <div class="bloco"><h3>O que a propriedade tem</h3><div class="tags">${f.opcionais.map(o => `<span>${I('check')}${o}</span>`).join('')}</div></div>`}
      <div class="bloco"><h3>Raio-X da fazenda</h3>
        <div class="mapa" id="mapaF"><div class="ctrl"><button class="on" data-modo="2d">Satélite</button><button data-modo="3d">Relevo 3D</button></div><span class="leg">Contorno aproximado · exemplo</span></div>
        <div class="raio"><div><small>Bioma</small><b>${f.bioma}</b></div><div><small>Chuva média</small><b>${f.chuva.toLocaleString('pt-BR')} mm/ano</b></div>
        <div><small>Cultura / uso</small><b>${f.cultura}</b></div><div><small>Estrada de terra</small><b>${f.terraKm} km</b></div></div>
        <a class="link" href="#/breve" style="display:inline-flex;gap:6px;align-items:center;margin-top:10px">${I('sparkles')}Em breve: saúde da lavoura e solo pelo satélite</a></div>
      ${f.sigilosa ? '' : `<div class="bloco"><h3>Documentos</h3><div class="docs">${Object.entries(f.docs).map(([k, v]) => `<div>${I(v === 'ok' ? 'file-check-2' : v === 'vencendo' ? 'file-clock' : 'file-x')}${k === 'Geo' ? 'Georreferenciamento' : k}<span class="${docTxt[v][0]}">${docTxt[v][1]}</span></div>`).join('')}</div>
        ${Object.values(f.docs).some(v => v !== 'ok') ? `<a class="btn cont full" href="#/regularizacao" style="margin-top:10px">Resolver com um parceiro</a>` : ''}</div>`}
      <div class="bloco"><h3>Vídeo</h3><div class="breve" style="background-image:url(${img(f.sigilosa ? 'cerrado' : f.fotos[0])});min-height:190px;align-items:center;justify-content:center;cursor:pointer" data-acao="video"><div style="text-align:center"><span style="width:64px;height:64px;border-radius:50%;background:var(--lar-f);display:inline-grid;place-items:center">${I('play')}</span><p style="margin-top:8px">Voo de drone · exemplo</p></div></div></div>
      <div class="bloco"><h3>Corretor responsável</h3><div class="corretor"><span class="av">${c.foto}</span><div style="flex:1"><b>${c.nome}</b><p class="peq mut">${c.creci} · ${c.regiao}</p><p class="peq">${I('star', 'ok')} ${c.nota} · ${c.vendas12m} vendas em 12 meses</p></div></div></div>
    </div>
    <div class="acoes"><a class="btn marca" href="#/chat/${c.id}">${I('message-circle')}Conversar</a><button class="btn zap" data-acao="zap">${I('phone')}WhatsApp</button></div>
    </div>`;
  };

  // --- QUERO VENDER (passos) ---
  const venda = { passo: 0, tipo: 'Fazenda', ia: false, plano: 'Profissional', sigilosa: false };
  T.vender = () => {
    const p = venda.passo, total = 5;
    const passos = `<div class="passos">${Array.from({ length: total }, (_, i) => `<i class="${i <= p ? 'on' : ''}"></i>`).join('')}</div>`;
    const nav = (txt = 'Continuar') => `<div style="display:flex;gap:10px;margin:8px 0 24px">${p > 0 ? `<button class="btn cont" data-passo="-1" style="flex:1">Voltar</button>` : ''}<button class="btn pri" data-passo="1" style="flex:2">${txt}</button></div>`;
    let corpo = '';
    if (p === 0) corpo = `<h3 style="font-size:20px;margin-bottom:6px">Qual imóvel você quer vender?</h3><p class="mut peq" style="margin-bottom:16px">Ou arrendar: dá para escolher depois.</p>
      <div class="escolha">${[['Fazenda', 'tractor'], ['Sítio', 'trees'], ['Chácara', 'house'], ['Rancho', 'tent-tree'], ['Reserva', 'leaf'], ['Expansão urbana', 'building-2']].map(([t, ic]) => `<button class="${venda.tipo === t ? 'on' : ''}" data-vtipo="${t}">${I(ic)}${t}</button>`).join('')}</div>
      <div class="ia-box"><div class="linha">${I('sparkles')}<b style="font-family:var(--fd)">Monte meu anúncio com IA</b></div><p>Mande as fotos e grave um áudio contando da fazenda. A IA escreve o anúncio, preenche a ficha e sugere o preço. Você só confere.</p><button class="btn pri" data-acao="ia-anuncio">Experimentar</button></div>
      <h3 style="font-size:16px;margin-bottom:12px">Seus dados</h3>
      <div class="campo"><label for="vn">Nome</label><input id="vn" value="Antônio Paiva"></div>
      <div class="duas"><div class="campo"><label for="vc">CPF</label><input id="vc" value="000.000.000-00"></div><div class="campo"><label for="vt">Telefone</label><input id="vt" value="(34) 9 0000-0000"></div></div>
      <div class="campo"><label for="ve">E-mail</label><input id="ve" value="antonio@exemplo.com"></div>
      <div class="campo"><label for="va">Endereço</label><input id="va" value="Uberaba · MG"></div>` + nav();
    if (p === 1) corpo = `<h3 style="font-size:20px;margin-bottom:16px">Dados do imóvel</h3>
      <div class="campo"><label for="ccir">CCIR (13 números)</label><input id="ccir" inputmode="numeric" value="950.050.123.456-7"></div>
      <div class="duas"><div class="campo"><label>Tamanho (ha)</label><input value="420" inputmode="numeric"></div><div class="campo"><label>Preço pedido (R$)</label><input value="16.800.000" inputmode="numeric"></div></div>
      <div class="duas"><div class="campo"><label>Estado</label><select><option>MG</option><option>GO</option><option>MT</option><option>MS</option><option>SP</option><option>BA</option><option>TO</option></select></div><div class="campo"><label>Município</label><input value="Uberaba"></div></div>
      <div class="duas"><div class="campo"><label>Área aberta (ha)</label><input value="330"></div><div class="campo"><label>Área de reserva (ha)</label><input value="90"></div></div>
      <div class="duas"><div class="campo"><label>Altitude (m)</label><input value="760"></div><div class="campo"><label>Bioma</label><select><option>Cerrado</option><option>Mata Atlântica</option><option>Amazônia</option><option>Caatinga</option><option>Pantanal</option><option>Pampa</option></select></div></div>
      <div class="duas"><div class="campo"><label>Cultura</label><input value="Pastagem"></div><div class="campo"><label>Aptidão</label><select><option>Pecuária</option><option>Agricultura</option><option>Silvicultura</option><option>Piscicultura</option><option>Lazer</option></select></div></div>
      <h3 style="font-size:16px;margin:6px 0 10px">Atividades</h3><div class="marcar">${['Agricultura', 'Pecuária', 'Silvicultura', 'Piscicultura'].map((a, i) => `<label><input type="checkbox" ${i === 1 ? 'checked' : ''}>${a}</label>`).join('')}</div>` + nav();
    if (p === 2) corpo = `<h3 style="font-size:20px;margin-bottom:6px">O que a propriedade tem</h3><p class="mut peq" style="margin-bottom:14px">Marque o que existe hoje.</p>
      <div class="marcar">${['Luz', 'Represa', 'Internet', 'Poço artesiano', 'Curral', 'Cocheira', 'Barracão de máquinas', 'Casa sede', 'Casa de funcionário', 'Pista de pouso', 'Hangar', 'Silo', 'Confinamento', 'Fábrica de ração', 'Divisões de pasto', 'Retiro'].map((o, i) => `<label><input type="checkbox" ${[0, 1, 4, 7, 8, 12, 14].includes(i) ? 'checked' : ''}>${o}</label>`).join('')}</div>
      <div class="campo"><label>Outros que não estão na lista</label><input placeholder="Ex.: balança, tronco, galpão de feno"></div>
      <h3 style="font-size:16px;margin:6px 0 10px">Localização</h3>
      <div class="campo"><label>Coordenada geográfica</label><input value="-19.60, -47.83"></div>
      <div class="duas"><div class="campo"><label>Cidade mais próxima (km)</label><input value="22"></div><div class="campo"><label>Estrada de terra (km)</label><input value="6"></div></div>` + nav();
    if (p === 3) corpo = `<h3 style="font-size:20px;margin-bottom:6px">Fotos e vídeos</h3><p class="mut peq" style="margin-bottom:14px">Anúncios com 10 fotos ou mais recebem até 3 vezes mais contatos.</p>
      <div class="fotos-up"><div class="tem" style="background-image:url(img/pasto.jpg)"><span>Principal</span></div><div class="tem" style="background-image:url(img/curral.jpg)"></div><div class="tem" style="background-image:url(img/represa.jpg)"></div><div class="tem" style="background-image:url(img/sede.jpg)"></div><div>${I('image-plus')}</div><div>${I('video')}</div></div>
      <div class="cartao" style="display:flex;gap:12px;align-items:center;margin-bottom:16px"><span class="av" style="background:var(--lar-soft);color:var(--lar-f)">${I('plane')}</span><div><b>Filmagem com drone</b><p class="peq mut">Incluída no plano Certificado. Nossa equipe vai até a fazenda.</p></div></div>
      <label class="cartao" style="display:flex;gap:12px;align-items:center;margin-bottom:16px;cursor:pointer"><span class="av">${I('lock')}</span><div style="flex:1"><b>Venda sigilosa</b><p class="peq mut">Sem fotos nem local exato no anúncio. Só comprador verificado vê.</p></div><input type="checkbox" data-sigilo ${venda.sigilosa ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--verde)"></label>` + nav();
    if (p === 4) corpo = `<h3 style="font-size:20px;margin-bottom:6px">Escolha o plano</h3><p class="mut peq" style="margin-bottom:16px">A comissão de 5% só é cobrada se vender, e é dividida com o corretor parceiro.</p>
      <div class="planos">${[['Gratuito', 'Grátis', ['Até 10 fotos', 'Logo do anunciante', 'Demarcação do imóvel no mapa']], ['Profissional', 'R$ 490', ['Até 15 fotos', 'Destaque na página inicial', 'Prioridade nas buscas', 'Filmagem e fotos com drone']], ['Certificado', 'R$ 1.490', ['Até 15 fotos e drone', 'Selo Certificada', 'Checagem de documentação', 'Visita ao imóvel', 'Prioridade nas ofertas selecionadas']]].map(([n, v, l]) => `<button class="plano ${venda.plano === n ? 'on' : ''}" data-plano="${n}">${n === 'Certificado' ? '<span class="selo cert rec">Mais vende</span>' : ''}<h4>${n}<b>${v}</b></h4><ul>${l.map(x => `<li>${x}</li>`).join('')}</ul></button>`).join('')}</div>
      <p class="peq mut" style="margin-bottom:8px">Preços de exemplo, a definir.</p>` + nav('Criar anúncio');
    if (p === 5) corpo = `<div class="vazio" style="padding-top:24px">${I('party-popper')}<h3 style="color:var(--ink);font-size:22px;margin-bottom:8px">Anúncio criado</h3><p>O corretor parceiro da sua região revisa em até 24 horas. Depois disso o anúncio entra no ar.</p></div>
      <div class="resultado"><small>Avaliação automática do seu imóvel</small><div class="faixa">R$ 15,9 mi a <span>R$ 17,6 mi</span></div><small>Seu pedido de R$ 16,8 mi está dentro da faixa.</small></div>
      <a class="btn pri full" href="#/f/f2">Ver como ficou</a><a class="btn cont full" href="#/meus" style="margin-top:10px">Meus anúncios</a>`;
    return `<div class="tela sem-tab fade">${topo(p === 5 ? 'Pronto' : 'Quero vender', '#/')}${p < 5 ? passos : ''}<div class="pad">${corpo}</div></div>`;
  };

  function iaAnuncio() {
    const f = folha(`<h3 style="margin-bottom:6px">Anúncio com IA</h3><p class="mut peq" style="margin-bottom:16px">Simulação do que a IA vai fazer na versão 2.</p>
      <div class="ia-box" id="iaPasso"><div class="linha">${I('mic')}<b>Gravando seu áudio…</b></div><div class="onda">${Array.from({ length: 28 }, (_, i) => `<i style="animation-delay:${(i % 7) * .1}s"></i>`).join('')}</div>
      <p>"A fazenda tem 420 hectares em Uberaba, pasto formado de braquiária, três represas, curral coberto com balança, casa sede e duas casas de funcionário…"</p></div>`);
    setTimeout(() => { const b = $('#iaPasso', f); if (!b) return; b.innerHTML = `<div class="linha">${I('sparkles')}<b>Lendo 4 fotos e o áudio</b> <span class="digitando"><i></i><i></i><i></i></span></div><p>Reconhecendo pasto, curral, represa e casa sede nas fotos…</p>`; lucide.createIcons(); }, 2200);
    setTimeout(() => { const b = $('#iaPasso', f); if (!b) return; b.outerHTML = `<div class="ia-box"><div class="linha">${I('check-circle-2')}<b>Anúncio pronto para você conferir</b></div>
      <div class="pronto"><b>Fazenda de pecuária com 420 ha em Uberaba (MG)</b><br>Pastagem formada de braquiária em 330 ha abertos, com 3 represas e água em todos os piquetes. Curral coberto com balança, casa sede e 2 casas de funcionário. Asfalto a 6 km.<br><br><b>Ficha preenchida:</b> 420 ha · Pecuária · Cerrado · 8 opcionais<br><b>Preço sugerido:</b> R$ 15,9 mi a R$ 17,6 mi</div>
      <button class="btn pri" data-fecha>Usar este anúncio</button></div>`; lucide.createIcons(); }, 4600);
  }

  // --- AVALIAÇÃO (fórmula do pai: 19 fatores) ---
  const av = { uf: 'MG', municipio: 'Uberaba', ha: 420, pastagem: 330, capim: 'Braquiária', cultura: 'Pecuária', vegetacao: 'Cerrado', altitude: 760, chuva: 1550, solo: 'Bom', topo: 'Plana a suave ondulada', cidade: 22, terra: 6, itens: ['Casa sede', 'Casa de funcionário', 'Confinamento'] };
  const baseUF = { MG: 34000, GO: 36000, MT: 31000, MS: 26000, SP: 52000, BA: 24000, TO: 15000, PR: 60000 };
  function calcula() {
    let v = baseUF[av.uf] || 28000; const fat = [];
    const add = (nome, pct) => { if (!pct) return; v *= 1 + pct / 100; fat.push([nome, pct]); };
    add('Cultura (' + av.cultura + ')', { Agricultura: 18, Pecuária: 0, Café: 40, Silvicultura: -18, Lazer: -10 }[av.cultura] || 0);
    add('Área aberta / pastagem', Math.round((av.pastagem / av.ha - .7) * 30));
    add('Capim', { Braquiária: 0, Mombaça: 4, 'Tifton / irrigado': 8, Degradado: -12 }[av.capim] || 0);
    add('Vegetação / bioma', { Cerrado: 0, 'Mata Atlântica': 6, Amazônia: -25, Caatinga: -20, Pantanal: -15 }[av.vegetacao] || 0);
    add('Altitude', av.altitude > 800 ? 4 : av.altitude < 300 ? -3 : 0);
    add('Chuva', av.chuva >= 1600 ? 5 : av.chuva < 1100 ? -10 : 0);
    add('Análise de terra', { 'Muito bom': 8, Bom: 3, Regular: -6, Fraco: -14 }[av.solo] || 0);
    add('Topografia', { 'Plana a suave ondulada': 4, Ondulada: -6, Montanhosa: -16 }[av.topo] || 0);
    add('Distância da cidade', av.cidade <= 15 ? 6 : av.cidade > 60 ? -10 : av.cidade > 35 ? -4 : 0);
    add('Estrada de terra', av.terra <= 5 ? 3 : av.terra > 25 ? -8 : av.terra > 12 ? -3 : 0);
    const benf = { 'Casa sede': 2, 'Casa de funcionário': 1, Silo: 4, 'Pista de pouso': 2, Lazer: 1, Confinamento: 3, 'Fábrica de ração': 2 };
    av.itens.forEach(i => add(i, benf[i]));
    add('Tamanho da área', av.ha > 2000 ? -6 : av.ha < 50 ? 25 : 0);
    const total = v * av.ha; return { porHa: v, min: total * .93, max: total * 1.07, fat };
  }
  const sufAv = { ha: 'ha', pastagem: 'ha', altitude: 'm', chuva: 'mm/ano', cidade: 'km', terra: 'km' };
  const resAv = () => { const r = calcula(); return `<small>Faixa estimada · ${av.municipio}/${av.uf} · ${ha(av.ha)}</small><div class="faixa">${mi(r.min)} a <span>${mi(r.max)}</span></div><small>≈ ${milha(Math.round(r.porHa))} · cálculo de exemplo</small>
        <div class="fatores">${[...r.fat].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 4).map(([n, p]) => `<div><span>${n}</span><span class="${p > 0 ? 'mais' : 'menos'}">${p > 0 ? '+' : ''}${p}%</span></div>`).join('')}</div>`; };
  T.avaliacao = () => {
    const sl = (k, rot, min, max, passo, suf) => `<div class="slider"><label for="s_${k}">${rot}<b id="v_${k}">${av[k].toLocaleString('pt-BR')} ${suf}</b></label><input id="s_${k}" type="range" min="${min}" max="${max}" step="${passo}" value="${av[k]}" data-av="${k}"></div>`;
    const sel = (k, rot, ops) => `<div class="campo"><label>${rot}</label><select data-av="${k}">${ops.map(o => `<option ${av[k] === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
    return `<div class="tela sem-tab fade">${topo('Quanto vale minha terra?', '#/')}<div class="pad">
      <div class="resultado" id="avRes">${resAv()}</div>
      <p class="peq mut" style="margin-bottom:16px">Mexa nos dados e veja o preço mudar. Na versão real, a IA cruza isso com vendas recentes da região e dados do satélite.</p>
      <div class="duas">${sel('uf', 'Estado', Object.keys(baseUF))}<div class="campo"><label>Município</label><input data-av="municipio" value="${av.municipio}"></div></div>
      ${sl('ha', 'Área total', 5, 5000, 5, 'ha')}${sl('pastagem', 'Área de pastagem / aberta', 0, av.ha, 5, 'ha')}
      <div class="duas">${sel('cultura', 'Cultura', ['Pecuária', 'Agricultura', 'Café', 'Silvicultura', 'Lazer'])}${sel('capim', 'Capim', ['Braquiária', 'Mombaça', 'Tifton / irrigado', 'Degradado'])}</div>
      <div class="duas">${sel('vegetacao', 'Vegetação', ['Cerrado', 'Mata Atlântica', 'Amazônia', 'Caatinga', 'Pantanal'])}${sel('solo', 'Análise de terra', ['Muito bom', 'Bom', 'Regular', 'Fraco'])}</div>
      ${sel('topo', 'Topografia', ['Plana a suave ondulada', 'Ondulada', 'Montanhosa'])}
      ${sl('altitude', 'Altitude', 0, 1400, 10, 'm')}${sl('chuva', 'Chuva média', 600, 2600, 50, 'mm/ano')}${sl('cidade', 'Distância da cidade', 0, 150, 1, 'km')}${sl('terra', 'Estrada de terra', 0, 80, 1, 'km')}
      <h3 style="font-size:15px;margin:4px 0 10px">Benfeitorias</h3><div class="marcar">${['Casa sede', 'Casa de funcionário', 'Silo', 'Pista de pouso', 'Lazer', 'Confinamento', 'Fábrica de ração'].map(i => `<label><input type="checkbox" data-item="${i}" ${av.itens.includes(i) ? 'checked' : ''}>${i}</label>`).join('')}</div>
      <a class="btn pri full" href="#/vender">Anunciar com este preço</a><a class="btn cont full" href="#/chat/c1" style="margin:10px 0 24px">Pedir avaliação de um corretor</a></div></div>`;
  };

  // --- ARRENDAR ---
  let arrModo = 'Pecuária';
  T.arrendar = () => `<div class="tela fade">${topo('Quero arrendar', '#/')}<div class="pad">
    <div class="escolha"><button class="${arrModo === 'Pecuária' ? 'on' : ''}" data-arr="Pecuária">${I('beef')}Pecuária</button><button class="${arrModo === 'Agricultura' ? 'on' : ''}" data-arr="Agricultura">${I('wheat')}Agricultura</button></div>
    <div class="duas"><div class="campo"><label>Estado</label><select><option>MG</option><option>GO</option><option>MT</option></select></div><div class="campo"><label>Cidade</label><input value="${arrModo === 'Pecuária' ? 'Uberaba' : 'Rio Verde'}"></div></div>
    ${arrModo === 'Pecuária' ? `<div class="duas"><div class="campo"><label>Área (ha)</label><input value="250"></div><div class="campo"><label>ou Quantidade de cabeças</label><input value="300"></div></div>
      <h3 style="font-size:15px;margin-bottom:10px">Categoria</h3><div class="marcar">${['Bezerro', 'Novilha', 'Garrote', 'Vaca', 'Boi'].map((c, i) => `<label><input type="checkbox" ${i === 2 ? 'checked' : ''}>${c}</label>`).join('')}</div>
      <div class="campo"><label>Tipo de pastagem</label><input value="Braquiária"></div>` : `<div class="duas"><div class="campo"><label>Área (ha)</label><input value="600"></div><div class="campo"><label>Cultura</label><input value="Soja"></div></div>`}
    <div class="campo"><label>Valor de locação</label><input value="${arrModo === 'Pecuária' ? '1,2 @ por cabeça/mês' : '12 sacas de soja por ha/ano'}"></div>
    <div class="fotos-up"><div class="tem" style="background-image:url(img/${arrModo === 'Pecuária' ? 'pasto' : 'soja'}.jpg)"><span>Fotos</span></div><div>${I('image-plus')}</div><div>${I('video')}Vídeos</div></div>
    <button class="btn pri full" data-acao="arr-publicar">Anunciar para arrendar</button>
    <div class="sec" style="margin:28px 0 12px"><h3>Pedidos que combinam</h3></div>
    <div class="lista" style="padding:0">${PF.arrendamentos.filter(a => a.tipo === arrModo && a.match).map(a => `<div class="servico"><span class="ic">${I('git-merge')}</span><div><h4>${a.match}</h4><p>${a.cidade}/${a.uf} · ${ha(a.ha)} · ${a.valor}</p><button class="link" style="margin-top:6px" data-acao="arr-contato">Ver arrendatário</button></div></div>`).join('')}</div>
    <div class="cartao" style="margin:16px 0 24px"><b>Quer arrendar uma área?</b><p class="peq mut" style="margin:4px 0 10px">Cadastre o que procura (mesmas informações acima, mais nome, telefone e e-mail) e avisamos quando entrar uma área que serve.</p><button class="btn cont" data-acao="arr-pedido">Cadastrar pedido</button></div>
  </div></div>${tab('inicio')}`;

  // --- GADO ---
  T.gado = () => `<div class="tela fade">${topo('Compra e venda de gado', '#/', `<button class="vol" data-acao="gado-anunciar" aria-label="Anunciar lote">${I('plus')}</button>`)}
    <div class="pad"><div class="cartao" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;background:var(--mata);color:#fff;border:0"><div><small style="opacity:.7">Arroba do boi · ${PF.arroba.praca}</small><b style="display:block;font:700 22px var(--fd)">R$ ${PF.arroba.valor},00</b></div><span class="selo verde">+1,8% na semana</span></div></div>
    <div class="trilho" style="margin-bottom:14px">${['Todos', 'Bezerro', 'Garrote', 'Novilha', 'Vaca prenhe', 'Boi gordo', 'Touro'].map((c, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-gcat="${c}">${c}</button>`).join('')}</div>
    <div class="lista" id="lotes">${PF.gado.map(lote).join('')}</div><div style="height:16px"></div></div>${tab('inicio')}`;
  function lote(g) {
    const arroba = g.peso.includes('@') ? parseFloat(g.peso.replace(',', '.')) : parseInt(g.peso) / 30;
    const vsArroba = g.precoCab / arroba;
    return `<a class="item" href="javascript:void 0" data-lote="${g.id}"><div class="ft" style="background-image:url(${img(g.foto)})"></div><div class="tx"><small>${g.cidade} · ${g.uf} · ${g.km} km da cidade</small><span class="nm">${g.qtde} ${g.categoria.toLowerCase()}s · ${g.raca}</span><strong>${reais(g.precoCab)}/cab</strong><small>${g.idade} · ${g.peso} · ${g.sexo}${g.registro !== 'Não' ? ' · ' + g.registro : ''}</small><small>≈ R$ ${Math.round(vsArroba)}/@ · lote ${mi(g.precoCab * g.qtde)}</small></div></a>`;
  }
  function detalheLote(id) {
    const g = PF.gado.find(x => x.id === id);
    folha(`<div style="height:180px;border-radius:var(--r-lg);background:url(${img(g.foto)}) center/cover;margin-bottom:16px"></div><h3>${g.qtde} ${g.categoria.toLowerCase()}s ${g.raca}</h3><p class="mut peq" style="margin-bottom:12px">${g.cidade}/${g.uf} · animais a ${g.km} km da cidade</p>
      <table class="tabela"><tr><td>Categoria</td><td>${g.categoria}</td></tr><tr><td>Idade</td><td>${g.idade}</td></tr><tr><td>Sexo</td><td>${g.sexo}</td></tr><tr><td>Quantidade</td><td>${g.qtde}</td></tr><tr><td>Peso médio</td><td>${g.peso}</td></tr><tr><td>Raça</td><td>${g.raca}</td></tr><tr><td>Registro</td><td>${g.registro}</td></tr><tr><td>Preço por cabeça</td><td>${reais(g.precoCab)}</td></tr><tr><td>Total do lote</td><td>${reais(g.precoCab * g.qtde)}</td></tr></table>
      <div style="display:flex;gap:10px;margin-top:16px"><button class="btn cont" data-fecha style="flex:1">Fechar</button><button class="btn pri" data-acao="gado-proposta" style="flex:2">Fazer proposta</button></div>`);
  }

  // --- REGULARIZAÇÃO ---
  T.regularizacao = () => `<div class="tela fade">${topo('Regularização', '#/')}<div class="pad">
    <div class="ia-box"><div class="linha">${I('scan-search')}<b style="font-family:var(--fd)">Raio-X dos papéis</b></div><p>Suba ITR, CCIR, CAR e matrícula. A IA lê e mostra o que está em dia, vencendo ou faltando. Exemplo da Fazenda Boa Vista:</p>
      <div class="docs">${[['ITR 2025', 'ok', 'Em dia'], ['CCIR', 'venc', 'Vence em 30 dias'], ['CAR', 'ok', 'Ativo'], ['Georreferenciamento (SIGEF)', 'ok', 'Certificado'], ['Outorga de água', 'falt', 'Faltando'], ['Licença ambiental', 'venc', 'Renovar em 2026']].map(([n, c, t]) => `<div style="color:var(--ink)">${n}<span class="${c}">${t}</span></div>`).join('')}</div>
      <button class="btn pri" data-acao="doc-enviar">Enviar meus documentos</button></div>
    <h3 style="font-size:16px;margin:8px 0 12px">Junto ao INCRA</h3>
    <div class="lista" style="padding:0;margin-bottom:20px">${[['file-text', 'ITR e CCIR', 'Declaração, emissão e atualização do cadastro rural.'], ['map-pinned', 'Georreferenciamento', 'Levantamento e certificação no SIGEF.'], ['trees', 'CAR', 'Cadastro Ambiental Rural e retificação.'], ['layers', 'Sobreposição de terra', 'Análise e solução de áreas sobrepostas.'], ['stamp', 'Titulação', 'Regularização fundiária e titulação.']].map(s => servico(...s)).join('')}</div>
    <h3 style="font-size:16px;margin:0 0 12px">Junto ao IBAMA e órgãos ambientais</h3>
    <div class="lista" style="padding:0">${[['scale', 'Defesas jurídicas', 'Defesa em autos de infração e embargos.'], ['clipboard-list', 'EIA/RIMA', 'Estudos de impacto ambiental.'], ['droplets', 'Outorga da água', 'Direito de uso de represa, poço e irrigação.'], ['shovel', 'Uso do solo e licenças', 'Licença ambiental, supressão, LAR.']].map(s => servico(...s)).join('')}</div>
    <p class="peq mut" style="margin:16px 0 24px">Os serviços são feitos por escritórios parceiros. A Platafarm recebe por indicação.</p></div></div>${tab('inicio')}`;
  const servico = (ic, t, d, extra = '') => `<div class="servico"><span class="ic">${I(ic)}</span><div style="flex:1"><h4>${t}</h4><p>${d}</p>${extra}</div><button class="link" data-acao="pedir" data-servico="${t}">Pedir</button></div>`;

  // --- PROJETOS FINANCEIROS ---
  const fin = { linha: 'Custeio pecuário', valor: 800000, prazo: 24, taxa: 10.5 };
  const linhas = { 'Custeio pecuário': [10.5, 12], 'Reforma de pasto': [8.5, 60], 'Compra de gado': [11, 36], 'Custeio agrícola': [10, 12], 'Pronamp investimento': [8, 96], 'Compra de terra': [12.5, 180] };
  function parcela() { const i = fin.taxa / 100 / 12; const n = fin.prazo; return fin.valor * i / (1 - Math.pow(1 + i, -n)); }
  const resFin = () => `<small>Simulador · ${fin.linha}</small><div class="faixa">${reais(parcela())}<span style="font-size:16px;color:rgba(255,255,255,.7)"> /mês</span></div><small>${reais(fin.valor)} em ${fin.prazo} meses · ${fin.taxa.toLocaleString('pt-BR')}% ao ano (exemplo)</small>`;
  T.financeiro = () => `<div class="tela fade">${topo('Projetos financeiros', '#/')}<div class="pad">
    <div class="resultado" id="finRes">${resFin()}</div>
    <div class="campo"><label>Linha</label><select data-fin="linha">${Object.keys(linhas).map(l => `<option ${fin.linha === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="slider"><label for="fv">Valor<b id="fin_valor">${reais(fin.valor)}</b></label><input id="fv" type="range" min="50000" max="10000000" step="50000" value="${fin.valor}" data-fin="valor"></div>
    <div class="slider"><label for="fp">Prazo<b id="fin_prazo">${fin.prazo} meses</b></label><input id="fp" type="range" min="6" max="180" step="6" value="${fin.prazo}" data-fin="prazo"></div>
    <button class="btn pri full" data-acao="fin-pedir" style="margin-bottom:24px">Pedir proposta a um parceiro</button>
    <h3 style="font-size:16px;margin-bottom:12px">Pecuária</h3>
    <div class="lista" style="padding:0;margin-bottom:20px">${[['wallet', 'Custeio', 'Ração, sal, vacina, mão de obra.'], ['sprout', 'Reforma de pasto', 'Correção, adubação e plantio de capim.'], ['beef', 'Compra de gado', 'Reposição e aumento de rebanho.']].map(s => servico(...s)).join('')}</div>
    <h3 style="font-size:16px;margin-bottom:12px">Agricultura</h3>
    <div class="lista" style="padding:0;margin-bottom:20px">${[['shovel', 'Preparo de solo', 'Calagem, gessagem e correção.'], ['package', 'Compra de insumos', 'Semente, adubo e defensivo.'], ['tractor', 'Plantio, manutenção e colheita', 'Custeio da safra inteira.']].map(s => servico(...s)).join('')}</div>
    <h3 style="font-size:16px;margin-bottom:12px">Seguros</h3>
    <div class="lista" style="padding:0;margin-bottom:20px">${[['shield-check', 'Seguro rural', 'Lavoura, rebanho, máquinas e benfeitorias.']].map(s => servico(...s)).join('')}</div>
    <div class="breve" style="background-image:url(img/silos.jpg);margin-bottom:24px"><div><span class="selo cert">Em breve</span><h4>CPR, barter, consórcio e crédito para comprar terra</h4><p>Tudo comparado lado a lado, com as taxas de cada banco e cooperativa.</p></div></div>
  </div></div>${tab('inicio')}`;

  // --- OPORTUNIDADES ---
  T.oportunidades = () => {
    const l = PF.fazendas.filter(f => !f.sigilosa && (difRegiao(f) <= -8 || f.urgente)).sort((a, b) => difRegiao(a) - difRegiao(b));
    return `<div class="tela fade">${topo('Oportunidades', '#/')}<p class="pad mut peq" style="margin-bottom:14px">Fazendas abaixo do preço médio da região e vendas com pressa.</p><div class="lista">${l.map(item).join('')}</div>
    <div class="pad" style="margin-top:16px"><div class="cartao" style="display:flex;gap:12px;align-items:center"><span class="av" style="background:var(--lima);color:var(--on-lima)">${I('bell-ring')}</span><div style="flex:1"><b>Alerta no WhatsApp</b><p class="peq mut">Aviso na hora quando entrar uma oportunidade do seu perfil.</p></div><button class="btn pri" style="height:40px;padding:0 14px" data-acao="alerta">Ativar</button></div></div></div>${tab('inicio')}`;
  };

  // --- CHAT ---
  T.chat = id => {
    if (!id) return `<div class="tela fade">${topo('Conversas', '#/')}<div class="lista">${PF.corretores.map((c, i) => `<a class="item" href="#/chat/${c.id}" style="align-items:center"><span class="av">${c.foto}</span><div class="tx" style="flex:1"><span class="nm">${c.nome}</span><small>${i === 1 ? 'Quinta às 9h, saindo de Sorriso…' : i === 0 ? 'Mandei a matrícula da Boa Vista.' : 'Posso te mostrar 3 áreas em Rio Verde.'}</small></div><small class="mut">${['ontem', '14:11', 'seg'][i]}</small></a>`).join('')}</div></div>${tab('chat')}`;
    const c = C(id);
    return `<div class="tela sem-tab fade" style="padding-bottom:0;display:flex;flex-direction:column">${topo(c.nome, '#/chat', `<span class="selo verde">${c.creci.split(' ')[0]}</span>`)}
      <div class="pad" style="margin-bottom:8px"><a class="item" href="#/f/f1" style="padding:8px"><div class="ft" style="width:56px;height:56px;background-image:url(img/soja.jpg)"></div><div class="tx"><span class="nm">Fazenda Santa Luzia</span><small>Sorriso · MT · R$ 47,3 mi</small></div></a></div>
      <div class="msgs" id="msgs" style="flex:1">${PF.chat.map(m => `<div class="msg ${m.de === 'eu' ? 'eu' : ''}">${m.txt}<small>${m.h}</small></div>`).join('')}</div>
      <form class="escrever" data-msg><input placeholder="Escreva para ${c.nome.split(' ')[0]}" aria-label="Mensagem"><button aria-label="Enviar">${I('send')}</button></form></div>`;
  };

  // --- MEU IMÓVEL / MENU ---
  T.meu = () => `<div class="tela fade">${topo('Meu imóvel', '#/')}<div class="pad">
    <div class="cartao" style="display:flex;gap:14px;align-items:center;margin-bottom:16px"><span class="av">AP</span><div style="flex:1"><b>Antônio Paiva</b><p class="peq mut">Vendedor e comprador · Uberaba/MG</p></div><span class="selo verde">Verificado</span></div>
    <div class="grade2" style="margin-bottom:16px"><a class="cartao kpi" href="#/meus"><small>Meus anúncios</small><b>1</b><em>412 visitas</em></a><a class="cartao kpi" href="#/favoritos"><small>Favoritos</small><b>${favs.length}</b><em>fazendas salvas</em></a></div>
    <div class="lista" style="padding:0">
      <a class="servico" href="#/meus"><span class="ic">${I('megaphone')}</span><div style="flex:1"><h4>Meus anúncios</h4><p>Visitas, contatos e propostas.</p></div>${I('chevron-right')}</a>
      <a class="servico" href="#/favoritos"><span class="ic">${I('heart')}</span><div style="flex:1"><h4>Favoritos</h4><p>As fazendas que você salvou.</p></div>${I('chevron-right')}</a>
      <a class="servico" href="#/corretor"><span class="ic">${I('briefcase')}</span><div style="flex:1"><h4>Área do corretor</h4><p>Carteira, interessados e comissões.</p></div>${I('chevron-right')}</a>
      <a class="servico" href="#/vender"><span class="ic">${I('tag')}</span><div style="flex:1"><h4>Anunciar outro imóvel</h4><p>Venda ou arrendamento.</p></div>${I('chevron-right')}</a>
      <a class="servico" href="#/breve"><span class="ic">${I('sparkles')}</span><div style="flex:1"><h4>O que vem com IA</h4><p>Raio-X por satélite, 3D, alertas.</p></div>${I('chevron-right')}</a>
      <a class="servico" href="opcoes.html"><span class="ic">${I('layout-template')}</span><div style="flex:1"><h4>Ver as 3 opções de tela inicial</h4><p>Para escolher o visual (versão de teste).</p></div>${I('chevron-right')}</a>
    </div><p class="peq mut" style="text-align:center;margin:20px 0">Platafarm · protótipo v1 · dados de exemplo</p></div></div>${tab('meu')}`;

  T.meus = () => { const f = F('f2'); return `<div class="tela fade">${topo('Meus anúncios', '#/meu')}<div class="lista">${item(f)}</div>
    <div class="pad" style="margin-top:14px"><div class="grade2"><div class="cartao kpi"><small>Visitas (30 dias)</small><b>412</b><em>+38% na semana</em></div><div class="cartao kpi"><small>Contatos</small><b>17</b><em>3 visitas marcadas</em></div><div class="cartao kpi"><small>Favoritaram</small><b>29</b></div><div class="cartao kpi"><small>Propostas</small><b>2</b><em>R$ 15,5 mi e R$ 16,1 mi</em></div></div>
    <div class="cartao" style="margin-top:12px;background:var(--lar-soft);border-color:transparent"><b>Dica da Platafarm</b><p class="peq" style="margin-top:4px">O CCIR vence em 30 dias. Comprador desconfia de documento vencido: <a class="link" href="#/regularizacao">renove com um parceiro</a>.</p></div></div></div>${tab('meu')}`; };

  T.favoritos = () => { const l = PF.fazendas.filter(f => favs.includes(f.id)); return `<div class="tela fade">${topo('Favoritos', '#/meu')}<div class="lista">${l.length ? l.map(item).join('') : `<div class="vazio">${I('heart')}<p>Toque no coração de uma fazenda para salvar aqui.</p></div>`}</div></div>${tab('meu')}`; };

  // --- ÁREA DO CORRETOR ---
  T.corretor = () => {
    const c = C('c2'); const minhas = PF.fazendas.filter(f => f.corretor === 'c2');
    const vgv = minhas.reduce((s, f) => s + f.preco, 0);
    return `<div class="tela fade">${topo('Área do corretor', '#/meu')}<div class="pad">
    <div class="cartao" style="display:flex;gap:14px;align-items:center;margin-bottom:14px"><span class="av">${c.foto}</span><div style="flex:1"><b>${c.nome}</b><p class="peq mut">${c.creci} · parceira Platafarm</p></div><span class="selo verde">${I('star')}${c.nota}</span></div>
    <div class="grade2" style="margin-bottom:16px"><div class="cartao kpi"><small>Carteira na plataforma</small><b>${mi(vgv)}</b><em>${minhas.length} fazendas</em></div><div class="cartao kpi"><small>Interessados novos</small><b>${PF.interessados.length}</b><em>2 quentes</em></div>
      <div class="cartao kpi"><small>Comissão prevista</small><b>${mi(PF.fazendas.find(f => f.id === 'f1').preco * .05)}</b><em>se vender a Santa Luzia</em></div><div class="cartao kpi"><small>Vendas em 12 meses</small><b>${c.vendas12m}</b></div></div>
    <h3 style="font-size:16px;margin-bottom:10px;display:flex;gap:8px;align-items:center">${I('sparkles', 'ok')}Interessados, resumidos pela IA</h3>
    <div class="lista" style="padding:0;margin-bottom:20px">${PF.interessados.map(p => { const f = F(p.fazenda); return `<div class="cartao"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b>${p.nome}</b>${p.quente ? '<span class="selo cert">Quente</span>' : '<span class="selo verde">Morno</span>'}</div><p class="peq mut" style="margin-bottom:6px">${f.titulo} · ${p.quando}</p><p class="peq">${p.resumo}</p><div style="display:flex;gap:8px;margin-top:10px"><a class="btn marca" style="height:40px;flex:1" href="#/chat/c2">Responder</a><button class="btn cont" style="height:40px;flex:1" data-acao="sugerir">Sugerir parecidas</button></div></div>`; }).join('')}</div>
    <h3 style="font-size:16px;margin-bottom:10px">Minha carteira</h3><div class="lista" style="padding:0;margin-bottom:16px">${minhas.map(item).join('')}</div>
    <div class="cartao" style="margin-bottom:24px"><b>Como funciona a comissão</b><table class="tabela" style="margin-top:8px"><tr><td>Venda da Santa Luzia</td><td>${mi(F('f1').preco)}</td></tr><tr><td>Comissão total (5%)</td><td>${mi(F('f1').preco * .05)}</td></tr><tr><td>Corretor (parte de exemplo, 60%)</td><td>${mi(F('f1').preco * .03)}</td></tr><tr><td>Platafarm (parte de exemplo, 40%)</td><td>${mi(F('f1').preco * .02)}</td></tr></table><p class="peq mut" style="margin-top:8px">Divisão a definir no contrato de parceria.</p></div>
  </div></div>${tab('meu')}`;
  };

  // --- EM BREVE (IA) ---
  T.breve = () => `<div class="tela fade">${topo('O que vem com IA', '#/')}<div class="pad"><p class="mut" style="margin-bottom:16px">Prévia do que entra nas próximas versões. A maior parte usa dados públicos de satélite, quase sem custo.</p>
    <div class="lista" style="padding:0">
    ${[['soja', 'Saúde da lavoura e do pasto (NDVI)', 'Imagem do satélite Sentinel-2 a cada 5 dias mostra onde o pasto está fraco e onde a lavoura rende mais.'],
      ['cerrado', 'Gêmeo 3D da fazenda', 'Relevo, represas, estradas e benfeitorias num modelo 3D para girar no celular. O relevo 3D já funciona no Raio-X de cada anúncio.'],
      ['milho', 'Solo e aptidão', 'Tipo de solo, aptidão agrícola e uso da terra por mapas públicos (Embrapa, MapBiomas), com laudo de laboratório como opção paga.'],
      ['represa', 'Água e chuva', 'Chuva dos últimos 10 anos, rios e represas, outorga de água.'],
      ['produtor', 'Assistente de compra', 'Diga o que procura e a IA monta uma lista com prós e contras de cada fazenda.'],
      ['pasto', 'Preço da terra por região', 'Mapa de preço por hectare com base nas vendas e anúncios da plataforma.']].map(([f, t, d]) => `<div class="breve" style="background-image:url(img/${f}.jpg)"><div><span class="selo cert">Em breve</span><h4>${t}</h4><p>${d}</p></div></div>`).join('')}
    </div><div style="height:24px"></div></div></div>${tab('inicio')}`;

  // ---------- roteador ----------
  function rota() {
    const h = location.hash.replace(/^#\/?/, ''); const [r, a] = h.split('/');
    switch (r) {
      case '': return ['inicio'];
      case 'f': return ['fazenda', a];
      case 'chat': return ['chat', a];
      default: return [T[r] ? r : 'inicio', a];
    }
  }
  function render() {
    limparMapas(); $$('.folha,.toast').forEach(x => x.remove());
    const [r, a] = rota(); app.innerHTML = T[r](a);
    lucide.createIcons();
    const tela = $('.tela', app); if (tela) tela.scrollTop = 0;
    if (r === 'fazenda') { const f = F(a); const el = $('#mapaF'); if (el && f) { const holder = document.createElement('div'); holder.style.cssText = 'position:absolute;inset:0'; el.prepend(holder); el._m = mapaFazenda(holder, f); } }
    if (r === 'mapa') montarMapaGeral();
    if (r === 'chat' && a) { const m = $('#msgs'); m.scrollIntoView({ block: 'end' }); }
  }
  window.addEventListener('hashchange', render);

  // ---------- cliques e formulários ----------
  app.addEventListener('click', e => {
    const fav = e.target.closest('[data-fav]');
    if (fav) { e.preventDefault(); e.stopPropagation(); const id = fav.dataset.fav; favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; guarda.set('favs', favs); fav.classList.toggle('on'); fav.style.color = favs.includes(id) ? 'var(--lar-f)' : ''; toast(favs.includes(id) ? 'Salva nos favoritos' : 'Removida dos favoritos', 'heart'); return; }
    const t = e.target.closest('[data-tipo]');
    if (t) { if (t.tagName === 'BUTTON') e.preventDefault(); filtro.tipo = t.dataset.tipo; filtro.texto = ''; if (t.tagName === 'BUTTON') render(); return; }
    const q = e.target.closest('[data-q]'); if (q) { Object.assign(filtro, lerBusca(q.dataset.q)); return; }
    if (e.target.closest('[data-limpa]')) { Object.assign(filtro, { tipo: 'Fazenda', uf: '', cultura: '', aptidao: '', haMin: 0, haMax: 0, valorMax: 0, texto: '' }); return; }
    const md = e.target.closest('[data-modo]');
    if (md) { $$('[data-modo]').forEach(b => b.classList.toggle('on', b === md)); modo3D($('#mapaF')._m, md.dataset.modo === '3d'); if (md.dataset.modo === '3d') toast('Relevo real do terreno, girando. Toque para parar.', 'mountain'); return; }
    const ps = e.target.closest('[data-passo]'); if (ps) { venda.passo = Math.max(0, Math.min(5, venda.passo + +ps.dataset.passo)); render(); return; }
    const vt = e.target.closest('[data-vtipo]'); if (vt) { venda.tipo = vt.dataset.vtipo; $$('[data-vtipo]').forEach(b => b.classList.toggle('on', b === vt)); return; }
    const pl = e.target.closest('[data-plano]'); if (pl) { venda.plano = pl.dataset.plano; $$('[data-plano]').forEach(b => b.classList.toggle('on', b === pl)); return; }
    const ar = e.target.closest('[data-arr]'); if (ar) { arrModo = ar.dataset.arr; render(); return; }
    const gc = e.target.closest('[data-gcat]'); if (gc) { $$('[data-gcat]').forEach(b => b.classList.toggle('on', b === gc)); const c = gc.dataset.gcat; $('#lotes').innerHTML = PF.gado.filter(g => c === 'Todos' || g.categoria === c).map(lote).join('') || `<div class="vazio">${I('beef')}<p>Nenhum lote de ${c.toLowerCase()} agora.</p></div>`; lucide.createIcons(); return; }
    const lt = e.target.closest('[data-lote]'); if (lt) { e.preventDefault(); detalheLote(lt.dataset.lote); return; }
    const ac = e.target.closest('[data-acao]'); if (!ac) return;
    const msgs = {
      avisos: ['Nova fazenda em Sorriso que combina com sua busca', 'bell'], compartilhar: ['Link do anúncio copiado', 'link'], zap: ['No app real, abre o WhatsApp do corretor', 'phone'],
      video: ['No app real, toca o vídeo de drone do anúncio', 'play'], alerta: ['Alerta criado. Avisamos no WhatsApp.', 'bell-ring'], verificar: ['Pedido enviado ao corretor para liberar os detalhes', 'lock-open'],
      'arr-publicar': ['Área anunciada para arrendamento', 'check-circle-2'], 'arr-contato': ['Contato do arrendatário liberado', 'user-check'], 'arr-pedido': ['Pedido de arrendamento cadastrado', 'check-circle-2'],
      'gado-anunciar': ['Cadastro de lote: categoria, idade, sexo, peso, raça, fotos e vídeos', 'plus'], 'gado-proposta': ['Proposta enviada ao vendedor do lote', 'send'],
      pedir: ['Pedido enviado: ' + (ac.dataset.servico || 'serviço'), 'send'], 'doc-enviar': ['No app real, você fotografa ou envia o PDF', 'upload'], 'fin-pedir': ['Pedido enviado a 3 parceiros de crédito', 'send'], sugerir: ['3 fazendas parecidas enviadas ao interessado', 'sparkles']
    };
    if (ac.dataset.acao === 'filtros') return abrirFiltros();
    if (ac.dataset.acao === 'ia-anuncio') return iaAnuncio();
    const m = msgs[ac.dataset.acao]; if (m) { if (ac.dataset.acao === 'gado-proposta') $$('.folha').forEach(x => x.remove()); toast(m[0], m[1]); }
  });
  app.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.matches('[data-busca]')) {
      const q = e.target.q.value.trim(); if (!q) { location.hash = '#/comprar'; return; }
      Object.assign(filtro, lerBusca(q)); ultimas = [q, ...ultimas.filter(u => u !== q)].slice(0, 4); guarda.set('ultimas', ultimas);
      if (location.hash === '#/comprar') render(); else location.hash = '#/comprar';
    }
    if (e.target.matches('[data-msg]')) {
      const i = e.target.querySelector('input'); const t = i.value.trim(); if (!t) return;
      const box = $('#msgs'); box.insertAdjacentHTML('beforeend', `<div class="msg eu">${t.replace(/</g, '&lt;')}<small>agora</small></div>`); i.value = '';
      setTimeout(() => { box.insertAdjacentHTML('beforeend', `<div class="msg">Anotado. Te respondo em instantes com os detalhes.<small>agora</small></div>`); box.lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, 900);
      box.lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  });
  app.addEventListener('input', e => {
    const k = e.target.dataset.av;
    if (k) {
      av[k] = e.target.type === 'range' ? +e.target.value : e.target.value;
      if (sufAv[k]) $('#v_' + k).textContent = av[k].toLocaleString('pt-BR') + ' ' + sufAv[k];
      if (k === 'ha') { const p = $('#s_pastagem'); p.max = av.ha; if (av.pastagem > av.ha) { av.pastagem = av.ha; p.value = av.ha; $('#v_pastagem').textContent = ha(av.ha); } }
      $('#avRes').innerHTML = resAv(); return;
    }
    const it = e.target.dataset.item; if (it) { av.itens = e.target.checked ? [...av.itens, it] : av.itens.filter(x => x !== it); $('#avRes').innerHTML = resAv(); return; }
    const fk = e.target.dataset.fin;
    if (fk) {
      fin[fk] = fk === 'linha' ? e.target.value : +e.target.value;
      if (fk === 'linha') { fin.taxa = linhas[fin.linha][0]; fin.prazo = linhas[fin.linha][1]; $('#fp').value = fin.prazo; }
      $('#fin_valor').textContent = reais(fin.valor); $('#fin_prazo').textContent = fin.prazo + ' meses'; $('#finRes').innerHTML = resFin(); return;
    }
    if (e.target.matches('[data-sigilo]')) venda.sigilosa = e.target.checked;
  });

  // ---------- abertura ----------
  render();
  const sp = $('.splash'); setTimeout(() => sp && sp.classList.add('sai'), 1500);
})();
