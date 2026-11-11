# Guia — Órbita Kanban para celular (Android)

> Instruções para criar a versão de celular do **Órbita Kanban**, seguindo a mesma receita do *Minhas Finanças (celular)*.
> Leia junto com o **GUIA - App para celular com salvamento automático e GitHub** e a pasta `template-app-celular`. Este documento só cobre o que é específico do kanban.
>
> **Como usar com o Claude:** abra um projeto novo, anexe o GUIA geral, o `template-app-celular`, este documento e o arquivo `orbita-kanban.html` (versão do computador), e comece com o prompt da seção 9.

---

## 1. A ideia

A versão do computador é uma **bancada**: tudo aberto na mesa, mouse, teclado, botão direito.
A versão do celular é um **bloco de bolso**: uma coluna por vez, polegar, toque longo.

O **modelo de dados é o mesmo**. Isso permite levar o backup `.json` de um para o outro sem perder nada.

| | Computador | Celular |
|---|---|---|
| Arquivo | `orbita-kanban.html` (abre direto) | `index.html` + `manifest.json` + `sw.js` (PWA) |
| Onde roda | Chrome/Edge, duplo clique | GitHub Pages, instalado na tela inicial |
| Salvamento | Navegador + arquivo `.json` conectado | Navegador + backup por compartilhamento |
| Repositório | `orbita-kanban` | `orbita-kanban-celular` (**público**, exigência do Pages grátis) |

---

## 2. Nomes únicos (não misturar com o app de finanças nem com a versão do computador)

```js
const APP_ID     = 'orbita-kanban';          // IGUAL ao do computador: é o que deixa importar o backup de um no outro
const APP_VERSAO = '2026.11.11-1';           // aumente a cada publicação
const LS_KEY     = 'orbita_kanban_cel_v1';   // diferente do computador (orbita_kanban_dados_v1)
const DB_NAME    = 'orbita_kanban_cel_db';   // diferente do computador (orbita_kanban_db)
const META_KEY   = 'orbita_kanban_cel_meta';
// sw.js
const VERSAO     = 'orbita-kanban-cel-v1';
```

---

## 3. Modelo de dados (copiar do computador, sem mudar)

```js
state = {
  v: 1, updatedAt, deleted: {},            // deleted = exclusões registradas (tombstones)
  boards:  [{ id, name }],
  columns: [{ id, name, hue, wip, done, board }],
  tasks:   [{ id, title, desc, ticket, priority (0 crítica … 3 baixa), due ('AAAA-MM-DD' ou 'AAAA-MM-DDTHH:mm'),
              tags: [id], check: [{ id, t, d }], custom: { campoId: valor }, col, timeMs,
              notes (HTML limpo: observações em texto rico), extra: [{ id, k, v }] (informações adicionais da tarefa),
              files: [{ id, name, type, size, at }] (anexos: o arquivo em si fica no IndexedDB, chave 'att_' + id),
              createdAt, doneAt, archived, block: { d, s, m } }],
  tags:    [{ id, name, hue }],
  fields:  [{ id, name, type }],
  templates: [{ id, name, tag, items: [texto] }],   // modelos de checklist por tag
  settings: { theme, accent, density, depth, lens, sound, volume, outlook, notifyHours },
  timer:   { id, start } | null
}
```

- Listas para o `mergeStates`: `['boards', 'tasks', 'columns', 'tags', 'fields', 'templates']`.
- **Anexos não viajam no backup `.json`**: ficam no IndexedDB de cada aparelho. No celular, anexar pela câmera ou galeria (`<input type="file" accept="image/*,application/pdf" capture>`).
- Formato do backup: `{ app: 'orbita-kanban', formato: 1, salvoEm, rev, sha256, dados: state }`.
- O quadro aberto no momento fica **fora** do `state` (chave própria no localStorage), para trocar de quadro não gerar gravação.

**Funções para copiar do `orbita-kanban.html` como estão:** `normalize`, `defaultState`/`demoState`, `mergeStates`, `mergeById`, `tomb`, `dueInfo`, `score`, `nextUp`, `passes`, `parseQuick`, `addTask`, `moveTask`, `setCol`, `pending`, `reportData`, `csvText`, `SOUNDS` + `playSound`, `cleanHTML`, `plain`, `htmlToMd`, `taskMd`, `applyTpl`, `suggestTpl`, `addFiles`, `attURL`, `blockOf`, `outlookUrl`, `icsText`.

---

## 4. O que muda de cada função no celular

| No computador | No celular |
|---|---|
| Todas as colunas lado a lado | **Uma coluna por tela**, com abas no topo e deslizar para os lados para trocar |
| Arrastar o cartão com o mouse | **Toque longo** no cartão → folha "Mover para…" com as colunas. Deslizar o cartão para a direita = próxima coluna |
| Botão direito | **Toque longo** abre a mesma folha de ações (prioridade, prazo, mover, tags, Outlook, duplicar, arquivar, apagar) |
| Ctrl+K | Botão de **lupa** na barra inferior, abrindo a busca em tela cheia |
| Gaveta lateral da tarefa | **Folha que sobe de baixo**; arrastar para baixo e o botão voltar fecham |
| Captura rápida no fim da coluna | **Botão +** flutuante; o campo aceita a mesma sintaxe (`#chamado !alta @amanha +tag`) |
| Lupa do Dock e holofote (seguem o mouse) | **Não existe mouse**: o cartão tocado cresce e os outros escurecem enquanto o dedo está nele |
| Bancada que inclina com o mouse | Opcional: inclinar com o **giroscópio** (`deviceorientation`), bem leve; desligado por padrão para poupar bateria |
| Transições 3D de quadro e de visão | Manter, mais curtas (≤ 300 ms). Respeitar `prefers-reduced-motion` |
| Órbita (arrastar para girar) | Manter: **um dedo gira**, toque no planeta abre a tarefa |
| Observações em texto rico (barra de formatação) | Mesma área editável, com a barra de formatação **fixa acima do teclado** e botões de 44 px |
| Exportar .md (download) | **Compartilhar .md** pelo menu do Android, para mandar direto ao Obsidian |
| Lista em tabela | Lista de **cartões compactos** (tabela não cabe em 412 px) |
| Relatórios | Manter, com os gráficos empilhados em uma coluna |
| Arquivo `.json` conectado (File System Access) | **Não existe no Android.** Usar "Compartilhar backup" (Web Share) e lembrete de 7 dias |
| Download automático a cada 10 min | **Desligar** (vira enxurrada de arquivos) |
| Aviso ao fechar a aba | **Remover** (no celular só atrapalha); gravar em `visibilitychange` e `pagehide` |

**Barra inferior (5 itens):** Quadro · Órbita · **+** · Lista · Mais (relatórios, busca, quadros, configurações).

---

## 5. Sons, avisos e Outlook no celular

**Sons**
- Os mesmos cinco timbres (crítica atrasada, atrasada, prazo chegando, concluída, cronômetro), gerados por Web Audio, sem arquivos.
- O Android só libera som **depois do primeiro toque** na tela. Criar o `AudioContext` no primeiro `pointerdown`.
- Acrescentar **vibração** junto com o som: `navigator.vibrate([80, 60, 80])` para atrasada, um pulso curto para prazo chegando.

**Avisos**
- Com o app **aberto**: sino, aviso na tela, som e vibração (igual ao computador).
- Notificação do sistema: pedir permissão por botão e mostrar com `registration.showNotification()` pelo service worker.
- ⚠️ **Limite real:** com o app **fechado** não há aviso. Avisar com o app fechado exige servidor de push, o que foge da receita "sem servidor". O caminho sem servidor é o **bloco no calendário do Outlook**, que tem lembrete próprio.

**Outlook**
- O botão "Abrir no Outlook" usa o mesmo endereço do computador (`outlook.office.com/calendar/0/deeplink/compose?...`). No celular ele abre o Outlook na web; conferir e salvar.
- "Baixar .ics" vira **"Compartilhar .ics"** (Web Share com arquivo). Escolhendo o app Outlook, ele cria o compromisso com horário ocupado e lembrete de 15 min.
- Testar no aparelho os dois caminhos: o comportamento do link muda conforme o app do Outlook está instalado ou não.

---

## 6. Regras de tela (Motorola Edge 60 Pro, testar em 412×915)

- Nada passa da largura da tela; sem rolagem lateral, exceto o deslizar entre colunas.
- Alvos de toque com **44 px** ou mais; inputs com **16 px** de fonte.
- `viewport-fit=cover` com `env(safe-area-inset-*)` na barra inferior e no topo.
- Tema escuro como padrão no celular (o 3D e os destaques aparecem melhor e gasta menos bateria em tela OLED).
- Efeitos 3D só com `transform` e `opacity` (não animar `box-shadow` nem `filter` em muitos cartões ao mesmo tempo).

---

## 7. Passo a passo

1. **Projeto novo no Claude** com os quatro anexos (GUIA geral, `template-app-celular`, este documento, `orbita-kanban.html`).
2. **Prompt da seção 9.** O Claude monta `index.html`, `manifest.json`, `sw.js`, ícones e `README.md`.
3. **Ícone:** mandar uma imagem quadrada (1024×1024) ou pedir um ícone com o símbolo da órbita.
4. **Testar no computador** em tela de celular (412×915) com a lista da seção 8.
5. **Criar o repositório** `orbita-kanban-celular` em github.com/new, **Public**, vazio, e avisar "criei".
6. O Claude **envia os arquivos** e você liga o Pages: *Settings › Pages › Deploy from a branch › main / (root) › Save*.
7. Em 1 a 2 minutos: `https://rsaesm-byte.github.io/orbita-kanban-celular/`
8. **No celular:** abrir o endereço no Firefox → ⋮ → **Instalar**. Usar sempre pelo ícone.
9. **Trazer os dados do computador:** no computador, Configurações → *Baixar backup (JSON)* → mandar o arquivo para o celular → no app, *Importar backup*. Para devolver ao computador, *Compartilhar backup* no celular e *Restaurar backup* no computador.

> As duas versões **não sincronizam sozinhas**. A troca é sempre pelo backup `.json`, que junta por `id` e respeita o que foi apagado.

---

## 8. Checklist antes de dizer "pronto"

- [ ] Nomes únicos da seção 2 (e `APP_ID` igual ao do computador)
- [ ] Criar tarefa → recarregar → continua lá
- [ ] Backup do **computador** importa no celular sem duplicar e sem ressuscitar tarefa apagada
- [ ] Backup do **celular** restaura no computador
- [ ] Trocar de coluna deslizando; toque longo abre a folha de ações
- [ ] Mudar prioridade e prazo pela folha de ações
- [ ] Criar, trocar, renomear e apagar quadros
- [ ] Sons diferentes para cada alerta, depois do primeiro toque; vibração junto
- [ ] "Abrir no Outlook" e "Compartilhar .ics" criam o compromisso no horário certo (fuso de Brasília)
- [ ] Instala pelo Firefox/Chrome e abre em tela cheia
- [ ] Abre em modo avião depois do primeiro acesso
- [ ] "Atualizar o app" mostra a versão nova e mantém os dados
- [ ] Sem rolagem lateral; folhas fecham arrastando para baixo e com o botão voltar

---

## 9. Prompt para começar

```
Leia o GUIA geral, este guia do Órbita Kanban para celular, e use a pasta template-app-celular como base.
Quero a versão para celular do Órbita Kanban (arquivo orbita-kanban.html em anexo).
Mantenha o mesmo modelo de dados e copie as funções listadas na seção 3 do guia do kanban,
para o backup .json do computador importar no celular e vice-versa.
Adapte a interface conforme a tabela da seção 4: uma coluna por tela com deslizar, toque longo
no lugar do botão direito e do arrastar, folhas que sobem de baixo, barra inferior com
Quadro · Órbita · + · Lista · Mais.
Mantenha: vários quadros, prioridade, nº do chamado, prazo, tags por cor, checklist, cronômetro,
campos personalizados, Órbita, relatórios, sons por tipo de alerta (com vibração) e bloco de tempo no Outlook.
Efeitos 3D leves e curtos, tema escuro por padrão.
Nomes únicos: APP_ID=orbita-kanban, LS_KEY=orbita_kanban_cel_v1, DB_NAME=orbita_kanban_cel_db.
Teste em tela de celular (412×915) e passe pelo checklist da seção 8 antes de entregar.
Quando estiver pronto, vou criar o repositório orbita-kanban-celular no GitHub
(usuário rsaesm-byte) para você publicar no GitHub Pages.
```
