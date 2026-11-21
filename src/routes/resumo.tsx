import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { isFilled, modules, moduleStatus, statusLabel } from "@/lib/compass";
import { useStore } from "@/lib/store";
import { levelLabel } from "@/lib/seniority";
import { ModuleIcon } from "@/components/ModuleIcon";
import { RefazerBussola } from "@/components/RefazerBussola";

export const Route = createFileRoute("/resumo")({
  head: () => ({
    meta: [
      { title: "Minha bússola completa — Bússola de Produto" },
      { name: "description", content: "Todas as suas reflexões e respostas reunidas em um só lugar." },
      { property: "og:title", content: "Minha bússola completa — Bússola de Produto" },
      { property: "og:description", content: "Resumo das seis direções da sua Bússola de Produto." },
    ],
  }),
  component: Resumo,
});

function Resumo() {
  const { store, update } = useStore();
  const evaluation = store.current ?? store.completed.at(-1) ?? null;
  const viewingCompleted = !store.current && store.completed.length > 0;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar à bússola
      </Link>
      <h1 className="mt-8 font-display text-4xl md:text-5xl">Minha bússola completa</h1>

      {!evaluation && (
        <p className="mt-6 text-muted-foreground">
          Você ainda não começou sua Bússola neste navegador.{" "}
          <Link to="/modulo/$id" params={{ id: "ponto-de-partida" }} className="text-primary underline-offset-4 hover:underline">
            Começar agora
          </Link>
        </p>
      )}

      {evaluation && (
        <>
          <p className="mt-3 text-sm text-muted-foreground">
            {viewingCompleted
              ? `Avaliação concluída em ${new Date(evaluation.completedAt ?? evaluation.startedAt).toLocaleDateString("pt-BR")}.`
              : "Avaliação em andamento — suas respostas são salvas automaticamente neste navegador."}
          </p>

          {evaluation.results && (
            <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-2xl">Resultado PM, PO e TPM</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {evaluation.results.map((r, i) => (
                  <div key={r.role} className="rounded-xl border border-border p-4" data-top={i === 0}>
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-xl">{r.role}</span>
                      <span className="font-display text-2xl text-primary">{r.total}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Afinidade {r.afinidade} · Prontidão {r.prontidao} · Viabilidade {r.viabilidade}
                    </p>
                  </div>
                ))}
              </div>
              {evaluation.seniority?.bestLevel && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Nível com maior evidência de prontidão: <strong>{levelLabel(evaluation.seniority.bestLevel)}</strong>
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/diagnostico" className="text-sm text-primary underline-offset-4 hover:underline">
                  Ver diagnóstico detalhado
                </Link>
                <Link to="/plano" className="text-sm text-primary underline-offset-4 hover:underline">
                  Ver meu Plano de Voo
                </Link>
              </div>
            </section>
          )}

          <div className="mt-10 grid gap-6">
            {modules.map((m) => {
              const a = evaluation.modules[m.id] ?? {};
              const st = moduleStatus(m, a);
              const filled = m.questions.filter((q) => isFilled(a[q.id]));
              return (
                <section key={m.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="compass-card-icon">
                        <ModuleIcon name={m.icon} className="h-5 w-5" />
                      </span>
                      <h2 className="font-display text-2xl">{m.title}</h2>
                    </div>
                    <span className="status-pill" data-status={st}>
                      {statusLabel[st]}
                    </span>
                  </div>
                  {filled.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">Ainda sem respostas.</p>
                  ) : (
                    <dl className="mt-4 grid gap-3">
                      {filled.map((q) => (
                        <div key={q.id}>
                          <dt className="text-sm text-muted-foreground">{q.label}</dt>
                          <dd className="mt-0.5">{String(a[q.id])}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {!viewingCompleted && (
                    <Link to="/modulo/$id" params={{ id: m.id }} className="mt-4 inline-block text-sm text-primary hover:underline">
                      Abrir módulo
                    </Link>
                  )}
                </section>
              );
            })}
          </div>

          <div className="mt-10">
            <RefazerBussola update={update} hasCompleted={store.completed.length > 0} />
          </div>
        </>
      )}
    </main>
  );
}
