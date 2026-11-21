import type { Answers, Question } from "./compass";

/**
 * Diagnóstico de prontidão por nível de senioridade em Produto.
 * Metodologia separada do diagnóstico de afinidade PM/PO/TPM (que permanece intacto).
 * Heurística orientativa — não é certificação nem previsão de contratação.
 */

export type LevelId = "estagio" | "apm" | "pleno" | "senior" | "gpm";

export const levels: { id: LevelId; label: string; short: string; desc: string }[] = [
  {
    id: "estagio",
    label: "Estagiário(a) / Trainee de Produto",
    short: "Estágio / Trainee",
    desc: "Aprendizagem supervisionada, participação em atividades delimitadas e desenvolvimento inicial de competências.",
  },
  {
    id: "apm",
    label: "Associate Product Manager / PM Júnior",
    short: "Associate / Júnior",
    desc: "Participação em discovery, métricas, priorização e pequenas iniciativas, geralmente com orientação.",
  },
  {
    id: "pleno",
    label: "Product Manager / Pleno",
    short: "PM / Pleno",
    desc: "Autonomia para conduzir problemas de produto, investigar oportunidades, priorizar soluções e acompanhar resultados.",
  },
  {
    id: "senior",
    label: "Senior Product Manager",
    short: "Senior PM",
    desc: "Atuação estratégica em problemas complexos, influência entre áreas, gestão de ambiguidades e responsabilidade por resultados relevantes.",
  },
  {
    id: "gpm",
    label: "Group Product Manager",
    short: "GPM",
    desc: "Liderança e desenvolvimento de PMs, coordenação de múltiplos produtos e responsabilidade estratégica por uma área.",
  },
];

/** As 14 competências da matriz. As 6 primeiras reutilizam as respostas já existentes do diagnóstico. */
export const competencies: { id: string; label: string }[] = [
  { id: "discovery", label: "Discovery e pesquisa com usuários" },
  { id: "estrategia", label: "Visão e estratégia de produto" },
  { id: "metricas", label: "Métricas e análise de dados" },
  { id: "priorizacao", label: "Priorização e gestão de backlog" },
  { id: "tecnologia", label: "Entendimento técnico" },
  { id: "comunicacao", label: "Comunicação e influência com stakeholders" },
  { id: "autonomia", label: "Autonomia e tomada de decisão" },
  { id: "complexidade", label: "Complexidade dos problemas resolvidos" },
  { id: "ambiguidade", label: "Capacidade de lidar com ambiguidades" },
  { id: "hipoteses", label: "Validação de hipóteses" },
  { id: "resultados", label: "Responsabilidade por resultados" },
  { id: "influencia", label: "Influência entre equipes" },
  { id: "lideranca", label: "Liderança e desenvolvimento de pessoas" },
  { id: "multiprodutos", label: "Gestão de múltiplos produtos ou áreas" },
];

/** Perguntas comportamentais/situacionais — evidências de senioridade declaradas pelo usuário. */
export const evidenceQuestions: Question[] = [
  {
    id: "decisoes",
    label: "Você já influenciou decisões sobre um produto ou serviço?",
    type: "choice",
    options: ["Nunca", "Decisões pontuais", "Decisões relevantes", "Decisões estratégicas"],
  },
  {
    id: "escopo",
    label: "Qual foi o maior escopo de responsabilidade que você já exerceu?",
    type: "choice",
    options: ["Tarefas delimitadas", "Projetos ou iniciativas", "Um produto ou área", "Múltiplos produtos ou equipes"],
  },
  {
    id: "liderancaPessoas",
    label: "Você já liderou ou desenvolveu outras pessoas?",
    type: "choice",
    options: ["Não", "Informalmente (mentorias, apoio)", "Sim, uma equipe", "Sim, outras lideranças ou PMs"],
  },
  {
    id: "hipotesesExp",
    label: "Você já validou hipóteses antes de construir uma solução?",
    type: "choice",
    options: ["Não", "Com orientação", "De forma autônoma", "Defini processos de validação"],
  },
  {
    id: "resultadosExp",
    label: "Você já foi responsável direto por uma métrica ou resultado de negócio?",
    type: "choice",
    options: ["Não", "Contribuí para o resultado", "Fui responsável por uma métrica", "Respondi por resultados de uma área"],
  },
];

const tier = (v: unknown, options: string[]): number => {
  const i = options.indexOf(String(v ?? ""));
  return i < 0 ? -1 : i / (options.length - 1); // -1 = não respondido
};

/** Pesos de cada competência por nível. Justificativa na página "Como meu resultado foi calculado?". */
const matrix: Record<LevelId, Record<string, number>> = {
  estagio: { discovery: 1, metricas: 1, comunicacao: 1, tecnologia: 1, hipoteses: 1 },
  apm: { discovery: 2, metricas: 2, priorizacao: 2, comunicacao: 2, hipoteses: 1, autonomia: 1, tecnologia: 1 },
  pleno: { discovery: 2, estrategia: 2, metricas: 2, priorizacao: 2, comunicacao: 2, autonomia: 2, hipoteses: 2, resultados: 2, tecnologia: 1 },
  senior: { estrategia: 3, complexidade: 2, ambiguidade: 2, influencia: 2, resultados: 2, comunicacao: 2, autonomia: 2, discovery: 1, metricas: 1 },
  gpm: { lideranca: 3, multiprodutos: 3, estrategia: 2, influencia: 2, resultados: 2, comunicacao: 1 },
};

/**
 * Tetos de evidência comportamental: sem evidência declarada compatível, o nível é limitado.
 * Isso impede que autoavaliações otimistas ou tempo de carreira elevem a senioridade sozinhos.
 */
function capFor(level: LevelId, ev: Record<string, number>): number {
  const v = (k: string) => ev[k] ?? 0;
  switch (level) {
    case "estagio":
    case "apm":
      return 100;
    case "pleno":
      // Exige autonomia demonstrada: decisões relevantes+ ou responsabilidade por métrica.
      return v("decisoes") >= 0.66 || v("resultadosExp") >= 0.66 ? 100 : 50;
    case "senior":
      // Exige decisões relevantes+ E responsabilidade por resultado, ou escopo de produto/área.
      return (v("decisoes") >= 0.66 && v("resultadosExp") >= 0.66) || v("escopo") >= 0.66 ? 100 : 45;
    case "gpm":
      // GPM é função de liderança: exige liderança de pessoas e escopo de múltiplos produtos/equipes.
      if (v("liderancaPessoas") >= 0.66 && v("escopo") >= 1) return 100;
      if (v("liderancaPessoas") >= 0.66 && v("escopo") >= 0.66) return 60;
      return 35;
  }
}

export type LevelScore = { level: LevelId; score: number; coverage: number; capApplied: boolean };

export type SeniorityResult = {
  levels: LevelScore[];
  /** Nível mais alto com evidência suficiente (score ≥ 55 e cobertura ≥ 50%). */
  bestLevel: LevelId | null;
  /** Níveis que podem ser considerados em candidaturas. */
  candidaturas: LevelId[];
  strengths: string[];
  gaps: string[];
  /** Verdadeiro quando faltam respostas para um diagnóstico confiável. */
  insuficiente: boolean;
  faltam: string[];
  computedAt: string;
};

const anosBonus: Record<string, number> = { "Menos de 2": 0, "2 a 5": 1, "5 a 10": 3, "Mais de 10": 5 };

export function diagnoseSeniority(modules: Record<string, Answers>): SeniorityResult {
  const comps = modules["competencias"] ?? {};
  const ev = modules["evidencias"] ?? {};
  const pp = modules["ponto-de-partida"] ?? {};

  const compScore: Record<string, number> = {};
  const compAnswered: Record<string, boolean> = {};
  for (const c of competencies) {
    const v = Number(comps[c.id] ?? 0);
    compAnswered[c.id] = v >= 1 && v <= 5;
    compScore[c.id] = compAnswered[c.id] ? v / 5 : 0;
  }

  const evNum: Record<string, number> = {};
  let evAnswered = 0;
  for (const q of evidenceQuestions) {
    if (q.type !== "choice") continue;
    const t = tier(ev[q.id], q.options);
    evNum[q.id] = Math.max(0, t);
    if (t >= 0) evAnswered++;
  }

  const levelScores: LevelScore[] = levels.map(({ id }) => {
    const w = matrix[id];
    const totalW = Object.values(w).reduce((a, b) => a + b, 0);
    let sum = 0;
    let covW = 0;
    for (const [c, weight] of Object.entries(w)) {
      sum += (compScore[c] ?? 0) * weight;
      if (compAnswered[c]) covW += weight;
    }
    const coverage = covW / totalW;
    const readiness = sum / totalW;
    const cap = capFor(id, evNum);
    // Bônus pequeno por experiência (máx. 5 pontos): nunca determina o nível sozinho.
    const bonus = anosBonus[String(pp["anos"])] ?? 0;
    const raw = Math.round(Math.min(1, readiness) * 100) + bonus;
    return { level: id, score: Math.min(raw, cap), coverage, capApplied: raw > cap };
  });

  const order: LevelId[] = ["estagio", "apm", "pleno", "senior", "gpm"];
  const candidaturas = levelScores.filter((l) => l.score >= 55 && l.coverage >= 0.5).map((l) => l.level);
  const bestLevel = [...order].reverse().find((id) => candidaturas.includes(id)) ?? null;

  const strengths = competencies.filter((c) => compAnswered[c.id] && (compScore[c.id] ?? 0) >= 0.8).map((c) => c.id);
  const gaps = competencies.filter((c) => compAnswered[c.id] && (compScore[c.id] ?? 0) < 0.6).map((c) => c.id);

  const compCoverage = competencies.filter((c) => compAnswered[c.id]).length / competencies.length;
  const insuficiente = compCoverage < 0.5 || evAnswered < 3;
  const faltam: string[] = [];
  if (compCoverage < 0.5) {
    const missing = competencies.filter((c) => !compAnswered[c.id]).map((c) => c.label);
    faltam.push(`Autoavaliação das competências: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}`);
  }
  if (evAnswered < 3) faltam.push("Perguntas de evidências (decisões, escopo, liderança, hipóteses, resultados)");

  return {
    levels: levelScores,
    bestLevel,
    candidaturas,
    strengths,
    gaps,
    insuficiente,
    faltam,
    computedAt: new Date().toISOString(),
  };
}

export function levelLabel(id: LevelId): string {
  return levels.find((l) => l.id === id)?.short ?? id;
}

export function competencyLabel(id: string): string {
  return competencies.find((c) => c.id === id)?.label ?? id;
}
