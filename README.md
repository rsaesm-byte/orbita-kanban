# Órbita Kanban

Quadro kanban em um único arquivo HTML + JavaScript, sem servidor e sem instalação.

## Como usar

1. Baixe `orbita-kanban.html`.
2. Abra no Chrome ou Edge (duplo clique).
3. Na primeira abertura o app baixa `orbita-kanban-dados.json`. Clique em **Conectar arquivo** para gravar sempre nesse arquivo.

## O que tem

- Vários quadros, colunas com cor e limite de tarefas
- Tarefas com nº do chamado, prioridade, prazo, tags por cor, checklist, cronômetro e campos personalizados
- Busca e comandos com `Ctrl+K`; captura rápida: `Trocar toner #CH-48300 !alta @amanha +Hardware`
- Botão direito no cartão: prioridade, prazo, mover, tags, Outlook
- Visão **Órbita**: tarefas como planetas, mais perto do centro quanto mais perto do prazo
- Lista, relatórios com gráficos e exportação em CSV
- Cena 3D com cartões de vidro e uma luz que segue o mouse
- Observações em texto rico, campos extras, anexos (imagens, PDF) e modelos de checklist por tag
- Exportação da tarefa em Markdown pronta para o Obsidian
- Sons diferentes para cada tipo de alerta
- Bloco de tempo no calendário do Outlook (link direto ou arquivo `.ics`)
- Salvamento em 3 camadas: navegador, arquivo `.json` conectado e redes de segurança

## Dados

Os dados ficam no seu computador (navegador e arquivo `.json`). Nada é enviado para o GitHub.

## Versão para celular

Veja `GUIA - Orbita Kanban para celular Android.md`.

## Celular (Android)

O mesmo arquivo já é responsivo: abra `https://rsaesm-byte.github.io/orbita-kanban/` no Chrome do celular e use
**Configurações → Aplicativo → Instalar app** (ou ⋮ → Instalar app). Ele vira um ícone na tela inicial, abre em tela cheia
e funciona sem internet (`sw.js`). No celular: abas viram a barra de baixo, botão **+ Nova tarefa** flutuante, gaveta em tela cheia
e **toque longo no cartão** abre o menu (prioridade, prazo, mover para outra coluna…).

### Gestos no celular
- **Deslizar para os lados**: troca de coluna (a barra de colunas no topo acompanha e também é tocável).
- **Círculo no cartão**: conclui / reabre a tarefa.
- **Segurar o cartão e arrastar**: move entre colunas (rola sozinho ao chegar na borda). **Segurar e soltar parado** abre o menu rápido.
- **Deslizar a gaveta da tarefa para a direita** (pelo topo ou pela borda esquerda) ou **janelas/menu para baixo**: fecha.
- **Deslizar sobre a barra de baixo**: troca entre Quadro, Órbita, Lista e Relatórios.
