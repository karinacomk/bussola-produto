import type { Answers } from "./compass";
import { competencies, diagnoseSeniority, levels, levelLabel, type LevelId, type SeniorityResult } from "./seniority";

export type PlanAction = { id: string; title: string; detail: string; competency?: string };

export type ActionPlan = {
  targetLevel: LevelId;
  targetLabel: string;
  actions: PlanAction[];
  horas: string;
  estrategia: string;
  geradoEm: string;
};

/** Catálogo de ações concretas por competência em desenvolvimento. */
const actionCatalog: Record<string, { title: string; detail: string }> = {
  discovery: {
    title: "Praticar discovery com usuários",
    detail: "Conduza 5 entrevistas com usuários de um produto real (pode ser voluntário ou projeto paralelo) e registre os aprendizados.",
  },
  estrategia: {
    title: "Construir uma visão de produto",
    detail: "Escreva uma visão e estratégia de uma página para um produto que você conhece bem, com objetivos e métricas de sucesso.",
  },
  metricas: {
    title: "Trabalhar com métricas",
    detail: "Escolha um produto, defina 3 métricas-chave (ex.: ativação, retenção, conversão) e acompanhe-as semanalmente por um mês.",
  },
  priorizacao: {
    title: "Priorizar um backlog real",
    detail: "Monte um backlog com 10 itens e priorize usando um método explícito (ex.: RICE ou valor vs. esforço), justificando cada decisão.",
  },
  tecnologia: {
    title: "Aproximar-se da tecnologia",
    detail: "Converse semanalmente com uma pessoa de engenharia sobre como o produto é construído e participe de uma cerimônia técnica.",
  },
  comunicacao: {
    title: "Exercitar comunicação com stakeholders",
    detail: "Apresente uma proposta de melhoria de produto para 3 pessoas de áreas diferentes e colete feedback sobre sua clareza.",
  },
  autonomia: {
    title: "Assumir uma decisão de ponta a ponta",
    detail: "Escolha um problema pequeno e conduza sozinho(a) todo o ciclo: investigar, decidir, executar e avaliar o resultado.",
  },
  complexidade: {
    title: "Atacar um problema mais complexo",
    detail: "Busque um problema que envolva mais de uma área ou restrições conflitantes e documente como você o decompôs.",
  },
  ambiguidade: {
    title: "Praticar com ambiguidade",
    detail: "Pegue um problema mal definido e transforme-o em uma lista de hipóteses e próximos passos claros em até duas semanas.",
  },
  hipoteses: {
    title: "Validar hipóteses antes de construir",
    detail: "Antes da próxima solução, escreva as hipóteses, defina como validá-las e execute pelo menos uma validação (teste, protótipo ou pesquisa).",
  },
  resultados: {
    title: "Assumir responsabilidade por um resultado",
    detail: "Comprometa-se publicamente com uma métrica ou resultado e reporte o progresso quinzenalmente para alguém.",
  },
  influencia: {
    title: "Influenciar sem autoridade formal",
    detail: "Convença uma equipe que não reporta a você a adotar uma proposta sua, usando dados e escuta ativa.",
  },
  lideranca: {
    title: "Desenvolver outras pessoas",
    detail: "Mentore uma pessoa mais júnior por 3 meses com encontros quinzenais e objetivos de desenvolvimento combinados.",
  },
  multiprodutos: {
    title: "Ampliar o escopo de atuação",
    detail: "Busque participar de iniciativas de um segundo produto ou área para praticar priorização entre contextos diferentes.",
  },
};

const horasToActions: Record<string, number> = { "Até 2h": 2, "2 a 5h": 3, "5 a 10h": 4, "Mais de 10h": 5 };

/**
 * Gera o Plano de Voo personalizado a partir das respostas e do diagnóstico de senioridade.
 * Alvo: nível desejado declarado no módulo Plano de Voo, ou o próximo nível acima do melhor evidenciado.
 */
export function generatePlan(modules: Record<string, Answers>, seniority: SeniorityResult): ActionPlan {
  const plano = modules["plano"] ?? {};
  const aliados = modules["aliados"] ?? {};

  const order: LevelId[] = ["estagio", "apm", "pleno", "senior", "gpm"];
  const desejado = String(plano["nivelDesejado"] ?? "");
  const declared = levels.find((l) => l.short === desejado || l.label === desejado)?.id;
  const nextUp = seniority.bestLevel ? order[Math.min(order.indexOf(seniority.bestLevel) + 1, order.length - 1)] : "apm";
  const targetLevel: LevelId = declared ?? nextUp!;

  const comps = modules["competencias"] ?? {};
  const score = (id: string) => Number(comps[id] ?? 0) / 5;

  // Lacunas: competências do nível-alvo com autoavaliação baixa ou sem resposta.
  const targetWeights = targetLevel === "estagio" ? ["discovery", "metricas", "comunicacao"] : null;
  const gapIds = seniority.gaps.length > 0 ? seniority.gaps : competencies.filter((c) => score(c.id) < 0.6).map((c) => c.id);
  const relevant = targetWeights ? gapIds.filter((g) => targetWeights.includes(g)).concat(gapIds.filter((g) => !targetWeights.includes(g))) : gapIds;

  const maxActions = horasToActions[String(aliados["horas"])] ?? 3;
  const actions: PlanAction[] = relevant.slice(0, maxActions).map((id) => ({
    id: `acao-${id}`,
    competency: id,
    title: actionCatalog[id]?.title ?? `Desenvolver: ${id}`,
    detail: actionCatalog[id]?.detail ?? "Defina uma ação concreta e mensurável para desenvolver esta competência.",
  }));

  const passo30 = String(plano["passo30"] ?? "").trim();
  const passo90 = String(plano["passo90"] ?? "").trim();
  if (passo30) actions.unshift({ id: "acao-passo30", title: "Seu compromisso de 30 dias", detail: passo30 });
  if (passo90) actions.push({ id: "acao-passo90", title: "Seu marco de 90 dias", detail: passo90 });

  return {
    targetLevel,
    targetLabel: levelLabel(targetLevel),
    actions,
    horas: String(aliados["horas"] ?? "não informado"),
    estrategia: String(plano["rota"] ?? "não informada"),
    geradoEm: new Date().toISOString(),
  };
}

export { diagnoseSeniority };
