# Viana's Fit

App de treino pessoal (academia e casa) que funciona no iPhone como app instalado, inclusive sem internet.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `treinos.js` | **Os treinos.** É o arquivo para editar exercícios, séries, repetições e descanso. |
| `app.js` | A lógica do app (registro, sugestão de carga, timer, gráficos, backup). |
| `estilo.css` | Cores e visual. |
| `index.html` | A página que junta tudo. |
| `sw.js` | Guarda o app no celular para abrir sem internet. |
| `manifest.webmanifest` + `icones/` | Nome e ícone na tela de início. |

## Como mudar um treino

1. Abra `treinos.js` e mude o que quiser (cada campo está explicado no topo do arquivo).
2. Aumente o número de `versao` no começo do plano (ex.: de 1 para 2).
3. Em `sw.js`, aumente o número em `CACHE` (ex.: `vianasfit-v2` → `vianasfit-v3`).
4. Publique de novo. No iPhone, abra o app duas vezes para ele pegar a versão nova.

Se você editou o plano pelo próprio app (tela Plano), ele **não** é trocado automaticamente.
Para usar o do arquivo, toque em "Restaurar plano original".

## Onde ficam os dados

Só no aparelho (localStorage do navegador). Nada vai para a internet.
Faça backup pela tela Plano → Exportar backup e guarde no iCloud Drive.
