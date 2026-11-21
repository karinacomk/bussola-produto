import { createFileRoute, redirect } from "@tanstack/react-router";

// Onboarding moved into the "Ponto de Partida" module; keep the old URL working.
export const Route = createFileRoute("/onboarding")({
  beforeLoad: () => {
    throw redirect({ to: "/modulo/$id", params: { id: "ponto-de-partida" } });
  },
});
