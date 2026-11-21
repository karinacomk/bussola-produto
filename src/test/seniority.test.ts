import { describe, expect, it } from "vitest";
import { diagnose } from "@/lib/compass";
import { diagnoseSeniority, type LevelId } from "@/lib/seniority";
import type { Answers } from "@/lib/compass";

type Mods = Record<string, Answers>;

const ev = (decisoes: string, escopo: string, lideranca: string, hipoteses: string, resultados: string): Answers => ({
  decisoes,
  escopo,
  liderancaPessoas: lideranca,
  hipotesesExp: hipoteses,
  resultadosExp: resultados,
});

const comps = (v: Record<string, number>): Answers => ({ ...v });

const scoreOf = (m: Mods, level: LevelId) => diagnoseSeniority(m).levels.find((l) => l.level === level)!.score;

describe("Diagnóstico de senioridade — perfis fictícios", () => {
  it("estudante sem experiência: pronto para estágio, longe de senior/GPM", () => {
    const m: Mods = {
      "ponto-de-partida": { anos: "Menos de 2", jaProduto: "Não" },
      competencias: comps({ discovery: 1, estrategia: 1, metricas: 1, priorizacao: 1, tecnologia: 2, comunicacao: 2, autonomia: 1, complexidade: 1, ambiguidade: 1, hipoteses: 1, resultados: 1, influencia: 1, lideranca: 1, multiprodutos: 1 }),
      evidencias: ev("Nunca", "Tarefas delimitadas", "Não", "Não", "Não"),
    };
    const r = diagnoseSeniority(m);
    expect(r.insuficiente).toBe(false);
    expect(r.candidaturas).toContain("estagio");
    expect(r.candidaturas).not.toContain("senior");
    expect(r.candidaturas).not.toContain("gpm");
    expect(scoreOf(m, "gpm")).toBeLessThanOrEqual(35);
  });

  it("profissional de outra área em transição: não vira iniciante só por falta de título, nem sênior só por tempo", () => {
    const m: Mods = {
      "ponto-de-partida": { anos: "5 a 10", jaProduto: "Não" },
      competencias: comps({ discovery: 3, estrategia: 3, metricas: 3, priorizacao: 3, tecnologia: 3, comunicacao: 4, autonomia: 3, complexidade: 3, ambiguidade: 3, hipoteses: 2, resultados: 3, influencia: 3, lideranca: 2, multiprodutos: 1 }),
      evidencias: ev("Decisões pontuais", "Projetos ou iniciativas", "Informalmente (mentorias, apoio)", "Com orientação", "Contribuí para o resultado"),
    };
    const r = diagnoseSeniority(m);
    // Competências transferíveis contam: supera o nível de estágio.
    expect(r.candidaturas.some((l) => l === "apm" || l === "estagio")).toBe(true);
    expect(scoreOf(m, "apm")).toBeGreaterThanOrEqual(55);
    // Mas sem evidências de decisões relevantes/resultados, não alcança pleno nem sênior.
    expect(scoreOf(m, "pleno")).toBeLessThanOrEqual(50);
    expect(scoreOf(m, "senior")).toBeLessThanOrEqual(45);
    expect(r.candidaturas).not.toContain("gpm");
  });

  it("desenvolvedor experiente com competências transferíveis: pronto para pleno, não para GPM", () => {
    const m: Mods = {
      "ponto-de-partida": { anos: "Mais de 10", jaProduto: "Indiretamente" },
      competencias: comps({ discovery: 3, estrategia: 3, metricas: 4, priorizacao: 4, tecnologia: 5, comunicacao: 4, autonomia: 4, complexidade: 4, ambiguidade: 4, hipoteses: 4, resultados: 4, influencia: 3, lideranca: 2, multiprodutos: 1 }),
      evidencias: ev("Decisões relevantes", "Um produto ou área", "Informalmente (mentorias, apoio)", "De forma autônoma", "Fui responsável por uma métrica"),
    };
    const r = diagnoseSeniority(m);
    expect(r.candidaturas).toContain("pleno");
    expect(r.bestLevel).toBe("pleno");
    expect(scoreOf(m, "gpm")).toBeLessThanOrEqual(35); // sem liderança de pessoas nem múltiplos produtos
  });

  it("PM com experiência autônoma em um produto: melhor evidência em pleno", () => {
    const m: Mods = {
      "ponto-de-partida": { anos: "5 a 10", jaProduto: "Sim" },
      competencias: comps({ discovery: 4, estrategia: 4, metricas: 4, priorizacao: 4, tecnologia: 3, comunicacao: 4, autonomia: 4, complexidade: 3, ambiguidade: 3, hipoteses: 4, resultados: 4, influencia: 3, lideranca: 2, multiprodutos: 1 }),
      evidencias: ev("Decisões relevantes", "Um produto ou área", "Informalmente (mentorias, apoio)", "De forma autônoma", "Fui responsável por uma métrica"),
    };
    const r = diagnoseSeniority(m);
    expect(r.bestLevel).toBe("pleno");
    expect(r.candidaturas).not.toContain("gpm");
  });

  it("Senior PM com responsabilidade estratégica: melhor evidência em senior", () => {
    const m: Mods = {
      "ponto-de-partida": { anos: "Mais de 10", jaProduto: "Sim" },
      competencias: comps({ discovery: 4, estrategia: 5, metricas: 4, priorizacao: 4, tecnologia: 3, comunicacao: 5, autonomia: 5, complexidade: 5, ambiguidade: 5, hipoteses: 4, resultados: 5, influencia: 4, lideranca: 2, multiprodutos: 2 }),
      evidencias: ev("Decisões estratégicas", "Um produto ou área", "Informalmente (mentorias, apoio)", "Defini processos de validação", "Respondi por resultados de uma área"),
    };
    const r = diagnoseSeniority(m);
    expect(r.bestLevel).toBe("senior");
    expect(r.candidaturas).toContain("pleno");
    expect(scoreOf(m, "gpm")).toBeLessThanOrEqual(35);
  });

  it("GPM com liderança de PMs e múltiplos produtos: melhor evidência em GPM", () => {
    const m: Mods = {
      "ponto-de-partida": { anos: "Mais de 10", jaProduto: "Sim" },
      competencias: comps({ discovery: 4, estrategia: 5, metricas: 4, priorizacao: 4, tecnologia: 3, comunicacao: 5, autonomia: 5, complexidade: 5, ambiguidade: 4, hipoteses: 4, resultados: 5, influencia: 5, lideranca: 5, multiprodutos: 5 }),
      evidencias: ev("Decisões estratégicas", "Múltiplos produtos ou equipes", "Sim, outras lideranças ou PMs", "Defini processos de validação", "Respondi por resultados de uma área"),
    };
    const r = diagnoseSeniority(m);
    expect(r.bestLevel).toBe("gpm");
  });
});

describe("Diagnóstico de senioridade — regras", () => {
  it("tempo de carreira sozinho não eleva senioridade", () => {
    const m: Mods = {
      "ponto-de-partida": { anos: "Mais de 10", jaProduto: "Não" },
      competencias: comps({ discovery: 1, estrategia: 1, metricas: 1, priorizacao: 1, tecnologia: 1, comunicacao: 1, autonomia: 1, complexidade: 1, ambiguidade: 1, hipoteses: 1, resultados: 1, influencia: 1, lideranca: 1, multiprodutos: 1 }),
      evidencias: ev("Nunca", "Tarefas delimitadas", "Não", "Não", "Não"),
    };
    const r = diagnoseSeniority(m);
    expect(r.candidaturas).not.toContain("pleno");
    expect(r.candidaturas).not.toContain("senior");
    expect(r.candidaturas).not.toContain("gpm");
  });

  it("sem respostas suficientes, reporta evidências insuficientes", () => {
    const r = diagnoseSeniority({});
    expect(r.insuficiente).toBe(true);
    expect(r.bestLevel).toBeNull();
    expect(r.faltam.length).toBeGreaterThan(0);
  });

  it("GPM exige liderança de pessoas: sem ela, o teto é 35", () => {
    const m: Mods = {
      competencias: comps({ estrategia: 5, influencia: 5, resultados: 5, comunicacao: 5, lideranca: 1, multiprodutos: 5 }),
      evidencias: ev("Decisões estratégicas", "Múltiplos produtos ou equipes", "Não", "Defini processos de validação", "Respondi por resultados de uma área"),
    };
    expect(scoreOf(m, "gpm")).toBeLessThanOrEqual(35);
  });
});

describe("Regressão — diagnóstico PM/PO/TPM permanece estável", () => {
  it("produz os mesmos totais para uma entrada fixa", () => {
    const m: Mods = {
      "ponto-de-partida": { anos: "5 a 10", jaProduto: "Indiretamente" },
      caminhos: { papel: "Product Manager" },
      motivacoes: { impacto: "No negócio" },
      aliados: { horas: "5 a 10h", interna: "Sim", rede: "Algumas" },
      lacunas: { confianca: 4 },
      competencias: comps({ discovery: 4, estrategia: 3, metricas: 3, priorizacao: 2, tecnologia: 2, comunicacao: 4 }),
    };
    const scores = diagnose({ welcomed: true, onboarding: {}, modules: m });
    expect(scores.map((s) => s.role)).toEqual(["PM", "PO", "TPM"]);
    expect(scores.map((s) => s.total)).toEqual([73, 63, 59]);
  });
});
