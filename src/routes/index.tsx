import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { modules, moduleStatus, progress, statusLabel, type Module, type Status } from "@/lib/compass";
import { ensureCurrent, evaluationProgress, useStore, type Evaluation } from "@/lib/store";
import { levelLabel } from "@/lib/seniority";
import { ModuleIcon } from "@/components/ModuleIcon";
import { RefazerBussola } from "@/components/RefazerBussola";
import { MeusDados } from "@/components/MeusDados";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bússola de Produto — Sua transição para Product Management" },
      { name: "description", content: "Explore seis direções para descobrir seu caminho profissional na área de Produto." },
      { property: "og:title", content: "Bússola de Produto" },
      { property: "og:description", content: "Orientação de carreira para quem quer migrar para Product Management." },
    ],
  }),
  component: Index,
});

function firstIncompleteModule(e: Evaluation): string {
  const m = modules.find((x) => moduleStatus(x, e.modules[x.id]) !== "concluido");
  return m?.id ?? "ponto-de-partida";
}

function Index() {
  const { store, ready, update } = useStore();
  const currentAnswers = store.current?.modules ?? {};
  const done = modules.filter((m) => moduleStatus(m, currentAnswers[m.id]) === "concluido").length;
  const last = store.completed.at(-1) ?? null;
  const hasCurrent = store.current !== null;
  const hasCompleted = store.completed.length > 0;
  const firstAccess = ready && !hasCurrent && !hasCompleted && !store.welcomed;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <span className="font-display text-xl">Bússola de Produto</span>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          {hasCompleted && (
            <Link to="/evolucao" className="hover:text-primary">
              Minha Evolução
            </Link>
          )}
          <Link to="/diagnostico" className="hover:text-primary">
            Diagnóstico
          </Link>
        </nav>
      </header>

      {firstAccess && (
        <div className="welcome mx-auto mt-6 flex max-w-xl flex-col gap-3 animate-fade-up sm:flex-row sm:items-center">
          <p className="text-sm">
            Bem-vindo à sua Bússola de Produto. Explore seis direções para descobrir seu caminho profissional na área de Produto.
            Suas respostas ficam salvas apenas neste navegador.
          </p>
          <Link
            to="/modulo/$id"
            params={{ id: "ponto-de-partida" }}
            className="btn-primary shrink-0 text-sm"
            onClick={() => update((s) => ensureCurrent({ ...s, welcomed: true }))}
          >
            Começar minha Bússola
          </Link>
          <button
            aria-label="Fechar"
            className="text-muted-foreground"
            onClick={() => update((s) => ({ ...s, welcomed: true }))}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="mt-6 text-center">
        <p className="eyebrow">Sua jornada para Produto</p>
        <h1 className="mt-2 font-display text-3xl md:text-5xl">Encontre seu norte</h1>
      </section>

      <Compass answers={currentAnswers} done={done} />

      {ready && hasCurrent && store.current && (
        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">
            Avaliação em andamento — {evaluationProgress(store.current).done} de {modules.length} direções concluídas.
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(done / modules.length) * 100}%` }} />
          </div>
          <Link to="/modulo/$id" params={{ id: firstIncompleteModule(store.current) }} className="btn-primary">
            Continuar minha Bússola
          </Link>
        </div>
      )}

      {ready && !hasCurrent && hasCompleted && last && (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-border bg-card p-6 text-center shadow-soft animate-fade-up">
          <p className="eyebrow">Seu último resultado</p>
          <p className="mt-2 font-display text-2xl">
            {last.results?.[0] ? `Maior aderência: ${last.results[0].role}` : "Avaliação concluída"}
          </p>
          {last.seniority?.bestLevel && (
            <p className="mt-1 text-sm text-muted-foreground">
              Prontidão com mais evidências: {levelLabel(last.seniority.bestLevel)}
            </p>
          )}
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/resumo" className="btn-primary">
              Ver meu resultado
            </Link>
            <Link to="/evolucao" className="btn-outline">
              Minha Evolução
            </Link>
            <Link to="/plano" className="btn-outline">
              Continuar meu Plano de Voo
            </Link>
          </div>
          <div className="mt-4">
            <RefazerBussola update={update} hasCompleted={hasCompleted} />
          </div>
        </div>
      )}

      {ready && !hasCurrent && !hasCompleted && !firstAccess && (
        <div className="mt-8 flex justify-center">
          <Link
            to="/modulo/$id"
            params={{ id: "ponto-de-partida" }}
            className="btn-primary"
            onClick={() => update((s) => ensureCurrent(s))}
          >
            Começar minha Bússola
          </Link>
        </div>
      )}

      {ready && (
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/resumo" className="btn-outline">
            Ver minha bússola completa
          </Link>
          <Link to="/diagnostico" className="btn-outline">
            Descubra seu Perfil em Produto
          </Link>
        </div>
      )}

      {ready && <MeusDados store={store} update={update} />}
    </main>
  );
}

function Compass({ answers, done }: { answers: Record<string, Record<string, string | number>>; done: number }) {
  const angles = modules.map((m) => (m.clock % 12) * 30 - 90);
  return (
    <div className="compass relative mx-auto mt-6 aspect-square">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {[44, 31, 18].map((r) => (
          <circle key={r} cx="50" cy="50" r={r} className="compass-line" />
        ))}
        {angles.map((a) => {
          const rad = (a * Math.PI) / 180;
          return <line key={a} x1="50" y1="50" x2={50 + 44 * Math.cos(rad)} y2={50 + 44 * Math.sin(rad)} className="compass-line" />;
        })}
      </svg>

      <div className="compass-center absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full">
        <svg viewBox="0 0 40 40" className="compass-rose h-1/2 w-1/2" aria-hidden>
          <polygon points="20,2 23,20 20,38 17,20" className="rose-main" />
          <polygon points="2,20 20,17 38,20 20,23" className="rose-sub" />
          <polygon points="20,2 23,20 17,20" className="rose-accent" />
          <circle cx="20" cy="20" r="2" className="rose-accent" />
        </svg>
        <span className="font-display text-sm md:text-lg">{done}/6</span>
      </div>

      {modules.map((m, i) => {
        const rad = (angles[i]! * Math.PI) / 180;
        return (
          <div
            key={m.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${50 + 36 * Math.cos(rad)}%`, top: `${50 + 36 * Math.sin(rad)}%` }}
          >
            <CompassCard m={m} status={moduleStatus(m, answers[m.id])} p={progress(m.questions, answers[m.id])} />
          </div>
        );
      })}
    </div>
  );
}

function CompassCard({ m, status, p }: { m: Module; status: Status; p: { done: number; total: number } }) {
  return (
    <Link to="/modulo/$id" params={{ id: m.id }} className="compass-card" data-status={status}>
      <span className="compass-card-icon">
        <ModuleIcon name={m.icon} className="h-4 w-4 md:h-5 md:w-5" />
      </span>
      <span className="font-display text-xs leading-tight md:text-lg">{m.title}</span>
      <span className="status-pill hidden md:inline-block" data-status={status}>
        {statusLabel[status]}
      </span>
      <span className="status-dot md:hidden" data-status={status} aria-label={statusLabel[status]} />
      <span className="hidden text-[11px] text-muted-foreground md:block">
        {p.done}/{p.total} respostas
      </span>
    </Link>
  );
}
