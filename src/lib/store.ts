import { useCallback, useEffect, useState } from "react";
import { diagnose, isFilled, migrate as migrateV1, modules, moduleStatus, type Answers, type RoleScore } from "./compass";
import { diagnoseSeniority, type SeniorityResult } from "./seniority";
import { generatePlan, type ActionPlan } from "./plano";

/**
 * Armazenamento local versionado (v2). Exclusivamente localStorage:
 * cada navegador/perfil mantém suas próprias avaliações; nada é compartilhado.
 */

export type Evaluation = {
  id: string;
  startedAt: string;
  completedAt: string | null;
  modules: Record<string, Answers>;
  results: RoleScore[] | null;
  seniority: SeniorityResult | null;
  plan: ActionPlan | null;
  planProgress: Record<string, boolean>;
};

export type StoreV2 = {
  version: 2;
  welcomed: boolean;
  current: Evaluation | null;
  completed: Evaluation[];
};

const KEY_V2 = "bussola-produto-v2";
const KEY_V1 = "bussola-produto-v1";

export function emptyStore(): StoreV2 {
  return { version: 2, welcomed: false, current: null, completed: [] };
}

export function newEvaluation(seed: Record<string, Answers> = {}): Evaluation {
  return {
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    modules: seed,
    results: null,
    seniority: null,
    plan: null,
    planProgress: {},
  };
}

function isEvaluation(x: unknown): x is Evaluation {
  if (typeof x !== "object" || x === null) return false;
  const e = x as Record<string, unknown>;
  return typeof e["id"] === "string" && typeof e["startedAt"] === "string" && typeof e["modules"] === "object" && e["modules"] !== null;
}

function isStoreV2(x: unknown): x is StoreV2 {
  if (typeof x !== "object" || x === null) return false;
  const s = x as Record<string, unknown>;
  return s["version"] === 2 && Array.isArray(s["completed"]) && (s["completed"] as unknown[]).every(isEvaluation) && (s["current"] === null || isEvaluation(s["current"]));
}

/** Migra os dados v1 (estrutura antiga) para uma avaliação em andamento na v2. */
function migrateFromV1(): StoreV2 | null {
  const raw = localStorage.getItem(KEY_V1);
  if (!raw) return null;
  try {
    const old = migrateV1(JSON.parse(raw));
    const store = emptyStore();
    store.welcomed = old.welcomed;
    const hasAnswers = Object.values(old.modules).some((m) => Object.values(m).some(isFilled));
    if (hasAnswers) store.current = newEvaluation(old.modules);
    return store;
  } catch {
    return null;
  }
}

export function loadStore(): StoreV2 {
  try {
    const raw = localStorage.getItem(KEY_V2);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isStoreV2(parsed)) return parsed;
    }
    return migrateFromV1() ?? emptyStore();
  } catch {
    return emptyStore();
  }
}

export function saveStore(s: StoreV2) {
  localStorage.setItem(KEY_V2, JSON.stringify(s));
}

/** Garante que existe uma avaliação em andamento. */
export function ensureCurrent(s: StoreV2): StoreV2 {
  return s.current ? s : { ...s, current: newEvaluation() };
}

/** Registra uma resposta na avaliação em andamento (criando-a se necessário). Salvamento automático. */
export function setAnswer(s: StoreV2, moduleId: string, questionId: string, value: string | number): StoreV2 {
  const cur = ensureCurrent(s).current!;
  return { ...s, current: { ...cur, modules: { ...cur.modules, [moduleId]: { ...cur.modules[moduleId], [questionId]: value } } } };
}

/**
 * "Refazer minha Bússola":
 * - revise=true → nova avaliação preenchida com as respostas da última concluída (sem sobrescrevê-la).
 * - revise=false → nova avaliação em branco.
 */
export function startNewEvaluation(s: StoreV2, revise: boolean): StoreV2 {
  const last = s.completed.at(-1);
  const seed = revise && last ? structuredClone(last.modules) : {};
  return { ...s, current: newEvaluation(seed) };
}

/** Conclui a avaliação em andamento: calcula resultados, senioridade e plano, e arquiva no histórico. */
export function completeCurrent(s: StoreV2): StoreV2 {
  if (!s.current) return s;
  const m = s.current.modules;
  const results = diagnose({ welcomed: s.welcomed, onboarding: {}, modules: m });
  const seniority = diagnoseSeniority(m);
  const plan = generatePlan(m, seniority);
  const done: Evaluation = { ...s.current, completedAt: new Date().toISOString(), results, seniority, plan };
  return { ...s, current: null, completed: [...s.completed, done] };
}

export function evaluationProgress(e: Evaluation): { done: number; total: number } {
  const done = modules.filter((m) => moduleStatus(m, e.modules[m.id]) === "concluido").length;
  return { done, total: modules.length };
}

export function exportData(s: StoreV2): string {
  return JSON.stringify(s, null, 2);
}

export type ImportResult = { ok: true; store: StoreV2 } | { ok: false; error: string };

export function importData(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "O arquivo não é um JSON válido." };
  }
  if (!isStoreV2(parsed)) {
    return { ok: false, error: "O arquivo não corresponde à estrutura esperada (versão 2) da Bússola de Produto." };
  }
  return { ok: true, store: parsed };
}

export function clearData() {
  localStorage.removeItem(KEY_V2);
}

export function useStore() {
  const [store, setStore] = useState<StoreV2>(emptyStore);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const s = loadStore();
    saveStore(s); // persiste migração, se houve
    setStore(s);
    setReady(true);
  }, []);
  const update = useCallback((fn: (s: StoreV2) => StoreV2) => {
    setStore((prev) => {
      const next = fn(prev);
      saveStore(next);
      return next;
    });
  }, []);
  return { store, ready, update };
}
