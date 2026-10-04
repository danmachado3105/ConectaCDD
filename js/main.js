(() => {
  'use strict';

  /* ===== MENU MOBILE ===== */
  const menuBtn = document.getElementById('menu-btn');
  const menuMobile = document.getElementById('menu-mobile');

  if (menuBtn && menuMobile) {
    menuBtn.addEventListener('click', () => {
      const aberto = menuMobile.classList.toggle('hidden') === false;
      menuBtn.setAttribute('aria-expanded', String(aberto));
    });
  }

  /* ===== CONTADORES ANIMADOS ===== */
  // data-alvo: valor final | data-decimais: casas decimais | data-sufixo: texto após o número
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatar(el, valor) {
    const dec = Number(el.dataset.decimais || 0);
    const texto = valor.toLocaleString('pt-BR', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
    el.textContent = texto + (el.dataset.sufixo || '');
  }

  function animarContador(el) {
    const alvo = parseFloat(el.dataset.alvo);
    if (reduzirMovimento) { formatar(el, alvo); return; }

    const duracao = 1400;
    const inicio = performance.now();

    function passo(agora) {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - progresso, 3);   // easing: começa rápido e desacelera
      formatar(el, alvo * suave);
      if (progresso < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  document.querySelectorAll('[data-alvo]').forEach(animarContador);

  /* ===== TOAST (notificações) ===== */
  const areaToast = document.getElementById('toast-area');

  function toast(tipo, titulo, mensagem) {
    if (!areaToast) return;
    const icones = { success: '✓', error: '!', info: 'i' };

    const el = document.createElement('div');
    el.className = `toast toast-${tipo}`;
    el.setAttribute('role', tipo === 'error' ? 'alert' : 'status');

    const icone = document.createElement('div');
    icone.className = 'toast-icone';
    icone.textContent = icones[tipo] || 'i';

    const corpo = document.createElement('div');
    corpo.className = 'toast-corpo';
    const t = document.createElement('strong');
    t.textContent = titulo;
    const m = document.createElement('span');
    m.textContent = mensagem;
    corpo.append(t, m);

    const fechar = document.createElement('button');
    fechar.className = 'toast-fechar';
    fechar.setAttribute('aria-label', 'Fechar notificação');
    fechar.textContent = '×';

    el.append(icone, corpo, fechar);
    areaToast.appendChild(el);

    const remover = () => {
      el.classList.add('saindo');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };
    fechar.addEventListener('click', remover);
    setTimeout(remover, 5000);
  }

  /* ===== FILTRO + BUSCA NA TABELA ===== */
  const campoBusca = document.getElementById('busca');
  const chips = document.querySelectorAll('.chip');
  const linhas = Array.from(document.querySelectorAll('#tabela-ocorrencias tbody tr[data-status]'));
  const linhaVazia = document.getElementById('linha-vazia');
  const contador = document.getElementById('contador-resultados');
  let statusAtivo = 'todos';

  // Remove acentos e põe em minúsculas: "Alagamento" encontra "alagamento"
  const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function aplicarFiltro() {
    const termo = normalizar(campoBusca ? campoBusca.value.trim() : '');
    let visiveis = 0;

    linhas.forEach((tr) => {
      const combinaStatus = statusAtivo === 'todos' || tr.dataset.status === statusAtivo;
      const combinaBusca = termo === '' || normalizar(tr.textContent).includes(termo);
      const mostrar = combinaStatus && combinaBusca;
      tr.classList.toggle('hidden', !mostrar);
      if (mostrar) visiveis++;
    });

    if (linhaVazia) linhaVazia.classList.toggle('hidden', visiveis !== 0);
    if (contador) contador.textContent = `${visiveis} de ${linhas.length}`;
  }

  if (campoBusca) campoBusca.addEventListener('input', aplicarFiltro);

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      statusAtivo = chip.dataset.status;
      chips.forEach((c) => {
        const ativo = c === chip;
        c.classList.toggle('is-active', ativo);
        c.setAttribute('aria-pressed', String(ativo));
      });
      aplicarFiltro();
    });
  });

  /* ===== CONSULTA DE PROTOCOLO ===== */
  // Por enquanto valida o protocolo contra a tabela da Home e mostra um toast.
  // Quando a tela "acompanhar.html" existir, basta redirecionar no lugar do toast.
  const formConsulta = document.getElementById('form-consulta');
  const inputProtocolo = document.getElementById('protocolo');
  const usarTeste = document.getElementById('usar-teste');

  if (usarTeste && inputProtocolo) {
    usarTeste.addEventListener('click', () => {
      inputProtocolo.value = usarTeste.textContent.trim();
      inputProtocolo.focus();
    });
  }

  if (formConsulta && inputProtocolo) {
    formConsulta.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const valor = inputProtocolo.value.trim().toUpperCase();

      if (valor === '') {
        toast('info', 'Informe o protocolo', 'Digite o número recebido ao registrar o relato.');
        return;
      }

      if (!/^CDD-\d{4}-\d{4}$/.test(valor)) {
        toast('error', 'Formato inválido', 'Use o padrão CDD-AAAA-0000, por exemplo CDD-2026-0412.');
        return;
      }

      const linha = linhas.find((tr) => tr.cells[0].textContent.trim() === valor);

      if (!linha) {
        toast('error', 'Protocolo não encontrado', `Não localizamos ${valor}. Confira o número e tente novamente.`);
        return;
      }

      const tipo = linha.cells[1].textContent.trim();
      const local = linha.cells[3].textContent.trim();
      const status = linha.querySelector('.pill-status').textContent.trim();
      toast('success', `Protocolo ${valor} localizado`, `${tipo} · ${local} · Status: ${status}.`);

      // Limpa filtros, destaca e rola até a linha correspondente
      if (campoBusca) campoBusca.value = '';
      statusAtivo = 'todos';
      chips.forEach((c) => {
        const ativo = c.dataset.status === 'todos';
        c.classList.toggle('is-active', ativo);
        c.setAttribute('aria-pressed', String(ativo));
      });
      aplicarFiltro();

      linha.classList.remove('destaque');
      void linha.offsetWidth;   // reinicia a animação
      linha.classList.add('destaque');
      linha.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
})();