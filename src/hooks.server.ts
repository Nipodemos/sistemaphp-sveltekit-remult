import { sequence } from "@sveltejs/kit/hooks";
import { api as handleRemult } from "./server/api";
import { verifySessionToken } from "./server/auth";
import type { Handle } from "@sveltejs/kit";

export const handleAuth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("session_token");
  event.locals.usuario = null;

  if (token) {
    const user = verifySessionToken(token);
    if (user) {
      event.locals.usuario = user;
    }
  }

  return resolve(event);
};

export const handle = sequence(handleRemult, handleAuth);
