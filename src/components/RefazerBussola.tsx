import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { startNewEvaluation, type StoreV2 } from "@/lib/store";

/**
 * "Refazer minha Bússola": oferece começar uma avaliação em branco ou revisar
 * as respostas da última avaliação concluída (salva como nova, sem sobrescrever).
 */
export function RefazerBussola({ update, hasCompleted }: { update: (fn: (s: StoreV2) => StoreV2) => void; hasCompleted: boolean }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!open) {
    return (
      <button type="button" className="btn-outline" onClick={() => setOpen(true)}>
        Refazer minha Bússola
      </button>
    );
  }

  return (
    <div className="animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="font-medium">Como você quer refazer?</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="rounded-xl border border-border p-4 text-left transition-colors hover:border-primary"
          onClick={() => {
            update((s) => startNewEvaluation(s, false));
            void navigate({ to: "/modulo/$id", params: { id: "ponto-de-partida" } });
          }}
        >
          <span className="font-display text-lg">Começar nova avaliação</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Todas as perguntas em branco. Suas avaliações anteriores continuam salvas no histórico.
          </span>
        </button>
        <button
          type="button"
          disabled={!hasCompleted}
          className="rounded-xl border border-border p-4 text-left transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            update((s) => startNewEvaluation(s, true));
            void navigate({ to: "/resumo" });
          }}
        >
          <span className="font-display text-lg">Revisar minhas respostas</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {hasCompleted
              ? "Recupera as respostas da última avaliação concluída para você alterar o que quiser. O resultado é recalculado e salvo como uma nova avaliação."
              : "Disponível depois de concluir uma avaliação."}
          </span>
        </button>
      </div>
      <button type="button" className="mt-3 text-sm text-muted-foreground hover:text-primary" onClick={() => setOpen(false)}>
        Cancelar
      </button>
    </div>
  );
}
