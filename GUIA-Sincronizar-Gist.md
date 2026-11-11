# GUIA - Sincronizar qualquer app HTML com GitHub Gist (token)

Serve para os outros projetos de arquivo único (financas.html, gerador de invoice, preventivo de salas etc.): o mesmo link aberto em qualquer computador ou celular mostra os mesmos dados.

## Parte 1 - Gerar o token (cada pessoa gera o seu)

1. Entre em https://github.com/settings/tokens/new?scopes=gist&description=Sincronizar%20meus%20apps (já vem com a caixa **gist** marcada).
2. Em **Note**, deixe um nome (ex.: "Meus apps"). Em **Expiration**, escolha **No expiration** (ou 1 ano; vencendo, é só gerar outro).
3. Confirme que **somente** a caixa **gist** está marcada. Nada de repo, workflow ou user.
4. Clique **Generate token** e copie o código que começa com `ghp_`. Ele só aparece uma vez.
5. Cole no app, no campo de sincronização, e clique **Conectar**.

Regras de ouro:
- O token é como uma senha dos seus Gists. Não envie por e-mail/WhatsApp e não coloque dentro do código nem no GitHub.
- Se compartilhar o app com outra pessoa, ela gera o token **da conta dela**. Os dados dela ficam no Gist dela, separados dos seus.
- Perdeu ou vazou? Apague em https://github.com/settings/tokens e gere outro. Os dados continuam no Gist.
- O app guarda o token só no navegador do aparelho (localStorage). Em outro computador, repita os passos 1 a 5 (ou use o mesmo token).

## Parte 2 - Código para colar em outro app

Premissa: o app tem um único objeto de estado `state` com `state.updatedAt` (número, `Date.now()` a cada alteração), uma função `save()` chamada a cada mudança e uma função `refresh()` que redesenha a tela.

```html
<!-- coloque dentro de <script>, depois de definir state, save() e refresh() -->
<script>
const SYNC = { FILE: "dados.json", LS: "gist_cfg_MEUAPP", cfg: null, busy: false };   // troque MEUAPP por nome único do app
try { SYNC.cfg = JSON.parse(localStorage.getItem(SYNC.LS)) || null; } catch {}
const syncSaveCfg = c => { SYNC.cfg = c; c ? localStorage.setItem(SYNC.LS, JSON.stringify(c)) : localStorage.removeItem(SYNC.LS); };

async function gh(path, opt = {}) {
  const r = await fetch("https://api.github.com" + path, { ...opt, headers: {
    Accept: "application/vnd.github+json", Authorization: "Bearer " + SYNC.cfg.token, "Content-Type": "application/json" } });
  if (!r.ok) { const e = new Error("github " + r.status); e.status = r.status; throw e; }
  return r;
}

async function syncRead() {                       // devolve o estado salvo na nuvem, ou null
  if (!SYNC.cfg.id) return null;
  try {
    const g = await (await gh("/gists/" + SYNC.cfg.id + "?_=" + Date.now())).json();
    const f = g.files[SYNC.FILE]; return f ? JSON.parse(f.content) : null;
  } catch (e) { if (e.status === 404) return null; throw e; }
}

async function syncWrite() {                      // grava o estado na nuvem
  const files = { [SYNC.FILE]: { content: JSON.stringify(state) } };
  if (!SYNC.cfg.id) {
    const g = await (await gh("/gists", { method: "POST", body: JSON.stringify({ description: "MEU APP: dados (nao apague)", public: false, files }) })).json();
    SYNC.cfg.id = g.id;
  } else await gh("/gists/" + SYNC.cfg.id, { method: "PATCH", body: JSON.stringify({ files }) });
  SYNC.cfg.syncedAt = state.updatedAt; syncSaveCfg(SYNC.cfg);
}

async function syncNow() {                        // regra simples: o mais recente vence
  if (!SYNC.cfg || SYNC.busy) return; SYNC.busy = true;
  try {
    const R = await syncRead();
    if (!R) await syncWrite();
    else if ((R.updatedAt || 0) > (state.updatedAt || 0)) { state = R; save(); refresh(); SYNC.cfg.syncedAt = R.updatedAt; syncSaveCfg(SYNC.cfg); }
    else if ((state.updatedAt || 0) > (R.updatedAt || 0)) await syncWrite();
  } catch (e) { console.warn("sync", e); if (e.status === 401) { syncSaveCfg(null); alert("Token recusado. Conecte de novo."); } }
  finally { SYNC.busy = false; }
}

function syncConnect(token) {                     // chame com o texto colado pelo usuário
  syncSaveCfg({ token: token.trim() }); return syncNow();
}

// sincroniza ao abrir, ao voltar para a aba e a cada 60 s
syncNow(); setInterval(syncNow, 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) syncNow(); });
// e depois de cada alteração: chame  clearTimeout(window._st); window._st = setTimeout(syncNow, 2500);  dentro do save()
</script>
```

Interface mínima (cole no HTML):

```html
<input id="tk" type="password" placeholder="Cole o token ghp_...">
<button onclick="syncConnect(document.getElementById('tk').value)">Conectar</button>
```

## Parte 3 - Como pedir ao Claude para aplicar em cada projeto

Copie e cole:

> Neste projeto, adicione sincronização via GitHub Gist usando o token do próprio usuário (escopo gist apenas), como no Órbita Kanban: campo para colar o token, botão Conectar, sincronizar ao abrir, ao voltar para a aba e a cada 60 s, com cópia na nuvem em Gist privado. Siga o guia "Sincronizar qualquer app HTML com GitHub Gist (token)". Mostre no topo o estado (Sincronizado / Erro). Teste no navegador.

## Limitações

- A regra "o mais recente vence" da Parte 2 é simples: se dois aparelhos editarem offline ao mesmo tempo, vale o último a gravar. O Órbita Kanban usa uma versão mais completa que **junta** as alterações dos dois lados (com controle de exclusões).
- Gists têm limite de cerca de 1 MB por arquivo pelo conteúdo direto; acima disso a leitura usa `raw_url`. Para apps pequenos, não é problema.
- Não use em computador público: o token fica salvo no navegador. Use "Desconectar" ao terminar.
