import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useStore, type Evaluation } from "@/lib/store";
import { competencyLabel, levelLabel, levels } from "@/lib/seniority";

export const Route = createFileRoute("/evolucao")({
  head: () => ({
    meta: [
      { title: "Minha Evolução — Bússola de Produto" },
      { name: "description", content: "Histórico das suas avaliações, comparação entre resultados e gráficos de evolução." },
      { property: "og:title", content: "Minha Evolução — Bússola de Produto" },
      { property: "og:description", content: "Acompanhe sua evolução profissional ao longo das avaliações da Bússola de Produto." },
    ],
  }),
  component: Evolucao,
});

const coreCompetencies = ["discovery", "estrategia", "metricas", "priorizacao", "tecnologia", "comunicacao"];
const seriesColors = ["var(--primary)", "var(--accent, #c46a4a)", "#7a8b6f", "#b08d3e", "#6f7d8b", "#a06565"];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function LineChart({ title, series, max }: { title: string; series: { label: string; values: (number | null)[]; color: string }[]; max: number }) {
  const W = 320;
  const H = 140;
  const pad = 16;
  const n = Math.max(...series.map((s) => s.values.length), 2);
  const x = (i: number) => pad + (i * (W - 2 * pad)) / (n - 1);
  const y = (v: number) => H - pad - (v / max) * (H - 2 * pad);
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="font-medium">{title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label={title}>
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={pad} x2={W - pad} y1={y(t * max)} y2={y(t * max)} className="compass-line" />
        ))}
        {series.map((s) => {
          const pts = s.values.map((v, i) => (v === null ? null : `${x(i)},${y(v)}`)).filter(Boolean) as string[];
          if (pts.length === 0) return null;
          return (
            <g key={s.label}>
              {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke={s.color} strokeWidth="2" />}
              {s.values.map((v, i) => (v === null ? null : <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={s.color} />))}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Evolucao() {
  const { store } = useStore();
  const done = [...store.completed].sort((a, b) => a.completedAt!.localeCompare(b.completedAt!));
  const [cmpA, setCmpA] = useState<string>("");
  const [cmpB, setCmpB] = useState<string>("");
  const a = done.find((e) => e.id === cmpA) ?? null;
  const b = done.find((e) => e.id === cmpB) ?? null;

  const first = done[0];
  const last = done.at(-1);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar à bússola
      </Link>
      <p className="eyebrow mt-8">Histórico</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">Minha Evolução</h1>

      {done.length === 0 && (
        <p className="mt-6 text-muted-foreground">
          Quando você concluir uma avaliação, ela aparecerá aqui com resultados, diagnóstico de senioridade e plano de ação.{" "}
          <Link to="/diagnostico" className="text-primary underline-offset-4 hover:underline">
            Ir para o diagnóstico
          </Link>
        </p>
      )}

      {done.length > 0 && (
        <>
          <section className="mt-8 grid gap-4">
            {[...done].reverse().map((e) => (
              <article key={e.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display text-lg">Avaliação de {fmtDate(e.completedAt!)}</span>
                  {e.results?.[0] && <span className="status-pill" data-status="concluido">Maior aderência: {e.results[0].role}</span>}
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                  {e.results?.map((r) => (
                    <span key={r.role}>
                      {r.role}: {r.total} (afinidade {r.afinidade}, prontidão {r.prontidao}, viabilidade {r.viabilidade})
                    </span>
                  ))}
                </div>
                {e.seniority && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Prontidão com mais evidências:{" "}
                    <strong>{e.seniority.bestLevel ? levelLabel(e.seniority.bestLevel) : "evidências insuficientes"}</strong>
                    {e.plan ? ` · Plano: alcançar ${e.plan.targetLabel}` : ""}
                  </p>
                )}
              </article>
            ))}
          </section>

          {done.length >= 2 && first && last && (
            <>
              <section className="mt-10">
                <h2 className="font-display text-2xl">Gráficos de evolução</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <LineChart
                    title="Competências (escala 1–5)"
                    max={5}
                    series={coreCompetencies.map((c, i) => ({
                      label: competencyLabel(c).split(" ")[0]!,
                      color: seriesColors[i]!,
                      values: done.map((e) => {
                        const v = Number(e.modules["competencias"]?.[c] ?? 0);
                        return v >= 1 ? v : null;
                      }),
                    }))}
                  />
                  <LineChart
                    title="Prontidão PM / PO / TPM"
                    max={100}
                    series={["PM", "PO", "TPM"].map((role, i) => ({
                      label: role,
                      color: seriesColors[i]!,
                      values: done.map((e) => e.results?.find((r) => r.role === role)?.prontidao ?? null),
                    }))}
                  />
                  <LineChart
                    title="Afinidade PM / PO / TPM"
                    max={100}
                    series={["PM", "PO", "TPM"].map((role, i) => ({
                      label: role,
                      color: seriesColors[i]!,
                      values: done.map((e) => e.results?.find((r) => r.role === role)?.afinidade ?? null),
                    }))}
                  />
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                    <p className="font-medium">O que mudou entre a primeira e a última avaliação</p>
                    <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                      {coreCompetencies.map((c) => {
                        const v0 = Number(first.modules["competencias"]?.[c] ?? 0);
                        const v1 = Number(last.modules["competencias"]?.[c] ?? 0);
                        if (!v0 || !v1) return null;
                        const d = v1 - v0;
                        const txt = d >= 1 ? "melhorou" : d <= -1 ? "diminuiu" : "se manteve estável";
                        return (
                          <li key={c}>
                            {competencyLabel(c)}: {txt} ({v0} → {v1})
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Diferenças pequenas (1 ponto na escala ou poucos pontos percentuais) podem refletir variações naturais de
                      autoavaliação, e não necessariamente uma mudança profissional significativa.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-10">
                <h2 className="font-display text-2xl">Comparar duas avaliações</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {[
                    { value: cmpA, set: setCmpA, label: "Avaliação A" },
                    { value: cmpB, set: setCmpB, label: "Avaliação B" },
                  ].map(({ value, set, label }) => (
                    <label key={label} className="text-sm">
                      <span className="mr-2 text-muted-foreground">{label}:</span>
                      <select className="field inline-block w-auto" value={value} onChange={(e) => set(e.target.value)}>
                        <option value="">Escolher…</option>
                        {done.map((e) => (
                          <option key={e.id} value={e.id}>
                            {fmtDate(e.completedAt!)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                {a && b && a.id !== b.id && (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[a, b].map((e) => (
                      <div key={e.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                        <p className="font-display text-lg">{fmtDate(e.completedAt!)}</p>
                        <div className="mt-3 grid gap-2 text-sm">
                          {e.results?.map((r) => (
                            <div key={r.role} className="flex justify-between">
                              <span className="text-muted-foreground">{r.role}</span>
                              <span>
                                {r.total} <span className="text-xs text-muted-foreground">(af. {r.afinidade} · pr. {r.prontidao} · vi. {r.viabilidade})</span>
                              </span>
                            </div>
                          ))}
                        </div>
                        {e.seniority && (
                          <div className="mt-4 grid gap-2 text-sm">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Prontidão por nível</p>
                            {levels.map((l) => {
                              const ls = e.seniority!.levels.find((x) => x.level === l.id);
                              return (
                                <div key={l.id} className="flex justify-between">
                                  <span className="text-muted-foreground">{l.short}</span>
                                  <span>{ls?.score ?? "—"}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="mt-4 grid gap-1 text-sm">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Competências</p>
                          {coreCompetencies.map((c) => (
                            <div key={c} className="flex justify-between">
                              <span className="text-muted-foreground">{competencyLabel(c)}</span>
                              <span>{String(e.modules["competencias"]?.[c] ?? "—")}</span>
                            </div>
                          ))}
                        </div>
                        {e.plan && (
                          <p className="mt-3 text-sm text-muted-foreground">
                            Plano: alcançar {e.plan.targetLabel} · {Object.values(e.planProgress).filter(Boolean).length}/{e.plan.actions.length} atividades concluídas
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {a && b && a.id === b.id && <p className="mt-4 text-sm text-muted-foreground">Escolha duas avaliações diferentes para comparar.</p>}
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
