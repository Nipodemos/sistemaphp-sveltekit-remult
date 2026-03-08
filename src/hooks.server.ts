import { sequence } from "@sveltejs/kit/hooks";
import { api as handleRemult } from "./server/remult";
import { verifySessionToken } from "./server/auth";
import { getSession } from "./server/session";
import type { Handle } from "@sveltejs/kit";

export const handleAuth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("session_token");
  // console.log("🔍 Token no cookie:", token ? "presente" : "ausente");

  event.locals.usuario = null;
  event.locals.permissoesCompletas = null;

  if (token) {
    const payload = verifySessionToken(token);
    
    if (payload?.sessionId) {
      const sessionData = getSession(payload.sessionId);
      
      if (sessionData) {
        // console.log("🔍 Sessão encontrada para:", sessionData.usuario?.nome);
        // Atribui a referência da sessão ao locals (permite mutabilidade)
        event.locals = sessionData; 
      } else {
        // console.log("🔍 Sessão expirada ou inválida");
        event.cookies.delete("session_token", { path: "/" });
      }
    } else {
      // console.log("🔍 Token inválido");
      event.cookies.delete("session_token", { path: "/" });
    }
  } else {
    // console.log("🔍 Nenhum token encontrado");
  }

  return resolve(event);
};

export const handle = sequence(handleAuth, handleRemult);
