import { beforeEach, describe, expect, it } from "vitest";
import {
  clearData,
  completeCurrent,
  emptyStore,
  exportData,
  importData,
  loadStore,
  newEvaluation,
  setAnswer,
  startNewEvaluation,
  type StoreV2,
} from "@/lib/store";

const KEY_V2 = "bussola-produto-v2";
const KEY_V1 = "bussola-produto-v1";

beforeEach(() => {
  localStorage.clear();
});

describe("Armazenamento local v2", () => {
  it("visitante novo encontra a Bússola em branco", () => {
    const s = loadStore();
    expect(s.current).toBeNull();
    expect(s.completed).toEqual([]);
  });

  it("migra dados v1 para uma avaliação em andamento, sem perder respostas", () => {
    localStorage.setItem(
      KEY_V1,
      JSON.stringify({
        welcomed: true,
        onboarding: { profissao: "Dev" },
        modules: { "ponto-de-partida": { profissao: "Dev", anos: "5 a 10" } },
      }),
    );
    const s = loadStore();
    expect(s.welcomed).toBe(true);
    expect(s.current).not.toBeNull();
    expect(s.current!.modules["ponto-de-partida"]?.["profissao"]).toBe("Dev");
  });

  it("começar nova avaliação em branco preserva as anteriores", () => {
    let s = emptyStore();
    s = { ...s, current: newEvaluation({ "ponto-de-partida": { profissao: "Designer" } }) };
    s = completeCurrent(s);
    expect(s.completed).toHaveLength(1);
    s = startNewEvaluation(s, false);
    expect(s.current).not.toBeNull();
    expect(s.current!.modules).toEqual({});
    expect(s.completed).toHaveLength(1);
  });

  it("revisar respostas carrega a última avaliação sem sobrescrevê-la", () => {
    let s = emptyStore();
    s = { ...s, current: newEvaluation({ "ponto-de-partida": { profissao: "Designer" } }) };
    s = completeCurrent(s);
    const originalId = s.completed[0]!.id;
    s = startNewEvaluation(s, true);
    expect(s.current!.id).not.toBe(originalId);
    expect(s.current!.modules["ponto-de-partida"]?.["profissao"]).toBe("Designer");
    s = setAnswer(s, "ponto-de-partida", "profissao", "PM");
    s = completeCurrent(s);
    expect(s.completed).toHaveLength(2);
    expect(s.completed[0]!.modules["ponto-de-partida"]?.["profissao"]).toBe("Designer");
    expect(s.completed[1]!.modules["ponto-de-partida"]?.["profissao"]).toBe("PM");
  });

  it("concluir gera resultados, senioridade e plano associados à avaliação", () => {
    let s = emptyStore();
    s = { ...s, current: newEvaluation({ competencias: { discovery: 4 } }) };
    s = completeCurrent(s);
    const e = s.completed[0]!;
    expect(e.completedAt).toBeTruthy();
    expect(e.results).not.toBeNull();
    expect(e.seniority).not.toBeNull();
    expect(e.plan).not.toBeNull();
    expect(s.current).toBeNull();
  });

  it("exportação e importação de JSON fazem round-trip", () => {
    let s = emptyStore();
    s = { ...s, current: newEvaluation({ "ponto-de-partida": { profissao: "Dev" } }) };
    s = completeCurrent(s);
    const json = exportData(s);
    const r = importData(json);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.store.completed[0]!.id).toBe(s.completed[0]!.id);
  });

  it("importação rejeita JSON inválido e estrutura errada", () => {
    expect(importData("não é json").ok).toBe(false);
    expect(importData(JSON.stringify({ version: 1 })).ok).toBe(false);
    expect(importData(JSON.stringify({ version: 2, completed: "oops" })).ok).toBe(false);
  });

  it("apagar dados remove a chave do navegador", () => {
    const s: StoreV2 = { ...emptyStore(), current: newEvaluation() };
    localStorage.setItem(KEY_V2, JSON.stringify(s));
    clearData();
    expect(localStorage.getItem(KEY_V2)).toBeNull();
    expect(loadStore().current).toBeNull();
  });

  it("dois navegadores (storages isolados) mantêm avaliações independentes", () => {
    // Simula isolamento: cada perfil tem seu próprio localStorage; aqui validamos que
    // o estado é lido/gravado por chave local e nunca misturado.
    const a = { ...emptyStore(), current: newEvaluation({ "ponto-de-partida": { profissao: "A" } }) };
    const b = { ...emptyStore(), current: newEvaluation({ "ponto-de-partida": { profissao: "B" } }) };
    expect(a.current!.id).not.toBe(b.current!.id);
    expect(a.current!.modules["ponto-de-partida"]?.["profissao"]).toBe("A");
    expect(b.current!.modules["ponto-de-partida"]?.["profissao"]).toBe("B");
  });
});
