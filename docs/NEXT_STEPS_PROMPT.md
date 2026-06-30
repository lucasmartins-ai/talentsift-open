# Next Steps Prompt

Use the prompt below to start the next implementation session for TalentSift Open.

```text
Voce esta trabalhando no projeto TalentSift Open, em /Users/Master/Downloads/Talentsift.

Objetivo:
Manter o projeto como portfolio publico e demonstravel: Next.js, SQLite local, mock adapters, dados sinteticos, sem banco cloud, sem LLM real e sem chaves de servicos externos.

Contexto:
- TalentSift Open e uma ferramenta assistiva de revisao de CVs.
- Ela deve ajudar a resumir, comparar e ranquear evidencias, mas nao decide contratacao, rejeicao ou entrevista.
- O demo atual registra analises e metadados de arquivos em SQLite local.
- O fluxo de parsing/IA deve continuar mockado ate haver uma razao clara para expandir.

Regras:
- Inspecione o projeto antes de editar.
- Prefira a menor mudanca segura.
- Use TypeScript estrito.
- Valide entradas em todas as fronteiras de API.
- Nunca hardcode secrets.
- Nunca use dados reais de candidatos em fixtures, screenshots ou docs.
- Nunca registre texto integral de CVs em logs.
- Nunca renderize output de modelo/mock como HTML confiavel.
- Preserve a linguagem assistiva e evite qualquer copy que pareca decisao automatizada de emprego.

Stack:
- Next.js App Router
- React
- TypeScript
- SQLite via better-sqlite3
- Zod
- Vitest
- ESLint
- Prettier

Proximas melhorias recomendadas:
1. Conectar resultados mockados ao painel de shortlist.
2. Adicionar perfis sinteticos estruturados para demonstracao.
3. Rodar ranking deterministico nos perfis mockados.
4. Adicionar comparacao lado a lado com dados sinteticos.
5. Adicionar export CSV apenas com dados estruturados.
6. Adicionar controle para limpar o banco SQLite local.
7. Validar UI em desktop e mobile.

Checks antes de finalizar:
- npm run typecheck
- npm run lint
- npm run format
- npm test
- npm run build
- npm audit

Criterios de aceite:
- O projeto roda localmente sem credenciais externas.
- README explica SQLite/mock claramente.
- Nenhum secret, banco local, log ou artefato gerado e commitado.
- A linguagem continua assistiva e privacy-first.
- Testes e build passam.
```
