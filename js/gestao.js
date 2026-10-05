(() => {
  'use strict';

  /* ===== Constantes ===== */
  const CHAVE = 'conectacdd:ocorrencias';   // mesma chave das telas de relato e acompanhamento
  const ETAPAS = ['recebido', 'analise', 'campo', 'resolvido'];

  const ROTULOS = {
    recebido: 'Registrado',
    analise: 'Em análise',
    campo: 'Equipe em campo',
    resolvido: 'Resolvido'
  };

  const TIPOS_NOME = {
    esgoto: 'Esgoto a céu aberto',
    vazamento: 'Vazamento de água potável',
    alagamento: 'Bueiro entupido / Alagamento',
    entulho: 'Descarte irregular de entulho'
  };

  const CLASSE_GRAVIDADE = { 'Alta': 'pill-alta', 'Média': 'pill-media', 'Baixa': 'pill-baixa' };
  const PESO_GRAVIDADE = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
  const GRAVIDADE_POR_CHAVE = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

  /* ===== Dados de exemplo ===== */
  const data = (m, d, h, mi) => new Date(2026, m - 1, d, h, mi).toISOString();

  function criarExemplo(protocolo, tipo, gravidade, descricao, localidade, referencia, datas) {
    return {
      protocolo,
      tipo,
      tipoNome: TIPOS_NOME[tipo],
      gravidade,
      descricao,
      localidade,
      referencia,
      foto: '',
      status: ETAPAS[datas.length - 1],
      criadoEm: data(...datas[0]),
      historico: datas.map((d, i) => ({ status: ETAPAS[i], em: data(...d) }))
    };
  }

  const EXEMPLOS = [
    criarExemplo('CDD-2026-0412', 'esgoto', 'Alta', 'Esgoto transbordando na altura da Praça Seca, com mau cheiro e risco para pedestres', 'Rua Edgar Werneck', 'Altura da Praça Seca', [[10, 4, 9, 12], [10, 4, 10, 40]]),
    criarExemplo('CDD-2026-0411', 'alagamento', 'Alta', 'Bueiro entupido gerando acúmulo de água após a chuva', 'Caminho do Itanhangá', 'Em frente ao ponto de ônibus', [[10, 3, 8, 5], [10, 3, 9, 30], [10, 4, 7, 50]]),
    criarExemplo('CDD-2026-0410', 'vazamento', 'Média', 'Vazamento na tubulação principal, água correndo pela via há dias', 'Rua Cuiabá', 'Próximo ao nº 85', [[10, 3, 14, 20], [10, 3, 16, 0]]),
    criarExemplo('CDD-2026-0409', 'entulho', 'Média', 'Entulho de obra bloqueando a vala de drenagem', 'Gabinal', 'Ao lado da quadra', [[10, 2, 11, 0], [10, 2, 13, 15], [10, 3, 8, 30]]),
    criarExemplo('CDD-2026-0408', 'esgoto', 'Alta', 'Caixa de inspeção sem tampa e esgoto aflorando na calçada', 'Karatê', 'Próximo à escola', [[10, 1, 17, 45], [10, 2, 8, 10]]),
    criarExemplo('CDD-2026-0407', 'alagamento', 'Baixa', 'Galeria de águas pluviais assoreada, desobstruída pela equipe', 'Apês', 'Bloco 12', [[9, 30, 10, 0], [9, 30, 11, 20], [9, 30, 15, 0], [10, 1, 10, 30]]),
    criarExemplo('CDD-2026-0406', 'vazamento', 'Baixa', 'Cavalete com vazamento em frente a residência, reparo concluído', 'Rua Edgar Werneck', 'Em frente ao nº 210', [[9, 29, 9, 15], [9, 29, 10, 40], [9, 29, 14, 0], [9, 30, 9, 10]]),
    criarExemplo('CDD-2026-0405', 'entulho', 'Média', 'Lixo acumulado em vala, atraindo vetores; recolhimento realizado', 'Rua Cuiabá', 'Esquina com a viela', [[9, 27, 16, 30], [9, 28, 8, 45], [9, 28, 13, 0], [9, 29, 11, 20]])
  ];

  const copiar = (obj) => JSON.parse(JSON.stringify(obj));

  /* ===== Estado ===== */
  const filtros = { gravidade: 'todas', status: 'todos', busca: '', ordem: 'prioridade' };
  let ocorrencias = [];

  /* ===== Elementos ===== */
  const $ = (id) => document.getElementById(id);
  const corpo = $('tabela-corpo');
  const campoBusca = $('busca');
  const selectStatus = $('filtro-status');
  const selectOrdem = $('ordem');
  const chips = Array.from(document.querySelectorAll('#chips-gravidade .chip'));
  const areaToast = $('toast-area');

  /* ===== Utilitários ===== */
  const normalizarTexto = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizarStatus = (s) => (s === 'andamento' ? 'campo' : s);

  function indiceEtapa(registro) {
    const i = ETAPAS.indexOf(normalizarStatus(registro.status));
    return i === -1 ? 0 : i;
  }

  function formatarCurto(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const dia = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dia} · ${hora}`;
  }

  /* ===== Armazenamento ===== */
  function lerOcorrencias() {
    try {
      const lista = JSON.parse(localStorage.getItem(CHAVE));
      return Array.isArray(lista) ? lista : [];
    } catch {
      return [];
    }
  }

  function salvarOcorrencias() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(ocorrencias));
      return true;
    } catch {
      toast('error', 'Não foi possível salvar', 'O armazenamento do navegador está indisponível ou cheio.');
      return false;
    }
  }

  // Garante que os exemplos existam no armazenamento (sem apagar relatos reais)
  function carregarOcorrencias() {
    const lista = lerOcorrencias();
    const faltando = EXEMPLOS.filter((e) => !lista.some((o) => o.protocolo === e.protocolo));
    ocorrencias = [...lista, ...faltando.map(copiar)];
    if (faltando.length) salvarOcorrencias();
  }

  function restaurarExemplos() {
    const reais = lerOcorrencias().filter((o) => !EXEMPLOS.some((e) => e.protocolo === o.protocolo));
    ocorrencias = [...reais, ...EXEMPLOS.map(copiar)];
    salvarOcorrencias();
    renderizar();
    toast('info', 'Dados restaurados', 'Os chamados de exemplo voltaram ao estado original.');
  }

  /* ===== Notificações ===== */
  function toast(tipo, titulo, mensagem) {
    if (!areaToast) return;
    const icones = { success: '✓', error: '!', info: 'i' };

    const el = document.createElement('div');
    el.className = `toast toast-${tipo}`;
    el.setAttribute('role', tipo === 'error' ? 'alert' : 'status');

    const icone = document.createElement('div');
    icone.className = 'toast-icone';
    icone.textContent = icones[tipo] || 'i';

    const corpoToast = document.createElement('div');
    corpoToast.className = 'toast-corpo';
    const t = document.createElement('strong');
    t.textContent = titulo;
    const m = document.createElement('span');
    m.textContent = mensagem;
    corpoToast.append(t, m);

    const fechar = document.createElement('button');
    fechar.className = 'toast-fechar';
    fechar.setAttribute('aria-label', 'Fechar notificação');
    fechar.textContent = '×';

    el.append(icone, corpoToast, fechar);
    areaToast.appendChild(el);

    const remover = () => {
      el.classList.add('saindo');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };
    fechar.addEventListener('click', remover);
    setTimeout(remover, 4500);
  }

  /* ===== Filtro e ordenação ===== */
  function filtrarOcorrencias() {
    const termo = normalizarTexto(filtros.busca.trim());
    const gravidadeAlvo = GRAVIDADE_POR_CHAVE[filtros.gravidade];

    return ocorrencias.filter((o) => {
      if (gravidadeAlvo && o.gravidade !== gravidadeAlvo) return false;
      if (filtros.status !== 'todos' && normalizarStatus(o.status) !== filtros.status) return false;
      if (termo) {
        const texto = normalizarTexto([o.protocolo, o.tipoNome, o.localidade, o.referencia, o.descricao].join(' '));
        if (!texto.includes(termo)) return false;
      }
      return true;
    });
  }

  function ordenarOcorrencias(lista) {
    const copia = [...lista];
    if (filtros.ordem === 'recentes') {
      return copia.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    }
    // Prioridade: abertos primeiro, maior gravidade, mais antigos antes
    return copia.sort((a, b) => {
      const abertoA = indiceEtapa(a) < 3 ? 0 : 1;
      const abertoB = indiceEtapa(b) < 3 ? 0 : 1;
      if (abertoA !== abertoB) return abertoA - abertoB;
      const pesoA = PESO_GRAVIDADE[a.gravidade] || 0;
      const pesoB = PESO_GRAVIDADE[b.gravidade] || 0;
      if (pesoA !== pesoB) return pesoB - pesoA;
      return new Date(a.criadoEm) - new Date(b.criadoEm);
    });
  }

  /* ===== Renderização ===== */
  function atualizarNumero(id, valor) {
    const el = $(id);
    if (el.textContent !== String(valor)) {
      el.textContent = valor;
      el.classList.remove('gs-pop');
      void el.offsetWidth;   // reinicia a animação
      el.classList.add('gs-pop');
    }
  }

  function renderizarIndicadores() {
    const total = ocorrencias.length;
    const pendentes = ocorrencias.filter((o) => indiceEtapa(o) <= 1).length;
    const andamento = ocorrencias.filter((o) => indiceEtapa(o) === 2).length;
    const resolvidos = ocorrencias.filter((o) => indiceEtapa(o) === 3).length;

    const abertos = ocorrencias.filter((o) => indiceEtapa(o) < 3);
    const urgentes = abertos.filter((o) => o.gravidade === 'Alta').length;
    const taxa = abertos.length ? Math.round((urgentes / abertos.length) * 100) : 0;

    atualizarNumero('kpi-total', total);
    atualizarNumero('kpi-pendentes', pendentes);
    atualizarNumero('kpi-andamento', andamento);
    atualizarNumero('kpi-resolvidos', resolvidos);
    atualizarNumero('kpi-urgencia', `${taxa}%`);
    $('nota-urgencia').textContent = `${urgentes} de ${abertos.length} abertos com gravidade alta`;
  }

  function renderizarContagensChips() {
    $('n-todas').textContent = ocorrencias.length;
    Object.keys(GRAVIDADE_POR_CHAVE).forEach((chave) => {
      $('n-' + chave).textContent = ocorrencias.filter((o) => o.gravidade === GRAVIDADE_POR_CHAVE[chave]).length;
    });
  }

  function criarCelula(...filhos) {
    const td = document.createElement('td');
    filhos.forEach((f) => td.append(f));
    return td;
  }

  function criarTextoDuplo(titulo, subtitulo) {
    const frag = document.createDocumentFragment();
    const t = document.createElement('span');
    t.className = 'gs-cel-titulo';
    t.textContent = titulo;
    frag.appendChild(t);
    if (subtitulo) {
      const s = document.createElement('span');
      s.className = 'gs-cel-sub';
      s.textContent = subtitulo;
      s.title = subtitulo;
      frag.appendChild(s);
    }
    return frag;
  }

  function criarBotao(texto, acao, protocolo, extra) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'gs-btn' + (extra ? ' ' + extra : '');
    b.dataset.acao = acao;
    b.dataset.protocolo = protocolo;
    b.textContent = texto;
    return b;
  }

  function criarLinha(o) {
    const status = normalizarStatus(o.status);
    const etapa = indiceEtapa(o);
    const tr = document.createElement('tr');
    tr.dataset.protocolo = o.protocolo;
    if (etapa === 3) tr.classList.add('is-resolvido');

    // Protocolo
    tr.appendChild(criarCelula(document.createTextNode(o.protocolo)));

    // Tipo + descrição resumida
    tr.appendChild(criarCelula(criarTextoDuplo(o.tipoNome || TIPOS_NOME[o.tipo] || '—', o.descricao)));

    // Local + referência
    tr.appendChild(criarCelula(criarTextoDuplo(o.localidade || '—', o.referencia)));

    // Gravidade
    const pillGrav = document.createElement('span');
    pillGrav.className = `pill ${CLASSE_GRAVIDADE[o.gravidade] || 'pill-media'}`;
    pillGrav.textContent = o.gravidade || '—';
    tr.appendChild(criarCelula(pillGrav));

    // Status
    const pillStatus = document.createElement('span');
    pillStatus.className = `pill pill-s-${ETAPAS.includes(status) ? status : 'recebido'}`;
    pillStatus.textContent = ROTULOS[status] || ROTULOS.recebido;
    tr.appendChild(criarCelula(pillStatus));

    // Registro
    tr.appendChild(criarCelula(document.createTextNode(formatarCurto(o.criadoEm))));

    // Ações
    const acoes = document.createElement('div');
    acoes.className = 'gs-acoes';
    if (etapa < 2) acoes.appendChild(criarBotao('Atualizar status', 'avancar', o.protocolo));
    if (etapa < 3) {
      acoes.appendChild(criarBotao('Marcar como resolvido', 'resolver', o.protocolo, 'gs-btn--ok'));
    } else {
      const ok = document.createElement('span');
      ok.className = 'gs-concluido';
      ok.textContent = '✓ Concluído';
      acoes.appendChild(ok);
    }
    const link = document.createElement('a');
    link.className = 'gs-link';
    link.href = `acompanhar.html?protocolo=${encodeURIComponent(o.protocolo)}`;
    link.textContent = 'Ver';
    acoes.appendChild(link);
    tr.appendChild(criarCelula(acoes));

    return tr;
  }

  function renderizarTabela() {
    const lista = ordenarOcorrencias(filtrarOcorrencias());
    corpo.replaceChildren();

    if (!lista.length) {
      const tr = document.createElement('tr');
      tr.className = 'gs-vazio';
      const td = document.createElement('td');
      td.colSpan = 7;
      td.textContent = 'Nenhum chamado encontrado para os filtros aplicados.';
      tr.appendChild(td);
      corpo.appendChild(tr);
    } else {
      lista.forEach((o) => corpo.appendChild(criarLinha(o)));
    }

    $('gs-contagem').textContent = `Exibindo ${lista.length} de ${ocorrencias.length} chamados`;
  }

  function renderizar() {
    renderizarIndicadores();
    renderizarContagensChips();
    renderizarTabela();
    $('gs-atualizado').textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  /* ===== Ações de gestão ===== */
  // Move o chamado até a etapa de destino, registrando cada etapa no histórico
  function moverPara(protocolo, destino) {
    const registro = ocorrencias.find((o) => o.protocolo === protocolo);
    if (!registro) return;

    const atual = indiceEtapa(registro);
    if (destino <= atual) return;

    const agora = new Date().toISOString();
    registro.historico = Array.isArray(registro.historico) ? registro.historico : [];
    for (let i = atual + 1; i <= destino; i++) {
      registro.historico.push({ status: ETAPAS[i], em: agora });
    }
    registro.status = ETAPAS[destino];

    if (!salvarOcorrencias()) return;
    renderizar();

    const linha = corpo.querySelector(`tr[data-protocolo="${protocolo}"]`);
    if (linha) linha.classList.add('gs-flash');

    if (destino === 3) {
      toast('success', 'Chamado resolvido', `${protocolo} foi marcado como resolvido.`);
    } else {
      toast('success', 'Status atualizado', `${protocolo} agora está em: ${ROTULOS[ETAPAS[destino]]}.`);
    }
  }

  corpo.addEventListener('click', (e) => {
    const botao = e.target.closest('button[data-acao]');
    if (!botao) return;

    const protocolo = botao.dataset.protocolo;
    const registro = ocorrencias.find((o) => o.protocolo === protocolo);
    if (!registro) return;

    if (botao.dataset.acao === 'avancar') moverPara(protocolo, indiceEtapa(registro) + 1);
    if (botao.dataset.acao === 'resolver') moverPara(protocolo, 3);
  });

  /* ===== Filtros ===== */
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filtros.gravidade = chip.dataset.gravidade;
      chips.forEach((c) => {
        const ativo = c === chip;
        c.classList.toggle('is-active', ativo);
        c.setAttribute('aria-pressed', String(ativo));
      });
      renderizarTabela();
    });
  });

  campoBusca.addEventListener('input', () => { filtros.busca = campoBusca.value; renderizarTabela(); });
  selectStatus.addEventListener('change', () => { filtros.status = selectStatus.value; renderizarTabela(); });
  selectOrdem.addEventListener('change', () => { filtros.ordem = selectOrdem.value; renderizarTabela(); });

  $('btn-restaurar').addEventListener('click', () => {
    if (window.confirm('Restaurar os chamados de exemplo ao estado original? Relatos criados por você serão mantidos.')) {
      restaurarExemplos();
    }
  });

  // Atualiza automaticamente se um novo relato for feito em outra aba
  window.addEventListener('storage', (e) => {
    if (e.key === CHAVE) {
      carregarOcorrencias();
      renderizar();
    }
  });

  /* ===== Início ===== */
  carregarOcorrencias();
  renderizar();
})();