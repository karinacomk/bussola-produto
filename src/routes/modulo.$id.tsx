import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { modules, moduleStatus, progress, statusLabel } from "@/lib/compass";
import { setAnswer, useStore } from "@/lib/store";
import { QuestionField } from "@/components/QuestionField";
import { ModuleIcon } from "@/components/ModuleIcon";

export const Route = createFileRoute("/modulo/$id")({
  loader: ({ params }) => {
    const m = modules.find((x) => x.id === params.id);
    if (!m) throw notFound();
    return { title: m.title, goal: m.goal };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Módulo"} — Bússola de Produto` },
      { name: "description", content: loaderData?.goal ?? "Módulo da Bússola de Produto." },
      { property: "og:title", content: `${loaderData?.title ?? "Módulo"} — Bússola de Produto` },
      { property: "og:description", content: loaderData?.goal ?? "Módulo da Bússola de Produto." },
    ],
  }),
  component: ModulePage,
});

function ModulePage() {
  const { id } = Route.useParams();
  const m = modules.find((x) => x.id === id)!;
  const { store, update } = useStore();
  const answers = store.current?.modules[m.id] ?? {};
  const status = moduleStatus(m, answers);
  const p = progress(m.questions, answers);
  const idx = modules.indexOf(m);
  const nextM = modules[(idx + 1) % modules.length]!;
  const firstOpen = m.questions.find((q) => answers[q.id] === undefined || String(answers[q.id]).trim() === "");

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar à bússola
      </Link>
      <header className="mt-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="compass-card-icon">
            <ModuleIcon name={m.icon} className="h-5 w-5" />
          </span>
          <span className="status-pill" data-status={status}>
            {statusLabel[status]}
          </span>
        </div>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">{m.title}</h1>
        <p className="mt-3 text-muted-foreground">{m.goal}</p>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(p.done / p.total) * 100}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">
            {p.done}/{p.total}
          </span>
        </div>
        {firstOpen && p.done > 0 && (
          <a href={`#q-${firstOpen.id}`} className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline">
            Retomar de onde parei
          </a>
        )}
      </header>

      <div className="mt-10 grid gap-5">
        {m.questions.map((q) => (
          <div key={q.id} id={`q-${q.id}`} className="scroll-mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <p className="mb-4 font-medium">{q.label}</p>
            <QuestionField q={q} value={answers[q.id]} onChange={(v) => update((s) => setAnswer(s, m.id, q.id, v))} />
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Suas respostas são salvas automaticamente neste navegador.
      </p>
      <div className="mt-6 flex justify-between">
        <Link to="/" className="btn-outline">
          Voltar à bússola
        </Link>
        <Link to="/modulo/$id" params={{ id: nextM.id }} className="btn-primary">
          Próximo: {nextM.title}
        </Link>
      </div>
    </main>
  );
}
