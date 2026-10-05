<div align="center">

# ConectaCDD

**Plataforma de relato e acompanhamento de problemas de saneamento básico na Cidade de Deus (RJ)**

![Status](https://img.shields.io/badge/status-protótipo%20funcional-1560a8?style=for-the-badge)
![ODS 11](https://img.shields.io/badge/ODS-11%20Cidades%20Sustentáveis-f99d26?style=for-the-badge)
![UVA](https://img.shields.io/badge/UVA-Universidade%20Veiga%20de%20Almeida-0f4c81?style=for-the-badge)
![Disciplina](https://img.shields.io/badge/Disciplina-Engenharia%3A%20Da%20Ideia%20à%20Concepção-0b2f4f?style=for-the-badge)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

</div>

---

## Protótipo Online
O protótipo funcional desenvolvido está publicado e acessível no ar através do link:
 **[https://conectacdd.vercel.app](https://conectacdd.vercel.app)**

---

## Sobre o projeto

A **Cidade de Deus**, comunidade da Zona Oeste do Rio de Janeiro, convive com problemas recorrentes de saneamento básico: esgoto a céu aberto, vazamentos de água, bueiros entupidos que causam alagamentos e descarte irregular de entulho. Para o morador, falta um canal simples para relatar essas ocorrências e, principalmente, **saber o que aconteceu depois do relato**. Para os órgãos responsáveis, falta informação organizada para priorizar o atendimento.

O **ConectaCDD** propõe um canal único que conecta moradores e gestores:

- O **morador** registra o problema em poucos passos (tipo, descrição, foto e localização) e recebe um **número de protocolo**.
- Com o protocolo, acompanha o chamado em uma **linha do tempo visual**: Registrado → Em análise → Equipe em campo → Resolvido.
- Os **gestores** visualizam todos os chamados em um painel, priorizam por gravidade e atualizam o andamento.

O projeto está alinhado ao **ODS 11 – Cidades e Comunidades Sustentáveis**, ao promover transparência, participação social e melhoria da infraestrutura urbana em uma comunidade historicamente carente de serviços.

> **Nota:** esta versão é um **protótipo frontend** para validação de conceito. Não há backend nem banco de dados reais: os dados são simulados e salvos no `localStorage` do navegador.

---

## Stakeholders atendidos

| Stakeholder | Necessidade | Como o ConectaCDD atende |
|---|---|---|
| **Moradores da Cidade de Deus** | Relatar problemas de forma simples e acompanhar a solução | Formulário em 4 passos, upload de foto, protocolo único e consulta por linha do tempo |
| **Iguá Rio** | Priorizar manutenções com informação organizada | Painel com chamados classificados por gravidade, tipo e localidade, com atualização de status |
| **Fundação Rio-Águas / Prefeitura do Rio** | Gerir ocorrências e embasar decisões e políticas públicas | Indicadores consolidados (total,  pendentes, em andamento, resolvidos, taxa de urgência) e visão por localidade |

---

## Funcionalidades

### Página inicial (`index.html`)
- Apresentação da plataforma, estatísticas simuladas e acessos rápidos
- Consulta rápida de protocolo
- Tabela de últimas ocorrências com busca e filtro por status
- Seções de áreas atendidas, parceiros e transparência, e perguntas frequentes

### Relato de problema (`relatar.html`)
- Fluxo em 4 passos: tipo do problema → descrição e foto → localização → revisão e envio
- Pré-visualização da imagem anexada (com arrastar e soltar)
- Validação por etapa e geração dinâmica de protocolo (ex.: `CDD-2026-9482`)
- Modal de confirmação informando o encaminhamento à Iguá Rio e à Fundação Rio-Águas

### Acompanhamento (`acompanhar.html`)
- Consulta por número de protocolo, com normalização e validação do formato
- Detalhes da ocorrência e **timeline visual** de 4 etapas
- Estados de tela: inicial, protocolo não encontrado e resultado

### Painel de Gestão (`gestao.html`)
- Indicadores rápidos: total, pendentes, em andamento, resolvidos e taxa de urgência
- Tabela interativa com filtro por gravidade (Alta, Média, Baixa), status e busca textual
- Ordenação por prioridade ou data
- Ações por linha: **Atualizar status** e **Marcar como resolvido**, refletidas na tela de acompanhamento

---

## Arquitetura do projeto

```text
conectacdd/
├── index.html              # Página inicial
├── relatar.html            # Relato de problema (wizard em 4 passos)
├── acompanhar.html         # Acompanhamento por protocolo
├── gestao.html             # Painel de gestão institucional
├── style.css               # Estilos globais e tokens de design
├── README.md
│
├── css/
│   ├── acompanhar.css      # Estilos da tela de acompanhamento
│   └── gestao.css          # Estilos do painel de gestão
│
├── js/
│   ├── main.js             # Menu mobile, contadores e interações da Home
│   ├── acompanhar.js       # Busca de protocolo e timeline
│   └── gestao.js           # Filtros, ordenação e atualização de status
│
└── images/
    ├── hero-cdd.jpg        # Imagem de fundo do cabeçalho
    ├── igua-rio.png        # Logo da Iguá Rio
    ├── rio-aguas.png       # Logo da Fundação Rio-Águas
    └── prefeitura-rio.png  # Logo da Prefeitura do Rio
```

**Persistência simulada:** as telas de relato, acompanhamento e gestão compartilham os dados pela chave `conectacdd:ocorrencias` do `localStorage`. Assim, um relato criado em `relatar.html` aparece no painel e pode ter o status alterado, com o resultado visível em `acompanhar.html`.

---

## Tecnologias utilizadas

- **HTML5** semântico e acessível (atributos ARIA, navegação por teclado)
- **CSS3 moderno**: variáveis (custom properties), Flexbox, Grid, transições e animações sutis
- **JavaScript puro (Vanilla JS)**, sem frameworks ou bibliotecas
- **Design responsivo** (mobile-first) para celular, tablet e desktop
- **Ícones em SVG inline** e fonte **Inter** (Google Fonts)
- **Web Storage API** (`localStorage`) para simular o banco de dados

---

## Roteiro de demonstração

1. Na **Home**, explore as estatísticas, filtre a tabela de ocorrências e veja os parceiros.
2. Em **Relatar problema**, escolha um tipo, descreva a situação, anexe uma foto, informe a localidade e envie. Copie o **protocolo** gerado.
3. Em **Acompanhar protocolo**, consulte o número copiado e veja a timeline no estado *Registrado*. Os protocolos de exemplo `CDD-2026-0412`, `CDD-2026-0411` e `CDD-2026-0407` mostram etapas diferentes.
4. No **Painel de Gestão**, localize o chamado, filtre por gravidade e clique em **Atualizar status** ou **Marcar como resolvido**.
5. Volte a **Acompanhar protocolo** e consulte o mesmo número para ver a timeline atualizada.

> O botão **Restaurar dados de exemplo**, no painel, devolve os chamados fictícios ao estado original.

---

## Limitações e próximos passos

Por ser um protótipo, esta versão **não inclui**:

- Backend e banco de dados reais (dados salvos apenas no navegador do usuário)
- Autenticação e perfis de acesso para a área restrita
- Geolocalização e mapa: a localização é informada por localidade e ponto de referência
- Notificações ao morador sobre mudanças de status
- Integração oficial com a Iguá Rio, a Fundação Rio-Águas e a Prefeitura do Rio

Os dados, as estatísticas e as parcerias exibidas são **simulados** e representam os atores previstos no projeto.

**Evolução sugerida:** API REST com banco de dados, autenticação, mapa com geolocalização dos chamados, notificações por SMS/WhatsApp e relatórios para apoio a políticas públicas.

---

## Contexto acadêmico

Projeto desenvolvido para a disciplina **Engenharia: Da Ideia à Concepção**, do curso de **Engenharia de Software** da **Universidade Veiga de Almeida (UVA)**, e apresentado na **Sprint Review da Entrega 2**.

O trabalho aplica práticas de engenharia de requisitos (identificação de stakeholders e necessidades), prototipação de interface e desenvolvimento incremental, com foco no **ODS 11 da Agenda 2030 da ONU**.

<div align="center">

Feito para a Cidade de Deus · **UVA · Engenharia: Da Ideia à Concepção**

</div>