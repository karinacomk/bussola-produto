import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { levels } from "@/lib/seniority";

export const Route = createFileRoute("/metodologia")({
  head: () => ({
    meta: [
      { title: "Como meu resultado foi calculado? — Bússola de Produto" },
      { name: "description", content: "A metodologia por trás dos diagnósticos de afinidade PM/PO/TPM e de prontidão por nível de senioridade." },
      { property: "og:title", content: "Como meu resultado foi calculado? — Bússola de Produto" },
      { property: "og:description", content: "Critérios, pesos e limitações dos diagnósticos da Bússola de Produto, em linguagem acessível." },
    ],
  }),
  component: Metodologia,
});

function Metodologia() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/diagnostico" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar ao diagnóstico
      </Link>
      <p className="eyebrow mt-8">Transparência</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">Como meu resultado foi calculado?</h1>
      <p className="mt-3 text-muted-foreground">
        A Bússola de Produto tem dois diagnósticos independentes: a afinidade com os caminhos PM, PO e TPM, e a prontidão para
        diferentes níveis de senioridade. Esta página explica os dois, em linguagem acessível.
      </p>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-2xl">1. Afinidade PM, PO e TPM</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Para cada caminho, combinamos três dimensões: <strong>afinidade</strong> (sua preferência declarada de papel e o tipo de
          impacto que você quer gerar), <strong>prontidão</strong> (sua autoavaliação nas competências, com pesos diferentes por
          papel — por exemplo, priorização pesa mais para PO e tecnologia para TPM) e <strong>viabilidade</strong> (tempo de
          experiência, contato prévio com Produto, horas disponíveis, rede de apoio e confiança). O total é uma média ponderada:
          prontidão 40%, afinidade 35%, viabilidade 25%.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-2xl">2. Prontidão por nível de senioridade</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Avaliamos cinco níveis. PO e TPM são funções ou especializações, não níveis obrigatórios de senioridade, e os títulos
          variam entre empresas.
        </p>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
          {levels.map((l) => (
            <li key={l.id}>
              <strong>{l.short}:</strong> {l.desc}
            </li>
          ))}
        </ul>

        <h3 className="mt-5 font-medium">Matriz de competências</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada nível pondera um conjunto de competências entre as 14 avaliadas (discovery, estratégia, métricas, priorização,
          tecnologia, comunicação, autonomia, complexidade, ambiguidade, validação de hipóteses, responsabilidade por resultados,
          influência entre equipes, liderança de pessoas e gestão de múltiplos produtos). Níveis iniciais pesam competências de
          execução e aprendizagem; níveis avançados pesam estratégia, influência, gestão de ambiguidade e liderança.
        </p>

        <h3 className="mt-5 font-medium">Evidências comportamentais</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Autoavaliação sozinha não basta. Perguntas sobre decisões influenciadas, escopo de responsabilidade, liderança de
          pessoas, validação de hipóteses e responsabilidade por resultados funcionam como <strong>critérios limitantes</strong>:
          sem evidência declarada compatível, o nível é limitado (por exemplo, GPM exige liderança de pessoas e escopo de múltiplos
          produtos ou equipes; Senior PM exige decisões relevantes e responsabilidade por resultados).
        </p>

        <h3 className="mt-5 font-medium">Regras importantes</h3>
        <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
          <li>Nunca classificamos alguém como iniciante apenas por não ter tido o título formal de PM — competências transferíveis de Engenharia, Design, Dados, Operações, Marketing e Negócios contam normalmente.</li>
          <li>Tempo de carreira vale no máximo 5 pontos de bônus e nunca determina o nível sozinho.</li>
          <li>Respostas ausentes reduzem a cobertura do diagnóstico; abaixo de um mínimo, mostramos "Evidências insuficientes" e indicamos o que falta responder.</li>
          <li>Não inferimos experiências que você não declarou.</li>
        </ul>

        <h3 className="mt-5 font-medium">Limitações conhecidas</h3>
        <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
          <li>É uma heurística orientativa baseada em autorrelato — não é uma certificação nem uma avaliação cientificamente validada.</li>
          <li>Não representa probabilidade de contratação; cada empresa usa critérios próprios.</li>
          <li>Autoavaliações podem ser otimistas ou pessimistas; as evidências comportamentais reduzem, mas não eliminam, esse efeito.</li>
          <li>Diferenças pequenas de pontuação entre avaliações não devem ser lidas como mudanças profissionais significativas.</li>
        </ul>
      </section>

      <p className="mt-6 text-sm text-muted-foreground">
        Dúvidas ou discordâncias sobre os critérios? Eles são revisáveis — a metodologia é documentada para ser questionada e
        melhorada.
      </p>
    </main>
  );
}
