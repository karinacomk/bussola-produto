export type Question =
  | { id: string; label: string; type: "text"; placeholder?: string }
  | { id: string; label: string; type: "choice"; options: string[] }
  | { id: string; label: string; type: "scale"; hint?: string };

/** Former onboarding questions — now live inside "Ponto de Partida". Kept for data migration. */
export const onboardingQuestions: Question[] = [
  { id: "profissao", label: "Qual sua profissão atual?", type: "text", placeholder: "Ex.: Desenvolvedora backend" },
  { id: "anos", label: "Quantos anos de experiência profissional possui?", type: "choice", options: ["Menos de 2", "2 a 5", "5 a 10", "Mais de 10"] },
  { id: "jaProduto", label: "Já trabalhou formalmente com Produto?", type: "choice", options: ["Não", "Indiretamente", "Sim"] },
  { id: "porque", label: "Por que deseja migrar para Produto?", type: "text" },
  { id: "gosta", label: "Quais atividades profissionais mais gosta de realizar?", type: "text" },
  { id: "evitar", label: "Quais atividades gostaria de evitar?", type: "text" },
  { id: "papel", label: "Tem interesse inicial em PM, PO, TPM ou ainda não sabe?", type: "choice", options: ["PM", "PO", "TPM", "Ainda não sei"] },
  { id: "objetivo", label: "Qual seu principal objetivo com a transição?", type: "text" },
  { id: "prazo", label: "Em quanto tempo deseja realizar essa mudança?", type: "choice", options: ["Até 3 meses", "3 a 6 meses", "6 a 12 meses", "Mais de 1 ano"] },
  { id: "familiaridade", label: "Qual sua familiaridade com discovery, estratégia, métricas, priorização e tecnologia?", type: "scale", hint: "1 = nenhuma, 5 = domino bem" },
];

export type IconName = "map-pin" | "star" | "map" | "plane" | "users" | "brain";
export type Module = {
  id: string; title: string; goal: string; icon: IconName; clock: number; questions: Question[];
};

const q = (id: string) => onboardingQuestions.find((x) => x.id === id)!;

/** Order = clockwise from 12h. `clock` is the hour position on the compass. */
export const modules: Module[] = [
  {
    id: "ponto-de-partida", clock: 12, title: "Ponto de Partida", icon: "map-pin",
    goal: "Compreender sua situação profissional atual.",
    questions: [
      q("profissao"), q("anos"), q("jaProduto"),
      { id: "experiencia", label: "Descreva brevemente sua trajetória profissional.", type: "text" },
      { id: "responsabilidades", label: "Quais são suas principais responsabilidades hoje?", type: "text" },
      q("gosta"), q("evitar"),
      { id: "transferiveis", label: "Que competências do seu trabalho atual você acredita que se transferem para Produto?", type: "text" },
      { id: "projetos", label: "Cite um projeto em que você influenciou decisões sobre um produto ou serviço.", type: "text" },
      q("familiaridade"),
    ],
  },
  {
    id: "motivacoes", clock: 2, title: "Norte", icon: "star",
    goal: "Entender o que te move e onde você quer chegar.",
    questions: [
      q("porque"), q("objetivo"),
      { id: "energia", label: "Em que tipo de trabalho você perde a noção do tempo?", type: "text" },
      { id: "valores", label: "Quais valores são inegociáveis no seu próximo ambiente?", type: "text" },
      { id: "impacto", label: "Que tipo de impacto você quer gerar?", type: "choice", options: ["No usuário final", "No negócio", "Na tecnologia", "Na sociedade"] },
    ],
  },
  {
    id: "caminhos", clock: 4, title: "Rotas Possíveis", icon: "map",
    goal: "Explorar papéis e contextos que combinam com seu perfil.",
    questions: [
      { id: "papel", label: "Qual papel parece mais alinhado hoje?", type: "choice", options: ["Product Manager", "Product Owner", "Technical PM", "Growth PM", "Ainda explorando"] },
      { id: "contexto", label: "Em que contexto você prefere atuar?", type: "choice", options: ["Startup", "Scale-up", "Grande empresa", "Consultoria"] },
      { id: "dominio", label: "Que domínio ou mercado te interessa? (ex.: saúde, finanças, educação)", type: "text" },
    ],
  },
  {
    id: "plano", clock: 6, title: "Plano de Voo", icon: "plane",
    goal: "Transformar reflexões em próximos passos concretos.",
    questions: [
      q("prazo"),
      { id: "nivelDesejado", label: "Qual nível profissional você deseja alcançar?", type: "choice", options: ["Estágio / Trainee", "Associate / Júnior", "PM / Pleno", "Senior PM", "GPM"] },
      { id: "passo30", label: "O que você fará nos próximos 30 dias?", type: "text" },
      { id: "passo90", label: "Qual marco quer atingir em 90 dias?", type: "text" },
      { id: "rota", label: "Qual estratégia de migração faz mais sentido?", type: "choice", options: ["Transição interna", "Nova empresa", "Projeto paralelo primeiro", "Ainda avaliando"] },
    ],
  },
  {
    id: "aliados", clock: 8, title: "Aliados e Terreno", icon: "users",
    goal: "Mapear pessoas, recursos e o contexto que favorecem sua transição.",
    questions: [
      { id: "apoio", label: "Quem pode te apoiar nessa jornada?", type: "text" },
      { id: "interna", label: "Sua empresa atual tem área de Produto acessível a você?", type: "choice", options: ["Sim", "Não", "Não sei"] },
      { id: "rede", label: "Você conhece pessoas que trabalham com Produto?", type: "choice", options: ["Nenhuma", "Algumas", "Muitas"] },
      { id: "horas", label: "Quantas horas por semana pode dedicar?", type: "choice", options: ["Até 2h", "2 a 5h", "5 a 10h", "Mais de 10h"] },
      { id: "formato", label: "Como você aprende melhor?", type: "choice", options: ["Prática em projetos", "Leitura", "Cursos", "Mentoria", "Comunidades"] },
    ],
  },
  {
    id: "lacunas", clock: 10, title: "Espaço Mental", icon: "brain",
    goal: "Reconhecer crenças, receios e lacunas que influenciam sua decisão.",
    questions: [
      { id: "lacunas", label: "Quais as duas maiores lacunas que você percebe?", type: "text" },
      { id: "receios", label: "O que mais te preocupa nessa mudança?", type: "text" },
      { id: "confianca", label: "Qual seu nível de confiança para fazer a transição hoje?", type: "scale", hint: "1 = muito inseguro, 5 = muito confiante" },
    ],
  },
];

/**
 * Competências usadas no diagnóstico "Descubra seu Perfil em Produto". Stored under modules.competencias.
 * As 6 primeiras alimentam o diagnóstico PM/PO/TPM (inalterado); as 8 seguintes alimentam
 * também o diagnóstico de senioridade.
 */
export const competencyQuestions: Question[] = [
  { id: "discovery", label: "Discovery e pesquisa com usuários", type: "scale" },
  { id: "estrategia", label: "Visão e estratégia de produto", type: "scale" },
  { id: "metricas", label: "Métricas e análise de dados", type: "scale" },
  { id: "priorizacao", label: "Priorização e gestão de backlog", type: "scale" },
  { id: "tecnologia", label: "Entendimento técnico", type: "scale" },
  { id: "comunicacao", label: "Comunicação e influência com stakeholders", type: "scale" },
  { id: "autonomia", label: "Autonomia e tomada de decisão", type: "scale" },
  { id: "complexidade", label: "Complexidade dos problemas resolvidos", type: "scale" },
  { id: "ambiguidade", label: "Capacidade de lidar com ambiguidades", type: "scale" },
  { id: "hipoteses", label: "Validação de hipóteses", type: "scale" },
  { id: "resultados", label: "Responsabilidade por resultados", type: "scale" },
  { id: "influencia", label: "Influência entre equipes", type: "scale" },
  { id: "lideranca", label: "Liderança e desenvolvimento de pessoas", type: "scale" },
  { id: "multiprodutos", label: "Gestão de múltiplos produtos ou áreas", type: "scale" },
];

export type Answers = Record<string, string | number>;
export type State = { welcomed: boolean; onboarding: Answers; modules: Record<string, Answers> };
const KEY = "bussola-produto-v1";
const empty: State = { welcomed: false, onboarding: {}, modules: {} };

export function isFilled(v: unknown) {
  return v !== undefined && v !== null && String(v).trim() !== "";
}

/** Copies legacy data into the new module layout without overwriting anything. */
export function migrate(raw: Partial<State> & { onboardingDone?: boolean }): State {
  const s: State = { ...empty, ...raw, modules: { ...(raw.modules ?? {}) } };
  if (raw.onboardingDone) s.welcomed = true;
  const ob = s.onboarding ?? {};
  const place: Record<string, string> = {
    profissao: "ponto-de-partida", anos: "ponto-de-partida", jaProduto: "ponto-de-partida",
    gosta: "ponto-de-partida", evitar: "ponto-de-partida", familiaridade: "ponto-de-partida",
    porque: "motivacoes", objetivo: "motivacoes", prazo: "plano",
  };
  for (const [k, mod] of Object.entries(place)) {
    const cur = s.modules[mod] ?? {};
    if (isFilled(ob[k]) && !isFilled(cur[k])) s.modules[mod] = { ...cur, [k]: ob[k]! };
  }
  // Apoio moved from Plano de Voo to Aliados e Terreno
  const apoio = s.modules["plano"]?.["apoio"];
  if (isFilled(apoio) && !isFilled(s.modules["aliados"]?.["apoio"])) s.modules["aliados"] = { ...s.modules["aliados"], apoio: apoio! };
  // Horas/formato moved from lacunas to aliados
  for (const k of ["horas", "formato"]) {
    const v = s.modules["lacunas"]?.[k];
    if (isFilled(v) && !isFilled(s.modules["aliados"]?.[k])) s.modules["aliados"] = { ...s.modules["aliados"], [k]: v! };
  }
  return s;
}

export type Status = "nao-iniciado" | "em-andamento" | "concluido";
export function progress(qs: Question[], a: Answers | undefined) {
  const n = qs.filter((x) => isFilled(a?.[x.id])).length;
  return { done: n, total: qs.length };
}
export function moduleStatus(m: Module, a: Answers | undefined): Status {
  const { done, total } = progress(m.questions, a);
  if (done === 0) return "nao-iniciado";
  return done === total ? "concluido" : "em-andamento";
}
export const statusLabel: Record<Status, string> = {
  "nao-iniciado": "Não iniciado",
  "em-andamento": "Em andamento",
  concluido: "Concluído",
};

export type RoleScore = { role: "PM" | "PO" | "TPM"; afinidade: number; prontidao: number; viabilidade: number; total: number };

/** Scores 0–100 per role from the user's answers. */
export function diagnose(s: State): RoleScore[] {
  const c = s.modules["competencias"] ?? {};
  const n = (k: string) => Number(c[k] ?? 0) / 5;
  const pp = s.modules["ponto-de-partida"] ?? {};
  const ca = s.modules["caminhos"] ?? {};
  const no = s.modules["motivacoes"] ?? {};
  const al = s.modules["aliados"] ?? {};
  const em = s.modules["lacunas"] ?? {};
  const pref = String(ca["papel"] ?? s.onboarding["papel"] ?? "");
  const impacto = String(no["impacto"] ?? "");

  const anos = ({ "Menos de 2": 0.2, "2 a 5": 0.5, "5 a 10": 0.8, "Mais de 10": 1 } as Record<string, number>)[String(pp["anos"])] ?? 0.4;
  const ja = ({ Não: 0, Indiretamente: 0.5, Sim: 1 } as Record<string, number>)[String(pp["jaProduto"])] ?? 0;
  const horas = ({ "Até 2h": 0.2, "2 a 5h": 0.5, "5 a 10h": 0.8, "Mais de 10h": 1 } as Record<string, number>)[String(al["horas"])] ?? 0.4;
  const interna = al["interna"] === "Sim" ? 1 : al["interna"] === "Não" ? 0.2 : 0.5;
  const rede = ({ Nenhuma: 0.1, Algumas: 0.6, Muitas: 1 } as Record<string, number>)[String(al["rede"])] ?? 0.3;
  const conf = Number(em["confianca"] ?? 3) / 5;
  const viab = (anos + ja + horas + interna + rede + conf) / 6;

  const roles: { role: RoleScore["role"]; w: Record<string, number>; aff: string[]; imp: string[] }[] = [
    { role: "PM", w: { discovery: 2, estrategia: 2, metricas: 2, priorizacao: 1, tecnologia: 1, comunicacao: 2 }, aff: ["PM", "Product Manager", "Growth PM"], imp: ["No negócio", "No usuário final"] },
    { role: "PO", w: { discovery: 1, estrategia: 1, metricas: 1, priorizacao: 3, tecnologia: 1, comunicacao: 2 }, aff: ["PO", "Product Owner"], imp: ["No usuário final"] },
    { role: "TPM", w: { discovery: 1, estrategia: 1, metricas: 1, priorizacao: 2, tecnologia: 3, comunicacao: 2 }, aff: ["TPM", "Technical PM"], imp: ["Na tecnologia"] },
  ];
  return roles
    .map(({ role, w, aff, imp }) => {
      const sumW = Object.values(w).reduce((a, b) => a + b, 0);
      const pront = Object.entries(w).reduce((a, [k, v]) => a + n(k) * v, 0) / sumW;
      const afin = 0.3 + (aff.includes(pref) ? 0.45 : 0) + (imp.includes(impacto) ? 0.25 : 0);
      const r = (x: number) => Math.round(Math.min(1, x) * 100);
      const total = r(afin * 0.35 + pront * 0.4 + viab * 0.25);
      return { role, afinidade: r(afin), prontidao: r(pront), viabilidade: r(viab), total };
    })
    .sort((a, b) => b.total - a.total);
}

