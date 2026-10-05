      (() => {
        "use strict";

        /* ===== Dados e constantes ===== */
        const CHAVE = "conectacdd:ocorrencias"; // as próximas telas leem daqui
        const TOTAL = 4;
        const TIPOS = {
          esgoto: {
            nome: "Esgoto a céu aberto",
            gravidade: "Alta",
            classe: "pill-alta",
          },
          vazamento: {
            nome: "Vazamento de água potável",
            gravidade: "Média",
            classe: "pill-media",
          },
          alagamento: {
            nome: "Bueiro entupido / Alagamento",
            gravidade: "Alta",
            classe: "pill-alta",
          },
          entulho: {
            nome: "Descarte irregular de entulho",
            gravidade: "Média",
            classe: "pill-media",
          },
        };

        /* ===== Elementos ===== */
        const $ = (sel, raiz = document) => raiz.querySelector(sel);
        const $$ = (sel, raiz = document) =>
          Array.from(raiz.querySelectorAll(sel));

        const form = $("#form-relato");
        const wizard = $("#wizard");
        const passos = $$(".passo");
        const itensStepper = $$(".stepper-item");
        const btnVoltar = $("#btn-voltar");
        const btnProximo = $("#btn-proximo");
        const btnEnviar = $("#btn-enviar");

        const descricao = $("#descricao");
        const contador = $("#contador");
        const foto = $("#foto");
        const dropzone = $("#dropzone");
        const preview = $("#preview");
        const previewImg = $("#preview-img");
        const previewNome = $("#preview-nome");
        const btnRemover = $("#btn-remover");
        const localidade = $("#localidade");
        const referencia = $("#referencia");
        const consentimento = $("#consentimento");
        const resumo = $("#resumo");

        const modal = $("#modal");
        const modalProtocolo = $("#modal-protocolo");
        const linkAcompanhar = $("#link-acompanhar");
        const btnCopiar = $("#btn-copiar");
        const btnNovo = $("#btn-novo");

        let passoAtual = 1;
        let fotoDataUrl = "";

        /* ===== Erros ===== */
        const mostrarErro = (n, msg) => {
          const el = $("#erro-" + n);
          el.textContent = msg;
          el.classList.add("is-visible");
        };
        const limparErro = (n) => {
          const el = $("#erro-" + n);
          el.textContent = "";
          el.classList.remove("is-visible");
        };

        /* ===== Navegação entre passos ===== */
        function mostrarPasso(n, rolar) {
          passoAtual = n;
          passos.forEach((p) =>
            p.classList.toggle("is-active", Number(p.dataset.passo) === n),
          );
          itensStepper.forEach((item, i) => {
            item.classList.toggle("is-active", i + 1 === n);
            item.classList.toggle("is-done", i + 1 < n);
            item.querySelector(".stepper-num").textContent =
              i + 1 < n ? "✓" : String(i + 1);
          });

          btnVoltar.classList.toggle("is-invisible", n === 1);
          btnProximo.classList.toggle("hidden", n === TOTAL);
          btnEnviar.classList.toggle("hidden", n !== TOTAL);

          if (n === TOTAL) renderizarResumo();
          if (rolar)
            wizard.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        function validar(n) {
          if (n === 1) {
            if (!form.elements.tipo.value)
              return "Selecione o tipo de problema para continuar.";
          }
          if (n === 2) {
            const tam = descricao.value.trim().length;
            if (tam < 20)
              return `Descreva o problema com pelo menos 20 caracteres (faltam ${20 - tam}).`;
          }
          if (n === 3) {
            if (!localidade.value) return "Selecione a localidade.";
            if (referencia.value.trim().length < 5)
              return "Informe a rua ou um ponto de referência.";
          }
          if (n === 4) {
            if (!consentimento.checked)
              return "Confirme que as informações são verdadeiras para enviar.";
          }
          return "";
        }

        function avancar() {
          const msg = validar(passoAtual);
          if (msg) {
            mostrarErro(passoAtual, msg);
            return;
          }
          limparErro(passoAtual);
          if (passoAtual < TOTAL) mostrarPasso(passoAtual + 1, true);
        }

        btnProximo.addEventListener("click", avancar);
        btnVoltar.addEventListener("click", () => {
          if (passoAtual > 1) mostrarPasso(passoAtual - 1, true);
        });

        /* ===== Passo 1: seleção do tipo ===== */
        $$('input[name="tipo"]').forEach((r) =>
          r.addEventListener("change", () => limparErro(1)),
        );

        // Se veio da Home com ?tipo=esgoto (por exemplo), já deixa selecionado
        const tipoUrl = new URLSearchParams(location.search).get("tipo");
        if (tipoUrl && TIPOS[tipoUrl]) {
          const radio = form.querySelector(
            `input[name="tipo"][value="${tipoUrl}"]`,
          );
          if (radio) radio.checked = true;
        }

        /* ===== Passo 2: descrição e foto ===== */
        descricao.addEventListener("input", () => {
          contador.textContent = `${descricao.value.length}/500`;
          limparErro(2);
        });

        function carregarFoto(arquivo) {
          if (!arquivo) return;
          if (!arquivo.type.startsWith("image/")) {
            mostrarErro(2, "Envie um arquivo de imagem (JPG, PNG ou WebP).");
            return;
          }
          if (arquivo.size > 5 * 1024 * 1024) {
            mostrarErro(2, "A imagem deve ter no máximo 5 MB.");
            return;
          }

          const leitor = new FileReader();
          leitor.onload = () => {
            fotoDataUrl = leitor.result;
            previewImg.src = fotoDataUrl;
            previewNome.textContent = arquivo.name;
            preview.classList.add("is-visible");
            dropzone.classList.add("hidden");
            limparErro(2);
          };
          leitor.readAsDataURL(arquivo);
        }

        function removerFoto() {
          fotoDataUrl = "";
          foto.value = "";
          previewImg.removeAttribute("src");
          preview.classList.remove("is-visible");
          dropzone.classList.remove("hidden");
        }

        foto.addEventListener("change", () => carregarFoto(foto.files[0]));
        btnRemover.addEventListener("click", removerFoto);

        ["dragenter", "dragover"].forEach((ev) =>
          dropzone.addEventListener(ev, (e) => {
            e.preventDefault();
            dropzone.classList.add("is-over");
          }),
        );
        ["dragleave", "drop"].forEach((ev) =>
          dropzone.addEventListener(ev, (e) => {
            e.preventDefault();
            dropzone.classList.remove("is-over");
          }),
        );
        dropzone.addEventListener("drop", (e) =>
          carregarFoto(e.dataTransfer.files[0]),
        );

        /* ===== Passo 3: localização ===== */
        localidade.addEventListener("change", () => limparErro(3));
        referencia.addEventListener("input", () => limparErro(3));

        /* ===== Passo 4: resumo ===== */
        function linhaResumo(rotulo, conteudo) {
          const linha = document.createElement("div");
          linha.className = "resumo-linha";
          const dt = document.createElement("dt");
          dt.textContent = rotulo;
          const dd = document.createElement("dd");
          if (conteudo instanceof Node) dd.appendChild(conteudo);
          else dd.textContent = conteudo;
          linha.append(dt, dd);
          return linha;
        }

        function renderizarResumo() {
          const tipo = TIPOS[form.elements.tipo.value];
          resumo.replaceChildren();

          resumo.appendChild(linhaResumo("Tipo", tipo.nome));
          resumo.appendChild(linhaResumo("Descrição", descricao.value.trim()));
          resumo.appendChild(linhaResumo("Localidade", localidade.value));
          resumo.appendChild(
            linhaResumo("Referência", referencia.value.trim()),
          );

          if (fotoDataUrl) {
            const img = document.createElement("img");
            img.src = fotoDataUrl;
            img.alt = "Foto anexada ao relato";
            resumo.appendChild(linhaResumo("Foto", img));
          } else {
            resumo.appendChild(linhaResumo("Foto", "Nenhuma foto anexada"));
          }

          const pill = document.createElement("span");
          pill.className = `pill ${tipo.classe}`;
          pill.textContent = tipo.gravidade;
          resumo.appendChild(linhaResumo("Prioridade", pill));
        }

        /* ===== Armazenamento local (simula o banco de dados) ===== */
        function lerOcorrencias() {
          try {
            return JSON.parse(localStorage.getItem(CHAVE)) || [];
          } catch {
            return [];
          }
        }

        function salvarOcorrencia(registro) {
          const lista = lerOcorrencias();
          lista.unshift(registro);
          try {
            localStorage.setItem(CHAVE, JSON.stringify(lista));
          } catch {
            // Se estourar o limite do navegador, salva sem a foto
            lista[0].foto = "";
            try {
              localStorage.setItem(CHAVE, JSON.stringify(lista));
            } catch {
              /* segue sem salvar */
            }
          }
        }

        function gerarProtocolo() {
          const ano = new Date().getFullYear();
          const existentes = lerOcorrencias().map((o) => o.protocolo);
          let protocolo;
          do {
            protocolo = `CDD-${ano}-${Math.floor(1000 + Math.random() * 9000)}`;
          } while (existentes.includes(protocolo));
          return protocolo;
        }

        // Reduz a foto para caber no localStorage
        function reduzirImagem(dataUrl, max = 720) {
          return new Promise((resolve) => {
            if (!dataUrl) return resolve("");
            const img = new Image();
            img.onload = () => {
              const escala = Math.min(1, max / Math.max(img.width, img.height));
              const canvas = document.createElement("canvas");
              canvas.width = Math.round(img.width * escala);
              canvas.height = Math.round(img.height * escala);
              canvas
                .getContext("2d")
                .drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
            img.onerror = () => resolve("");
            img.src = dataUrl;
          });
        }

        /* ===== Envio ===== */
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          if (passoAtual < TOTAL) {
            avancar();
            return;
          } // Enter nos passos 1–3 apenas avança

          const msg = validar(TOTAL);
          if (msg) {
            mostrarErro(TOTAL, msg);
            return;
          }
          limparErro(TOTAL);

          btnEnviar.disabled = true;
          btnEnviar.textContent = "Enviando…";
          await new Promise((r) => setTimeout(r, 900)); // simula o tempo de envio

          const chaveTipo = form.elements.tipo.value;
          const agora = new Date().toISOString();
          const registro = {
            protocolo: gerarProtocolo(),
            tipo: chaveTipo,
            tipoNome: TIPOS[chaveTipo].nome,
            gravidade: TIPOS[chaveTipo].gravidade,
            descricao: descricao.value.trim(),
            localidade: localidade.value,
            referencia: referencia.value.trim(),
            foto: await reduzirImagem(fotoDataUrl),
            status: "recebido",
            criadoEm: agora,
            historico: [{ status: "recebido", em: agora }],
          };

          salvarOcorrencia(registro);
          abrirModal(registro.protocolo);

          btnEnviar.disabled = false;
          btnEnviar.textContent = "Enviar relato";
        });

        /* ===== Modal ===== */
        function abrirModal(protocolo) {
          modalProtocolo.textContent = protocolo;
          linkAcompanhar.href = `acompanhar.html?protocolo=${encodeURIComponent(protocolo)}`;
          modal.classList.add("is-open");
          document.body.style.overflow = "hidden";
          btnCopiar.focus();
        }

        function reiniciar() {
          modal.classList.remove("is-open");
          document.body.style.overflow = "";
          form.reset();
          removerFoto();
          contador.textContent = "0/500";
          [1, 2, 3, 4].forEach(limparErro);
          mostrarPasso(1, true);
        }

        btnNovo.addEventListener("click", reiniciar);
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && modal.classList.contains("is-open"))
            reiniciar();
        });

        btnCopiar.addEventListener("click", async () => {
          const texto = modalProtocolo.textContent;
          try {
            await navigator.clipboard.writeText(texto);
          } catch {
            const area = document.createElement("textarea");
            area.value = texto;
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            area.remove();
          }
          btnCopiar.textContent = "Copiado!";
          setTimeout(() => {
            btnCopiar.textContent = "Copiar protocolo";
          }, 2000);
        });

        mostrarPasso(1, false);
      })();
