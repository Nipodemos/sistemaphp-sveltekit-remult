import { remult } from "remult";
import type { LayoutLoad } from "./$types";

export const load = (async (event) => {
  // Criar um fetch customizado que sempre inclui credenciais
  const customFetch = (input: RequestInfo | URL, init?: RequestInit) => {
    return event.fetch(input, {
      ...init,
      credentials: "include", // Força envio de cookies
    });
  };

  remult.useFetch(customFetch);
  return { usuario: event.data.usuario };
}) satisfies LayoutLoad;
