(() => {
  'use strict';

  /* ===== Constantes ===== */
  const CHAVE = 'conectacdd:ocorrencias';   // mesma chave usada pela tela de relato
  const ETAPAS = ['recebido', 'analise', 'campo', 'resolvido'];

  const ROTULOS = {
    recebido: 'Registrado',
    analise: 'Em análise',
    campo: 'Equipe em campo',
    resolvido: 'Resolvido'
  };

  const MENSAGENS = {
    recebido: 'Recebemos o seu relato. Ele será encaminhado para análise em breve.',
    analise: 'O chamado está em análise pela Iguá Rio e pela Fundação Rio-Águas, que definem a prioridade de atendimento.',
    campo: 'Uma equipe foi enviada ao local para resolver o problema.',
    resolvido: 'Problema resolvido! O chamado foi encerrado.'
  };

  const TIPOS_NOME = {
    esgoto: 'Esgoto a céu aberto',
    vazamento: 'Vazamento de água potável',
    alagamento: 'Bueiro entupido / Alagamento',
    entulho: 'Descarte irregular de entulho'
  };

  const ORGAOS = {
    esgoto: 'Iguá Rio',
    vazamento: 'Iguá Rio',
    alagamento: 'Fundação Rio-Águas',
    entulho: 'Prefeitura do Rio'
  };

  const CLASSE_GRAVIDADE = { 'Alta': 'pill-alta', 'Média': 'pill-media', 'Baixa': 'pill-baixa' };

  /* ===== Dados de exemplo (simulam o banco de dados) ===== */
  // datas = [[mes, dia, hora, minuto], ...] uma por etapa já concluída
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

  /* ===== Elementos ===== */
  const $ = (id) => document.getElementById(id);

  const form = $('form-busca');
  const campo = $('protocolo');
  const btnConsultar = $('btn-consultar');
  const erroBusca = $('erro-busca');

  const estadoVazio = $('estado-vazio');
  const estadoNaoEncontrado = $('estado-nao-encontrado');
  const resultado = $('resultado');

  const itensTimeline = Array.from(document.querySelectorAll('.tl-item'));

  /* ===== Utilitários ===== */
  function lerOcorrencias() {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { return []; }
  }

  // "cdd 2026 0412" ou "CDD20260412" viram "CDD-2026-0412"
  function normalizar(texto) {
    const limpo = texto.toUpperCase().replace(/\s+/g, '');
    const m = limpo.match(/^CDD-?(\d{4})-?(\d{4})$/);
    return m ? `CDD-${m[1]}-${m[2]}` : limpo;
  }

  const PADRAO = /^CDD-\d{4}-\d{4}$/;

  function normalizarStatus(status) {
    return status === 'andamento' ? 'campo' : status;   // compatibilidade com o status da Home
  }

  function indiceStatus(status) {
    const i = ETAPAS.indexOf(normalizarStatus(status));
    return i === -1 ? 0 : i;
  }

  function formatarData(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const dia = d.toLocaleDateString('pt-BR');
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dia} às ${hora}`;
  }

  function buscar(protocolo) {
    // Relatos feitos na tela de relato têm prioridade sobre os exemplos
    return lerOcorrencias().find((o) => o.protocolo === protocolo)
        || EXEMPLOS.find((o) => o.protocolo === protocolo)
        || null;
  }

  /* ===== Estados da tela ===== */
  function mostrarEstado(nome) {
    estadoVazio.classList.toggle('hidden', nome !== 'vazio');
    estadoNaoEncontrado.classList.toggle('hidden', nome !== 'nao-encontrado');
    resultado.classList.toggle('hidden', nome !== 'resultado');
  }

  /* ===== Renderização ===== */
  function renderizarTimeline(registro) {
    const atual = indiceStatus(registro.status);
    const resolvido = atual === ETAPAS.length - 1;

    itensTimeline.forEach((item, i) => {
      const concluida = i < atual || (resolvido && i === atual);
      const emAndamento = i === atual && !resolvido;

      item.classList.toggle('is-done', concluida);
      item.classList.toggle('is-current', emAndamento);
      item.classList.toggle('is-final', resolvido && i === atual);
      item.querySelector('.tl-marcador').textContent = concluida ? '✓' : String(i + 1);

      const evento = (registro.historico || []).find((h) => normalizarStatus(h.status) === item.dataset.etapa);
      const dataEl = item.querySelector('.tl-data');
      if (evento) dataEl.textContent = formatarData(evento.em);
      else dataEl.textContent = emAndamento ? 'Em andamento' : 'Aguardando';
    });
  }

  function renderizar(registro) {
    const status = normalizarStatus(registro.status);

    $('res-protocolo').textContent = registro.protocolo;

    const pillStatus = $('res-status');
    pillStatus.textContent = ROTULOS[status] || ROTULOS.recebido;
    pillStatus.className = `pill pill-s-${ETAPAS.includes(status) ? status : 'recebido'}`;

    const msg = $('res-mensagem');
    msg.textContent = MENSAGENS[status] || MENSAGENS.recebido;
    msg.classList.toggle('ac-msg--ok', status === 'resolvido');

    $('res-tipo').textContent = registro.tipoNome || TIPOS_NOME[registro.tipo] || '—';
    $('res-orgao').textContent = ORGAOS[registro.tipo] || 'Iguá Rio / Rio-Águas';
    $('res-localidade').textContent = registro.localidade || '—';
    $('res-referencia').textContent = registro.referencia || '—';
    $('res-descricao').textContent = registro.descricao || '—';

    const pillGrav = $('res-gravidade');
    pillGrav.textContent = registro.gravidade || '—';
    pillGrav.className = `pill ${CLASSE_GRAVIDADE[registro.gravidade] || 'pill-media'}`;

    const historico = registro.historico || [];
    const ultimo = historico.length ? historico[historico.length - 1].em : registro.criadoEm;
    $('res-registro').textContent = formatarData(registro.criadoEm) || '—';
    $('res-atualizacao').textContent = formatarData(ultimo) || '—';

    const fotoWrap = $('res-foto-wrap');
    const foto = $('res-foto');
    if (registro.foto) {
      foto.src = registro.foto;
      fotoWrap.classList.remove('hidden');
    } else {
      foto.removeAttribute('src');
      fotoWrap.classList.add('hidden');
    }

    renderizarTimeline(registro);
    mostrarEstado('resultado');
  }

  /* ===== Consulta ===== */
  function mostrarErroBusca(msg) { erroBusca.textContent = msg; }

  function atualizarUrl(protocolo) {
    try {
      const url = new URL(location.href);
      if (protocolo) url.searchParams.set('protocolo', protocolo); else url.searchParams.delete('protocolo');
      history.replaceState(null, '', url);
    } catch { /* ambiente sem suporte (ex.: arquivo local em alguns navegadores) */ }
  }

  async function consultar(valorDigitado) {
    const protocolo = normalizar(valorDigitado);
    mostrarErroBusca('');

    if (protocolo === '') {
      mostrarErroBusca('Digite o número do protocolo para consultar.');
      campo.focus();
      return;
    }
    if (!PADRAO.test(protocolo)) {
      mostrarErroBusca('Formato inválido. Use o padrão CDD-AAAA-0000, por exemplo CDD-2026-0412.');
      campo.focus();
      return;
    }

    campo.value = protocolo;
    btnConsultar.disabled = true;
    btnConsultar.textContent = 'Consultando…';
    await new Promise((r) => setTimeout(r, 600));   // simula o tempo de resposta do servidor

    const registro = buscar(protocolo);
    atualizarUrl(protocolo);

    if (registro) {
      renderizar(registro);
      const alvo = $('res-protocolo');
      alvo.closest('.ac-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
      alvo.focus({ preventScroll: true });
    } else {
      $('nao-encontrado-protocolo').textContent = protocolo;
      mostrarEstado('nao-encontrado');
    }

    btnConsultar.disabled = false;
    btnConsultar.textContent = 'Consultar Status';
  }

  /* ===== Eventos ===== */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    consultar(campo.value);
  });

  campo.addEventListener('input', () => mostrarErroBusca(''));

  document.querySelectorAll('.ac-exemplo').forEach((botao) => {
    botao.addEventListener('click', () => {
      campo.value = botao.dataset.protocolo;
      consultar(campo.value);
    });
  });

  $('btn-nova-consulta').addEventListener('click', () => {
    campo.value = '';
    mostrarErroBusca('');
    mostrarEstado('vazio');
    atualizarUrl('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    campo.focus({ preventScroll: true });
  });

  /* ===== Consulta automática via URL (?protocolo=CDD-2026-0412) ===== */
  const protocoloUrl = new URLSearchParams(location.search).get('protocolo');
  if (protocoloUrl) {
    campo.value = normalizar(protocoloUrl);
    consultar(campo.value);
  }
})();