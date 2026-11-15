"""Prepara uma publicação do Órbita Kanban.
Uso:  python3 release.py         (gera um novo número de versão automaticamente)
Faz: define APP_BUILD em orbita-kanban.html, copia para index.html, troca o cache do sw.js e grava versao.json.
Os apps já instalados leem versao.json e avisam o usuário que há versão nova."""
import datetime, re
b = datetime.datetime.now().strftime("%Y%m%d.%H%M")
s = open("orbita-kanban.html", encoding="utf-8").read()
s, n = re.subn(r'const APP_BUILD = "[^"]*";', f'const APP_BUILD = "{b}";', s); assert n == 1
open("orbita-kanban.html", "w", encoding="utf-8").write(s); open("index.html", "w", encoding="utf-8").write(s)
w = open("sw.js", encoding="utf-8").read(); w = re.sub(r'const C = "[^"]*";', f'const C = "orbita-{b}";', w); open("sw.js", "w", encoding="utf-8").write(w)
open("versao.json", "w", encoding="utf-8").write('{"versao": "%s"}\n' % b)
print("versão", b)
