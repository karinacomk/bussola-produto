import type { Question } from "@/lib/compass";

export function QuestionField({ q, value, onChange }: { q: Question; value: string | number | undefined; onChange: (v: string | number) => void }) {
  if (q.type === "text")
    return (
      <textarea
        className="field min-h-28"
        placeholder={q.placeholder ?? "Escreva com suas palavras…"}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  if (q.type === "choice")
    return (
      <div className="flex flex-wrap gap-2">
        {q.options.map((o) => (
          <button key={o} type="button" data-active={value === o} className="chip" onClick={() => onChange(value === o ? "" : o)}>
            {o}
          </button>
        ))}
      </div>
    );
  return (
    <div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" data-active={value === n} className="chip w-12 justify-center" onClick={() => onChange(value === n ? "" : n)}>
            {n}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{q.hint ?? "1 = iniciante, 5 = avançado"}</p>
    </div>
  );
}
