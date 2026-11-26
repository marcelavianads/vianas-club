/* Vianas Club — lógica do app.
   (Os nomes internos 'vianasfit'/'vianas-fit' ficam de propósito: são a chave dos dados e o carimbo do backup.)
   Os dados ficam só neste aparelho (localStorage). Nada é enviado para a internet. */
(() => {
'use strict';

// ---------- utilidades ----------
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const num = v => { if (v === '' || v == null) return null; const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };
const fmt = n => n == null ? '' : String(Math.round(n * 100) / 100).replace('.', ',');
const pad = n => String(n).padStart(2, '0');
const isoDia = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dataBR = iso => { const [a, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}/${a}`; };
const dataCurta = iso => { const [, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}`; };
const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const diaSemana = iso => SEMANA[new Date(iso + 'T12:00').getDay()];
const diasEntre = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
const quandoFoi = iso => { const d = diasEntre(iso, isoDia()); return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} dias`; };
const descansoTxt = s => s >= 60 ? (s % 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s / 60} min`) : `${s} s`;
const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const slug = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- dados ----------
const CHAVE = 'vianasfit:v1';
const novoEstado = () => ({
  app: 'vianas-fit', v: 1,
  plano: clone(window.PLANO_PADRAO), planoEditado: false,
  sessoes: [], avaliacoes: [],
  prefs: { local: 'academia' },
  emAndamento: null, ultimoBackup: null
});
let E;
function normalizar(d) {
  const n = novoEstado();
  return {
    ...n, ...d,
    prefs: { ...n.prefs, ...(d.prefs || {}) },
    plano: d.plano && Array.isArray(d.plano.treinos) && d.plano.treinos.length ? d.plano : n.plano,
    sessoes: Array.isArray(d.sessoes) ? d.sessoes : [],
    avaliacoes: Array.isArray(d.avaliacoes) ? d.avaliacoes : []
  };
}
function carregar() {
  try { const t = localStorage.getItem(CHAVE); if (t) E = normalizar(JSON.parse(t)); } catch (e) { /* começa do zero */ }
  if (!E) E = novoEstado();
  // Se o arquivo treinos.js ganhou versão nova e o plano não foi editado no app, usa o novo.
  if (!E.planoEditado && (E.plano.versao || 0) < (window.PLANO_PADRAO.versao || 0)) E.plano = clone(window.PLANO_PADRAO);
}
function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(E)); }
  catch (e) { toast('Não consegui salvar no aparelho. Exporte um backup.'); }
}

// ---------- plano ----------
const treinos = () => E.plano.treinos;
const treinoPorId = id => treinos().find(t => t.id === id);
function variante(slot, local) {
  const v = slot[local] || slot.academia || {};
  return {
    ...v,
    series: v.series ?? slot.series ?? 3,
    reps: v.reps ?? slot.reps ?? [8, 12],
    descanso: v.descanso ?? slot.descanso ?? 60,
    lado: v.lado ?? slot.lado ?? ''
  };
}
function proximoTreino() {
  const lista = treinos();
  const ult = E.sessoes[E.sessoes.length - 1];
  if (!ult) return lista[0];
  const i = lista.findIndex(t => t.id === ult.treinoId);
  return lista[(i + 1) % lista.length] || lista[0];
}
function voltaAtual() {
  const n = treinos().length || 5;
  const feitas = E.sessoes.length;
  const volta = Math.floor(feitas / n) + 1;
  const cada = E.plano.deloadACada || 0;
  return { volta, posicao: feitas % n, deload: cada > 1 && volta % cada === 0, cada };
}
function minutosEstimados(t, local) {
  let s = 5 * 60; // aquecimento
  t.exercicios.forEach(slot => {
    const v = variante(slot, local);
    const lados = v.lado ? 2 : 1;
    s += v.series * (40 * lados + v.descanso) + 60;
  });
  if (t.cardio) s += 17 * 60;
  return Math.round(s / 300) * 5;
}
const faixa = v => `${v.series} × ${v.reps[0]}–${v.reps[1]}${v.tempo ? ' s' : ''}`;

// ---------- vídeos ----------
const VIDEOS = window.PLANO_PADRAO.videos || {};
const linkSeguro = u => /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//.test(String(u || '')) ? u : '';
const nomeBase = n => String(n || '').replace(/\(.*?\)/g, '').trim().toLowerCase();
function idPorNome(nome) { // para substituições que são exercícios do próprio plano
  const alvo = nomeBase(nome);
  for (const t of treinos()) for (const slot of t.exercicios) for (const lugar of ['academia', 'casa']) {
    const v = slot[lugar]; if (v && nomeBase(v.nome) === alvo) return v.id;
  }
  return null;
}
function videoDe(ex) {
  const direto = linkSeguro(ex.video) || linkSeguro(VIDEOS[ex.id]) || linkSeguro(VIDEOS[idPorNome(ex.nome)]);
  if (direto) return { url: direto, busca: false };
  return { url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.nome.replace(/\(.*?\)/g, '') + ' execução'), busca: true };
}

// ---------- sugestão de carga (sobrecarga progressiva) ----------
function ultimaVez(id) {
  for (let i = E.sessoes.length - 1; i >= 0; i--) {
    const s = E.sessoes[i];
    if (s.deload) continue;
    const ex = s.exercicios.find(x => x.id === id && x.sets.some(t => t.feito));
    if (ex) return { sessao: s, ex };
  }
  return null;
}
function proximaCarga(c, equip) {
  if (equip === 'smith') return c + 2.5;
  if (equip === 'maquina') return c + 5;
  if (equip === 'polia') return c + 2.5;
  if (equip === 'halter') return c < 10 ? c + 1 : (Math.floor(c / 2) + 1) * 2; // sextavados de 1 em 1 kg; redondos de 2 em 2 kg
  return c + 1;
}
function sugestao(v, deload) {
  const u = ultimaVez(v.id);
  const [rmin, rmax] = v.reps;
  const novo = () => ({
    tipo: 'novo', carga: null, reps: [],
    txt: v.semCarga
      ? `Primeira vez: escolha a versão em que a última ${v.tempo ? 'parte' : 'repetição'} fica difícil, com 1–3 "no tanque".`
      : `Primeira vez: teste ${v.teste || 'uma carga leve'}. Ajuste até a última repetição ficar difícil, mas com 1–3 "no tanque".`
  });
  if (!u) return novo();
  const feitos = u.ex.sets.filter(s => s.feito);
  const reps = feitos.map(s => num(s.reps) || 0);
  const alvo = u.ex.series || v.series;
  const bateu = feitos.length >= alvo && reps.every(r => r >= rmax);
  const quando = quandoFoi(u.sessao.data);
  const un = v.tempo ? ' s' : '';
  if (v.semCarga) {
    if (deload) return { tipo: 'leve', carga: null, reps, txt: `Volta leve: metade das séries, sem forçar. Última vez (${quando}): ${reps.join(' · ')}${un}.` };
    if (bateu) return { tipo: 'subir', carga: null, reps, txt: v.tempo
      ? `Você segurou ${rmax} s em todas (${quando})! Hoje tente +10 s ou uma versão mais difícil.`
      : `Você bateu ${rmax} em todas (${quando})! Deixe mais difícil: versão mais difícil, elástico mais curto ou descida mais lenta.` };
    return { tipo: 'manter', carga: null, reps, txt: `Última vez (${quando}): ${reps.join(' · ')}${un}. Tente +1 ${v.tempo ? 'a 5 s' : 'repetição'} em alguma série.` };
  }
  const cargas = feitos.map(s => num(s.carga)).filter(c => c != null);
  if (!cargas.length) return novo();
  const c = Math.max(...cargas);
  if (deload) return { tipo: 'leve', carga: c, reps, txt: `Volta leve: mesma carga (${fmt(c)} kg), metade das séries, sem forçar.` };
  if (bateu) {
    const nova = proximaCarga(c, v.equip);
    let txt = `Você bateu ${rmax} em todas com ${fmt(c)} kg (${quando}). Suba para ${fmt(nova)} kg e volte para ${rmin} repetições.`;
    if (v.equip === 'maquina' || v.equip === 'polia') txt = `Você bateu ${rmax} em todas com ${fmt(c)} kg (${quando}). Suba uma placa (~${fmt(nova)} kg) e volte para ${rmin} repetições.`;
    if (v.equip === 'halter-ajustavel') txt += ' Se o halter não chegar nesse peso, mantenha e faça +2 repetições ou desça em 3 s.';
    return { tipo: 'subir', carga: nova, reps: [], txt };
  }
  return { tipo: 'manter', carga: c, reps, txt: `Última vez (${quando}): ${fmt(c)} kg × ${reps.join(' · ')}. Mantenha a carga e tente +1 repetição.` };
}

// ---------- interface: estado da tela ----------
let aba = 'hoje';
let treinoEscolhido = null; // id do treino escolhido na tela Hoje
let fazerLeve = true;       // na volta leve, dá para escolher fazer o treino normal
let resumoId = null;
let graficoEx = null, graficoAval = 'peso';
let editor = null;          // {treinoId, idx} ou null

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, ms);
}
function irPara(a) { aba = a; render(); window.scrollTo(0, 0); }

function render() {
  const emTreino = aba === 'treino' && E.emAndamento;
  document.body.classList.toggle('em-treino', !!emTreino);
  document.querySelectorAll('.abas button').forEach(b => b.classList.toggle('ativa', b.dataset.aba === aba));
  const d = new Date();
  $('#data-hoje').textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const tela = $('#tela');
  if (emTreino) tela.innerHTML = telaTreino();
  else if (aba === 'resumo') tela.innerHTML = telaResumo();
  else if (aba === 'historico') tela.innerHTML = telaHistorico();
  else if (aba === 'avaliacoes') tela.innerHTML = telaAvaliacoes();
  else if (aba === 'plano') tela.innerHTML = telaPlano();
  else { aba = 'hoje'; tela.innerHTML = telaHoje(); }
  renderEditor();
}

// ---------- tela HOJE ----------
function telaHoje() {
  const local = E.prefs.local;
  if (E.emAndamento) {
    const s = E.emAndamento;
    const feitas = s.exercicios.reduce((a, x) => a + x.sets.filter(t => t.feito).length, 0);
    const total = s.exercicios.reduce((a, x) => a + x.sets.length, 0);
    return `
      <p class="rotulo">Treino em andamento</p>
      <h1 class="titulo">Treino ${esc(s.treinoId)}</h1>
      <p class="sub">${esc(s.treinoNome)} · ${s.local === 'casa' ? 'Casa' : 'Academia'}</p>
      <div class="card"><p class="pequeno">${feitas} de ${total} séries feitas · começou às ${new Date(s.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        <button class="btn" data-acao="continuar">Continuar treino</button>
        <div class="linha-btns"><button class="btn perigo" data-acao="descartar">Descartar treino</button></div>
      </div>`;
  }
  const prox = proximoTreino();
  const t = treinoPorId(treinoEscolhido) || prox;
  const { volta, posicao, deload, cada } = voltaAtual();
  const ult = E.sessoes[E.sessoes.length - 1];
  const exs = t.exercicios.map(slot => variante(slot, local));
  const cardio = E.plano.cardio[local];
  let backup = '';
  if (E.sessoes.length >= 3) {
    const dias = E.ultimoBackup ? diasEntre(E.ultimoBackup.slice(0, 10), isoDia()) : null;
    if (dias == null || dias >= 14) backup = `<div class="aviso">${dias == null ? 'Você ainda não fez backup.' : `Seu último backup foi ${quandoFoi(E.ultimoBackup.slice(0, 10))}.`} Se o iPhone apagar os dados do app, o backup recupera tudo. <button class="link" data-acao="exportar">Fazer backup agora</button></div>`;
  }
  return `
    <p class="rotulo">${t.id === prox.id ? 'Próximo da fila' : 'Treino escolhido'} · volta ${volta} · ${posicao + 1}º de ${treinos().length}</p>
    <h1 class="titulo">Treino ${esc(t.id)}</h1>
    <p class="sub">${esc(t.nome)}</p>

    <div class="chave" role="group" aria-label="Onde vai treinar">
      <button data-acao="local" data-v="academia" class="${local === 'academia' ? 'ativa' : ''}">Academia</button>
      <button data-acao="local" data-v="casa" class="${local === 'casa' ? 'ativa' : ''}">Casa</button>
    </div>

    ${deload ? `<div class="aviso rosa"><b>Volta leve (deload).</b> A cada ${cada} voltas o corpo pede uma recuperação: metade das séries, mesma carga, sem forçar.
      <label class="check"><input type="checkbox" data-acao="leve" ${fazerLeve ? 'checked' : ''}> Fazer a volta leve hoje</label></div>` : ''}

    <div class="card">
      <p class="rotulo">Aquecimento · 5 min</p>
      <p class="pequeno" style="margin:0">${esc(E.plano.aquecimento[local])}</p>
      <ul class="lista-ex">
        ${exs.map(v => `<li><span class="nome">${esc(v.nome)}${v.lado ? ` <span class="fraco">(${esc(v.lado)})</span>` : ''}</span><span class="sr">${faixa(v)}</span></li>`).join('')}
        ${t.cardio ? `<li><span class="nome">${esc(cardio.nome)}</span><span class="sr">15–20 min</span></li>` : ''}
      </ul>
      <p class="pequeno" style="margin:10px 0 0">Tempo estimado: ~${minutosEstimados(t, local)} min</p>
    </div>

    <button class="btn" data-acao="comecar" data-id="${esc(t.id)}">Começar treino ${esc(t.id)}</button>

    <p class="secao">Fazer outro treino</p>
    <div class="chips">
      ${treinos().map(x => `<button class="chip letra ${x.id === t.id ? 'ativa' : ''}" data-acao="escolher" data-id="${esc(x.id)}" aria-label="Treino ${esc(x.id)}: ${esc(x.nome)}">${esc(x.id)}</button>`).join('')}
    </div>
    <p class="pequeno">${treinos().map(x => `<b>${esc(x.id)}</b> ${esc(x.nome)}`).join(' · ')}</p>
    ${ult ? `<p class="pequeno">Último treino: <b>${esc(ult.treinoId)}</b> (${esc(ult.treinoNome)}) ${quandoFoi(ult.data)}.</p>` : `<p class="pequeno">Primeiro treino! Nas primeiras vezes o app sugere cargas de teste e aprende com o que você anotar.</p>`}
    ${backup}`;
}

function comecar(id) {
  const t = treinoPorId(id); if (!t) return;
  const local = E.prefs.local;
  const { deload } = voltaAtual();
  const leve = deload && fazerLeve;
  E.emAndamento = {
    id: novoId(), inicio: Date.now(), data: isoDia(), treinoId: t.id, treinoNome: t.nome, local, deload: leve,
    aquecido: false, cardioPrevisto: !!t.cardio, cardio: { feito: false, min: '' }, timer: null,
    exercicios: t.exercicios.map((slot, i) => montarExercicio(variante(slot, local), leve, i, slot))
  };
  salvar(); destravarSom(); manterTela(true);
  aba = 'treino'; render(); window.scrollTo(0, 0);
}
function montarExercicio(v, leve, slotIdx, slot) {
  const series = leve ? Math.ceil(v.series / 2) : v.series;
  const sg = sugestao(v, leve);
  const ex = {
    slot: slotIdx, id: v.id, nome: v.nome, equip: v.equip || '', dica: v.dica || '', teste: v.teste || '', video: v.video || '',
    subs: v.subs || [], semCarga: !!v.semCarga, tempo: !!v.tempo,
    series, reps: v.reps, descanso: v.descanso, lado: v.lado || '',
    sugestao: sg.txt, tipoSug: sg.tipo, aberto: false, mostrarSubs: false,
    sets: []
  };
  for (let k = 0; k < series; k++) ex.sets.push(novaSerie(ex, sg, k));
  if (slot) ex.original = { id: v.id, nome: v.nome, equip: v.equip || '', dica: v.dica || '', teste: v.teste || '', video: v.video || '', semCarga: !!v.semCarga, tempo: !!v.tempo, reps: v.reps, lado: v.lado || '' };
  return ex;
}
function novaSerie(ex, sg, k) {
  let reps = ex.reps[0];
  if (sg && sg.tipo !== 'subir' && sg.reps && sg.reps.length) reps = sg.reps[Math.min(k, sg.reps.length - 1)];
  return { carga: sg && sg.carga != null ? fmt(sg.carga) : '', reps: sg && sg.tipo === 'novo' ? '' : String(reps), feito: false };
}

// ---------- tela TREINO EM EXECUÇÃO ----------
function telaTreino() {
  const s = E.emAndamento;
  const feitas = s.exercicios.reduce((a, x) => a + x.sets.filter(t => t.feito).length, 0);
  const total = s.exercicios.reduce((a, x) => a + x.sets.length, 0) || 1;
  const min = Math.floor((Date.now() - s.inicio) / 60000);
  const cardio = E.plano.cardio[s.local];
  return `
    <div class="barra-treino">
      <div class="linha">
        <div><h2>Treino ${esc(s.treinoId)}${s.deload ? ' · leve' : ''}</h2><div class="tempo"><span id="relogio-treino">${min} min</span> · ${s.local === 'casa' ? 'Casa' : 'Academia'} · ${feitas}/${total} séries</div></div>
        <button class="sair" data-acao="minimizar">Sair</button>
      </div>
      <div class="progresso"><i style="width:${Math.round(feitas / total * 100)}%"></i></div>
    </div>

    <div class="ex ${s.aquecido ? 'completo' : ''}">
      <div class="ex-topo"><span class="ex-num">${s.aquecido ? '✓' : '0'}</span>
        <div style="flex:1"><h3>Aquecimento · 5 min</h3><p class="pequeno" style="margin:4px 0 0">${esc(E.plano.aquecimento[s.local])}</p><p class="pequeno" style="margin:6px 0 0;color:var(--ouro)">Lembrete: inicie a atividade Força no seu Garmin.</p></div></div>
      <div class="linha-btns"><button class="btn sec" data-acao="aquecido">${s.aquecido ? 'Feito ✓' : 'Marcar como feito'}</button></div>
    </div>

    ${s.exercicios.map((ex, i) => cardExercicio(ex, i)).join('')}

    ${s.cardioPrevisto ? `
    <div class="ex ${s.cardio.feito ? 'completo' : ''}" id="cardio">
      <div class="ex-topo"><span class="ex-num">${s.cardio.feito ? '✓' : '♥'}</span>
        <div style="flex:1"><h3>${esc(cardio.nome)}</h3><p class="meta">${esc(cardio.detalhe)}</p></div></div>
      <div class="set" style="grid-template-columns:1fr 64px;margin-top:12px">
        <input data-campo="cardio-min" inputmode="numeric" placeholder="minutos" value="${esc(s.cardio.min)}" aria-label="Minutos de cardio">
        <button class="ok" data-acao="cardio" aria-label="Cardio feito">${s.cardio.feito ? '✓' : '✓'}</button>
      </div>
    </div>` : ''}

    <button class="btn" data-acao="finalizar" style="margin-top:18px">Finalizar treino</button>
    <div class="linha-btns"><button class="btn perigo" data-acao="descartar">Descartar treino</button></div>`;
}

function cardExercicio(ex, i) {
  const feitas = ex.sets.filter(t => t.feito).length;
  const completo = feitas === ex.sets.length && ex.sets.length > 0;
  const meta = `${ex.sets.length} × ${ex.reps[0]}–${ex.reps[1]}${ex.tempo ? ' s' : ''}${ex.lado ? ' ' + esc(ex.lado) : ''} · descanso ${descansoTxt(ex.descanso)}`;
  if (completo && !ex.aberto) {
    const res = ex.sets.map(t => ex.semCarga ? `${t.reps}${ex.tempo ? 's' : ''}` : `${t.carga || '–'}×${t.reps}`).join(' · ');
    return `<div class="ex completo" id="ex-${i}"><button class="ex-resumo" data-acao="abrir" data-ex="${i}">
      <div class="ex-topo"><span class="ex-num">✓</span><div style="flex:1"><h3>${esc(ex.nome)}</h3><p class="meta">${esc(res)}${ex.semCarga ? '' : ' kg'}</p></div></div></button></div>`;
  }
  const cls = ex.tipoSug === 'subir' ? 'subir' : ex.tipoSug === 'leve' ? 'leve' : '';
  const video = videoDe(ex);
  const subs = ex.original && ex.original.id !== ex.id ? [ex.original.nome, ...ex.subs.filter(n => n !== ex.nome)] : ex.subs;
  return `
  <div class="ex ${completo ? 'completo' : ''}" id="ex-${i}">
    <div class="ex-topo"><span class="ex-num">${completo ? '✓' : i + 1}</span>
      <div style="flex:1"><h3>${esc(ex.nome)}</h3><p class="meta">${meta}</p></div></div>
    <p class="sug ${cls}">${esc(ex.sugestao)}</p>
    <div class="sets ${ex.semCarga ? 'sem-carga' : ''}">
      <div class="set-cab"><span></span>${ex.semCarga ? '' : `<span>${/halter/.test(ex.equip) ? 'kg cada' : 'kg'}</span>`}<span>${ex.tempo ? 'seg' : 'reps'}</span><span></span></div>
      ${ex.sets.map((t, k) => `
      <div class="set ${t.feito ? 'feito' : ''}">
        <span class="n">${k + 1}</span>
        ${ex.semCarga ? '' : `<input data-campo="carga" data-ex="${i}" data-set="${k}" inputmode="decimal" placeholder="kg" value="${esc(t.carga)}" aria-label="Carga da série ${k + 1}">`}
        <input data-campo="reps" data-ex="${i}" data-set="${k}" inputmode="numeric" placeholder="${ex.reps[0]}–${ex.reps[1]}" value="${esc(t.reps)}" aria-label="${ex.tempo ? 'Segundos' : 'Repetições'} da série ${k + 1}">
        <button class="ok" data-acao="serie" data-ex="${i}" data-set="${k}" aria-label="Série ${k + 1} feita">✓</button>
      </div>`).join('')}
      <div class="mais-menos">
        ${ex.sets.length > 1 ? `<button data-acao="menos-serie" data-ex="${i}">− série</button>` : ''}
        <button data-acao="mais-serie" data-ex="${i}">+ série</button>
      </div>
    </div>
    <details class="como"><summary>Como fazer</summary><p>${esc(ex.dica || 'Movimento controlado, sem pressa na descida.')}</p></details>
    <div class="ex-acoes">
      <a class="btn sec" href="${esc(video.url)}" target="_blank" rel="noopener">${video.busca ? '▶ Buscar vídeo' : '▶ Ver vídeo'}</a>
      <button class="btn sec" data-acao="subs" data-ex="${i}">Trocar exercício</button>
    </div>
    ${ex.mostrarSubs ? `<div class="chips">${subs.map(n => `<button class="chip" data-acao="trocar" data-ex="${i}" data-nome="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <p class="pequeno" style="margin:0">Use se o aparelho estiver ocupado. Mesmas séries e repetições.</p>` : ''}
  </div>`;
}

function trocarExercicio(i, nome) {
  const s = E.emAndamento, ex = s.exercicios[i];
  let base;
  if (ex.original && nome === ex.original.nome) base = { ...ex.original };
  else {
    const semCarga = /mini band|elástico|prancha|dead bug|flexão|ponte com|bicicleta|elevação de pernas|elevação de joelhos|y e t|hidrante|mergulho|caminhada lateral|abdominal/i.test(nome)
      && !/halter|kettlebell|caneleira/i.test(nome);
    const tempo = /^prancha( lateral)?( na bola suíça| com joelho apoiado)?$/i.test(nome.trim());
    base = { id: 'sub-' + slug(nome), nome, equip: /smith/i.test(nome) ? 'smith' : /polia|crossover/i.test(nome) ? 'polia' : /halter|kettlebell/i.test(nome) ? 'halter' : semCarga ? 'corpo' : 'maquina',
      dica: `Substituição de "${ex.original ? ex.original.nome : ex.nome}". Mesmas séries e repetições; movimento controlado.`, teste: 'uma carga leve', semCarga, tempo,
      reps: tempo && !ex.tempo ? [20, 40] : ex.reps, lado: ex.lado };
  }
  const v = { ...base, series: ex.sets.length, descanso: ex.descanso };
  const sg = sugestao(v, s.deload);
  Object.assign(ex, { id: v.id, nome: v.nome, equip: v.equip, dica: v.dica, teste: v.teste, video: v.video || '', semCarga: !!v.semCarga, tempo: !!v.tempo, reps: v.reps, lado: v.lado,
    sugestao: sg.txt, tipoSug: sg.tipo, mostrarSubs: false });
  ex.sets = ex.sets.map((t, k) => t.feito ? t : novaSerie(ex, sg, k));
  salvar(); renderMantendoScroll();
  toast('Trocado para: ' + nome);
}

function marcarSerie(i, k) {
  const s = E.emAndamento, ex = s.exercicios[i], t = ex.sets[k];
  if (t.feito) { t.feito = false; salvar(); renderMantendoScroll(); return; }
  if (t.reps === '' || t.reps == null) t.reps = String(ex.reps[0]);
  t.feito = true;
  // copia carga e repetições para as próximas séries que ainda estão vazias (menos digitação)
  ex.sets.slice(k + 1).forEach(x => {
    if (x.feito) return;
    if (!ex.semCarga && (x.carga === '' || x.carga == null)) x.carga = t.carga;
    if (x.reps === '' || x.reps == null) x.reps = t.reps;
  });
  destravarSom();
  const exCompleto = ex.sets.every(x => x.feito);
  const ultimoDeTodos = s.exercicios.every(x => x.sets.every(y => y.feito));
  salvar();
  if (!ultimoDeTodos) {
    const prox = exCompleto ? s.exercicios.slice(i + 1).find(x => x.sets.some(y => !y.feito)) || s.exercicios.find(x => x.sets.some(y => !y.feito)) : ex;
    const falta = ex.sets.findIndex(x => !x.feito);
    const proxTxt = exCompleto ? (prox ? 'Próximo: ' + prox.nome : '') : `Série ${falta + 1} de ${ex.sets.length}`;
    iniciarTimer(ex.descanso, proxTxt);
  } else pararTimer();
  if (exCompleto) {
    ex.aberto = false;
    render();
    const proxIdx = s.exercicios.findIndex((x, j) => j > i && x.sets.some(y => !y.feito));
    const alvo = proxIdx >= 0 ? $('#ex-' + proxIdx) : (s.cardioPrevisto && !s.cardio.feito ? $('#cardio') : null);
    if (alvo) setTimeout(() => alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    if (ultimoDeTodos) toast(s.cardioPrevisto && !s.cardio.feito ? 'Musculação feita! Agora o cardio.' : 'Tudo feito! Toque em Finalizar treino.');
  } else renderMantendoScroll();
}

function renderMantendoScroll() { const y = window.scrollY; render(); window.scrollTo(0, y); }

// Confirmação própria do app (as janelas "confirm" do navegador podem ser bloqueadas)
function perguntar(msg, { ok = 'Confirmar', perigo = false } = {}) {
  return new Promise(responder => {
    const el = $('#pergunta');
    el.innerHTML = `<div class="folha-fundo" data-resp="0"></div>
      <div class="folha" role="alertdialog" aria-modal="true" aria-label="Confirmação">
        <p class="pergunta-txt">${esc(msg)}</p>
        <button class="btn ${perigo ? 'vermelho' : ''}" data-resp="1">${esc(ok)}</button>
        <div class="linha-btns"><button class="btn sec" data-resp="0">Cancelar</button></div>
      </div>`;
    el.onclick = e => {
      const b = e.target.closest('[data-resp]'); if (!b) return;
      el.innerHTML = ''; el.onclick = null; responder(b.dataset.resp === '1');
    };
  });
}

async function finalizar() {
  const s = E.emAndamento; if (!s) return;
  const total = s.exercicios.reduce((a, x) => a + x.sets.length, 0);
  const feitas = s.exercicios.reduce((a, x) => a + x.sets.filter(t => t.feito).length, 0);
  if (feitas === 0) {
    if (await perguntar('Nenhuma série foi marcada. Descartar este treino?', { ok: 'Descartar treino', perigo: true })) descartar(true);
    return;
  }
  if (feitas < total && !(await perguntar(`Faltam ${total - feitas} séries sem marcar. Finalizar assim mesmo?`, { ok: 'Finalizar treino' }))) return;
  if (!E.emAndamento) return;
  const fim = Date.now();
  const sessao = {
    id: s.id, data: s.data, inicio: s.inicio, fim, duracaoMin: Math.max(1, Math.round((fim - s.inicio) / 60000)),
    treinoId: s.treinoId, treinoNome: s.treinoNome, local: s.local, deload: !!s.deload, aquecido: !!s.aquecido,
    cardio: s.cardioPrevisto ? { feito: !!s.cardio.feito, min: num(s.cardio.min) } : null,
    exercicios: s.exercicios.map(x => ({
      id: x.id, nome: x.nome, equip: x.equip, teste: x.teste, series: x.series, reps: x.reps, lado: x.lado, semCarga: x.semCarga, tempo: x.tempo,
      sets: x.sets.map(t => ({ carga: x.semCarga ? null : num(t.carga), reps: num(t.reps), feito: !!t.feito }))
    }))
  };
  E.sessoes.push(sessao);
  E.emAndamento = null;
  treinoEscolhido = null; fazerLeve = true;
  salvar(); pararTimer(); manterTela(false);
  resumoId = sessao.id; aba = 'resumo'; render(); window.scrollTo(0, 0);
}
async function descartar(semPerguntar) {
  if (!semPerguntar && !(await perguntar('Descartar este treino? O que você anotou nele será apagado.', { ok: 'Descartar treino', perigo: true }))) return;
  E.emAndamento = null; salvar(); pararTimer(); manterTela(false); irPara('hoje');
}

// ---------- tela RESUMO (depois de finalizar) ----------
function telaResumo() {
  const s = E.sessoes.find(x => x.id === resumoId);
  if (!s) { aba = 'hoje'; return telaHoje(); }
  const series = s.exercicios.reduce((a, x) => a + x.sets.filter(t => t.feito).length, 0);
  const subir = s.exercicios.filter(x => {
    const f = x.sets.filter(t => t.feito);
    return !s.deload && f.length >= x.series && f.every(t => (t.reps || 0) >= x.reps[1]);
  });
  const prox = proximoTreino();
  return `
    <div class="card celebra">
      <p class="rotulo">Treino concluído</p>
      <div class="grande">Treino ${esc(s.treinoId)} ✓</div>
      <p class="sub">${esc(s.treinoNome)} · ${s.local === 'casa' ? 'Casa' : 'Academia'}</p>
      <div class="metricas">
        <div class="metrica"><div class="v">${s.duracaoMin} min</div><div class="l">duração</div></div>
        <div class="metrica"><div class="v">${series}</div><div class="l">séries feitas</div></div>
      </div>
      ${s.cardio ? `<p class="pequeno">${s.cardio.feito ? `Cardio feito${s.cardio.min ? ` (${fmt(s.cardio.min)} min)` : ''}.` : 'Cardio não marcado.'}</p>` : ''}
    </div>
    ${subir.length ? `<div class="aviso"><b>Na próxima vez, suba a carga em:</b><br>${subir.map(x => esc(x.nome)).join('<br>')}<br><span class="pequeno">Você bateu o topo da faixa em todas as séries. O app já vai sugerir a carga nova.</span></div>` : `<p class="pequeno">Na próxima vez, o app sugere manter as cargas e tentar +1 repetição onde der.</p>`}
    <p class="pequeno">Próximo da fila: <b>Treino ${esc(prox.id)}</b> (${esc(prox.nome)}).</p>
    <button class="btn" data-aba="hoje">Voltar ao início</button>`;
}

// ---------- tela HISTÓRICO ----------
function graficoSVG(pontos, unidade) {
  if (pontos.length < 2) return `<p class="pequeno" style="margin:8px 0">${pontos.length ? `Só um registro até agora (${fmt(pontos[0].y)} ${unidade}). O gráfico aparece a partir do 2º.` : 'Sem registros ainda.'}</p>`;
  const W = 340, H = 170, pl = 38, pr = 14, pt = 16, pb = 26;
  const ys = pontos.map(p => p.y);
  let mn = Math.min(...ys), mx = Math.max(...ys);
  if (mn === mx) { mn -= 1; mx += 1; }
  const folga = (mx - mn) * 0.12; mn -= folga; mx += folga;
  const x = i => pl + (W - pl - pr) * (pontos.length === 1 ? 0.5 : i / (pontos.length - 1));
  const y = v => pt + (H - pt - pb) * (1 - (v - mn) / (mx - mn));
  const linha = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const area = `${linha} L${x(pontos.length - 1).toFixed(1)},${H - pb} L${pl},${H - pb} Z`;
  const ticks = [mx - folga, (mx + mn) / 2, mn + folga];
  const ult = pontos[pontos.length - 1];
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução de ${esc(pontos[0].y)} a ${esc(ult.y)} ${unidade}">
    <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#BC5A40" stop-opacity=".25"/><stop offset="1" stop-color="#BC5A40" stop-opacity="0"/></linearGradient></defs>
    ${ticks.map(v => `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="#E8D9CB" stroke-width="1"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#968677">${fmt(Math.round(v * 10) / 10)}</text>`).join('')}
    <path d="${area}" fill="url(#g)"/>
    <path d="${linha}" fill="none" stroke="#BC5A40" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pontos.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.y)}" r="${i === pontos.length - 1 ? 5 : 3}" fill="${i === pontos.length - 1 ? '#94652F' : '#BC5A40'}"/>`).join('')}
    <text x="${pl}" y="${H - 6}" font-size="11" fill="#968677">${dataCurta(pontos[0].x)}</text>
    <text x="${W - pr}" y="${H - 6}" font-size="11" fill="#968677" text-anchor="end">${dataCurta(ult.x)}</text>
    <text x="${Math.min(x(pontos.length - 1), W - pr - 4)}" y="${Math.max(y(ult.y) - 10, 12)}" font-size="12" font-weight="700" fill="#2E231D" text-anchor="end">${fmt(ult.y)} ${unidade}</text>
  </svg>`;
}

function exerciciosRegistrados() {
  const mapa = new Map();
  E.sessoes.forEach(s => s.exercicios.forEach(x => { if (x.sets.some(t => t.feito)) mapa.set(x.id, x); }));
  return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}
function telaHistorico() {
  if (!E.sessoes.length) return `<h1 class="titulo">Histórico</h1><div class="vazio">Nenhum treino registrado ainda.<br>Quando você finalizar o primeiro, ele aparece aqui.</div>`;
  const exs = exerciciosRegistrados();
  if (!graficoEx || !exs.some(x => x.id === graficoEx)) graficoEx = (exs.find(x => !x.semCarga) || exs[0] || {}).id;
  const sel = exs.find(x => x.id === graficoEx);
  const pontos = [];
  if (sel) E.sessoes.forEach(s => {
    const x = s.exercicios.find(e => e.id === sel.id); if (!x) return;
    const f = x.sets.filter(t => t.feito);
    const vals = f.map(t => sel.semCarga ? t.reps : t.carga).filter(v => v != null);
    if (vals.length) pontos.push({ x: s.data, y: Math.max(...vals) });
  });
  const hoje = isoDia();
  const semana = E.sessoes.filter(s => diasEntre(s.data, hoje) < 7).length;
  const lista = [...E.sessoes].reverse();
  return `
    <h1 class="titulo">Histórico</h1>
    <p class="sub">${E.sessoes.length} treino${E.sessoes.length > 1 ? 's' : ''} no total · ${semana} nos últimos 7 dias</p>
    <div class="card grafico">
      <p class="rotulo">Evolução por exercício</p>
      <label class="campo"><span>Exercício</span><select data-campo="grafico-ex">
        ${exs.map(x => `<option value="${esc(x.id)}" ${x.id === graficoEx ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}
      </select></label>
      ${sel ? `<p class="pequeno" style="margin:0 0 6px">${sel.semCarga ? (sel.tempo ? 'Maior tempo (segundos) em cada treino' : 'Mais repetições numa série em cada treino') : 'Maior carga (kg) em cada treino'}</p>${graficoSVG(pontos, sel.semCarga ? (sel.tempo ? 's' : 'reps') : 'kg')}` : ''}
    </div>
    <p class="secao">Treinos feitos</p>
    ${lista.map(s => {
      const n = s.exercicios.reduce((a, x) => a + x.sets.filter(t => t.feito).length, 0);
      return `<details class="sessao"><summary>
        <span class="letra ${s.local === 'casa' ? 'casa' : ''}">${esc(s.treinoId)}</span>
        <span style="flex:1"><b>${esc(s.treinoNome)}</b><br><span class="pequeno">${diaSemana(s.data)}, ${dataBR(s.data)} · ${s.local === 'casa' ? 'casa' : 'academia'} · ${s.duracaoMin} min · ${n} séries${s.deload ? ' · leve' : ''}</span></span>
      </summary><div class="corpo"><table>
        ${s.exercicios.filter(x => x.sets.some(t => t.feito)).map(x => `<tr><td>${esc(x.nome)}</td><td>${x.sets.filter(t => t.feito).map(t => x.semCarga ? `${t.reps ?? '–'}${x.tempo ? 's' : ''}` : `${fmt(t.carga) || '–'}×${t.reps ?? '–'}`).join(' · ')}</td></tr>`).join('')}
        ${s.cardio && s.cardio.feito ? `<tr><td>Cardio</td><td>${s.cardio.min ? fmt(s.cardio.min) + ' min' : 'feito'}</td></tr>` : ''}
      </table><button class="btn perigo" data-acao="apagar-sessao" data-id="${esc(s.id)}">Apagar este treino</button></div></details>`;
    }).join('')}`;
}

// ---------- tela AVALIAÇÕES ----------
const METRICAS = [
  { k: 'peso', nome: 'Peso', un: 'kg', melhor: 0 },
  { k: 'musculo', nome: 'Músculo esquelético', un: 'kg', melhor: 1 },
  { k: 'gorduraPct', nome: 'Gordura', un: '%', melhor: -1 },
  { k: 'cintura', nome: 'Cintura', un: 'cm', melhor: -1 }
];
const EXTRAS = [
  { k: 'gorduraKg', nome: 'Massa de gordura', un: 'kg' }, { k: 'imc', nome: 'IMC', un: '' },
  { k: 'visceral', nome: 'Gordura visceral', un: 'nível' }, { k: 'rcq', nome: 'RCQ', un: '' }, { k: 'pontuacao', nome: 'Pontuação InBody', un: '/100' }
];
function avaliacoesOrdenadas() { return [...E.avaliacoes].sort((a, b) => a.data.localeCompare(b.data)); }
function telaAvaliacoes() {
  const av = avaliacoesOrdenadas();
  const m = METRICAS.find(x => x.k === graficoAval) || METRICAS[0];
  const pontos = av.filter(a => a[m.k] != null).map(a => ({ x: a.data, y: a[m.k] }));
  return `
    <h1 class="titulo">Avaliações</h1>
    <p class="sub">InBody e medidas, para ver a recomposição: mais músculo, menos gordura.</p>
    ${av.length ? `<div class="card grafico">
      <div class="chips">${METRICAS.map(x => `<button class="chip ${x.k === m.k ? 'ativa' : ''}" data-acao="grafico-aval" data-k="${x.k}">${x.nome === 'Músculo esquelético' ? 'Músculo' : x.nome}</button>`).join('')}</div>
      ${graficoSVG(pontos, m.un)}
    </div>` : `<div class="aviso">Nenhuma avaliação ainda. Importe o arquivo <b>backup inicial</b> em Plano → Backup (ele traz o seu InBody de 16/10/2026) ou registre uma nova abaixo.</div>`}

    <details class="card" id="nova-aval"><summary class="btn sec" style="list-style:none">+ Nova avaliação</summary>
      <form data-form="avaliacao" style="margin-top:10px">
        <label class="campo"><span>Data</span><input type="date" name="data" value="${isoDia()}" required></label>
        <div class="grade2">
          <label class="campo"><span>Peso (kg)</span><input name="peso" inputmode="decimal" placeholder="ex.: 60,0"></label>
          <label class="campo"><span>Músculo esquelético (kg)</span><input name="musculo" inputmode="decimal" placeholder="ex.: 25,0"></label>
          <label class="campo"><span>Gordura (%)</span><input name="gorduraPct" inputmode="decimal" placeholder="ex.: 22,0"></label>
          <label class="campo"><span>Cintura (cm)</span><input name="cintura" inputmode="decimal" placeholder="ex.: 70"></label>
          <label class="campo"><span>Massa de gordura (kg)</span><input name="gorduraKg" inputmode="decimal" placeholder="opcional"></label>
          <label class="campo"><span>Pontuação InBody</span><input name="pontuacao" inputmode="numeric" placeholder="opcional"></label>
        </div>
        <label class="campo"><span>Observação</span><textarea name="obs" placeholder="Ex.: braços 93%, pernas 106%"></textarea></label>
        <button class="btn" type="submit">Salvar avaliação</button>
      </form>
    </details>

    ${[...av].reverse().map((a, i, arr) => {
      const ant = arr[i + 1];
      return `<div class="card">
        <p class="rotulo">${dataBR(a.data)}${ant ? ` · comparado a ${dataBR(ant.data)}` : ' · ponto de partida'}</p>
        <div class="metricas">${METRICAS.map(x => {
          if (a[x.k] == null) return '';
          let d = '';
          if (ant && ant[x.k] != null) {
            const dif = Math.round((a[x.k] - ant[x.k]) * 10) / 10;
            const cls = dif === 0 || x.melhor === 0 ? '' : (Math.sign(dif) === x.melhor ? 'bom' : 'atencao');
            d = `<div class="d ${cls}">${dif > 0 ? '+' : dif < 0 ? '−' : ''}${fmt(Math.abs(dif))} ${x.un}</div>`;
          }
          return `<div class="metrica"><div class="v">${fmt(a[x.k])}<small style="font-size:13px;font-weight:400"> ${x.un}</small></div><div class="l">${x.nome}</div>${d}</div>`;
        }).join('')}</div>
        ${EXTRAS.some(x => a[x.k] != null) ? `<p class="pequeno" style="margin:10px 0 0">${EXTRAS.filter(x => a[x.k] != null).map(x => `${x.nome}: ${fmt(a[x.k])}${x.un ? ' ' + x.un : ''}`).join(' · ')}</p>` : ''}
        ${a.obs ? `<p class="pequeno" style="margin:8px 0 0">${esc(a.obs)}</p>` : ''}
        <button class="link" data-acao="apagar-aval" data-id="${esc(a.id)}">Apagar</button>
      </div>`;
    }).join('')}`;
}
function salvarAvaliacao(form) {
  const f = new FormData(form);
  const a = { id: novoId(), data: f.get('data') || isoDia(), obs: String(f.get('obs') || '').trim() };
  ['peso', 'musculo', 'gorduraPct', 'cintura', 'gorduraKg', 'pontuacao'].forEach(k => { const v = num(f.get(k)); if (v != null) a[k] = v; });
  if (!['peso', 'musculo', 'gorduraPct', 'cintura'].some(k => a[k] != null)) { toast('Preencha pelo menos uma medida.'); return; }
  E.avaliacoes.push(a); salvar(); toast('Avaliação salva.'); render();
}

// ---------- tela PLANO ----------
function telaPlano() {
  return `
    <h1 class="titulo">Plano</h1>
    <p class="sub">A fila segue ${treinos().map(t => t.id).join(' → ')} e recomeça. Toque num treino para ver e editar.</p>
    ${treinos().map(t => `
      <details class="treino-plano" ${editor && editor.treinoId === t.id ? 'open' : ''}>
        <summary><span class="letra-plano">${esc(t.id)}</span>
          <span style="flex:1"><b>${esc(t.nome)}</b><br><span class="pequeno">${t.exercicios.length} exercícios${t.cardio ? ' + cardio' : ''} · ~${minutosEstimados(t, E.prefs.local)} min</span></span></summary>
        <div class="corpo">
          ${t.exercicios.map((slot, i) => {
            const a = variante(slot, 'academia'), c = variante(slot, 'casa');
            return `<div class="item-plano">
              <div class="txt"><b>${esc(a.nome)}</b><small>Casa: ${esc(c.nome)}</small><small>${faixa(a)}${a.lado ? ' ' + esc(a.lado) : ''} · descanso ${descansoTxt(a.descanso)}</small></div>
              <button class="mini" data-acao="subir-ex" data-t="${esc(t.id)}" data-i="${i}" aria-label="Mover para cima" ${i === 0 ? 'disabled' : ''}>↑</button>
              <button class="mini" data-acao="editar-ex" data-t="${esc(t.id)}" data-i="${i}" aria-label="Editar">✎</button>
            </div>`;
          }).join('')}
          <div class="linha-btns"><button class="btn sec" data-acao="novo-ex" data-t="${esc(t.id)}">+ Exercício</button><button class="btn sec" data-acao="editar-treino" data-t="${esc(t.id)}">Nome e cardio</button></div>
        </div>
      </details>`).join('')}

    <p class="secao">Volta leve (deload)</p>
    <div class="card">
      <label class="campo"><span>Fazer uma volta leve a cada quantas voltas completas (A→E)?</span>
        <select data-campo="deload">${[0, 5, 6, 7, 8].map(n => `<option value="${n}" ${n === (E.plano.deloadACada || 0) ? 'selected' : ''}>${n ? n + ' voltas' : 'Nunca'}</option>`).join('')}</select></label>
      <p class="pequeno" style="margin:0">Na volta leve você faz metade das séries com a mesma carga. Ajuda a recuperar e voltar mais forte.</p>
    </div>

    <p class="secao">Backup</p>
    <div class="card">
      <p class="pequeno" style="margin-top:0">Seus treinos e avaliações ficam só neste iPhone. O backup é um arquivo com tudo. Guarde no iCloud Drive para não perder nada.</p>
      <button class="btn" data-acao="exportar">Exportar backup</button>
      <div class="linha-btns"><button class="btn sec" data-acao="importar">Importar backup</button></div>
      <p class="pequeno" style="margin-bottom:0">${E.ultimoBackup ? `Último backup: ${dataBR(E.ultimoBackup)}.` : 'Nenhum backup feito ainda.'}</p>
    </div>

    <p class="secao">Restaurar</p>
    <div class="card">
      <p class="pequeno" style="margin-top:0">Volta o plano para o original do arquivo treinos.js. O histórico e as avaliações não são apagados.</p>
      <button class="btn perigo" data-acao="restaurar-plano">Restaurar plano original</button>
    </div>
    <p class="pequeno fraco" style="text-align:center">Vianas Club · plano versão ${E.plano.versao || 1}${E.planoEditado ? ' (editado no app)' : ''}</p>`;
}

// Editor de exercício / treino (folha que sobe por cima da tela)
function renderEditor() {
  const camada = $('#camada');
  if (!editor) { camada.innerHTML = ''; return; }
  const t = treinoPorId(editor.treinoId);
  if (!t) { editor = null; camada.innerHTML = ''; return; }
  if (editor.tipo === 'treino') {
    camada.innerHTML = `<div class="folha-fundo" data-acao="fechar-editor"></div><div class="folha" role="dialog" aria-label="Editar treino">
      <h2>Treino ${esc(t.id)}</h2>
      <form data-form="treino">
        <label class="campo"><span>Nome</span><input name="nome" value="${esc(t.nome)}" required></label>
        <label class="check"><input type="checkbox" name="cardio" ${t.cardio ? 'checked' : ''}> Tem cardio no fim</label>
        <button class="btn" type="submit">Salvar</button>
        <div class="linha-btns"><button class="btn sec" type="button" data-acao="fechar-editor">Cancelar</button></div>
      </form></div>`;
    return;
  }
  const slot = editor.idx >= 0 ? t.exercicios[editor.idx] : { series: 3, reps: [10, 12], descanso: 60, academia: {}, casa: {} };
  const a = variante(slot, 'academia'), c = variante(slot, 'casa');
  const lados = ['', 'cada perna', 'cada lado', 'cada braço'];
  const parte = (p, v, titulo) => `<fieldset><legend>${titulo}</legend>
    <label class="campo"><span>Nome</span><input name="${p}-nome" value="${esc(v.nome || '')}" ${p === 'a' ? 'required' : ''} placeholder="${p === 'c' ? 'vazio = mesmo da academia' : ''}"></label>
    <div class="grade2">
      <label class="campo"><span>${v.tempo ? 'Segundos' : 'Reps'} mín.</span><input name="${p}-rmin" inputmode="numeric" value="${v.reps[0]}"></label>
      <label class="campo"><span>${v.tempo ? 'Segundos' : 'Reps'} máx.</span><input name="${p}-rmax" inputmode="numeric" value="${v.reps[1]}"></label>
    </div>
    <label class="campo"><span>Lado</span><select name="${p}-lado">${lados.map(l => `<option value="${l}" ${l === (v.lado || '') ? 'selected' : ''}>${l || '— (os dois juntos)'}</option>`).join('')}</select></label>
    <label class="check"><input type="checkbox" name="${p}-semCarga" ${v.semCarga ? 'checked' : ''}> Sem carga (só repetições)</label>
    <label class="check"><input type="checkbox" name="${p}-tempo" ${v.tempo ? 'checked' : ''}> Por tempo (prancha)</label>
    <label class="campo"><span>Carga de teste (1ª vez)</span><input name="${p}-teste" value="${esc(v.teste || '')}"></label>
    <label class="campo"><span>Como fazer</span><textarea name="${p}-dica">${esc(v.dica || '')}</textarea></label>
    <label class="campo"><span>Substituições (separe com ;)</span><input name="${p}-subs" value="${esc((v.subs || []).join('; '))}"></label>
    <label class="campo"><span>Link do vídeo (YouTube)</span><input name="${p}-video" inputmode="url" value="${esc(v.video || VIDEOS[v.id] || '')}" placeholder="vazio = buscar no YouTube"></label>
  </fieldset>`;
  camada.innerHTML = `<div class="folha-fundo" data-acao="fechar-editor"></div><div class="folha" role="dialog" aria-label="Editar exercício">
    <h2>${editor.idx >= 0 ? 'Editar exercício' : 'Novo exercício'} · ${esc(t.id)}</h2>
    <form data-form="exercicio">
      <div class="grade2">
        <label class="campo"><span>Séries</span><input name="series" inputmode="numeric" value="${slot.series}" required></label>
        <label class="campo"><span>Descanso (segundos)</span><input name="descanso" inputmode="numeric" value="${slot.descanso}" required></label>
      </div>
      ${parte('a', a, 'Academia')}
      ${parte('c', editor.idx >= 0 ? c : { reps: a.reps }, 'Casa')}
      <button class="btn" type="submit">Salvar</button>
      <div class="linha-btns"><button class="btn sec" type="button" data-acao="fechar-editor">Cancelar</button></div>
      ${editor.idx >= 0 ? `<div class="linha-btns"><button class="btn perigo" type="button" data-acao="apagar-ex">Apagar exercício</button></div>` : ''}
    </form></div>`;
}
function salvarExercicio(form) {
  const t = treinoPorId(editor.treinoId); if (!t) return;
  const f = new FormData(form);
  const g = k => String(f.get(k) || '').trim();
  const int = (k, d) => { const n = parseInt(g(k), 10); return isFinite(n) && n > 0 ? n : d; };
  const antigo = editor.idx >= 0 ? t.exercicios[editor.idx] : null;
  const montar = (p, ant, fallbackNome) => {
    const nome = g(p + '-nome') || fallbackNome;
    const rmin = int(p + '-rmin', 8), rmax = Math.max(rmin, int(p + '-rmax', 12));
    // mantém o id antigo (o histórico continua ligado ao exercício mesmo se o nome mudar)
    const v = { id: (ant && ant.id) || (slug(nome) + '-' + novoId().slice(-4)),
      nome, equip: (ant && ant.equip) || 'halter', teste: g(p + '-teste'), dica: g(p + '-dica'),
      subs: g(p + '-subs').split(';').map(s => s.trim()).filter(Boolean), reps: [rmin, rmax] };
    if (f.get(p + '-semCarga')) v.semCarga = true;
    if (f.get(p + '-tempo')) { v.tempo = true; v.semCarga = true; }
    const lado = g(p + '-lado'); if (lado) v.lado = lado;
    const video = linkSeguro(g(p + '-video'));
    if (video && video !== VIDEOS[v.id]) v.video = video;
    else if (g(p + '-video') && !video) toast('O link do vídeo precisa ser do YouTube (https://…).');
    return v;
  };
  const a = montar('a', antigo && antigo.academia);
  const casaAnt = antigo && antigo.casa;
  const c = montar('c', casaAnt, a.nome);
  if (!g('c-nome')) c.id = a.id; // sem nome de casa = mesmo exercício nos dois lugares
  const slot = { series: int('series', 3), descanso: int('descanso', 60), reps: a.reps, academia: a, casa: c };
  if (a.lado) slot.lado = a.lado;
  if (editor.idx >= 0) t.exercicios[editor.idx] = slot; else t.exercicios.push(slot);
  E.planoEditado = true; salvar();
  const aberto = t.id; editor = null;
  toast('Plano salvo.'); render(); abrirTreinoPlano(aberto);
}

// ---------- backup ----------
async function baixar(nome, txt) {
  if (matchMedia('(pointer:coarse)').matches && navigator.canShare) {
    try {
      const f = new File([txt], nome, { type: 'application/json' });
      if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return true; }
    } catch (e) { if (e && e.name === 'AbortError') return false; }
  }
  const u = URL.createObjectURL(new Blob([txt], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = u; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 60000);
  return true;
}
async function exportar() {
  const dados = { ...E }; delete dados.emAndamento;
  const txt = JSON.stringify({ app: 'vianas-fit', v: 1, em: new Date().toISOString(), dados }, null, 1);
  const ok = await baixar(`vianas-club-backup-${isoDia()}.json`, txt);
  if (ok) { E.ultimoBackup = isoDia(); salvar(); toast('Backup pronto. Salve em Arquivos → iCloud Drive.'); render(); }
}
async function importar(texto) {
  let b;
  try { b = JSON.parse(texto); } catch (e) { toast('Esse arquivo não é um backup válido.'); return; }
  if (!b || b.app !== 'vianas-fit' || !b.dados) { toast('Esse arquivo não é um backup do Vianas Club.'); return; }
  if (b.parcial) {
    const novas = (b.dados.avaliacoes || []).filter(a => !E.avaliacoes.some(x => x.data === a.data));
    E.avaliacoes.push(...novas.map(a => ({ id: novoId(), ...a })));
    salvar(); toast(novas.length ? `${novas.length} avaliação(ões) importada(s).` : 'Essas avaliações já estavam no app.');
    graficoAval = 'peso'; irPara('avaliacoes'); return;
  }
  const quando = b.em ? dataBR(b.em.slice(0, 10)) : 'data desconhecida';
  if (!(await perguntar(`Importar o backup de ${quando}? Ele substitui os dados atuais deste aparelho (${E.sessoes.length} treinos, ${E.avaliacoes.length} avaliações).`, { ok: 'Importar backup', perigo: true }))) return;
  const andamento = E.emAndamento;
  E = normalizar(b.dados); E.emAndamento = andamento;
  salvar(); toast('Backup importado.'); irPara('hoje');
}

// ---------- timer de descanso ----------
let tick = null, audio = null;
function destravarSom() {
  try {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch (e) { audio = null; }
}
function bipe() {
  try {
    if (!audio) return;
    const t0 = audio.currentTime;
    [0, 0.25, 0.5].forEach((d, i) => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = i === 2 ? 1046 : 784;
      g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(0.35, t0 + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.2);
      o.connect(g); g.connect(audio.destination); o.start(t0 + d); o.stop(t0 + d + 0.22);
    });
  } catch (e) { /* sem som */ }
  if (navigator.vibrate) try { navigator.vibrate([200, 100, 200]); } catch (e) { }
}
function iniciarTimer(seg, prox) {
  if (!E.emAndamento) return;
  E.emAndamento.timer = { fim: Date.now() + seg * 1000, total: seg, prox, avisou: false };
  salvar(); mostrarTimer();
}
function mostrarTimer() {
  clearInterval(tick);
  const tm = E.emAndamento && E.emAndamento.timer;
  if (!tm) { $('#timer').hidden = true; document.body.classList.remove('timer-on'); return; }
  $('#timer').hidden = false; document.body.classList.add('timer-on');
  $('#timer-prox').textContent = tm.prox || '';
  atualizarTimer(); tick = setInterval(atualizarTimer, 250);
}
function atualizarTimer() {
  const tm = E.emAndamento && E.emAndamento.timer;
  if (!tm) return pararTimer();
  const rest = Math.ceil((tm.fim - Date.now()) / 1000);
  const el = $('#timer');
  if (rest <= 0) {
    if (!tm.avisou) { tm.avisou = true; salvar(); bipe(); }
    el.classList.add('acabou');
    $('#timer-relogio').textContent = 'Bora!';
    $('#timer-titulo').textContent = 'Descanso acabou';
    $('#timer-barra').style.width = '0%';
    if (rest <= -6) pararTimer();
    return;
  }
  el.classList.remove('acabou');
  $('#timer-titulo').textContent = 'Descanso';
  $('#timer-relogio').textContent = `${Math.floor(rest / 60)}:${pad(rest % 60)}`;
  $('#timer-barra').style.width = `${Math.max(0, Math.min(100, rest / tm.total * 100))}%`;
  const rt = $('#relogio-treino'); if (rt && E.emAndamento) rt.textContent = `${Math.floor((Date.now() - E.emAndamento.inicio) / 60000)} min`;
}
function pararTimer() {
  clearInterval(tick); tick = null;
  if (E.emAndamento && E.emAndamento.timer) { E.emAndamento.timer = null; salvar(); }
  const el = $('#timer'); el.hidden = true; el.classList.remove('acabou');
  document.body.classList.remove('timer-on');
}

// Tela acesa durante o treino (quando o iPhone permite)
let travaTela = null;
async function manterTela(ligar) {
  try {
    if (ligar && 'wakeLock' in navigator && !travaTela) {
      travaTela = await navigator.wakeLock.request('screen');
      travaTela.addEventListener('release', () => { travaTela = null; });
    } else if (!ligar && travaTela) { await travaTela.release(); travaTela = null; }
  } catch (e) { travaTela = null; }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && E.emAndamento) { manterTela(true); mostrarTimer(); }
});

// ---------- eventos ----------
document.addEventListener('click', e => {
  const abaBtn = e.target.closest('[data-aba]');
  if (abaBtn) { if (abaBtn.dataset.aba === 'hoje') treinoEscolhido = null; irPara(abaBtn.dataset.aba); return; }
  const el = e.target.closest('[data-acao]'); if (!el) return;
  const acao = el.dataset.acao;
  const s = E.emAndamento;
  const i = el.dataset.ex != null ? +el.dataset.ex : null;
  switch (acao) {
    case 'local': E.prefs.local = el.dataset.v; salvar(); render(); break;
    case 'escolher': treinoEscolhido = el.dataset.id; render(); break;
    case 'leve': fazerLeve = el.checked; break;
    case 'comecar': comecar(el.dataset.id); break;
    case 'continuar': destravarSom(); manterTela(true); irPara('treino'); mostrarTimer(); break;
    case 'minimizar': irPara('hoje'); break;
    case 'descartar': descartar(); break;
    case 'aquecido': s.aquecido = !s.aquecido; salvar(); renderMantendoScroll(); break;
    case 'serie': marcarSerie(i, +el.dataset.set); break;
    case 'mais-serie': { const ex = s.exercicios[i]; ex.sets.push(novaSerie(ex, { tipo: 'manter', carga: num(ex.sets[ex.sets.length - 1].carga), reps: [num(ex.sets[ex.sets.length - 1].reps) || ex.reps[0]] }, 0)); ex.aberto = true; salvar(); renderMantendoScroll(); break; }
    case 'menos-serie': { const ex = s.exercicios[i]; if (ex.sets.length > 1) ex.sets.pop(); salvar(); renderMantendoScroll(); break; }
    case 'abrir': s.exercicios[i].aberto = true; renderMantendoScroll(); break;
    case 'subs': s.exercicios[i].mostrarSubs = !s.exercicios[i].mostrarSubs; renderMantendoScroll(); break;
    case 'trocar': trocarExercicio(i, el.dataset.nome); break;
    case 'cardio': s.cardio.feito = !s.cardio.feito; salvar(); renderMantendoScroll(); if (s.cardio.feito) toast('Cardio feito! Pode finalizar.'); break;
    case 'finalizar': finalizar(); break;
    case 'timer-mais': if (s && s.timer) { s.timer.fim = Math.max(s.timer.fim, Date.now()) + 15000; s.timer.total += 15; s.timer.avisou = false; salvar(); atualizarTimer(); } break;
    case 'timer-pular': pararTimer(); break;
    case 'apagar-sessao':
      perguntar('Apagar este treino do histórico? Não dá para desfazer.', { ok: 'Apagar treino', perigo: true })
        .then(sim => { if (sim) { E.sessoes = E.sessoes.filter(x => x.id !== el.dataset.id); salvar(); render(); toast('Treino apagado.'); } });
      break;
    case 'grafico-aval': graficoAval = el.dataset.k; render(); break;
    case 'apagar-aval':
      perguntar('Apagar esta avaliação? Não dá para desfazer.', { ok: 'Apagar avaliação', perigo: true })
        .then(sim => { if (sim) { E.avaliacoes = E.avaliacoes.filter(x => x.id !== el.dataset.id); salvar(); render(); } });
      break;
    case 'exportar': exportar(); break;
    case 'importar': $('#arquivo').value = ''; $('#arquivo').click(); break;
    case 'restaurar-plano':
      perguntar('Voltar o plano para o original? Suas edições no plano somem; histórico e avaliações ficam.', { ok: 'Restaurar plano', perigo: true })
        .then(sim => { if (sim) { E.plano = clone(window.PLANO_PADRAO); E.planoEditado = false; salvar(); render(); toast('Plano original restaurado.'); } });
      break;
    case 'editar-ex': editor = { tipo: 'ex', treinoId: el.dataset.t, idx: +el.dataset.i }; renderEditor(); break;
    case 'novo-ex': editor = { tipo: 'ex', treinoId: el.dataset.t, idx: -1 }; renderEditor(); break;
    case 'editar-treino': editor = { tipo: 'treino', treinoId: el.dataset.t }; renderEditor(); break;
    case 'fechar-editor': editor = null; renderEditor(); break;
    case 'apagar-ex': {
      const t = treinoPorId(editor.treinoId);
      const idx = editor.idx;
      if (t) perguntar('Apagar este exercício do plano? O histórico dele continua guardado.', { ok: 'Apagar exercício', perigo: true })
        .then(sim => { if (sim) { t.exercicios.splice(idx, 1); E.planoEditado = true; editor = null; salvar(); render(); abrirTreinoPlano(t.id); } });
      break;
    }
    case 'subir-ex': {
      const t = treinoPorId(el.dataset.t), k = +el.dataset.i;
      if (t && k > 0) { [t.exercicios[k - 1], t.exercicios[k]] = [t.exercicios[k], t.exercicios[k - 1]]; E.planoEditado = true; salvar(); editor = null; renderMantendoScroll(); abrirTreinoPlano(t.id); }
      break;
    }
  }
});
function abrirTreinoPlano(id) {
  document.querySelectorAll('.treino-plano').forEach((d, k) => { if (treinos()[k] && treinos()[k].id === id) d.open = true; });
}

document.addEventListener('input', e => {
  const el = e.target, campo = el.dataset && el.dataset.campo; if (!campo) return;
  const s = E.emAndamento;
  if ((campo === 'carga' || campo === 'reps') && s) {
    const t = s.exercicios[+el.dataset.ex].sets[+el.dataset.set];
    t[campo] = el.value.replace(/[^\d.,]/g, ''); salvar();
  } else if (campo === 'cardio-min' && s) { s.cardio.min = el.value.replace(/[^\d.,]/g, ''); salvar(); }
});
document.addEventListener('change', e => {
  const el = e.target, campo = el.dataset && el.dataset.campo; if (!campo) return;
  if (campo === 'grafico-ex') { graficoEx = el.value; render(); }
  if (campo === 'deload') { E.plano.deloadACada = +el.value; E.planoEditado = true; salvar(); toast('Salvo.'); }
});
document.addEventListener('focusin', e => { if (e.target.matches('.set input')) setTimeout(() => e.target.select && e.target.select(), 0); });
document.addEventListener('submit', e => {
  const f = e.target; e.preventDefault();
  if (f.dataset.form === 'avaliacao') salvarAvaliacao(f);
  else if (f.dataset.form === 'exercicio') salvarExercicio(f);
  else if (f.dataset.form === 'treino') {
    const t = treinoPorId(editor.treinoId); const d = new FormData(f);
    t.nome = String(d.get('nome') || t.nome).trim(); t.cardio = !!d.get('cardio');
    E.planoEditado = true; editor = null; salvar(); render(); toast('Treino salvo.');
  }
});
$('#arquivo').addEventListener('change', e => {
  const file = e.target.files && e.target.files[0]; if (!file) return;
  const r = new FileReader(); r.onload = () => importar(String(r.result)); r.readAsText(file);
});

// ---------- início ----------
carregar();
if (E.emAndamento) aba = 'treino';
render();
if (E.emAndamento) mostrarTimer();
setInterval(() => { const rt = $('#relogio-treino'); if (rt && E.emAndamento) rt.textContent = `${Math.floor((Date.now() - E.emAndamento.inicio) / 60000)} min`; }, 30000);
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
