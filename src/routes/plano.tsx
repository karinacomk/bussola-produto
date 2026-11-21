import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useStore, type Evaluation, type StoreV2 } from "@/lib/store";
import { levelLabel } from "@/lib/seniority";

export const Route = createFileRoute("/plano")({
  head: () => ({
    meta: [
      { title: "Meu Plano de Voo — Bússola de Produto" },
      { name: "description", content: "Plano de ação personalizado para sua transição ou evolução em Produto." },
      { property: "og:title", content: "Meu Plano de Voo — Bússola de Produto" },
      { property: "og:description", content: "Ações concretas e mensuráveis para o seu próximo nível em Produto." },
    ],
  }),
  component: Plano,
});

function toggleAction(s: StoreV2, evaluationId: string, actionId: string): StoreV2 {
  const toggle = (e: Evaluation): Evaluation =>
    e.id === evaluationId ? { ...e, planProgress: { ...e.planProgress, [actionId]: !e.planProgress[actionId] } } : e;
  return {
    ...s,
    current: s.current ? toggle(s.current) : null,
    completed: s.completed.map(toggle),
  };
}

function Plano() {
  const { store, update } = useStore();
  const evaluation = store.current ?? store.completed.at(-1) ?? null;
  const plan = evaluation?.plan ?? null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar à bússola
      </Link>
      <p className="eyebrow mt-8">Plano de Voo</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">Meu Plano de Voo</h1>

      {!plan && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <p className="text-muted-foreground">
            Seu plano personalizado é gerado quando você conclui uma avaliação. Ele considera sua carreira desejada, seu nível de
            prontidão, suas lacunas, suas horas disponíveis e sua estratégia de transição.
          </p>
          <Link to="/diagnostico" className="btn-primary mt-4 inline-block">
            Ir para o diagnóstico
          </Link>
        </div>
      )}

      {plan && evaluation && (
        <>
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <p className="text-sm text-muted-foreground">Objetivo do plano</p>
            <p className="mt-1 font-display text-2xl">Alcançar o nível {plan.targetLabel}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Disponibilidade: {plan.horas} por semana · Estratégia: {plan.estrategia}
              {evaluation.seniority?.bestLevel ? ` · Prontidão atual com mais evidências: ${levelLabel(evaluation.seniority.bestLevel)}` : ""}
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {plan.actions.map((a) => {
              const done = !!evaluation.planProgress[a.id];
              return (
                <label
                  key={a.id}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft"
                  data-done={done}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[var(--primary)]"
                    checked={done}
                    onChange={() => update((s) => toggleAction(s, evaluation.id, a.id))}
                  />
                  <span>
                    <span className={`font-medium ${done ? "line-through opacity-60" : ""}`}>{a.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{a.detail}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            O progresso das atividades é salvo automaticamente neste navegador e permanece associado a esta avaliação.
          </p>
        </>
      )}
    </main>
  );
}
