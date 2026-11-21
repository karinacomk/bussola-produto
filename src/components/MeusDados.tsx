import { useRef } from "react";
import { clearData, emptyStore, exportData, importData, type StoreV2 } from "@/lib/store";

/**
 * Gestão dos dados locais: exportar, importar e apagar.
 * Tudo fica exclusivamente no localStorage deste navegador.
 */
export function MeusDados({ store, update }: { store: StoreV2; update: (fn: (s: StoreV2) => StoreV2) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const onExport = () => {
    const blob = new Blob([exportData(store)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bussola-de-produto-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (file: File) => {
    const text = await file.text();
    const result = importData(text);
    if (!result.ok) {
      window.alert(`Não foi possível importar: ${result.error}`);
      return;
    }
    const n = result.store.completed.length;
    const msg =
      `O arquivo contém ${n} avaliação(ões) concluída(s)${result.store.current ? " e uma em andamento" : ""}.\n\n` +
      `Importar substitui TODOS os dados atuais deste navegador. Deseja continuar?`;
    if (window.confirm(msg)) update(() => result.store);
  };

  const onClear = () => {
    const ok = window.confirm(
      "Apagar todos os dados da Bússola deste navegador?\n\nEsta ação não pode ser desfeita sem um backup. Se quiser, exporte seus dados antes.",
    );
    if (ok) {
      clearData();
      update(() => emptyStore());
    }
  };

  return (
    <section className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-display text-xl">Meus dados</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Suas respostas, resultados e planos ficam salvos apenas neste navegador, e podem ser perdidos se o armazenamento local for
        apagado. O isolamento é por navegador e por perfil de navegador: quem usa o mesmo perfil acessa os mesmos dados. Exporte um
        backup para guardar ou transferir sua Bússola.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-outline text-sm" onClick={onExport}>
          Exportar meus dados
        </button>
        <button type="button" className="btn-outline text-sm" onClick={() => fileRef.current?.click()}>
          Importar meus dados
        </button>
        <button type="button" className="btn-outline text-sm" onClick={onClear}>
          Apagar meus dados deste navegador
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onImportFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}
