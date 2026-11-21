# Evolução da Bússola de Produto

Evolução incremental do app existente, sem recriar nada: preserva bússola circular, seis módulos, perguntas, resultados PM/PO/TPM e identidade visual. Tudo continua 100% em `localStorage` — sem banco de dados, login ou cadastro.

## Fase 1 — Armazenamento versionado e múltiplas avaliações
- Nova estrutura v2 em `localStorage`: avaliação em andamento + lista de avaliações concluídas (cada uma com id único, datas de início/conclusão, respostas, resultados PM/PO/TPM, diagnóstico de senioridade, plano de ação e progresso).
- Migração automática dos dados atuais (v1) para a nova estrutura, sem perder respostas.
- "Exportar meus dados" (JSON), "Importar meus dados" (com validação de estrutura/versão e confirmação) e "Apagar meus dados deste navegador" (com confirmação explícita).
- Aviso discreto de que os dados ficam no navegador e o isolamento é por navegador/perfil.

## Fase 2 — Página inicial adaptativa e "Refazer minha Bússola"
- Primeiro acesso: boas-vindas + "Começar minha Bússola".
- Em andamento: "Continuar minha Bússola" + indicador de progresso.
- Concluída: resumo do último resultado + "Ver meu resultado", "Refazer minha Bússola", "Minha Evolução", "Continuar meu Plano de Voo".
- "Refazer minha Bússola" (na home e na página de resultados) abre duas opções: "Começar nova avaliação" (em branco, preservando anteriores) ou "Revisar minhas respostas" (carrega a última avaliação, permite editar e salva como nova avaliação).

## Fase 3 — Minha Evolução
- Nova página `/evolucao`: histórico de avaliações por data, com respostas, PM/PO/TPM (afinidade, prontidão, viabilidade), competências, senioridade e plano correspondente.
- Comparação lado a lado de duas avaliações.
- Gráficos de evolução (SVG simples, sem biblioteca nova) para as 6 competências, prontidão e afinidade; destaques de melhoria/estabilidade com cautela para diferenças pequenas.

## Fase 4 — Diagnóstico de senioridade
- Matriz de competências ampliada (14 competências: as 6 atuais + autonomia, complexidade, ambiguidade, validação de hipóteses, responsabilidade por resultados, influência entre equipes, liderança de pessoas, múltiplos produtos).
- Perguntas comportamentais/situacionais novas (evidências de senioridade) adicionadas ao diagnóstico, reaproveitando respostas existentes; sem inferir o que o usuário não declarou — "Evidências insuficientes" quando faltar informação.
- Algoritmo separado do atual (PM/PO/TPM preservado intacto): prontidão para Estágio/Trainee, Associate/Júnior, PM/Pleno, Senior PM e GPM, com regras explícitas (não classificar como iniciante só por falta de título; não elevar senioridade só por tempo de carreira; valorizar competências transferíveis).
- Nova seção "Meu Nível de Prontidão em Produto" nos resultados + opção "Como meu resultado foi calculado?" explicando a metodologia em linguagem acessível.

## Fase 5 — Plano de Voo personalizado
- Plano de ação gerado a partir de: carreira desejada, nível de prontidão, nível desejado, competências demonstradas, lacunas, horas semanais, estratégia de transição e objetivos de 30/90 dias.
- Cada plano fica associado à sua avaliação; planos anteriores preservados.

## Fase 6 — Documentação e validação (obrigatória antes de concluir)
- Documento completo da metodologia de senioridade: matriz, critérios observáveis, pesos e justificativas, regras de cálculo, tratamento de ausências, limitações conhecidas.
- Testes automatizados (vitest) com os 6 perfis fictícios exigidos (estudante, transição, dev experiente, PM autônomo, Senior PM, GPM) + testes das regras de armazenamento, exportação/importação e regressão do diagnóstico PM/PO/TPM.
- **Apresento a metodologia e os resultados dos testes para sua revisão antes de declarar a implementação concluída.**

## Notas técnicas
- Arquivos novos: `src/lib/store.ts` (storage v2), `src/lib/seniority.ts` (matriz + algoritmo), `src/lib/plano.ts` (gerador de plano), `src/routes/evolucao.tsx`, `src/routes/metodologia.tsx`; ajustes em `compass.ts`, `index.tsx`, `diagnostico.tsx`, `resumo.tsx`.
- Sem novas dependências; gráficos em SVG; testes com o vitest já existente.
- Ordem de entrega: fases 1–3 primeiro (funcional), depois 4–5, e por fim a documentação para sua validação.
