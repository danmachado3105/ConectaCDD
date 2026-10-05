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

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Stakeholders atendidos](#stakeholders-atendidos)
- [Funcionalidades](#funcionalidades)
- [Arquitetura do projeto](#arquitetura-do-projeto)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Como executar localmente](#como-executar-o-protótipo-localmente)
- [Roteiro de demonstração](#roteiro-de-demonstração)
- [Limitações e próximos passos](#limitações-e-próximos-passos)
- [Contexto acadêmico](#contexto-acadêmico)

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
| **Fundação Rio-Águas / Prefeitura do Rio** | Gerir ocorrências e embasar decisões e políticas públicas | Indicadores consolidados (total,