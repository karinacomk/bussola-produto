import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { competencyQuestions, diagnose, progress } from "@/lib/compass";
import { completeCurrent, setAnswer, useStore } from "@/lib/store";
import { competencyLabel, diagnoseSeniority, evidenceQuestions, levelLabel, levels } from "@/lib/seniority";
import { QuestionField } from "@/components/QuestionField";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Descubra seu Perfil em Produto — Bússola de Produto" },
      { name: "description", content: "Compare sua afinidade, prontidão e viabilidade de transição para PM, PO e TPM, e seu nível de prontidão em Produto." },
      { property: "og:title", content: "Descubra seu Perfil em Produto" },
      { property: "og:description", content: "Diagnóstico de afinidade para PM, PO e TPM e de prontidão por nível de senioridade." },
    ],
  }),
  component: Diagnostico,
});

function Diagnostico() {
  const { store, update } = useStore();
  const navigate = useNavigate();
  const mods = store.current?.modules ?? {};
  const a = mods["competencias"] ?? {};
  const ev = mods["evidencias"] ?? {};
  const p = progress(competencyQuestions, a);
  const scores = diagnose({ welcomed: store.welcomed, onboarding: {}, modules: mods });
  const seniority = diagnoseSeniority(mods);
  const hasAnyAnswer = Object.values(mods).some((m) => Object.keys(m).length > 0);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar à bússola
      </Link>
      <p className="eyebrow mt-8">Diagnóstico de carreira</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">Descubra seu Perfil em Produto</h1>
      <p className="mt-3 text-muted-foreground">
        Avalie suas competências e registre evidências da sua trajetória. O resultado combina estas respostas com o que você
        registrou na bússola.
      </p>

      <h2 className="mt-10 font-display text-2xl">Suas competências</h2>
      <div className="mt-4 grid gap-4">
        {competencyQuestions.map((q) => (
          <div
            key={q.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft md:flex-row md:items-center md:justify-between"
          >
            <p className="font-medium">{q.label}</p>
            <QuestionField q={q} value={a[q.id]} onChange={(v) => update((s) => setAnswer(s, "competencias", q.id, v))} />
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl">Evidências da sua trajetória</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Estas perguntas ajudam a avaliar sua prontidão para diferentes níveis de atuação. Responda apenas o que de fato vivenciou.
      </p>
      <div className="mt-4 grid gap-4">
        {evidenceQuestions.map((q) => (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="mb-3 font-medium">{q.label}</p>
            <QuestionField q={q} value={ev[q.id]} onChange={(v) => update((s) => setAnswer(s, "evidencias", q.id, v))} />
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Seu resultado: PM, PO ou TPM</h2>
        {p.done < p.total && (
          <p className="mt-2 text-sm text-muted-foreground">
            Responda todas as competências e explore a bússola para um resultado mais preciso ({p.done}/{p.total}).
          </p>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {scores.map((r, i) => (
            <div key={r.role} className="rounded-2xl border border-border bg-card p-5 shadow-soft" data-top={i === 0}>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl">{r.role}</span>
                <span className="font-display text-3xl text-primary">{r.total}</span>
              </div>
              {i === 0 && (
                <span className="status-pill mt-2" data-status="concluido">
                  Maior aderência
                </span>
              )}
              {(["afinidade", "prontidao", "viabilidade"] as const).map((k) => (
                <div key={k} className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{{ afinidade: "Afinidade", prontidao: "Prontidão", viabilidade: "Viabilidade" }[k]}</span>
                    <span>{r[k]}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${r[k]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Meu Nível de Prontidão em Produto</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Uma avaliação orientativa da sua prontidão para cada nível de atuação, com base nas competências e evidências que você
          declarou. PO e TPM são funções ou especializações, não níveis obrigatórios de senioridade — e os títulos variam entre
          empresas.
        </p>

        {seniority.insuficiente && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="font-medium">Evidências insuficientes</p>
            <p className="mt-1 text-sm text-muted-foreground">Para um diagnóstico mais confiável, ainda faltam:</p>
            <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
              {seniority.faltam.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 grid gap-3">
          {levels.map((l) => {
            const ls = seniority.levels.find((x) => x.level === l.id)!;
            const isBest = seniority.bestLevel === l.id;
            const isCandidatura = seniority.candidaturas.includes(l.id);
            return (
              <div key={l.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft" data-top={isBest}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display text-lg">{l.short}</span>
                  <span className="font-display text-2xl text-primary">{ls.score}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${ls.score}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{l.desc}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {isBest && (
                    <span className="status-pill" data-status="concluido">
                      Maior evidência de prontidão
                    </span>
                  )}
                  {isCandidatura && !isBest && (
                    <span className="status-pill" data-status="em-andamento">
                      Pode ser considerado em candidaturas
                    </span>
                  )}
                  {ls.capApplied && (
                    <span className="status-pill" data-status="nao-iniciado">
                      Limitado por falta de evidências declaradas
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="font-medium">Competências mais fortes</p>
            {seniority.strengths.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Ainda sem competências avaliadas como fortes (4 ou 5).</p>
            ) : (
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                {seniority.strengths.map((c) => (
                  <li key={c}>{competencyLabel(c)}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="font-medium">Principais lacunas</p>
            {seniority.gaps.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma lacuna identificada entre as competências respondidas.</p>
            ) : (
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                {seniority.gaps.map((c) => (
                  <li key={c}>{competencyLabel(c)}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Este diagnóstico é orientativo: não é uma certificação de senioridade nem uma probabilidade de contratação. Cada empresa
          usa critérios próprios.{" "}
          <Link to="/metodologia" className="text-primary underline-offset-4 hover:underline">
            Como meu resultado foi calculado?
          </Link>
        </p>
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
        <p className="font-medium">Terminou de responder?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ao concluir, seus resultados e seu Plano de Voo são salvos no histórico da Minha Evolução, e você pode começar uma nova
          avaliação quando quiser.
        </p>
        <button
          type="button"
          className="btn-primary mt-4"
          disabled={!hasAnyAnswer}
          onClick={() => {
            update((s) => completeCurrent(s));
            void navigate({ to: "/resumo" });
          }}
        >
          Concluir avaliação e salvar resultado
        </button>
        {!hasAnyAnswer && (
          <p className="mt-2 text-xs text-muted-foreground">Responda pelo menos uma pergunta da bússola ou do diagnóstico antes.</p>
        )}
      </section>
    </main>
  );
}
