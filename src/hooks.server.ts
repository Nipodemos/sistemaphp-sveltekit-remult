import { sequence } from "@sveltejs/kit/hooks";
import { api as handleRemult } from "./server/api";
import { verifySessionToken } from "./server/auth";
import type { Handle } from "@sveltejs/kit";

export const handleAuth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("session_token");
  console.log("🔍 Token no cookie:", token ? "presente" : "ausente");

  event.locals.usuario = null;

  if (token) {
    const user = verifySessionToken(token);
    console.log("🔍 Usuário verificado:", user ? user.nome : "inválido");
    if (user) {
      event.locals.usuario = user;
    }
  } else {
    console.log("🔍 Nenhum token encontrado");
  }

  return resolve(event);
};

export const handle = sequence(handleAuth, handleRemult);
